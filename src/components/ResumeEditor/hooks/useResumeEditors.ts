import type { editor } from "monaco-editor";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { IRange, Modification, UseResumeEditorsReturn } from "../types";

export function useResumeEditors(
  initialMarkdown: string,
  initialCss: string,
): UseResumeEditorsReturn {
  const [modifiedMarkdown, modifyMarkdown] = useState(initialMarkdown);
  const [modifiedCss, modifyCss] = useState(initialCss);

  // Refs to store editor instances for proper cleanup
  const modifiedCssEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const modifiedMarkdownEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Consolidated editor mount creator with better formatting preservation
  const createEditorMount = useCallback(
    (
      ref: React.MutableRefObject<editor.IStandaloneCodeEditor | null>,
      setter: (value: string) => void,
    ) => (diffEditor: editor.IStandaloneDiffEditor) => {
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

  // Better modification application with formatting preservation
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

            // Use pushEditOperations for better undo/redo and formatting preservation
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

      // Restore scroll position and selection after modification
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

  return {
    modifiedMarkdown,
    modifiedCss,
    modifyMarkdown,
    modifyCss,
    modifiedMarkdownEditorRef,
    modifiedCssEditorRef,
    createEditorMount,
    applyModification,
  };
}
