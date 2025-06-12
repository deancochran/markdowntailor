import { db } from "@/db/drizzle";
import { aiRequestLog, user } from "@/db/schema";
import { openai } from "@ai-sdk/openai";
import { LanguageModelV1 } from "ai";
import Decimal from "decimal.js";
import { sql } from "drizzle-orm";
import { User } from "next-auth";
import { withSentry } from "../utils/sentry";
export type ModelObject = {
  provider_name: string;
  model_name: string;
  input: number;
  cached_input: number;
  output: number;
  model: LanguageModelV1;
};
// Exact decimal arithmetic
export function calculateRequestCost(
  model: ModelObject,
  promptTokens: number,
  completionTokens: number,
): string {
  const input = new Decimal(promptTokens).times(model.input);
  const output = new Decimal(completionTokens).times(model.output);
  return input.plus(output).toFixed(4); // Always 4 decimal places
}

export function getPreferredModelObject(user: User): ModelObject {
  switch (user.provider_preference) {
    case "openai":
      switch (user.model_preference) {
        case "o4-mini":
          return {
            provider_name: "openai",
            model_name: "o4-mini",
            input: 1.1 / 1_000_000, // $1.10 per 1M input tokens
            cached_input: 0.275 / 1_000_000, // $0.275 per 1M cached input tokens
            output: 4.4 / 1_000_000, // $4.40 per 1M output tokens
            model: openai("o4-mini"),
          };
        default:
          return {
            provider_name: "openai",
            model_name: "o4-mini",
            input: 1.1 / 1_000_000, // $1.10 per 1M input tokens
            cached_input: 0.275 / 1_000_000, // $0.275 per 1M cached input tokens
            output: 4.4 / 1_000_000, // $4.40 per 1M output tokens
            model: openai("o4-mini"),
          };
      }
    default:
      return {
        provider_name: "openai",
        model_name: "o4-mini",
        input: 1.1 / 1_000_000, // $1.10 per 1M input tokens
        cached_input: 0.275 / 1_000_000, // $0.275 per 1M cached input tokens
        output: 4.4 / 1_000_000, // $4.40 per 1M output tokens
        model: openai("o4-mini"),
      };
  }
}

export const logAIRequest = withSentry(
  "log-ai-request",
  async (
    values: Omit<
      typeof aiRequestLog.$inferInsert,
      "userId" | "model" | "modelProvider" | "costEstimate"
    >,
    authUser: User,
  ) => {
    const model_selection = getPreferredModelObject(authUser);
    const cost = calculateRequestCost(
      model_selection,
      values.promptTokens,
      values.completionTokens,
    );

    // Convert to Decimal for precise comparison
    const currentCredits = new Decimal(authUser.credits);
    const costDecimal = new Decimal(cost);

    if (currentCredits.lessThan(costDecimal)) {
      throw new Error(
        `Insufficient credits. Required: ${cost}, Available: ${authUser.credits}`,
      );
    }

    // Use transaction for atomicity
    await db.transaction(async (tx) => {
      // Atomic deduction with check
      const [updatedUser] = await tx
        .update(user)
        .set({
          credits: sql`credits - ${cost}`,
        })
        .where(sql`${user.id} = ${authUser.id} AND credits >= ${cost}`)
        .returning({ credits: user.credits });

      if (!updatedUser) {
        throw new Error("Insufficient credits or concurrent modification");
      }

      // Log the request
      await tx.insert(aiRequestLog).values({
        ...values,
        userId: authUser.id,
        credits: cost, // Store the exact cost used
        model: model_selection.model_name,
        modelProvider: model_selection.provider_name,
      });
    });
  },
);
