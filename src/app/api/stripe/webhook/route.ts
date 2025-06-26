import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { updateUserWithStripeCustomerId } from "@/lib/actions/users";
import Decimal from "decimal.js";
import { and, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2025-05-28.basil",
  });
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
    console.log("🚀 Processing Stripe webhook");

    const event = stripe.webhooks.constructEvent(
      Buffer.from(body),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );

    console.log(`📨 Stripe Webhook ${event.id}: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        // Update user with Stripe customer ID if available
        if (!session.metadata?.user_id) {
          throw new Error("Missing user_id");
        }
        if (!session.amount_subtotal) {
          throw new Error("Missing amount_subtotal");
        }
        await updateUserWithStripeCustomerId(
          session.metadata.user_id,
          session.customer as string,
        );
        console.log(`💳 Updating customer ID: ${session.customer}`);
        await db
          .update(user)
          .set({
            credits: sql`${user.credits} + ${sql.raw(Decimal(session.amount_subtotal).toString())}`,
          })
          .where(
            and(
              eq(user.id, session.metadata.user_id),
              eq(user.stripeCustomerId, session.customer as string),
            ),
          );
        console.log(
          `✅ Customer Created: ${session.customer} for user: ${session.metadata?.user_id}`,
        );
        console.log(`💰 Amount Subtotal: ${session.amount_subtotal} cents`);
        break;
      case "customer.deleted":
        const customer = event.data.object;
        const userId = customer.metadata?.user_id;
        if (!userId) {
          console.error(
            "❌ No userId found in customer metadata:",
            customer.metadata,
          );
          return;
        }

        const [dbUser] = await db
          .update(user)
          .set({ stripeCustomerId: null })
          .where(eq(user.stripeCustomerId, customer.id))
          .returning();

        console.log(
          `🗑️ Customer deleted: ${customer.id} for user: ${dbUser.id}`,
        );
        break;

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

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
