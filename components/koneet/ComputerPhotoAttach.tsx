"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { compressPhotoFile } from "@/lib/client/compress-photo";

export type LaptopPhotoHintClient = {
  description: string | null;
  make: string | null;
  model: string | null;
  notes: string | null;
};

type Props = {
  locale: string;
  onApplyDescription: (text: string) => void;
  disabled?: boolean;
};

export function ComputerPhotoAttach({
  locale,
  onApplyDescription,
  disabled = false,
}: Props) {
  const t = useTranslations("koneet");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<LaptopPhotoHintClient | null>(
    null,
  );

  function clearPhoto() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSuggestion(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    setSuggestion(null);
    const file = e.target.files?.[0];
    if (!file) {
      clearPhoto();
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function analyzePhoto() {
    const file = inputRef.current?.files?.[0];
    if (!file) return;
    setAnalyzing(true);
    setError(null);
    setSuggestion(null);
    try {
      const { base64, mimeType } = await compressPhotoFile(file);
      const res = await fetch("/api/public/computer-photo-hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          locale: locale === "en" ? "en" : "fi",
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        code?: string;
        hint?: LaptopPhotoHintClient;
      };
      if (!res.ok || !data.ok || !data.hint) {
        setError(
          data.code === "not_configured"
            ? t("photoErrorNotConfigured")
            : data.code === "vision_failed"
              ? t("photoErrorVision")
              : t("photoErrorGeneric"),
        );
        return;
      }
      setSuggestion(data.hint);
    } catch {
      setError(t("photoErrorGeneric"));
    } finally {
      setAnalyzing(false);
    }
  }

  function applySuggestion() {
    const text =
      suggestion?.description?.trim() ||
      [suggestion?.make, suggestion?.model].filter(Boolean).join(" ");
    if (text) {
      onApplyDescription(text);
      setSuggestion(null);
    }
  }

  return (
    <div
      className="rounded-xl border border-dashed border-em bg-sunken/30 p-4"
      data-testid="computer-photo-attach"
    >
      <p className="text-sm font-semibold text-ink">{t("photoLabel")}</p>
      <p className="mt-1 text-sm font-light text-fog">{t("photoHint")}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          className="sr-only"
          disabled={disabled || analyzing}
          onChange={onFileChange}
        />
        <label
          htmlFor={inputId}
          className={`min-h-tap inline-flex cursor-pointer items-center rounded-lg border border-em px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-g hover:text-g ${
            disabled || analyzing ? "pointer-events-none opacity-50" : ""
          }`}
        >
          {t("photoChoose")}
        </label>
        {previewUrl ? (
          <>
            <button
              type="button"
              className="min-h-tap rounded-lg border border-em px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-g hover:text-g disabled:opacity-50"
              disabled={disabled || analyzing}
              onClick={() => void analyzePhoto()}
            >
              {analyzing ? t("photoAnalyzing") : t("photoAnalyze")}
            </button>
            <button
              type="button"
              className="min-h-tap rounded-lg px-4 py-2.5 text-sm text-fog transition-colors hover:text-ink"
              disabled={analyzing}
              onClick={clearPhoto}
            >
              {t("photoRemove")}
            </button>
          </>
        ) : null}
      </div>

      {previewUrl ? (
        <Image
          src={previewUrl}
          alt=""
          width={640}
          height={320}
          unoptimized
          className="mt-4 h-auto max-h-40 w-auto max-w-full rounded-lg border border-edge object-contain"
        />
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {suggestion ? (
        <div className="mt-4 rounded-lg border border-g/25 bg-g/[0.06] p-4 text-sm">
          <p className="font-semibold text-ink">{t("photoSuggestionTitle")}</p>
          {suggestion.description ? (
            <p className="mt-2 text-ink">{suggestion.description}</p>
          ) : null}
          {(suggestion.make || suggestion.model) && !suggestion.description ? (
            <p className="mt-2 text-ink">
              {[suggestion.make, suggestion.model].filter(Boolean).join(" ")}
            </p>
          ) : null}
          {suggestion.notes ? (
            <p className="mt-2 font-light text-fog">{suggestion.notes}</p>
          ) : null}
          <button
            type="button"
            className="mt-3 min-h-tap rounded-lg bg-g px-4 py-2 text-sm font-semibold text-canvas hover:opacity-90"
            onClick={applySuggestion}
          >
            {t("photoApply")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
