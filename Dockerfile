# syntax=docker/dockerfile:1
FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN corepack enable pnpm

# Dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN --mount=type=cache,target=/root/.cache/ms-playwright \
    pnpm install --frozen-lockfile

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build


# Test production image
FROM builder AS test-production
COPY . .
CMD ["pnpm", "run", "test"]


# Production
FROM node:20-bookworm-slim AS production
WORKDIR /app
RUN corepack enable pnpm

# Copy built app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/migrations ./migrations

# Copy package files and install production deps + Playwright
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.cache/ms-playwright \
    pnpm install --prod --frozen-lockfile

ENV NODE_ENV=production
ENV PORT=80
ENV HOST=0.0.0.0
EXPOSE 80

CMD ["node", "server.js"]
