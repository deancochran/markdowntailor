/**
 * Resume styling and templating utilities
 *
 * This file centralizes all resume styling, templating, and defaults
 * to improve maintainability and consistency across the application.
 */

// Base types and defaults
export interface ResumeStyles {
  // Layout
  marginV: number; // Vertical margins
  marginH: number; // Horizontal margins

  // Typography
  fontSize: number; // Base font size in px
  lineHeight: number; // Line height multiplier

  // Appearance
  fontFamily: string; // Main font family (English only)
}

// Default resume style settings
export const defaultStyles: ResumeStyles = {
  marginV: 30,
  marginH: 30,
  fontSize: 12,
  lineHeight: 1.5,
  fontFamily: "Inter",
};

// Default system fonts that don't need to be loaded
export const SYSTEM_FONTS = ["Georgia", "Times+New+Roman", "Arial"];

// Font URL template for Google Fonts
export const GOOGLE_FONT_URL_TEMPLATE =
  "https://fonts.googleapis.com/css2?family=$FONT_FAMILY:wght@300;400;500;600;700&display=swap";

/**
 * Default CSS custom properties for resume styling
 */
export const getDefaultCustomProperties = (
  styles: ResumeStyles,
): Record<string, string> => {
  const fontFamily = styles.fontFamily.replace(/\+/g, " ");

  return {
    "--resume-font-family": `"${fontFamily}", -apple-system, BlinkMacSystemFont, sans-serif`,
    "--resume-font-size": `${styles.fontSize}px`,
    "--resume-line-height": `${styles.lineHeight}`,
    "--resume-margin-v": `${styles.marginV}px`,
    "--resume-margin-h": `${styles.marginH}px`,

    // A4 dimensions
    "--resume-max-width": "794px",
    "--resume-min-height": "1123px",

    // Default colors (can be overridden by custom CSS)
    "--resume-text-color": "#333333",
    "--resume-link-color": "#0066cc",
    "--resume-border-color": "#dddddd",
    "--resume-code-bg": "#f5f5f5",
    "--resume-shadow": "0 0 10px rgba(0, 0, 0, 0.1)",
  };
};

/**
 * Default CSS for resumes
 * This serves as the base styling for all resumes
 */
export const DEFAULT_RESUME_CSS = `
  body {
    margin: 0;
    padding: 20px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #333;
    background: white;
  }

  h1 {
    font-size: 24px;
    margin-bottom: 16px;
  }

  h2 {
    font-size: 18px;
    margin-top: 20px;
    margin-bottom: 12px;
  }

  h3 {
    font-size: 16px;
    margin-top: 16px;
    margin-bottom: 8px;
  }

  h4 {
    font-size: 14px;
    margin-top: 14px;
    margin-bottom: 6px;
  }

  ul {
    padding-left: 20px;
  }
`;

/**
 * Template for scoped CSS used in the preview component
 * This is applied to resume content with a unique scope class
 */
export const SCOPED_RESUME_CSS_TEMPLATE = ``
