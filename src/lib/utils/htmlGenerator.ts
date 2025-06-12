// lib/resume/htmlGenerator.ts
import React from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import ReactMarkdown from "react-markdown";
import { sanitizeCSS } from "./sanitization";

/**
 * Generates HTML content from markdown and CSS for preview, printing, or download
 */
export function generateHTMLContent(markdown: string, css: string): string {
  // Sanitize CSS before use
  const sanitizedCSS = sanitizeCSS(css);

  // Create a temporary container to properly render the markdown
  const tempContainer = document.createElement("div");
  const root = createRoot(tempContainer);

  flushSync(() => {
    // Render the markdown content to the temporary container
    // Remove rehypeRaw plugin to prevent raw HTML injection
    root.render(
      React.createElement(
        ReactMarkdown,
        {
          // Don't allow raw HTML - this is a key security improvement
          // rehypePlugins: [rehypeRaw] <- REMOVED
        },
        markdown,
      ),
    );
  });

  // Extract the HTML content from the container
  const markdownContent = tempContainer.innerHTML;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          /* Reset all styles to ensure no external influence */
          html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a,
          abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, samp, small,
          strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form,
          label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details,
          embed, figure, figcaption, footer, header, hgroup, menu, nav, output, ruby, section, summary,
          time, mark, audio, video {
            margin: 0;
            padding: 0;
            border: 0;
            font-size: 100%;
            font: inherit;
            vertical-align: baseline;
          }

          /* A4 paper size setup */
          @page {
            size: A4;
            margin: 0;
          }

          /* Now apply the custom CSS - sanitized */
          ${sanitizedCSS}
        </style>
      </head>
      <body>
        ${markdownContent}
      </body>
    </html>
  `;
}

/**
 * Utility to download content as an HTML file
 */
export function downloadHTMLFile(title: string, htmlContent: string): void {
  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = `${title.replace(/\s+/g, "-").toLowerCase()}.html`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  // Clean up the URL object after download
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
