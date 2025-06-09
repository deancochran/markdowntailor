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
import { Github, Linkedin } from "lucide-react";
import { redirect } from "next/navigation";

// Enhanced login content component using shadcn theming
function LoginContent() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center min-h-[80vh] bg-background transition-all duration-500 relative overflow-hidden">
      <div className="relative flex flex-col gap-4 w-full max-w-md mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Logo/Brand area */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to continue to your account
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-card/80 border-border shadow-xl hover:shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-8 delay-300">
          <CardHeader className="space-y-3 pb-6">
            <CardTitle className="text-2xl font-semibold text-center text-card-foreground">
              Sign In
            </CardTitle>
            <CardDescription className="text-center">
              Choose your preferred sign-in method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={githublogin}>
              <Button
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                type="submit"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <Github className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
                <span className="font-medium">Continue with GitHub</span>
              </Button>
            </form>

            <form action={linkedinlogin}>
              <Button
                className="w-full h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground border border-border shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                variant="secondary"
                type="submit"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <Linkedin className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
                <span className="font-medium">Continue with LinkedIn</span>
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
