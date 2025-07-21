"use client";
import {
  MM_TO_PX,
  PAPER_SIZES,
  ResumeStyles,
  defaultStyles,
} from "@/lib/utils/styles";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
}

interface UseSmartPagesReturn {
  pages: PageInfo[];
  totalPages: number;
  isCalculating: boolean;
  recalculatePages: () => void;
  getPageDimensions: () => { width: number; height: number };
  getContentArea: () => { width: number; height: number };
}

// Helper function to get the full height of an element including margins
const elementHeight = (element: Element): number => {
  const style = window.getComputedStyle(element);
  const marginTop = parseInt(style.marginTop, 10) || 0;
  const marginBottom = parseInt(style.marginBottom, 10) || 0;
  return (element as HTMLElement).offsetHeight + marginTop + marginBottom;
};

/**
 * Breaks HTML content into pages based on specified dimensions and styles.
 * It works by rendering the content into a hidden off-screen element to measure it.
 */
const breakPage = (
  content: string,
  size: { width: number; height: number },
  margins: { top: number; bottom: number; left: number; right: number },
  scopeClass?: string,
  styles?: ResumeStyles,
): PageInfo[] => {
  const container = document.createElement("div");
  container.innerHTML = content;

  if (scopeClass) {
    container.classList.add(scopeClass);
  }

  // Set up the container for accurate measurement
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.visibility = "hidden";
  container.style.width = `${size.width - margins.left - margins.right}px`;
  container.style.boxSizing = "border-box";

  // Apply font styles to the container to ensure children are measured correctly
  if (styles) {
    container.style.fontFamily = `"${styles.fontFamily.replace(
      /\+/g,
      " ",
    )}", sans-serif`;
    container.style.fontSize = `${styles.fontSize}px`;
    container.style.lineHeight = styles.lineHeight.toString();
  }

  document.body.appendChild(container);

  try {
    const maxHeight = size.height - margins.top - margins.bottom;
    const pages: PageInfo[] = [];
    let accumulatedHeight = 0;
    let pageNumber = 1;
    let currentPageContent: HTMLElement[] = [];
    const children = Array.from(container.children);

    children.forEach((child) => {
      const childElement = child as HTMLElement;
      const childHeight = elementHeight(childElement);
      const isPageBreak = childElement.classList.contains(NEW_PAGE_CLASS);

      if (
        (accumulatedHeight > 0 &&
          accumulatedHeight + childHeight > maxHeight) ||
        isPageBreak
      ) {
        pages.push({
          pageNumber,
          content: currentPageContent.map((el) => el.outerHTML).join(""),
        });

        pageNumber++;
        currentPageContent = [];
        accumulatedHeight = 0;

        if (isPageBreak) return;
      }

      currentPageContent.push(childElement);
      accumulatedHeight += childHeight;
    });

    if (currentPageContent.length > 0) {
      pages.push({
        pageNumber,
        content: currentPageContent.map((el) => el.outerHTML).join(""),
      });
    }

    return pages.map((page, index) => ({ ...page, pageNumber: index + 1 }));
  } finally {
    document.body.removeChild(container);
  }
};

/**
 * A React hook to automatically paginate HTML content based on resume styles.
 */
export const useSmartPages = ({
  content,
  styles,
  scopeClass,
}: UseSmartPagesProps): UseSmartPagesReturn => {
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [isCalculating, setIsCalculating] = useState(true);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize the styles object by stringifying it. This is the key to preventing
  // infinite loops, as it provides a stable dependency for useCallback and useEffect.
  const stylesString = useMemo(() => JSON.stringify(styles), [styles]);

  const getPageDimensions = useCallback(() => {
    const parsedStyles: ResumeStyles = JSON.parse(stylesString);
    const paperSize = parsedStyles.paperSize || "A4";
    const dimensions = PAPER_SIZES[paperSize];
    return {
      width: Math.round(dimensions.w * MM_TO_PX),
      height: Math.round(dimensions.h * MM_TO_PX),
    };
  }, [stylesString]);

  const getContentArea = useCallback(() => {
    const parsedStyles: ResumeStyles = JSON.parse(stylesString);
    const pageDimensions = getPageDimensions();
    return {
      width:
        pageDimensions.width -
        (parsedStyles.marginH || defaultStyles.marginH) * 2,
      height:
        pageDimensions.height -
        (parsedStyles.marginV || defaultStyles.marginV) * 2,
    };
  }, [stylesString, getPageDimensions]);

  const calculatePages = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setIsCalculating(true);

    debounceTimerRef.current = setTimeout(() => {
      try {
        const parsedStyles: ResumeStyles = JSON.parse(stylesString);
        if (!content.trim()) {
          setPages([{ pageNumber: 1, content: "" }]);
          return;
        }

        const size = getPageDimensions();
        const margins = {
          top: parsedStyles.marginV,
          bottom: parsedStyles.marginV,
          left: parsedStyles.marginH,
          right: parsedStyles.marginH,
        };

        const newPages = breakPage(
          content,
          size,
          margins,
          scopeClass,
          parsedStyles,
        );

        setPages(newPages.length > 0 ? newPages : [{ pageNumber: 1, content }]);
      } catch (error) {
        console.error("Error calculating pages:", error);
        setPages([{ pageNumber: 1, content }]);
      } finally {
        setIsCalculating(false);
      }
    }, 250);
  }, [content, stylesString, scopeClass, getPageDimensions]);

  useEffect(() => {
    calculatePages();
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [calculatePages]);

  return {
    pages,
    totalPages: pages.length,
    isCalculating,
    recalculatePages: calculatePages,
    getPageDimensions,
    getContentArea,
  };
};
