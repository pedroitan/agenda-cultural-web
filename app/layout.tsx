import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agenda Cultural Salvador - 630+ Eventos em Salvador",
  description: "Descubra os melhores eventos culturais em Salvador. Shows, teatro, exposições e muito mais. Atualizado diariamente com eventos do Sympla, El Cabong e Instagram.",
  keywords: ["eventos salvador", "shows salvador", "agenda cultural", "teatro salvador", "eventos culturais", "o que fazer em salvador"],
  authors: [{ name: "Agenda Cultural Salvador" }],
  openGraph: {
    title: "Agenda Cultural Salvador",
    description: "630+ eventos culturais em Salvador - Atualizado diariamente",
    url: "https://agendaculturalsalvador.com.br",
    siteName: "Agenda Cultural Salvador",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agenda Cultural Salvador",
    description: "630+ eventos culturais em Salvador",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
