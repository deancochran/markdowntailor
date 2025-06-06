import { auth } from "@/auth";
import { CreateResumeForm } from "@/components/forms/CreateResumeForm";
import ResumeListing from "@/components/ResumeListing";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getResumes } from "@/lib/actions/resume";
import { ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
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

        {/* Two Cards Section */}
        <div className="flex flex-row flex-wrap gap-6 mb-8">
          {/* Create Resume Card */}
          <div className="flex-1 min-w-[300px]">
            <Card className="h-full border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Create New Resume
                </CardTitle>
                <CardDescription>
                  Start from scratch and build your resume step by step
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreateResumeForm session={session} />
              </CardContent>
            </Card>
          </div>

          {/* Templates Card */}
          <div className="flex-1 min-w-[300px]">
            <Card className="h-full border-2 hover:border-primary/20 transition-colors justify-between">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Start with a Template
                </CardTitle>
                {/* <CardDescription>
                  Choose from professionally designed templates to get started
                  quickly
                </CardDescription> */}
              </CardHeader>
              <CardContent className="flex flex-col justify-center items-center py-8">
                <div className="w-full text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">
                    Professional Templates
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Browse our collection of modern, ATS-friendly resume
                    templates
                  </p>
                </div>
              </CardContent>
              <CardFooter className="w-full flex items-end">
                <Link href="/templates" className="w-full">
                  <Button className="w-full group" size="lg">
                    View Templates
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>

        <ResumeListing resumes={resumes} />
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
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Two Cards skeleton */}
        <div className="flex flex-row flex-wrap gap-6 mb-8">
          {/* Create Resume Card Skeleton */}
          <div className="flex-1 min-w-[300px]">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-6 w-40" />
                </div>
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-32" />
              </CardContent>
            </Card>
          </div>

          {/* Templates Card Skeleton */}
          <div className="flex-1 min-w-[300px]">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-6 w-48" />
                </div>
                <Skeleton className="h-4 w-72" />
              </CardHeader>
              <CardContent className="flex flex-col justify-center items-center py-8">
                <Skeleton className="h-16 w-16 rounded-full mb-4" />
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64 mb-6" />
                <Skeleton className="h-11 w-full" />
              </CardContent>
            </Card>
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
