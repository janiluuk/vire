import { redirect } from "next/navigation";

type Props = {
  params: { locale: string };
  searchParams: { q?: string; computer?: string };
};

/** Legacy `/koneet` list → compatibility section on home. */
export default function KoneetRedirectPage({ params, searchParams }: Props) {
  const computer =
    searchParams.computer?.trim() ?? searchParams.q?.trim();
  const base = `/${params.locale}`;
  if (computer) {
    redirect(
      `${base}?computer=${encodeURIComponent(computer)}#yhteensopivuus`,
    );
  }
  redirect(`${base}#yhteensopivuus`);
}
