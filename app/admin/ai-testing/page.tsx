import Link from "next/link";
import { LaptopSpecsTestPanel } from "@/components/admin/LaptopSpecsTestPanel";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminLocale } from "@/lib/admin/get-admin-locale";
import { getAdminMessages } from "@/lib/admin/get-admin-messages";

export default async function AdminAiTestingPage() {
  await requireAdmin();
  const a = getAdminMessages().admin;

  const lookupOff = process.env.SPECS_LOOKUP_ENABLED === "false";
  const searxng = Boolean(process.env.SPECS_SEARXNG_BASE_URL?.trim());
  const ai = Boolean(process.env.SPECS_AI_BASE_URL?.trim());

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/admin" className="text-sparkki-green underline">
        ← {a.dashboard}
      </Link>
      <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-ink">
        {a.aiTesting}
      </h1>
      <p className="mt-2 text-lg text-fog">{a.aiTestingIntro}</p>

      <section
        className="mt-6 rounded-xl border border-edge bg-card/80 p-4 text-lg"
        aria-labelledby="ai-testing-env-heading"
      >
        <h2
          id="ai-testing-env-heading"
          className="text-sm font-semibold uppercase tracking-wide text-fog"
        >
          {a.aiTestingEnvTitle}
        </h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-fog">
          <li>
            {a.aiTestingEnvSearxng}:{" "}
            <span className="text-ink">
              {searxng ? a.aiTestingEnvOn : a.aiTestingEnvOff}
            </span>
          </li>
          <li>
            {a.aiTestingEnvLlm}:{" "}
            <span className="text-ink">
              {ai ? a.aiTestingEnvOn : a.aiTestingEnvOff}
            </span>
          </li>
        </ul>
        {lookupOff ? (
          <p className="mt-3 text-ink">{a.aiTestingLookupOff}</p>
        ) : null}
      </section>

      <LaptopSpecsTestPanel
        locale={getAdminLocale()}
        formLabels={{
          make: a.aiTestingMake,
          model: a.aiTestingModel,
          submit: a.aiTestingSubmit,
          errorPrefix: a.aiTestingErrorPrefix,
        }}
        cardLabels={{
          title: a.specsTitle,
          referenceTitle: a.specsReferenceTitle,
          loading: a.specsLoading,
          empty: a.specsEmpty,
          link: a.specsLink,
        }}
      />
    </div>
  );
}
