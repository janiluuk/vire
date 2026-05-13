# Repository layout

Where code and assets live, and where to add new work. **Next.js App Router** rules apply: only `app/`, `public/`, `middleware.ts`, and a few root config files are special-cased by the framework.

## Top level

| Path | Purpose |
|------|---------|
| **`app/`** | Routes: `app/[locale]/` (public i18n site), `app/admin/`, `app/api/`, root `layout.tsx`, `globals.css`, `sitemap.ts`, `robots.ts`. |
| **`components/`** | React components imported by routes and by each other. |
| **`lib/`** | Server utilities: DB (`lib/db`), auth, email, specs, HTTP helpers, logging, site SEO helpers. No JSX. |
| **`i18n/`** | `routing.ts`, `navigation.ts` (typed `Link`, `usePathname`). |
| **`messages/`** | `fi.json` / `en.json` — all user-facing copy (public + admin namespaces). |
| **`content/`** | MDX guides + frontmatter (source for DIY content). |
| **`prisma/`** | Schema, migrations, seed. |
| **`scripts/`** | Deploy (`lab-stack-up.sh`), tooling (`docs-screenshots.ts`), etc. |
| **`e2e/`** | Playwright specs. |
| **`tests/`** | Vitest unit + functional tests. |
| **`docs/`** | Operations, API notes, site catalog, screenshots, **this file**. |
| **`infra/`** | Try-Linux proxy and related lab infra. |
| **`apps/vire-checker/`** | Tauri desktop app (own `package.json`; excluded from root `tsconfig` bundle). |
| **`data/`** | Static JSON (e.g. app alternatives catalog). |
| **`types/`** | Ambient / shared `.d.ts` (e.g. NextAuth module augmentation). |

Spec / planning docs at repo root: **`ROADMAP.md`**, **`FEATURES.md`**, **`DESIGN_SYSTEM.md`**.

## `components/` conventions

| Directory | Contents |
|-----------|----------|
| **`components/layout/`** | Site chrome: `NavBar`, `Footer`, `BackgroundCanvas`, `DeliveryStripGate`, etc. |
| **`components/navigation/`** | **Hub tab strips** shared across route groups: `InfoHubLayout` (Learn), `AboutHubTabs`, `ServiceHubTabs` (service cluster). Prefer adding new hub tabs here, not under `layout/`. |
| **`components/tietoa/`** | Learn-topic **page content** (e.g. `AppOsTabs`, article sections). |
| **`components/admin/`** | Admin UI. |
| **`components/wizard/`**, **`components/care/`**, **`components/usb/`**, … | Feature-scoped UI for those flows. |

## Known sharp edges

1. **`next build` and Prisma** — Some static pages call Prisma during the build. If `DATABASE_URL` is unset or points at a DB that is not reachable from the **Docker build** container (e.g. `localhost:5432` with no DB), you may see Prisma errors in build logs; the build can still complete when pages degrade gracefully. For reproducible image builds, point `DATABASE_URL` at a reachable DB during `docker compose build`, or refactor data-heavy SSG to dynamic routes. Tracked in **`ROADMAP.md`** (review backlog).
2. **`@/*` imports** — TypeScript path alias maps to the repo root (`tsconfig.json`). Prefer `@/components/...`, `@/lib/...` over deep relatives.

## Related docs

- [`site-pages.md`](./site-pages.md) — public/admin routes + screenshots  
- [`sitemap-routes.md`](./sitemap-routes.md) — sitemap vs dynamic routes  
- [`operations.md`](./operations.md) — deploy, backups, monitoring  
- [`../README.md`](../README.md) — local dev, tests, env  
