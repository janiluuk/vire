"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function AdminLoginPage() {
  const t = useTranslations("admin");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/admin",
    });
    setLoading(false);
    if (res?.error) {
      setError(t("signInFailed"));
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-8 px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900">{t("loginTitle")}</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <div>
          <label htmlFor="email" className="mb-2 block font-semibold">
            {t("email")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-tap w-full rounded-lg border border-gray-300 px-4 text-lg focus:border-verso-green focus:outline-none focus:ring-2 focus:ring-verso-green"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block font-semibold">
            {t("password")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-tap w-full rounded-lg border border-gray-300 px-4 text-lg focus:border-verso-green focus:outline-none focus:ring-2 focus:ring-verso-green"
          />
        </div>
        {error ? (
          <p className="text-lg font-medium text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="min-h-tap rounded-xl bg-verso-green px-6 py-3 text-lg font-semibold text-white hover:bg-[#178f68] disabled:opacity-60"
        >
          {loading ? "…" : t("signIn")}
        </button>
      </form>
    </main>
  );
}
