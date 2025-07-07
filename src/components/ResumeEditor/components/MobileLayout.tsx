import { ResumePreviewRef } from "@/components/ResumePreview";
import { useTheme } from "next-themes";
import { EditorState, UseAIChatReturn, UseResumeEditorsReturn } from "../types";
import { CSSEditor } from "./CSSEditor";
import { ChatPanel } from "./ChatPanel";
import { MarkdownEditor } from "./MarkdownEditor";
import { PreviewPanel } from "./PreviewPanel";

type MobileLayoutProps = {
  mobileTab: "markdown" | "css" | "preview" | "chat";
  onMobileTabChange: (tab: "markdown" | "css" | "preview" | "chat") => void;
  editorState: EditorState;
  editorHooks: UseResumeEditorsReturn;
  chatHooks: UseAIChatReturn;
  resumeRef: React.RefObject<HTMLDivElement | null>;
  resumePreviewRef: React.RefObject<ResumePreviewRef | null>;
  userCredits: string | null;
};

export function MobileLayout({
  mobileTab,
  onMobileTabChange: _onMobileTabChange,
  editorState,
  editorHooks,
  chatHooks,
  resumeRef,
  resumePreviewRef,
  userCredits,
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
          resumeRef={resumeRef}
          resumePreviewRef={resumePreviewRef}
          isVisible={mobileTab === "preview"}
        />

        <ChatPanel
          messages={chatHooks.messages}
          setMessages={chatHooks.setMessages}
          input={chatHooks.input}
          setInput={chatHooks.setInput}
          handleSubmit={chatHooks.handleSubmit}
          status={chatHooks.status}
          stop={chatHooks.stop}
          reload={chatHooks.reload}
          attachments={chatHooks.attachments}
          setAttachments={chatHooks.setAttachments}
          featureDisabled={chatHooks.featureDisabled}
          userCredits={userCredits}
          isVisible={mobileTab === "chat"}
        />
      </div>
    </div>
  );
}
