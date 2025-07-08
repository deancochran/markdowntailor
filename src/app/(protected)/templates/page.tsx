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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createResumeFromVersion } from "@/lib/actions/resume";
import {
  Copy,
  Eye,
  Filter,
  Loader2,
  MoreHorizontal,
  Search,
  Sparkles,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useOptimistic,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

// Template types for filtering
const TEMPLATE_TYPES = [
  "All Templates",
  "Software Engineer",
  "Product Manager",
  "Designer",
  "Marketing",
  "Sales",
  "Executive",
  "Academic",
  "Creative",
  "Healthcare",
  "Finance",
  "Legal",
] as const;

export { TEMPLATE_TYPES };
export type TemplateType = (typeof TEMPLATE_TYPES)[number];

// Resume type with template properties
export type Resume = {
  id: string;
  title: string;
  markdown: string;
  css: string;
  styles: string;
  templateType?: TemplateType;
  slug?: string;
  description?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  _isOptimistic?: boolean;
};

// Mock function to fetch resumes/templates - replace with your actual data fetching
async function fetchResumes(): Promise<Resume[]> {
  // Replace this with your actual API call or database query
  // For example: return await prisma.resume.findMany({ where: { userId: user.id } });
  return [];
}

// Main page component
export default function TemplatesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [_isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] =
    useState<TemplateType>("All Templates");
  const router = useRouter();
  const searchParams = useSearchParams();
  const previewSlug = searchParams.get("slug");

  // Load resumes on component mount
  useEffect(() => {
    const loadResumes = async () => {
      try {
        setIsLoading(true);
        const data = await fetchResumes();
        setResumes(data);
      } catch (_error) {
        toast.error("Failed to load templates");
      } finally {
        setIsLoading(false);
      }
    };

    loadResumes();
  }, []);

  const [optimisticResumes, updateOptimisticResumes] = useOptimistic(
    resumes,
    (
      state: Resume[],
      action: {
        type: string;
        resume?: Resume;
        id?: string;
        title?: string;
      },
    ) => {
      switch (action.type) {
        case "ADD":
          return action.resume
            ? [...state, { ...action.resume, _isOptimistic: true }]
            : state;
        case "RENAME":
          return state.map((r) =>
            r.id === action.id && action.title
              ? { ...r, title: action.title }
              : r,
          );
        default:
          return state;
      }
    },
  );

  // Filter and search logic
  const filteredResumes = useMemo(() => {
    return optimisticResumes.filter((resume) => {
      const matchesSearch =
        resume.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resume.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resume.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesType =
        selectedType === "All Templates" ||
        resume.templateType === selectedType;

      return matchesSearch && matchesType;
    });
  }, [optimisticResumes, searchQuery, selectedType]);

  // Find preview template
  const previewTemplate = previewSlug
    ? optimisticResumes.find((r) => r.slug === previewSlug)
    : null;

  const handleUseTemplate = (templateId: string) => {
    startTransition(async () => {
      try {
        const newResumeId = await createResumeFromVersion(templateId);
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

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="h-5 w-96 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Resume Templates</h1>
        <p className="text-muted-foreground">
          Choose from professionally designed templates to get started
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
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
          <Select
            value={selectedType}
            onValueChange={(value) => setSelectedType(value as TemplateType)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                  Template Preview: {previewTemplate.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {previewTemplate.description ||
                    "Professional resume template"}
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
              onClick={() => handleUseTemplate(previewTemplate.id)}
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
        {filteredResumes.map((resume) => (
          <TemplateCard
            key={resume.id}
            resume={resume}
            updateOptimisticResumes={updateOptimisticResumes}
            startTransition={startTransition}
            isPreview={previewSlug === resume.slug}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredResumes.length === 0 && !isLoading && (
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
                setSelectedType("All Templates");
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
  resume,
  updateOptimisticResumes,
  startTransition,
  isPreview,
}: {
  resume: Resume;
  updateOptimisticResumes: (action: {
    type: string;
    resume?: Resume;
    id?: string;
  }) => void;
  startTransition: (callback: () => Promise<void> | void) => void;
  isPreview?: boolean;
}) {
  const isLoading = resume._isOptimistic;
  const router = useRouter();

  const handlePreview = () => {
    if (resume.slug) {
      router.push(`/templates?slug=${resume.slug}`);
    }
  };

  const handleCopy = async () => {
    try {
      const optimisticResume = {
        ...resume,
        title: `${resume.title} (Copy)`,
      };

      updateOptimisticResumes({ type: "ADD", resume: optimisticResume });

      startTransition(async () => {
        await createResumeFromVersion(resume.id);
        toast.success("Template copied successfully");
      });
    } catch (_error) {
      toast.error("Failed to copy template");
    }
  };

  return (
    <Card
      className={`group transition-all duration-200 hover:shadow-lg ${
        isLoading ? "opacity-50" : ""
      } ${isPreview ? "ring-2 ring-primary" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg font-semibold leading-tight">
              {resume.title}
            </CardTitle>
            {resume.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {resume.description}
              </p>
            )}
          </div>
          <TemplateDropdownMenu
            resume={resume}
            isOptimistic={resume._isOptimistic}
            onCopy={handleCopy}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Template Type Badge */}
        {resume.templateType && resume.templateType !== "All Templates" && (
          <Badge variant="outline" className="w-fit">
            {resume.templateType}
          </Badge>
        )}

        {/* Tags */}
        {resume.tags && resume.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {resume.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {resume.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{resume.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Preview Area */}
        <div className="bg-muted rounded-md p-3 min-h-[100px] flex items-center justify-center">
          <p className="text-xs text-muted-foreground">Template preview</p>
        </div>

        {/* Last Updated */}
        <p className="text-xs text-muted-foreground">
          Updated {new Date(resume.updatedAt).toLocaleDateString()}
        </p>
      </CardContent>

      <CardFooter className="pt-0 space-y-2">
        <div className="flex w-full gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handlePreview}
            disabled={isLoading}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleCopy}
            disabled={isLoading}
          >
            <Copy className="h-4 w-4 mr-2" />
            Use Template
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

// Dropdown menu with actions for a template
function TemplateDropdownMenu({
  resume,
  isOptimistic,
  onCopy,
}: {
  resume: Resume;
  isOptimistic?: boolean;
  onCopy: () => void;
}) {
  const router = useRouter();

  const handlePreview = () => {
    if (resume.slug) {
      router.push(`/templates?slug=${resume.slug}`);
    }
  };

  if (isOptimistic) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <MoreHorizontal className="h-4 w-4 animate-pulse" />
      </Button>
    );
  }

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
          Use Template
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
