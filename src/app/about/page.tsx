import { reader } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { ContentPage } from "@/components/content-page";
import { renderMarkdoc } from "@/lib/render-markdoc";

export async function generateMetadata() {
  const page = await reader.singletons.about.read();
  return buildMetadata({
    title: page?.title || "About | Sunny Patel",
    description: page?.description,
    ogImage: page?.ogImage,
    path: "/about",
  });
}

export default async function AboutPage() {
  const page = await reader.singletons.about.read();
  if (!page) {
    return (
      <ContentPage h1="About Sunny Patel">
        <p>Content coming soon. Edit this page in the Keystatic admin.</p>
      </ContentPage>
    );
  }

  const content = await page.content();
  const rendered = renderMarkdoc(content);

  return (
    <ContentPage h1={page.h1 || "About"} subtitle={page.subtitle} badge="About">
      {rendered}
    </ContentPage>
  );
}
