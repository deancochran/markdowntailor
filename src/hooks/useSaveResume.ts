import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface SaveResumeOptions {
  resumeId: string;
  title: string;
  markdown: string;
  css: string;
  saveFunction: (
    id: string,
    data: { title: string; markdown: string; css: string },
  ) => Promise<{
    id: string;
    userId: string;
    title: string;
    markdown: string;
    css: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  // Callback for when save is successful
  onSaveSuccess: (updatedResume: {
    id: string;
    userId: string;
    title: string;
    markdown: string;
    css: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }) => void;
}

export function useSaveResume({
  resumeId,
  title,
  markdown,
  css,
  saveFunction,
  onSaveSuccess,
}: SaveResumeOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Store the baseline values to compare against
  const baselineRef = useRef({ title, markdown, css });
  const isInitializedRef = useRef(false);

  // Update baseline when component first mounts
  useEffect(() => {
    if (!isInitializedRef.current) {
      baselineRef.current = { title, markdown, css };
      isInitializedRef.current = true;
    }
  }, [title, css, markdown]);
  // Check if current values differ from baseline
  const checkIfDirty = useCallback(() => {
    const currentValues = { title, markdown, css };
    const baseline = baselineRef.current;

    const hasChanges =
      baseline.title !== currentValues.title ||
      baseline.markdown !== currentValues.markdown ||
      baseline.css !== currentValues.css;

    setIsDirty(hasChanges);

    return hasChanges;
  }, [title, markdown, css]);

  // Save function
  const save = useCallback(async () => {
    if (isSaving || !resumeId) return;

    try {
      setIsSaving(true);

      const result = await saveFunction(resumeId, {
        title,
        markdown,
        css,
      });

      // Update baseline with values from the server
      baselineRef.current = {
        title: result.title,
        markdown: result.markdown,
        css: result.css,
      };

      setIsDirty(false);
      setLastSaved(new Date());

      // Call onSaveSuccess callback with the updated resume
      onSaveSuccess(result);

      toast.success("Resume saved successfully");
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save resume";
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [resumeId, title, markdown, css, saveFunction, isSaving, onSaveSuccess]);

  // Check dirty state whenever content changes
  useEffect(() => {
    checkIfDirty();
  }, [checkIfDirty]);

  return {
    isSaving,
    isDirty,
    lastSaved,
    save,
  };
}
