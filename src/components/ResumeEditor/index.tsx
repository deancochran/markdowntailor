"use client";

import { ResumePreviewRef } from "@/components/ResumePreview";
import { useSanitizedInput } from "@/hooks/use-sanitized-input";
import { defaultStyles } from "@/lib/utils/styles";
import { Resume } from "@/localforage";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DesktopLayout } from "./components/DesktopLayout";
import { MobileLayout } from "./components/MobileLayout";
import { ResumeHeader } from "./components/ResumeHeader";
import { MobileTabs } from "./components/TabComponents";
import { useAIChat } from "./hooks/useAIChat";
import { useResumeActions } from "./hooks/useResumeActions";
import { useResumeEditors } from "./hooks/useResumeEditors";
import { useTabManager } from "./hooks/useTabManager";

export default function ResumeEditor({ resume }: { resume: Resume }) {
  const { watch, setValue } = useForm({
    defaultValues: resume,
  });

  // Form field watches
  const id = watch("id");
  const title = watch("title");
  const markdown = watch("markdown");
  const css = watch("css");
  const stylesJson = watch("styles");
  const updatedAt = watch("updatedAt");

  // Styles state - initialize from database or use default
  const [styles, setStyles] = useState(() => {
    try {
      return stylesJson ? JSON.parse(stylesJson) : defaultStyles;
    } catch {
      return defaultStyles;
    }
  });
  const resumePreviewRef = useRef<ResumePreviewRef>(null!);

  // Initialize custom hooks
  const editorHooks = useResumeEditors(markdown, css);
  const tabManager = useTabManager();

  // Sanitized input hooks
  const { sanitizedValue: sanitizedTitle } = useSanitizedInput(
    title,
    "text",
    (error) => toast.error(`Title sanitization: ${error}`),
  );

  const { sanitizedValue: sanitizedMarkdown } = useSanitizedInput(
    editorHooks.modifiedMarkdown,
    "markdown",
    (error) => toast.error(`Markdown sanitization: ${error}`),
  );

  const { sanitizedValue: sanitizedCSS } = useSanitizedInput(
    editorHooks.modifiedCss,
    "css",
    (error) => toast.error(`CSS sanitization: ${error}`),
  );

  const resumeActions = useResumeActions(
    resume,
    resumePreviewRef,
    (updatedResume) => {
      // Update form values
      setValue("title", updatedResume.title);
      setValue("markdown", updatedResume.markdown);
      setValue("css", updatedResume.css);
      setValue("styles", updatedResume.styles);
      setValue("updatedAt", updatedResume.updatedAt);

      // Update local state variables to stay in sync
      editorHooks.modifyMarkdown(updatedResume.markdown);
      editorHooks.modifyCss(updatedResume.css);

      // Update styles state
      try {
        setStyles(JSON.parse(updatedResume.styles));
      } catch {
        setStyles(defaultStyles);
      }
    },
  );

  // AI Chat hook
  const chatHooks = useAIChat(
    sanitizedMarkdown,
    sanitizedCSS,
    sanitizedTitle,
    editorHooks.applyModification,
  );

  // Effect to warn user before closing tab with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (resumeActions.isDirty) {
        event.preventDefault();
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [resumeActions.isDirty]);

  // Add keyboard shortcut for Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (resumeActions.isDirty && !resumeActions.isSaving) {
          resumeActions.handleSave();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [resumeActions]);

  // Create editor state object for passing to layout components
  const editorState = {
    markdown,
    css,
    modifiedMarkdown: editorHooks.modifiedMarkdown,
    modifiedCss: editorHooks.modifiedCss,
    sanitizedMarkdown,
    sanitizedCSS,
    styles,
    setStyles,
  };

  return (
    <div className="grid grid-rows-[auto_1fr] h-[100%] max-h-[100%]">
      <ResumeHeader
        title={sanitizedTitle}
        onTitleChange={(newTitle) => setValue("title", newTitle)}
        updatedAt={updatedAt}
        resumeId={id}
        isSaving={resumeActions.isSaving}
        isDirty={resumeActions.isDirty}
        isPrinting={resumeActions.isPrinting}
        isDuplicating={resumeActions.isDuplicating}
        isDeleting={resumeActions.isDeleting}
        onSave={resumeActions.handleSave}
        onPrint={resumeActions.handlePrint}
        onDuplicate={resumeActions.handleDuplicate}
        onDelete={resumeActions.handleDelete}
      />

      <div className="relative flex flex-col min-h-0 h-full w-full bg-muted overflow-hidden">
        <MobileTabs
          activeTab={tabManager.mobileTab}
          onTabChange={tabManager.setMobileTab}
        />

        <DesktopLayout
          editorsTab={tabManager.editorsTab}
          previewTab={tabManager.previewTab}
          onEditorsTabChange={tabManager.setEditorsTab}
          onPreviewTabChange={tabManager.setPreviewTab}
          editorState={editorState}
          editorHooks={editorHooks}
          chatHooks={chatHooks}
          resumePreviewRef={resumePreviewRef}
        />

        <MobileLayout
          mobileTab={tabManager.mobileTab}
          onMobileTabChange={tabManager.setMobileTab}
          editorState={editorState}
          editorHooks={editorHooks}
          chatHooks={chatHooks}
          resumePreviewRef={resumePreviewRef}
        />
      </div>
    </div>
  );
}
