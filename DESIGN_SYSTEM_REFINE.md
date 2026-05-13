# Sparkki ⚡

> Calm, tactile Nordic tooling for reviving old machines into fast, beautiful daily drivers.

---

## Phase 1 — implementation log (complete)

Shipped in codebase (incremental):

- [x] **Public brand strings** — UI copy, emails, and `package.json` name → **Sparkki** (email addresses such as `@vire.fi` unchanged until DNS/mailbox moves).
- [x] **Color palette** — `app/globals.css` tokens aligned with suggested charcoal + `#FFD54A` / `#FFB800` accent; status success → `#78E08F`.
- [x] **Typography** — body UI font → **Inter** (display stays **Syne**); mono unchanged (DM Mono) for Phase 2 refinement.
- [x] **3D / canvas accents** — wireframe colours match new accent.
- [x] **Daytime theme** — night/day lerp bases updated to new neutrals.
- [x] **App icon** — `app/icon.svg` (spark mark on charcoal).
- [x] **Web manifest** — `app/manifest.ts` (`name` / `short_name` Sparkki).
- [x] **Health API** — `service: "sparkki"`.
- [x] **Nav event** — `sparkki-bg-navigate` (was `vire-bg-navigate`).

## Phase 2 — implementation log (complete)

Shipped in codebase:

- [x] **Spacing** — `--space-*` scale and card padding tokens in `app/globals.css`; Tailwind `spacing` extend (`spark-*`, `spark-card`).
- [x] **Typography scale** — `--text-xs` … `--text-xl`, line-height tokens; Tailwind `fontSize` (`spark-xs`, `spark-sm`, `spark-body`).
- [x] **Motion** — `--duration-*`, `--ease-*`; body background uses `--duration-theme-bg` (separate from route transition).
- [x] **Elevation** — `--shadow-*`, `--shadow-glow-accent`; Tailwind `boxShadow` (`elevation-*`, `glow-accent`).
- [x] **Semantic colors** — aliases (`--color-accent`, `--color-surface-*`, `--color-text-*`, borders, danger/success).
- [x] **Blur / depth** — `--blur-*`; Tailwind `backdropBlur` (`spark-*`); sticky header uses `.surface-header-scrim` + backdrop blur.
- [x] **Radii** — `--radius-*`; Tailwind `borderRadius` (`spark-*`).
- [x] **Dual class names** — `.sparkki-*` mirrors for `.vire-card`, `.vire-hero`, `.vire-eyebrow`, `.vire-btn-*` (incremental migration).
- [x] **Hardcoded colors reduced** — Discord block, guide cards, OG image, `global-error`, community page lead use tokens / brand classes.

Follow-ups (later phases or ops):

- [ ] Sweep **ROADMAP.md**, **FEATURES.md**, **DESIGN_SYSTEM.md** for legacy “Vire” product naming.
- [ ] Optional URL rename `/vire-for-good` → `/sparkki-for-good` + redirects.
- [ ] Replace `app/favicon.ico` with raster favicons derived from spark mark if needed for older clients.
- [ ] **Later** — optional Framer Motion for richer choreography; finish renaming `vire-*` usage in TSX to `sparkki-*` where safe. (Phases 3–4 ship CSS + minimal client wiring, no new animation library.)

---

# Brand Rename

## Old Name
Vire

## New Name
# Sparkki

### Meaning
"Sparkki" evokes:
- spark
- ignition
- electrical life
- movement
- Finnish winter mobility
- giving dead things motion again

It feels:
- playful
- Finnish
- memorable
- energetic
- hacker-friendly
- approachable

---

# Logo Concept

## Primary Direction
A minimal Nordic spark icon combined with a forward-motion shape.

### Visual Identity
- matte dark UI
- electric warm yellow accent
- charcoal surfaces
- subtle glow
- rounded industrial shapes
- retro-futuristic Finnish utility aesthetic

---

# SVG Logo Concept

```svg
<svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="220" height="220" rx="48" fill="#101214"/>
  <path d="M124 36L72 124H112L96 184L148 96H108L124 36Z"
        fill="#FFD54A"/>
</svg>
```

---

# Product Vision

Sparkki should feel like:
- reviving forgotten hardware
- cyberpunk repair shop
- calm Linux workstation
- creative hacker garage
- frictionless restoration tool

Not:
- enterprise IT software
- cluttered dashboard
- repair management spreadsheet

The emotional feeling should be:
> "This machine has a second life now."

---

# UX Direction

## Core Principles

### 1. Calm Interfaces
Reduce noise.

Avoid:
- excessive borders
- too many visible controls
- crowded cards
- large settings walls

Prefer:
- whitespace
- progressive disclosure
- contextual actions
- breathing room

---

### 2. Tactile Motion
Interactions should feel physical.

Use:
- soft easing
- spring motion
- subtle depth
- hover lift
- ambient transitions

Avoid:
- instant appearance
- harsh animation
- abrupt state changes

---

### 3. Nordic Minimalism
Inspired by:
- Teenage Engineering
- Arc Browser
- Linear
- old Nokia industrial design
- Finnish utility aesthetics

Visual style:
- dark matte surfaces
- warm grayscale
- sparse accent colors
- translucent overlays
- layered depth

---

# Claude Code Master Tasklist

This file is optimized for:
- Claude Code
- Cursor
- Windsurf
- Cline
- Codex

---

# PHASE 1 — Rebranding

## Tasks

- [ ] Rename all references from Vire → Sparkki
- [ ] Update package metadata
- [ ] Update browser titles
- [ ] Update favicon
- [ ] Replace logos
- [ ] Add new color palette
- [ ] Add brand typography
- [ ] Update README and docs
- [ ] Update environment branding variables
- [ ] Update app manifest

---

# PHASE 2 — Design System

## Goal
Create a coherent premium interface language.

## Tasks

- [x] Create spacing token system
- [x] Create typography hierarchy
- [x] Create motion token system
- [x] Create surface elevation system
- [x] Create semantic color tokens
- [x] Create blur/depth layers
- [x] Standardize border radii
- [x] Remove hardcoded colors (major surfaces; full sweep ongoing)

---

# PHASE 3 — UI Modernization

## Components

### Buttons
- [x] Add hover lift (`.vire-btn-primary` / `.sparkki-btn-primary`, secondary lift)
- [x] Add pressed states (`:active` scale)
- [x] Add loading states (`.sparkki-btn-loading` + spinner; pay CTA in order wizard)
- [x] Add glow accents (hover `shadow-glow-accent`)
- [x] Add keyboard focus states (`:focus-visible` site-wide + button outlines)

### Cards
- [x] Add layered shadows (token-backed; hover → stronger shadow)
- [x] Add subtle hover motion (`translateY`, respects reduced motion)
- [x] Add depth hierarchy (elevation tokens + hover)
- [x] Improve spacing rhythm (Phase 2 `spark-card` / padding tokens)

### Inputs
- [x] Add animated focus rings (`.sparkki-input`; wizard computer + contact fields)
- [ ] Add inline validation
- [ ] Improve readability
- [ ] Improve mobile touch UX

### Modals
- [x] Add backdrop blur (fullscreen wizard: `.sparkki-modal-backdrop`)
- [x] Add scale transitions (`.sparkki-wizard-full` panel enter)
- [x] Add focus trapping (Tab cycle in fullscreen `OrderWizard`)
- [x] Add ESC handling (existing hash close)

---

# PHASE 4 — Motion System

## Goal
Make the product feel alive and premium.

## Tasks

- [x] Add page transitions (`LocaleMainMotion` + `.sparkki-page-enter` on locale routes)
- [ ] Add stagger animations
- [x] Add skeleton loaders (utility `.sparkki-skeleton` in `globals.css`; wire where needed)
- [x] Add smooth hover interpolation (token durations/easing on buttons, cards, nav tabs)
- [x] Add animated navigation indicators (nav tab transitions)
- [x] Add spring physics for panels (`.sparkki-wizard-full` uses `--ease-spring`)
- [ ] Add contextual transitions (broader polish — optional follow-up)

## Recommended Motion

| Interaction | Duration |
|---|---|
| Hover | 120–180ms |
| Panel open | 220–320ms |
| Route transition | 350–500ms |
| Tooltip | 120ms |

---

# PHASE 5 — Information Architecture

## Goal
Reduce cognitive overload.

## Tasks

- [x] Reduce visible controls per screen (order wizard step 2: bundles + VM behind collapsible add-ons)
- [x] Move advanced settings into expandable sections (migration FAQ accordions; VM legal already in `<details>`)
- [ ] Improve grouping of actions
- [ ] Reduce duplicate navigation
- [x] Improve onboarding clarity (step hint mentions optional add-ons; admin empty states explain next steps)
- [x] Improve visual hierarchy (FAQ cards, dashed empty panels)
- [x] Add empty states (`EmptyState` on admin orders / USB / Care; filter-aware copy + reset on orders)
- [x] Add contextual help (empty-state descriptions; “show all orders” when filters match nothing)

---

# PHASE 6 — Navigation UX

## Tasks

- [x] Add command palette (CMD+K) — `CommandPalette` (`⌘K` / `Ctrl+K`, filterable jump list, focus trap)
- [x] Add keyboard shortcuts — palette toggle + Esc; hint in palette footer and `shortcutHint` on `xl+` header
- [ ] Add smart sidebar
- [ ] Add recent actions
- [ ] Add route memory
- [ ] Add breadcrumb navigation
- [x] Add mobile drawer navigation — hamburger (`md:hidden`) + slide-over with main links, order CTA, locale

---

# PHASE 7 — Mobile UX

## Tasks

- [x] Optimize thumb reach (mobile nav as **bottom sheet** + drag handle; fullscreen wizard **sticky footer** for Back/Next + safe-area padding)
- [x] Increase tap targets (wizard nav **grid** + `min-h-12` on mobile; sheet links `min-h-12`)
- [x] Add bottom sheets (primary mobile menu: `sparkki-mobile-sheet` slide-up)
- [x] Improve stacked layouts (wizard **2-col** primary actions on small screens)
- [x] Reduce overflow issues (`overflow-x-hidden` on `body`; `break-words` on wizard summary contact)
- [x] Add gesture support (`touch-pan-x` / `touch-pan-y` / `overscroll-*` on wizard + sheet; `touch-none` on background canvas)
- [x] Improve performance on mobile GPUs (fewer wireframe meshes + lower **pixel ratio** cap when viewport &lt; 640px)

---

# PHASE 8 — Performance UX

## Tasks

- [x] Remove layout shifts (order wizard **skeleton** with stable `min-height` + `orderWizardLoading` label while chunk loads)
- [ ] Optimize rerenders (follow-up: profile hot client surfaces if needed)
- [ ] Add optimistic UI (deferred — pick a concrete mutation flow when product asks for it)
- [x] Add route prefetching (`RoutePrefetchWarmup` idle-time `router.prefetch` for top destinations)
- [x] Improve animation performance (footer **`content-visibility: auto`** for cheaper scroll painting)
- [x] Reduce bundle size (Three.js **code-split** via `BackgroundCanvasDynamic` `next/dynamic` + `ssr: false`)
- [x] Add lazy rendering (background canvas + **OrderWizard** deferred on `/palvelu` via `next/dynamic`)

---

# PHASE 9 — Accessibility

## Tasks

- [ ] Add visible focus states
- [ ] Improve contrast ratios
- [ ] Add keyboard traversal
- [ ] Add reduced motion mode
- [ ] Improve semantic HTML
- [ ] Add ARIA labels

---

# PHASE 10 — Emotional UX

## Goal
Make Sparkki feel memorable.

## Tasks

- [ ] Add delightful empty states
- [ ] Add ambient background animation
- [ ] Add subtle sound hooks
- [ ] Add contextual microinteractions
- [ ] Add alive feeling to interface
- [ ] Add subtle reactive lighting

---

# Claude Code Instructions

## Architecture Rules

### ALWAYS
- use reusable components
- keep motion subtle
- optimize for calm interfaces
- reduce cognitive noise
- use semantic tokens
- support dark mode
- support keyboard navigation

### NEVER
- use harsh pure black
- overload screens with controls
- use abrupt animations
- hardcode spacing/colors
- use inconsistent motion
- create nested modal chaos

---

# Preferred Stack

## Frontend
- Next.js
- Tailwind
- Framer Motion
- shadcn/ui
- Zustand or Jotai
- React Aria

## Styling Philosophy
- layered depth
- matte surfaces
- warm grays
- sparse accent colors
- spatial hierarchy

---

# Ideal Product Feeling

Sparkki should feel like:

> A beautifully restored machine humming quietly in a dark Nordic studio.

The interface should feel:
- calm
- tactile
- elegant
- intelligent
- alive
- spacious

---

# Suggested Color Palette

## Base
- #101214
- #171A1F
- #20242B

## Text
- #F3F4F6
- #C9CED6
- #8A93A2

## Accent
- #FFD54A
- #FFB800

## Success
- #78E08F

## Error
- #FF6B6B

---

# Suggested Fonts

## UI
- Inter
- Geist
- Satoshi

## Monospace
- JetBrains Mono
- IBM Plex Mono

---

# Final Vision

Sparkki is not just a repair/upcycling utility.

It is:
- digital restoration
- machine revival
- sustainable hacker culture
- Nordic creative tooling
- emotional computing

Every interaction should reinforce:

> "Old hardware deserves another life."


