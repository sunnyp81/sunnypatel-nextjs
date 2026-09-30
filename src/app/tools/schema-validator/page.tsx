import { ToolPageShell, newToolPages } from "@/components/tool-page-shell";
import SchemaValidator from "./SchemaValidator";
export function generateMetadata() { const info = newToolPages["schema-validator"]; return { title: `Free ${info.title} | Check JSON-LD`, description: info.description, alternates: { canonical: `https://sunnypatel.co.uk/tools/${info.slug}/` } }; }
export default function Page() { return <ToolPageShell info={newToolPages["schema-validator"]}><SchemaValidator /></ToolPageShell>; }
