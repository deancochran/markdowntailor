ResumeForge
Tailor your resume with AI, templates, and versioning — built for technical professionals.

ResumeForge is a modern resume management tool designed for developers and technical job seekers. It streamlines the tedious resume tailoring process, allowing you to focus on applying for jobs rather than rewriting your resume.

✨ Features
Resume Builder — Create structured resumes using premade templates.

AI-Powered Suggestions — Utilize agentic AI within a Monaco Editor to generate tailored content.

Version History — Save, duplicate, and restore previous versions of your resume.

Live Editor — Write in Markdown and CSS with Monaco for real-time previews.

Templates System — Base new resumes on pre-styled or role-specific templates.

Private by Default — Resumes are versioned and scoped to each user, ensuring privacy.

Developer Stack — Built with Next.js, Drizzle ORM, Shadcn UI, and GitHub CI.

📸 Preview
(Add screenshots or a Loom link here showing template selection, Monaco AI, versioning, etc. This section is crucial for showcasing the product visually.)

🧰 Tech Stack
Layer

Tech

Frontend

Next.js (App Router) + Shadcn/UI

Editor

Monaco Editor

State Mgmt

SWR, React Hook Form

Backend DB

Drizzle ORM + PostgreSQL

Auth

(TBD or Lucia if used)

DevOps

GitHub Actions CI/CD + Docker + Terraform IaC

🚀 Getting Started
Follow these steps to get ResumeForge up and running locally:

1. Clone the repository
git clone https://github.com/yourusername/resumeforge.git
cd resumeforge

2. Install dependencies
npm install

3. Set up local PostgreSQL (via Docker)
Ensure you have Docker installed and running.

docker-compose up -d

4. Configure environment variables
Create a .env.local file in the root directory. Refer to .env.example for required variables.

5. Run the development server
npm run dev

The application will be accessible at http://localhost:3000.

🧪 Development Scripts
Command

Description

npm run dev

Starts the development server.

npm run lint

Runs ESLint for code linting.

npm run build

Creates a production-ready build.

npm run typecheck

Performs TypeScript type checking.

✅ CI/CD
This project leverages GitHub Actions for automated workflows:

Linting, type checking, and build checks on each push.

Pre-push hooks via Husky to prevent broken builds locally.

(Planned) Docker image build and push.

(Planned) Terraform Infrastructure as Code (IaC) deployment steps.

See .github/workflows/ci.yml for more details.

🌐 Roadmap
Here's what's planned for future development:


Monaco + Markdown live editor enhancements.

Template-based resume creation improvements.

Page split in Iframe preview for standardized A4 paper size.

Integration of GitHub Actions CI.

Monaco AI agent with job description context for highly tailored suggestions.

Template marketplace for various roles (developer, product, design, etc.).

Resume comparison and diff tools.

Chrome Extension for one-click tailoring.

📦 Infrastructure
This application is containerized using Docker and deployed using:

GitHub Actions for CI/CD.

Terraform for managing AWS ECS + Fargate infrastructure.

PostgreSQL provisioned with AWS RDS.

Optional: Vercel/Fly.io preview links for pull requests.

👨‍💻 Contributing
Contributions are welcome! The app is currently in active private development. If you'd like to contribute, please open an issue to discuss your ideas or contact Dean Cochran directly.

📝 License
This project is licensed under the MIT License. See the LICENSE file for details.
