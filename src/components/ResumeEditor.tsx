"use client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { resume as Resume } from "@/db/schema";
import { deleteResume, saveResume } from "@/lib/actions/resume"; // Import deleteResume
import { generateHTMLContent } from "@/lib/utils/htmlGenerator";
import { printDocument } from "@/lib/utils/printUtils";
import { useChat } from "@ai-sdk/react";
import { DiffEditor } from "@monaco-editor/react";
import { Attachment, Message, ToolInvocation } from "ai";
import { InferSelectModel } from "drizzle-orm";
import {
  ArrowLeft,
  Download,
  Printer,
  Save,
  Trash,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Messages } from "./ai/messages";
import { MultimodalInput } from "./ai/multimodal-input";

export default function ResumeEditor({
  resume,
}: {
  resume: InferSelectModel<typeof Resume>;
}) {
  const { register, watch } = useForm({
    defaultValues: resume,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const id = watch("id");
  const title = watch("title");
  const markdown = watch("markdown");
  const css = watch("css");

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this resume?")) {
      setIsDeleting(true);
      try {
        await deleteResume(id);
      } catch {
        toast.error("Failed to delete resume");
      } finally {
        toast.success("Resume deleted successfully");
        redirect("/resumes");
      }
    }
  };

  const handleSave = useCallback(async () => {
    if (isSaving) return; // Prevent multiple saves

    setIsSaving(true);
    try {
      await saveResume({
        id,
        title,
        markdown,
        css,
        content: generateHTMLContent(markdown, css),
      });
      toast.success("Resume saved successfully");
    } catch {
      toast.error("Failed to save resume");
    } finally {
      setIsSaving(false);
    }
  }, [id, title, markdown, css, isSaving]);

  const handleDownloadHTML = () => {
    try {
      // Download logic
      toast.success("HTML file downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download HTML file");
    }
  };

  const handleGeneratePdf = useCallback(() => {
    try {
      // PDF generation logic
      const htmlContent = generateHTMLContent(markdown, css);
      printDocument(htmlContent);
      toast.success("PDF generation started");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  }, [markdown, css]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Ctrl (or Cmd on Mac) is pressed
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case "s":
            event.preventDefault();
            handleSave();
            break;
          case "p":
            event.preventDefault();
            handleGeneratePdf();
            break;
          default:
            break;
        }
      }
    };

    // Add event listener to document
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup function to remove event listener
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSave, handleGeneratePdf]);

  const [editorsTab, setEditorsTab] = useState("markdown");
  const { theme } = useTheme();

  const [previewTab, setPreviewTab] = useState("preview");
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
    if (previewTab === "preview") {
      const handle = setTimeout(() => {
        const iframe = iframeRef.current;
        if (iframe) {
          const iframeDoc =
            iframe.contentDocument || iframe.contentWindow?.document;

          if (iframeDoc) {
            const htmlContent = generateHTMLContent(
              resume.markdown,
              resume.css,
            );

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
  }, [previewTab, resume]);

  // Custom message processing to extract changes
  const processToolInvocations = (message: Message) => {
    if (!message.toolInvocations) return;

    message.toolInvocations.forEach((invocation: ToolInvocation) => {
      if (invocation.state === "result" && invocation.result) {
        const result = invocation.result;

        if (result.changeId && result.changeType) {
          let newChange;

          switch (result.changeType) {
            case "formatting":
            case "direct_modification":
            case "content_generation":
            case "proofreading":
            case "tone_improvement":
              newChange = result;
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
      resume: { resume },
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
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  return (
    <div className="grid grid-rows-[auto_1fr] h-[100%] max-h-[100%]">
      <div className="w-full flex h-14 items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Link href="/resumes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Resumes</span>
            </Button>
          </Link>
          <input
            {...register("title")}
            placeholder="Resume Title"
            className="text-xl font-semibold bg-transparent focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            variant="outline"
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save"}
          </Button>

          <Button
            onClick={handleGeneratePdf}
            variant="outline"
            className="gap-2"
            data-testid="export-pdf-button"
          >
            <Printer className="h-4 w-4" />
            Print PDF
          </Button>

          <Button
            onClick={handleDownloadHTML}
            variant="outline"
            className="gap-2"
            data-testid="download-html-button"
          >
            <Download className="h-4 w-4" />
            Download HTML
          </Button>

          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            variant="outline"
            className="gap-2"
          >
            <Trash className="h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* This parent container does NOT need overflow-hidden
              because EditorSidebar and EditorChatPreview now manage their own overflow. */}
      <div className="relative grid grid-cols-2 min-h-0 p-4 h-full bg-muted">
        {/* These components internally ensure they are h-full and manage their scroll */}
        <div className="relative overflow-hidden">
          <Tabs
            value={editorsTab}
            onValueChange={setEditorsTab}
            className="flex flex-col gap-0 h-full border overflow-hidden"
          >
            <TabsList className="w-full flex justify-start border-b rounded-none px-4 flex-shrink-0">
              <TabsTrigger value="markdown" className="px-4 py-2">
                Markdown
              </TabsTrigger>
              <TabsTrigger value="css" className="px-4 py-2">
                CSS
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="markdown"
              className="flex-1 min-h-0 overflow-hidden"
            >
              <DiffEditor
                language="markdown"
                original={markdown}
                modified={markdown}
                options={{
                  automaticLayout: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  renderSideBySide: false,
                  cursorSmoothCaretAnimation: "on",
                  smoothScrolling: true,
                  scrollBeyondLastLine: true,
                  lineNumbers: "off",
                  renderGutterMenu: false,
                  renderOverviewRuler: false,
                  minimap: {
                    enabled: false,
                  },
                }}
                theme={theme === "dark" ? "vs-dark" : "light"}
              />
            </TabsContent>
            <TabsContent value="css" className="flex-1 min-h-0 overflow-hidden">
              <DiffEditor
                language="css"
                original={css}
                modified={css}
                options={{
                  automaticLayout: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  renderSideBySide: false,
                  cursorSmoothCaretAnimation: "on",
                  smoothScrolling: true,
                  scrollBeyondLastLine: true,
                  lineNumbers: "off",
                  renderGutterMenu: false,
                  renderOverviewRuler: false,
                  minimap: {
                    enabled: false,
                  },
                }}
                theme={theme === "dark" ? "vs-dark" : "light"}
              />
            </TabsContent>
          </Tabs>
        </div>
        <div className="relative overflow-hidden">
          <Tabs
            value={previewTab}
            onValueChange={setPreviewTab}
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
                  <span className="text-sm">
                    {Math.round(zoomLevel * 100)}%
                  </span>
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
      </div>
    </div>
  );
}
