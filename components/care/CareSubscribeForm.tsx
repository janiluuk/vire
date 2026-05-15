"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  hasUsableCustomerContact,
  parseCustomerContact,
} from "@/lib/contact/parse-customer-contact";

type Props = { locale: "fi" | "en" };

export function CareSubscribeForm({ locale }: Props) {
  const t = useTranslations("care");
  const [contact, setContact] = useState("");
  const [name, setName] = useState("");
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedContact = useMemo(
    () => parseCustomerContact(contact),
    [contact],
  );
  const contactOk =
    hasUsableCustomerContact(parsedContact) && parsedContact.email != null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/care/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerContact: contact.trim(),
          customerName: name.trim(),
          locale,
          orderId: orderId.trim() || null,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (res.status === 429) {
        setError(t("subscribeErrorRateLimit"));
        return;
      }
      if (res.status === 503 && data.error === "care_not_configured") {
        setError(t("subscribeErrorNotConfigured"));
        return;
      }
      if (res.status === 503) {
        setError(t("subscribeErrorStripe"));
        return;
      }
      if (res.status === 400) {
        setError(t("subscribeErrorValidation"));
        return;
      }
      if (!res.ok) {
        setError(t("subscribeErrorGeneric"));
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(t("subscribeErrorGeneric"));
    } catch {
      setError(t("subscribeErrorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4 text-left">
      <p className="text-base font-light leading-relaxed text-fog">
        {t("subscribeBlurb")}
      </p>
      <div>
        <label
          htmlFor="care-contact"
          className="block font-mono text-[11px] uppercase tracking-[0.12em] text-dust"
        >
          {t("subscribeContact")}
        </label>
        <input
          id="care-contact"
          name="contact"
          type="text"
          autoComplete="email"
          className="sparkki-input mt-2 w-full border border-edge bg-canvas px-4 py-3 text-ink placeholder:text-dust"
          placeholder={t("subscribeContactPlaceholder")}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />
      </div>
      <div>
        <label
          htmlFor="care-name"
          className="block font-mono text-[11px] uppercase tracking-[0.12em] text-dust"
        >
          {t("subscribeNameOptional")}
        </label>
        <input
          id="care-name"
          name="name"
          type="text"
          autoComplete="name"
          className="sparkki-input mt-2 w-full border border-edge bg-canvas px-4 py-3 text-ink placeholder:text-dust"
          placeholder={t("subscribeNamePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label
          htmlFor="care-order"
          className="block font-mono text-[11px] uppercase tracking-[0.12em] text-dust"
        >
          {t("subscribeOrderOptional")}
        </label>
        <input
          id="care-order"
          name="orderId"
          type="text"
          className="sparkki-input mt-2 w-full border border-edge bg-canvas px-4 py-3 text-ink placeholder:text-dust"
          placeholder={t("subscribeOrderPlaceholder")}
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
        <p className="mt-2 text-sm text-fog">{t("subscribeOrderHint")}</p>
      </div>
      {error ? (
        <p className="rounded-spark-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-ink">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={!contactOk || loading}
        className={`sparkki-btn-primary w-full ${loading ? "sparkki-btn-loading" : ""}`.trim()}
      >
        {loading ? t("subscribeSubmitting") : t("subscribeSubmit")}
      </button>
    </form>
  );
}
