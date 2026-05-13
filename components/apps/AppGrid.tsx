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
  /** Windows vs Mac source app; `both` lists under either filter. */
  sourceOs?: "windows" | "mac" | "both";
  icon: string;
  alternatives: Alt[];
};

function matchesSourceFilter(
  app: AppItem,
  filter: "windows" | "mac",
): boolean {
  const o = app.sourceOs ?? "both";
  return o === "both" || o === filter;
}

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

export function AppGrid({
  apps,
  sourceOsFilter,
}: {
  apps: AppItem[];
  /** When set, only apps with this source OS (or `both`) are shown. */
  sourceOsFilter?: "windows" | "mac";
}) {
  const t = useTranslations("sovellukset");
  const locale = useLocale();
  const [cat, setCat] = useState<string | "all">("all");
  const [open, setOpen] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = apps;
    if (sourceOsFilter) {
      list = list.filter((a) => matchesSourceFilter(a, sourceOsFilter));
    }
    if (cat === "all") return list;
    return list.filter((a) => a.category === cat);
  }, [apps, cat, sourceOsFilter]);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCat("all")}
          className={`min-h-tap rounded-full border px-4 py-2 text-sm font-normal transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-g ${
            cat === "all"
              ? "border-g bg-g/[0.12] text-g"
              : "border-em text-fog hover:bg-g/[0.05] hover:text-ink"
          }`}
        >
          {t("filterAll")}
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={`min-h-tap rounded-full border px-4 py-2 text-sm font-normal capitalize transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-g ${
              cat === c
                ? "border-g bg-g/[0.12] text-g"
                : "border-em text-fog hover:bg-g/[0.05] hover:text-ink"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((app) => (
          <li
            key={app.id}
            className={`rounded-xl border bg-card transition-all duration-150 ${
              open === app.id
                ? "border-g2 bg-g/[0.05]"
                : "border-edge hover:border-g2"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpen(open === app.id ? null : app.id)}
              className="flex w-full min-h-tap flex-col items-start gap-1 p-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-sparkki-green"
              aria-expanded={open === app.id}
            >
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-dust">
                {app.category}
              </span>
              <span className="text-base font-medium text-ink">{app.name}</span>
            </button>
            {open === app.id ? (
              <div className="border-t border-edge px-5 pb-5 pt-2">
                {app.alternatives.map((alt) => (
                  <div key={alt.name} className="mt-4 rounded-xl bg-canvas p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-ink">{alt.name}</h3>
                      {alt.preinstalled ? (
                        <span className="rounded-full bg-sparkki-amber px-2 py-0.5 text-sm font-semibold text-ink">
                          {t("preinstalledBadge")}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-lg text-ink">
                      {locale === "en" && alt.descEn ? alt.descEn : alt.descFi}
                    </p>
                    <a
                      href={alt.url}
                      className="mt-3 inline-block min-h-tap font-semibold text-sparkki-green underline underline-offset-2"
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
