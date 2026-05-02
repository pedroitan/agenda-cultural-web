import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agenda Cultural Salvador - Shows, Teatro, Exposições e Festivais em Salvador, Bahia",
  description: "Encontre shows, peças de teatro, exposições, festivais, eventos gastronômicos e muito mais em Salvador, Bahia. Agenda cultural atualizada diariamente.",
  keywords: "eventos salvador, shows salvador, agenda cultural salvador, teatro salvador, exposições salvador, festivais salvador",
  authors: [{ name: "Agenda Cultural Salvador" }],
  openGraph: {
    title: "Agenda Cultural Salvador - Shows, Teatro, Exposições e Festivais em Salvador, Bahia",
    description: "Encontre shows, peças de teatro, exposições, festivais, eventos gastronômicos e muito mais em Salvador, Bahia. Agenda cultural atualizada diariamente.",
    url: "https://agendaculturalsalvador.com.br",
    siteName: "Agenda Cultural Salvador",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agenda Cultural Salvador - Shows, Teatro, Exposições e Festivais em Salvador, Bahia",
    description: "Encontre shows, peças de teatro, exposições, festivais, eventos gastronômicos e muito mais em Salvador, Bahia. Agenda cultural atualizada diariamente.",
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
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
