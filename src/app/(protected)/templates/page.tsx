"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { createResume } from "@/lib/actions/resume";
import { cn } from "@/lib/utils";
import { Template, TEMPLATES, TemplateTag } from "@/lib/utils/templates";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { CommandGroup, CommandItem } from "cmdk";
import {
  Check,
  Command,
  Copy,
  Eye,
  Filter,
  MoreHorizontal,
  Search,
  Sparkles,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";

// Main page component
export default function TemplatesPage() {
  const resumes = TEMPLATES;
  const [_isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const previewSlug = searchParams.get("slug");

  const [optimisticResumes, updateOptimisticResumes] = useOptimistic(
    resumes,
    (
      state: Template[],
      action: {
        type: string;
        template?: Template;
        id?: string;
        title?: string;
      },
    ) => {
      switch (action.type) {
        case "ADD":
          return action.template ? [...state, { ...action.template }] : state;

        default:
          return state;
      }
    },
  );
  const toggleTag = (tag: TemplateTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const [open, setOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<TemplateTag[]>([]);

  const filteredResumes = useMemo(() => {
    return optimisticResumes.filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        template.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      // Check tag filters
      const matchesTag =
        selectedTags.length === 0 ||
        template.tags?.some((tag) => selectedTags.includes(tag));

      return matchesSearch && matchesTag;
    });
  }, [optimisticResumes, searchQuery, selectedTags]);

  // Find preview template
  const previewTemplate = previewSlug
    ? optimisticResumes.find((r) => r.slug === previewSlug)
    : null;

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

  const clearPreview = () => {
    router.push("/templates");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Template Templates
        </h1>
        <p className="text-muted-foreground">
          Choose from professionally designed templates to get started
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[180px] justify-between">
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  {selectedTags.length > 0
                    ? selectedTags.join(", ")
                    : "Filter by tag"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[180px] p-0">
                <Command>
                  <CommandGroup>
                    {Object.values(TemplateTag).map((tag) => (
                      <CommandItem
                        key={tag}
                        onSelect={() => toggleTag(tag)}
                        className="cursor-pointer"
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            selectedTags.includes(tag)
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50",
                          )}
                        >
                          {selectedTags.includes(tag) && (
                            <Check className="h-4 w-4" />
                          )}
                        </div>
                        {tag}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="w-full flex flex-wrap gap-2 mt-2">
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {filteredResumes.length} template
        {filteredResumes.length !== 1 ? "s" : ""} found
      </div>

      {/* Preview Section */}
      {previewTemplate && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Template Preview: {previewTemplate.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {previewTemplate.description}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={clearPreview}>
                Close Preview
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {previewTemplate.tags?.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="bg-muted rounded-lg p-4 min-h-[200px] flex items-center justify-center">
              <p className="text-muted-foreground">
                Template preview would render here
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => handleUseTemplate(previewTemplate)}
              className="w-full"
              size="lg"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Use This Template
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResumes.map((template) => (
          <TemplateCard
            key={template.slug}
            template={template}
            updateOptimisticResumes={updateOptimisticResumes}
            startTransition={startTransition}
            isPreview={previewSlug === template.slug}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredResumes.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto max-w-md">
            <div className="h-12 w-12 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your search or filter to find what you`&apos;re
              looking for.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedTags([]);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Card component for a single template
function TemplateCard({
  template,
  updateOptimisticResumes,
  startTransition,
  isPreview,
}: {
  template: Template;
  updateOptimisticResumes: (action: {
    type: string;
    template?: Template;
    id?: string;
  }) => void;
  startTransition: (callback: () => Promise<void> | void) => void;
  isPreview?: boolean;
}) {
  const router = useRouter();

  const handlePreview = () => {
    if (template.slug) {
      router.push(`/templates?slug=${template.slug}`);
    }
  };

  const handleCopy = async () => {
    try {
      const optimisticResume = {
        ...template,
        title: `${template.name} (Copy)`,
      };

      updateOptimisticResumes({ type: "ADD", template: optimisticResume });

      startTransition(async () => {
        await createResume({
          title: optimisticResume.title,
          markdown: optimisticResume.markdown,
          css: optimisticResume.css,
          styles: optimisticResume.styles,
        });
        toast.success("Template copied successfully");
      });
    } catch (_error) {
      toast.error("Failed to copy template");
    }
  };

  return (
    <Card
      className={`group transition-all duration-200 hover:shadow-lg ${isPreview ? "ring-2 ring-primary" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg font-semibold leading-tight">
              {template.name}
            </CardTitle>
            {template.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.description}
              </p>
            )}
          </div>
          <TemplateDropdownMenu template={template} onCopy={handleCopy} />
        </div>
      </CardHeader>

      <CardContent>
        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{template.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3">
        <div className="flex w-full gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handlePreview}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

// Dropdown menu with actions for a template
function TemplateDropdownMenu({
  template,
  onCopy,
}: {
  template: Template;
  isOptimistic?: boolean;
  onCopy: () => void;
}) {
  const router = useRouter();

  const handlePreview = () => {
    if (template.slug) {
      router.push(`/templates?slug=${template.slug}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onSelect={handlePreview}>
          <Eye className="h-4 w-4 mr-2" />
          Preview Template
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onCopy}>
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
