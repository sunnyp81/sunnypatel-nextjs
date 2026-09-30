import { ToolPageShell, newToolPages } from "@/components/tool-page-shell";
import MetaDescriptionGenerator from "./MetaDescriptionGenerator";
export function generateMetadata() { const info = newToolPages["meta-description-generator"]; return { title: `Free ${info.title} | Six Search Snippet Drafts`, description: info.description, alternates: { canonical: `https://sunnypatel.co.uk/tools/${info.slug}/` } }; }
export default function Page() { return <ToolPageShell info={newToolPages["meta-description-generator"]}><MetaDescriptionGenerator /></ToolPageShell>; }
