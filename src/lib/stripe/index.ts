// Create a new file: src/lib/stripe.ts
import { db } from "@/db/drizzle";
import { aiRequestLog, user } from "@/db/schema";
import Decimal from "decimal.js";
import { desc, eq, sql } from "drizzle-orm";
import Stripe from "stripe";

// Validate required environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("STRIPE_WEBHOOK_SECRET is required");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
export const ALPHA_PRODUCT_ID = "prod_SU9j9hBWrOFvuJ";
export const ALPHA_CREDIT_AMOUNT = 5; // 5 credits for $5
/**
 * Creates a Stripe checkout session
 */
// Types for better type safety
export interface CheckoutSessionParams {
  userId: string;
  amount?: number; // Amount in cents
}

export async function createCheckoutSession({
  userId,
  amount,
}: CheckoutSessionParams): Promise<Stripe.Checkout.Session> {
  try {
    // Validate required parameters
    if (!amount) {
      throw new Error("Either priceId or amount is required");
    }

    // Get user from database using Drizzle ORM
    const [dbUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!dbUser) {
      throw new Error("User not found");
    }

    // Base session parameters
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings?payment=cancelled`,
      metadata: {
        user_id: userId,
      },
    };

    sessionParams.line_items = [
      {
        price_data: {
          currency: "usd",
          product: "prod_SU9j9hBWrOFvuJ",
          unit_amount: 0,
        },
        quantity: 1,
      },
    ];

    // Handle existing Stripe customer
    if (dbUser.stripeCustomerId) {
      try {
        // Verify the customer still exists in Stripe
        await stripe.customers.retrieve(dbUser.stripeCustomerId);
        sessionParams.customer = dbUser.stripeCustomerId;
      } catch (error) {
        const stripeError = error as Stripe.errors.StripeError;
        if (stripeError.statusCode === 404) {
          // Customer was deleted in Stripe but not in our DB
          console.log(
            `Customer ${dbUser.stripeCustomerId} not found in Stripe, will create new one`,
          );
          // Clear the invalid customer ID
          await db
            .update(user)
            .set({ stripeCustomerId: null })
            .where(eq(user.id, userId));
        } else {
          throw error;
        }
      }
    }

    // Configure customer creation if no valid customer ID
    if (!sessionParams.customer) {
      sessionParams.customer_creation = "always";
      if (dbUser.email) {
        sessionParams.customer_email = dbUser.email;
      }
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);

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
/**
 * Handles successful checkout session completion
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  try {
    console.log("🎯 Starting handleCheckoutSessionCompleted");
    console.log("Session data:", {
      id: session.id,
      amount_total: session.amount_total,
      customer: session.customer,
      metadata: session.metadata,
    });

    const userId = session.metadata?.user_id;
    if (!userId) {
      console.error(
        "❌ No user_id found in session metadata:",
        session.metadata,
      );
      return;
    }

    console.log(`✅ Processing checkout for user: ${userId}`);

    // Update user with Stripe customer ID if available
    if (session.customer) {
      console.log(`💳 Updating customer ID: ${session.customer}`);
      await db
        .update(user)
        .set({ stripeCustomerId: session.customer as string })
        .where(eq(user.id, userId));
    }

    // ALPHA RELEASE STRIPE LOGIC
    // Get line items to verify the product
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    console.log("📦 Line items:", lineItems.data);
    const hasAlphaProduct = lineItems.data.some(
      (item) => item.price?.product === ALPHA_PRODUCT_ID,
    );

    if (hasAlphaProduct) {
      console.log(
        `🎁 Alpha product detected, adding ${ALPHA_CREDIT_AMOUNT} credits to user ${userId}`,
      );

      await db.transaction(async (tx)=>{

        await tx.update(user)
        .set({
          credits: sql`credits + ${ALPHA_CREDIT_AMOUNT}`, // Add alpha credits
          alpha_credits_redeemed: true
        })
        .where(eq(user.id, userId));
      })

      console.log(
        `✅ Added $${ALPHA_CREDIT_AMOUNT} credits to user ${userId} for alpha program checkout (Product: ${ALPHA_PRODUCT_ID})`,
      );
    } else {
      // Fallback to amount-based credits for regular products
      const amountTotal = session.amount_total;
      console.log(`💰 Amount total: ${amountTotal}`);

      if (amountTotal) {
        // Convert cents to credits with proper precision (USD DOLLARS)
        const creditsToAdd = new Decimal(amountTotal).dividedBy(100).toFixed(4);

        console.log(
          `🔄 About to add ${creditsToAdd} credits to user ${userId}`,
        );

        await db
          .update(user)
          .set({
            credits: sql`credits + ${creditsToAdd}`, // Add to existing credits
          })
          .where(eq(user.id, userId));

        console.log(
          `✅ Added ${creditsToAdd} credits to user ${userId} for payment of $${new Decimal(amountTotal).dividedBy(100).toFixed(2)}`,
        );
      } else {
        console.log(
          "⚠️ No alpha product found and no amount_total, skipping credit addition",
        );
      }
    }
  } catch (error) {
    console.error("❌ Error handling checkout session completed:", error);
    throw error;
  }
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

    console.log(`📨 Webhook event type: ${event.type}`);
    console.log(`📨 Event ID: ${event.id}`);

    switch (event.type) {
      case "checkout.session.completed":
        console.log("🎯 Handling checkout.session.completed event");
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        console.log("✅ Successfully handled checkout.session.completed");
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
// Get user's payment history from Stripe (when needed)
export async function getUserPaymentHistory(stripeCustomerId: string) {
  if (!stripeCustomerId) return [];

  const charges = await stripe.charges.list({
    customer: stripeCustomerId,
    limit: 100,
  });

  return charges.data.map((charge) => ({
    id: charge.id,
    amount: charge.amount / 100, // Convert to dollars
    status: charge.status,
    created: new Date(charge.created * 1000),
    description: charge.description,
  }));
}

// Get user's credit usage history (from your existing aiRequestLog)
export async function getUserCreditUsage(userId: string, limit = 50) {
  return await db
    .select()
    .from(aiRequestLog)
    .where(eq(aiRequestLog.userId, userId))
    .orderBy(desc(aiRequestLog.createdAt))
    .limit(limit);
}
