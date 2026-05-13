import { NextIntlClientProvider } from "next-intl";
import { AdminLocaleSwitcher } from "@/components/admin/AdminLocaleSwitcher";
import { BackgroundCanvas } from "@/components/layout/BackgroundCanvas";
import { AuthSessionProvider } from "@/components/providers/SessionProvider";
import { getAdminLocale } from "@/lib/admin/get-admin-locale";
import { getAdminMessages } from "@/lib/admin/get-admin-messages";

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = getAdminLocale();
  const messages = getAdminMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <BackgroundCanvas />
      <AuthSessionProvider>
        <div className="relative z-10 min-h-dvh text-lg text-ink">
          <AdminLocaleSwitcher current={locale} />
          {children}
        </div>
      </AuthSessionProvider>
    </NextIntlClientProvider>
  );
}
