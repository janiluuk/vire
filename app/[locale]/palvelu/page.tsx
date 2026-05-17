import { redirect } from "next/navigation";

type Props = {
  params: { locale: string };
  searchParams: { q?: string };
};

/** Legacy `/palvelu` → service landing at `/`. */
export default function PalveluRedirectPage({ params, searchParams }: Props) {
  const q = searchParams.q?.trim();
  const base = `/${params.locale}`;
  if (q) {
    redirect(`${base}?q=${encodeURIComponent(q)}`);
  }
  redirect(base);
}
