# Try-Linux lab proxy (noVNC + websockify)

Deploy this folder on a machine that can reach your VNC/websockify backends (default lab host **`192.168.2.100`**). The Sparkki **Info** page links here via `NEXT_PUBLIC_TRY_LINUX_PROXY_BASE`.

## Architecture

```text
Browser  --HTTPS/WSS-->  [nginx :8080]  --HTTP/WS-->  websockify :6080 / :6081  --TCP-->  VNC :5901 / :5902
                              |                    (run on lab host or in VM)
                              +-- /try/mint/    -> upstream mint (default 192.168.2.100:6080)
                              +-- /try/fedora/ -> upstream fedora (default 192.168.2.100:6081)
```

- **nginx** terminates HTTP (add TLS at a reverse proxy or replace with Caddy when you go to prod).
- **websockify** + **noVNC** are expected to already listen on the upstream host/ports (you install and customize Mint/Fedora images separately).

## Quick start

1. `cp .env.example .env` and set **`HTTP_PORT`** if 8080 is taken.
2. Edit **`nginx/default.conf`** — change `upstream` `server` lines if websockify is not on **`192.168.2.100:6080`** / **`:6081`** (e.g. `127.0.0.1` when nginx runs on the same host as websockify).
3. `docker compose up -d`
4. On each demo desktop, run websockify so it serves noVNC and bridges to local VNC, e.g.:

   ```bash
   # Mint desktop (example: VNC display :1 -> port 5901, websockify web on 6080)
   websockify --web /usr/share/novnc 6080 localhost:5901

   # Fedora desktop (example: display :2 -> 5902, web on 6081)
   websockify --web /usr/share/novnc 6081 localhost:5902
   ```

   Paths to noVNC assets vary by distro (`/usr/share/novnc`, `/usr/share/novnc/utils/websockify`, Snap, etc.).

5. Set Sparkki env:

   ```bash
   NEXT_PUBLIC_TRY_LINUX_PROXY_BASE="http://YOUR_PROXY_HOST:8080"
   # optional, same as TRY_LINUX_ACCESS_TOKEN on the proxy:
   # NEXT_PUBLIC_TRY_LINUX_ACCESS_TOKEN="your-long-random-secret"
   ```

6. User-facing entry (after proxy path rewrites): open  
   `{NEXT_PUBLIC_TRY_LINUX_PROXY_BASE}/try/mint/vnc_lite.html`  
   `{NEXT_PUBLIC_TRY_LINUX_PROXY_BASE}/try/fedora/vnc_lite.html`  
   (The Info page builds these automatically.)

## Same host as websockify

If nginx runs **in Docker** on the same Linux host as websockify on **127.0.0.1:6080**, replace `192.168.2.100` in **`nginx/default.conf`** with `172.17.0.1` (default bridge gateway) or use host networking for the proxy container — see Docker docs for your OS.

## Customizing Mint / Fedora later

- Replace VM images, autologin, panel layout, and pinned apps on the **guest** side.
- Keep **websockify ports** and nginx **location prefixes** stable (`/try/mint/`, `/try/fedora/`) so the Sparkki app does not need changes.

## TLS (built-in lab profile)

For **HTTPS with an internal CA** (browsers show a warning until you trust the CA):

```bash
docker compose -f docker-compose.yml -f docker-compose.tls.yml --profile tls up -d
```

- Caddy listens on **`HTTPS_PORT`** (default **8443**) and reverse-proxies to **nginx:80**.
- Point Sparkki at **`https://YOUR_HOST:8443`** (no trailing slash) and trust Caddy’s root in the browser for lab use.
- For a public hostname, replace `tls internal` in **`Caddyfile`** with your ACME / DNS challenge setup (Caddy docs).

## Optional access gate (shared token)

1. Set **`TRY_LINUX_ACCESS_TOKEN`** in **`infra/try-linux/.env`** (same machine as `docker compose`).
2. Set **`NEXT_PUBLIC_TRY_LINUX_ACCESS_TOKEN`** in Sparkki to the **same value** (public env — lab gate only).
3. nginx returns **403** for `/try/*` unless the request includes **`?access_token=...`** (the Info page appends this automatically when the env is set).

Use a long random string (letters, digits, `_`, `-`). Avoid `"` and `\` in the token.

## Rate limiting

**`nginx/conf.d/00-limits.conf`** defines a per-IP limit (**~120 req/min** with burst) on **`/try/mint/`** and **`/try/fedora/`** only. Tune `rate` / `burst` for your lab.

## Security checklist (Phase 6)

- Treat as **lab / demo** until TLS + token + firewall rules match your policy.
- **Never** expose raw VNC (**590x**) to the internet — only **websockify** behind this proxy (or TLS + Caddy).
- Prefer **private network** or VPN for the proxy host; restrict **`HTTP_PORT`** / **`HTTPS_PORT`** with a host firewall.

## Demo desktops (your VMs)

This repo ships the **proxy only**. On each guest (Mint / Fedora):

1. Install **TigerVNC** or **x11vnc** and a desktop session; listen on **localhost** only (e.g. `5901`, `5902`).
2. Run **websockify** bound to **localhost** on **6080** / **6081** as in Quick start — do not publish 608x to `0.0.0.0` on the public internet without TLS and auth in front.

### Snapshots / reset (runbook)

After sessions (or on a schedule):

1. **Shutdown** guest VMs cleanly (or `virsh destroy` only if you accept fs risk).
2. **Revert** to a known snapshot (libvirt: `virsh snapshot-revert …`, VMware: snapshot manager, etc.) **or** re-clone a golden image.
3. **Restart** websockify + VNC on the guest.
4. Optionally **rotate** `TRY_LINUX_ACCESS_TOKEN` if the URL leaked.

Document your hypervisor commands in your ops wiki; the exact CLI depends on KVM / Proxmox / VMware / Hyper-V.

## Production TLS

For production, prefer **public TLS** on your edge (Caddy, Traefik, cloud LB) terminating HTTPS and forwarding to this stack on a private port. The **tls** compose profile above is for **lab HTTPS** only.
