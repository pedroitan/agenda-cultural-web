import type { Metadata } from "next";
import { Syne, DM_Sans, DM_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const BASE_URL = "https://agendaculturalsalvador.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Agenda Cultural Salvador — Eventos em Salvador, BA",
    template: "%s | Agenda Cultural Salvador",
  },
  description: "Descubra shows, teatro, exposições e festivais em Salvador, Bahia. Atualizado 3x ao dia com eventos do Sympla e El Cabong.",
  keywords: ["eventos salvador", "shows salvador", "agenda cultural salvador", "teatro salvador", "eventos culturais bahia", "o que fazer em salvador", "eventos bahia"],
  authors: [{ name: "Agenda Cultural Salvador", url: BASE_URL }],
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "Agenda Cultural Salvador",
    description: "Shows, teatro, exposições e festivais em Salvador, BA — Atualizado 3x ao dia",
    url: BASE_URL,
    siteName: "Agenda Cultural Salvador",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agenda Cultural Salvador",
    description: "Shows, teatro, exposições e festivais em Salvador, BA",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
    other: {
      "msvalidate.01": [process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ?? ""],
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${syne.variable} ${dmSans.variable} ${dmMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
