# syntax=docker/dockerfile:1
FROM node:20-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
# postinstall runs `prisma generate` — schema must exist before npm ci
COPY prisma ./prisma
RUN npm ci

FROM node:20-bookworm-slim AS builder
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Overridden by docker-compose `build.args.DATABASE_URL` (default reaches host-mapped db via host.docker.internal).
ARG DATABASE_URL=postgresql://postgres:password@localhost:5432/vire
ENV DATABASE_URL=$DATABASE_URL
# Public site origin + Calendly (inlined at build; see docs/calendly-booking.md)
ARG NEXT_PUBLIC_SITE_URL=
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_CALENDLY_EMBED_DOMAIN=
ENV NEXT_PUBLIC_CALENDLY_EMBED_DOMAIN=$NEXT_PUBLIC_CALENDLY_EMBED_DOMAIN
# Public Calendly URL for /tuki (inlined at build; see docs/calendly-booking.md)
ARG NEXT_PUBLIC_CALENDLY_EMBED_URL=
ENV NEXT_PUBLIC_CALENDLY_EMBED_URL=$NEXT_PUBLIC_CALENDLY_EMBED_URL
RUN npx prisma generate
RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
RUN npm install -g prisma@5.22.0
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/content ./content
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/package.json ./package.json
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh && chown -R nextjs:nodejs /app/prisma /app/content docker-entrypoint.sh
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
