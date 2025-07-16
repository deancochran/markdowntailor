import { db, Resume } from "@/localforage";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface SaveResumeOptions {
  resume: Resume;
  // Callback for when save is successful
  onSaveSuccess: (updatedResume: Resume) => void;
}

export function useSaveResume({ resume, onSaveSuccess }: SaveResumeOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Store the baseline values to compare against
  const baselineRef = useRef({
    title: resume.title,
    markdown: resume.markdown,
    css: resume.css,
    styles: resume.styles,
  });
  const isInitializedRef = useRef(false);

  // Update baseline when component first mounts
  useEffect(() => {
    if (!isInitializedRef.current) {
      baselineRef.current = {
        title: resume.title,
        markdown: resume.markdown,
        css: resume.css,
        styles: resume.styles,
      };
      isInitializedRef.current = true;
    }
  }, [resume]);

  // Check if current values differ from baseline
  const checkIfDirty = useCallback(() => {
    const currentValues = {
      title: resume.title,
      markdown: resume.markdown,
      css: resume.css,
      styles: resume.styles,
    };
    const baseline = baselineRef.current;

    const hasChanges =
      baseline.title !== currentValues.title ||
      baseline.markdown !== currentValues.markdown ||
      baseline.css !== currentValues.css ||
      baseline.styles !== currentValues.styles;

    setIsDirty(hasChanges);

    return hasChanges;
  }, [resume]);

  // Save function
  const save = useCallback(async () => {
    if (isSaving || !resume.id) return;

    try {
      setIsSaving(true);

      const result = await db.resumes.update(resume.id, {
        title: resume.title,
        markdown: resume.markdown,
        css: resume.css,
        styles: resume.styles,
      });
      if (!result) {
        throw new Error("Failed to save resume");
      }

      // Update baseline with values from the server
      baselineRef.current = {
        title: result.title ?? "",
        markdown: result.markdown ?? "",
        css: result.css ?? "",
        styles: result.styles ?? "",
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
  }, [resume, isSaving, onSaveSuccess]);

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
