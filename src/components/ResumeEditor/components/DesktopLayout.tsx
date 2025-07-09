import { ResumePreviewRef } from "@/components/ResumePreview";
import { useTheme } from "next-themes";
import { EditorState, UseAIChatReturn, UseResumeEditorsReturn } from "../types";
import { CSSEditor } from "./CSSEditor";
import { ChatPanel } from "./ChatPanel";
import { MarkdownEditor } from "./MarkdownEditor";
import { PreviewPanel } from "./PreviewPanel";
import { EditorTabs, PreviewTabs } from "./TabComponents";

type DesktopLayoutProps = {
  editorsTab: "markdown" | "css";
  previewTab: "preview" | "chat";
  onEditorsTabChange: (tab: "markdown" | "css") => void;
  onPreviewTabChange: (tab: "preview" | "chat") => void;
  editorState: EditorState;
  editorHooks: UseResumeEditorsReturn;
  chatHooks: UseAIChatReturn;
  resumePreviewRef: React.RefObject<ResumePreviewRef | null>;
  userCredits: string | null;
};

export function DesktopLayout({
  editorsTab,
  previewTab,
  onEditorsTabChange,
  onPreviewTabChange,
  editorState,
  editorHooks,
  chatHooks,
  resumePreviewRef,
  userCredits,
}: DesktopLayoutProps) {
  const { theme } = useTheme();

  return (
    <div className="hidden lg:flex flex-row min-h-0 h-full w-full gap-4 overflow-hidden">
      {/* Left Column - Editors */}
      <div className="h-full w-full flex flex-col border">
        <EditorTabs activeTab={editorsTab} onTabChange={onEditorsTabChange} />

        <div className="flex-1 relative">
          <MarkdownEditor
            originalMarkdown={editorState.markdown}
            modifiedMarkdown={editorState.modifiedMarkdown}
            onMount={editorHooks.createEditorMount(
              editorHooks.modifiedMarkdownEditorRef,
              editorHooks.modifyMarkdown,
            )}
            theme={theme}
            isVisible={editorsTab === "markdown"}
          />

          <CSSEditor
            originalCss={editorState.css}
            modifiedCss={editorState.modifiedCss}
            onMount={editorHooks.createEditorMount(
              editorHooks.modifiedCssEditorRef,
              editorHooks.modifyCss,
            )}
            theme={theme}
            isVisible={editorsTab === "css"}
            styles={editorState.styles}
            onStylesChange={editorState.setStyles}
          />
        </div>
      </div>

      {/* Right Column - Preview/Chat */}
      <div className="h-full w-full overflow-hidden flex flex-col border">
        <PreviewTabs activeTab={previewTab} onTabChange={onPreviewTabChange} />

        <div className="flex-1 relative">
          <PreviewPanel
            markdown={editorState.sanitizedMarkdown}
            css={editorState.sanitizedCSS}
            styles={editorState.styles}
            resumePreviewRef={resumePreviewRef}
            isVisible={previewTab === "preview"}
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
            isVisible={previewTab === "chat"}
          />
        </div>
      </div>
    </div>
  );
}
