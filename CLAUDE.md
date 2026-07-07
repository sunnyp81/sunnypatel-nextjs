# SunnyPatel.co.uk

## Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 (CSS variables)
- Keystatic CMS (local content, flat-file)
- shadcn/ui components
- Framer Motion (via `motion/react`)

## Deployment
- Vercel (production)
- Domain: sunnypatel.co.uk

## Content Collections (Keystatic)
- `src/content/blog/` — Blog posts (Markdoc)
- `src/content/services/` — Service pages (Markdoc)
- `src/content/portfolio/` — Case study pages (Markdoc)
- `src/content/pages/` — Static pages

## Key Paths
- `src/app/` — Next.js App Router pages
- `src/components/` — React components (sections/, about/, portfolio/, ui/)
- `src/lib/` — Utilities (content.ts, metadata.ts, schema.ts, render-markdoc.ts)
- `public/` — Static assets, llms.txt, llms-full.txt
- `keystatic.config.ts` — Collection definitions

## Schema Markup
- `src/lib/schema.ts` — All JSON-LD schema builder functions
- Global: Person + Organization + LocalBusiness (in layout.tsx)
- Blog: BlogPosting + BreadcrumbList
- Services: ProfessionalService + BreadcrumbList
- Portfolio: CreativeWork + BreadcrumbList
- About: FAQPage

## Design Tokens
- Blue accent: #5B8AEF
- Gold accent: #d79f1e
- Dark theme (class="dark" on html)
- Heading font: Space Grotesk (--font-heading)
- Body font: Inter (--font-body)

## Content Briefs
External: `G:\My Drive\SunnyPatel.co.uk\content-briefs\`

## Conventions
- All content must pass `/semantic-audit` before publishing
- Use `buildMetadata()` from `src/lib/metadata.ts` for page meta
- Use `schemaGraph()` from `src/lib/schema.ts` for JSON-LD output
- FAQ data exported from `src/components/about/about-faq.tsx`

---

# sunnypatel-nextjs — Project Brain

Per-repo brain, migrated from central claude-memory 2026-06-20. Canonical project memory now lives here.

## Current state

Sunny Patel's personal SEO + AI-search (GEO) consultant site, **sunnypatel.co.uk**. Lead-generation money site (no direct revenue stream yet, £0; goal is qualified leads / the £495 fixed-fee audit / discovery calls).

- **Live** on production. Ranks well (**position 1 for "seo consultant reading", ~1,200 impr/day**) but converts almost nothing (1-2 clicks/day, near-zero leads). The whole job now is conversion, not ranking.
- **Stack:** Next.js 16 (App Router) + TypeScript, Tailwind v4, Keystatic CMS (flat-file Markdoc), shadcn/ui, Framer Motion. Branch `master`, GitHub `sunnyp81/sunnypatel-nextjs`.
- **Deploy:** GitHub -> Vercel. NOT auto-deploy — `git push` then `npx vercel --prod`. Local build needs dummy env vars `KEYSTATIC_GITHUB_CLIENT_ID` / `KEYSTATIC_GITHUB_CLIENT_SECRET` / `KEYSTATIC_SECRET`.
- **GA4:** `G-SJRTDNRZG6`.
- **Key URLs:** `/cv` (serves `public/cv.pdf` via `next.config.ts` rewrite), `/blog/best-aeo-agencies/` (GEO flagship, 92/100 audit), the £495 audit page, `/tools/` hub (20 free SEO tools, Website Grader is the lead funnel), `/website-design/` cluster (14 pages), `/services/seo-consultant-reading/` + `/services/seo-berkshire/` (core money pages).

## Key facts & warnings

- 🔴 **GSC for sunnypatel.co.uk is NOT under the `sunnypat81` account** — inspect/submit fails there. Use the `2012infinite` GSC account (token-2012infinite.json).
- 🔴 **NEVER run a Cloudways live->staging DB sync** (portfolio-wide rule from Hummingbird; not repo-specific but durable).
- Deploy is manual (`git push` + `npx vercel --prod`), not auto-deploy — easy to forget the Vercel step.
- `trailingSlash: true` in `next.config.ts`. ALL internal links must use trailing-slash URLs — non-trailing links caused Google to index both variants and split ranking signals (recurring root cause, fixed repeatedly). Sitemap must emit only slash versions.
- Brand: light mode, Bricolage Grotesque (headings) + Hanken Grotesque (body), single blue accent, "SP" monogram. **No em dashes or en dashes anywhere** — commas/colons/hyphens only.
- Organic ceiling reality: "seo consultant reading" ~200 searches/mo, so even at #1 the lead ceiling is ~1.8/mo. Service-business growth needs cold outreach + directories + reviews, not just organic.
- AEO ceiling is now **off-page** (~85% of AI brand mentions are third-party) — needs brand-consensus / entity-authority outreach (Sunny has parked outreach).
- Lead source: **2 "Free SEO Audit" bookings via the Trafft widget (Jun 8)**. Trafft admin email strips customer name/email — **lead details only in the Trafft dashboard**.
- Manual items Sunny owes: Trafft notification template fields; mark GA4 `generate_lead` as a key event; paste GA4 id into Trafft Integrations; GBP/Bark/Yell sameAs (uncomment lines in `src/lib/schema.ts` then redeploy); Wikidata entry; Clutch reviews (0 live). Lemlist/cold-outreach creds are pointers only (e.g. reference_lemlist_api_credentials in the vault) — no secrets stored here.
- CV update: overwrite `public/cv.pdf`, push `master`, `npx vercel --prod`. Editable master is the gdoc in `G:\My Drive\Sunny Patel CV\`.
- Content briefs live external: `G:\My Drive\SunnyPatel.co.uk\content-briefs\`.

## History

- **Jul 7** — evolve-site loop started: CTR title/meta rewrites on 5 striking-distance pages (`b55cf1c`), loop state in `docs/evolve/`. Shipped the pending homepage refresh WIP (`981b004`): new hero copy, Geist heading font, smaller H1; consolidated /services/ai-visibility-audit/ into /services/paid-seo-audit/ with 301. Verdict pass due Jul 14-21.
- **Jun 11** — `/cv` now serves `public/cv.pdf` via `next.config.ts` rewrite (`/cv`+`/cv/` -> `/cv.pdf`, 308 via trailingSlash). Commit `6ef0f53`.
- **Jun 8-10** — 2 Trafft "Free SEO Audit" leads (details in Trafft dashboard only). Built/GEO-optimised `/blog/best-aeo-agencies/` (renamed from `-uk-2026`, 301'd): 2.7k words, ItemList (8 orgs) + FAQPage + SpeakableSpecification, semantic audit 92/100, 4 inbound links, live + Bing-submitted, commit `b88ee02`. Hardened GA4 `generate_lead` in `src/lib/use-lead-form.ts`.
- **Jun 15** — Claude Design conversion-redesign prompt drafted (light mode, Bricolage/Hanken, blue, SP monogram; home as primary conversion page, 3 offers, £495 audit product page, sticky CTA, named-testimonial proof, WCAG 2.1 AA). Not yet built.
- **May 10** — Reading cannibalization fix + CTR rewrites (`d814409`): homepage was outranking `/services/seo-consultant-reading/` (pos 3.9 vs 37) for the money query; stripped "Reading/Berkshire" from homepage title/desc/hero anchor, rewrote Reading + Berkshire service titles, added local pill links.
- **May 6-7** — Shipped `/website-design/` Phase 1: 14 pages (ROOT + 6 NODE hubs + 7 SEEDs) + 28 inline SVGs (`01c79b7`, `16c0a05`). New `websiteDesign` Keystatic collection + catch-all route. Pricing floor £1,500. Phase 2-4 + homepage cross-link outstanding.
- **Apr 16** — CTR rewrites on homepage + 5 blog posts (`dd874a6`).
- **Apr 14** — GEO/AEO audit (was 52/100): 301 Berkshire URL, dateModified + Speakable on service schema, Clutch sameAs, ghost-citation fixes, new `/blog/seo-consultant-vs-agency/` + `/services/local-seo-reading/`. Pending: Clutch reviews, GBP/Bark/Yell/DesignRush, Wikidata.
- **Apr 13** — GSC audit (33 clicks / 24.3k impr / 0.14% CTR): CTR rewrites on 4 top-impression pages (`a2e96c8`), IndexNow wired (key file added), dynamic OG image via next/og (`f31d1aa`). Note: `@sunnypat81` twitter handle unconfirmed.
- **Apr 9** — Built + deployed `/tools/` hub: 20 free SEO tools + 5 API routes (redirect/og/ssl/grade/links). Website Grader = lead funnel to `/contact/`.
- **Apr 4** — Contact-page cannibalization fix (`ac798bb`): removed "Reading, Berkshire" from contact, excluded canonical'd pages from sitemap.
- **Mar 28** — Crawl/CTR sprint (`aed71ae`, `91039f3`, `f5942ca`): removed mid-content CTAs, canonical consolidation, fixed 30 non-trailing-slash links.
- **Mar 26** — Berkshire refresh + fixed 872 trailing-slash internal links (root cause of dual indexing); noindexed 62+ tag pages + 18 remote city pages; rewrote llms.txt.
- **Mar 17-19** — Trailing-slash root cause found (Mar 14 config flip without sitemap update split all signals); sitemap + internal links + schema geo-signals fixed; OG image filename de-leaked (`3acf3dc`); best-seo-companies-uk expanded 8->11 agencies; citation audit (53 bulk citations low quality; Chamber/Clutch/GBP worth more than all of them).
