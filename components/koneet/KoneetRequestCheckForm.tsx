"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Props = {
  locale: string;
  defaultMake?: string;
  defaultModel?: string;
};

export function KoneetRequestCheckForm({
  locale,
  defaultMake = "",
  defaultModel = "",
}: Props) {
  const t = useTranslations("koneet");
  const [make, setMake] = useState(defaultMake);
  const [model, setModel] = useState(defaultModel);
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/public/model-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          make: make.trim(),
          model: model.trim(),
          contact: contact.trim(),
          locale: locale === "en" ? "en" : "fi",
        }),
      });
      const data = (await res.json()) as { ok?: boolean };
      setStatus(data.ok ? "ok" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section
      className="mt-12 rounded-2xl border border-edge bg-card p-6 sm:p-8"
      aria-labelledby="koneet-request-title"
    >
      <h2
        id="koneet-request-title"
        className="font-display text-2xl font-bold text-ink"
      >
        {t("requestTitle")}
      </h2>
      <p className="mt-2 text-lg font-light text-fog">{t("requestHint")}</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="koneet-req-make" className="mb-2 block font-semibold text-ink">
              {t("requestMake")}
            </label>
            <input
              id="koneet-req-make"
              required
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className="sparkki-input min-h-tap w-full rounded-lg border border-em bg-sunken px-4 text-lg text-ink"
            />
          </div>
          <div>
            <label htmlFor="koneet-req-model" className="mb-2 block font-semibold text-ink">
              {t("requestModel")}
            </label>
            <input
              id="koneet-req-model"
              required
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="sparkki-input min-h-tap w-full rounded-lg border border-em bg-sunken px-4 text-lg text-ink"
            />
          </div>
        </div>
        <div>
          <label htmlFor="koneet-req-contact" className="mb-2 block font-semibold text-ink">
            {t("requestContact")}
          </label>
          <input
            id="koneet-req-contact"
            required
            type="text"
            autoComplete="email tel"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={t("requestContactPlaceholder")}
            className="sparkki-input min-h-tap w-full rounded-lg border border-em bg-sunken px-4 text-lg text-ink"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="min-h-tap rounded-lg bg-g px-6 py-3 text-sm font-semibold text-canvas hover:opacity-90 disabled:opacity-50"
        >
          {status === "loading" ? t("requestSending") : t("requestSubmit")}
        </button>
        {status === "ok" ? (
          <p className="text-sm text-g" role="status">
            {t("requestSuccess")}
          </p>
        ) : null}
        {status === "error" ? (
          <p className="text-sm text-danger" role="alert">
            {t("requestError")}
          </p>
        ) : null}
      </form>
    </section>
  );
}
