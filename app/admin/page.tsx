import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import fiMessages from "@/messages/fi.json";

const a = fiMessages.admin;

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{a.dashboard}</h1>
          <p className="mt-2 text-lg text-gray-700">
            {a.welcome}, {session.user.email}
          </p>
        </div>
        <Link
          href="/api/auth/signout?callbackUrl=/admin/login"
          className="min-h-tap rounded-lg border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-100"
        >
          {a.logout}
        </Link>
      </header>
      <nav className="mt-8 flex flex-wrap gap-4" aria-label="Admin">
        <Link
          href="/admin/orders"
          className="min-h-tap rounded-xl bg-white px-5 py-3 font-semibold shadow ring-1 ring-gray-200 hover:ring-verso-green"
        >
          {a.orders}
        </Link>
        <Link
          href="/admin/models"
          className="min-h-tap rounded-xl bg-white px-5 py-3 font-semibold shadow ring-1 ring-gray-200 hover:ring-verso-green"
        >
          {a.models}
        </Link>
        <Link
          href="/admin/guides"
          className="min-h-tap rounded-xl bg-white px-5 py-3 font-semibold shadow ring-1 ring-gray-200 hover:ring-verso-green"
        >
          {a.guides}
        </Link>
      </nav>
      <p className="mt-10 text-lg text-gray-700">{a.statsSoon}</p>
    </div>
  );
}
