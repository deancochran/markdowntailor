import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { githublogin, linkedinlogin } from "@/lib/actions/auth";
import { redirect } from "next/navigation";

export default async function ResumesPage() {
  const session = await auth();
  if (session) {
    redirect("/");
  }
  return (
    <div className="w-full h-full flex flex-col items-center align-middle justify-center">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Sign in with your provider</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* <Button variant="outline" className="w-full">
            Sign in with LinkedIn
          </Button>
          <Button variant="outline" className="w-full">
            Sign in with Google
          </Button> */}
          <form action={githublogin}>
            <Button className="w-full" type="submit">
              Sign In With Github
            </Button>
          </form>
          <form action={linkedinlogin}>
            <Button className="w-full" type="submit">
              Sign In With LinkedIn
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
