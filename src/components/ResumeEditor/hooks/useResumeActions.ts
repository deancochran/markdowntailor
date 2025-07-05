import { ResumePreviewRef } from "@/components/ResumePreview";
import { resume as Resume } from "@/db/schema";
import { useSaveResume } from "@/hooks/useSaveResume";
import {
  createResumeFromVersion,
  deleteResume,
  saveResume,
} from "@/lib/actions/resume";
import { InferSelectModel } from "drizzle-orm";
import { redirect } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { UseResumeActionsReturn } from "../types";
export function useResumeActions(
  resumeId: string,
  resumeTitle: string,
  title: string,
  markdown: string,
  css: string,
  styles: string,
  resumePreviewRef: React.RefObject<ResumePreviewRef | null>,
  onSaveSuccess: (updatedResume: InferSelectModel<typeof Resume>) => void,
): UseResumeActionsReturn {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Manual save functionality
  const { isSaving, isDirty, save } = useSaveResume({
    resumeId,
    title,
    markdown,
    css,
    styles,
    saveFunction: saveResume,
    onSaveSuccess,
  });

  const handleDelete = useCallback(async () => {
    if (window.confirm("Are you sure you want to delete this resume?")) {
      setIsDeleting(true);
      try {
        await deleteResume(resumeId);
        toast.success("Resume deleted successfully");
        redirect("/resumes");
      } catch {
        toast.error("Failed to delete resume");
      } finally {
        setIsDeleting(false);
      }
    }
  }, [resumeId]);
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
    let response;
    try {
      response = await createResumeFromVersion(resumeId);
      toast.success("Resume duplicated successfully");
    } catch {
      toast.error("Failed to duplicate resume");
    } finally {
      setIsDuplicating(false);
    }
    if (response) {
      redirect(`/resumes/${response.resumeId}`);
    }
  }, [resumeId]);

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
