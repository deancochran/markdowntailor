"use client";

import { CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

export function PurchaseCreditsForm() {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-2">
      <PurchaseFormButton />
      <span className="text-xs text-muted-foreground">
        Secure checkout processed by Stripe
      </span>
    </div>
  );
}

function PurchaseFormButton() {
  const [isLoading, setLoading] = useState(false);
  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout");

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Failed to create checkout session");
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading}
      className="w-full max-w-xl"
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin" />
          <p>Creating Checkout...</p>
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4 mr-2" />
          <span>Claim Credits</span>
        </>
      )}
    </Button>
  );
}
