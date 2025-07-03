import { ResumeStyles } from "@/lib/utils/styles";
import { useCallback, useEffect, useState } from "react";

// A4 dimensions in pixels (more accurate for print)
// A4 = 210mm x 297mm = 8.27" x 11.69" = 794px x 1123px at 96 DPI
// But for print accuracy, we use slightly adjusted dimensions
const A4_DIMENSIONS = {
  width: 794,
  height: 1123,
} as const;

// Print-specific dimensions that better match actual print output
const PRINT_DIMENSIONS = {
  width: 794,
  height: 1056, // Reduced height to account for print margins and browser behavior
} as const;

interface PageInfo {
  pageNumber: number;
  content: string;
  contentHeight: number;
  availableHeight: number;
}

interface UseSmartPagesProps {
  content: string;
  styles: ResumeStyles;
  scopeClass?: string;
  customProperties?: Record<string, string>;
}

interface UseSmartPagesReturn {
  pages: PageInfo[];
  totalPages: number;
  isCalculating: boolean;
  recalculatePages: () => void;
  getPageDimensions: () => { width: number; height: number };
  getContentArea: () => { width: number; height: number };
}

export const useSmartPages = ({
  content,
  styles,
  scopeClass,
  customProperties,
}: UseSmartPagesProps): UseSmartPagesReturn => {
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate page dimensions
  const getPageDimensions = useCallback(() => {
    return {
      width: PRINT_DIMENSIONS.width,
      height: PRINT_DIMENSIONS.height,
    };
  }, []);

  // Calculate content area (page minus margins and buffer)
  const getContentArea = useCallback(() => {
    const pageDimensions = getPageDimensions();
    const PRINT_BUFFER = 20; // Extra buffer to prevent content overflow
    return {
      width: pageDimensions.width - styles.marginH * 2,
      height: pageDimensions.height - styles.marginV * 2 - PRINT_BUFFER,
    };
  }, [styles.marginH, styles.marginV, getPageDimensions]);

  // Create a temporary DOM element for measurement
  const createMeasurementElement = useCallback(
    (html: string) => {
      const element = document.createElement("div");
      element.innerHTML = html;
      element.style.position = "absolute";
      element.style.left = "-9999px";
      element.style.top = "-9999px";
      element.style.visibility = "hidden";
      element.style.width = `${getContentArea().width}px`;
      element.style.boxSizing = "border-box";

      // Use the same scoped CSS class as the preview for accurate measurement
      if (scopeClass) {
        element.className = scopeClass;
      }

      document.body.appendChild(element);
      return element;
    },
    [getContentArea, scopeClass],
  );

  // Get element height
  const getElementHeight = useCallback((element: HTMLElement) => {
    return element.offsetHeight;
  }, []);

  // Split content into pages - simplified approach
  const splitIntoPages = useCallback(
    (html: string) => {
      if (!html.trim()) {
        return [
          {
            pageNumber: 1,
            content: "",
            contentHeight: 0,
            availableHeight: getContentArea().height,
          },
        ];
      }

      const measurementElement = createMeasurementElement(html);
      const totalHeight = getElementHeight(measurementElement);
      const availableHeight = getContentArea().height;

      // If content fits in one page, return it as is
      if (totalHeight <= availableHeight) {
        document.body.removeChild(measurementElement);
        return [
          {
            pageNumber: 1,
            content: html,
            contentHeight: totalHeight,
            availableHeight: availableHeight,
          },
        ];
      }

      // Content doesn't fit - estimate number of pages needed
      const estimatedPages = Math.ceil(totalHeight / availableHeight);
      const pages: PageInfo[] = [];
      const children = Array.from(measurementElement.children) as HTMLElement[];

      if (children.length === 0) {
        // No child elements, treat as single page
        document.body.removeChild(measurementElement);
        return [
          {
            pageNumber: 1,
            content: html,
            contentHeight: totalHeight,
            availableHeight: availableHeight,
          },
        ];
      }

      let currentPageContent: HTMLElement[] = [];
      let currentPageHeight = 0;
      let pageNumber = 1;

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const childHeight = getElementHeight(child);

        // If adding this element would exceed page height, start new page
        if (
          currentPageHeight + childHeight > availableHeight &&
          currentPageContent.length > 0
        ) {
          pages.push({
            pageNumber,
            content: currentPageContent.map((el) => el.outerHTML).join(""),
            contentHeight: currentPageHeight,
            availableHeight: availableHeight,
          });

          currentPageContent = [child];
          currentPageHeight = childHeight;
          pageNumber++;
        } else {
          currentPageContent.push(child);
          currentPageHeight += childHeight;
        }
      }

      // Add the last page if it has content
      if (currentPageContent.length > 0) {
        pages.push({
          pageNumber,
          content: currentPageContent.map((el) => el.outerHTML).join(""),
          contentHeight: currentPageHeight,
          availableHeight: availableHeight,
        });
      }

      document.body.removeChild(measurementElement);
      return pages;
    },
    [createMeasurementElement, getElementHeight, getContentArea],
  );

  // Recalculate pages
  const recalculatePages = useCallback(async () => {
    setIsCalculating(true);

    try {
      // Wait for fonts to load
      if (document.fonts) {
        await document.fonts.ready;
      }

      // Wait for scoped CSS to be available if scopeClass is provided
      if (scopeClass) {
        let cssReady = false;
        let attempts = 0;
        const maxAttempts = 10;

        while (!cssReady && attempts < maxAttempts) {
          // Check if scoped CSS is available by testing if the class exists
          const testElement = document.createElement("div");
          testElement.className = scopeClass;
          testElement.style.position = "absolute";
          testElement.style.left = "-9999px";
          testElement.style.top = "-9999px";
          testElement.style.visibility = "hidden";
          document.body.appendChild(testElement);

          const computedStyle = window.getComputedStyle(testElement);
          const hasCustomProps =
            computedStyle.getPropertyValue("--resume-font-family") !== "";

          document.body.removeChild(testElement);

          if (hasCustomProps) {
            cssReady = true;
          } else {
            attempts++;
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }
      }

      // Small delay to ensure DOM is ready
      await new Promise((resolve) => setTimeout(resolve, 50));

      const newPages = splitIntoPages(content);
      setPages(newPages);
    } catch (error) {
      console.error("Error calculating pages:", error);
      // Fallback to single page
      setPages([
        {
          pageNumber: 1,
          content: content,
          contentHeight: 0,
          availableHeight: getContentArea().height,
        },
      ]);
    } finally {
      setIsCalculating(false);
    }
  }, [content, splitIntoPages, getContentArea, scopeClass]);

  // Recalculate when dependencies change
  useEffect(() => {
    recalculatePages();
  }, [recalculatePages]);

  return {
    pages,
    totalPages: pages.length,
    isCalculating,
    recalculatePages,
    getPageDimensions,
    getContentArea,
  };
};
