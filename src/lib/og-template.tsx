import { ImageResponse } from "next/og";

export const ogImageSize = { width: 1200, height: 630 };
export const ogImageContentType = "image/png";

function truncate(text: string, max = 150) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const boundary = /\s/.test(text[max - 1]) ? cut.length : cut.search(/\s+\S*$/);
  const words = boundary >= 0 ? cut.slice(0, boundary) : "";
  return `${words.replace(/[\s\p{P}]+$/gu, "")}\u2026`;
}

export function websiteDesignHeadline(page: {
  title: string;
  h1?: string;
  metaTitle?: string;
}) {
  const candidates = [page.title, page.h1, page.metaTitle]
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => value.split(/ \| | - |:| \u2013 /)[0].trim())
    .filter(Boolean);
  return candidates.find((value) => value.length <= 48)
    ?? truncate(candidates[0] || "Website Design", 48);
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
          justifyContent: "flex-start",
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
            fontSize: headline.length > 40 ? "64px" : "76px",
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
            position: "absolute",
            left: "80px",
            right: "80px",
            bottom: "85px",
            height: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "5px",
              right: "5px",
              top: "4px",
              height: "2px",
              background: "linear-gradient(90deg, #5B8AEF, #D79F1E)",
              boxShadow: "0 0 12px 2px rgba(180,150,120,0.5)",
            }}
          />
          {["#5B8AEF", "#999587", "#D79F1E"].map((color) => (
            <div
              key={color}
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "9999px",
                backgroundColor: color,
                boxShadow: `0 0 16px 4px ${color}`,
              }}
            />
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            right: "80px",
            bottom: "36px",
            display: "flex",
          }}
        >
          <div style={{ display: "flex" }}>
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
