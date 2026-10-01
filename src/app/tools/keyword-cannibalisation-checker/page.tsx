import { ToolPageShell, newToolPages } from "@/components/tool-page-shell";
import KeywordCannibalisationChecker from "./KeywordCannibalisationChecker";

export function generateMetadata() {
  const info = newToolPages["keyword-cannibalisation-checker"];
  return {
    title: `Free ${info.title} | Search Console CSV`,
    description: info.description,
    alternates: { canonical: `https://sunnypatel.co.uk/tools/${info.slug}/` },
  };
}

export default function Page() {
  return (
    <ToolPageShell info={newToolPages["keyword-cannibalisation-checker"]}>
      <KeywordCannibalisationChecker />
    </ToolPageShell>
  );
}
