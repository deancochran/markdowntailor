import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface AutoSaveOptions {
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
  delay?: number;
  enabled?: boolean;
}

interface AutoSaveState {
  isSaving: boolean;
  isDirty: boolean;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
}

interface AutoSaveReturn extends AutoSaveState {
  save: () => Promise<
    | {
        id: string;
        userId: string;
        title: string;
        markdown: string;
        css: string;
        content: string;
        createdAt: Date;
        updatedAt: Date;
      }
    | undefined
  >;
  resetDirty: () => void;
  enableAutoSave: () => void;
  disableAutoSave: () => void;
}

export function useAutoSave({
  resumeId,
  title,
  markdown,
  css,
  saveFunction,
  delay = 2000,
  enabled = true,
}: AutoSaveOptions): AutoSaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(enabled);

  // Store the baseline values to compare against
  const baselineRef = useRef({ title, markdown, css });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
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
    setHasUnsavedChanges(hasChanges);

    return hasChanges;
  }, [title, markdown, css]);

  // Manual save function
  const save = useCallback(async () => {
    if (isSaving || !resumeId) return;

    try {
      setIsSaving(true);

      const result = await saveFunction(resumeId, {
        title,
        markdown,
        css,
      });

      // Update baseline to current values
      baselineRef.current = { title, markdown, css };
      setIsDirty(false);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());

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
  }, [resumeId, title, markdown, css, saveFunction, isSaving]);

  // Auto-save effect with debouncing
  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Don't auto-save if disabled or no changes
    if (!autoSaveEnabled || !checkIfDirty() || isSaving) {
      return;
    }

    // Set up debounced save
    timeoutRef.current = setTimeout(() => {
      if (autoSaveEnabled && !isSaving && checkIfDirty()) {
        save().catch(() => {
          // Error already handled in save function
        });
      }
    }, delay);

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    title,
    markdown,
    css,
    autoSaveEnabled,
    delay,
    save,
    isSaving,
    checkIfDirty,
  ]);

  // Check dirty state whenever content changes
  useEffect(() => {
    checkIfDirty();
  }, [checkIfDirty]);

  // Reset dirty state function
  const resetDirty = useCallback(() => {
    baselineRef.current = { title, markdown, css };
    setIsDirty(false);
    setHasUnsavedChanges(false);
  }, [title, markdown, css]);

  // Enable/disable auto-save
  const enableAutoSave = useCallback(() => {
    setAutoSaveEnabled(true);
  }, []);

  const disableAutoSave = useCallback(() => {
    setAutoSaveEnabled(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isSaving,
    isDirty,
    hasUnsavedChanges,
    lastSaved,
    save,
    resetDirty,
    enableAutoSave,
    disableAutoSave,
  };
}
