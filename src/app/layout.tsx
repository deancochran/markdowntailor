import { Toaster } from "@/components/ui/sonner";

import { auth } from "@/auth";
import { ModeToggle } from "@/components/ModeToggle";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions/auth";
import { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resume Builder",
  description: "A markdown-based resume editor",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="h-screen flex flex-col">
            <header className="sticky h-16 top-0 z-50 border-b shadow-xl">
              <div className="flex w-full px-8 h-14 items-center justify-between">
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
                      <Link href="/login">
                        <Button type="button">Sign In</Button>
                      </Link>
                    )}
                    <ModeToggle />
                  </nav>
                </div>
              </div>
            </header>

            <main className="h-full overflow-auto">{children}</main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
