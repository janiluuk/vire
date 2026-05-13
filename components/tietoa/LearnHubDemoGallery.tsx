import { getTranslations } from "next-intl/server";

const STYLES = {
  productivity: "from-emerald-900/80 via-g/25 to-canvas",
  gaming: "from-violet-950/90 via-fuchsia-900/40 to-canvas",
  creative: "from-amber-900/70 via-orange-900/30 to-canvas",
  daily: "from-sky-900/75 via-cyan-900/35 to-canvas",
} as const;

function FakeDesktopWindow({
  variant,
  chrome,
}: {
  variant: keyof typeof STYLES;
  chrome: string;
}) {
  return (
    <div
      className={`relative aspect-[4/3] overflow-hidden rounded-xl border border-edge bg-gradient-to-br shadow-lg ${STYLES[variant]}`}
    >
      <div className="flex items-center gap-1.5 border-b border-white/10 bg-black/25 px-3 py-2">
        <span className="size-2.5 rounded-full bg-red-400/80" aria-hidden />
        <span className="size-2.5 rounded-full bg-amber-400/80" aria-hidden />
        <span className="size-2.5 rounded-full bg-g/80" aria-hidden />
        <span className="ml-2 truncate font-mono text-[10px] text-fog/90">
          {chrome}
        </span>
      </div>
      <div className="flex h-[calc(100%-2.5rem)] flex-col gap-2 p-3">
        <div className="h-2 w-3/4 rounded bg-white/10" aria-hidden />
        <div className="h-2 w-1/2 rounded bg-white/10" aria-hidden />
        <div className="mt-auto grid grid-cols-3 gap-2">
          <div className="h-10 rounded border border-white/10 bg-white/5" aria-hidden />
          <div className="h-10 rounded border border-white/10 bg-white/5" aria-hidden />
          <div className="h-10 rounded border border-white/10 bg-white/5" aria-hidden />
        </div>
      </div>
    </div>
  );
}

export async function LearnHubDemoGallery() {
  const t = await getTranslations("tietoa.hub.demo");

  const items = (
    [
      ["productivity", "productivityTitle", "productivityCaption", "workbench.desktop"] as const,
      ["gaming", "gamingTitle", "gamingCaption", "steam.desktop"] as const,
      ["creative", "creativeTitle", "creativeCaption", "studio.desktop"] as const,
      ["daily", "dailyTitle", "dailyCaption", "browser.desktop"] as const,
    ] as const
  ).map(([variant, titleKey, captionKey, chromeKey]) => ({
    variant,
    title: t(titleKey),
    caption: t(captionKey),
    chrome: t(chromeKey),
  }));

  return (
    <section aria-labelledby="hub-demo-title" className="space-y-6">
      <div>
        <h2 id="hub-demo-title" className="font-display text-2xl font-bold text-ink md:text-3xl">
          {t("sectionTitle")}
        </h2>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-fog">
          {t("sectionIntro")}
        </p>
      </div>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ variant, title, caption, chrome }) => (
          <li key={variant} className="flex flex-col gap-3">
            <FakeDesktopWindow variant={variant} chrome={chrome} />
            <div>
              <p className="font-semibold text-ink">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-fog">{caption}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
