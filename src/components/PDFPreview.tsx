import {
  cleanupPDFGenerator,
  generatePDFContent,
} from "@/lib/utils/pdfGenerator";
import React, { useCallback, useEffect, useRef, useState } from "react";

// Activity-based debouncing configuration
const ACTIVITY_TIMEOUT = 1200; // User considered inactive after 1.2 seconds
const GENERATION_DELAY = 300; // Small delay after user becomes inactive
// Removed MIN_CHANGE_THRESHOLD - any change will trigger activity

// Activity tracker hook
const useActivityTracker = (content: string, isActive: boolean) => {
  const [isUserActive, setIsUserActive] = useState(false);
  const [shouldGenerate, setShouldGenerate] = useState(false);
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const generationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef<string>("");
  const lastChangeTimeRef = useRef<number>(0);

  // Track user activity based on content changes
  useEffect(() => {
    if (!isActive) {
      // Reset everything when not in preview mode
      setIsUserActive(false);
      setShouldGenerate(false);
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
      }
      return;
    }

    const currentTime = Date.now();
    const contentChanged = content !== lastContentRef.current;

    // Any change triggers activity (removed threshold check)
    if (contentChanged) {
      console.log("📝 Content changed, triggering activity");
      lastContentRef.current = content;
      lastChangeTimeRef.current = currentTime;

      // User is now active
      setIsUserActive(true);
      setShouldGenerate(false);

      // Clear existing timeouts
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
      }

      // Set timer to detect when user becomes inactive
      activityTimeoutRef.current = setTimeout(() => {
        console.log("😴 User became inactive");
        setIsUserActive(false);

        // Small delay before triggering generation to ensure user is truly done
        generationTimeoutRef.current = setTimeout(() => {
          console.log("🎯 Setting shouldGenerate to true");
          setShouldGenerate(true);
        }, GENERATION_DELAY);
      }, ACTIVITY_TIMEOUT);
    }
  }, [content, isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
      }
    };
  }, []);

  return {
    isUserActive,
    shouldGenerate,
    resetGeneration: () => setShouldGenerate(false),
  };
};

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

  // Combined content for activity tracking
  const combinedContent = sanitizedMarkdown + sanitizedCSS;
  const isPreviewActive = previewTab === "preview";

  // Use activity tracker
  const { isUserActive, shouldGenerate, resetGeneration } = useActivityTracker(
    combinedContent,
    isPreviewActive,
  );

  // PDF generation function
  const generatePDF = useCallback(async () => {
    console.log("🎯 generatePDF called");

    // Cancel any existing generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this generation
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsGenerating(true);
    setError("");

    try {
      // Check if generation was aborted before starting
      if (controller.signal.aborted) {
        console.log("🚫 Generation aborted before starting");
        return;
      }

      console.log("🚀 Starting PDF generation");
      console.log("📝 Markdown length:", sanitizedMarkdown.length);
      console.log("🎨 CSS length:", sanitizedCSS.length);

      const startTime = performance.now();
      const result = await generatePDFContent(sanitizedMarkdown, sanitizedCSS);
      const endTime = performance.now();

      console.log("✅ PDF generated in", Math.round(endTime - startTime), "ms");
      console.log("📄 Page count:", result.pageCount);

      // Check if generation was aborted before setting result
      if (!controller.signal.aborted) {
        setPdfDataUrl(result.pdfDataUrl);
        onPageCountChange?.(result.pageCount);
      }
    } catch (err) {
      // Only set error if not aborted
      if (!controller.signal.aborted) {
        setError("Failed to generate PDF preview");
        console.error("❌ PDF generation error:", err);
        onPageCountChange?.(0);
      }
    } finally {
      // Only update loading state if not aborted
      if (!controller.signal.aborted) {
        setIsGenerating(false);
      }
      // Reset the generation trigger
      resetGeneration();
    }
  }, [sanitizedMarkdown, sanitizedCSS, onPageCountChange, resetGeneration]);

  // Trigger PDF generation when user becomes inactive
  useEffect(() => {
    console.log("🔄 Effect triggered:", {
      shouldGenerate,
      isPreviewActive,
      isGenerating,
    });
    if (shouldGenerate && isPreviewActive && !isGenerating) {
      console.log("✨ Triggering PDF generation");
      generatePDF();
    }
  }, [shouldGenerate, isPreviewActive, isGenerating, generatePDF]);

  // Cancel generation when switching away from preview tab
  useEffect(() => {
    if (!isPreviewActive) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  }, [isPreviewActive]);

  // Enhanced cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      cleanupPDFGenerator();
    };
  }, []);

  if (!isPreviewActive) {
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
        <div className="text-sm text-gray-500">
          {isUserActive
            ? "Waiting for you to finish editing..."
            : "Processing your changes..."}
        </div>
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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
          gap: "16px",
        }}
      >
        <div>Start editing to see your PDF preview</div>
        {isUserActive && (
          <div className="text-sm text-blue-600 animate-pulse">
            ✏️ Detecting changes...
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* Activity indicator */}
      {isUserActive && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 10,
            backgroundColor: "rgba(59, 130, 246, 0.9)",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          Editing...
        </div>
      )}

      <iframe
        title="Resume PDF Preview"
        src={pdfDataUrl}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        onError={() => {
          setError("Failed to load PDF preview");
        }}
      />
    </div>
  );
};
