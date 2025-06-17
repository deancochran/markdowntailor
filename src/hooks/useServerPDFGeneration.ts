import { useCallback, useState } from "react";

export interface PDFGenerationOptions {
  format?: "A4" | "Letter";
  margin?: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
}

export interface ServerPDFResult {
  pdfDataUrl?: string;
  pageCount: number;
  pdfBlob?: Blob;
}

export function useServerPDFGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>("");

  const generatePDFPreview = useCallback(
    async (
      markdown: string,
      css: string,
      options?: PDFGenerationOptions,
    ): Promise<ServerPDFResult> => {
      setIsGenerating(true);
      setError(""); // Clear any previous errors when starting new generation

      try {
        const response = await fetch("/api/pdf", {
          method: "PUT", // Use PUT for preview (returns data URL)
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            markdown,
            css,
            options,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to generate PDF preview");
        }

        const result = await response.json();
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsGenerating(false);
      }
    },
    [],
  );

  const downloadPDF = useCallback(
    async (
      markdown: string,
      css: string,
      filename: string,
      options?: PDFGenerationOptions,
    ): Promise<void> => {
      setIsGenerating(true);
      setError(""); // Clear any previous errors when starting new generation

      try {
        const response = await fetch("/api/pdf", {
          method: "POST", // Use POST for download (returns PDF buffer)
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            markdown,
            css,
            options,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to generate PDF");
        }

        // Create blob from response
        const pdfBlob = await response.blob();

        // Create download link
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsGenerating(false);
      }
    },
    [],
  );

  return {
    generatePDFPreview,
    downloadPDF,
    isGenerating,
    error,
  };
}
