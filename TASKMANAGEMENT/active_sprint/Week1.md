### Week 1 (June 9-15)
- [x] Implement resume size limit (2-3 pages) (Low Complexity)
  - *Rationale: Enforces resume best practices and ensures application performance*
---

- [x] Add user account deletion capability (Medium Complexity)
  - *Rationale: Basic user right and standard platform feature*
  - [x] Create user account page
    - [x] Create account deletion UI
    - [x] Create data export UI (backlogged)
    - [x] Create account theme mode toggle
  - [x] Create user NavBar Avatar with Dropdown
    - [x] Dropdown links to settings, signout

---

- [x] Database cascade deletion for user content (Medium Complexity)
  - *Rationale: Core data privacy feature ensuring complete user data removal upon request*
---

- [x] Implement AI protection (rate limiting, malicious input) (High Complexity)
  - *Rationale: Protects application from abuse, ensures stability, controls operational costs*
  - [x] Set up rate limiting for AI-generated content
    - [x] Integrate Upstash Redis for Maximized Developer Efficency
    - [x] $5 limit now allows for **~10,000 requests** with GPT 4.1 Nano
    - [x] Rate limiting becomes more important than cost limiting
  - [x] Implement input sanitization for AI prompts
  - [x] Create monitoring system for API usage
    - [x] Create usage aggregation queries
  - [x] Design fallback mechanisms for AI service interruptions
    - [x] Create user-friendly error messages
---

- [x] Implement Sentry integration for security monitoring (Medium Complexity)
  - *Rationale: Real-time monitoring and alerting for malicious user behavior and security threats*
  - [x] Set up Sentry account and project configuration
    - [x] Create Sentry account
    - [x] Configure project settings
    - [x] Set up environments (dev, staging, production, alpha)
    - [x] Configure data scrubbing rules
  - [x] Integrate Sentry SDK into the application
    - [x] Install Sentry packages
    - [x] Configure Sentry initialization
    - [x] Set up source map uploads
    - [x] Implement environment-specific DSN configuration
  - [x] Configure user context tracking for security events
    - [x] Implement user identification
    - [x] Add user metadata (roles, permissions)
    - [x] Configure IP tracking
    - [x] Set up session tracking
  - [x] Set up custom alerts for suspicious activities
    - [x] Configure failed authentication attempt alerts
    - [x] Set up rate limit violation alerts
    - [x] Create SQL injection attempt alerts
    - [x] Implement XSS attempt detection alerts
    - [x] Configure unusual access pattern alerts
  - [x] Implement error boundary tracking for malicious input attempts
    - [x] Create custom error boundaries
    - [x] Tag malicious input errors
    - [x] Implement error fingerprinting
    - [x] Set up error grouping rules
  - [x] Create dashboard for monitoring security incidents
    - [x] Design security metrics
    - [x] Build incident timeline view
    - [x] Create user behavior analytics
    - [x] Implement threat level indicators
  - [x] Configure data retention policies for compliance
    - [x] Set up data retention rules
    - [x] Implement PII redaction
    - [x] Configure automatic data deletion
    - [x] Create audit logs for data handling
  - [x] Set up alerting for unusual AI request patterns
    - [x] Define suspicious pattern criteria
    - [x] Implement pattern detection algorithms
    - [x] Configure alert thresholds
    - [x] Set up email/Slack notifications
    - [x] Create alert management dashboard
---

- [x] Alpha Program
  - [x] Set up Stripe
    - [x] Create Account
    - [x] Setup Account
    - [x] Setup Alpha Product
    - [x] Setup Alpha Metering
    - [x] Setup User credits in DB Schema
    - [x] Setup Webhook
  - [x] Dynamic Model Usage Pricing
    - [x] Create Pricing Constants
    - [x] Dynamically adjust the user credits on usage event
    - [x] Ensure prior logic isn't affect (adjust accordingly)
  - [x] Alpha Program Access Policies
    - [x] create alpha_credits_redeemed column
    - [x] prevent users from clicking the purchase button if redeemed
    - [x] prevent users from /api/stripe/checkout if redeemed

  - [x] Alpha Program Live Banner
    - [x] create an alpha program banner that counts down to start date and time till end
    - [x] once program ends have message display that the program is over

- [x] Update and Verify AuthJs config
  - [x] Add Google login
---

- [x] Establish Input sanitization
  - [x] Create Markdown processing pipeline
    - [x] Raw -> MarkdownIt --> DomPurify --> DB
  - [x] Create CSS processing pipeline
    - [x] Raw -> CSS Parser --> Validate No JS Properties --> DB
  - [x] Create text input sanitization
    - [x] Ensure no XSS attacks
    - [x] Ensure no SQL injection attacks

---

Fix default CSS
Fix Markdown/css editor preview
- the preview doesn't use the current conent shown in the editors

---


  - [ ] Testing for Alpha Program
    - [ ] Test Stripe
    - [ ] Test Dynamic Pricing
    - [ ] Test Email Access Policies
    - [ ] Alpha Program Access Policies
---
