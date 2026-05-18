"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { CareStatus } from "@prisma/client";

type SubscriptionView = {
  customerName: string;
  customerEmail: string;
  status: CareStatus;
  currentPeriodEnd: string;
  cancelledAt: string | null;
  stripeCancelAtPeriodEnd?: boolean;
};

type Props = {
  locale: string;
  token: string | null;
  subscription: SubscriptionView | null;
  discordUrl: string | null;
  calendlyUrl: string | null;
};

export function OmaSparkkiPanel({
  locale,
  token,
  subscription,
  discordUrl,
  calendlyUrl,
}: Props) {
  const t = useTranslations("omaSparkki");
  const [email, setEmail] = useState("");
  const [accessStatus, setAccessStatus] = useState<
    "idle" | "loading" | "sent" | "error"
  >("idle");
  const [cancelStatus, setCancelStatus] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [portalLoading, setPortalLoading] = useState(false);

  async function requestAccessLink(e: React.FormEvent) {
    e.preventDefault();
    setAccessStatus("loading");
    try {
      const res = await fetch("/api/care/access-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          locale: locale === "en" ? "en" : "fi",
        }),
      });
      const data = (await res.json()) as { ok?: boolean };
      setAccessStatus(data.ok ? "sent" : "error");
    } catch {
      setAccessStatus("error");
    }
  }

  async function cancelSubscription() {
    if (!token) return;
    if (!window.confirm(t("cancelConfirm"))) return;
    setCancelStatus("loading");
    try {
      const res = await fetch("/api/care/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await res.json()) as { ok?: boolean };
      setCancelStatus(data.ok ? "done" : "error");
    } catch {
      setCancelStatus("error");
    }
  }

  async function openBillingPortal() {
    if (!token) return;
    setPortalLoading(true);
    try {
      const res = await fetch("/api/care/billing-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          locale: locale === "en" ? "en" : "fi",
        }),
      });
      const data = (await res.json()) as { ok?: boolean; url?: string };
      if (data.ok && data.url) {
        window.location.href = data.url;
        return;
      }
    } catch {
      /* fall through */
    }
    setPortalLoading(false);
  }

  if (!token || !subscription) {
    return (
      <section className="sparkki-card max-w-lg p-8">
        <h2 className="font-display text-2xl font-bold text-ink">
          {t("requestTitle")}
        </h2>
        <p className="mt-2 text-lg font-light text-fog">{t("requestHint")}</p>
        <form onSubmit={requestAccessLink} className="mt-6 space-y-4">
          <div>
            <label htmlFor="care-access-email" className="mb-2 block font-semibold">
              {t("requestEmail")}
            </label>
            <input
              id="care-access-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="sparkki-input min-h-tap w-full rounded-lg border border-em bg-sunken px-4 text-lg"
            />
          </div>
          <button
            type="submit"
            disabled={accessStatus === "loading"}
            className="min-h-tap rounded-lg bg-g px-6 py-3 font-semibold text-canvas hover:opacity-90 disabled:opacity-50"
          >
            {accessStatus === "loading" ? t("requestSending") : t("requestSubmit")}
          </button>
          {accessStatus === "sent" ? (
            <p className="text-sm text-g" role="status">
              {t("requestSent")}
            </p>
          ) : null}
          {accessStatus === "error" ? (
            <p className="text-sm text-danger" role="alert">
              {t("requestError")}
            </p>
          ) : null}
        </form>
      </section>
    );
  }

  const periodEnd = new Date(subscription.currentPeriodEnd);
  const statusLabel =
    subscription.status === "ACTIVE"
      ? t("statusActive")
      : subscription.status === "PAUSED"
        ? t("statusPaused")
        : t("statusCancelled");

  return (
    <div className="space-y-8">
      <section className="sparkki-card p-8">
        <p className="font-mono text-xs uppercase tracking-wider text-g">
          {t("eyebrow")}
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink">
          {t("greeting", { name: subscription.customerName })}
        </h2>
        <dl className="mt-6 space-y-4 text-lg">
          <div>
            <dt className="font-mono text-xs uppercase text-dust">{t("statusLabel")}</dt>
            <dd className="text-ink">{statusLabel}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase text-dust">
              {t("periodEndLabel")}
            </dt>
            <dd className="text-ink">
              {periodEnd.toLocaleDateString(locale === "en" ? "en-GB" : "fi-FI")}
            </dd>
          </div>
        </dl>
        {cancelStatus === "done" ? (
          <p className="mt-4 rounded-lg border border-g/30 bg-g/10 px-4 py-3 text-sm text-ink">
            {t("cancelScheduled")}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          {subscription.status !== "CANCELLED" && cancelStatus !== "done" ? (
            <button
              type="button"
              onClick={() => void cancelSubscription()}
              disabled={cancelStatus === "loading"}
              className="min-h-tap rounded-lg border border-danger/40 px-5 py-2.5 text-sm font-semibold text-danger hover:bg-danger/10 disabled:opacity-50"
            >
              {cancelStatus === "loading" ? "…" : t("cancelCta")}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void openBillingPortal()}
            disabled={portalLoading}
            className="min-h-tap rounded-lg border border-em px-5 py-2.5 text-sm font-semibold text-ink hover:border-g disabled:opacity-50"
          >
            {portalLoading ? "…" : t("billingPortalCta")}
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {discordUrl ? (
          <a
            href={discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sparkki-card block p-6 transition-colors hover:border-g"
          >
            <h3 className="font-semibold text-ink">{t("discordTitle")}</h3>
            <p className="mt-2 text-sm font-light text-fog">{t("discordHint")}</p>
          </a>
        ) : null}
        {calendlyUrl ? (
          <a
            href={calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sparkki-card block p-6 transition-colors hover:border-g"
          >
            <h3 className="font-semibold text-ink">{t("calendlyTitle")}</h3>
            <p className="mt-2 text-sm font-light text-fog">{t("calendlyHint")}</p>
          </a>
        ) : null}
      </section>
    </div>
  );
}
