// Updated version of your Stripe integration
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { addStripeCredits } from "@/lib/stripe/billing";
import { StripeAgentToolkit } from "@stripe/agent-toolkit/ai-sdk";
import { eq } from "drizzle-orm";
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
export const ALPHA_PRODUCT_ID = "prod_SU9j9hBWrOFvuJ";
export const ALPHA_CREDIT_AMOUNT = 5; // 5 credits for $5
export const ALPHA_METER_EVENT_NAME = "api_ai_chat";

/**
 * Creates a Stripe checkout session for credit purchases
 */
export interface CheckoutSessionParams {
  user: User;
  amount: number; // Amount in credits/dollars
}

export async function createCreditPurchaseCheckoutSession({
  user,
  amount: _amount,
}: CheckoutSessionParams): Promise<Stripe.Checkout.Session> {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            // product_data: {
            //   name: `${amount} AI Credits`,
            //   description: `Purchase ${amount} credits for AI-powered resume building`,
            // },
            // unit_amount: new Decimal(amount).mul(100).toNumber(),
            product: ALPHA_PRODUCT_ID,
            unit_amount: 0, // Free for alpha
          },
          quantity: 1,
        },
      ],
      invoice_creation: {
        enabled: true,
        invoice_data: {
          metadata: {
            user_id: user.id,
          },
        },
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
            customer_creation: "always",
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

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.customer || !invoice.metadata?.user_id) {
    console.warn("Invoice missing required metadata or customer ID");
    return;
  }
  let [dbUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, invoice.metadata.user_id));

  if (!dbUser) {
    console.warn("User not found");
    return;
  }

  // Handle case where user doesn't have stripeCustomerId yet (race condition)
  // Extract customer ID from the invoice and update the user record
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer.id;

  if (!dbUser.stripeCustomerId) {
    console.log(
      `🔄 Setting missing Stripe customer ID: ${customerId} for user: ${invoice.metadata.user_id}`,
    );
    [dbUser] = await db
      .update(user)
      .set({ stripeCustomerId: customerId })
      .where(eq(user.id, invoice.metadata.user_id))
      .returning();
  }

  try {
    // Handle alpha program
    if (dbUser.alpha_credits_redeemed) {
      console.warn("User has already redeemed their alpha credits");
      return;
    }

    await db.transaction(async (tx) => {
      const [_user] = await tx
        .update(user)
        .set({ alpha_credits_redeemed: true })
        .where(eq(user.id, invoice.metadata!.user_id))
        .returning();

      await addStripeCredits(
        _user,
        ALPHA_CREDIT_AMOUNT.toString(),
        "promotional",
      );
    });
    console.log(
      `✅ Successfully handled invoice.payment_succeeded.. Granted $${ALPHA_CREDIT_AMOUNT} to user: ${invoice.metadata.user_id}`,
    );
  } catch (error) {
    console.error("❌ Failed to grant credits", error);
    return;
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
  if (session.metadata?.user_id) {
    console.log(`💳 Updating customer ID: ${session.customer}`);
    await db
      .update(user)
      .set({ stripeCustomerId: session.customer as string })
      .where(eq(user.id, session.metadata.user_id));
    console.log(
      `✅ Customer Created: ${session.customer} for user: ${session.metadata?.user_id}`,
    );
  } else {
    console.log(`❌ No user_id found in session metadata`);
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

    console.log(`📨 Stripe Webhook ${event.id}: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case "customer.deleted":
        await handleCustomerDeleted(event.data.object);
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object);
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
