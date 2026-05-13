# Phases & follow-ups

Stack phases **0–6** in **`ROADMAP.md`** are largely shipped (scaffold, public site, orders, admin, SEO/a11y, try-Linux lab). Product expansion after launch is ordered in **`FEATURES.md`** (data migration add-on, Sparkki Care, compatibility DB, etc.). **All UI** must follow **`DESIGN_SYSTEM.md`** (tokens in **`app/globals.css`**); **`docs/site-pages.md`** + screenshots are a visual regression reference alongside that spec.

This repo iteration adds:

- **`docs/site-pages.md`** — What each major page is for, with screenshots.
- **`docs/sitemap-routes.md`** — Inventory of public vs admin vs dynamic routes vs `sitemap.xml`.
- **Expanded `app/sitemap.ts`** — All static public routes (including thank-you pages and `/meista` canonical URLs).

Ongoing priorities from **`ROADMAP.md`** (Review backlog): CSP **baseline** is in repo (report-only and/or enforcing via env; optional **`report-uri`** → **`/api/csp-report`** — see **`docs/operations.md`**). **Optional next:** stricter **`script-src`** (nonces/hashes). Docker **`web`** image builds may need an explicit **`DATABASE_URL`** at build time — see **`docs/repository-layout.md`** § Known sharp edges. Then pick from **`FEATURES.md`** by priority table.
