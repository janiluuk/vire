"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { LaptopSpecsCard } from "@/components/laptop-specs/LaptopSpecsCard";
import type { LaptopSpecsInsight } from "@/lib/specs/laptop-specs";
import type { PublicServiceOrder, PublicUsbOrder } from "@/lib/orders/public-order";
import {
  isAppBundleId,
  type AppBundleId,
} from "@/lib/billing/app-bundles";
import { isPortableVmHandoff } from "@/lib/billing/portable-vm";

type TilausBundleKey =
  | "bundle_local_ai"
  | "bundle_media_creator"
  | "bundle_music_production"
  | "bundle_developer_essentials";

const TILAUS_BUNDLE_MSG: Record<AppBundleId, TilausBundleKey> = {
  local_ai: "bundle_local_ai",
  media_creator: "bundle_media_creator",
  music_production: "bundle_music_production",
  developer_essentials: "bundle_developer_essentials",
};

type Props =
  | { variant: "hub" }
  | { variant: "prefill"; orderId: string };

export function OrderTrackingForm(props: Props) {
  const t = useTranslations("tilaus");
  const locale = useLocale();
  const [orderId, setOrderId] = useState(
    props.variant === "prefill" ? props.orderId : "",
  );
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<PublicServiceOrder | PublicUsbOrder | null>(null);
  const [laptopSpecs, setLaptopSpecs] = useState<LaptopSpecsInsight | null>(null);

  const idReadOnly = props.variant === "prefill";

  const canSubmit = useMemo(
    () => orderId.trim().length >= 8 && email.includes("@"),
    [orderId, email],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOrder(null);
    setLaptopSpecs(null);
    setLoading(true);
    try {
      const res = await fetch("/api/public/order-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderId.trim(),
          email: email.trim(),
        }),
      });
      if (res.status === 429) {
        setError(t("errorRateLimit"));
        return;
      }
      const data = (await res.json()) as
        | {
            ok: true;
            order: PublicServiceOrder | PublicUsbOrder;
            laptopSpecs?: LaptopSpecsInsight;
          }
        | { ok: false; code: string };

      if (!res.ok || !data.ok) {
        setError(t("errorNotFound"));
        return;
      }
      setOrder(data.order);
      setLaptopSpecs(data.laptopSpecs ?? null);
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="sparkki-card space-y-6 p-6 sm:p-8">
        <div>
          <label htmlFor="track-order-id" className="mb-2 block font-semibold text-ink">
            {t("fieldOrderId")}
          </label>
          <input
            id="track-order-id"
            name="orderId"
            required
            readOnly={idReadOnly}
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="min-h-tap w-full rounded-lg border border-em bg-card px-4 font-mono text-lg read-only:bg-sunken"
          />
        </div>
        <div>
          <label htmlFor="track-email" className="mb-2 block font-semibold text-ink">
            {t("fieldEmail")}
          </label>
          <input
            id="track-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-tap w-full rounded-lg border border-em px-4 text-lg"
          />
        </div>
        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="min-h-tap rounded-xl bg-sparkki-green px-8 py-3 font-semibold text-canvas hover:opacity-[0.85] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? t("submitLoading") : t("submit")}
        </button>
        <p className="text-sm text-fog">{t("privacyHint")}</p>
      </form>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-amber/30 bg-amber/10 px-4 py-3 text-lg text-ink"
        >
          {error}
        </p>
      ) : null}

      {order ? (
        <OrderSummary
          order={order}
          locale={locale}
          laptopSpecs={laptopSpecs}
        />
      ) : null}
    </div>
  );
}

function OrderSummary({
  order,
  locale,
  laptopSpecs,
}: {
  order: PublicServiceOrder | PublicUsbOrder;
  locale: string;
  laptopSpecs: LaptopSpecsInsight | null;
}) {
  const t = useTranslations("tilaus");
  if (order.kind === "usb") {
    return (
      <section
        aria-labelledby="order-summary-usb"
        className="sparkki-card space-y-4 p-6 sm:p-8"
      >
        <h2 id="order-summary-usb" className="text-2xl font-bold text-ink">
          {t("summaryTitleUsb")}
        </h2>
        <dl className="grid gap-4 text-lg text-ink sm:grid-cols-[minmax(10rem,auto)_1fr]">
          <dt className="font-semibold text-fog">{t("fieldRef")}</dt>
          <dd className="font-mono">{order.id}</dd>
          <dt className="font-semibold text-fog">{t("fieldDate")}</dt>
          <dd>{new Date(order.createdAt).toLocaleString(locale)}</dd>
          <dt className="font-semibold text-fog">{t("fieldStatus")}</dt>
          <dd>{order.status}</dd>
          <dt className="font-semibold text-fog">{t("fieldCustomer")}</dt>
          <dd>{order.customerName}</dd>
          <dt className="font-semibold text-fog">{t("fieldShipTo")}</dt>
          <dd className="whitespace-pre-line">{order.address}</dd>
        </dl>
      </section>
    );
  }

  const o = order;
  const price = (o.priceEur / 100).toFixed(2);
  return (
    <section
      aria-labelledby="order-summary-service"
      className="sparkki-card space-y-4 p-6 sm:p-8"
    >
      <h2 id="order-summary-service" className="text-2xl font-bold text-ink">
        {t("summaryTitleService")}
      </h2>
      <dl className="grid gap-4 text-lg text-ink sm:grid-cols-[minmax(10rem,auto)_1fr]">
        <dt className="font-semibold text-fog">{t("fieldRef")}</dt>
        <dd className="font-mono">{o.id}</dd>
        <dt className="font-semibold text-fog">{t("fieldDate")}</dt>
        <dd>{new Date(o.createdAt).toLocaleString(locale)}</dd>
        <dt className="font-semibold text-fog">{t("fieldUpdated")}</dt>
        <dd>{new Date(o.updatedAt).toLocaleString(locale)}</dd>
        <dt className="font-semibold text-fog">{t("fieldStatus")}</dt>
        <dd>{t(`status_${o.status}` as "status_PENDING")}</dd>
        <dt className="font-semibold text-fog">{t("fieldTier")}</dt>
        <dd>{t(`tier_${o.tier}` as "tier_SSD_BASIC")}</dd>
        <dt className="font-semibold text-fog">{t("fieldSupport")}</dt>
        <dd>{t(`support_${o.supportTier}` as "support_FULL")}</dd>
        <dt className="font-semibold text-fog">{t("fieldDelivery")}</dt>
        <dd>{t(`delivery_${o.deliveryMethod}` as "delivery_HOME_PICKUP")}</dd>
        {o.dataMigration ? (
          <>
            <dt className="font-semibold text-fog">{t("fieldMigration")}</dt>
            <dd>
              {o.dataMigrationSize === "large"
                ? t("migrationLarge")
                : o.dataMigrationSize === "standard"
                  ? t("migrationStandard")
                  : t("emptyValue")}
            </dd>
          </>
        ) : null}
        {o.appBundleIds.length > 0 ? (
          <>
            <dt className="font-semibold text-fog">{t("fieldAppBundles")}</dt>
            <dd>
              {o.appBundleIds
                .map((id) =>
                  isAppBundleId(id) ? t(TILAUS_BUNDLE_MSG[id]) : id,
                )
                .join(", ")}
            </dd>
          </>
        ) : null}
        {o.portableVmAddon ? (
          <>
            <dt className="font-semibold text-fog">{t("fieldPortableVm")}</dt>
            <dd>
              {o.portableVmHandoff &&
              isPortableVmHandoff(o.portableVmHandoff)
                ? o.portableVmHandoff === "CUSTOMER_STORAGE"
                  ? t("portableVmHandoffCustomer")
                  : t("portableVmHandoffShipped")
                : t("emptyValue")}
            </dd>
          </>
        ) : null}
        <dt className="font-semibold text-fog">{t("fieldComputer")}</dt>
        <dd>
          {[o.computerMake, o.computerModel].filter(Boolean).join(" ") ||
            o.notes ||
            t("emptyValue")}
        </dd>
        <dt className="font-semibold text-fog">{t("fieldCustomer")}</dt>
        <dd>
          {o.customerName ?? o.customerEmail ?? o.customerPhone ?? t("emptyValue")}
        </dd>
        {o.customerEmail ? (
          <>
            <dt className="font-semibold text-fog">{t("fieldEmail")}</dt>
            <dd>{o.customerEmail}</dd>
          </>
        ) : null}
        {o.customerPhone ? (
          <>
            <dt className="font-semibold text-fog">{t("fieldPhone")}</dt>
            <dd>{o.customerPhone}</dd>
          </>
        ) : null}
        {o.address ? (
          <>
            <dt className="font-semibold text-fog">{t("fieldAddress")}</dt>
            <dd className="whitespace-pre-line">{o.address}</dd>
          </>
        ) : null}
        {o.preferredDate ? (
          <>
            <dt className="font-semibold text-fog">{t("fieldPreferredDate")}</dt>
            <dd>{new Date(o.preferredDate).toLocaleDateString(locale)}</dd>
          </>
        ) : null}
        {o.notes ? (
          <>
            <dt className="font-semibold text-fog">{t("fieldNotes")}</dt>
            <dd className="whitespace-pre-line">{o.notes}</dd>
          </>
        ) : null}
        <dt className="font-semibold text-fog">{t("fieldPrice")}</dt>
        <dd>
          {price} €
        </dd>
      </dl>
      {order.kind === "service" && laptopSpecs != null ? (
        <LaptopSpecsCard
          className="mt-6"
          insight={laptopSpecs}
          labels={{
            title: t("specsTitle"),
            referenceTitle: t("specsReferenceTitle"),
            loading: t("specsLoading"),
            empty: t("specsEmpty"),
            link: t("specsLink"),
          }}
        />
      ) : null}
    </section>
  );
}
