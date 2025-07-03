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
  }
}

interface ResumePreviewProps {
  markdown: string;
  styles: ResumeStyles;
  customCss?: string;
}

const SYSTEM_FONTS = ["Georgia", "Times+New+Roman", "Arial"];
const INITIAL_SCALE = 0.8;
const SCALE_LIMITS = { min: 0.3, max: 1.5 };
const SCALE_FACTOR = 1.1;

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

    return marked(content, {
      gfm: true,
      breaks: true,
      async: false,
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

  // Handle font loading and markdown rendering
  useResumeRendering(
    markdown,
    styles.fontFamily,
    loadFont,
    renderMarkdown,
    setRenderedHtml,
    setIsLoading,
  );

  // Expose print function to parent components
  useParentComponentAPI(
    containerRef,
    getResumeContentForPrint,
    getScopedSelector,
    customProperties,
  );

  // Trigger page recalculation when content changes
  usePageRecalculation(renderedHtml, isLoading, recalculatePages);

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

function useZoomControls(scale: number, setScale: (scale: number) => void) {
  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev * SCALE_FACTOR, SCALE_LIMITS.max));
  }, [setScale]);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev / SCALE_FACTOR, SCALE_LIMITS.min));
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
      const pageContent = `<div class="print-page">${page.content}</div>`;
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

function useResumeRendering(
  markdown: string,
  fontFamily: string,
  loadFont: (fontFamily: string) => Promise<void>,
  renderMarkdown: (content: string) => Promise<string>,
  setRenderedHtml: (html: string) => void,
  setIsLoading: (loading: boolean) => void,
): void {
  useEffect(() => {
    const renderResume = async () => {
      setIsLoading(true);

      try {
        await loadFont(fontFamily);
        const html = await renderMarkdown(markdown);
        setRenderedHtml(html);

        if (document.fonts) {
          await document.fonts.ready;
        }
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
  ]);
}

function useParentComponentAPI(
  containerRef: React.RefObject<HTMLDivElement>,
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
  }, [getResumeContentForPrint, getScopedSelector, customProperties, containerRef]);
}

function usePageRecalculation(
  renderedHtml: string,
  isLoading: boolean,
  recalculatePages: () => void,
): void {
  useEffect(() => {
    if (renderedHtml && !isLoading) {
      recalculatePages();
    }
  }, [renderedHtml, isLoading, recalculatePages]);
}

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
}

function PreviewContainer({
  isLoading,
  isCalculating,
  scale,
  pages,
  totalPages,
  scopeClass,
}: PreviewContainerProps) {
  return (
    <div
      className="flex-1 overflow-auto print:overflow-visible bg-gray-100 p-4 flex justify-center items-start"
      style={{ backgroundColor: "#f1f5f9" }}
    >
      {isLoading || isCalculating ? (
        <LoadingSpinner isLoading={isLoading} />
      ) : (
        <PagesContainer
          scale={scale}
          pages={pages}
          totalPages={totalPages}
          scopeClass={scopeClass}
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
}

function PagesContainer({
  scale,
  pages,
  totalPages,
  scopeClass,
}: PagesContainerProps) {
  return (
    <div
      className="flex flex-col gap-4"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "top center",
        transition: "transform 0.2s ease-out",
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
}

function PageRenderer({
  page,
  index,
  totalPages,
  scopeClass,
  isLastPage,
}: PageRendererProps) {
  return (
    <div
      className="relative"
      style={{
        marginBottom: isLastPage ? 0 : "20px",
      }}
    >
      {/* Page number indicator */}
      <div className="absolute -top-6 left-0 text-xs text-gray-500 print:hidden">
        Page {page.pageNumber} of {totalPages}
      </div>

      {/* Page content */}
      <div
        className={scopeClass}
        dangerouslySetInnerHTML={{ __html: page.content }}
        role="document"
        aria-label={`Resume page ${page.pageNumber}`}
        style={{
          boxSizing: "border-box",
          width: "100%",
        }}
      />
    </div>
  );
}
