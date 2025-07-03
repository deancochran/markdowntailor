import {
  ResumeStyles,
  SYSTEM_FONTS,
  getDefaultCustomProperties,
} from "@/lib/utils/styles";
import { useCallback, useMemo, useRef } from "react";

// No local constants needed - imported from styles.ts

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

    // Helper function to scope CSS selectors
    const scopeCSS = (css: string): string => {
      return css.replace(/([^{}]+){/g, (match, selector) => {
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
    };

    // Generate CSS custom properties definition
    const customPropsCSS = Object.entries(customProperties)
      .map(([key, value]) => `${key}: ${value};`)
      .join("\n        ");

    // Apply custom CSS directly with scoping
    return `
      /* Define CSS custom properties at root level */
      :root {
        ${customPropsCSS}
      }

      /* Page container with white background and shadow */
      ${scopeSelector} {
        background-color: var(--resume-background-color);
        max-width: var(--resume-max-width);
        min-height: var(--resume-min-height);
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        margin: 0 auto;
        padding: var(--resume-margin-v) var(--resume-margin-h);
        box-sizing: border-box;
      }

      /* Content styles within the page */
      ${scopeSelector} * {
        font-family: var(--resume-font-family);
        font-size: var(--resume-font-size);
        line-height: var(--resume-line-height);
      }

      /* Page break styles */
      ${scopeSelector}.page-break {
        page-break-before: always;
        break-before: page;
      }

      ${scopeSelector}.page-break:first-child {
        page-break-before: avoid;
        break-before: avoid;
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
      }

      /* Print styles */
      @media print {
        ${scopeSelector} {
          box-shadow: none;
          margin: 0;
          padding: var(--resume-margin-v) var(--resume-margin-h);
        }
      }

      /* User's custom CSS with scope applied */
      ${scopeCSS(customCss || "")}
    `;
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
      const fontUrl =
        styles.fontFamily && !SYSTEM_FONTS.includes(styles.fontFamily)
          ? `https://fonts.googleapis.com/css2?family=${styles.fontFamily}:wght@300;400;500;600;700&display=swap`
          : "";

      // Generate CSS custom properties definition
      const customPropsCSS = Object.entries(customProperties)
        .map(([key, value]) => `${key}: ${value};`)
        .join("\n    ");

      // Use the same scoped CSS structure as the preview
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
      padding: 0;
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
