import { auth } from "@/auth";
import { CreateResumeForm } from "@/components/forms/CreateResumeForm";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { db } from "@/db/drizzle";
import { resume } from "@/db/schema";
import { eq } from "drizzle-orm";
import { FileText } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
export default async function ResumesPage() {
  const session = await auth();
  if (!session) {
    redirect("/");
  }
  const resumes = await db
    .select()
    .from(resume)
    .where(eq(resume.userId, session.user.id));

  return (
    <div className="max-w-7xl mx-auto">
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">My Resumes</h1>
          <p className="mt-2 text-sm">
            Create, manage, and export your resumes
          </p>
        </header>

        <div className="container items-center py-2">
          <CreateResumeForm session={session} />

          {resumes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 px-6">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <FileText size={32} className="text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No resumes found</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Create your first resume using the form above to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((r) => (
                <Card
                  key={r.id}
                  className="overflow-hidden transition-all hover:shadow-md flex flex-col h-full"
                >
                  <Link href={`/resumes/${r.id}`} className="flex-1">
                    <CardHeader className="px-4 py-3">
                      <CardTitle className="text-xl">{r.title}</CardTitle>
                      <CardDescription>Resume document</CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 pb-2 pt-0">
                      <p className="text-sm text-muted-foreground">
                        Last modified: {new Date().toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
