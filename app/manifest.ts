import type { MetadataRoute } from "next";
import { getCityConfig } from "@/config/cities";

export default function manifest(): MetadataRoute.Manifest {
  const city = getCityConfig();
  const name = city.siteTitle.split(" -")[0];
  return {
    name,
    short_name: name,
    description: city.siteDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#181818",
    theme_color: "#181818",
    lang: "pt-BR",
    icons: [
      { src: "/brand/pwa-icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/pwa-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
