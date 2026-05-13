# Vire Checker

Small **Tauri 2** desktop app that runs the same pure **`checkCompatibility`** logic as the Vire website (`../../lib/specs/compatibility.ts`). Output is JSON (`input` + `output`) with optional copy-to-clipboard.

## Prerequisites

- **Rust** toolchain (`cargo`, `rustc`)
- **Node 20+**
- **Linux**: WebKitGTK and other [Tauri Linux dependencies](https://v2.tauri.app/start/prerequisites/) (e.g. Debian: `libwebkit2gtk-4.1-dev`, `build-essential`, `libssl-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`)

## Commands

```bash
cd apps/vire-checker
npm install
npm run tauri dev          # desktop window + hot reload
npm run build              # Vite frontend only (into dist/)
npm run tauri build        # native installer / bundle
```

The Vite dev server defaults to port **1420** (see `vite.config.ts`). The Rust crate is **`vire-checker`** (`src-tauri/`).

---

## Laptop spec / AI lookup (LAN) — how it relates to this app

**Important:** Web search (SearXNG) and the optional **local LLM** are implemented in the **Next.js** app (`lib/specs/laptop-specs.ts`, `POST /api/public/laptop-specs`), **not** inside Vire Checker. The checker UI only runs **`checkCompatibility`** offline in the webview.

### Where env vars live

Configure these on the machine that runs **`next dev`**, **`next start`**, or the **`web` Docker service** — *not* in `apps/vire-checker/.env` unless you later add a networked feature.

| Variable | Purpose |
|----------|---------|
| `SPECS_SEARXNG_BASE_URL` | SearXNG base (no trailing slash). If unset, SearXNG search is skipped. |
| `SPECS_AI_BASE_URL` | OpenAI-compatible or Ollama base, e.g. `http://127.0.0.1:11434`. **Must be reachable from the Node.js process** (see below). |
| `SPECS_AI_MODEL` | Model id on your server (e.g. `llama3`). |
| `SPECS_AI_KIND` | `openai` \| `ollama` \| `auto` (default `auto`). |
| `SPECS_AI_API_KEY` | Optional `Bearer` for OpenAI-compatible gateways. |
| `SPECS_LOOKUP_ENABLED` | Set to `false` to disable all spec lookups. |

See repo root **`.env.example`** for the full list.

### Reachability from Docker vs host

- **`SPECS_AI_BASE_URL`** must point at a host:port the Vire **Node process** can reach (same machine, Docker gateway, or routed LAN).
- If Vire runs in **Docker** and the LLM is on another host, the container must be able to route to that address (often **`extra_hosts`**, **host** network for `web`, or run the stack on the LLM host). A bridge-only container may **not** reach arbitrary LAN IPs.
- **SearXNG** needs outbound HTTPS from the Node process to whatever you set in `SPECS_SEARXNG_BASE_URL`.

### Using spec hints today (without changing the checker)

1. **Browser:** open your deployed Vire **`/palvelu`** wizard or **`/tilaus`** — they call `POST /api/public/laptop-specs` / order lookup server-side.
2. **CLI on LAN:** from any host that can reach Vire:

   ```bash
   curl -sS -X POST "http://localhost:1337/api/public/laptop-specs" \
     -H "Content-Type: application/json" \
     -d '{"make":"Lenovo","model":"ThinkPad T480"}' | jq .
   ```

   Replace host/port with your `APP_PORT` / reverse proxy URL.

### Optional LAN spec fetch (Vire API)

**Shipped (optional):** when **`VITE_SPARKKI_API_BASE`** (preferred) or legacy **`VITE_VIRE_API_BASE`** is set in `apps/vire-checker/.env` (e.g. `http://127.0.0.1:1337`), the **Hae speksit verkosta** button calls **`POST {base}/api/public/laptop-specs`** and prints JSON (including HTTP status) in the output panel. Same origin / CORS rules apply as in a normal browser; **Tauri** may require your API host to be reachable from the webview (see `src-tauri/tauri.conf.json` CSP).

For stricter Tauri deployments, add an **HTTP allowlist** / plugin scope for your API origin per [Tauri security](https://v2.tauri.app/security/).

Until **`VITE_SPARKKI_API_BASE`** / **`VITE_VIRE_API_BASE`** is set, the checker remains the **offline compatibility / JSON** tool for local `checkCompatibility`; the **site** still provides full **networked spec hints** with SearXNG/LLM on the server.
