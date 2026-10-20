import { buildEntityMap } from "@/lib/entitymap";

export const dynamic = "force-static";

export function GET() {
  return new Response(JSON.stringify(buildEntityMap(), null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
