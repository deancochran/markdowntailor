import { auth } from "@/auth";
import { resume as Resume } from "@/db/schema";
import { openai } from "@ai-sdk/openai";
import {
  InvalidToolArgumentsError,
  Message,
  NoSuchToolError,
  ToolExecutionError,
  ToolSet,
  generateObject,
  streamText,
  tool,
} from "ai";

import { z } from "zod";

import { createOllama } from "ollama-ai-provider";
const model =
  process.env.NODE_ENV === "production"
    ? openai("gpt-4.1-nano")
    : createOllama({
        baseURL: process.env.OLLAMA_API_URL,
      }).languageModel("qwen3:0.6b");

// --- 1. Content Generation Tool ---
const generateContentTool = tool({
  description: `Generates new resume content or enhances existing descriptions with stronger action verbs and quantifiable results.`,
  parameters: z.object({
    contentType: z
      .enum([
        "bullet_point",
        "summary",
        "about_me",
        "skill_description",
        "custom",
      ])
      .describe("The type of resume content to generate or enhance."),
    context: z
      .string()
      .describe(
        "The specific details or information to base the content on (e.g., project details, job responsibilities, a skill).",
      ),
    keywords: z
      .array(z.string())
      .optional()
      .describe("Optional keywords to incorporate into the generated content."),
    tone: z
      .enum(["professional", "impactful", "concise", "friendly"])
      .optional()
      .describe("Optional desired tone for the content."),
    currentContentSnippet: z
      .string()
      .optional()
      .describe("An existing snippet of content to be enhanced or rewritten."),
  }),
  execute: async (args, { toolCallId }) => {
    try {
      const { object: generatedContent } = await generateObject({
        model: model,
        schema: z.object({
          generatedSnippet: z
            .string()
            .describe(
              "The suggested new or enhanced content snippet for the resume.",
            ),
          explanation: z
            .string()
            .describe(
              "A concise explanation of the generated content and where/how to apply it.",
            ),
          changeType: z.literal("content_generation"),
          changeId: z.string().describe("Unique identifier for this change"),
        }),
        prompt: `You are an expert resume content generator.
        Based on the following request and context, generate a concise and impactful resume content snippet.
        Focus on strong action verbs and quantifiable results where applicable.

        Content Type: ${args.contentType}
        Context: "${args.context}"
        ${args.currentContentSnippet ? `Existing Content to Enhance: "${args.currentContentSnippet}"` : ""}
        ${args.keywords ? `Keywords to include: ${args.keywords.join(", ")}` : ""}
        ${args.tone ? `Desired Tone: ${args.tone}` : ""}

        Provide the generated content and a brief explanation in the specified JSON format.`,
      });
      return {
        success: true,
        ...generatedContent,
        changeId: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
    } catch (error) {
      throw new ToolExecutionError({
        message: "Failed to generate resume content.",
        cause: error,
        toolArgs: args,
        toolCallId,
        toolName: "generate_resume_content",
      });
    }
  },
});

// --- 2. Grammar & Proofreading Tool ---
const proofreadTextTool = tool({
  description: `Checks a given text for grammar, spelling, and punctuation errors, providing corrections.`,
  parameters: z.object({
    textToProofread: z
      .string()
      .describe("The text content from the resume to proofread."),
  }),
  execute: async (args, { toolCallId }) => {
    try {
      const { object: proofreadingResult } = await generateObject({
        model: model,
        schema: z.object({
          correctedText: z
            .string()
            .describe(
              "The text with grammar, spelling, and punctuation errors corrected.",
            ),
          errorsFound: z
            .array(
              z.object({
                original: z.string(),
                correction: z.string(),
                type: z.string().optional(),
                explanation: z.string().optional(),
              }),
            )
            .optional()
            .describe(
              "An optional array detailing specific errors found and their corrections.",
            ),
          explanation: z
            .string()
            .describe(
              "A concise explanation of the proofreading results and changes made.",
            ),
          changeType: z.literal("proofreading"),
          changeId: z.string().describe("Unique identifier for this change"),
        }),
        prompt: `You are a meticulous grammar and spelling checker for resumes.
        Review the following text for any grammatical errors, spelling mistakes, and punctuation issues.
        Provide the corrected text and optionally a list of specific errors found with explanations.

        Text to Proofread: "${args.textToProofread}"

        Provide your response in the specified JSON format.`,
      });
      return {
        success: true,
        ...proofreadingResult,
        changeId: `proofread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
    } catch (error) {
      throw new ToolExecutionError({
        message: "Failed to proofread text.",
        cause: error,
        toolArgs: args,
        toolCallId,
        toolName: "proofread_resume_text",
      });
    }
  },
});

// --- 3. Tone & Clarity Improvement Tool ---
const improveToneClarityTool = tool({
  description: `Refines resume text to improve its professionalism, conciseness, and overall impact.`,
  parameters: z.object({
    textToImprove: z
      .string()
      .describe(
        "The text content from the resume to improve for tone and clarity.",
      ),
    desiredTone: z
      .enum(["professional", "impactful", "concise", "formal"])
      .optional()
      .describe("Optional desired tone for the improved text."),
  }),
  execute: async (args, { toolCallId }) => {
    try {
      const { object: improvedTextResult } = await generateObject({
        model: model,
        schema: z.object({
          improvedText: z
            .string()
            .describe(
              "The text rewritten for improved tone, clarity, and conciseness.",
            ),
          explanation: z
            .string()
            .describe(
              "A concise explanation of the changes made and why they improve tone/clarity.",
            ),
          changeType: z.literal("tone_improvement"),
          changeId: z.string().describe("Unique identifier for this change"),
        }),
        prompt: `You are an expert in refining resume language.
        Improve the following text for clarity, conciseness, and professional impact.
        ${args.desiredTone ? `Focus on a "${args.desiredTone}" tone.` : "Aim for a strong, professional tone."}

        Text to Improve: "${args.textToImprove}"

        Provide the improved text and a brief explanation in the specified JSON format.`,
      });
      return {
        success: true,
        ...improvedTextResult,
        changeId: `tone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
    } catch (error) {
      throw new ToolExecutionError({
        message: "Failed to improve text tone/clarity.",
        cause: error,
        toolArgs: args,
        toolCallId,
        toolName: "improve_resume_tone_clarity",
      });
    }
  },
});

// --- 4. Keyword Optimization Tool ---
const optimizeKeywordsTool = tool({
  description: `Analyzes a job description and suggests relevant keywords to incorporate into the user's resume for ATS compatibility.`,
  parameters: z.object({
    jobDescription: z
      .string()
      .describe("The full text of the target job description."),
    currentResumeContent: z
      .string()
      .optional()
      .describe(
        "The current content of the user's resume (Markdown/HTML) to identify existing keywords.",
      ),
  }),
  execute: async (args, { toolCallId }) => {
    try {
      const { object: keywordSuggestions } = await generateObject({
        model: model,
        schema: z.object({
          suggestedKeywords: z
            .array(z.string())
            .describe(
              "A list of high-priority keywords extracted from the job description.",
            ),
          missingKeywords: z
            .array(z.string())
            .optional()
            .describe(
              "A list of keywords from the job description that are currently missing or underrepresented in the resume.",
            ),
          explanation: z
            .string()
            .describe(
              "A concise explanation of the keywords suggested and advice on how to integrate them for ATS optimization.",
            ),
          placementAdvice: z
            .string()
            .optional()
            .describe(
              "Specific advice on where in the resume (e.g., skills section, experience bullets) to strategically place these keywords.",
            ),
          changeType: z.literal("keyword_optimization"),
          changeId: z.string().describe("Unique identifier for this change"),
        }),
        prompt: `You are an ATS (Applicant Tracking System) optimization expert.
        Analyze the provided job description and identify key terms and skills.
        Then, compare them to the current resume content (if provided) to suggest keywords that should be integrated.

        Job Description:
        <code language="text">
        ${args.jobDescription}
        </code>

        ${
          args.currentResumeContent
            ? `Current Resume Content:
        <code language="markdown">
        ${args.currentResumeContent}
        </code>`
            : ""
        }

        Provide the suggested keywords, missing keywords (if applicable), and advice on integrating them into the resume in the specified JSON format.`,
      });
      return {
        success: true,
        ...keywordSuggestions,
        changeId: `keywords_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
    } catch (error) {
      throw new ToolExecutionError({
        message: "Failed to optimize keywords.",
        cause: error,
        toolArgs: args,
        toolCallId,
        toolName: "optimize_resume_keywords",
      });
    }
  },
});

// --- 5. Formatting Tool (Markdown/HTML/CSS) ---
const applyFormattingTool = tool({
  description: `Provides code examples for formatting resume elements using Markdown, raw HTML tags, or CSS rules.`,
  parameters: z.object({
    elementToFormat: z
      .string()
      .describe(
        'A clear description of the resume element or text to be formatted (e.g., "my name", "a section title", "bullet points", "my contact info block").',
      ),
    desiredFormat: z
      .enum(["markdown", "html", "css"])
      .optional()
      .describe(
        "The preferred format for the suggestion. If not specified, the AI will choose the most appropriate (prioritizing Markdown for simplicity, then HTML/CSS for control).",
      ),
    currentContentSnippet: z
      .string()
      .optional()
      .describe(
        "An optional snippet of the current content related to the element being formatted, including Markdown or HTML tags.",
      ),
    stylingInstructions: z
      .string()
      .optional()
      .describe(
        'Specific styling instructions (e.g., "make it bold and red", "center it", "add a horizontal rule").',
      ),
  }),
  execute: async (args, { toolCallId }) => {
    try {
      const { object: formattingSuggestion } = await generateObject({
        model: model,
        schema: z.object({
          suggestedMarkdownSnippet: z
            .string()
            .optional()
            .describe(
              "A direct Markdown snippet suggestion to insert or replace.",
            ),
          suggestedHtmlSnippet: z
            .string()
            .optional()
            .describe(
              "A direct HTML snippet suggestion (to be placed within Markdown) to insert or replace.",
            ),
          suggestedCssSnippet: z
            .string()
            .optional()
            .describe(
              "A direct CSS snippet suggestion to add or modify in the stylesheet.",
            ),
          explanation: z
            .string()
            .describe(
              "A concise explanation of the formatting suggestions and how the user can apply them.",
            ),
          changeType: z.literal("formatting"),
          changeId: z.string().describe("Unique identifier for this change"),
        }),
        prompt: `You are a resume formatting expert. Based on the user's request, provide code examples for formatting elements using Markdown, HTML, or CSS.
        Prioritize Markdown for simple formatting. Use HTML for complex layouts or custom attributes, and CSS for styling.

        Element to Format: "${args.elementToFormat}"
        ${args.desiredFormat ? `Preferred Format: ${args.desiredFormat}` : ""}
        ${args.stylingInstructions ? `Specific Instructions: "${args.stylingInstructions}"` : ""}
        ${
          args.currentContentSnippet
            ? `Current Content Snippet:
        <code language="markdown">
        ${args.currentContentSnippet}
        </code>`
            : ""
        }

        Provide your suggestions in the specified JSON format, using the most appropriate snippet type(s).
        Always include a clear explanation of how to apply the changes.`,
      });
      return {
        success: true,
        ...formattingSuggestion,
        changeId: `format_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
    } catch (error) {
      throw new ToolExecutionError({
        message: "Failed to provide formatting suggestions.",
        cause: error,
        toolArgs: args,
        toolCallId,
        toolName: "apply_resume_formatting",
      });
    }
  },
});

// --- 6. NEW: Direct Content Modification Tool ---
const modifyContentTool = tool({
  description: `Directly modifies specific sections of the resume markdown or CSS with precise changes.`,
  parameters: z.object({
    targetContent: z
      .string()
      .describe(
        "The exact content to find and replace in the markdown or CSS.",
      ),
    newContent: z
      .string()
      .describe("The new content to replace the target content with."),
    contentType: z
      .enum(["markdown", "css"])
      .describe("Whether to modify the markdown or CSS content."),
    description: z
      .string()
      .describe("A description of what this modification does."),
    section: z
      .string()
      .optional()
      .describe(
        "The section of the resume being modified (e.g., 'Experience', 'Skills', 'Header').",
      ),
  }),
  execute: async (args, { toolCallId }) => {
    try {
      return {
        success: true,
        changeType: "direct_modification" as const,
        changeId: `modify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        targetContent: args.targetContent,
        newContent: args.newContent,
        contentType: args.contentType,
        description: args.description,
        section: args.section,
        explanation: `I've prepared a direct modification to your ${args.contentType}. ${args.description}`,
      };
    } catch (error) {
      throw new ToolExecutionError({
        message: "Failed to prepare content modification.",
        cause: error,
        toolArgs: args,
        toolCallId,
        toolName: "modify_resume_content",
      });
    }
  },
});

// --- 7. NEW: Smart Analysis Tool ---
const analyzeResumeTool = tool({
  description: `Analyzes the current resume and provides comprehensive feedback with actionable suggestions.`,
  parameters: z.object({
    analysisType: z
      .enum([
        "general",
        "ats_optimization",
        "content_quality",
        "formatting",
        "job_matching",
      ])
      .describe("The type of analysis to perform on the resume."),
    jobDescription: z
      .string()
      .optional()
      .describe("Optional job description for job-specific analysis."),
    focusAreas: z
      .array(z.string())
      .optional()
      .describe("Specific areas to focus the analysis on."),
  }),
  execute: async (args, { toolCallId }) => {
    try {
      const { object: analysisResult } = await generateObject({
        model: model,
        schema: z.object({
          overallScore: z
            .number()
            .min(0)
            .max(100)
            .describe("Overall resume score out of 100."),
          strengths: z
            .array(z.string())
            .describe("Key strengths identified in the resume."),
          weaknesses: z
            .array(z.string())
            .describe("Areas that need improvement."),
          recommendations: z
            .array(
              z.object({
                priority: z.enum(["high", "medium", "low"]),
                category: z.string(),
                suggestion: z.string(),
                impact: z.string(),
              }),
            )
            .describe("Specific recommendations for improvement."),
          explanation: z
            .string()
            .describe("Detailed explanation of the analysis results."),
          changeType: z.literal("analysis"),
          changeId: z.string().describe("Unique identifier for this analysis"),
        }),
        prompt: `You are a professional resume analyst. Analyze the current resume based on the requested analysis type and provide comprehensive feedback.

        Analysis Type: ${args.analysisType}
        ${args.jobDescription ? `Job Description for Matching: "${args.jobDescription}"` : ""}
        ${args.focusAreas ? `Focus Areas: ${args.focusAreas.join(", ")}` : ""}

        Provide detailed analysis with actionable recommendations in the specified JSON format.`,
      });
      return {
        success: true,
        ...analysisResult,
        changeId: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
    } catch (error) {
      throw new ToolExecutionError({
        message: "Failed to analyze resume.",
        cause: error,
        toolArgs: args,
        toolCallId,
        toolName: "analyze_resume",
      });
    }
  },
});

// Export all tools in a single array for passing to the LLM
const resumeToolSet: ToolSet = {
  "Generate Content": generateContentTool,
  "Proofread Text": proofreadTextTool,
  "Improve Tone and Clarity": improveToneClarityTool,
  "Optimize Keywords": optimizeKeywordsTool,
  "Apply Formatting": applyFormattingTool,
  "Modify Content": modifyContentTool,
  "Analyze Resume": analyzeResumeTool,
};

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

  const result = streamText({
    model: model,
    tools: resumeToolSet,
    messages: messages,
    system: `
        You are an AI assistant for a resume builder with advanced modification capabilities.
        Your primary goal is to help users refine and update their resume by providing specific,
        actionable suggestions and offering to apply changes directly to their markdown/CSS files.

        You have access to the user's current resume in Markdown and CSS format.
        Always refer to the provided resume context when formulating your responses.

        IMPORTANT: When using tools that return changes with changeId, always offer the user
        the option to apply these changes directly to their resume. Format your suggestions
        as actionable proposals that can be implemented.

        Current Resume Markdown:
          \`\`\`markdown
          ${resume.markdown}
          \`\`\`

        Current Resume CSS:
          \`\`\`css
          ${resume.css}
          \`\`\`

        When you identify improvements or generate content:
        1. Use the appropriate tool to generate/analyze the content
        2. Present the suggestion clearly to the user
        3. Offer to apply the change directly by providing the exact modification needed
        4. Explain the benefit of the proposed change

        For direct modifications, use the "Modify Content" tool when you can identify
        specific content that should be replaced. This allows for precise, automated updates.

        Always be helpful, specific, and ready to make concrete changes to improve the resume.
      `,
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
        console.error(error);
        return "An unknown error occurred.";
      }
    },
    sendReasoning: true,
  });
}
