import { ToolPageShell, newToolPages } from "@/components/tool-page-shell";
import LocalSeoAudit from "./LocalSeoAudit";

export function generateMetadata() {
  const info = newToolPages["local-seo-audit"];
  return {
    title: `Free ${info.title} | Check a Business Page`,
    description: info.description,
    alternates: { canonical: `https://sunnypatel.co.uk/tools/${info.slug}/` },
  };
}

export default function Page() {
  return (
    <ToolPageShell info={newToolPages["local-seo-audit"]}>
      <LocalSeoAudit />
    </ToolPageShell>
  );
}
