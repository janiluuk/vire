"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Alt = {
  name: string;
  descFi: string;
  descEn?: string;
  url: string;
  preinstalled: boolean;
};

export type AppItem = {
  id: string;
  name: string;
  category: string;
  icon: string;
  alternatives: Alt[];
};

const categories = [
  "toimisto",
  "selain",
  "sahkoposti",
  "musiikki",
  "kuvat",
  "viestinta",
  "tietoturva",
  "pelit",
] as const;

export function AppGrid({ apps }: { apps: AppItem[] }) {
  const t = useTranslations("sovellukset");
  const locale = useLocale();
  const [cat, setCat] = useState<string | "all">("all");
  const [open, setOpen] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (cat === "all") return apps;
    return apps.filter((a) => a.category === cat);
  }, [apps, cat]);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCat("all")}
          className={`min-h-tap rounded-full px-4 py-2 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-verso-green ${
            cat === "all"
              ? "bg-verso-green text-white"
              : "bg-white text-gray-900 ring-1 ring-gray-300"
          }`}
        >
          {t("filterAll")}
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={`min-h-tap rounded-full px-4 py-2 font-semibold capitalize focus-visible:outline focus-visible:outline-2 focus-visible:outline-verso-green ${
              cat === c
                ? "bg-verso-green text-white"
                : "bg-white text-gray-900 ring-1 ring-gray-300"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((app) => (
          <li key={app.id} className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setOpen(open === app.id ? null : app.id)}
              className="flex w-full min-h-tap flex-col items-start gap-1 p-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-verso-green"
              aria-expanded={open === app.id}
            >
              <span className="text-xs font-bold uppercase text-verso-green">
                {app.category}
              </span>
              <span className="text-xl font-bold text-gray-900">{app.name}</span>
            </button>
            {open === app.id ? (
              <div className="border-t border-gray-100 px-5 pb-5 pt-2">
                {app.alternatives.map((alt) => (
                  <div key={alt.name} className="mt-4 rounded-xl bg-gray-50 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900">{alt.name}</h3>
                      {alt.preinstalled ? (
                        <span className="rounded-full bg-verso-amber px-2 py-0.5 text-sm font-semibold text-gray-900">
                          {t("preinstalledBadge")}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-lg text-gray-900">
                      {locale === "en" && alt.descEn ? alt.descEn : alt.descFi}
                    </p>
                    <a
                      href={alt.url}
                      className="mt-3 inline-block min-h-tap font-semibold text-verso-green underline underline-offset-2"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {alt.url}
                    </a>
                  </div>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
