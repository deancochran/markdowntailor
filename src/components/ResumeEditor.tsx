"use client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { resume as Resume } from "@/db/schema";
import {
  createResumeFromVersion,
  deleteResume,
  saveResume,
} from "@/lib/actions/resume";
import { generateHTMLContent } from "@/lib/utils/htmlGenerator";
import { printDocument } from "@/lib/utils/printUtils";
import { useChat } from "@ai-sdk/react";
import { DiffEditor, DiffOnMount } from "@monaco-editor/react";
import { Attachment, Message, ToolInvocation } from "ai";
import { InferSelectModel } from "drizzle-orm";
import {
  ArrowLeft,
  Copy,
  Download,
  Printer,
  Save,
  Trash,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { editor } from "monaco-editor";
import { useTheme } from "next-themes";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Messages } from "./ai/messages";
import { MultimodalInput } from "./ai/multimodal-input";
import { Input } from "./ui/input";

export default function ResumeEditor({
  resume,
}: {
  resume: InferSelectModel<typeof Resume>;
}) {
  const pathname = usePathname();
  const { register, watch, setValue } = useForm({
    defaultValues: resume,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // State to track the last saved version of the resume
  const [baselineResume, setBaselineResume] = useState(resume);
  // State to track if there are unsaved changes
  const [isDirty, setIsDirty] = useState(false);

  const id = watch("id");
  const title = watch("title");
  const markdown = watch("markdown");
  const css = watch("css");
  const updatedAt = watch("updatedAt");
  const [modifiedMarkdown, modifyMarkdown] = useState(markdown);
  const [modifiedCss, modifyCss] = useState(css);

  // Effect to detect if there are any changes compared to the baseline
  useEffect(() => {
    const hasChanges =
      baselineResume.title !== title ||
      baselineResume.markdown !== modifiedMarkdown ||
      baselineResume.css !== modifiedCss;
    setIsDirty(hasChanges);
  }, [title, modifiedMarkdown, modifiedCss, baselineResume]);

  // Effect to warn user before closing tab with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = ""; // Required for modern browsers
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  // Refs to store editor instances for proper cleanup
  const modifiedCssEditorRef = useRef<editor.IStandaloneCodeEditor>(null);
  const modifiedMarkdownEditorRef = useRef<editor.IStandaloneCodeEditor>(null);

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

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    let response;
    try {
      response = await createResumeFromVersion(resume.id);
      toast.success("Resume duplicated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to duplicate resume");
    } finally {
      setIsDuplicating(false);
    }
    if (response) {
      redirect(`/resumes/${response.resumeId}`);
    }
  };

  const handleSave = useCallback(async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const updatedResume = await saveResume(id, {
        title,
        markdown: modifiedMarkdown,
        css: modifiedCss,
        content: generateHTMLContent(modifiedMarkdown, modifiedCss),
      });
      toast.success("Resume saved successfully");
      // Update the baseline to the newly saved resume
      setBaselineResume(updatedResume);
      // On successful save, update original values to reflect the saved content
      setValue("markdown", updatedResume.markdown);
      setValue("css", updatedResume.css);
      setValue("updatedAt", updatedResume.updatedAt);
    } catch {
      toast.error("Failed to save resume");
    } finally {
      setIsSaving(false);
    }
  }, [id, title, isSaving, setValue, modifiedMarkdown, modifiedCss]);

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
      const htmlContent = generateHTMLContent(modifiedMarkdown, modifiedCss);
      printDocument(htmlContent);
      toast.success("PDF generation started");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  }, [modifiedMarkdown, modifiedCss]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSave, handleGeneratePdf]);

  const [editorsTab, setEditorsTab] = useState("markdown");
  const { theme } = useTheme();

  const [previewTab, setPreviewTab] = useState("preview");
  const [zoomLevel, setZoomLevel] = useState(0.6);

  const onZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2.0));
  };

  const onZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.1));
  };

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (previewTab === "preview") {
      const handle = setTimeout(() => {
        const iframe = iframeRef.current;
        if (iframe) {
          const iframeDoc =
            iframe.contentDocument || iframe.contentWindow?.document;

          if (iframeDoc) {
            const htmlContent = generateHTMLContent(
              modifiedMarkdown,
              modifiedCss,
            );

            iframeDoc.open();
            iframeDoc.write(htmlContent);
            iframeDoc.close();

            iframeDoc.addEventListener("click", (event) => {
              const target = event.target as HTMLAnchorElement;
              if (target.tagName === "A") {
                event.preventDefault();
                window.open(target.href, "_blank");
              }
            });
          }
        }
      }, 10);

      return () => clearTimeout(handle);
    }
  }, [previewTab, modifiedMarkdown, modifiedCss]);

  // Function to apply modifications directly to editors
  const applyModification = useCallback((modification: unknown) => {
    if (!modification.applyDirectly) return;

    const { contentType, operation, targetContent, newContent, position } =
      modification;

    if (contentType === "markdown" && modifiedMarkdownEditorRef.current) {
      const editor = modifiedMarkdownEditorRef.current;
      const model = editor.getModel();
      if (!model) return;

      switch (operation) {
        case "replace":
          if (targetContent) {
            const fullText = model.getValue();
            const newText = fullText.replace(targetContent, newContent);
            model.setValue(newText);
          }
          break;
        case "insert":
          if (position) {
            editor.executeEdits("ai-modification", [
              {
                range:
                  (position.startLineNumber,
                  position.startColumn,
                  position.endLineNumber,
                  position.endColumn),
                text: newContent,
              },
            ]);
          }
          break;
        case "append":
          const currentText = model.getValue();
          model.setValue(currentText + "\n" + newContent);
          break;
        case "prepend":
          const existingText = model.getValue();
          model.setValue(newContent + "\n" + existingText);
          break;
      }
    } else if (contentType === "css" && modifiedCssEditorRef.current) {
      const editor = modifiedCssEditorRef.current;
      const model = editor.getModel();
      if (!model) return;

      switch (operation) {
        case "replace":
          if (targetContent) {
            const fullText = model.getValue();
            const newText = fullText.replace(targetContent, newContent);
            model.setValue(newText);
          }
          break;
        case "insert":
          if (position) {
            editor.executeEdits("ai-modification", [
              {
                range:
                  (position.line,
                  position.column,
                  position.line,
                  position.column),
                text: newContent,
              },
            ]);
          }
          break;
        case "append":
          const currentText = model.getValue();
          model.setValue(currentText + "\n" + newContent);
          break;
        case "prepend":
          const existingText = model.getValue();
          model.setValue(newContent + "\n" + existingText);
          break;
      }
    }

    toast.success(`Applied Modification`);
  }, []);

  // Process tool invocations and apply modifications
  const processToolInvocations = useCallback(
    (message: Message) => {
      if (!message.toolInvocations) return;

      message.toolInvocations.forEach((invocation: ToolInvocation) => {
        if (invocation.state === "result" && invocation.result) {
          const result = invocation.result;
          if (result.applyDirectly) {
            applyModification(result);
          }
        }
      });
    },
    [applyModification],
  );

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
      resume: {
        markdown: modifiedMarkdown,
        css: modifiedCss,
        title,
      },
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

  // Handler for editor mount
  const handleMarkdownEditorMount: DiffOnMount = useCallback(
    (editor) => {
      const modifiedEditor = editor.getModifiedEditor();
      if (modifiedEditor) {
        modifiedMarkdownEditorRef.current = modifiedEditor;
      }
      modifiedMarkdownEditorRef.current?.onDidChangeModelContent(() => {
        modifyMarkdown(
          modifiedMarkdownEditorRef.current?.getValue() || markdown,
        );
      });
    },
    [markdown],
  );

  const handleCssEditorMount: DiffOnMount = useCallback(
    (editor) => {
      modifiedCssEditorRef.current = editor.getModifiedEditor();
      modifiedCssEditorRef.current?.onDidChangeModelContent(() => {
        modifyCss(modifiedCssEditorRef.current?.getValue() || css);
      });
    },
    [css],
  );

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

          <Input
            className="text-xl font-semibold bg-transparent focus:outline-none"
            {...register("title")}
          />
        </div>

        <div className="flex items-center gap-1">
          <span className="flex flex-col items-end text-muted-foreground">
            <p className="p-0 m-0 text-xs h-fit whitespace-nowrap">
              Updated:{" "}
              {(() => {
                const updated = new Date(updatedAt);
                const now = new Date();
                const isSameDay =
                  updated.getFullYear() === now.getFullYear() &&
                  updated.getMonth() === now.getMonth() &&
                  updated.getDate() === now.getDate();
                return isSameDay
                  ? updated.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : updated.toLocaleDateString();
              })()}
            </p>
            <Button
              variant="link"
              className="p-0 m-0 text-xs h-fit text-muted-foreground"
              asChild
            >
              <Link href={`${pathname}/versions`}>View Versions</Link>
            </Button>
          </span>

          <Button
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            variant="outline"
            className={`relative gap-2`}
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
            onClick={handleDuplicate}
            disabled={isDuplicating || isDirty}
            variant="outline"
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            {isDuplicating ? "Duplicating..." : "Duplicate"}
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

      <div className="relative grid grid-cols-2 min-h-0 p-4 h-full bg-muted">
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
                modified={modifiedMarkdown}
                onMount={handleMarkdownEditorMount}
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
                modified={modifiedCss}
                onMount={handleCssEditorMount}
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
              className="flex-1 flex flex-col h-full w-full overflow-hidden"
            >
              <div className="relative flex-1  overflow-hidden">
                <iframe
                  ref={iframeRef}
                  title="Resume Preview"
                  style={{
                    width: "210mm",
                    height: "297mm",
                    border: "1px solid #ccc",
                    background: "white",
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: "top center",
                    transition: "transform 0.3s ease-in-out",
                    overflow: "hidden",
                  }}
                />
              </div>
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
              className="flex-1 flex flex-col w-full overflow-hidden"
            >
              <div className="flex-1 w-full overflow-y-auto">
                <div className="w-full md:max-w-3xl mx-auto p-2">
                  <Messages
                    status={status}
                    messages={messages}
                    setMessages={setMessages}
                    reload={reload}
                  />
                </div>
              </div>
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
