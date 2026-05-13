"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import type { DemoGalleryItem } from "@/components/tietoa/demo-gallery-data";
import {
  FakeDesktopWindow,
  type FakeDesktopVariant,
} from "@/components/tietoa/FakeDesktopWindow";

export function DemoGallerySlideshow({ items }: { items: DemoGalleryItem[] }) {
  const t = useTranslations("tietoa.hub.demo");

  const [index, setIndex] = useState(0);
  const total = items.length;
  const safeIndex = total > 0 ? Math.min(index, total - 1) : 0;
  const active = items[safeIndex];
  const headingId = useId();
  const liveId = `${headingId}-live`;

  const go = useCallback(
    (dir: -1 | 1) => {
      if (total < 1) return;
      setIndex((i) => (i + dir + total) % total);
    },
    [total],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (total < 1 || !active) {
    return null;
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-labelledby={headingId}
      className="space-y-8"
    >
      <h2 id={headingId} className="sr-only">
        {t("sectionTitle")}
      </h2>

      <div className="relative mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-2xl border border-edge bg-sunken/40 p-4 sm:p-6 md:p-8 backdrop-blur-sm">
          <FakeDesktopWindow
            variant={active.variant as FakeDesktopVariant}
            chrome={active.chrome}
            className="mx-auto max-h-[min(72vh,560px)] shadow-2xl"
          />
          <div
            id={liveId}
            className="mt-6 min-h-[4.5rem] text-center"
            aria-live="polite"
          >
            <p className="font-display text-xl font-bold text-ink sm:text-2xl">
              {active.title}
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-lg leading-relaxed text-fog">
              {active.caption}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            className="min-h-tap min-w-tap rounded-xl border border-em bg-card/80 px-5 py-3 text-base font-semibold text-ink backdrop-blur-sm transition-colors duration-150 hover:border-g focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g"
          >
            {t("slidePrev")}
          </button>
          <p className="font-mono text-sm text-fog" aria-hidden>
            {t("slideIndicator", { current: safeIndex + 1, total })}
          </p>
          <button
            type="button"
            onClick={() => go(1)}
            className="min-h-tap min-w-tap rounded-xl border border-em bg-card/80 px-5 py-3 text-base font-semibold text-ink backdrop-blur-sm transition-colors duration-150 hover:border-g focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g"
          >
            {t("slideNext")}
          </button>
        </div>
      </div>

      <ul
        className="flex flex-wrap justify-center gap-3 sm:gap-4"
        aria-label={t("thumbsAria")}
      >
        {items.map((item, i) => {
          const selected = i === safeIndex;
          return (
            <li key={item.variant}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-current={selected ? "true" : undefined}
                aria-label={t("thumbShow", {
                  n: i + 1,
                  title: item.title,
                })}
                className={`overflow-hidden rounded-lg border-2 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g ${
                  selected
                    ? "border-g ring-2 ring-g/30"
                    : "border-transparent opacity-80 hover:border-edge hover:opacity-100"
                }`}
              >
                <div className="w-28 sm:w-36">
                  <FakeDesktopWindow
                    variant={item.variant as FakeDesktopVariant}
                    chrome={item.chrome}
                    className="pointer-events-none max-h-[88px] shadow-md sm:max-h-[96px]"
                  />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
