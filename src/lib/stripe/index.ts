// Updated version of your Stripe integration
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { StripeAgentToolkit } from "@stripe/agent-toolkit/ai-sdk";
import Decimal from "decimal.js";
import { and, eq, sql } from "drizzle-orm";
import { User } from "next-auth";
import Stripe from "stripe";
// Validate required environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("STRIPE_WEBHOOK_SECRET is required");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const stripeAgentToolkit = new StripeAgentToolkit({
  secretKey: process.env.STRIPE_SECRET_KEY,
  configuration: {
    actions: {
      paymentLinks: {
        create: true,
      },
    },
  },
});
export const ALPHA_PRODUCT_ID = "prod_SXA2y1INLaH5se";
export const ALPHA_PRICE_ID = "price_1Rc5iOIhODsTDweweITC2vcw";

/**
 * Creates a Stripe checkout session for credit purchases
 */
export interface CheckoutSessionParams {
  user: User;
}

export async function createCreditPurchaseCheckoutSession({
  user,
}: CheckoutSessionParams): Promise<Stripe.Checkout.Session> {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: ALPHA_PRICE_ID,
          quantity: 1,
        },
      ],
      consent_collection: {
        terms_of_service: "required",
      },
      metadata: {
        user_id: user.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings?payment=cancelled`,
      ...(!!user.stripeCustomerId
        ? { customer: user.stripeCustomerId }
        : {
            customer_email: user.email,
          }),
    });

    console.log("✅ Successfully handled customer.created");
    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to create checkout session",
    );
  }
}

async function handleCustomerDeleted(customer: Stripe.Customer) {
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

  console.log(`🗑️ Customer deleted: ${customer.id} for user: ${dbUser.id}`);
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
) {
  // Update user with Stripe customer ID if available
  if (!session.metadata?.user_id) {
    throw new Error("Missing user_id");
  }
  if (!session.amount_subtotal) {
    throw new Error("Missing amount_subtotal");
  }
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
}

/**
 * Handles Stripe webhook events
 */
export async function handleStripeWebhook(rawBody: Buffer, signature: string) {
  try {
    console.log("🚀 Processing Stripe webhook");

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    console.log(`📨 Stripe Webhook ${event.id}: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case "customer.deleted":
        await handleCustomerDeleted(event.data.object);
        break;

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
