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
  resumeRef: React.RefObject<HTMLDivElement>,
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
    const resumeElement = resumeRef.current;
    if (!resumeElement) {
      setIsPrinting(false);
      return;
    }

    // Access the container that has the getContentForPrint method
    const containerElement = resumeElement.querySelector(
      "div[class^='flex flex-col h-full']",
    ) as HTMLDivElement;

    if (
      !containerElement ||
      typeof containerElement.getContentForPrint !== "function"
    ) {
      toast.error("Could not prepare resume for printing");
      setIsPrinting(false);
      return;
    }

    // Get the properly formatted HTML content for printing using the component's method
    const htmlContent = containerElement.getContentForPrint();

    // Save current document content
    const originalContent = document.body.innerHTML;
    const originalTitle = document.title;

    // Replace current document content with resume content
    document.body.innerHTML = htmlContent;
    document.title = `${resumeTitle} - Resume`;

    // Print the current window
    window.print();

    // Restore original content after printing
    document.body.innerHTML = originalContent;
    document.title = originalTitle;

    setIsPrinting(false);
  }, [resumeRef, resumeTitle]);

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
