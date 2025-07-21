"use client";
import { ResumePreviewRef } from "@/components/ResumePreview";
import { useSaveResume } from "./useSaveResume";

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
      } catch {
        toast.error("Failed to delete resume");
      } finally {
        setIsDeleting(false);
      }
      redirect("/resumes");
    }
  }, [resume.id]);

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
    try {
      const newResume = await db.resumes.createFromResume({
        markdown: resume.markdown,
        css: resume.css,
        styles: resume.styles,
      });

      toast.success("Resume duplicated successfully");
      redirect(`/resumes/${newResume.id}`);
    } catch {
      toast.error("Failed to duplicate resume");
    } finally {
      setIsDuplicating(false);
    }
  }, [resume.markdown, resume.css, resume.styles]);

  const handleSave = useCallback(async () => {
    console.log("handleSave called, isDirty:", isDirty);
    console.log("Current resume:", resume);

    if (!isDirty) {
      toast.info("No changes to save");
      return;
    }

    try {
      const result = await save();
      console.log("Save result:", result);
    } catch (error) {
      console.error("Save failed:", error);
      // Error handling is already done in the save function
    }
  }, [save, isDirty, resume]);

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
