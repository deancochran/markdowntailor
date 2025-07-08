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
import { createResume } from "@/lib/actions/resume";
import { Template, TEMPLATES } from "@/lib/utils/templates";
import { Loader2, Sparkles } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

export function TemplatePreview() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewSlug = searchParams.get("slug");

  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
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

  const handleUseTemplate = (template: Template) => {
    startTransition(async () => {
      try {
        const newResumeId = await createResume({
          title: template.name,
          markdown: template.markdown,
          css: template.css,
          styles: JSON.stringify(template.styles),
        });
        toast.success("Template added to your resumes");
        router.push(`/editor/${newResumeId}`);
      } catch (_error) {
        toast.error("Failed to use template");
      }
    });
  };

  if (!previewTemplate) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Template Preview: {previewTemplate.name}</DialogTitle>
          <DialogDescription>{previewTemplate.description}</DialogDescription>
        </DialogHeader>
        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          <div className="flex flex-wrap gap-2">
            {previewTemplate.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex-1 relative">
            <ResumePreview
              ref={resumeRef}
              markdown={previewTemplate.markdown}
              styles={previewTemplate.styles}
              customCss={previewTemplate.css}
            />
          </div>
        </div>
        <DialogFooter className="pt-4 border-t">
          <Button
            onClick={() => handleUseTemplate(previewTemplate)}
            className="w-full sm:w-auto"
            size="lg"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Use This Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
