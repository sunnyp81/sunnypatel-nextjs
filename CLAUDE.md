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
