# ResumeForge
This project is licensed under the [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/) license. It is intended for educational and reference purposes only. No reuse, modification, or commercial use is permitted.

AI-powered resume management platform for technical professionals.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, Shadcn/UI, Tailwind CSS 4 |
| **Editor** | Monaco Editor, Markdown Editor |
| **AI** | Vercel AI SDK, OpenAI, Ollama |
| **Database** | Drizzle ORM + Neon PostgreSQL |
| **Auth** | NextAuth.js v5 |
| **Testing** | Playwright, Jest, MSW |
| **Package Manager** | pnpm |
| **Code Quality** | ESLint, Husky |
| **CI/CD** | GitHub Actions |

## 🚀 Development Setup

### Prerequisites
- Node.js 18+
- pnpm (enforced via preinstall hook)
- Neon Database account
- Git

### Local Development

```bash
# Clone and install
git clone https://github.com/yourusername/resumeforge.git
cd resumeforge
pnpm install

# Setup environment
cp .env.example .env.local
# Configure your Neon database URL and other variables

# Generate database schema
pnpm run db:generate

# Start development server (with Turbopack)
pnpm run dev
```

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start development server with Turbopack |
| `pnpm run build` | Build for production |
| `pnpm run start` | Start production server |
| `pnpm run lint` | Run ESLint |
| `pnpm run typecheck` | TypeScript type checking |
| `pnpm run db:generate` | Generate Drizzle schema |
| `pnpm run db:studio` | Open Drizzle Studio |
| `pnpm run test` | Run Playwright tests |
| `pnpm run test:ui` | Run Playwright tests with UI |
| `pnpm run test:failed` | Re-run only failed tests |
| `pnpm run show-report` | Show Playwright test report |

## 🧪 Testing

### Playwright Configuration

Tests are located in the `/tests` directory and use Playwright for end-to-end testing.

```bash
# Run all tests
pnpm run test

# Run tests with UI mode
pnpm run test:ui

# Re-run only failed tests
pnpm run test:failed

# Show test report
pnpm run show-report

# Run specific test file
pnpm exec playwright test auth.spec.ts
```

### Test Structure
```
tests/
├── auth.spec.ts          # Authentication flows
├── resume-builder.spec.ts # Resume creation/editing
├── ai-suggestions.spec.ts # AI integration tests
└── fixtures/            # Test data and utilities
```

### Writing Tests
```typescript
// Example test structure
import { test, expect } from '@playwright/test';

test.describe('markdowntailor', () => {
  test('should create a new resume', async ({ page }) => {
    // Test implementation
  });
});
```

## 🔧 Code Quality

### Husky Git Hooks

Pre-commit hooks are configured to run:
- ESLint validation
- TypeScript type checking
- Staged file linting

```bash
# Hooks are automatically installed after pnpm install
# Husky is initialized via the prepare script
```

### ESLint Configuration

ESLint is configured with:
- Next.js 15 recommended rules
- TypeScript support
- Tailwind CSS class ordering
- Custom rules for project conventions

```bash
# Run linting
pnpm run lint

# TypeScript checking
pnpm run typecheck
```

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow

Located in `.github/workflows/ci.yml`:

```yaml
# Workflow triggers
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
```

### CI Pipeline Steps

1. **Setup & Dependencies**
   - Node.js 18 setup
   - Cache npm dependencies
   - Install dependencies

2. **Code Quality Checks**
   - ESLint validation
   - TypeScript type checking

3. **Build Verification**
   - Next.js production build
   - Build artifact validation

4. **Testing**
   - Playwright test execution
   - Jest unit tests
   - Test result reporting
   - Screenshot/video artifacts on failure

5. **Security Scanning**
   - Dependency vulnerability check
   - SAST scanning (planned)

### Environment Variables

Required environment variables for CI:

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/resumeforge

# AI Integration
OPENAI_API_KEY=sk-...
OLLAMA_BASE_URL=http://localhost:11434 # Optional

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## 📦 Database Management

### Drizzle ORM with Neon

Schema definitions are in `/src/lib/db/schema.ts`:

```bash
# Generate schema changes
pnpm run db:generate

# Open Drizzle Studio
pnpm run db:studio
```

### Working with Neon Database

```bash
# Generate migrations after schema changes
pnpm run db:generate

# Push schema to database (development)
# Note: Use migrations for production
```

## 🔧 Development Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature development
- `hotfix/*` - Production hotfixes

### Commit Convention
Using conventional commits:
```bash
feat: add AI suggestion endpoint
fix: resolve Monaco editor crash
docs: update deployment guide
test: add resume builder e2e tests
```

### Pull Request Process
1. Create feature branch from `develop`
2. Implement changes with tests
3. Ensure all CI checks pass
4. Request code review
5. Merge to `develop` after approval

## 🚀 Deployment

### Environment Setup

**Development**
```bash
# Local development with Neon database
pnpm run dev
```

**Staging**
- Deployed via GitHub Actions on push to `develop`
- Uses Neon branch database
- Environment: `staging`

**Production**
- Deployed via GitHub Actions on push to `main`
- Uses Neon main database
- Environment: `production`

### Build Configuration

Next.js build settings in `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // For Docker deployment
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  }
}
```

### Docker Configuration

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder
# Build steps...

FROM node:18-alpine AS runner
# Runtime configuration...
```

## 🔍 Monitoring & Debugging

### Local Development
```bash
# Type checking
pnpm run typecheck

# Debug Playwright tests
pnpm run test:ui

# Database debugging
pnpm run db:studio

# Show test reports
pnpm run show-report
```

### Error Handling
- Client-side errors: Error boundaries
- Server-side errors: Centralized error handling
- API errors: Standardized error responses

## 📚 Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── ui/             # Shadcn/UI components
│   └── features/       # Feature-specific components
├── lib/                # Utilities and configurations
│   ├── db/             # Database schema and utilities
│   ├── ai/             # AI SDK integration
│   └── utils/          # Helper functions
├── hooks/              # Custom React hooks
└── types/              # TypeScript type definitions

tests/                  # Playwright tests
docs/                   # Additional documentation
```

## 🤝 Contributing

### Prerequisites
- Familiarity with Next.js App Router
- Experience with TypeScript
- Understanding of Playwright testing

### Development Setup
1. Fork the repository
2. Follow local development setup
3. Create feature branch
4. Implement changes with tests
5. Ensure all CI checks pass
6. Submit pull request

### Code Standards
- TypeScript strict mode
- ESLint + Prettier configuration
- Conventional commit messages
- Test coverage for new features
