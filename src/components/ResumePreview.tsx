import { useSmartPages } from "@/hooks/useSmartPages";
import { ResumeStyles } from "@/lib/utils/styles";
import { DynamicCssService } from "@/services/dynamic-css";
import { GoogleFontsService } from "@/services/google-fonts";
import { MarkdownService } from "@/services/markdown";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

// Add custom properties to HTMLDivElement type
declare global {
  interface HTMLDivElement {
    getContentForPrint?: (content: string) => string;
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
const INITIAL_SCALE = 0.8;
const SCALE_LIMITS = { min: 0.3, max: 1.5 };
const SCALE_FACTOR = 1.1;
const CONTAINER_MIN_WIDTH = 900;

// Services
const googleFontsService = new GoogleFontsService();
const markdownService = new MarkdownService();

// Custom hooks
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

function useDynamicCss(
  styles: ResumeStyles,
  customCss: string = "",
): DynamicCssService {
  const cssService = useMemo(
    () => new DynamicCssService(styles, customCss),
    [styles, customCss],
  );

  useEffect(() => {
    cssService.inject();
    return () => {
      cssService.dispose();
    };
  }, [cssService]);

  return cssService;
}

function useResumeRendering(
  markdown: string,
  styles: ResumeStyles,
  setRenderedHtml: (html: string) => void,
  setIsLoading: (loading: boolean) => void,
): void {
  useEffect(() => {
    const processContent = async () => {
      setIsLoading(true);
      try {
        await googleFontsService.loadFont(styles.fontFamily);
        const { content: html } = markdownService.parse(markdown);
        setRenderedHtml(html);
      } catch (error) {
        console.error("Error processing content:", error);
      } finally {
        // The `useSmartPages` hook will now take over the loading state
        // via its `isCalculating` flag. We just need to stop this initial loading.
        setIsLoading(false);
      }
    };

    processContent();
  }, [
    markdown,
    styles.fontFamily,
    styles.fontSize,
    styles.lineHeight,
    styles.marginV,
    styles.marginH,
    styles.paperSize,
    setRenderedHtml,
    setIsLoading,
  ]);
}

function useParentComponentAPI(
  containerRef: React.RefObject<HTMLDivElement | null>,
  cssService: DynamicCssService,
): void {
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.getContentForPrint = (content: string) =>
        cssService.getContentForPrint(content);
      containerRef.current.getScopedSelector = (selector: string) =>
        cssService.getScopedSelector(selector);
      containerRef.current.customProperties = cssService.customProperties;
    }
  }, [containerRef, cssService]);
}

// Helper functions
function createCombinedPageContent(
  pages: Array<{ content: string; pageNumber: number }>,
): string {
  return pages
    .map(
      (page) =>
        `<div data-part="page" data-page-number="${page.pageNumber}" data-total-pages="${pages.length}">${page.content}</div>`,
    )
    .join("\n");
}

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
            <LoadingSpinner isLoading={isLoading || isCalculating} />
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
      <div className="absolute -top-6 left-0 text-xs text-gray-500 print:hidden page-indicator">
        Page {page.pageNumber} of {totalPages}
      </div>
      <div
        className={`${scopeClass} bg-white shadow-lg print:shadow-none text-black`}
        dangerouslySetInnerHTML={{ __html: page.content }}
        role="document"
        aria-label={`Resume page ${page.pageNumber}`}
        data-part="page"
        data-page-number={page.pageNumber}
        data-total-pages={totalPages}
        style={{
          boxSizing: "border-box",
          width: "var(--resume-paper-width)",
          minHeight: "var(--resume-paper-height)",
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
  ({ markdown, styles, customCss = "" }, ref) => {
    const [renderedHtml, setRenderedHtml] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [scale, setScale] = useState(INITIAL_SCALE);
    const containerRef = useRef<HTMLDivElement>(null);

    const cssService = useDynamicCss(styles, customCss);

    const { pages, totalPages, isCalculating, recalculatePages } =
      useSmartPages({
        content: renderedHtml,
        styles,
        scopeClass: cssService.scopeClass,
      });

    const zoomControls = useZoomControls(scale, setScale);

    const getResumeContentForPrint = useCallback(() => {
      if (pages.length === 0) {
        return cssService.getContentForPrint(renderedHtml);
      }
      const combinedContent = createCombinedPageContent(pages);
      return cssService.getContentForPrint(combinedContent);
    }, [cssService, renderedHtml, pages]);

    const handlePrintPreview = useCallback(() => {
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      const printContent = getResumeContentForPrint();

      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, [getResumeContentForPrint]);

    useImperativeHandle(ref, () => ({
      print: handlePrintPreview,
    }));

    useResumeRendering(markdown, styles, setRenderedHtml, setIsLoading);

    useParentComponentAPI(containerRef, cssService);

    useEffect(() => {
      if (containerRef.current) {
        containerRef.current.addPageBreak = () => {
          const pageBreak = document.createElement("div");
          pageBreak.className = PAGE_BREAK_CLASS;
          pageBreak.style.height = "0";
          pageBreak.style.width = "100%";

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
          scopeClass={cssService.scopeClass}
          styles={styles}
        />
      </div>
    );
  },
);

ResumePreview.displayName = "ResumePreview";

export default ResumePreview;
