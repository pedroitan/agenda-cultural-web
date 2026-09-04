import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getCityConfig } from "@/config/cities";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });
const city = getCityConfig();

export const metadata: Metadata = {
  title: city.siteTitle,
  description: city.siteDescription,
  keywords: city.keywords,
  authors: [{ name: city.siteTitle.split(' -')[0] }],
  creator: 'Itan Musictech',
  publisher: 'Itan Musictech',
  icons: {
    icon: [
      { url: '/brand/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: city.ogTitle,
    description: city.ogDescription,
    url: city.siteUrl,
    siteName: city.siteTitle.split(' -')[0],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: city.ogTitle,
    description: city.ogDescription,
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
        <Analytics />
      </body>
    </html>
  );
}
