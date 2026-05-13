# Calendly booking on `/tuki`

The support page (`/[locale]/tuki`) loads Calendly’s **inline scheduling widget** when **`NEXT_PUBLIC_CALENDLY_EMBED_URL`** is set.

## Keys and secrets

**There is no API key or client secret** for this embed. Calendly’s public event link is enough. Anything you put in **`NEXT_PUBLIC_*`** is exposed to browsers — never put private tokens there.

## Where to put the URL

| Place | Use when |
|--------|-----------|
| **`.env`** or **`.env.local`** in the **project root** | Local `npm run dev` / `next build` on your machine |
| **Docker Compose** | Add **`NEXT_PUBLIC_CALENDLY_EMBED_URL`** to the **`.env`** Compose reads, then **rebuild** `web`. This repo ships **`docker-compose.override.yml`**, which passes the variable as a **build arg** (required for `NEXT_PUBLIC_*` inlining). |
| **Vercel / Railway / etc.** | Project → Environment variables → Production & Preview |

After changing **`NEXT_PUBLIC_*`** values, **rebuild** the Next.js app. In **Docker**, those variables are normally inlined during **`npm run build`** in the image builder stage — setting them only on the running container is **not enough** for statically generated content unless you also pass them as **build arguments** when building the image (see your `Dockerfile` / `docker-compose.yml`).

The repo **`Dockerfile`** already declares **`ARG NEXT_PUBLIC_CALENDLY_EMBED_URL`** for the builder. **`docker-compose.override.yml`** adds **`web.build.args`** so Compose passes **`${NEXT_PUBLIC_CALENDLY_EMBED_URL}`** from **`.env`** into the build. Set the variable in **`.env`** and run **`docker compose build web && docker compose up -d`** (use **`--no-cache`** if the URL changed and the layer was cached).

**Lab / `192.168.2.100`:** ensure **`/srv/vire/.env`** (or your **`DEPLOY_PATH`**) contains the same line, then redeploy (e.g. **`./scripts/lab-stack-up.sh`**) so the image rebuilds.

## Where the URL comes from (Calendly UI)

1. Log in at [calendly.com](https://calendly.com).
2. Open **Scheduling** → **Event types** (or your dashboard event list).
3. Choose the event → **Copy link** (public invite link).

   Alternatively: **Add to website** → **Inline embed** → copy the `https://calendly.com/...` URL from the snippet.

4. Set (example — replace **`30min`** with your event slug from **Copy link**):

   ```bash
   NEXT_PUBLIC_CALENDLY_EMBED_URL="https://calendly.com/janiluuk/30min"
   ```

Allowed hosts: **`calendly.com`** only, scheme **`https`**.

## CSP (optional hardening)

If you enable **Content-Security-Policy-Report-Only** in `next.config.mjs`, ensure **`script-src`** includes **`https://assets.calendly.com`** (widget loader). Add it next to the existing Stripe entries in the `script-src` directive. **`frame-src`** / **`connect-src`** should already allow Calendly domains.

## Implementation reference

- Component: `components/tuki/BookingCalendarApplet.tsx`
- URL validation: `lib/site/calendly-url.ts`
