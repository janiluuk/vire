import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import fiMessages from "@/messages/fi.json";

const a = fiMessages.admin;

export default async function AdminGuidesPage() {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/admin" className="text-verso-green underline">
        ← {a.dashboard}
      </Link>
      <h1 className="mt-6 text-3xl font-bold">{a.guides}</h1>
      <p className="mt-4 text-lg">{a.guidesStub}</p>
    </div>
  );
}
