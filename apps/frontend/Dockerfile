# ==============================================================================
# Stage 1: Dependencies (deps)
# ==============================================================================
FROM node:22-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json ./
RUN npm ci

# ==============================================================================
# Stage 2: Builder (builder)
# ==============================================================================
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js telemetry disable during build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Public build-time environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_MEDIA_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_MEDIA_URL=$NEXT_PUBLIC_MEDIA_URL

# Build Next.js application with standalone output
RUN npm run build

# ==============================================================================
# Stage 3: Runner (runner)
# ==============================================================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Security: Create non-root system group and user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static assets and standalone server bundle
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set permissions
USER nextjs

# Expose default Next.js port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3000}/ || exit 1

# Start standalone Next.js server
CMD ["node", "server.js"]
