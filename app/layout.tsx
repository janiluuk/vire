import type { Metadata, Viewport } from "next";
import { DM_Mono, Inter, Syne } from "next/font/google";
import Script from "next/script";
import { DaytimeTheme } from "@/components/layout/DaytimeTheme";
import { getSiteUrl } from "@/lib/site/site-url";
import "./globals.css";

const syne = Syne({
  subsets: ["latin", "latin-ext"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Sparkki",
  description:
    "Vanhojen tietokoneiden uusiokäyttö — SSD, RAM, Linux. Nordic-henkinen palvelu.",
};

/** Enables `env(safe-area-inset-*)` for notched devices (Phase 7 — mobile UX). */
export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fi"
      className={`${inter.variable} ${syne.variable} ${dmMono.variable} scroll-smooth`}
    >
      <body className="min-h-dvh overflow-x-hidden bg-canvas font-sans font-light text-lg text-ink antialiased">
        <DaytimeTheme />
        {children}
        {plausibleDomain ? (
          <Script
            src="https://plausible.io/js/script.js"
            data-domain={plausibleDomain}
            strategy="lazyOnload"
          />
        ) : null}
      </body>
    </html>
  );
}
