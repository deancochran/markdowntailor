import { ALPHA_METER_EVENT_NAME, stripe } from "@/lib/stripe";
import { Decimal } from "decimal.js";
import { User } from "next-auth";

/**
 * Retrieves the current credit balance for a customer from Stripe
 */
export async function getStripeCreditsBalance(user: User): Promise<string> {
  if (!user.stripeCustomerId) {
    throw new Error("User does not have a Stripe customer ID");
  }

  try {
    const creditBalanceSummary =
      await stripe.billing.creditBalanceSummary.retrieve({
        customer: user.stripeCustomerId,
        filter: {
          type: "applicability_scope",
          applicability_scope: {
            price_type: "metered",
          },
        },
      });

    // Check if balances array exists and has at least one item
    if (
      !creditBalanceSummary.balances ||
      creditBalanceSummary.balances.length === 0
    ) {
      console.log(
        "No credit balances found for customer:",
        user.stripeCustomerId,
      );
      return "0.0000";
    }

    // Get the first balance and safely access the monetary value
    const firstBalance = creditBalanceSummary.balances[0];
    const monetaryValue = firstBalance?.available_balance?.monetary?.value;

    // Convert from cents to dollars and return as string for precision
    const balanceInDollars = new Decimal(monetaryValue || 0)
      .dividedBy(100)
      .toFixed(4);

    return balanceInDollars;
  } catch (error) {
    console.error("Error retrieving Stripe credit balance:", error);
    // Return "0.0000" instead of throwing to prevent UI breaking
    return "0.0000";
  }
}

/**
 * Checks if a customer has sufficient credits for a transaction
 */
export async function hasStripeCreditsForAmount(
  user: User,
  requiredAmount: string,
  buffer: string = "0.0001",
): Promise<boolean> {
  try {
    const currentBalance = await getStripeCreditsBalance(user);
    const current = new Decimal(currentBalance);
    const required = new Decimal(requiredAmount);
    const bufferAmount = new Decimal(buffer);

    return current.greaterThanOrEqualTo(required.plus(bufferAmount));
  } catch (error) {
    console.error("Error checking Stripe credit sufficiency:", error);
    return false;
  }
}

/**
 * Deducts credits from Stripe by creating a credit balance transaction
 */
export async function deductStripeCredits(
  user: User,
  amount: string,
): Promise<void> {
  if (!user.stripeCustomerId) {
    throw new Error("User does not have a Stripe customer ID");
  }

  try {
    // Convert dollars to cents for Stripe
    const amountInCents = new Decimal(amount).mul(100).toNumber();

    await stripe.billing.meterEvents.create({
      event_name: ALPHA_METER_EVENT_NAME,
      payload: {
        value: `${amountInCents}`,
        stripe_customer_id: user.stripeCustomerId,
      },
    });
  } catch (error) {
    console.error("Error deducting Stripe credits:", error);
    throw new Error("Failed to deduct credits from Stripe");
  }
}

/**
 * Lists recent credit balance transactions for a customer
 */
export async function getStripeCreditTransactions(
  user: User,
  limit: number = 10,
) {
  if (!user.stripeCustomerId) {
    throw new Error("User does not have a Stripe customer ID");
  }

  try {
    const transactions = await stripe.billing.creditBalanceTransactions.list({
      customer: user.stripeCustomerId,
      limit,
    });

    return transactions.data.map((transaction) => ({
      id: transaction.id,
      amount: new Decimal(transaction.credit?.amount?.monetary?.value || 0)
        .dividedBy(100)
        .toFixed(4),
      currency: transaction.credit?.amount?.monetary?.currency || "usd",
      type: transaction.type,
      created: new Date(transaction.created * 1000),
    }));
  } catch (error) {
    console.error("Error retrieving Stripe credit transactions:", error);
    throw new Error("Failed to retrieve credit transactions from Stripe");
  }
}

/**
 * Adds credits to a customer's Stripe balance via credit grant
 */
export async function addStripeCredits(
  user: User,
  amount: string,
  category: "paid" | "promotional" = "paid",
  effectiveAt?: Date,
  expiresAt?: Date,
): Promise<void> {
  if (!user.stripeCustomerId) {
    throw new Error("User does not have a Stripe customer ID");
  }

  try {
    const amountInCents = new Decimal(amount).mul(100).toNumber();

    await stripe.billing.creditGrants.create({
      customer: user.stripeCustomerId,
      category,
      amount: {
        type: "monetary",
        monetary: {
          value: amountInCents,
          currency: "usd",
        },
      },
      applicability_config: {
        scope: { price_type: "metered" },
      },
      ...(expiresAt && { expires_at: Math.floor(expiresAt.getTime() / 1000) }),
      ...(effectiveAt && {
        effective_at: Math.floor(effectiveAt.getTime() / 1000),
      }),
    });
  } catch (error) {
    console.error("Error adding Stripe credits:", error);
    throw new Error("Failed to add credits to Stripe");
  }
}
