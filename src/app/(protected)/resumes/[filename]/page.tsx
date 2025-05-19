"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { defaultCssTemplate, getSampleResumeContent } from "@/lib/resumeUtils";

import {
  ArrowLeft,
  Download,
  Printer,
  Save,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { toast } from "sonner";

// Use Monaco Editor for both Markdown and CSS with autocomplete and syntax highlighting
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  { ssr: false },
);
export default function EditorPage() {
  // Default CSS template to get users started

  const initialMarkdown = getSampleResumeContent();
  const initialCss = defaultCssTemplate();
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [css, setCss] = useState(initialCss);
  const [activeTab, setActiveTab] = useState<string>("markdown");
  const [isSaving, setIsSaving] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0.5);

  // Use iframe ref to completely isolate preview content
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {}, [initialMarkdown, initialCss]);

  // Update the preview iframe whenever markdown or CSS changes
  useEffect(() => {
    updateIframeContent();
  }, [markdown, css]);

  // Function to update the content of the preview iframe
  const updateIframeContent = () => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;

      if (iframeDoc) {
        // Wait for the rendering to complete
        setTimeout(() => {
          // Extract the HTML content from the container
          const htmlContent = generateHTMLContent();

          iframeDoc.open();
          iframeDoc.write(htmlContent);
          iframeDoc.close();
        }, 0);
      }
    }
  };

  const handleSave = async () => {};

  // Generate HTML content for PDF or download - now used for both preview and print
  const generateHTMLContent = () => {
    // Create a temporary container to properly render the markdown
    const tempContainer = document.createElement("div");
    const root = createRoot(tempContainer);

    flushSync(() => {
      // Render the markdown content to the temporary container
      root.render(
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{markdown}</ReactMarkdown>,
      );
    });

    // Extract the HTML content from the container
    const markdownContent = tempContainer.innerHTML;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            /* Reset all styles to ensure no external influence */
            html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a,
            abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, samp, small,
            strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form,
            label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details,
            embed, figure, figcaption, footer, header, hgroup, menu, nav, output, ruby, section, summary,
            time, mark, audio, video {
              margin: 0;
              padding: 0;
              border: 0;
              font-size: 100%;
              font: inherit;
              vertical-align: baseline;
            }

            /* A4 paper size setup */
            @page {
              size: A4;
              margin: 0;
            }

            /* Now apply the custom CSS */
            ${css}
          </style>
        </head>
        <body>

            ${markdownContent}

        </body>
      </html>
      `;

    return htmlContent;
  };

  // Direct download as HTML file
  const handleDownloadHTML = () => {
    try {
      toast.success("HTML file downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download HTML file");
    }
  };

  const handleGeneratePdf = () => {
    try {
      // Create a hidden iframe for better PDF generation
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.top = "-9999px";
      document.body.appendChild(iframe);

      // Wait for iframe to load before writing to it
      iframe.onload = () => {
        try {
          // Write content to the iframe - must access through contentWindow
          if (iframe.contentWindow) {
            // Write the HTML content to the iframe
            const htmlContent = generateHTMLContent();

            // Use document.write through contentWindow
            iframe.contentWindow.document.documentElement.innerHTML =
              htmlContent;

            // Delay printing slightly to ensure all styles are applied
            setTimeout(() => {
              try {
                // Print the iframe
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();

                toast.success("Print dialog opened successfully");

                // Clean up the iframe after printing dialog is closed
                setTimeout(() => {
                  document.body.removeChild(iframe);
                }, 1000);
              } catch (err) {
                console.error("Print error:", err);
                document.body.removeChild(iframe);
                toast.error("Failed to open print dialog");

                // Fallback: open in new window
                const printWindow = window.open("", "_blank");
                if (printWindow) {
                  printWindow.document.write(htmlContent);

                  printWindow.document.close();
                  printWindow.focus();
                  printWindow.print();
                  printWindow.onafterprint = () => printWindow.close();
                  toast.success("Print dialog opened in new window");
                }
              }
            }, 250);
          }
        } catch (err) {
          console.error("Error writing to iframe:", err);
          document.body.removeChild(iframe);
          toast.error("Failed to generate PDF");
        }
      };

      // Set a basic src to trigger the onload event
      iframe.src = "about:blank";
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  };

  // Zoom functionality
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2.0));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  };

  // Monaco editor options - shared base configuration
  const monacoOptions = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    automaticLayout: true,
    tabSize: 2,
    formatOnPaste: true,
    formatOnType: true,
  };

  return (
    <div className="grid grid-row h-full overflow-hidden">
      <div>
        <div className="w-full flex h-14 items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Link href="/resumes">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to Resumes</span>
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">RESUME TITLE</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              variant="outline"
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>

            <Button
              onClick={handleGeneratePdf}
              variant="outline"
              className="gap-2"
              data-testid="export-pdf-button"
            >
              <Printer className="h-4 w-4" />
              Print PDF
            </Button>

            <Button
              onClick={handleDownloadHTML}
              variant="outline"
              className="gap-2"
              data-testid="download-html-button"
            >
              <Download className="h-4 w-4" />
              Download HTML
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 h-full border">
        <div className="col-span-1 h-full border-r ">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col gap-0 h-full"
          >
            <TabsList className="w-full flex justify-start border-b rounded-none px-4">
              <TabsTrigger value="markdown" className="px-4 py-2">
                Markdown
              </TabsTrigger>
              <TabsTrigger value="css" className="px-4 py-2">
                CSS
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="markdown"
              style={{
                display: activeTab === "markdown" ? "block" : "none",
              }}
            >
              <MonacoEditor
                language="markdown"
                value={markdown}
                onChange={(value) => setMarkdown(value || "")}
                options={{
                  ...monacoOptions,
                  wordWrap: "on",
                  lineNumbers: "on",
                  quickSuggestions: true,
                }}
                theme="light"
              />
            </TabsContent>

            <TabsContent
              value="css"
              style={{
                display: activeTab === "css" ? "block" : "none",
              }}
            >
              <MonacoEditor
                language="css"
                value={css}
                onChange={(value) => setCss(value || "")}
                options={monacoOptions}
                theme="light"
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="col-span-1 h-full">
          {/* Preview controls */}
          <div className="bg-muted text-muted-foreground h-9 items-center w-full flex justify-between border-b rounded-none px-2">
            <div className="text-sm text-muted-foreground">A4 Preview</div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm">{Math.round(zoomLevel * 100)}%</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 2.0}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Preview container with scroll - made to fill available height */}
          <div className="h-full overflow-scroll bg-gray-100 flex items-center justify-center">
            <div
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "top center",
                transition: "transform 0.2s ease",
              }}
            >
              <iframe
                ref={iframeRef}
                title="Resume Preview"
                className="overflow-scroll"
                style={{
                  width: "210mm", // Exact A4 width
                  height: "297mm", // Exact A4 height
                  background: "white",
                  boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
