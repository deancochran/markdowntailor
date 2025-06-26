### Week 3 (June 23-29)

- [x] Testing for Alpha Program with Playwright
  - *Rationale: Create TDD for future features and sprints*
  1. Public Pages:
    [x]   `/`: The main landing page.
    [x]   `/login`: The login page.
    [x]   `/privacy-policy`: The privacy policy page.
    [x]   `/terms-of-service`: The terms of service page.
    [x]   `/blocked`: A page shown to blocked users.
  2. Protected Pages (require login):
    [ ]   `/resumes`: This is likely where users create, view, and manage their resumes. This will be a critical area to test.
    [x]   `/settings`: User settings page.
    [x]   `/templates`: A page for managing resume templates.
  3. Authentication:
    [x]   User login and logout functionality.
    [x]   Protection of routes in (protected) to ensure only authenticated users can access them.
    [x]   Handling of unauthenticated access to protected routes (e.g., redirecting to the login page).

  5.   User Settings:
    [x]   Updating user profile information.
    [x]   Changing account settings (e.g., password, email).
  6.   Template Selection:
    [x]   Browsing and selecting different resume templates.
    [x]   Applying a template to a resume.
  7.   API Endpoints:
    [x]   We need to investigate the `resume-builder/src/app/api` directory to understand the available API endpoints and test them accordingly. This will involve testing both successful and error scenarios.
  8.   AI-Powered Features:
    [x]   The `ai-protection.spec.ts` file suggests there might be some AI-powered features. We need to identify what these are and how to test them.
  9. API Endpoints:
    [x]   `/auth`
    [x]   `/chat`
    [x]   `/pdf`
    [x]   `/stripe`
    [x]   `/user`
---

- [ ] Set up IaC with Terraform
  - *Rationale: Infrastructure autonomy and cloud agnostic*
  Most Critical (High Impact on Security, Scalability, and Cost Efficiency):

  [x] Implement ECS Service Auto Scaling:  This is paramount for scalability and cost efficiency, as it ensures your application scales with demand and you only pay for resources when needed.

  Cost Impact: High (significant reduction in idle costs, optimization of spend during peak/off-peak hours).
  [x] Secrets Management Integration:  Essential for application security and maintainability, preventing sensitive data from being exposed in code or configuration files.
  Cost Impact: Low (minimal direct cost for Secrets Manager, but high indirect cost savings by preventing security breaches).
  [x] IAM Least Privilege: Crucial for security, minimizing the attack surface by granting only necessary permissions to your CI/CD pipeline.
  Cost Impact: Low (no direct cost, but prevents potential costs from unauthorized resource usage due to overly broad permissions).
  Medium Criticality (Moderate Impact on Performance and Cost):

  [x] Right-Size Fargate CPU and Memory:  Adjusting these based on actual application performance ensures optimal resource utilization and prevents over-provisioning or bottlenecks.
  Cost Impact: Medium (direct impact on Fargate task costs; can lead to savings if optimized, or increased costs if under-provisioned and leading to poor performance).
  [x] RDS Instance Class Selection:  Choosing the appropriate instance class, starting with a cost-effective option, balances performance and cost for your database.
  Cost Impact: Medium (direct impact on RDS instance costs; db.t4g.micro is generally more cost-effective than db.t3.micro for similar performance).
  Optional (Low Criticality, for extreme cost reduction with potential availability trade-offs):

  [x] Single NAT Gateway (VPC Module):  While the current setup of one NAT Gateway per public subnet offers higher availability, consolidating to a single NAT Gateway can reduce costs.
  Cost Impact: Low (modest cost savings, but trades off multi-AZ redundancy for internet egress).

---
