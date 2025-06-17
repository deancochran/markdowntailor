import {
  cleanupPDFGenerator,
  generatePDFContentNonBlocking,
} from "@/lib/utils/nonBlockingPdfGenerator";

import {
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Pause,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// Lightweight activity tracker
function useActivityTracker(content: string, delay: number = 1500) {
  const [shouldGenerate, setShouldGenerate] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef(content);

  useEffect(() => {
    if (content !== lastContentRef.current) {
      lastContentRef.current = content;
      setIsActive(true);
      setShouldGenerate(false);
      setIsPaused(false);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsActive(false);
        setShouldGenerate(true);
      }, delay);
    }
  }, [content, delay]);

  const pauseGeneration = useCallback(() => {
    setIsPaused(true);
    setShouldGenerate(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const resumeGeneration = useCallback(() => {
    setIsPaused(false);
    if (!isActive) {
      setShouldGenerate(true);
    }
  }, [isActive]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    shouldGenerate,
    isActive,
    isPaused,
    pauseGeneration,
    resumeGeneration,
    resetGeneration: () => setShouldGenerate(false),
  };
}

interface PDFState {
  pdfDataUrl: string;
  isGenerating: boolean;
  error: string | null;
  progress: { stage: string; percentage: number } | null;
  pageCount: number;
}

export const LightweightPDFPreview: React.FC<{
  sanitizedMarkdown: string;
  sanitizedCSS: string;
  previewTab: string;
  onPageCountChange?: (pageCount: number) => void;
}> = ({ sanitizedMarkdown, sanitizedCSS, previewTab, onPageCountChange }) => {
  const [state, setState] = useState<PDFState>({
    pdfDataUrl: "",
    isGenerating: false,
    error: null,
    progress: null,
    pageCount: 0,
  });

  const abortController = useRef<AbortController | null>(null);
  const hasInitialized = useRef(false); // Track if we've done initial generation
  const isPreviewActive = previewTab === "preview";
  const combinedContent = sanitizedMarkdown + sanitizedCSS;

  const {
    shouldGenerate,
    isActive,
    isPaused,
    pauseGeneration,
    resumeGeneration,
    resetGeneration,
  } = useActivityTracker(combinedContent);

  const generatePDF = useCallback(async () => {
    // Cancel any existing generation
    if (abortController.current) {
      abortController.current.abort();
    }

    const controller = new AbortController();
    abortController.current = controller;

    setState((prev) => ({
      ...prev,
      isGenerating: true,
      error: null,
      progress: { stage: "Starting...", percentage: 0 },
    }));

    try {
      const result = await generatePDFContentNonBlocking(
        sanitizedMarkdown,
        sanitizedCSS,
        (stage, percentage) => {
          if (!controller.signal.aborted) {
            setState((prev) => ({
              ...prev,
              progress: { stage, percentage },
            }));
          }
        },
        controller.signal,
      );

      if (!controller.signal.aborted) {
        setState((prev) => ({
          ...prev,
          pdfDataUrl: result.pdfDataUrl,
          pageCount: result.pageCount,
          isGenerating: false,
          progress: { stage: "Complete", percentage: 100 },
        }));

        onPageCountChange?.(result.pageCount);

        // Clear progress after delay
        setTimeout(() => {
          if (!controller.signal.aborted) {
            setState((prev) => ({ ...prev, progress: null }));
          }
        }, 2000);
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to generate PDF";
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          error: errorMessage,
          progress: null,
          pageCount: 0,
        }));
        onPageCountChange?.(0);
      }
    }
  }, [sanitizedMarkdown, sanitizedCSS, onPageCountChange]);

  // Initial generation when component first becomes active
  useEffect(() => {
    const hasContent = sanitizedMarkdown.trim() || sanitizedCSS.trim();

    if (
      isPreviewActive &&
      !hasInitialized.current &&
      hasContent &&
      !state.pdfDataUrl &&
      !state.isGenerating
    ) {
      hasInitialized.current = true;
      generatePDF();
    }
  }, [
    isPreviewActive,
    sanitizedMarkdown,
    sanitizedCSS,
    state.pdfDataUrl,
    state.isGenerating,
    generatePDF,
  ]);

  // Reset initialization flag when preview becomes inactive
  useEffect(() => {
    if (!isPreviewActive) {
      hasInitialized.current = false;
    }
  }, [isPreviewActive]);

  // Trigger generation when user stops editing (existing logic)
  useEffect(() => {
    if (shouldGenerate && isPreviewActive && !state.isGenerating && !isPaused) {
      generatePDF();
      resetGeneration();
    }
  }, [
    shouldGenerate,
    isPreviewActive,
    state.isGenerating,
    isPaused,
    generatePDF,
    resetGeneration,
  ]);

  // Cancel generation when switching away
  useEffect(() => {
    if (!isPreviewActive && abortController.current) {
      abortController.current.abort();
    }
  }, [isPreviewActive]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
      cleanupPDFGenerator();
    };
  }, []);

  if (!isPreviewActive) {
    return null;
  }

  // Progress indicator component (unchanged)
  const ProgressIndicator = () => {
    if (!isActive && !state.isGenerating && !state.progress && !state.error) {
      return null;
    }

    const getIcon = () => {
      if (state.error) return <AlertCircle className="h-4 w-4" />;
      if (state.isGenerating)
        return <Loader2 className="h-4 w-4 animate-spin" />;
      if (isPaused) return <Pause className="h-4 w-4" />;
      if (isActive) return <Clock className="h-4 w-4" />;
      if (state.progress?.percentage === 100)
        return <CheckCircle className="h-4 w-4" />;
      return <Clock className="h-4 w-4" />;
    };

    const getColor = () => {
      if (state.error) return "bg-red-500";
      if (state.isGenerating) return "bg-blue-500";
      if (isPaused) return "bg-yellow-500";
      if (isActive) return "bg-orange-500";
      if (state.progress?.percentage === 100) return "bg-green-500";
      return "bg-gray-500";
    };

    return (
      <div
        className={`absolute top-3 right-3 z-20 text-white px-3 py-1.5 rounded-md shadow-md
                      flex items-center gap-2 text-sm transition-all duration-200 ${getColor()}`}
      >
        {getIcon()}
        <div className="flex flex-col">
          <div className="font-medium">
            {state.error
              ? "Error"
              : state.isGenerating
                ? state.progress?.stage || "Processing"
                : isPaused
                  ? "Paused"
                  : isActive
                    ? "Editing..."
                    : state.progress?.percentage === 100
                      ? "Updated!"
                      : "Ready"}
          </div>
          {state.isGenerating && state.progress && (
            <div className="text-xs opacity-90">
              {state.progress.percentage}%
            </div>
          )}
        </div>
        {(state.isGenerating || isPaused) && (
          <button
            onClick={isPaused ? resumeGeneration : pauseGeneration}
            className="ml-1 p-0.5 hover:bg-white hover:bg-opacity-20 rounded"
            title={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? (
              <RefreshCw className="h-3 w-3" />
            ) : (
              <Pause className="h-3 w-3" />
            )}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full relative bg-gray-50">
      <ProgressIndicator />

      {state.pdfDataUrl ? (
        <iframe
          title="Resume PDF Preview"
          src={state.pdfDataUrl}
          className={`w-full h-full border-none transition-opacity duration-200
                     ${state.isGenerating ? "opacity-75" : "opacity-100"}`}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center">
          {state.isGenerating ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 mb-3" />
              <div className="text-gray-700">
                {hasInitialized.current
                  ? "Generating preview..."
                  : "Loading initial preview..."}
              </div>
              {state.progress && (
                <div className="text-sm text-gray-500 mt-1">
                  {state.progress.stage} ({state.progress.percentage}%)
                </div>
              )}
            </>
          ) : state.error ? (
            <>
              <AlertCircle className="h-8 w-8 text-red-600 mb-3" />
              <div className="text-red-800 mb-3 text-center max-w-md">
                {state.error}
              </div>
              <button
                onClick={generatePDF}
                className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
              >
                Retry
              </button>
            </>
          ) : (
            <>
              <div className="text-gray-600 mb-3">
                {sanitizedMarkdown.trim() || sanitizedCSS.trim()
                  ? "Preparing preview..."
                  : "Start editing to see your preview"}
              </div>
              {isActive && (
                <div className="text-sm text-blue-600 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                  Changes detected...
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
