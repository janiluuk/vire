"use client";

import { PortableVmHandoff } from "@prisma/client";
import type { DeliveryMethod, HddRemovalOption } from "@prisma/client";
import { useTranslations } from "next-intl";
import type { AppBundleId } from "@/lib/billing/app-bundles";
import { hddRemovalAddonCents } from "@/lib/billing/pricing";
import {
  deliveryLabelKey,
  hddLabelKey,
  supportLabelKey,
  tierLabelKey,
  WIZARD_STEP,
} from "@/lib/wizard/wizard-display-labels";
import type { DataMigrationChoice } from "@/components/wizard/WizardDataMigration";
import type { WizardSupportChoice, WizardTier } from "@/lib/wizard/wizard-types";
import {
  formatWizardPriceEuro,
  WizardPrice,
} from "@/components/wizard/WizardPrice";

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

type Props = {
  computerDescription: string;
  tier: WizardTier | null;
  supportChoice: WizardSupportChoice;
  delivery: DeliveryMethod | null;
  hddRemoval: HddRemovalOption;
  dataMigration: DataMigrationChoice;
  appBundles: AppBundleId[];
  portableVmOn: boolean;
  portableVmHandoff: PortableVmHandoff | null;
  customerContact: string;
  checkoutTotalCents: number | null;
  onEditStep: (step: number) => void;
};

function SummaryRow({
  label,
  children,
  editStep,
  onEditStep,
}: {
  label: string;
  children: React.ReactNode;
  editStep: number;
  onEditStep: (step: number) => void;
}) {
  const w = useTranslations("palvelu.wizard");
  return (
    <div className="flex flex-wrap items-start justify-between gap-2 border-b border-edge/60 py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-fog">{label}</p>
        <div className="mt-1 text-base text-ink">{children}</div>
      </div>
      <button
        type="button"
        onClick={() => onEditStep(editStep)}
        className="shrink-0 rounded-lg border border-em px-3 py-1.5 text-xs font-semibold text-g hover:border-g focus-visible:outline focus-visible:outline-2 focus-visible:outline-g"
      >
        {w("summaryEdit")}
      </button>
    </div>
  );
}

export function WizardOrderSummary({
  computerDescription,
  tier,
  supportChoice,
  delivery,
  hddRemoval,
  dataMigration,
  appBundles,
  portableVmOn,
  portableVmHandoff,
  customerContact,
  checkoutTotalCents,
  onEditStep,
}: Props) {
  const w = useTranslations("palvelu.wizard");
  const hddExtraCents =
    tier != null ? hddRemovalAddonCents(tier, hddRemoval) : 0;

  return (
    <div className="space-y-1 text-lg text-ink" data-testid="wizard-order-summary">
      <h3 className="mb-4 text-2xl font-semibold">{w("stepSummaryTitle")}</h3>

      <SummaryRow
        label={w("summaryComputer")}
        editStep={WIZARD_STEP.computer}
        onEditStep={onEditStep}
      >
        <span className="whitespace-pre-wrap font-normal">{computerDescription.trim()}</span>
      </SummaryRow>

      <SummaryRow
        label={w("summaryTier")}
        editStep={WIZARD_STEP.serviceDelivery}
        onEditStep={onEditStep}
      >
        {tier != null ? w(tierLabelKey(tier)) : "—"}
      </SummaryRow>

      <SummaryRow
        label={w("summaryDelivery")}
        editStep={WIZARD_STEP.serviceDelivery}
        onEditStep={onEditStep}
      >
        {delivery != null ? w(deliveryLabelKey(delivery)) : "—"}
      </SummaryRow>

      <SummaryRow
        label={w("summarySupport")}
        editStep={WIZARD_STEP.supportAddons}
        onEditStep={onEditStep}
      >
        {w(supportLabelKey(supportChoice))}
      </SummaryRow>

      {appBundles.length > 0 ? (
        <SummaryRow
          label={w("summaryBundles")}
          editStep={WIZARD_STEP.supportAddons}
          onEditStep={onEditStep}
        >
          {appBundles.map((id) => w(WIZ_BUNDLE_MSG[id])).join(" · ")}
        </SummaryRow>
      ) : null}

      {portableVmOn && portableVmHandoff ? (
        <SummaryRow
          label={w("summaryPortableVm")}
          editStep={WIZARD_STEP.supportAddons}
          onEditStep={onEditStep}
        >
          {portableVmHandoff === PortableVmHandoff.CUSTOMER_STORAGE
            ? w("vmHandoffCustomerSummary")
            : w("vmHandoffShippedSummary")}
        </SummaryRow>
      ) : null}

      {dataMigration !== "none" ? (
        <SummaryRow
          label={w("summaryMigration")}
          editStep={WIZARD_STEP.supportAddons}
          onEditStep={onEditStep}
        >
          {dataMigration === "large"
            ? w("migrationLarge")
            : w("migrationStandard")}
        </SummaryRow>
      ) : null}

      <SummaryRow
        label={w("summaryHdd")}
        editStep={WIZARD_STEP.hdd}
        onEditStep={onEditStep}
      >
        {w(hddLabelKey(hddRemoval, tier))}
        {hddExtraCents > 0
          ? ` (${formatWizardPriceEuro(hddExtraCents, { prefix: "+" })})`
          : ""}
      </SummaryRow>

      <SummaryRow
        label={w("summaryContact")}
        editStep={WIZARD_STEP.contact}
        onEditStep={onEditStep}
      >
        {customerContact.trim()}
      </SummaryRow>

      {checkoutTotalCents != null ? (
        <div className="mt-4 rounded-xl border border-edge bg-sunken/40 px-5 py-4">
          <p className="text-sm font-semibold text-fog">{w("summaryPrice")}</p>
          <WizardPrice
            variant="total"
            cents={checkoutTotalCents}
            decimals={2}
            className="mt-1"
          />
        </div>
      ) : null}
    </div>
  );
}
