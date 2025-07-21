"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { defaultStyles } from "@/lib/utils/styles";
import { db, Resume } from "@/localforage";
import { ArrowRight, MoreHorizontal, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

// Main component to list resumes
export default function ResumeListing({
  initialResumes = [],
}: {
  initialResumes: Resume[];
}) {
  const router = useRouter();

  return (
    <div className="container mx-auto flex flex-col gap-4">
      <div className="flex justify-between gap-2">
        <Button asChild>
          <Link className="whitespace-nowrap" href="/templates">
            Browse Templates
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
        <CreateResume router={router} />
      </div>
      {initialResumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <p className="text-lg text-muted-foreground">No resumes found.</p>
          <p className="text-sm text-muted-foreground">
            Get started by creating a new resume.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {initialResumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} router={router} />
          ))}
        </div>
      )}
    </div>
  );
}

// Card component for a single resume
function ResumeCard({
  resume,
  router,
}: {
  resume: Resume;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium truncate">
            {resume.title}
          </CardTitle>
          <ResumeDropdownMenu resume={resume} router={router} />
        </div>
        <p className="text-sm text-muted-foreground">
          Updated {new Date(resume.updatedAt).toLocaleDateString()}
        </p>
      </CardHeader>

      <CardFooter className="pt-0">
        <div className="flex w-full gap-2">
          <Button asChild variant="default" className="flex-1">
            <Link href={`/resumes?uuid=${resume.id}`}>Edit</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

// Dropdown menu with actions for a resume
function ResumeDropdownMenu({
  resume,
  router,
}: {
  resume: Resume;
  router: ReturnType<typeof useRouter>;
}) {
  const [isDeletingOpen, setIsDeletingOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const handleCopy = async () => {
    setIsCopying(true);
    try {
      const newResume = await db.resumes.createFromResume(resume);
      toast.success("Resume copied successfully");
      router.push(`/resumes?uuid=${newResume.id}`);
    } catch (_error) {
      toast.error("Failed to copy resume");
    } finally {
      setIsCopying(false);
    }
  };

  const handleDelete = async () => {
    setIsDeletingOpen(false);
    setIsDeleting(true);
    try {
      await db.resumes.delete(resume.id);
      toast.success("Resume deleted successfully");
      router.refresh();
    } catch (_error) {
      toast.error("Failed to delete resume");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={isDeleting || isCopying}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onSelect={handleCopy} disabled={isCopying}>
            {isCopying ? "Copying..." : "Copy Resume"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => setIsDeletingOpen(true)}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Resume"}
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

function CreateResume({ router }: { router: ReturnType<typeof useRouter> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [markdown, setMarkdown] = useState<string | undefined>();
  const [css, setCss] = useState<string | undefined>();
  const [markdownFileName, setMarkdownFileName] = useState("");
  const [cssFileName, setCssFileName] = useState("");
  const markdownFileRef = useRef<HTMLInputElement>(null);
  const cssFileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void,
    fileNameSetter: (value: string) => void,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      fileNameSetter(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setter(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const resetForm = () => {
    setTitle("");
    setMarkdown(undefined);
    setCss(undefined);
    setMarkdownFileName("");
    setCssFileName("");
    if (markdownFileRef.current) markdownFileRef.current.value = "";
    if (cssFileRef.current) cssFileRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isPending) return;

    startTransition(async () => {
      try {
        const newResume = await db.resumes.create({
          title: title.trim(),
          markdown: markdown ?? "",
          css: css ?? "",
          styles: JSON.stringify(defaultStyles),
        });

        toast.success("Resume created successfully!");
        setIsOpen(false);
        resetForm();
        router.push(`/resumes?uuid=${newResume.id}`);
      } catch (_error) {
        toast.error("Failed to create resume.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="whitespace-nowrap">
          <Plus className="w-4 h-4" />
          Create New Resume
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Resume</DialogTitle>
          <DialogDescription>
            Enter a title for your new resume. You can also import existing
            markdown and CSS files.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="markdown-file" className="text-right">
                Markdown
              </Label>
              <Input
                id="markdown-file"
                type="file"
                accept=".md"
                ref={markdownFileRef}
                onChange={(e) =>
                  handleFileChange(e, setMarkdown, setMarkdownFileName)
                }
                className="col-span-3"
              />
            </div>
            {markdownFileName && (
              <p className="col-span-4 text-sm text-center">
                {markdownFileName}
              </p>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="css-file" className="text-right">
                CSS
              </Label>
              <Input
                id="css-file"
                type="file"
                accept=".css"
                ref={cssFileRef}
                onChange={(e) => handleFileChange(e, setCss, setCssFileName)}
                className="col-span-3"
              />
            </div>
            {cssFileName && (
              <p className="col-span-4 text-sm text-center">{cssFileName}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!title.trim() || isPending}>
              {isPending ? "Creating..." : "Create Resume"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
