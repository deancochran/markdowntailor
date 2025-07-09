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
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Markdown + CSS Resume Build | markdowntailor",
  description: "A markdown and css resume maker",
  alternates: {
    types: {
      "application/rss+xml": "https://markdowntailor.com/api/rss",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover", // This helps with safe areas
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen overflow-hidden">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="app-container flex flex-col">
            <header className="sticky top-0 z-50 border-b shadow-md flex-shrink-0">
              <div className="flex w-full px-4 h-14 items-center justify-between">
                <div className="flex items-center">
                  <Link href="/" className="flex items-center">
                    <span className="font-bold">markdowntailor</span>
                  </Link>
                </div>

                <div className="flex items-center">
                  <nav className="flex items-center gap-2">
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
                      <Button className="ml-2" type="button" asChild>
                        <Link href="/login">Sign In</Link>
                      </Button>
                    )}
                  </nav>
                </div>
              </div>
            </header>
            <main className="flex-1 overflow-y-auto overscroll-none w-full">
              {children}
            </main>

            <Toaster />
          </div>
        </ThemeProvider>
      </body>
      {/* Organization Schema for SEO */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "markdowntailor",
            url: "https://markdowntailor.com",
            logo: "https://markdowntailor.com/logo.png",
            sameAs: [
              "https://twitter.com/markdowntailor",
              "https://github.com/markdowntailor",
              "https://linkedin.com/company/markdowntailor",
            ],
            contactPoint: {
              "@type": "ContactPoint",
              email: "info@markdowntailor.com",
              contactType: "customer service",
            },
          }),
        }}
      />
    </html>
  );
}
