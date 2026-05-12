"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export function SupportContactForm() {
  const t = useTranslations("tuki");
  const locale = useLocale() as "fi" | "en";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    name.trim().length > 0 &&
    email.includes("@") &&
    message.trim().length >= 4;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/public/support-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          locale,
        }),
      });
      if (res.status === 429) {
        setError(t("formRateLimit"));
        return;
      }
      if (res.status === 503) {
        setError(t("formNotConfigured"));
        return;
      }
      const data = (await res.json()) as { ok?: boolean };
      if (!res.ok || !data.ok) {
        setError(t("formError"));
        return;
      }
      setDone(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setError(t("formError"));
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <p
        role="status"
        className="rounded-xl border border-g/40 bg-g/10 px-4 py-3 text-lg text-ink"
      >
        {t("formSent")}
      </p>
    );
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
      <div>
        <label htmlFor="sup-name" className="mb-2 block font-semibold text-ink">
          {t("formName")}
        </label>
        <input
          id="sup-name"
          name="name"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-h-tap w-full rounded-lg border border-em px-4 text-lg"
        />
      </div>
      <div>
        <label htmlFor="sup-email" className="mb-2 block font-semibold text-ink">
          {t("formEmail")}
        </label>
        <input
          id="sup-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-tap w-full rounded-lg border border-em px-4 text-lg"
        />
      </div>
      <div>
        <label htmlFor="sup-msg" className="mb-2 block font-semibold text-ink">
          {t("formMessage")}
        </label>
        <textarea
          id="sup-msg"
          name="message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-lg border border-em px-4 py-3 text-lg"
        />
      </div>
      {error ? (
        <p role="alert" className="text-lg font-medium text-danger">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={!canSubmit || loading}
        className="min-h-tap rounded-xl bg-vire-green px-8 py-3 font-semibold text-canvas hover:opacity-[0.9] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? t("formSending") : t("formSubmit")}
      </button>
    </form>
  );
}
