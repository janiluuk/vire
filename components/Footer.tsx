import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function Footer() {
  const t = await getTranslations("footer");
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white py-10 text-gray-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:justify-between">
        <div>
          <p className="font-semibold text-verso-green">{t("brand")}</p>
          <p className="mt-2 max-w-md text-lg">{t("tagline")}</p>
        </div>
        <div className="flex flex-col gap-3">
          <Link
            href="/tuki"
            className="min-h-tap font-medium text-gray-900 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-verso-green"
          >
            {t("support")}
          </Link>
          <a
            href={process.env.NEXT_PUBLIC_DISCORD_INVITE ?? "#"}
            className="min-h-tap font-medium text-gray-900 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-verso-green"
            rel="noopener noreferrer"
            target="_blank"
          >
            {t("discord")}
          </a>
        </div>
      </div>
    </footer>
  );
}
