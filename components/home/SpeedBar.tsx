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
      className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
      aria-labelledby="speed-heading"
    >
      <h2 id="speed-heading" className="text-2xl font-bold text-gray-900">
        {t("speedBefore")} → {t("speedAfter")}
      </h2>
      <div className="mt-6 space-y-4">
        <div>
          <p className="mb-2 font-medium text-gray-900">{t("speedBefore")}</p>
          <div
            className="h-4 rounded-full bg-gray-300 transition-all duration-[1800ms] ease-out"
            style={{ width: active ? "100%" : "20%" }}
            role="presentation"
          />
        </div>
        <div>
          <p className="mb-2 font-medium text-verso-green">{t("speedAfter")}</p>
          <div
            className="h-4 rounded-full bg-verso-green transition-all duration-[1800ms] ease-out"
            style={{ width: active ? "28%" : "5%" }}
            role="presentation"
          />
        </div>
      </div>
    </section>
  );
}
