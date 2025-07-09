import { auth } from "@/auth";
import ResumeListing from "@/components/resume-listing";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getResumes } from "@/lib/actions/resume";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function ResumesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  const resumes = await getResumes();

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Resumes</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Create, manage, and export your professional resumes
              </p>
            </div>
          </div>
        </header>

        <ResumeListing initialResumes={resumes} />
      </div>
    </Suspense>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Notice skeleton */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="ml-3 flex-1">
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>

        {/* Resume Listing skeleton */}
        <Card className="border">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                  <div className="space-y-2 mb-4">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-8 w-full" />
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
