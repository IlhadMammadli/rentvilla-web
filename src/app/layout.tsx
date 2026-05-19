import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { getSessionUser } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "RentVilla — Villa rentals in Azerbaijan",
  description: "Find and rent premium villas across Azerbaijan",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased min-h-screen`}>
        <Header user={user} />
        <main>{children}</main>
      </body>
    </html>
  );
}
