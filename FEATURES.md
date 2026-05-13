# Sparkki — Feature Expansion Spec

> For coding agents. Cross-reference **`ROADMAP.md`** for stack decisions and **`DESIGN_SYSTEM.md`** for all UI rules.  
> Each feature is self-contained. Build them in priority order unless instructed otherwise.

---

## Priority order

| # | Feature | Effort | Impact | Build after |
|---|---|---|---|---|
| 1 | Data migration add-on | Low | High | Phase 1 order wizard |
| 2 | Sparkki Care subscription | Medium | Very high | Phase 2 payments |
| 3 | Verified compatibility database | Medium | High | Phase 3 checker |
| 4 | Spec checker app (PDF report) | Medium | High | Phase 3 checker |
| 5 | Component sourcing transparency | Low | Medium | Phase 1 service page |
| 6 | Starter kit product | Low | Medium | Phase 2 USB order |
| 7 | Sparkki for Good social tier | Low | Medium | Phase 2 pricing |
| 8 | Group / neighbourhood upgrade day | Medium | Medium | Phase 4 post-launch |
| 9 | Corporate device donation pipeline | High | Very high | Phase 5 |
| 10 | Workshop programme | Medium | Medium | Phase 5 |
| 11 | Annual hardware report | Low | Medium | Phase 5 (data-dependent) |

---

## Feature 1 — Data migration add-on

### What it is

An optional €35–50 service add-on in the order wizard. Sparkki migrates the customer's files, bookmarks, email settings, and photos from their old Windows installation to Linux Mint before the original drive is wiped. Removes the single biggest emotional barrier to conversion: fear of losing everything.

### Why it matters

Many customers abandon the order flow at the point where they realise their data might be at risk. This add-on converts those abandoners by removing the fear entirely. It adds 30–45 min of labour per order, but at €35–50 it is profitable and increases average order value significantly.

### User flow

1. Step 3 of the order wizard (after tier selection) — new optional card appears: "Haluatko siirtää tiedostosi?" (Do you want to migrate your files?)
2. Card shows: what gets migrated (files, photos, documents, bookmarks, email settings), what does not (installed Windows applications), and the price (€35 standard / €50 for large data >100GB).
3. Customer selects Yes or No. Selection persists through checkout.
4. If Yes: order confirmation email includes a "Tiedonsiirto-ohje" (data prep guide) — a numbered checklist the customer completes before drop-off: know your Windows login password, know your email password, have a list of bookmarks you use.
5. Admin panel shows "Data migration: Yes" on the order detail page as a prominent badge.

### Database changes

```prisma
model Order {
  // ... existing fields ...
  dataMigration      Boolean  @default(false)
  dataMigrationSize  String?  // "standard" | "large"
  dataMigrationNotes String?  // admin field for what was migrated
}
```

### UI components

- `<DataMigrationCard />` — optional add-on card in wizard Step 3
  - Two options: "Kyllä, siirrä tiedostoni" (+€35) / "Ei kiitos" (no change)
  - Includes a collapsible "Mitä sisältyy?" (What's included?) accordion
  - Selecting "large" option triggers a note field: "Tiedostojen koko yli 100 GB? Valitse tämä."
- `<MigrationBadge />` — shown in admin order detail, coloured amber if migration is included

### Pricing

| Option | Price | Labour est. | Margin |
|---|---|---|---|
| Standard migration (<100 GB) | €35 | 30–40 min | ~€15–20 |
| Large migration (>100 GB) | €50 | 45–60 min | ~€20–25 |

### Content needed

- Data prep checklist email template (Finnish + English)
- "Mitä siirretään?" FAQ section on `/palvelu`
- Admin checklist for what to migrate and how to verify

---

## Feature 2 — Sparkki Care subscription

### What it is

An optional recurring support subscription that activates after the included 90-day support period expires. Customers pay €7.90/month and receive: ongoing remote help, priority Discord, OS update notifications, and an annual health check call. Transforms Sparkki from a one-time transaction business into a recurring revenue model.

### Why it matters

A customer who subscribes to Sparkki Care has a lifetime value of €94.80/year on top of the original order. At 50 subscribers this is €4,740/year in predictable recurring revenue — enough to fund a part-time support role. Churn will be low because the alternative (paying for ad-hoc tech support) costs €50–80/hour.

### User flow

**Onboarding:**

1. 75 days after order completion (15 days before support expires), Sparkki sends an automated email: "Tukesi päättyy 15 päivän kuluttua. Jatka Sparkki Care -tilauksella."
2. Email links to `/care` — a dedicated landing page explaining the subscription.
3. Customer clicks "Tilaa Sparkki Care" → Stripe subscription checkout (monthly, cancel anytime).
4. On successful subscription: customer record updated, care dashboard unlocked at `/oma-vire`.

**Ongoing:**

- Monthly: customer receives a newsletter with one Linux Mint tip and a reminder of their subscription benefits.
- Quarterly: automated "koneesi terveys" (computer health) email with a simple self-assessment checklist.
- Annually: a 30-min scheduled call offered via Calendly booking link.
- Anytime: priority #vire-care channel in Discord (invite sent on subscription).

**Cancellation:**

- Cancel anytime via `/oma-vire` dashboard or by emailing tuki@vire.fi.
- On cancellation: subscription ends at period end, customer notified, downgraded to Discord-only.

### Database changes

```prisma
model CareSubscription {
  id                String    @id @default(cuid())
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  customerEmail     String    @unique
  customerName      String
  orderId           String?   // linked original order
  status            CareStatus @default(ACTIVE)
  stripeSubId       String    @unique
  currentPeriodEnd  DateTime
  cancelledAt       DateTime?
  notes             String?   // admin field
}

enum CareStatus {
  ACTIVE
  CANCELLED
  PAUSED
}
```

### Stripe setup

- Create a Stripe Product: "Sparkki Care"
- Create a Stripe Price: €7.90/month, recurring
- Store price ID in env: `STRIPE_PRICE_CARE_MONTHLY`
- Webhook events to handle:
  - `customer.subscription.created` → create `CareSubscription` record
  - `customer.subscription.deleted` → update status to CANCELLED
  - `invoice.payment_failed` → send payment failed email, flag in admin
  - `invoice.paid` → update `currentPeriodEnd`

### New pages

- `/care` — landing page: benefits, price, "cancel anytime" reassurance, CTA to subscribe
- `/oma-vire` — customer dashboard (no login required — access via magic link sent to email):
  - Subscription status + next billing date
  - Cancel button (confirms with "Are you sure?" modal)
  - Link to priority Discord channel
  - Calendly booking link for annual call
  - Download: original order summary PDF

### Admin changes

- `/admin/care` — list of all Care subscribers with status, billing date, churn risk flag
- Churn risk flag: automatically set if `currentPeriodEnd` is within 7 days and no recent Discord activity
- Manual "send retention email" button per subscriber

### Email templates (Resend)

1. Day 75: "Tukesi päättyy pian" — soft upsell to Care
2. Day 88: "Tukesi päättyy 2 päivän kuluttua" — final reminder
3. Subscription confirmation: welcome to Care, Discord invite, Calendly link
4. Monthly tip newsletter: one Linux tip + subscription reminder
5. Annual health check: self-assessment checklist + booking link
6. Payment failed: friendly notice, link to update card
7. Cancellation confirmation: sad to see you go, re-subscribe anytime link

### Pricing rationale

| Scenario | Monthly | Annual |
|---|---|---|
| 20 subscribers | €158 | €1,896 |
| 50 subscribers | €395 | €4,740 |
| 100 subscribers | €790 | €9,480 |
| 200 subscribers | €1,580 | €18,960 |

---

## Feature 3 — Verified compatibility database

### What it is

A public searchable database at `/koneet` listing every computer model Sparkki has physically verified. Each entry shows: compatibility status, SSD slot type, max RAM, estimated boot time after upgrade, and recommended components. Every model page is a unique SEO landing page.

### Why it matters

Doubles as the backend for the order wizard compatibility checker AND a major SEO asset. A page titled "Lenovo ThinkPad T450 — SSD-päivitys, yhteensopivuus, ohjeet" will rank for that search query organically and convert visitors directly into orders. Competitors cannot replicate it quickly because real physical verification is required.

### URL structure

```
/koneet                          → search page
/koneet/lenovo-thinkpad-t450     → model detail page
/koneet/dell-latitude-e6440      → model detail page
/koneet/[make]-[model-slug]      → dynamic route
```

### Database — existing `ComputerModel` model is the source

(Already defined in `ROADMAP.md` Prisma schema — extend as below.)

```prisma
model ComputerModel {
  // ... existing fields ...
  slug          String?   @unique  // URL-safe: "lenovo-thinkpad-t450"
  recommendedSsd String?           // e.g. "Samsung 870 EVO 500GB"
  ssdShopUrl    String?            // Verkkokauppa product URL
  estimatedBootSec Int?            // after upgrade, in seconds
  publicNotes   String?            // shown to users (not admin-only)
  viewCount     Int       @default(0)
}
```

### Search page `/koneet`

- Search input: type make/model → debounced live search via API route
- Filter pills: Yhteensopiva ✓ / Rajatapaus ⚠ / Ei suositeltu ✗
- Results grid: card per model showing make, model, year range, compatibility badge, SSD slot
- "Ei löydy? Pyydä tarkistusta" CTA — opens a simple form: make, model, email → creates an UNCHECKED `ComputerModel` record and notifies admin

### Model detail page `/koneet/[slug]`

Statically generated at build time for all APPROVED/REJECTED models. ISR (Incremental Static Regeneration) with 24h revalidation.

**Page sections:**

1. Hero: make + model name, compatibility badge (large, colour-coded), year range
2. Specs summary: SSD slot, max RAM, estimated boot time after upgrade
3. Recommended component: SSD name + Verkkokauppa link (opens in new tab)
4. Step-by-step mini-guide (3 steps: check, upgrade, install) with links to full `/itse` guides
5. Order CTA: "Haluatko että Sparkki tekee tämän puolestasi?" → pre-fills order wizard with this model
6. Related models: other Lenovo ThinkPads, or same-era Dell equivalents

**SEO:**

- `generateMetadata()` per model: title = "[Make] [Model] — SSD-päivitys, Linux Mint, yhteensopivuus | Sparkki"
- description = "Sparkki on tarkistanut [Make] [Model]:n yhteensopivuuden. [Compatibility verdict]. SSD-paikka: [slot]. Päivitys maksaa [price] €."
- og:image: dynamic image via `next/og` showing model name + compatibility badge + Sparkki logo

### Admin changes — `/admin/models/[id]`

Add new fields to the check form:

- Recommended SSD (text input)
- Verkkokauppa product URL (text input)
- Estimated boot time after upgrade (number input, seconds)
- Public notes (textarea — shown to users)
- Slug (auto-generated from make+model, editable)
- "Generate page preview" button — opens `/koneet/[slug]` in new tab

### API routes

```
GET /api/models/search?q=[query]     → returns matching models (name, slug, status)
GET /api/models/[slug]               → single model detail (used by ISR page)
POST /api/models/request             → submit a model check request
PATCH /api/models/[id]/view          → increment view count (fire and forget)
```

---

## Feature 4 — Spec checker app (PDF compatibility report)

### What it is

A downloadable Windows/Mac application (built with Tauri) that automatically reads the computer's specs and generates a "Sparkki Compatibility Report" PDF. The report is shareable, includes a QR code linking to a pre-filled order, and gives Sparkki aggregate data on Finland's hardware landscape.

### Why it matters

Removes the friction of manual spec entry entirely. The PDF report is a shareable artefact — people forward it to family, IT managers print it for a meeting. The QR code creates a tracked conversion path. The aggregate data has grant application value.

### Architecture

```
Tauri app (Rust + web frontend)
  └── reads: CPU, RAM, disk type/size, OS version, screen size
  └── calls: vire.fi/api/check (POST with specs JSON)
  └── receives: compatibility verdict + recommended upgrade
  └── generates: PDF report via html-to-pdf
  └── opens: report in default PDF viewer
  └── optionally: opens vire.fi/tilaa?model=[...]&ram=[...]&disk=[...] in browser
```

### Spec collection (per OS)

**Windows:** Use PowerShell commands via Tauri's `Command` API:

```powershell
Get-WmiObject Win32_Processor | Select Name, NumberOfCores
Get-WmiObject Win32_PhysicalMemory | Measure-Object -Property Capacity -Sum
Get-PhysicalDisk | Select MediaType, Size
```

**macOS:** Use `system_profiler SPHardwareDataType` and `diskutil info /`

**Linux:** Read `/proc/cpuinfo`, `/proc/meminfo`, and `lsblk -d -o name,rota,size`

### PDF report content

The report is generated as HTML then converted to PDF. Include:

1. **Header:** Sparkki logo + "Yhteensopivuusraportti" + date generated
2. **Machine summary box:** CPU, RAM, disk type, OS
3. **Verdict block (large, colour-coded):**
   - 🟢 Yhteensopiva — "Koneesi soveltuu erinomaisesti päivitykseen"
   - 🟡 Rajatapaus — "Päivitys on mahdollinen mutta hyöty on rajallinen"
   - 🔴 Ei suositeltu — "Koneesi laitteisto ei tue päivitystä täysipainoisesti"
4. **Estimated improvements table:** Boot time before → after, app launch time, battery impact
5. **Recommended upgrade:** SSD model, RAM recommendation, estimated total cost
6. **QR code:** links to `vire.fi/tilaa?ref=report&model=[slug]` — tracked conversion
7. **Footer:** vire.fi | hei@vire.fi | "Raportti on voimassa 90 päivää"

### API route — `/api/check` (POST)

```ts
// Input
{
  cpu: string,
  ramGb: number,
  diskType: 'HDD' | 'SSD' | 'NVMe' | 'unknown',
  diskSizeGb: number,
  osVersion: string,
  source: 'app' | 'web'  // track where checks come from
}

// Output
{
  status: 'compatible' | 'borderline' | 'incompatible',
  reasons: string[],
  estimatedBootTimeBefore: number,  // seconds
  estimatedBootTimeAfter: number,
  recommendedSsd: string,
  recommendedRam: string | null,
  estimatedCost: number,
  reportId: string  // UUID stored in DB for QR code tracking
}
```

### New DB table

```prisma
model CompatibilityCheck {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  source      String   // "app" | "web"
  cpu         String?
  ramGb       Int?
  diskType    String?
  diskSizeGb  Int?
  osVersion   String?
  status      String   // "compatible" | "borderline" | "incompatible"
  convertedToOrder Boolean @default(false)
  orderId     String?
}
```

### Tauri app distribution

- Build for Windows (x64, arm64) and macOS (x64, Apple Silicon)
- Host installers at `vire.fi/checker/download`
- Auto-update via Tauri updater pointing to GitHub releases
- App is unsigned initially (show install instructions for bypassing Gatekeeper/SmartScreen)
- Future: code signing certificate (~€200/year) once volume justifies

### Admin dashboard addition

- New stat card on `/admin`: "Tarkistukset tänään: X"
- New page `/admin/checks`: list of all compatibility checks with conversion rate
- Aggregate view: pie chart of compatible vs borderline vs incompatible
- Export CSV for grant reporting ("X machines checked in Finland, Y% were upgradeable")

---

## Feature 5 — Component sourcing transparency

### What it is

On the service detail page and each order confirmation, Sparkki shows exactly which SSD (and RAM if applicable) will be installed: brand, model, capacity, read/write speeds, warranty, and a direct link to the product on Verkkokauppa. No other refurb service does this.

### Why it matters

Costs nothing to implement. Builds exceptional trust with both B2C customers ("I can see exactly what I'm getting") and B2B customers ("no cheap no-name components"). Differentiates Sparkki from every competitor.

### Implementation

**Service page `/palvelu`** — add a "Käytämme näitä komponentteja" (We use these components) section:

```ts
// data/components.json
{
  "ssd_standard": {
    "brand": "Samsung",
    "model": "870 EVO",
    "capacity": "500 GB",
    "interface": "SATA III",
    "readSpeed": "560 MB/s",
    "writeSpeed": "530 MB/s",
    "warranty": "5 vuotta",
    "shopUrl": "https://www.verkkokauppa.com/...",
    "priceEur": 45
  },
  "ssd_nvme": {
    "brand": "Samsung",
    "model": "980",
    "capacity": "500 GB",
    "interface": "NVMe PCIe 3.0",
    "readSpeed": "3,500 MB/s",
    "writeSpeed": "3,000 MB/s",
    "warranty": "5 vuotta",
    "shopUrl": "https://www.verkkokauppa.com/...",
    "priceEur": 55
  },
  "ram_standard": {
    "brand": "Kingston",
    "model": "ValueRAM",
    "capacity": "8 GB",
    "type": "DDR4",
    "speed": "3200 MHz",
    "warranty": "Lifetime",
    "shopUrl": "https://www.verkkokauppa.com/...",
    "priceEur": 30
  }
}
```

**Component card UI:**

- Brand logo (small, from `/public/images/brands/`)
- Model name + capacity
- Key specs as 3 icon+text pairs (speed, warranty, interface)
- "Katso Verkkokauppa.comissa ↗" link (opens in new tab)

**Order confirmation email:**

- Include selected component(s) with specs and shop link
- "Komponenttisi on uusi ja takuullinen." reassurance line

**Admin order form:**

- Dropdown to select which SSD/RAM was actually used (defaults to standard, can be overridden)
- This creates an audit trail and helps with warranty claims

---

## Feature 6 — Starter kit product

### What it is

A physical product bundle sold at `/itse` for €19.90: a bootable Linux Mint USB stick + a printed A5 quick-start card (laminated) + a set of keyboard shortcut stickers. Ships in a small branded envelope. Targets users who want to DIY but want more confidence and a physical object to hold.

### Why it matters

- Margins are excellent: USB (~€3) + stickers (~€1.50) + card printing (~€0.80) + envelope/postage (~€3) = ~€8.30 cost, sold at €19.90. Margin: ~58%.
- The physical object makes Linux feel more real and legitimate to hesitant users.
- Photographs beautifully for Instagram and product pages.
- Works as a gift — "for someone switching to Linux".
- The keyboard sticker set is a subtle retention tool: once stickers are on the keyboard, the user is committed.

### Kit contents

1. **USB stick (16GB+):** Linux Mint latest LTS, pre-flashed, bootable, labelled "Sparkki — Linux Mint [version]"
2. **Quick-start card (A5, laminated):** Front — "5 ensimmäistä asiaa Linux Mintissä" (5 first things). Back — WiFi setup, browser setup, software installer location, how to get help (Discord QR code)
3. **Keyboard sticker set (A6 sheet):** Common shortcuts in Finnish: Ctrl+C = Kopioi, Ctrl+V = Liitä, Win key = Sovellusvalikko etc. Translucent, removable.

### New Stripe product

- Product: "Sparkki Starter Kit"
- Price: €19.90 (includes Finnish postage)
- Env var: `STRIPE_PRICE_STARTER_KIT`

### DB changes

```prisma
model StarterKitOrder {
  id              String   @id @default(cuid())
  createdAt       DateTime @default(now())
  status          String   @default("pending")
  customerName    String
  customerEmail   String
  address         String
  stripeSessionId String?
  shippedAt       DateTime?
  trackingNumber  String?
}
```

### Admin changes

- `/admin/starter-kit` — list of kit orders, status update (pending → shipped), tracking number field
- Batch view: "X kits to ship this week"

### Product page additions

- Product photography placeholder: image of the three items laid out flat on a white background
- "Sopii lahjaksi" (Makes a great gift) badge
- Estimated delivery: 3–5 arkipäivää (business days)
- Bundle upsell: "Tilaa samalla palvelumme ja säästä toimituskuluissa"

---

## Feature 7 — Sparkki for Good (social pricing tier)

### What it is

A formally named discounted service tier for verified recipients: pensioners on low income, unemployed, refugees, and NGO-referred clients. SSD Basic €99 (was €149), SSD+RAM €129 (was €189). Verification is lightweight — a pension card photo, unemployment card, or NGO referral code.

### Why it matters

- Unlocks press coverage and editorial features (Yle loves this angle)
- Makes Sparkki eligible for additional EU social inclusion grants
- Gives NGO partners (SPR, Pelastusarmeija) a concrete reason to refer clients
- Builds genuine community goodwill — customers talk about brands that treat them fairly
- The margin hit (~€50 per order) is likely offset within 6 months by PR and partnership value

### Verification options

1. **NGO referral code:** Partner NGOs get a unique discount code (e.g. `SPR2026`). They give it to clients. Code applied at checkout = €50 discount automatically.
2. **Self-declared + document upload:** Customer checks "Olen eläkeläinen / työtön" in order form and uploads a photo of relevant card. Admin reviews before confirming order.
3. **Trust-based for now:** At low volume, simply add a checkbox "Haen Sparkki for Good -alennusta" and ask admin to verify manually. Automate later.

### Implementation

**Order wizard — Step 3 (tier selection):**

- Add a subtle "Sparkki for Good" link below the pricing cards: "Oletko eläkeläinen, työtön tai NGO:n asiakas? Katso alennetut hinnat ↓"
- Expands to show the discounted pricing with verification instruction

**Discount codes in Stripe:**

```
VERGOOD-SPR       → -€50 (SPR referral)
VERGOOD-PA        → -€50 (Pelastusarmeija)
VERGOOD-ELAKE     → -€50 (self-declared pensioner, requires document)
VERGOOD-TYO       → -€50 (self-declared unemployed)
```

**DB changes:**

```prisma
model Order {
  // ... existing fields ...
  vireForGood      Boolean @default(false)
  goodTierReason    String? // "spr_referral" | "pensioner" | "unemployed" | "refugee"
  goodTierVerified  Boolean @default(false)
  goodTierDocUrl    String? // uploaded verification document (R2/S3 URL)
}
```

**Admin changes:**

- Orders flagged as Sparkki for Good show an amber badge in the order list
- Order detail shows verification reason + document upload (if applicable)
- "Verify" / "Reject" buttons — sends email to customer either way
- Monthly report: X Sparkki for Good orders, total discount given, NGO source breakdown

**Dedicated page `/sparkki-for-good`** (legacy `/vire-for-good` redirects):

- Who qualifies
- How to apply
- NGO referral code instructions
- "Meille on tärkeää, että teknologia on kaikkien saavutettavissa." — mission statement

---

## Feature 8 — Group / neighbourhood upgrade day

### What it is

A batch discount booking for 3+ people from the same area who book together. The group organiser gets their upgrade free if they bring 4+ others. Sparkki batches the work into one pickup/delivery run. Targets apartment buildings, sports clubs, village associations, and parish groups.

### Why it matters

- Word-of-mouth with a financial incentive baked in
- Solves the logistics inefficiency of single-unit pickups: one van run for 5 machines is more efficient than 5 separate runs
- Specifically targets the offline older demographic that doesn't respond to digital ads — they trust a neighbour who says "I know a service"
- The free upgrade for the organiser is PR-worthy and creates a memorable story

### Booking flow

1. Customer lands on `/ryhmätilaus` (group booking page)
2. They enter: their postcode, their email, "I want to organise a group booking"
3. Sparkki sends them a unique group code + a shareable link: `vire.fi/ryhma/ABC123`
4. Organiser shares the link with neighbours/friends
5. Each participant fills in their machine details at the group link
6. When 3+ participants have joined: group is confirmed, organiser notified
7. When 4+ participants: organiser's upgrade is free (automatically applied at checkout)
8. Sparkki schedules one pickup run for the whole group

### DB changes

```prisma
model GroupBooking {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())
  code          String   @unique  // 6-char alphanumeric
  status        GroupStatus @default(OPEN)
  organiserEmail String
  organiserName  String
  postcode      String
  scheduledDate DateTime?
  orders        Order[]  // relation
}

enum GroupStatus {
  OPEN        // accepting participants
  CONFIRMED   // 3+ joined, Sparkki confirmed
  SCHEDULED   // date agreed
  COMPLETED
  CANCELLED
}

model Order {
  // ... existing fields ...
  groupBookingId String?
  groupBooking   GroupBooking? @relation(fields: [groupBookingId], references: [id])
  isOrganizerFreeUpgrade Boolean @default(false)
}
```

### Admin changes

- `/admin/groups` — list of group bookings with participant count and status
- Group detail: all participants, machine models, postcode, schedule date picker
- When date set: send confirmation emails to all participants with pickup instructions
- "Mark organiser free upgrade" toggle on organiser's individual order

### Pricing logic (applied at checkout)

```ts
function applyGroupDiscount(order: Order, group: GroupBooking): number {
  const participantCount = group.orders.length
  if (participantCount >= 4 && order.id === group.orders[0].id) {
    return 0 // organiser's order is free
  }
  if (participantCount >= 3) {
    return order.priceEur * 0.9 // 10% discount for all participants
  }
  return order.priceEur
}
```

---

## Feature 9 — Corporate device donation pipeline

### What it is

A formal programme where Finnish companies donate their decommissioned laptops to Sparkki. Sparkki refurbishes them, donates a portion to NGOs and schools at cost, and sells the rest commercially. The donating company receives a sustainability report for ESG documentation.

### Why it matters

Solves Sparkki's most critical scaling constraint: hardware sourcing. At high volume, buying SSDs and finding used hardware limits throughput. The donation pipeline provides free incoming hardware — the raw material of the business — while generating PR, NGO goodwill, and B2B relationships simultaneously.

### Programme flow

1. Company contacts Sparkki via `/yritysyhteistyö` (corporate partnership page)
2. Sparkki assesses the fleet: Sparkki visits or company sends a hardware inventory spreadsheet
3. Agreement signed: company donates X devices, Sparkki provides sustainability report within 30 days of processing
4. Pickup arranged (Sparkki handles logistics for 10+ devices)
5. Devices assessed: graded A (excellent) / B (good) / C (marginal)
6. Grade A and B devices: refurbished and sold or donated
7. Grade C devices: components harvested, remainder sent to certified e-waste recycler
8. Sustainability report generated: devices processed, CO₂ saved vs new manufacture, how devices were redistributed

### Sustainability report (auto-generated PDF)

```
[Company logo + Sparkki logo]

Vastuullisuusraportti — [Company name] — [Date]

Laitteet vastaanotettu: X
  Grade A (myytiin/lahjoitettiin): X
  Grade B (päivitettiin ja myytiin): X
  Grade C (kierrätettiin): X

Arvioitu CO₂-säästö: X kg
(Perustuu: 300 kg CO₂ / uusi kannettava × päivitettyjen laitteiden määrä)

Lahjoitettu seuraaville organisaatioille:
  [NGO name]: X laitetta
  [School name]: X laitetta

Tämä raportti on tarkoitettu yrityksenne ESG-dokumentaatioon.
Lisätietoja: vire.fi/yritysyhteistyö
```

### DB changes

```prisma
model DonationBatch {
  id              String   @id @default(cuid())
  createdAt       DateTime @default(now())
  companyName     String
  companyEmail    String
  deviceCount     Int
  gradeA          Int      @default(0)
  gradeB          Int      @default(0)
  gradeC          Int      @default(0)
  status          DonationStatus @default(PENDING)
  pickupDate      DateTime?
  reportGeneratedAt DateTime?
  reportUrl       String?  // hosted PDF URL
  co2SavedKg      Int?
  notes           String?
}

enum DonationStatus {
  PENDING
  SCHEDULED
  RECEIVED
  PROCESSING
  REPORTED
  COMPLETE
}
```

### Admin changes

- `/admin/donations` — list of donation batches with status pipeline
- Batch detail: company info, device count, grade breakdown, status updater
- "Generate report" button → triggers PDF generation via server action
- PDF stored in object storage (Supabase Storage or R2), URL saved to record

### New pages

- `/yritysyhteistyö` — corporate partnership landing page
  - Who this is for (companies with 10+ decommissioned devices)
  - What happens to the devices
  - What the company receives (sustainability report, free logistics, goodwill)
  - Contact form: company name, email, estimated device count, preferred contact method

---

## Feature 10 — Workshop programme

### What it is

Free 90-minute "Päivitä koneesi" (Upgrade your computer) workshops at libraries and community centres. Participants bring their own laptop. Sparkki walks them through the process live. At the end, those who don't want to DIY can hand their machine to Sparkki on the spot.

### Why it matters

- A live demo converts far more effectively than any ad — people see the 15-second boot and they're sold
- Specifically designed for the elderly demographic who won't order online but will attend a free community event
- Generates local press coverage and library newsletter mentions (free advertising)
- Converts non-tech participants into paying customers on the spot
- Builds community trust that no digital channel can replicate

### Workshop format

```
0–10 min:   Introduction. What is Sparkki? Why do computers get slow?
10–20 min:  Live demo. Boot a before-upgrade laptop (2 min). Install SSD live or use pre-done.
            Boot the after-upgrade laptop (15 sec). Audience reaction does the selling.
20–40 min:  Participants check their own machines (using the Sparkki web checker on their phone
            or a provided tablet). Anyone who needs help checking specs gets 1:1 attention.
40–60 min:  Show Linux Mint. Click through the app alternatives. Address "but I use Word" live.
60–80 min:  Q&A. Sparkki answers questions about the service, pricing, and process.
80–90 min:  On-the-spot orders. Participants who want to hand over their machine fill in a
            paper order form. Machine is logged, receipt given, collected by Sparkki same day.
```

### Booking system

- `/tapahtumat` — events page listing upcoming workshops
- Each event: date, time, location, capacity (max 15), registration form (name + email)
- Confirmation email with address, what to bring (laptop + charger + any passwords they know)
- Reminder email 24h before
- Admin: `/admin/events` — create, manage, view registrations

### DB changes

```prisma
model WorkshopEvent {
  id           String   @id @default(cuid())
  createdAt    DateTime @default(now())
  title        String   // e.g. "Päivitä koneesi — Kallio-kirjasto"
  location     String
  address      String
  date         DateTime
  capacityMax  Int      @default(15)
  published    Boolean  @default(false)
  registrations WorkshopRegistration[]
}

model WorkshopRegistration {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  eventId     String
  event       WorkshopEvent @relation(fields: [eventId], references: [id])
  name        String
  email       String
  attended    Boolean  @default(false)
  convertedToOrder Boolean @default(false)
  orderId     String?
}
```

### Admin changes

- `/admin/events` — list events, create new, see registrations
- Event detail: attendance list with "mark attended" toggle and "converted to order" toggle
- Conversion rate per event: X attended, Y orders placed = Z%

---

## Feature 11 — Annual hardware report

### What it is

A published annual report: "Suomen Konekatsaus [year]" (Finland Computer Survey). Aggregated, anonymised data from all compatibility checks and orders: most common models, average device age, HDD vs SSD split, estimated total CO₂ cost of replacing all checked devices, percentage that were upgradeable. Published as a PDF and a web page.

### Why it matters

- Positions Sparkki as the authority on hardware aging in Finland
- Generates press coverage when published
- Strengthens grant applications with hard data
- Reinforces the sustainability narrative with real numbers
- Costs almost nothing to produce once the data exists

### Data sources

- `CompatibilityCheck` table: CPU, RAM, disk type, OS, status
- `ComputerModel` table: verified models and their stats
- `Order` table: volume, tier distribution, geography

### Report sections

1. Executive summary (1 page — press-ready)
2. Methodology
3. Fleet composition: most common makes/models checked
4. Age distribution: device age histogram
5. Upgrade potential: % compatible vs borderline vs incompatible
6. Environmental impact: total CO₂ saved by Sparkki's completed upgrades vs if devices had been replaced
7. Geographic distribution: orders by region
8. App alternatives usage: most-viewed alternatives on `/sovellukset` (from Plausible)
9. Outlook: Windows 10 EOL impact projection

### Implementation

- Build as a Next.js page at `/konekatsaus/[year]` with `generateStaticParams`
- Data fetched from DB at build time (ISR, 24h revalidation during report month, static otherwise)
- PDF version generated via `puppeteer` server action and cached to object storage
- Published once per year, announced via email to all past customers + press release

### Admin changes

- `/admin/reports` — trigger report generation, preview, publish toggle
- "Generate PDF" button → runs puppeteer, stores PDF, returns download URL

---

## Shared implementation notes

### Object storage (for PDFs and uploaded docs)

Features 4, 9, 10, and 11 require storing generated PDFs and uploaded documents. Use Supabase Storage or Cloudflare R2 when wired into the stack.

```ts
// lib/storage.ts (sketch — wire env when storage exists)
import { createClient } from '@supabase/supabase-js'

export async function uploadFile(
  bucket: string,
  path: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)
  const { data, error } = await supabase.storage.from(bucket).upload(path, buffer, { contentType })
  if (error) throw error
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}
```

Buckets needed:

- `reports` — compatibility report PDFs (Feature 4)
- `documents` — Sparkki for Good verification uploads (Feature 7)
- `donation-reports` — corporate sustainability reports (Feature 9)
- `hardware-reports` — annual hardware report PDFs (Feature 11)

### Email additions (Resend templates to add)

| Feature | Trigger | Template name |
|---|---|---|
| 1 | Order with migration=true | `migration-prep-guide` |
| 2 | Day 75 post-order | `care-upsell-gentle` |
| 2 | Day 88 post-order | `care-upsell-final` |
| 2 | Care subscription confirmed | `care-welcome` |
| 2 | Care monthly | `care-monthly-tip` |
| 2 | Care payment failed | `care-payment-failed` |
| 7 | Good tier verification pending | `good-tier-pending` |
| 7 | Good tier verified | `good-tier-approved` |
| 8 | Group booking confirmed (3+) | `group-confirmed` |
| 8 | Group booking organiser free | `group-organiser-free` |
| 10 | Workshop registration | `workshop-confirmed` |
| 10 | Workshop reminder (24h) | `workshop-reminder` |

### New environment variables needed

```bash
# Supabase storage (when adopted)
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
SUPABASE_STORAGE_BUCKET_REPORTS=reports
SUPABASE_STORAGE_BUCKET_DOCS=documents

# Stripe additional products
STRIPE_PRICE_CARE_MONTHLY=price_...
STRIPE_PRICE_STARTER_KIT=price_...

# Tauri app (for spec checker API)
CHECKER_API_SECRET=   # shared secret between Tauri app and /api/check
```

### Agent rules for these features

1. Build features in the priority order in the table at the top. Do not skip ahead.
2. Each feature is independent — do not build dependencies between features unless explicitly noted.
3. All new pages follow `DESIGN_SYSTEM.md` without exception.
4. All new DB models go in `prisma/schema.prisma` and require a migration before use.
5. All new Stripe products must be created in the Stripe dashboard first — then the price ID goes in `.env.local`.
6. PDF generation (Features 4, 9, 11) uses `puppeteer` running a server action. Never block the request thread — use a background job pattern (queue the generation, return immediately, send email when done).
7. File uploads (Feature 7 verification docs) must validate file type (jpg/png/pdf only) and size (max 5MB) on the server before storing.
8. The `CompatibilityCheck` table records every check for aggregate reporting — never delete records from this table.
9. Sparkki for Good discount codes are Stripe coupon codes — do not implement a custom discount system.
10. Group booking codes are 6-character alphanumeric, uppercase, generated with `nanoid(6).toUpperCase()`. Collision-check against DB before issuing.
