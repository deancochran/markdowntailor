import StylesControls from "@/components/StylesControls";
import { diffEditorOptions } from "@/lib/utils/monacoOptions";
import { DiffEditor } from "@monaco-editor/react";
import { cx } from "class-variance-authority";
import { CSSEditorProps } from "../types";

export function CSSEditor({
  originalCss,
  modifiedCss,
  onMount,
  theme,
  isVisible,
  styles,
  onStylesChange,
}: CSSEditorProps) {
  return (
    <div
      className={cx(
        "absolute inset-0 flex flex-col",
        isVisible ? "block" : "hidden",
      )}
    >
      <StylesControls styles={styles} onStylesChange={onStylesChange} />
      <div className="flex-1">
        <DiffEditor
          key="css-editor"
          language="css"
          original={originalCss}
          modified={modifiedCss}
          keepCurrentOriginalModel={true}
          keepCurrentModifiedModel={true}
          onMount={onMount}
          options={diffEditorOptions}
          theme={theme === "dark" ? "vs-dark" : "light"}
          height="100%"
        />
      </div>
    </div>
  );
}
