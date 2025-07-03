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

    // Set box-sizing for consistent measurements
    "--resume-box-sizing": "border-box",

    // Ensure white background
    "--resume-background-color": "white",
  };
};

/**
 * Default CSS for resumes
 * This serves as the base styling for all resumes
 *
 * Only contains minimal styling to establish the page layout.
 * All other styles should be specified by the user via custom CSS.
 */
export const DEFAULT_RESUME_CSS = `
  body {
    margin: 0;
    padding: 0;
    background-color: white;
    box-sizing: border-box;
  }

  * {
    box-sizing: inherit;
  }

  .resume-container {
    background-color: white;
  }

  /* Basic print settings */
  @page {
    size: A4;
    margin: 0;
  }

  @media print {
    html, body {
      width: 210mm;
      height: 297mm;
      background-color: white;
    }
  }
`;

/**
 * Template for scoped CSS used in the preview component
 * This is applied to resume content with a unique scope class
 */
export const SCOPED_RESUME_CSS_TEMPLATE = `
  /* This template can be used for scoped CSS in the preview component */
  /* It intentionally contains no default styling */
`;

/**
 * HTML template for printing a resume
 * This generates a complete HTML document for printing/PDF export
 */
export const PRINT_HTML_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Resume</title>
  {{FONT_LINK}}
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    body {
      margin: 0;
      padding: 0;
      background-color: white;
    }
    .resume-container {
      font-family: "{{FONT_FAMILY}}", -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: {{FONT_SIZE}}px;
      line-height: {{LINE_HEIGHT}};
      margin: {{MARGIN_V}}px {{MARGIN_H}}px;
      max-width: 794px;
      min-height: 1123px;
      background-color: white;
    }
    .page-break {
      page-break-before: always;
      break-before: page;
    }
    .page-break:first-child {
      page-break-before: avoid;
      break-before: avoid;
    }
    /* Avoid breaking inside these elements */
    h1, h2, h3, h4, h5, h6 {
      page-break-after: avoid;
      break-after: avoid;
    }
    p, li {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    {{CUSTOM_CSS}}
  </style>
</head>
<body>
  <div class="resume-container">
    {{CONTENT}}
  </div>
</body>
</html>`;
