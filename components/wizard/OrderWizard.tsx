"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { DeliveryMethod, SupportTier } from "@prisma/client";
import { LaptopSpecsCard } from "@/components/laptop-specs/LaptopSpecsCard";
import type { LaptopSpecsInsight } from "@/lib/specs/laptop-specs";
import {
  DATA_MIGRATION_LARGE_CENTS,
  DATA_MIGRATION_STANDARD_CENTS,
  serviceOrderTotalWithMigrationCents,
} from "@/lib/billing/pricing";

type Tier = "SSD_BASIC" | "SSD_RAM" | "FULL_SERVICE";

type CompatApi = {
  status: string;
  reasons: string[];
  speedGainEstimate: string;
};

const REASON_KEYS = new Set([
  "already_ssd",
  "low_ram",
  "limited_hardware_class",
  "ssd_upgrade_strongly_recommended",
  "generic_ok",
  "missing_make_or_model",
]);

export function OrderWizard({ locale }: { locale: string }) {
  const t = useTranslations("palvelu");
  const w = useTranslations("palvelu.wizard");
  const wReasons = useTranslations("palvelu.wizard.reasons");
  const [step, setStep] = useState(0);

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [compat, setCompat] = useState<CompatApi | null>(null);
  const [compatLoading, setCompatLoading] = useState(false);

  const [tier, setTier] = useState<Tier | null>(null);
  const [dataMigration, setDataMigration] = useState(false);
  const [dataMigrationSize, setDataMigrationSize] = useState<
    "standard" | "large" | null
  >(null);
  const [delivery, setDelivery] = useState<DeliveryMethod | null>(null);
  const [support, setSupport] = useState<SupportTier | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [preferredDate, setPreferredDate] = useState("");

  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [specs, setSpecs] = useState<LaptopSpecsInsight | null>(null);
  const [specsLoading, setSpecsLoading] = useState(false);
  const [specsTouched, setSpecsTouched] = useState(false);

  useEffect(() => {
    const mk = make.trim();
    const mo = model.trim();
    if (mk.length < 2 || mo.length < 2) {
      setSpecs(null);
      setSpecsLoading(false);
      setSpecsTouched(false);
      return;
    }
    const ac = new AbortController();
    const tid = window.setTimeout(() => {
      setSpecsTouched(true);
      void (async () => {
        setSpecsLoading(true);
        try {
          const res = await fetch("/api/public/laptop-specs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ make: mk, model: mo }),
            signal: ac.signal,
          });
          const data = (await res.json()) as {
            ok?: boolean;
            summary?: string | null;
            specUrl?: string | null;
          };
          if (ac.signal.aborted) return;
          if (data.ok) {
            setSpecs({
              summary: data.summary ?? null,
              specUrl: data.specUrl ?? null,
            });
          } else {
            setSpecs(null);
          }
        } catch {
          if (!ac.signal.aborted) setSpecs(null);
        } finally {
          if (!ac.signal.aborted) setSpecsLoading(false);
        }
      })();
    }, 750);
    return () => {
      window.clearTimeout(tid);
      ac.abort();
    };
  }, [make, model]);

  const showSpecsPanel =
    (step === 0 || step === 1 || step === 5) &&
    make.trim().length >= 2 &&
    model.trim().length >= 2 &&
    specsTouched;

  const pricePreview = useMemo(() => {
    if (!tier || !support) return null;
    try {
      const migration =
        dataMigration && dataMigrationSize
          ? { size: dataMigrationSize }
          : null;
      return serviceOrderTotalWithMigrationCents(tier, support, migration);
    } catch {
      return null;
    }
  }, [tier, support, dataMigration, dataMigrationSize]);

  async function loadCompatibility() {
    setCompatLoading(true);
    setCompat(null);
    try {
      const res = await fetch("/api/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ make, model }),
      });
      const data = (await res.json()) as CompatApi;
      setCompat(data);
    } finally {
      setCompatLoading(false);
    }
  }

  function reasonLabel(r: string): string {
    if (REASON_KEYS.has(r)) {
      return wReasons(r as never);
    }
    return r;
  }

  async function startCheckout() {
    if (!tier || !delivery || !support) return;
    setCheckoutError(null);
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          supportTier: support,
          deliveryMethod: delivery,
          computerMake: make || null,
          computerModel: model || null,
          customerName,
          customerEmail,
          customerPhone: customerPhone || null,
          address: address || null,
          preferredDate: preferredDate || null,
          notes: notes || null,
          locale,
          dataMigration,
          dataMigrationSize: dataMigration ? dataMigrationSize : null,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        if (data.error === "stripe_not_configured") {
          setCheckoutError(w("stripeMissing"));
        } else {
          setCheckoutError(w("errorGeneric"));
        }
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setCheckoutError(w("errorGeneric"));
    } finally {
      setCheckoutLoading(false);
    }
  }

  const canNextFrom0 = make.trim().length > 0 && model.trim().length > 0;
  const canNextFrom1 = compat != null && !compatLoading;
  const canNextFrom2 =
    tier != null && (!dataMigration || dataMigrationSize != null);
  const canNextFrom3 = delivery != null;
  const canNextFrom4 =
    support != null &&
    customerName.trim().length > 0 &&
    customerEmail.includes("@");

  return (
    <section
      data-testid="order-wizard"
      className="vire-card mx-auto max-w-4xl p-6 md:p-10"
      aria-labelledby="wizard-title"
    >
      <h2 id="wizard-title" className="text-3xl font-bold text-ink">
        {w("title")}
      </h2>
      <p className="mt-2 text-lg text-fog">
        {w("stepIndicator", { current: step + 1, total: 6 })}
      </p>

      {step === 0 ? (
        <div className="mt-8 space-y-6">
          <h3 className="text-2xl font-semibold text-ink">{w("step1Title")}</h3>
          <div>
            <label htmlFor="wiz-make" className="mb-2 block font-semibold">
              {w("step1Make")}
            </label>
            <input
              id="wiz-make"
              className="min-h-tap w-full rounded-lg border border-em px-4 text-lg"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              autoComplete="organization"
            />
          </div>
          <div>
            <label htmlFor="wiz-model" className="mb-2 block font-semibold">
              {w("step1Model")}
            </label>
            <input
              id="wiz-model"
              className="min-h-tap w-full rounded-lg border border-em px-4 text-lg"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              autoComplete="off"
            />
          </div>
          {showSpecsPanel && step === 0 ? (
            <>
              <p className="text-sm text-fog">{w("specsHint")}</p>
              <LaptopSpecsCard
                insight={specs}
                loading={specsLoading}
                labels={{
                  title: w("specsTitle"),
                  loading: w("specsLoading"),
                  empty: w("specsEmpty"),
                  link: w("specsLink"),
                }}
              />
            </>
          ) : null}
        </div>
      ) : null}

      {step === 1 ? (
        <div className="mt-8 space-y-6">
          <h3 className="text-2xl font-semibold text-ink">{w("step2Title")}</h3>
          {showSpecsPanel ? (
            <LaptopSpecsCard
              insight={specs}
              loading={specsLoading}
              labels={{
                title: w("specsTitle"),
                loading: w("specsLoading"),
                empty: w("specsEmpty"),
                link: w("specsLink"),
              }}
            />
          ) : null}
          {!compat && !compatLoading ? (
            <button
              type="button"
              className="min-h-tap rounded-xl bg-vire-green px-6 py-3 font-semibold text-canvas"
              onClick={() => void loadCompatibility()}
            >
              {w("step2Run")}
            </button>
          ) : null}
          {compatLoading ? <p className="text-lg">{w("step2Loading")}</p> : null}
          {compat ? (
            <div className="rounded-xl border border-edge bg-canvas p-6">
              <p className="text-xl font-bold text-ink">
                {compat.status === "compatible"
                  ? w("step2Compatible")
                  : compat.status === "borderline"
                    ? w("step2Borderline")
                    : w("step2Incompatible")}
              </p>
              <p className="mt-2 text-lg text-vire-green">
                {w("step2Speed")}: {compat.speedGainEstimate}
              </p>
              <ul className="mt-4 list-inside list-disc space-y-2 text-lg text-ink">
                {compat.reasons.map((r) => (
                  <li key={r}>{reasonLabel(r)}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-8 space-y-4">
          <h3 className="text-2xl font-semibold text-ink">{w("step3Title")}</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {(
              [
                ["SSD_BASIC", "tierBasic"],
                ["SSD_RAM", "tierRam"],
                ["FULL_SERVICE", "tierFull"],
              ] as const
            ).map(([value, labelKey]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setTier(value);
                }}
                className={`min-h-tap rounded-2xl border-2 p-6 text-left font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-vire-green ${
                  tier === value
                    ? "border-vire-green bg-vire-green/10"
                    : "border-edge bg-card"
                }`}
              >
                {w(labelKey)}
              </button>
            ))}
          </div>
          {tier ? (
            <div className="mt-8 rounded-2xl border border-edge bg-card p-6">
              <p className="text-lg font-semibold text-ink">
                {w("migrationTitle")}
              </p>
              <p className="mt-2 text-fog">{w("migrationHint")}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDataMigration(false);
                    setDataMigrationSize(null);
                  }}
                  className={`min-h-tap rounded-xl border-2 px-4 py-2 font-semibold ${
                    !dataMigration
                      ? "border-vire-green bg-vire-green/10"
                      : "border-edge"
                  }`}
                >
                  {w("migrationNo")}
                </button>
                <button
                  type="button"
                  onClick={() => setDataMigration(true)}
                  className={`min-h-tap rounded-xl border-2 px-4 py-2 font-semibold ${
                    dataMigration
                      ? "border-vire-green bg-vire-green/10"
                      : "border-edge"
                  }`}
                >
                  {w("migrationYes")}
                </button>
              </div>
              {dataMigration ? (
                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setDataMigrationSize("standard")}
                    className={`min-h-tap rounded-xl border-2 p-4 text-left font-semibold ${
                      dataMigrationSize === "standard"
                        ? "border-vire-green bg-vire-green/10"
                        : "border-edge"
                    }`}
                  >
                    <span className="block">{w("migrationStandard")}</span>
                    <span className="mt-1 block text-sm font-normal text-fog">
                      {w("migrationStandardHint", {
                        price: (DATA_MIGRATION_STANDARD_CENTS / 100).toFixed(0),
                      })}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDataMigrationSize("large")}
                    className={`min-h-tap rounded-xl border-2 p-4 text-left font-semibold ${
                      dataMigrationSize === "large"
                        ? "border-vire-green bg-vire-green/10"
                        : "border-edge"
                    }`}
                  >
                    <span className="block">{w("migrationLarge")}</span>
                    <span className="mt-1 block text-sm font-normal text-fog">
                      {w("migrationLargeHint", {
                        price: (DATA_MIGRATION_LARGE_CENTS / 100).toFixed(0),
                      })}
                    </span>
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mt-8 space-y-4">
          <h3 className="text-2xl font-semibold text-ink">{w("step4Title")}</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {(
              [
                ["HOME_PICKUP", "deliveryHome"],
                ["DROP_OFF", "deliveryDrop"],
                ["SELF", "deliverySelf"],
              ] as const
            ).map(([value, labelKey]) => (
              <button
                key={value}
                type="button"
                onClick={() => setDelivery(value as DeliveryMethod)}
                className={`min-h-tap rounded-2xl border-2 p-6 text-left font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-vire-green ${
                  delivery === value
                    ? "border-vire-green bg-vire-green/10"
                    : "border-edge bg-card"
                }`}
              >
                {w(labelKey)}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="mt-8 space-y-6">
          <h3 className="text-2xl font-semibold text-ink">{w("step5Title")}</h3>
          <div className="grid gap-3 md:grid-cols-3">
            {(
              [
                ["FULL", "supportFull"],
                ["EMAIL", "supportEmail"],
                ["DISCORD_ONLY", "supportDiscord"],
              ] as const
            ).map(([value, labelKey]) => (
              <button
                key={value}
                type="button"
                onClick={() => setSupport(value as SupportTier)}
                className={`min-h-tap rounded-xl border-2 px-4 py-3 font-semibold ${
                  support === value
                    ? "border-vire-green bg-vire-green/10"
                    : "border-edge"
                }`}
              >
                {w(labelKey)}
              </button>
            ))}
          </div>
          <div>
            <label htmlFor="wiz-name" className="mb-2 block font-semibold">
              {w("customerName")}
            </label>
            <input
              id="wiz-name"
              className="min-h-tap w-full rounded-lg border border-em px-4 text-lg"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="wiz-email" className="mb-2 block font-semibold">
              {w("customerEmail")}
            </label>
            <input
              id="wiz-email"
              type="email"
              className="min-h-tap w-full rounded-lg border border-em px-4 text-lg"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="wiz-phone" className="mb-2 block font-semibold">
              {w("customerPhone")}
            </label>
            <input
              id="wiz-phone"
              type="tel"
              className="min-h-tap w-full rounded-lg border border-em px-4 text-lg"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>
          <div>
            <label htmlFor="wiz-address" className="mb-2 block font-semibold">
              {w("address")}
            </label>
            <textarea
              id="wiz-address"
              rows={3}
              className="w-full rounded-lg border border-em px-4 py-3 text-lg"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="wiz-date" className="mb-2 block font-semibold">
              {w("preferredDate")}
            </label>
            <input
              id="wiz-date"
              type="date"
              className="min-h-tap w-full rounded-lg border border-em px-4 text-lg"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="wiz-notes" className="mb-2 block font-semibold">
              {w("notes")}
            </label>
            <textarea
              id="wiz-notes"
              rows={3}
              className="w-full rounded-lg border border-em px-4 py-3 text-lg"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      ) : null}

      {step === 5 ? (
        <div className="mt-8 space-y-4 text-lg text-ink">
          <h3 className="text-2xl font-semibold">{w("step6Title")}</h3>
          {showSpecsPanel ? (
            <LaptopSpecsCard
              insight={specs}
              loading={specsLoading}
              labels={{
                title: w("specsTitle"),
                loading: w("specsLoading"),
                empty: w("specsEmpty"),
                link: w("specsLink"),
              }}
            />
          ) : null}
          <p>
            <strong>{w("summaryComputer")}:</strong> {make} {model}
          </p>
          <p>
            <strong>{w("summaryTier")}:</strong> {tier}
          </p>
          {dataMigration && dataMigrationSize ? (
            <p>
              <strong>{w("summaryMigration")}:</strong>{" "}
              {dataMigrationSize === "large"
                ? w("summaryMigrationLarge")
                : w("summaryMigrationStandard")}
            </p>
          ) : null}
          <p>
            <strong>{w("summarySupport")}:</strong> {support}
          </p>
          <p>
            <strong>{w("summaryDelivery")}:</strong> {delivery}
          </p>
          <p>
            <strong>{w("summaryContact")}:</strong> {customerName} / {customerEmail}
          </p>
          {pricePreview != null ? (
            <p className="text-2xl font-bold text-vire-green">
              {w("summaryPrice")}: {(pricePreview / 100).toFixed(2)} €
            </p>
          ) : null}
          {checkoutError ? (
            <p className="font-semibold text-danger" role="alert">
              {checkoutError}
            </p>
          ) : null}
          <button
            type="button"
            disabled={checkoutLoading}
            className="min-h-tap w-full rounded-xl bg-vire-green py-4 text-lg font-semibold text-canvas hover:opacity-[0.85] disabled:opacity-60 md:max-w-md"
            onClick={() => void startCheckout()}
          >
            {checkoutLoading ? "…" : w("payCta")}
          </button>
        </div>
      ) : null}

      <div className="mt-10 flex flex-wrap justify-between gap-4">
        <button
          type="button"
          className="min-h-tap rounded-lg border border-em px-6 py-3 font-semibold text-ink disabled:opacity-40"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          {w("back")}
        </button>
        <button
          type="button"
          className="min-h-tap rounded-lg bg-vire-green px-6 py-3 font-semibold text-canvas disabled:opacity-40"
          disabled={
            (step === 0 && !canNextFrom0) ||
            (step === 1 && !canNextFrom1) ||
            (step === 2 && !canNextFrom2) ||
            (step === 3 && !canNextFrom3) ||
            (step === 4 && !canNextFrom4) ||
            step === 5
          }
          onClick={() => {
            if (step === 0 && canNextFrom0) {
              setStep(1);
              setCompat(null);
            } else if (step === 1 && canNextFrom1) setStep(2);
            else if (step === 2 && canNextFrom2) setStep(3);
            else if (step === 3 && canNextFrom3) setStep(4);
            else if (step === 4 && canNextFrom4) setStep(5);
          }}
        >
          {w("next")}
        </button>
      </div>

      <p className="mt-6 text-sm text-fog">
        {t("wizardLegalHint")}
      </p>
    </section>
  );
}
