import { auth } from "@/auth";
import { resume as Resume } from "@/db/schema";
import { openai } from "@ai-sdk/openai";
import {
  InvalidToolArgumentsError,
  Message,
  NoSuchToolError,
  ToolExecutionError,
  streamText,
  tool,
} from "ai";
// import { createOllama } from "ollama-ai-provider";
import { z } from "zod";

// const model =
//   process.env.NODE_ENV === "production"
//     ? openai("gpt-4.1-nano")
//     : createOllama({
//         baseURL: process.env.OLLAMA_API_URL,
//       }).languageModel("qwen3:0.6b");

const model = openai("gpt-4.1-nano");

// Direct modification tool for streaming changes to editors
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
        "The exact content to find and replace (for 'replace' operation).",
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
    return {
      success: true,
      contentType: args.contentType,
      operation: args.operation,
      targetContent: args.targetContent,
      newContent: args.newContent,
      position: args.position,
      description: args.description,
      // This flag tells the frontend to apply the change directly
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

  if (!resume || !resume.markdown || !resume.css) {
    return new Response("Bad Request: Resume data is missing or malformed.", {
      status: 400,
    });
  }
  console.log(messages);
  const result = streamText({
    model: model,
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
  });

  return result.toDataStreamResponse({
    getErrorMessage: (error) => {
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
}
