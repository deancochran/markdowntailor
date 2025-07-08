"use client";

import ResumePreview from "@/components/ResumePreview";
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
import type { ResumeStyles } from "@/lib/utils/styles";
import {
  ArrowRight,
  Check,
  Eye,
  FileText,
  Palette,
  Plus,
  Star,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Helper function to parse CSS unit values and convert to pixels
const parseUnitValue = (value: string): number => {
  const match = value.match(/^(\d*\.?\d+)(\w*)$/);
  if (!match) return 0;

  const [, numStr, unit] = match;
  const num = parseFloat(numStr);

  switch (unit) {
    case "cm":
      return num * (96 / 2.54);
    case "in":
      return num * 96;
    case "mm":
      return num * (96 / 25.4);
    case "pt":
      return num * (96 / 72);
    case "px":
    default:
      return num;
  }
};

enum TemplateTag {
  FEATURED = "Featured",
  NEW = "New",
  POPULAR = "Popular",
  ATS = "ATS-Friendly",
  CREATIVE = "Creative",
  MODERN = "Modern",
  MINIMALIST = "Minimalist",
  PROFESSIONAL = "Professional",
  ELEGANT = "Elegant",
  ACADEMIC = "Academic",
  CORPORATE = "Corporate",
}

interface Template {
  slug: string;
  name: string;
  description: string;
  tags: TemplateTag[];
  markdown: string;
  css: string;
  styles: string;
}

const templates: Template[] = [
  {
    slug: "software-engineer",
    name: "Software Engineer",
    description: "A professional resume template for software engineers.",
    tags: [TemplateTag.PROFESSIONAL],
    markdown: "",
    css: "",
    styles: "",
  },
];

const tagMetadata: Record<
  TemplateTag,
  { icon: React.ElementType; className: string }
> = {
  [TemplateTag.FEATURED]: {
    icon: Star,
    className: "bg-yellow-100 text-yellow-800",
  },
  [TemplateTag.NEW]: { icon: Zap, className: "bg-green-100 text-green-800" },
  [TemplateTag.POPULAR]: {
    icon: Check,
    className: "bg-blue-100 text-blue-800",
  },
  [TemplateTag.ATS]: {
    icon: FileText,
    className: "bg-gray-100 text-gray-800",
  },
  [TemplateTag.CREATIVE]: {
    icon: Palette,
    className: "bg-purple-100 text-purple-800",
  },
  [TemplateTag.MODERN]: {
    icon: ArrowRight,
    className: "bg-indigo-100 text-indigo-800",
  },
  [TemplateTag.MINIMALIST]: {
    icon: Plus,
    className: "bg-pink-100 text-pink-800",
  },
  [TemplateTag.PROFESSIONAL]: {
    icon: Plus,
    className: "bg-teal-100 text-teal-800",
  },
  [TemplateTag.ELEGANT]: {
    icon: Plus,
    className: "bg-red-100 text-red-800",
  },
  [TemplateTag.ACADEMIC]: {
    icon: Plus,
    className: "bg-orange-100 text-orange-800",
  },
  [TemplateTag.CORPORATE]: {
    icon: Plus,
    className: "bg-cyan-100 text-cyan-800",
  },
};

export default function Templates() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Resume Templates</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Choose a template to start building your professional resume.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.map((template) => (
          <TemplateCard
            key={template.slug}
            template={template}
            onPreview={() => setSelectedTemplate(template)}
          />
        ))}
      </div>

      <TemplatePreviewDialog
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
      />
    </div>
  );
}

function TemplateCard({
  template,
  onPreview,
}: {
  template: Template;
  onPreview: () => void;
}) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-96 bg-gray-100">
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
          <Button onClick={onPreview} size="lg">
            <Eye className="mr-2 h-4 w-4" /> Preview
          </Button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{template.name}</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {template.tags.map((tag) => {
            const meta = tagMetadata[tag];
            const Icon = meta.icon;
            return (
              <Badge key={tag} variant="outline" className={meta.className}>
                <Icon className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TemplatePreviewDialog({
  selectedTemplate,
  setSelectedTemplate,
}: {
  selectedTemplate: Template | null;
  setSelectedTemplate: (template: Template | null) => void;
}) {
  const router = useRouter();

  if (!selectedTemplate) {
    return null;
  }

  const handleUseTemplate = () => {
    const params = new URLSearchParams();
    params.set("template", selectedTemplate.slug);
    router.push(`/resumes/?${params.toString()}`);
  };

  const resumeStyles: ResumeStyles = {
    fontFamily: selectedTemplate.font,
    fontSize: parseUnitValue(selectedTemplate.size),
    lineHeight: parseFloat(selectedTemplate.lineHeight),
    paperSize: selectedTemplate.paper,
    marginV: parseUnitValue(selectedTemplate.margins.vertical),
    marginH: parseUnitValue(selectedTemplate.margins.horizontal),
  };

  return (
    <Dialog
      open={!!selectedTemplate}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setSelectedTemplate(null);
        }
      }}
    >
      <DialogContent className="max-w-4xl w-[90vw] h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{selectedTemplate.name}</DialogTitle>
          <DialogDescription>{selectedTemplate.description}</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden p-6 pt-2">
          <ResumePreview
            markdown={selectedTemplate.markdown}
            styles={resumeStyles}
            customCss={selectedTemplate.css}
          />
        </div>
        <DialogFooter className="p-6 pt-0">
          <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
            Close
          </Button>
          <Button onClick={handleUseTemplate}>
            Use This Template <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
