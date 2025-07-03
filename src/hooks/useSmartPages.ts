import { ResumeStyles } from "@/lib/utils/styles";
import { useCallback, useEffect, useState } from "react";

// A4 dimensions in pixels (more accurate for print)
// A4 = 210mm x 297mm = 8.27" x 11.69" = 794px x 1123px at 96 DPI
const PRINT_DIMENSIONS = {
  width: 794,
  height: 1123,
} as const;

const PRINT_BUFFER = 20; // Extra buffer to prevent content overflow
const CSS_READY_MAX_ATTEMPTS = 10;
const CSS_READY_DELAY = 100;
const DOM_READY_DELAY = 50;

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
  customProperties: _customProperties,
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

      applyMeasurementStyles(element, getContentArea().width, scopeClass);
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
        return createEmptyPage(getContentArea().height);
      }

      const measurementElement = createMeasurementElement(html);
      const totalHeight = getElementHeight(measurementElement);
      const availableHeight = getContentArea().height;

      // If content fits in one page, return it as is
      if (totalHeight <= availableHeight) {
        document.body.removeChild(measurementElement);
        return createSinglePage(html, totalHeight, availableHeight);
      }

      // Content doesn't fit - split into multiple pages
      const result = splitContentIntoPages(measurementElement, availableHeight);
      document.body.removeChild(measurementElement);

      return result;
    },
    [createMeasurementElement, getElementHeight, getContentArea],
  );

  // Recalculate pages
  const recalculatePages = useCallback(async () => {
    setIsCalculating(true);

    try {
      await waitForFontsReady();
      await waitForScopedCSSReady(scopeClass);
      await waitForDOMReady();

      const newPages = splitIntoPages(content);
      setPages(newPages);
    } catch (error) {
      console.error("Error calculating pages:", error);
      setPages(createFallbackPage(content, getContentArea().height));
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

// Helper functions for better organization and readability

function applyMeasurementStyles(
  element: HTMLElement,
  width: number,
  scopeClass?: string,
): void {
  element.style.position = "absolute";
  element.style.left = "-9999px";
  element.style.top = "-9999px";
  element.style.visibility = "hidden";
  element.style.width = `${width}px`;
  element.style.boxSizing = "border-box";

  if (scopeClass) {
    element.className = scopeClass;
  }
}

function createEmptyPage(availableHeight: number): PageInfo[] {
  return [
    {
      pageNumber: 1,
      content: "",
      contentHeight: 0,
      availableHeight: availableHeight,
    },
  ];
}

function createSinglePage(
  html: string,
  totalHeight: number,
  availableHeight: number,
): PageInfo[] {
  return [
    {
      pageNumber: 1,
      content: html,
      contentHeight: totalHeight,
      availableHeight: availableHeight,
    },
  ];
}

function createFallbackPage(
  content: string,
  availableHeight: number,
): PageInfo[] {
  return [
    {
      pageNumber: 1,
      content: content,
      contentHeight: 0,
      availableHeight: availableHeight,
    },
  ];
}

function splitContentIntoPages(
  measurementElement: HTMLElement,
  availableHeight: number,
): PageInfo[] {
  const children = Array.from(measurementElement.children) as HTMLElement[];

  if (children.length === 0) {
    return createSinglePage(
      measurementElement.innerHTML,
      measurementElement.offsetHeight,
      availableHeight,
    );
  }

  const pages: PageInfo[] = [];
  let currentPageContent: HTMLElement[] = [];
  let currentPageHeight = 0;
  let pageNumber = 1;

  for (const child of children) {
    const childHeight = child.offsetHeight;

    // If adding this element would exceed page height, start new page
    if (
      shouldStartNewPage(
        currentPageHeight,
        childHeight,
        availableHeight,
        currentPageContent,
      )
    ) {
      pages.push(
        createPageInfo(
          pageNumber,
          currentPageContent,
          currentPageHeight,
          availableHeight,
        ),
      );

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
    pages.push(
      createPageInfo(
        pageNumber,
        currentPageContent,
        currentPageHeight,
        availableHeight,
      ),
    );
  }

  return pages;
}

function shouldStartNewPage(
  currentPageHeight: number,
  childHeight: number,
  availableHeight: number,
  currentPageContent: HTMLElement[],
): boolean {
  return (
    currentPageHeight + childHeight > availableHeight &&
    currentPageContent.length > 0
  );
}

function createPageInfo(
  pageNumber: number,
  content: HTMLElement[],
  contentHeight: number,
  availableHeight: number,
): PageInfo {
  return {
    pageNumber,
    content: content.map((el) => el.outerHTML).join(""),
    contentHeight,
    availableHeight,
  };
}

async function waitForFontsReady(): Promise<void> {
  if (document.fonts) {
    await document.fonts.ready;
  }
}

async function waitForScopedCSSReady(scopeClass?: string): Promise<void> {
  if (!scopeClass) return;

  let cssReady = false;
  let attempts = 0;

  while (!cssReady && attempts < CSS_READY_MAX_ATTEMPTS) {
    cssReady = await checkScopedCSSReady(scopeClass);

    if (!cssReady) {
      attempts++;
      await new Promise((resolve) => setTimeout(resolve, CSS_READY_DELAY));
    }
  }
}

async function checkScopedCSSReady(scopeClass: string): Promise<boolean> {
  const testElement = document.createElement("div");
  testElement.className = scopeClass;

  applyMeasurementStyles(testElement, 100);
  document.body.appendChild(testElement);

  const computedStyle = window.getComputedStyle(testElement);
  const hasCustomProps =
    computedStyle.getPropertyValue("--resume-font-family") !== "";

  document.body.removeChild(testElement);
  return hasCustomProps;
}

async function waitForDOMReady(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, DOM_READY_DELAY));
}
