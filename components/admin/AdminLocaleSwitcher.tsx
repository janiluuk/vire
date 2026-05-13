"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { setAdminLocale } from "@/app/admin/locale-actions";

export function AdminLocaleSwitcher({ current }: { current: "fi" | "en" }) {
  const pathname = usePathname() ?? "/admin";
  const t = useTranslations("admin");

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 border-b border-edge bg-sunken/40 px-4 py-2 text-base text-ink">
      <span className="font-semibold text-fog">{t("adminLocaleLabel")}</span>
      <div
        className="inline-flex gap-1 rounded-lg border border-em bg-card p-0.5"
        role="group"
        aria-label={t("adminLocaleLabel")}
      >
        <button
          type="button"
          aria-pressed={current === "fi"}
          disabled={current === "fi"}
          onClick={() => void setAdminLocale("fi", pathname)}
          className="min-h-tap min-w-[3rem] rounded-md px-3 py-1 font-semibold disabled:bg-sparkki-green disabled:text-canvas"
        >
          {t("adminLocaleFi")}
        </button>
        <button
          type="button"
          aria-pressed={current === "en"}
          disabled={current === "en"}
          onClick={() => void setAdminLocale("en", pathname)}
          className="min-h-tap min-w-[3rem] rounded-md px-3 py-1 font-semibold disabled:bg-sparkki-green disabled:text-canvas"
        >
          {t("adminLocaleEn")}
        </button>
      </div>
    </div>
  );
}
