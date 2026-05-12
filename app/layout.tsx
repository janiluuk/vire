import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="fi" className="scroll-smooth">
      <body className="min-h-screen antialiased text-lg text-gray-900">
        {children}
      </body>
    </html>
  );
}
