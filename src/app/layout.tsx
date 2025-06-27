import { Toaster } from "@/components/ui/sonner";

import { auth } from "@/auth";
import { ModeToggle } from "@/components/ModeToggle";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/actions/auth";
import * as Sentry from "@sentry/nextjs";
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "markdowntailor",
  description: "A markdown-based resume editor",
  other: {
    ...Sentry.getTraceData(),
  },
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
              <div className="flex w-full px-2 h-14 items-center justify-between">
                <div className="flex items-center">
                  <Link href="/" className="flex items-center ">
                    <span className="font-bold">markdowntailor</span>
                  </Link>
                </div>

                <div className="flex items-center">
                  <nav className="flex items-center space-x-2">
                    {/* DARK MODE SWITCH */}
                    <ModeToggle />
                    {/* AVATAR DropdownMenu */}
                    {session ? (
                      <div className="flex items-center gap-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Avatar className="cursor-pointer">
                              <AvatarImage
                                src={session.user?.image || undefined}
                                alt={session.user?.name || "User"}
                              />
                              <AvatarFallback>
                                {session.user?.name
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-center w-full cursor-pointer"
                              asChild
                            >
                              <Link href="/resumes">Resumes</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-center w-full cursor-pointer"
                              asChild
                            >
                              <Link href="/settings">Settings</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <form action={logout}>
                                <button
                                  type="submit"
                                  className="w-full text-left cursor-pointer"
                                >
                                  Sign Out
                                </button>
                              </form>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ) : (
                      <Button className="" type="button" asChild>
                        <Link href="/login">Sign In</Link>
                      </Button>
                    )}
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
