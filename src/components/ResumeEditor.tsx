"use client";
import { resume as Resume } from "@/db/schema";
import { deleteResume, saveResume } from "@/lib/actions/resume"; // Import deleteResume
import { generateHTMLContent } from "@/lib/utils/htmlGenerator";
import { printDocument } from "@/lib/utils/printUtils";
import { InferSelectModel } from "drizzle-orm";
import { redirect } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { EditorHeader } from "./EditorHeader";
import { EditorPreview } from "./EditorPreview";
import { EditorSidebar } from "./EditorSideBar";

export default function ResumeEditor({
  resume,
}: {
  resume: InferSelectModel<typeof Resume>;
}) {
  const { register, setValue, watch } = useForm({
    defaultValues: resume,
  });

  const [activeTab, setActiveTab] = useState("markdown");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0.5);

  const id = watch("id");
  const title = watch("title");
  const markdown = watch("markdown");
  const css = watch("css");

  // Use iframe ref to completely isolate preview content
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Update the preview iframe whenever markdown or CSS changes
  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;

      if (iframeDoc) {
        // Wait for the rendering to complete
        setTimeout(() => {
          // Generate HTML content for the preview
          const htmlContent = generateHTMLContent(markdown, css);

          iframeDoc.open();
          iframeDoc.write(htmlContent);
          iframeDoc.close();
        }, 0);
      }
    }
  }, [markdown, css]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this resume?")) {
      setIsDeleting(true);
      try {
        await deleteResume(id);
      } catch {
        toast.error("Failed to delete resume");
      } finally {
        toast.success("Resume deleted successfully");
        redirect("/resumes");
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveResume({
        id,
        title,
        markdown,
        css,
        content: generateHTMLContent(markdown, css),
      });
      toast.success("Resume saved successfully");
    } catch {
      toast.error("Failed to save resume");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadHTML = () => {
    try {
      // Download logic
      toast.success("HTML file downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download HTML file");
    }
  };

  const handleGeneratePdf = () => {
    try {
      // PDF generation logic
      const htmlContent = generateHTMLContent(markdown, css);
      printDocument(htmlContent);
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  };

  // Zoom functionality
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2.0));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  };

  return (
    <div className="grid grid-row h-full">
      <EditorHeader
        register={register}
        isSaving={isSaving}
        onSave={handleSave}
        isDeleting={isDeleting}
        onDelete={handleDelete}
        onGeneratePdf={handleGeneratePdf}
        onDownloadHTML={handleDownloadHTML}
      />

      <div className="grid grid-cols-2 h-full border">
        <EditorSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          markdown={markdown}
          css={css}
          setValue={setValue}
        />

        <EditorPreview
          iframeRef={iframeRef}
          zoomLevel={zoomLevel}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />
      </div>
    </div>
  );
}
