import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import fiMessages from "@/messages/fi.json";

const a = fiMessages.admin;

export default async function AdminOrdersPage() {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/admin" className="text-verso-green underline">
        ← {a.dashboard}
      </Link>
      <h1 className="mt-6 text-3xl font-bold">{a.orders}</h1>
      <p className="mt-4 text-lg">{a.ordersStub}</p>
    </div>
  );
}
