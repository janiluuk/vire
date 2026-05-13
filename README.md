# Vire

Next.js site for Vire — refurbishment, DIY guides, orders, and admin tools.

## Local development

### Database with Docker

Postgres, **one-shot migrate**, and the **Next.js** app are the default Compose stack:

```bash
docker compose up -d --build
```

On first run, **`--build`** builds the `web` image. This starts **`db`**, runs **`migrate`** when the DB is healthy, then starts **`web`** on **http://localhost:1337** (override the host port with **`APP_PORT`** in `.env`).

To run only Postgres for host-based **`npm run dev`**:

```bash
docker compose up -d db
```

Copy **`.env.example`** to **`.env`**, set secrets and **`DATABASE_URL`** if needed (`.env` is gitignored). Optional **`.env.local`** can override single keys.

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

Same as above — **`docker compose up -d --build`** is the full stack (Postgres, one-shot migrate, Next.js `web`). The `web` entrypoint runs **`prisma migrate deploy`** on start, then **`node server.js`** (listen **0.0.0.0:3000** inside the container; host port **`1337`** by default via **`APP_PORT`**).

Open **http://localhost:1337/fi** (or **http://127.0.0.1:1337/fi**). Quick checks:

```bash
docker compose ps
curl -sS http://127.0.0.1:1337/api/health
```

If the browser cannot connect but `web` is running, confirm nothing else is bound to **`1337`**, and that **`NEXTAUTH_URL`** / **`NEXT_PUBLIC_SITE_URL`** in `.env` match how you reach the machine (for remote hosts use the LAN or public URL, not `localhost`).

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
