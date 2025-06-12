"use client";

import { user } from "@/db/schema";
import { useSession } from "next-auth/react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useUser() {
  const { data: session } = useSession();

  return useSWR<typeof user.$inferSelect>(
    session?.user?.id ? "/api/user" : null,
    fetcher,
  );
}
