import { ImageResponse } from "next/og";
import { getCityConfig } from "@/config/cities";

export const runtime = "edge";
const city = getCityConfig();
export const alt = city.siteTitle.split(' -')[0];
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div style={{ fontSize: "64px" }}>🎭</div>
        </div>
        <div
          style={{
            fontSize: "80px",
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          Agenda Cultural
        </div>
        <div
          style={{
            fontSize: "80px",
            fontWeight: 800,
            color: "#fbbf24",
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: "32px",
          }}
        >
          {city.name}
        </div>
        <div
          style={{
            fontSize: "30px",
            color: "#94a3b8",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          Shows • Teatro • Exposições • Festivais
        </div>
        <div
          style={{
            fontSize: "22px",
            color: "#64748b",
            textAlign: "center",
          }}
        >
          {city.siteUrl.replace('https://', '')} · Atualizado diariamente
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
