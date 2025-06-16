import type { editor } from "monaco-editor";

// DIFF EDITOR Options
export const diffEditorOptions: editor.IDiffEditorConstructionOptions = {
  renderSideBySide: false,
  cursorSmoothCaretAnimation: "on",
  smoothScrolling: true,
  scrollBeyondLastLine: true,
  lineNumbers: "off",
  renderOverviewRuler: false,
  formatOnPaste: true,
  formatOnType: true,
  minimap: {
    enabled: false,
  },
  renderGutterMenu: false,
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
