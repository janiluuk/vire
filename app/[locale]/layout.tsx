import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { BackgroundCanvasDynamic } from "@/components/layout/BackgroundCanvasDynamic";
import { DeliveryStripGate } from "@/components/layout/DeliveryStripGate";
import { LocaleMainMotion } from "@/components/layout/LocaleMainMotion";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { RoutePrefetchWarmup } from "@/components/layout/RoutePrefetchWarmup";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "nav" });
  return {
    title: {
      template: `%s | ${t("brand")}`,
      default: t("brand"),
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "nav" });

  return (
    <NextIntlClientProvider messages={messages}>
      <BackgroundCanvasDynamic />
      <div className="relative z-10 flex min-h-screen flex-col">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-g focus:px-4 focus:py-3 focus:text-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g"
        >
          {t("skipToContent")}
        </a>
        <NavBar locale={locale} />
        <DeliveryStripGate />
        <main
          id="content"
          lang={locale}
          aria-label={t("mainLandmark")}
          className="flex min-h-0 flex-1 flex-col"
        >
          <LocaleMainMotion>{children}</LocaleMainMotion>
        </main>
        <Footer />
        <CommandPalette />
        <RoutePrefetchWarmup />
      </div>
    </NextIntlClientProvider>
  );
}
