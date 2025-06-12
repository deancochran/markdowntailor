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

// Sanitize CSS
export function sanitizeCSS(css: string): string {
  const clean = validateInput(css, 20000, "CSS");

  return clean
    .split(";")
    .map((rule) => {
      const [property, value] = rule.split(":").map((str) => str?.trim());
      if (
        !property ||
        !value ||
        !SANITIZATION_CONFIG.safeCssProperties.includes(property) ||
        SANITIZATION_CONFIG.dangerousCssValues.some((danger) =>
          value.includes(danger),
        )
      ) {
        return null;
      }
      return `${property}: ${value}`;
    })
    .filter(Boolean)
    .join("; ");
}
