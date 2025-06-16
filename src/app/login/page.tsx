import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { githublogin, googlelogin, linkedinlogin } from "@/lib/actions/auth";
import { redirect } from "next/navigation";

// Enhanced login content component using shadcn theming
function LoginContent() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center min-h-[80vh] bg-background transition-all duration-500 relative overflow-hidden">
      <div className="relative flex flex-col gap-4 w-full max-w-md mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Card className="backdrop-blur-sm bg-card/80 border-border shadow-xl hover:shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-8 delay-300">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-foreground">
              Sign In
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Choose your provider to continue to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={googlelogin}>
              <Button
                className="w-full h-12  bg-secondary hover:bg-secondary/90 text-secondary-foreground border border-border shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                variant="secondary"
                type="submit"
              >
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                <span className="font-medium">Continue with Google</span>
              </Button>
            </form>
            <form action={linkedinlogin}>
              <Button
                className="w-full h-12   bg-secondary hover:bg-secondary/90 text-secondary-foreground border border-border shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                variant="secondary"
                type="submit"
              >
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 400 400"
                  className="overflow-visible"
                >
                  <path
                    style={{ fill: "#0077B7" }}
                    d="M347.445,0H34.555C15.471,0,0,15.471,0,34.555v312.889C0,366.529,15.471,382,34.555,382h312.889
	C366.529,382,382,366.529,382,347.444V34.555C382,15.471,366.529,0,347.445,0z M118.207,329.844c0,5.554-4.502,10.056-10.056,10.056
	H65.345c-5.554,0-10.056-4.502-10.056-10.056V150.403c0-5.554,4.502-10.056,10.056-10.056h42.806
	c5.554,0,10.056,4.502,10.056,10.056V329.844z M86.748,123.432c-22.459,0-40.666-18.207-40.666-40.666S64.289,42.1,86.748,42.1
	s40.666,18.207,40.666,40.666S109.208,123.432,86.748,123.432z M341.91,330.654c0,5.106-4.14,9.246-9.246,9.246H286.73
	c-5.106,0-9.246-4.14-9.246-9.246v-84.168c0-12.556,3.683-55.021-32.813-55.021c-28.309,0-34.051,29.066-35.204,42.11v97.079
	c0,5.106-4.139,9.246-9.246,9.246h-44.426c-5.106,0-9.246-4.14-9.246-9.246V149.593c0-5.106,4.14-9.246,9.246-9.246h44.426
	c5.106,0,9.246,4.14,9.246,9.246v15.655c10.497-15.753,26.097-27.912,59.312-27.912c73.552,0,73.131,68.716,73.131,106.472
	L341.91,330.654L341.91,330.654z"
                  />
                </svg>
                <span className="font-medium">Continue with LinkedIn</span>
              </Button>
            </form>
            <form action={githublogin}>
              <Button
                className="w-full h-12  bg-secondary hover:bg-secondary/90 text-secondary-foreground border border-border shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                variant="secondary"
                type="submit"
              >
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 96 96"
                  className="overflow-visible"
                >
                  <path d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" />
                </svg>
                <span className="font-medium">Continue with GitHub</span>
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-muted-foreground animate-in fade-in duration-700 delay-500">
          <p data-testid="policy-agreement">
            By signing in, you agree to our{" "}
            <a
              href="#"
              className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function LoginPage() {
  const session = await auth();
  if (session) {
    redirect("/");
  }

  return <LoginContent />;
}
