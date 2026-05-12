"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

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
      className="verso-card mx-auto max-w-3xl p-8 sm:p-10"
      aria-labelledby="speed-heading"
    >
      <h2
        id="speed-heading"
        className="text-2xl font-bold tracking-tight text-gray-900"
      >
        {t("speedBefore")} → {t("speedAfter")}
      </h2>
      <div className="mt-6 space-y-5">
        <div>
          <p className="mb-2 font-medium text-gray-900">{t("speedBefore")}</p>
          <div
            className="h-4 overflow-hidden rounded-full bg-gray-200/90 ring-1 ring-gray-300/40"
            role="presentation"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-gray-400 to-gray-300 transition-all duration-[1800ms] ease-out"
              style={{ width: active ? "100%" : "20%" }}
            />
          </div>
        </div>
        <div>
          <p className="mb-2 font-medium text-verso-green">{t("speedAfter")}</p>
          <div
            className="h-4 overflow-hidden rounded-full bg-verso-green/15 ring-1 ring-verso-green/25"
            role="presentation"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-verso-green to-[#26b384] transition-all duration-[1800ms] ease-out"
              style={{ width: active ? "28%" : "5%" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
