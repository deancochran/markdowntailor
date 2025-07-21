import { Toaster } from "@/components/ui/sonner";

import { ModeToggle } from "@/components/ModeToggle";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://markdowntailor.com"),
  title: "ATS-Optimized Resume Builder to Get You Hired | markdowntailor",
  description:
    "Build, Create, and Tailor ATS-friendly resumes that get past screening systems and into the hands of hiring managers.",
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen overflow-hidden">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
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
                    <Button variant={"secondary"} asChild>
                      <Link href="/resumes">Resumes</Link>
                    </Button>
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
          }),
        }}
      />
      {/* WebSite Schema for SEO */}
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            url: "https://markdowntailor.com",
            name: "markdowntailor",
            potentialAction: {
              "@type": "SearchAction",
              target:
                "https://markdowntailor.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
      {/* LocalForage Script */}
    </html>
  );
}
