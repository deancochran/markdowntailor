import { auth } from "@/auth";
import { resume as Resume } from "@/db/schema";
import { getPreferredModelObject, logAIRequest } from "@/lib/ai";
import { apiRateLimiter } from "@/lib/upstash";
import {
  InvalidToolArgumentsError,
  LanguageModelUsage,
  Message,
  NoSuchToolError,
  streamText,
  tool,
  ToolExecutionError,
} from "ai";

import { z } from "zod";

const modifyContentTool = tool({
  description: `Directly modifies the resume markdown or CSS content with streaming updates.`,
  parameters: z.object({
    contentType: z
      .enum(["markdown", "css"])
      .describe("Whether to modify the markdown or CSS content."),
    operation: z
      .enum(["replace", "insert", "append", "prepend"])
      .describe("The type of modification to perform."),
    targetContent: z
      .string()
      .optional()
      .describe(
        "The exact content to find and replace (for 'replace' operation). Can be a string or regex pattern.",
      ),
    isRegex: z
      .boolean()
      .optional()
      .default(false)
      .describe("Whether targetContent should be treated as a regex pattern."),
    regexFlags: z
      .string()
      .optional()
      .describe(
        "Regex flags if isRegex is true (e.g., 'gi' for global, case-insensitive).",
      ),
    newContent: z.string().describe("The new content to apply."),
    position: z
      .object({
        line: z.number().optional(),
        column: z.number().optional(),
      })
      .optional()
      .describe("Specific position for insertion (for 'insert' operation)."),
    description: z
      .string()
      .describe("A description of what this modification does."),
  }),
  execute: async (args) => {
    let processedTargetContent: string | RegExp | undefined =
      args.targetContent;

    if (args.targetContent && args.isRegex) {
      try {
        processedTargetContent = new RegExp(
          args.targetContent,
          args.regexFlags || "",
        );
      } catch {
        console.error("Invalid regex pattern:", args.targetContent);
        processedTargetContent = args.targetContent;
      }
    }

    return {
      success: true,
      contentType: args.contentType,
      operation: args.operation,
      targetContent: processedTargetContent,
      newContent: args.newContent,
      position: args.position,
      description: args.description,
      applyDirectly: true,
    };
  },
});
export async function POST(req: Request) {
  const { messages, resume }: { messages: Message[]; resume: typeof Resume } =
    await req.json();

  const session = await auth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const rateLimit = await apiRateLimiter.limit(session.user.id);
  if (!rateLimit.success) {
    return new Response("Too Many Requests", {
      status: 429,
    });
  }

  if (!resume || !resume.markdown || !resume.css) {
    return new Response("Bad Request: Resume data is missing or malformed.", {
      status: 400,
    });
  }

  const model_selection = getPreferredModelObject(session.user);
  try {
    let requestUsage: LanguageModelUsage;
    const result = streamText({
      model: model_selection.model,
      tools: {
        modify_content: modifyContentTool,
      },
      messages: messages,
      maxSteps: 5,
      system: `
You are a friendly assistant with an intelligence for building resumes.
Your primary goal is to help users improve their resume by making direct modifications to their markdown and CSS content.
You should proactively make improvements and apply changes directly to the user's content using the modify_content tool.

Current Resume Markdown:
\`\`\`markdown
${resume.markdown}
\`\`\`

Current Resume CSS:
\`\`\`css
${resume.css}
\`\`\`

Always identify areas for improvement:
- Explain what you've analyzed and why your proposed changes are better
- Be proactive - don't just suggest, actually make improvements

Types of improvements you should be proactive about:
- Fix grammar, spelling, and punctuation errors
- Improve wording for impact and clarity
- Enhance formatting and styling
- Optimize content structure
- Add missing elements or sections
- Improve visual presentation through CSS
`,
      experimental_continueSteps: true,
      onFinish: async ({ usage, finishReason }) => {
        requestUsage = usage;

        await logAIRequest(
          {
            status: finishReason === "stop" ? "success" : finishReason,
            promptTokens: requestUsage.promptTokens,
            completionTokens: requestUsage.completionTokens,
            totalTokens: requestUsage.totalTokens,
          },
          session.user,
        );
      },
    });

    return result.toDataStreamResponse({
      getErrorMessage: (error) => {
        // Log failed requests
        logAIRequest(
          {
            status: "failed",
            promptTokens: requestUsage.promptTokens,
            completionTokens: requestUsage.completionTokens,
            totalTokens: requestUsage.totalTokens,
          },
          session.user,
        );

        if (NoSuchToolError.isInstance(error)) {
          return "The model tried to call an unknown tool.";
        } else if (InvalidToolArgumentsError.isInstance(error)) {
          return "The model called a tool with invalid arguments.";
        } else if (ToolExecutionError.isInstance(error)) {
          return "An error occurred during tool execution.";
        } else {
          console.error(error);
          return "An unknown error occurred.";
        }
      },
    });
  } catch (error) {
    await logAIRequest(
      {
        status: "failed",
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
      session.user,
    );
    throw error;
  }
}
