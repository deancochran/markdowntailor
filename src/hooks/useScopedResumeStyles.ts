import { ResumeStyles } from "@/lib/utils/styles";
import { DynamicCssService } from "@/services/dynamic-css";
import { useCallback, useMemo } from "react";

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
  // Create a memoized instance of the DynamicCssService.
  // This ensures the service is only re-initialized when styles or customCss change.
  const cssService = useMemo(
    () => new DynamicCssService(styles, customCss),
    [styles, customCss],
  );

  // Memoize the methods to ensure stable function references for child components.
  const getScopedSelector = useCallback(
    (selector: string): string => {
      return cssService.getScopedSelector(selector);
    },
    [cssService],
  );

  const getContentForPrint = useCallback(
    (content: string): string => {
      return cssService.getContentForPrint(content);
    },
    [cssService],
  );

  return {
    scopeClass: cssService.scopeClass,
    scopedCSS: cssService.scopedCSS,
    customProperties: cssService.customProperties,
    getScopedSelector,
    getContentForPrint,
  };
};
