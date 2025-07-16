"use client";
import ResumeVersionsComponent from "@/components/ResumeVersions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { db, ResumeVersion } from "@/localforage";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// Loading skeleton component
function ResumeVersionsLoadingSkeleton() {
  return (
    <div className="grid grid-rows-[auto_1fr] h-[100%] max-h-[100%]">
      {/* Header Skeleton */}
      <header className="w-full flex h-14 items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="w-64 h-6" />
            <Skeleton className="w-48 h-4" />
          </div>
        </div>
        <Skeleton className="w-20 h-6 rounded-full" />
      </header>

      {/* Main Content Skeleton */}
      <div className="relative grid grid-cols-2 min-h-0 p-4 h-full bg-muted/20 gap-4">
        {/* Left Side - Editor Skeleton */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-0">
            <div className="flex gap-2">
              <Skeleton className="w-32 h-10 rounded-md" />
              <Skeleton className="w-24 h-10 rounded-md" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 overflow-hidden p-0">
            <Skeleton className="w-full h-full" />
          </CardContent>
        </Card>

        {/* Right Side - Versions List Skeleton */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded-sm" />
              <Skeleton className="w-40 h-6" />
            </div>
            <Skeleton className="w-56 h-4" />
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="p-4 space-y-4">
              {/* Current Version Skeleton */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-16 h-6 rounded-full" />
                      <Skeleton className="w-32 h-5" />
                    </div>
                    <Skeleton className="w-20 h-4" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Skeleton className="w-28 h-8 rounded-md" />
                    <Skeleton className="w-28 h-8 rounded-md" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="w-48 h-5" />
                    <Skeleton className="w-64 h-4" />
                  </div>
                </CardContent>
              </Card>

              {/* Version Items Skeleton */}
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-8 h-6 rounded-md" />
                        <Skeleton className="w-40 h-5" />
                      </div>
                      <Skeleton className="w-20 h-4" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="w-28 h-8 rounded-md" />
                      <Skeleton className="w-28 h-8 rounded-md" />
                    </div>
                    <Skeleton className="w-full h-px" />
                    <div className="flex gap-2">
                      <Skeleton className="flex-1 h-8 rounded-md" />
                      <Skeleton className="flex-1 h-8 rounded-md" />
                    </div>
                    <Skeleton className="w-full h-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResumeVersionsPage() {
  const { uuid } = useParams<{ uuid: string }>(); // dynamic segment

  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = (await db.resumeVersions.findAllByResumeId(uuid)) ?? [];
        if (!cancelled) setVersions(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uuid]);

  if (versions?.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <h2 className="text-2xl font-bold text-center">
              No versions found
            </h2>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center">
              There are no versions for the resume you&apos;re looking for.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Suspense fallback={<ResumeVersionsLoadingSkeleton />}>
      <ResumeVersionsComponent versions={versions} />
    </Suspense>
  );
}
