# Sparkki — Design System & Style Instructions

> For coding agents. This **`DESIGN_SYSTEM.md`** is the **single** spec: UI tokens and components, **product experience vision** (merged from the former **`DESIGN_SYSTEM_IMPROVEMENT.md`**), and the **Sparkki refine programme** (phases 1–23 implementation log). Read before writing UI code.

**Governance:** **`ROADMAP.md`** points here for all visual work (design principles + agent rules). **`FEATURES.md`** defers here for UI on every shipped feature. Implementation lives in **`app/globals.css`** (`:root` + component layers) and **`tailwind.config.ts`** (semantic utilities). If product needs a new pattern, extend this document and the token layer first, then build the screen.

**Status (May 2026):** All **refine programme** engineering phases in this file (rebrand through Phase 23) are **complete**. The **product transformation** programme below is **largely shipped** on the public site; only optional/future items remain open (see table).

---

## Philosophy

Sparkki's visual identity is **dark, confident, and precise**. The aesthetic is inspired by high-craft developer tools and music software — not SaaS dashboards. It should feel like something a skilled person built with intention, not a template.

**Canonical tokens:** The shipped product uses **Sparkki** tokens in **`app/globals.css`** and semantic classes in **`tailwind.config.ts`** (matte charcoal bases, warm yellow accent, green success). Older examples in this file may still describe the historical green-accent palette—when in doubt, match the live CSS variables.

**One rule above all others:** if it looks like a generic Tailwind site, it's wrong. Every screen should feel unmistakably Sparkki.

---

## Colours

Define these as CSS custom properties on `:root`. Never hardcode hex values in component code — always reference variables.

```css
:root {
  /* Brand greens */
  --g:       #1DF5A0;   /* Primary accent — CTAs, active states, icons */
  --g2:      #0BBF78;   /* Hover state for green elements */
  --g3:      #085041;   /* Dark green — text on light green fills */

  /* Amber — secondary accent, warnings, DIY difficulty */
  --amber:   #F5A623;

  /* Backgrounds — layered dark surfaces */
  --bg:      #080C0A;   /* Page background */
  --bg2:     #0E1410;   /* Section background (footer, sidebar) */
  --bg3:     #141C18;   /* Card background */
  --bg4:     #1A2420;   /* Input background, nested elements */

  /* Borders */
  --border:  rgba(29, 245, 160, 0.12);   /* Default border */
  --border2: rgba(29, 245, 160, 0.25);   /* Hover / emphasis border */

  /* Text */
  --text:    #E8F2EE;   /* Primary text */
  --muted:   #7A9A8E;   /* Secondary text, descriptions */
  --dim:     #3D5248;   /* Tertiary — timestamps, metadata, labels */

  /* Semantic — status badges only */
  --status-pending:  #F5A623;
  --status-progress: #6495ED;
  --status-done:     #1DF5A0;
  --status-cancel:   #FF6B6B;
}
```

**Colour rules:**

- `--g` is used for: primary CTAs, active nav links, featured card borders, check icons, accent text, eyebrow lines, progress fills, stat deltas.
- `--amber` is used for: medium difficulty badges, warning states, pending status, secondary accent when green would clash.
- Never use `--g` and `--amber` on the same element.
- Never use white (`#ffffff`) as a background. The lightest surface is `--bg4`.
- Status colours (`--status-*`) are for badge fills only — 12–15% opacity fill, full colour text.
- Red (`#FF6B6B`) appears only for destructive actions and error states.
- No purples, blues, or teals anywhere outside the Discord block (which uses Discord's own `#5865F2`).

**In this repository:** `app/globals.css` defines the same `:root` tokens. `tailwind.config.ts` maps **semantic names** for JSX: `bg-canvas` / `text-ink` / `text-fog` / `text-dust` / `bg-raised` / `bg-card` / `bg-sunken` / `border-edge` / `border-em` — prefer these over pasting hex or raw `var(...)` in components unless you are writing plain CSS.

---

## Typography

### Font stack

```css
/* Display / headings */
font-family: 'Syne', sans-serif;

/* Body / UI */
font-family: 'DM Sans', sans-serif;

/* Monospace — labels, metadata, code, IDs, timestamps */
font-family: 'DM Mono', monospace;
```

Load from Google Fonts:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap" rel="stylesheet">
```

Tailwind config:

```js
// tailwind.config.ts
theme: {
  extend: {
    fontFamily: {
      display: ['Syne', 'sans-serif'],
      sans:    ['DM Sans', 'sans-serif'],
      mono:    ['DM Mono', 'monospace'],
    },
  },
}
```

### Type scale

| Role | Font | Size | Weight | Colour | Notes |
|------|------|------|--------|--------|-------|
| Hero title | Syne | 64–80px | 800 | `--text` | `letter-spacing: -2px` |
| Section title | Syne | 36–48px | 800 | `--text` | `letter-spacing: -1px` |
| Card title | Syne | 18–24px | 700 | `--text` | |
| Price / stat | Syne | 32–52px | 800 | `--text` or `--g` | `letter-spacing: -2px` |
| Body | DM Sans | 14–16px | 300–400 | `--muted` | `line-height: 1.65` |
| Body elder | DM Sans | 16–18px | 400 | `--text` | Minimum on public-facing pages |
| Eyebrow | DM Mono | 10–11px | 400 | `--g` | `letter-spacing: 0.15em`, uppercase |
| Label / meta | DM Mono | 10–12px | 400 | `--muted` or `--dim` | `letter-spacing: 0.08em`, uppercase |
| Nav link | DM Sans | 14px | 400 | `--muted` | hover → `--text` |
| Button | DM Sans | 14–15px | 600–700 | depends | |
| Table data | DM Mono | 11–13px | 400 | `--text` or `--muted` | |
| Badge | DM Mono | 10–11px | 400–500 | varies | `letter-spacing: 0.05em` |

**Typography rules:**

- `Syne 800` is reserved for display text — hero, section titles, prices, stat numbers. Never use it for body or captions.
- `DM Mono` is used for anything that is data, not prose: IDs, dates, counts, category labels, eyebrows, filter pills, badge text, monospace metadata.
- `DM Sans 300` (light) is the default body weight. Use 400 for important body copy. Never 500+ for body paragraphs.
- Minimum body size on public pages: **18px**. Elder accessibility requirement — non-negotiable.
- Minimum size anywhere: **11px** (DM Mono labels only).
- Negative letter-spacing (`-1px` to `-2px`) on all Syne display text. Positive letter-spacing (`0.08em`–`0.15em`) on all DM Mono labels.

---

## Spacing

Use an 8px base unit. All spacing is a multiple of 8.

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Icon gap, badge padding |
| `sm` | 8px | Internal card gap, tight rows |
| `md` | 16px | Card padding sides, grid gap |
| `lg` | 24px | Section internal padding |
| `xl` | 32px | Card padding (featured) |
| `2xl` | 48px | Section vertical padding |
| `3xl` | 64px | Page section padding |

**Tailwind mapping:**

- `gap-2` = 8px, `gap-3` = 12px, `gap-4` = 16px, `gap-6` = 24px, `gap-8` = 32px, `gap-12` = 48px, `gap-16` = 64px
- Section padding: `px-12 py-16` (48px / 64px)
- Nav padding: `px-12 py-5` (48px / 20px)
- Card padding: `p-7` (28px) standard, `p-9` (36px) featured

---

## Borders & Surfaces

```css
/* Standard border — all cards, dividers, inputs */
border: 1px solid var(--border);           /* rgba(29,245,160,0.12) */

/* Hover / emphasis border */
border: 1px solid var(--border2);          /* rgba(29,245,160,0.25) */

/* Featured card border — green, full opacity */
border: 1px solid var(--g);

/* Section dividers */
border-top: 1px solid var(--border);
```

**Border rules:**

- All borders are `1px solid`. Never `2px` except featured cards and focus rings.
- Border radius: `8px` (badges, inputs, small elements), `12px` (admin table, stat cards), `16px` (page cards, main sections).
- Tailwind: `rounded-lg` = 8px, `rounded-xl` = 12px, `rounded-2xl` = 16px — match these to context.
- No box shadows anywhere. Depth is achieved through layered background colours (`--bg` → `--bg2` → `--bg3` → `--bg4`), not shadows.
- No gradients on backgrounds except the **Discord block** (fixed indigo gradient — see Components) and the **Sparkki for Good** banner (subtle green gradient — see § Sparkki for Good tier).

---

## Layout

### Site structure

```
fixed: BackgroundCanvas (Three.js, z-index: -1, pointer-events: none)
──────────────────────────────────────
<nav>          height: ~64px, sticky, backdrop-blur
<main>         flex-1, overflow content
<footer>       4-column grid, bg: --bg2
<footer-bottom> 1px border-top, flex row space-between
```

### Max width

```css
.container { max-width: 1100px; margin: 0 auto; padding: 0 48px; }
```

### Grid patterns

```css
/* Pricing cards, support tiers */
grid-template-columns: repeat(3, 1fr);

/* App tiles */
grid-template-columns: repeat(4, 1fr);

/* Guide cards */
grid-template-columns: repeat(3, 1fr);

/* Admin stats */
grid-template-columns: repeat(4, 1fr);

/* Footer */
grid-template-columns: 1fr 1fr 1fr 1fr;

/* Admin layout */
display: flex;
.sidebar { width: 220px; flex-shrink: 0; }
.body    { flex: 1; }
```

Always use `gap-4` (16px) between cards, `gap-3` (12px) between tight grids.

---

## Components

### Navigation

```html
<nav class="site-nav">
  <!-- Logo: Syne 800 24px, --g colour for "Sparkki" brand mark -->
  <div class="logo">Spark<span style="color: var(--text)">ki</span></div>

  <!-- Links: DM Sans 14px --muted, hover → --text -->
  <ul class="links">...</ul>

  <!-- CTA: bg --g, text --bg, 14px 600, radius 8px, px-5 py-2.5 -->
  <a class="cta">Tilaa →</a>
</nav>
```

Sticky. `backdrop-filter: blur(12px)`. Border-bottom `1px solid var(--border)`. Background `rgba(8,12,10,0.92)` for scroll overlay.

---

### Eyebrow label

Used above every section title. Always `DM Mono`, always `--g`, always uppercase, always `letter-spacing: 0.15em`.

```html
<div class="eyebrow">
  <!-- Optional leading line: 20px wide, 1px height, bg --g, inline-block -->
  Palvelu — Helsinki
</div>
```

```css
.eyebrow {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: var(--g);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.eyebrow::before {
  content: '';
  display: inline-block;
  width: 20px;
  height: 1px;
  background: var(--g);
}
```

---

### Buttons

```css
/* Primary */
.btn-primary {
  background: var(--g);
  color: var(--bg);
  padding: 14px 28px;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: -0.2px;
  transition: opacity 0.15s;
}
.btn-primary:hover { opacity: 0.85; }

/* Secondary */
.btn-secondary {
  background: transparent;
  color: var(--muted);
  padding: 14px 28px;
  border-radius: 10px;
  border: 1px solid var(--border2);
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
  font-size: 15px;
  transition: all 0.15s;
}
.btn-secondary:hover {
  color: var(--text);
  background: rgba(29, 245, 160, 0.05);
}

/* Small / inline */
.btn-sm {
  padding: 9px 18px;
  font-size: 13px;
  border-radius: 8px;
}
```

Minimum button height: **48px** on all public-facing pages (elder accessibility). Admin buttons can be 36px.

---

### Cards

```css
/* Standard card */
.card {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 28px;
  transition: border-color 0.2s;
}
.card:hover { border-color: var(--border2); }

/* Featured card (pricing, support) */
.card-featured {
  background: rgba(29, 245, 160, 0.04);
  border: 1px solid var(--g);
  border-radius: 16px;
  padding: 28px;
  position: relative;
}

/* Featured badge */
.card-featured::before {
  content: 'Suosituin';
  position: absolute;
  top: -12px;
  left: 24px;
  background: var(--g);
  color: var(--bg);
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 99px;
  font-family: 'DM Mono', monospace;
  letter-spacing: 0.05em;
}
```

---

### Badges / pills

```css
.badge {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  padding: 3px 9px;
  border-radius: 99px;
  font-weight: 500;
  letter-spacing: 0.04em;
}

/* Pre-installed */
.badge-pre { background: rgba(29,245,160,0.15); color: var(--g); }

/* Difficulty */
.badge-easy   { color: var(--g);     border: 1px solid rgba(29,245,160,0.3); }
.badge-medium { color: var(--amber); border: 1px solid rgba(245,166,35,0.3); }
.badge-hard   { color: #FF6B6B;      border: 1px solid rgba(255,107,107,0.3); }

/* Status */
.badge-pending  { background: rgba(245,166,35,0.15);  color: var(--status-pending); }
.badge-progress { background: rgba(100,149,237,0.15); color: var(--status-progress); }
.badge-done     { background: rgba(29,245,160,0.12);  color: var(--status-done); }
.badge-cancel   { background: rgba(255,107,107,0.12); color: var(--status-cancel); }

/* Filter pill (active/inactive) */
.pill         { border: 1px solid var(--border2); color: var(--muted); }
.pill.active  { background: rgba(29,245,160,0.12); color: var(--g); border-color: var(--g); }
```

---

### Speed bar (homepage hero widget)

```css
.speed-block {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 28px;
  width: 340px;
}

/* Track */
.speed-track {
  height: 6px;
  background: var(--bg4);
  border-radius: 99px;
  overflow: hidden;
}

/* Before: red fill at 92% */
.fill-hdd { background: #FF6B6B; width: 92%; height: 100%; border-radius: 99px; }

/* After: green fill at 14% */
.fill-ssd { background: var(--g); width: 14%; height: 100%; border-radius: 99px; }
```

The verdict box below the bars:

```css
.speed-verdict {
  margin-top: 20px;
  padding: 14px;
  background: rgba(29,245,160,0.06);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  color: var(--g);
  line-height: 1.5;
}
```

Animate the fill bars on page load using `IntersectionObserver`. CSS `transition: width 1.2s cubic-bezier(0.22, 1, 0.36, 1)` from `width: 0` to final value.

---

### Step strip (1-2-3)

```css
.steps-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid var(--border);
}
.step-item {
  padding: 36px 40px;
  border-right: 1px solid var(--border);
  position: relative;
}
.step-item:last-child { border-right: none; }

/* Giant faded number */
.step-num {
  font-family: 'Syne', sans-serif;
  font-size: 52px;
  font-weight: 800;
  color: rgba(29, 245, 160, 0.08);
  line-height: 1;
  letter-spacing: -2px;
  margin-bottom: 12px;
}

/* Icon — top right, 20px, 30% opacity */
.step-icon {
  position: absolute;
  top: 36px;
  right: 36px;
  font-size: 20px;
  opacity: 0.3;
}
```

---

### Pricing card

```css
.card-tier { /* DM Mono, 11px, --muted, uppercase, letter-spacing 0.1em */ }

.card-price {
  font-family: 'Syne', sans-serif;
  font-size: 48px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -2px;
  line-height: 1;
  margin-bottom: 4px;
}
.card-price sup { font-size: 22px; color: var(--muted); font-weight: 400; vertical-align: super; }

.card-saving { /* DM Mono, 11px, --g */ }

/* Feature row */
.card-feature {
  font-size: 13px;
  color: var(--muted);
  padding: 5px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 300;
}
.card-feature::before { content: '✓'; color: var(--g); font-size: 12px; }
```

---

### Guide card

```css
.guide-card {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 28px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s;
}

/* Green underline reveal on hover */
.guide-card::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background: var(--g);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.2s;
}
.guide-card:hover::after { transform: scaleX(1); }
.guide-card:hover { border-color: var(--border2); }

.guide-num { /* DM Mono, 10px, --dim, uppercase */ }
.guide-title { /* Syne 700, 17px, --text, line-height 1.3 */ }
```

---

### App tile

```css
.app-tile {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s;
}
.app-tile:hover,
.app-tile.open {
  border-color: var(--g2);
  background: rgba(29, 245, 160, 0.05);
}

/* Icon container */
.app-icon {
  width: 40px; height: 40px;
  background: var(--bg4);
  border-radius: 10px;
  margin: 0 auto 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.app-name { /* DM Sans 500, 12px, --text */ }
.app-cat  { /* DM Mono, 10px, --dim, uppercase, letter-spacing 0.06em */ }
```

**Alternative panel** — expands below the selected tile row. Never a modal.

```css
.alt-panel {
  background: var(--bg3);
  border: 1px solid var(--g);
  border-radius: 16px;
  padding: 32px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 24px;
}

.alt-item {
  background: var(--bg4);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 10px;
}
.alt-item-name { /* DM Sans 600, 14px, --text */ }
.alt-item-desc { /* DM Sans 300, 12px, --muted, line-height 1.5 */ }
```

---

### Support cards

Same structure as pricing cards. Featured card (`border: 1px solid var(--g)`) is the "Täysi tuki" tier.

Include/exclude rows:

```css
.support-item {
  font-size: 13px;
  color: var(--muted);
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-weight: 300;
}
.support-item-icon { color: var(--g); }      /* ✓ */
.support-item-cross { color: var(--dim); }   /* ✗ */
```

---

### Discord block

The only place with a non-dark-green palette. Use a fixed indigo gradient — do not make it responsive to the rest of the design tokens.

```css
.discord-block {
  background: linear-gradient(135deg, #2C2F5B 0%, #1E1F3A 100%);
  border: 1px solid rgba(88, 101, 242, 0.3);
  border-radius: 16px;
  padding: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

/* Channel list */
.discord-channel {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: #5865F2;
}
.discord-channel::before { content: '# '; }

/* CTA button */
.discord-btn {
  background: #5865F2;
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  flex-shrink: 0;
}
```

---

### Admin panel

#### Sidebar

```css
.admin-sidebar {
  width: 220px;
  background: var(--bg2);
  border-right: 1px solid var(--border);
  flex-shrink: 0;
}

.admin-nav-item {
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--muted);
  cursor: pointer;
  border-left: 2px solid transparent;
  transition: all 0.12s;
}
.admin-nav-item.active {
  color: var(--g);
  background: rgba(29, 245, 160, 0.06);
  border-left-color: var(--g);
}

/* Section labels in sidebar */
.admin-section-label {
  padding: 16px 20px 6px;
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: var(--dim);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
```

#### Stat cards

```css
.stat-card {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 18px;
}
.stat-label { /* DM Mono, 10px, --muted, uppercase */ }
.stat-value {
  font-family: 'Syne', sans-serif;
  font-size: 32px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -1px;
}
.stat-delta { /* DM Mono, 11px, --g for positive */ }
```

Colour the stat value when it has semantic meaning:

- Pending count → `color: var(--amber)`
- Done count → `color: var(--g)`
- Revenue → `color: var(--text)` (neutral)

#### Order table

```css
.order-table {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

/* Header row */
.order-table-header {
  background: var(--bg4);
  border-bottom: 1px solid var(--border);
  /* DM Mono, 10px, --dim, uppercase, letter-spacing 0.1em */
}

/* Data row */
.order-row {
  border-bottom: 1px solid var(--border);
  transition: background 0.1s;
}
.order-row:hover { background: rgba(29, 245, 160, 0.03); }
.order-row:last-child { border-bottom: none; }

/* Column text styles */
.order-id    { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--dim); }
.order-name  { font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--text); }
.order-tier  { font-family: 'DM Sans', sans-serif; font-size: 11px; color: var(--muted); }
.order-price { font-family: 'DM Mono', monospace; font-size: 12px; color: var(--text); }
.order-date  { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--dim); }
```

---

## Three.js background (BackgroundCanvas)

**Behaviour spec:**

- **Mixed icon-inspired wireframes** (procedural, no raster logos): stylized **penguin** (Linux vibe), **four-pane window** grid, **gear** (torus), **gem** (octahedron), **disc** (cylinder), **cube**, **torus knot**, plus **icosahedrons** for fill
- Count: ~52–86 on desktop, ~22 on narrow viewports (fewer triangles than the old all-icosa field)
- Random sizes: scale ~0.35–1.5 uniform
- `MeshBasicMaterial` with `wireframe: true`
- ~86% of objects: accent `0xffd54a`, `opacity: 0.06–0.18`
- ~14% of objects: `0xffb800`, `opacity: 0.05–0.10`
- Slow drift: velocity `±0.003` units/frame on x and y only, z = 0
- Slow rotation: `rotation.x += 0.002`, `rotation.y += 0.001` per frame
- Wrap at canvas edges: reverse velocity when `|position.x| > 22` or `|position.y| > 17`
- Camera: `PerspectiveCamera(60)`, `position.z = 20`, no movement
- Lighting: `AmbientLight` only
- Renderer: `{ alpha: true, antialias: true }` — transparent background
- Cap at 30fps: skip frame if `now - lastFrame < 33ms`
- Pause on `document.hidden`
- Destroy + dispose on component unmount
- `prefers-reduced-motion: reduce` → pause all animation, render one centered static shape
- Canvas CSS: `position: fixed; inset: 0; z-index: -1; pointer-events: none`
- Never use `OrbitControls` or any user-interactive camera

The running app should match this wireframe spec unless a deliberate visual experiment replaces it — if so, preserve the **performance and accessibility** rules above.

---

## Motion & transitions

```css
/* Standard hover transition */
transition: all 0.15s ease;

/* Border colour only */
transition: border-color 0.2s ease;

/* Speed bar fill (scroll-triggered) */
transition: width 1.2s cubic-bezier(0.22, 1, 0.36, 1);

/* Guide card underline */
transition: transform 0.2s ease;

/* Guide card underline keyframe start */
transform: scaleX(0);
transform-origin: left;
```

**Animation rules:**

- No bounce, spring, or physics on any UI element (those belong to Three.js only).
- No full-page transitions or route animations in MVP.
- The speed bar fill is the hero animation — it must feel satisfying. Use the cubic-bezier above, not `ease` or `linear`.
- All interactive hover states should respond in `≤150ms`.
- Respect `prefers-reduced-motion`: wrap all `@keyframes` usage in `@media (prefers-reduced-motion: no-preference)`.

---

## Tailwind config summary

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans:    ['DM Sans', 'sans-serif'],
        mono:    ['DM Mono', 'monospace'],
      },
      colors: {
        g:      '#1DF5A0',
        g2:     '#0BBF78',
        g3:     '#085041',
        amber:  '#F5A623',
        bg:     '#080C0A',
        bg2:    '#0E1410',
        bg3:    '#141C18',
        bg4:    '#1A2420',
        text:   '#E8F2EE',
        muted:  '#7A9A8E',
        dim:    '#3D5248',
      },
      borderColor: {
        DEFAULT: 'rgba(29,245,160,0.12)',
        em:      'rgba(29,245,160,0.25)',
        brand:   '#1DF5A0',
      },
    },
  },
  plugins: [],
} satisfies Config
```

---

## Accessibility rules

These are non-negotiable and apply to every component.

- Minimum body font size on public pages: **18px** (`text-lg` in Tailwind)
- Minimum font size anywhere: **11px** (DM Mono labels only)
- Minimum tap target size: **48×48px** on all public pages, 36px in admin
- All interactive elements must have a visible focus ring:

  ```css
  :focus-visible {
    outline: 2px solid var(--g);
    outline-offset: 2px;
  }
  ```

- All images must have `alt` attributes. Decorative images use `alt=""`
- All form inputs must have a visible `<label>` or `aria-label`
- Colour contrast: `--text` on `--bg3` meets WCAG AA. `--muted` on `--bg` does not — never use `--muted` for body text that users need to read.
- Skip-to-content link at the top of the root layout (visually hidden, visible on focus)
- Never rely on colour alone to convey status — always pair with text or icon

---

## Do not

- Use `Inter`, `Roboto`, `Arial`, or any system font stack
- Use `box-shadow` for depth (use layered backgrounds instead)
- Use gradients except on the Discord block or the documented Sparkki for Good banner
- Use any colour outside the defined palette
- Use `--muted` for body text that requires reading (contrast too low)
- Use `--g` for large text blocks (too bright, causes eye strain)
- Use `position: sticky` inside scrollable containers (causes rendering bugs)
- Add `cursor: pointer` to non-interactive elements
- Use `100vh` on mobile (use `100dvh` or `min-h-screen` with Tailwind)
- Use `!important` anywhere
- Hardcode colours inline — always reference CSS variables or Tailwind tokens

---

## Site structure & navigation (updated)

### Route map

```
Public site (locale-prefixed in app: `/[locale]/…`; origin from NEXT_PUBLIC_SITE_URL)
├── /                          Homepage
├── /palvelu                   Service detail + order wizard
├── /tietoa                    Info hub (sidebar layout)
│   ├── /tietoa/linux          About Linux Mint
│   ├── /tietoa/vakaus         Stability & comfort
│   ├── /tietoa/huolia         Common concerns (FAQ)
│   ├── /tietoa/sovellukset/windows   App alternatives — Windows tab
│   └── /tietoa/sovellukset/mac       App alternatives — Mac tab
├── /itse                      DIY hub (guides, videos, USB, Starter Kit)
├── /meista                    About us
│   └── /meista/yhteiso        Community & Discord (subsection)
├── /tuki                      Support
├── /care                      Sparkki Care subscription
├── /koneet                    Compatibility database
│   └── /koneet/[slug]         Individual model page
├── /sparkki-for-good          Sparkki for Good (social pricing); `/…/vire-for-good` → 308 redirect
└── /admin                     Admin panel (protected)
```

### Navigation component — updated structure

Primary nav links:

1. **Palvelu** — direct link to `/palvelu`
2. **Tietoa ▾** — dropdown with:
   - Linux Mintistä → `/tietoa/linux`
   - Vakaus & mukavuus → `/tietoa/vakaus`
   - Yleisiä huolia → `/tietoa/huolia`
   - Sovellukset — Windows → `/tietoa/sovellukset/windows`
   - Sovellukset — Mac → `/tietoa/sovellukset/mac`
3. **Tee itse** — direct link to `/itse`
4. **Meistä ▾** — dropdown with:
   - Yritys → `/meista`
   - Yhteisö & Discord → `/meista/yhteiso`
5. **Tuki** — direct link to `/tuki`
6. **Tilaa →** (CTA button, always rightmost) — `/palvelu#palvelu-tilaa`

The main **Tietoa** label can still deep-link to `/tietoa` where useful; the ▾ control opens the focused submenu above (no Overview/Benefits items in the dropdown — those pages remain reachable from the hub and footer where linked).

Locale-prefixed routes use `/[locale]/…` in the Next.js app (e.g. `/fi/palvelu`).

Dropdown styling:

```css
.sub-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: var(--bg3);
  border: 1px solid var(--border2);
  border-radius: 10px;
  padding: 8px;
  display: none;
  flex-direction: column;
  gap: 2px;
  min-width: 200px;
  z-index: 50;
  margin-top: 4px;
}
.dropdown:hover .sub-menu { display: flex; }
.sub-menu a {
  display: block;
  padding: 7px 12px;
  border-radius: 6px;
  color: var(--muted);
  font-size: 13px;
}
.sub-menu a:hover { color: var(--g); background: rgba(29,245,160,0.08); }
```

---

## Delivery strip component

Appears directly below the nav on the homepage. Communicates all three delivery options at first glance. 5 columns, no scroll.

```css
.delivery-strip {
  display: flex;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: var(--bg2);
}
.d-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-right: 1px solid var(--border);
}
.d-item:last-child { border-right: none; }
.d-icon { font-size: 18px; color: var(--g); flex-shrink: 0; }
.d-text { font-size: 13px; color: var(--muted); font-weight: 300; }
.d-text strong { color: var(--text); font-weight: 500; display: block; font-size: 13px; }
```

Items (in order):

1. 🚚 **Nouto kotoa** / Helsinki-alueella
2. 📦 **Postitus** / Koko Suomeen
3. 🏠 **Omatoiminen tuonti** / Tuo & hae itse
4. ⚡ **2–5 arkipäivää** / Palautusaika
5. 🛡️ **90 pv tuki** / Sisältyy hintaan

---

## Info hub — sidebar layout (`/tietoa`)

The `/tietoa` section uses a **responsive** layout (**Phase 16**): **`lg` and up** — two-column grid with a **sticky** left rail (`InfoHubLayout`); **below `lg`** — a single **horizontally scrolling** tab row. Implementation: `components/layout/InfoHubLayout.tsx` (import `@/components/navigation/InfoHubLayout` resolves via `tsconfig.json`). Legacy file under `components/navigation/InfoHubLayout.tsx` is superseded — remove when convenient.

```css
.info-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 560px;
}
.info-sidebar {
  background: var(--bg2);
  border-right: 1px solid var(--border);
  padding: 24px 0;
}
.info-body {
  padding: 32px 36px;
  background: var(--bg);
}
```

Active sidebar item: `border-left: 2px solid var(--g); color: var(--g); background: rgba(29,245,160,0.05)`.

---

## App alternatives — Windows / Mac tabs

The app alternatives directory lives at `/tietoa/sovellukset` as a subsection of the Info hub. It has two top-level OS tabs.

```css
.os-tabs { display: flex; gap: 6px; margin-bottom: 24px; }
.os-tab {
  padding: 8px 20px;
  border-radius: 8px;
  border: 1px solid var(--border2);
  font-size: 13px;
  color: var(--muted);
  cursor: pointer;
  font-family: 'DM Mono', monospace;
  display: flex;
  align-items: center;
  gap: 7px;
  transition: all 0.15s;
}
.os-tab.active {
  background: rgba(29,245,160,0.1);
  color: var(--g);
  border-color: var(--g);
}
```

Tab labels:

- `🪟 Windows → Linux` — shows Windows app replacements
- `🍎 Mac → Linux` — shows macOS app replacements

Each tab renders the same `<AppGrid>` + `<AppAlternativePanel>` components, filtered by source OS. The `apps.json` data model gains a `sourceOs` field: `"windows" | "mac" | "both"`.

Alt panel expands inline (accordion, never modal). Clicking a different app closes the open panel and opens the new one.

---

## Common concerns section (`/tietoa/huolia`)

Grid of concern cards. Each card has a question (amber icon + text) and a plain-language answer.

```css
.concern-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 20px;
}
.concern-card {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
}
.cc-q {
  font-family: 'Syne', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.cc-q-icon { color: var(--amber); flex-shrink: 0; }
.cc-a { font-size: 13px; color: var(--muted); line-height: 1.6; font-weight: 300; }
.cc-a strong { color: var(--g); font-weight: 500; }
```

Required concern cards (minimum):

1. "Menetänkö tiedostoni?" — data safety answer
2. "Osanko käyttää Linuxia?" — familiarity answer
3. "Entä Word ja Excel?" — app compatibility answer
4. "Onko se turvallinen?" — security answer
5. "Toimiiko kamerani / tulostimeni?" — hardware compatibility answer
6. "Mitä jos jokin menee pieleen?" — support answer

---

## Order wizard — HDD removal step

The HDD removal question is a dedicated card in the wizard, between the delivery method selection and the support tier selection. Style it with an amber border to signal it is an important decision, not just a preference.

```css
.hdd-callout {
  background: rgba(245,166,35,0.07);
  border: 1px solid rgba(245,166,35,0.25);
  border-radius: 10px;
  padding: 16px 18px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin-top: 12px;
}
.hdd-icon { font-size: 20px; color: var(--amber); flex-shrink: 0; }
.hdd-title { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
.hdd-desc { font-size: 13px; color: var(--muted); line-height: 1.55; font-weight: 300; }
.hdd-desc strong { color: var(--amber); font-weight: 500; }
```

Three options (radio-style `<WizOpt>` components):

1. **Sparkki poistaa HDD:n puolestani** (+€20) — recommended, selected by default
2. **Poistan HDD:n itse** (+€0) — includes link to guide
3. **Pidän HDD:n koneessa** (+€0) — not recommended note

The card's outer border is `rgba(245,166,35,0.25)` — amber, not green — to visually differentiate it from neutral wizard steps.

---

## Delivery options — wizard card

Three-column grid inside the wizard. Selected card gets green border.

```css
.del-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.del-card {
  background: var(--bg4);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s;
}
.del-card.sel { border-color: var(--g); background: rgba(29,245,160,0.05); }
.del-card-icon { font-size: 24px; margin-bottom: 8px; color: var(--g); }
.del-card-title { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 3px; }
.del-card-sub { font-size: 11px; color: var(--muted); line-height: 1.4; font-weight: 300; }
.del-note { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--g); margin-top: 5px; }
```

Cards (in order):

1. 🚚 **Nouto kotoa** / "Haemme koneen kotioveltasi" / Helsinki-alue · +€0
2. 📦 **Postitus** / "Lähetät meille, me lähetämme takaisin" / Koko Suomi · +€15
3. 🏠 **Omatoiminen tuonti** / "Tuo itse sovitulle pisteelle" / Helsinki · +€0

---

## About us — community subsection

The `/meista/yhteiso` page is a subsection of About Us, accessible via the Meistä dropdown. It contains the Discord block component (already defined) plus:

- Member count stat
- Channel list (`#yleinen`, `#linux-ohjeet`, `#asennusongelmat`, `#esittele-koneesi`, `#sovellukset`, `#palaute`)
- Community guidelines (brief, friendly)
- Link back to `/itse` guides

The Discord block uses the fixed indigo gradient — same as previously defined. Do not apply brand green tokens to this block.

---

## Sparkki Care subscription page (`/care`)

Three-tier card layout matching the pricing cards pattern. Tiers: Perus / Care+ (featured) / Care Pro.

```css
.care-price {
  font-family: 'Syne', sans-serif;
  font-size: 38px;
  font-weight: 800;
  color: var(--g);
  letter-spacing: -1px;
  margin: 8px 0 4px;
}
.care-price span { font-size: 16px; color: var(--muted); font-weight: 400; }
.care-period { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--muted); margin-bottom: 16px; }
```

Email sequence timeline (shown on the page):

- Day 75: amber — soft reminder
- Day 88: amber — final reminder
- Day 90: neutral — support ends
- Day 91+: green — Care begins

Timeline CSS: four equal-width cells in a flex row, left three with standard `--bg3` + `--border`, rightmost with `rgba(29,245,160,0.06)` background and `var(--g)` border.

---

## Compatibility database (`/koneet`)

### Search bar

```css
.compat-search {
  background: var(--bg3);
  border: 1px solid var(--border2);
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.compat-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  color: var(--text);
  font-weight: 300;
}
```

### Model card

```css
.model-card {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: border-color 0.15s;
}
.model-card:hover { border-color: var(--border2); }
.model-name { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 3px; }
.model-meta { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--dim); }
.model-spec { font-size: 11px; color: var(--muted); background: var(--bg4); padding: 3px 8px; border-radius: 99px; }
```

Status badge on model card: `badge-g` (compatible), `badge-a` (borderline), `badge-r` (incompatible). Always leftmost in the card flex row.

---

## Starter kit product card

Lives on `/itse` below the USB stick order. Flex row: visual (emoji placeholder), content, price.

```css
.kit-card {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 28px;
  display: flex;
  align-items: center;
  gap: 32px;
}
.kit-visual {
  width: 120px; height: 80px;
  background: var(--bg4);
  border-radius: 12px;
  border: 1px solid var(--border2);
  display: flex; align-items: center; justify-content: center;
  font-size: 32px; flex-shrink: 0;
}
.kit-price { font-family: 'Syne', sans-serif; font-size: 36px; font-weight: 800; color: var(--g); letter-spacing: -1px; }
.kit-item { font-size: 13px; color: var(--muted); display: flex; align-items: center; gap: 7px; font-weight: 300; }
.kit-item::before { content: '—'; color: var(--g); font-size: 12px; }
```

---

## Sparkki for Good tier

Banner component on `/sparkki-for-good` and linked from pricing cards with a subtle "Hae alennettu hinta" link.

```css
.good-banner {
  background: linear-gradient(135deg, rgba(29,245,160,0.08) 0%, rgba(29,245,160,0.03) 100%);
  border: 1px solid var(--border2);
  border-radius: 14px;
  padding: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.good-price .was { font-family: 'DM Mono', monospace; font-size: 12px; color: var(--dim); text-decoration: line-through; }
.good-price .now { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; color: var(--g); letter-spacing: -1px; }
```

Eligible groups shown as `badge-g` pills: Eläkeläiset / Työttömät / Opiskelijat / SPR-asiakkaat / Pelastusarmeija.

Pricing (shown in a two-column breakdown card beside the banner):

- SSD Basic: €99 (was €149)
- SSD + RAM: €129 (was €189)

---

## Updated pricing cards — HDD note

Each pricing card now includes a dim note about HDD removal:

```css
/* After the last .pf feature row, before the CTA button */
.pf-note {
  font-size: 11px;
  color: var(--dim);
  padding: 4px 0;
  display: flex;
  align-items: flex-start;
  gap: 7px;
  font-style: italic;
}
```

- SSD Basic: "HDD-poisto +€20 tai itse"
- SSD + RAM: "HDD-poisto +€20 tai itse"
- Full Service: "HDD-poisto sisältyy" (green, not dim)

---

## Updated footer structure

Footer columns (4-column grid):

1. **Logo + tagline** (wider: `1.5fr`)
2. **Palvelu** — Miten toimii, Hinnat, B2B, Tilaa
3. **Tietoa** — Linux Mintistä, Sovellukset, Tee itse, Yhteisö (links to `/meista/yhteiso`)
4. **Yhteys** — public support email from env / Meistä, Tuki, Tietosuoja

Community link in the footer goes to `/meista/yhteiso`, not a standalone `/yhteiso` route.

**Optional** links (Care, compatibility DB, Sparkki for Good, YouTube, Discord, order tracking) may appear in page body or secondary surfaces — they are not required in this minimal footer grid.

---

## Simplified user flows — form rules

These rules override any previous form spec. Every form in Sparkki must pass the minimum-fields test before shipping.

### Principle

**Collect only what is needed to take the next action.** If a field's answer will be provided naturally in a follow-up conversation, do not ask for it upfront. If the answer can be inferred or looked up by Sparkki, do not ask.

---

### Ask a quote (`/palvelu` or any CTA)

**2 fields. No more.**

1. Free text — “Mitä haluaisit tietää tai tehdä?” — placeholder: “Esim: Meillä on 15 vanhaa Dell-läppäriä...”, rows: 4, resize: vertical, hint: “Mallinimi, laitemäärä, aikataulu — mitä ikinä on mielessä.”
2. Phone or email — “Puhelin tai sähköposti” — placeholder: “+358 XX XXX XXXX tai nimi@esimerkki.fi”, hint: “Vastaamme samalla tavalla millä otat yhteyttä.”

Removed: name, computer make, computer model, RAM, disk type, device count, address, subject line. The free-text field replaces all of these — the customer says what is relevant, not what the form dictates.

---

### Order wizard (`/palvelu`)

The consumer checkout lives on **`/palvelu`** (embedded wizard + optional fullscreen via `#palvelu-tilaa`).

**4 steps** in the live wizard: (1) computer description free text, (2) service tier + delivery cards (one step), (3) HDD preference with amber callout, (4) phone-or-email contact **with** order summary and Stripe pay on the same step — there is no separate summary-only step in the stepper.

There is **no separate support-tier step** — default 90-day email support; Care+ upsell at day 75 via email.

**Removed from wizard:** separate make/model fields; RAM; disk type; full name; support tier selector; address fields at checkout (follow-up when needed); structured subject lines.

**Total wizard inputs:** one free-text computer field, tier + delivery card choices, HDD choice, unified contact — then pay.

---

### Support contact (`/tuki`)

**2 fields** when writing a message. Channel self-selects urgency.

Channel selector (3 options, not a “field”): Write a message (default) / Ask on Discord / Call (ma–pe 10–17).

If “Write a message” selected:

1. Textarea — “Mitä tapahtui?” — rows: 3, no resize; placeholder per locale.
2. Phone or email — single field; placeholder: “Sähköposti tai puhelin”.

Removed: order number field; subject line; urgency dropdown; computer model on the form.

---

### USB stick & Starter Kit order (`/itse`)

**3 fields.** Physical delivery requires name and address; email for tracking.

1. Nimi — full name.
2. Postiosoite — single combined address field; hint: Finland shipping; contact first for abroad.
3. Sähköposti — tracking.

Removed: phone; separate postcode/city; confirm email field; redundant country field where implied.

---

### Sparkki for Good application (`/sparkki-for-good`)

**2 fields. Trust first, document later.**

1. Free text — “Miksi haet alennusta?” — rows: 2; hint that proof is not required upfront.
2. Phone or email — single field.

Removed: document upload gating; name; address on the form. Callout: discount confirmed before payment.

---

### Global field rules

- **Phone or email unified** on public quote, wizard contact, support message flow, and Sparkki for Good — one field; server detects type.
- **Name not collected during service checkout** — comes in the first reply. Exception: postal orders (USB / kit) where the label needs a name.
- **Address only when physically needed** — not in the main service wizard at checkout; follow-up when delivery requires it. USB/kit orders ask address once because fulfilment needs it immediately.
- **No confirm-email field.**
- **No separate subject line** — the textarea is the subject.
- **No order number on support** — looked up from contact where possible.
- **No document upload gating** on Sparkki for Good pre-submit.
- **Support tier not in the service wizard** — default EMAIL (90-day); Care+ via lifecycle email.
- **Prefer free text over rigid structure** for “what computer” and similar — staff reads and follows up.


---

## Product experience vision

> Merged from the former **`DESIGN_SYSTEM_IMPROVEMENT.md`** (UX/product transformation brief). This section is **what we say and structure** for normal users; the **refine programme** below is **how the UI is built** (tokens, motion, nav).

### Goal

Transform Sparkki from a technical Linux/upcycling offer into a **calm, trustworthy technology renewal** platform. A non-technical visitor should quickly feel: *I understand this · my computer might still be good · this seems easy · these people are trustworthy · this would simplify my life.*

### Prioritize / avoid

| Prioritize | Avoid |
|------------|--------|
| Clarity over technical accuracy | Hacker / cyberpunk aesthetics |
| Reassurance over complexity | Distro-first or Linux-jargon-led messaging |
| Outcomes over specifications | Repair-shop or dense spec-sheet feeling |
| Visual learning over long text | Long text walls, overwhelming nav |
| Practical benefits over ideology | Neon, excessive parallax, SaaS-dashboard clichés |

**Lead with:** faster everyday use, stability, Finnish support, affordable longevity, “your computer can still be useful.” **Not with:** Linux, open source, distro names as the hero message.

### Tone (FI examples)

- **Good:** “Vanha kone voi tuntua taas nopealta.”
- **Bad:** “Kevyt Linux-distro optimoi resorssienhallinnan.”

Write **practical, calm, human, reassuring** — not forum/engineering/activist voice.

### Product transformation phases — verification (May 2026)

| Phase | Intent | Status | Shipped as / notes |
|-------|--------|--------|-------------------|
| **1 — Homepage** | Service clear in &lt;10s; hero + compatibility entry | **Shipped** | `/` = service landing (`PalveluHero`, hub tabs); **`HomeCompatibilityChecker`** at `#yhteensopivuus` (make/model + specs → `/tilaa`) |
| **1 — Age/use wizard** | 3-step “how old / what for / result” flow | **Deferred** | Replaced by **computer lookup** + **order wizard** (better fit for real orders); do not rebuild unless product asks |
| **2 — Service model** | Life-improvement framing, comparison cards | **Partial** | Wizard tiers (`INSTALL_ONLY`, SSD, RAM, full); **`TransformationCard`**, benefit copy; tier names differ from early brief |
| **3 — Visual info center** | `/tietoa` as visual learning, not blog walls | **Shipped** | Learn hub, Linux/apps/process pages; **`components/ui/DesignSystemSections.tsx`** |
| **4 — Before / after** | Emotional transformation stories | **Partial** | **`TransformationCard`** on home (before/after lists); no full transformation gallery |
| **5 — Trust & support** | Human support, FAQ, guides | **Shipped** | Support blocks, migration FAQ, **`/tuki`**, guides (`/itse`), Care |
| **6 — Process & logistics** | How it works + shipping/pickup | **Shipped** | **`InteractiveDiagram`** (4 steps), logistics **`BenefitGrid`** |
| **7 — Visual & motion** | Calm premium motion, readable type | **Shipped** | See **refine programme** Phases 2–4, 7, 10; ambient sheen; reduced-motion respected |
| **8 — Future** | Marketplace, persona profiles, smart engine | **Backlog** | Track in **`FEATURES.md`** / **`ROADMAP.md`**, not this file |

### Reusable marketing components (shipped)

Implement new educational/marketing blocks via **`components/ui/DesignSystemSections.tsx`**:

- `InfoBlock`, `BenefitGrid`, `FAQAccordion`, `TransformationCard`, `VisualExplainer`, `InteractiveDiagram`

Do not duplicate these patterns ad hoc on public pages.

### Open UX follow-ups (not blocking “done”)

Tracked in **`ROADMAP.md`** § *Order wizard & service landing — UX review (May 2026)*: wizard step split, human-readable summary, home→order edit chip, richer `ComputerModel` data, optional web specs on home checker, etc.

---

## Sparkki refine programme and implementation log

> **Merged** from the former standalone **`DESIGN_SYSTEM_REFINE.md`**. Phases **1–23** record what shipped; **`ROADMAP.md`** and **`FEATURES.md`** remain the backlog and stack contracts.

## Sparkki ⚡

> Calm, tactile Nordic tooling for reviving old machines into fast, beautiful daily drivers.

---

### Phase 1 — implementation log (complete)

Shipped in codebase (incremental):

- [x] **Public brand strings** — UI copy, emails, and `package.json` name → **Sparkki** (email addresses such as `@sparkki.fi` unchanged until DNS/mailbox moves).
- [x] **Color palette** — `app/globals.css` tokens aligned with suggested charcoal + `#FFD54A` / `#FFB800` accent; status success → `#78E08F`.
- [x] **Typography** — body UI font → **Inter** (display stays **Syne**); mono unchanged (DM Mono) for Phase 2 refinement.
- [x] **3D / canvas accents** — wireframe colours match new accent.
- [x] **Daytime theme** — night/day lerp bases updated to new neutrals.
- [x] **App icon** — `app/icon.svg` (spark mark on charcoal).
- [x] **Web manifest** — `app/manifest.ts` (`name` / `short_name` Sparkki).
- [x] **Health API** — `service: "sparkki"`.
- [x] **Nav event** — `sparkki-bg-navigate` (was `vire-bg-navigate`).

### Phase 2 — implementation log (complete)

Shipped in codebase:

- [x] **Spacing** — `--space-*` scale and card padding tokens in `app/globals.css`; Tailwind `spacing` extend (`spark-*`, `spark-card`).
- [x] **Typography scale** — `--text-xs` … `--text-xl`, line-height tokens; Tailwind `fontSize` (`spark-xs`, `spark-sm`, `spark-body`).
- [x] **Motion** — `--duration-*`, `--ease-*`; body background uses `--duration-theme-bg` (separate from route transition).
- [x] **Elevation** — `--shadow-*`, `--shadow-glow-accent`; Tailwind `boxShadow` (`elevation-*`, `glow-accent`).
- [x] **Semantic colors** — aliases (`--color-accent`, `--color-surface-*`, `--color-text-*`, borders, danger/success).
- [x] **Blur / depth** — `--blur-*`; Tailwind `backdropBlur` (`spark-*`); sticky header uses `.surface-header-scrim` + backdrop blur.
- [x] **Radii** — `--radius-*`; Tailwind `borderRadius` (`spark-*`).
- [x] **Dual class names** — `.sparkki-*` mirrors for `.sparkki-card`, `.sparkki-hero`, `.sparkki-eyebrow`, `.sparkki-btn-*` (incremental migration).
- [x] **Hardcoded colors reduced** — Discord block, guide cards, OG image, `global-error`, community page lead use tokens / brand classes.

Follow-ups (later phases or ops):

- [x] Sweep **ROADMAP.md**, **FEATURES.md**, and this **DESIGN_SYSTEM.md** for legacy “Vire” product naming (**Phase 20** — public product name **Sparkki**; `sparkki-*` CSS aliases, `apps/sparkki-checker`, DB name `sparkki`; **Phase 23** adds **`SPARKKI_*`** env aliases with **`VIRE_*`** fallback where applicable).
- [x] Optional URL rename `/vire-for-good` → `/sparkki-for-good` + redirects (**Phase 22** — canonical **`/{locale}/sparkki-for-good`**; legacy path **308** in **`middleware.ts`**, query string preserved).
- [x] Replace `app/favicon.ico` with raster favicons derived from spark mark if needed for older clients (**Phase 21** — `app/favicon.ico` + `app/apple-icon.png` from `app/icon.svg`; regenerate **`./scripts/generate-favicons.sh`**).
- [x] **Later (optional backlog, not a release gate)** — Framer Motion for richer choreography if product asks for it. Public TSX and CSS now use **`sparkki-*`** primitives; legacy **`VIRE_*`** / **`VITE_VIRE_*`** env keys remain for compatibility where documented.

**Checklist status:** All numbered design-system implementation phases in this document through Phase 23 are marked **complete**. The only remaining checkbox is the **Later** optional backlog above.

---

## Brand Rename

### Old Name
Vire

### New Name

**Sparkki**

#### Meaning
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

## Logo Concept

### Primary Direction
A minimal Nordic spark icon combined with a forward-motion shape.

#### Visual Identity
- matte dark UI
- electric warm yellow accent
- charcoal surfaces
- subtle glow
- rounded industrial shapes
- retro-futuristic Finnish utility aesthetic

---

## SVG Logo Concept

```svg
<svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="220" height="220" rx="48" fill="#101214"/>
  <path d="M124 36L72 124H112L96 184L148 96H108L124 36Z"
        fill="#FFD54A"/>
</svg>
```

---

## Product Vision

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

## UX Direction

### Core Principles

#### 1. Calm Interfaces
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

#### 2. Tactile Motion
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

#### 3. Nordic Minimalism
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

## Claude Code Master Tasklist

This file is optimized for:
- Claude Code
- Cursor
- Windsurf
- Cline
- Codex

---

## PHASE 1 — Rebranding

### Tasks

- [x] Rename product-facing references **Vire → Sparkki** in core docs (**Phase 20** — `ROADMAP.md`, `FEATURES.md`, `DESIGN_SYSTEM.md`; technical identifiers unchanged — see Phase 2 follow-ups).
- [x] Update package metadata — `package.json` / lockfile name **sparkki**
- [x] Update browser titles — via **`messages/*`** + metadata helpers (**Sparkki**)
- [x] Replace `app/favicon.ico` with raster favicons derived from spark mark (**Phase 21** — see Phase 2 follow-ups)
- [x] Replace logos — `app/icon.svg` spark mark + layout wiring
- [x] Add new color palette — tokens in **`app/globals.css`** / Tailwind semantic colours
- [x] Add brand typography — Inter + Syne (+ DM Mono) per Phase 2 log
- [x] Update README and docs — ongoing; **Phase 20** naming pass on roadmap + features + design system
- [x] Update environment branding variables (**Phase 23** — **`SPARKKI_FOR_GOOD_NOTIFY_EMAIL`** + desktop **`VITE_SPARKKI_API_BASE`** preferred; **`VIRE_*`** / **`VITE_VIRE_*`** remain supported; ops paths like **`DEPLOY_PATH`** stay host-specific)
- [x] Update app manifest — `app/manifest.ts`

---

## PHASE 2 — Design System

### Goal
Create a coherent premium interface language.

### Tasks

- [x] Create spacing token system
- [x] Create typography hierarchy
- [x] Create motion token system
- [x] Create surface elevation system
- [x] Create semantic color tokens
- [x] Create blur/depth layers
- [x] Standardize border radii
- [x] Remove hardcoded colors (major surfaces; full sweep ongoing)

---

## PHASE 3 — UI Modernization

### Components

#### Buttons
- [x] Add hover lift (`.sparkki-btn-primary` / `.sparkki-btn-primary`, secondary lift)
- [x] Add pressed states (`:active` scale)
- [x] Add loading states (`.sparkki-btn-loading` + spinner; pay CTA in order wizard)
- [x] Add glow accents (hover `shadow-glow-accent`)
- [x] Add keyboard focus states (`:focus-visible` site-wide + button outlines)

#### Cards
- [x] Add layered shadows (token-backed; hover → stronger shadow)
- [x] Add subtle hover motion (`translateY`, respects reduced motion)
- [x] Add depth hierarchy (elevation tokens + hover)
- [x] Improve spacing rhythm (Phase 2 `spark-card` / padding tokens)

#### Inputs
- [x] Add animated focus rings (`.sparkki-input`; wizard computer + contact fields)
- [x] Add inline validation (**Phase 14** — `SupportContactForm` + `OrderWizard`; `lib/contact/contact-field-validation.ts`; `aria-invalid` / `aria-describedby`)
- [x] Improve readability (**Phase 14** — shared validation copy in `messages`; field-level errors under inputs)
- [x] Improve mobile touch UX (**Phase 14** — `.sparkki-input` / `textarea.sparkki-input` use ≥16px on narrow viewports to reduce iOS focus zoom; support form uses `sparkki-input`)

#### Modals
- [x] Add backdrop blur (fullscreen wizard: `.sparkki-modal-backdrop`)
- [x] Add scale transitions (`.sparkki-wizard-full` panel enter)
- [x] Add focus trapping (Tab cycle in fullscreen `OrderWizard`)
- [x] Add ESC handling (existing hash close)

---

## PHASE 4 — Motion System

### Goal
Make the product feel alive and premium.

### Tasks

- [x] Add page transitions (`LocaleMainMotion` + `.sparkki-page-enter` on locale routes)
- [x] Add stagger animations (Phase 13 — **`.sparkki-stagger-children`** on home step / pricing / benefits)
- [x] **Phase 14 — Inputs:** inline validation + readable error copy + mobile input sizing (see Phase 3 → Inputs)
- [x] **Phase 17 — Contextual transitions:** hub-internal navigations use `sparkki-context-enter` (`LocaleMainMotion` + `spark-context-enter` keyframes)
- [x] Add skeleton loaders (utility `.sparkki-skeleton` in `globals.css`; wire where needed)
- [x] Add smooth hover interpolation (token durations/easing on buttons, cards, nav tabs)
- [x] Add animated navigation indicators (nav tab transitions)
- [x] Add spring physics for panels (`.sparkki-wizard-full` uses `--ease-spring`)
- [x] Add contextual transitions (**Phase 17** — `LocaleMainMotion`: same top path segment uses shorter `sparkki-context-enter`; cross-hub uses `sparkki-page-enter`; see `globals.css`)

### Recommended Motion

| Interaction | Duration |
|---|---|
| Hover | 120–180ms |
| Panel open | 220–320ms |
| Route transition | 350–500ms |
| Tooltip | 120ms |

---

## PHASE 5 — Information Architecture

### Goal
Reduce cognitive overload.

### Tasks

- [x] Reduce visible controls per screen (order wizard step 2: bundles + VM behind collapsible add-ons)
- [x] Move advanced settings into expandable sections (migration FAQ accordions; VM legal already in `<details>`)
- [x] Improve grouping of actions (**Phase 15** — `lib/site/main-nav.ts` hub list; mobile sheet “Browse” vs “Order”; ⌘K palette sections; header `Order` + locale as one action group)
- [x] Reduce duplicate navigation (**Phase 15** — primary hubs defined once; palette composes hubs + service extras + “more” instead of one flat duplicate list)
- [x] Improve onboarding clarity (step hint mentions optional add-ons; admin empty states explain next steps)
- [x] Improve visual hierarchy (FAQ cards, dashed empty panels)
- [x] Add empty states (`EmptyState` on admin orders / USB / Care; filter-aware copy + reset on orders)
- [x] Add contextual help (empty-state descriptions; “show all orders” when filters match nothing)

---

## PHASE 6 — Navigation UX

### Tasks

- [x] Add command palette (CMD+K) — `CommandPalette` (`⌘K` / `Ctrl+K`, filterable jump list, focus trap)
- [x] Add keyboard shortcuts — palette toggle + Esc; hint in palette footer and `shortcutHint` on `xl+` header
- [x] Add smart sidebar (**Phase 16** — `/tietoa` `InfoHubLayout`: `lg+` sticky left nav with active rail; `lg` hidden horizontal scroll tabs; lives in `components/layout/InfoHubLayout.tsx`, import path alias in `tsconfig.json`)
- [x] Add recent actions (Phase 12 — recent destinations in **⌘K** palette)
- [x] Add route memory (Phase 12 — **`palette-recent-routes`** + **`CommandPalette`**)
- [x] Add breadcrumb navigation (see **Phase 11**)
- [x] Add mobile drawer navigation — hamburger (`md:hidden`) + slide-over with main links, order CTA, locale

---

## PHASE 7 — Mobile UX

### Tasks

- [x] Optimize thumb reach (mobile nav as **bottom sheet** + drag handle; fullscreen wizard **sticky footer** for Back/Next + safe-area padding)
- [x] Increase tap targets (wizard nav **grid** + `min-h-12` on mobile; sheet links `min-h-12`)
- [x] Add bottom sheets (primary mobile menu: `sparkki-mobile-sheet` slide-up)
- [x] Improve stacked layouts (wizard **2-col** primary actions on small screens)
- [x] Reduce overflow issues (`overflow-x-hidden` on `body`; `break-words` on wizard summary contact)
- [x] Add gesture support (`touch-pan-x` / `touch-pan-y` / `overscroll-*` on wizard + sheet; `touch-none` on background canvas)
- [x] Improve performance on mobile GPUs (fewer wireframe meshes + lower **pixel ratio** cap when viewport &lt; 640px)

---

## PHASE 8 — Performance UX

### Tasks

- [x] Remove layout shifts (order wizard **skeleton** with stable `min-height` + `orderWizardLoading` label while chunk loads)
- [x] Optimize rerenders (**Phase 18** — `React.memo` + stable `useCallback` on `NavBar`, `CommandPalette` list rows, and **`ServiceHubTabs`** tab links; profile deeper surfaces if still hot)
- [x] Add optimistic UI (**Phase 19** — admin guides list: **`GuidePublishToggle`** applies the switch immediately and rolls back on server error; `aria-busy` while the transition is in flight)
- [x] Add route prefetching (`RoutePrefetchWarmup` idle-time `router.prefetch` for top destinations)
- [x] Improve animation performance (footer **`content-visibility: auto`** for cheaper scroll painting)
- [x] Reduce bundle size (Three.js **code-split** via `BackgroundCanvasDynamic` `next/dynamic` + `ssr: false`)
- [x] Add lazy rendering (background canvas + **OrderWizard** deferred on `/palvelu` via `next/dynamic`)

---

## PHASE 9 — Accessibility

### Tasks

- [x] Add visible focus states (global `:focus-visible`; **`summary:focus-visible`** ring for FAQ accordions)
- [x] Improve contrast ratios (lighter **`--dim`** / `dust` / placeholders on charcoal)
- [x] Add keyboard traversal (mobile menu **Tab trap** + initial focus + **focus return** on close; wizard / palette already trapped)
- [x] Add reduced motion mode (`scroll-behavior: auto` on `html`; strip **body theme** transition; existing component-level `prefers-reduced-motion` rules kept)
- [x] Improve semantic HTML (`<main aria-label>` landmark; locale **`role="group"`**; menu button **`aria-haspopup="dialog"`**)
- [x] Add ARIA labels (FI/EN **`aria-label`** + **`aria-current`**; admin locale group label)

---

## PHASE 10 — Emotional UX

### Goal
Make Sparkki feel memorable.

### Tasks

- [x] Add delightful empty states (`EmptyState` spark mark + `sparkki-empty-state` accent / hover)
- [x] Add ambient background animation (`sparkki-ambient-sheen` in `EmotionalUxLayer`)
- [x] Add subtle sound hooks (`lib/site/ui-feedback.ts` — `NEXT_PUBLIC_ENABLE_UI_SOUNDS=true`, respects reduced motion)
- [x] Add contextual microinteractions (nav tab / mobile link press scale; `sparkki-pressable` order CTA)
- [x] Add alive feeling to interface (sheen + header glow + empty-state polish + haptics on primary CTA)
- [x] Add subtle reactive lighting (`--spark-nav-glow` → `sparkki-header-reactive` box-shadow)

---

## PHASE 11 — Breadcrumb navigation

### Goal
Orient users inside deep hubs without duplicating the whole IA.

### Tasks

- [x] Add hub breadcrumbs (`AutoHubBreadcrumbs` in `app/[locale]/layout.tsx` — `/tietoa/*`, service cluster, `/meista` / `/about` / `/yhteiso`)
- [x] Add model detail trail (`KoneetDetailBreadcrumbs` on `/koneet/[slug]`; list view uses auto service crumbs)
- [x] Localised aria label (`nav.breadcrumbAria`); slash separators; last segment `aria-current="page"`

---

## PHASE 12 — Command palette route memory

### Goal
Make repeat navigation faster without adding a permanent sidebar.

### Tasks

- [x] Persist recent locale-free paths (+ hash) in **`localStorage`** (`sparkki-palette-recent-v1`, max 6) via **`lib/site/palette-recent-routes.ts`**
- [x] Record on **`usePathname`** updates + **`hashchange`** (skip `/admin`)
- [x] Show **Recently opened** + **All pages** sections in **`CommandPalette`** when the filter is empty; dedupe catalog rows already listed under recent

---

## PHASE 13 — Staggered list motion

### Goal
Give structured home content a calm sequential entrance (Phase 4 motion backlog).

### Tasks

- [x] Add **`spark-stagger-rise`** keyframes + **`.sparkki-stagger-children`** utility in **`app/globals.css`** (nth-child delays, **`prefers-reduced-motion`** → no animation)
- [x] Apply on home **step strip**, **pricing** grid, and **benefits** grid (`app/[locale]/page.tsx`)

---

## Claude Code Instructions

### Architecture Rules

#### ALWAYS
- use reusable components
- keep motion subtle
- optimize for calm interfaces
- reduce cognitive noise
- use semantic tokens
- support dark mode
- support keyboard navigation

#### NEVER
- use harsh pure black
- overload screens with controls
- use abrupt animations
- hardcode spacing/colors
- use inconsistent motion
- create nested modal chaos

---

## Preferred Stack

### Frontend
- Next.js
- Tailwind
- Framer Motion
- shadcn/ui
- Zustand or Jotai
- React Aria

### Styling Philosophy
- layered depth
- matte surfaces
- warm grays
- sparse accent colors
- spatial hierarchy

---

## Ideal Product Feeling

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

## Suggested Color Palette

### Base
- #101214
- #171A1F
- #20242B

### Text
- #F3F4F6
- #C9CED6
- #8A93A2

### Accent
- #FFD54A
- #FFB800

### Success
- #78E08F

### Error
- #FF6B6B

---

## Suggested Fonts

### UI
- Inter
- Geist
- Satoshi

### Monospace
- JetBrains Mono
- IBM Plex Mono

---

## Final Vision

Sparkki is not just a repair/upcycling utility.

It is:
- digital restoration
- machine revival
- sustainable hacker culture
- Nordic creative tooling
- emotional computing

Every interaction should reinforce:

> "Old hardware deserves another life."


