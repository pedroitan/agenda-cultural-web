import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: "linear-gradient(135deg, #312e81, #7c3aed)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: "#fbbf24",
            letterSpacing: "-3px",
            lineHeight: 1,
          }}
        >
          AC
        </div>
        <div
          style={{
            fontSize: 22,
            color: "#c4b5fd",
            marginTop: 4,
            letterSpacing: "2px",
          }}
        >
          CULTURAL
        </div>
      </div>
    ),
    { width: 180, height: 180 }
  );
}
