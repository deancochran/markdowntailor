// lib/utils/pdfGenerator.ts
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React from "react";
import { createRoot } from "react-dom/client";
import ReactMarkdown from "react-markdown";

// Reusable iframe for better performance
let cachedIframe: HTMLIFrameElement | null = null;

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
 * Ultra-fast PDF generation with direct markdown rendering
 */
export async function generatePDFContent(
  markdown: string,
  css: string,
): Promise<{ pdfDataUrl: string; pageCount: number }> {
  console.log("🏁 Starting PDF generation process");
  console.log("📝 Input markdown length:", markdown.length);
  console.log("🎨 Input CSS length:", css.length);

  if (!markdown.trim()) {
    console.warn("⚠️ Empty markdown provided");
  }

  const iframe = getOrCreateIframe();
  console.log("📱 Iframe created/reused");

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

  if (!iframeDoc) {
    console.error("❌ Cannot access iframe document");
    throw new Error("Cannot access iframe document");
  }

  // Set up the iframe HTML structure with better base styles
  iframeDoc.documentElement.innerHTML = `<head>
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
          font-feature-settings: "liga" 1, "kern" 1;
          overflow-x: hidden;
          overflow-y: visible;
        }
        h1, h2, h3, h4, h5, h6 {
          margin: 0 0 10px 0;
          font-weight: bold;
        }
        h1 { font-size: 24px; }
        h2 { font-size: 20px; }
        h3 { font-size: 16px; }
        h4 { font-size: 14px; }
        p { margin: 0 0 10px 0; }
        ul, ol { margin: 0 0 10px 20px; }
        li { margin: 0 0 5px 0; }
        strong { font-weight: bold; }
        em { font-style: italic; }
        ${css}
      </style>
    </head>
    <body>
      <div id="content-root"></div>
    </body>`;

  console.log("📄 Iframe HTML structure set up");

  // Get the content root element
  const contentRoot = iframeDoc.getElementById("content-root");
  if (!contentRoot) {
    console.error("❌ Content root element not found in iframe");
    throw new Error("Content root element not found");
  }

  console.log("🎯 Content root element found");

  // Render markdown directly using ReactMarkdown
  const root = createRoot(contentRoot);

  return new Promise((resolve, reject) => {
    try {
      console.log("⚛️ Rendering markdown with ReactMarkdown");

      // Add debug logging to see what's being rendered
      console.log(
        "📝 Markdown content preview:",
        markdown.substring(0, 200) + "...",
      );

      // Render markdown content
      root.render(React.createElement(ReactMarkdown, {}, markdown));

      // Use multiple techniques to ensure React renders properly
      const waitForRender = () => {
        // Combine timeout with animation frames for better reliability
        const timeoutPromise = new Promise((resolve) =>
          setTimeout(resolve, 150),
        );
        const framePromise = new Promise((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
          });
        });

        Promise.all([timeoutPromise, framePromise]).then(async () => {
          try {
            console.log("🎬 Multiple frame delay completed");

            // Add debugging to see if content was actually rendered
            const contentRootElement = iframeDoc.getElementById("content-root");
            console.log(
              "🔍 Content root innerHTML length:",
              contentRootElement?.innerHTML?.length || 0,
            );
            console.log(
              "🔍 Content root innerHTML preview:",
              contentRootElement?.innerHTML?.substring(0, 200) || "EMPTY",
            );

            const bodyElement = iframeDoc.body;
            if (!bodyElement) {
              console.error("❌ No body element found in iframe");
              throw new Error("No body element found");
            }

            console.log("📦 Body element found, checking content");
            console.log(
              "🔍 Body innerHTML length:",
              bodyElement.innerHTML.length,
            );
            console.log(
              "🔍 Body innerHTML preview:",
              bodyElement.innerHTML.substring(0, 300),
            );

            // Get actual content dimensions
            let contentHeight = Math.max(
              bodyElement.scrollHeight,
              bodyElement.offsetHeight,
              bodyElement.clientHeight,
            );

            console.log("📏 Content dimensions:");
            console.log("  - scrollHeight:", bodyElement.scrollHeight);
            console.log("  - offsetHeight:", bodyElement.offsetHeight);
            console.log("  - clientHeight:", bodyElement.clientHeight);
            console.log("  - final contentHeight:", contentHeight);

            // If React rendering fails, fallback to direct HTML rendering
            if (contentHeight === 0 || !contentRootElement?.innerHTML) {
              console.log(
                "🔄 React rendering failed, trying direct HTML approach",
              );

              try {
                // Re-render with ReactMarkdown element
                root.render(React.createElement(ReactMarkdown, {}, markdown));

                // Wait a bit more for the fallback render
                await new Promise((resolve) => setTimeout(resolve, 200));

                // Recalculate dimensions after fallback render
                contentHeight = Math.max(
                  bodyElement.scrollHeight,
                  bodyElement.offsetHeight,
                  bodyElement.clientHeight,
                );

                console.log("🔄 Fallback content height:", contentHeight);
              } catch (fallbackError) {
                console.error(
                  "❌ Fallback rendering also failed:",
                  fallbackError,
                );
                // Set a reasonable default if all else fails
                contentHeight = 800;
              }
            }

            if (contentHeight === 0) {
              console.warn(
                "⚠️ Content height is still 0 - forcing minimum height",
              );
              contentHeight = 800; // Fallback minimum height

              // Try to make content visible
              const contentDiv = bodyElement.querySelector("#content-root");
              if (contentDiv) {
                contentDiv.style.minHeight = "800px";
                contentDiv.style.backgroundColor = "#f9f9f9"; // Light background for debugging
                contentDiv.style.border = "1px solid #ccc";
                contentDiv.innerHTML =
                  contentDiv.innerHTML ||
                  `<p>Markdown content: ${markdown.substring(0, 100)}...</p>`;
              }
            }

            // Generate canvas from iframe content with optimized settings
            console.log("🎨 Starting html2canvas rendering");
            const canvas = await html2canvas(bodyElement, {
              scale: 2, // Reduced scale to prevent artifacts
              useCORS: true,
              allowTaint: false,
              backgroundColor: "#ffffff",
              logging: true, // Enable for debugging
              foreignObjectRendering: true, // Better for React content
              removeContainer: true,
              imageTimeout: 15000,
            });

            console.log("🖼️ Canvas generated:");
            console.log("  - width:", canvas.width);
            console.log("  - height:", canvas.height);

            // Create PDF
            console.log("📋 Creating PDF document");
            const pdf = new jsPDF({
              orientation: "portrait",
              unit: "mm",
              format: "a4",
              compress: true, // Enable compression for better file size
            });

            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const pagesNeeded = Math.ceil(imgHeight / pageHeight);

            console.log("📐 PDF calculations:");
            console.log("  - imgWidth:", imgWidth, "mm");
            console.log("  - imgHeight:", imgHeight, "mm");
            console.log("  - pageHeight:", pageHeight, "mm");
            console.log("  - pagesNeeded:", pagesNeeded);

            // Use PNG for better text quality
            console.log("🖼️ Converting canvas to PNG");
            let imgData = canvas.toDataURL("image/png");

            // If PNG is too large, fallback to high-quality JPEG
            if (imgData.length > 5000000) {
              // If > 5MB
              console.log("📦 PNG too large, using high-quality JPEG");
              imgData = canvas.toDataURL("image/jpeg", 0.95);
            }

            if (pagesNeeded === 1) {
              console.log("📄 Adding single page to PDF");
              pdf.addImage(
                imgData,
                imgData.includes("data:image/png") ? "PNG" : "JPEG",
                0,
                0,
                imgWidth,
                imgHeight,
              );
            } else {
              console.log("📄 Adding", pagesNeeded, "pages to PDF");
              for (let i = 0; i < pagesNeeded; i++) {
                if (i > 0) pdf.addPage();
                const yOffset = -(i * pageHeight);
                pdf.addImage(
                  imgData,
                  imgData.includes("data:image/png") ? "PNG" : "JPEG",
                  0,
                  yOffset,
                  imgWidth,
                  imgHeight,
                );
              }
            }

            // Clean up React root
            console.log("🧹 Cleaning up React root");
            root.unmount();

            console.log("✅ PDF generation completed successfully");
            resolve({
              pdfDataUrl: pdf.output("dataurlstring"),
              pageCount: pagesNeeded,
            });
          } catch (error) {
            console.error("❌ Error in PDF generation callback:", error);
            // Clean up React root on error
            try {
              root.unmount();
            } catch (unmountError) {
              console.warn("⚠️ Could not unmount React root:", unmountError);
            }
            reject(error);
          }
        });
      };

      waitForRender();
    } catch (error) {
      console.error("❌ Error in PDF generation setup:", error);
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
