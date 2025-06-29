# Dependencies stage
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json  ./
RUN corepack enable pnpm && pnpm install

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache chromium
ENV NODE_ENV=production
ENV PLAYWRIGHT_BROWSERS_PATH=0
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/migrations ./migrations
EXPOSE 80
ENV PORT=80
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
