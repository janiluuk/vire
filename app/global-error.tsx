"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fi">
      <body className="min-h-dvh bg-canvas px-4 py-16 font-sans text-lg text-ink antialiased">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="font-display text-3xl font-bold">Sparkki — virhe</h1>
          <p className="mt-4 text-fog">
            Sovelluksessa tapahtui odottamaton virhe. Päivitä sivu tai yritä
            myöhemmin uudelleen.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="min-h-tap rounded-spark-md bg-g px-6 py-3 font-semibold text-canvas transition-opacity duration-fast hover:opacity-90"
            >
              Yritä uudelleen
            </button>
            <a
              href="/fi"
              className="min-h-tap inline-flex items-center justify-center rounded-spark-md border border-em px-6 py-3 font-semibold text-fog transition-colors duration-fast hover:text-ink"
            >
              Etusivu (FI)
            </a>
            <a
              href="/en"
              className="min-h-tap inline-flex items-center justify-center rounded-spark-md border border-em px-6 py-3 font-semibold text-fog transition-colors duration-fast hover:text-ink"
            >
              Home (EN)
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
