import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React from "react";
import { createRoot } from "react-dom/client";
import ReactMarkdown from "react-markdown";

// Progress callback type
type ProgressCallback = (stage: string, progress: number) => void;

// Cached iframe for performance
let cachedIframe: HTMLIFrameElement | null = null;

/**
 * Yields control back to the main thread
 */
function yieldControl(): Promise<void> {
  return new Promise((resolve) => {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => resolve(), { timeout: 16 });
    } else {
      setTimeout(resolve, 0);
    }
  });
}

/**
 * Sleep for a specific amount of time (non-blocking)
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Creates or reuses an iframe for PDF generation
 */
function getOrCreateIframe(): HTMLIFrameElement {
  if (!cachedIframe || !document.body.contains(cachedIframe)) {
    cachedIframe = document.createElement("iframe");
    cachedIframe.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      width: 794px;
      height: 1123px;
      border: none;
      visibility: hidden;
      pointer-events: none;
    `;
    document.body.appendChild(cachedIframe);
  }
  return cachedIframe;
}

/**
 * Non-blocking PDF generation with frequent yielding
 */
export async function generatePDFContentNonBlocking(
  markdown: string,
  css: string,
  onProgress?: ProgressCallback,
  signal?: AbortSignal,
): Promise<{ pdfDataUrl: string; pageCount: number }> {
  console.log("🚀 Starting non-blocking PDF generation");

  const reportProgress = (stage: string, progress: number) => {
    console.log(`📊 ${stage}: ${progress}%`);
    onProgress?.(stage, progress);
  };

  // Check for cancellation
  if (signal?.aborted) throw new Error("Generation cancelled");

  reportProgress("Initializing", 0);
  await yieldControl(); // Yield immediately

  if (!markdown.trim()) {
    console.warn("⚠️ Empty markdown provided");
  }

  if (signal?.aborted) throw new Error("Generation cancelled");

  const iframe = getOrCreateIframe();
  reportProgress("Setting up document", 10);
  await yieldControl();

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    throw new Error("Cannot access iframe document");
  }

  // Set up iframe HTML with minimal blocking
  const htmlContent = `<head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          width: 210mm;
          min-height: 297mm;
          background-color: #ffffff;
          margin: 0;
          padding: 15mm;
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #000000;
          text-rendering: optimizeLegibility;
          overflow-x: hidden;
          overflow-y: visible;
        }
        h1, h2, h3, h4, h5, h6 { margin: 0 0 10px 0; font-weight: bold; }
        h1 { font-size: 24px; } h2 { font-size: 20px; } h3 { font-size: 16px; }
        p { margin: 0 0 10px 0; } ul, ol { margin: 0 0 10px 20px; }
        li { margin: 0 0 5px 0; } strong { font-weight: bold; } em { font-style: italic; }
        ${css}
      </style>
    </head>
    <body><div id="content-root"></div></body>`;

  iframeDoc.documentElement.innerHTML = htmlContent;

  if (signal?.aborted) throw new Error("Generation cancelled");

  reportProgress("Document structure ready", 20);
  await yieldControl();

  const contentRoot = iframeDoc.getElementById("content-root");
  if (!contentRoot) {
    throw new Error("Content root element not found");
  }

  reportProgress("Rendering markdown", 30);
  await yieldControl();

  // Create React root and render with yielding
  const root = createRoot(contentRoot);

  return new Promise(async (resolve, reject) => {
    try {
      // Render React content
      root.render(React.createElement(ReactMarkdown, {}, markdown));

      if (signal?.aborted) {
        root.unmount();
        throw new Error("Generation cancelled");
      }

      // Wait for React to render with multiple yield points
      reportProgress("Processing React render", 40);
      await sleep(50); // Give React time to render
      await yieldControl();

      if (signal?.aborted) {
        root.unmount();
        throw new Error("Generation cancelled");
      }

      // Wait for layout to settle
      await sleep(100);
      await yieldControl();

      reportProgress("Preparing content", 50);

      const bodyElement = iframeDoc.body;
      if (!bodyElement) {
        root.unmount();
        throw new Error("No body element found");
      }

      // Get dimensions with yielding
      let contentHeight = Math.max(
        bodyElement.scrollHeight,
        bodyElement.offsetHeight,
        bodyElement.clientHeight,
      );

      if (contentHeight === 0) {
        console.warn("⚠️ Content height is 0 - using fallback");
        contentHeight = 800;
      }

      if (signal?.aborted) {
        root.unmount();
        throw new Error("Generation cancelled");
      }

      reportProgress("Creating canvas", 60);
      await yieldControl();

      // Generate canvas with reduced scale to prevent freezing
      const canvas = await html2canvas(bodyElement, {
        scale: 1.5, // Reduced from 2 to prevent blocking
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        foreignObjectRendering: true,
        removeContainer: true,
        imageTimeout: 10000, // Reduced timeout
        // Add callback to yield during rendering
        onclone: async () => {
          reportProgress("Processing canvas", 70);
          await yieldControl();
        },
      });

      if (signal?.aborted) {
        root.unmount();
        throw new Error("Generation cancelled");
      }

      reportProgress("Canvas generated", 80);
      await yieldControl();

      // Create PDF with yielding
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pagesNeeded = Math.ceil(imgHeight / pageHeight);

      reportProgress("Building PDF", 90);
      await yieldControl();

      // Convert to image data with compression
      let imgData: string;

      // Use JPEG by default to reduce processing time
      if (canvas.width * canvas.height > 2000000) {
        // Large canvas
        imgData = canvas.toDataURL("image/jpeg", 0.85); // More compression
      } else {
        imgData = canvas.toDataURL("image/jpeg", 0.95); // Less compression
      }

      if (signal?.aborted) {
        root.unmount();
        throw new Error("Generation cancelled");
      }

      await yieldControl();

      // Add pages to PDF with yielding between pages
      if (pagesNeeded === 1) {
        pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      } else {
        for (let i = 0; i < pagesNeeded; i++) {
          if (signal?.aborted) {
            root.unmount();
            throw new Error("Generation cancelled");
          }

          if (i > 0) {
            pdf.addPage();
            await yieldControl(); // Yield between pages
          }

          const yOffset = -(i * pageHeight);
          pdf.addImage(imgData, "JPEG", 0, yOffset, imgWidth, imgHeight);

          // Update progress for each page
          const pageProgress = 90 + ((i + 1) / pagesNeeded) * 8;
          reportProgress(`Adding page ${i + 1}/${pagesNeeded}`, pageProgress);

          if (i < pagesNeeded - 1) await yieldControl(); // Don't yield after last page
        }
      }

      // Clean up React root
      root.unmount();

      reportProgress("Finalizing PDF", 98);
      await yieldControl();

      // Generate final PDF data
      const pdfDataUrl = pdf.output("dataurlstring");

      reportProgress("Complete", 100);

      resolve({
        pdfDataUrl,
        pageCount: pagesNeeded,
      });
    } catch (error) {
      try {
        root.unmount();
      } catch (unmountError) {
        console.warn("⚠️ Could not unmount React root:", unmountError);
      }
      reject(error);
    }
  });
}

/**
 * Cleanup function to remove cached iframe
 */
export function cleanupPDFGenerator(): void {
  if (cachedIframe && document.body.contains(cachedIframe)) {
    document.body.removeChild(cachedIframe);
    cachedIframe = null;
  }
}

// Backward compatibility
export async function generatePDFContent(
  markdown: string,
  css: string,
): Promise<{ pdfDataUrl: string; pageCount: number }> {
  return generatePDFContentNonBlocking(markdown, css);
}
