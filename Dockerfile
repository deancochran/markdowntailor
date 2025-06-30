# ---- Base ----
FROM node:20-bookworm AS base
WORKDIR /app
RUN corepack enable pnpm

# ---- Dependencies ----
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm fetch
RUN pnpm install --prod --no-optional

# ---- Builder ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm install --no-frozen-lockfile
RUN pnpm run build

# ---- Production ----
FROM node:20-bookworm AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy application files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Install and cache Playwright
# Using a separate RUN command for Playwright installation to leverage caching
# This layer will only be rebuilt if Playwright version in package.json changes
COPY --from=builder /app/package.json ./package.json
RUN --mount=type=cache,target=/root/.cache/ms-playwright \
    npx playwright install --with-deps chromium


EXPOSE 80
ENV PORT=80
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
