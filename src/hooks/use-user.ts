import { User } from "next-auth";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

export function useUser() {
  const { data, error, mutate, isLoading } = useSWR("/api/user", fetcher, {
    refreshInterval: 30000, // optional: auto-refresh every 30s
  });

  return {
    user: data as User,
    isLoading,
    error,
    mutate, // for manual revalidation after purchases
  };
}
