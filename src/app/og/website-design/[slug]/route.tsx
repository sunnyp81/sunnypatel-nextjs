import { reader } from "@/lib/content";
import { renderToolOgImage, websiteDesignHeadline } from "@/lib/og-template";

// Prerendered at build so the Worker never needs the OG renderer at runtime.
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await reader.collections.websiteDesign.list();
  return slugs.map((slug) => ({ slug }));
}

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
