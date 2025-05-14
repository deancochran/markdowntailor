import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";

import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resume Builder",
  description: "A markdown-based resume editor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="grid h-screen grid-rows-[auto_1fr_auto]">
            <Header />
            <main className="w-full h-full flex items-start">{children}</main>
            <footer className="border-t p-4 text-center text-sm text-muted-foreground">
              Resume Builder &copy; {new Date().getFullYear()}
            </footer>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
