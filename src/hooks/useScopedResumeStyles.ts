import {
  PRINT_HTML_TEMPLATE,
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

    // Apply custom CSS directly with scoping
    return `
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

  // Generate complete HTML for printing using template from styles.ts
  const getContentForPrint = useCallback(
    (content: string): string => {
      const fontFamily = styles.fontFamily.replace(/\+/g, " ");
      const fontUrl =
        styles.fontFamily && !SYSTEM_FONTS.includes(styles.fontFamily)
          ? `https://fonts.googleapis.com/css2?family=${styles.fontFamily}:wght@300;400;500;600;700&display=swap`
          : "";

      // Replace template placeholders with actual values
      return PRINT_HTML_TEMPLATE.replace(
        "{{FONT_LINK}}",
        fontUrl ? `<link href="${fontUrl}" rel="stylesheet">` : "",
      )
        .replace("{{FONT_FAMILY}}", fontFamily)
        .replace("{{FONT_SIZE}}", styles.fontSize.toString())
        .replace("{{LINE_HEIGHT}}", styles.lineHeight.toString())
        .replace("{{MARGIN_V}}", styles.marginV.toString())
        .replace("{{MARGIN_H}}", styles.marginH.toString())
        .replace("{{CUSTOM_CSS}}", customCss || "")
        .replace("{{CONTENT}}", content);
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
