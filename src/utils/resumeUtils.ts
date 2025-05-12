// resumeUtils.ts
// Utility functions for the resume builder

/**
 * Sanitizes a filename by replacing invalid characters
 * @param filename The original filename
 * @returns A sanitized filename safe for use in paths
 */
export function sanitizeFilename(filename: string): string {
  // Remove any path traversal characters and unsafe characters
  return filename.replace(/[\/\\?%*:|"<>]/g, '-');
}

/**
 * Formats a date for display in a resume
 * @param date The date to format
 * @returns Formatted date string (e.g., "January 2021")
 */
export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long'
  };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Creates a default resume template with basic structure
 * @param name Optional name to include in the template
 * @returns Markdown string with resume template
 */
export function createDefaultResume(name: string = 'Your Name'): string {
  return `# ${name}

## Professional Title

Email: email@example.com | Phone: (123) 456-7890 | [LinkedIn](https://linkedin.com/in/yourprofile) | [GitHub](https://github.com/yourusername)

---

## Summary

A brief 2-3 sentence summary of your professional background and key strengths.

---

## Experience

### Job Title - Company Name
*Month Year - Present*

- Accomplishment or responsibility
- Accomplishment or responsibility
- Accomplishment or responsibility

### Previous Job Title - Previous Company
*Month Year - Month Year*

- Accomplishment or responsibility
- Accomplishment or responsibility
- Accomplishment or responsibility

---

## Education

### Degree - Institution
*Year - Year*

- GPA, honors, relevant coursework
- Activities, clubs, or projects

---

## Skills

- Skill Category: List of specific skills
- Skill Category: List of specific skills
- Skill Category: List of specific skills

---

## Projects

### Project Name
- Brief description of the project
- Technologies used
- Link to project or GitHub repository

---

## Certifications

- Certification Name, Year
- Certification Name, Year
`;
}

/**
 * Gets the file extension from a resume name
 * @param filename The resume filename
 * @returns The appropriate file extension (.md by default)
 */
export function getResumeFileExtension(filename: string): string {
  return filename.endsWith('.md') ? '' : '.md';
}

/**
 * Validates a resume name
 * @param name The resume name to validate
 * @returns True if the name is valid, false otherwise
 */
export function isValidResumeName(name: string): boolean {
  return name.trim().length > 0 && name.length <= 255;
}