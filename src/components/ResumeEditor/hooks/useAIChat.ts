"use client";
import { useChat } from "@ai-sdk/react";
import { Attachment, Message } from "ai";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Modification, UseAIChatReturn } from "../types";

export function useAIChat(
  sanitizedMarkdown: string,
  sanitizedCSS: string,
  sanitizedTitle: string,
  applyModification: (modification: Modification) => void,
): UseAIChatReturn {
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  // Process tool invocations from AI responses
  const processToolInvocations = useCallback(
    (message: Message) => {
      // Check if message has tool invocations
      const invocations =
        "toolInvocations" in message ? message.toolInvocations : undefined;
      if (!invocations) return;

      invocations.forEach((invocation) => {
        if (invocation.state === "result" && invocation.result) {
          const result = invocation.result;

          // Handle batch_modify tool results
          if (result.modifications && Array.isArray(result.modifications)) {
            // Apply each modification directly without transformation
            result.modifications.forEach((modification: Modification) => {
              applyModification(modification);
            });

            // Show a summary toast after applying all modifications
            if (result.summary) {
              toast.success(`Changes applied: ${result.summary}`, {
                duration: 5000, // Longer duration for important summaries
              });
            }
          }

          // Handle analyze_content tool results if needed
          else if (result.analysisType && result.findings) {
            toast.info(
              `Analysis complete: Found ${result.findings.length} items to improve`,
            );
          }
        }
      });
    },
    [applyModification],
  );

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    status,
    stop,
    reload,
  } = useChat({
    body: {
      resume: {
        markdown: sanitizedMarkdown,
        css: sanitizedCSS,
        title: sanitizedTitle,
      },
    },
    experimental_throttle: 100,
    onError: (e) => {
      console.error("onError:", e);
      // Check for specific error types and provide better error messages
      if (e instanceof Error) {
        if (e.message.includes("Unauthorized") || e.message.includes("401")) {
          toast.error("Authentication error. Please sign in again.");
        } else if (
          e.message.includes("Too Many Requests") ||
          e.message.includes("429")
        ) {
          toast.error("You've reached the rate limit. Please try again later.");
        } else {
          toast.error(`AI Chat Error: ${e.message}`);
        }
      } else {
        toast.error("An error occurred with the AI chat. Please try again.");
      }
    },
    onFinish: (message) => {
      processToolInvocations(message);
      toast.success("AI response complete!");
    },
    onResponse(response) {
      if (response.status === 401) {
        toast.error("Authentication error. Please sign in again.");
      } else if (response.status === 402) {
        toast.error(
          "You don't have enough credits to use this feature. Please add more credits.",
        );
      } else if (response.status === 429) {
        toast.error("You've reached the rate limit. Please try again later.");
      } else if (!response.ok) {
        toast.error(`Error: ${response.statusText}`);
      }
    },
  });

  return {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    status,
    stop,
    reload,
    attachments,
    setAttachments,
  };
}
