# Site screenshots

PNG captures of public (Finnish + sample English) and **admin** pages for **QA and visual regression** alongside **[`DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md)** (the authoritative UI spec).

## Regenerate

1. Start the app with a **seeded database** (admin user must exist), e.g.  
   `docker compose up -d` **or** `npm run dev` with `DATABASE_URL` + `npx prisma db seed`.
2. From the repo root:

```bash
# optional: override URL or admin credentials
export DOCS_SCREENSHOT_BASE_URL=http://127.0.0.1:1337
export ADMIN_EMAIL=admin@vire.fi
export ADMIN_PASSWORD=changeme

npm run docs:screenshots
```

Outputs under **`public/`** and **`admin/`** subfolders (full-page PNGs, ~1400×900 viewport).

If admin login fails, only **`admin/admin-login.png`** is updated; fix credentials or seed and re-run.

## Contents

| Path pattern | Description |
|--------------|-------------|
| `public/fi-*.png` | Finnish locale pages |
| `public/en-*.png` | Sample English pages |
| `admin/*.png` | Admin UI (login + post-auth screens) |

Do not commit real production secrets; the script only uses env for login at capture time.

## See also

- **[`../site-pages.md`](../site-pages.md)** — What each page is for (uses these images).
- **[`../sitemap-routes.md`](../sitemap-routes.md)** — Which URLs appear in `sitemap.xml` vs admin-only.
- **[`../repository-layout.md`](../repository-layout.md)** — Where scripts and app folders live.
