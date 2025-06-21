### Week 3 (June 23-29)

- [ ] Testing for Alpha Program with Playwright
  - *Rationale: Create TDD for future features and sprints*
  1. Public Pages:
    [ ]   `/`: The main landing page.
    [ ]   `/login`: The login page.
    [ ]   `/privacy-policy`: The privacy policy page.
    [ ]   `/terms-of-service`: The terms of service page.
    [ ]   `/blocked`: A page shown to blocked users.
  2. Protected Pages (require login):
    [ ]   `/resumes`: This is likely where users create, view, and manage their resumes. This will be a critical area to test.
    [ ]   `/settings`: User settings page.
    [ ]   `/templates`: A page for managing resume templates.
  3. Authentication:
    [ ]   User login and logout functionality.
    [ ]   Protection of routes in (protected) to ensure only authenticated users can access them.
    [ ]   Handling of unauthenticated access to protected routes (e.g., redirecting to the login page).
  4.   Resume Management:
    [ ]   Creating a new resume.
    [ ]   Editing an existing resume.
    [ ]   Deleting a resume.
    [ ]   Viewing a list of all resumes.
    [ ]   The functionality of the resume editor itself (e.g., adding sections, changing templates, etc.).
  5.   User Settings:
    [ ]   Updating user profile information.
    [ ]   Changing account settings (e.g., password, email).
  6.   Template Selection:
    [ ]   Browsing and selecting different resume templates.
    [ ]   Applying a template to a resume.
  7.   API Endpoints:
    [ ]   We need to investigate the `resume-builder/src/app/api` directory to understand the available API endpoints and test them accordingly. This will involve testing both successful and error scenarios.
  8.   AI-Powered Features:
    [ ]   The `ai-protection.spec.ts` file suggests there might be some AI-powered features. We need to identify what these are and how to test them.
  9. API Endpoints:
    [ ]   `/auth`
    [ ]   `/chat`
    [ ]   `/pdf`
    [ ]   `/stripe`
    [ ]   `/user`
---

- [ ] Set up IaC with Terraform
  - *Rationale: Infrastructure autonomy and cloud agnostic*
---

- [ ] Setup CICD Pipelines
  - *Rationale: Automate the build, test, and deployment process*
---
