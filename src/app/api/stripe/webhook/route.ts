import { handleStripeWebhook } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Get raw body as text
    const body = await req.text();

    if (!body) {
      console.error("No request body received");
      return NextResponse.json({ error: "No request body" }, { status: 400 });
    }

    // Get Stripe signature from headers
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("No Stripe signature found in headers");
      return NextResponse.json(
        { error: "Missing Stripe signature" },
        { status: 400 },
      );
    }

    // Process the webhook
    const result = await handleStripeWebhook(Buffer.from(body), signature);

    if (!result.success) {
      console.error("Webhook processing failed:", result.error);
      return NextResponse.json(
        { error: result.error || "Webhook processing failed" },
        { status: 400 },
      );
    }

    console.log("Webhook processed successfully");
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook endpoint error:", error);

    // Handle specific Stripe errors
    if (error instanceof Error) {
      if (error.message.includes("signature")) {
        return NextResponse.json(
          { error: "Invalid webhook signature" },
          { status: 400 },
        );
      }

      if (error.message.includes("timestamp")) {
        return NextResponse.json(
          { error: "Webhook timestamp too old" },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
