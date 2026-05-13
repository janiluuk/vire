# Calendly booking on `/tuki`

The support page (`/[locale]/tuki`) loads Calendly’s **inline scheduling widget** when **`NEXT_PUBLIC_CALENDLY_EMBED_URL`** is set.

The app **appends** **`embed_type=Inline`** and **`embed_domain=<host>`** to that URL at render time (unless you already set them in the env value). **`embed_domain`** is taken from **`NEXT_PUBLIC_SITE_URL`** (hostname only, no port) or from optional **`NEXT_PUBLIC_CALENDLY_EMBED_DOMAIN`**. Without a correct **`embed_domain`**, Calendly often shows **“This Calendly URL is not valid.”** on real deployments (e.g. `https://sparkki.dudeisland.eu`) and on the lab host (**`192.168.2.100`**).

## Keys and secrets

**There is no API key or client secret** for this embed. Calendly’s public event link is enough. Anything you put in **`NEXT_PUBLIC_*`** is exposed to browsers — never put private tokens there.

## Where to put the URL

| Place | Use when |
|--------|-----------|
| **`.env`** or **`.env.local`** in the **project root** | Local `npm run dev` / `next build` on your machine |
| **Docker Compose** | In **`.env`**: **`NEXT_PUBLIC_CALENDLY_EMBED_URL`**, **`NEXT_PUBLIC_SITE_URL`** (public origin, e.g. `https://sparkki.dudeisland.eu` or `http://192.168.2.100:1337`), then **rebuild** `web`. Optional: **`NEXT_PUBLIC_CALENDLY_EMBED_DOMAIN`** if the hostname Calendly should see differs from **`NEXT_PUBLIC_SITE_URL`**. **`docker-compose.override.yml`** passes these as **build args** (required for `NEXT_PUBLIC_*` inlining). |
| **Vercel / Railway / etc.** | Project → Environment variables → Production & Preview — set **`NEXT_PUBLIC_SITE_URL`** and **`NEXT_PUBLIC_CALENDLY_EMBED_URL`**, then redeploy. |

After changing **`NEXT_PUBLIC_*`** values, **rebuild** the Next.js app. In **Docker**, those variables are normally inlined during **`npm run build`** in the image builder stage — setting them only on the running container is **not enough** for statically generated content unless you also pass them as **build arguments** when building the image (see your `Dockerfile` / `docker-compose.yml`).

The repo **`Dockerfile`** builder declares **`ARG NEXT_PUBLIC_SITE_URL`**, **`ARG NEXT_PUBLIC_CALENDLY_EMBED_DOMAIN`**, and **`ARG NEXT_PUBLIC_CALENDLY_EMBED_URL`**. **`docker-compose.override.yml`** adds matching **`web.build.args`**. Set variables in **`.env`** and run **`docker compose build web && docker compose up -d`** (use **`--no-cache`** if they changed and the layer was cached).

**Lab / `192.168.2.100`:** ensure **`/srv/vire/.env`** (or your **`DEPLOY_PATH`**) includes a valid HTTPS Calendly scheduling link **and** a matching site origin, for example:

```bash
NEXT_PUBLIC_CALENDLY_EMBED_URL="https://calendly.com/your-user/your-event"
NEXT_PUBLIC_SITE_URL="http://192.168.2.100:1337"
NEXTAUTH_URL="http://192.168.2.100:1337"
```

Then redeploy (e.g. **`./scripts/lab-stack-up.sh`**) so the image rebuilds with those values inlined.

**Production (`sparkki.dudeisland.eu`):** set **`NEXT_PUBLIC_SITE_URL=https://sparkki.dudeisland.eu`** (no trailing slash) in the host’s env / platform settings and rebuild. If Calendly still blocks the embed, confirm the event link is active in Calendly and regenerate **Copy link** / **Add to website → Inline** and update **`NEXT_PUBLIC_CALENDLY_EMBED_URL`**.

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
- URL validation + inline context: `lib/site/calendly-url.ts` (`normalizeCalendlySchedulingUrl`, `resolveCalendlyEmbedDomain`, `withCalendlyInlineEmbedContext`)
