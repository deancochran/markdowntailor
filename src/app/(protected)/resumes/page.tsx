import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/db/drizzle";
import { resumes } from "@/db/schemas";

import { eq } from "drizzle-orm";
import { FileText } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
export default async function ResumesPage() {
  const session = await auth();
  if (!session) {
    redirect("/");
  }
  const all_resumes = await db
    .select()
    .from(resumes)
    .where(eq(resumes.userId, session.user.id));
  return (
    <div className="max-w-7xl mx-auto">
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">My Resumes</h1>
          <p className="mt-2 text-sm">
            Create, manage, and export your resumes
          </p>
        </header>

        <div className="container py-2">
          {/* <Card className="mb-8">
            <CardHeader className="px-6 py-4">
              <CardTitle>Create New Resume</CardTitle>
              <CardDescription>
                Enter a name for your new resume to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 py-4">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleCreateNewResume)}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="resumeName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Enter resume name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Resume"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card> */}

          {all_resumes.length === 0 ? (
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
              {all_resumes.map((resume) => (
                <Card
                  key={resume.id}
                  className="overflow-hidden transition-all hover:shadow-md flex flex-col h-full"
                >
                  <Link href={`/editor/${resume.id}`} className="flex-1">
                    <CardHeader className="px-4 py-3">
                      <CardTitle className="text-xl">{resume.title}</CardTitle>
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
