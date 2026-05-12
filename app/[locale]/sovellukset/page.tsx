import { getTranslations } from "next-intl/server";
import appsData from "@/data/apps.json";
import { AppGrid, type AppItem } from "@/components/apps/AppGrid";

export default async function SovelluksetPage() {
  const t = await getTranslations("sovellukset");
  const apps = appsData as AppItem[];

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-12">
      <header>
        <h1 className="text-4xl font-bold text-gray-900">{t("title")}</h1>
        <p className="mt-4 text-xl text-gray-900">{t("intro")}</p>
      </header>
      <AppGrid apps={apps} />
    </div>
  );
}
