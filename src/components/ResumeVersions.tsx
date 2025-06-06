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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  resume as Resume,
  resumeVersions as ResumeVersions,
} from "@/db/schema";
import { createResumeFromVersion, restoreVersion } from "@/lib/actions/resume";
import { DiffEditor, DiffOnMount } from "@monaco-editor/react";
import { InferSelectModel } from "drizzle-orm";
import {
  ArrowLeft,
  Calendar,
  Check,
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
    useState<ResumeVersion | null>(null);
  const [selectedModified, setSelectedModified] =
    useState<ResumeVersion | null>(null);
  const [editorsTab, setEditorsTab] = useState("markdown");
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);

  // Refs for editor instances
  const markdownEditorRef = useRef<editor.IStandaloneDiffEditor>(null);
  const cssEditorRef = useRef<editor.IStandaloneDiffEditor>(null);

  // Get original and modified content based on selected versions
  const getOriginalContent = (type: "markdown" | "css") => {
    if (selectedOriginal) {
      return type === "markdown"
        ? selectedOriginal.markdown
        : selectedOriginal.css;
    }
    return type === "markdown" ? resume.markdown : resume.css;
  };

  const getModifiedContent = (type: "markdown" | "css") => {
    if (selectedModified) {
      return type === "markdown"
        ? selectedModified.markdown
        : selectedModified.css;
    }
    return type === "markdown" ? resume.markdown : resume.css;
  };

  // Handle editor mount
  const handleMarkdownEditorMount: DiffOnMount = useCallback((editor) => {
    markdownEditorRef.current = editor;
  }, []);

  const handleCssEditorMount: DiffOnMount = useCallback((editor) => {
    cssEditorRef.current = editor;
  }, []);

  // Handle version selection
  const handleSelectOriginal = (version: ResumeVersion | null) => {
    setSelectedOriginal(version);
  };

  const handleSelectModified = (version: ResumeVersion | null) => {
    setSelectedModified(version);
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
      <div className="relative grid grid-cols-2 min-h-0 p-4 h-full bg-muted/20 gap-4">
        {/* Left Side - Diff Editor */}
        <Card className="relative overflow-hidden">
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

            <CardContent className="flex-1 min-h-0 overflow-hidden p-0">
              <TabsContent
                value="markdown"
                className="flex-1 min-h-0 overflow-hidden mt-0"
              >
                <DiffEditor
                  language="markdown"
                  original={getOriginalContent("markdown")}
                  modified={getModifiedContent("markdown")}
                  onMount={handleMarkdownEditorMount}
                  options={{
                    automaticLayout: true,
                    readOnly: true,
                    renderSideBySide: true,
                    cursorSmoothCaretAnimation: "on",
                    smoothScrolling: true,
                    scrollBeyondLastLine: false,
                    lineNumbers: "on",
                    renderGutterMenu: false,
                    renderOverviewRuler: true,
                    minimap: {
                      enabled: true,
                    },
                    diffWordWrap: "on",
                    ignoreTrimWhitespace: false,
                  }}
                  theme={theme === "dark" ? "vs-dark" : "light"}
                />
              </TabsContent>

              <TabsContent
                value="css"
                className="flex-1 min-h-0 overflow-hidden mt-0"
              >
                <DiffEditor
                  language="css"
                  original={getOriginalContent("css")}
                  modified={getModifiedContent("css")}
                  onMount={handleCssEditorMount}
                  options={{
                    automaticLayout: true,
                    readOnly: true,
                    renderSideBySide: true,
                    cursorSmoothCaretAnimation: "on",
                    smoothScrolling: true,
                    scrollBeyondLastLine: false,
                    lineNumbers: "on",
                    renderGutterMenu: false,
                    renderOverviewRuler: true,
                    minimap: {
                      enabled: true,
                    },
                    diffWordWrap: "on",
                    ignoreTrimWhitespace: false,
                  }}
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
              {/* Current Version */}
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary text-primary-foreground">
                        CURRENT
                      </Badge>
                      <CardTitle className="text-base">
                        Latest Version
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(resume.updatedAt)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Button
                      variant={
                        selectedOriginal === null ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleSelectOriginal(null)}
                    >
                      {selectedOriginal === null && (
                        <Check className="h-3 w-3 mr-1" />
                      )}
                      Set as Original
                    </Button>
                    <Button
                      variant={
                        selectedModified === null ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleSelectModified(null)}
                    >
                      {selectedModified === null && (
                        <Check className="h-3 w-3 mr-1" />
                      )}
                      Set as Modified
                    </Button>
                  </div>

                  <div className="space-y-1">
                    <p className="font-medium">{resume.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {resume.markdown.length} chars markdown,{" "}
                      {resume.css.length} chars CSS
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Version History */}
              {versions.length > 0 ? (
                <div className="space-y-3">
                  {versions.map((version) => (
                    <Card
                      key={version.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">v{version.version}</Badge>
                            <CardTitle className="text-sm font-medium">
                              {version.title}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDate(version.createdAt)}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant={
                              selectedOriginal?.id === version.id
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => handleSelectOriginal(version)}
                          >
                            {selectedOriginal?.id === version.id && (
                              <Check className="h-3 w-3 mr-1" />
                            )}
                            Set as Original
                          </Button>
                          <Button
                            variant={
                              selectedModified?.id === version.id
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => handleSelectModified(version)}
                          >
                            {selectedModified?.id === version.id && (
                              <Check className="h-3 w-3 mr-1" />
                            )}
                            Set as Modified
                          </Button>
                        </div>

                        <Separator />

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDuplicateFromVersion(version)}
                            disabled={isDuplicating === version.id}
                            className="flex-1"
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
                            className="flex-1"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            {isRestoring === version.id
                              ? "Restoring..."
                              : "Restore"}
                          </Button>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {version.markdown.length} chars markdown,{" "}
                          {version.css.length} chars CSS
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert>
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
