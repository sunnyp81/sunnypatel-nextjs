import { ToolPageShell, newToolPages } from "@/components/tool-page-shell";
import ReadabilityScore from "./ReadabilityScore";

export function generateMetadata() {
  return {
    title: "Readability Checker: Flesch Reading Ease and Grade Level",
    description:
      "Free readability checker. Get Flesch Reading Ease, Flesch-Kincaid Grade Level and Gunning Fog scores for any text, calculated privately in your browser.",
    alternates: { canonical: "https://sunnypatel.co.uk/tools/readability-score/" },
  };
}

export default function ReadabilityScorePage() {
  return (
    <ToolPageShell info={newToolPages["readability-score"]}>
      <ReadabilityScore />
    </ToolPageShell>
  );
}
