import { ImageResponse } from "next/og";

export const alt = "Sunny Patel — Independent SEO Consultant, Reading & Berkshire";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "radial-gradient(ellipse at top left, #1a1f3a 0%, #050507 55%)",
          color: "#f5f5f7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: "#0d0d14",
              border: "2px solid rgba(91,138,239,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 700,
              color: "#7ba3f5",
              letterSpacing: -1,
            }}
          >
            SP
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#a1a1aa",
              fontWeight: 500,
            }}
          >
            sunnypatel.co.uk
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: "#ffffff",
              maxWidth: 980,
            }}
          >
            Independent SEO Consultant
          </div>
          <div
            style={{
              fontSize: 36,
              color: "#7ba3f5",
              fontWeight: 500,
              letterSpacing: -0.5,
            }}
          >
            Reading · Berkshire · 15+ years · 180→620 visits in 9 months
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            color: "#a1a1aa",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: 28,
          }}
        >
          <div>No contracts · No juniors · Free 30-min audit</div>
          <div style={{ color: "#7ba3f5", fontWeight: 600 }}>07305 523333</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
