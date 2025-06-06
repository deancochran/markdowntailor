import { auth } from "@/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { redirect } from "next/navigation";
import { Suspense } from "react";

// Loading component using shadcn Skeleton
function LayoutSkeleton() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-muted rounded-full animate-spin">
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
          </div>
        </div>
        <Skeleton className="h-5 w-40" />
      </div>
    </div>
  );
}

// Content wrapper with fade-in animation
function ProtectedContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      {children}
    </div>
  );
}

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <Suspense fallback={<LayoutSkeleton />}>
      <ProtectedContent>{children}</ProtectedContent>
    </Suspense>
  );
}
