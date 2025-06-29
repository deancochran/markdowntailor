# Dependencies stage

FROM node:20-bookworm AS deps
WORKDIR /app
COPY package.json ./
RUN corepack enable pnpm && pnpm install

# Build stage

FROM node:20-bookworm AS builder
WORKDIR /app
COPY –from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm run build

# Production stage

FROM node:20-bookworm AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PLAYWRIGHT_BROWSERS_PATH=0

# Install Playwright browsers and system dependencies in production

RUN npx -y playwright install –with-deps chromium

# Copy built application

COPY –from=builder /app/public ./public
COPY –from=builder /app/.next/standalone ./
COPY –from=builder /app/.next/static ./.next/static
COPY –from=builder /app/migrations ./migrations

EXPOSE 80
ENV PORT=80
ENV HOSTNAME=“0.0.0.0”

CMD [“node”, “server.js”]