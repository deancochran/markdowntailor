# syntax=docker/dockerfile:1
FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN corepack enable pnpm

# Dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build


# Test production image
FROM builder AS test-production
CMD ["pnpm", "run", "test"]


# Production
FROM node:20-bookworm-slim AS production
WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable pnpm

# Copy built app
COPY --from=builder /app/public ./public
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Essential Files
COPY --from=builder /app/posts ./posts
COPY --from=builder /app/migrations ./migrations

ENV PORT=80
ENV HOST=0.0.0.0
EXPOSE 80

CMD ["node", "server.js"]
