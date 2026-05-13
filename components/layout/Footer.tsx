import { getTranslations } from "next-intl/server";
import { PulseLink } from "./FooterNavLinks";

const linkMuted =
  "min-h-tap rounded-lg py-2 text-lg font-normal text-fog transition-colors duration-150 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g";

export async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="mt-auto border-t border-edge bg-raised/75 text-ink backdrop-blur-xl">
      <div className="mx-auto max-w-[1100px] px-6 py-12 sm:px-12 sm:py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))] lg:gap-12">
          <div className="max-w-md lg:max-w-none">
            <p className="mb-2 font-mono text-[10px] font-normal uppercase tracking-[0.22em] text-fog">
              {t("brand")}
            </p>
            <p className="font-display text-xl font-bold leading-snug tracking-tight text-ink">
              {t("tagline")}
            </p>
          </div>

          <div>
            <p className="mb-3 font-mono text-[10px] font-normal uppercase tracking-[0.1em] text-fog">
              {t("colService")}
            </p>
            <ul className="flex flex-col gap-1">
              <li>
                <PulseLink href="/#steps-title" className={`${linkMuted} px-1`}>
                  {t("howItWorks")}
                </PulseLink>
              </li>
              <li>
                <PulseLink href="/#pricing-title" className={`${linkMuted} px-1`}>
                  {t("pricing")}
                </PulseLink>
              </li>
              <li>
                <PulseLink href="/palvelu/b2b" className={`${linkMuted} px-1`}>
                  {t("b2b")}
                </PulseLink>
              </li>
              <li>
                <PulseLink href="/palvelu#palvelu-tilaa" className={`${linkMuted} px-1`}>
                  {t("orderCta")}
                </PulseLink>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 font-mono text-[10px] font-normal uppercase tracking-[0.1em] text-fog">
              {t("colLearn")}
            </p>
            <ul className="flex flex-col gap-1">
              <li>
                <PulseLink href="/tietoa/linux" className={`${linkMuted} px-1`}>
                  {t("linuxMint")}
                </PulseLink>
              </li>
              <li>
                <PulseLink
                  href="/tietoa/sovellukset/windows"
                  className={`${linkMuted} px-1`}
                >
                  {t("apps")}
                </PulseLink>
              </li>
              <li>
                <PulseLink href="/itse" className={`${linkMuted} px-1`}>
                  {t("diy")}
                </PulseLink>
              </li>
              <li>
                <PulseLink href="/meista/yhteiso" className={`${linkMuted} px-1`}>
                  {t("community")}
                </PulseLink>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 font-mono text-[10px] font-normal uppercase tracking-[0.1em] text-fog">
              {t("colContact")}
            </p>
            <ul className="flex flex-col gap-1">
              <li>
                <a
                  href={`mailto:${t("emailValue")}`}
                  className={`${linkMuted} px-1 underline-offset-4 hover:underline`}
                >
                  <span className="block font-mono text-xs uppercase tracking-label text-fog">
                    {t("emailLabel")}
                  </span>
                  {t("emailValue")}
                </a>
              </li>
              <li>
                <PulseLink href="/tuki" className={`${linkMuted} px-1`}>
                  {t("support")}
                </PulseLink>
              </li>
              <li>
                <PulseLink href="/tietosuoja" className={`${linkMuted} px-1`}>
                  {t("privacy")}
                </PulseLink>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-edge pt-6 text-center font-mono text-sm text-fog">
          © {new Date().getFullYear()} Vire
        </div>
      </div>
    </footer>
  );
}
