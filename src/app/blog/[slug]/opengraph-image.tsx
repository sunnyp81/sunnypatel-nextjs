import { ImageResponse } from "next/og";
import { reader } from "@/lib/content";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const slugs = await reader.collections.blog.list();
  return slugs.map((slug) => ({ slug }));
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await reader.collections.blog.read(slug);

  // If the post already has a custom OG image, skip dynamic generation
  // (Next.js will use the custom one from metadata instead)
  const title = post?.title || slug.replace(/-/g, " ");
  const tags = post?.tags?.slice(0, 3) || [];

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
        {/* Top accent */}
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
            Blog
          </div>
          {tags.map((tag) => (
            <div
              key={tag}
              style={{
                padding: "6px 12px",
                borderRadius: "9999px",
                border: "1px solid rgba(255,255,255,0.08)",
                backgroundColor: "rgba(255,255,255,0.03)",
                color: "rgba(255,255,255,0.5)",
                fontSize: "14px",
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 50 ? "44px" : "52px",
            fontWeight: 700,
            color: "white",
            lineHeight: 1.2,
            letterSpacing: "-0.03em",
            maxWidth: "950px",
          }}
        >
          {title}
        </div>

        {/* Author */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginTop: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span style={{ color: "white", fontSize: "18px", fontWeight: 600 }}>
              Sunny Patel
            </span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
              SEO Consultant · sunnypatel.co.uk
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
