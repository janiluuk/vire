import { redirect } from "next/navigation";

export default function TietoaSovelluksetIndex({
  params,
}: {
  params: { locale: string };
}) {
  redirect(`/${params.locale}/tietoa/sovellukset/windows`);
}
