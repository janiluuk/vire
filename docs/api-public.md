# Vire — public HTTP API

Base URL: `NEXT_PUBLIC_SITE_URL` (e.g. `https://vire.fi`). Locale-prefixed pages live under `/fi/...` and `/en/...`; JSON APIs below are **not** locale-prefixed unless noted.

All public JSON routes respond with `Content-Type: application/json` unless stated otherwise (**`POST /api/csp-report`** returns **204** with an empty body). Prefer `POST` + JSON bodies unless stated otherwise.

---

## Health

### `GET /api/health`

**Response 200**

```json
{ "ok": true, "service": "vire" }
```

Used by Docker Compose `web` healthcheck and synthetic monitors.

---

## CSP violation reports

### `POST /api/csp-report`

Browser-generated **Content Security Policy** violation reports when the active CSP includes **`report-uri`** pointing at this origin (see **`content-security-policy.mjs`** and **`docs/operations.md`**).

**Request**

- Method: **POST**
- **`Content-Type`:** `application/csp-report` or `application/json`
- Body: JSON object, typically `{ "csp-report": { ... } }` per [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy-Report-Only#violation_report_syntax).

**Response**

- **204** — accepted (empty body).
- **400** — malformed JSON.
- **413** — body too large (> 64 KiB).
- **429** — rate limited (per client IP).

Logs **`csp_report.violation`** (and rate-limit events) via structured logging in production.

---

## Service checkout (Stripe)

### `POST /api/checkout`

Creates a **service** `Order` row and a Stripe Checkout Session. Requires Stripe env vars on the server.

**Body (JSON)** — Zod schema (subset):

| Field | Type | Notes |
| --- | --- | --- |
| `tier` | enum | `SSD_BASIC`, `SSD_RAM`, `FULL_SERVICE` |
| `deliveryMethod` | enum | Prisma `DeliveryMethod` |
| `hddRemoval` | enum | `VIRE_REMOVES`, `CUSTOMER_REMOVES`, `KEEP_IN_DEVICE` |
| `computerDescription` | string | free-text “what computer” (stored on `Order.notes` intake) |
| `customerContact` | string | **phone or email** (parsed server-side) |
| `locale` | `"fi"` \| `"en"` | stored on order; used for transactional email |

Support is always **`EMAIL`** at checkout (90-day email support per product copy).

Optional: `dataMigration`, `dataMigrationSize` (`standard` \| `large`) — same validation rules as before.

Postitus (`DROP_OFF`) adds **+€15**; HDD removal by Vire adds **+€20** except when `tier` is `FULL_SERVICE` (included).

**Responses**

- `200` — `{ "url": "<stripe checkout url>", "orderId": "..." }`
- `400` — validation error
- `429` — rate limited (per IP)
- `503` — Stripe not configured

**Headers:** rate limit uses `x-forwarded-for` / `x-real-ip` when present.

---

## USB checkout (Stripe)

### `POST /api/checkout/usb`

Creates a `UsbOrder` and Stripe Checkout Session.

**Body**

| Field | Type |
| --- | --- |
| `customerName` | string |
| `customerEmail` | string |
| `address` | string |
| `locale` | `"fi"` \| `"en"` |

**Responses:** same pattern as service checkout (`url`, `orderId`).

---

## Compatibility (wizard)

### `POST /api/compatibility`

**Body:** `{ "make": string, "model": string, "ramGb"?: number, "diskType"?: "hdd"|"ssd"|"unknown" }`

**Responses:** JSON verdict from `lib/specs/compatibility.ts` (shape depends on client). `429` if rate limited.

---

## Public order lookup

### `POST /api/public/order-lookup`

**Body:** `{ "orderId": string (8–40 chars), "email": string }`

Returns a redacted service or USB order when ID + email match. **429** on rate limit. Does not leak whether an order exists on mismatch (unified error shape).

---

## Laptop spec hints

### `POST /api/public/laptop-specs`

**Body:** `{ "make": string, "model": string }`

Uses SearXNG / optional LLM (server env). **429** on rate limit.

---

## Support contact (`/tuki` form)

### `POST /api/public/support-contact`

**Body:** `{ "contact", "message", "locale": "fi"|"en" }` — `contact` is a single phone-or-email field (parsed server-side).

Requires `SUPPORT_NOTIFY_EMAIL` and Resend. **503** if not configured. **429** on rate limit.

---

## Stripe webhook (server-to-server)

### `POST /api/webhooks/stripe`

- Headers: `stripe-signature` (Stripe signing secret `STRIPE_WEBHOOK_SECRET`).
- Raw body must be verified by Stripe SDK (buffer, not re-parsed JSON).
- Handles `checkout.session.completed` for `metadata.kind` `service` or `usb`.
- **Idempotency:** event id is stored in `StripeProcessedEvent` before processing; duplicates return `200` with `deduped: true`. On handler failure the row is removed so Stripe can retry.

---

## Rate limiting

- **Without** `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`: fixed-window counters **in memory** per Node process (fine for single instance).
- **With** Upstash: same limits enforced in Redis (suitable for serverless / multiple instances).

---

## Versioning

No URL version prefix (`/v1`). Breaking changes should be coordinated with the Vire web app and any external clients (e.g. `apps/vire-checker`).
