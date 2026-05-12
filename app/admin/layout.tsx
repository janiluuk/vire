import { NextIntlClientProvider } from "next-intl";
import fiMessages from "@/messages/fi.json";
import { AuthSessionProvider } from "@/components/providers/SessionProvider";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextIntlClientProvider locale="fi" messages={fiMessages}>
      <AuthSessionProvider>
        <div className="min-h-screen bg-gray-50 text-lg text-gray-900">
          {children}
        </div>
      </AuthSessionProvider>
    </NextIntlClientProvider>
  );
}
