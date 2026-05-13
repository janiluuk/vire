"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  getContactFieldIssue,
  getSupportMessageIssue,
} from "@/lib/contact/contact-field-validation";

type Channel = "write" | "discord" | "call";

export function SupportContactForm() {
  const t = useTranslations("tuki");
  const locale = useLocale() as "fi" | "en";
  const [channel, setChannel] = useState<Channel>("write");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [messageBlurred, setMessageBlurred] = useState(false);
  const [contactBlurred, setContactBlurred] = useState(false);

  const discordUrl = process.env.NEXT_PUBLIC_DISCORD_INVITE?.trim() || "/meista/yhteiso";

  const messageIssue = getSupportMessageIssue(message);
  const contactIssue = getContactFieldIssue(contact);
  const canSubmitWrite =
    messageIssue === null && contactIssue === null;
  const showMessageErr =
    (messageBlurred || submitAttempted) && messageIssue === "short";
  const showContactErr =
    (contactBlurred || submitAttempted) && contactIssue != null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (channel !== "write") return;
    setSubmitAttempted(true);
    if (!canSubmitWrite) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/public/support-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          contact: contact.trim(),
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
      setContact("");
      setMessage("");
      setSubmitAttempted(false);
      setMessageBlurred(false);
      setContactBlurred(false);
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
    <div className="mt-6 space-y-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("formTitle")}>
        {(
          [
            ["write", "channelWrite"],
            ["discord", "channelDiscord"],
            ["call", "channelCall"],
          ] as const
        ).map(([key, labelKey]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={channel === key}
            onClick={() => {
              setChannel(key);
              setError(null);
            }}
            className={`min-h-tap rounded-lg border px-4 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-g ${
              channel === key
                ? "border-g bg-g/10 text-g"
                : "border-em text-fog hover:border-em hover:text-ink"
            }`}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      {channel === "discord" ? (
        <p className="text-lg text-fog">
          {t("discordHelp")}{" "}
          <a
            href={discordUrl}
            className="font-semibold text-g underline-offset-2 hover:underline"
          >
            Discord
          </a>
          .
        </p>
      ) : null}

      {channel === "call" ? (
        <p className="text-lg text-fog">
          {t("callHelp")}{" "}
          <a
            href={`tel:${t("phoneValue").replace(/\s/g, "")}`}
            className="font-semibold text-g underline-offset-2 hover:underline"
          >
            {t("phoneValue")}
          </a>
        </p>
      ) : null}

      {channel === "write" ? (
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="sup-msg" className="mb-2 block font-semibold text-ink">
              {t("formWhatHappened")}
            </label>
            <textarea
              id="sup-msg"
              name="message"
              aria-required="true"
              aria-invalid={showMessageErr}
              aria-describedby={showMessageErr ? "sup-msg-err" : undefined}
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onBlur={() => setMessageBlurred(true)}
              placeholder={t("formWhatPlaceholder")}
              className={`sparkki-input w-full resize-none rounded-lg border bg-sunken px-4 py-3 text-ink placeholder:text-dust ${
                showMessageErr ? "border-danger" : "border-em"
              }`}
            />
            {showMessageErr ? (
              <p id="sup-msg-err" role="alert" className="mt-2 text-base text-danger">
                {t("formValidationMessageShort")}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="sup-contact" className="mb-2 block font-semibold text-ink">
              {t("formContact")}
            </label>
            <input
              id="sup-contact"
              name="contact"
              type="text"
              aria-required="true"
              aria-invalid={showContactErr}
              aria-describedby={
                [showContactErr ? "sup-contact-err" : "", "sup-contact-hint"]
                  .filter(Boolean)
                  .join(" ") || undefined
              }
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              onBlur={() => setContactBlurred(true)}
              placeholder={t("formContactPlaceholder")}
              className={`sparkki-input min-h-tap w-full rounded-lg border bg-sunken px-4 text-ink placeholder:text-dust ${
                showContactErr ? "border-danger" : "border-em"
              }`}
            />
            <p id="sup-contact-hint" className="mt-2 text-base font-light text-fog">
              {t("formContactHint")}
            </p>
            {showContactErr && contactIssue === "empty" ? (
              <p id="sup-contact-err" role="alert" className="mt-1 text-base text-danger">
                {t("formValidationContactEmpty")}
              </p>
            ) : showContactErr && contactIssue === "invalid" ? (
              <p id="sup-contact-err" role="alert" className="mt-1 text-base text-danger">
                {t("formValidationContactInvalid")}
              </p>
            ) : null}
          </div>
          {error ? (
            <p role="alert" className="text-lg font-medium text-danger">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="min-h-tap rounded-xl bg-vire-green px-8 py-3 font-semibold text-canvas hover:opacity-[0.9] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? t("formSending") : t("formSubmit")}
          </button>
        </form>
      ) : null}
    </div>
  );
}
