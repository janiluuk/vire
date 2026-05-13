# Routes vs `sitemap.xml`

- **`/sitemap.xml`** lists **public** URLs only (per-locale, `getSiteUrl()` base). Admin is **disallowed** in [`app/robots.ts`](../app/robots.ts) and must not be indexed.
- **Redirects** (`/info` → `/tietoa/linux`, `/sovellukset` → `/tietoa/sovellukset/windows`, legacy admin path) are omitted from the sitemap; crawlers should follow targets.

## Public — static (in `STATIC_PATHS` in [`app/sitemap.ts`](../app/sitemap.ts))

| Path | Notes |
|------|--------|
| `/` | Home |
| `/palvelu` | Service + wizard |
| `/palvelu/b2b` | B2B |
| `/palvelu/kiitos` | Thank-you after checkout |
| `/itse` | DIY hub |
| `/itse/kiitos` | DIY thank-you |
| `/tuki` | Support |
| `/tietosuoja` | Privacy |
| `/tilaus` | Order lookup |
| `/tietoa` | Learn overview |
| `/tietoa/hyodyt` | Benefits |
| `/tietoa/linux` | Upgrade process |
| `/tietoa/vakaus` | Stability & comfort |
| `/tietoa/huolia` | Common concerns |
| `/tietoa/sovellukset/windows` | Apps Windows |
| `/tietoa/sovellukset/mac` | Apps Mac |
| `/care` | Vire Care |
| `/care/kiitos` | Care thank-you |
| `/koneet` | Compatibility search |
| `/sparkki-for-good` | Social discount |
| `/meista` | About (canonical public URL; rewrites to `about` route) |
| `/meista/yhteiso` | Community (canonical; rewrites to `yhteiso` route) |

## Public — dynamic (added in `sitemap()` when DB available)

| Pattern | Source |
|---------|--------|
| `/itse/[slug]` | Published guides (`prisma.guide`) |
| `/koneet/[slug]` | Computer models (`prisma.computerModel`) |

## Admin (reference only — **not** in sitemap)

| Path |
|------|
| `/admin/login` |
| `/admin` |
| `/admin/orders` |
| `/admin/orders/[id]` |
| `/admin/models` |
| `/admin/models/[id]` |
| `/admin/guides` |
| `/admin/guides/new` |
| `/admin/guides/[slug]` |
| `/admin/usb-orders` |
| `/admin/usb-orders/[id]` |
| `/admin/care` |
| `/admin/ai-testing` |

## API (not in sitemap)

Health, checkout, webhooks, public laptop-specs, etc. — machine endpoints, not HTML sitemap entries.
