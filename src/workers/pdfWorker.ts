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

// Create HTML document structure for PDF generation
function createHtmlDocument(markdown: string, css: string): string {
  const htmlContent = marked.parse(markdown);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      width: 210mm;
      background-color: #ffffff;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      font-size: 12px;
      line-height: 1.4;
      color: #000000;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    body {
      padding: 15mm;
      min-height: 297mm;
      overflow-x: hidden;
    }

    /* Default markdown styles */
    h1, h2, h3, h4, h5, h6 {
      font-weight: 600;
      line-height: 1.2;
      page-break-after: avoid;
    }

    h1 { font-size: 24px; }
    h2 { font-size: 20px; }
    h3 { font-size: 16px; }
    h4 { font-size: 14px; }
    h5, h6 { font-size: 12px; }

    p {
      margin: 0 0 1em 0;
      page-break-inside: avoid;
      orphans: 2;
      widows: 2;
    }

    ul, ol {
      margin: 0 0 1em 0;
      padding-left: 1.5em;
      page-break-inside: avoid;
    }

    li {
      margin: 0 0 0.25em 0;
    }

    strong {
      font-weight: 600;
    }

    em {
      font-style: italic;
    }

    blockquote {
      margin: 1em 0;
      padding: 0.5em 1em;
      border-left: 4px solid #ddd;
      background-color: #f9f9f9;
    }

    code {
      background-color: #f4f4f4;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }

    pre {
      background-color: #f4f4f4;
      padding: 1em;
      border-radius: 3px;
      overflow-x: auto;
      margin: 1em 0;
    }

    pre code {
      background-color: transparent;
      padding: 0;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }

    th, td {
      border: 1px solid #ddd;
      padding: 0.5em;
      text-align: left;
    }

    th {
      background-color: #f4f4f4;
      font-weight: 600;
    }

    hr {
      border: none;
      border-top: 1px solid #ddd;
      margin: 2em 0;
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

// Handle PDF creation from canvas data
async function handlePdfCreation(request: PdfWorkerRequest): Promise<void> {
  const { canvasDataUrl, canvasWidth, canvasHeight, requestId } = request;

  try {
    if (!canvasDataUrl || !canvasWidth || !canvasHeight) {
      throw new Error("Missing canvas data for PDF creation");
    }

    postProgress(requestId, "Creating PDF", 80);

    // Create PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
      precision: 2,
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvasHeight * imgWidth) / canvasWidth;
    const pagesNeeded = Math.ceil(imgHeight / pageHeight);

    postProgress(requestId, "Assembling PDF pages", 90);

    if (pagesNeeded === 1) {
      pdf.addImage(canvasDataUrl, "PNG", 0, 0, imgWidth, imgHeight);
    } else {
      // Multi-page PDF
      for (let i = 0; i < pagesNeeded; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        const yOffset = -(i * pageHeight);
        pdf.addImage(canvasDataUrl, "PNG", 0, yOffset, imgWidth, imgHeight);

        // Progress update for each page
        const pageProgress = 90 + ((i + 1) / pagesNeeded) * 8;
        postProgress(
          requestId,
          `Processing page ${i + 1}/${pagesNeeded}`,
          pageProgress,
        );
      }
    }

    postProgress(requestId, "Finalizing", 98);

    // Generate PDF data URL
    const pdfDataUrl = pdf.output("dataurlstring");

    postProgress(requestId, "Complete", 100);

    // Send success response
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
