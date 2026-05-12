# Vire — Implementation Roadmap
> Drop this file in the root of your repo. It is the single source of truth for build order, tech decisions, and agent instructions.

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSG + SSR hybrid. Use server components by default. |
| Language | TypeScript | Strict mode on. |
| Styling | Tailwind CSS v3 | High contrast tokens. Large base font (18px). |
| Database ORM | Prisma | Schema-first. PostgreSQL (local dev via Docker, prod via Supabase or Railway). |
| Auth (admin) | NextAuth.js | Email/password for admin only. No public user accounts at launch. |
| Payments | Stripe Checkout | Separate products: service tiers, USB stick. |
| Email | Resend | Order confirmations, support tickets. |
| CMS (tutorials) | MDX files + Contentlayer | Guides live in `/content/guides/`. Frontmatter-driven. Admin can add via UI or directly. |
| Background FX | Three.js (r160+) | Ambient canvas behind all pages. Floating particles / soft geometry. See spec below. |
| i18n | next-intl | FI default. EN secondary. All strings in `/messages/fi.json` and `/messages/en.json`. |
| Analytics | Plausible | Cookieless. No consent banner. GDPR safe. |
| Deployment | Vercel (prod) + local Docker (dev) | |

---

## Feature expansion backlog

Prioritised product specs (11 features: data migration add-on, Vire Care, `/koneet` database, spec checker PDF, components transparency, starter kit, Vire for Good, group bookings, corporate donations, workshops, annual hardware report) live in **`FEATURES.md`**. Default implementation order is the priority table there unless you are told otherwise. Stack and phases: this file (**`ROADMAP.md`**). UI: **`DESIGN_SYSTEM.md`**.

---

## Design principles

These are non-negotiable and apply to every page and component. **Canonical tokens, typography, motion, and component recipes** live in **`DESIGN_SYSTEM.md`** — read that file before building or restyling UI.

- **Font size minimum 18px body.** Never go below 16px anywhere. Elder users are a primary audience.
- **High contrast.** WCAG AA minimum, aim for AAA on body text. Use Tailwind `text-gray-900` on white, never gray-on-gray.
- **Bright, clear palette.** Primary: Vire green `#1D9E75`. Accent: amber `#F59E0B`. Background: white or very light gray `#F9FAFB`. Never pastels or muted tones for important UI.
- **Large tap targets.** Buttons minimum 48px tall. Touch-friendly on mobile.
- **One action per screen.** Wizard steps never have two choices visible at once. Guide steps are numbered and one at a time.
- **Three.js ambient only.** The canvas is decorative — it never overlaps text, never animates aggressively, respects `prefers-reduced-motion`. Use `pointer-events: none` and `z-index: -1`.

---

## Three.js ambient background — spec

**What it should feel like:** Calm. Slow-floating soft shapes. Subtle color that matches the Vire green/white palette. The page reads perfectly with it disabled.

**Implementation:**
- Single `<canvas>` element rendered via a `<BackgroundCanvas />` React component.
- Mounted in the root layout behind all content: `position: fixed; inset: 0; z-index: -1; pointer-events: none`.
- Scene: 80–120 small icosahedron or sphere meshes, random sizes (0.1–0.5 units), drifting slowly in 3D space. Color: `#1D9E75` at 15–25% opacity, occasional amber `#F59E0B` at 10% opacity.
- Camera: `PerspectiveCamera`, slow auto-rotate or no rotation. No user interaction.
- Lighting: `AmbientLight` only — no shadows.
- Performance: use `requestAnimationFrame` delta capping at 30fps. Pause when tab is not visible (`document.visibilityState`). Destroy on unmount.
- Reduced motion: wrap entire animation in `if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches)`. If reduced motion is on, render static canvas with one centered soft shape.
- File location: `components/layout/BackgroundCanvas.tsx`. Import in `app/layout.tsx`.

```tsx
// components/layout/BackgroundCanvas.tsx — skeleton
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
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  email     String   @unique
  name      String?
  role      AdminRole @default(EDITOR)
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

```
vire.fi/
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
vire/
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
DATABASE_URL="postgresql://postgres:password@localhost:5432/vire"

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
ADMIN_EMAIL="admin@vire.fi"
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
        POSTGRES_DB: vire
      ports:
        - "5432:5432"
  ```
- [x] `npx prisma migrate dev --name init`
- [x] `npx prisma db seed` — seeds one AdminUser (from `ADMIN_EMAIL` env)
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
- [x] `SpeedBar` component: animated CSS bar showing HDD boot time collapsing to SSD time. Use `IntersectionObserver` to trigger animation on scroll into view. No JS library.
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
- [x] Vire YouTube channel linked everywhere (when `NEXT_PUBLIC_YOUTUBE_CHANNEL_URL` is set: home, footer, community).
- [x] Vire Checker desktop app — `apps/vire-checker/` (Tauri 2 + Vite). UI imports shared `lib/specs/compatibility.ts` (`checkCompatibility`); output is JSON (`input` + `output`). Run: `cd apps/vire-checker && npm install && npm run tauri dev`.
- [x] Switch component sourcing to wholesale (Crucial/Kingston) when volume > 20 units/month — **ops policy**: when fulfilled SSD/RAM component orders average **>20 units/month** for **two consecutive months**, open or renegotiate Crucial/Kingston (or equivalent) wholesale accounts before scaling acquisition; track unit counts in finance/ops; no storefront code change required.
- [x] Admin dashboard stats: revenue chart, orders per week, model approval rate — 7-day order bars + week revenue + approval %.
- [x] Rate limiting on API routes (use `@upstash/ratelimit` or simple IP check) — shared `lib/http/rate-limit.ts` on order lookup + Stripe checkout routes.
- [x] Laptop spec hints from the web — `lib/specs/laptop-specs.ts` + `POST /api/public/laptop-specs`: SearXNG when `SPECS_SEARXNG_BASE_URL` is set + optional local LLM (`SPECS_AI_BASE_URL`, OpenAI-compatible or Ollama). Wired into order wizard (debounced), public order lookup response, and admin order detail.

---

### Phase 6 — Browser try-Linux (noVNC) `Lab / post-MVP`

**Goal:** On the public **Info** page (`/[locale]/info`), add a subsection where visitors choose **Linux Mint** or **Fedora** and open a **noVNC** session to a disposable / demo desktop on the lab server. Desktop layout and preinstalled apps are intentionally minimal for now; you customize images and VM templates later.

**UX (site):**

- [x] `/info` — short intro + **“Try Linux in your browser”** subsection with two large choices (Mint | Fedora).
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

**Environment (Vire Next app):**

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

*Generated from a codebase review. Unchecked items are suggestions or known gaps; prioritize for the next milestones.*

### Next up (prioritized)

*Short working queue. Reconcile with checkboxes below; edit this list when items ship.*

1. **Content-Security-Policy** — **`ENABLE_CSP_REPORT_ONLY=true`** emits report-only CSP from **`next.config.mjs`**; tighten policy using violation reports (**`docs/operations.md`**). Enforcing CSP with nonces still open.
2. **E2E** — **Shipped:** order wizard happy path with mocked checkout in **`e2e/wizard-order.spec.ts`** (Playwright fills make/model and contact fields). Admin login: **`e2e/admin-login.spec.ts`**.
3. **Synthetic monitoring** — external ping of `/api/health` + one public page — **runbook:** **`docs/operations.md`** (Docker healthcheck already in compose).
4. **Admin audit trail** — **shipped:** `AdminAuditLog` + order detail log; guides/models mutations logged; extend UI as needed.
5. **Structured logging** — **shipped:** JSON + request id on checkout, support-contact, Stripe webhook (`lib/logging/log.ts`, **`docs/operations.md`**).

#### Product / UX (still open from earlier phases)

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

- [x] **HTTP security headers (baseline)** — `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`; optional **`ENABLE_HSTS=true`** in `next.config.mjs`. **CSP:** optional **`ENABLE_CSP_REPORT_ONLY=true`** (report-only); enforcing strict CSP still open.
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
- [x] **Expand E2E** — privacy + locale in **`e2e/smoke.spec.ts`**; admin login **`e2e/admin-login.spec.ts`**; order wizard (mocked checkout) **`e2e/wizard-order.spec.ts`** (field fills in the spec).
- [x] **Public API documentation** — **`docs/api-public.md`**.

#### Performance & accessibility

- [ ] **CI Lighthouse / axe budgets** (optional gates) — prevent regressions on `/` and `/palvelu` if cost is acceptable in GitHub Actions.
- [ ] **Admin i18n** — admin UI is FI-only via `fiMessages`; move strings to next-intl or add EN for bilingual operators.

#### Developer experience

- [x] **`apps/vire-checker` LAN + spec/AI docs** — see `apps/vire-checker/README.md` (server-side env, Docker/LAN reachability, curl example, future Tauri HTTP scope).
- [ ] **`apps/vire-checker` optional “fetch specs” UI** — call Vire `POST /api/public/laptop-specs` when a base URL is configured (needs Tauri HTTP allowlist + env such as `VITE_VIRE_API_BASE`).
- [ ] **Dependency / secret hygiene** — `npm audit` in CI (informational or gated); pre-commit secret scan (gitleaks) optional.

---

## Agent instructions — general rules

These apply to every coding session on this project.

1. **Read this file first.** Before writing any code, confirm you know which phase you're working on. For post-launch product expansion, also read **`FEATURES.md`** and follow its priority table unless instructed otherwise.
2. **Prisma is the DB layer.** Never write raw SQL. Always use `prisma.model.findMany()` etc.
3. **Server components by default.** Only add `'use client'` when the component needs browser APIs or event handlers.
4. **All text goes through next-intl.** No hardcoded Finnish or English strings in JSX. Use `const t = useTranslations('namespace')`.
5. **Font size floor: 18px body, 16px minimum anywhere.** Use `text-lg` as the base in Tailwind (18px).
6. **Three.js canvas is `z-index: -1`, `pointer-events: none`.** It must never intercept clicks or cover text.
7. **Stripe webhook must verify signature** before touching the DB. Non-negotiable.
8. **`lib/specs/compatibility.ts` is a pure function.** No DB calls inside it. Accept specs as arguments, return verdict.
9. **Admin routes must check session** at the top of every page and API route. Use a shared `requireAdmin()` helper.
10. **MDX files are source of truth for guide content.** DB stores metadata and publish state only.
11. **No `any` in TypeScript** except in the Three.js mesh velocity hack (documented inline).
12. **Tailwind only for styling.** No inline `style={{}}` except for Three.js canvas positioning.
13. **Test Stripe with test keys** (`sk_test_`, `pk_test_`) in development. Never commit real keys.
14. **Seed script** must be idempotent: running it twice should not create duplicate records.

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

Minimum 15 apps at launch — see full list in `vire-implementation-spec.md`.

---

## Prisma seed

```ts
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@vire.fi'

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

# 2. Start local Postgres
docker compose up -d

# 3. Copy env
cp .env.example .env.local
# Fill in DATABASE_URL and other vars

# 4. Run migrations + seed
npx prisma migrate dev --name init
npx prisma db seed

# 5. Start dev server
npm run dev

# 6. Open admin
# http://localhost:3000/admin/login
# Email: value of ADMIN_EMAIL in .env.local
```
