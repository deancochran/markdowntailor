/**
 * Simple resume size validation utility
 * Focuses on enforcing 3-page maximum limit
 */

// Constants for size estimation
const CHARS_PER_PAGE = 3000; // Approximate characters per page
const MAX_PAGES = 3;
const MAX_CONTENT_LENGTH = CHARS_PER_PAGE * MAX_PAGES;

/**
 * Estimates the number of pages based on content length
 * This is a simplified approach based on character count
 */
export function estimatePageCount(markdown: string): number {
  // Count only the visible content (not markdown syntax)
  const cleanContent = markdown
    .replace(/#+\s+/g, "") // Remove headers
    .replace(/\*\*/g, "") // Remove bold markers
    .replace(/\*/g, "") // Remove italic markers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"); // Replace links with just their text

  return Math.ceil(cleanContent.length / CHARS_PER_PAGE);
}

/**
 * Validates if a resume exceeds the maximum allowed size
 * @returns Object with validation results
 */
export function validateResumeSize(markdown: string): {
  isValid: boolean;
  estimatedPages: number;
  message: string;
} {
  const estimatedPages = estimatePageCount(markdown);
  const isValid = estimatedPages <= MAX_PAGES;

  let message = "";
  if (!isValid) {
    message = `Resume exceeds the ${MAX_PAGES}-page limit (estimated ${estimatedPages} pages). Please reduce content.`;
  } else if (estimatedPages === MAX_PAGES) {
    message = `Resume is at the ${MAX_PAGES}-page limit. Consider reviewing for conciseness.`;
  }

  return {
    isValid,
    estimatedPages,
    message,
  };
}
