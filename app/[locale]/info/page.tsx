import { redirect } from "next/navigation";

/** @deprecated Use `/[locale]/tietoa/linux` (info hub). */
export default function InfoPageRedirect({
  params,
}: {
  params: { locale: string };
}) {
  redirect(`/${params.locale}/tietoa/linux`);
}
