import {
  ResumeStyles,
  SCOPED_RESUME_CSS_TEMPLATE,
  generatePrintHTML,
  getDefaultCustomProperties,
  processScopedCssTemplate,
} from "@/lib/utils/styles";
import { useCallback, useMemo, useRef } from "react";

interface ScopedStylesConfig {
  styles: ResumeStyles;
  customCss?: string;
  isPreview?: boolean;
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

    return processScopedCssTemplate({
      template: SCOPED_RESUME_CSS_TEMPLATE,
      scopeSelector,
      customProperties,
      customCss,
      scopeCssFunction: scopeCSS,
    });
  }, [scopeClass, customProperties, customCss]);

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
      return generatePrintHTML({
        content,
        styles,
        customCss,
      });
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
