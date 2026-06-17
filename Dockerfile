FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.7.0 --activate

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

# ── Production deploy bundle (prod deps only, no lockfile --prod conflict) ───
FROM deps AS prod-deploy
COPY server ./server
RUN pnpm --filter server deploy --prod --legacy /prod && \
    cd /prod && node_modules/.bin/prisma generate

# ── Production runtime ────────────────────────────────────────────────────────
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=prod-deploy /prod ./server
COPY --from=server-build /app/server/dist ./server/dist
COPY --from=client-build /app/client/dist ./client/dist

EXPOSE 3000
CMD ["sh", "-c", "cd server && node_modules/.bin/prisma migrate deploy && node dist/app.js"]
