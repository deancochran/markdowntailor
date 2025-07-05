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
    const resumeElement = resumeRef.current;
    if (!resumeElement) {
      setIsPrinting(false);
      return;
    }

    // Get content
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

    const htmlContent = containerElement.getContentForPrint();

    // Create a hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";

    // Add to DOM
    document.body.appendChild(iframe);

    // Write content to iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      setIsPrinting(false);
      return;
    }

    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${resumeTitle} - Resume</title>
          <style>
            @media print {
              @page { margin: 0; }
              body { margin: 0; }
            }
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          </style>
        </head>
        <body>${htmlContent}</body>
      </html>
    `);
    iframeDoc.close();

    // Print when loaded
    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      // Remove iframe after printing
      setTimeout(() => {
        document.body.removeChild(iframe);
        setIsPrinting(false);
      }, 100);
    };

    // Fallback timeout
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      setIsPrinting(false);
    }, 5000);
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
