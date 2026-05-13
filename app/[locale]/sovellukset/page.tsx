import { redirect } from "next/navigation";

/** @deprecated Use `/[locale]/tietoa/sovellukset/windows`. */
export default function SovelluksetRedirectPage({
  params,
}: {
  params: { locale: string };
}) {
  redirect(`/${params.locale}/tietoa/sovellukset/windows`);
}
