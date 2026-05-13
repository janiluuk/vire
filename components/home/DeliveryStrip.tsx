"use client";

import { useTranslations } from "next-intl";

export function DeliveryStrip() {
  const t = useTranslations("deliveryStrip");

  const items = [
    { key: "pickup" as const, icon: "🚚" },
    { key: "ship" as const, icon: "📦" },
    { key: "self" as const, icon: "🏠" },
    { key: "turnaround" as const, icon: "⚡" },
    { key: "support" as const, icon: "🛡️" },
  ];

  return (
    <div
      role="region"
      aria-label={t("ariaLabel")}
      className="vire-delivery-strip border-y border-edge bg-raised/70 text-ink backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-[1100px] flex-col divide-y divide-edge sm:flex-row sm:divide-x sm:divide-y-0">
        {items.map(({ key, icon }) => (
          <div
            key={key}
            className="flex flex-1 items-center gap-2.5 px-5 py-3.5 sm:px-5 sm:py-3.5"
          >
            <span className="shrink-0 text-lg text-g" aria-hidden>
              {icon}
            </span>
            <div className="min-w-0 text-[13px] font-light leading-snug text-fog">
              <strong className="block font-medium text-ink">
                {t(`${key}.title`)}
              </strong>
              <span>{t(`${key}.sub`)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
