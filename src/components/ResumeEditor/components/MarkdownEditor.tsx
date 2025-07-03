import { diffEditorOptions } from "@/lib/utils/monacoOptions";
import { DiffEditor } from "@monaco-editor/react";
import { cx } from "class-variance-authority";
import { MarkdownEditorProps } from "../types";

export function MarkdownEditor({
  originalMarkdown,
  modifiedMarkdown,
  onMount,
  theme,
  isVisible,
}: MarkdownEditorProps) {
  return (
    <div
      className={cx(
        "absolute inset-0",
        isVisible ? "block" : "hidden",
      )}
    >
      <DiffEditor
        key="markdown-editor"
        language="markdown"
        original={originalMarkdown}
        modified={modifiedMarkdown}
        keepCurrentOriginalModel={true}
        keepCurrentModifiedModel={true}
        onMount={onMount}
        options={diffEditorOptions}
        theme={theme === "dark" ? "vs-dark" : "light"}
        height="100%"
      />
    </div>
  );
}
