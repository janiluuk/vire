import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DiscordWidgetEmbed } from "@/components/yhteiso/DiscordWidgetEmbed";
import { localePathAlternates } from "@/lib/site/seo";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "yhteiso" });
  return {
    title: t("title"),
    description: t("intro"),
    ...localePathAlternates(locale, "/yhteiso"),
    openGraph: {
      title: t("title"),
      description: t("intro"),
      type: "website",
      locale: locale === "fi" ? "fi_FI" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("intro"),
    },
  };
}

export default async function YhteisoPage() {
  const t = await getTranslations("yhteiso");
  const invite = process.env.NEXT_PUBLIC_DISCORD_INVITE;
  const widgetGuildId = process.env.NEXT_PUBLIC_DISCORD_WIDGET_GUILD_ID?.trim();
  const youtubeUrl = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_URL?.trim();
  const showYoutube = Boolean(youtubeUrl && youtubeUrl !== "#");

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <h1 className="text-4xl font-bold text-ink">{t("title")}</h1>
      <p className="text-xl text-ink">{t("intro")}</p>
      {invite && invite !== "#" ? (
        <div className="discord-block">
          <div className="min-w-0 flex-1 space-y-2">
            <p className="discord-channel">yhteiso</p>
            <p className="discord-block-lead text-lg leading-relaxed">{t("discordBlockLead")}</p>
          </div>
          <a
            href={invite}
            className="discord-btn"
            rel="noopener noreferrer"
            target="_blank"
          >
            {t("discordCta")}
          </a>
        </div>
      ) : null}

      {widgetGuildId ? (
        <section aria-labelledby="discord-widget-title" className="space-y-3">
          <h2 id="discord-widget-title" className="text-2xl font-bold text-ink">
            {t("widgetTitle")}
          </h2>
          <p className="text-lg text-ink">{t("widgetIntro")}</p>
          <DiscordWidgetEmbed guildId={widgetGuildId} title={t("widgetIframeTitle")} />
        </section>
      ) : null}

      {showYoutube ? (
        <div className="space-y-3">
          <p className="text-lg text-ink">{t("youtubeIntro")}</p>
          <a
            href={youtubeUrl}
            className="inline-flex min-h-tap items-center justify-center rounded-xl border border-em bg-card px-8 py-3 text-lg font-semibold text-ink hover:border-g focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g"
            rel="noopener noreferrer"
            target="_blank"
          >
            {t("youtubeCta")}
          </a>
        </div>
      ) : null}
      <section aria-labelledby="g-title">
        <h2 id="g-title" className="text-2xl font-bold text-ink">
          {t("guidelinesTitle")}
        </h2>
        <p className="mt-4 text-lg text-ink">{t("guidelinesBody")}</p>
      </section>
    </div>
  );
}
