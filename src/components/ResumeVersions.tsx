"use client";

import {
  ArrowLeft,
  Clock,
  Copy,
  Dot,
  FileText,
  Info,
  RotateCcw,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

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
import { db, ResumeVersion } from "@/localforage";
import { DiffEditor, DiffOnMount } from "@monaco-editor/react";
import { cx } from "class-variance-authority";
import { diffLines } from "diff";
import type { editor } from "monaco-editor";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const versionDiffEditorOptions: editor.IStandaloneDiffEditorConstructionOptions =
  {
    readOnly: true,
    renderSideBySide: true,
    scrollBeyondLastLine: false,
    minimap: { enabled: false },
  };

export default function ResumeVersionsComponent({
  versions,
}: {
  versions: ResumeVersion[];
}) {
  const router = useRouter();
  const { theme } = useTheme();

  const [selectedOriginal, setSelectedOriginal] =
    useState<ResumeVersion | null>(versions[0] ?? null);
  const [selectedModified, setSelectedModified] =
    useState<ResumeVersion | null>(versions[0] ?? null);
  const [selectedOriginalCss, setSelectedOriginalCss] = useState<string>(
    versions[0]?.css ?? "",
  );
  const [selectedModifiedCss, setSelectedModifiedCss] = useState<string>(
    versions[0]?.css ?? "",
  );
  const [selectedOriginalMarkdown, setSelectedOriginalMarkdown] =
    useState<string>(versions[0]?.markdown ?? "");
  const [selectedModifiedMarkdown, setSelectedModifiedMarkdown] =
    useState<string>(versions[0]?.markdown ?? "");
  const [editorsTab, setEditorsTab] = useState("markdown");
  const [mobileTab, setMobileTab] = useState("versions");
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);

  // Refs for editor instances
  const markdownEditorRef = useRef<editor.IStandaloneDiffEditor | null>(null);
  const cssEditorRef = useRef<editor.IStandaloneDiffEditor | null>(null);

  // Handle editor mount
  const handleMarkdownEditorMount: DiffOnMount = useCallback((editor) => {
    markdownEditorRef.current = editor;
  }, []);

  const handleCssEditorMount: DiffOnMount = useCallback((editor) => {
    cssEditorRef.current = editor;
  }, []);

  // Handle version selection
  const handleSelectOriginal = (version: ResumeVersion) => {
    setSelectedOriginal(version);
    setSelectedOriginalCss(version.css);
    setSelectedOriginalMarkdown(version.markdown);
  };

  const handleSelectModified = (version: ResumeVersion) => {
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
      const restoredResume = await db.resumes.restoreFromVersion(versionId);
      if (restoredResume) {
        toast.success("Version restored successfully");
        router.push(`/resumes/${restoredResume.id}`);
      } else {
        throw new Error("Failed to restore version");
      }
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
      const duplicatedResume = await db.resumes.duplicate(version.resumeId);
      if (duplicatedResume) {
        toast.success("Resume duplicated successfully from version");
        router.push(`/resumes/${duplicatedResume.id}`);
      } else {
        toast.error("Failed to duplicate resume: Original resume not found.");
      }
    } catch (error) {
      console.error("Duplicate error:", error);
      toast.error("Failed to duplicate resume from version");
    } finally {
      setIsDuplicating(null);
    }
  };

  function countDiffLines(original: string, modified: string) {
    const diff = diffLines(original, modified);
    let added = 0;
    let removed = 0;

    for (const part of diff) {
      if (part.added) {
        added += part.count ?? 0;
      }
      if (part.removed) {
        removed += part.count ?? 0;
      }
    }
    return { added, removed };
  }

  return (
    <div className="grid grid-rows-[auto_1fr] h-[100%] max-h-[100%]">
      {/* Header */}
      <header className="w-full flex flex-col sm:flex-row sm:h-14 items-start sm:items-center justify-between p-3 sm:p-4 gap-3 sm:gap-4 border-b bg-background">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Link href={`/resumes/${versions[0].resumeId}`}>
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Editor</span>
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold flex items-center gap-2 truncate">
              <FileText className="h-5 w-5 shrink-0" />
              <span className="truncate">Resume Versions</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Compare and manage resume versions
            </p>
          </div>
        </div>

        <Badge
          variant="secondary"
          className="flex items-center gap-1 shrink-0 w-fit sm:w-auto"
        >
          <span>
            {versions.length} version{versions.length !== 1 ? "s" : ""}
          </span>
        </Badge>
      </header>

      {/* Main Content */}
      <div className="relative flex flex-col min-h-0 p-4 h-full w-full bg-muted/20 gap-4 overflow-hidden">
        {/* Mobile Tab Bar - visible only on small screens */}
        <div className="flex md:hidden items-center justify-center gap-1 p-2 border bg-background rounded">
          <Button
            className="flex grow text-xs"
            variant={mobileTab === "versions" ? "outline" : "ghost"}
            onClick={() => setMobileTab("versions")}
          >
            <Clock className="h-3 w-3 mr-1" />
            Versions
          </Button>
          <Button
            className="flex grow text-xs"
            variant={mobileTab === "editors" ? "outline" : "ghost"}
            onClick={() => setMobileTab("editors")}
          >
            <FileText className="h-3 w-3 mr-1" />
            Editors
          </Button>
        </div>

        {/* Desktop Two-Column Layout */}
        <div className="hidden md:flex flex-row min-h-0 h-full w-full gap-4 overflow-hidden">
          {/* Left Side - Diff Editors */}
          <div className="h-full flex-1 flex flex-col border">
            {/* Desktop Editor Tab Headers */}
            <div className="relative flex items-center align-middle justify-center gap-2 p-2 border-b">
              <Button
                className="flex grow"
                variant={editorsTab === "markdown" ? "outline" : "ghost"}
                onClick={() => setEditorsTab("markdown")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Markdown Diff
              </Button>
              <Button
                className="flex grow"
                variant={editorsTab === "css" ? "outline" : "ghost"}
                onClick={() => setEditorsTab("css")}
              >
                <FileText className="h-4 w-4 mr-2" />
                CSS Diff
              </Button>
            </div>

            {/* Desktop Editor Container */}
            <div className="flex-1 relative">
              <div
                className={cx(
                  "absolute inset-0",
                  editorsTab === "markdown" ? "block" : "hidden",
                )}
              >
                <DiffEditor
                  key="markdown-diff-editor"
                  language="markdown"
                  original={selectedOriginalMarkdown}
                  modified={selectedModifiedMarkdown}
                  onMount={handleMarkdownEditorMount}
                  options={versionDiffEditorOptions}
                  theme={theme === "dark" ? "vs-dark" : "light"}
                  height="100%"
                />
              </div>

              <div
                className={cx(
                  "absolute inset-0",
                  editorsTab === "css" ? "block" : "hidden",
                )}
              >
                <DiffEditor
                  key="css-diff-editor"
                  language="css"
                  original={selectedOriginalCss}
                  modified={selectedModifiedCss}
                  onMount={handleCssEditorMount}
                  options={versionDiffEditorOptions}
                  theme={theme === "dark" ? "vs-dark" : "light"}
                  height="100%"
                />
              </div>
            </div>
          </div>

          {/* Right Side - Versions List */}
          <Card className="relative overflow-hidden w-80 shrink-0">
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
                {versions.length > 0 ? (
                  <div className="space-y-3">
                    {versions.map((version, index) => (
                      <Card
                        key={version.id}
                        className="border-muted bg-background hover:bg-muted/40 transition-colors shadow-sm w-full overflow-hidden"
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col gap-3">
                            {/* Version Info and Title */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="px-2 py-0.5 text-xs font-medium"
                                >
                                  v{version.version}
                                </Badge>
                                {index === 0 && (
                                  <div className="flex items-center gap-1">
                                    <Dot className="text-green-500" />
                                    <span className="text-xs text-muted-foreground">
                                      Current
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <CardTitle className="text-sm font-semibold truncate">
                              {version.title}
                            </CardTitle>

                            {/* Diff Stats */}
                            <div className="flex flex-col gap-1 text-xs font-mono">
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
                                    <span className="text-green-600 font-semibold">
                                      +{added}
                                    </span>
                                    <span className="text-red-600 font-semibold">
                                      -{removed}
                                    </span>
                                  </div>
                                );
                              })()}

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
                                    <span className="text-green-600 font-semibold">
                                      +{added}
                                    </span>
                                    <span className="text-red-600 font-semibold">
                                      -{removed}
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-2">
                                <Button
                                  variant={
                                    selectedOriginal?.id === version.id
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() => handleSelectOriginal(version)}
                                  className="text-xs flex-1"
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
                                  className="text-xs flex-1"
                                >
                                  Modified
                                </Button>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleDuplicateFromVersion(version)
                                  }
                                  disabled={isDuplicating === version.id}
                                  className="text-xs flex-1"
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  {isDuplicating === version.id
                                    ? "Duplicating..."
                                    : "Duplicate"}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleRestoreVersion(version.id)
                                  }
                                  disabled={
                                    isRestoring === version.id || index === 0
                                  }
                                  className="text-xs flex-1"
                                >
                                  <RotateCcw className="h-3 w-3 mr-1" />
                                  {isRestoring === version.id
                                    ? "Restoring..."
                                    : "Restore"}
                                </Button>
                              </div>
                            </div>
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

        {/* Mobile Single Column Layout */}
        <div className="flex md:hidden flex-col min-h-0 h-full w-full overflow-hidden">
          <div className="flex-1 relative">
            {/* Mobile Versions List */}
            <div
              className={cx(
                "absolute inset-0 flex flex-col",
                mobileTab === "versions" ? "block" : "hidden",
              )}
            >
              <Card className="h-full overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5" />
                    Resume Versions
                  </CardTitle>
                  <CardDescription>
                    Select versions to compare or manage
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-0">
                  <div className="p-4 space-y-4">
                    {versions.length > 0 ? (
                      <div className="space-y-3">
                        {versions.map((version, index) => (
                          <Card
                            key={version.id}
                            className="border-muted bg-background hover:bg-muted/40 transition-colors shadow-sm w-full overflow-hidden"
                          >
                            <CardContent className="p-4">
                              <div className="flex flex-col gap-3">
                                {/* Version Info and Title */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="px-2 py-0.5 text-xs font-medium"
                                    >
                                      v{version.version}
                                    </Badge>
                                    {index === 0 && (
                                      <div className="flex items-center gap-1">
                                        <Dot className="text-green-500" />
                                        <span className="text-xs text-muted-foreground">
                                          Current
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <CardTitle className="text-sm font-semibold">
                                  {version.title}
                                </CardTitle>

                                {/* Diff Stats */}
                                <div className="flex flex-wrap gap-3 text-xs font-mono">
                                  {(() => {
                                    const { added, removed } = countDiffLines(
                                      selectedOriginalMarkdown,
                                      version.markdown,
                                    );
                                    return (
                                      <div className="flex items-center gap-1">
                                        <span className="text-muted-foreground font-sans">
                                          MD:
                                        </span>
                                        <span className="text-green-600 font-semibold">
                                          +{added}
                                        </span>
                                        <span className="text-red-600 font-semibold">
                                          -{removed}
                                        </span>
                                      </div>
                                    );
                                  })()}

                                  {(() => {
                                    const { added, removed } = countDiffLines(
                                      selectedOriginalCss,
                                      version.css,
                                    );
                                    return (
                                      <div className="flex items-center gap-1">
                                        <span className="text-muted-foreground font-sans">
                                          CSS:
                                        </span>
                                        <span className="text-green-600 font-semibold">
                                          +{added}
                                        </span>
                                        <span className="text-red-600 font-semibold">
                                          -{removed}
                                        </span>
                                      </div>
                                    );
                                  })()}
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-2">
                                  <Button
                                    variant={
                                      selectedOriginal?.id === version.id
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    onClick={() =>
                                      handleSelectOriginal(version)
                                    }
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
                                    onClick={() =>
                                      handleSelectModified(version)
                                    }
                                    className="text-xs"
                                  >
                                    Modified
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleDuplicateFromVersion(version)
                                    }
                                    disabled={isDuplicating === version.id}
                                    className="text-xs"
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    {isDuplicating === version.id
                                      ? "Dup..."
                                      : "Duplicate"}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleRestoreVersion(version.id)
                                    }
                                    disabled={
                                      isRestoring === version.id || index === 0
                                    }
                                    className="text-xs"
                                  >
                                    <RotateCcw className="h-3 w-3 mr-1" />
                                    {isRestoring === version.id
                                      ? "Rest..."
                                      : "Restore"}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Alert className="text-sm">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          No versions found. Versions will appear here when you
                          save changes to your resume.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mobile Editors */}
            <div
              className={cx(
                "absolute inset-0 flex flex-col",
                mobileTab === "editors" ? "block" : "hidden",
              )}
            >
              <div className="h-full flex flex-col border">
                {/* Mobile Editor Tab Headers */}
                <div className="relative flex items-center align-middle justify-center gap-2 p-2 border-b">
                  <Button
                    className="flex grow"
                    variant={editorsTab === "markdown" ? "outline" : "ghost"}
                    onClick={() => setEditorsTab("markdown")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Markdown
                  </Button>
                  <Button
                    className="flex grow"
                    variant={editorsTab === "css" ? "outline" : "ghost"}
                    onClick={() => setEditorsTab("css")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    CSS
                  </Button>
                </div>

                {/* Mobile Editor Container */}
                <div className="flex-1 relative">
                  <div
                    className={cx(
                      "absolute inset-0",
                      editorsTab === "markdown" ? "block" : "hidden",
                    )}
                  >
                    <DiffEditor
                      key="mobile-markdown-diff-editor"
                      language="markdown"
                      original={selectedOriginalMarkdown}
                      modified={selectedModifiedMarkdown}
                      onMount={handleMarkdownEditorMount}
                      options={versionDiffEditorOptions}
                      theme={theme === "dark" ? "vs-dark" : "light"}
                      height="100%"
                    />
                  </div>

                  <div
                    className={cx(
                      "absolute inset-0",
                      editorsTab === "css" ? "block" : "hidden",
                    )}
                  >
                    <DiffEditor
                      key="mobile-css-diff-editor"
                      language="css"
                      original={selectedOriginalCss}
                      modified={selectedModifiedCss}
                      onMount={handleCssEditorMount}
                      options={versionDiffEditorOptions}
                      theme={theme === "dark" ? "vs-dark" : "light"}
                      height="100%"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
