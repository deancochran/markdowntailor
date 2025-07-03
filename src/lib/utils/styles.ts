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

// We'll use this as our default/initial styles
export const defaultStyles: ResumeStyles = {
  marginV: 30,
  marginH: 30,
  fontSize: 12,
  lineHeight: 1.5,
  fontFamily: "Inter",
};
