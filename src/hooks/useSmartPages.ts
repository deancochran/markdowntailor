import { ResumeStyles } from "@/lib/utils/styles";
import { useCallback, useEffect, useMemo, useState } from "react";

// A4 dimensions in pixels (at 96 DPI)
const A4_DIMENSIONS = {
  width: 794,
  height: 1123,
} as const;

interface PageBreakOptions {
  // Minimum lines to keep together
  minLinesKeepTogether: number;
  // Avoid breaking inside these elements
  avoidBreakInside: string[];
  // Preferred break points
  preferredBreakPoints: string[];
}

interface PageInfo {
  pageNumber: number;
  content: string;
  contentHeight: number;
  availableHeight: number;
}

interface UseSmartPagesProps {
  content: string;
  styles: ResumeStyles;
  options?: Partial<PageBreakOptions>;
}

interface UseSmartPagesReturn {
  pages: PageInfo[];
  totalPages: number;
  isCalculating: boolean;
  recalculatePages: () => void;
  getPageDimensions: () => { width: number; height: number };
  getContentArea: () => { width: number; height: number };
}

const DEFAULT_OPTIONS: PageBreakOptions = {
  minLinesKeepTogether: 2,
  avoidBreakInside: [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "li",
    "p",
    "blockquote",
  ],
  preferredBreakPoints: ["h1", "h2", "h3", "hr", "div", "section"],
};

export const useSmartPages = ({
  content,
  styles,
  options = {},
}: UseSmartPagesProps): UseSmartPagesReturn => {
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const mergedOptions = useMemo(
    () => ({
      ...DEFAULT_OPTIONS,
      ...options,
    }),
    [options],
  );

  // Calculate page dimensions
  const getPageDimensions = useCallback(() => {
    return {
      width: A4_DIMENSIONS.width,
      height: A4_DIMENSIONS.height,
    };
  }, []);

  // Calculate content area (page minus margins)
  const getContentArea = useCallback(() => {
    const pageDimensions = getPageDimensions();
    return {
      width: pageDimensions.width - styles.marginH * 2,
      height: pageDimensions.height - styles.marginV * 2,
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
      element.style.fontFamily = styles.fontFamily.replace(/\+/g, " ");
      element.style.fontSize = `${styles.fontSize}px`;
      element.style.lineHeight = `${styles.lineHeight}`;
      element.style.width = `${getContentArea().width}px`;
      element.style.boxSizing = "border-box";

      document.body.appendChild(element);
      return element;
    },
    [styles.fontFamily, styles.fontSize, styles.lineHeight, getContentArea],
  );

  // Get element height
  const getElementHeight = useCallback((element: HTMLElement) => {
    return element.offsetHeight;
  }, []);

  // Find best break point within content
  const findBreakPoint = useCallback(
    (element: HTMLElement, maxHeight: number) => {
      const children = Array.from(element.children) as HTMLElement[];
      let currentHeight = 0;
      let breakIndex = -1;

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const childHeight = getElementHeight(child);

        if (currentHeight + childHeight > maxHeight) {
          // Check if this is a preferred break point
          if (
            mergedOptions.preferredBreakPoints.includes(
              child.tagName.toLowerCase(),
            )
          ) {
            breakIndex = i;
            break;
          }

          // Check if previous element was a good break point
          if (
            i > 0 &&
            mergedOptions.preferredBreakPoints.includes(
              children[i - 1].tagName.toLowerCase(),
            )
          ) {
            breakIndex = i;
            break;
          }

          // Default to breaking before this element
          breakIndex = i;
          break;
        }

        currentHeight += childHeight;
      }

      return breakIndex;
    },
    [mergedOptions.preferredBreakPoints, getElementHeight],
  );

  // Split content into pages
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

      // If content fits in one page
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

      // Split into multiple pages
      const pages: PageInfo[] = [];
      let remainingContent = html;
      let pageNumber = 1;

      while (remainingContent.trim()) {
        const tempElement = createMeasurementElement(remainingContent);
        const currentHeight = getElementHeight(tempElement);

        if (currentHeight <= availableHeight) {
          // Remaining content fits in one page
          pages.push({
            pageNumber,
            content: remainingContent,
            contentHeight: currentHeight,
            availableHeight: availableHeight,
          });
          document.body.removeChild(tempElement);
          break;
        }

        // Find where to break the content
        const breakIndex = findBreakPoint(tempElement, availableHeight);

        if (breakIndex === -1 || breakIndex === 0) {
          // Force break at first element if no good break point found
          const children = Array.from(tempElement.children) as HTMLElement[];
          if (children.length > 0) {
            const firstChild = children[0];
            pages.push({
              pageNumber,
              content: firstChild.outerHTML,
              contentHeight: getElementHeight(firstChild),
              availableHeight: availableHeight,
            });

            // Remove the first element from remaining content
            const parser = new DOMParser();
            const doc = parser.parseFromString(remainingContent, "text/html");
            const bodyChildren = Array.from(doc.body.children);
            if (bodyChildren.length > 0) {
              bodyChildren[0].remove();
              remainingContent = doc.body.innerHTML;
            } else {
              remainingContent = "";
            }
          } else {
            // No more content to process
            break;
          }
        } else {
          // Split at the break point
          const children = Array.from(tempElement.children) as HTMLElement[];
          const pageChildren = children.slice(0, breakIndex);
          const pageContent = pageChildren
            .map((child) => child.outerHTML)
            .join("");
          const pageHeight = pageChildren.reduce(
            (sum, child) => sum + getElementHeight(child),
            0,
          );

          pages.push({
            pageNumber,
            content: pageContent,
            contentHeight: pageHeight,
            availableHeight: availableHeight,
          });

          // Remaining content
          const remainingChildren = children.slice(breakIndex);
          remainingContent = remainingChildren
            .map((child) => child.outerHTML)
            .join("");
        }

        document.body.removeChild(tempElement);
        pageNumber++;
      }

      document.body.removeChild(measurementElement);
      return pages;
    },
    [
      createMeasurementElement,
      getElementHeight,
      getContentArea,
      findBreakPoint,
    ],
  );

  // Recalculate pages
  const recalculatePages = useCallback(async () => {
    setIsCalculating(true);

    try {
      // Wait for fonts to load
      if (document.fonts) {
        await document.fonts.ready;
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
  }, [content, splitIntoPages, getContentArea]);

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
