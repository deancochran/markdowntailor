"use client";
import ResumePreview from "@/components/ResumePreview";
import { Button } from "@/components/ui/button";
import { resume as Resume } from "@/db/schema";
import { toast } from "sonner";
import StylesControls from "@/components/StylesControls";
import { useSanitizedInput } from "@/hooks/use-sanitized-input";
import { useUser } from "@/hooks/use-user";
import { useSaveResume } from "@/hooks/useSaveResume";
import {
  createResumeFromVersion,
  deleteResume,
  saveResume,
} from "@/lib/actions/resume";
import { diffEditorOptions } from "@/lib/utils/monacoOptions";
import { ResumeStyles, defaultStyles } from "@/lib/utils/styles";
import { useChat } from "@ai-sdk/react";
import { DiffEditor, DiffOnMount } from "@monaco-editor/react";
import { Attachment, Message } from "ai";
import { cx } from "class-variance-authority";
import Decimal from "decimal.js";
import { InferSelectModel } from "drizzle-orm";
import {
  CheckCircle,
  Clock,
  Copy,
  Download,
  History,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
import type { editor } from "monaco-editor";
import { useTheme } from "next-themes";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Messages } from "./ai/messages";
import { MultimodalInput } from "./ai/multimodal-input";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";

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
  const { watch, setValue } = useForm({
    defaultValues: resume,
  });
  const { user, mutate } = useUser();

  const [featureDisabled, setFeatureDisabled] = useState(true);

  useEffect(() => {
    if (!user) return;
    const insufficientCredits = new Decimal(user.credits).lt(0);
    setFeatureDisabled(insufficientCredits);

    // Show a toast when credit balance is too low
    if (insufficientCredits) {
      toast.warning(
        "You have insufficient credits. Please add more credits to use the AI features.",
      );
    }
  }, [user]);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  // Replace page estimation with actual page count from PDF
  const [_actualPages, setActualPages] = useState(0);
  const [_isExceeding, setIsExceeding] = useState(false);
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
  const [styles, setStyles] = useState<ResumeStyles>(defaultStyles);
  const resumeRef = useRef<HTMLDivElement>(null);

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

  // Manual save functionality (replacing auto-save)
  const { isSaving, isDirty, save } = useSaveResume({
    resumeId: id,
    title: sanitizedTitle,
    markdown: sanitizedMarkdown,
    css: sanitizedCSS,
    saveFunction: saveResume,
    onSaveSuccess: (updatedResume) => {
      // Update form values
      setValue("title", updatedResume.title);
      setValue("markdown", updatedResume.markdown);
      setValue("css", updatedResume.css);
      setValue("updatedAt", updatedResume.updatedAt);

      // Update local state variables to stay in sync
      modifyMarkdown(updatedResume.markdown);
      modifyCss(updatedResume.css);
    },
  });

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

  // Handle manual save
  const handleSave = useCallback(async () => {
    try {
      await save();
    } catch (error) {
      // Error is already handled in the save function
      console.error("Save failed:", error);
    }
  }, [save]);

  // Add keyboard shortcut for Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+S or Cmd+S (for Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault(); // Prevent browser save dialog
        if (isDirty && !isSaving) {
          handleSave();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSave, isDirty, isSaving]);

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
  const handlePrint = () => {
    setIsPrinting(true);
    const resumeElement = resumeRef.current;
    if (!resumeElement) {
      setIsPrinting(false);
      return;
    }

    // Find the resume content HTML
    const resumePageElement = resumeElement.querySelector("#resume-page");
    if (!resumePageElement) {
      toast.error("Could not find resume content to print");
      setIsPrinting(false);
      return;
    }

    // Get the resume HTML content
    const resumeContent = resumePageElement.innerHTML;

    // Access the container that has the getContentForPrint method
    const containerElement = resumeElement.querySelector(
      "div[class^='flex flex-col h-full']",
    );
    if (
      !containerElement ||
      typeof containerElement.getContentForPrint !== "function"
    ) {
      toast.error("Could not prepare resume for printing");
      setIsPrinting(false);
      return;
    }

    // Get the properly formatted HTML content for printing using the component's method
    const htmlContent = containerElement.getContentForPrint(resumeContent);

    // Create a new window for printing only the resume content
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to download your resume as PDF");
      setIsPrinting(false);
      return;
    }

    // Write the content to the new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for resources to load before printing
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      // Close the print window after printing (or after cancel)
      setTimeout(() => {
        printWindow.close();
        setIsPrinting(false);
      }, 1000);
    }, 500);
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

  const [previewTab, setPreviewTab] = useState("preview");

  // Handle page count updates from PDFPreview
  const handlePageCountChange = useCallback((pageCount: number) => {
    setActualPages(pageCount);
    setIsExceeding(pageCount > 3);
  }, []);

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

      toast.success(`Applied modification to the ${contentType} document`, {
        description: "Your resume has been updated successfully.",
      });
    } catch (error) {
      console.error("Error applying modification:", error);
      toast.error("Failed to apply modification", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again or make changes manually.",
      });
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
              toast.success(`Changes applied: ${result.summary}`, {
                duration: 5000, // Longer duration for important summaries
              });
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
      // Check for specific error types and provide better error messages
      if (e instanceof Error) {
        if (e.message.includes("Unauthorized") || e.message.includes("401")) {
          toast.error("Authentication error. Please sign in again.");
        } else if (
          e.message.includes("Insufficient credits") ||
          e.message.includes("402")
        ) {
          toast.error(
            "You don't have enough credits to use this feature. Please add more credits.",
          );
          setFeatureDisabled(true);
        } else if (
          e.message.includes("Too Many Requests") ||
          e.message.includes("429")
        ) {
          toast.error("You've reached the rate limit. Please try again later.");
        } else {
          toast.error(`AI Chat Error: ${e.message}`);
        }
      } else {
        toast.error("An error occurred with the AI chat. Please try again.");
      }
    },
    onFinish: (message) => {
      // console.log("onFinish:", message);
      processToolInvocations(message);
      toast.success("AI response complete!");
      mutate();
    },
    onResponse(response) {
      if (response.status === 401) {
        toast.error("Authentication error. Please sign in again.");
      } else if (response.status === 402) {
        toast.error(
          "You don't have enough credits to use this feature. Please add more credits.",
        );
        setFeatureDisabled(true);
      } else if (response.status === 429) {
        toast.error("You've reached the rate limit. Please try again later.");
      } else if (!response.ok) {
        toast.error(`Error: ${response.statusText}`);
      }
      // else {
      //   toast.info("AI is generating a response...");
      // }
    },
  });

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  return (
    <div className="grid grid-rows-[auto_1fr] h-[100%] max-h-[100%]">
      <div className="w-full flex flex-row items-center justify-between p-2 gap-8">
        <Input
          className="w-full text-xl font-semibold bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
          value={sanitizedTitle}
          onChange={(e) => setValue("title", e.target.value)}
          placeholder="Untitled Resume"
        />
        <div className="flex flex-col w-full items-end justify-end gap-1">
          {/* Info and Actions Row */}
          <div className="flex items-center gap-1">
            {/* Last updated timestamp and versions link */}
            <div className="flex items-center text-xs text-muted-foreground gap-x-3">
              {/* Auto-save indicator */}
              <div className="flex items-center text-xs text-muted-foreground ml-2 shrink-0">
                {isSaving ? (
                  <span className="flex items-center text-amber-500">
                    <Loader2 className="w-3.5 h-3.5  animate-spin" />
                    Saving...
                  </span>
                ) : isDirty ? (
                  <span className="flex items-center text-amber-500">
                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                    Unsaved changes
                  </span>
                ) : (
                  <span className="flex items-center text-green-500">
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    Saved
                  </span>
                )}
              </div>
              <span className="inline-flex items-center">
                {updatedAt ? (
                  <>
                    <Clock className="w-3 h-3 mr-1 hidden xs:inline" />
                    <span className="hidden xs:inline">Updated</span>{" "}
                    <time
                      dateTime={updatedAt.toISOString()}
                      className="whitespace-nowrap"
                    >
                      {updatedAt.toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </>
                ) : (
                  "Not saved yet"
                )}
              </span>
            </div>
          </div>
          {/* Secondary Actions */}
          <div className="flex items-center gap-1">
            {/* Versions link */}
            <Button
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              variant="outline"
              size="sm"
              asChild
            >
              <Link href={`/resumes/${id}/versions`}>
                <History className="w-3 h-3" />

                <span className="hidden sm:inline">Versions</span>
              </Link>
            </Button>
            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              variant="outline"
              size="sm"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Save</span>
            </Button>
            {/* Print Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={isPrinting}
              aria-label="Print or download as PDF"
            >
              {isPrinting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Download</span>
            </Button>
            {/* Duplicate button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDuplicate}
              disabled={isDuplicating}
            >
              {isDuplicating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Duplicate</span>
            </Button>

            {/* Delete button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="relative flex flex-col min-h-0  h-full w-full bg-muted overflow-hidden">
        {/* Mobile Tab Bar - visible only on small screens */}
        <div className="flex lg:hidden items-center justify-center gap-1 p-2 border bg-background rounded">
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
        <div className="hidden lg:flex flex-row min-h-0 h-full w-full gap-4 overflow-hidden">
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
                  "absolute inset-0 flex flex-col",
                  editorsTab === "css" ? "block" : "hidden",
                )}
              >
                <StylesControls styles={styles} onStylesChange={setStyles} />
                <div className="flex-1">
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
                <div
                  className="relative flex-1 h-full overflow-hidden"
                  ref={resumeRef}
                >
                  <ResumePreview
                    markdown={sanitizedMarkdown}
                    styles={styles}
                    customCss={sanitizedCSS}
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
                      featureDisabled={featureDisabled}
                      status={status}
                      messages={messages}
                      setMessages={setMessages}
                      reload={reload}
                    />
                  </div>
                </div>

                <form className="flex flex-col mx-auto gap-2 w-full md:max-w-3xl p-2">
                  <div className="w-full h-fit flex items-center justify-end">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {featureDisabled ? (
                        "Feature Disabled: Insufficent Credits"
                      ) : (
                        <>
                          Your Credit Amount: ${" "}
                          {user ? (
                            new Decimal(user.credits)
                              .div(100)
                              .toDecimalPlaces(2, Decimal.ROUND_DOWN)
                              .toFixed(2)
                          ) : (
                            <Loader2 className="animate-spin inline" />
                          )}
                        </>
                      )}
                    </span>
                  </div>
                  <Separator />
                  <MultimodalInput
                    featureDisabled={featureDisabled}
                    input={input}
                    setInput={setInput}
                    handleSubmit={
                      featureDisabled
                        ? () => {
                            toast.error(
                              "Insufficient credits. Please add more credits to continue.",
                            );
                            return false;
                          }
                        : handleSubmit
                    }
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
        <div className="flex lg:hidden flex-col min-h-0 h-full w-full border overflow-hidden">
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
                "absolute inset-0 flex flex-col",
                mobileTab === "css" ? "block" : "hidden",
              )}
            >
              <StylesControls styles={styles} onStylesChange={setStyles} />
              <div className="flex-1">
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
            </div>

            {/* Mobile Preview */}
            <div
              className={cx(
                "absolute inset-0 flex flex-col justify-between",
                mobileTab === "preview" ? "block" : "hidden",
              )}
            >
              <div
                className="relative flex-1 h-full overflow-hidden"
                ref={resumeRef}
              >
                <ResumePreview
                  markdown={sanitizedMarkdown}
                  styles={styles}
                  customCss={sanitizedCSS}
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
                    featureDisabled={featureDisabled}
                    status={status}
                    messages={messages}
                    setMessages={setMessages}
                    reload={reload}
                  />
                </div>
              </div>
              <form className="flex flex-col mx-auto gap-2 w-full p-2 border-t">
                <div className="w-full h-fit flex items-center justify-end">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {featureDisabled ? (
                      "Feature Disabled: Insufficent Credits"
                    ) : (
                      <>
                        Your Credit Amount: ${" "}
                        {user ? (
                          new Decimal(user.credits)
                            .div(100)
                            .toDecimalPlaces(2, Decimal.ROUND_DOWN)
                            .toFixed(2)
                        ) : (
                          <Loader2 className="animate-spin inline" />
                        )}
                      </>
                    )}
                  </span>
                </div>
                <Separator />
                <MultimodalInput
                  featureDisabled={featureDisabled}
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
