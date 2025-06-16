import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";

import {
  LanguageModelV1,
  experimental_wrapLanguageModel as wrapLanguageModel,
} from "ai";
import Decimal from "decimal.js";
import { User } from "next-auth";
import { stripeAgentToolkit } from "../stripe";

export type ModelObject = {
  provider_name: string;
  model_name: string;
  input: number;
  cached_input: number;
  output: number;
  model: LanguageModelV1;
  billingEnabled?: boolean; // New field to control billing
};

// Exact decimal arithmetic (keep for logging/analytics)
export function calculateRequestCost(
  model: ModelObject,
  promptTokens: number,
  completionTokens: number,
): string {
  const input = new Decimal(promptTokens).times(model.input);
  const output = new Decimal(completionTokens).times(model.output);
  return input.plus(output).toFixed(4);
}

export function getPreferredModelObject(user: User): ModelObject {
  if (
    user.stripeCustomerId == null ||
    user.stripeCustomerId == "" ||
    user.stripeCustomerId == undefined
  ) {
    throw new Error("No Stripe Customer ID found");
  }
  const baseModel = getBaseModelConfig(user);

  // Wrap the model with Stripe billing middleware
  const wrappedModel = wrapLanguageModel({
    model: baseModel.model,
    middleware: stripeAgentToolkit.middleware({
      billing: {
        customer: user.stripeCustomerId, // Customer ID from your User object
        meters: {
          input: "ai_input_tokens",
          output: "ai_output_tokens",
        },
      },
    }),
  });

  return {
    ...baseModel,
    model: wrappedModel,
    billingEnabled: true,
  };
}

function getBaseModelConfig(user: User): ModelObject {
  switch (user.provider_preference) {
    case "openai":
      switch (user.model_preference) {
        case "gpt-4.1":
          return {
            provider_name: "openai",
            model_name: "gpt-4.1",
            input: 2.0 / 1_000_000,
            cached_input: 0.5 / 1_000_000,
            output: 8.0 / 1_000_000,
            model: openai("gpt-4.1"),
          };
        case "gpt-4.1-mini":
          return {
            provider_name: "openai",
            model_name: "gpt-4.1-mini",
            input: 0.4 / 1_000_000,
            cached_input: 0.1 / 1_000_000,
            output: 1.6 / 1_000_000,
            model: openai("gpt-4.1-mini"),
          };
        case "gpt-4.1-nano":
          return {
            provider_name: "openai",
            model_name: "gpt-4.1-nano",
            input: 0.1 / 1_000_000,
            cached_input: 0.025 / 1_000_000,
            output: 0.4 / 1_000_000,
            model: openai("gpt-4.1-nano"),
          };

        case "o4-mini":
          return {
            provider_name: "openai",
            model_name: "o4-mini",
            input: 1.1 / 1_000_000,
            cached_input: 0.275 / 1_000_000,
            output: 4.4 / 1_000_000,
            model: openai("o4-mini"),
          };
        default:
          return {
            provider_name: "openai",
            model_name: "o4-mini",
            input: 1.1 / 1_000_000,
            cached_input: 0.275 / 1_000_000,
            output: 4.4 / 1_000_000,
            model: openai("o4-mini"),
          };
      }
    case "anthropic":
      switch (user.model_preference) {
        case "claude-sonnet-4-0":
          return {
            provider_name: "anthropic",
            model_name: "claude-sonnet-4-0",
            input: 3.0 / 1_000_000, // $3 / MTok
            cached_input: 0.75 / 1_000_000, // $3.75 / MTok
            output: 15.0 / 1_000_000, // $15 / MTok
            model: anthropic("claude-3-5-sonnet-latest"),
          };

        default:
          return {
            provider_name: "anthropic",
            model_name: "claude-sonnet-4-0",
            input: 3.0 / 1_000_000, // $3 / MTok
            cached_input: 0.75 / 1_000_000, // $3.75 / MTok
            output: 15.0 / 1_000_000, // $15 / MTok
            model: anthropic("claude-3-5-sonnet-latest"),
          };
      }
    default:
      return {
        provider_name: "anthropic",
        model_name: "claude-sonnet-4-0",
        input: 3.0 / 1_000_000, // $3 / MTok
        cached_input: 0.75 / 1_000_000, // $3.75 / MTok
        output: 15.0 / 1_000_000, // $15 / MTok
        model: anthropic("claude-3-5-sonnet-latest"),
      };
  }
}
