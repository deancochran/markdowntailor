import { useServerPDFGeneration } from "@/hooks/useServerPDFGeneration";
import { Loader2 } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
interface ServerPDFPreviewProps {
  resumeId: string;
  previewTab: string;
  isSaving: boolean;
  hasUnsavedChanges?: boolean;
  onPageCountChange?: (pageCount: number) => void;
  updatedAt?: Date; // Use updatedAt from the resume object instead of saveTimestamp
}

export const ServerPDFPreview: React.FC<ServerPDFPreviewProps> = ({
  resumeId,
  previewTab,
  hasUnsavedChanges = false,
  isSaving = false,
  onPageCountChange,
  updatedAt,
}) => {
  const [pdfDataUrl, setPdfDataUrl] = useState<string>("");
  const [hasInitiallyGenerated, setHasInitiallyGenerated] = useState(false);
  const { generatePDFPreview, createPDFDataURL, isGenerating, error } =
    useServerPDFGeneration();

  const abortControllerRef = useRef<AbortController | null>(null);
  const isPreviewActive = previewTab === "preview";
  const hasExistingPDF = Boolean(pdfDataUrl);
  const lastUpdatedAtRef = useRef<Date | undefined>(updatedAt);
  // Extract PDF generation to a separate function
  const generatePDF = useCallback(async () => {
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
        setHasInitiallyGenerated(true);
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        console.error("Server PDF generation error:", err);
        onPageCountChange?.(0);
        setHasInitiallyGenerated(true);
      }
    }
  }, [resumeId, generatePDFPreview, createPDFDataURL, onPageCountChange]);

  // Combined PDF generation effect
  useEffect(() => {
    const shouldGenerate =
      isPreviewActive &&
      !isGenerating &&
      resumeId &&
      !hasUnsavedChanges &&
      !isSaving;

    if (!shouldGenerate) return;

    // Check if this is initial generation
    if (!hasInitiallyGenerated) {
      console.log("Initial PDF generation");
      generatePDF();
      return;
    }

    // Check if updatedAt has changed (for regeneration)
    if (
      updatedAt &&
      (!lastUpdatedAtRef.current ||
        updatedAt.getTime() !== lastUpdatedAtRef.current.getTime())
    ) {
      lastUpdatedAtRef.current = updatedAt;
      console.log("Regenerating PDF due to save event");
      generatePDF();
    }
  }, [
    isPreviewActive,
    hasInitiallyGenerated,
    isGenerating,
    resumeId,
    hasUnsavedChanges,
    isSaving,
    updatedAt,
    generatePDF,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  if (hasUnsavedChanges) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-5 text-center">
        <div className="text-base font-medium">Unsaved Changes</div>
        <div className="text-sm text-muted-foreground max-w-md">
          Please save your changes to update the PDF preview.
        </div>
      </div>
    );
  }

  // Initial loading state (no existing PDF)
  if (isGenerating && !hasExistingPDF) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-5 text-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <div className="font-medium">Generating PDF...</div>
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
        <div className="absolute inset-0  backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3 bg-card p-6 rounded-lg shadow-lg border">
            <Loader2 className="h-6 w-6 animate-spin" />
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
