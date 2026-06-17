FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

# ── Workspace deps (cached layer) ────────────────────────────────────────────
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY server/package.json server/pnpm-workspace.yaml ./server/
COPY client/package.json ./client/
RUN pnpm install --frozen-lockfile

# ── Build client ─────────────────────────────────────────────────────────────
FROM deps AS client-build
COPY client ./client
RUN pnpm --filter client build

# ── Build server ─────────────────────────────────────────────────────────────
FROM deps AS server-build
COPY server ./server
RUN pnpm --filter server db:generate && pnpm --filter server build

# ── Production image ──────────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
ENV NODE_ENV=production

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY server/package.json server/pnpm-workspace.yaml ./server/
COPY client/package.json ./client/
RUN pnpm install --frozen-lockfile --prod

COPY server/prisma ./server/prisma
COPY server/prisma.config.ts ./server/
RUN pnpm --filter server db:generate

COPY --from=server-build /app/server/dist ./server/dist
COPY --from=client-build /app/client/dist ./client/dist

EXPOSE 3000
CMD ["sh", "-c", "cd server && pnpm prisma migrate deploy && node dist/app.js"]
