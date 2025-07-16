"use client";
import { ResumePreviewRef } from "@/components/ResumePreview";
import { useSaveResume } from "@/hooks/useSaveResume";

import { db, Resume } from "@/localforage";
import { redirect } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { UseResumeActionsReturn } from "../types";
export function useResumeActions(
  resume: Resume,
  resumePreviewRef: React.RefObject<ResumePreviewRef | null>,
  onSaveSuccess: (updatedResume: Resume) => void,
): UseResumeActionsReturn {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Manual save functionality
  const { isSaving, isDirty, save } = useSaveResume({
    resume,
    onSaveSuccess,
  });

  const handleDelete = useCallback(async () => {
    if (window.confirm("Are you sure you want to delete this resume?")) {
      setIsDeleting(true);
      try {
        await db.resumes.delete(resume.id);
        toast.success("Resume deleted successfully");
        redirect("/resumes");
      } catch {
        toast.error("Failed to delete resume");
      } finally {
        setIsDeleting(false);
      }
    }
  }, [resume]);
  const handlePrint = useCallback(() => {
    setIsPrinting(true);

    try {
      // Call the print method on the preview component
      if (resumePreviewRef.current?.print) {
        resumePreviewRef.current.print();
      } else {
        // Fallback to window.print if ref not available
        window.print();
      }
    } catch (error) {
      console.error("Print failed:", error);
      toast.error("Failed to print resume");
    } finally {
      setIsPrinting(false);
    }
  }, [resumePreviewRef]);
  const handleDuplicate = useCallback(async () => {
    setIsDuplicating(true);
    let newResume;
    try {
      newResume = await db.resumes.createFromResume({
        markdown: resume.markdown,
        css: resume.css,
        styles: resume.styles,
      });
      toast.success("Resume duplicated successfully");
    } catch {
      toast.error("Failed to duplicate resume");
    } finally {
      setIsDuplicating(false);
    }
    if (newResume) {
      redirect(`/resumes/${newResume.id}`);
    }
  }, [resume]);

  const handleSave = useCallback(async () => {
    try {
      await save();
    } catch (error) {
      console.error("Save failed:", error);
    }
  }, [save]);

  return {
    isDeleting,
    isPrinting,
    isDuplicating,
    handleDelete,
    handlePrint,
    handleDuplicate,
    handleSave,
    isSaving,
    isDirty,
  };
}
