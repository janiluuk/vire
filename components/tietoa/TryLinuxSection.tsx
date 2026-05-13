import { getTranslations } from "next-intl/server";
import { tryLinuxNovncUrls } from "@/lib/site/try-linux-novnc";

export async function TryLinuxSection() {
  const t = await getTranslations("info");
  const urls = tryLinuxNovncUrls();

  return (
    <section aria-labelledby="try-linux-title" className="sparkki-card space-y-6 p-6 sm:p-8">
      <h2 id="try-linux-title" className="text-2xl font-bold text-ink">
        {t("tryLinuxTitle")}
      </h2>
      <p className="text-lg leading-relaxed text-ink">{t("tryLinuxIntro")}</p>
      {urls ? (
        <p className="rounded-xl border border-edge bg-card/80 px-4 py-3 text-base leading-relaxed text-ink">
          {t("tryLinuxSecurityHint")}
        </p>
      ) : null}

      {urls ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          <li>
            <a
              href={urls.mint}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-tap flex-col justify-between rounded-2xl border border-edge bg-card p-6 transition-colors duration-150 hover:border-g focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g"
            >
              <div>
                <h3 className="text-xl font-bold text-ink">{t("mintTitle")}</h3>
                <p className="mt-2 text-lg text-ink">{t("mintBody")}</p>
              </div>
              <span className="mt-6 font-semibold text-g">{t("openMint")} →</span>
            </a>
          </li>
          <li>
            <a
              href={urls.fedora}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-tap flex-col justify-between rounded-2xl border border-edge bg-card p-6 transition-colors duration-150 hover:border-g focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g"
            >
              <div>
                <h3 className="text-xl font-bold text-ink">{t("fedoraTitle")}</h3>
                <p className="mt-2 text-lg text-ink">{t("fedoraBody")}</p>
              </div>
              <span className="mt-6 font-semibold text-g">{t("openFedora")} →</span>
            </a>
          </li>
        </ul>
      ) : (
        <p className="rounded-xl border border-amber/30 bg-amber/10 px-4 py-3 text-lg text-ink">
          {t("notConfigured")}
        </p>
      )}
    </section>
  );
}
