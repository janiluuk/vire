import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Verso",
  description: "Vanhojen tietokoneiden uusiokäyttö — SSD, RAM, Linux.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fi" className={`${dmSans.variable} scroll-smooth`}>
      <body className="min-h-screen font-sans antialiased text-lg text-gray-900">
        {children}
      </body>
    </html>
  );
}
