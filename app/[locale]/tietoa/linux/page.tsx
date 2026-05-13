import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { localePathAlternates } from "@/lib/site/seo";
import { TryLinuxSection } from "@/components/tietoa/TryLinuxSection";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "tietoa" });
  return {
    title: t("linux.metaTitle"),
    description: t("linux.metaDescription"),
    ...localePathAlternates(locale, "/tietoa/linux"),
  };
}

const PROCESS_KEYS = ["processStep1", "processStep2", "processStep3"] as const;
const OS_KEYS = ["osMint", "osFedora"] as const;
const HARDWARE_KEYS = ["hardwareSsd", "hardwareRam"] as const;

export default async function TietoaLinuxPage() {
  const t = await getTranslations("tietoa.linux");

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header>
        <p className="font-mono text-[11px] font-normal uppercase tracking-[0.15em] text-g">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg font-light leading-relaxed text-fog">{t("intro")}</p>
      </header>

      <section aria-labelledby="upgrade-process-title" className="space-y-4">
        <h2
          id="upgrade-process-title"
          className="font-display text-2xl font-bold tracking-tight text-ink"
        >
          {t("processTitle")}
        </h2>
        <ol className="list-decimal space-y-3 pl-5 text-lg font-light leading-relaxed text-fog marker:text-g">
          {PROCESS_KEYS.map((key) => (
            <li key={key} className="pl-1">
              {t(key)}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="upgrade-os-title" className="space-y-4">
        <h2
          id="upgrade-os-title"
          className="font-display text-2xl font-bold tracking-tight text-ink"
        >
          {t("osTitle")}
        </h2>
        <p className="text-lg font-light leading-relaxed text-fog">{t("osIntro")}</p>
        <ul className="space-y-3 border-l-2 border-g/35 pl-5 text-lg font-light leading-relaxed text-fog">
          {OS_KEYS.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="upgrade-hw-title" className="space-y-4">
        <h2
          id="upgrade-hw-title"
          className="font-display text-2xl font-bold tracking-tight text-ink"
        >
          {t("hardwareTitle")}
        </h2>
        <ul className="space-y-3 text-lg font-light leading-relaxed text-fog">
          {HARDWARE_KEYS.map((key) => (
            <li key={key} className="flex gap-3">
              <span className="text-g" aria-hidden>
                ◆
              </span>
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="upgrade-hdd-title"
        className="vire-card border-g/25 bg-g/[0.04] p-6 sm:p-8"
      >
        <h2
          id="upgrade-hdd-title"
          className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl"
        >
          {t("hddTitle")}
        </h2>
        <p className="mt-4 text-lg font-light leading-relaxed text-fog">{t("hddBody")}</p>
      </section>

      <p className="text-center text-base font-light leading-relaxed text-fog sm:text-left">
        {t("tryHint")}
      </p>
      <TryLinuxSection />
    </div>
  );
}
