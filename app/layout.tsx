import type { Metadata } from "next";
import { DM_Mono, DM_Sans, Syne } from "next/font/google";
import Script from "next/script";
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

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500"],
  display: "swap",
});

const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Vire",
  description: "Vanhojen tietokoneiden uusiokäyttö — SSD, RAM, Linux.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fi"
      className={`${dmSans.variable} ${syne.variable} ${dmMono.variable} scroll-smooth`}
    >
      <body className="min-h-dvh bg-canvas font-sans font-light text-lg text-ink antialiased">
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
