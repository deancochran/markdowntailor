// lib/utils/pdfGenerator.ts
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { generateHTMLContent } from "./htmlGenerator";

/**
 * Generates PDF from markdown and CSS with complete style isolation
 * Uses iframe to prevent any global style leakage
 * Returns both the PDF data URL and page count
 */
export async function generatePDFContent(
  title: string,
  markdown: string,
  css: string,
): Promise<{ pdfDataUrl: string; pageCount: number }> {
  // Generate the complete HTML content
  const htmlContent = generateHTMLContent(markdown, css);

  // Create an invisible iframe for complete isolation
  const iframe = document.createElement("iframe");
  iframe.style.position = "absolute";
  iframe.style.left = "-9999px";
  iframe.style.top = "-9999px";
  iframe.style.width = "210mm";
  iframe.style.height = "297mm";
  iframe.style.border = "none";
  iframe.style.visibility = "hidden";

  // Create a promise to handle iframe loading
  const iframeLoaded = new Promise<void>((resolve) => {
    iframe.onload = () => resolve();
  });

  document.body.appendChild(iframe);

  try {
    // Write the HTML content to the iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error("Cannot access iframe document");
    }

    // Write the complete HTML content
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    // Wait for the iframe to load completely
    await iframeLoaded;

    // Additional wait for styles and fonts to load
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Get the body element from the iframe
    const bodyElement = iframeDoc.body;
    if (!bodyElement) {
      throw new Error("No body element found in iframe");
    }

    // Apply PDF-specific styling to the body
    bodyElement.style.width = "210mm";
    // Remove minHeight to let content determine natural height
    // bodyElement.style.minHeight = "297mm"; // <- This was forcing full page height
    bodyElement.style.backgroundColor = "white";
    bodyElement.style.margin = "0";
    bodyElement.style.padding = "15mm"; // Reduced from 1.5cm to 15mm
    bodyElement.style.boxSizing = "border-box";
    bodyElement.style.fontFamily = "Inter, sans-serif";
    bodyElement.style.fontSize = "12px";
    bodyElement.style.lineHeight = "1.4";

    // Get the actual content height after applying styles
    const actualHeight = bodyElement.scrollHeight;
    const actualWidth = bodyElement.scrollWidth;

    // Use html2canvas on the iframe's body with dynamic dimensions
    const canvas = await html2canvas(bodyElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: actualWidth, // Use actual content width
      height: actualHeight, // Use actual content height
      logging: false,
      foreignObjectRendering: true,
      windowWidth: actualWidth,
      windowHeight: actualHeight,
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Calculate actual number of pages needed
    const pagesNeeded = Math.ceil(imgHeight / pageHeight);
    let pageCount = 0;

    if (imgHeight <= pageHeight) {
      // Content fits on one page
      pdf.addImage(
        canvas.toDataURL("image/png", 0.95),
        "PNG",
        0,
        0,
        imgWidth,
        imgHeight,
        undefined,
        "FAST",
      );
      pageCount = 1;
    } else {
      // Content needs multiple pages
      const imgData = canvas.toDataURL("image/png", 0.95);
      let position = 0;

      for (let i = 0; i < pagesNeeded; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(
          imgData,
          "PNG",
          0,
          -position,
          imgWidth,
          imgHeight,
          undefined,
          "FAST",
        );

        position += pageHeight;
        pageCount++;
      }
    }

    const pdfDataUrl = pdf.output("dataurlstring", {
      filename: `${title}.pdf`,
    });
    return { pdfDataUrl, pageCount };
  } finally {
    // Clean up the iframe
    if (iframe.parentNode) {
      document.body.removeChild(iframe);
    }
  }
}
