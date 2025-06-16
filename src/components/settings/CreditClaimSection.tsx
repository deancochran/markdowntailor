"use client";

import { CardContent } from "@/components/ui/card";
import { CreditCard, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface CreditClaimSectionProps {
  initialAlphaCreditsRedeemed: boolean;
}

export function CreditClaimSection({
  initialAlphaCreditsRedeemed,
}: CreditClaimSectionProps) {
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("payment");

  const [isProcessing, setIsProcessing] = useState(false);
  const [alphaCreditsRedeemed, setAlphaCreditsRedeemed] = useState(
    initialAlphaCreditsRedeemed,
  );

  useEffect(() => {
    if (paymentStatus === "success" && !isProcessing) {
      setIsProcessing(true);

      const checkCreditsStatus = async () => {
        let attempts = 0;
        const maxAttempts = 10; // 30 seconds max

        while (attempts < maxAttempts) {
          try {
            // Update session to get fresh data
            await update();

            // Check if credits have been redeemed
            if (session?.user?.alpha_credits_redeemed) {
              setAlphaCreditsRedeemed(true);
              setIsProcessing(false);
              return;
            }

            attempts++;
            if (attempts < maxAttempts) {
              await new Promise((resolve) => setTimeout(resolve, 3000));
            }
          } catch (error) {
            console.error("Error checking credits status:", error);
            break;
          }
        }

        // Stop processing after max attempts
        setIsProcessing(false);
      };

      checkCreditsStatus();
    }
  }, [paymentStatus, session, update, isProcessing]);

  if (isProcessing) {
    return (
      <CardContent className="pt-6">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-sm text-muted-foreground">
            Processing your free credits...
          </p>
        </div>
      </CardContent>
    );
  }

  if (alphaCreditsRedeemed) {
    return (
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground text-center">
          You have already redeemed your alpha credits. Thank you for being an
          early supporter!
        </p>
      </CardContent>
    );
  }

  return (
    <CardContent className="space-y-4">
      <ClaimFreeCreditsButton />
      <p className="text-xs text-muted-foreground text-center">
        Secure checkout processed by Stripe
      </p>
    </CardContent>
  );
}

function ClaimFreeCreditsButton() {
  const [isLoading, setLoading] = useState(false);
  const handleCheckout = async () => {
    setLoading(true);
    try {
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

  return (
    <Button onClick={handleCheckout} disabled={isLoading} className="w-full">
      <CreditCard className="h-4 w-4 mr-2" />
      {isLoading ? "Loading..." : "Claim Free Credits"}
    </Button>
  );
}
