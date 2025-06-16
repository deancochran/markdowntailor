import { auth } from "@/auth";
import { getStripeCreditsBalance } from "@/lib/stripe/billing";
import { apiRateLimiter } from "@/lib/upstash";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Check if user has Stripe customer ID
  if (!session.user.stripeCustomerId) {
    return NextResponse.json({
      credits: "0.0000",
    });
  }

  const rateLimit = await apiRateLimiter.limit(session.user.id);
  if (!rateLimit.success) {
    return new Response("Too Many Requests", {
      status: 429,
    });
  }

  try {
    if (!session.user.stripeCustomerId) {
      return NextResponse.json({
        credits: "0.0000",
      });
    }
    const stripeCredits = await getStripeCreditsBalance({
      stripeCustomerId: session.user.stripeCustomerId,
    });

    return NextResponse.json({
      credits: stripeCredits,
    });
  } catch (error) {
    console.error("Error fetching Stripe credits:", error);
    return NextResponse.json(
      { error: "Failed to fetch credit balance" },
      { status: 500 },
    );
  }
}
