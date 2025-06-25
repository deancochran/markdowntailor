// Sanitize Markdown
export function sanitizeMarkdown(markdown: string): string {
  // Basic size validation
  if (!markdown || typeof markdown !== "string") return "";
  if (markdown.length > 50000) throw new Error("Markdown too large");

  // Remove only truly dangerous patterns
  return (
    markdown
      // Remove script tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")

      // Remove event handlers
      .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")

      // Remove javascript: URLs
      .replace(/javascript:\s*[^"'\s>]*/gi, "")

      // Remove data:text/html and data:application/javascript
      .replace(/data:(?:text\/html|application\/javascript)[^"'\s>]*/gi, "")
  );
}

export function sanitizeCSS(css: string): string {
  // Basic size validation
  if (!css || typeof css !== "string") return "";
  if (css.length > 50000) throw new Error("CSS too large");

  // Remove potential resource-intensive or problematic patterns
  const sanitized = css
    // Remove JavaScript execution vectors (still good practice)
    .replace(/expression\s*\(/gi, "")
    .replace(/url\s*\(\s*['"]?\s*javascript:/gi, "")

    // Limit extreme values that could cause rendering issues
    .replace(/([0-9]+){5,}/g, "999") // Prevent extremely large numbers

    // Optional: Limit potentially resource-intensive features
    .replace(/@keyframes\b[^{]*{(?:[^{}]|{[^{}]*})*}/gi, "") // Remove animations
    .replace(/(animation|transition)[^;}]*[;}]/gi, "") // Remove animations/transitions

    // Allow @import from trusted sources for fonts
    .replace(
      /@import\s+url\s*\(\s*['"](?!https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com))[^'"]*['"]\s*\)/gi,
      "",
    );

  return sanitized;
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
    title: input.title ? input.title : "",
    markdown: input.markdown ? sanitizeMarkdown(input.markdown) : "",
    css: input.css ? sanitizeCSS(input.css) : "",
  };
}
