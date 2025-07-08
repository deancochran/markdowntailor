import { defaultStyles, ResumeStyles } from "./styles";

export enum TemplateTag {
  Creative = "Creative",
  Modern = "Modern",
  Professional = "Professional",
  Minimalist = "Minimalist",
  Academic = "Academic",
  Technical = "Technical",
  EntryLevel = "Entry-Level",
  ATSFriendly = "ATS-Friendly",
  Portfolio = "Portfolio",
  TwoColumn = "Two-Column",
  SingleColumn = "Single-Column",
  Executive = "Executive",
  Colorful = "Colorful",
  Traditional = "Traditional",
}

export interface Template {
  slug: string;
  name: string;
  description: string;
  tags: TemplateTag[];
  markdown: string;
  css: string;
  styles: ResumeStyles;
}

export const TEMPLATES: Template[] = [
  {
    slug: "software-engineer",
    name: "Software Engineer",
    description: "A professional resume template for software engineers.",
    tags: [TemplateTag.Professional, TemplateTag.Technical],
    markdown: `
# John Doe
<div class="header-icons">
<a href="mailto:john.doe@email.com" target="_blank">john.doe@email.com</a> | <a href="tel:+1234567890" target="_blank">+1 (234) 567-890</a> | Seattle, WA | <a href="https://linkedin.com/in/johndoe" target="_blank">linkedin.com/in/johndoe</a> | <a href="https://github.com/johndoe" target="_blank">github.com/johndoe</a>
</div>

## Summary
Experienced Software Engineer with a decade of experience in developing and deploying web applications. Proficient in JavaScript, React, and Node.js. Passionate about building scalable and maintainable software.

## Experience
**Senior Software Engineer**, Tech Solutions Inc. | Seattle, WA | 2018 - Present
- Led a team of 5 engineers in developing a new e-commerce platform.
- Architected and implemented a microservices-based backend using Node.js and Docker.
- Improved application performance by 30% through code optimization and database tuning.

**Software Engineer**, Web Innovations LLC | Bellevue, WA | 2014 - 2018
- Developed and maintained features for a high-traffic social media application.
- Collaborated with cross-functional teams to deliver high-quality software.
- Wrote and maintained extensive unit and integration tests.

## Education
**Bachelor of Science in Computer Science**
University of Washington, Seattle, WA | 2010 - 2014

## Skills
- **Programming Languages**: JavaScript, TypeScript, Python, Java
- **Frameworks & Libraries**: React, Node.js, Express, Next.js
- **Databases**: PostgreSQL, MongoDB, Redis
- **Tools**: Git, Docker, Kubernetes, AWS
`,
    css: `
h1 {
  text-align: center;
}
.header-icons {
  display: flex;
  justify-content: center;
  gap: 8px;
  font-size: 0.9em;
  margin-bottom: 16px;
}
`,
    styles: {
      ...defaultStyles,
      fontFamily: "Inter",
      paperSize: "Letter",
    },
  },
  {
    slug: "minimalist",
    name: "Minimalist",
    description: "A clean and simple resume template.",
    tags: [TemplateTag.Minimalist, TemplateTag.Modern],
    markdown: `
# Jane Smith
## Product Designer

### Contact
- Email: jane.smith@email.com
- Phone: +1 (987) 654-3210
- Website: janesmith.design

### Profile
A creative and detail-oriented product designer with 5 years of experience in user-centered design and a passion for creating beautiful and intuitive user interfaces.

### Experience
**Product Designer**, Creative Corp. | San Francisco, CA | 2020 - Present
- Designed and launched a new mobile application for a major retail client.
- Conducted user research and usability testing to inform design decisions.
- Collaborated with developers to ensure faithful implementation of designs.

**UI/UX Designer**, Design Studio | New York, NY | 2018 - 2020
- Created wireframes, mockups, and prototypes for various web and mobile projects.
- Developed and maintained a design system to ensure consistency across products.

### Education
**Bachelor of Arts in Graphic Design**
School of Visual Arts, New York, NY | 2014 - 2018
`,
    css: `
h1, h2 {
  text-align: center;
}
h2 {
    margin-top: -10px;
    font-weight: 400;
}
`,
    styles: {
      ...defaultStyles,
      fontFamily: "Roboto",
      fontSize: 11,
      lineHeight: 1.6,
      paperSize: "A4",
      marginV: 50,
      marginH: 50,
    },
  },
];
