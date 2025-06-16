"use client";
import { useStripeCredits } from "@/hooks/use-stripe-credits";
import { RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

export function StripeBillingCredits() {
  const { data: creditsData, mutate } = useStripeCredits();

  if (!creditsData) {
    return <Skeleton className="h-8 w-20" />;
  }

  const creditBalance = parseFloat(creditsData.credits).toFixed(2);
  return (
    <div className="flex items-center gap-2">
      <span className="text-3xl font-bold">${creditBalance}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => mutate()}
        className="h-8 w-8 p-0"
        title="Refresh balance"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
}
