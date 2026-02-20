import { reader } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { ContentPage } from "@/components/content-page";
import { renderMarkdoc } from "@/lib/render-markdoc";

export async function generateMetadata() {
  const page = await reader.singletons.terms.read();
  return buildMetadata({
    title: page?.title || "Terms of Use | Sunny Patel",
    description: page?.description,
    path: "/terms-of-use",
  });
}

export default async function TermsPage() {
  const page = await reader.singletons.terms.read();
  if (!page) {
    return (
      <ContentPage h1="Terms of Use">
        <p>Content coming soon.</p>
      </ContentPage>
    );
  }

  const content = await page.content();
  const rendered = renderMarkdoc(content);

  return <ContentPage h1="Terms of Use">{rendered}</ContentPage>;
}
