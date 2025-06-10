"use client";

import { Button } from "@/components/ui/button";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-64px)]  flex items-center justify-center p-4">
      <div className="max-w-md w-full  shadow-2xl rounded-xl border border-gray-200 p-8 text-center">
        <div className="mb-6">
          <AlertTriangle className="mx-auto" size={80} strokeWidth={1.5} />
        </div>

        <h1 className="text-2xl font-bold mb-4 ">Something went wrong!</h1>
        <Button variant={"ghost"} onClick={() => reset()}>
          Return Home
        </Button>
      </div>
    </div>
  );
}
