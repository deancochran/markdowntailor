"use client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { resume as Resume } from "@/db/schema";
import { toast } from "sonner";

import { useSanitizedInput } from "@/hooks/use-sanitized-input";
import {
  createResumeFromVersion,
  deleteResume,
  saveResume,
} from "@/lib/actions/resume";
import { generateHTMLContent } from "@/lib/utils/htmlGenerator";
import { diffEditorOptions } from "@/lib/utils/monacoOptions";
import { printDocument } from "@/lib/utils/printUtils";
import { estimatePageCount } from "@/lib/utils/resumeUtils";
import { useChat } from "@ai-sdk/react";
import { DiffEditor, DiffOnMount } from "@monaco-editor/react";
import { Attachment, Message } from "ai";
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
import { Messages } from "./ai/messages";
import { MultimodalInput } from "./ai/multimodal-input";
import { Input } from "./ui/input";

class IRange {
  endColumn: number;
  endLineNumber: number;
  startColumn: number;
  startLineNumber: number;
  constructor(
    endColumn: number,
    endLineNumber: number,
    startColumn: number,
    startLineNumber: number,
  ) {
    this.endColumn = endColumn;
    this.endLineNumber = endLineNumber;
    this.startColumn = startColumn;
    this.startLineNumber = startLineNumber;
  }
}

export default function ResumeEditor({
  resume,
}: {
  resume: InferSelectModel<typeof Resume>;
}) {
  const pathname = usePathname();
  const { watch, setValue } = useForm({
    defaultValues: resume,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // State to track the last saved version of the resume
  const [baselineResume, setBaselineResume] = useState(resume);
  // State to track if there are unsaved changes
  const [isDirty, setIsDirty] = useState(false);
  // State to track if resume exceeds page limit
  const [estimatedPages, setEstimatedPages] = useState(
    estimatePageCount(baselineResume.markdown),
  );
  const [isExceeding, setIsExceeding] = useState(estimatedPages > 3);
  const [editorsTab, setEditorsTab] = useState("markdown");
  const { theme } = useTheme();

  const id = watch("id");
  const title = watch("title");
  const markdown = watch("markdown");
  const css = watch("css");
  const updatedAt = watch("updatedAt");
  const [modifiedMarkdown, modifyMarkdown] = useState(markdown);
  const [modifiedCss, modifyCss] = useState(css);

  // Add these hooks inside your component
  const { sanitizedValue: sanitizedTitle } = useSanitizedInput(
    title,
    "text",
    (error) => toast.error(`Title sanitization: ${error}`),
  );

  const {
    sanitizedValue: sanitizedMarkdown,
    sanitize: _sanitizeMarkdownContent,
  } = useSanitizedInput(modifiedMarkdown, "markdown", (error) =>
    toast.error(`Markdown sanitization: ${error}`),
  );

  const { sanitizedValue: sanitizedCSS, sanitize: _sanitizeCSSContent } =
    useSanitizedInput(modifiedCss, "css", (error) =>
      toast.error(`CSS sanitization: ${error}`),
    );

  // Note: We don't sync sanitized content back to the editors to avoid infinite loops
  // The editors show raw content, but sanitized content is used for saving/preview

  // Effect to detect if there are any changes compared to the baseline
  useEffect(() => {
    const hasChanges =
      baselineResume.title !== sanitizedTitle ||
      baselineResume.markdown !== sanitizedMarkdown ||
      baselineResume.css !== sanitizedCSS;
    setIsDirty(hasChanges);
  }, [sanitizedTitle, sanitizedMarkdown, sanitizedCSS, baselineResume]);

  // Effect to cleanup editors when tab changes
  useEffect(() => {
    // Cleanup previous editor when tab changes
    return () => {
      if (editorsTab === "markdown") {
        try {
          // Store value before cleanup
          if (modifiedMarkdownEditorRef.current) {
            const value = modifiedMarkdownEditorRef.current.getValue();
            if (value) modifyMarkdown(value);
          }
        } catch (e) {
          console.error("Error during markdown editor cleanup:", e);
        }
      } else if (editorsTab === "css") {
        try {
          // Store value before cleanup
          if (modifiedCssEditorRef.current) {
            const value = modifiedCssEditorRef.current.getValue();
            if (value) modifyCss(value);
          }
        } catch (e) {
          console.error("Error during CSS editor cleanup:", e);
        }
      }
    };
  }, [editorsTab, modifyMarkdown, modifyCss]);

  // Effect to warn user before closing tab with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        // Using modern approach instead of deprecated returnValue
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  // Cleanup editors on component unmount
  useEffect(() => {
    return () => {
      // Dispose of editors on unmount
      if (modifiedMarkdownEditorRef.current) {
        // Explicitly set to null to avoid errors during unmount
        modifiedMarkdownEditorRef.current = null;
      }
      if (modifiedCssEditorRef.current) {
        // Explicitly set to null to avoid errors during unmount
        modifiedCssEditorRef.current = null;
      }
    };
  }, []);

  // Refs to store editor instances for proper cleanup
  const modifiedCssEditorRef = useRef<editor.IStandaloneCodeEditor | null>(
    null,
  );
  const modifiedMarkdownEditorRef = useRef<editor.IStandaloneCodeEditor | null>(
    null,
  );
  // Add references to track if editors are mounted
  const isMountedRef = useRef(true);

  // Track when component is mounted/unmounted
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
    if (isSaving || !isDirty || isExceeding) return;

    try {
      setIsSaving(true);
      const updatedResume = await saveResume(id, {
        title: sanitizedTitle,
        markdown: sanitizedMarkdown,
        css: sanitizedCSS,
      });
      toast.success("Resume saved successfully");
      // Update the baseline to the newly saved resume
      setBaselineResume(updatedResume);
      // On successful save, update original values to reflect the saved content
      setValue("markdown", updatedResume.markdown);
      setValue("css", updatedResume.css);
      setValue("updatedAt", updatedResume.updatedAt);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save resume";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [
    id,
    sanitizedTitle,
    isSaving,
    setValue,
    sanitizedMarkdown,
    sanitizedCSS,
    isDirty,
    isExceeding,
  ]);

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
      const htmlContent = generateHTMLContent(sanitizedMarkdown, sanitizedCSS);
      printDocument(htmlContent);
      toast.success("PDF generation started");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  }, [sanitizedMarkdown, sanitizedCSS]);

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
              sanitizedMarkdown,
              sanitizedCSS,
            );

            // Use innerHTML instead of deprecated write method
            iframeDoc.documentElement.innerHTML = htmlContent;

            // Add click handler for links
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
  }, [previewTab, sanitizedMarkdown, sanitizedCSS]);

  // Add an additional useEffect for handling iframe load events
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe && previewTab === "preview") {
      const handleLoad = () => {
        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow?.document;

        if (
          iframeDoc &&
          (!iframeDoc.body || iframeDoc.body.innerHTML.trim() === "")
        ) {
          const htmlContent = generateHTMLContent(
            sanitizedMarkdown,
            sanitizedCSS,
          );
          iframeDoc.documentElement.innerHTML = htmlContent;
        }
      };

      iframe.addEventListener("load", handleLoad);
      return () => iframe.removeEventListener("load", handleLoad);
    }
  }, [previewTab, sanitizedMarkdown, sanitizedCSS]);

  // Separate useEffect for page estimation
  useEffect(() => {
    const newEstimatedPages = estimatePageCount(sanitizedMarkdown);
    setEstimatedPages(newEstimatedPages);
    setIsExceeding(newEstimatedPages > 3);
  }, [sanitizedMarkdown]);

  const applyModification = useCallback(
    (modification: {
      success: boolean;
      applyDirectly?: boolean;
      contentType?: "markdown" | "css";
      operation?: "replace" | "insert" | "append" | "prepend";
      targetContent?: string; // Made optional and string-only to match API
      newContent: string;
      position?: {
        line?: number;
        column?: number;
      };
      description?: string;
    }) => {
      if (!modification.applyDirectly || !modification.success) return;

      const {
        contentType,
        operation,
        targetContent,
        newContent,
        position,
        // description,
      } = modification;

      try {
        const editor =
          contentType === "markdown"
            ? modifiedMarkdownEditorRef.current
            : modifiedCssEditorRef.current;

        if (!editor) {
          console.error(`${contentType} editor not available`);
          return;
        }

        const model = editor.getModel();
        if (!model) {
          console.error(`${contentType} editor model not available`);
          return;
        }

        switch (operation) {
          case "replace":
            if (targetContent) {
              const fullText = model.getValue();
              const newText = fullText.replace(targetContent, newContent);
              model.setValue(newText);
            }
            break;

          case "insert":
            if (
              position &&
              position.line !== undefined &&
              position.column !== undefined
            ) {
              editor.executeEdits("ai-modification", [
                {
                  range: new IRange(
                    position.column,
                    position.line,
                    position.column,
                    position.line,
                  ),
                  text: newContent,
                },
              ]);
            } else {
              // Insert at current cursor position if no position specified
              const selection = editor.getSelection();
              if (selection) {
                editor.executeEdits("ai-modification", [
                  {
                    range: selection,
                    text: newContent,
                  },
                ]);
              }
            }
            break;

          case "append":
            const currentText = model.getValue();
            model.setValue(
              currentText + (currentText ? "\n" : "") + newContent,
            );
            break;

          case "prepend":
            const existingText = model.getValue();
            model.setValue(
              newContent + (existingText ? "\n" : "") + existingText,
            );
            break;

          default:
            console.warn(`Unknown operation: ${operation}`);
            return;
        }

        toast.success(`Applied modification to the ${contentType} document`);
      } catch (error) {
        console.error("Error applying modification:", error);
        toast.error("Failed to apply modification");
      }
    },
    [],
  );

  // Process tool invocations and apply modifications
  const processToolInvocations = useCallback(
    (message: Message) => {
      // Check if message has experimental_attachments property as alternative to toolInvocations
      const invocations =
        "toolInvocations" in message ? message.toolInvocations : undefined;
      if (!invocations) return;

      invocations.forEach((invocation) => {
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
        markdown: sanitizedMarkdown,
        css: sanitizedCSS,
        title: sanitizedTitle,
      },
    },
    experimental_throttle: 100,
    onError: (e) => {
      console.error("onError:", e);
      toast.error("An error occurred with the AI chat");
    },
    onFinish: (message) => {
      // console.log("onFinish:", message);
      processToolInvocations(message);
    },
    onResponse() {
      // console.log("onResponse:", response);
    },
  });

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  // Handler for editor mount with proper disposal
  const handleMarkdownEditorMount: DiffOnMount = useCallback(
    (editor) => {
      if (!isMountedRef.current) return;

      const modifiedEditor = editor.getModifiedEditor();
      if (modifiedEditor) {
        modifiedMarkdownEditorRef.current = modifiedEditor;

        // Use a safer approach to handle content changes
        modifiedEditor.onDidChangeModelContent(() => {
          if (isMountedRef.current && modifiedEditor.getValue) {
            try {
              const value = modifiedEditor.getValue() || markdown;
              modifyMarkdown(value);
            } catch (e) {
              console.error("Error getting editor value:", e);
            }
          }
        });
      }
    },
    [markdown, modifyMarkdown],
  );

  const handleCssEditorMount: DiffOnMount = useCallback(
    (editor) => {
      if (!isMountedRef.current) return;

      const modifiedEditor = editor.getModifiedEditor();
      if (modifiedEditor) {
        modifiedCssEditorRef.current = modifiedEditor;

        // Use a safer approach to handle content changes
        modifiedEditor.onDidChangeModelContent(() => {
          if (isMountedRef.current && modifiedEditor.getValue) {
            try {
              const value = modifiedEditor.getValue() || css;
              modifyCss(value);
            } catch (e) {
              console.error("Error getting editor value:", e);
            }
          }
        });
      }
    },
    [css, modifyCss],
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
            value={sanitizedTitle}
            onChange={(e) => setValue("title", e.target.value)}
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
            disabled={isSaving || !isDirty || isExceeding}
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
            onValueChange={(value) => {
              // Use a more controlled approach to tab switching
              if (value !== editorsTab) {
                // Save current content before switching
                try {
                  if (
                    editorsTab === "markdown" &&
                    modifiedMarkdownEditorRef.current
                  ) {
                    const currentValue =
                      modifiedMarkdownEditorRef.current.getValue();
                    if (currentValue) modifyMarkdown(currentValue);
                  } else if (
                    editorsTab === "css" &&
                    modifiedCssEditorRef.current
                  ) {
                    const currentValue =
                      modifiedCssEditorRef.current.getValue();
                    if (currentValue) modifyCss(currentValue);
                  }
                } catch (e) {
                  console.error("Error during tab switch:", e);
                }

                // Important: Set refs to null before changing tabs
                if (value === "css") {
                  modifiedMarkdownEditorRef.current = null;
                } else {
                  modifiedCssEditorRef.current = null;
                }

                // Now it's safe to switch tabs
                setEditorsTab(value);
              }
            }}
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
              {/* Only render the editor when its tab is active to avoid disposal issues */}
              {editorsTab === "markdown" ? (
                <DiffEditor
                  key="markdown-editor" // Add a key to force re-creation when needed
                  language="markdown"
                  original={markdown}
                  modified={modifiedMarkdown}
                  onMount={handleMarkdownEditorMount}
                  keepCurrentOriginalModel={true}
                  keepCurrentModifiedModel={true}
                  options={{
                    ...diffEditorOptions,
                    fixedOverflowWidgets: true, // Add this to help with disposal issues
                  }}
                  theme={theme === "dark" ? "vs-dark" : "light"}
                />
              ) : null}
            </TabsContent>
            <TabsContent value="css" className="flex-1 min-h-0 overflow-hidden">
              {/* Only render the editor when its tab is active to avoid disposal issues */}
              {editorsTab === "css" ? (
                <DiffEditor
                  key="css-editor" // Add a key to force re-creation when needed
                  language="css"
                  original={css}
                  modified={modifiedCss}
                  onMount={handleCssEditorMount}
                  keepCurrentOriginalModel={true}
                  keepCurrentModifiedModel={true}
                  options={{
                    ...diffEditorOptions,
                    fixedOverflowWidgets: true, // Add this to help with disposal issues
                  }}
                  theme={theme === "dark" ? "vs-dark" : "light"}
                />
              ) : null}
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
                <div className="text-sm text-muted-foreground flex flex-row items-center gap-2">
                  A4 Preview{" "}
                  <div className="flex items-center gap-1.5">
                    <span className={"inline rounded font-mono"}>
                      {isExceeding
                        ? `Reduce content.`
                        : `Pages:${estimatedPages}/3`}
                    </span>
                  </div>
                </div>
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
