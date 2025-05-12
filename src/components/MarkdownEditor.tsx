"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer, Save } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false },
);

const Markdown = dynamic(() => import("react-markdown"), { ssr: false });

interface MarkdownEditorProps {
  initialMarkdown?: string;
  filename?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialMarkdown = "",
  filename = "resume",
}) => {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [isSaving, setIsSaving] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        const response = await fetch(`/api/resumes/${filename}`);
        if (response.ok) {
          const data = await response.text();
          setMarkdown(data);
        } else {
          toast.error("Failed to load resume content");
        }
      } catch (error) {
        console.error("Error fetching markdown:", error);
        toast.error("Error loading resume");
      }
    };

    if (!initialMarkdown && filename) {
      fetchMarkdown();
    }
  }, [initialMarkdown, filename]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/resumes/${filename}`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: markdown,
      });

      if (response.ok) {
        toast.success("Resume saved successfully!");
      } else {
        toast.error("Error saving resume");
      }
    } catch (error) {
      console.error("Error saving markdown:", error);
      toast.error("Error saving resume");
    } finally {
      setIsSaving(false);
    }
  };

  // Generate HTML content for PDF or download
  const generateHTMLContent = () => {
    if (!pdfRef.current) return "";

    const content = pdfRef.current.innerHTML;
    return `
      <!DOCTYPE html>
      <html>
        <body>
          <div>${content}</div>
        </body>
      </html>
    `;
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
    if (pdfRef.current) {
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
              // Accessing document directly instead of using open/write/close methods
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
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b">
        <div className="container flex h-14 items-center justify-between py-4">
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

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 overflow-auto p-4 border-r">
          <div data-color-mode="light" className="h-full">
            <MDEditor
              value={markdown}
              onChange={(value) => setMarkdown(value || "")}
              height="100%"
              preview="edit"
            />
          </div>
        </div>
        <div className="w-1/2 overflow-auto p-4">
          <div
            ref={pdfRef}
            className="resume-container bg-card text-card-foreground shadow-sm rounded-lg p-8 min-h-full"
            id="resume-preview"
          >
            <Markdown>{markdown}</Markdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;
