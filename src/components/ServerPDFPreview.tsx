import { Button } from "@/components/ui/button";
import { useActivityTracker } from "@/hooks/user-activity-tracker";
import { useServerPDFGeneration } from "@/hooks/useServerPDFGeneration";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface ServerPDFPreviewProps {
  sanitizedMarkdown: string;
  sanitizedCSS: string;
  previewTab: string;
  onPageCountChange?: (pageCount: number) => void;
}

export const ServerPDFPreview: React.FC<ServerPDFPreviewProps> = ({
  sanitizedMarkdown,
  sanitizedCSS,
  previewTab,
  onPageCountChange,
}) => {
  const [pdfDataUrl, setPdfDataUrl] = useState<string>("");
  const [hasInitiallyGenerated, setHasInitiallyGenerated] = useState(false);
  const { generatePDFPreview, isGenerating, error } = useServerPDFGeneration();

  // Use activity tracker for auto-generation
  const { shouldGenerate, resetGeneration } = useActivityTracker(
    sanitizedMarkdown + sanitizedCSS,
    2000,
  );

  const abortControllerRef = useRef<AbortController | null>(null);
  const isPreviewActive = previewTab === "preview";
  const hasExistingPDF = Boolean(pdfDataUrl);

  // Combined generation function that handles both initial and subsequent generation
  useEffect(() => {
    const shouldGenerateInitial =
      isPreviewActive &&
      !isGenerating &&
      !hasInitiallyGenerated &&
      sanitizedMarkdown.trim();

    const shouldGenerateUpdate =
      shouldGenerate &&
      isPreviewActive &&
      !isGenerating &&
      hasInitiallyGenerated;

    if (!shouldGenerateInitial && !shouldGenerateUpdate) {
      return;
    }

    const generatePDF = async () => {
      // Cancel any existing generation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        if (controller.signal.aborted) {
          return;
        }

        const result = await generatePDFPreview(
          sanitizedMarkdown,
          sanitizedCSS,
        );

        if (!controller.signal.aborted) {
          setPdfDataUrl(result.pdfDataUrl || "");
          onPageCountChange?.(result.pageCount);
          resetGeneration();
          setHasInitiallyGenerated(true);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Server PDF generation error:", err);
          onPageCountChange?.(0);
          resetGeneration();
          setHasInitiallyGenerated(true);
        }
      }
    };

    generatePDF();
  }, [
    isPreviewActive,
    isGenerating,
    hasInitiallyGenerated,
    sanitizedMarkdown,
    sanitizedCSS,
    shouldGenerate,
    generatePDFPreview,
    onPageCountChange,
    resetGeneration,
  ]);

  // Manual retry function for error state
  const retryGeneration = useCallback(async () => {
    if (isGenerating) return;

    // Cancel any existing generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      if (controller.signal.aborted) {
        return;
      }

      const result = await generatePDFPreview(sanitizedMarkdown, sanitizedCSS);

      if (!controller.signal.aborted) {
        setPdfDataUrl(result.pdfDataUrl || "");
        onPageCountChange?.(result.pageCount);
        resetGeneration();
        setHasInitiallyGenerated(true);
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        console.error("Server PDF generation error:", err);
        onPageCountChange?.(0);
        resetGeneration();
        setHasInitiallyGenerated(true);
      }
    }
  }, [
    sanitizedMarkdown,
    sanitizedCSS,
    generatePDFPreview,
    onPageCountChange,
    resetGeneration,
    isGenerating,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Initial loading state (no existing PDF)
  if (isGenerating && !hasExistingPDF) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-5 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <div className="font-medium">Generating PDF on server...</div>
        <div className="text-sm text-muted-foreground">
          High-quality server-side rendering with Playwright
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-5 text-center">
        <div className="text-destructive text-base font-medium">
          PDF Generation Failed
        </div>
        <div className="text-sm text-muted-foreground">{error}</div>
        <Button
          onClick={retryGeneration}
          variant="outline"
          disabled={isGenerating}
        >
          Retry Generation
        </Button>
      </div>
    );
  }

  // Empty state
  if (!pdfDataUrl && !sanitizedMarkdown.trim()) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-5 text-center">
        <div className="font-medium">Start editing to see your PDF preview</div>
        <div className="text-sm text-muted-foreground">
          Server-side generation with Playwright for high-quality PDFs
        </div>
      </div>
    );
  }

  // PDF preview with optional overlay loading
  return (
    <div className="h-full flex flex-col relative">
      {/* Loading overlay when regenerating existing PDF */}
      {isGenerating && hasExistingPDF && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3 bg-card p-6 rounded-lg shadow-lg border">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <div className="text-sm font-medium">Updating preview...</div>
          </div>
        </div>
      )}

      {/* PDF iframe */}
      <div className="flex-1">
        {pdfDataUrl ? (
          <iframe
            title="Resume PDF Preview"
            src={pdfDataUrl}
            className="w-full h-full border-none"
            onError={() => {
              console.error("Failed to load PDF preview");
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            PDF will appear here once generated
          </div>
        )}
      </div>
    </div>
  );
};
