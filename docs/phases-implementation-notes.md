# Phases & follow-ups

Stack phases **0–6** in **`ROADMAP.md`** are largely shipped (scaffold, public site, orders, admin, SEO/a11y, try-Linux lab). Product expansion after launch is ordered in **`FEATURES.md`** (data migration add-on, Vire Care Stripe, compatibility DB, etc.). **All UI** must follow **`DESIGN_SYSTEM.md`** (tokens in **`app/globals.css`**); **`docs/site-pages.md`** + screenshots are a visual regression reference alongside that spec.

This repo iteration adds:

- **`docs/site-pages.md`** — What each major page is for, with screenshots.
- **`docs/sitemap-routes.md`** — Inventory of public vs admin vs dynamic routes vs `sitemap.xml`.
- **Expanded `app/sitemap.ts`** — All static public routes (including thank-you pages and `/meista` canonical URLs).

Next engineering priorities from **`ROADMAP.md` → Next up`**: tighten CSP from report-only to enforced (nonces), continue E2E/a11y coverage, then pick from **`FEATURES.md`** by priority table.
