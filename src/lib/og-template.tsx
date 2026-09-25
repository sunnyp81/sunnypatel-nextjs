import { ImageResponse } from "next/og";

export const ogImageSize = { width: 1200, height: 630 };
export const ogImageContentType = "image/png";

function truncate(text: string, max = 150) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd()}\u2026`;
}

export function renderToolOgImage({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  const headline = title.length > 60 ? truncate(title, 60) : title;
  const value = truncate(description, 150);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "70px 80px",
          background: "#050507",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #5B8AEF, #3d6fe8, #5B8AEF)",
          }}
        />

        <div style={{ display: "flex", marginBottom: "28px" }}>
          <div
            style={{
              padding: "6px 16px",
              borderRadius: "9999px",
              border: "1px solid rgba(91, 138, 239, 0.3)",
              backgroundColor: "rgba(91, 138, 239, 0.1)",
              color: "#5B8AEF",
              fontSize: "16px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
            }}
          >
            {eyebrow}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: headline.length > 40 ? "56px" : "68px",
            fontWeight: 700,
            color: "white",
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            maxWidth: "1010px",
          }}
        >
          {headline}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "26px",
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.4,
            marginTop: "22px",
            maxWidth: "920px",
          }}
        >
          {value}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginTop: "auto",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "9999px",
              backgroundColor: "#5B8AEF",
              boxShadow: "0 0 16px 4px rgba(91,138,239,0.9)",
            }}
          />
          <div
            style={{
              width: "90px",
              height: "3px",
              borderRadius: "9999px",
              background: "linear-gradient(90deg, #5B8AEF, #D79F1E)",
              boxShadow: "0 0 12px 2px rgba(180,150,120,0.5)",
            }}
          />
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "9999px",
              backgroundColor: "#D79F1E",
              boxShadow: "0 0 16px 4px rgba(215,159,30,0.9)",
            }}
          />
          <div style={{ display: "flex", marginLeft: "12px" }}>
            <span style={{ color: "#5B8AEF", fontSize: "20px", fontWeight: 700 }}>
              SunnyPatel
            </span>
            <span style={{ color: "#D79F1E", fontSize: "20px", fontWeight: 700 }}>
              .co.uk
            </span>
          </div>
        </div>
      </div>
    ),
    { ...ogImageSize }
  );
}
