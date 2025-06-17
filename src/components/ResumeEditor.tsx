"use client";
import { Button } from "@/components/ui/button";
import { resume as Resume } from "@/db/schema";
import { toast } from "sonner";

import { useSanitizedInput } from "@/hooks/use-sanitized-input";
import { useAutoSave } from "@/hooks/useAutoSave";
import {
  createResumeFromVersion,
  deleteResume,
  saveResume,
} from "@/lib/actions/resume";
import { diffEditorOptions } from "@/lib/utils/monacoOptions";
import { useChat } from "@ai-sdk/react";
import { DiffEditor, DiffOnMount } from "@monaco-editor/react";
import { Attachment, Message } from "ai";
import { cx } from "class-variance-authority";
import { InferSelectModel } from "drizzle-orm";
import { Copy, Save, Trash } from "lucide-react";
import type { editor } from "monaco-editor";
import { useTheme } from "next-themes";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Messages } from "./ai/messages";
import { MultimodalInput } from "./ai/multimodal-input";
import { ServerPDFPreview } from "./ServerPDFPreview";
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

type Modification = {
  contentType: "markdown" | "css";
  operation: "replace" | "insert" | "append" | "prepend";
  targetContent?: string;
  isRegex?: boolean;
  regexFlags?: string;
  newContent: string;
  position?: {
    line?: number | null;
    column?: number | null;
  };
  reason?: string;
  index?: number;
};

export default function ResumeEditor({
  resume,
}: {
  resume: InferSelectModel<typeof Resume>;
}) {
  const pathname = usePathname();
  const { watch, setValue } = useForm({
    defaultValues: resume,
  });

  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  // Replace page estimation with actual page count from PDF
  const [_actualPages, setActualPages] = useState(0);
  const [isExceeding, setIsExceeding] = useState(false);
  const [editorsTab, setEditorsTab] = useState("markdown");
  const [mobileTab, setMobileTab] = useState("markdown");
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

  // Auto-save functionality
  const {
    isSaving,
    isDirty,
    hasUnsavedChanges,
    save: handleSave,
    resetDirty: _resetDirty,
  } = useAutoSave({
    resumeId: id,
    title: sanitizedTitle,
    markdown: sanitizedMarkdown,
    css: sanitizedCSS,
    saveFunction: saveResume,
    delay: 3000, // 3 second delay for auto-save
    enabled: true,
  });

  // Effect to warn user before closing tab with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        // Using modern approach instead of deprecated returnValue
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Refs to store editor instances for proper cleanup
  const modifiedCssEditorRef = useRef<editor.IStandaloneCodeEditor | null>(
    null,
  );
  const modifiedMarkdownEditorRef = useRef<editor.IStandaloneCodeEditor | null>(
    null,
  );

  // FIXED: Consolidated editor mount creator with better formatting preservation
  const createEditorMount = useCallback(
    (
      ref: React.MutableRefObject<editor.IStandaloneCodeEditor | null>,
      setter: (value: string) => void,
    ): DiffOnMount =>
      (diffEditor) => {
        const modified = diffEditor.getModifiedEditor();
        ref.current = modified;

        // Preserve formatting when content changes
        modified.onDidChangeModelContent(() => {
          const newValue = modified.getValue() || "";
          setter(newValue);
        });

        // Set up better formatting options
        modified.updateOptions({
          formatOnPaste: true,
          formatOnType: true,
          autoIndent: "full",
          insertSpaces: true,
          tabSize: 2,
        });
      },
    [],
  );

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
    } catch {
      toast.error("Failed to duplicate resume");
    } finally {
      setIsDuplicating(false);
    }
    if (response) {
      redirect(`/resumes/${response.resumeId}`);
    }
  };

  // Manual save function for button clicks and keyboard shortcuts
  const handleManualSave = useCallback(async () => {
    if (isSaving || !isDirty || isExceeding) return;

    const updatedResume = await handleSave();
    if (updatedResume) {
      // Update form values to match saved content
      setValue("markdown", updatedResume.markdown);
      setValue("css", updatedResume.css);
      setValue("updatedAt", updatedResume.updatedAt);

      // Update modified content to match saved content
      modifyMarkdown(updatedResume.markdown);
      modifyCss(updatedResume.css);
    } else {
      toast.error("Failed to save resume");
    }
  }, [handleSave, isSaving, isDirty, isExceeding, setValue]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case "s":
            event.preventDefault();
            handleManualSave();
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
  }, [handleManualSave]);

  const [previewTab, setPreviewTab] = useState("preview");

  // Remove zoom-related state and functions
  // const [zoomLevel, setZoomLevel] = useState(1);
  // const onZoomIn = () => { ... };
  // const onZoomOut = () => { ... };

  // Handle page count updates from PDFPreview
  const handlePageCountChange = useCallback((pageCount: number) => {
    setActualPages(pageCount);
    setIsExceeding(pageCount > 3);
  }, []);

  // Handle save required from PDF preview
  const handleSaveRequired = useCallback(() => {
    handleSave();
  }, [handleSave]);

  // Separate useEffect for page estimation
  // useEffect(() => {
  //   const newEstimatedPages = estimatePageCount(sanitizedMarkdown);
  //   setEstimatedPages(newEstimatedPages);
  //   setIsExceeding(newEstimatedPages > 3);
  // }, [sanitizedMarkdown]);

  // FIXED: Better modification application with formatting preservation
  const applyModification = useCallback((modification: Modification) => {
    const {
      contentType,
      operation,
      targetContent,
      isRegex,
      regexFlags,
      newContent,
      position,
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

      // Store current selection and scroll position to preserve user context
      const currentSelection = editor.getSelection();
      const currentScrollTop = editor.getScrollTop();

      switch (operation) {
        case "replace":
          if (targetContent) {
            const fullText = model.getValue();
            let newText;

            // Handle regex replacement if isRegex is true
            if (isRegex) {
              try {
                const regex = new RegExp(targetContent, regexFlags || "");
                newText = fullText.replace(regex, newContent);
              } catch (error) {
                console.error("Invalid regex:", targetContent, error);
                // Fallback to literal replace
                newText = fullText.replace(targetContent, newContent);
              }
            } else {
              newText = fullText.replace(targetContent, newContent);
            }

            // FIXED: Use pushEditOperations for better undo/redo and formatting preservation
            editor.pushUndoStop();
            editor.executeEdits("ai-modification", [
              {
                range: model.getFullModelRange(),
                text: newText,
              },
            ]);
            editor.pushUndoStop();

            // Format the document after replacement
            setTimeout(() => {
              editor.getAction("editor.action.formatDocument")?.run();
            }, 100);
          }
          break;

        case "insert":
          if (
            position &&
            position.line !== undefined &&
            position.column !== undefined
          ) {
            editor.pushUndoStop();
            editor.executeEdits("ai-modification", [
              {
                range: new IRange(
                  position.column ?? 0,
                  position.line ?? 0,
                  position.column ?? 0,
                  position.line ?? 0,
                ),
                text: newContent,
              },
            ]);
            editor.pushUndoStop();
          } else {
            // Insert at current cursor position if no position specified
            const selection = editor.getSelection();
            if (selection) {
              editor.pushUndoStop();
              editor.executeEdits("ai-modification", [
                {
                  range: selection,
                  text: newContent,
                },
              ]);
              editor.pushUndoStop();
            }
          }
          break;

        case "append":
          const currentText = model.getValue();
          const appendText =
            currentText + (currentText ? "\n" : "") + newContent;

          editor.pushUndoStop();
          editor.executeEdits("ai-modification", [
            {
              range: model.getFullModelRange(),
              text: appendText,
            },
          ]);
          editor.pushUndoStop();
          break;

        case "prepend":
          const existingText = model.getValue();
          const prependText =
            newContent + (existingText ? "\n" : "") + existingText;

          editor.pushUndoStop();
          editor.executeEdits("ai-modification", [
            {
              range: model.getFullModelRange(),
              text: prependText,
            },
          ]);
          editor.pushUndoStop();
          break;

        default:
          console.warn(`Unknown operation: ${operation}`);
          return;
      }

      // FIXED: Restore scroll position and selection after modification
      setTimeout(() => {
        if (currentSelection) {
          editor.setSelection(currentSelection);
        }
        editor.setScrollTop(currentScrollTop);

        // Trigger formatting for the affected range
        editor.getAction("editor.action.formatDocument")?.run();
      }, 50);

      toast.success(`Applied modification to the ${contentType} document`);
    } catch (error) {
      console.error("Error applying modification:", error);
      toast.error("Failed to apply modification");
    }
  }, []);

  const processToolInvocations = useCallback(
    (message: Message) => {
      // Check if message has tool invocations
      const invocations =
        "toolInvocations" in message ? message.toolInvocations : undefined;
      if (!invocations) return;

      invocations.forEach((invocation) => {
        if (invocation.state === "result" && invocation.result) {
          const result = invocation.result;

          // Handle batch_modify tool results
          if (result.modifications && Array.isArray(result.modifications)) {
            // Apply each modification directly without transformation
            result.modifications.forEach((modification: Modification) => {
              applyModification(modification);
            });

            // Show a summary toast after applying all modifications
            if (result.summary) {
              toast.success(result.summary);
            }
          }

          // Handle analyze_content tool results if needed
          else if (result.analysisType && result.findings) {
            toast.info(
              `Analysis complete: Found ${result.findings.length} items to improve`,
            );
          }
        }
      });
    },
    [applyModification],
  );

  const {
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

  return (
    <div className="grid grid-rows-[auto_1fr] h-[100%] max-h-[100%]">
      <div className="w-full flex flex-col items-start border-b">
        <div className="w-full flex flex-row items-start px-4 justify-between">
          <div className="flex flex-col items-start w-full sm:w-auto gap-1">
            <Input
              className="text-lg sm:text-xl font-semibold bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
              value={sanitizedTitle}
              onChange={(e) => setValue("title", e.target.value)}
              placeholder="Untitled Resume"
            />
          </div>

          <div className="flex flex-row items-end ">
            <Button
              onClick={handleManualSave}
              disabled={isSaving || !isDirty || isExceeding}
              size="sm"
              className="h-8 px-3 gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {isSaving ? "Saving..." : "Save"}
              </span>
            </Button>

            <Button
              onClick={handleDuplicate}
              disabled={isDuplicating || isDirty}
              variant="outline"
              size="sm"
              className="h-8 px-3 gap-1.5"
            >
              <Copy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {isDuplicating ? "Duplicating..." : "Duplicate"}
              </span>
            </Button>

            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              variant="outline"
              size="sm"
              className="h-8 px-3 gap-1.5 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {isDeleting ? "Deleting..." : "Delete"}
              </span>
            </Button>
          </div>
        </div>
        <div className="flex flex-row items-center justify-between">
          <span className="text-xs text-muted-foreground">
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
          </span>
          <Button
            variant="link"
            className="inline text-xs text-muted-foreground p-0 hover:text-foreground"
            asChild
          >
            <Link href={`${pathname}/versions`}>View Versions</Link>
          </Button>
        </div>
      </div>

      <div className="relative flex flex-col min-h-0 p-4 h-full w-full bg-muted gap-4 overflow-hidden">
        {/* Mobile Tab Bar - visible only on small screens */}
        <div className="flex md:hidden items-center justify-center gap-1 p-2 border bg-background rounded">
          <Button
            className="flex grow text-xs"
            variant={mobileTab === "markdown" ? "outline" : "ghost"}
            onClick={() => setMobileTab("markdown")}
          >
            Markdown
          </Button>
          <Button
            className="flex grow text-xs"
            variant={mobileTab === "css" ? "outline" : "ghost"}
            onClick={() => setMobileTab("css")}
          >
            CSS
          </Button>
          <Button
            className="flex grow text-xs"
            variant={mobileTab === "preview" ? "outline" : "ghost"}
            onClick={() => setMobileTab("preview")}
          >
            Preview
          </Button>
          <Button
            className="flex grow text-xs"
            variant={mobileTab === "chat" ? "outline" : "ghost"}
            onClick={() => setMobileTab("chat")}
          >
            AI Chat
          </Button>
        </div>

        {/* Desktop Two-Column Layout */}
        <div className="hidden md:flex flex-row min-h-0 h-full w-full gap-4 overflow-hidden">
          <div className="h-full w-full flex flex-col border">
            {/* Desktop Editor Tab Headers */}
            <div className="relative flex items-center align-middle justify-center gap-2 p-2 border-b">
              <Button
                className="flex grow"
                variant={editorsTab === "markdown" ? "outline" : "ghost"}
                onClick={() => setEditorsTab("markdown")}
              >
                Markdown
              </Button>
              <Button
                className="flex grow"
                variant={editorsTab === "css" ? "outline" : "ghost"}
                onClick={() => setEditorsTab("css")}
              >
                CSS
              </Button>
            </div>

            {/* Desktop Editor Container */}
            <div className="flex-1 relative">
              <div
                className={cx(
                  "absolute inset-0",
                  editorsTab === "markdown" ? "block" : "hidden",
                )}
              >
                <DiffEditor
                  key="markdown-editor"
                  language="markdown"
                  original={markdown}
                  modified={modifiedMarkdown}
                  keepCurrentOriginalModel={true}
                  keepCurrentModifiedModel={true}
                  onMount={createEditorMount(
                    modifiedMarkdownEditorRef,
                    modifyMarkdown,
                  )}
                  options={diffEditorOptions}
                  theme={theme === "dark" ? "vs-dark" : "light"}
                  height="100%"
                />
              </div>

              <div
                className={cx(
                  "absolute inset-0",
                  editorsTab === "css" ? "block" : "hidden",
                )}
              >
                <DiffEditor
                  key="css-editor"
                  language="css"
                  original={css}
                  modified={modifiedCss}
                  keepCurrentOriginalModel={true}
                  keepCurrentModifiedModel={true}
                  onMount={createEditorMount(modifiedCssEditorRef, modifyCss)}
                  options={diffEditorOptions}
                  theme={theme === "dark" ? "vs-dark" : "light"}
                  height="100%"
                />
              </div>
            </div>
          </div>

          <div className="h-full w-full overflow-hidden flex flex-col border">
            {/* Desktop Preview Tab Headers */}
            <div className="relative flex items-center align-middle justify-center gap-2 p-2 border-b">
              <Button
                className="flex grow"
                variant={previewTab === "preview" ? "outline" : "ghost"}
                onClick={() => setPreviewTab("preview")}
              >
                Preview
              </Button>
              <Button
                className="flex grow"
                variant={previewTab === "chat" ? "outline" : "ghost"}
                onClick={() => setPreviewTab("chat")}
              >
                AI Chat
              </Button>
            </div>

            {/* Desktop Preview Container */}
            <div className="flex-1 relative">
              <div
                className={cx(
                  "absolute inset-0 flex flex-col justify-between",
                  previewTab === "preview" ? "block" : "hidden",
                )}
              >
                <div className="relative flex-1 h-full overflow-hidden">
                  <ServerPDFPreview
                    resumeId={resume.id}
                    previewTab={previewTab}
                    onPageCountChange={handlePageCountChange}
                    hasUnsavedChanges={isDirty}
                    onSaveRequired={handleSaveRequired}
                  />
                </div>
              </div>

              <div
                className={cx(
                  "absolute inset-0 flex flex-col justify-between",
                  previewTab === "chat" ? "block" : "hidden",
                )}
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
                    setMessages={setMessages}
                  />
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Single Column Layout */}
        <div className="flex md:hidden flex-col min-h-0 h-full w-full border overflow-hidden">
          <div className="flex-1 relative">
            {/* Mobile Markdown Editor */}
            <div
              className={cx(
                "absolute inset-0",
                mobileTab === "markdown" ? "block" : "hidden",
              )}
            >
              <DiffEditor
                key="mobile-markdown-editor"
                language="markdown"
                original={markdown}
                modified={modifiedMarkdown}
                keepCurrentOriginalModel={true}
                keepCurrentModifiedModel={true}
                onMount={createEditorMount(
                  modifiedMarkdownEditorRef,
                  modifyMarkdown,
                )}
                options={diffEditorOptions}
                theme={theme === "dark" ? "vs-dark" : "light"}
                height="100%"
              />
            </div>

            {/* Mobile CSS Editor */}
            <div
              className={cx(
                "absolute inset-0",
                mobileTab === "css" ? "block" : "hidden",
              )}
            >
              <DiffEditor
                key="mobile-css-editor"
                language="css"
                original={css}
                modified={modifiedCss}
                keepCurrentOriginalModel={true}
                keepCurrentModifiedModel={true}
                onMount={createEditorMount(modifiedCssEditorRef, modifyCss)}
                options={diffEditorOptions}
                theme={theme === "dark" ? "vs-dark" : "light"}
                height="100%"
              />
            </div>

            {/* Mobile Preview */}
            <div
              className={cx(
                "absolute inset-0 flex flex-col justify-between",
                mobileTab === "preview" ? "block" : "hidden",
              )}
            >
              <div className="relative flex-1 h-full overflow-hidden">
                <ServerPDFPreview
                  resumeId={resume.id}
                  previewTab={previewTab}
                  onPageCountChange={handlePageCountChange}
                  hasUnsavedChanges={isDirty}
                  onSaveRequired={handleSaveRequired}
                />
              </div>
            </div>

            {/* Mobile Chat */}
            <div
              className={cx(
                "absolute inset-0 flex flex-col justify-between",
                mobileTab === "chat" ? "block" : "hidden",
              )}
            >
              <div className="flex-1 w-full overflow-y-auto">
                <div className="w-full mx-auto p-2">
                  <Messages
                    status={status}
                    messages={messages}
                    setMessages={setMessages}
                    reload={reload}
                  />
                </div>
              </div>
              <form className="flex mx-auto gap-2 w-full p-2 border-t">
                <MultimodalInput
                  input={input}
                  setInput={setInput}
                  handleSubmit={handleSubmit}
                  status={status}
                  stop={stop}
                  attachments={attachments}
                  setAttachments={setAttachments}
                  setMessages={setMessages}
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
