# Model search & laptop specs — setup guide

Sparkki uses **two related but separate** lookup paths. Configure the right pieces for what you are testing.

| Feature | API / code | Needs PostgreSQL | Needs SearXNG | Needs Ollama |
|--------|------------|------------------|---------------|--------------|
| Home compatibility checker, order wizard step 1 | `POST /api/public/computer-lookup` → `lib/orders/computer-lookup.ts` | **Yes** (`ComputerModel`, optional `LaptopReferenceSpec`) | No | No |
| Web-enriched spec hints (summary + link) | `POST /api/public/laptop-specs` → `lib/specs/laptop-specs.ts` | Optional (`LaptopReferenceSpec` adds `referenceSummary`) | **Yes** (for web results) | Optional (better summaries) |
| Order status page extras | `POST /api/public/order-lookup` | Order row | Uses `resolveLaptopSpecs` when `SPECS_*` set | Optional |
| Admin → AI testing | `/admin/ai-testing` | — | Same as laptop-specs | Same |
| Admin → Models | `/admin/models` | **Yes** (all three tables below) | — | — |

All `SPECS_*` calls run **on the Sparkki Node.js server** (Docker `web`, `next start`, or `next dev`). The browser never talks to SearXNG or Ollama directly.

---

## 1. Database (required for home / wizard model match)

### Tables

- **`ComputerModel`** — Sparkki’s own compatibility list (make, model, years, verdict, SSD slot, max RAM, status). Powers list matching and the compatibility estimate on the home checker.
- **`LaptopReferenceSpec`** — Imported retail-style catalog (`data/reference-laptops.json`). Powers CPU/RAM/storage **reference** rows in the specs table (not an official manufacturer spec sheet).
- **`LaptopSpecsInternetCache`** — Persisted SearXNG/LLM results (`summary`, `specUrl`) per make+model+locale. Filled automatically on each live `resolveLaptopSpecs` call; repeat lookups skip the web until `expiresAt`. View and counts in **Admin → Models** (`/admin/models`).

See also [`data/README-reference-laptops.md`](../data/README-reference-laptops.md).

### Commands

```bash
# From repo root, with DATABASE_URL set
npx prisma migrate deploy
npx prisma db seed
```

Seed creates:

- A few sample **`ComputerModel`** rows (ThinkPad T450, Latitude E6440, …).
- **`LaptopReferenceSpec`** rows from `data/reference-laptops.json` (only if the table is empty).

### Ongoing data

- Add or edit verified models in **Admin → Models** (`/admin/models`).
- To refresh reference data: replace `data/reference-laptops.json`, clear `LaptopReferenceSpec`, re-run seed (or add an import script).

### Verify DB lookup (no web)

```bash
curl -sS -X POST "http://127.0.0.1:1337/api/public/computer-lookup" \
  -H "Content-Type: application/json" \
  -d '{"description":"Lenovo ThinkPad T450","locale":"fi"}' | jq .
```

Expect `ok: true`, `result.matches` (if the model is in `ComputerModel`), and optional reference fields when a `LaptopReferenceSpec` row matches.

---

## 2. Environment variables (web search + LLM)

Copy from [`.env.example`](../.env.example). Minimal set for **your** infrastructure:

```bash
# Laptop spec lookup (server-side only)
SPECS_SEARXNG_BASE_URL="https://search.dudeisland.eu"
SPECS_AI_BASE_URL="http://192.168.2.101:11434"
SPECS_AI_MODEL="qwen3.5:9b"
SPECS_AI_KIND="ollama"
# SPECS_AI_API_KEY=""          # only for OpenAI-compatible gateways with auth
# SPECS_LOOKUP_ENABLED="false" # omit or leave unset to enable; "false" disables all lookups
```

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | All lookups persist/read models and reference specs. |
| `SPECS_SEARXNG_BASE_URL` | For web hints | **No trailing slash.** Base URL only; code calls `{base}/search?format=json`. |
| `SPECS_AI_BASE_URL` | For LLM summaries | Must be reachable **from the Node process** (see networking below). |
| `SPECS_AI_MODEL` | If LLM used | Must exist on Ollama (`ollama list` on `192.168.2.101`). Default in code is `llama3` if unset — **set this explicitly** (e.g. `qwen3.5:9b` or `qwen2.5:14b`). |
| `SPECS_AI_KIND` | Recommended | `ollama` \| `openai` \| `auto`. Use **`ollama`** for a native Ollama host. |
| `SPECS_AI_API_KEY` | Optional | `Bearer` token for OpenAI-compatible `/v1/chat/completions`. |
| `SPECS_LOOKUP_ENABLED` | Optional | Set to `false` to disable SearXNG/LLM/reference enrichment everywhere. |
| `SPECS_CACHE_TTL_DAYS` | Optional | Days to keep cached lookups that returned a summary or spec URL (default **30**). |
| `SPECS_CACHE_EMPTY_TTL_HOURS` | Optional | Hours to cache empty SearXNG results (default **24**, avoids hammering failed searches). |

Restart the app after changing env vars.

### Lookup order (web specs)

1. In-memory cache (per Node process, ~6 h).
2. **`LaptopSpecsInternetCache`** in PostgreSQL (if not expired).
3. Live SearXNG (+ optional LLM), then **upsert** into the database.

Reference dataset text (`referenceSummary`) is always resolved fresh from **`LaptopReferenceSpec`** on each request.

---

## 3. SearXNG (`https://search.dudeisland.eu`)

### What Sparkki calls

```
GET {SPECS_SEARXNG_BASE_URL}/search?q={query}&format=json
Accept: application/json
```

Query example: `Lenovo ThinkPad T450 laptop specifications review`.

Timeout: **12 s**. On failure or empty results, `summary` / `specUrl` stay null (reference DB text may still appear).

### SearXNG instance requirements

On the SearXNG host, in `settings.yml` (or equivalent):

```yaml
search:
  formats:
    - html
    - json
```

Without **`json`** in `formats`, the API returns no usable results.

### Reverse proxy / security

From a generic egress IP, `curl` to your instance may return **403 Forbidden** if the proxy, WAF, or SearXNG limiter blocks non-browser or server clients. Sparkki uses the same `fetch()` — it will fail the same way.

**Checklist for SearXNG (fix 403 / empty results):**

- [ ] `search.formats` includes **`json`**
- [ ] `/search?format=json` returns **200** and a JSON body with a `results` array when curled **from the same host/network as Sparkki** (not only from your laptop browser)
- [ ] Reverse proxy (nginx, Caddy, Traefik) forwards `/search` without blocking server `User-Agent`s
- [ ] Cloudflare / bot fight / mod_security rules allow your Sparkki server egress IP (or disable for that path)
- [ ] SearXNG **limiter** plugin: exempt your Sparkki IP or raise limits for API use
- [ ] TLS certificate valid for HTTPS from Docker/container (if Sparkki runs in Docker)
- [ ] Outbound HTTPS from Sparkki container/host to `search.dudeisland.eu:443` allowed

### Test from the Sparkki server

Run this **on the machine (or inside the container) that runs Node**:

```bash
curl -sS -o /tmp/searx.json -w "%{http_code}\n" \
  "https://search.dudeisland.eu/search?q=Lenovo+ThinkPad+T450+laptop+specifications&format=json" \
  -H "Accept: application/json"
head -c 400 /tmp/searx.json
```

- **200** + JSON with `"results": [...]` → SearXNG side is OK for Sparkki.
- **403** → fix proxy/WAF/limiter (see checklist above) before debugging Sparkki.

---

## 4. Ollama (`http://192.168.2.101:11434`)

### What Sparkki calls

With `SPECS_AI_KIND=ollama` (recommended):

```
POST {SPECS_AI_BASE_URL}/api/chat
```

With `openai` or `auto` (tries OpenAI route first):

```
POST {SPECS_AI_BASE_URL}/v1/chat/completions
```

The model must return JSON like: `{"summary":"...","specPageUrl":"https://..."}` (Finnish summary in the system prompt).

Timeout: **45 s** per LLM call.

### Ollama checklist

- [ ] Ollama listens on `192.168.2.101:11434` (or adjust `SPECS_AI_BASE_URL`)
- [ ] Model pulled: `ollama pull qwen3.5:9b` (or whichever you set in `SPECS_AI_MODEL`)
- [ ] `SPECS_AI_MODEL` matches `ollama list` name exactly (e.g. `qwen3.5:9b`, not `llama3`)
- [ ] Sparkki **Node process** can reach `http://192.168.2.101:11434` (firewall, routing)
- [ ] If Sparkki runs in **Docker**: bridge network often **cannot** reach LAN IPs — use `host` network, `extra_hosts`, run on the same host as Ollama, or point at `host.docker.internal` where applicable

### Test from the Sparkki server

```bash
curl -sS "http://192.168.2.101:11434/api/tags" | jq '.models[].name'
curl -sS -X POST "http://192.168.2.101:11434/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen3.5:9b","stream":false,"messages":[{"role":"user","content":"Reply with {\"summary\":\"test\",\"specPageUrl\":null}"}]}' \
  | jq '.message.content'
```

---

## 5. End-to-end test (web + LLM)

### Public API

```bash
curl -sS -X POST "http://127.0.0.1:1337/api/public/laptop-specs" \
  -H "Content-Type: application/json" \
  -d '{"make":"Lenovo","model":"ThinkPad T450","locale":"fi"}' | jq .
```

Expect:

```json
{
  "ok": true,
  "summary": "...",
  "specUrl": "https://...",
  "referenceSummary": "..." 
}
```

- **`summary` / `specUrl`** need SearXNG (and usually LLM for a clean summary).
- **`referenceSummary`** only needs `LaptopReferenceSpec` in the DB.

### Admin UI

Open **`/admin/ai-testing`** (admin login required). The env panel shows whether SearXNG and LLM URLs are configured; use the form to run the same pipeline interactively.

---

## 6. Rate limits & caching

- **`POST /api/public/computer-lookup`**: 40 requests / minute / IP.
- **`POST /api/public/laptop-specs`**: 20 requests / minute / IP.
- In-memory **6 h cache** per make+model+locale inside `resolveLaptopSpecs` (per Node process).
- Optional **`UPSTASH_REDIS_*`** for shared rate limits across instances ([`docs/api-public.md`](./api-public.md)).

---

## 7. Quick checklist — what you might still be missing

### Home page / wizard (`computer-lookup`)

- [ ] `DATABASE_URL` + `prisma migrate deploy` + `prisma db seed`
- [ ] Models you care about exist in **`ComputerModel`** (seed only has 5 examples)
- [ ] `data/reference-laptops.json` present; **`LaptopReferenceSpec`** imported (re-seed if table was empty at first deploy)

### Web search (`laptop-specs` / order lookup extras)

- [ ] `SPECS_SEARXNG_BASE_URL=https://search.dudeisland.eu` (no trailing slash)
- [ ] JSON search works **from the Sparkki host** (see §3 curl — **403 must be fixed on SearXNG/proxy**)
- [ ] `SPECS_AI_BASE_URL=http://192.168.2.101:11434`
- [ ] `SPECS_AI_MODEL` set to a **pulled** model (`qwen3.5:9b` or `qwen2.5:14b`, not default `llama3`)
- [ ] `SPECS_AI_KIND=ollama`
- [ ] `SPECS_LOOKUP_ENABLED` is **not** `false`
- [ ] Docker/network path from Sparkki → LAN `192.168.2.101:11434` if applicable

### Not required for basic model match

- SearXNG and Ollama are **not** used by `computer-lookup` today. The home checker specs table comes from **`ComputerModel`** + **`LaptopReferenceSpec`** only. Web search enriches **`/api/public/laptop-specs`**, order lookup, and admin AI testing.

---

## Related files

| Path | Role |
|------|------|
| `lib/orders/computer-lookup.ts` | Wizard / home compatibility |
| `lib/specs/laptop-specs.ts` | SearXNG + LLM |
| `lib/specs/laptop-specs-cache.ts` | PostgreSQL cache read/write |
| `lib/specs/laptop-reference-lookup.ts` | Reference dataset matching |
| `lib/specs/compatibility.ts` | Verdict rules |
| `app/api/public/computer-lookup/route.ts` | Public computer API |
| `app/api/public/laptop-specs/route.ts` | Public web-spec API |
| `apps/sparkki-checker/README.md` | Desktop app vs server env |
| `.env.example` | Variable templates |
