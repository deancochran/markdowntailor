import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function Blocked() {
  return (
    <div className="min-h-[calc(100vh-64px)]  flex items-center justify-center p-4">
      <div className="max-w-md w-full  shadow-2xl rounded-xl border border-gray-200 p-8 text-center">
        <div className="mb-6">
          <AlertTriangle className="mx-auto" size={80} strokeWidth={1.5} />
        </div>

        <h1 className="text-2xl font-bold mb-4 ">429: Too Many Requests!</h1>
        <Button variant={"ghost"} asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}
