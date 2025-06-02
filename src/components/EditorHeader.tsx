// EditorComponents/EditorHeader.tsx
"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer, Save, Trash } from "lucide-react";
import Link from "next/link";

interface EditorHeaderProps {
  register: unknown;
  isSaving: boolean;
  onSave: () => void;
  isDeleting: boolean;
  onDelete: () => void;
  onGeneratePdf: () => void;
  onDownloadHTML: () => void;
}

export function EditorHeader({
  register,
  isSaving,
  onSave,
  isDeleting,
  onDelete,
  onGeneratePdf,
  onDownloadHTML,
}: EditorHeaderProps) {
  return (
    <div className="w-full flex h-14 items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <Link href="/resumes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Resumes</span>
          </Button>
        </Link>
        <input
          {...register("title")}
          placeholder="Resume Title"
          className="text-xl font-semibold bg-transparent focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={onSave}
          disabled={isSaving}
          variant="outline"
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save"}
        </Button>

        <Button
          onClick={onGeneratePdf}
          variant="outline"
          className="gap-2"
          data-testid="export-pdf-button"
        >
          <Printer className="h-4 w-4" />
          Print PDF
        </Button>

        <Button
          onClick={onDownloadHTML}
          variant="outline"
          className="gap-2"
          data-testid="download-html-button"
        >
          <Download className="h-4 w-4" />
          Download HTML
        </Button>

        <Button
          onClick={onDelete}
          disabled={isDeleting}
          variant="outline"
          className="gap-2"
        >
          <Trash className="h-4 w-4" />
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  );
}
