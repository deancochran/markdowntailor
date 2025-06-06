"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createResumeFromVersion, deleteResume } from "@/lib/actions/resume";
import { generateHTMLContent } from "@/lib/utils/htmlGenerator";
import { printDocument } from "@/lib/utils/printUtils";
import {
  Calendar,
  Clock,
  Copy,
  Edit,
  FileText,
  MoreVertical,
  Printer,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

type Resume = {
  id: string;
  userId: string;
  title: string;
  markdown: string;
  css: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  _isOptimistic?: boolean;
  _isDeleting?: boolean;
};

export default function ResumeListing({
  resumes: initialResumes,
}: {
  resumes: Resume[];
}) {
  const [_isPending, startTransition] = useTransition();
  const [optimisticResumes, updateOptimisticResumes] = useOptimistic(
    initialResumes,
    (
      state: Resume[],
      action: { type: string; resume?: Resume; id?: string },
    ) => {
      switch (action.type) {
        case "ADD":
          return action.resume
            ? [{ ...action.resume, _isOptimistic: true }, ...state]
            : state;
        case "DELETE":
          return state.map((r) =>
            r.id === action.id ? { ...r, _isDeleting: true } : r,
          );
        case "REMOVE":
          return state.filter((r) => r.id !== action.id);
        default:
          return state;
      }
    },
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <div className="w-full h-full">
      <Card className="border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl flex items-center gap-2">
            <FileText className="h-6 w-6" />
            My Resumes
          </CardTitle>
        </CardHeader>
        {optimisticResumes.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center py-16 px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="rounded-full bg-muted p-6 mb-4">
                <FileText size={48} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Resumes Yet</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Get started by creating your first resume using the form above.
                Build professional resumes with our easy-to-use editor.
              </p>
            </motion.div>
          </CardContent>
        ) : (
          <CardContent className="p-6">
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="popLayout">
                {optimisticResumes.map((resume) => (
                  <motion.div
                    key={resume.id}
                    variants={itemVariants}
                    layout
                    exit="exit"
                    className={resume._isDeleting ? "pointer-events-none" : ""}
                  >
                    <ResumeCard
                      resume={resume}
                      updateOptimisticResumes={updateOptimisticResumes}
                      startTransition={startTransition}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

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
  const cardVariants = {
    hover: {
      scale: 1.02,
      y: -4,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1,
      },
    },
  };

  return (
    <motion.div variants={cardVariants} whileHover="hover" whileTap="tap">
      <Card
        className={`
        group transition-all duration-200 border bg-card
        ${resume._isOptimistic ? "bg-blue-50/50 border-blue-200" : "hover:shadow-lg hover:border-primary/20"}
        ${resume._isDeleting ? "opacity-50 bg-red-50/50 border-red-200" : ""}
      `}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <Link href={`/resumes/${resume.id}`} className="flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {resume.title}
                {resume._isOptimistic && (
                  <motion.span
                    className="text-xs text-blue-600 ml-2 font-normal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    (Saving...)
                  </motion.span>
                )}
                {resume._isDeleting && (
                  <motion.span
                    className="text-xs text-red-600 ml-2 font-normal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    (Deleting...)
                  </motion.span>
                )}
              </CardTitle>
            </Link>
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
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Metadata */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Created:{" "}
                  {(() => {
                    const created = new Date(resume.createdAt);
                    const now = new Date();
                    const isSameDay =
                      created.getFullYear() === now.getFullYear() &&
                      created.getMonth() === now.getMonth() &&
                      created.getDate() === now.getDate();
                    return isSameDay
                      ? created.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : created.toLocaleDateString();
                  })()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  Updated:{" "}
                  {(() => {
                    const updated = new Date(resume.updatedAt);
                    const now = new Date();
                    const isSameDay =
                      updated.getFullYear() === now.getFullYear() &&
                      updated.getMonth() === now.getMonth() &&
                      updated.getDate() === now.getDate();
                    return isSameDay
                      ? updated.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : updated.toLocaleDateString();
                  })()}
                </span>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 pt-2">
              <Link href={`/resumes/${resume.id}`} className="flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={resume._isOptimistic || resume._isDeleting}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ResumeDropdownMenu({
  resume,
  resumeId,
  resumeTitle,
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
  }) => void;
  startTransition: (callback: () => Promise<void> | void) => void;
  isOptimistic?: boolean;
  isDeleting?: boolean;
}) {
  const router = useRouter();

  const handleDuplicate = async () => {
    try {
      // Create optimistic duplicate
      const optimisticResume: Resume = {
        id: `temp-${Date.now()}`,
        userId: "",
        title: `${resumeTitle} (Copy)`,
        markdown: "",
        css: "",
        content: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        _isOptimistic: true,
      };

      updateOptimisticResumes({ type: "ADD", resume: optimisticResume });

      startTransition(async () => {
        await createResumeFromVersion(resumeId);
        toast.success("Duplicated Resume");
        router.refresh();
      });
    } catch {
      toast.error("Error duplicating resume");
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${resumeTitle}"? This action cannot be undone.`,
      )
    ) {
      try {
        // Show deleting state
        updateOptimisticResumes({ type: "DELETE", id: resumeId });

        startTransition(async () => {
          await deleteResume(resumeId);
          toast.success("Deleted Resume");

          // Remove after a brief delay to show the animation
          setTimeout(() => {
            updateOptimisticResumes({ type: "REMOVE", id: resumeId });
          }, 300);

          router.refresh();
        });
      } catch {
        toast.error("Error deleting resume");
      }
    }
  };

  const printPdf = () => {
    try {
      const htmlContent = generateHTMLContent(resume.markdown, resume.css);
      printDocument(htmlContent);
      toast.success("PDF generation started");
    } catch {
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={isOptimistic || isDeleting}
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" align="end">
        <DropdownMenuItem>
          <Button
            onClick={printPdf}
            variant="ghost"
            size="sm"
            className="w-full"
            disabled={isOptimistic || isDeleting}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print/PDF
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Button
            onClick={handleDuplicate}
            variant="ghost"
            size="sm"
            className="w-full"
            disabled={isOptimistic || isDeleting}
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Button
            onClick={handleDelete}
            variant="ghost"
            size="sm"
            className="w-full"
            disabled={isOptimistic || isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
