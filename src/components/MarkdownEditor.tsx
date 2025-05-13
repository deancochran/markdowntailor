"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import React, { useEffect, useRef, useState } from "react";
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

interface MarkdownEditorProps {
  initialMarkdown?: string;
  initialCss?: string;
  filename?: string;
}

const EnhancedMarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialMarkdown = "",
  initialCss = defaultCssTemplate,
  filename = "resume",
}) => {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [css, setCss] = useState(initialCss);
  const [activeTab, setActiveTab] = useState<string>("markdown");
  const [isSaving, setIsSaving] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0.5);

  // Use iframe ref to completely isolate preview content
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Fetch markdown content
        const mdResponse = await fetch(`/api/resumes/${filename}`);
        if (mdResponse.ok) {
          const mdData = await mdResponse.text();
          setMarkdown(mdData);
        } else {
          toast.error("Failed to load resume content");
        }

        // Fetch CSS content if it exists
        try {
          const cssResponse = await fetch(`/api/resumes/${filename}.css`);
          if (cssResponse.ok) {
            const cssData = await cssResponse.text();
            setCss(cssData);
          }
        } catch {
          // If CSS doesn't exist yet, use default template
          console.log("No existing CSS found, using default template");
        }
      } catch (error) {
        console.error("Error fetching content:", error);
        toast.error("Error loading resume");
      }
    };

    if (!initialMarkdown && filename) {
      fetchContent();
    }
  }, [initialMarkdown, initialCss, filename]);

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save markdown
      const mdResponse = await fetch(`/api/resumes/${filename}`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: markdown,
      });

      // Save CSS
      const cssResponse = await fetch(`/api/resumes/${filename}.css`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: css,
      });

      if (mdResponse.ok && cssResponse.ok) {
        toast.success("Resume and styles saved successfully!");
      } else {
        toast.error("Error saving content");
      }
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Error saving content");
    } finally {
      setIsSaving(false);
    }
  };

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
      const htmlContent = generateHTMLContent();
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.html`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

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
            // // Add print-specific styles
            // const style = iframe.contentWindow.document.createElement("style");
            // style.textContent = `
            //   @media print {
            //     body {
            //       margin: 0;
            //       padding: 0;
            //     }
            //     .page {
            //       width: 210mm;
            //       min-height: 297mm;
            //       padding: 20mm;
            //       margin: 0;
            //       box-shadow: none;
            //     }
            //   }
            // `;
            // iframe.contentWindow.document.head.appendChild(style);

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
                  // Add print-specific styles to the new window too
                  // const style = printWindow.document.createElement("style");
                  // style.textContent = `
                  //   @media print {
                  //     body {
                  //       margin: 0;
                  //       padding: 0;
                  //     }
                  //     .page {
                  //       width: 210mm;
                  //       min-height: 297mm;
                  //       padding: 20mm;
                  //       margin: 0;
                  //       box-shadow: none;
                  //     }
                  //   }
                  // `;
                  // printWindow.document.head.appendChild(style);
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
    <div className="flex flex-1 flex-col ">
      <div className="border-b">
        <div className="container flex h-14 items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Link href="/resumes">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to Resumes</span>
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">{filename}</h1>
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

      {/* FIX 2 & 3: Make the layout consistent and fix the height issues */}
      <div className="grid grid-cols-2 flex-1 overflow-auto">
        {/* Make both editor and preview equal width */}
        <div className="flex flex-col h-full border-r ">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col h-full"
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
              className="flex-1 h-full p-0 m-0 "
              style={{
                display: activeTab === "markdown" ? "block" : "none",
                height: "100%",
              }}
            >
              <div className="h-full w-full">
                <MonacoEditor
                  height="100%"
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
              </div>
            </TabsContent>

            <TabsContent
              value="css"
              className="flex-1 h-full p-0 m-0 "
              style={{
                display: activeTab === "css" ? "block" : "none",
                height: "100%",
              }}
            >
              <div className="h-full w-full">
                <MonacoEditor
                  height="100%"
                  language="css"
                  value={css}
                  onChange={(value) => setCss(value || "")}
                  options={monacoOptions}
                  theme="light"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex flex-col h-full">
          {/* Preview controls */}
          <div className="flex items-center justify-between border-b p-2">
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
          <div className="flex-1 overflow-auto bg-gray-100 flex justify-center p-4">
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
                className="border-none"
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
};

// Default CSS template to get users started
const defaultCssTemplate = `/* Resume styling */
  /* Resume styling */
  /* Resume styling */
  body {
    background-color: white;
    font-family: Arial, sans-serif;
    box-sizing: border-box;
    width: 210mm;
    min-height: 297mm;
    padding: 10mm;
    margin: 0 auto;
    line-height: 1.6;
  }

  /* Headings */
  h1 {
    font-size: 24px;
    margin-bottom: 4px;
    font-weight: bold;
    color: black;
  }

  h2 {
    font-size: 18px;
    border-bottom: 1px solid #000;
    padding-top: 8px;
    margin-bottom: 4px;
    font-weight: bold;
    color: black;
  }

  h3 {
    margin-bottom: 4px;
    font-size: 16px;
    font-weight: bold;
    color: black;
  }

    h4 {
    padding-top: 8px;
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: bold;
    color: black;
  }

  /* Links */
  a {
    color: blue;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  /* text */
  p {
    font-size: small;
  }

  /* Lists */
  ul {
    padding-left: 13px;

  }

  li {
    font-size:small;
  }

  strong {
    font-weight: bold;
  }

  em {
    font-style: italic;
  }

  /* Custom */
  .section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 8px;
    margin-bottom: 4px;

  }

  .section-content {
    display: flex;
    align-items:  center;
    gap: 4px;
  }


`;

export default EnhancedMarkdownEditor;
