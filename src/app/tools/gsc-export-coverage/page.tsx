import { ToolPageShell, newToolPages } from "@/components/tool-page-shell";
import GscExportCoverage from "./GscExportCoverage";

export function generateMetadata() {
  const info = newToolPages["gsc-export-coverage"];
  return {
    title: "Search Console Export Action Finder",
    description: info.description,
    alternates: { canonical: `https://sunnypatel.co.uk/tools/${info.slug}/` },
  };
}

export default function Page() {
  return (
    <ToolPageShell info={newToolPages["gsc-export-coverage"]}>
      <GscExportCoverage />
    </ToolPageShell>
  );
}
