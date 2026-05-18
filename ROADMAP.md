# Sparkki — Implementation Roadmap
> Drop this file in the root of your repo. It is the single source of truth for **build order, stack, and phase checklists**. Use it together with:
>
> | Doc | Role |
> |-----|------|
> | **`FEATURES.md`** | Prioritised product backlog after launch (default order: its priority table). |
> | **`DESIGN_SYSTEM.md`** | **Authoritative UI reference** — colours, typography, motion, component recipes. **`app/globals.css`** (`:root` tokens) and **`tailwind.config.ts`** (semantic classes like `text-ink`, `bg-card`) implement it; new UI must match this, not ad-hoc Tailwind grays or legacy light-theme notes found elsewhere in this file. |
> | **`docs/`** | Operations (`docs/operations.md`), public API (`docs/api-public.md`), **site catalog** (`docs/site-pages.md` + `docs/screenshots/`), sitemap notes (`docs/sitemap-routes.md`), **repo layout** (`docs/repository-layout.md`). |

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSG + SSR hybrid. Use server components by default. |
| Language | TypeScript | Strict mode on. |
| Styling | Tailwind CSS v3 | Semantic tokens per **`DESIGN_SYSTEM.md`** / **`app/globals.css`**. Base body **18px** (`globals.css` `body`). |
| Database ORM | Prisma | Schema-first. PostgreSQL (local dev via Docker, prod via Supabase or Railway). |
| Auth (admin) | NextAuth.js | Email/password for admin only. No public user accounts at launch. |
| Payments | Stripe Checkout | Separate products: service tiers, USB stick. |
| Email | Resend | Order confirmations, support tickets. |
| CMS (tutorials) | MDX files + `gray-matter` | Guides in `/content/guides/`; metadata in Prisma. Admin UI writes MDX via server actions (`lib/content/guide-mdx.ts`). *(Historical note: Contentlayer was planned, not shipped.)* |
| Background FX | Three.js (r160+) | Ambient canvas behind all pages. Floating particles / soft geometry. See spec below. |
| i18n | next-intl | FI default. EN secondary. All strings in `/messages/fi.json` and `/messages/en.json`. |
| Analytics | Plausible | Cookieless. No consent banner. GDPR safe. |
| Deployment | Vercel (prod) + local Docker (dev) | |

---

## Feature expansion backlog

Prioritised product specs (11 features: data migration add-on, Sparkki Care, `/koneet` database, spec checker PDF, components transparency, starter kit, Sparkki for Good, group bookings, corporate donations, workshops, annual hardware report) live in **`FEATURES.md`**. Default implementation order is the priority table there unless you are told otherwise. Stack and phases: this file (**`ROADMAP.md`**). UI: **`DESIGN_SYSTEM.md`**.

---

## Design principles

**Visual design:** **`DESIGN_SYSTEM.md`** is the contract for every screen — read it before building or restyling UI. Prefer existing patterns (**`sparkki-*`** primitives, semantic Tailwind from **`tailwind.config.ts`**, tokens from **`app/globals.css`**).

**UX and accessibility (non-negotiable):**

- **Typography:** Follow the design system type scale; the app ships **18px** base body text in **`globals.css`**. Elder-facing surfaces use the **body elder** guidance in **`DESIGN_SYSTEM.md`** (never shrink critical copy below what that table allows).
- **Contrast:** Meet **WCAG AA** on real surfaces (`--text` / `--muted` on `--bg` / `--bg3`, etc.). Validate changed routes with axe / Lighthouse — use semantic colours from the design system, not arbitrary gray ramps.
- **Large tap targets.** Primary actions ~**48px** tall minimum; touch-friendly on mobile (see button recipes in **`DESIGN_SYSTEM.md`**).
- **One action per screen.** Wizard steps never show two competing choices; guide steps stay numbered and one at a time.
- **Three.js ambient only.** Decorative canvas only — never obscures text, respects **`prefers-reduced-motion`**, **`pointer-events: none`**, stacked behind content. **Shipped implementation:** **`components/layout/BackgroundCanvas.tsx`** (mesh colours should track brand greens **`--g` / `--g2`** and **`--amber`** at low opacity, per design system).

**Legacy:** Older light-theme colour examples elsewhere in this file (e.g. white backgrounds, `#1D9E75`) are **not** the current product direction — ignore them for new work.

---

## Three.js ambient background — spec

**Authority:** Behaviour, performance, and colours must match **`DESIGN_SYSTEM.md`** and the checked-in **`components/layout/BackgroundCanvas.tsx`**. The JSX block below is a **legacy reference sketch** only; do not paste it over the real component.

**What it should feel like:** Calm. Slow-floating soft shapes. Subtle wireframe colour that matches **brand greens and amber** on **dark** surfaces. The page must read perfectly with the canvas disabled.

**Implementation:**
- Single `<canvas>` element rendered via **`<BackgroundCanvas />`** (`components/layout/BackgroundCanvas.tsx`).
- Mounted in the root layout behind all content: `position: fixed; inset: 0; z-index: -1; pointer-events: none`.
- Scene: many small icosahedron meshes, drifting slowly. **Colours:** align with **`DESIGN_SYSTEM.md`** brand tokens (e.g. `--g` / `--amber` as mesh tints at low opacity), consistent with the shipped component — not the hex literals in the sketch below.
- Camera: `PerspectiveCamera`, slow drift or near-static. No user interaction.
- Lighting: `AmbientLight` only — no shadows.
- Performance: `requestAnimationFrame` with delta capping (~30fps). Pause when tab is not visible (`document.visibilityState`). Dispose on unmount.
- Reduced motion: respect **`(prefers-reduced-motion: reduce)`** — static or minimal motion when the user requests it.
- **Import:** root layout (see current **`app/`** tree).

```tsx
// LEGACY SKETCH — do not replace BackgroundCanvas.tsx with this verbatim.
// components/layout/BackgroundCanvas.tsx — historical skeleton
'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function BackgroundCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.z = 20

    const geometry = new THREE.IcosahedronGeometry(0.3, 0)
    const meshes: THREE.Mesh[] = []

    for (let i = 0; i < 100; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.85 ? 0xF59E0B : 0x1D9E75,
        transparent: true,
        opacity: 0.08 + Math.random() * 0.12,
        wireframe: true,
      })
      const mesh = new THREE.Mesh(geometry, mat)
      mesh.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
      )
      const s = 0.3 + Math.random() * 1.2
      mesh.scale.setScalar(s)
      ;(mesh as any)._vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.003,
        (Math.random() - 0.5) * 0.003,
        0,
      )
      scene.add(mesh)
      meshes.push(mesh)
    }

    let animId: number
    let last = 0

    const animate = (now: number) => {
      animId = requestAnimationFrame(animate)
      if (now - last < 33) return // cap at ~30fps
      last = now

      if (!reducedMotion) {
        meshes.forEach(m => {
          m.position.add((m as any)._vel)
          m.rotation.x += 0.002
          m.rotation.y += 0.001
          // wrap edges
          if (Math.abs(m.position.x) > 22) (m as any)._vel.x *= -1
          if (Math.abs(m.position.y) > 17) (m as any)._vel.y *= -1
        })
      }

      renderer.render(scene, camera)
    }

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(animId)
      else animId = requestAnimationFrame(animate)
    }

    if (!document.hidden) animId = requestAnimationFrame(animate)
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      renderer.dispose()
    }
  }, [])

  return (
    <canvas
      ref={ref}
      style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}
    />
  )
}
```

---

## Prisma schema

File: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Orders ───────────────────────────────────────────

model Order {
  id             String        @id @default(cuid())
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  status         OrderStatus   @default(PENDING)
  tier           ServiceTier
  supportTier    SupportTier
  deliveryMethod DeliveryMethod
  computerMake   String?
  computerModel  String?
  customerName   String
  customerEmail  String
  customerPhone  String?
  address        String?
  preferredDate  DateTime?
  notes          String?
  stripeSessionId String?
  priceEur       Int           // in cents
  adminNotes     String?
  completedAt    DateTime?
}

enum OrderStatus {
  PENDING
  CONFIRMED
  IN_PROGRESS
  DONE
  CANCELLED
}

enum ServiceTier {
  SSD_BASIC
  SSD_RAM
  FULL_SERVICE
  B2B
}

enum SupportTier {
  FULL
  EMAIL
  DISCORD_ONLY
}

enum DeliveryMethod {
  HOME_PICKUP
  DROP_OFF
  SELF
}

// ─── USB orders ───────────────────────────────────────

model UsbOrder {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  status          String    @default("pending")
  customerName    String
  customerEmail   String
  address         String
  stripeSessionId String?
}

// ─── Computer model backlog ───────────────────────────
// Admin queue for checking compatibility of machine models

model ComputerModel {
  id            String              @id @default(cuid())
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt
  make          String
  model         String
  yearFrom      Int?
  yearTo        Int?
  status        ModelCheckStatus    @default(UNCHECKED)
  compatible    Boolean?
  verdict       String?             // short human-readable reason
  ssdSlot       String?             // e.g. "M.2 NVMe", "2.5\" SATA"
  maxRamGb      Int?
  notes         String?
  checkedBy     String?             // admin user email
  checkedAt     DateTime?

  @@unique([make, model])
}

enum ModelCheckStatus {
  UNCHECKED
  IN_REVIEW
  APPROVED
  REJECTED
}

// ─── Tutorial guides ──────────────────────────────────
// Metadata stored in DB; content lives in MDX files

model Guide {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  slug        String   @unique
  titleFi     String
  titleEn     String?
  descFi      String
  descEn      String?
  category    String   // e.g. "install", "choose", "firstuse"
  difficulty  String   // "easy" | "medium" | "hard"
  minutesFi   Int
  published   Boolean  @default(false)
  order       Int      @default(0)
  videoUrl    String?
  coverImage  String?
}

// ─── Admin users ──────────────────────────────────────

model AdminUser {
  id           String    @id @default(cuid())
  createdAt    DateTime  @default(now())
  email        String    @unique
  username     String?   @unique // optional login beside email (e.g. `admin`)
  name         String?
  passwordHash String
  role         AdminRole @default(EDITOR)
}

enum AdminRole {
  SUPER
  EDITOR
}
```

---

## Admin panel — `/admin`

Protected by NextAuth session. Only `AdminUser` records can log in.

### Pages

```
/admin
├── /admin ..................... Dashboard (stats: orders today, pending, revenue)
├── /admin/orders .............. Order list with filters + status update
├── /admin/orders/[id] ......... Single order detail + admin notes
├── /admin/models .............. Computer model backlog
├── /admin/models/[id] ......... Check and update a single model
├── /admin/guides .............. Guide list + publish toggle
├── /admin/guides/new .......... Create new guide
└── /admin/guides/[slug] ....... Edit guide metadata + MDX content
```

### Order management (`/admin/orders`)
- Table: ID, customer name, tier, status, date, price
- Filter by status (PENDING / IN_PROGRESS / DONE / CANCELLED)
- Click row → detail page
- Detail page: all fields, admin notes textarea, status dropdown, save button
- "Mark done" button sends confirmation email via Resend

### Model backlog (`/admin/models`)
- Table: make, model, year range, status
- Filter: UNCHECKED first (priority queue)
- Click row → check page:
  - Compatible toggle (yes/no)
  - SSD slot input
  - Max RAM input
  - Verdict textarea (shown to users)
  - Notes (internal only)
  - Save → sets status to APPROVED or REJECTED + stamps checkedAt + checkedBy

### Guide editor (`/admin/guides`)
- List of all guides with publish toggle (live switch, no page reload)
- "New guide" → form: slug, title FI/EN, description FI/EN, category, difficulty, minutes, video URL
- MDX content: textarea with live preview split-pane
- On save: writes MDX file to `/content/guides/[slug].mdx` via Node.js `fs` API (server action)
- Publish toggle: updates `Guide.published` in DB

---

## Tutorial content system

Guides use a hybrid approach: **metadata in Prisma DB**, **content in MDX files**.

### File structure
```
content/
└── guides/
    ├── tarkista-levy.mdx
    ├── valitse-ssd.mdx
    ├── asenna-kannettava.mdx
    ├── asenna-poytatietokone.mdx
    ├── asenna-linux-usb.mdx
    ├── siirra-tiedostot.mdx
    └── linux-mint-ensiaskeleet.mdx
```

### MDX frontmatter (redundant with DB — used as fallback)
```mdx
---
slug: tarkista-levy
titleFi: Miten tiedän, onko koneessani HDD vai SSD?
difficulty: easy
minutes: 5
videoUrl: https://youtube.com/watch?v=...
---

## Mitä tarvitset

Vain tietokoneesi — ei työkaluja.

## Vaihe 1 — Avaa levynhallinta

...
```

### How admin creates a new guide
1. Go to `/admin/guides/new`
2. Fill metadata form (slug, titles, difficulty, etc.)
3. Write MDX content in the textarea
4. Click Save → server action creates `/content/guides/[slug].mdx`
5. Toggle published → guide appears on `/itse`

### Contentlayer config
Install: `contentlayer` + `next-contentlayer`

```ts
// contentlayer.config.ts
import { defineDocumentType, makeSource } from 'contentlayer/source-files'

export const Guide = defineDocumentType(() => ({
  name: 'Guide',
  filePathPattern: 'guides/*.mdx',
  contentType: 'mdx',
  fields: {
    slug:       { type: 'string', required: true },
    titleFi:    { type: 'string', required: true },
    difficulty: { type: 'enum', options: ['easy','medium','hard'], required: true },
    minutes:    { type: 'number', required: true },
    videoUrl:   { type: 'string' },
  },
}))

export default makeSource({ contentDirPath: 'content', documentTypes: [Guide] })
```

---

## Site map (updated)

> Example tree uses paths without locale prefix; the App Router lives under `app/[locale]/…`. Production origin is **`NEXT_PUBLIC_SITE_URL`**.

```
/
├── /                    Main page
├── /palvelu             Service detail + order wizard
├── /itse                DIY hub (guides, videos, USB order)
├── /sovellukset         App alternatives directory
├── /tuki                Support page
├── /info                Info + browser try-Linux (noVNC) subsection
├── /about               Company, team, address & contact
├── /tilaus              Order tracking (ID + email)
├── /yhteiso             Community / Discord
└── /admin               Admin panel (protected)
    ├── /admin/orders
    ├── /admin/orders/[id]
    ├── /admin/models
    ├── /admin/models/[id]
    ├── /admin/guides
    ├── /admin/guides/new
    └── /admin/guides/[slug]
```

---

## Project file structure

```
sparkki/   (repository root — historical clones may still use a `vire/` folder name)
├── app/
│   ├── layout.tsx              ← BackgroundCanvas here
│   ├── page.tsx                ← /
│   ├── palvelu/page.tsx
│   ├── itse/page.tsx
│   ├── sovellukset/page.tsx
│   ├── tuki/page.tsx
│   ├── yhteiso/page.tsx
│   └── admin/
│       ├── layout.tsx          ← Auth guard
│       ├── page.tsx            ← Dashboard
│       ├── orders/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── models/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       └── guides/
│           ├── page.tsx
│           ├── new/page.tsx
│           └── [slug]/page.tsx
├── components/
│   ├── BackgroundCanvas.tsx    ← Three.js
│   ├── NavBar.tsx
│   ├── Footer.tsx
│   ├── ui/                     ← Button, Card, Badge, Input, etc.
│   ├── home/                   ← SpeedBar, StepStrip, PricingCards
│   ├── wizard/                 ← OrderWizard steps
│   ├── guides/                 ← GuideCard, VideoGrid
│   ├── apps/                   ← AppGrid, AppAlternativePanel
│   └── admin/                  ← OrderTable, ModelQueue, GuideEditor
├── content/
│   └── guides/                 ← .mdx files
├── data/
│   └── apps.json               ← App alternatives (static)
├── infra/
│   └── try-linux/              ← noVNC reverse proxy (deploy to lab host)
├── lib/
│   ├── prisma.ts               ← Prisma client singleton
│   ├── compatibility.ts        ← Pure function: specs → verdict
│   ├── stripe.ts               ← Stripe helpers
│   └── email.ts                ← Resend templates
├── messages/
│   ├── fi.json
│   └── en.json
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   └── images/
├── styles/
│   └── globals.css
├── contentlayer.config.ts
├── next.config.js
├── tailwind.config.ts
└── .env.local
```

---

## Environment variables

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/sparkki"

# Auth (NextAuth)
NEXTAUTH_SECRET="generate with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Stripe product IDs
STRIPE_PRICE_SSD_BASIC="price_..."
STRIPE_PRICE_SSD_RAM="price_..."
STRIPE_PRICE_FULL_SERVICE="price_..."
STRIPE_PRICE_USB_STICK="price_..."

# Email
RESEND_API_KEY="re_..."

# App
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_DISCORD_INVITE="https://discord.gg/..."

# Admin seed email
ADMIN_EMAIL="admin@sparkki.fi"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="changeme"
```

---

## Implementation phases

---

### Phase 0 — Project scaffold `Week 1–2`

**Goal:** Runnable project with DB, auth, and Three.js background working locally.

- [x] `npx create-next-app@latest vire --typescript --tailwind --app --src-dir no`
- [x] Install deps: `three @types/three prisma @prisma/client next-auth @auth/prisma-adapter next-intl contentlayer next-contentlayer resend stripe @stripe/stripe-js react-hook-form zod`
- [x] `npx prisma init` — configure `schema.prisma` with full schema from this file
- [x] Docker compose for local Postgres:
  ```yaml
  # docker-compose.yml
  services:
    db:
      image: postgres:16
      environment:
        POSTGRES_PASSWORD: password
        POSTGRES_DB: sparkki
      ports:
        - "5432:5432"
  ```
- [x] `npx prisma migrate dev --name init`
- [x] `npx prisma db seed` — seeds one `AdminUser` (`ADMIN_EMAIL`, optional `ADMIN_USERNAME`, `ADMIN_PASSWORD`; default username `admin` / password `changeme`)
- [x] Implement `lib/db/prisma.ts` singleton pattern (prevent hot-reload connection leak)
- [x] Implement `BackgroundCanvas.tsx` with Three.js — see spec above
- [x] Add `BackgroundCanvas` to `app/layout.tsx`
- [x] Verify canvas renders, does not overlap text, respects reduced motion
- [x] Set up next-intl: `messages/fi.json`, `messages/en.json`, middleware
- [x] Set up NextAuth with PrismaAdapter + CredentialsProvider (email/password for admin)
- [x] Admin layout with auth guard: redirect to `/admin/login` if no session
- [x] Deploy to Vercel: connect GitHub repo, set env vars, run first migration

**Deliverable:** `http://localhost:3000` loads with animated background, correct font sizes, FI language. `/admin/login` works.

---

### Phase 1 — Public pages `Week 3–5`

**Goal:** All 5 public pages built and navigable. No backend wiring yet except USB order.

#### Homepage `/`
- [x] Hero section: large headline (text-4xl min), subline, two CTA buttons
- [x] `SpeedBar` component: animated CSS bar showing HDD boot time collapsing to SSD time. Use `IntersectionObserver` to trigger animation on scroll into view. No JS library. *(May 2026 audit: component in `components/home/SpeedBar.tsx` but not mounted on `/` — see **Software audit**.)*
- [x] 1-2-3 step strip: icons (Tabler), short text, large font
- [x] Pricing cards: 3 tiers, each showing price + customer saving badge
- [x] Benefits grid: 4 cards — CO₂ / Cost / Apps / Support
- [x] Trust strip: 90-day support, Verkkokauppa parts, delivery options

#### `/palvelu` — Service detail
- [x] How it works: 5-step visual (stepper component, large numbers)
- [x] `PricingTable` with B2C/B2B toggle — all tiers including "urgent-off" discount
- [x] Support tier comparison: Full / Email-only / Discord-only — what each includes
- [x] `OrderWizard` (see Phase 2 for backend wiring):
  - Step 1: Enter computer make + model (text) or upload spec file
  - Step 2: Compatibility verdict display (use `lib/specs/compatibility.ts`)
  - Step 3: Select service tier
  - Step 4: Select delivery method (3 cards: pickup / drop-off / self)
  - Step 5: Support tier + contact details form
  - Step 6: Summary + "Proceed to payment" → Stripe

#### `/itse` — DIY hub
- [x] `GuideCard` grid: title, difficulty badge (color-coded), time estimate, category icon
- [x] Individual guide page: `app/itse/[slug]/page.tsx` — renders MDX via Contentlayer
- [x] Guide page layout: large step numbers, images, tip boxes, video embed at top if videoUrl set
- [x] `VideoGrid`: YouTube embeds in responsive grid (lazy-load iframes)
- [x] USB stick order card: product image, description, price €9.90, order button → Stripe

#### `/sovellukset` — App alternatives
- [x] Load `data/apps.json` at build time (static, no DB)
- [x] `AppGrid`: icon (Tabler or image), app name, category
- [x] Filter pills: Toimisto / Selain / Sähköposti / Musiikki / Kuvat / Viestintä / Tietoturva / Pelit
- [x] Click app → `AppAlternativePanel` expands inline (accordion, not modal — modal breaks elder UX)
- [x] Panel shows: alternative name, description, "Esiasennettu" badge, link to homepage

#### `/tuki` — Support
- [x] Support tier cards: Full / Email / Discord-only — icons, what's included, price delta
- [x] Urgent-off explanation box: clear text, savings shown
- [x] Contact section: phone number (large), hours, email with response time
- [x] Booking embed: Calendly iframe or simple date-picker form — **`NEXT_PUBLIC_CALENDLY_EMBED_URL`** inline iframe on `/tuki` when set.
- [x] Discord CTA: large button, channel list preview

#### `/yhteiso` — Community
- [x] Discord widget embed (uses Discord widget API: `https://discord.com/widget?id=GUILD_ID`) — when **`NEXT_PUBLIC_DISCORD_WIDGET_GUILD_ID`** is set on `/yhteiso`.
- [x] Community guidelines (short, friendly)
- [x] Link back to `/itse`

**Deliverable:** All public pages navigable. Content readable. Three.js background on all pages.

---

### Phase 2 — Order flow & payments `Week 6–7`

**Goal:** Real orders flow from wizard → Stripe → DB → email confirmation.

- [x] Service order: `app/api/checkout/route.ts` — creates Stripe Checkout session, saves order to DB with status PENDING
- [x] USB order: `app/api/checkout/usb/route.ts` — same pattern
- [x] Stripe webhook: `app/api/webhooks/stripe/route.ts` — handles `checkout.session.completed`, updates order status to CONFIRMED
- [x] Webhook signature verification: `stripe.webhooks.constructEvent()`
- [x] Order confirmation email via Resend: sends on CONFIRMED event
- [x] Support request email: sent when customer submits contact form on `/tuki` — `POST /api/public/support-contact` + **`SUPPORT_NOTIFY_EMAIL`** + Resend.
- [x] `lib/specs/compatibility.ts`: pure function `checkCompatibility(make, model, ramGb, diskType) → { status, reasons, speedGainEstimate }`. Status: 'compatible' | 'borderline' | 'incompatible'. Wire to wizard Step 2.
- [x] Prisma query: look up `ComputerModel` by make+model, return stored verdict if exists

**Deliverable:** Place a test order end-to-end. Stripe test payment succeeds. Email received. Order in DB.

---

### Phase 3 — Admin panel `Week 8–9`

**Goal:** Working admin interface for orders, model backlog, and guide management.

#### Auth
- [x] `app/admin/login/page.tsx` — email + password form (large inputs, accessible)
- [x] NextAuth CredentialsProvider — validates against `AdminUser` table
- [x] Admin layout: sidebar nav (Orders / Models / Guides), logout button, session display

#### Orders (`/admin/orders`)
- [x] Sortable, filterable table: columns = date, customer, tier, status, price (header links; URL `sort` / `dir`)
- [x] Filter bar: status pills (PENDING / IN_PROGRESS / DONE / CANCELLED)
- [x] Search by name or email
- [x] Pagination (25 per page)
- [x] USB orders list — `/admin/usb-orders`
- [x] USB order detail — `/admin/usb-orders/[id]`
- [x] Click row → `/admin/orders/[id]`:
  - All order fields displayed
  - Status dropdown (select + save button)
  - Admin notes textarea (save via submit button)
  - "Send done email" button (triggers Resend)

#### Model backlog (`/admin/models`)
- [x] Table: make, model, year, status — sorted UNCHECKED first
- [x] Filter: UNCHECKED / IN_REVIEW / APPROVED / REJECTED
- [x] "Add model" button → inline form row or modal
- [x] Click row → `/admin/models/[id]`:
  - Compatible toggle (big yes/no buttons)
  - SSD slot, max RAM, verdict text fields
  - Internal notes
  - Save → stamps checkedAt, checkedBy (session email), updates status

#### Guide editor (`/admin/guides`)
- [x] List all guides: title, slug, published toggle (live, calls PATCH API route)
- [x] "New guide" → `/admin/guides/new`:
  - Fields: slug (auto-generated from title, editable), titleFi, titleEn, descFi, descEn, category, difficulty, minutes, videoUrl, order
  - MDX content: `<textarea>` with monospace font, line numbers optional
  - Live preview panel (renders MDX on client using `next-mdx-remote`)
  - Save → server action: write MDX file + upsert `Guide` record in DB
- [x] Edit existing: same form, pre-filled

**Deliverable:** Admin can log in, see all orders, update model backlog, publish a guide.

---

### Phase 4 — Polish, SEO & accessibility `Week 10–11`

- [x] SEO: `generateMetadata()` on all pages. og:image per page (static or dynamic via `next/og`).
- [x] `app/sitemap.ts` — auto-generates sitemap from pages + published guides
- [x] `app/robots.ts` — disallow `/admin`
- [x] Accessibility audit: run `axe-core` in dev. Fix all critical/serious issues.
  - All images have `alt`
  - All forms have `<label>` or `aria-label`
  - Focus ring visible on all interactive elements (add `focus-visible:ring-2 ring-green-600` in Tailwind)
  - Skip-to-content link at top of layout
- [x] Performance: `next/image` on all images. Lazy-load YouTube iframes. Verify Lighthouse ≥ 90.
- [x] Three.js: verify it does not affect LCP or CLS scores. Canvas must not block paint.
- [x] Add Plausible script to `app/layout.tsx`
- [x] Add language toggle (FI/EN) to NavBar — persists via cookie
- [x] Mobile audit: test on 375px viewport. All tap targets ≥ 48px. No horizontal scroll.
- [x] Elder UX review: read every page as if using large text browser zoom (150%). Nothing should break.

---

### Phase 5 — Post-launch `Month 2+`

Planned product expansion (Care subscription, `/koneet`, group bookings, donations, workshops, etc.) is prioritised in **`FEATURES.md`** — implement in the order given there once dependencies in that file’s “Build after” column are satisfied.

- [x] Order tracking page `app/[locale]/tilaus/[id]/page.tsx` (+ hub `/tilaus`) — public lookup by order ID + email; service and USB orders.
- [x] Bulk B2B quote form on `/palvelu` — different flow from single-unit order (`/[locale]/palvelu/b2b`, email via `B2B_QUOTE_NOTIFY_EMAIL` + Resend).
- [x] Expand guide library: all 7 guides written and published (`content/guides/*.mdx` + seed `Guide` rows; FI body / EN titles in DB).
- [x] Sparkki YouTube channel linked everywhere (when `NEXT_PUBLIC_YOUTUBE_CHANNEL_URL` is set: home, footer, community).
- [x] Sparkki Checker desktop app — `apps/sparkki-checker/` (Tauri 2 + Vite). UI imports shared `lib/specs/compatibility.ts` (`checkCompatibility`); output is JSON (`input` + `output`). Run: `cd apps/sparkki-checker && npm install && npm run tauri dev`.
- [x] Switch component sourcing to wholesale (Crucial/Kingston) when volume > 20 units/month — **ops policy**: when fulfilled SSD/RAM component orders average **>20 units/month** for **two consecutive months**, open or renegotiate Crucial/Kingston (or equivalent) wholesale accounts before scaling acquisition; track unit counts in finance/ops; no storefront code change required.
- [x] Admin dashboard stats: revenue chart, orders per week, model approval rate — 7-day order bars + week revenue + approval %.
- [x] Rate limiting on API routes (use `@upstash/ratelimit` or simple IP check) — shared `lib/http/rate-limit.ts` on order lookup + Stripe checkout routes.
- [x] Laptop spec hints from the web — `lib/specs/laptop-specs.ts` + `POST /api/public/laptop-specs`: SearXNG when `SPECS_SEARXNG_BASE_URL` is set + optional local LLM (`SPECS_AI_BASE_URL`, OpenAI-compatible or Ollama). Wired into order wizard (debounced), public order lookup response, and admin order detail.
- [x] **Compatibility check aggregate log (Feature 4 groundwork)** — `POST /api/compatibility` persists anonymous `CompatibilityCheck` rows; admin **`/admin/checks`** (latest 100) + dashboard “checks today” stat.
- [x] **Info hub** — `/{locale}/tietoa/*` sidebar IA (Linux Mint, stability, common concerns, app alternatives Windows/Mac with `sourceOs` on `data/apps.json`). Legacy `/info` → `/tietoa/linux`, `/sovellukset` → `/tietoa/sovellukset/windows`.
- [x] **Sparkki Care landing + subscription** — `/{locale}/care` (tiers + post-90-day timeline); Basic: `POST /api/care/checkout` → Stripe Billing subscription; webhook sync in `lib/billing/care-webhook.ts`; thank-you `/{locale}/care/kiitos`; admin list `/admin/care`. Env: `STRIPE_PRICE_CARE_MONTHLY`.
- [x] **Compatibility database (public)** — `/{locale}/koneet` + `/{locale}/koneet/[slug]` backed by `ComputerModel`; sitemap includes model URLs.
- [x] **Sparkki for Good** — `/{locale}/sparkki-for-good` two-field form (legacy `/{locale}/vire-for-good` → 308); email via **`SPARKKI_FOR_GOOD_NOTIFY_EMAIL`** (or legacy **`VIRE_FOR_GOOD_NOTIFY_EMAIL`**) or fallback **`B2B_QUOTE_NOTIFY_EMAIL`**.
- [x] **Order-time app bundles** — Optional **curated app packs** the customer selects in the **service order wizard** (and pays for if priced): e.g. **local AI** (LLM + tooling), **media creator** pack, **music production** pack, developer essentials, etc. Requires: Prisma/Stripe fields (or JSON on `Order`), wizard UI + pricing in **`lib/billing`**, fulfillment notes for install scripts, admin order detail showing chosen bundles, transactional copy in **`lib/email`**.
- [x] **Portable VM from existing system** — Optional add-on service: create a **portable virtual machine** (or bootable disk image) that captures the **current contents/state of the customer’s machine** before wipe / Linux install (e.g. P2V-style image, OVA/QCOW2, or agreed export format on external storage). Requires: clear **scope & licensing copy** (especially Windows in a VM), **data-handling SLA**, wizard + `Order` fields, priced line item in Stripe, handoff medium (customer USB/NAS vs shipped drive), and admin/fulfillment checklist.

---

### Phase 6 — Browser try-Linux (noVNC) `Lab / post-MVP`

**Goal:** On the public **Tietoa hub** (`/[locale]/tietoa/linux`) and previously `/[locale]/info`, add a subsection where visitors choose **Linux Mint** or **Fedora** and open a **noVNC** session to a disposable / demo desktop on the lab server. Desktop layout and preinstalled apps are intentionally minimal for now; you customize images and VM templates later.

**UX (site):**

- [x] `/info` / **`/tietoa/linux`** — short intro + **“Try Linux in your browser”** subsection with two large choices (Mint | Fedora).
- [x] Each choice opens the noVNC UI in a **new tab** (recommended over embedding: cookies, keyboard capture, and mixed content are simpler).
- [x] URLs come from env (see below) so production can point at HTTPS on your edge while the lab stays on a private IP.

**Infra (separate deployable bundle):**

- [x] Folder **`infra/try-linux/`** — self-contained stack you copy to the lab host (default **`192.168.2.100`**) or to a small DMZ proxy VM.
- [x] **Reverse proxy (nginx)** in front of **websockify** / noVNC:
  - Path-based routes, e.g. **`/try/mint/`** → upstream websockify for the Mint VNC display, **`/try/fedora/`** → upstream for Fedora.
  - **WebSocket** upgrade headers and long `proxy_read_timeout` (VNC sessions are long-lived).
- [x] **Two upstream targets** (defaults in `nginx/default.conf`):
  - Mint: `192.168.2.100:6080` (or `host.docker.internal` / bridge gateway if proxy runs on the same machine as websockify — see `infra/try-linux/README.md`).
  - Fedora: `192.168.2.100:6081`
- [x] **You provide** the actual desktops (VMs or bare-metal sessions) + **TigerVNC/x11vnc** (or equivalent) and **websockify** listening on those ports; the repo ships the **proxy contract** and compose skeleton, not full Mint/Fedora OCI images (those you tailor later). **Runbook:** `infra/try-linux/README.md` § *Demo desktops* and *Snapshots / reset*.

**Environment (Sparkki Next app):**

```bash
# Public base URL of the try-linux proxy (no trailing slash). Example:
# NEXT_PUBLIC_TRY_LINUX_PROXY_BASE="https://try-linux.example.com"
# Lab / local testing (change host to match your proxy):
NEXT_PUBLIC_TRY_LINUX_PROXY_BASE="http://127.0.0.1:8080"
```

noVNC entry URLs are documented in `infra/try-linux/README.md` (typically `.../try/mint/vnc_lite.html` and `.../try/fedora/vnc_lite.html` once paths match nginx).

**Security (non-negotiable before wide exposure):**

- [x] Treat as **lab / demo** only until TLS, auth (even a shared token), and rate limits exist. **Shipped:** optional `TRY_LINUX_ACCESS_TOKEN` + `NEXT_PUBLIC_TRY_LINUX_ACCESS_TOKEN`, per-IP `limit_req` on `/try/*`, Caddy TLS profile (`docker-compose.tls.yml`), Info page security copy.
- [x] Do not expose raw VNC (590x) to the internet; only **websockify + HTTPS** via your proxy. **Documented** in `infra/try-linux/README.md` security checklist + guest bind guidance.
- [x] Plan snapshots / reset of demo VMs after sessions. **Runbook:** `infra/try-linux/README.md` § *Snapshots / reset*.

**Deliverable:** Info page subsection live; `infra/try-linux` documented and `docker compose up` brings up the proxy on a configurable host/port; Mint/Fedora sessions reachable behind it when VNC+websockify are running on the lab.

---

### Review backlog — system audit (rolling)

*Generated from a codebase review. Unchecked items are suggestions or known gaps; prioritize for the next milestones. **May 2026 full verification:** see **Software audit — May 2026** and **Improvement backlog — UX, performance, stability** below.*

### Next up (prioritized)

*Short working queue. Reconcile with checkboxes below; edit this list when items ship.*

- [x] **Site catalog & sitemap** — **`docs/site-pages.md`** (screenshots + page purposes), **`docs/sitemap-routes.md`**, expanded **`app/sitemap.ts`** static paths, **`docs/phases-implementation-notes.md`**, **`docs/screenshots/`** + **`npm run docs:screenshots`**.

**On `main` (rolling, not exhaustive):** Shared CSP in **`content-security-policy.mjs`** with optional **`ENABLE_CSP_REPORT_ONLY`** and **`ENABLE_CSP_ENFORCE`** (**`next.config.mjs`**); browser violations may POST to **`/api/csp-report`** when **`report-uri`** is present (requires **`NEXT_PUBLIC_SITE_URL`** or **`CSP_REPORT_BASE_URL`**). Public API reference: **`docs/api-public.md`**. Ops detail: **`docs/operations.md`** § Content-Security-Policy.

**Design guardrails (ongoing):** Ship UI against **`DESIGN_SYSTEM.md`**; treat **`docs/site-pages.md`** and **`npm run docs:screenshots`** as regression references when navigation or layout changes. When **`FEATURES.md`** items add screens, extend the design system first if new patterns are needed, then implement.

1. **Content-Security-Policy** — **Shipped (baseline):** shared directives, report-only and/or enforcing headers, optional **`report-uri`** + **`POST /api/csp-report`** (see **`docs/operations.md`**). **Still optional:** **`script-src`** without **`'unsafe-inline'`** / **`'unsafe-eval'`** using per-request nonces or hashes, after production validation.
2. **E2E + a11y** — **shipped:** smoke, locale, wizard (mocked checkout), admin login + orders, public routes + **`/meista`**, support + order lookup + experience pages, **axe-core** (**`e2e/a11y-axe.spec.ts`**), **Lighthouse CI** (informational) — see **`e2e/*.spec.ts`**, **`lighthouserc.json`**. Playwright **`webServer`** runs **`prisma migrate deploy`** and **`prisma db seed`** before **`node server.js`** so the e2e DB matches the Prisma client. **Admin laptop-specs flow:** **`e2e/laptop-specs-ai.spec.ts`** (mocked `POST /api/public/laptop-specs`).
3. **Synthetic monitoring** — **shipped in repo:** optional scheduled workflow **`synthetic-monitoring.yml`** when **`SYNTHETIC_MONITORING_BASE_URL`** is set — see **`docs/operations.md`**. External Uptime Kuma / Grafana still recommended.
4. **Admin audit trail** — **shipped:** `AdminAuditLog` + order detail log; guides/models mutations logged; extend UI as needed.
5. **Structured logging** — **shipped:** JSON + request id on checkout, support-contact, Stripe webhook (`lib/logging/log.ts`, **`docs/operations.md`**).
6. **Production image build + Prisma** — **`next build`** may call Prisma. **`docker-compose.yml`** wires **`host.docker.internal:host-gateway`** and a build-time **`DATABASE_URL`** (optional override **`DATABASE_URL_BUILD`**). The **`Dockerfile`** default **`DATABASE_URL`** uses **`host.docker.internal`** for parity with Compose. Use **`npm run docker:build:web`** or start **`db`** before **`docker compose build web`**. **Plain `docker build`** still needs **`--build-arg DATABASE_URL=…`** when the DB is not on the host gateway path. **Alternative:** refactor DB-bound SSG to **`dynamic = 'force-dynamic'`** / client fetch. **Documented:** **`docs/repository-layout.md`** § Known sharp edges; **`README.md`** § App in Docker.
7. **Dependency patch cadence + `npm audit`** — Stay on the latest validated **Next.js 14.2.x**; run **`npm run security:audit:prod`** before releases. The advisory database may still flag **Next** while the installed patch is fixed — cross-check [Next.js security advisories](https://github.com/vercel/next.js/security). Dev-only chains (**Lighthouse CLI**, **eslint-config-next → glob**) may remain reported until upstream releases land.

#### Product / UX (still open from earlier phases)

#### Order wizard & service landing — UX review (May 2026)

*Review of the current `/` service home, home compatibility checker, and `/tilaa` order wizard. Use as a prioritised backlog; check off when shipped.*

**Shipped from this review**

- [x] **Live running total in the order wizard** — sticky bar in the wizard header updates as tier, delivery, HDD, bundles, and portable VM selections change (`WizardLiveTotalBar`, `computeWizardLiveTotal`). Care monthly plans are called out as excluded from the Stripe total.

**High impact (recommended next)**

- [x] **Split wizard step 2 (service)** — Five-step wizard: (1) computer, (2) tier + delivery, (3) support + add-ons, (4) HDD, (5) contact & pay.
- [x] **Human-readable summary on step 4** — Summary uses card labels; “Edit” jumps to the relevant step (`WizardOrderSummary`).
- [x] **Home checker → order continuity** — Sticky “Computer: …” chip with Edit on wizard steps after computer (`WizardComputerChip`).
- [x] **Expand `ComputerModel` coverage** — Admin bulk CSV import on `/admin/models` (`importComputerModelsCsv`, `parse-computer-model-csv.ts`).
- [x] **Wire web specs into home checker (optional)** — `includeWebSpecs` on `POST /api/public/computer-lookup` (5s timeout when `SPECS_*` configured); home checker shows hint block.

**Clarity & trust**

- [x] **Care pricing disclosure** — Care+ / Care Pro cards show `supportCareMonthlyNote` (monthly after delivery, not in checkout).
- [x] **Install-only tier scope** — `tierInstallOnlyExcluded` on the install-only tier card.
- [x] **Delivery price on cards** — All delivery options show `WizardPrice` (+15 € postitus, 0 € pickup/self).
- [x] **No-match path on home checker** — Mailto support button beside “Continue to order” when no verified match.

**Mobile & accessibility**

- [x] **Sticky total + safe area** — Fullscreen wizard header `sticky top-0 pt-safe`; footer `pb-safe`; live total debounced SR announce (`liveTotalSrAnnounce`, 650 ms).
- [x] **Stepper labels on small screens** — Active step name shown under the step dot on mobile (`sm:hidden`); all labels from `sm` up.
- [x] **Focus order in fullscreen wizard** — `focusWizardStepContent` on step change (field → heading); tab trap unchanged; region labelled by step hint.

**Performance & polish**

- [x] **Debounce computer lookup on home** — Shared `COMPUTER_LOOKUP_DEBOUNCE_MS` (450 ms); `ComputerLookupSpecsSkeleton` on home + wizard.
- [x] **Prefetch `/tilaa`** — `RoutePrefetchWarmup` prioritizes `/tilaa`; hover/focus prefetch on nav CTA, hub tab, and home “Continue to order”.
- [x] **Background motion** — `SparkiBackground` static frame + dimmed canvas when `prefers-reduced-motion`; listens for OS setting changes.

**Content / IA**

- [x] **Pricing section on home** — `ServicePricingSection`: four-tier comparison, prices from `TIER_BASE_CENTS`, CTA to `/tilaa` (`#pricing-title` for footer).
- [x] **B2B CTA placement** — `PalveluB2bTeaser`: compact text link after pricing, not a competing card near the checker.

- [x] **App bundles at checkout** — Customizable **software bundles** selected during the consumer order flow (examples: local AI stack, media creator pack, music pack); persisted on the order, visible in admin, reflected in pricing/notes for fulfillment.
- [x] **Portable VM / disk image add-on** — Optional paid step in the order flow: deliver a **VM or image** of the machine’s **pre-service contents** for archival or later use on another host; document format, customer storage, and OS licensing limits in public copy and ops.
- [x] **Booking embed** on `/tuki` — Calendly iframe when **`NEXT_PUBLIC_CALENDLY_EMBED_URL`** is set.
- [x] **Discord widget** on `/yhteiso` — **`NEXT_PUBLIC_DISCORD_WIDGET_GUILD_ID`** + Discord widget iframe.
- [x] **`/tuki` contact form** — `POST /api/public/support-contact`, rate limit, **`SUPPORT_NOTIFY_EMAIL`** + Resend.
- [x] **Admin orders** — search by name/email, pagination (25/page); **`/admin/usb-orders`** lists USB orders.
- [x] **Transactional email i18n** — order / USB / done emails use **`Order.locale`** / **`UsbOrder.locale`** in `lib/email/email.ts`.
- [x] **Global `error.tsx` / `global-error.tsx`** — `app/[locale]/error.tsx` + `app/global-error.tsx`; **`app/[locale]/not-found.tsx`**.
- [x] **Admin USB order detail** — **`/admin/usb-orders/[id]`** from list; customer, address, status, Stripe session.
- [x] **Admin service orders: column sort** — URL `sort` + `dir`; filters + pagination preserved.
- [x] **`POST /api/compatibility` rate limit** — per-IP limit (see `app/api/compatibility/route.ts`).

#### Security & compliance

- [x] **HTTP security headers (baseline)** — `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`; optional **`ENABLE_HSTS=true`** in `next.config.mjs`. **CSP:** optional **`ENABLE_CSP_REPORT_ONLY=true`** (report-only); optional **`ENABLE_CSP_ENFORCE=true`** (enforcing, same directives via **`content-security-policy.mjs`**). Stricter nonce/hash **`script-src`** without **`unsafe-inline`** remains optional (see review backlog § CSP).
- [x] **Distributed rate limiting (optional)** — **`UPSTASH_REDIS_*`** in `lib/http/rate-limit.ts`; else in-memory (see **`docs/api-public.md`**).
- [x] **Stripe webhook idempotency** — **`StripeProcessedEvent`** (`event.id`); duplicate → `deduped`; row removed on handler failure for Stripe retry.
- [x] **Admin audit trail** — optional log of who changed order status, admin notes, model verdicts (who/when/old→new).
- [x] **Privacy / cookies** — **`/[locale]/tietosuoja`** + footer link; extend legally as needed.

#### Reliability & operations

- [x] **Docker `web` healthcheck** — `node -e fetch('/api/health')` in `docker-compose.yml`.
- [x] **Backups & restore drill** — document `pg_dump`/`pg_restore` (or host snapshots) for production Postgres; test restore at least once per quarter. **Runbook:** **`docs/operations.md`** § Database backups.
- [x] **Structured logging** — JSON logs + request/correlation id on API routes and webhook for production debugging.
- [x] **Synthetic monitoring** — ping `/api/health` + one public page from Uptime Kuma / Grafana Cloud / similar.

#### Quality & testing

- [x] **Fix functional test `tests/functional/api-routes.test.ts`** — checkout + support-contact use **`getClientIpFromHeaders(req.headers)`**; tests send **`x-forwarded-for`**. Added **`getClientIpFromHeaders`** unit tests.
- [x] **Expand E2E** — privacy + locale in **`e2e/smoke.spec.ts`**; admin login **`e2e/admin-login.spec.ts`**; admin orders list **`e2e/admin-orders-overview.spec.ts`**; public routes + IA rewrite **`e2e/public-routes.spec.ts`**; order wizard (mocked checkout) **`e2e/wizard-order.spec.ts`** (field fills in the spec).
- [x] **Public API documentation** — **`docs/api-public.md`**.

#### Performance & accessibility

- [x] **CI Lighthouse / axe budgets** (optional gates) — prevent regressions on `/` and `/palvelu` if cost is acceptable in GitHub Actions.
- [x] **Admin i18n** — admin UI uses **`ADMIN_LOCALE`** cookie + **`getAdminMessages()`** (`lib/admin/`) with **`messages/en.json`** `admin` strings; FI/EN switcher in **`app/admin/layout.tsx`**. Legacy hardcoded `fiMessages` imports removed from admin pages.

#### Developer experience

- [x] **`apps/sparkki-checker` LAN + spec/AI docs** — see `apps/sparkki-checker/README.md` (server-side env, Docker/LAN reachability, curl example, future Tauri HTTP scope).
- [x] **`apps/sparkki-checker` optional “fetch specs” UI** — **`VITE_SPARKKI_API_BASE`** (or legacy **`VITE_VIRE_API_BASE`**) enables **Hae speksit verkosta** → `POST /api/public/laptop-specs` (see **`apps/sparkki-checker/README.md`**).
- [x] **Dependency / secret hygiene** — **`npm audit`** in CI (informational / non-blocking); pre-commit secret scan (gitleaks) optional.
- [x] **`docs/repository-layout.md`** — Folder conventions; hub tabs under **`components/navigation/`**; Prisma-at-build caveat for Docker images (**`--build-arg DATABASE_URL`** / **`host.docker.internal`**; see § Known sharp edges).
- [x] **Stripe webhook + order lookup API tests** — **`tests/functional/stripe-webhook.test.ts`** (signature / config paths); **`tests/functional/order-lookup.test.ts`** (validation + 404).

---

## Software audit — May 2026

*Cross-check of implementation phases (0–6), review backlog, and **`FEATURES.md`** priority table. CI was verified locally after `prisma migrate deploy` (functional tests 19/19; unit tests pass). E2E/Lighthouse run in **`.github/workflows/ci.yml`** with Postgres service.*

### Executive summary

| Area | Verdict |
|------|---------|
| **Core launch (Phases 0–4)** | **Shipped** — Next.js app, admin, Stripe checkout/webhook, guides (MDX + Prisma), i18n, Three.js background, rate limits, audit log, CSP baseline, E2E + axe. |
| **Phase 5 post-launch** | **Mostly shipped** — Care checkout, `/koneet/[slug]`, Sparkki for Good, app bundles, portable VM, B2B, order lookup, laptop-specs API, compatibility log. Several **FEATURES.md** items remain **partial** (see gaps). |
| **Phase 6 try-Linux** | **Shipped** — `infra/try-linux/`, env-gated noVNC links on `/tietoa/linux`. |
| **UX review backlog (May 2026)** | **Shipped** — five-step wizard, live total, computer chip, pricing on home, debounced lookup, reduced-motion background. |
| **Docs / roadmap drift** | **Non-trivial** — stack table still says Contentlayer; Phase 1 still describes a six-step wizard and homepage `SpeedBar`; embedded Prisma snippet is stale; **`docs/site-pages.md`** still describes pre–service-landing IA. |

### Verified complete (spot-checked in repo)

- **Payments:** `app/api/checkout/route.ts`, USB checkout, Stripe webhook + `StripeProcessedEvent` idempotency, Care webhook (`lib/billing/care-webhook.ts`).
- **Order wizard:** Five steps in `components/wizard/OrderWizard.tsx`; `WizardLiveTotalBar`, `WizardOrderSummary`, app bundles + portable VM; `/tilaa` + `#palvelu-tilaa` hash on home.
- **Admin:** Orders (sort/filter/paginate), USB orders + detail, models + CSV import, guides publish toggle, Care list, compatibility checks, audit log on order detail, admin FI/EN (`ADMIN_LOCALE`).
- **Public API / ops:** `docs/api-public.md`, `lib/http/rate-limit.ts` (Upstash optional), `POST /api/csp-report`, synthetic monitoring workflow, Docker healthcheck, backup runbook in `docs/operations.md`.
- **Quality:** 14 Playwright specs under `e2e/`; `e2e/a11y-axe.spec.ts`; Lighthouse CI (informational thresholds in `lighthouserc.json`).
- **IA redirects:** `/palvelu` → `/` (308), `/koneet` → `/#yhteensopivuus` (308), `vire-for-good` → `sparkki-for-good` (`middleware.ts`).
- **Design programme:** `BackgroundCanvas.tsx` matches wireframe spec (yellow accent meshes, reduced motion, 30fps cap); `ComponentSourcingSection` on service home.

### Marked done in this file but incomplete or drifted

| Item | Status | Notes |
|------|--------|--------|
| Phase 1 homepage **`SpeedBar`** | **Orphan** | `components/home/SpeedBar.tsx` exists but is **not imported** on `/` or elsewhere. Home uses `PalveluMainContent` + compatibility checker instead. Either mount it (design-system hero widget) or remove dead code and update Phase 1 checkbox narrative. |
| Phase 1 **`OrderWizard` 6 steps** | **Outdated spec** | Live flow is **5 steps** (computer → tier+delivery → support/add-ons → HDD → contact+pay). Step 2 compatibility verdict is folded into **computer lookup**, not a separate step. |
| Stack **Contentlayer** | **Not used** | Guides use **`gray-matter`** + `lib/content/guide-mdx.ts` and `lib/content/guide-content.ts`. Update stack table when convenient; behaviour matches intent. |
| Phase 5 **data migration add-on** | **Backend only** | `Order.dataMigration*` in Prisma + checkout validation + admin + order lookup. **No `<DataMigrationCard />` in the wizard** — customers cannot select migration at checkout (**`FEATURES.md` #1**). |
| **`FEATURES.md` #2 Care lifecycle** | **Partial** | `/care` + Stripe subscription + welcome/payment-failed emails. **Missing:** scheduled day 75/88 upsell emails, `/oma-sparkki` dashboard, monthly tip newsletter, churn flags in admin. |
| **`FEATURES.md` #3 `/koneet` database** | **Partial** | **`/koneet`** hub + search + request form shipped; **`/koneet/[slug]`** has specs, recommended SSD, related models, dynamic OG, view count. **Still open:** ISR, filter pills on hub, `POST` admin notify on request. |
| **`FEATURES.md` #4 PDF checker** | **Not started** | `apps/sparkki-checker` outputs **JSON** only; optional LAN fetch to `POST /api/public/laptop-specs`. No PDF/QR report. |
| **`FEATURES.md` #6 Starter kit** | **Not started** | No product card, Stripe price, `StarterKitOrder`, or `/admin/starter-kit`. |
| **`FEATURES.md` #8–11** | **Backlog** | Group upgrade day, corporate donations, workshops, annual report — correctly **not** in phase checklists; no app routes found. |
| **`docs/site-pages.md`** | **Stale** | Describes “speed strip” on home and standalone `/palvelu`; regenerate screenshots after IA stabilises. |
| Embedded **Prisma schema** (above) | **Stale** | Actual schema adds `locale`, `hddRemoval`, `appBundleIds`, `portableVm*`, `carePackageInterest`, `CareSubscription`, `CompatibilityCheck`, `LaptopSpecsInternetCache`, etc. Treat **`prisma/schema.prisma`** as source of truth. |

### Local dev sharp edge (stability)

Functional tests require migrated DB (`public.Order` etc.). **`npm run test:functional`** fails on a fresh clone until `npx prisma migrate deploy` (CI does this automatically). Document in **`README.md`** or add a Vitest `globalSetup` that skips DB tests when `DATABASE_URL` is unset.

---

## Improvement backlog — UX, performance, stability (May 2026)

*Prioritised suggestions from the audit above. Pick items into the “Next up” queue when planning sprints; cross-link **`FEATURES.md`** for product-sized work.*

### UX — conversion, clarity, trust

| Priority | Item | Rationale |
|----------|------|-----------|
| **P0** | **Data migration card in order wizard** | Schema + Stripe line items exist; without UI, Feature 1 does not reduce checkout fear. Add step-3 card per **`FEATURES.md`**; include prep checklist in confirmation email. |
| **P0** | **Reconcile `/koneet` IA** | Middleware sends `/koneet` → home anchor while sitemap still emits `/koneet/[slug]` URLs. Either restore a dedicated search hub or noindex detail pages until content is rich; avoid confusing SEO + user bookmarks. |
| **P1** | **Mount or retire `SpeedBar`** | Strong emotional proof on design system; currently unused. Prefer home section below hero with `IntersectionObserver` animation per **`DESIGN_SYSTEM.md`**. |
| **P1** | **Richer `/koneet/[slug]` pages** | **Shipped** — recommended SSD, boot-time estimate, order CTA, related models, dynamic OG, request-check form on `/koneet`. |
| **P1** | **Care lifecycle automation** | Cron/worker (Vercel cron, Inngest, or external scheduler): day 75/88 emails tied to `Order.completedAt`; link to `/care`. Reduces manual ops. |
| **P2** | **`/oma-sparkki` magic-link dashboard** | **Shipped** — HMAC link, request-by-email, cancel at period end, Stripe billing portal, Discord + Calendly cards. |
| **P2** | **Starter kit checkout** | **Shipped** — `StarterKitOrder`, `/api/checkout/starter-kit`, `/itse` product card, `/admin/starter-kit`. |
| **P2** | **Sync `docs/site-pages.md` + screenshots** | Run `npm run docs:screenshots` after IA freeze; fix copy (service landing at `/`, `/tilaa` wizard). |
| **P3** | **Transformation gallery** | Product vision “before/after stories” still partial (`TransformationCard` only). Optional marketing page under `/tietoa/galleria` or home section. |

### Performance — perceived speed and cost

| Priority | Item | Rationale |
|----------|------|-----------|
| **P1** | **`/koneet/[slug]` data fetching** | Detail page loads **all** `computerModel` rows then filters in memory (`findMany` + `.find`). Replace with `findFirst` by slug or add DB `slug` + unique index. |
| **P1** | **Sitemap build at scale** | Same full-table `findMany` for every model on each sitemap generation. Paginate or cache; consider excluding `UNCHECKED` models from public sitemap. |
| **P2** | **Lighthouse performance budget** | CI threshold is **0.65** (warn). Target **≥0.80** on `/` and `/tilaa`: audit Three.js mesh count on mobile, `next/image` for any hero assets, reduce client JS on home (wizard already lazy). |
| **P2** | **Laptop-specs cache hygiene** | **Shipped** — `GET /api/cron/specs-cache-cleanup` (daily). |
| **P2** | **Admin models list** | **Shipped** — server-side search (`q`) + pagination (50/page) on `/admin/models`. |
| **P3** | **ISR / static generation for approved models** | FEATURES spec called for ISR on detail pages; today fully dynamic. Regenerate on `ComputerModel` update webhook from admin save. |

### Stability — correctness, security, operations

| Priority | Item | Rationale |
|----------|------|-----------|
| **P0** | **Require `UPSTASH_REDIS_*` in production** | In-memory rate limits do not work across Vercel/serverless instances; document as required for checkout, support-contact, compatibility POST. |
| **P1** | **Vitest DB guard** | **Shipped** — `tests/functional/global-setup.ts` + `requireMigratedDatabase()` before functional tests when `DATABASE_URL` is set. |
| **P1** | **Stripe webhook replay tests** | Extend `stripe-webhook.test.ts` with care subscription + duplicate-event idempotency fixtures. |
| **P1** | **Order PENDING cleanup** | Abandoned Checkout sessions leave `PENDING` orders; scheduled job to mark stale (>24h) as cancelled or archive for admin clarity. |
| **P2** | **CSP hardening path** | Baseline shipped with `unsafe-inline` / `unsafe-eval`. Plan nonce-based `script-src` after production violation reports stabilize (`docs/operations.md`). |
| **P2** | **Try-Linux production checklist** | Enforce TLS + token in prod env; add synthetic check that `NEXT_PUBLIC_TRY_LINUX_PROXY_BASE` responds (optional workflow input). |
| **P2** | **Webhook failure alerting** | Structured logs exist; add alert on repeated Stripe handler errors or `StripeProcessedEvent` delete+retry loops. |
| **P3** | **Prisma ↔ ROADMAP schema sync** | Replace embedded schema block in this file with “see `prisma/schema.prisma`” to prevent agent confusion. |
| **P3** | **E2E: data migration + Care subscribe** | Extend wizard spec once migration UI ships; Care checkout with Stripe test clock (or mocked session). |

### Suggested “next up” queue (May 2026)

*Shipped in repo (May 2026): wizard data migration UI; `/koneet` hub restored + `ComputerModel.slug` + indexed lookup; Upstash production guard + stale-order cron; Care day 75/88 cron + emails; `SpeedBar` on home; optional photo attach on model checker; richer `/koneet/[slug]` (specs, OG image, related models, request-check form); Vitest DB guard for `test:functional`.*

1. **Stricter CSP** (nonces) after production violation reports stabilize.  
2. **Monthly Care tip newsletter** cron + template.  
3. **PDF spec checker** (`apps/sparkki-checker` report export).  
4. **ISR** for `/koneet/[slug]` when model catalog stabilises.

*Shipped (May 2026 continuation): `/oma-sparkki` magic-link dashboard; Starter Kit checkout + admin; specs-cache cleanup cron; admin models search + pagination.*

---

## Agent instructions — general rules

These apply to every coding session on this project.

1. **Read this file first.** Before writing any code, confirm you know which phase you're working on. For post-launch product expansion, also read **`FEATURES.md`** and follow its priority table unless instructed otherwise.
2. **Read `DESIGN_SYSTEM.md` for all UI/CSS.** Before adding or changing layouts, colours, typography, or components, align with that file and existing primitives (**`sparkki-*`**, semantic Tailwind). Do not introduce light-theme or generic gray-scale layouts unless **`DESIGN_SYSTEM.md`** is updated first.
3. **Prisma is the DB layer.** Never write raw SQL. Always use `prisma.model.findMany()` etc.
4. **Server components by default.** Only add `'use client'` when the component needs browser APIs or event handlers.
5. **All text goes through next-intl.** No hardcoded Finnish or English strings in JSX. Use `const t = useTranslations('namespace')`.
6. **Font size floor: 18px body, 16px minimum anywhere** for critical UI (see **`DESIGN_SYSTEM.md`** and **`globals.css`** `body`).
7. **Three.js canvas is `z-index: -1`, `pointer-events: none`.** It must never intercept clicks or cover text.
8. **Stripe webhook must verify signature** before touching the DB. Non-negotiable.
9. **`lib/specs/compatibility.ts` is a pure function.** No DB calls inside it. Accept specs as arguments, return verdict.
10. **Admin routes must check session** at the top of every page and API route. Use a shared `requireAdmin()` helper.
11. **MDX files are source of truth for guide content.** DB stores metadata and publish state only.
12. **No `any` in TypeScript** except in the Three.js mesh velocity hack (documented inline).
13. **Tailwind only for styling.** No inline `style={{}}` except for Three.js canvas positioning.
14. **Test Stripe with test keys** (`sk_test_`, `pk_test_`) in development. Never commit real keys.
15. **Seed script** must be idempotent: running it twice should not create duplicate records.

---

## Data files

### `data/apps.json` — structure

```json
[
  {
    "id": "ms-word",
    "name": "Microsoft Word",
    "category": "toimisto",
    "icon": "file-text",
    "alternatives": [
      {
        "name": "LibreOffice Writer",
        "descFi": "Ilmainen, avoin toimisto-ohjelma. Lukee ja tallentaa .docx-tiedostoja.",
        "descEn": "Free and open source. Reads and saves .docx files.",
        "url": "https://libreoffice.org",
        "preinstalled": true
      }
    ]
  }
]
```

Categories: `toimisto` | `selain` | `sahkoposti` | `musiikki` | `kuvat` | `viestinta` | `tietoturva` | `pelit`

Minimum 15 apps at launch — see bundled app ideas in **`FEATURES.md`** and **`data/apps.json`**.

---

## Prisma seed

```ts
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@sparkki.fi'

  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, name: 'Admin', role: 'SUPER' },
  })

  // Seed a few computer models to start the backlog
  const models = [
    { make: 'Lenovo', model: 'ThinkPad T450', yearFrom: 2015, yearTo: 2016 },
    { make: 'Dell', model: 'Latitude E6440', yearFrom: 2013, yearTo: 2015 },
    { make: 'HP', model: 'ProBook 450 G3', yearFrom: 2016, yearTo: 2017 },
    { make: 'Asus', model: 'VivoBook 15', yearFrom: 2018, yearTo: 2020 },
    { make: 'Acer', model: 'Aspire 5', yearFrom: 2019, yearTo: 2021 },
  ]

  for (const m of models) {
    await prisma.computerModel.upsert({
      where: { make_model: { make: m.make, model: m.model } },
      update: {},
      create: m,
    })
  }

  console.log('Seed complete.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
```

Add to `package.json`:
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

---

## Quick start (for agents)

```bash
# 1. Clone repo and install
npm install

# 2. Skim DESIGN_SYSTEM.md if you will touch UI (tokens, typography, components)

# 3. Start local Postgres
docker compose up -d

# 4. Copy env
cp .env.example .env.local
# Fill in DATABASE_URL and other vars

# 5. Run migrations + seed
npx prisma migrate dev --name init
npx prisma db seed

# 6. Start dev server
npm run dev

# 7. Open admin
# http://localhost:3000/admin/login
# Email: value of ADMIN_EMAIL in .env.local
```
