import crypto from "crypto";
import { marked } from "marked";
import { Browser, chromium } from "playwright-core";

let browserInstance: Browser | null = null;

// Helper function to create cache key from version ID
export function generateCacheKey(markdown: string, css: string): string {
  const content = markdown + css;
  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * Get or create a browser instance for PDF generation
 */
async function getBrowser(): Promise<Browser> {
  if (!browserInstance) {
    browserInstance = await chromium.launch({
      headless: true,
      // args: [
      //   "--no-sandbox",
      //   "--disable-setuid-sandbox",
      //   "--disable-dev-shm-usage",
      //   "--disable-accelerated-2d-canvas",
      //   "--no-first-run",
      //   "--no-zygote",
      //   "--disable-gpu",
      //   "--disable-web-security",
      //   "--disable-features=VizDisplayCompositor",
      // ],
    });
  }
  return browserInstance;
}

/**
 * Convert markdown to HTML with CSS styling
 */
function generateHTMLContent(markdown: string, css: string): string {
  const htmlContent = marked.parse(markdown, {
    gfm: true,
    breaks: true,
  }) as string;

  return generatePdfHTML(htmlContent, css);
}

/**
 * Server-side PDF generation using Playwright
 */
export async function generatePDFServerSide(
  markdown: string,
  css: string,
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
      format: "A4",
      preferCSSPageSize: true,
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
): Promise<{ pdfDataUrl: string; pageCount: number }> {
  const { pdfBuffer, pageCount } = await generatePDFServerSide(markdown, css);
  const base64 = pdfBuffer.toString("base64");
  const pdfDataUrl = `data:application/pdf;base64,${base64}`;

  return { pdfDataUrl, pageCount };
}
