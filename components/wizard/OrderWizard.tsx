"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { parseWizardPrefill } from "@/lib/wizard/wizard-prefill";
import {
  isOrderWizardRoute,
  ORDER_WIZARD_HASH,
  ORDER_WIZARD_PATH,
} from "@/lib/site/order-wizard-path";
import {
  DeliveryMethod,
  HddRemovalOption,
  PortableVmHandoff,
} from "@prisma/client";
import {
  APP_BUNDLE_CENTS,
  APP_BUNDLE_ORDER,
  type AppBundleId,
} from "@/lib/billing/app-bundles";
import { PORTABLE_VM_ADDON_CENTS } from "@/lib/billing/portable-vm";
import {
  DELIVERY_POST_CENTS,
  TIER_BASE_CENTS,
} from "@/lib/billing/pricing";
import {
  getComputerDescriptionIssue,
  getContactFieldIssue,
} from "@/lib/contact/contact-field-validation";
import type { ComputerLookupResult } from "@/lib/orders/computer-lookup";
import { WizardComputerStep } from "@/components/wizard/WizardComputerStep";
import { WizardPrice } from "@/components/wizard/WizardPrice";
import { WizardComputerChip } from "@/components/wizard/WizardComputerChip";
import { WizardLiveTotalBar } from "@/components/wizard/WizardLiveTotal";
import { WizardOrderSummary } from "@/components/wizard/WizardOrderSummary";
import { computeWizardLiveTotal } from "@/lib/wizard/wizard-live-total";
import type { WizardSupportChoice, WizardTier } from "@/lib/wizard/wizard-types";
import { WIZARD_STEP } from "@/lib/wizard/wizard-display-labels";
import { focusWizardStepContent } from "@/lib/wizard/wizard-step-focus";

const WIZARD_ANCHOR = ORDER_WIZARD_HASH;

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

export type { WizardSupportChoice } from "@/lib/wizard/wizard-types";

type WizardBundleKey =
  | "bundle_local_ai"
  | "bundle_media_creator"
  | "bundle_music_production"
  | "bundle_developer_essentials";

const WIZ_BUNDLE_MSG: Record<AppBundleId, WizardBundleKey> = {
  local_ai: "bundle_local_ai",
  media_creator: "bundle_media_creator",
  music_production: "bundle_music_production",
  developer_essentials: "bundle_developer_essentials",
};

function useWizardFullscreen(forceOnOrderPage?: boolean) {
  const pathname = usePathname();
  const isOrderPage = forceOnOrderPage || isOrderWizardRoute(pathname);
  const [full, setFull] = useState(isOrderPage);

  useEffect(() => {
    if (isOrderPage) {
      setFull(true);
      return;
    }
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
  }, [isOrderPage]);

  useEffect(() => {
    if (typeof window === "undefined" || isOrderPage) return;
    if (pathname !== "/" && !pathname?.includes("palvelu")) return;
    setFull(window.location.hash === `#${WIZARD_ANCHOR}`);
  }, [pathname, isOrderPage]);

  useLayoutEffect(() => {
    if (!full) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.dataset.wizardFullscreen = "true";
    return () => {
      document.body.style.overflow = prev;
      delete document.body.dataset.wizardFullscreen;
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

export function OrderWizard({
  locale,
  fullscreenOnOrderPage = false,
}: {
  locale: string;
  /** When true on `/tilaa`, fullscreen + body lock apply on first paint (E2E-safe). */
  fullscreenOnOrderPage?: boolean;
}) {
  const t = useTranslations("palvelu");
  const w = useTranslations("palvelu.wizard");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isOrderPage = isOrderWizardRoute(pathname);
  const fullMode = useWizardFullscreen(fullscreenOnOrderPage || isOrderPage);
  const wizardRef = useRef<HTMLElement>(null);
  const appliedPrefillRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || isOrderPage) return;
    if (
      (pathname === "/" || pathname?.includes("palvelu")) &&
      window.location.hash === `#${WIZARD_ANCHOR}`
    ) {
      router.replace(ORDER_WIZARD_PATH);
    }
  }, [pathname, isOrderPage, router]);

  const [step, setStep] = useState(0);

  const [computerDescription, setComputerDescription] = useState("");
  const [tier, setTier] = useState<WizardTier | null>("INSTALL_ONLY");
  const [supportChoice, setSupportChoice] =
    useState<WizardSupportChoice>("INCLUDED");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [computerLookup, setComputerLookup] =
    useState<ComputerLookupResult | null>(null);
  const [delivery, setDelivery] = useState<DeliveryMethod | null>(null);
  const [hddRemoval, setHddRemoval] = useState<HddRemovalOption>(
    HddRemovalOption.SPARKKI_REMOVES,
  );
  const [appBundles, setAppBundles] = useState<AppBundleId[]>([]);
  const [portableVmOn, setPortableVmOn] = useState(false);
  const [portableVmHandoff, setPortableVmHandoff] =
    useState<PortableVmHandoff | null>(null);
  const [customerContact, setCustomerContact] = useState("");
  const [computerFieldBlurred, setComputerFieldBlurred] = useState(false);
  const [contactFieldBlurred, setContactFieldBlurred] = useState(false);

  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const hadAddonsSelectionRef = useRef(false);
  const [addonsSectionOpen, setAddonsSectionOpen] = useState(false);

  const liveTotal = useMemo(
    () =>
      computeWizardLiveTotal({
        tier,
        delivery,
        hddRemoval,
        appBundles,
        portableVmOn,
        portableVmReady: portableVmHandoff != null,
      }),
    [tier, delivery, hddRemoval, appBundles, portableVmOn, portableVmHandoff],
  );

  function closeFullscreen() {
    if (isOrderPage) {
      router.push("/");
      return;
    }
    clearWizardHash();
  }

  useEffect(() => {
    if (!fullMode || !wizardRef.current) return;
    const root = wizardRef.current;

    const focusables = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])',
        ),
      );

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const list = focusables();
      if (list.length === 0) return;
      const first = list[0]!;
      const last = list[list.length - 1]!;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [fullMode]);

  useEffect(() => {
    if (!wizardRef.current) return;
    const root = wizardRef.current;
    const id = window.requestAnimationFrame(() => {
      focusWizardStepContent(step, root);
    });
    return () => window.cancelAnimationFrame(id);
  }, [step, fullMode]);

  useEffect(() => {
    const on = appBundles.length > 0 || portableVmOn;
    if (on && !hadAddonsSelectionRef.current) setAddonsSectionOpen(true);
    hadAddonsSelectionRef.current = on;
  }, [appBundles.length, portableVmOn]);

  useEffect(() => {
    if (appliedPrefillRef.current) return;
    const prefill = parseWizardPrefill(searchParams);
    if (!prefill) return;
    appliedPrefillRef.current = true;
    setComputerDescription(prefill.computer);
    if (prefill.matchId) setSelectedMatchId(prefill.matchId);
    if (prefill.year != null) setSelectedYear(prefill.year);
    if (prefill.step != null && prefill.step >= 1 && prefill.step < 5) {
      setStep(prefill.step);
    }
  }, [searchParams]);

  useEffect(() => {
    if (step === 0) setComputerFieldBlurred(false);
  }, [step]);

  useEffect(() => {
    if (step === WIZARD_STEP.contact) setContactFieldBlurred(false);
  }, [step]);

  async function startCheckout() {
    if (!tier || !delivery) return;
    const contactIssue = getContactFieldIssue(customerContact);
    if (contactIssue != null) {
      setContactFieldBlurred(true);
      setCheckoutError(
        contactIssue === "empty"
          ? w("validationContactEmpty")
          : w("validationContactInvalid"),
      );
      return;
    }
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
          appBundleIds: appBundles,
          portableVmAddon: portableVmOn && portableVmHandoff != null,
          portableVmHandoff:
            portableVmOn && portableVmHandoff != null ? portableVmHandoff : null,
          supportChoice,
          selectedYear,
          selectedMatchId,
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
  const needsYear =
    computerLookup != null &&
    (computerLookup.needsYearChoice || computerLookup.yearOptions.length > 1);
  const canNextFrom0 =
    computerDescription.trim().length >= 3 && (!needsYear || selectedYear != null);
  const canNextFrom1 = tier != null && delivery != null;
  const canNextFrom2 = !portableVmOn || portableVmHandoff != null;
  const canNextFrom3 = true;
  const contactIssue = getContactFieldIssue(customerContact);
  const contactOk = contactIssue === null;
  const computerIssue = getComputerDescriptionIssue(computerDescription, 3);
  const showComputerErr = computerFieldBlurred && computerIssue === "short";
  const showContactErr = contactFieldBlurred && contactIssue != null;

  const stepContentId = `wizard-step-${step}-region`;
  const stepHint = w(STEP_HINT_KEYS[step]);
  const contentMaxClass = fullMode ? "max-w-5xl" : "max-w-4xl";

  const shellClass = fullMode
    ? "sparkki-wizard-full fixed inset-0 z-[100] flex flex-col border-0 bg-canvas"
    : "sparkki-card mx-auto max-w-4xl scroll-mt-28 p-6 md:p-10";

  const wizardNavButtonRow = (
    <div
      className={
        fullMode
          ? "flex flex-wrap justify-between gap-3"
          : "mt-10 grid grid-cols-2 gap-3 md:mt-10 md:flex md:flex-wrap md:justify-between md:gap-4"
      }
    >
      <button
        type="button"
        className="min-h-12 w-full rounded-lg border border-em px-6 py-3 font-semibold text-ink disabled:opacity-40 md:min-h-tap md:w-auto"
        disabled={step === 0}
        onClick={() => setStep((s) => Math.max(0, s - 1))}
      >
        {w("back")}
      </button>
      <button
        type="button"
        className="min-h-12 w-full rounded-lg bg-sparkki-green px-6 py-3 font-semibold text-canvas disabled:opacity-40 md:min-h-tap md:w-auto"
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
  );

  const wizardLegalHintEl = (
    <p
      className={`break-words text-fog ${
        fullMode ? "mt-3 text-xs sm:text-sm" : "mt-6 text-sm"
      }`}
    >
      {t("wizardLegalHint")}
    </p>
  );

  const wizardTree = (
    <>
      {fullMode ? (
        <div
          className="sparkki-modal-backdrop fixed inset-0 z-[90]"
          aria-hidden
          onClick={closeFullscreen}
        />
      ) : null}
      <section
        ref={wizardRef}
        data-testid="order-wizard"
        data-order-wizard-dialog={fullMode ? "" : undefined}
        id={WIZARD_ANCHOR}
        className={shellClass}
        role={fullMode ? "dialog" : undefined}
        aria-modal={fullMode ? true : undefined}
        aria-labelledby="wizard-title"
      >
      <div
        className={`shrink-0 border-b border-edge bg-canvas/95 px-0 py-3 backdrop-blur-md md:py-4 ${
          fullMode ? "sticky top-0 z-10 px-4 pt-safe md:px-6" : ""
        }`}
      >
        <div className={`mx-auto flex w-full ${contentMaxClass} flex-wrap items-start justify-between gap-3`}>
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
          className={`mx-auto mt-4 w-full ${contentMaxClass} overflow-x-auto overscroll-x-contain pb-1 touch-pan-x [-webkit-overflow-scrolling:touch]`}
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
                  <div className="flex flex-col items-center px-1 sm:px-2">
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums sm:size-9 sm:text-sm ${
                        active
                          ? "bg-g text-canvas ring-2 ring-g ring-offset-2 ring-offset-canvas"
                          : done
                            ? "bg-g/25 text-g opacity-90"
                            : "border-2 border-em bg-sunken text-fog opacity-45"
                      }`}
                      aria-hidden
                    >
                      {i + 1}
                    </span>
                    {active ? (
                      <span
                        className="mt-1.5 block max-w-[7rem] text-center text-[10px] font-semibold uppercase leading-tight tracking-wide text-ink sm:hidden"
                        aria-hidden
                      >
                        {w(key)}
                      </span>
                    ) : null}
                    <span
                      className={`mt-1.5 hidden max-w-[5.5rem] text-center text-[10px] font-semibold uppercase leading-tight tracking-wide sm:block sm:max-w-[6.5rem] sm:text-[11px] ${
                        active ? "text-ink" : done ? "text-fog" : "text-ink/70"
                      }`}
                    >
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
          className={`mx-auto mt-3 w-full ${contentMaxClass} rounded-lg border border-g/20 bg-g/[0.06] px-3 py-2 text-sm leading-snug text-ink md:text-base`}
        >
          <span className="font-semibold text-g" aria-hidden>
            {w(STEP_NAV_KEYS[step])}.{" "}
          </span>
          <span className="sr-only">
            {w("stepIndicator", { current: step + 1, total: totalSteps })}.{" "}
          </span>
          {stepHint}
        </p>

        {step > 0 && computerDescription.trim() ? (
          <div className={`mx-auto mt-3 w-full ${contentMaxClass}`}>
            <WizardComputerChip
              description={computerDescription}
              onEdit={() => setStep(WIZARD_STEP.computer)}
            />
          </div>
        ) : null}

        <div className={`mx-auto mt-4 w-full ${contentMaxClass}`}>
          <WizardLiveTotalBar live={liveTotal} />
        </div>
      </div>

      <div
        className={
          fullMode
            ? `mx-auto flex w-full ${contentMaxClass} min-h-0 flex-1 flex-col`
            : `mx-auto w-full ${contentMaxClass}`
        }
      >
        <div
          className={
            fullMode
              ? "min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 touch-pan-y md:px-6 md:py-6"
              : "px-4 py-6 md:px-6 md:py-8"
          }
        >
          <div
            id={stepContentId}
            role="region"
            aria-labelledby={`${stepContentId}-hint`}
            aria-describedby={`${stepContentId}-hint`}
          >
          {step === 0 ? (
            <WizardComputerStep
              locale={locale}
              description={computerDescription}
              onDescriptionChange={setComputerDescription}
              onBlur={() => setComputerFieldBlurred(true)}
              showComputerErr={showComputerErr}
              selectedYear={selectedYear}
              onSelectedYearChange={setSelectedYear}
              selectedMatchId={selectedMatchId}
              onSelectedMatchIdChange={setSelectedMatchId}
              onLookupChange={setComputerLookup}
            />
          ) : null}

          {step === 1 ? (
            <div className="space-y-10">
              <div>
                <h3 className="text-2xl font-semibold text-ink">
                  {w("step2ServiceTitle")}
                </h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {(
                    [
                      ["INSTALL_ONLY", "tierInstallOnly", "tierInstallOnlyDesc"],
                      ["SSD_BASIC", "tierBasic", "tierBasicDesc"],
                      ["SSD_RAM", "tierRam", "tierRamDesc"],
                      ["FULL_SERVICE", "tierFull", "tierFullDesc"],
                    ] as const
                  ).map(([value, labelKey, descKey]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTier(value)}
                      className={`flex min-h-tap flex-col rounded-2xl border p-5 text-left transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-g ${
                        tier === value
                          ? "border-g bg-g/[0.08]"
                          : "border-edge bg-card hover:border-em"
                      }`}
                    >
                      <span className="block text-base font-semibold text-ink">
                        {w(labelKey)}
                      </span>
                      <WizardPrice
                        variant="card"
                        cents={TIER_BASE_CENTS[value]}
                        className="mt-2"
                      />
                      <span className="mt-2 block text-[13px] font-light leading-snug text-fog">
                        {w(descKey)}
                      </span>
                      {value === "INSTALL_ONLY" ? (
                        <span className="mt-2 block text-[13px] font-medium leading-snug text-fog">
                          {w("tierInstallOnlyExcluded")}
                        </span>
                      ) : null}
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
                      ["HOME_PICKUP", "deliveryHome", "deliveryHomeSub", 0],
                      ["DROP_OFF", "deliveryPost", "deliveryPostSub", DELIVERY_POST_CENTS],
                      ["SELF", "deliverySelf", "deliverySelfSub", 0],
                    ] as const
                  ).map(([value, titleKey, subKey, feeCents]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDelivery(value as DeliveryMethod)}
                      className={`flex min-h-tap flex-col rounded-2xl border p-5 text-left transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-g ${
                        delivery === value
                          ? "border-g bg-g/[0.08]"
                          : "border-edge bg-card hover:border-em"
                      }`}
                    >
                      <span className="text-2xl leading-none" aria-hidden>
                        {value === "HOME_PICKUP"
                          ? "🚚"
                          : value === "DROP_OFF"
                            ? "📦"
                            : "🏠"}
                      </span>
                      <span className="mt-3 block text-base font-semibold text-ink">
                        {w(titleKey)}
                      </span>
                      <span className="mt-1 block text-[13px] font-light leading-snug text-fog">
                        {w(subKey)}
                      </span>
                      <WizardPrice
                        variant="line"
                        cents={feeCents}
                        prefix={feeCents > 0 ? "+" : ""}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-10">
              <div>
                <h3 className="text-2xl font-semibold text-ink">
                  {w("step2SupportTitle")}
                </h3>
                <p className="mt-2 text-base font-light text-fog">
                  {w("step2SupportIntro")}
                </p>
                <div
                  className="mt-4 grid gap-3 lg:grid-cols-3"
                  role="radiogroup"
                  aria-label={w("step2SupportTitle")}
                >
                  {(
                    [
                      [
                        "INCLUDED",
                        "supportIncludedTitle",
                        "supportIncludedPrice",
                        [
                          "supportIncludedF1",
                          "supportIncludedF2",
                          "supportIncludedF3",
                        ],
                        false,
                      ],
                      [
                        "CARE_PLUS",
                        "supportCarePlusTitle",
                        "supportCarePlusPrice",
                        [
                          "supportCarePlusF1",
                          "supportCarePlusF2",
                          "supportCarePlusF3",
                        ],
                        true,
                      ],
                      [
                        "CARE_PRO",
                        "supportCareProTitle",
                        "supportCareProPrice",
                        [
                          "supportCareProF1",
                          "supportCareProF2",
                          "supportCareProF3",
                        ],
                        true,
                      ],
                    ] as const
                  ).map(([value, titleKey, priceKey, featureKeys, showCareNote]) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={supportChoice === value}
                      onClick={() => setSupportChoice(value)}
                      className={`flex min-h-tap flex-col rounded-2xl border p-5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-g ${
                        supportChoice === value
                          ? "border-g bg-g/[0.08]"
                          : "border-edge bg-card hover:border-em"
                      }`}
                    >
                      <span className="text-base font-semibold text-ink">
                        {w(titleKey)}
                      </span>
                      <WizardPrice variant="card" text={w(priceKey)} className="mt-2" />
                      {showCareNote ? (
                        <p className="mt-2 text-xs font-medium leading-snug text-fog">
                          {w("supportCareMonthlyNote")}
                        </p>
                      ) : null}
                      <ul className="mt-3 list-inside list-disc space-y-1 text-[13px] font-light text-fog">
                        {featureKeys.map((fk) => (
                          <li key={fk}>{w(fk)}</li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
              </div>
              <details
                className="rounded-2xl border border-edge bg-sunken/15 open:bg-sunken/25"
                open={addonsSectionOpen}
                onToggle={(e) =>
                  setAddonsSectionOpen((e.target as HTMLDetailsElement).open)
                }
              >
                <summary className="cursor-pointer select-none list-none rounded-2xl px-4 py-4 marker:hidden [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g">
                  <span className="block text-xl font-semibold text-ink">
                    {w("step2AddonsSummary")}
                  </span>
                  <span className="mt-1 block text-sm font-normal leading-snug text-fog">
                    {w("step2AddonsHint")}
                  </span>
                </summary>
                <div className="space-y-10 border-t border-edge/70 px-4 pb-6 pt-6">
                  <div>
                    <h3 className="text-2xl font-semibold text-ink">
                      {w("bundlesTitle")}
                    </h3>
                    <p className="mt-2 text-base font-light leading-relaxed text-fog">
                      {w("bundlesHint")}
                    </p>
                    <div
                      className="mt-4 space-y-2.5"
                      role="group"
                      aria-label={w("bundlesTitle")}
                    >
                      {APP_BUNDLE_ORDER.map((id) => {
                        const selected = appBundles.includes(id);
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => {
                              setAppBundles((prev) =>
                                selected
                                  ? prev.filter((x) => x !== id)
                                  : [...prev, id],
                              );
                            }}
                            className={`flex w-full items-start gap-3 rounded-[10px] border p-4 text-left transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-g ${
                              selected
                                ? "border-g bg-g/[0.05]"
                                : "border-edge bg-sunken hover:border-em"
                            }`}
                          >
                            <span
                              className={`mt-1 inline-flex size-4 shrink-0 rounded border-2 ${
                                selected ? "border-g bg-g" : "border-em bg-canvas"
                              }`}
                              aria-hidden
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold text-ink">
                                {w(WIZ_BUNDLE_MSG[id])}
                              </span>
                              <WizardPrice
                                variant="addon"
                                cents={APP_BUNDLE_CENTS[id]}
                                prefix="+"
                                className="mt-1"
                              />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-ink">{w("vmTitle")}</h3>
                    <p className="mt-2 text-base font-light leading-relaxed text-fog">
                      {w("vmHint")}
                    </p>
                    <WizardPrice
                      variant="addon"
                      cents={PORTABLE_VM_ADDON_CENTS}
                      prefix="+"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (portableVmOn) {
                          setPortableVmOn(false);
                          setPortableVmHandoff(null);
                        } else {
                          setPortableVmOn(true);
                          setPortableVmHandoff(PortableVmHandoff.CUSTOMER_STORAGE);
                        }
                      }}
                      className={`mt-4 min-h-tap w-full max-w-md rounded-[10px] border px-4 py-3 text-left text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-g ${
                        portableVmOn
                          ? "border-g bg-g/[0.08] text-ink"
                          : "border-edge bg-sunken text-ink hover:border-em"
                      }`}
                    >
                      {portableVmOn ? w("vmDisableAddon") : w("vmEnableAddon")}
                    </button>
                    {portableVmOn ? (
                      <div className="mt-6 space-y-3">
                        <p className="text-sm font-semibold text-ink">
                          {w("vmHandoffHeading")}
                        </p>
                        {(
                          [
                            [
                              PortableVmHandoff.CUSTOMER_STORAGE,
                              "vmHandoffCustomerTitle",
                              "vmHandoffCustomerDesc",
                            ],
                            [
                              PortableVmHandoff.SHIPPED_MEDIA,
                              "vmHandoffShippedTitle",
                              "vmHandoffShippedDesc",
                            ],
                          ] as const
                        ).map(([value, titleKey, descKey]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setPortableVmHandoff(value)}
                            className={`flex w-full items-start gap-3 rounded-[10px] border p-4 text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-g ${
                              portableVmHandoff === value
                                ? "border-g bg-g/[0.05]"
                                : "border-edge bg-sunken hover:border-em"
                            }`}
                          >
                            <span
                              className={`mt-0.5 inline-flex size-4 shrink-0 rounded-full border-2 ${
                                portableVmHandoff === value
                                  ? "border-g bg-g"
                                  : "border-em"
                              }`}
                              aria-hidden
                            />
                            <span>
                              <span className="block text-sm font-semibold text-ink">
                                {w(titleKey)}
                              </span>
                              <span className="mt-1 block text-[13px] font-light text-fog">
                                {w(descKey)}
                              </span>
                            </span>
                          </button>
                        ))}
                        <details className="mt-4 rounded-xl border border-edge bg-sunken/40 p-4 text-fog">
                          <summary className="cursor-pointer select-none text-sm font-semibold text-ink">
                            {w("vmLegalToggle")}
                          </summary>
                          <div className="mt-3 space-y-3 text-[13px] font-light leading-relaxed">
                            <p>{w("vmLegalP1")}</p>
                            <p>{w("vmLegalP2")}</p>
                            <p>{w("vmLegalP3")}</p>
                            <p>{w("vmLegalP4")}</p>
                            <p>
                              {w("vmLegalPrivacyBefore")}{" "}
                              <Link
                                href="/tietosuoja"
                                className="font-medium text-g underline-offset-2 hover:underline"
                              >
                                {w("vmLegalPrivacyLink")}
                              </Link>
                              {w("vmLegalPrivacyAfter")}
                            </p>
                          </div>
                        </details>
                      </div>
                    ) : null}
                  </div>
                </div>
              </details>
            </div>
          ) : null}

          {step === 3 ? (
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
                    [HddRemovalOption.SPARKKI_REMOVES, "hddSparkkiDesc"],
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
                        {value === HddRemovalOption.SPARKKI_REMOVES &&
                        tier === "FULL_SERVICE"
                          ? w("hddSparkkiIncluded")
                          : value === HddRemovalOption.SPARKKI_REMOVES
                            ? w("hddSparkkiPaid")
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
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-ink">
                  {w("step4Title")}
                </h3>
                <div>
                  <label htmlFor="wiz-contact" className="mb-2 block font-semibold">
                    {w("contactLabel")}
                  </label>
                  <input
                    id="wiz-contact"
                    aria-required="true"
                    aria-invalid={showContactErr}
                    aria-describedby={
                      [
                        "wiz-contact-hint",
                        showContactErr ? "wiz-contact-err" : "",
                      ]
                        .filter(Boolean)
                        .join(" ") || undefined
                    }
                    className={`sparkki-input min-h-tap w-full rounded-lg border bg-sunken px-4 text-ink placeholder:text-dust ${
                      showContactErr ? "border-danger" : "border-em"
                    }`}
                    value={customerContact}
                    onChange={(e) => setCustomerContact(e.target.value)}
                    onBlur={() => setContactFieldBlurred(true)}
                    autoComplete="email"
                    placeholder={w("contactPlaceholder")}
                  />
                  <p
                    id="wiz-contact-hint"
                    className="mt-2 text-base font-light text-fog"
                  >
                    {w("contactHint")}
                  </p>
                  {showContactErr && contactIssue === "empty" ? (
                    <p
                      id="wiz-contact-err"
                      role="alert"
                      className="mt-2 text-base text-danger"
                    >
                      {w("validationContactEmpty")}
                    </p>
                  ) : showContactErr && contactIssue === "invalid" ? (
                    <p
                      id="wiz-contact-err"
                      role="alert"
                      className="mt-2 text-base text-danger"
                    >
                      {w("validationContactInvalid")}
                    </p>
                  ) : null}
                </div>
              </div>

              {contactOk ? (
                <div className="border-t border-edge pt-8">
                  <WizardOrderSummary
                    computerDescription={computerDescription}
                    tier={tier}
                    supportChoice={supportChoice}
                    delivery={delivery}
                    hddRemoval={hddRemoval}
                    appBundles={appBundles}
                    portableVmOn={portableVmOn}
                    portableVmHandoff={portableVmHandoff}
                    customerContact={customerContact}
                    checkoutTotalCents={liveTotal.checkoutTotalCents}
                    onEditStep={setStep}
                  />
                  {checkoutError ? (
                    <p className="mt-4 font-semibold text-danger" role="alert">
                      {checkoutError}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    disabled={checkoutLoading || !contactOk}
                    aria-busy={checkoutLoading}
                    className={`sparkki-btn-primary mt-6 min-h-tap w-full min-w-0 justify-center py-4 pr-12 text-lg md:max-w-md ${
                      checkoutLoading ? "sparkki-btn-loading" : ""
                    }`}
                    onClick={() => void startCheckout()}
                  >
                    {checkoutLoading ? w("payCtaLoading") : w("payCta")}
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
          </div>
          {!fullMode ? (
            <>
              {wizardNavButtonRow}
              {wizardLegalHintEl}
            </>
          ) : null}
        </div>
        {fullMode ? (
          <div className="shrink-0 border-t border-edge bg-canvas/95 px-4 pb-safe pt-4 backdrop-blur-md md:px-6">
            {wizardNavButtonRow}
            {wizardLegalHintEl}
          </div>
        ) : null}
      </div>
    </section>
    </>
  );

  if (fullMode && typeof document !== "undefined") {
    return createPortal(wizardTree, document.body);
  }

  return wizardTree;
}
