import { marked } from "marked";
import { Browser, chromium } from "playwright";

let browserInstance: Browser | null = null;

/**
 * Get or create a browser instance for PDF generation
 */
async function getBrowser(): Promise<Browser> {
  if (!browserInstance) {
    browserInstance = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    });
  }
  return browserInstance;
}

/**
 * Convert markdown to HTML with CSS styling
 */
function generateHTMLContent(markdown: string, css: string): string {
  const htmlContent = marked(markdown);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Resume</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        /* Base PDF optimizations */
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }

        body {
          margin: 0;
          padding: 20px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #333;
          background: white;
        }

        /* Page break controls */
        .page-break {
          page-break-before: always;
        }

        .no-break {
          page-break-inside: avoid;
        }

        /* Custom CSS from user */
        ${css}
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `;
}

/**
 * Server-side PDF generation using Playwright
 */
export async function generatePDFServerSide(
  markdown: string,
  css: string,
  options: {
    format?: "A4" | "Letter";
    margin?: { top: string; right: string; bottom: string; left: string };
  } = {},
): Promise<{ pdfBuffer: Buffer; pageCount: number }> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // Generate HTML content
    const htmlContent = generateHTMLContent(markdown, css);

    // Set page content
    await page.setContent(htmlContent, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Wait for fonts to load
    await page.evaluate(async () => {
      if (document.fonts) {
        await document.fonts.ready;
      }
    });

    // Additional wait for any dynamic content
    await page.waitForTimeout(1000);

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: options.format || "A4",
      margin: options.margin || {
        top: "0.5in",
        right: "0.5in",
        bottom: "0.5in",
        left: "0.5in",
      },
      printBackground: true,
      preferCSSPageSize: false,
    });

    // Calculate page count (approximate)
    const pageCount = Math.ceil(pdfBuffer.length / 50000);

    return { pdfBuffer, pageCount };
  } finally {
    await page.close();
  }
}

/**
 * Cleanup browser instance
 */
export async function cleanupBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

/**
 * Generate PDF and return as base64 data URL
 */
export async function generatePDFDataURL(
  markdown: string,
  css: string,
  options?: {
    format?: "A4" | "Letter";
    margin?: { top: string; right: string; bottom: string; left: string };
  },
): Promise<{ pdfDataUrl: string; pageCount: number }> {
  const { pdfBuffer, pageCount } = await generatePDFServerSide(
    markdown,
    css,
    options,
  );
  const base64 = pdfBuffer.toString("base64");
  const pdfDataUrl = `data:application/pdf;base64,${base64}`;

  return { pdfDataUrl, pageCount };
}
