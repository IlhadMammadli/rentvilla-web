import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { getSessionUser } from "@/lib/auth";
import { getUserFavoriteCount } from "@/lib/favorites";
import { getUserVillaCount } from "@/lib/villa";
import { canListVillas } from "@/lib/roles";
import { getLocale, getTranslations } from "@/i18n/server";
import { getMessages } from "@/i18n/messages";
import { I18nProvider } from "@/i18n/client";
import { SITE_LOGO_PATH, SITE_NAME } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    icons: {
      icon: SITE_LOGO_PATH,
      apple: SITE_LOGO_PATH,
    },
    applicationName: SITE_NAME,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();
  const favoriteCount = user ? await getUserFavoriteCount(user.id) : 0;
  const villaCount =
    user && canListVillas(user.role) ? await getUserVillaCount(user.id) : 0;
  const locale = await getLocale();
  const messages = getMessages(locale);

  return (
    <html lang={locale}>
      <body className={`${inter.variable} antialiased min-h-screen`}>
        <I18nProvider locale={locale} messages={messages}>
          <Header user={user} favoriteCount={favoriteCount} villaCount={villaCount} />
          <main>{children}</main>
        </I18nProvider>
      </body>
    </html>
  );
}
