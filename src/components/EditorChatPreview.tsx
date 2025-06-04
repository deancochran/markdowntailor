// EditorComponents/EditorChatPreviewProps.tsx
"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { resume } from "@/db/schema";
import { generateHTMLContent } from "@/lib/utils/htmlGenerator";
import { useChat } from "@ai-sdk/react";
import { Attachment } from "ai";
import { InferSelectModel } from "drizzle-orm";
import { ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { UseFormSetValue } from "react-hook-form";
import { toast } from "sonner";
import { Messages } from "./ai/messages";
import { MultimodalInput } from "./ai/multimodal-input";
import { Button } from "./ui/button";

interface EditorChatPreviewProps {
  markdown: string;
  css: string;
  setValue: UseFormSetValue<InferSelectModel<typeof resume>>;
}

interface PendingChange {
  id: string;
  type: "markdown" | "css" | "both";
  description: string;
  originalContent?: string;
  newContent?: string;
  targetContent?: string;
  changeType: string;
  explanation: string;
  applied: boolean;
}

export function EditorChatPreview({
  markdown,
  css,
  // setValue
}: EditorChatPreviewProps) {
  const [activeTab, setActiveTab] = useState("preview");
  const [zoomLevel, setZoomLevel] = useState(0.8);
  // Zoom functionality
  const onZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2.0));
  };

  const onZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.1));
  };
  // Use iframe ref to completely isolate preview content
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Update the preview iframe whenever markdown or CSS changes
  useEffect(() => {
    if (activeTab === "preview") {
      const handle = setTimeout(() => {
        const iframe = iframeRef.current;
        if (iframe) {
          const iframeDoc =
            iframe.contentDocument || iframe.contentWindow?.document;

          if (iframeDoc) {
            const htmlContent = generateHTMLContent(markdown, css);

            iframeDoc.open();
            iframeDoc.write(htmlContent);
            iframeDoc.close();

            // Add event listener to prevent default action on links
            iframeDoc.addEventListener("click", (event) => {
              const target = event.target as HTMLAnchorElement;
              if (target.tagName === "A") {
                event.preventDefault(); // Prevent navigation for clicked links
                // You can add custom behavior here if needed
                // Try to open the link in a new tab
                window.open(target.href, "_blank");
              }
            });
          }
        }
      }, 10); // delay in milliseconds

      return () => clearTimeout(handle); // Cleanup timeout if component unmounts or effect re-runs
    }
  }, [activeTab, markdown, css]);

  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  // Custom message processing to extract changes
  const processToolInvocations = (message: Message) => {
    if (!message.toolInvocations) return;

    message.toolInvocations.forEach((invocation: ToolInvocation) => {
      if (invocation.state === "result" && invocation.result) {
        const result = invocation.result as any;

        if (result.changeId && result.changeType) {
          const existingChange = pendingChanges.find(
            (c) => c.id === result.changeId,
          );
          if (existingChange) return; // Already processed

          let newChange: PendingChange | null = null;

          switch (result.changeType) {
            case "direct_modification":
              newChange = {
                id: result.changeId,
                type: result.contentType as "markdown" | "css",
                description: result.description,
                originalContent: result.targetContent,
                newContent: result.newContent,
                targetContent: result.targetContent,
                changeType: result.changeType,
                explanation: result.explanation,
                applied: false,
              };
              break;

            case "content_generation":
            case "proofreading":
            case "tone_improvement":
              newChange = {
                id: result.changeId,
                type: "markdown", // These typically affect markdown
                description: result.explanation,
                newContent:
                  result.generatedSnippet ||
                  result.correctedText ||
                  result.improvedText,
                changeType: result.changeType,
                explanation: result.explanation,
                applied: false,
              };
              break;

            case "formatting":
              newChange = {
                id: result.changeId,
                type: result.suggestedCssSnippet ? "css" : "markdown",
                description: result.explanation,
                newContent:
                  result.suggestedMarkdownSnippet ||
                  result.suggestedCssSnippet ||
                  result.suggestedHtmlSnippet,
                changeType: result.changeType,
                explanation: result.explanation,
                applied: false,
              };
              break;
          }

          if (newChange) {
            // setPendingChanges(prev => [...prev, newChange!]);
            toast.success("Changes pending");
          }
        }
      }
    });
  };

  const {
    append,
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    status,
    stop,
    reload,
  } = useChat({
    body: {
      resume: { markdown, css },
    },
    experimental_throttle: 100,
    onError: (e) => {
      console.error("onError:", e);
      toast.error("An error occurred with the AI chat");
    },
    onFinish: (message) => {
      console.log("onFinish:", message);
      processToolInvocations(message);
    },
    onResponse(response) {
      console.log("onResponse:", response);
    },
  });
  useEffect(() => {
    console.log("messages", messages);
  }, [messages]);

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  return (
    <div className="relative overflow-hidden">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col gap-0 h-full border"
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
          // This content area should be a flex column itself to position iframe and controls.
          className="flex-1 flex flex-col w-full overflow-hidden" // flex-1 to take space, overflow-hidden if iframe div handles all scroll
        >
          {/* Iframe container: takes most space, allows A4 content to be scrolled if larger than this div due to zoom. */}
          <div className="relative flex-1 w-full overflow-auto">
            <iframe
              ref={iframeRef}
              title="Resume Preview"
              style={{
                width: "210mm",
                height: "297mm",
                border: "1px solid #ccc",
                background: "white",
                transform: `scale(${zoomLevel})`,
                transformOrigin: "20% 50% 0%", // Ensures scaling behaves predictably
                transition: "transform 0.3s ease-in-out",
              }}
            />
          </div>
          {/* Preview controls: fixed height bar at the bottom of this tab. */}
          <div className="bg-muted text-muted-foreground h-10 items-center w-full flex justify-between border-t px-2">
            <div className="text-sm text-muted-foreground">A4 Preview</div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onZoomOut}
                disabled={zoomLevel <= 0.2}
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
        </TabsContent>

        <TabsContent
          value="chat"
          // This content area is a flex column for messages list and input form.
          className="flex-1 flex flex-col w-full overflow-hidden" // flex-1 to take space, children manage their scrolling/size
        >
          {/* Messages area: takes remaining space and scrolls internally. */}
          <div className="flex-1 w-full overflow-y-auto">
            {/* Optional: Inner div for message styling if needed, e.g., max-width, padding */}
            <div className="w-full md:max-w-3xl mx-auto p-2">
              <Messages
                status={status}
                messages={messages}
                setMessages={setMessages}
                reload={reload}
              />
            </div>
          </div>
          {/* Input form: fixed height at the bottom. */}
          <form className="flex mx-auto gap-2 w-full md:max-w-3xl p-2 border-t">
            <MultimodalInput
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              status={status}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={append}
            />
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
