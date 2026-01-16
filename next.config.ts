import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.bileto.sympla.com.br",
      },
      {
        protocol: "https",
        hostname: "images.sympla.com.br",
      },
      {
        protocol: "https",
        hostname: "discovery-next.svc.sympla.com.br",
      },
      {
        protocol: "https",
        hostname: "elcabong.com.br",
      },
      {
        protocol: "https",
        hostname: "www.instagram.com",
      },
      {
        protocol: "https",
        hostname: "scontent.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "*.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "instagram.com",
      },
    ],
  },
};

export default nextConfig;
