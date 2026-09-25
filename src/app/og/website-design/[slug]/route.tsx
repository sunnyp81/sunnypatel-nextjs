import { reader } from "@/lib/content";
import { renderToolOgImage, websiteDesignHeadline } from "@/lib/og-template";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const page = await reader.collections.websiteDesign.read(slug);

  return renderToolOgImage({
    eyebrow: "WEBSITE DESIGN",
    title: page ? websiteDesignHeadline(page) : "Website Design",
    description: page
      ? page.description
      : "Custom website design and build for UK small businesses.",
  });
}
