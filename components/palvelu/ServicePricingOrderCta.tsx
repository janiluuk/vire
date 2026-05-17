"use client";

import { Link } from "@/i18n/navigation";
import { ORDER_WIZARD_PATH } from "@/lib/site/order-wizard-path";
import { usePrefetchRouteHandlers } from "@/lib/site/route-prefetch";

type Props = {
  label: string;
};

export function ServicePricingOrderCta({ label }: Props) {
  const prefetch = usePrefetchRouteHandlers(ORDER_WIZARD_PATH);

  return (
    <Link
      href={ORDER_WIZARD_PATH}
      className="sparkki-btn-primary min-h-tap shrink-0 justify-center px-6 py-3 text-sm font-semibold"
      {...prefetch}
    >
      {label}
    </Link>
  );
}
