import { reader } from "@/lib/content";
import { renderToolOgImage } from "@/lib/og-template";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const page = await reader.collections.websiteDesign.read(slug);

  return renderToolOgImage({
    eyebrow: "WEBSITE DESIGN",
    title: page ? page.h1 || page.title : "Website Design",
    description: page
      ? page.description
      : "Custom website design and build for UK small businesses.",
  });
}
