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

    const customPropsCSS = generateCustomPropertiesCSS(customProperties);
    const baseScopedCSS = generateBaseScopedCSS(scopeSelector);
    const printScopedCSS = generatePrintScopedCSS(scopeSelector);
    const userCustomCSS = scopeCustomCSS(customCss, scopeSelector);

    return [customPropsCSS, baseScopedCSS, printScopedCSS, userCustomCSS].join(
      "\n",
    );
  }, [scopeClass, customCss, customProperties]);

  // Helper function to generate scoped selectors
  const getScopedSelector = useCallback(
    (selector: string): string => {
      return `.${scopeClass} ${selector}`;
    },
    [scopeClass],
  );

  // Generate complete HTML for printing using the same scoped CSS as preview
  const getContentForPrint = useCallback(
    (content: string): string => {
      const fontUrl = getFontUrl(styles.fontFamily);
      const customPropsCSS = generateCustomPropertiesCSS(customProperties);

      return generatePrintHTML({
        fontUrl,
        customPropsCSS,
        scopedCSS,
        scopeClass,
        content,
      });
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

// Helper functions for better organization and readability

function generateCustomPropertiesCSS(
  customProperties: Record<string, string>,
): string {
  const customPropsCSS = Object.entries(customProperties)
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n        ");

  return `
      /* Define CSS custom properties at root level */
      :root {
        ${customPropsCSS}
      }`;
}

function generateBaseScopedCSS(scopeSelector: string): string {
  return `
      /* Page container with white background and shadow */
      ${scopeSelector} {
        background-color: var(--resume-background-color);
        max-width: var(--resume-max-width);
        min-height: var(--resume-min-height);
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        margin: 0 auto;
        box-sizing: border-box;
      }

      /* Default padding for main container */
      ${scopeSelector} {
        padding: var(--resume-margin-v) var(--resume-margin-h);
      }

      /* Content styles within the page */
      ${scopeSelector} * {
        font-family: var(--resume-font-family);
        font-size: var(--resume-font-size);
        line-height: var(--resume-line-height);
      }

      /* Page break styles */
      ${scopeSelector} .page-break {
        page-break-before: always;
        break-before: page;
        height: 0;
        margin: 0;
      }

      ${scopeSelector} .page-break:first-child {
        page-break-before: avoid;
        break-before: avoid;
      }

      /* Print page container */
      ${scopeSelector} .print-page {
        min-height: var(--resume-min-height);
        padding: var(--resume-margin-v) var(--resume-margin-h);
        box-sizing: border-box;
        page-break-inside: avoid;
        break-inside: avoid;
      }

      /* Avoid breaking inside these elements */
      ${scopeSelector} h1,
      ${scopeSelector} h2,
      ${scopeSelector} h3,
      ${scopeSelector} h4,
      ${scopeSelector} h5,
      ${scopeSelector} h6 {
        page-break-after: avoid;
        break-after: avoid;
        page-break-inside: avoid;
        break-inside: avoid;
      }

      ${scopeSelector} p,
      ${scopeSelector} li,
      ${scopeSelector} blockquote {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      ${scopeSelector} table {
        page-break-inside: avoid;
        break-inside: avoid;
      }`;
}

function generatePrintScopedCSS(scopeSelector: string): string {
  return `
      /* Print styles */
      @media print {
        ${scopeSelector} {
          box-shadow: none;
          margin: 0;
          padding: var(--resume-margin-v) var(--resume-margin-h);
          max-width: none;
        }

        ${scopeSelector} .print-page {
          min-height: auto;
          padding: var(--resume-margin-v) var(--resume-margin-h);
          margin: 0;
          box-sizing: border-box;
          page-break-inside: avoid;
          break-inside: avoid;
        }

        ${scopeSelector} .page-break {
          page-break-before: always;
          break-before: page;
          height: 0;
          margin: 0;
        }

        ${scopeSelector} .page-break:first-child {
          display: none;
        }
      }`;
}

function scopeCustomCSS(customCss: string, scopeSelector: string): string {
  if (!customCss) return "";

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

  return `
      /* User's custom CSS with scope applied */
      ${scopedCustomCSS}`;
}

function getFontUrl(fontFamily?: string): string {
  return fontFamily && !SYSTEM_FONTS.includes(fontFamily)
    ? `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@300;400;500;600;700&display=swap`
    : "";
}

interface PrintHTMLConfig {
  fontUrl: string;
  customPropsCSS: string;
  scopedCSS: string;
  scopeClass: string;
  content: string;
}

function generatePrintHTML({
  fontUrl,
  customPropsCSS,
  scopedCSS,
  scopeClass,
  content,
}: PrintHTMLConfig): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Resume</title>
  ${fontUrl ? `<link href="${fontUrl}" rel="stylesheet">` : ""}
  <style>
    /* Define CSS custom properties at root level */
    :root {
      ${customPropsCSS}
    }
    @page {
      size: A4;
      margin: 0;
    }
    body {
      margin: 0;
      background-color: white;
    }
    /* Use the same scoped CSS as preview */
    ${scopedCSS}
  </style>
</head>
<body>
  <div class="${scopeClass}">
    ${content}
  </div>
</body>
</html>`;
}
