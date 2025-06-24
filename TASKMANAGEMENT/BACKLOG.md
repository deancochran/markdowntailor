# markdowntailor Project Backlog

This backlog contains all planned tasks for the markdowntailor application, organized by priority category. Items are moved to sprint planning as they become part of the active development cycle.

## Critical Priority



- [ ] Implement alpha protection permission access policies (High Complexity)
  - *Rationale: Prevents unauthorized access to user data; fundamental security requirement*
  - [ ] alpha timeframe: July 1-31, 2025
  - [ ] User limit: 100 alpha users maximum
  - [ ] Access expiration: Automatic on July 31st
  - [ ] Define TIMEFRAME managed access
    - [ ] Create alpha access configuration schema
    - [ ] Define alpha start and end date constants
    - [ ] Implement date validation utilities
    - [ ] Create alpha status checking function
  - [ ] Implement middleware to prevent all authentication after timeframe expires
    - [ ] Create authentication middleware
    - [ ] Add timeframe validation to auth flow
    - [ ] Implement graceful redirect for expired alpha
    - [ ] Create custom error pages for alpha expiration
    - [ ] Add logging for blocked authentication attempts
  - [ ] Write playwright tests for permission boundaries
    - [ ] Test successful login during alpha period
    - [ ] Test blocked login after alpha expiration
    - [ ] Test permission enforcement for different user roles
    - [ ] Test edge cases (timezone differences, daylight savings)
  - [ ] Add limits for AI usage based on aggregate user credits (every user gets $5)
    - [ ] Create user credits tracking schema
    - [ ] Implement credits deduction logic
    - [ ] Add credits checking middleware
    - [ ] Create credits exhaustion error handling

---




- [ ] Incorporate testing into each page of the application (High Complexity)
  - *Rationale: Essential for delivering stable, reliable product and catching bugs pre-release*
  - [ ] Create tests for the resume CRUD operations
    - [ ] Test resume creation flow
    - [ ] Test resume reading/viewing
    - [ ] Test resume updating
    - [ ] Test resume deletion
    - [ ] Test resume permissions
  - [ ] Create tests for the resume version CRUD operations
    - [ ] Test version creation
    - [ ] Test markdown and css size limits
    - [ ] Test version comparison
    - [ ] Test version rollback
    - [ ] Test version deletion
    - [ ] Test version limits
  - [ ] Create tests for the resume templates CRUD operations
    - [ ] Test template creation
    - [ ] Test template application
    - [ ] Test template customization
    - [ ] Test template sharing
    - [ ] Test template deletion
  - [ ] Create tests for the resume util operations
    - [ ] Test print functionality
    - [ ] Test HTML download
    - [ ] Test PDF generation
    - [ ] Test duplicate resume
    - [ ] Test resume import/export
---

- [ ] Configure markdowntailor title/name (Low Complexity)
  - *Rationale: Core application identity component*
  - [ ] Update application name globally
    - [ ] Change package.json name
    - [ ] Update meta tags
    - [ ] Modify manifest files
  - [ ] Update branding assets
    - [ ] Update logos
    - [ ] Change favicon
    - [ ] Update social media assets
  - [ ] Update documentation
    - [ ] Update README
    - [ ] Change code comments
    - [ ] Update user guides
---

- [ ] Create Terms of Service (Medium Complexity)
  - *Rationale: Legally required document governing service usage*
  - [ ] Draft Terms of Service content
    - [ ] Define service scope
    - [ ] Add usage restrictions
    - [ ] Include liability limitations
    - [ ] Add termination clauses
  - [ ] Implement ToS acceptance flow
    - [ ] Create acceptance UI
    - [ ] Add acceptance tracking
    - [ ] Implement version management
    - [ ] Create re-acceptance for updates
  - [ ] Create ToS page
    - [ ] Design ToS layout
    - [ ] Add version history
    - [ ] Implement print-friendly version
    - [ ] Add change highlighting
  - [ ] Add legal compliance features
    - [ ] Implement acceptance logging
    - [ ] Create audit trails
    - [ ] Add timestamp verification
    - [ ] Create compliance reports
---

- [ ] Create Privacy Policy (Medium Complexity)
  - *Rationale: Legal requirement for data collection, usage, and protection disclosure*
  - [ ] Draft Privacy Policy content
    - [ ] Document data collection practices
    - [ ] Explain data usage
    - [ ] Add third-party sharing policies
    - [ ] Include user rights section
  - [ ] Implement privacy settings UI
    - [ ] Create privacy dashboard
    - [ ] Add data visibility controls
    - [ ] Implement consent management
    - [ ] Create preference center
  - [ ] Create Privacy Policy page
    - [ ] Design policy layout
    - [ ] Add navigation for sections
    - [ ] Implement version tracking
    - [ ] Create update notifications
  - [ ] Add GDPR compliance features
    - [ ] Implement data portability
    - [ ] Add right to be forgotten
    - [ ] Create consent tracking
    - [ ] Add cookie management
---

- [ ] Set up IaC with Terraform (High Complexity)
  - *Rationale: Establish automated, version-controlled infrastructure deployment to ensure consistent environments, enable rapid scaling, reduce manual deployment errors, and support CI/CD pipeline automation for the resume builder platform*

  - [ ] **Environment Planning & Design**
    - [ ] Define infrastructure requirements (compute, storage, networking)
    - [ ] Design multi-environment strategy (dev, staging, prod)
    - [ ] Plan resource naming conventions and tagging standards
    - [ ] Document security requirements and compliance needs

  - [ ] **Terraform Foundation Setup**
    - [ ] Initialize Terraform project structure
    - [ ] Configure remote state management (S3 + DynamoDB for locking)
    - [ ] Set up Terraform modules architecture
    - [ ] Create reusable modules for common resources
    - [ ] Implement proper variable management (.tfvars files)

  - [ ] **Core Infrastructure Components**
    - [ ] Network infrastructure (VPC, subnets, security groups)
    - [ ] Application hosting resources (EC2, ECS, or serverless)
    - [ ] Database infrastructure (RDS, connection pooling)
    - [ ] Load balancing and auto-scaling configuration
    - [ ] CDN and static asset delivery setup

  - [ ] **Security & Access Management**
    - [ ] IAM roles and policies configuration
    - [ ] SSL/TLS certificate management
    - [ ] Secrets management integration
    - [ ] Security group rules and network ACLs
    - [ ] Enable logging and monitoring access

  - [ ] **CI/CD Integration**
    - [ ] Create Terraform validation pipeline
    - [ ] Implement plan/apply automation
    - [ ] Set up deployment approval workflows
    - [ ] Configure environment promotion process
    - [ ] Add infrastructure drift detection

  - [ ] **Monitoring & Observability**
    - [ ] CloudWatch or equivalent monitoring setup
    - [ ] Application and infrastructure logging
    - [ ] Alerting and notification configuration
    - [ ] Performance monitoring dashboards
    - [ ] Cost monitoring and optimization alerts

  - [ ] **Documentation & Maintenance**
    - [ ] Create infrastructure documentation
    - [ ] Document deployment procedures
    - [ ] Set up backup and disaster recovery
    - [ ] Create troubleshooting guides
    - [ ] Establish regular maintenance schedule

  - [ ] **Testing & Validation**
    - [ ] Terraform configuration testing
    - [ ] Infrastructure validation scripts
    - [ ] Disaster recovery testing procedures
    - [ ] Performance and load testing setup
    - [ ] Security compliance validation
---



## High Priority

- [ ] Add a credits purchase mechanism
  - *Rationale: Essential for monetization*

- [ ] Implement more granular pricing tiers
  - *Rationale: Essential for monetization stability*

- [ ] Remove placeholder/fake reviews (Low Complexity)
  - *Rationale: Essential for trust building and platform integrity*

---

- [ ] Correct exaggerated information (Low Complexity)
  - *Rationale: Ensures honest messaging for user trust*



---



## Medium Priority

- [ ] Implement character limit for markdown (Low Complexity)
  - *Rationale: Performance and consistency optimization*

---

- [ ] Implement character limit for CSS (Low Complexity)
  - *Rationale: Maintains template structural integrity*

---

- [ ] Create globally cached primary resume pdf for users (Medium Complexity)
  - *Rationale: Primary application function enabling users to maintain and share main resume*

---

- [ ] Create About Us page (Low Complexity)
  - *Rationale: Builds user connection and trust*

---

- [ ] Create Contact page (Low Complexity)
  - *Rationale: Necessary support and feedback channel during alpha*

---

- [ ] Create Features page (Medium Complexity)
  - *Rationale: Marketing utility; product demonstrates features during alpha*

---

- [ ] Create Pricing page (Low Complexity)
  - *Rationale: Deferrable if alpha remains free*

---

- [ ] Web Worker For PDF Generation -- Improve Performance (High Complexity)
  - *Rationale: PDF Gerernation is slow and resource intensive*

---


## Low Priority

- [ ] Add SEO to the application/blog
  - *Rationale: Enabled for future scalability and customization*

- [ ] Create a UI for model and provider selection
  - *Rationale: Enabled for future scalability and customization*

- [ ] Search Engine Optimization (SEO) (High Complexity)
  - *Rationale: Long-term strategy for post-stabilization focus*

---

- [ ] Create Blog (Medium Complexity)
  - *Rationale: Content marketing tool, non-essential for initial launch*

---

## Icebox (Future Consideration)

- Integration with job board APIs
- Collaborative resume review functionality
- AI-powered ATS analytics
- AI-powered job matching based on resume content
- Resume analytics dashboard
- Mobile app version
- Localization/internationalization support
- Credit History: Track all credit transactions (purchases, usage, refunds)
- Usage Analytics: Dashboard showing credit consumption patterns
- Low Balance Alerts: Notify users when credits are running low
- Refund Handling: Add webhook handlers for refunds
- Credit Gifting: Allow users to gift credits to others
