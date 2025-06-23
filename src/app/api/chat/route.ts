import { auth } from "@/auth";
import { resume } from "@/db/schema";
import { deductCreditsFromUser, getPreferredModelObject } from "@/lib/ai";
import { apiRateLimiter } from "@/lib/upstash";
import {
  InvalidToolArgumentsError,
  Message,
  NoSuchToolError,
  streamText,
  tool,
  ToolExecutionError,
} from "ai";
import Decimal from "decimal.js";
import { z } from "zod";

// Streamlined modification schema for batch operations
const ModificationSchema = z.object({
  contentType: z.enum(["markdown", "css"]).describe("Target file type"),
  operation: z
    .enum(["replace", "insert", "append", "prepend"])
    .describe("Modification type"),
  targetContent: z
    .string()
    .optional()
    .describe("Content to find for replace operations"),
  isRegex: z
    .boolean()
    .default(false)
    .describe("Whether targetContent is a regex pattern"),
  regexFlags: z
    .string()
    .optional()
    .describe("Regex flags (e.g., 'gi' for global case-insensitive)"),
  newContent: z.string().describe("Content to apply"),
  position: z
    .object({
      line: z
        .union([z.number().refine(() => true), z.null()])
        .describe("Line number for insert operations"),
      column: z
        .union([z.number().refine(() => true), z.null()])
        .describe("Column position for insert operations"),
    })
    .optional()
    .describe("Position for insert operations"),
  reason: z
    .string()
    .describe("Explanation of why this change improves the resume"),
});

const batchModifyTool = tool({
  description:
    "Apply multiple strategic modifications to resume content. Supports regex patterns for powerful find-and-replace operations.",
  parameters: z.object({
    modifications: z
      .array(ModificationSchema)
      .describe("Array of modifications to apply sequentially"),
    summary: z.string().describe("Overall summary of improvements being made"),
  }),
  execute: async ({ modifications, summary }) => {
    // Process regex patterns and validate modifications
    const processedMods = modifications.map((mod, index) => {
      let processedTargetContent = mod.targetContent;

      // Handle regex processing
      if (mod.targetContent && mod.isRegex) {
        try {
          // Validate regex pattern
          new RegExp(mod.targetContent, mod.regexFlags || "");
          processedTargetContent = mod.targetContent;
        } catch {
          console.warn(
            `Invalid regex pattern at index ${index}:`,
            mod.targetContent,
          );
          throw new Error(`Invalid regex pattern: ${mod.targetContent}`);
        }
      }

      return {
        ...mod,
        targetContent: processedTargetContent,
        index,
      };
    });

    return {
      success: true,
      modifications: processedMods,
      summary,
      totalChanges: modifications.length,
      timestamp: new Date().toISOString(),
    };
  },
});

const analyzeContentTool = tool({
  description:
    "Analyze resume content for improvement opportunities without making changes",
  parameters: z.object({
    contentType: z
      .enum(["markdown", "css", "both"])
      .describe("Content to analyze"),
    analysisType: z
      .enum(["structure", "style", "content", "comprehensive"])
      .describe("Type of analysis"),
    findings: z
      .array(
        z.object({
          issue: z.string().describe("Identified issue or opportunity"),
          severity: z
            .enum(["critical", "major", "minor"])
            .describe("Issue severity"),
          recommendation: z.string().describe("Recommended solution"),
          location: z.string().optional().describe("Where the issue occurs"),
        }),
      )
      .describe("Analysis findings"),
  }),
  execute: async ({ contentType, analysisType, findings }) => {
    return {
      success: true,
      contentType,
      analysisType,
      findings,
      timestamp: new Date().toISOString(),
    };
  },
});

const SYSTEM_PROMPT = `You are ResumeCraft AI, an expert resume optimization assistant specializing in strategic content improvement and professional presentation.

## Your Core Mission
Transform resumes into compelling, ATS-optimized documents that maximize interview opportunities through strategic content enhancement and visual refinement.

## Current Resume Content

### Markdown Content:
\`\`\`markdown
{RESUME_MARKDOWN}
\`\`\`

### CSS Styling:
\`\`\`css
{RESUME_CSS}
\`\`\`

## Your Approach
1. **ANALYZE FIRST**: Always understand the current content before making changes
2. **STRATEGIC IMPROVEMENTS**: Focus on high-impact modifications that enhance professional presentation
3. **BATCH OPERATIONS**: Group related changes for efficient processing - all modifications are applied automatically
4. **LEVERAGE REGEX**: Use regex patterns for consistent formatting and pattern-based improvements
5. **EXPLAIN REASONING**: Provide clear rationale for each modification

## Improvement Priorities

### Content Enhancement (Markdown)
- **Impact-Driven Language**: Transform weak phrases into strong, quantifiable achievements
- **ATS Optimization**: Ensure keyword density and proper formatting for applicant tracking systems
- **Professional Tone**: Maintain consistent, confident voice throughout
- **Structure Optimization**: Improve flow, hierarchy, and readability

### Visual Enhancement (CSS)
- **Professional Aesthetics**: Clean, modern design that enhances readability
- **Typography**: Optimal font choices, sizing, and spacing for professional presentation
- **Layout Optimization**: Strategic use of white space and visual hierarchy
- **Print Compatibility**: Ensure resume looks professional both on screen and in print

## Tool Usage Guidelines

### Use batch_modify for:
- Multiple content improvements in a single operation
- Pattern-based replacements using regex (e.g., date formatting, consistent spacing)
- Comprehensive styling updates across the document
- Sequential modifications that build upon each other

### Use analyze_content for:
- Pre-modification content assessment
- Identifying patterns that need regex-based fixes
- Quality assurance and validation checks
- Understanding document structure before making changes

## Response Style
- **Proactive**: Identify and address issues without waiting for specific requests
- **Strategic**: Focus on changes that meaningfully impact resume effectiveness
- **Educational**: Explain the reasoning behind improvements
- **Professional**: Maintain expert-level communication throughout

## Quality Standards
Every modification must:
- Enhance professional presentation
- Improve readability and scan-ability
- Maintain factual accuracy
- Follow resume best practices
- Consider ATS compatibility

Begin by analyzing the current resume content and identifying the most impactful improvements you can make.`;

export async function POST(req: Request) {
  try {
    const {
      messages,
      resume: _resume,
    }: { messages: Message[]; resume: typeof resume.$inferSelect } =
      await req.json();

    // Authentication and rate limiting
    const session = await auth();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (Decimal(session.user.credits).lt(0)) {
      return new Response("Insufficient credits", { status: 402 });
    }
    if (!session.user.stripeCustomerId) {
      return new Response("User not subscribed", { status: 402 });
    }

    const rateLimit = await apiRateLimiter.limit(session.user.id);
    if (!rateLimit.success) {
      return new Response("Too Many Requests", { status: 429 });
    }

    // Prepare dynamic system prompt
    const systemPrompt = SYSTEM_PROMPT.replace(
      "{RESUME_MARKDOWN}",
      _resume.markdown,
    ).replace("{RESUME_CSS}", _resume.css);

    const modelSelection = getPreferredModelObject(session.user);
    const result = streamText({
      model: modelSelection.model,
      tools: {
        batch_modify: batchModifyTool,
        analyze_content: analyzeContentTool,
      },
      messages,
      system: systemPrompt,
      maxSteps: 8,
      experimental_continueSteps: true,
      temperature: 0.3,
      abortSignal: req.signal,
      maxTokens: 33_000,
      onFinish: async (data) => {
        // Update user credits after successful completion
        await deductCreditsFromUser(session.user, modelSelection, data.usage);
      },
    });

    return result.toDataStreamResponse({
      getErrorMessage: (error) => {
        // Enhanced error handling
        if (NoSuchToolError.isInstance(error)) {
          return "Model attempted to use an unavailable tool. Please try again.";
        } else if (InvalidToolArgumentsError.isInstance(error)) {
          console.error("InvalidToolArgumentsError details:", error);
          return "Invalid tool parameters provided. Please refine your request.";
        } else if (ToolExecutionError.isInstance(error)) {
          return "Tool execution failed. Please try a different approach.";
        } else {
          console.error("Unexpected error:", error);
          return "An unexpected error occurred. Please try again.";
        }
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
