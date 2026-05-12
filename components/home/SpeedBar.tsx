"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

const fillEase = "cubic-bezier(0.22, 1, 0.36, 1)";

export function SpeedBar() {
  const t = useTranslations("home");
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setActive(true);
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="vire-card mx-auto max-w-[340px] sm:max-w-3xl"
      aria-labelledby="speed-heading"
    >
      <h2
        id="speed-heading"
        className="font-display text-2xl font-extrabold tracking-tight text-ink"
      >
        {t("speedBefore")} → {t("speedAfter")}
      </h2>
      <div className="mt-6 space-y-5">
        <div>
          <p className="mb-2 font-normal text-ink">{t("speedBefore")}</p>
          <div
            className="speed-track h-1.5 overflow-hidden rounded-full bg-sunken"
            role="presentation"
          >
            <div
              className="h-full rounded-full bg-danger"
              style={{
                width: active ? "92%" : "0%",
                transition: `width 1.2s ${fillEase}`,
              }}
            />
          </div>
        </div>
        <div>
          <p className="mb-2 font-normal text-g">{t("speedAfter")}</p>
          <div
            className="speed-track h-1.5 overflow-hidden rounded-full bg-sunken"
            role="presentation"
          >
            <div
              className="h-full rounded-full bg-g"
              style={{
                width: active ? "14%" : "0%",
                transition: `width 1.2s ${fillEase}`,
              }}
            />
          </div>
        </div>
      </div>
      <p className="speed-verdict mt-5 rounded-[10px] border border-edge bg-g/[0.06] px-3.5 py-3.5 font-mono text-[13px] leading-relaxed text-g">
        {t("speedVerdict")}
      </p>
    </section>
  );
}
