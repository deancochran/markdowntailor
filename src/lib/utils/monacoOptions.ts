import type { editor } from "monaco-editor";

// DIFF EDITOR Options
export const diffEditorOptions: editor.IDiffEditorConstructionOptions = {
  automaticLayout: true,
  formatOnPaste: true,
  formatOnType: true,
  renderSideBySide: false,
  cursorSmoothCaretAnimation: "on",
  smoothScrolling: true,
  scrollBeyondLastLine: true,
  lineNumbers: "off",
  renderGutterMenu: false,
  renderOverviewRuler: false,
  minimap: {
    enabled: false,
  },
};

export const templatePreviewOptions: editor.IStandaloneEditorConstructionOptions =
  {
    readOnly: true,
    scrollBeyondLastLine: false,
    lineNumbers: "off",
  };

export const versionDiffEditorOptions: editor.IDiffEditorConstructionOptions = {
  readOnly: true,
  renderSideBySide: true,
  cursorSmoothCaretAnimation: "on",
  smoothScrolling: true,
  scrollBeyondLastLine: true,
  lineNumbers: "on",
};
