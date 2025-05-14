import { auth } from "@/auth";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { login, logout } from "@/lib/actions/auth";
import Link from "next/link";

export async function Header() {
  const session = await auth();
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex w-full px-12 h-14 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Resume Builder</span>
          </Link>
        </div>

        <div className="flex items-center">
          <nav className="flex items-center space-x-2">
            {session ? (
              <div className="flex items-center gap-4">
                <Link href="/resumes">
                  <Button type="button">My Resumes</Button>
                </Link>
                <form action={logout}>
                  <Button type="submit">Sign Out</Button>
                </form>
              </div>
            ) : (
              <form action={login}>
                <Button type="submit">Sign In With Github</Button>
              </form>
            )}
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
