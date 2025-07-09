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
  {
    slug: "modern-professional",
    name: "Modern Professional",
    description: "A sleek, modern template for today's professional.",
    tags: [TemplateTag.Modern, TemplateTag.Professional],
    markdown: `
# Alex Johnson
**Product Manager**
<div class="header-icons">
alex.j@email.com | 555-0101 | New York, NY | linkedin.com/in/alexj | github.com/alexj
</div>

## About Me
Dynamic and results-oriented Product Manager with over 8 years of experience in driving product development from conception to launch. Skilled in agile methodologies and cross-functional team leadership.

## Professional Experience
**Senior Product Manager**, Innovatech | New York, NY | 2019 - Present
- Spearheaded the development of a new SaaS platform, resulting in a 40% increase in user engagement.
- Managed a product roadmap and backlog for a team of 10 developers and designers.
- Conducted market research and competitive analysis to identify new product opportunities.

**Product Manager**, NextGen Solutions | Brooklyn, NY | 2016 - 2019
- Led the redesign of the company's flagship mobile app, improving user satisfaction by 25%.
- Worked closely with marketing and sales to develop go-to-market strategies.

## Education
**Master of Business Administration (MBA)**
Columbia Business School, New York, NY | 2014 - 2016

## Key Skills
- Product Strategy & Roadmapping
- Agile & Scrum Methodologies
- Market Research & Analysis
- UI/UX Principles
- Cross-functional Leadership
`,
    css: `
body {
  background: #f9f9f9;
}
h1 {
  color: #333;
  text-align: center;
  font-size: 2em;
  border-bottom: 2px solid #333;
  padding-bottom: 10px;
}
.header-icons {
  display: flex;
  justify-content: center;
  gap: 12px;
  font-size: 0.85em;
  margin-bottom: 20px;
}
h2 {
    color: #444;
    border-bottom: 1px solid #eee;
    padding-bottom: 5px;
    margin-top: 20px;
}
`,
    styles: {
      ...defaultStyles,
      fontFamily: "Lato",
      paperSize: "Letter",
    },
  },
  {
    slug: "minimalist-executive",
    name: "Minimalist Executive",
    description: "A clean, minimalist template for executives.",
    tags: [TemplateTag.Minimalist, TemplateTag.Executive],
    markdown: `
# Samantha Carter
### Chief Technology Officer

**Contact:** s.carter@email.com | 555-0202 | linkedin.com/in/scarter

---

### Executive Summary
Visionary and strategic technology executive with over 15 years of experience leading global engineering teams and driving technological innovation. Proven track record of scaling infrastructure, building high-performing teams, and aligning technology with business goals.

---

### Career History
**Chief Technology Officer**, QuantumLeap Inc. | 2017 - Present
- Oversaw a 150+ person engineering organization across three continents.
- Led the company's digital transformation initiative, migrating legacy systems to a cloud-native architecture.
- Drove a 50% improvement in product delivery cycles through the implementation of DevOps practices.

**VP of Engineering**, Stellar Solutions | 2012 - 2017
- Grew the engineering team from 20 to 80 members.
- Directed the architecture and development of a market-leading B2B SaaS product.

---

### Education
**M.S. in Computer Science**, Stanford University
**B.S. in Electrical Engineering**, MIT
`,
    css: `
h1 {
  font-size: 2.2em;
  font-weight: 300;
  text-align: center;
  margin-bottom: 0;
}
h3 {
  text-align: center;
  font-weight: 300;
  margin-top: 5px;
  color: #555;
}
hr {
  border: 0;
  height: 1px;
  background: #ddd;
  margin: 30px 0;
}
`,
    styles: {
      ...defaultStyles,
      fontFamily: "Helvetica Neue",
      fontSize: 10,
      lineHeight: 1.5,
      paperSize: "Letter",
    },
  },
  {
    slug: "creative-designer",
    name: "Creative Designer",
    description: "A vibrant, creative template for designers.",
    tags: [TemplateTag.Creative, TemplateTag.Colorful, TemplateTag.Portfolio],
    markdown: `
<div class="name-box">
# Olivia Chen
## Graphic Designer & Illustrator
</div>

**Portfolio:** oliviachendesign.com

### About
I am a passionate designer who loves to create visually compelling stories. I thrive on turning complex ideas into beautiful, intuitive designs.

### Selected Work
**Lead Designer**, Studio Bloom | 2019 - Present
- Brand identity for "GreenLeaf," a sustainable food startup.
- UI/UX design for "Connect," a social networking app.
- Illustration series for a children's book, "The Magical Forest."

**Junior Designer**, Pixel Perfect Agency | 2017 - 2019
- Assisted in creating marketing materials for various clients.
- Designed social media graphics and website assets.

### Skills
- Adobe Creative Suite (Photoshop, Illustrator, InDesign)
- Figma, Sketch
- UI/UX Design
- Illustration
- Branding
`,
    css: `
body {
  color: #333;
}
.name-box {
  background: #f06;
  color: white;
  padding: 20px;
  text-align: center;
  margin: -50px -50px 20px -50px; /* Assuming margins are 50px */
}
.name-box h1 {
  margin: 0;
  font-size: 3em;
}
.name-box h2 {
    margin: 0;
    font-weight: 300;
}
h3 {
  color: #f06;
}
`,
    styles: {
      ...defaultStyles,
      fontFamily: "Montserrat",
      paperSize: "A4",
      marginV: 50,
      marginH: 50,
    },
  },
  {
    slug: "corporate-standard",
    name: "Corporate Standard",
    description: "A traditional, ATS-friendly template for corporate roles.",
    tags: [TemplateTag.Traditional, TemplateTag.ATSFriendly],
    markdown: `
**DAVID MILLER**
123 Corporate Ave, Business City, 54321
(555) 0303 | david.miller@email.com | linkedin.com/in/davidmiller

**SUMMARY OF QUALIFICATIONS**
A highly organized and detail-oriented professional with over 10 years of experience in finance and accounting. Proven ability to improve processes, manage budgets, and lead teams in a corporate environment.

**PROFESSIONAL EXPERIENCE**

**Finance Manager** | Global Corp | Business City | 2018-Present
- Managed a departmental budget of over $10 million.
- Implemented a new financial reporting system, increasing efficiency by 20%.
- Conducted financial analysis and provided strategic recommendations to senior management.

**Senior Accountant** | Money Matters Inc. | Business City | 2014-2018
- Prepared financial statements and reports in compliance with GAAP.
- Managed accounts payable and receivable.
- Assisted with annual audits.

**EDUCATION**

**Certified Public Accountant (CPA)**

**Bachelor of Science in Accounting** | University of Business

**TECHNICAL SKILLS**

- Microsoft Excel (Advanced), QuickBooks, SAP
`,
    css: `
h2 {
    font-size: 1.1em;
    font-weight: bold;
    border-bottom: 2px solid #000;
    padding-bottom: 2px;
    margin-top: 15px;
}
`,
    styles: {
      ...defaultStyles,
      fontFamily: "Times New Roman",
      fontSize: 12,
      paperSize: "Letter",
    },
  },
  {
    slug: "academic-research",
    name: "Academic Research",
    description:
      "A template for academics, focusing on publications and research.",
    tags: [TemplateTag.Academic, TemplateTag.Traditional],
    markdown: `
# Dr. Eleanor Vance
Postdoctoral Research Fellow
Department of Physics, Quantum University
<br>
evance@email.edu | scholar.google.com/citations?user=12345

## Research Interests
- Quantum Computing
- Condensed Matter Physics
- Superconductivity

## Education
- **Ph.D. in Physics**, Quantum University, 2022
- **B.S. in Physics**, State University, 2017

## Publications
1. **Vance, E.**, et al. "A Novel Approach to Qubit Stabilization." *Journal of Quantum Physics*, 2022.
2. **Vance, E.**, & Smith, J. "Topological Insulators in High-Magnetic Fields." *Physical Review B*, 2021.

## Conference Presentations
- "Quantum Entanglement in Multi-Qubit Systems," Quantum Information Conference, 2023 (Oral Presentation)
- "Superconductivity at Room Temperature," American Physical Society March Meeting, 2022 (Poster)

## Grants & Awards
- National Science Foundation Graduate Research Fellowship, 2018-2021
`,
    css: `
h1 {
  font-size: 1.5em;
  font-family: serif;
}
h2 {
  font-size: 1.2em;
  font-family: serif;
  border-bottom: 1px solid #ccc;
  padding-bottom: 3px;
  margin-top: 1.5em;
}
`,
    styles: {
      ...defaultStyles,
      fontFamily: "Garamond",
      fontSize: 12,
      lineHeight: 1.4,
      paperSize: "A4",
    },
  },
  {
    slug: "it-professional",
    name: "IT Professional",
    description: "A technical template for IT professionals.",
    tags: [
      TemplateTag.Technical,
      TemplateTag.Professional,
      TemplateTag.ATSFriendly,
    ],
    markdown: `
# Michael Chen
### IT Support Specialist
(555) 0404 | m.chen@email.com | San Jose, CA

---

### Technical Summary
A certified IT professional with 5+ years of experience in system administration, network management, and technical support. Adept at troubleshooting complex issues and maintaining secure and efficient IT infrastructures.

---

### Certifications
- CompTIA A+
- CompTIA Network+
- Cisco Certified Network Associate (CCNA)

---

### Technical Expertise
- **Operating Systems:** Windows Server 2016/2019, Linux (Ubuntu, CentOS)
- **Networking:** TCP/IP, DNS, DHCP, VLANs, Firewalls
- **Virtualization:** VMware vSphere, Microsoft Hyper-V
- **Hardware:** Server & PC assembly, troubleshooting, and repair

---

### Professional Experience
**IT Administrator**, TechForward Inc. | San Jose, CA | 2019 - Present
- Manage and maintain company's IT infrastructure, including servers, networks, and endpoints.
- Provide Tier 2/3 technical support to over 200 users.
- Implemented a new backup and disaster recovery plan.

**Help Desk Technician**, SupportNow | Santa Clara, CA | 2017 - 2019
- Provided Tier 1 technical support via phone, email, and in person.
- Resolved over 95% of tickets on the first contact.
`,
    css: `
h1 {
  text-align: center;
  margin-bottom: 0;
}
h3 {
  text-align: center;
  font-weight: 400;
  margin-top: 0;
  color: #444;
}
hr {
  border: none;
  border-top: 1px solid #ddd;
  margin: 20px 0;
}
`,
    styles: {
      ...defaultStyles,
      fontFamily: "Arial",
      fontSize: 11,
      paperSize: "Letter",
    },
  },
];
