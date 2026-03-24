import { ImageResponse } from "next/og";
import { reader } from "@/lib/content";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const slugs = await reader.collections.services.list();
  return slugs.map((slug) => ({ slug }));
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await reader.collections.services.read(slug);
  const title = service?.title || slug.replace(/-/g, " ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          background: "linear-gradient(135deg, #050507 0%, #0a0a1a 50%, #050507 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #5B8AEF, #7B5AEF, #5B8AEF)",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "24px",
          }}
        >
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
            SEO Service
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 40 ? "48px" : "56px",
            fontWeight: 700,
            color: "white",
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            marginBottom: "24px",
            maxWidth: "900px",
          }}
        >
          {title}
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: "32px",
            marginTop: "auto",
          }}
        >
          {[
            { value: "15+", label: "Years Experience", color: "#5B8AEF" },
            { value: "244%", label: "Avg Traffic Growth", color: "#5a922c" },
            { value: "40+", label: "Clients Served", color: "#d79f1e" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  color: stat.color,
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.05em",
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Author */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "60px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <span style={{ color: "white", fontSize: "18px", fontWeight: 600 }}>
              Sunny Patel
            </span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
              sunnypatel.co.uk
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
