import { generatePDFContent } from "@/lib/utils/pdfGenerator";
import React, { useCallback, useEffect, useRef, useState } from "react";

export const PDFPreview: React.FC<{
  sanitizedMarkdown: string;
  sanitizedCSS: string;
  previewTab: string;
  onPageCountChange?: (pageCount: number) => void;
}> = ({ sanitizedMarkdown, sanitizedCSS, previewTab, onPageCountChange }) => {
  const [pdfDataUrl, setPdfDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced PDF generation function
  const generatePDF = useCallback(async () => {
    // Cancel any existing generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Create new abort controller for this generation
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsGenerating(true);
    setError("");

    try {
      // Check if generation was aborted before starting
      if (controller.signal.aborted) {
        return;
      }

      const result = await generatePDFContent(sanitizedMarkdown, sanitizedCSS);

      // Check if generation was aborted before setting result
      if (!controller.signal.aborted) {
        setPdfDataUrl(result.pdfDataUrl);
        // Notify parent component of page count
        onPageCountChange?.(result.pageCount);
      }
    } catch (err) {
      // Only set error if not aborted
      if (!controller.signal.aborted) {
        setError("Failed to generate PDF preview");
        console.error("PDF generation error:", err);
        // Reset page count on error
        onPageCountChange?.(0);
      }
    } finally {
      // Only update loading state if not aborted
      if (!controller.signal.aborted) {
        setIsGenerating(false);
      }
    }
  }, [sanitizedMarkdown, sanitizedCSS, onPageCountChange]);

  useEffect(() => {
    if (previewTab === "preview") {
      // Debounce the PDF generation to avoid excessive regeneration
      timeoutRef.current = setTimeout(generatePDF, 800);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    } else {
      // Cancel generation if switching away from preview tab
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [previewTab, generatePDF]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (previewTab !== "preview") {
    return null;
  }

  if (isGenerating) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
          gap: "16px",
        }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <div>Generating PDF preview...</div>
        <div className="text-sm text-gray-500">This may take a few seconds</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
          gap: "16px",
        }}
      >
        <div style={{ color: "#dc2626", fontSize: "18px" }}>⚠️</div>
        <div style={{ color: "#dc2626" }}>{error}</div>
        <button
          onClick={generatePDF}
          style={{
            padding: "8px 16px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!pdfDataUrl) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <div>No PDF content available</div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <iframe
        title="Resume PDF Preview"
        src={pdfDataUrl}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        onLoad={() => {
          // Optional: Handle iframe load event
        }}
        onError={() => {
          setError("Failed to load PDF preview");
        }}
      />
    </div>
  );
};
