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
 * Detect device pixel ratio for optimal scaling
 */
function getOptimalScale(): number {
  const devicePixelRatio = window.devicePixelRatio || 1;
  // Use higher scale for high-DPI displays, but cap it for performance
  return Math.min(Math.max(devicePixelRatio * 1.5, 2.5), 4);
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
    await sleep(50);

    // Create iframe with optimized size for text rendering
    const scale = getOptimalScale();
    const baseWidth = 794;
    const baseHeight = 1123;
    const scaledWidth = Math.round(baseWidth * scale);
    const scaledHeight = Math.round(baseHeight * scale);

    const iframe = document.createElement("iframe");
    iframe.style.cssText = `
      position: absolute;
      left: -20000px;
      top: -20000px;
      width: ${scaledWidth}px;
      height: ${scaledHeight}px;
      border: none;
      visibility: hidden;
      transform: scale(1);
      transform-origin: 0 0;
    `;

    document.body.appendChild(iframe);
    iframe.src = htmlUrl;

    // Wait for iframe to load with longer timeout for complex content
    await new Promise((resolve) => {
      iframe.onload = resolve;
      setTimeout(resolve, 2000); // Increased timeout for better loading
    });

    promise.onProgress?.("Optimizing content rendering", 45);
    await sleep(100); // Allow more time for font loading and rendering

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error("Cannot access iframe document");
    }

    // Force font loading and text rendering
    const bodyElement = iframeDoc.body;
    if (!bodyElement) {
      throw new Error("No body element found");
    }

    // Add text rendering optimizations to the document
    const style = iframeDoc.createElement("style");
    style.textContent = `
      * {
        text-rendering: optimizeLegibility !important;
        -webkit-font-smoothing: subpixel-antialiased !important;
        -moz-osx-font-smoothing: auto !important;
        font-smooth: always !important;
        -webkit-text-stroke: 0.01em transparent !important;
      }
    `;
    iframeDoc.head.appendChild(style);

    // Wait for font loading and layout stabilization
    await new Promise((resolve) => {
      if (iframeDoc.fonts && iframeDoc.fonts.ready) {
        iframeDoc.fonts.ready.then(resolve);
      }
      setTimeout(resolve, 300); // Fallback timeout
    });

    promise.onProgress?.("Capturing high-resolution content", 60);
    await sleep(10);

    // Enhanced html2canvas settings for maximum text quality
    const canvas = await html2canvas(bodyElement, {
      scale: scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      removeContainer: false,
      logging: false,
      width: scaledWidth,
      height: Math.max(bodyElement.scrollHeight * scale, scaledHeight),
      // Text rendering optimizations
      letterRendering: true,
      foreignObjectRendering: true,
      imageTimeout: 15000,
      // Force better text rendering
      onclone: (clonedDoc) => {
        const clonedStyle = clonedDoc.createElement("style");
        clonedStyle.textContent = `
          * {
            text-rendering: optimizeLegibility !important;
            -webkit-font-smoothing: subpixel-antialiased !important;
            -moz-osx-font-smoothing: auto !important;
            font-variant-ligatures: none !important;
            font-kerning: auto !important;
          }

          /* Ensure fonts are loaded properly */
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        `;
        clonedDoc.head.appendChild(clonedStyle);

        // Force layout recalculation
        clonedDoc.body.offsetHeight;
        return clonedDoc;
      },
    });

    // Cleanup DOM elements
    document.body.removeChild(iframe);
    URL.revokeObjectURL(htmlUrl);

    promise.onProgress?.("Converting to high-quality PDF", 75);

    // Use higher quality canvas export
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
