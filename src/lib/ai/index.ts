import { db } from "@/db/drizzle";
import { ai_credit_logs, user } from "@/db/schema";
import { anthropic } from "@ai-sdk/anthropic";

import { LanguageModelUsage, LanguageModelV1 } from "ai";
import Decimal from "decimal.js";
import { sql } from "drizzle-orm";
import { User } from "next-auth";

export type ModelObject = {
  provider_name: string;
  model_name: string;
  input_cost_p_token: Decimal; // Changed from number to Decimal
  output_cost_p_token: Decimal; // Changed from number to Decimal
  model: LanguageModelV1;
};

// Exact decimal arithmetic (keep for logging/analytics)
export function calculateRequestCost(
  model: ModelObject,
  promptTokens: number,
  completionTokens: number,
  _totalTokens: number,
): string {
  const input = new Decimal(promptTokens).times(model.input_cost_p_token);
  const output = new Decimal(completionTokens).times(model.output_cost_p_token);
  return input.plus(output).toString(); // Use toString() instead of toFixed(4) for full precision
}

export async function deductCreditsFromUser(
  _user: User,
  model: ModelObject,
  data: LanguageModelUsage,
) {
  // Implement the logic to deduct credits from the user's account
  // based on the model and data provided
  const credit_usage = calculateRequestCost(
    model,
    data.promptTokens,
    data.completionTokens,
    data.totalTokens,
  );

  console.log("AI Request Cost: $" + credit_usage);

  await db.transaction(async (tx) => {
    await tx.update(user).set({
      credits: sql`${user.credits} - ${sql.raw(credit_usage)}`,
    });

    await tx.insert(ai_credit_logs).values({
      userId: _user.id,
      amount: credit_usage,
      model: model.model_name,
      provider: model.provider_name,
      inputTokens: data.promptTokens,
      outputTokens: data.completionTokens,
      totalTokens: data.totalTokens,
    });
  });
}

export function getPreferredModelObject(user: User): ModelObject {
  if (
    user.stripeCustomerId == null ||
    user.stripeCustomerId == "" ||
    user.stripeCustomerId == undefined
  ) {
    throw new Error("No Stripe Customer ID found");
  }
  return getBaseModelConfig(user);
}

function getBaseModelConfig(user: User): ModelObject {
  switch (user.provider_preference) {
    case "anthropic":
      switch (user.model_preference) {
        case "claude-3-7-sonnet-20250219":
          return {
            provider_name: "anthropic",
            model_name: "claude-3-7-sonnet-20250219",
            input_cost_p_token: new Decimal(3.0).div(1_000_000), // $3 / MTok
            output_cost_p_token: new Decimal(15.0).div(1_000_000), // $15 / MTok
            model: anthropic("claude-3-7-sonnet-20250219"),
          };
        case "claude-4-sonnet-20250514":
          return {
            provider_name: "anthropic",
            model_name: "claude-4-sonnet-20250514",
            input_cost_p_token: new Decimal(3.0).div(1_000_000), // $3 / MTok
            output_cost_p_token: new Decimal(15.0).div(1_000_000), // $15 / MTok
            model: anthropic("claude-4-sonnet-20250514"),
          };

        default:
          return {
            provider_name: "anthropic",
            model_name: "claude-3-7-sonnet-20250219",
            input_cost_p_token: new Decimal(3.0).div(1_000_000), // $3 / MTok
            output_cost_p_token: new Decimal(15.0).div(1_000_000), // $15 / MTok
            model: anthropic("claude-3-7-sonnet-20250219"),
          };
      }
    default:
      return {
        provider_name: "anthropic",
        model_name: "claude-4-sonnet-20250514",
        input_cost_p_token: new Decimal(3.0).div(1_000_000), // $3 / MTok
        output_cost_p_token: new Decimal(15.0).div(1_000_000), // $15 / MTok
        model: anthropic("claude-4-sonnet-20250514"),
      };
  }
}
