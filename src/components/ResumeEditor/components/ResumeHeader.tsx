import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    CheckCircle,
    Clock,
    Copy,
    Download,
    History,
    Loader2,
    Save,
    Trash2,
} from "lucide-react";
import Link from "next/link";
import { ResumeHeaderProps } from "../types";

export function ResumeHeader({
  title,
  onTitleChange,
  updatedAt,
  resumeId,
  isSaving,
  isDirty,
  isPrinting,
  isDuplicating,
  isDeleting,
  onSave,
  onPrint,
  onDuplicate,
  onDelete,
}: ResumeHeaderProps) {
  return (
    <div className="w-full flex flex-row items-center justify-between p-2 gap-8">
      <Input
        className="w-full text-xl font-semibold bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Untitled Resume"
      />
      <div className="flex flex-col w-full items-end justify-end gap-1">
        {/* Info and Actions Row */}
        <div className="flex items-center gap-1">
          {/* Last updated timestamp and versions link */}
          <div className="flex items-center text-xs text-muted-foreground gap-x-3">
            {/* Auto-save indicator */}
            <div className="flex items-center text-xs text-muted-foreground ml-2 shrink-0">
              {isSaving ? (
                <span className="flex items-center text-amber-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </span>
              ) : isDirty ? (
                <span className="flex items-center text-amber-500">
                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                  Unsaved changes
                </span>
              ) : (
                <span className="flex items-center text-green-500">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                  Saved
                </span>
              )}
            </div>
            <span className="inline-flex items-center">
              {updatedAt ? (
                <>
                  <Clock className="w-3 h-3 mr-1 hidden xs:inline" />
                  <span className="hidden xs:inline">Updated</span>{" "}
                  <time
                    dateTime={updatedAt.toISOString()}
                    className="whitespace-nowrap"
                  >
                    {updatedAt.toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </>
              ) : (
                "Not saved yet"
              )}
            </span>
          </div>
        </div>
        {/* Secondary Actions */}
        <div className="flex items-center gap-1">
          {/* Versions link */}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/resumes/${resumeId}/versions`}>
              <History className="w-3 h-3" />
              <span className="hidden sm:inline">Versions</span>
            </Link>
          </Button>
          {/* Save Button */}
          <Button
            onClick={onSave}
            disabled={isSaving || !isDirty}
            variant="outline"
            size="sm"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Save</span>
          </Button>
          {/* Print Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onPrint}
            disabled={isPrinting}
            aria-label="Print or download as PDF"
          >
            {isPrinting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Download</span>
          </Button>
          {/* Duplicate button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onDuplicate}
            disabled={isDuplicating}
          >
            {isDuplicating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Duplicate</span>
          </Button>

          {/* Delete button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
