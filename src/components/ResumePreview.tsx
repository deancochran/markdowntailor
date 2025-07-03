import { useScopedResumeStyles } from "@/hooks/useScopedResumeStyles";
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

export default function ResumePreview({
  markdown,
  styles,
  customCss,
}: ResumePreviewProps) {
  const [renderedHtml, setRenderedHtml] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(0.8);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const styleElementRef = useRef<HTMLStyleElement | null>(null);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);
      // Reset scale on mobile
      if (newIsMobile) {
        setScale(1);
      } else if (scale === 1) {
        setScale(0.8);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [scale]);

  // Generate scoped styles using our custom hook
  const {
    scopeClass,
    scopedCSS,
    customProperties,
    getScopedSelector,
    getContentForPrint,
  } = useScopedResumeStyles({
    styles,
    customCss,
    isPreview: true,
  });

  // Load the selected font
  const loadFont = useCallback(async (fontFamily: string) => {
    if (!fontFamily) return;

    // Skip loading if system font
    if (["Georgia", "Times+New+Roman", "Arial"].includes(fontFamily)) {
      return;
    }

    // Check if font is already loaded
    if (document.querySelector(`link[href*="${fontFamily}"]`)) {
      return;
    }

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

  // Inject scoped CSS into document head
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
  }, [scopedCSS, scopeClass]);

  // Render effect
  useEffect(() => {
    const renderResume = async () => {
      setIsLoading(true);

      try {
        // Load font first
        await loadFont(styles.fontFamily);

        // Render markdown
        const html = await renderMarkdown(markdown);
        setRenderedHtml(html);

        // Wait for fonts to be ready
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
  }, [markdown, styles.fontFamily, loadFont, renderMarkdown]);

  // Zoom controls (hidden on mobile)
  const zoomIn = () => setScale((prev) => Math.min(prev * 1.1, 1.5));
  const zoomOut = () => setScale((prev) => Math.max(prev / 1.1, 0.3));
  const resetZoom = () => setScale(isMobile ? 1 : 0.8);

  // Get content for printing
  const getResumeContentForPrint = useCallback(() => {
    return getContentForPrint(renderedHtml);
  }, [getContentForPrint, renderedHtml]);

  // Expose print function to parent components
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.getContentForPrint = getResumeContentForPrint;
      containerRef.current.getScopedSelector = getScopedSelector;
      containerRef.current.customProperties = customProperties;
    }
  }, [getResumeContentForPrint, getScopedSelector, customProperties]);

  return (
    <div className="flex flex-col h-full" ref={containerRef}>
      {/* Controls - responsive visibility */}
      <div
        className={`flex items-center gap-2 p-2 border-b bg-white print:hidden ${isMobile ? "justify-center" : ""}`}
      >
        {!isMobile && (
          <>
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
          </>
        )}
        {isMobile && <div className="text-sm text-gray-600">Mobile View</div>}
      </div>

      {/* Preview Container */}
      <div
        className={`flex-1 overflow-auto print:overflow-visible ${
          isMobile
            ? "bg-white"
            : "bg-gray-100 p-4 flex justify-center items-start"
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Loading preview...</span>
            </div>
          </div>
        ) : (
          <div
            className={`${isMobile ? "w-full" : "flex-shrink-0"}`}
            style={{
              transform: isMobile ? "none" : `scale(${scale})`,
              transformOrigin: "top center",
              transition: isMobile ? "none" : "transform 0.2s ease-out",
            }}
          >
            {/* Resume Content with Scoped Styles */}
            <div
              className={scopeClass}
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
              role="document"
              aria-label="Resume preview"
              style={{
                // Apply CSS custom properties directly for immediate effect
                ...Object.fromEntries(
                  Object.entries(customProperties).map(([key, value]) => [
                    key,
                    value,
                  ]),
                ),
                boxSizing: "border-box",
                width: "100%",
                margin: "0 auto",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
