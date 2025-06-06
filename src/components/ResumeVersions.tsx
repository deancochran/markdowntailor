"use client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  resume as Resume,
  resumeVersions as ResumeVersions,
} from "@/db/schema";
import { createResumeFromVersion, restoreVersion } from "@/lib/actions/resume";
import { DiffEditor, DiffOnMount } from "@monaco-editor/react";
import { diffLines } from "diff";
import { InferSelectModel } from "drizzle-orm";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Copy,
  FileText,
  Info,
  RotateCcw,
} from "lucide-react";
import type { editor } from "monaco-editor";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

type ResumeVersion = InferSelectModel<typeof ResumeVersions>;

interface ResumeVersionsProps {
  resume: InferSelectModel<typeof Resume>;
  versions: ResumeVersion[];
}

export default function ResumeVersionsComponent({
  resume,
  versions,
}: ResumeVersionsProps) {
  const router = useRouter();
  const { theme } = useTheme();

  const [selectedOriginal, setSelectedOriginal] =
    useState<ResumeVersion | null>(versions[0]);
  const [selectedModified, setSelectedModified] =
    useState<ResumeVersion | null>(versions[0]);
  const [selectedOriginalCss, setSelectedOriginalCss] = useState<string>(
    versions[0].css,
  );
  const [selectedModifiedCss, setSelectedModifiedCss] = useState<string>(
    versions[0].css,
  );
  const [selectedOriginalMarkdown, setSelectedOriginalMarkdown] =
    useState<string>(versions[0].markdown);
  const [selectedModifiedMarkdown, setSelectedModifiedMarkdown] =
    useState<string>(versions[0].markdown);
  const [editorsTab, setEditorsTab] = useState("markdown");
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);

  // Refs for editor instances
  const markdownEditorRef = useRef<editor.IStandaloneDiffEditor>(null);
  const cssEditorRef = useRef<editor.IStandaloneDiffEditor>(null);

  // Handle editor mount
  const handleMarkdownEditorMount: DiffOnMount = useCallback((editor) => {
    markdownEditorRef.current = editor;
    // You can add console.log here to confirm editor instance is received
    console.log("Markdown DiffEditor Mounted:", editor);
  }, []);

  const handleCssEditorMount: DiffOnMount = useCallback((editor) => {
    cssEditorRef.current = editor;
    // You can add console.log here to confirm editor instance is received
    console.log("CSS DiffEditor Mounted:", editor);
  }, []);

  // Handle version selection
  const handleSelectOriginal = (version: ResumeVersion) => {
    console.log("Selected Original Version:", version);
    setSelectedOriginal(version);
    setSelectedOriginalCss(version.css);
    setSelectedOriginalMarkdown(version.markdown);
  };

  const handleSelectModified = (version: ResumeVersion) => {
    console.log("Selected Modified Version:", version);
    setSelectedModified(version);
    setSelectedModifiedCss(version.css);
    setSelectedModifiedMarkdown(version.markdown);
  };

  // Handle restore version
  const handleRestoreVersion = async (versionId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to restore this version? This will create a new version with the restored content.",
      )
    ) {
      return;
    }

    setIsRestoring(versionId);
    try {
      const formData = new FormData();
      formData.append("resumeId", resume.id);
      formData.append("versionId", versionId);

      await restoreVersion(formData);
      toast.success("Version restored successfully");
      router.push(`/resumes/${resume.id}`);
    } catch (error) {
      console.error("Restore error:", error);
      toast.error("Failed to restore version");
    } finally {
      setIsRestoring(null);
    }
  };

  // Handle duplicate from version
  const handleDuplicateFromVersion = async (version: ResumeVersion) => {
    setIsDuplicating(version.id);
    try {
      const response = await createResumeFromVersion(resume.id);
      toast.success("Resume duplicated successfully from version");
      router.push(`/resumes/${response.resumeId}`);
    } catch (error) {
      console.error("Duplicate error:", error);
      toast.error("Failed to duplicate resume from version");
    } finally {
      setIsDuplicating(null);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date();
    const versionDate = new Date(date);
    const isSameDay =
      versionDate.getFullYear() === now.getFullYear() &&
      versionDate.getMonth() === now.getMonth() &&
      versionDate.getDate() === now.getDate();

    return isSameDay
      ? versionDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : versionDate.toLocaleDateString();
  };

  function countDiffLines(original: string, modified: string) {
    const diff = diffLines(original, modified);
    let added = 0;
    let removed = 0;

    for (const part of diff) {
      if (part.added) added += part.count || part.value.split("\n").length - 1;
      if (part.removed)
        removed += part.count || part.value.split("\n").length - 1;
    }

    return { added, removed };
  }

  return (
    <div className="grid grid-rows-[auto_1fr] h-[100%] max-h-[100%]">
      {/* Header */}
      <header className="w-full flex h-14 items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <Link href={`/resumes/${resume.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Editor</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {resume.title} - Versions
            </h1>
            <p className="text-sm text-muted-foreground">
              Compare and manage resume versions
            </p>
          </div>
        </div>

        <Badge variant="secondary" className="flex items-center gap-1">
          <span>
            {versions.length} version{versions.length !== 1 ? "s" : ""}
          </span>
        </Badge>
      </header>

      {/* Main Content */}
      {/* Added 'h-full' and 'min-h-0' to ensure main content area takes full height and allows flex children to shrink */}
      <div className="relative grid grid-cols-2 min-h-0 p-4 h-full bg-muted/20 gap-4">
        {/* Left Side - Diff Editor */}
        <Card className="relative overflow-hidden">
          {/* Ensure Tabs component takes full height of its parent Card */}
          <Tabs
            value={editorsTab}
            onValueChange={setEditorsTab}
            className="flex flex-col gap-0 h-full"
          >
            <CardHeader className="pb-0">
              <TabsList className="w-fit">
                <TabsTrigger
                  value="markdown"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Markdown Diff
                </TabsTrigger>
                <TabsTrigger value="css" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  CSS Diff
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            {/* CardContent and TabsContent must allow DiffEditor to fill available space */}
            <CardContent className="flex-1 min-h-0 overflow-hidden p-0">
              <TabsContent
                value="markdown"
                className="flex-1 min-h-0 h-[100%] overflow-hidden mt-0"
              >
                <DiffEditor
                  language="markdown"
                  original={selectedOriginalMarkdown}
                  modified={selectedModifiedMarkdown}
                  onMount={handleMarkdownEditorMount}
                  theme={theme === "dark" ? "vs-dark" : "light"}
                />
              </TabsContent>

              <TabsContent
                value="css"
                className="flex-1 min-h-0 h-[100%] overflow-hidden mt-0"
              >
                <DiffEditor
                  language="css"
                  original={selectedOriginalCss}
                  modified={selectedModifiedCss}
                  onMount={handleCssEditorMount}
                  theme={theme === "dark" ? "vs-dark" : "light"}
                />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Right Side - Versions List */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Resume Versions
            </CardTitle>
            <CardDescription>
              Select versions to compare or manage
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="p-4 space-y-4">
              {/* Version History */}
              {versions.length > 0 ? (
                <div className="space-y-2">
                  {versions.map((version) => (
                    <Card
                      key={version.id}
                      className="border-muted bg-background hover:bg-muted/40 transition-colors shadow-sm"
                    >
                      <CardHeader className="pb-2 px-4 pt-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-col items-start justify-between gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <Badge variant="outline" className="px-2 py-0.5">
                                v{version.version}
                              </Badge>
                              <CardTitle className="text-xs text-muted-foreground font-thin truncate">
                                {version.title}
                              </CardTitle>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant={
                                  selectedOriginal?.id === version.id
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => handleSelectOriginal(version)}
                                className="text-xs"
                              >
                                Original
                              </Button>
                              <Button
                                variant={
                                  selectedModified?.id === version.id
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => handleSelectModified(version)}
                                className="text-xs"
                              >
                                Modified
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground whitespace-nowrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(version.createdAt)}
                            </span>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDuplicateFromVersion(version)
                                }
                                disabled={isDuplicating === version.id}
                                className="flex-1 text-xs"
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                {isDuplicating === version.id
                                  ? "Duplicating..."
                                  : "Duplicate"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestoreVersion(version.id)}
                                disabled={isRestoring === version.id}
                                className="flex-1 text-xs"
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                {isRestoring === version.id
                                  ? "Restoring..."
                                  : "Restore"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="text-xs mt-1 space-y-1 font-mono">
                          {/* Markdown Diff */}
                          {(() => {
                            const { added, removed } = countDiffLines(
                              selectedOriginalMarkdown,
                              version.markdown,
                            );
                            return (
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground font-sans">
                                  Markdown:
                                </span>
                                <span
                                  style={{ color: "#16a34a" }}
                                  className="font-semibold"
                                >
                                  +{added}
                                </span>
                                <span
                                  style={{ color: "#dc2626" }}
                                  className="font-semibold"
                                >
                                  -{removed}
                                </span>
                              </div>
                            );
                          })()}

                          {/* CSS Diff */}
                          {(() => {
                            const { added, removed } = countDiffLines(
                              selectedOriginalCss,
                              version.css,
                            );
                            return (
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground font-sans">
                                  CSS:
                                </span>
                                <span
                                  style={{ color: "#16a34a" }}
                                  className="font-semibold"
                                >
                                  +{added}
                                </span>
                                <span
                                  style={{ color: "#dc2626" }}
                                  className="font-semibold"
                                >
                                  -{removed}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert className="text-sm">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    No versions found. Versions will appear here when you save
                    changes to your resume.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
