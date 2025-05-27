import { auth } from "@/auth";
import { CreateResumeForm } from "@/components/forms/CreateResumeForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getResumes } from "@/lib/actions/resume";
import { FileText } from "lucide-react";
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
        <br />

        <CreateResumeForm session={session} />
        <br />

        <Card className="border">
          <CardHeader>
            <CardTitle className="text-2xl">My Resumes</CardTitle>
          </CardHeader>
          {resumes.length === 0 ? (
            <CardContent className="flex flex-col items-center justify-center py-16 px-6">
              <FileText size={40} className="text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Resumes Yet</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Get started by creating your first resume using the form above.
              </p>
            </CardContent>
          ) : (
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <Link
                  key={resume.id}
                  href={`/resumes/${resume.id}`}
                  className="group overflow-hidden flex flex-col hover:shadow-xl shadow-accent rounded-xl"
                >
                  <Card className="">
                    <CardHeader className="px-6 py-4">
                      <CardTitle className="text-lg line-clamp-2">
                        {resume.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-4 pt-0">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                          Last modified:{" "}
                          {new Date(
                            resume.updatedAt || Date.now(),
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </CardContent>
          )}
        </Card>
      </div>
    </Suspense>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse">
        <div className="h-8 w-1/4 bg-muted rounded mb-4"></div>
        <div className="h-4 w-1/2 bg-muted rounded mb-8"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
