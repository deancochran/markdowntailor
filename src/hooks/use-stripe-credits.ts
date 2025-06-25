"use client";

import { useSession } from "next-auth/react";
import useSWR from "swr";

export interface StripeCreditsResponse {
  credits: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useStripeCredits() {
  const { data: session } = useSession();

  return useSWR<StripeCreditsResponse>(
    session?.user?.id ? "/api/stripe/credits" : null,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    },
  );
}
