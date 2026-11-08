import { buildEntityMap, type EntityMapEntity } from "@/lib/entitymap";

export const dynamic = "force-static";

const SITE_URL = "https://sunnypatel.co.uk";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const LD_TYPE: Record<string, string> = { Person: "Person", Concept: "DefinedTerm", Service: "Service", Place: "Place", "schema:Book": "Book" };

function jsonLd(e: EntityMapEntity) {
  const ld = {
    "@context": "https://schema.org",
    "@type": LD_TYPE[e["@type"]] ?? "Thing",
    "@id": `${SITE_URL}/entitymap.html#${e.entityId}`,
    name: e.name,
    description: e.description,
    ...(e.sameAs?.length ? { sameAs: e.sameAs } : {}),
    subjectOf: e.hasChunks.map((c) => ({ "@type": "WebPage", url: c.sourceUrl, name: c.pageTitle })),
  };
  return JSON.stringify(ld).replace(/</g, "\\u003c");
}

export function GET() {
  const map = buildEntityMap();
  const ids = new Set(map.entities.map((e) => e.entityId));
  const items = map.entities
    .map((e) => {
      const rels = e.relations?.length
        ? `<ul>${e.relations
            .map((r) => {
              const target = r.targetId && ids.has(r.targetId) ? `<a href="#${esc(r.targetId)}">${esc(r.targetName)}</a>` : esc(r.targetName);
              const page = r.targetUri ? ` (<a href="${esc(r.targetUri)}">${esc(r.targetUri.replace(SITE_URL, "") || r.targetUri)}</a>)` : "";
              return `<li>${esc(r.predicate)}: ${target}${page}${r.confidence ? ` <small>${esc(r.confidence)}</small>` : ""}</li>`;
            })
            .join("")}</ul>`
        : "";
      const chunks = e.hasChunks
        .map((c) => `<blockquote data-publisher="${esc(c.publisher)}" cite="${esc(c.sourceUrl)}"><p>${esc(c.text)}</p><cite><a href="${esc(c.sourceUrl)}">${esc(c.pageTitle)}</a> - published by ${esc(c.publisher)}</cite></blockquote>`)
        .join("");
      const same = e.sameAs?.length ? `<p>Same as: ${e.sameAs.map((u) => `<a href="${esc(u)}">${esc(u)}</a>`).join(", ")}</p>` : "";
      return `<section id="${esc(e.entityId)}"><h2>${esc(e.name)} <small>(${esc(e["@type"])})</small></h2><p>${esc(e.description)}</p>${same}${rels}${chunks}<script type="application/ld+json">${jsonLd(e)}</script></section>`;
    })
    .join("");
  const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EntityMap | ${esc(map.publisher.name)}</title><meta name="description" content="Entities, relationships and evidence published by ${esc(map.publisher.name)}, independent SEO consultant in Reading, Berkshire."><link rel="canonical" href="${SITE_URL}/entitymap.html"><link rel="alternate" type="application/json" href="/entitymap.json"><link rel="entitymap" type="application/json" href="/entitymap.json"><style>:root{--bg:#fff;--fg:#111;--link:#1f469f;--rule:#888}@media(prefers-color-scheme:dark){:root{--bg:#0b0b0d;--fg:#eee;--link:#8ab4ff}}body{font:16px/1.6 system-ui,sans-serif;max-width:46rem;margin:2rem auto;padding:0 1rem;color:var(--fg);background:var(--bg)}a{color:var(--link)}blockquote{margin:.75rem 0;padding-left:1rem;border-left:3px solid var(--rule)}blockquote p{margin:0 0 .25rem}cite{font-size:.85em;font-style:normal;opacity:.85}small{font-weight:400;opacity:.7}</style></head><body><h1>EntityMap: ${esc(map.publisher.name)}</h1><p>Human-readable view of <a href="/entitymap.json">entitymap.json</a>: the people, services, places and topics on <a href="${SITE_URL}/">sunnypatel.co.uk</a>, with the passage on each page that supports them. Generated ${esc(map.generated)}. Spec: <a href="https://entitymap.org/spec/v1.0">EntityMap v1.0</a>.</p>${items}</body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
