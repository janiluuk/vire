# Vire

Next.js site for Vire — refurbishment, DIY guides, orders, and admin tools.

**Repository layout** (where to add routes, components, and docs): [`docs/repository-layout.md`](docs/repository-layout.md).

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

Seed admin + guides (optional). Set **`ADMIN_EMAIL`**, **`ADMIN_PASSWORD`**, and optionally **`ADMIN_USERNAME`** in **`.env`** (see **`.env.example`**) so `/admin` login matches your machine and e2e:

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

From your dev machine (SSH + rsync): **`scripts/lab-stack-up.sh`** copies the repo to the server — including **`.env`** when it exists in your project root (`.env.local` / `.env.*.local` stay local-only), runs **`docker compose down`**, **`docker compose build --pull`**, then **`docker compose up -d`**.

```bash
export DEPLOY_HOST=192.168.2.100
export DEPLOY_PATH=/srv/vire
# optional: export DEPLOY_USER=root
./scripts/deploy-lab.sh
```

Ensure **`.env`** has **`NEXTAUTH_URL`** and **`NEXT_PUBLIC_SITE_URL`** set to how you reach the host (e.g. `http://192.168.2.100:1337`, not `localhost`) before syncing. For a clean rebuild: `./scripts/deploy-lab.sh --no-cache`.

### Environment variables

See [`.env.example`](./.env.example) for `DATABASE_URL`, auth, Stripe, email, public URLs, try-Linux proxy, and admin seed fields (**`ADMIN_EMAIL`**, **`ADMIN_PASSWORD`**, optional **`ADMIN_USERNAME`**, etc.).

**Design system:** [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) is the UI contract (colours, type, components); **`app/globals.css`** and **`tailwind.config.ts`** implement its tokens. **`ROADMAP.md`** instructs agents to read it before any UI work.

**UI reference:** full-page captures of public + admin routes live in [`docs/screenshots/`](docs/screenshots/README.md); regenerate with **`npm run docs:screenshots`** (requires a running app and seeded admin). Use with **`docs/site-pages.md`** to see what each route is for.

### Tests and CI

- **`npm run test`** — Vitest unit tests plus functional tests (`vitest.functional.config.ts`).
- **`npm run test:e2e`** — Ensures **`.next/standalone/server.js`** exists (runs **`npm run build`** if not), then **Playwright** runs **`prisma migrate deploy`** and starts **`node server.js`** on **`http://127.0.0.1:1337`**. Free **port 1337** first, or stop **`docker compose` `web`** / **`npm run dev`**. To attach to a server you already started on that port, set **`PLAYWRIGHT_REUSE_SERVER=1`**.
- **`npm run lh:ci`** — Lighthouse budgets via **`lighthouserc.json`**; the standalone app must already be listening on **1337** (same assumption as the CI Lighthouse step).

**GitHub Actions** (`.github/workflows/ci.yml`) runs **E2E before Lighthouse** so Playwright and Lighthouse never compete for **:1337** in the same job. In CI, Playwright also enables **`reuseExistingServer`** when **`CI=true`** so a stray listener on **1337** does not hard-fail the run.

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
