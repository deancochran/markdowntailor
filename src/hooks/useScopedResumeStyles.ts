import { ResumeStyles, getDefaultCustomProperties } from "@/lib/utils/styles";
import { useCallback, useMemo, useRef } from "react";

// Constants used within the hook
const SYSTEM_FONTS = ["Georgia", "Times+New+Roman", "Arial"];

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

    // Apply custom CSS directly with scoping
    return `
      /* Base styles with scope */
      ${scopeSelector} {
        font-family: var(--resume-font-family);
        font-size: var(--resume-font-size);
        line-height: var(--resume-line-height);
        margin: var(--resume-margin-v) var(--resume-margin-h);
        max-width: var(--resume-max-width);
        min-height: var(--resume-min-height);
      }

      /* User's custom CSS with scope applied */
      ${scopeCSS(customCss || "")}
    `;
  }, [scopeClass, customCss]);

  // Helper function to generate scoped selectors
  const getScopedSelector = useCallback(
    (selector: string): string => {
      return `.${scopeClass} ${selector}`;
    },
    [scopeClass],
  );

  // Generate complete HTML for printing
  const getContentForPrint = useCallback(
    (content: string): string => {
      const fontFamily = styles.fontFamily.replace(/\+/g, " ");
      const fontUrl =
        styles.fontFamily && !SYSTEM_FONTS.includes(styles.fontFamily)
          ? `https://fonts.googleapis.com/css2?family=${styles.fontFamily}:wght@300;400;500;600;700&display=swap`
          : "";

      // Create a self-contained HTML document for printing
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Resume</title>
  ${fontUrl ? `<link href="${fontUrl}" rel="stylesheet">` : ""}
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    body {
      margin: 0;
      padding: 0;
      background: white;
    }
    .resume-container {
      font-family: "${fontFamily}", -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: ${styles.fontSize}px;
      line-height: ${styles.lineHeight};
      margin: ${styles.marginV}px ${styles.marginH}px;
      max-width: 794px;
      min-height: 1123px;
    }
    ${customCss || ""}
  </style>
</head>
<body>
  <div class="resume-container">
    ${content}
  </div>
</body>
</html>`;
    },
    [styles, customCss],
  );

  return {
    scopeClass,
    scopedCSS,
    customProperties,
    getScopedSelector,
    getContentForPrint,
  };
};
