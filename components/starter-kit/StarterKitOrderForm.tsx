"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Props = { locale: string };

export function StarterKitOrderForm({ locale }: Props) {
  const t = useTranslations("itse");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/checkout/starter-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: String(fd.get("name") ?? "").trim(),
          customerEmail: String(fd.get("email") ?? "").trim(),
          address: String(fd.get("address") ?? "").trim(),
          locale: locale === "en" ? "en" : "fi",
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(t("starterKitError"));
    } catch {
      setError(t("starterKitError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="kit-name" className="mb-2 block font-semibold">
          {t("starterKitName")}
        </label>
        <input
          id="kit-name"
          name="name"
          required
          className="sparkki-input min-h-tap w-full rounded-lg border border-em bg-sunken px-4 text-lg"
          placeholder={t("starterKitNamePlaceholder")}
        />
      </div>
      <div>
        <label htmlFor="kit-address" className="mb-2 block font-semibold">
          {t("starterKitAddress")}
        </label>
        <input
          id="kit-address"
          name="address"
          required
          className="sparkki-input min-h-tap w-full rounded-lg border border-em bg-sunken px-4 text-lg"
          placeholder={t("starterKitAddressPlaceholder")}
        />
        <p className="mt-2 text-base font-light text-fog">{t("starterKitAddressHint")}</p>
      </div>
      <div>
        <label htmlFor="kit-email" className="mb-2 block font-semibold">
          {t("starterKitEmail")}
        </label>
        <input
          id="kit-email"
          name="email"
          type="email"
          required
          className="sparkki-input min-h-tap w-full rounded-lg border border-em bg-sunken px-4 text-lg"
          placeholder={t("starterKitEmailPlaceholder")}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="min-h-tap rounded-lg bg-g px-6 py-3 font-semibold text-canvas hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "…" : t("starterKitSubmit")}
      </button>
      {error ? (
        <p className="text-base text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
