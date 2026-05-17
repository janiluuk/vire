"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useTranslations } from "next-intl";

function OrderWizardSkeleton() {
  const t = useTranslations("palvelu");
  return (
    <div
      className="sparkki-card mx-auto max-w-4xl min-h-[28rem] scroll-mt-28 p-6 md:min-h-[32rem] md:p-10"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={t("orderWizardLoading")}
    >
      <div className="sparkki-skeleton mb-6 h-8 max-w-xs rounded-lg" />
      <div className="sparkki-skeleton mb-4 h-4 max-w-full rounded-md" />
      <div className="sparkki-skeleton mb-4 h-4 max-w-[90%] rounded-md" />
      <div className="sparkki-skeleton h-32 max-w-full rounded-xl" />
    </div>
  );
}

const OrderWizardClient = dynamic(
  () => import("./OrderWizard").then((mod) => ({ default: mod.OrderWizard })),
  {
    ssr: false,
    loading: () => <OrderWizardSkeleton />,
  },
);

export function OrderWizardLazy({
  locale,
  fullscreenOnOrderPage = false,
}: {
  locale: string;
  fullscreenOnOrderPage?: boolean;
}) {
  return (
    <Suspense fallback={<OrderWizardSkeleton />}>
      <OrderWizardClient
        locale={locale}
        fullscreenOnOrderPage={fullscreenOnOrderPage}
      />
    </Suspense>
  );
}
