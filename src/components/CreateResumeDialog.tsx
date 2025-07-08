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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createResume } from "@/lib/actions/resume";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function CreateResumeDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [_isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const markdown = (formData.get("markdown") as string) || "";
    const css = (formData.get("css") as string) || "";

    startTransition(async () => {
      try {
        const newResume = await createResume({ title, markdown, css });
        toast.success("Resume created successfully!");
        router.push(`/editor/${newResume.id}`);
        setOpen(false);
      } catch (error) {
        toast.error("Failed to create resume.");
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button>Create Resume</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[625px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Create a new resume</AlertDialogTitle>
          <AlertDialogDescription>
            Give your new resume a title to get started. You can also import
            existing markdown and CSS.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="My Awesome Resume"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="markdown" className="text-right pt-2">
                Markdown
              </Label>
              <Textarea
                id="markdown"
                name="markdown"
                placeholder="Paste your markdown here..."
                className="col-span-3"
                rows={8}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="css" className="text-right pt-2">
                CSS
              </Label>
              <Textarea
                id="css"
                name="css"
                placeholder="Paste your custom css here..."
                className="col-span-3"
                rows={8}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction type="submit">Create</AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
