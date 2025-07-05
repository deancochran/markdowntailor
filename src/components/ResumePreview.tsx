import { useScopedResumeStyles } from "@/hooks/useScopedResumeStyles";
import { useSmartPages } from "@/hooks/useSmartPages";
import { ResumeStyles } from "@/lib/utils/styles";
import { marked } from "marked";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

// Add custom properties to HTMLDivElement type
declare global {
  interface HTMLDivElement {
    getContentForPrint?: () => string;
    getScopedSelector?: (selector: string) => string;
    customProperties?: Record<string, string>;
    addPageBreak?: () => void;
  }
}

// Types and interfaces
interface ResumePreviewProps {
  markdown: string;
  styles: ResumeStyles;
  customCss?: string;
}

export interface ResumePreviewRef {
  print: () => void;
}

interface PreviewControlsProps {
  zoomControls: {
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
  };
  scale: number;
  totalPages: number;
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

interface LoadingSpinnerProps {
  isLoading: boolean;
}

interface PagesContainerProps {
  scale: number;
  pages: Array<{ content: string; pageNumber: number }>;
  totalPages: number;
  scopeClass: string;
  styles: ResumeStyles;
}

interface PageRendererProps {
  page: { content: string; pageNumber: number };
  index: number;
  totalPages: number;
  scopeClass: string;
  isLastPage: boolean;
  styles: ResumeStyles;
}

// Constants
const PAGE_BREAK_CLASS = "page-break";
const SYSTEM_FONTS = ["Georgia", "Times+New+Roman", "Arial"];
const INITIAL_SCALE = 0.8;
const SCALE_LIMITS = { min: 0.3, max: 1.5 };
const SCALE_FACTOR = 1.1;
const PAPER_WIDTH = 210; // mm
const PAPER_HEIGHT = 297; // mm
const CONTAINER_MIN_WIDTH = 900;

// Helper functions
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
  return pages.map((page) => page.content).join("\n");
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

    // Create new style element
    const styleElement = document.createElement("style");
    styleElement.id = styleId;
    styleElement.textContent = scopedCSS;
    document.head.appendChild(styleElement);

    // Store reference for cleanup
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

function usePrintCSSInjection(marginV: number, marginH: number): void {
  useEffect(() => {
    const styleId = "resume-print-styles";

    // Remove existing print style element
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create and inject print style element with correct margins
    const printStyle = document.createElement("style");
    printStyle.id = styleId;
    printStyle.textContent = generatePrintCSS(marginV, marginH);
    document.head.appendChild(printStyle);

    // Cleanup function
    return () => {
      const styleElement = document.getElementById(styleId);
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [marginV, marginH]);
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
    const processContent = async () => {
      setIsLoading(true);
      try {
        // Load font first
        await loadFont(fontFamily);

        // Render markdown
        const html = await renderMarkdown(markdown);
        setRenderedHtml(html);

        // Small delay to ensure DOM is updated before recalculating pages
        setTimeout(() => {
          recalculatePages();
          setIsLoading(false);
        }, 100);
      } catch (error) {
        console.error("Error processing content:", error);
        setIsLoading(false);
      }
    };

    processContent();
  }, [
    markdown,
    fontFamily,
    loadFont,
    renderMarkdown,
    setRenderedHtml,
    setIsLoading,
    recalculatePages,
    scopeClass,
    resumeStyles.fontSize,
    resumeStyles.lineHeight,
    resumeStyles.marginV,
    resumeStyles.marginH,
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
    containerRef,
    getResumeContentForPrint,
    getScopedSelector,
    customProperties,
  ]);
}

// Generate print CSS with proper margins
const generatePrintCSS = (marginV: number, marginH: number) => `
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
      height: ${PAPER_HEIGHT}mm !important;
      margin: 0 !important;
      box-sizing: border-box !important;
      page-break-after: always !important;
      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      transform: none !important;
      overflow: hidden !important;
      padding: ${marginV}px ${marginH}px !important;

      /* Font rendering consistency */
      font-size: inherit !important;
      line-height: inherit !important;
      font-family: inherit !important;

      /* Text rendering optimization */
      text-rendering: optimizeLegibility !important;
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
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

    /* Force A4 page size */
    @page {
      size: A4;
      margin: 0;
    }

    @page :first {
      size: A4;
      margin: 0;
    }

    @page :left {
      size: A4;
      margin: 0;
    }

    @page :right {
      size: A4;
      margin: 0;
    }
  }
`;

// Component functions
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
        className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
        title="Zoom In"
      >
        +
      </button>
      <button
        onClick={zoomOut}
        className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
        title="Zoom Out"
      >
        -
      </button>
      <button
        onClick={resetZoom}
        className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
        title="Reset Zoom"
      >
        Reset
      </button>
      <span className="text-sm text-gray-600">
        {Math.round(scale * 100)}% | {totalPages} page
        {totalPages !== 1 ? "s" : ""}
      </span>
    </div>
  );
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
    <div className="flex-1 overflow-auto bg-gray-100 p-4 print:p-0 print:bg-white">
      <div className="flex justify-center min-h-full">
        <div className="w-full max-w-4xl">
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
      </div>
    </div>
  );
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
        minWidth: `${CONTAINER_MIN_WIDTH}px`,
        flexShrink: 0,
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
          overflow: "hidden",
          position: "relative",
        }}
      />
    </div>
  );
}

// Main component
const ResumePreview = forwardRef<ResumePreviewRef, ResumePreviewProps>(
  ({ markdown, styles, customCss }, ref) => {
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
      return marked(content);
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

    // Print method for creating a new window with just the resume content
    const handlePrintPreview = useCallback(() => {
      // Create a new window for printing
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      // Get the print-ready content
      const printContent = getResumeContentForPrint();
      const printCSS = generatePrintCSS(
        styles.marginV || 20,
        styles.marginH || 20,
      );

      // Write the content to the new window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Resume - ${document.title}</title>
            <style>${scopedCSS}</style>
            <style>${printCSS}</style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, [getResumeContentForPrint, scopedCSS, styles.marginV, styles.marginH]);

    // Expose print function to parent components via ref
    useImperativeHandle(ref, () => ({
      print: handlePrintPreview,
    }));

    // Inject scoped CSS into document head
    useScopedCSSInjection(scopedCSS, scopeClass, styleElementRef);

    // Inject print CSS for fixed dimensions with correct margins
    usePrintCSSInjection(styles.marginV || 20, styles.marginH || 20);

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
  },
);

ResumePreview.displayName = "ResumePreview";

export default ResumePreview;
