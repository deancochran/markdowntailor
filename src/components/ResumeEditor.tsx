"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { resume as Resume } from "@/db/schema";
import { deleteResume, saveResume } from "@/lib/actions/resume"; // Import deleteResume
import { generateHTMLContent } from "@/lib/utils/htmlGenerator";
import { printDocument } from "@/lib/utils/printUtils";
import { InferSelectModel } from "drizzle-orm";
import { redirect } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { EditorChatPreview } from "./EditorChatPreview";
import { EditorHeader } from "./EditorHeader";

import { DiffEditor } from "@monaco-editor/react";
import { useTheme } from "next-themes";

export default function ResumeEditor({
  resume,
}: {
  resume: InferSelectModel<typeof Resume>;
}) {
  const { register, setValue, watch } = useForm({
    defaultValues: resume,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const id = watch("id");
  const title = watch("title");
  const markdown = watch("markdown");
  const css = watch("css");

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

  const [editorsTab, setEditorsTab] = useState("markdown");
  const { setTheme, theme } = useTheme();
  return (
    <div className="grid grid-rows-[auto_1fr] h-[100%] max-h-[100%]">
      <EditorHeader
        register={register}
        isSaving={isSaving}
        onSave={handleSave}
        isDeleting={isDeleting}
        onDelete={handleDelete}
        onGeneratePdf={handleGeneratePdf}
        onDownloadHTML={handleDownloadHTML}
      />

      {/* This parent container does NOT need overflow-hidden
              because EditorSidebar and EditorChatPreview now manage their own overflow. */}
      <div className="relative grid grid-cols-2 min-h-0 p-4 h-full bg-muted">
        {/* These components internally ensure they are h-full and manage their scroll */}
        <div className="relative overflow-hidden">
          <Tabs
            value={editorsTab}
            onValueChange={setEditorsTab}
            className="flex flex-col gap-0 h-full border overflow-hidden"
          >
            <TabsList className="w-full flex justify-start border-b rounded-none px-4 flex-shrink-0">
              <TabsTrigger value="markdown" className="px-4 py-2">
                Markdown
              </TabsTrigger>
              <TabsTrigger value="css" className="px-4 py-2">
                CSS
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="markdown"
              className="flex-1 min-h-0 overflow-hidden"
            >
              <DiffEditor
                language="markdown"
                original={markdown}
                modified={markdown}
                options={{
                  automaticLayout: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  renderSideBySide: false,
                  cursorSmoothCaretAnimation: "on",
                  smoothScrolling: true,
                  scrollBeyondLastLine: true,
                  lineNumbers: "off",
                  renderGutterMenu: false,
                  renderOverviewRuler: false,
                  minimap: {
                    enabled: false,
                  },
                }}
                theme={theme === "dark" ? "vs-dark" : "light"}
              />
            </TabsContent>
            <TabsContent value="css" className="flex-1 min-h-0 overflow-hidden">
              <DiffEditor
                language="css"
                original={css}
                modified={css}
                options={{
                  automaticLayout: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  renderSideBySide: false,
                  cursorSmoothCaretAnimation: "on",
                  smoothScrolling: true,
                  scrollBeyondLastLine: true,
                  lineNumbers: "off",
                  renderGutterMenu: false,
                  renderOverviewRuler: false,
                  minimap: {
                    enabled: false,
                  },
                }}
                theme={theme === "dark" ? "vs-dark" : "light"}
              />
            </TabsContent>
          </Tabs>
        </div>
        <EditorChatPreview markdown={markdown} css={css} setValue={setValue} />
      </div>
    </div>
  );
}
