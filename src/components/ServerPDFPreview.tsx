import { Button } from "@/components/ui/button";
import { useActivityTracker } from "@/hooks/user-activity-tracker";
import { useServerPDFGeneration } from "@/hooks/useServerPDFGeneration";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface ServerPDFPreviewProps {
  resumeId: string;
  previewTab: string;
  hasUnsavedChanges?: boolean;
  onPageCountChange?: (pageCount: number) => void;
  onSaveRequired?: () => void;
}

export const ServerPDFPreview: React.FC<ServerPDFPreviewProps> = ({
  resumeId,
  previewTab,
  hasUnsavedChanges = false,
  onPageCountChange,
  onSaveRequired,
}) => {
  const [pdfDataUrl, setPdfDataUrl] = useState<string>("");
  const [hasInitiallyGenerated, setHasInitiallyGenerated] = useState(false);
  const { generatePDFPreview, createPDFDataURL, isGenerating, error } =
    useServerPDFGeneration();

  // Use activity tracker based on resume changes
  const { shouldGenerate, resetGeneration } = useActivityTracker(
    resumeId,
    2000, // Shorter delay since we're tracking resume changes
  );

  const abortControllerRef = useRef<AbortController | null>(null);
  const isPreviewActive = previewTab === "preview";
  const hasExistingPDF = Boolean(pdfDataUrl);

  // Combined generation function that handles both initial and subsequent generation
  useEffect(() => {
    if (!isPreviewActive || isGenerating || !resumeId) {
      return;
    }

    // Don't generate if there are unsaved changes
    if (hasUnsavedChanges) {
      return;
    }

    // Determine if we should generate
    const shouldGenerateInitial = !hasInitiallyGenerated;
    const shouldGenerateUpdate = shouldGenerate && hasInitiallyGenerated;

    if (!shouldGenerateInitial && !shouldGenerateUpdate) {
      return;
    }

    // Generate new PDF
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

        const result = await generatePDFPreview({
          resumeId,
        });

        if (!controller.signal.aborted) {
          const dataUrl = createPDFDataURL(result.pdfBase64);
          setPdfDataUrl(dataUrl);
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
    resumeId,
    hasUnsavedChanges,
    shouldGenerate,
    generatePDFPreview,
    createPDFDataURL,
    onPageCountChange,
    resetGeneration,
  ]);

  // Manual retry function for error state
  const retryGeneration = useCallback(async () => {
    if (isGenerating || hasUnsavedChanges) return;

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

      const result = await generatePDFPreview({
        resumeId,
      });

      if (!controller.signal.aborted) {
        const dataUrl = createPDFDataURL(result.pdfBase64);
        setPdfDataUrl(dataUrl);
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
    resumeId,
    hasUnsavedChanges,
    generatePDFPreview,
    createPDFDataURL,
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

  // Unsaved changes - require save before preview
  if (hasUnsavedChanges) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-5 text-center">
        <div className="text-amber-600 text-base font-medium">
          Save Required for Preview
        </div>
        <div className="text-sm text-muted-foreground max-w-md">
          Please save your resume to generate a PDF preview. This ensures the
          preview matches your saved version and enables efficient caching.
        </div>
        <Button onClick={onSaveRequired} variant="default" className="mt-2">
          Save Resume
        </Button>
      </div>
    );
  }

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
          disabled={isGenerating || hasUnsavedChanges}
        >
          {hasUnsavedChanges ? "Save Required" : "Retry Generation"}
        </Button>
      </div>
    );
  }

  // Empty state - no resume ID
  if (!resumeId) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-5 text-center">
        <div className="font-medium">No resume selected</div>
        <div className="text-sm text-muted-foreground">
          Please select or create a resume to see the PDF preview
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
