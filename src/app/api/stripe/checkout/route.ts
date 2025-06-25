import { auth } from "@/auth";
import { createCreditPurchaseCheckoutSession } from "@/lib/stripe";
import { apiRateLimiter } from "@/lib/upstash";
import { User } from "next-auth";
import { NextResponse } from "next/server";

// Create a utility function to perform the checkout session creation.
async function createCheckoutSession(user: User) {
  try {
    // Call the function to create a checkout session using the user information.
    const checkoutSession = await createCreditPurchaseCheckoutSession({
      user,
    });
    return checkoutSession;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error; // Re-throw the error to be handled later
  }
}

export async function GET() {
  try {
    const session = await auth();

    // Check if there's a valid user session
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Apply rate limiting to the user
    const rateLimit = await apiRateLimiter.limit(session.user.id);
    if (!rateLimit.success) {
      return new Response("Too Many Requests", { status: 429 });
    }

    // Create the checkout session now that we have a valid session and rate limit is confirmed
    const checkoutSession = await createCheckoutSession(session.user);

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

    // Return a generic error message for unexpected errors
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
