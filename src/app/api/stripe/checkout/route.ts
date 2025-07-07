import { auth } from "@/auth";
import { env } from "@/env";
import { apiRateLimiter } from "@/lib/upstash";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET() {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2025-06-30.basil",
  });
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

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: env.STRIPE_ALPHA_PRICE_ID,
          quantity: 1,
        },
      ],
      consent_collection: {
        terms_of_service: "required",
      },
      metadata: {
        user_id: session.user.id,
      },
      success_url: `${env.NEXT_PUBLIC_BASE_URL}/settings?payment=success`,
      cancel_url: `${env.NEXT_PUBLIC_BASE_URL}/settings?payment=cancelled`,
      ...(!!session.user.stripeCustomerId
        ? { customer: session.user.stripeCustomerId }
        : {
            customer_email: session.user.email,
          }),
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

    // Return a generic error message for unexpected errors
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
