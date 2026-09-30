import { ToolPageShell, newToolPages } from "@/components/tool-page-shell";
import LlmsTxtGenerator from "./LlmsTxtGenerator";
export function generateMetadata() { const info = newToolPages["llms-txt-generator"]; return { title: `Free ${info.title} | Draft a Site Guide`, description: info.description, alternates: { canonical: `https://sunnypatel.co.uk/tools/${info.slug}/` } }; }
export default function Page() { return <ToolPageShell info={newToolPages["llms-txt-generator"]}><LlmsTxtGenerator /></ToolPageShell>; }
