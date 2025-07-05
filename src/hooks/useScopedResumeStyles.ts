import {
  ResumeStyles,
  SYSTEM_FONTS,
  getDefaultCustomProperties,
} from "@/lib/utils/styles";
import { useCallback, useMemo, useRef } from "react";

interface ScopedStylesConfig {
  styles: ResumeStyles;
  customCss?: string;
}

interface ScopedStylesReturn {
  scopeClass: string;
  scopedCSS: string;
  customProperties: Record<string, string>;
  getScopedSelector: (selector: string) => string;
  getContentForPrint: (content: string) => string;
}

export const useScopedResumeStyles = ({
  styles,
  customCss = "",
}: ScopedStylesConfig): ScopedStylesReturn => {
  // Generate unique scope identifier that persists across renders
  const scopeId = useRef(
    `resume-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  );
  const scopeClass = `resume-scope-${scopeId.current}`;

  // Generate CSS custom properties from styles
  const customProperties = useMemo(() => {
    return getDefaultCustomProperties(styles);
  }, [styles]);

  // Generate scoped CSS with all techniques combined
  const scopedCSS = useMemo(() => {
    const scopeSelector = `.${scopeClass}`;

    // Apply custom properties to :root
    const customPropsCSS = `
      /* Custom properties for styling */
      :root {
        ${Object.entries(customProperties)
          .map(([key, value]) => `${key}: ${value};`)
          .join("\n        ")}
      }
    `;

    // Basic styles
    const basicStyles = `
      /* Basic styles for the resume */
      ${scopeSelector} {
        background-color: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        margin: 0 auto;
        box-sizing: border-box;
      }

      /* Page element styles */
      ${scopeSelector} [data-part="page"] {
        width: 210mm;
        min-height: 297mm;
        padding: ${styles.marginV}px ${styles.marginH}px;
        background-color: white;
        box-sizing: border-box;
      }

      /* Content styles */
      ${scopeSelector} * {
        font-family: "${styles.fontFamily.replace(/\+/g, " ")}", -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: ${styles.fontSize}px;
        line-height: ${styles.lineHeight};
      }

      /* Page break handling */
      ${scopeSelector} .page-break {
        page-break-before: always;
        break-before: page;
        height: 0;
        margin: 0;
        padding: 0;
        visibility: hidden;
      }

      /* Page break control */
      ${scopeSelector} page-break-before { break-before: page; }
      ${scopeSelector} page-break-after { break-after: avoid; }

      /* Print styles */
      @media print {
        ${scopeSelector} {
          box-shadow: none;
          margin: 0;
        }

        ${scopeSelector} [data-part="page"] {
          width: 210mm !important;
          page-break-after: always;
          border: none !important;
          box-shadow: none !important;
        }

        ${scopeSelector} [data-part="page"]:last-child {
          page-break-after: avoid !important;
        }

        ${scopeSelector} .page-break,
        ${scopeSelector} .page-indicator {
          display: none !important;
        }
      }
    `;

    // Scope user's custom CSS if provided
    const userCss = customCss ? scopeCustomCSS(customCss, scopeSelector) : "";

    return `${customPropsCSS}\n${basicStyles}\n${userCss}`;
  }, [
    scopeClass,
    customCss,
    customProperties,
    styles.fontFamily,
    styles.fontSize,
    styles.lineHeight,
    styles.marginH,
    styles.marginV,
  ]);

  // Helper function to generate scoped selectors
  const getScopedSelector = useCallback(
    (selector: string): string => {
      return `.${scopeClass} ${selector}`;
    },
    [scopeClass],
  );

  const getContentForPrint = useCallback(
    (content: string): string => {
      const fontUrl = getFontUrl(styles.fontFamily);

      // Helper function to wrap content in proper page structure if not already wrapped
      const ensurePageStructure = (content: string): string => {
        // Check if content already has data-part="page" elements
        if (content.includes('data-part="page"')) {
          return content;
        }

        // If not, wrap the content in a single page element
        return `<div data-part="page">${content}</div>`;
      };

      const structuredContent = ensurePageStructure(content);

      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Resume</title>
  ${fontUrl ? `<link href="${fontUrl}" rel="stylesheet">` : ""}
  <style>
    /* Print page setup with proper margins */
    @page {
      size: A4 portrait;
      margin: 0; /* We'll control margins with padding */
    }

    body {
      margin: 0;
      padding: 0;
      background-color: white;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* Apply custom properties to :root for printing */
    :root {
      ${Object.entries(customProperties)
        .map(([key, value]) => `${key}: ${value};`)
        .join("\n      ")}
    }

    /* Use the exact same scoped CSS as the preview */
    ${scopedCSS}

    /* Additional print-specific overrides */
    .${scopeClass} {
      box-shadow: none !important;
      margin: 0 !important;
    }

    .${scopeClass} [data-part="page"] {
      width: 210mm !important;
      min-height: 297mm !important;
      padding: ${styles.marginV}px ${styles.marginH}px !important;
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

    .${scopeClass} [data-part="page"]:last-child {
      page-break-after: avoid !important;
    }

    /* Hide elements that should not appear in print */
    .page-break, .page-indicator, .print\\:hidden {
      display: none !important;
    }
  </style>
</head>
<body>
  <div class="${scopeClass}">
    ${structuredContent}
  </div>
</body>
</html>`;
    },
    [styles, scopedCSS, scopeClass, customProperties],
  );

  return {
    scopeClass,
    scopedCSS,
    customProperties,
    getScopedSelector,
    getContentForPrint,
  };
};

// Helper functions

function scopeCustomCSS(customCss: string, scopeSelector: string): string {
  if (!customCss) return "";

  // Scope regular selectors but leave @-rules alone
  const scopedCustomCSS = customCss.replace(/([^{}]+){/g, (match, selector) => {
    // Don't scope @media, @keyframes, etc.
    if (selector.trim().startsWith("@")) {
      return match;
    }

    // Scope regular selectors
    const scopedSelector = selector
      .split(",")
      .map((s: string) => `${scopeSelector} ${s.trim()}`)
      .join(", ");
    return `${scopedSelector}{`;
  });

  return `/* User's custom CSS */\n${scopedCustomCSS}`;
}

function getFontUrl(fontFamily?: string): string {
  return fontFamily && !SYSTEM_FONTS.includes(fontFamily)
    ? `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@300;400;500;600;700&display=swap`
    : "";
}
