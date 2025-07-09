import { defaultStyles, FONT_FAMILY, ResumeStyles } from "./styles";

export enum TemplateTag {
  Creative = "Creative",
  Modern = "Modern",
  Minimalist = "Minimalist",
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
    slug: "agile-archer",
    name: "Agile Archer",
    description: "A professional resume template for tech engineers.",
    tags: [TemplateTag.Creative],
    markdown: `
# Agile Archer

Seattle, WA | agile.archer@email.com | +1 (234) 567-890 | [linkedin.com/in/agilearcher](https://linkedin.com/in/agilearcher) | [github.com/agilearcher](https://github.com/agilearcher)

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

**Senior Software Engineer** | Tech Solutions Inc. | Seattle, WA <span class="right"> Seattle, WA | 2018 - Presetn</span>

- **Team Leadership**: Led development team of 5 engineers enterprise application serving 100K+ daily users
- **Architecture**: Designed and implemented microservices architecture improving system scalability by 200%
- **Performance Optimization**: Enhanced application performance by 30% through strategic code refactoring
- **Technical Mentorship**: Mentored junior developers and established coding standards and best practices across the engineering team
- **Key Technologies**: React, Node.js, PostgreSQL, AWS, Docker, Kubernetes

**Software Engineer** | Web Innovations LLC <span class="right"> Bellevue, WA | 2014 - 2017</span>
- **Feature Development**: Built and maintained core features for high-traffic social media application with 1M+ monthly active users
- **Quality Assurance**: Implemented comprehensive testing strategy including end-to-end tests, reducing production bugs by 40%
- **Cross-functional Collaboration**: Partnered with product managers,  and QA teams to deliver features on schedule and within scope
- **Code Quality**: Participated in code reviews and maintained 90%+ test coverage across all delivered features
- **Key Technologies**: JavaScript, React, Express.js, MongoDB, Jest

## Education
**Bachelor of Science in Computer Science** | University of Washington<span class="right"> Seattle, WA | 2010 - 2014</span>

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
    css: `h1,h2,h3,h4{
      font-weight: 600;
    }

    h1 {
      font-size: 2.2em;
      color: #2c3e50;
      margin: 0;
      padding: 0;
      border-bottom: 2px solid #2c3e50;
      line-height: 1.2;
    }

    h2 {
      font-size: 1.3em;

      color: #2c3e50;
      padding: 0;
      border-bottom: 2px solid #ecf0f1;


    }

    h3 {
      font-size: 1.1em;

      color: #2c3e50;
      margin-top: 16px;
      padding: 0;
    }


    hr {
      border: none;
      border-top: 1px solid #2c3e50;
      margin-bottom: 8px;
      padding: 0;
      color: #2c3e50;
    }

    a {
      color: #3498db;
      text-decoration: none;
      border-bottom: 1px solid transparent;
    }

    p {
      color: #2c3e50;
      margin-top: 8px;
      margin-bottom: 4px;
      text-align: justify;
    }

    ul {
      list-style: disc;
      padding-left: 0;
      list-style-position: inside;

    }

    li {
      color: #2c3e50;
      position: relative;



    }
    .right{
      float: right;
    }`,
    styles: {
      ...defaultStyles,
      fontFamily: FONT_FAMILY.Inter,
      paperSize: "Letter",
      lineHeight: 1.4,
      fontSize: 11,
      marginV: 45,
      marginH: 45,
    },
  },

  {
    slug: "modern-professional",
    name: "Steady Eddy",
    description: "A sleek, modern template for today's professional.",
    tags: [TemplateTag.Modern],
    markdown: `# Steady Eddy
Chattanooga, TN | steady.eddy@email.com | +1 (123) 456-7890



### Professional Statement
---
Software Engineer with 7+ years of experience and expertise in cloud deployment, microservices, and DevOps. Proven track record of developing and maintaining scalable back-end systems, implementing CI/CD pipelines, and deploying production applications using AWS ecosystem and containerization technologies.



### Skills
---
* **Programming Languages**: Python (7 years), TypeScript (6 years), Shell (3 years), SQL, C++
* **Data Tools**: PyTorch, Tensorflow, HuggingFace, PySpark, DVC, Pandas, NumPy, Scikit-learn
* **Most Used Frameworks**: FastAPI, Flask, Next.js, SvelteKit, Nuxt.js, Django
* **DevOps Tools**: Docker, Terraform, Ansible, Jenkins, GitHub Actions, Grafana, Sentry
* **Certifications**: AWS Developer, AWS Solutions Architect, AWS SysOps, AWS Machine Learning



### Professional Experience
---
**Innovate Solutions Inc.** | Full Stack Developer Team Lead
*Remote <span class="right">Remote | 2017 - Present</span>
* Architected scalable applications using AWS, Redis, Python, SQL, and SvelteKit
* Maintained 24/7 back-end 'always up' server clusters ensuring high availability
* Led development of robust data pipelines leveraging AWS services
* Leveraged AWS services (e.g., EMR, Step Functions) to process and transform large datasets
* Deployed containerized applications using Docker and infrastructure as code practices
* Implemented data quality monitoring and anomaly detection ML models
* Collaborated with remote cross-functional teams to optimize performance and deploy scalable solutions

**Data Insights LLC** | AI Research Assistant <span class="right">Memphis, TN |  2015 - 2017</span>
* Enhanced data pipelines for AI-driven computer vision systems, optimizing workflows in Docker
* Worked with unstructured data sources to improve performance and data integration
* Developed components of ML pipelines, ensuring efficient data processing and deployment

**Tech Forward Group** | ML Engineer R&D Intern <span class="right">Knoxville, TN |  2012 - 2015</span>
* Created a collection of data management tools using PyTorch to analyze algorithmic bias
* Enhanced analysis of model fairness evaluation with SHAP, LIME, Kolmogorov-Smirnov tests



### Education
---
**Metropolitan University** | Master's of Signal Processing <span class="right">Knoxville, TN |  2010 - 2012</span>
* **Coursework**: Data Science, Deep Learning, LLM AI Agents, RAG, Recommender Systems
* **Thesis**: Smith J. (2022). *Advanced Recommender Systems with Graph Neural Networks*

**State University** | Bachelor's of Data Science <span class="right">Knoxville, TN |  2006 - 2010</span>
* **Coursework**: Data Science, Probability Theory, Machine Learning, Deep Learning
* SGA President of Programming, and Dean's List Recipient



### Projects
---
**ResumePro AI** | AI Enhanced Resume Builder (github)
* Shipped a production AI SaaS application in one week, built solo deployed with IaC, CI/CD
* **Tech Stack**: Next.js, Shadcn, Drizzle, PostgreSQL, Stripe, Anthropic, AWS, Terraform, GitHub

**TechByte Blog** | A personal blog (github)
* **Tech Stack**: SvelteKit, SkeletonUI, AWS, Terraform, GitHub`,
    css: `

h1,
h2,
h3,
h4 {
  font-weight: 600;
}

h1 {
  font-size: x-large;
  margin: 0;
  padding: 0;
  line-height: .75;
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
  border-top: 1px solid black;
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

.right {
  float: right;
}
    `,
    styles: {
      ...defaultStyles,
      fontFamily: FONT_FAMILY.Inter,
      fontSize: 11,
      lineHeight: 1.5,
      paperSize: "A4",
      marginV: 40,
      marginH: 40,
    },
  },
  {
    slug: "stark-sterling",
    name: "Stark Sterling",
    description: "A clean, minimalist template for executives.",
    tags: [TemplateTag.Minimalist],
    markdown: `
# Stark Sterling
Product Manager and Tech Savant

<div class="contact">
    <ul style="list-style:none;">
        <li>linkedin.com/in/starksterling</li>
        <li>stark.sterling@email.com</li>
        <li>(555) 555-0202</li>
    </ul>
</div>



### Executive Summary
---
Visionary and strategic technology executive with over 15 years of experience leading global engineering teams and driving technological innovation. Proven track record of scaling infrastructure, building high-performing teams, and aligning technology with business goals to deliver exceptional results.



### Career History
---
**Chief Technology Officer**, QuantumLeap Inc. <span class="right">2017 - Present</span>
- Oversee a 150+ person engineering organization across three continents
- Lead the company's digital transformation initiative, migrating legacy systems to cloud-native architecture
- Drive a 50% improvement in product delivery cycles through implementation of DevOps practices
- Establish technology roadmap and strategic vision aligned with business objectives

**VP of Engineering**, Stellar Solutions  <span class="right">2012 - 2017</span>
- Grew the engineering team from 20 to 80 members while maintaining quality standards
- Directed the architecture and development of a market-leading B2B SaaS product
- Implemented agile methodologies and modern development practices across all teams
- Led successful product launches resulting in 300% revenue growth

**Senior Engineering Manager**, TechCorp <span class="right">2008 - 2012</span>
- Managed multiple engineering teams totaling 25+ developers
- Architected scalable systems handling millions of daily transactions


**Software Engineer**, TechCorp <span class="right">2005 - 2008</span>
- Exposed to engineering methodologies and best practices
- Championed adoption of cloud technologies and microservices architecture


### Education
---
- **M.S. in Computer Science**, Stanford University <span class="right">2005 - 2008</span>
- **B.S. in Electrical Engineering**, MIT <span class="right">2000 - 2004</span>



### Key Achievements
---
- Successfully led three major digital transformation initiatives
- Built and scaled engineering organizations from startup to enterprise level
- Recognized as "CTO of the Year" by TechLeaders Magazine (2022)
- Speaker at major technology conferences including AWS re:Invent and DockerCon
    `,
    css: `
h1, h2, h3, h4 {
  font-weight: 600;
}

h1 {
  font-size: 2.0em;
  font-weight: 700;
  margin: 0;
  padding: 0;
  line-height: 1.1;
}

.contact {
  position: absolute;
  width: 50%;
  top: 0;
  right: 0;
  padding: 40px;
  text-align: right;
}

h2,
h3,
h4 {
  font-size: 1.1em;
  margin-top: 8px;

}

p {
  padding-top: 8px;
  padding-bottom: 2px;
}



hr {

  border-top: 1px solid black;
  padding: 0;
  margin-bottom: 4px;
}


ul {
  list-style:inside;
  padding-left: 0;
}

.right {
  float: right;
}`,
    styles: {
      ...defaultStyles,
      fontFamily: FONT_FAMILY.Merriweather,
      fontSize: 13,
      lineHeight: 1.6,
      paperSize: "Letter",
      marginV: 40,
      marginH: 40,
    },
  },
  {
    slug: "vivid-vaughn",
    name: "Vivid Vaughn",
    description: "A vibrant, creative template for designers.",
    tags: [TemplateTag.Creative],
    markdown: `
# Vivid Vaughn
## Graphic Designer & Illustrator


<div class="contact">
    <ul style="list-style:none;">
        <li>vividvaughndesign.com</li>
        <li>vividvaughn@email.com</li>
        <li>(555) 123-4567</li>
    </ul>
</div>

### About Me
---
I am a passionate visual storyteller who transforms complex ideas into compelling, intuitive designs. With a keen eye for typography, color theory, and user experience, I create designs that not only look beautiful but also solve real problems. My work spans brand identity, digital interfaces, and editorial illustration.



### Professional Experience
---

**Lead Designer**, Studio Bloom  <span class="right">Brooklyn, NY | 2019 - Present</span>
- Developed complete brand identity for "GreenLeaf," a sustainable food startup, and digital presence
- Designed UI/UX for "Connect," a social networking app with 50K+ active users, focusing on user engagement
- Created illustration series for children's book "The Magical Forest," published by Little Dreams Press
- Collaborated with cross-functional teams to deliver projects on time and within budget

**Junior Designer**, Pixel Perfect Agency <span class="right">Manhattan, NY | 2017 - 2019</span>
- Assisted senior designers in creating marketing materials for Fortune 500 clients
- Designed social media graphics, web banners, and promotional materials for various campaigns
- Participated in client presentations and creative brainstorming sessions
- Managed multiple projects simultaneously while maintaining quality standards

**Freelance Illustrator** <span class="right">Remote | 2015 - 2017</span>
- Created custom illustrations for independent publications and small businesses
- Developed personal artistic style combining digital and traditional techniques
- Built client relationships and managed project timelines independently



### Design Skills & Tools
---
- **Design Software:** Adobe Creative Suite (Photoshop, Illustrator, InDesign), Sketch, Figma
- **Specialties:** UI/UX Design, Brand Identity, Editorial Illustration, Print Design
- **Technical Skills:** Prototyping, User Research, Typography, Color Theory
- **Additional Tools:** Procreate, After Effects, Webflow, Principle


### Education & Recognition
---
**B.F.A. in Graphic Design** | Parsons School of Design <span class="right">New York, NY | 2017</span>
- Graduated Summa Cum Laude
- Recipient of the Dean's Merit Scholarship
- Featured in student exhibition "Future Voices in Design"

**Awards & Recognition**
- Winner, Young Designer Award, AIGA NY Chapter (2020)
- Featured in "30 Under 30 Designers to Watch" by Design Magazine (2021)
- Best Brand Identity, Brooklyn Design Awards (2022)
    `,
    css: `/* Designer Resume Styling */


    h1 {
      font-size: 2.8em;
      font-family: Haettenschweiler, sans-serif;
      font-weight: 800;
      margin: 0;
      padding: 0;
      line-height: .5;
      color: #e74c3c;
      text-transform: uppercase;
      margin-left: -4px;
    }

    .contact {
      position: absolute;
      width: 50%;
      top: 0;
      right: 0;
      padding: 40px;
      text-align: right;
    }

    .right {
      float: right;
    }

    h2 {

      font-size: 1.3em;
      font-weight: 600;
      color: #f39c12;
    }

    h3 {
      font-size: 1.2em;
      font-weight: 600;
      margin: 0;
      padding: 0;
      margin-top: 8px;
      text-transform: uppercase;

    }

    hr {


      border-top: 1px solid black;
    }

    a {
      color: #3498db;
      padding-bottom: 2px;
    }

    p {
      margin-top: 4px;
      font-weight: 400;
    }

    ul {
      list-style: georgian;
      padding-left: 20px;
    }

    li{
      padding-left: 4px;
    }


    strong {
      font-weight: 700;
    }`,
    styles: {
      ...defaultStyles,
      fontFamily: FONT_FAMILY.Montserrat,
      paperSize: "A4",
      marginV: 40,
      marginH: 40,
      fontSize: 11,
      lineHeight: 1.5,
    },
  },
];
