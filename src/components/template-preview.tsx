"use client";
import ResumePreview, { ResumePreviewRef } from "@/components/ResumePreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Template, TEMPLATES } from "@/lib/utils/templates";
import { db } from "@/localforage";
import { Loader2, Sparkles } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

export function TemplatePreview() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewSlug = searchParams.get("slug");

  const [isOpen, setIsOpen] = useState(false);
  const [isPending, _startTransition] = useTransition();
  const resumeRef = useRef<ResumePreviewRef>(null);

  const previewTemplate = previewSlug
    ? TEMPLATES.find((t) => t.slug === previewSlug)
    : null;

  useEffect(() => {
    setIsOpen(!!previewSlug);
  }, [previewSlug]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("slug");
      router.push(`${pathname}?${newSearchParams.toString()}`);
    }
    setIsOpen(open);
  };

  const handleUseTemplate = async (template: Template) => {
    const newResume = await db.resumes.createFromTemplate(template);
    if (newResume) {
      router.push(`/resumes/${newResume.id}`);
    }
  };

  if (!previewTemplate) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="!max-w-7xl !max-h-[80vh] w-[90vw] h-full flex flex-col p-4">
        <DialogHeader className="">
          <DialogTitle>Template Preview: {previewTemplate.name}</DialogTitle>
          <DialogDescription>{previewTemplate.description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-row flex-wrap gap-2">
          {previewTemplate.tags?.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        <ResumePreview
          ref={resumeRef}
          markdown={previewTemplate.markdown}
          styles={previewTemplate.styles}
          customCss={previewTemplate.css}
        />
        <DialogFooter className="pt-4 border-t">
          <Button
            onClick={() => handleUseTemplate(previewTemplate)}
            className="w-full"
            size="lg"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {"Use This Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
