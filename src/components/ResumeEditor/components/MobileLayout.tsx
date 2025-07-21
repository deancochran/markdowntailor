"use client";
import { ResumePreviewRef } from "@/components/ResumePreview";
import { useTheme } from "next-themes";
import { EditorState, UseResumeEditorsReturn } from "../types";
import { CSSEditor } from "./CSSEditor";
import { MarkdownEditor } from "./MarkdownEditor";
import { PreviewPanel } from "./PreviewPanel";

type MobileLayoutProps = {
  mobileTab: "markdown" | "css" | "preview";
  onMobileTabChange: (tab: "markdown" | "css" | "preview") => void;
  editorState: EditorState;
  editorHooks: UseResumeEditorsReturn;
  resumePreviewRef: React.RefObject<ResumePreviewRef | null>;
};

export function MobileLayout({
  mobileTab,
  onMobileTabChange: _onMobileTabChange,
  editorState,
  editorHooks,
  resumePreviewRef,
}: MobileLayoutProps) {
  const { theme } = useTheme();

  return (
    <div className="flex lg:hidden flex-col min-h-0 h-full w-full border overflow-hidden">
      <div className="flex-1 relative">
        <MarkdownEditor
          originalMarkdown={editorState.markdown}
          modifiedMarkdown={editorState.modifiedMarkdown}
          onMount={editorHooks.createEditorMount(
            editorHooks.modifiedMarkdownEditorRef,
            editorHooks.modifyMarkdown,
          )}
          theme={theme}
          isVisible={mobileTab === "markdown"}
        />

        <CSSEditor
          originalCss={editorState.css}
          modifiedCss={editorState.modifiedCss}
          onMount={editorHooks.createEditorMount(
            editorHooks.modifiedCssEditorRef,
            editorHooks.modifyCss,
          )}
          theme={theme}
          isVisible={mobileTab === "css"}
          styles={editorState.styles}
          onStylesChange={editorState.setStyles}
        />

        <PreviewPanel
          markdown={editorState.sanitizedMarkdown}
          css={editorState.sanitizedCSS}
          styles={editorState.styles}
          resumePreviewRef={resumePreviewRef}
          isVisible={mobileTab === "preview"}
        />
      </div>
    </div>
  );
}
