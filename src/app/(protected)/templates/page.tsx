"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// Template type enum
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

// Template interface
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
    imagePath: "/templates/software-engineer/preview.png",
    markdownUrl: "/templates/software-engineer/template.md",
    cssUrl: "/templates/software-engineer/styles.css",
  },
];

// Tag metadata for display
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

  // Filter and search templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch =
        template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some((tag) =>
          tagMetadata[tag].label
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
        );

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((selectedTag) => template.tags.includes(selectedTag));

      return matchesSearch && matchesTags;
    });
  }, [searchTerm, selectedTags]);

  const toggleTag = (tag: TemplateTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const clearAllTags = () => {
    setSelectedTags([]);
  };

  const handleCreateFromTemplate = async (template: Template) => {
    setIsCreating(template.slug);

    try {
      const [markdownResponse, cssResponse] = await Promise.all([
        fetch(template.markdownUrl),
        fetch(template.cssUrl),
      ]);

      const [markdownContent, cssContent] = await Promise.all([
        markdownResponse.text(),
        cssResponse.text(),
      ]);

      // Simulate API call - replace with actual implementation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(`Resume "${template.title}" created successfully!`);
      // router.push(`/resumes/${newResumeId}`);
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

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
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
                        onClick={clearAllTags}
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

          {/* Selected Tags Display */}
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
        <div className="w-full aspect-[3/4] bg-muted rounded-md overflow-hidden relative border">
          <Image
            src={template.imagePath}
            alt={`${template.title} preview`}
            fill
            className="object-contain"
          />
        </div>
        <div className="flex items-start justify-between gap-4 mt-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
              {template.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {template.description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between pt-0">
        <div className="flex flex-wrap gap-2 mb-4">
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

        <div className="flex gap-2">
          <TemplatePreviewDialog template={template} />
          <Button
            onClick={() => onCreateFromTemplate(template)}
            disabled={isCreating}
            className="flex-1"
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
      </CardContent>
    </Card>
  );
}

function TemplatePreviewDialog({ template }: { template: Template }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [markdownContent, setMarkdownContent] = useState("");
  const [cssContent, setCssContent] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [activeTab, setActiveTab] = useState("preview");
  const [zoomLevel, setZoomLevel] = useState(0.4);
  const [isCreating, setIsCreating] = useState(false);

  const { theme } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const loadTemplateContent = async () => {
    if (markdownContent && cssContent) return; // Already loaded

    setIsLoading(true);
    try {
      const [markdownResponse, cssResponse] = await Promise.all([
        fetch(template.markdownUrl),
        fetch(template.cssUrl),
      ]);

      const [markdown, css] = await Promise.all([
        markdownResponse.text(),
        cssResponse.text(),
      ]);

      setMarkdownContent(markdown);
      setCssContent(css);
      setPreviewHtml(generateHTMLContent(markdown, css));
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
    }
  };

  useEffect(() => {
    if (iframeRef.current && previewHtml) {
      const iframe = iframeRef.current;
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;

      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(previewHtml);
        iframeDoc.close();
      }
    }
  }, [previewHtml]);

  const handleCreateFromTemplate = async () => {
    setIsCreating(true);
    try {
      // Simulate API call - replace with actual implementation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(`Resume "${template.title}" created successfully!`);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create resume:", error);
      toast.error("Failed to create resume from template");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen h-full overflow-scroll">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
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
            className="max-h-[80vh] flex-1 flex flex-col items-center justify-between overflow-hidden gap-0"
          >
            <div className="flex-shrink-0 w-full">
              <TabsList className="flex flex-row gap-4 w-full">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="markdown">Markdown</TabsTrigger>
                <TabsTrigger value="css">CSS</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="preview"
              className="flex-1 flex flex-col w-fit overflow-hidden"
            >
              <div className="relative flex-1 w-full overflow-scroll">
                <iframe
                  ref={iframeRef}
                  title="Resume Preview"
                  style={{
                    width: "210mm",
                    height: "297mm",
                    border: "1px solid #ccc",
                    background: "white",
                    transform: `scale(${zoomLevel})`,
                    transition: "transform 0.3s ease-in-out",
                    transformOrigin: "top center",
                  }}
                />
              </div>
              <div className="bg-muted text-muted-foreground h-10 items-center w-full flex justify-between border-t px-2">
                <div className="text-sm text-muted-foreground">A4 Preview</div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setZoomLevel(Math.max(zoomLevel - 0.1, 0.1))}
                    disabled={zoomLevel <= 0.2}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setZoomLevel(Math.min(zoomLevel + 0.1, 2.0))}
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
                value={markdownContent}
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
                value={cssContent}
                theme={theme === "dark" ? "vs-dark" : "light"}
              />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
