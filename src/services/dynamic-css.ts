import {
  getDefaultCustomProperties,
  PAPER_SIZES,
  ResumeStyles,
  SYSTEM_FONTS,
} from "@/lib/utils/styles";

/**
 * Service for managing and generating scoped CSS for resume previews and printing.
 * This class encapsulates all logic related to CSS generation, scoping,
 * and preparing HTML for printing.
 */
export class DynamicCssService {
  public readonly scopeClass: string;
  public readonly scopedCSS: string;
  public readonly customProperties: Record<string, string>;
  private readonly styleElementId: string;

  /**
   * Creates an instance of DynamicCssService.
   * @param styles - The resume style configuration.
   * @param customCss - Optional user-provided custom CSS string.
   * @param scopeId - Optional unique identifier for the scope.
   */
  constructor(
    private readonly styles: ResumeStyles,
    private readonly customCss: string = "",
    scopeId?: string,
  ) {
    const id =
      scopeId ||
      `resume-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    this.scopeClass = `resume-scope-${id}`;
    this.styleElementId = `dynamic-css-${id}`;
    this.customProperties = getDefaultCustomProperties(styles);
    this.scopedCSS = this.generateScopedCSS();
  }

  /**
   * Injects the scoped CSS into the document head.
   * Creates a <style> element with the generated CSS and appends it to the head.
   */
  public inject(): void {
    if (typeof window === "undefined") {
      return;
    }

    const existingElement = document.getElementById(this.styleElementId);
    if (existingElement) {
      if (existingElement.innerHTML !== this.scopedCSS) {
        existingElement.innerHTML = this.scopedCSS;
      }
      return;
    }

    const styleElement = document.createElement("style");
    styleElement.id = this.styleElementId;
    styleElement.innerHTML = this.scopedCSS;
    document.head.appendChild(styleElement);
  }

  /**
   * Removes the injected CSS from the document head.
   * Finds the <style> element by its ID and removes it.
   */
  public dispose(): void {
    if (typeof window === "undefined") {
      return;
    }
    const styleElement = document.getElementById(this.styleElementId);
    if (styleElement) {
      document.head.removeChild(styleElement);
    }
  }

  /**
   * Generates a scoped CSS selector.
   * @param selector - The CSS selector to scope.
   * @returns The scoped selector string.
   */
  public getScopedSelector(selector: string): string {
    return `.${this.scopeClass} ${selector}`;
  }

  /**
   * Wraps the given resume content in a full HTML document for printing,
   * including all necessary styles.
   * @param content - The HTML content of the resume.
   * @returns A string containing the full HTML document.
   */
  public getContentForPrint(content: string): string {
    const fontUrl = this.getFontUrl(this.styles.fontFamily);
    const paperSize = this.styles.paperSize || "A4";
    const paperDimensions = PAPER_SIZES[paperSize];

    const structuredContent = content.includes('data-part="page"')
      ? content
      : `<div data-part="page">${content}</div>`;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Resume</title>
  ${fontUrl ? `<link href="${fontUrl}" rel="stylesheet">` : ""}
  <style>
    @page {
      size: ${paperSize} portrait;
      margin: 0;
    }

    body {
      margin: 0;
      padding: 0;
      background-color: white;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    :root {
      ${Object.entries(this.customProperties)
        .map(([key, value]) => `${key}: ${value};`)
        .join("\n      ")}
    }

    ${this.scopedCSS}

    .${this.scopeClass} {
      box-shadow: none !important;
      margin: 0 !important;
    }

    .${this.scopeClass} [data-part="page"] {
      width: ${paperDimensions.w}mm !important;
      min-height: ${paperDimensions.h}mm !important;
      padding: ${this.styles.marginV}px ${this.styles.marginH}px !important;
      margin: 0 !important;
      page-break-after: always !important;
      box-sizing: border-box !important;
      background-color: white !important;
      display: block !important;
      position: relative !important;
      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
    }

    .${this.scopeClass} [data-part="page"]:last-child {
      page-break-after: avoid !important;
    }

    .page-break, .page-indicator, .print\\:hidden {
      display: none !important;
    }
  </style>
</head>
<body>
  <div class="${this.scopeClass}">
    ${structuredContent}
  </div>
</body>
</html>`;
  }

  /**
   * Generates the complete scoped CSS string.
   */
  private generateScopedCSS(): string {
    const scopeSelector = `.${this.scopeClass}`;

    const customPropsCSS = `
      :root {
        ${Object.entries(this.customProperties)
          .map(([key, value]) => `${key}: ${value};`)
          .join("\n        ")}
      }
    `;

    const basicStyles = `
      ${scopeSelector} {
        background-color: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        margin: 0 auto;
        box-sizing: border-box;
      }

      ${scopeSelector} [data-part="page"] {
        width: var(--resume-paper-width);
        min-height: var(--resume-paper-height);
        padding: var(--resume-margin-v) var(--resume-margin-h);
        background-color: white;
        box-sizing: border-box;
      }

      ${scopeSelector} * {
        font-family: var(--resume-font-family);
        font-size: var(--resume-font-size);
        line-height: var(--resume-line-height);
        box-sizing: inherit;
      }

      ${scopeSelector} .page-break {
        page-break-before: always;
        break-before: page;
        height: 0;
        margin: 0;
        padding: 0;
        visibility: hidden;
      }
    `;

    const printStyles = `
      @media print {
        ${scopeSelector} {
          box-shadow: none;
          margin: 0;
        }
      }
    `;

    const userCss = this.customCss
      ? this.scopeCustomCSS(this.customCss, scopeSelector)
      : "";

    return `${customPropsCSS}\n${basicStyles}\n${printStyles}\n${userCss}`;
  }

  /**
   * Scopes user-provided CSS to the component's scope.
   */
  private scopeCustomCSS(customCss: string, scopeSelector: string): string {
    if (!customCss) return "";
    const scopedCustomCSS = customCss.replace(
      /([^{}]+){/g,
      (match, selector) => {
        if (selector.trim().startsWith("@")) {
          return match;
        }
        const scopedSelectorList = selector
          .split(",")
          .map((s: string) => `${scopeSelector} ${s.trim()}`)
          .join(", ");
        return `${scopedSelectorList}{`;
      },
    );
    return `/* User's custom CSS */\n${scopedCustomCSS}`;
  }

  /**
   * Gets the Google Fonts URL for a given font family.
   */
  private getFontUrl(fontFamily?: string): string {
    return fontFamily && !SYSTEM_FONTS.includes(fontFamily)
      ? `https://fonts.googleapis.com/css2?family=${fontFamily.replace(
          / /g,
          "+",
        )}:wght@300;400;500;600;700&display=swap`
      : "";
  }
}
