"use client";

import { useEffect, useRef } from "react";
import {
  parseExplicitCalendlyEmbedDomain,
  withCalendlyInlineEmbedContext,
} from "@/lib/site/calendly-url";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (opts: {
        url: string;
        parentElement: HTMLElement;
      }) => void;
    };
  }
}

const WIDGET_SCRIPT_SRC =
  "https://assets.calendly.com/assets/external/widget.js";
const SCRIPT_MARKER = "data-sparkki-calendly";

type Props = {
  /** Normalised `https://calendly.com/.../event` (no required query params). */
  schedulingUrl: string;
  /** Accessible name for the embedded scheduling region */
  title: string;
};

/**
 * Calendly inline “applet” — loads official widget.js and calls `initInlineWidget`.
 * **`embed_domain`** is set from **`window.location.hostname`** in the browser so it
 * always matches the site the visitor opened (avoids invalid embeds when build-time
 * **`NEXT_PUBLIC_SITE_URL`** was wrong). Override with **`NEXT_PUBLIC_CALENDLY_EMBED_DOMAIN`**.
 */
export function BookingCalendarApplet({ schedulingUrl, title }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) return;

    let cancelled = false;

    function mount() {
      if (cancelled || !parent || !window.Calendly?.initInlineWidget) return;
      parent.replaceChildren();
      const explicit = process.env.NEXT_PUBLIC_CALENDLY_EMBED_DOMAIN?.trim();
      const embedDomain =
        (explicit && parseExplicitCalendlyEmbedDomain(explicit)) ||
        window.location.hostname;
      const embedUrl = withCalendlyInlineEmbedContext(
        schedulingUrl,
        embedDomain,
      );
      window.Calendly.initInlineWidget({
        url: embedUrl,
        parentElement: parent,
      });
    }

    if (window.Calendly) {
      mount();
      return () => {
        cancelled = true;
        parent.replaceChildren();
      };
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[${SCRIPT_MARKER}]`,
    );
    if (existing) {
      const onLoad = () => mount();
      existing.addEventListener("load", onLoad);
      if (window.Calendly) onLoad();
      return () => {
        cancelled = true;
        existing.removeEventListener("load", onLoad);
        parent.replaceChildren();
      };
    }

    const script = document.createElement("script");
    script.src = WIDGET_SCRIPT_SRC;
    script.async = true;
    script.setAttribute(SCRIPT_MARKER, "1");
    script.onload = () => mount();
    document.body.appendChild(script);

    return () => {
      cancelled = true;
      parent.replaceChildren();
    };
  }, [schedulingUrl]);

  return (
    <div
      className="mt-4 overflow-hidden rounded-xl border border-edge bg-card"
      role="region"
      aria-label={title}
    >
      <div
        ref={parentRef}
        className="min-h-[min(700px,80svh)] w-full min-w-[280px] bg-sunken/20"
      />
    </div>
  );
}
