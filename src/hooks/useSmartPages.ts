import { ResumeStyles } from "@/lib/utils/styles";
import { useCallback, useEffect, useRef, useState } from "react";

// Constants
const NEW_PAGE_CLASS = "page-break";

// Types
interface PageInfo {
  pageNumber: number;
  content: string;
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

// Helper functions
const elementHeight = (element: Element): number => {
  const style = window.getComputedStyle(element);
  const marginTop = parseInt(style.marginTop) || 0;
  const marginBottom = parseInt(style.marginBottom) || 0;

  return element.clientHeight + marginTop + marginBottom;
};

const createPage = (
  size: { width: number; height: number },
  margins: { top: number; bottom: number; left: number; right: number },
  pageNumber: number,
  totalPages: number,
  scopeClass?: string,
  styles?: ResumeStyles,
): HTMLElement => {
  const page = document.createElement("div");

  // Dataset attributes for identification
  page.dataset.part = "page";
  page.dataset.pageNumber = pageNumber.toString();
  page.dataset.totalPages = totalPages.toString();

  if (scopeClass) {
    page.classList.add(scopeClass);
  }

  // Apply styles directly
  page.style.width = `${size.width}mm`;
  page.style.height = `${size.height}mm`;
  page.style.padding = `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`;
  page.style.position = "relative";
  page.style.boxSizing = "border-box";
  page.style.overflow = "hidden";

  // Apply user styles if provided
  if (styles) {
    // Set font properties
    page.style.fontFamily = `"${styles.fontFamily.replace(/\+/g, " ")}", -apple-system, BlinkMacSystemFont, sans-serif`;
    page.style.fontSize = `${styles.fontSize}px`;
    page.style.lineHeight = styles.lineHeight.toString();
  }

  return page;
};

const breakPage = (
  content: string,
  size: { width: number; height: number },
  margins: { top: number; bottom: number; left: number; right: number },
  scopeClass?: string,
  styles?: ResumeStyles,
): PageInfo[] => {
  // Create temporary container
  const container = document.createElement("div");
  container.innerHTML = content;

  if (scopeClass) {
    container.classList.add(scopeClass);
  }

  // Set up for measurements
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.visibility = "hidden";
  container.style.width = `${size.width}mm`;

  document.body.appendChild(container);

  try {
    const maxHeight = size.height - margins.top - margins.bottom;
    const pages: PageInfo[] = [];

    let accHeight = 0;
    let pageNumber = 1;
    let currentPage = createPage(
      size,
      margins,
      pageNumber,
      1,
      scopeClass,
      styles,
    );
    let currentPageContent: HTMLElement[] = [];

    Array.from(container.children).forEach((child) => {
      const childElement = child as HTMLElement;
      const childHeight = elementHeight(childElement);
      const isPageBreak = childElement.classList.contains(NEW_PAGE_CLASS);

      // With this
      const TOLERANCE = 20; // Adjust as needed
      if (accHeight + childHeight > maxHeight + TOLERANCE || isPageBreak) {
        // Extract HTML content from current page
        const pageContent = currentPageContent
          .map((element) => element.outerHTML)
          .join("");

        // Add current page to results
        pages.push({
          pageNumber,
          content: pageContent,
        });

        // Create new page
        pageNumber++;
        currentPage = createPage(
          size,
          margins,
          pageNumber,
          1,
          scopeClass,
          styles,
        );
        currentPageContent = [];
        accHeight = 0;

        // Skip page break elements
        if (isPageBreak) {
          return;
        }
      }

      // Add element to current page
      const clone = childElement.cloneNode(true) as HTMLElement;
      currentPage.appendChild(clone);
      currentPageContent.push(clone);
      accHeight += childHeight;
    });

    // Add the last page if it has content
    if (currentPageContent.length > 0) {
      const pageContent = currentPageContent
        .map((element) => element.outerHTML)
        .join("");

      pages.push({
        pageNumber,
        content: pageContent,
      });
    }

    return pages.map((page, index) => ({
      ...page,
      pageNumber: index + 1,
    }));
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
};

export const useSmartPages = ({
  content,
  styles,
  scopeClass,
}: UseSmartPagesProps): UseSmartPagesReturn => {
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getPageDimensions = useCallback(() => {
    // Use the actual pixel dimensions that match your CSS
    // 210mm at 96dpi ≈ 794px, 297mm ≈ 1123px
    return {
      width: 794, // 210mm in pixels
      height: 1123, // 297mm in pixels
    };
  }, []);
  // Get content area dimensions
  const getContentArea = useCallback(() => {
    const pageDimensions = getPageDimensions();
    return {
      width: pageDimensions.width,
      height: pageDimensions.height - styles.marginV * 2,
    };
  }, [styles.marginV, getPageDimensions]);

  // Calculate pages
  const calculatePages = useCallback(() => {
    if (!content.trim()) {
      setPages([_createEmptyPage(0)]);
      return;
    }

    setIsCalculating(true);

    try {
      const size = getPageDimensions();
      const margins = {
        top: styles.marginV / 2,
        bottom: styles.marginV / 2,
        left: styles.marginH,
        right: styles.marginH,
      };

      const newPages = breakPage(content, size, margins, scopeClass, styles);
      setPages(newPages);
    } catch (error) {
      console.error("Error calculating pages:", error);
      setPages([{ pageNumber: 1, content }]);
    } finally {
      setIsCalculating(false);
    }
  }, [content, styles, scopeClass, getPageDimensions]);

  // Throttled recalculation
  const recalculatePages = useCallback(() => {
    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
    }

    throttleTimerRef.current = setTimeout(() => {
      calculatePages();
      throttleTimerRef.current = null;
    }, 200);
  }, [calculatePages]);

  // Calculate pages when dependencies change
  useEffect(() => {
    recalculatePages();

    return () => {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
    };
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

// Simple helper function for empty page - kept for potential future use
function _createEmptyPage(_availableHeight: number): PageInfo {
  return {
    pageNumber: 1,
    content: "",
  };
}
