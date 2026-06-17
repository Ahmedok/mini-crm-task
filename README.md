# Mini CRM

> Made by Assylzhan Sarinov (Ahmedok)

A simple CRM. React + Vite frontend served as static files from an Express + Prisma backend, all on a single port.

---

## Prerequisites

- **Local dev:** Docker & Docker Compose (for the database container)
- **Production (LXC):** Docker & Docker Compose; an external reverse proxy (nginx, Caddy, Traefik, etc.) pointed at the LXC on port 3000

---

## Local Development

```bash
# 1. Start the database
docker compose up -d db

# 2. Copy env and run first migration
cp .env.example server/.env
# Edit server/.env if your local DB credentials differ
cd server && pnpm prisma migrate dev --name init

# 3. From the repo root — starts server (port 3000) + client (port 5173) together
cd .. && pnpm dev
```

The Vite dev server proxies `/api` requests to Express, so no CORS config is needed.

---

## Production Deploy (LXC)

```bash
# 1. Clone and enter the repo
git clone <repo> mini-crm && cd mini-crm

# 2. Create .env from the example and set real credentials
cp .env.example .env
# Edit .env — at minimum change POSTGRES_PASSWORD

# 3. Build and start
docker compose up -d --build
```

Prisma migrations run automatically on container start before the server boots.
The app is then available on **port 3000**.

### Reverse proxy

Point your proxy at `http://<lxc-ip>:3000`. Example Caddy snippet:

```
crm.example.com {
    reverse_proxy localhost:3000
}
```

The server trusts the `X-Forwarded-*` headers set by the proxy (Express `trust proxy` is enabled).

---

## API Reference

| Method | Path | Body / Params | Response |
|--------|------|---------------|----------|
| GET | `/api/applications` | `?status=NEW\|IN_PROGRESS\|DONE` | `200` array |
| POST | `/api/applications` | `{ clientName, phone, equipmentType, comment?, status? }` | `201` object |
| PATCH | `/api/applications/:id` | any subset of the POST fields | `200` object |
| DELETE | `/api/applications/:id` | — | `204` |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | `crm` | PostgreSQL username |
| `POSTGRES_PASSWORD` | *(required)* | PostgreSQL password |
| `POSTGRES_DB` | `crm` | PostgreSQL database name |
| `PORT` | `3000` | Port the server listens on |
