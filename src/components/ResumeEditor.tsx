"use client";
import { Button } from "@/components/ui/button";
import { resume as Resume } from "@/db/schema";
import { toast } from "sonner";

import { useSanitizedInput } from "@/hooks/use-sanitized-input";
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
import { ArrowLeft, Copy, Save, Trash } from "lucide-react";
import type { editor } from "monaco-editor";
import { useTheme } from "next-themes";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Messages } from "./ai/messages";
import { MultimodalInput } from "./ai/multimodal-input";
import { PDFPreview } from "./PDFPreview";
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

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // State to track the last saved version of the resume
  const [baselineResume, setBaselineResume] = useState(resume);
  // State to track if there are unsaved changes
  const [isDirty, setIsDirty] = useState(false);
  // Replace page estimation with actual page count from PDF
  const [actualPages, setActualPages] = useState(0);
  const [isExceeding, setIsExceeding] = useState(false);
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

  // FIXED: Effect to detect if there are any changes compared to the baseline
  // Now includes modified content from editors
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
        // Using modern approach instead of deprecated returnValue
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

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

  // FIXED: Updated handleSave to use modified content and preserve formatting
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

      // Update form values to match saved content
      setValue("markdown", updatedResume.markdown);
      setValue("css", updatedResume.css);
      setValue("updatedAt", updatedResume.updatedAt);

      // FIXED: Update modified content to match saved content
      // This ensures the editors show the saved version as the new baseline
      modifyMarkdown(updatedResume.markdown);
      modifyCss(updatedResume.css);
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

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case "s":
            event.preventDefault();
            handleSave();
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
  }, [handleSave]);

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

      console.log(`MOD: ${JSON.stringify(modification)}`);

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

            console.log("REPLACE", newText);

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
            console.log("Analysis results:", result);
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
      <div className="w-full flex h-14 items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Link href="/resumes">
            <Button variant="ghost" size="icon" className=" ">
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
              className="p-0 m-0 text-xs h-fit text-muted-foreground "
              asChild
            >
              <Link href={`${pathname}/versions`}>View Versions</Link>
            </Button>
          </span>

          <Button
            onClick={handleSave}
            disabled={isSaving || !isDirty || isExceeding}
            variant="outline"
            className={`relative gap-2 `}
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save"}
          </Button>

          <Button
            onClick={handleDuplicate}
            disabled={isDuplicating || isDirty}
            variant="outline"
            className="gap-2 "
          >
            <Copy className="h-4 w-4" />
            {isDuplicating ? "Duplicating..." : "Duplicate"}
          </Button>

          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            variant="outline"
            className="gap-2 "
          >
            <Trash className="h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <div className="relative flex flex-row min-h-0 p-4 h-full w-full bg-muted gap-4 overflow-hidden">
        <div className="h-full w-full flex flex-col border">
          {/* Custom Tab Headers */}
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

          {/* Editor Container */}
          <div className="flex-1 relative">
            {/* Always render both editors but control visibility */}
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
          <div className="relative flex items-center align-middle justify-center gap-2 p-2 border-b ">
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

          <div className="flex-1 relative">
            {/* Always render both editors but control visibility */}
            <div
              className={cx(
                "absolute inset-0 flex flex-col justify-between",
                previewTab === "preview" ? "block" : "hidden",
              )}
            >
              <div className="relative flex-1 h-full overflow-hidden">
                <PDFPreview
                  sanitizedMarkdown={sanitizedMarkdown}
                  sanitizedCSS={sanitizedCSS}
                  previewTab={previewTab}
                  onPageCountChange={handlePageCountChange}
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
    </div>
  );
}
