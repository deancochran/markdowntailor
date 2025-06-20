import { auth } from "@/auth";
import { createCreditPurchaseCheckoutSession } from "@/lib/stripe";
import { apiRateLimiter } from "@/lib/upstash";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await apiRateLimiter.limit(session.user.id);
    if (!rateLimit.success) {
      return new Response("Too Many Requests", {
        status: 429,
      });
    }

    // ALPHA RELEASE CHECKOUT
    const checkoutSession = await createCreditPurchaseCheckoutSession({
      user: session.user,
    });

    // Return the checkout session URL
    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error("Checkout error:", error);

    // Handle specific error types for better user experience
    if (error instanceof Error) {
      if (error.message.includes("User not found")) {
        return NextResponse.json(
          { error: "User account not found" },
          { status: 404 },
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
