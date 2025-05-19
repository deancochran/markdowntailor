// resumeUtils.ts
// Utility functions for the resume builder

/**
 * Sanitizes a filename by replacing invalid characters
 * @param filename The original filename
 * @returns A sanitized filename safe for use in paths
 */
export function sanitizeFilename(filename: string): string {
  // Remove any path traversal characters and unsafe characters
  return filename.replace(/[\/\\?%*:|"<>]/g, "-");
}

/**
 * Formats a date for display in a resume
 * @param date The date to format
 * @returns Formatted date string (e.g., "January 2021")
 */
export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
  };
  return date.toLocaleDateString("en-US", options);
}

/**
 * Creates a default resume template using the sample resume content
 * @param name Optional name to include in the template
 * @returns Markdown string with resume template based on sample resume
 */
export function createDefaultResume(name: string = "Your Name"): string {
  // In a production application, we would use a dynamic import or fs.readFileSync
  // to read the sample resume file. For now, we're using a hardcoded implementation
  // that replaces the name in the sample resume with the provided name.

  // This finds the first occurrence of a name pattern (the first h1 in markdown)
  // and replaces it with the provided name
  const sampleResumeContent = getSampleResumeContent();
  return sampleResumeContent.replace(/^# .*$/m, `# ${name}`);
}

export function defaultCssTemplate(): string {
  return `/* Resume styling */
  /* Resume styling */
  /* Resume styling */
  body {
    background-color: white;
    font-family: Arial, sans-serif;
    box-sizing: border-box;
    width: 210mm;
    min-height: 297mm;
    padding: 10mm;
    margin: 0 auto;
    line-height: 1.6;
  }

  /* Headings */
  h1 {
    font-size: 24px;
    margin-bottom: 4px;
    font-weight: bold;
    color: black;
  }

  h2 {
    font-size: 18px;
    border-bottom: 1px solid #000;
    padding-top: 8px;
    margin-bottom: 4px;
    font-weight: bold;
    color: black;
  }

  h3 {
    margin-bottom: 4px;
    font-size: 16px;
    font-weight: bold;
    color: black;
  }

    h4 {
    padding-top: 8px;
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: bold;
    color: black;
  }

  /* Links */
  a {
    color: blue;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  /* text */
  p {
    font-size: small;
  }

  /* Lists */
  ul {
    padding-left: 13px;

  }

  li {
    font-size:small;
  }

  strong {
    font-weight: bold;
  }

  em {
    font-style: italic;
  }

  /* Custom */
  .section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 8px;
    margin-bottom: 4px;

  }

  .section-content {
    display: flex;
    align-items:  center;
    gap: 4px;
  }
`;
}

/**
 * Returns the content of the sample resume
 * In a production app, this would read from the actual file
 * @returns The content of the sample resume
 */
export function getSampleResumeContent(): string {
  return `# John Doe

## Software Engineer

Email: john.doe@example.com | Phone: (123) 456-7890 | [LinkedIn](https://linkedin.com/in/johndoe) | [GitHub](https://github.com/johndoe)

---

## Summary

Experienced software engineer with over 5 years of expertise in full-stack development, cloud architecture, and DevOps. Passionate about building scalable web applications and solving complex problems with elegant solutions.

---

## Experience

### Senior Software Engineer - Tech Innovations Inc.
*January 2021 - Present*

- Led a team of 5 developers to rebuild the company's core platform, resulting in a 40% increase in performance
- Implemented CI/CD pipelines using GitHub Actions, reducing deployment time by 60%
- Architected and developed microservices using Node.js and Docker that process over 1M transactions daily
- Mentored junior developers through code reviews and pair programming sessions

### Software Developer - Digital Solutions Ltd.
*June 2018 - December 2020*

- Developed and maintained RESTful APIs for mobile and web applications
- Collaborated with UX designers to implement responsive front-end interfaces using React
- Optimized database queries, resulting in a 30% reduction in load times
- Participated in Agile development processes, including daily stand-ups and sprint planning

---

## Skills

- **Languages**: JavaScript/TypeScript, Python, Java, SQL
- **Frontend**: React, Next.js, HTML5, CSS3, Tailwind CSS
- **Backend**: Node.js, Express, Django, Spring Boot
- **Database**: PostgreSQL, MongoDB, Redis
- **DevOps**: Docker, Kubernetes, AWS, GitHub Actions, Terraform
- **Other**: RESTful APIs, GraphQL, WebSockets, Microservices, Agile methodologies

---

## Education

### Bachelor of Science in Computer Science
*University of Technology, 2014-2018*

- GPA: 3.8/4.0
- Relevant coursework: Data Structures, Algorithms, Web Development, Database Systems
- Senior Project: Developed an AI-powered task management system

---

## Projects

### Personal Finance Tracker
- Built a full-stack application using MERN stack with authentication and data visualization
- Implemented OAuth 2.0 for secure third-party integrations
- [github.com/johndoe/finance-tracker](https://github.com/johndoe/finance-tracker)

### Open Source Contribution - DevTools Extension
- Contributed to a popular browser extension for developers with over 50k users
- Added new features for network traffic analysis and implemented performance improvements

---

## Certifications

- AWS Certified Solutions Architect, 2022
- Certified Kubernetes Administrator (CKA), 2021
- MongoDB Certified Developer, 2020`;
}

/**
 * Gets the file extension from a resume name
 * @param filename The resume filename
 * @returns The appropriate file extension (.md by default)
 */
export function getResumeFileExtension(filename: string): string {
  return filename.endsWith(".md") ? "" : ".md";
}

/**
 * Validates a resume name
 * @param name The resume name to validate
 * @returns True if the name is valid, false otherwise
 */
export function isValidResumeName(name: string): boolean {
  return name.trim().length > 0 && name.length <= 255;
}
