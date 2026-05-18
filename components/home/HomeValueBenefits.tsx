import { getTranslations } from "next-intl/server";

type ValueCard = {
  icon: string;
  title: string;
  body: string;
  accent: "accent" | "amber" | "neutral";
};

function cardClass(accent: ValueCard["accent"]) {
  if (accent === "accent") {
    return "border-g/35 bg-g/[0.06]";
  }
  if (accent === "amber") {
    return "border-amber/30 bg-amber/[0.06]";
  }
  return "border-edge bg-card/70";
}

export async function HomeValueBenefits() {
  const t = await getTranslations("palvelu");

  const items: ValueCard[] = [
    {
      icon: "↺",
      title: t("valueBoostTitle"),
      body: t("valueBoostBody"),
      accent: "accent",
    },
    {
      icon: "◇",
      title: t("valueOsTitle"),
      body: t("valueOsBody"),
      accent: "neutral",
    },
    {
      icon: "✓",
      title: t("valueVerifyTitle"),
      body: t("valueVerifyBody"),
      accent: "amber",
    },
    {
      icon: "◎",
      title: t("valueCareTitle"),
      body: t("valueCareBody"),
      accent: "accent",
    },
  ];

  return (
    <section className="space-y-8" aria-labelledby="home-value-title">
      <header className="mx-auto max-w-3xl text-center">
        <p className="sparkki-eyebrow justify-center">{t("valueEyebrow")}</p>
        <h2
          id="home-value-title"
          className="font-display text-balance text-3xl font-extrabold tracking-section text-ink md:text-4xl"
        >
          {t("valueTitle")}
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-fog">{t("valueIntro")}</p>
      </header>

      <div className="sparkki-stagger-children grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.title}
            className={`sparkki-card-hover relative overflow-hidden rounded-spark-xl border p-7 sm:p-8 ${cardClass(
              item.accent,
            )}`}
          >
            <div
              className="pointer-events-none absolute -right-6 -top-6 size-28 rounded-full border border-edge/60 bg-canvas/30"
              aria-hidden
            />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
              <span
                className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-edge bg-canvas/80 font-display text-3xl text-g"
                aria-hidden
              >
                {item.icon}
              </span>
              <div className="min-w-0 flex-1 space-y-2">
                <h3 className="font-display text-xl font-bold text-ink sm:text-2xl">
                  {item.title}
                </h3>
                <p className="text-base leading-relaxed text-fog">{item.body}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
