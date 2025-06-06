"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  Code,
  FileText,
  Filter,
  GraduationCap,
  Heart,
  Palette,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
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
  id: string;
  title: string;
  description: string;
  tags: TemplateTag[];
  markdown: string;
  css: string;
  html: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tag metadata for display
const tagMetadata = {
  [TemplateTag.PROFESSIONAL]: {
    label: "Professional",
    icon: Briefcase,
    color: "bg-blue-100 text-blue-800",
  },
  [TemplateTag.CREATIVE]: {
    label: "Creative",
    icon: Palette,
    color: "bg-purple-100 text-purple-800",
  },
  [TemplateTag.ACADEMIC]: {
    label: "Academic",
    icon: GraduationCap,
    color: "bg-green-100 text-green-800",
  },
  [TemplateTag.TECHNICAL]: {
    label: "Technical",
    icon: Code,
    color: "bg-gray-100 text-gray-800",
  },
  [TemplateTag.EXECUTIVE]: {
    label: "Executive",
    icon: Users,
    color: "bg-indigo-100 text-indigo-800",
  },
  [TemplateTag.ENTRY_LEVEL]: {
    label: "Entry Level",
    icon: Heart,
    color: "bg-pink-100 text-pink-800",
  },
  [TemplateTag.MODERN]: {
    label: "Modern",
    icon: FileText,
    color: "bg-cyan-100 text-cyan-800",
  },
  [TemplateTag.MINIMALIST]: {
    label: "Minimalist",
    icon: FileText,
    color: "bg-slate-100 text-slate-800",
  },
  [TemplateTag.COLORFUL]: {
    label: "Colorful",
    icon: Palette,
    color: "bg-orange-100 text-orange-800",
  },
  [TemplateTag.TRADITIONAL]: {
    label: "Traditional",
    icon: FileText,
    color: "bg-amber-100 text-amber-800",
  },
};

// Sample template data
const mockTemplates: Template[] = [
  {
    id: "1",
    title: "Executive Summit",
    description:
      "A sophisticated template designed for senior leadership positions. Features clean lines and strategic emphasis on achievements. Perfect for C-suite executives and senior management roles.",
    tags: [
      TemplateTag.PROFESSIONAL,
      TemplateTag.EXECUTIVE,
      TemplateTag.MINIMALIST,
    ],
    markdown:
      "# Executive Summary\n\n## Professional Experience\n\n### Senior Leadership Role\n*Company Name* | 2020 - Present",
    css: ".resume { font-family: 'Arial', sans-serif; color: #2c3e50; }",
    html: "<div class='resume'><h1>Executive Summary</h1></div>",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    title: "Creative Pulse",
    description:
      "Bold and vibrant design for creative professionals. Showcases personality while maintaining professionalism. Ideal for designers, marketers, and creative directors.",
    tags: [TemplateTag.CREATIVE, TemplateTag.COLORFUL, TemplateTag.MODERN],
    markdown:
      "# Creative Portfolio\n\n## Design Experience\n\n### Lead Designer\n*Agency Name* | 2021 - Present",
    css: ".resume { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }",
    html: "<div class='resume'><h1>Creative Portfolio</h1></div>",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    title: "Academic Excellence",
    description:
      "Structured format emphasizing research and academic achievements. Comprehensive sections for publications and conferences. Tailored for professors, researchers, and PhD candidates.",
    tags: [
      TemplateTag.ACADEMIC,
      TemplateTag.TRADITIONAL,
      TemplateTag.PROFESSIONAL,
    ],
    markdown:
      "# Academic Curriculum Vitae\n\n## Education\n\n### Ph.D. in Computer Science\n*University Name* | 2018 - 2022",
    css: ".resume { font-family: 'Times New Roman', serif; line-height: 1.6; }",
    html: "<div class='resume'><h1>Academic Curriculum Vitae</h1></div>",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    title: "Tech Stack",
    description:
      "Developer-focused template highlighting technical skills and projects. Clean code-like formatting with emphasis on programming languages and frameworks. Perfect for software engineers and developers.",
    tags: [TemplateTag.TECHNICAL, TemplateTag.MODERN, TemplateTag.MINIMALIST],
    markdown:
      "# Software Engineer\n\n## Technical Skills\n\n- Languages: JavaScript, Python, Go\n- Frameworks: React, Node.js",
    css: ".resume { font-family: 'Courier New', monospace; background: #1a1a1a; color: #00ff00; }",
    html: "<div class='resume'><h1>Software Engineer</h1></div>",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    title: "Fresh Start",
    description:
      "Welcoming design for new graduates and career changers. Emphasizes potential and transferable skills over extensive experience. Optimized for entry-level positions.",
    tags: [TemplateTag.ENTRY_LEVEL, TemplateTag.MODERN, TemplateTag.COLORFUL],
    markdown:
      "# Recent Graduate\n\n## Education\n\n### Bachelor of Science\n*University Name* | 2024",
    css: ".resume { background: #f8f9fa; border-left: 4px solid #007bff; }",
    html: "<div class='resume'><h1>Recent Graduate</h1></div>",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "6",
    title: "Classic Professional",
    description:
      "Timeless design suitable for traditional industries. Conservative formatting with emphasis on experience and qualifications. Ideal for finance, law, and consulting professionals.",
    tags: [
      TemplateTag.TRADITIONAL,
      TemplateTag.PROFESSIONAL,
      TemplateTag.MINIMALIST,
    ],
    markdown:
      "# Professional Resume\n\n## Professional Experience\n\n### Senior Consultant\n*Firm Name* | 2019 - Present",
    css: ".resume { font-family: 'Georgia', serif; color: #333; margin: 20px; }",
    html: "<div class='resume'><h1>Professional Resume</h1></div>",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function Templates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [isCreating, setIsCreating] = useState<string | null>(null);

  // Filter and search templates
  const filteredTemplates = useMemo(() => {
    return mockTemplates.filter((template) => {
      const matchesSearch =
        template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some((tag) =>
          tagMetadata[tag].label
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
        );

      const matchesTag =
        selectedTag === "all" ||
        template.tags.includes(selectedTag as TemplateTag);

      return matchesSearch && matchesTag;
    });
  }, [searchTerm, selectedTag]);

  const handleCreateFromTemplate = async (templateId: string) => {
    setIsCreating(templateId);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Here you would call your actual API to create a resume from template
      // await createResumeFromTemplate(templateId);

      toast.success("Resume created from template!");
      // router.push(`/resumes/${newResumeId}`);
    } catch {
      toast.error("Failed to create resume from template");
    } finally {
      setIsCreating(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 25,
      },
    },
  };

  return (
    <div className="w-full h-full">
      <Card className="border shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Resume Templates
          </CardTitle>
          <p className="text-muted-foreground">
            Choose from our professionally designed templates to get started
            quickly.
          </p>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Templates</SelectItem>
                  {Object.entries(tagMetadata).map(([key, meta]) => (
                    <SelectItem key={key} value={key}>
                      {meta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {filteredTemplates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-16 px-6"
            >
              <div className="rounded-full bg-muted p-6 mb-4">
                <Search size={48} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Templates Found</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Try adjusting your search term or filter to find the perfect
                template for your needs.
              </p>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="popLayout">
                {filteredTemplates.map((template) => (
                  <motion.div key={template.id} variants={itemVariants} layout>
                    <TemplateCard
                      template={template}
                      onCreateFromTemplate={handleCreateFromTemplate}
                      isCreating={isCreating === template.id}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TemplateCard({
  template,
  onCreateFromTemplate,
  isCreating,
}: {
  template: Template;
  onCreateFromTemplate: (templateId: string) => void;
  isCreating: boolean;
}) {
  const cardVariants = {
    hover: {
      scale: 1.02,
      y: -4,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1,
      },
    },
  };

  return (
    <motion.div variants={cardVariants} whileHover="hover" whileTap="tap">
      <Card className="group transition-all duration-200 border bg-card hover:shadow-lg hover:border-primary/20 h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="space-y-3">
            <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {template.title}
            </CardTitle>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {template.tags.map((tag) => {
                const TagIcon = tagMetadata[tag].icon;
                return (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className={`text-xs ${tagMetadata[tag].color} flex items-center gap-1`}
                  >
                    <TagIcon className="h-3 w-3" />
                    {tagMetadata[tag].label}
                  </Badge>
                );
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 flex-1 flex flex-col">
          <div className="space-y-4 flex-1">
            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {template.description}
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <Button
              onClick={() => onCreateFromTemplate(template.id)}
              disabled={isCreating}
              className="w-full"
              size="sm"
            >
              {isCreating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="h-4 w-4 mr-2"
                  >
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  </motion.div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Use Template
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
