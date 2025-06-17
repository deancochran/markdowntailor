import jsPDF from "jspdf";

import { marked } from "marked";
export interface PdfWorkerRequest {
  type: "convert-markdown" | "create-pdf";
  markdown?: string;
  css?: string;
  canvasDataUrl?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  requestId: string;
}

export interface PdfWorkerResponse {
  type: "progress" | "success" | "error" | "html-ready";
  requestId: string;
  stage?: string;
  progress?: number;
  pdfDataUrl?: string;
  pageCount?: number;
  htmlContent?: string;
  error?: string;
}
// Progress reporting helper
function postProgress(requestId: string, stage: string, progress: number) {
  self.postMessage({
    type: "progress",
    requestId,
    stage,
    progress,
  } as PdfWorkerResponse);
}

// Create HTML document structure optimized for high-quality text rendering
function createHtmlDocument(markdown: string, css: string): string {
  // Configure marked for optimal text rendering
  marked.setOptions({
    gfm: true,
    breaks: true,
    sanitize: false,
    smartypants: true,
  });

  const htmlContent = marked.parse(markdown);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      box-sizing: border-box;
      /* High-quality text rendering */
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: subpixel-antialiased;
      -moz-osx-font-smoothing: auto;
      font-smooth: always;
      font-variant-ligatures: common-ligatures;
      font-kerning: auto;
      font-feature-settings: "kern" 1, "liga" 1;
    }

    html, body {
      margin: 0;
      padding: 0;
      width: 210mm;
      background-color: #ffffff;
      /* Enhanced font stack with web fonts */
      font-family: 'Inter', system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #1a1a1a;
      /* Force high-quality rendering */
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: subpixel-antialiased;
      -moz-osx-font-smoothing: auto;
      font-optical-sizing: auto;
    }

    body {
      padding: 15mm;
      min-height: 297mm;
      overflow-x: hidden;
      /* Better text layout */
      hyphens: auto;
      word-wrap: break-word;
    }

    /* Enhanced heading styles with better spacing */
    h1, h2, h3, h4, h5, h6 {
      font-family: 'Inter', system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      font-weight: 600;
      line-height: 1.25;
      letter-spacing: -0.02em;
      color: #111111;
      page-break-after: avoid;
      margin-top: 0;
      margin-bottom: 0.75em;
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.025em;
    }
    h2 {
      font-size: 22px;
      font-weight: 600;
      letter-spacing: -0.02em;
    }
    h3 {
      font-size: 18px;
      font-weight: 600;
      letter-spacing: -0.015em;
    }
    h4 {
      font-size: 16px;
      font-weight: 500;
    }
    h5, h6 {
      font-size: 14px;
      font-weight: 500;
    }

    /* Enhanced paragraph styling */
    p {
      margin: 0 0 1.25em 0;
      page-break-inside: avoid;
      orphans: 2;
      widows: 2;
      line-height: 1.6;
      color: #2a2a2a;
    }

    /* Better list styling */
    ul, ol {
      margin: 0 0 1.25em 0;
      padding-left: 1.75em;
      page-break-inside: avoid;
      line-height: 1.5;
    }

    li {
      margin: 0 0 0.5em 0;
      color: #2a2a2a;
    }

    /* Enhanced text styling */
    strong {
      font-weight: 600;
      color: #111111;
    }

    em {
      font-style: italic;
      font-feature-settings: "slnt";
    }

    /* Better code styling */
    code {
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
      background-color: #f6f8fa;
      padding: 0.25em 0.5em;
      border-radius: 4px;
      font-size: 0.9em;
      font-weight: 500;
      color: #24292f;
      border: 1px solid #d0d7de;
    }

    pre {
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
      background-color: #f6f8fa;
      padding: 1.25em;
      border-radius: 6px;
      overflow-x: auto;
      margin: 1.5em 0;
      border: 1px solid #d0d7de;
      line-height: 1.45;
    }

    pre code {
      background-color: transparent;
      padding: 0;
      border: none;
      font-size: 0.9em;
    }

    /* Enhanced table styling */
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1.5em 0;
      font-size: 0.95em;
      line-height: 1.4;
    }

    th, td {
      border: 1px solid #d0d7de;
      padding: 0.75em 1em;
      text-align: left;
      vertical-align: top;
    }

    th {
      background-color: #f6f8fa;
      font-weight: 600;
      color: #24292f;
    }

    /* Better blockquote styling */
    blockquote {
      margin: 1.5em 0;
      padding: 1em 1.5em;
      border-left: 4px solid #0969da;
      background-color: #f6f8fa;
      font-style: italic;
      color: #656d76;
    }

    hr {
      border: none;
      border-top: 2px solid #d0d7de;
      margin: 2.5em 0;
    }

    /* Custom styles injection */
    ${css}
  </style>
</head>
<body>
  <div id="markdown-content">${htmlContent}</div>
</body>
</html>`;
}

// Handle markdown conversion
async function handleMarkdownConversion(
  request: PdfWorkerRequest,
): Promise<void> {
  const { markdown, css, requestId } = request;

  try {
    postProgress(requestId, "Converting markdown to HTML", 10);

    if (!markdown?.trim()) {
      console.warn("Empty markdown provided");
    }

    const htmlContent = createHtmlDocument(markdown || "", css || "");

    self.postMessage({
      type: "html-ready",
      requestId,
      htmlContent,
    } as PdfWorkerResponse);
  } catch (error) {
    console.error("Markdown conversion error:", error);
    self.postMessage({
      type: "error",
      requestId,
      error:
        error instanceof Error ? error.message : "Markdown conversion failed",
    } as PdfWorkerResponse);
  }
}

// Handle PDF creation from canvas data with optimized settings
async function handlePdfCreation(request: PdfWorkerRequest): Promise<void> {
  const { canvasDataUrl, canvasWidth, canvasHeight, requestId } = request;

  try {
    if (!canvasDataUrl || !canvasWidth || !canvasHeight) {
      throw new Error("Missing canvas data for PDF creation");
    }

    postProgress(requestId, "Creating high-quality PDF", 80);

    // Create PDF with optimized settings for text quality
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: false, // Disable compression for better quality
      precision: 3, // Higher precision for better text rendering
      putOnlyUsedFonts: true,
      floatPrecision: 3,
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvasHeight * imgWidth) / canvasWidth;
    const pagesNeeded = Math.ceil(imgHeight / pageHeight);

    postProgress(requestId, "Assembling high-resolution pages", 85);

    if (pagesNeeded === 1) {
      // Use JPEG with high quality for better text rendering
      pdf.addImage(
        canvasDataUrl,
        "PNG",
        0,
        0,
        imgWidth,
        imgHeight,
        undefined,
        "MEDIUM",
      );
    } else {
      // Multi-page PDF with optimized image handling
      for (let i = 0; i < pagesNeeded; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        const yOffset = -(i * pageHeight);
        pdf.addImage(
          canvasDataUrl,
          "PNG",
          0,
          yOffset,
          imgWidth,
          imgHeight,
          undefined,
          "MEDIUM", // Use medium compression for balance of quality and size
        );

        const pageProgress = 85 + ((i + 1) / pagesNeeded) * 10;
        postProgress(
          requestId,
          `Processing page ${i + 1}/${pagesNeeded}`,
          pageProgress,
        );
      }
    }

    postProgress(requestId, "Finalizing PDF", 96);

    // Generate PDF with optimized output settings
    const pdfDataUrl = pdf.output("dataurlstring", {
      compress: false, // Keep uncompressed for quality
    });

    postProgress(requestId, "Complete", 100);

    self.postMessage({
      type: "success",
      requestId,
      pdfDataUrl,
      pageCount: pagesNeeded,
    } as PdfWorkerResponse);
  } catch (error) {
    console.error("PDF creation error:", error);
    self.postMessage({
      type: "error",
      requestId,
      error: error instanceof Error ? error.message : "PDF creation failed",
    } as PdfWorkerResponse);
  }
}

// Worker message handler
self.onmessage = async (event: MessageEvent<PdfWorkerRequest>) => {
  const { type } = event.data;

  switch (type) {
    case "convert-markdown":
      await handleMarkdownConversion(event.data);
      break;
    case "create-pdf":
      await handlePdfCreation(event.data);
      break;
    default:
      console.error("Unknown request type:", type);
  }
};
