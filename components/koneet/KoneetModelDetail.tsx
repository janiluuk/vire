import type { ComputerModel } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  bootTimeLabel,
  compatibilityBadgeKey,
  DEFAULT_BOOT_AFTER_SSD_SEC,
} from "@/lib/koneet/koneet-detail";
import { computerModelSlug } from "@/lib/site/computer-model-slug";
import { buildWizardPrefillQuery } from "@/lib/wizard/wizard-prefill";
import { ORDER_WIZARD_PATH } from "@/lib/site/order-wizard-path";

type Props = {
  model: ComputerModel;
  related: ComputerModel[];
  locale: string;
};

export async function KoneetModelDetail({ model, related, locale }: Props) {
  const t = await getTranslations("koneet");
  const loc = locale === "en" ? "en" : "fi";
  const badgeKey = compatibilityBadgeKey(model.compatible);
  const badgeClass =
    model.compatible === true
      ? "border-g bg-g/[0.12] text-g"
      : model.compatible === false
        ? "border-danger/40 bg-danger/[0.08] text-danger"
        : "border-amber/40 bg-amber/[0.08] text-amber";

  const bootSec = model.estimatedBootSec ?? DEFAULT_BOOT_AFTER_SSD_SEC;
  const bootLabel = bootTimeLabel(bootSec, loc);

  const orderQuery = buildWizardPrefillQuery({
    computer: `${model.make} ${model.model}`.trim(),
    step: 1,
  });

  return (
    <article className="space-y-10">
      <header className="space-y-4">
        <span
          className={`inline-block rounded-full border px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-wide ${badgeClass}`}
        >
          {t(badgeKey)}
        </span>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          {model.make} {model.model}
        </h1>
        {model.yearFrom != null || model.yearTo != null ? (
          <p className="font-mono text-sm text-dust">
            {t("years")}: {model.yearFrom ?? "?"}–{model.yearTo ?? "?"}
          </p>
        ) : null}
      </header>

      <section
        className="rounded-2xl border border-edge bg-card p-6 sm:p-8"
        aria-labelledby="koneet-specs-title"
      >
        <h2
          id="koneet-specs-title"
          className="font-display text-xl font-bold text-ink"
        >
          {t("detailSpecsTitle")}
        </h2>
        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
          {model.ssdSlot ? (
            <div>
              <dt className="font-mono text-xs uppercase tracking-wider text-dust">
                {t("detailSsdSlot")}
              </dt>
              <dd className="mt-1 text-lg text-ink">{model.ssdSlot}</dd>
            </div>
          ) : null}
          {model.maxRamGb != null ? (
            <div>
              <dt className="font-mono text-xs uppercase tracking-wider text-dust">
                RAM
              </dt>
              <dd className="mt-1 text-lg text-ink">{model.maxRamGb} GB</dd>
            </div>
          ) : null}
          {bootLabel ? (
            <div>
              <dt className="font-mono text-xs uppercase tracking-wider text-dust">
                {t("detailBootTime")}
              </dt>
              <dd className="mt-1 text-lg text-ink">{bootLabel}</dd>
            </div>
          ) : null}
          {model.recommendedSsd ? (
            <div className="sm:col-span-2">
              <dt className="font-mono text-xs uppercase tracking-wider text-dust">
                {t("detailRecommendedSsd")}
              </dt>
              <dd className="mt-1 text-lg text-ink">
                {model.ssdShopUrl ? (
                  <a
                    href={model.ssdShopUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-g underline-offset-2 hover:underline"
                  >
                    {model.recommendedSsd}
                  </a>
                ) : (
                  model.recommendedSsd
                )}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      {model.verdict ? (
        <section className="rounded-2xl border border-edge bg-sunken/40 p-6">
          <h2 className="font-display text-xl font-bold text-ink">
            {t("verdict")}
          </h2>
          <p className="mt-3 text-lg font-light leading-relaxed text-fog">
            {model.verdict}
          </p>
        </section>
      ) : null}

      {model.publicNotes ? (
        <section className="rounded-2xl border border-edge bg-card p-6">
          <h2 className="font-display text-xl font-bold text-ink">
            {t("detailPublicNotes")}
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-lg font-light leading-relaxed text-fog">
            {model.publicNotes}
          </p>
        </section>
      ) : null}

      <section
        className="rounded-2xl border border-g/30 bg-g/[0.05] p-6 sm:p-8"
        aria-labelledby="koneet-steps-title"
      >
        <h2
          id="koneet-steps-title"
          className="font-display text-xl font-bold text-ink"
        >
          {t("detailStepsTitle")}
        </h2>
        <ol className="mt-6 space-y-4 text-lg font-light text-fog">
          <li>
            <span className="font-mono text-g">1.</span> {t("detailStep1")}
          </li>
          <li>
            <span className="font-mono text-g">2.</span> {t("detailStep2")}
          </li>
          <li>
            <span className="font-mono text-g">3.</span> {t("detailStep3")}
          </li>
        </ol>
        <p className="mt-6">
          <Link
            href="/itse"
            className="font-medium text-g underline-offset-2 hover:underline"
          >
            {t("detailGuidesLink")}
          </Link>
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <Link
          href={`${ORDER_WIZARD_PATH}?${orderQuery}`}
          className="sparkki-btn-primary inline-flex min-h-tap items-center justify-center px-8 py-3"
        >
          {t("detailOrderCta")}
        </Link>
        {model.viewCount > 0 ? (
          <p className="font-mono text-xs text-dust">
            {t("detailViewCount", { count: model.viewCount })}
          </p>
        ) : null}
      </div>

      {related.length > 0 ? (
        <section aria-labelledby="koneet-related-title">
          <h2
            id="koneet-related-title"
            className="font-display text-2xl font-bold text-ink"
          >
            {t("detailRelatedTitle", { make: model.make })}
          </h2>
          <ul className="mt-4 space-y-2">
            {related.map((r) => {
              const slug = r.slug ?? computerModelSlug(r.make, r.model);
              const rb = compatibilityBadgeKey(r.compatible);
              return (
                <li key={r.id}>
                  <Link
                    href={`/koneet/${slug}`}
                    className="flex items-center gap-3 rounded-xl border border-edge bg-card px-4 py-3 transition-colors hover:border-em"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-wide text-dust">
                      {t(rb)}
                    </span>
                    <span className="font-semibold text-ink">
                      {r.make} {r.model}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
