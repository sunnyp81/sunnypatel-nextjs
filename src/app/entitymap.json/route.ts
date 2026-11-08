import { buildEntityMap } from "@/lib/entitymap";

export const dynamic = "force-static";

export function GET() {
  return new Response(JSON.stringify(buildEntityMap(), null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // Public data; lets the entitymap.org validator and other tools fetch it cross-origin.
      "Access-Control-Allow-Origin": "*",
    },
  });
}
