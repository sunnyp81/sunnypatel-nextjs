import { buildEntityMap } from "@/lib/entitymap";

export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function GET() {
  const map = buildEntityMap();
  const items = map.entities
    .map(
      (e) => `<section id="${esc(e.entityId)}"><h2>${esc(e.name)} <small>(${esc(e["@type"])})</small></h2><p>${esc(e.description)}</p>${
        e.sameAs?.length ? `<p>Also: ${e.sameAs.map((u) => `<a href="${esc(u)}">${esc(u)}</a>`).join(", ")}</p>` : ""
      }${
        e.relations?.length ? `<ul>${e.relations.map((r) => `<li>${esc(r.predicate)}: <a href="#${esc(r.targetId)}">${esc(r.targetName)}</a>${r.context ? ` (${esc(r.context)})` : ""}</li>`).join("")}</ul>` : ""
      }${e.hasChunks.map((c) => `<blockquote>${esc(c.text)}<footer><a href="${esc(c.sourceUrl)}">${esc(c.pageTitle)}</a>, ${esc(c.publisher)}</footer></blockquote>`).join("")}</section>`
    )
    .join("");
  const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EntityMap | ${esc(map.publisher.name)}</title><meta name="robots" content="noindex,follow"><link rel="entitymap" type="application/json" href="/entitymap.json"><style>body{font:16px/1.6 system-ui,sans-serif;max-width:46rem;margin:2rem auto;padding:0 1rem;color:#111;background:#fff}@media(prefers-color-scheme:dark){body{color:#eee;background:#0b0b0d}a{color:#8ab4ff}}blockquote{margin:.75rem 0;padding-left:1rem;border-left:3px solid #888}footer{font-size:.85em;opacity:.8}small{font-weight:400;opacity:.7}</style></head><body><h1>EntityMap: ${esc(map.publisher.name)}</h1><p>Human-readable view of <a href="/entitymap.json">entitymap.json</a>. Generated ${esc(map.generated)}. Spec: <a href="https://entitymap.org/spec/v1.0">EntityMap v1.0</a>.</p>${items}</body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
