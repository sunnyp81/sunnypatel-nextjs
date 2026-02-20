import { reader } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { ContentPage } from "@/components/content-page";
import { renderMarkdoc } from "@/lib/render-markdoc";

export async function generateMetadata() {
  const page = await reader.singletons.privacy.read();
  return buildMetadata({
    title: page?.title || "Privacy Policy | Sunny Patel",
    description: page?.description,
    path: "/privacy-policy",
  });
}

export default async function PrivacyPage() {
  const page = await reader.singletons.privacy.read();
  if (!page) {
    return (
      <ContentPage h1="Privacy Policy">
        <p>Content coming soon.</p>
      </ContentPage>
    );
  }

  const content = await page.content();
  const rendered = renderMarkdoc(content);

  return <ContentPage h1="Privacy Policy">{rendered}</ContentPage>;
}
