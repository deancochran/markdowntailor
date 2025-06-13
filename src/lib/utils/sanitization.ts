// Central config object for sanitization logic
const SANITIZATION_CONFIG = {
  safeCssProperties: [
    "color",
    "background-color",
    "background",
    "font-family",
    "font-size",
    "font-weight",
    "font-style",
    "text-align",
    "text-decoration",
    "text-transform",
    "line-height",
    "letter-spacing",
    "word-spacing",
    "margin",
    "margin-top",
    "margin-right",
    "margin-bottom",
    "margin-left",
    "padding",
    "padding-top",
    "padding-right",
    "padding-bottom",
    "padding-left",
    "border",
    "border-top",
    "border-right",
    "border-bottom",
    "border-left",
    "border-color",
    "border-width",
    "border-style",
    "border-radius",
    "width",
    "height",
    "max-width",
    "max-height",
    "min-width",
    "min-height",
    "display",
    "position",
    "top",
    "right",
    "bottom",
    "left",
    "float",
    "clear",
    "overflow",
    "visibility",
    "opacity",
    "z-index",
    "vertical-align",
    "text-indent",
    "white-space",
    "word-wrap",
    "word-break",
    "list-style",
    "list-style-type",
    "list-style-position",
    "table-layout",
    "border-collapse",
    "border-spacing",
    "page-break-before",
    "page-break-after",
    "page-break-inside",
  ],
  dangerousMarkdownPatterns: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /javascript:\s*[^"'\s>]*/gi,
    /data:(?:text\/html|application\/javascript)[^"'\s>]*/gi,
    /style\s*=\s*["'][^"']*["']/gi,
    /<(object|embed|iframe|form|input|textarea|select|button)\b[^>]*>/gi,
  ],
  dangerousCssValues: [
    "javascript:",
    "data:",
    "vbscript:",
    "expression(",
    "eval(",
    "url(javascript:",
    "url(data:",
    "url(vbscript:",
    "behavior:",
    "-moz-binding:",
    "binding:",
  ],
};

// Reusable utility to validate string inputs
function validateInput(input: string, maxLength: number, label = "Input") {
  if (!input || typeof input !== "string") return "";
  if (input.length > maxLength) throw new Error(`${label} too large`);
  return input;
}

// Reusable pattern removal logic
function stripPatterns(input: string, patterns: RegExp[]): string {
  return patterns.reduce((out, pattern) => out.replace(pattern, ""), input);
}

// Sanitize Markdown
export function sanitizeMarkdown(markdown: string): string {
  let clean = validateInput(markdown, 50000, "Markdown");
  clean = stripPatterns(clean, SANITIZATION_CONFIG.dangerousMarkdownPatterns);

  return clean
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\s+style\s*=\s*["'][^"']*["']/gi, "");
}

// Sanitize CSS - IMPROVED VERSION
export function sanitizeCSS(css: string): string {
  const clean = validateInput(css, 20000, "CSS");

  // Remove comments first
  const withoutComments = clean.replace(/\/\*[\s\S]*?\*\//g, "");

  // Split CSS into rules (not individual properties)
  const rules = withoutComments
    .split("}")
    .map((rule) => rule.trim())
    .filter((rule) => rule.length > 0);
  const validRules: string[] = [];

  for (const rule of rules) {
    if (!rule.includes("{")) continue;

    const [selector, properties] = rule.split("{");
    if (!selector || !properties) continue;

    // Basic selector validation
    const cleanSelector = selector.trim();
    if (
      cleanSelector.includes("<script") ||
      cleanSelector.includes("javascript:") ||
      cleanSelector.includes("@import") ||
      cleanSelector.includes("expression(")
    ) {
      continue;
    }

    // Validate properties within this rule
    const validProperties: string[] = [];
    const propertyPairs = properties
      .split(";")
      .map((prop) => prop.trim())
      .filter((prop) => prop.length > 0);

    for (const propertyPair of propertyPairs) {
      const [property, value] = propertyPair
        .split(":")
        .map((str) => str?.trim());
      if (
        !property ||
        !value ||
        !SANITIZATION_CONFIG.safeCssProperties.includes(
          property.toLowerCase(),
        ) ||
        SANITIZATION_CONFIG.dangerousCssValues.some((danger) =>
          value.toLowerCase().includes(danger),
        )
      ) {
        continue; // Skip this property
      }
      validProperties.push(`${property}: ${value}`);
    }

    if (validProperties.length > 0) {
      validRules.push(`${cleanSelector} { ${validProperties.join("; ")} }`);
    }
  }

  return validRules.join("\n");
}

// Sanitize Text (for titles, etc.)
export function sanitizeText(text: string): string {
  const clean = validateInput(text, 1000, "Text");

  // Remove HTML tags and dangerous patterns
  return clean
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "") // Remove all HTML tags
    .replace(/&(?:#x?[0-9a-f]+|[a-z]+);/gi, "") // Remove HTML entities
    .replace(/javascript:\s*[^"'\s]*/gi, "") // Remove javascript: URLs
    .replace(/data:\s*[^"'\s]*/gi, ""); // Remove data: URLs
}

// Comprehensive sanitization function
export function sanitizeResumeInput(input: {
  title?: string;
  markdown?: string;
  css?: string;
}): {
  title: string;
  markdown: string;
  css: string;
} {
  return {
    title: input.title ? sanitizeText(input.title) : "",
    markdown: input.markdown ? sanitizeMarkdown(input.markdown) : "",
    css: input.css ? sanitizeCSS(input.css) : "",
  };
}
