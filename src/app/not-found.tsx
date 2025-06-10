// src/app/not-found.tsx
import { Button } from "@/components/ui/button";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  // Track 404 errors
  Sentry.captureMessage("404 Page Not Found", {
    level: "warning",
    extra: {
      path:
        typeof window !== "undefined" ? window.location.pathname : "unknown",
    },
  });

  return (
    <div className="min-h-[calc(100vh-64px)]  flex items-center justify-center p-4">
      <div className="max-w-md w-full  shadow-2xl rounded-xl border border-gray-200 p-8 text-center">
        <div className="mb-6">
          <AlertTriangle className="mx-auto" size={80} strokeWidth={1.5} />
        </div>

        <h1 className="text-2xl font-bold mb-4 ">404: Career Detour Ahead!</h1>
        <Button variant={"ghost"} asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}

export function generateMetadata() {
  return {
    title: "404: Career Roadblock | Resume Builder",
    description:
      "Oops! The page you're looking for seems to have been laid off.",
  };
}
