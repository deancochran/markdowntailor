import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <SessionProvider>
          <div className="grid h-screen grid-rows-[auto_1fr_auto]">
            <Header />
            <main className="w-full h-full flex items-start">{children}</main>
            <footer className="border-t p-4 text-center text-sm text-muted-foreground">
              Resume Builder &copy; {new Date().getFullYear()}
            </footer>
          </div>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
