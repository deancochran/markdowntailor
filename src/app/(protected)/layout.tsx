import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

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
    <Suspense>
      <SessionProvider>{children}</SessionProvider>
    </Suspense>
  );
}
