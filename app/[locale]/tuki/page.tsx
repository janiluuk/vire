import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BookingCalendarApplet } from "@/components/tuki/BookingCalendarApplet";
import { SupportContactForm } from "@/components/tuki/SupportContactForm";
import { normalizeCalendlySchedulingUrl } from "@/lib/site/calendly-url";
import { localePathAlternates } from "@/lib/site/seo";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "tuki" });
  return {
    title: t("title"),
    description: t("intro"),
    ...localePathAlternates(locale, "/tuki"),
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

export default async function TukiPage() {
  const t = await getTranslations("tuki");
  const calendlyRaw = process.env.NEXT_PUBLIC_CALENDLY_EMBED_URL?.trim() ?? "";
  const calendlyUrl = normalizeCalendlySchedulingUrl(calendlyRaw);

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-12">
      <h1 className="text-4xl font-bold text-ink">{t("title")}</h1>
      <p className="text-xl text-ink">{t("intro")}</p>
      <section aria-labelledby="contact-title">
        <h2 id="contact-title" className="text-2xl font-bold text-ink">
          {t("contactTitle")}
        </h2>
        <p className="mt-2 text-lg font-medium text-ink">{t("phone")}</p>
        <p className="mt-1 text-2xl font-semibold text-vire-green">
          {t("phoneValue")}
        </p>
        <p className="mt-4 text-lg font-medium text-ink">{t("email")}</p>
        <p className="mt-1 text-lg text-ink">{t("emailValue")}</p>
        <p className="mt-2 text-lg text-ink">{t("hours")}</p>
      </section>

      <section aria-labelledby="booking-title" className="vire-card space-y-4 p-6 sm:p-8">
        <h2 id="booking-title" className="text-2xl font-bold text-ink">
          {t("bookingTitle")}
        </h2>
        <p className="text-lg text-ink">{t("bookingIntro")}</p>
        {calendlyRaw && !calendlyUrl ? (
          <p className="rounded-xl border border-danger/40 bg-sunken/40 px-4 py-3 text-lg text-danger">
            {t("bookingInvalidUrl")}
          </p>
        ) : calendlyUrl ? (
          <BookingCalendarApplet
            embedUrl={calendlyUrl}
            title={t("bookingIframeTitle")}
          />
        ) : (
          <p className="rounded-xl border border-edge bg-card/80 px-4 py-3 text-lg text-fog">
            {t("bookingNotConfigured")}
          </p>
        )}
      </section>

      <section aria-labelledby="form-title" className="vire-card space-y-4 p-6 sm:p-8">
        <h2 id="form-title" className="text-2xl font-bold text-ink">
          {t("formTitle")}
        </h2>
        <p className="text-lg text-ink">{t("formIntro")}</p>
        <SupportContactForm />
      </section>
    </div>
  );
}
