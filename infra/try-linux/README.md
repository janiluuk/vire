# Try-Linux lab proxy (noVNC + websockify)

Deploy this folder on a machine that can reach your VNC/websockify backends (default lab host **`192.168.2.100`**). The Verso **Info** page links here via `NEXT_PUBLIC_TRY_LINUX_PROXY_BASE`.

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

5. Set Verso env:

   ```bash
   NEXT_PUBLIC_TRY_LINUX_PROXY_BASE="http://YOUR_PROXY_HOST:8080"
   ```

6. User-facing entry (after proxy path rewrites): open  
   `{NEXT_PUBLIC_TRY_LINUX_PROXY_BASE}/try/mint/vnc_lite.html`  
   `{NEXT_PUBLIC_TRY_LINUX_PROXY_BASE}/try/fedora/vnc_lite.html`  
   (The Info page builds these automatically.)

## Same host as websockify

If nginx runs **in Docker** on the same Linux host as websockify on **127.0.0.1:6080**, replace `192.168.2.100` in **`nginx/default.conf`** with `172.17.0.1` (default bridge gateway) or use host networking for the proxy container — see Docker docs for your OS.

## Customizing Mint / Fedora later

- Replace VM images, autologin, panel layout, and pinned apps on the **guest** side.
- Keep **websockify ports** and nginx **location prefixes** stable (`/try/mint/`, `/try/fedora/`) so the Verso app does not need changes.

## TLS

Put **Caddy** or **Traefik** in front of this nginx, or terminate TLS on your edge and forward HTTP to port 8080 on the lab proxy.
