import { useScopedResumeStyles } from "@/hooks/useScopedResumeStyles";
import { useSmartPages } from "@/hooks/useSmartPages";
import { ResumeStyles } from "@/lib/utils/styles";
import { marked } from "marked";
import { useCallback, useEffect, useRef, useState } from "react";

// Add custom properties to HTMLDivElement type
declare global {
  interface HTMLDivElement {
    getContentForPrint?: () => string;
    getScopedSelector?: (selector: string) => string;
    customProperties?: Record<string, string>;
    // Support for direct page break control
    addPageBreak?: () => void;
  }
}

// Class used to force page breaks
const PAGE_BREAK_CLASS = "page-break";

interface ResumePreviewProps {
  markdown: string;
  styles: ResumeStyles;
  customCss?: string;
}

const SYSTEM_FONTS = ["Georgia", "Times+New+Roman", "Arial"];
const INITIAL_SCALE = 0.8;
const SCALE_LIMITS = { min: 0.3, max: 1.5 };
const SCALE_FACTOR = 1.1;
// A4 dimensions (width in mm, height in px for DOM compatibility)
// A4 = 210mm x 297mm = 8.27" x 11.69" = 794px x 1123px at 96 DPI

// Paper dimensions (A4 in mm)
const PAPER_WIDTH = 210; // mm
const PAPER_HEIGHT = 297; // mm
const CONTAINER_MIN_WIDTH = 900;

// Pixel to mm conversion factor (for future use)
const _PX_TO_MM = 0.264583; // 1px = 0.264583mm

// Print-specific CSS for fixed paper dimensions
const PRINT_CSS = `
  @media print {
    * {
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    body {
      margin: 0 !important;
      padding: 0 !important;
    }

    [data-part="page"] {
      width: ${PAPER_WIDTH}mm !important;
      height: ${PAPER_HEIGHT}px !important;
      margin: 0 !important;
      box-sizing: border-box !important;
      page-break-after: always !important;
      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      transform: none !important;
      overflow: visible !important;
    }

    [data-part="page"]:last-child {
      page-break-after: avoid !important;
    }

    .page-break {
      display: none !important;
    }

    /* CSS to help control page breaks */
    h1, h2, h3, .section-heading {
      break-before: auto;
      break-after: avoid;
    }

    li, tr, td, th, .keep-together {
      break-inside: avoid;
    }

    .page-indicator {
      display: none !important;
    }

    @page {
      size: letter;
      margin: 0;
    }
  }
`;

export default function ResumePreview({
  markdown,
  styles,
  customCss,
}: ResumePreviewProps) {
  const [renderedHtml, setRenderedHtml] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(INITIAL_SCALE);
  const containerRef = useRef<HTMLDivElement>(null);
  const styleElementRef = useRef<HTMLStyleElement | null>(null);

  // Generate scoped styles using our custom hook
  const scopedStylesConfig = useScopedResumeStyles({ styles, customCss });
  const {
    scopeClass,
    scopedCSS,
    customProperties,
    getScopedSelector,
    getContentForPrint,
  } = scopedStylesConfig;

  // Use smart pages for page breaks
  const smartPagesConfig = useSmartPages({
    content: renderedHtml,
    styles,
    scopeClass,
    customProperties,
  });
  const { pages, totalPages, isCalculating, recalculatePages } =
    smartPagesConfig;

  // Load the selected font
  const loadFont = useCallback(async (fontFamily: string) => {
    if (!fontFamily || SYSTEM_FONTS.includes(fontFamily)) {
      return;
    }

    if (isFontAlreadyLoaded(fontFamily)) {
      return;
    }

    await loadGoogleFont(fontFamily);
  }, []);

  // Render markdown to HTML
  const renderMarkdown = useCallback(async (content: string) => {
    if (!content.trim()) return "";

    // Set up the renderer to properly apply styles
    const renderer = new marked.Renderer();
    const originalParagraph = renderer.paragraph;

    // Enhance paragraph rendering to add style attributes
    renderer.paragraph = function (text) {
      const paragraph = originalParagraph.call(this, text);
      return paragraph;
    };

    return marked(content, {
      gfm: true,
      breaks: true,
      async: false,
      renderer: renderer,
    });
  }, []);

  // Zoom controls
  const zoomControls = useZoomControls(scale, setScale);

  // Get content for printing
  const getResumeContentForPrint = useCallback(() => {
    if (pages.length === 0) {
      return getContentForPrint(renderedHtml);
    }

    const combinedContent = createCombinedPageContent(pages);
    return getContentForPrint(combinedContent);
  }, [getContentForPrint, renderedHtml, pages]);

  // Inject scoped CSS into document head
  useScopedCSSInjection(scopedCSS, scopeClass, styleElementRef);

  // Inject print CSS for fixed dimensions
  usePrintCSSInjection();

  // Handle font loading and markdown rendering
  useResumeRendering(
    markdown,
    styles.fontFamily,
    loadFont,
    renderMarkdown,
    setRenderedHtml,
    setIsLoading,
    recalculatePages,
    scopeClass,
    styles,
  );

  // Expose print function to parent components
  useParentComponentAPI(
    containerRef,
    getResumeContentForPrint,
    getScopedSelector,
    customProperties,
  );

  // Enable page break functionality on the container element
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.addPageBreak = () => {
        // Create a page break element
        const pageBreak = document.createElement("div");
        pageBreak.className = PAGE_BREAK_CLASS;
        pageBreak.style.height = "0";
        pageBreak.style.width = "100%";

        // Append it to the rendered content
        if (containerRef.current) {
          containerRef.current.appendChild(pageBreak);
          recalculatePages();
        }
      };
    }
  }, [containerRef, recalculatePages]);

  return (
    <div className="flex flex-col h-full" ref={containerRef}>
      <PreviewControls
        zoomControls={zoomControls}
        scale={scale}
        totalPages={totalPages}
      />
      <PreviewContainer
        isLoading={isLoading}
        isCalculating={isCalculating}
        scale={scale}
        pages={pages}
        totalPages={totalPages}
        scopeClass={scopeClass}
        styles={styles}
      />
    </div>
  );
}

// Helper functions and custom hooks for better organization

function isFontAlreadyLoaded(fontFamily: string): boolean {
  return !!document.querySelector(`link[href*="${fontFamily}"]`);
}

async function loadGoogleFont(fontFamily: string): Promise<void> {
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@300;400;500;600;700&display=swap`;

  return new Promise<void>((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontUrl;
    link.onload = () => resolve();
    link.onerror = () =>
      reject(new Error(`Failed to load font: ${fontFamily}`));
    document.head.appendChild(link);
  });
}

function useZoomControls(
  scale: number,
  setScale: React.Dispatch<React.SetStateAction<number>>,
) {
  const zoomIn = useCallback(() => {
    setScale((prev: number) => Math.min(prev * SCALE_FACTOR, SCALE_LIMITS.max));
  }, [setScale]);

  const zoomOut = useCallback(() => {
    setScale((prev: number) => Math.max(prev / SCALE_FACTOR, SCALE_LIMITS.min));
  }, [setScale]);

  const resetZoom = useCallback(() => {
    setScale(INITIAL_SCALE);
  }, [setScale]);

  return { zoomIn, zoomOut, resetZoom };
}

function createCombinedPageContent(
  pages: Array<{ content: string; pageNumber: number }>,
): string {
  return pages
    .map((page, index) => {
      // Use the proper data-part="page" structure that matches the preview
      const pageContent = `<div data-part="page" data-page-number="${page.pageNumber}" data-total-pages="${pages.length}">${page.content}</div>`;
      return index === 0
        ? pageContent
        : `<div class="page-break"></div>${pageContent}`;
    })
    .join("");
}

function useScopedCSSInjection(
  scopedCSS: string,
  scopeClass: string,
  styleElementRef: React.MutableRefObject<HTMLStyleElement | null>,
): void {
  useEffect(() => {
    const styleId = `resume-scoped-styles-${scopeClass}`;

    // Remove existing style element
    if (styleElementRef.current) {
      styleElementRef.current.remove();
    }

    // Create and inject new style element
    const styleElement = document.createElement("style");
    styleElement.id = styleId;
    styleElement.textContent = scopedCSS;
    document.head.appendChild(styleElement);
    styleElementRef.current = styleElement;

    // Cleanup function
    return () => {
      if (styleElementRef.current) {
        styleElementRef.current.remove();
        styleElementRef.current = null;
      }
    };
  }, [scopedCSS, scopeClass, styleElementRef]);
}

function usePrintCSSInjection(): void {
  useEffect(() => {
    const styleId = "resume-print-styles";

    // Remove existing print style element
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create and inject print style element
    const styleElement = document.createElement("style");
    styleElement.id = styleId;
    styleElement.textContent = PRINT_CSS;
    document.head.appendChild(styleElement);

    // Cleanup function
    return () => {
      const style = document.getElementById(styleId);
      if (style) {
        style.remove();
      }
    };
  }, []);
}

function useResumeRendering(
  markdown: string,
  fontFamily: string,
  loadFont: (fontFamily: string) => Promise<void>,
  renderMarkdown: (content: string) => Promise<string>,
  setRenderedHtml: (html: string) => void,
  setIsLoading: (loading: boolean) => void,
  recalculatePages: () => void,
  scopeClass: string,
  resumeStyles: ResumeStyles,
): void {
  useEffect(() => {
    const renderResume = async () => {
      setIsLoading(true);

      try {
        // Apply direct style attributes to the content to ensure styles are applied
        const styleTag = document.createElement("style");
        styleTag.textContent = `
          .${scopeClass} * {
            font-family: "${fontFamily.replace(/\+/g, " ")}", -apple-system, BlinkMacSystemFont, sans-serif !important;
            font-size: ${resumeStyles.fontSize}px !important;
            line-height: ${resumeStyles.lineHeight} !important;
          }
        `;
        document.head.appendChild(styleTag);

        await loadFont(fontFamily);
        const html = await renderMarkdown(markdown);

        setRenderedHtml(html);

        if (document.fonts) {
          await document.fonts.ready;
        }

        // Clean up the temporary style tag
        document.head.removeChild(styleTag);

        // Trigger page recalculation after content is fully loaded
        setTimeout(recalculatePages, 300);
      } catch (error) {
        console.error("Resume rendering error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    renderResume();
  }, [
    markdown,
    fontFamily,
    loadFont,
    renderMarkdown,
    setRenderedHtml,
    setIsLoading,
    recalculatePages,
    scopeClass,
    resumeStyles,
  ]);
}

function useParentComponentAPI(
  containerRef: React.RefObject<HTMLDivElement | null>,
  getResumeContentForPrint: () => string,
  getScopedSelector: (selector: string) => string,
  customProperties: Record<string, string>,
): void {
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.getContentForPrint = getResumeContentForPrint;
      containerRef.current.getScopedSelector = getScopedSelector;
      containerRef.current.customProperties = customProperties;
    }
  }, [
    getResumeContentForPrint,
    getScopedSelector,
    customProperties,
    containerRef,
  ]);
}

// Function removed as page recalculation is now handled directly in useResumeRendering

// Component parts for better organization

interface PreviewControlsProps {
  zoomControls: {
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
  };
  scale: number;
  totalPages: number;
}

function PreviewControls({
  zoomControls,
  scale,
  totalPages,
}: PreviewControlsProps) {
  const { zoomIn, zoomOut, resetZoom } = zoomControls;

  return (
    <div className="flex items-center gap-2 p-2 border-b bg-white print:hidden">
      <button
        onClick={zoomIn}
        className="px-3 py-1.5 text-sm bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        aria-label="Zoom in"
      >
        Zoom In
      </button>
      <button
        onClick={zoomOut}
        className="px-3 py-1.5 text-sm bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        aria-label="Zoom out"
      >
        Zoom Out
      </button>
      <button
        onClick={resetZoom}
        className="px-3 py-1.5 text-sm bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        aria-label="Reset zoom"
      >
        Reset
      </button>
      <div className="ml-2 text-sm text-gray-600" aria-live="polite">
        {Math.round(scale * 100)}%
      </div>
      <div className="ml-4 text-sm text-gray-600" aria-live="polite">
        {totalPages} {totalPages === 1 ? "page" : "pages"}
      </div>
    </div>
  );
}

interface PreviewContainerProps {
  isLoading: boolean;
  isCalculating: boolean;
  scale: number;
  pages: Array<{ content: string; pageNumber: number }>;
  totalPages: number;
  scopeClass: string;
  styles: ResumeStyles;
}

function PreviewContainer({
  isLoading,
  isCalculating,
  scale,
  pages,
  totalPages,
  scopeClass,
  styles,
}: PreviewContainerProps) {
  return (
    <div
      className="flex-1 overflow-auto print:overflow-visible bg-gray-100 p-4 flex justify-center items-start"
      style={{
        backgroundColor: "#f1f5f9",
        minWidth: `${CONTAINER_MIN_WIDTH}px`,
      }}
    >
      {isLoading || isCalculating ? (
        <LoadingSpinner isLoading={isLoading} />
      ) : (
        <PagesContainer
          scale={scale}
          pages={pages}
          totalPages={totalPages}
          scopeClass={scopeClass}
          styles={styles}
        />
      )}
    </div>
  );
}

interface LoadingSpinnerProps {
  isLoading: boolean;
}

function LoadingSpinner({ isLoading }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center h-40">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-gray-600">
          {isLoading ? "Loading preview..." : "Calculating pages..."}
        </span>
      </div>
    </div>
  );
}

interface PagesContainerProps {
  scale: number;
  pages: Array<{ content: string; pageNumber: number }>;
  totalPages: number;
  scopeClass: string;
  styles: ResumeStyles;
}

function PagesContainer({
  scale,
  pages,
  totalPages,
  scopeClass,
  styles,
}: PagesContainerProps) {
  return (
    <div
      className="flex flex-col gap-4"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "top center",
        transition: "transform 0.2s ease-out",
        width: `${PAPER_WIDTH}mm`,
        flexShrink: 0, // Prevent shrinking
      }}
    >
      {pages.map((page, index) => (
        <PageRenderer
          key={`page-${page.pageNumber}`}
          page={page}
          index={index}
          totalPages={totalPages}
          scopeClass={scopeClass}
          isLastPage={index === pages.length - 1}
          styles={styles}
        />
      ))}
    </div>
  );
}

interface PageRendererProps {
  page: { content: string; pageNumber: number };
  index: number;
  totalPages: number;
  scopeClass: string;
  isLastPage: boolean;
  styles: ResumeStyles;
}

function PageRenderer({
  page,
  index: _index,
  totalPages,
  scopeClass,
  isLastPage,
  styles,
}: PageRendererProps) {
  return (
    <div
      className="relative"
      style={{
        marginBottom: isLastPage ? 0 : "20px",
      }}
    >
      {/* Page number indicator */}
      <div className="absolute -top-6 left-0 text-xs text-gray-500 print:hidden page-indicator">
        Page {page.pageNumber} of {totalPages}
      </div>
      {/* Page content */}
      <div
        className={`${scopeClass} bg-white shadow-lg print:shadow-none`}
        dangerouslySetInnerHTML={{ __html: page.content }}
        role="document"
        aria-label={`Resume page ${page.pageNumber}`}
        data-part="page"
        data-page-number={page.pageNumber}
        data-total-pages={totalPages}
        style={{
          boxSizing: "border-box",
          width: `${PAPER_WIDTH}mm`,
          height: `${PAPER_HEIGHT}mm`,
          minWidth: `${PAPER_WIDTH}mm`,
          minHeight: `${PAPER_HEIGHT}mm`,
          maxWidth: `${PAPER_WIDTH}mm`,
          maxHeight: `${PAPER_HEIGHT}mm`,
          padding: `${styles.marginV}px ${styles.marginH}px`,
          border: "1px solid #e5e7eb",
          borderRadius: "4px",
          overflow: "auto", // Allow scrolling for overflow content
          position: "relative", // For proper positioning
        }}
      />
    </div>
  );
}
