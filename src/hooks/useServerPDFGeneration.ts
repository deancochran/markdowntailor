import { useCallback, useRef, useState } from "react";

export interface ServerPDFResult {
  pdfBase64: string;
  pageCount: number;
  cached?: boolean;
}

export function useServerPDFGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>("");
  const ongoingRequestsRef = useRef<Map<string, Promise<ServerPDFResult>>>(
    new Map(),
  );

  const generatePDFPreview = useCallback(
    async (request: { resumeId: string }): Promise<ServerPDFResult> => {
      // Use resumeId as the deduplication key
      const requestKey = request.resumeId;

      // Check if we already have an ongoing request for this resume
      const existingRequest = ongoingRequestsRef.current.get(requestKey);
      if (existingRequest) {
        return existingRequest;
      }

      setIsGenerating(true);
      setError(""); // Clear any previous errors when starting new generation

      // Create the request promise
      const requestPromise = (async (): Promise<ServerPDFResult> => {
        try {
          const response = await fetch("/api/pdf", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              resumeId: request.resumeId,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || "Failed to generate PDF preview",
            );
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
          // Clean up the request from our tracking
          ongoingRequestsRef.current.delete(requestKey);
        }
      })();

      // Store the promise for deduplication
      ongoingRequestsRef.current.set(requestKey, requestPromise);

      return requestPromise;
    },
    [],
  );

  const downloadPDF = useCallback(
    async (resumeId: string, filename: string): Promise<void> => {
      setIsGenerating(true);
      setError(""); // Clear any previous errors when starting new generation

      try {
        // Generate or get the PDF
        const result = await generatePDFPreview({ resumeId });

        // Convert base64 to blob
        const byteCharacters = atob(result.pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const pdfBlob = new Blob([byteArray], { type: "application/pdf" });

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
    [generatePDFPreview],
  );

  // Helper function to convert base64 PDF to data URL for iframe display
  const createPDFDataURL = useCallback((pdfBase64: string): string => {
    return `data:application/pdf;base64,${pdfBase64}`;
  }, []);

  return {
    generatePDFPreview,
    downloadPDF,
    createPDFDataURL,
    isGenerating,
    error,
  };
}
