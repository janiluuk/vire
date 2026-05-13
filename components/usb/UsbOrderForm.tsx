"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function UsbOrderForm({ locale }: { locale: string }) {
  const t = useTranslations("itse");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/usb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          address,
          locale,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setError(t("usbError"));
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(t("usbError"));
    } finally {
      setLoading(false);
    }
  }

  const ok = name.trim() && email.includes("@") && address.trim().length > 5;

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="usb-name" className="mb-2 block font-semibold">
          {t("usbName")}
        </label>
        <input
          id="usb-name"
          className="min-h-tap w-full rounded-lg border border-em bg-sunken px-4 text-lg text-ink placeholder:text-dust focus:border-g focus:outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          placeholder={t("usbNamePlaceholder")}
        />
      </div>
      <div>
        <label htmlFor="usb-address" className="mb-2 block font-semibold">
          {t("usbAddress")}
        </label>
        <textarea
          id="usb-address"
          rows={3}
          className="w-full resize-y rounded-lg border border-em bg-sunken px-4 py-3 text-lg text-ink placeholder:text-dust focus:border-g focus:outline-none"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          autoComplete="street-address"
          placeholder={t("usbAddressPlaceholder")}
        />
        <p className="mt-2 text-base font-light text-fog">{t("usbAddressHint")}</p>
      </div>
      <div>
        <label htmlFor="usb-email" className="mb-2 block font-semibold">
          {t("usbEmail")}
        </label>
        <input
          id="usb-email"
          type="email"
          className="min-h-tap w-full rounded-lg border border-em bg-sunken px-4 text-lg text-ink placeholder:text-dust focus:border-g focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder={t("usbEmailPlaceholder")}
        />
        <p className="mt-2 text-base font-light text-fog">{t("usbEmailHint")}</p>
      </div>
      {error ? (
        <p className="font-semibold text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={!ok || loading}
        className="min-h-tap rounded-xl bg-sparkki-green px-6 py-3 font-semibold text-canvas disabled:opacity-50"
      >
        {loading ? "…" : t("usbSubmit")}
      </button>
    </form>
  );
}
