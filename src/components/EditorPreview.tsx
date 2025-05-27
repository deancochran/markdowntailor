// EditorComponents/EditorPreview.tsx
"use client";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";
import { MutableRefObject } from "react";

interface EditorPreviewProps {
  iframeRef: MutableRefObject<HTMLIFrameElement | null>;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function EditorPreview({
  iframeRef,
  zoomLevel,
  onZoomIn,
  onZoomOut,
}: EditorPreviewProps) {
  return (
    <div className="col-span-1 h-full">
      {/* Preview controls */}
      <div className="bg-muted text-muted-foreground h-9 items-center w-full flex justify-between border-b rounded-none px-2">
        <div className="text-sm text-muted-foreground">A4 Preview</div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onZoomOut}
            disabled={zoomLevel <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm">{Math.round(zoomLevel * 100)}%</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onZoomIn}
            disabled={zoomLevel >= 2.0}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview container with scroll - made to fill available height */}
      <div className="h-full overflow-scroll bg-gray-100 flex items-center justify-center">
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
            className="overflow-scroll"
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
  );
}
