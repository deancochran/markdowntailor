// EditorComponents/EditorChatPreviewProps.tsx
"use client";
import Chat from "@/components/ai/Chat";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { resume } from "@/db/schema";
import { generateHTMLContent } from "@/lib/utils/htmlGenerator";
import { InferSelectModel } from "drizzle-orm";
import { ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { UseFormSetValue } from "react-hook-form";

interface EditorChatPreviewProps {
  markdown: string;
  css: string;
  setValue: UseFormSetValue<InferSelectModel<typeof resume>>;
}

export function EditorChatPreview({
  markdown,
  css,
  // setValue
}: EditorChatPreviewProps) {
  const [activeTab, setActiveTab] = useState("preview");
  const [zoomLevel, setZoomLevel] = useState(0.5);
  // Zoom functionality
  const onZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2.0));
  };

  const onZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  };
  // Use iframe ref to completely isolate preview content
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Update the preview iframe whenever markdown or CSS changes
  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;

      if (iframeDoc) {
        // Wait for the rendering to complete
        setTimeout(() => {
          // Generate HTML content for the preview
          const htmlContent = generateHTMLContent(markdown, css);

          iframeDoc.open();
          iframeDoc.write(htmlContent);
          iframeDoc.close();
        }, 0);
      }
    }
  }, [markdown, css]);

  return (
    <div className="col-span-1 h-full border-r">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col gap-0 h-full"
      >
        <TabsList className="w-full flex justify-start border-b rounded-none px-4">
          <TabsTrigger value="preview" className="px-4 py-2">
            Print Preview
          </TabsTrigger>
          <TabsTrigger value="chat" className="px-4 py-2">
            AI Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="preview"
          style={{
            display: activeTab === "preview" ? "block" : "none",
          }}
        >
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
        </TabsContent>

        <TabsContent
          value="chat"
          style={{
            display: activeTab === "chat" ? "block" : "none",
          }}
        >
          <Chat markdown={markdown} css={css} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
