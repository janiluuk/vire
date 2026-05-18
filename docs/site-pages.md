# Site pages (mini catalog)

Screenshots are full-page captures from a seeded dev environment. Regenerate with **`npm run docs:screenshots`** (see [`screenshots/README.md`](./screenshots/README.md)). Visual design of these pages is defined in **[`DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md)** — use this catalog for IA and regression comparison, not as the primary spec for colours or typography.

**Service cluster** (`/palvelu`, `/palvelu/b2b`, `/koneet`, `/care`, `/tilaus`) shares a horizontal **tab row** under the global header (same interaction pattern as **Learn** `/tietoa/*`). The top bar keeps a single **Palvelu** tab for that whole cluster; the primary **Tilaa** control stays a separate button.

Paths below omit the locale prefix (`/fi/…` and `/en/…` mirror the same structure).

---

## Public — Finnish (examples)

| Page | Path | Purpose |
|------|------|---------|
| Home | `/` | Service landing: hero, transformation story, **SpeedBar** (boot-time comparison), compatibility checker, pricing, CTAs. |
| Learn hub | `/tietoa` | Overview of why Linux refresh, Mint/Fedora, links deeper. |
| Benefits | `/tietoa/hyodyt` | Privacy, value, games, stability framing. |
| Upgrade process | `/tietoa/linux` | What happens after the device arrives; OS & hardware picks; HDD note. |
| Stability & comfort | `/tietoa/vakaus` | Calm-update / comfort narrative. |
| Common concerns | `/tietoa/huolia` | FAQ-style objections before switching. |
| Apps (Windows) | `/tietoa/sovellukset/windows` | Windows → Linux app alternatives. |
| Apps (Mac) | `/tietoa/sovellukset/mac` | macOS → Linux app alternatives. |
| Service | `/palvelu` | Order wizard entry, packages, delivery. |
| B2B | `/palvelu/b2b` | Business / volume contact. |
| Service thank-you | `/palvelu/kiitos` | Post-checkout thank-you. |
| DIY hub | `/itse` | Published guides list. |
| DIY thank-you | `/itse/kiitos` | After-guide action thank-you. |
| Example guide | `/itse/tarkista-levy` | Sample MDX guide page (slug varies). |
| Support | `/tuki` | Contact, Calendly embed when configured. |
| Compatibility | `/koneet` | Searchable list of verified models (links to `/koneet/[slug]`). Home checker remains at `/#yhteensopivuus`. |
| Company | `/meista` | About Sparkki (rewrites internally to `/about`). |
| Community | `/meista/yhteiso` | Discord / YouTube / guidelines. |
| Sparkki for Good | `/sparkki-for-good` | Discount application. Legacy `/vire-for-good` redirects. |
| Sparkki Care | `/care` | Subscription landing. |
| Care thank-you | `/care/kiitos` | Post–Sparkki Care checkout. |
| Privacy | `/tietosuoja` | Privacy policy. |
| Order lookup | `/tilaus` | Look up order status. |

### Screenshots (FI)

![Home](./screenshots/public/fi-home.png)

![Learn hub](./screenshots/public/fi-tietoa-hub.png)

![Benefits](./screenshots/public/fi-tietoa-hyodyt.png)

![Upgrade process](./screenshots/public/fi-tietoa-linux.png)

![Stability & comfort](./screenshots/public/fi-tietoa-vakaus.png)

![Common concerns](./screenshots/public/fi-tietoa-huolia.png)

![Apps — Windows](./screenshots/public/fi-tietoa-apps-windows.png)

![Apps — Mac](./screenshots/public/fi-tietoa-apps-mac.png)

![Service](./screenshots/public/fi-palvelu.png)

![B2B](./screenshots/public/fi-palvelu-b2b.png)

![Service thank-you](./screenshots/public/fi-palvelu-kiitos.png)

![DIY hub](./screenshots/public/fi-itse.png)

![DIY thank-you](./screenshots/public/fi-itse-kiitos.png)

![Example guide](./screenshots/public/fi-itse-guide-example.png)

![Support](./screenshots/public/fi-tuki.png)

![Compatibility](./screenshots/public/fi-koneet.png)

![Company](./screenshots/public/fi-meista.png)

![Community](./screenshots/public/fi-yhteiso.png)

![Sparkki for Good](./screenshots/public/fi-sparkki-for-good.png)

![Sparkki Care](./screenshots/public/fi-care.png)

![Care thank-you](./screenshots/public/fi-care-kiitos.png)

![Privacy](./screenshots/public/fi-tietosuoja.png)

![Order lookup](./screenshots/public/fi-tilaus-lookup.png)

---

## Public — English (samples)

| Page | Path | Purpose |
|------|------|---------|
| Home | `/` | Same structure as FI. |
| Learn hub | `/tietoa` | EN copy of overview. |
| Service | `/palvelu` | EN service / wizard. |

![EN home](./screenshots/public/en-home.png)

![EN Learn](./screenshots/public/en-tietoa-hub.png)

![EN Service](./screenshots/public/en-palvelu.png)

---

## Admin (not in `sitemap.xml`; `robots.txt` disallows `/admin`)

| Page | Path | Purpose |
|------|------|---------|
| Login | `/admin/login` | Credentials sign-in. |
| Dashboard | `/admin` | Welcome / shortcuts. |
| Orders | `/admin/orders` | Order list. |
| Models | `/admin/models` | Compatibility model records. |
| Guides | `/admin/guides` | DIY guide metadata. |
| New guide | `/admin/guides/new` | Create guide. |
| USB orders | `/admin/usb-orders` | USB stick orders. |
| Care | `/admin/care` | Care subscription admin. |
| AI testing | `/admin/ai-testing` | Internal AI tools page. |

Detail routes (`/admin/orders/[id]`, `/admin/models/[id]`, `/admin/guides/[slug]`, `/admin/usb-orders/[id]`) are dynamic; capture manually if needed.

![Admin login](./screenshots/admin/admin-login.png)

![Admin dashboard](./screenshots/admin/admin-dashboard.png)

![Admin orders](./screenshots/admin/admin-orders.png)

![Admin models](./screenshots/admin/admin-models.png)

![Admin guides](./screenshots/admin/admin-guides.png)

![New guide](./screenshots/admin/admin-guides-new.png)

![USB orders](./screenshots/admin/admin-usb-orders.png)

![Admin Care](./screenshots/admin/admin-care.png)

![AI testing](./screenshots/admin/admin-ai-testing.png)
