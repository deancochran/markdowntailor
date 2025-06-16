import { auth } from "@/auth";
import { createCreditPurchaseCheckoutSession } from "@/lib/stripe";
import { apiRateLimiter } from "@/lib/upstash";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.alpha_credits_redeemed) {
      return new Response("User has already redeemed their credits", {
        status: 403,
      });
    }

    const rateLimit = await apiRateLimiter.limit(session.user.id);
    if (!rateLimit.success) {
      return new Response("Too Many Requests", {
        status: 429,
      });
    }

    // Parse request body to get amount and other parameters
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    // Extract and validate parameters (removed subscription-related fields)
    const { amount } = body;

    // Validate that either amount or priceId is provided
    if (!amount) {
      return NextResponse.json(
        { error: "Either amount or priceId must be provided" },
        { status: 400 },
      );
    }

    // Validate amount if provided (should be in cents and positive)
    if (amount && (typeof amount !== "number" || amount <= 0)) {
      return NextResponse.json(
        { error: "Amount must be a positive number in cents" },
        { status: 400 },
      );
    }

    // ALPHA RELEASE CHECKOUT
    const checkoutSession = await createCreditPurchaseCheckoutSession({
      user: session.user,
      amount,
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

      if (error.message.includes("Either priceId or amount is required")) {
        return NextResponse.json(
          { error: "Invalid payment parameters" },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
