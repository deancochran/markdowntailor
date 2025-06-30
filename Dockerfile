# Dependencies stage
FROM node:20-bookworm AS deps
WORKDIR /app
COPY package.json ./
RUN corepack enable pnpm && pnpm install

# Build stage with Playwright browsers
FROM node:20-bookworm AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install Playwright browsers in build stage
RUN corepack enable pnpm && npx playwright install --with-deps chromium
RUN pnpm run build

# Production stage
FROM node:20-bookworm AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PLAYWRIGHT_BROWSERS_PATH=0

# Install system dependencies for Playwright
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libatspi2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libxss1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Copy node_modules (including Playwright)
COPY --from=builder /app/node_modules ./node_modules

# Copy Playwright browsers
COPY --from=builder /root/.cache/ms-playwright ./root/.cache/ms-playwright

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/migrations ./migrations

EXPOSE 80
ENV PORT=80
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
