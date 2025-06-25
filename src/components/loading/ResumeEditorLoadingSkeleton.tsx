import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Download,
  Loader2,
  Printer,
  Save,
  Trash,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

const CodeLineSkeleton = ({ width = "w-full" }) => (
  <div className="flex items-center space-x-2 py-1">
    <Skeleton className={`h-4 ${width}`} />
  </div>
);

const ResumeEditorLoadingSkeleton = () => {
  return (
    <div className="grid grid-rows-[auto_1fr] h-[100%] max-h-[100%]">
      {/* Header with skeleton buttons */}
      <div className="w-full flex h-14 items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-4">
          {/* Back button skeleton */}
          <div className="flex items-center justify-center w-9 h-9 rounded-md border bg-muted animate-pulse">
            <ArrowLeft className="h-5 w-5 text-muted-foreground/30" />
          </div>
          {/* Title skeleton */}
          <Skeleton className="h-7 w-48" />
        </div>

        <div className="flex items-center gap-2">
          {/* Action buttons skeletons */}
          {[
            { icon: Save, text: "Save" },
            { icon: Printer, text: "Print PDF" },
            { icon: Download, text: "Download HTML" },
            { icon: Trash, text: "Delete" },
          ].map(({ icon: Icon, text }, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-2 rounded-md border bg-muted animate-pulse"
            >
              <Icon className="h-4 w-4 text-muted-foreground/30" />
              <span className="text-sm text-muted-foreground/50">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div className="relative grid grid-cols-2 min-h-0 p-4 h-full bg-muted gap-4">
        {/* Left panel - Editor */}
        <div className="relative overflow-hidden">
          <div className="flex flex-col gap-0 h-full border rounded-lg bg-background overflow-hidden">
            {/* Editor tabs */}
            <div className="w-full flex justify-start border-b px-4 py-2 bg-muted/50">
              <div className="flex gap-2">
                <div className="px-4 py-2 bg-background rounded-t-md border-x border-t">
                  <span className="text-sm font-medium">Markdown</span>
                </div>
                <div className="px-4 py-2 text-muted-foreground">
                  <span className="text-sm">CSS</span>
                </div>
              </div>
            </div>

            {/* Editor content skeleton */}
            <div className="flex-1 p-4 space-y-2 overflow-hidden">
              {/* Simulate markdown content */}
              <CodeLineSkeleton width="w-32" />
              <CodeLineSkeleton width="w-48" />
              <CodeLineSkeleton width="w-24" />
              <div className="py-2" />
              <CodeLineSkeleton width="w-64" />
              <CodeLineSkeleton width="w-56" />
              <CodeLineSkeleton width="w-40" />
              <div className="py-2" />
              <CodeLineSkeleton width="w-36" />
              <CodeLineSkeleton width="w-52" />
              <CodeLineSkeleton width="w-44" />
              <CodeLineSkeleton width="w-48" />
              <div className="py-2" />
              <CodeLineSkeleton width="w-28" />
              <CodeLineSkeleton width="w-60" />
              <CodeLineSkeleton width="w-32" />
              <CodeLineSkeleton width="w-56" />
              <CodeLineSkeleton width="w-40" />
            </div>
          </div>
        </div>

        {/* Right panel - Preview/Chat */}
        <div className="relative overflow-hidden">
          <div className="flex flex-col gap-0 h-full border rounded-lg bg-background overflow-hidden">
            {/* Preview tabs */}
            <div className="w-full flex justify-start border-b px-4 py-2 bg-muted/50">
              <div className="flex gap-2">
                <div className="px-4 py-2 bg-background rounded-t-md border-x border-t">
                  <span className="text-sm font-medium">Print Preview</span>
                </div>
                <div className="px-4 py-2 text-muted-foreground">
                  <span className="text-sm">AI Chat</span>
                </div>
              </div>
            </div>

            {/* Preview content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Document preview skeleton */}
              <div className="flex-1 w-full overflow-hidden p-4 flex justify-center">
                <div
                  className="bg-white border shadow-sm rounded-md p-8 space-y-4"
                  style={{
                    width: "210mm",
                    maxWidth: "100%",
                    aspectRatio: "210/297",
                  }}
                >
                  {/* Header section */}
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-4 w-56" />
                  </div>

                  {/* Divider */}
                  <div className="border-t my-4" />

                  {/* Experience section */}
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-32" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-5/6" />
                      <Skeleton className="h-3 w-4/5" />
                    </div>
                  </div>

                  {/* Skills section */}
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-24" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-14" />
                      <Skeleton className="h-6 w-18" />
                      <Skeleton className="h-6 w-22" />
                    </div>
                  </div>

                  {/* Education section */}
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-28" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-44" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview controls */}
              <div className="bg-muted text-muted-foreground h-10 items-center w-full flex justify-between border-t px-2">
                <div className="text-sm text-muted-foreground">A4 Preview</div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-muted-foreground/10 disabled:opacity-50">
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="text-sm">80%</span>
                  <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-muted-foreground/10">
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading indicator overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center pointer-events-none">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg font-medium">Loading Resume Editor</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Preparing your editing environment...
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResumeEditorLoadingSkeleton;
