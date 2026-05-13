"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { DeliveryMethod, HddRemovalOption, SupportTier } from "@prisma/client";
import {
  hddRemovalAddonCents,
  PORTABLE_VM_ADDON_CENTS,
  serviceCheckoutTotalCents,
} from "@/lib/billing/pricing";
import {
  APP_BUNDLE_CENTS,
  APP_BUNDLE_IDS,
  type AppBundleId,
} from "@/lib/billing/app-bundles";
import {
  hasUsableCustomerContact,
  parseCustomerContact,
} from "@/lib/contact/parse-customer-contact";

const WIZARD_ANCHOR = "palvelu-tilaa";

function clearWizardHash() {
  if (typeof window === "undefined") return;
  if (window.location.hash !== `#${WIZARD_ANCHOR}`) return;
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${window.location.search}`,
  );
  window.dispatchEvent(new Event("hashchange"));
}

const STEP_NAV_KEYS = [
  "stepNav1",
  "stepNav2",
  "stepNav3",
  "stepNav4",
  "stepNav5",
] as const;

const STEP_HINT_KEYS = [
  "stepHint0",
  "stepHint1",
  "stepHint2",
  "stepHint3",
  "stepHint4",
] as const;

type Tier = "SSD_BASIC" | "SSD_RAM" | "FULL_SERVICE";

type MigrationChoice = "none" | "standard" | "large";

function bundleKeys(id: AppBundleId): { title: string; desc: string } {
  switch (id) {
    case "local_ai":
      return { title: "bundle_local_ai", desc: "bundle_local_aiDesc" };
    case "media_creator":
      return { title: "bundle_media_creator", desc: "bundle_media_creatorDesc" };
    case "music_production":
      return { title: "bundle_music_production", desc: "bundle_music_productionDesc" };
    case "dev_essentials":
      return { title: "bundle_dev_essentials", desc: "bundle_dev_essentialsDesc" };
  }
}

function useWizardFullscreen() {
  const pathname = usePathname();
  const [full, setFull] = useState(false);

  useEffect(() => {
    function fromHash() {
      if (typeof window === "undefined") return false;
      return window.location.hash === `#${WIZARD_ANCHOR}`;
    }
    function sync() {
      setFull(fromHash());
    }
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!pathname?.includes("palvelu")) return;
    setFull(window.location.hash === `#${WIZARD_ANCHOR}`);
  }, [pathname]);

  useEffect(() => {
    if (!full) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [full]);

  useEffect(() => {
    if (!full) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        clearWizardHash();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [full]);

  return full;
}

export function OrderWizard({ locale }: { locale: string }) {
  const t = useTranslations("palvelu");
  const w = useTranslations("palvelu.wizard");
  const fullMode = useWizardFullscreen();

  const [step, setStep] = useState(0);

  const [computerDescription, setComputerDescription] = useState("");
  const [tier, setTier] = useState<Tier | null>(null);
  const [delivery, setDelivery] = useState<DeliveryMethod | null>(null);
  const [hddRemoval, setHddRemoval] = useState<HddRemovalOption>(
    HddRemovalOption.VIRE_REMOVES,
  );
  const [migrationChoice, setMigrationChoice] =
    useState<MigrationChoice>("none");
  const [selectedBundles, setSelectedBundles] = useState<AppBundleId[]>([]);
  const [portableVm, setPortableVm] = useState(false);
  const [customerContact, setCustomerContact] = useState("");

  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const migrationForPricing = useMemo(
    () =>
      migrationChoice === "none"
        ? null
        : { size: migrationChoice as "standard" | "large" },
    [migrationChoice],
  );

  const pricePreview = useMemo(() => {
    if (!tier || !delivery) return null;
    return serviceCheckoutTotalCents({
      tier,
      supportTier: SupportTier.EMAIL,
      migration: migrationForPricing,
      deliveryMethod: delivery,
      hddRemoval,
      appBundleIds: selectedBundles,
      portableVmAddon: portableVm,
    });
  }, [
    tier,
    delivery,
    hddRemoval,
    migrationForPricing,
    selectedBundles,
    portableVm,
  ]);

  const hddExtraCents =
    tier != null
      ? hddRemovalAddonCents(tier, hddRemoval)
      : 0;

  function closeFullscreen() {
    clearWizardHash();
  }

  function toggleBundle(id: AppBundleId) {
    setSelectedBundles((prev) => {
      const set = new Set(prev);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return APP_BUNDLE_IDS.filter((x) => set.has(x));
    });
  }

  async function startCheckout() {
    if (!tier || !delivery) return;
    setCheckoutError(null);
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          deliveryMethod: delivery,
          hddRemoval,
          computerDescription: computerDescription.trim(),
          customerContact: customerContact.trim(),
          locale,
          dataMigration: migrationForPricing != null,
          dataMigrationSize: migrationForPricing?.size ?? null,
          appBundles: selectedBundles,
          portableVm,
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

  const totalSteps = 5;
  const canNextFrom0 = computerDescription.trim().length >= 3;
  const canNextFrom1 = tier != null && delivery != null;
  const canNextFrom2 = true;
  const canNextFrom3 = hasUsableCustomerContact(
    parseCustomerContact(customerContact),
  );

  const stepContentId = `wizard-step-${step}-region`;
  const stepHint = w(STEP_HINT_KEYS[step]);

  const shellClass = fullMode
    ? "fixed inset-0 z-[100] flex flex-col bg-canvas shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
    : "vire-card mx-auto max-w-4xl scroll-mt-28 p-6 md:p-10";

  return (
    <section
      data-testid="order-wizard"
      id={WIZARD_ANCHOR}
      className={shellClass}
      aria-labelledby="wizard-title"
    >
      <div
        className={`shrink-0 border-b border-edge bg-canvas/95 px-0 py-3 backdrop-blur-md md:py-4 ${
          fullMode ? "px-4 md:px-6" : ""
        }`}
      >
        <div className="mx-auto flex max-w-4xl flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 id="wizard-title" className="text-2xl font-bold text-ink md:text-3xl">
              {w("title")}
            </h2>
          </div>
          {fullMode ? (
            <button
              type="button"
              onClick={closeFullscreen}
              className="min-h-tap shrink-0 rounded-lg border border-em px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-g hover:text-g focus-visible:outline focus-visible:outline-2 focus-visible:outline-g"
            >
              {w("closeWizard")}
            </button>
          ) : null}
        </div>

        <nav
          aria-label={w("stepperLabel")}
          className="mx-auto mt-4 max-w-4xl overflow-x-auto pb-1"
        >
          <ol className="flex min-w-min items-start gap-0 sm:gap-1">
            {STEP_NAV_KEYS.map((key, i) => {
              const active = i === step;
              const done = i < step;
              return (
                <li
                  key={key}
                  className="flex items-start"
                  aria-current={active ? "step" : undefined}
                >
                  <div
                    className={`flex flex-col items-center px-1 sm:px-2 ${
                      active ? "opacity-100" : done ? "opacity-90" : "opacity-45"
                    }`}
                  >
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums sm:size-9 sm:text-sm ${
                        active
                          ? "bg-g text-canvas ring-2 ring-g ring-offset-2 ring-offset-canvas"
                          : done
                            ? "bg-g/25 text-g"
                            : "border-2 border-em bg-sunken text-fog"
                      }`}
                      aria-hidden
                    >
                      {i + 1}
                    </span>
                    <span className="mt-1.5 hidden max-w-[5.5rem] text-center text-[10px] font-semibold uppercase leading-tight tracking-wide text-fog sm:block sm:max-w-[6.5rem] sm:text-[11px]">
                      {w(key)}
                    </span>
                  </div>
                  {i < STEP_NAV_KEYS.length - 1 ? (
                    <span
                      className={`mx-0.5 mt-4 hidden h-0.5 w-4 shrink-0 rounded-full sm:block sm:w-6 md:w-10 ${
                        done ? "bg-g/50" : "bg-em"
                      }`}
                      aria-hidden
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </nav>

        <p
          id={`${stepContentId}-hint`}
          className="mx-auto mt-3 max-w-4xl rounded-lg border border-g/20 bg-g/[0.06] px-3 py-2 text-sm leading-snug text-ink md:text-base"
        >
          <span className="font-semibold text-g" aria-hidden>
            {w(STEP_NAV_KEYS[step])}.{" "}
          </span>
          <span className="sr-only">
            {w("stepIndicator", { current: step + 1, total: totalSteps })}.{" "}
          </span>
          {stepHint}
        </p>
      </div>

      <div
        className={`mx-auto w-full max-w-4xl flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-8 ${
          fullMode ? "min-h-0" : ""
        }`}
      >
        <div
          id={stepContentId}
          role="region"
          aria-labelledby="wizard-title"
          aria-describedby={`${stepContentId}-hint`}
        >
          {step === 0 ? (
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-ink">{w("step1Title")}</h3>
              <div>
                <label htmlFor="wiz-computer" className="mb-2 block font-semibold">
                  {w("computerLabel")}
                </label>
                <textarea
                  id="wiz-computer"
                  rows={4}
                  className="w-full resize-y rounded-lg border border-em bg-sunken px-4 py-3 text-lg text-ink placeholder:text-dust focus:border-g focus:outline-none"
                  value={computerDescription}
                  onChange={(e) => setComputerDescription(e.target.value)}
                  placeholder={w("computerPlaceholder")}
                  maxLength={2000}
                />
                <p className="mt-2 text-base font-light leading-relaxed text-fog">
                  {w("computerHint")}
                </p>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-10">
              <div>
                <h3 className="text-2xl font-semibold text-ink">
                  {w("step2ServiceTitle")}
                </h3>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
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
                      className={`min-h-tap rounded-2xl border p-6 text-left text-base font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-g ${
                        tier === value
                          ? "border-g bg-g/[0.08]"
                          : "border-edge bg-card hover:border-em"
                      }`}
                    >
                      {w(labelKey)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-ink">
                  {w("step2DeliveryTitle")}
                </h3>
                <div className="mt-4 grid gap-2.5 md:grid-cols-3">
                  {(
                    [
                      ["HOME_PICKUP", "deliveryHome", "deliveryHomeSub", "deliveryHomeFee"],
                      ["DROP_OFF", "deliveryPost", "deliveryPostSub", "deliveryPostFee"],
                      ["SELF", "deliverySelf", "deliverySelfSub", "deliverySelfFee"],
                    ] as const
                  ).map(([value, titleKey, subKey, feeKey]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDelivery(value as DeliveryMethod)}
                      className={`min-h-tap rounded-[10px] border bg-sunken p-4 text-center transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-g ${
                        delivery === value
                          ? "border-g bg-g/[0.05]"
                          : "border-edge hover:border-em"
                      }`}
                    >
                      <div className="mb-2 text-2xl text-g" aria-hidden>
                        {value === "HOME_PICKUP"
                          ? "🚚"
                          : value === "DROP_OFF"
                            ? "📦"
                            : "🏠"}
                      </div>
                      <div className="text-[13px] font-semibold text-ink">
                        {w(titleKey)}
                      </div>
                      <div className="mt-1 text-[11px] font-light leading-snug text-fog">
                        {w(subKey)}
                      </div>
                      <div className="mt-1.5 font-mono text-[10px] text-g">
                        {w(feeKey)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-ink">{w("stepHddTitle")}</h3>
              <div
                className="flex gap-3.5 rounded-[10px] border border-amber/25 bg-amber/[0.07] p-4 text-[13px] font-light leading-relaxed text-fog md:p-[18px]"
                role="note"
              >
                <span className="text-xl text-amber" aria-hidden>
                  ⚠
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {w("hddCalloutTitle")}
                  </p>
                  <p className="mt-1">{w("hddCalloutBody")}</p>
                  <p className="mt-2">
                    <Link
                      href="/itse"
                      className="font-medium text-g underline-offset-2 hover:underline"
                    >
                      {w("hddGuideLink")}
                    </Link>
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {(
                  [
                    [HddRemovalOption.VIRE_REMOVES, "hddVireDesc"],
                    [HddRemovalOption.CUSTOMER_REMOVES, "hddSelfDesc"],
                    [HddRemovalOption.KEEP_IN_DEVICE, "hddKeepDesc"],
                  ] as const
                ).map(([value, descKey]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setHddRemoval(value)}
                    className={`flex w-full items-start gap-3 rounded-[10px] border p-4 text-left transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-g ${
                      hddRemoval === value
                        ? "border-g bg-g/[0.05]"
                        : "border-edge bg-sunken hover:border-em"
                    }`}
                  >
                    <span
                      className={`mt-0.5 inline-flex size-4 shrink-0 rounded-full border-2 ${
                        hddRemoval === value ? "border-g bg-g" : "border-em"
                      }`}
                      aria-hidden
                    />
                    <span>
                      <span className="block text-sm font-semibold text-ink">
                        {value === HddRemovalOption.VIRE_REMOVES &&
                        tier === "FULL_SERVICE"
                          ? w("hddVireIncluded")
                          : value === HddRemovalOption.VIRE_REMOVES
                            ? w("hddVirePaid")
                            : value === HddRemovalOption.CUSTOMER_REMOVES
                              ? w("hddSelf")
                              : w("hddKeep")}
                      </span>
                      <span className="mt-1 block text-[13px] font-light text-fog">
                        {w(descKey)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="border-t border-edge pt-8">
                <h3 className="text-xl font-semibold text-ink">
                  {w("migrationSectionTitle")}
                </h3>
                <div className="mt-4 space-y-3">
                  {(
                    [
                      ["none", "migrationNone", "migrationNoneSub"] as const,
                      ["standard", "migrationStandard", "migrationStandardSub"] as const,
                      ["large", "migrationLarge", "migrationLargeSub"] as const,
                    ] as const
                  ).map(([value, titleKey, subKey]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMigrationChoice(value)}
                      className={`flex w-full items-start gap-3 rounded-[10px] border p-4 text-left transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-g ${
                        migrationChoice === value
                          ? "border-g bg-g/[0.05]"
                          : "border-edge bg-sunken hover:border-em"
                      }`}
                    >
                      <span
                        className={`mt-0.5 inline-flex size-4 shrink-0 rounded-full border-2 ${
                          migrationChoice === value ? "border-g bg-g" : "border-em"
                        }`}
                        aria-hidden
                      />
                      <span>
                        <span className="block text-sm font-semibold text-ink">
                          {w(titleKey)}
                        </span>
                        <span className="mt-1 block text-[13px] font-light text-fog">
                          {w(subKey)}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-edge pt-8">
                <h3 className="text-xl font-semibold text-ink">
                  {w("bundlesSectionTitle")}
                </h3>
                <p className="mt-2 text-base font-light text-fog">
                  {w("bundlesSectionLead")}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {APP_BUNDLE_IDS.map((id) => {
                    const keys = bundleKeys(id);
                    const selected = selectedBundles.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleBundle(id)}
                        className={`min-h-tap rounded-[10px] border p-4 text-left transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-g ${
                          selected
                            ? "border-g bg-g/[0.06]"
                            : "border-edge bg-sunken hover:border-em"
                        }`}
                      >
                        <span className="block text-sm font-semibold text-ink">
                          {w(keys.title)} (+{(APP_BUNDLE_CENTS[id] / 100).toFixed(0)} €)
                        </span>
                        <span className="mt-1 block text-[13px] font-light text-fog">
                          {w(keys.desc)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-edge pt-8">
                <h3 className="text-xl font-semibold text-ink">
                  {w("portableVmSectionTitle")}
                </h3>
                <p className="mt-3 text-[13px] font-light leading-relaxed text-fog">
                  {w("portableVmLegal")}
                </p>
                <button
                  type="button"
                  aria-pressed={portableVm}
                  onClick={() => setPortableVm((v) => !v)}
                  className={`mt-4 flex w-full items-start gap-3 rounded-[10px] border p-4 text-left transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-g ${
                    portableVm
                      ? "border-g bg-g/[0.05]"
                      : "border-edge bg-sunken hover:border-em"
                  }`}
                >
                  <span
                    className={`mt-0.5 inline-flex size-4 shrink-0 rounded border-2 ${
                      portableVm ? "border-g bg-g" : "border-em"
                    }`}
                    aria-hidden
                  />
                  <span className="text-sm font-semibold text-ink">
                    {w("portableVmToggle")} (+
                    {(PORTABLE_VM_ADDON_CENTS / 100).toFixed(0)} €)
                  </span>
                </button>
                {portableVm ? (
                  <p className="mt-2 text-sm font-medium text-g">
                    {w("portableVmSelected")}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-ink">{w("step4Title")}</h3>
              <div>
                <label htmlFor="wiz-contact" className="mb-2 block font-semibold">
                  {w("contactLabel")}
                </label>
                <input
                  id="wiz-contact"
                  className="min-h-tap w-full rounded-lg border border-em bg-sunken px-4 text-lg text-ink placeholder:text-dust focus:border-g focus:outline-none"
                  value={customerContact}
                  onChange={(e) => setCustomerContact(e.target.value)}
                  autoComplete="email"
                  placeholder={w("contactPlaceholder")}
                />
                <p className="mt-2 text-base font-light text-fog">
                  {w("contactHint")}
                </p>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-4 text-lg text-ink">
              <h3 className="text-2xl font-semibold">{w("stepSummaryTitle")}</h3>
              <p>
                <strong>{w("summaryComputer")}:</strong>{" "}
                <span className="whitespace-pre-wrap text-base font-normal">
                  {computerDescription.trim()}
                </span>
              </p>
              <p>
                <strong>{w("summaryTier")}:</strong> {tier}
              </p>
              <p>
                <strong>{w("summaryDelivery")}:</strong> {delivery}
              </p>
              <p>
                <strong>{w("summaryHdd")}:</strong> {hddRemoval}
                {hddExtraCents > 0 ? ` (+${(hddExtraCents / 100).toFixed(0)} €)` : ""}
              </p>
              <p>
                <strong>{w("summaryMigration")}:</strong>{" "}
                {migrationChoice === "none"
                  ? w("summaryNone")
                  : migrationChoice === "large"
                    ? w("migrationLarge")
                    : w("migrationStandard")}
              </p>
              <p>
                <strong>{w("summaryBundles")}:</strong>{" "}
                {selectedBundles.length === 0
                  ? w("summaryNone")
                  : selectedBundles
                      .map((id) => {
                        const k = bundleKeys(id);
                        return w(k.title);
                      })
                      .join(", ")}
              </p>
              <p>
                <strong>{w("summaryPortableVm")}:</strong>{" "}
                {portableVm ? w("portableVmSelected") : w("summaryNone")}
              </p>
              <p>
                <strong>{w("summaryContact")}:</strong> {customerContact.trim()}
              </p>
              {pricePreview != null ? (
                <p className="text-2xl font-bold text-g">
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
        </div>

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
              step === 4
            }
            onClick={() => {
              if (step === 0 && canNextFrom0) setStep(1);
              else if (step === 1 && canNextFrom1) setStep(2);
              else if (step === 2 && canNextFrom2) setStep(3);
              else if (step === 3 && canNextFrom3) setStep(4);
            }}
          >
            {w("next")}
          </button>
        </div>

        <p className="mt-6 text-sm text-fog">{t("wizardLegalHint")}</p>
      </div>
    </section>
  );
}
