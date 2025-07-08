import matter from "gray-matter";
import { marked } from "marked";

// Define the structure for the parsed front matter.
// This can be expanded with more specific fields as needed.
interface FrontMatter {
  [key: string]: string;
}

// Define the structure for the result of markdown processing.
interface MarkdownParseResult {
  frontMatter: FrontMatter;
  content: string; // The HTML content
}

/**
 * Service for processing Markdown text.
 * This class handles converting Markdown to HTML and extracting front matter.
 * It is designed to be extensible with plugins like KaTeX in the future.
 */
export class MarkdownService {
  /**
   * Initializes the MarkdownService and configures marked extensions.
   */
  constructor() {
    // TODO: Add extensions like KaTeX here if needed.
    // For example:
    // marked.use(markedKatex({ throwOnError: false }));
  }

  /**
   * Parses a Markdown string, separating front matter and converting the content to HTML.
   *
   * @param markdown - The raw Markdown string to process.
   * @returns An object containing the parsed front matter and the resulting HTML content.
   */
  public parse(markdown: string): MarkdownParseResult {
    // Use gray-matter to separate front matter from the main content.
    const { data: frontMatter, content: mdContent } = matter(markdown);

    // Convert the markdown content to HTML using the marked library.
    const htmlContent = marked(mdContent, {
      pedantic: false, // Don't be strict about oddities
      gfm: true, // Enable GitHub Flavored Markdown
      breaks: false, // Don't add <br> on single line breaks
    }) as string;

    return {
      frontMatter,
      content: htmlContent,
    };
  }
}

/**
 * A singleton instance of the MarkdownService for easy access throughout the application.
 */
export const markdownService = new MarkdownService();
