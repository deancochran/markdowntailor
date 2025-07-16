import { Session } from "@/localforage";
import { anthropic } from "@ai-sdk/anthropic";

import { LanguageModelV1 } from "ai";

export type ModelObject = {
  provider_name: string;
  model_name: string;
  model: LanguageModelV1;
};

/**
 * Defines the structure for AI configuration data stored in localforage.
 * Credits are stored as strings to ensure precision is not lost during serialization.
 */
export interface AIConfig {
  id: string; // Corresponds to the user's email
  credits: string; // Stored as a string to maintain precision
  updatedAt: Date;
}

function getBaseModelConfig(session: Session): ModelObject {
  switch (session.ai_model_provider) {
    case "anthropic":
      switch (session.ai_model_name) {
        case "claude-3-7-sonnet-20250219":
          return {
            provider_name: "anthropic",
            model_name: "claude-3-7-sonnet-20250219",
            model: anthropic("claude-3-7-sonnet-20250219"),
          };
        case "claude-4-sonnet-20250514":
          return {
            provider_name: "anthropic",
            model_name: "claude-4-sonnet-20250514",
            model: anthropic("claude-4-sonnet-20250514"),
          };

        default:
          return {
            provider_name: "anthropic",
            model_name: "claude-3-7-sonnet-20250219",
            model: anthropic("claude-3-7-sonnet-20250219"),
          };
      }
    default:
      return {
        provider_name: "anthropic",
        model_name: "claude-4-sonnet-20250514",
        model: anthropic("claude-4-sonnet-20250514"),
      };
  }
}
