/**
 * Resume styling and templating utilities
 *
 * This file centralizes all resume styling, templating, and defaults
 * to improve maintainability and consistency across the application.
 */

// Constants for paper sizes in millimeters
export const PAPER_SIZES = {
  A4: { w: 210, h: 297 },
  Letter: { w: 215.9, h: 279.4 },
};

// Type for paper size options
export type PaperSize = keyof typeof PAPER_SIZES;

// Base types and defaults
export interface ResumeStyles {
  // Layout
  marginV: number; // Vertical margins
  marginH: number; // Horizontal margins
  paperSize: PaperSize;

  // Typography
  fontSize: number; // Base font size in px
  lineHeight: number; // Line height multiplier

  // Appearance
  fontFamily: string; // Main font family (English only)
}

// Default resume style settings
export const defaultStyles: ResumeStyles = {
  marginV: 40,
  marginH: 40,
  fontSize: 12,
  lineHeight: 1.5,
  fontFamily: "Inter",
  paperSize: "A4",
};

// Default system fonts that don't need to be loaded
export const SYSTEM_FONTS = ["Georgia", "Times+New+Roman", "Arial"];

// Font URL template for Google Fonts
export const GOOGLE_FONT_URL_TEMPLATE =
  "https://fonts.googleapis.com/css2?family=$FONT_FAMILY:wght@300;400;500;600;700&display=swap";

// Conversion factor from mm to px (assuming 96 DPI)
export const MM_TO_PX = 3.779526;

/**
 * Default CSS custom properties for resume styling.
 *
 * This function is robust to outdated style configurations. If an incomplete
 * `styles` object is passed, it will be merged with `defaultStyles` to ensure
 * all properties are present.
 *
 * @param styles - A potentially partial resume styles configuration.
 * @returns A record of CSS custom properties.
 */
export const getDefaultCustomProperties = (
  styles: Partial<ResumeStyles>,
): Record<string, string> => {
  // Combine incoming styles with defaults to handle outdated configurations
  const completeStyles: ResumeStyles = { ...defaultStyles, ...styles };

  const fontFamily = completeStyles.fontFamily.replace(/\+/g, " ");
  const paperDimensions = PAPER_SIZES[completeStyles.paperSize];
  const paperWidthPx = Math.round(paperDimensions.w * MM_TO_PX);
  const paperHeightPx = Math.round(paperDimensions.h * MM_TO_PX);

  return {
    "--resume-font-family": `"${fontFamily}", -apple-system, BlinkMacSystemFont, sans-serif`,
    "--resume-font-size": `${completeStyles.fontSize}px`,
    "--resume-line-height": `${completeStyles.lineHeight}`,
    "--resume-margin-v": `${completeStyles.marginV}px`,
    "--resume-margin-h": `${completeStyles.marginH}px`,

    // Paper dimensions for screen rendering
    "--resume-paper-width": `${paperDimensions.w}mm`,
    "--resume-paper-height": `${paperDimensions.h}mm`,
    "--resume-width-px": `${paperWidthPx}px`,
    "--resume-height-px": `${paperHeightPx}px`,

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

  /* Basic print settings - The DynamicCssService provides the correct size */
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
      size: {{PAPER_SIZE}};
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
      width: {{WIDTH}};
      min-height: {{HEIGHT}};
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
      page-break-inside: akeyof;
      break-inside: akeyof;
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
