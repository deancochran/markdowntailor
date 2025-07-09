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

📧 john.doe@email.com | 📱 +1 (234) 567-890 | 📍 Seattle, WA
🔗 [linkedin.com/in/johndoe](https://linkedin.com/in/johndoe) | 💻 [github.com/johndoe](https://github.com/johndoe)

## Professional Summary
Senior Software Engineer with 10+ years of experience architecting and deploying scalable web applications. Proven track record of leading cross-functional teams, optimizing system performance, and delivering high-quality software solutions. Expertise in full-stack development with modern JavaScript frameworks, microservices architecture, and cloud technologies.

## Technical Skills
- **Languages**: JavaScript, TypeScript, Python, Java
- **Frontend**: React, Next.js, HTML5, CSS3, Responsive Design
- **Backend**: Node.js, Express.js, RESTful APIs, GraphQL
- **Databases**: PostgreSQL, MongoDB, Redis, Database Design & Optimization
- **Cloud & DevOps**: AWS (EC2, S3, Lambda), Docker, Kubernetes, CI/CD
- **Tools**: Git, Jenkins, Jest, Webpack, Agile/Scrum

## Professional Experience

### Senior Software Engineer | Tech Solutions Inc. | Seattle, WA
**January 2018 - Present**
- **Team Leadership**: Led cross-functional team of 5 engineers in full-stack development of enterprise e-commerce platform serving 100K+ daily users
- **Architecture**: Designed and implemented microservices architecture using Node.js, Docker, and Kubernetes, improving system scalability by 200%
- **Performance Optimization**: Enhanced application performance by 30% through strategic code refactoring, database query optimization, and implementation of Redis caching
- **Technical Mentorship**: Mentored junior developers and established coding standards and best practices across the engineering team
- **Key Technologies**: React, Node.js, PostgreSQL, AWS, Docker, Kubernetes

### Software Engineer | Web Innovations LLC | Bellevue, WA
**June 2014 - December 2017**
- **Feature Development**: Built and maintained core features for high-traffic social media application with 1M+ monthly active users
- **Quality Assurance**: Implemented comprehensive testing strategy including unit, integration, and end-to-end tests, reducing production bugs by 40%
- **Cross-functional Collaboration**: Partnered with product managers, designers, and QA teams to deliver features on schedule and within scope
- **Code Quality**: Participated in code reviews and maintained 90%+ test coverage across all delivered features
- **Key Technologies**: JavaScript, React, Express.js, MongoDB, Jest

## Education
**Bachelor of Science in Computer Science**
University of Washington | Seattle, WA | 2010 - 2014
*Relevant Coursework: Data Structures, Algorithms, Software Engineering, Database Systems*

## Notable Achievements
- Reduced system deployment time from 2 hours to 15 minutes through CI/CD pipeline implementation
- Architected fault-tolerant system handling 50% traffic increase during peak seasons
- Contributed to 3 open-source projects with 500+ GitHub stars combined
- AWS Certified Solutions Architect (if applicable - add certification date)

## Projects
**E-commerce Platform Modernization** | *Lead Developer*
- Migrated legacy monolithic application to microservices architecture
- Implemented real-time inventory management system using WebSockets
- Achieved 99.9% uptime and 40% reduction in infrastructure costs

**Social Media Analytics Dashboard** | *Full-Stack Developer*
- Built real-time analytics dashboard using React and D3.js
- Processed 10M+ data points daily with optimized database queries
- Delivered actionable insights leading to 25% increase in user engagement
`,
    css: `
h1 {
font-size: x-large;
margin: 0;
padding: 0;

}

h2,
h3,
h4 {
font-size: medium;
margin: 0;
padding: 0;
margin-top: 8px;

}

hr {
padding: 0;
margin-bottom: 8px;
}

a {
color: blue;
text-decoration: underline;
text-underline-offset: 2px;
}

p {
margin-top: 8px;
margin-bottom: 8px;
}

ul {
list-style: disc;
padding-left: 16px;
margin-top: 8px;
}
`,
    styles: {
      ...defaultStyles,
      fontFamily: "Inter",
      paperSize: "A4",
      lineHeight: 1.2,
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
h1 {
  font-size: x-large;
  margin: 0;
  padding: 0;

}

h2,
h3,
h4 {
  font-size: medium;
  margin: 0;
  padding: 0;
  margin-top: 8px;

}

hr {
  padding: 0;
  margin-bottom: 8px;
}

a {
  color: blue;
  text-decoration: underline;
  text-underline-offset: 2px;
}

p {
  margin-top: 8px;
  margin-bottom: 8px;
}

ul {
  list-style: disc;
  padding-left: 16px;
  margin-top: 8px;
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
h1 {
font-size: x-large;
margin: 0;
padding: 0;

}

h2,
h3,
h4 {
font-size: medium;
margin: 0;
padding: 0;
margin-top: 8px;

}

hr {
padding: 0;
margin-bottom: 8px;
}

a {
color: blue;
text-decoration: underline;
text-underline-offset: 2px;
}

p {
margin-top: 8px;
margin-bottom: 8px;
}

ul {
list-style: disc;
padding-left: 16px;
margin-top: 8px;
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
font-size: x-large;
margin: 0;
padding: 0;

}

h2,
h3,
h4 {
font-size: medium;
margin: 0;
padding: 0;
margin-top: 8px;

}

hr {
padding: 0;
margin-bottom: 8px;
}

a {
color: blue;
text-decoration: underline;
text-underline-offset: 2px;
}

p {
margin-top: 8px;
margin-bottom: 8px;
}

ul {
list-style: disc;
padding-left: 16px;
margin-top: 8px;
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
h1 {
font-size: x-large;
margin: 0;
padding: 0;

}

h2,
h3,
h4 {
font-size: medium;
margin: 0;
padding: 0;
margin-top: 8px;

}

hr {
padding: 0;
margin-bottom: 8px;
}

a {
color: blue;
text-decoration: underline;
text-underline-offset: 2px;
}

p {
margin-top: 8px;
margin-bottom: 8px;
}

ul {
list-style: disc;
padding-left: 16px;
margin-top: 8px;
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
h1 {
font-size: x-large;
margin: 0;
padding: 0;

}

h2,
h3,
h4 {
font-size: medium;
margin: 0;
padding: 0;
margin-top: 8px;

}

hr {
padding: 0;
margin-bottom: 8px;
}

a {
color: blue;
text-decoration: underline;
text-underline-offset: 2px;
}

p {
margin-top: 8px;
margin-bottom: 8px;
}

ul {
list-style: disc;
padding-left: 16px;
margin-top: 8px;
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
font-size: x-large;
margin: 0;
padding: 0;

}

h2,
h3,
h4 {
font-size: medium;
margin: 0;
padding: 0;
margin-top: 8px;

}

hr {
padding: 0;
margin-bottom: 8px;
}

a {
color: blue;
text-decoration: underline;
text-underline-offset: 2px;
}

p {
margin-top: 8px;
margin-bottom: 8px;
}

ul {
list-style: disc;
padding-left: 16px;
margin-top: 8px;
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
font-size: x-large;
margin: 0;
padding: 0;

}

h2,
h3,
h4 {
font-size: medium;
margin: 0;
padding: 0;
margin-top: 8px;

}

hr {
padding: 0;
margin-bottom: 8px;
}

a {
color: blue;
text-decoration: underline;
text-underline-offset: 2px;
}

p {
margin-top: 8px;
margin-bottom: 8px;
}

ul {
list-style: disc;
padding-left: 16px;
margin-top: 8px;
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
