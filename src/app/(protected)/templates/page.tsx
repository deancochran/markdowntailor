"use client";

import { TemplatePreview } from "@/components/template-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Template, TEMPLATES, TemplateTag } from "@/lib/utils/templates";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { Check, Eye, Filter, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

// Main page component
export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<TemplateTag[]>([]);

  const toggleTag = (tag: TemplateTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const filteredResumes = useMemo(() => {
    return TEMPLATES.filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        template.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesTag =
        selectedTags.length === 0 ||
        template.tags?.some((tag) => selectedTags.includes(tag));

      return matchesSearch && matchesTag;
    });
  }, [searchQuery, selectedTags]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <TemplatePreview />
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
        <p className="text-muted-foreground">
          Choose from professionally designed templates to get started.
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-4 items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline">
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

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResumes.map((template) => (
          <TemplateCard key={template.slug} template={template} />
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
              Try adjusting your search or filter to find what you&apos;re
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
function TemplateCard({ template }: { template: Template }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    const params = new URLSearchParams(searchParams.toString());
    params.set("slug", template.slug);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div
      onClick={handlePreview}
      className="cursor-pointer group relative border rounded-lg p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:border-primary h-full min-h-[160px]"
    >
      <div className="flex-1">
        <h3 className="text-lg font-semibold leading-tight group-hover:text-primary">
          {template.name}
        </h3>
        {template.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {template.description}
          </p>
        )}
      </div>

      {template.tags && template.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
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

      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
        <Button
          variant="secondary"
          size="sm"
          className="shadow-lg"
          onClick={handlePreview}
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </div>
    </div>
  );
}
