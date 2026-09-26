# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1


FROM base AS deps

ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile


FROM base AS builder

ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL=/api/v1
ARG NEXT_PUBLIC_USE_API=true
ARG NEXT_PUBLIC_FILES_BASE_URL=/files
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_USE_API=$NEXT_PUBLIC_USE_API
ENV NEXT_PUBLIC_FILES_BASE_URL=$NEXT_PUBLIC_FILES_BASE_URL

RUN pnpm build


FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]