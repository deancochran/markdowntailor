import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { login, logout } from "@/lib/actions/auth";
import Link from "next/link";

export async function Header() {
  const session = await auth();
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex w-full px-12 h-14 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Resume Builder</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {session && (
              <Link
                href="/resumes"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                My Resumes
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center">
          <nav className="flex items-center space-x-2">
            {session ? (
              <div className="flex items-center gap-4">
                <span>
                  Hi,{" "}
                  {session.user.name ||
                    session.user.username ||
                    session.user.email}
                </span>
                <Link href="/resumes">
                  <Button variant="outline">My Resumes</Button>
                </Link>
                <form action={logout}>
                  <Button
                    className="text-sm font-medium text-gray-700 hover:text-blue-600"
                    type="submit"
                  >
                    Sign Out
                  </Button>
                </form>
              </div>
            ) : (
              <form action={login}>
                <Button type="submit" variant="default">
                  Sign In With Github
                </Button>
              </form>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
