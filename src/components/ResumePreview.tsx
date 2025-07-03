import { ResumeStyles } from "@/lib/utils/styles";
import { marked } from "marked";
import { useCallback, useEffect, useRef, useState } from "react";

interface ResumePreviewProps {
  markdown: string;
  styles: ResumeStyles;
  customCss?: string; // Add this to accept custom CSS
}
// A4 paper size in pixels at 96 DPI
const A4_SIZE = { width: 794, height: 1123 };

export default function ResumePreview({
  markdown,
  styles,
  customCss,
}: ResumePreviewProps) {
  const [renderedHtml, setRenderedHtml] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(0.8); // Default scale for preview
  const containerRef = useRef<HTMLDivElement>(null);

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
  const renderMarkdown = useCallback((content: string) => {
    if (!content.trim()) return "";

    return marked(content, {
      gfm: true,
      breaks: true,
    });
  }, []);

  // Generate scoped CSS that will be injected into the HTML
  const generateScopedCSS = useCallback(() => {
    const fontFamily = styles.fontFamily.replace(/\+/g, " ");

    return `
      <style>
        /* Custom CSS - Applied first as a base */
        ${customCss || ""}

        /* Reset and base styles for the resume content */
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: "${fontFamily}", -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: ${styles.fontSize}px;
          line-height: ${styles.lineHeight};
          color: #333;
          background: white;
        }

        /* Typography styles */
        h1, h2, h3, h4, h5, h6 {
          margin: 0.5em 0;
          font-weight: 600;
        }

        p {
          margin: 0.5em 0;
        }

        ul, ol {
          margin: 0.5em 0;
          padding-left: 1.5em;
        }

        li {
          margin: 0.25em 0;
        }

        a {
          color: #0066cc;
          text-decoration: none;
        }

        a:hover {
          text-decoration: underline;
        }

        strong, b {
          font-weight: 600;
        }

        em, i {
          font-style: italic;
        }

        code {
          background: #f5f5f5;
          padding: 0.1em 0.3em;
          border-radius: 3px;
          font-family: monospace;
        }

        pre {
          background: #f5f5f5;
          padding: 1em;
          border-radius: 5px;
          overflow-x: auto;
        }

        blockquote {
          border-left: 4px solid #ddd;
          margin: 1em 0;
          padding-left: 1em;
          color: #666;
        }

        hr {
          border: none;
          border-top: 1px solid #ddd;
          margin: 1.5em 0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin: 1em 0;
        }

        th, td {
          padding: 0.5em;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }

        th {
          font-weight: 600;
          background: #f9f9f9;
        }
      </style>
    `;
  }, [styles, customCss]);

  // Render effect
  useEffect(() => {
    const renderResume = async () => {
      setIsLoading(true);

      try {
        // Load font first
        await loadFont(styles.fontFamily);

        // Render markdown
        const markdownHtml = await renderMarkdown(markdown);

        // Combine the scoped CSS with the rendered markdown
        const scopedCSS = generateScopedCSS();
        const completeHtml = scopedCSS + markdownHtml;

        setRenderedHtml(completeHtml);

        // Wait a bit for fonts to be ready
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
    styles.fontFamily,
    loadFont,
    renderMarkdown,
    generateScopedCSS,
  ]);

  // Remove the global CSS injection effect since we're now using scoped CSS
  // useEffect(() => {
  //   const styleId = "resume-preview-styles";
  //   const dynamicCSS = generateDynamicCSS();
  //   // ... removed
  // }, [generateDynamicCSS]);

  // Zoom controls
  const zoomIn = () => setScale((prev) => Math.min(prev * 1.1, 1.5));
  const zoomOut = () => setScale((prev) => Math.max(prev / 1.1, 0.3));
  const resetZoom = () => setScale(0.8);

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center gap-2 p-2 border-b bg-white print:hidden">
        <button
          onClick={zoomIn}
          className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
        >
          Zoom In
        </button>
        <button
          onClick={zoomOut}
          className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
        >
          Zoom Out
        </button>
        <button
          onClick={resetZoom}
          className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
        >
          Reset
        </button>
        <div className="ml-2 text-sm text-gray-600">
          {Math.round(scale * 100)}%
        </div>
      </div>

      {/* Preview */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-gray-100 p-4 flex justify-center"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div>Loading preview...</div>
          </div>
        ) : (
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top center",
              transition: "transform 0.2s ease-out",
            }}
          >
            <div
              className="resume-page"
              style={{
                width: `${A4_SIZE.width}px`,
                minHeight: `${A4_SIZE.height}px`,
                margin: "0 auto",
                background: "white",
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                padding: `${styles.marginV}px ${styles.marginH}px`,
                boxSizing: "border-box",
                position: "relative",
              }}
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
