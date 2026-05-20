import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { getSessionUser } from "@/lib/auth";
import { getLocale, getTranslations } from "@/i18n/server";
import { getMessages } from "@/i18n/messages";
import { I18nProvider } from "@/i18n/client";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();
  const locale = await getLocale();
  const messages = getMessages(locale);

  return (
    <html lang={locale}>
      <body className={`${inter.variable} antialiased min-h-screen`}>
        <I18nProvider locale={locale} messages={messages}>
          <Header user={user} />
          <main>{children}</main>
        </I18nProvider>
      </body>
    </html>
  );
}
