import { auth } from "@/auth";
import { openai } from "@ai-sdk/openai";
import {
  InvalidToolArgumentsError,
  NoSuchToolError,
  ToolExecutionError,
  generateObject,
  streamText,
  tool,
} from "ai";
import { z } from "zod";

const MODEL_TYPE = "gpt-4o";

export const maxDuration = 30;

const resumeToolSet = {
  // The primary tool for providing resume suggestions/updates
  provideResumeSuggestions: tool({
    description: `Suggests resume improvements, rephrasing,
          additions, or style changes based on the user's request.`,
    parameters: z.object({
      // The AI needs the full context to provide intelligent suggestions
      currentMarkdown: z
        .string()
        .describe("The user's current resume content in Markdown format."),
      currentCss: z
        .string()
        .describe("The user's current resume styling in CSS format."),
      instruction: z.string().describe("The user's specific request"),
    }),
    execute: async (args) => {
      try {
        const { object: suggestedUpdate } = await generateObject({
          model: openai(MODEL_TYPE), // Use a powerful model for generation
          schema: z.object({
            suggestedMarkdownSnippet: z
              .string()
              .optional()
              .describe(
                "A direct Markdown snippet suggestion to insert or replace. The AI should explain where to apply it.",
              ),
            suggestedCssSnippet: z
              .string()
              .optional()
              .describe(
                "A direct CSS snippet suggestion to add or modify. The AI should explain where to apply it.",
              ),
            generalAdvice: z
              .string()
              .optional()
              .describe(
                "General textual advice or clarification if no specific code/content suggestion is provided.",
              ),
            explanation: z
              .string()
              .describe(
                "A concise explanation of the suggestions provided and how the user can apply them in their editors.",
              ),
          }),
          prompt: `You are an expert resume assistant. Based on the user's current resume and their request, provide specific, actionable suggestions.
                      The user edits Markdown and CSS directly. Your output should be a structured JSON object containing one or more types of suggestions.

                      Current Resume Markdown:
                      <code language="markdown">
                      ${args.currentMarkdown}
                      </code>

                      Current Resume CSS:
                      <code language="css">
                      ${args.currentCss}
                      </code>

                      User's Request: "${args.instruction}"

                      Provide your suggestions in the specified JSON format.
                      - If the request implies direct Markdown changes, provide 'suggestedMarkdownSnippet'.
                      - If the request implies CSS styling changes, provide 'suggestedCssSnippet'.
                      - If no specific code/content change is possible or more context is needed, provide 'generalAdvice'.
                      Always include a clear 'explanation' for all suggestions provided.
                      Prioritize providing actionable code/content over general advice if possible.`,
        });
        // The frontend will receive this 'suggestedUpdate' object and present it to the user.
        return { success: true, suggestion: suggestedUpdate };
      } catch (error) {
        throw new ToolExecutionError({
          message: "Failed to generate initial resume",
          cause: error,
          toolArgs: args,
          toolName: "provideResumeSuggestions",
          toolCallId: "provideResumeSuggestions",
        });
      }
    },
  }),
};

export async function POST(req: Request) {
  const { resume } = await req.json();
  const session = await auth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = streamText({
    model: openai(MODEL_TYPE),

    tools: resumeToolSet,
    maxSteps: 5,
    prompt: `
      You are an AI assistant for a resume builder.
      Your primary goal is to help the user refine and update their resume by
      providing specific, actionable suggestions. Use the 'provideResumeSuggestions'
      tool when the user asks for any modification, improvement, or rephrasing of
      their resume content or style. Always explain your suggestions clearly.
      The user has a Monaco editor and buttons to apply changes, so provide the
      direct text/code for them to use.
      \n
      The current markdown is:\n
      ${resume.markdown}
      \n
      The current CSS is:\n
      ${resume.css}
      \n
      Use the available tools to help the user modify or generate their resume.
      When updating the resume, make sure to call the appropriate tools.
      If the user explicitly asks for the raw markdown or CSS, provide it.
      Otherwise, assume they want a general update and use the tools.`,
  });

  return result.toDataStreamResponse({
    getErrorMessage: (error) => {
      if (NoSuchToolError.isInstance(error)) {
        return "The model tried to call a unknown tool.";
      } else if (InvalidToolArgumentsError.isInstance(error)) {
        return "The model called a tool with invalid arguments.";
      } else if (ToolExecutionError.isInstance(error)) {
        return "An error occurred during tool execution.";
      } else {
        return "An unknown error occurred.";
      }
    },
    sendReasoning: true,
  });
}
