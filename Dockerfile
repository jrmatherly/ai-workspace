# syntax=docker/dockerfile:1
# check=skip=CopyIgnoredFile

# Base
FROM node:26-alpine AS base
ENV NEXT_TELEMETRY_DISABLED=1

# Dependencies
FROM base AS deps
WORKDIR /app

# Dependency files (the Prisma schema and config feed the postinstall `prisma generate`)
COPY package*.json prisma.config.ts ./
COPY src/server/prisma ./src/server/prisma

# Install dependencies, including dev (release builds should use npm ci)
ENV NODE_ENV=development
RUN npm ci


# Builder
FROM base AS builder
WORKDIR /app

# Deployment type marker
ENV NEXT_PUBLIC_DEPLOYMENT_TYPE=docker

# Optional build version arguments at build time
ARG NEXT_PUBLIC_BUILD_HASH
ENV NEXT_PUBLIC_BUILD_HASH=${NEXT_PUBLIC_BUILD_HASH}

# Optional argument to configure GA4 at build time (see: docs/deploy-analytics.md)
ARG NEXT_PUBLIC_GA4_MEASUREMENT_ID
ENV NEXT_PUBLIC_GA4_MEASUREMENT_ID=${NEXT_PUBLIC_GA4_MEASUREMENT_ID}

# Optional argument to configure PostHog at build time (see: docs/deploy-analytics.md)
ARG NEXT_PUBLIC_POSTHOG_KEY
ENV NEXT_PUBLIC_POSTHOG_KEY=${NEXT_PUBLIC_POSTHOG_KEY}
ARG NEXT_PUBLIC_POSTHOG_HOST
ENV NEXT_PUBLIC_POSTHOG_HOST=${NEXT_PUBLIC_POSTHOG_HOST}

# Optional: public origin for absolute og:image/canonical tags, and the Spotlight feed base (see: docs/environment-variables.md)
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ARG NEXT_PUBLIC_SPOTLIGHT_FEED_URL
ENV NEXT_PUBLIC_SPOTLIGHT_FEED_URL=${NEXT_PUBLIC_SPOTLIGHT_FEED_URL}

# Optional argument to configure Google Drive Picker at build time
ARG NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID}

# Copy development deps and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
ENV NODE_ENV=production
RUN npm run build \
  && npm prune --omit=dev


# Runner
FROM base AS runner
WORKDIR /app

# As user
# an apk version pin breaks the build once Alpine rotates the package
# hadolint ignore=DL3018
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs \
  && apk add --no-cache openssl

# Copy Built app
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/src/server/prisma ./src/server/prisma
# Instead of `COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next`, we only extract some parts, excluding .next/cache which is build time only:
COPY --from=builder --chown=nextjs:nodejs /app/.next/BUILD_ID ./.next/
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/.next/server ./.next/server
COPY --from=builder --chown=nextjs:nodejs /app/.next/types ./.next/types
COPY --from=builder --chown=nextjs:nodejs /app/.next/*.json ./.next/

# Minimal ENV for production
ENV NODE_ENV=production

# Run as non-root user
USER 1001:1001

# Expose port 3000 for the application to listen on
EXPOSE 3000

# Start the application
CMD ["/app/node_modules/.bin/next", "start"]
