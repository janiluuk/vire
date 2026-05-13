"use client";

import { useState } from "react";
import { LaptopSpecsCard } from "@/components/laptop-specs/LaptopSpecsCard";
import type { LaptopSpecsInsight } from "@/lib/specs/laptop-specs";

type CardLabels = {
  title: string;
  loading: string;
  empty: string;
  link: string;
};

type FormLabels = {
  make: string;
  model: string;
  submit: string;
  errorPrefix: string;
};

export function LaptopSpecsTestPanel(props: {
  formLabels: FormLabels;
  cardLabels: CardLabels;
}) {
  const { formLabels, cardLabels } = props;
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<LaptopSpecsInsight | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setInsight(null);
    try {
      const res = await fetch("/api/public/laptop-specs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ make, model }),
      });
      let json: {
        ok?: boolean;
        code?: string;
        summary?: string | null;
        specUrl?: string | null;
      };
      try {
        json = (await res.json()) as typeof json;
      } catch {
        setError(`${formLabels.errorPrefix}: invalid_json`);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError(
          `${formLabels.errorPrefix}: ${json.code ?? `http_${res.status}`}`,
        );
        setLoading(false);
        return;
      }
      if (json.ok) {
        setInsight({
          summary: json.summary ?? null,
          specUrl: json.specUrl ?? null,
        });
      } else {
        setError(`${formLabels.errorPrefix}: ${json.code ?? "unknown"}`);
      }
    } catch {
      setError(`${formLabels.errorPrefix}: network`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <form
        onSubmit={onSubmit}
        className="sparkki-card space-y-4 rounded-2xl p-5 sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-lg">
            <span className="font-semibold text-ink">{formLabels.make}</span>
            <input
              required
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className="mt-2 w-full rounded-lg border border-em bg-canvas px-3 py-2 text-lg"
              autoComplete="off"
            />
          </label>
          <label className="block text-lg">
            <span className="font-semibold text-ink">{formLabels.model}</span>
            <input
              required
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="mt-2 w-full rounded-lg border border-em bg-canvas px-3 py-2 text-lg"
              autoComplete="off"
            />
          </label>
        </div>
        <button
          type="submit"
          className="min-h-tap rounded-lg bg-sparkki-green px-5 py-2.5 font-semibold text-white hover:opacity-95 disabled:opacity-60"
          disabled={loading}
        >
          {formLabels.submit}
        </button>
      </form>

      {error ? (
        <p
          className="rounded-lg border border-danger/40 bg-danger/10 p-4 text-lg text-ink"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <LaptopSpecsCard
        insight={insight}
        loading={loading}
        labels={cardLabels}
      />
    </div>
  );
}
