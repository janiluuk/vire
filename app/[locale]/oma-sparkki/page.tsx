import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OmaSparkkiPanel } from "@/components/care/OmaSparkkiPanel";
import { verifyCareAccessToken } from "@/lib/care/care-access-token";
import { prisma } from "@/lib/db/prisma";
import { localePathAlternates } from "@/lib/site/seo";

type Props = {
  params: { locale: string };
  searchParams: { token?: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "omaSparkki" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: false, follow: false },
    ...localePathAlternates(params.locale, "/oma-sparkki"),
  };
}

export default async function OmaSparkkiPage({ params, searchParams }: Props) {
  const t = await getTranslations("omaSparkki");
  const token = searchParams.token?.trim() ?? null;
  const verified = token ? verifyCareAccessToken(token) : null;

  const subscription = verified
    ? await prisma.careSubscription.findUnique({
        where: { customerEmail: verified.email },
      })
    : null;

  const discordUrl =
    process.env.NEXT_PUBLIC_DISCORD_INVITE_URL?.trim() ||
    "https://discord.gg/sparkki";
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_EMBED_URL?.trim() || null;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-12">
      <header>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg font-light text-fog">{t("intro")}</p>
      </header>

      <OmaSparkkiPanel
        locale={params.locale}
        token={token}
        subscription={
          subscription
            ? {
                customerName: subscription.customerName,
                customerEmail: subscription.customerEmail,
                status: subscription.status,
                currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
                cancelledAt: subscription.cancelledAt?.toISOString() ?? null,
              }
            : null
        }
        discordUrl={discordUrl}
        calendlyUrl={calendlyUrl}
      />
    </div>
  );
}
