import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-bold text-ink">{t("title")}</h1>
      <p className="mt-4 text-lg text-fog">{t("description")}</p>
      <p className="mt-10">
        <Link
          href="/"
          className="min-h-tap inline-flex rounded-lg bg-vire-green px-6 py-3 font-semibold text-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g"
        >
          {t("home")}
        </Link>
      </p>
    </div>
  );
}
