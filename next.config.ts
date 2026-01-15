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
    ],
  },
};

export default nextConfig;
