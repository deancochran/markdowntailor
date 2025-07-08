"use client";

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
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

export function TemplatePreview() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewSlug = searchParams.get("slug");

  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

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
          styles: template.styles,
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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Template Preview: {previewTemplate.name}</DialogTitle>
          <DialogDescription>{previewTemplate.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {previewTemplate.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="bg-muted rounded-lg p-4 min-h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">
              Template preview would render here
            </p>
          </div>
        </div>
        <DialogFooter>
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
