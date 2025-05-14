import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();

  // If not authenticated, redirect to login
  if (!session) {
    redirect("/");
  }

  return (
    <>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Resume Builder!</CardTitle>
              <CardDescription>
                Your account has been successfully created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                <div>
                  <p className="mb-4">
                    Your account is now set up and ready to use.
                  </p>
                  <p className="mb-6">
                    You can now create and manage your resumes. Get started by
                    creating your first resume!
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button asChild>
                    <Link href="/resumes">Create Your First Resume</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/">Go to Dashboard</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </>
  );
}
