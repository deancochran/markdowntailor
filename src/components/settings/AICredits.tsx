"use client";

import { useUser } from "@/hooks/use-user";
import { CreditCard, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Skeleton } from "../ui/skeleton";

function AICreditsLoading() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Credits</CardTitle>
        <CardDescription>
          Get credits to power your AI-assisted resume building
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Current Balance Skeleton */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="text-sm font-medium">Current Balance</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled
              title="Refresh balance"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Purchase Section Skeleton */}
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-48 mx-auto" />
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}

export function AICredits() {
  const { data: user, error, mutate } = useUser();

  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 5 }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create checkout session");
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div>Error loading AI credits. Please refresh page.</div>;
  if (!user) return <AICreditsLoading />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Credits</CardTitle>
        <CardDescription>
          Get credits to power your AI-assisted resume building
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Current Balance */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="text-sm font-medium">Current Balance</span>
            </div>
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
          <div className="text-2xl font-bold">
            {parseFloat(user.credits).toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground">Available AI credits</p>
        </div>
        {user.alpha_credits_redeemed === false && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">$5.00 Credit Package</CardTitle>
              <CardDescription>
                Perfect for testing AI resume enhancements and optimization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleCheckout}
                disabled={loading || user.alpha_credits_redeemed}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Purchase Credits
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Secure payment processed by Stripe
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
