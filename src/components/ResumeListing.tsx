"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createResumeFromVersion, deleteResume } from "@/lib/actions/resume";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "./ui/card";

// Resume type with added optimistic state flags
export type Resume = {
  id: string;
  userId: string;
  title: string;
  markdown: string;
  css: string;
  styles: string;
  createdAt: Date;
  updatedAt: Date;
  _isOptimistic?: boolean;
  _isDeleting?: boolean;
};

// Main component to list resumes
export default function ResumeListing({
  initialResumes = [],
}: {
  initialResumes: Resume[];
}) {
  const [_isPending, startTransition] = useTransition();
  const [optimisticResumes, updateOptimisticResumes] = useOptimistic(
    initialResumes,
    (
      state: Resume[],
      action: {
        type: string;
        resume?: Resume;
        id?: string;
        title?: string;
        isDeleting?: boolean;
      },
    ) => {
      switch (action.type) {
        case "ADD":
          return action.resume
            ? [...state, { ...action.resume, _isOptimistic: true }]
            : state;
        case "DELETE":
          return state.map((r) =>
            r.id === action.id ? { ...r, _isDeleting: action.isDeleting } : r,
          );
        case "REMOVE":
          return state.filter((r) => r.id !== action.id);
        case "RENAME":
          return state.map((r) =>
            r.id === action.id && action.title
              ? { ...r, title: action.title }
              : r,
          );
        default:
          return state;
      }
    },
  );

  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {optimisticResumes.map((resume) => (
          <ResumeCard
            key={resume.id}
            resume={resume}
            updateOptimisticResumes={updateOptimisticResumes}
            startTransition={startTransition}
          />
        ))}
      </div>
    </div>
  );
}

// Card component for a single resume
function ResumeCard({
  resume,
  updateOptimisticResumes,
  startTransition,
}: {
  resume: Resume;
  updateOptimisticResumes: (action: {
    type: string;
    resume?: Resume;
    id?: string;
  }) => void;
  startTransition: (callback: () => Promise<void> | void) => void;
}) {
  const isLoading = resume._isOptimistic || resume._isDeleting;

  return (
    <Card className={`transition-opacity ${isLoading ? "opacity-50" : ""}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium truncate">
            {resume.title}
          </CardTitle>
          <ResumeDropdownMenu
            resume={resume}
            resumeId={resume.id}
            resumeTitle={resume.title}
            updateOptimisticResumes={updateOptimisticResumes}
            startTransition={startTransition}
            isOptimistic={resume._isOptimistic}
            isDeleting={resume._isDeleting}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Updated {new Date(resume.updatedAt).toLocaleDateString()}
        </p>
      </CardHeader>

      <CardFooter className="pt-0">
        <div className="flex w-full gap-2">
          <Button asChild variant="default" className="flex-1">
            <Link href={`/resumes/${resume.id}`}>Edit</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

// Dropdown menu with actions for a resume
function ResumeDropdownMenu({
  resume,
  resumeId,
  updateOptimisticResumes,
  startTransition,
  isOptimistic,
  isDeleting,
}: {
  resume: Resume;
  resumeId: string;
  resumeTitle: string;
  updateOptimisticResumes: (action: {
    type: string;
    resume?: Resume;
    id?: string;
    title?: string;
    isDeleting?: boolean;
  }) => void;
  startTransition: (callback: () => Promise<void> | void) => void;
  isOptimistic?: boolean;
  isDeleting?: boolean;
}) {
  const [isDeletingOpen, setIsDeletingOpen] = useState(false);

  const handleCopy = async () => {
    try {
      const optimisticResume = {
        ...resume,
        title: `${resume.title} (Copy)`,
      };

      updateOptimisticResumes({ type: "ADD", resume: optimisticResume });

      startTransition(async () => {
        await createResumeFromVersion(resume.id);
        toast.success("Resume copied successfully");
      });
    } catch (_error) {
      toast.error("Failed to copy resume");
    }
  };

  const handleDelete = async () => {
    try {
      startTransition(async () => {
        updateOptimisticResumes({
          type: "DELETE",
          id: resumeId,
          isDeleting: true,
        });

        await deleteResume(resumeId);
        toast.success("Resume deleted successfully");
      });
    } catch (_error) {
      toast.error("Failed to delete resume");
      updateOptimisticResumes({
        type: "DELETE",
        id: resumeId,
        isDeleting: false,
      });
    }
  };

  if (isOptimistic || isDeleting) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <MoreHorizontal className="h-4 w-4 animate-pulse" />
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onSelect={handleCopy}>Copy Resume</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => setIsDeletingOpen(true)}
          >
            Delete Resume
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeletingOpen} onOpenChange={setIsDeletingOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resume</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this resume? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
