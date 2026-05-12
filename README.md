# Vire

Next.js site for Vire — refurbishment, DIY guides, orders, and admin tools.

## Local development

### Database with Docker

Postgres and **automatic Prisma migrations** are part of the default Compose stack:

```bash
docker compose up -d
```

This starts `db`, waits until it is healthy, then runs the one-shot **`migrate`** service (`prisma migrate deploy`). Copy `.env.example` to `.env` / `.env.local` and keep `DATABASE_URL` aligned with `POSTGRES_*` (defaults match `docker-compose.yml`).

Run the app on the host (default **http://localhost:1337**):

```bash
npm install
npx prisma generate
npm run dev
```

Seed admin + guides (optional):

```bash
npx prisma db seed
```

### App in Docker (production-like)

Build and run the Next.js standalone image after migrations (site on host port **1337** by default):

```bash
docker compose --profile app up -d --build
```

The `web` container waits for **`migrate`** to finish, then starts (the entrypoint also runs `prisma migrate deploy`).

Open **http://localhost:1337** (set `APP_PORT` / `NEXT_PUBLIC_SITE_URL` / `NEXTAUTH_URL` in `.env` if you use another host or port).

### Deploy to a lab host (e.g. 192.168.2.100)

From your dev machine (SSH + rsync), after copying `.env` on the server under `/srv/vire/`:

```bash
export DEPLOY_HOST=192.168.2.100
export DEPLOY_PATH=/srv/vire
# optional: export DEPLOY_USER=you
./scripts/deploy-lab.sh
```

See `scripts/deploy-lab.sh` for rsync excludes. On the server, set at least `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` to `http://192.168.2.100:1337` (or your DNS) so auth and redirects work.

### Environment variables

See [`.env.example`](./.env.example) for `DATABASE_URL`, auth, Stripe, email, and public URLs.

### Vire Checker (Tauri desktop)

Local compatibility tool using the same pure logic as the site (`lib/specs/compatibility.ts`). Lives in `apps/vire-checker/`.

**LAN / SearXNG / local LLM:** spec hints run on the **Vire Next.js server** (`lib/specs/laptop-specs.ts`), not inside the desktop app. See **`apps/vire-checker/README.md`** for which env vars to set on the server, Docker reachability to e.g. `192.168.2.101:8080`, and optional future Tauri + API wiring.

Install [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) for your OS (on Linux: WebKitGTK, build essentials, etc.), then:

```bash
cd apps/vire-checker
npm install
npm run tauri dev
```

`npm run build` builds the Vite frontend only (no native binary).

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
