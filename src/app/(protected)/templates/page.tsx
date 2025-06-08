"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addResume } from "@/lib/actions/resume";
import { generateHTMLContent } from "@/lib/utils/htmlGenerator";
import { Editor } from "@monaco-editor/react";
import {
  Briefcase,
  ChevronDown,
  Code,
  Eye,
  FileText,
  Filter,
  GraduationCap,
  Heart,
  Palette,
  Search,
  Users,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

enum TemplateTag {
  PROFESSIONAL = "professional",
  CREATIVE = "creative",
  ACADEMIC = "academic",
  TECHNICAL = "technical",
  EXECUTIVE = "executive",
  ENTRY_LEVEL = "entry-level",
  MODERN = "modern",
  MINIMALIST = "minimalist",
  COLORFUL = "colorful",
  TRADITIONAL = "traditional",
}

interface Template {
  slug: string;
  title: string;
  description: string;
  tags: TemplateTag[];
  imagePath: string;
  markdownUrl: string;
  cssUrl: string;
}

const templates: Template[] = [
  {
    slug: "software-engineer",
    title: "Software Engineer",
    description: "A professional resume template for software engineers.",
    tags: [TemplateTag.PROFESSIONAL, TemplateTag.TECHNICAL],
    imagePath: "/templates/software-engineer/preview.webp",
    markdownUrl: "/templates/software-engineer/template.md",
    cssUrl: "/templates/software-engineer/styles.css",
  },
  {
    slug: "ui-ux-designer",
    title: "UI/UX Designer",
    description: "A professional resume template for UI/UX designers.",
    tags: [TemplateTag.PROFESSIONAL, TemplateTag.TECHNICAL],
    imagePath: "/templates/ui-ux-designer/preview.webp",
    markdownUrl: "/templates/ui-ux-designer/template.md",
    cssUrl: "/templates/ui-ux-designer/styles.css",
  },
];

const tagMetadata = {
  [TemplateTag.PROFESSIONAL]: {
    label: "Professional",
    icon: Briefcase,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  [TemplateTag.CREATIVE]: {
    label: "Creative",
    icon: Palette,
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  },
  [TemplateTag.ACADEMIC]: {
    label: "Academic",
    icon: GraduationCap,
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  [TemplateTag.TECHNICAL]: {
    label: "Technical",
    icon: Code,
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  },
  [TemplateTag.EXECUTIVE]: {
    label: "Executive",
    icon: Users,
    color:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  },
  [TemplateTag.ENTRY_LEVEL]: {
    label: "Entry Level",
    icon: Heart,
    color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  },
  [TemplateTag.MODERN]: {
    label: "Modern",
    icon: FileText,
    color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
  },
  [TemplateTag.MINIMALIST]: {
    label: "Minimalist",
    icon: FileText,
    color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  },
  [TemplateTag.COLORFUL]: {
    label: "Colorful",
    icon: Palette,
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  },
  [TemplateTag.TRADITIONAL]: {
    label: "Traditional",
    icon: FileText,
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  },
};

export default function Templates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<TemplateTag[]>([]);
  const [isCreating, setIsCreating] = useState<string | null>(null);
  const router = useRouter();

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch = [
        template.title,
        template.description,
        ...template.tags.map((tag) => tagMetadata[tag].label),
      ].some((text) => text.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => template.tags.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [searchTerm, selectedTags]);

  const toggleTag = (tag: TemplateTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleCreateFromTemplate = async (template: Template) => {
    setIsCreating(template.slug);

    try {
      const [markdownResponse, cssResponse] = await Promise.all([
        fetch(template.markdownUrl),
        fetch(template.cssUrl),
      ]);

      if (!markdownResponse.ok || !cssResponse.ok) {
        throw new Error("Failed to fetch template content");
      }

      const [markdownContent, cssContent] = await Promise.all([
        markdownResponse.text(),
        cssResponse.text(),
      ]);

      const newResumeId = await addResume({
        title: `${template.title} (Copy)`,
        markdown: markdownContent,
        css: cssContent,
      });

      toast.success(`Resume "${template.title} (Copy)" created successfully!`);
      router.push(`/resumes/${newResumeId}`);
    } catch (error) {
      console.error("Failed to create resume from template:", error);
      toast.error("Failed to create resume from template");
    } finally {
      setIsCreating(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 p-6 border-b bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <FileText className="h-8 w-8" />
              Resume Templates
            </h1>
            <p className="text-muted-foreground mt-2">
              Choose from our professionally designed templates to get started
              quickly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute text-muted-foreground h-9 p-1" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: "24px" }}
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-between min-w-[200px]"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>
                      {selectedTags.length === 0
                        ? "Filter by tags"
                        : selectedTags.length === 1
                          ? tagMetadata[selectedTags[0]].label
                          : `${selectedTags.length} tags selected`}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Filter by Tags</h4>
                    {selectedTags.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTags([])}
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear all
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(tagMetadata).map(([key, meta]) => {
                      const TagIcon = meta.icon;
                      const isSelected = selectedTags.includes(
                        key as TemplateTag,
                      );

                      return (
                        <div key={key} className="flex items-center gap-2">
                          <Checkbox
                            id={key}
                            checked={isSelected}
                            onCheckedChange={() =>
                              toggleTag(key as TemplateTag)
                            }
                          />
                          <label
                            htmlFor={key}
                            className="flex items-center gap-2 text-sm font-normal cursor-pointer flex-1"
                          >
                            <TagIcon className="h-4 w-4" />
                            {meta.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {selectedTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              {selectedTags.map((tag) => {
                const TagIcon = tagMetadata[tag].icon;
                return (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className={`${tagMetadata[tag].color} flex items-center gap-1 pr-1`}
                  >
                    <TagIcon className="h-3 w-3" />
                    {tagMetadata[tag].label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto w-auto p-0 ml-1 hover:bg-transparent"
                      onClick={() => toggleTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-6 mb-4">
                <Search size={48} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Templates Found</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Try adjusting your search term or filter to find the perfect
                template for your needs.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.slug}
                  template={template}
                  onCreateFromTemplate={handleCreateFromTemplate}
                  isCreating={isCreating === template.slug}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  onCreateFromTemplate,
  isCreating,
}: {
  template: Template;
  onCreateFromTemplate: (template: Template) => void;
  isCreating: boolean;
}) {
  return (
    <Card className="group transition-all duration-200 hover:shadow-lg hover:border-primary/20 h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex flex-col items-start justify-between gap-1">
          <div className="flex flex-wrap w-full gap-6 items-center justify-between">
            <CardTitle className="grow text-lg group-hover:text-primary transition-colors line-clamp-1 ">
              {template.title}
            </CardTitle>
            <TemplatePreviewDialog template={template} />
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {template.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {template.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className={`text-xs ${tagMetadata[tag].color} flex items-center gap-1`}
            >
              {tagMetadata[tag].label}
            </Badge>
          ))}
        </div>
      </CardHeader>
    </Card>
  );
}

function TemplatePreviewDialog({ template }: { template: Template }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [templateContent, setTemplateContent] = useState({
    markdown: "",
    css: "",
    html: "",
  });
  const [activeTab, setActiveTab] = useState("preview");
  const [zoomLevel, setZoomLevel] = useState(0.6);
  const [isCreating, setIsCreating] = useState(false);

  const { theme } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const router = useRouter();

  const loadTemplateContent = async () => {
    setIsLoading(true);
    try {
      const [markdownResponse, cssResponse] = await Promise.all([
        fetch(template.markdownUrl),
        fetch(template.cssUrl),
      ]);

      if (!markdownResponse.ok || !cssResponse.ok) {
        throw new Error("Failed to fetch template content");
      }

      const [markdown, css] = await Promise.all([
        markdownResponse.text(),
        cssResponse.text(),
      ]);

      setZoomLevel(0.6);
      const html = generateHTMLContent(markdown, css);
      setTemplateContent({ markdown, css, html });
    } catch (error) {
      console.error("Failed to load template content:", error);
      toast.error("Failed to load template content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      loadTemplateContent();
    } else {
      setActiveTab("preview");
    }
  };

  useEffect(() => {
    if (iframeRef.current && templateContent.html) {
      const iframe = iframeRef.current;
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;

      if (iframeDoc) {
        // Check if iframe is empty or needs refresh
        const isEmpty =
          !iframeDoc.body || iframeDoc.body.innerHTML.trim() === "";

        if (isEmpty || activeTab === "preview") {
          iframeDoc.open();
          iframeDoc.write(templateContent.html);
          iframeDoc.close();
        }
      }
    }
  }, [templateContent.html, activeTab]);

  // Additional effect to handle iframe load event
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe && templateContent.html) {
      const handleLoad = () => {
        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow?.document;
        if (
          iframeDoc &&
          (!iframeDoc.body || iframeDoc.body.innerHTML.trim() === "")
        ) {
          iframeDoc.open();
          iframeDoc.write(templateContent.html);
          iframeDoc.close();
        }
      };

      iframe.addEventListener("load", handleLoad);
      return () => iframe.removeEventListener("load", handleLoad);
    }
  }, [templateContent.html]);

  const handleCreateFromTemplate = async () => {
    setIsCreating(true);
    try {
      const newResumeId = await addResume({
        title: `${template.title} (Copy)`,
        markdown: templateContent.markdown,
        css: templateContent.css,
      });

      toast.success(`Resume "${template.title} (Copy)" created successfully!`);
      setIsOpen(false);
      router.push(`/resumes/${newResumeId}`);
    } catch (error) {
      console.error("Failed to create resume:", error);
      toast.error("Failed to create resume from template");
    } finally {
      setIsCreating(false);
    }
  };

  const adjustZoom = (delta: number) => {
    setZoomLevel((prev) => Math.max(0.1, Math.min(2.0, prev + delta)));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-full h-full flex flex-col items-start">
        <DialogHeader>
          <div className="w-full flex flex-row flex-nowrap items-center justify-between">
            <div className="flex flex-col items-start justify-between">
              <DialogTitle className="text-xl">{template.title}</DialogTitle>
              <p className="text-muted-foreground mt-1">
                {template.description}
              </p>
            </div>
            <Button
              onClick={handleCreateFromTemplate}
              disabled={isCreating || isLoading}
              className="ml-4"
            >
              {isCreating ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full" />
                  Creating...
                </>
              ) : (
                "Use Template"
              )}
            </Button>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin border-2 border-primary border-t-transparent rounded-full" />
              <p className="text-muted-foreground">Loading template...</p>
            </div>
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full h-full flex flex-col items-start justify-between gap-0 overflow-hidden"
          >
            <div className="flex-shrink-0 w-full overflow-hidden">
              <TabsList className="flex flex-row gap-4 w-full">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="markdown">Markdown</TabsTrigger>
                <TabsTrigger value="css">CSS</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              className="flex-1 flex flex-col max-h-40 h-40 w-full overflow-scroll"
              value="preview"
            >
              <div className="relative h-full grow overflow-hidden">
                <iframe
                  ref={iframeRef}
                  title="Resume Preview"
                  style={{
                    width: "210mm",
                    height: "297mm",
                    border: "1px solid #ccc",
                    background: "white",
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: "top left",
                    transition: "transform 0.3s ease-in-out",
                    overflow: "hidden",
                    position: "absolute",
                  }}
                  onLoad={() => {
                    // Ensure content is loaded when iframe loads
                    if (templateContent.html) {
                      const iframe = iframeRef.current;
                      const iframeDoc =
                        iframe?.contentDocument ||
                        iframe?.contentWindow?.document;
                      if (
                        iframeDoc &&
                        (!iframeDoc.body ||
                          iframeDoc.body.innerHTML.trim() === "")
                      ) {
                        iframeDoc.open();
                        iframeDoc.write(templateContent.html);
                        iframeDoc.close();
                      }
                    }
                  }}
                />
              </div>
              <div className="grow-0 bg-muted text-muted-foreground  items-center w-full flex justify-between border-t px-2">
                <div className="text-sm text-muted-foreground">A4 Preview</div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => adjustZoom(-0.1)}
                    disabled={zoomLevel <= 0.2}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm min-w-[50px] text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => adjustZoom(0.1)}
                    disabled={zoomLevel >= 2.0}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="markdown"
              className="w-full h-full flex-1 overflow-hidden m-0"
            >
              <Editor
                height="100%"
                width="100%"
                language="markdown"
                value={templateContent.markdown}
                theme={theme === "dark" ? "vs-dark" : "light"}
              />
            </TabsContent>

            <TabsContent
              value="css"
              className="w-full h-full flex-1 overflow-hidden m-0"
            >
              <Editor
                height="100%"
                width="100%"
                language="css"
                value={templateContent.css}
                theme={theme === "dark" ? "vs-dark" : "light"}
              />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
