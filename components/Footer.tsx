import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function Footer() {
  const t = await getTranslations("footer");
  return (
    <footer className="mt-auto border-t border-void-800/20 bg-void-950 text-gray-100">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between sm:gap-12">
          <div className="max-w-md">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">
              {t("brand")}
            </p>
            <p className="text-xl font-semibold leading-snug text-white">
              {t("tagline")}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Link
              href="/tuki"
              className="min-h-tap rounded-lg px-1 py-2 text-lg font-medium text-gray-200 underline-offset-4 hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verso-green"
            >
              {t("support")}
            </Link>
            <Link
              href="/about"
              className="min-h-tap rounded-lg px-1 py-2 text-lg font-medium text-gray-200 underline-offset-4 hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verso-green"
            >
              {t("about")}
            </Link>
            <a
              href={process.env.NEXT_PUBLIC_DISCORD_INVITE ?? "#"}
              className="min-h-tap rounded-lg px-1 py-2 text-lg font-medium text-gray-200 underline-offset-4 hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verso-green"
              rel="noopener noreferrer"
              target="_blank"
            >
              {t("discord")}
            </a>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Verso
        </div>
      </div>
    </footer>
  );
}
