import type { PdfWorkerRequest, PdfWorkerResponse } from "@/workers/pdfWorker";
import html2canvas from "html2canvas";

// Progress callback type
type ProgressCallback = (stage: string, progress: number) => void;

// Worker instance management
let pdfWorker: Worker | null = null;
const workerPromises = new Map<
  string,
  {
    resolve: (value: { pdfDataUrl: string; pageCount: number }) => void;
    reject: (error: Error) => void;
    onProgress?: ProgressCallback;
    htmlContent?: string;
  }
>();

/**
 * Get or create PDF worker instance
 */
function getPdfWorker(): Worker {
  if (!pdfWorker) {
    pdfWorker = new Worker(new URL("@/workers/pdfWorker.ts", import.meta.url));

    pdfWorker.onmessage = (event: MessageEvent<PdfWorkerResponse>) => {
      const {
        type,
        requestId,
        stage,
        progress,
        pdfDataUrl,
        pageCount,
        htmlContent,
        error,
      } = event.data;
      const promise = workerPromises.get(requestId);

      if (!promise) return;

      switch (type) {
        case "progress":
          if (stage && progress !== undefined) {
            promise.onProgress?.(stage, progress);
          }
          break;

        case "html-ready":
          if (htmlContent) {
            promise.htmlContent = htmlContent;
            // Continue with DOM rendering
            renderToPdf(requestId);
          }
          break;

        case "success":
          if (pdfDataUrl && pageCount) {
            promise.resolve({ pdfDataUrl, pageCount });
            workerPromises.delete(requestId);
          }
          break;

        case "error":
          promise.reject(new Error(error || "PDF generation failed"));
          workerPromises.delete(requestId);
          break;
      }
    };

    pdfWorker.onerror = (error) => {
      console.error("PDF Worker error:", error);
      // Reject all pending promises
      workerPromises.forEach(({ reject }) => {
        reject(new Error(`Worker error: ${error.message}`));
      });
      workerPromises.clear();
    };
  }

  return pdfWorker;
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sleep function for yielding control
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Render HTML to PDF using DOM operations (main thread only)
 */
async function renderToPdf(requestId: string): Promise<void> {
  const promise = workerPromises.get(requestId);
  if (!promise || !promise.htmlContent) {
    promise?.reject(new Error("No HTML content available for rendering"));
    return;
  }

  try {
    promise.onProgress?.("Setting up rendering environment", 30);
    await sleep(10);

    // Create a blob URL for the HTML content
    const htmlBlob = new Blob([promise.htmlContent], { type: "text/html" });
    const htmlUrl = URL.createObjectURL(htmlBlob);

    promise.onProgress?.("Loading content", 40);
    await sleep(50); // Give time for content to load

    // Create an iframe to render the content
    const iframe = document.createElement("iframe");
    iframe.style.cssText = `
      position: absolute;
      left: -10000px;
      top: -10000px;
      width: 794px;
      height: 1123px;
      border: none;
      visibility: hidden;
    `;

    document.body.appendChild(iframe);
    iframe.src = htmlUrl;

    // Wait for iframe to load
    await new Promise((resolve) => {
      iframe.onload = resolve;
      setTimeout(resolve, 1000); // Fallback timeout
    });

    promise.onProgress?.("Rendering content", 50);
    await sleep(50);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error("Cannot access iframe document");
    }

    // Wait for content to be fully rendered
    await sleep(100);

    const bodyElement = iframeDoc.body;
    if (!bodyElement) {
      throw new Error("No body element found");
    }

    promise.onProgress?.("Capturing content", 70);
    await sleep(10);

    // Generate canvas with optimized settings
    const canvas = await html2canvas(bodyElement, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      removeContainer: false,
      logging: false,
      width: 794,
      height: Math.max(bodyElement.scrollHeight, 1123),
    });

    // Cleanup DOM elements
    document.body.removeChild(iframe);
    URL.revokeObjectURL(htmlUrl);

    promise.onProgress?.("Converting to PDF", 75);

    // Convert canvas to data URL and send to worker for PDF creation
    const canvasDataUrl = canvas.toDataURL("image/png", 1.0);

    const worker = getPdfWorker();
    const pdfRequest: PdfWorkerRequest = {
      type: "create-pdf",
      canvasDataUrl,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      requestId,
    };

    worker.postMessage(pdfRequest);
  } catch (error) {
    console.error("DOM rendering error:", error);
    promise.reject(
      new Error(
        error instanceof Error ? error.message : "DOM rendering failed",
      ),
    );
    workerPromises.delete(requestId);
  }
}

/**
 * Non-blocking PDF generation with web worker
 */
export async function generatePDFContentNonBlocking(
  markdown: string,
  css: string,
  onProgress?: ProgressCallback,
  signal?: AbortSignal,
): Promise<{ pdfDataUrl: string; pageCount: number }> {
  const reportProgress = (stage: string, progress: number) => {
    onProgress?.(stage, progress);
  };

  // Check for cancellation
  if (signal?.aborted) {
    throw new Error("Generation cancelled");
  }

  reportProgress("Initializing web worker", 0);

  const worker = getPdfWorker();
  const requestId = generateRequestId();

  return new Promise((resolve, reject) => {
    // Store promise handlers
    workerPromises.set(requestId, {
      resolve,
      reject,
      onProgress: reportProgress,
    });

    // Handle cancellation
    if (signal) {
      signal.addEventListener("abort", () => {
        workerPromises.delete(requestId);
        reject(new Error("Generation cancelled"));
      });
    }

    // Send markdown conversion request to worker
    const request: PdfWorkerRequest = {
      type: "convert-markdown",
      markdown,
      css,
      requestId,
    };

    worker.postMessage(request);
  });
}

/**
 * Cleanup function to terminate worker and clean up resources
 */
export function cleanupPDFGenerator(): void {
  if (pdfWorker) {
    // Reject any pending promises
    workerPromises.forEach(({ reject }) => {
      reject(new Error("PDF generator cleanup"));
    });
    workerPromises.clear();

    pdfWorker.terminate();
    pdfWorker = null;
  }
}

// Backward compatibility - keep your existing function signature
export async function generatePDFContent(
  markdown: string,
  css: string,
): Promise<{ pdfDataUrl: string; pageCount: number }> {
  return generatePDFContentNonBlocking(markdown, css);
}

// Auto-cleanup on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", cleanupPDFGenerator);
}
