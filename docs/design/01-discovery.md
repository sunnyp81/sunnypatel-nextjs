# Phase 1 discovery: current design system and image inventory

Mechanical read of the repo as it stands on 2026-09-19. No files edited. Nothing fetched externally.

## 1. Current design system, as built

### Colour tokens (`src/app/globals.css`)

Base shadcn/Tailwind v4 token set (`--background`, `--foreground`, `--card`, `--primary`, etc.) is defined twice: a light `:root` block in oklch, and a `.dark` override block. The site forces dark mode site-wide: `src/app/layout.tsx` sets `<html className="dark scroll-smooth">` and also inlines a blocking `<style>` tag that hard-codes `background-color:#050507` before hydration, so the light tokens in `:root` are dead code in production. Effectively there is one live palette.

Dark palette (the one that actually renders):
- `--background: #050507` (near-black, slightly blue-black)
- `--foreground: oklch(0.95 0 0)` (near-white)
- `--card` / `--popover`: `#0a0a0f`
- `--secondary` / `--muted` / `--accent`: `#111118`
- `--border`: `oklch(1 0 0 / 8%)` (8% white)
- `--input`: `oklch(1 0 0 / 12%)`
- `--muted-foreground`: `oklch(0.6 0 0)`
- `--destructive`: `oklch(0.704 0.191 22.216)`

Brand accent tokens (custom, defined once, same in light and dark since they're plain hex, not swapped per theme):
- `--color-brand: #5b8aef` — the primary accent blue, used as `text-brand`, `bg-brand/…`, `border-brand/…` everywhere (nav hover glow, CTA icon colour, focus rings, links, chart bars)
- `--color-brand-deep: #3d6fe8` — darker blue, used sparingly (nav gradient stop)
- `--color-gold: #d79f1e` — amber accent, used for stat highlight cards, gradient blobs, guide-page CTA accents
- `--color-teal: #4c7894` — used only in hero background blob gradients
- `--color-success: #5a922c` — used for the "success" state on lead-capture forms

Two additional colours appear only inline in component code, not as CSS tokens: `#7ba3f5` (a lighter blue, used in the hero title gradient and nav logo gradient) and `#96b6ff` (used as `--guide-link` inside the "report" style guide pages, see below).

Radius: `--radius: 0.625rem` (10px) as the base, with `--radius-sm/md/lg/xl/2xl/3xl/4xl` all derived from it via `calc()`. Cards and buttons generally use `rounded-xl`/`rounded-2xl` (Tailwind classes mapping to these tokens).

### Fonts (`src/app/layout.tsx`)

Two Google fonts loaded via `next/font/google`:
- **Geist** → CSS var `--font-heading`, weights 400/500/600/700. Applied to all headings (`h1`–`h6`) via a `@layer base` rule with `letter-spacing: -0.02em`.
- **Hanken Grotesk** → CSS var `--font-body`, weights 300/400/500/600. Applied to `body` as the default sans font.

No explicit heading type scale is defined in a shared place — sizes are set ad hoc per component (e.g. hero H1 is `text-2xl sm:text-4xl md:text-[2.5rem]`, report-hero H1 is `clamp(36px, 4vw, 56px)` in a CSS module). There is no centralised `h1`/`h2`/`h3` font-size scale in globals.css beyond the family/letter-spacing rule.

### Visual system in plain terms

**Background/surface**: everything sits on `#050507`/`#030303` near-black. Cards and panels are barely-there dark surfaces (`bg-white/[0.02]` to `bg-white/[0.06]`, or `#0a0a0f`/`#07070b`), with hairline borders at very low opacity (`border-white/[0.06]` to `border-white/[0.09]`). This is a "glass on black" look, not a boxed card system — most containers are just a 1px 6–9% white border plus a subtle glow shadow.

**Accent usage**: `#5B8AEF` (brand blue) is the workhorse accent — nav hover states, CTA buttons, focus rings, link underlines, chart primary colour, the skip-link background. Gold (`#d79f1e`) and a muted green "success" (`#5a922c`) are secondary accents used only for specific proof stats and success states. There is no red/error use of `--destructive` visible in the three components reviewed.

**Buttons** (`.gradient-button` / `.gradient-button-variant` in globals.css, wrapped by `src/components/ui/gradient-button.tsx`): primary is a rich royal-blue vertical gradient fill (`#2854c5` → `#2448a8` → `#1f469f`) with an inset top highlight and an outer blue glow shadow, lifting 1px on hover with a brightness bump. Secondary/ghost is a translucent blue fill (`rgba(91,138,239,0.06)`) with a blue-tinted border, same lift-on-hover pattern. A separate CTA style exists only inside long-form article body copy (`.prose-service`): a standalone `<a>` that is the sole child of a paragraph and points to `/contact` renders as a pill button with an animated spinning conic-gradient border (`@property --cta-angle` + `cta-border-spin` keyframes), 3.5s loop.

**Eyebrow/label styling**: small caps-style labels use `text-xs font-semibold uppercase tracking-[0.16em]` (or `.14em`/`.18em` variants) in brand blue or white/65% — e.g. "Free 20-Minute SEO Diagnosis" above the hero form, "Evidence, not promises" above the proof stats row. The `ReportHero`/guide-page eyebrow (`.eyebrow` class in `seo-companies-guide.module.css`) is the same pattern: uppercase, 12px, `.14em` tracking, coloured with `--guide-link` (`#96b6ff`, a slightly different blue than the main brand token).

**Card styling**: no single reusable "Card" visual recurs; instead each section builds its own glass panel. The homepage hero form sits inside a `GlowCard` (mouse-following radial glow border, from `src/components/ui/glow-card.tsx`) over a `bg-[#07070b]/95` panel. The proof-stat mini-cards are `border-white/[0.09] bg-white/[0.035]` tiles with a blurred colour glow behind the number on hover.

**Motion**: hero background uses Framer Motion (`shape-landing-hero.tsx`) to float five blurred, rotated "pill" shapes (`ElegantShape`) with staggered fade/slide-in on load plus an infinite slow vertical bob; respects `useReducedMotion()`. Separately, three CSS-only "aurora blob" keyframe animations (`animate-aurora-1/2/3`, 15–20s ease-in-out loops) exist in globals.css for background glow blobs elsewhere. All animation is neutralised globally under `@media (prefers-reduced-motion: reduce)`.

### Three components read in full

- **`src/components/sections/navbar.tsx`**: fixed, blurred glass bar (`bg-background/70 backdrop-blur-xl`), inline SVG monogram logo ("SP" in a rounded-square badge with a blue linear gradient), nav links as individual pill buttons with a blue glow-on-hover, primary CTA is the `GradientButton` linking to `/contact/` with `data-cta-location`/`data-cta-offer` analytics attributes on every CTA instance across the site.
- **`src/components/sections/hero.tsx`** (wraps `HeroGeometric` from `shape-landing-hero.tsx`): floating gradient badge pill, two-line gradient-text H1 (white → white/80, then blue → white → gold), body copy, then a `GlowCard`-wrapped lead-capture form with three fields, a success state with a "call now" CTA, then a 3-up "Evidence, not promises" proof strip linking to About/Portfolio pages.
- **`src/components/report-hero.tsx`**: the header used for the six "report"-style long-form posts (Keystatic-driven eyebrow/dek/hero image/CTA/byline), rendered inside a CSS-module-styled shell (`seo-companies-guide.module.css`) that defines its own local colour variables (`--guide-ink: #ededf1`, `--guide-link: #96b6ff`, `--guide-surface: #10131a`) rather than reusing the global brand tokens directly — this is a visually distinct sub-system from the rest of the site (different link blue, different card radius of 4px vs the 10px global radius).

## 2. Image inventory

### Blog posts (`src/content/blog/*/index.yaml`), 60 posts

| slug | title | date | ogImage |
|---|---|---|---|
| aged-domains-and-domain-collisions | Aged Domains and Domain Collisions | 2026-09-18 | (empty) |
| ai-referral-traffic-study | AI Referral Traffic Study | 2026-08-02 | (empty) |
| ai-search-statistics | 120 AI Search Statistics 2026 | 2026-02-15 | /images/stats/ai-overviews-ctr-impact.svg |
| ai-search-traffic-portfolio-data | How Much Traffic Comes From AI Search? Real Portfolio Data | 2026-09-18 | (empty) |
| autonomous-seo-agent | My SEO Runs Itself... | 2026-07-10 | (empty) |
| best-aeo-agencies | Best AEO Agencies in the UK | 2026-06-09 | /images/blog/best-aeo-agencies.webp |
| best-local-seo-agencies | (no title set) | 2026-06-14 | /images/blog/best-local-seo-agencies.webp |
| best-seo-companies-uk | Best SEO Companies in the UK | 2026-02-05 | /images/blog/best-seo-companies-uk-shortlist.webp |
| brand-not-appearing-in-chatgpt | Brand Not Appearing in ChatGPT: 7 Fixes | 2026-04-06 | /images/stats/ai-referral-traffic-growth.svg |
| chatgpt-ads | ChatGPT Ads: What We Know... | 2026-02-23 | /images/stats/ai-referral-traffic-growth.svg |
| chatgpt-prompts-for-seo | ChatGPT Prompts for SEO | 2026-07-10 | (empty) |
| content-marketing-statistics | Content Marketing Statistics 2026 | 2026-02-01 | /images/stats/content-length-performance.svg |
| eeat-checker-audit-guide | E-E-A-T Checker & Audit Guide | 2025-12-10 | /images/blog/eeat-checker-audit-guide.png |
| freelance-seo-consultant-uk | Freelance SEO Consultant UK | 2026-01-20 | /images/blog/freelance-seo-consultant-uk.png |
| google-ctr-study | Google CTR by Position | 2026-07-10 | /images/stats/portfolio-ctr-study-2026.png |
| google-open-knowledge-format | Google's Open Knowledge Format (OKF)... | 2026-06-17 | (empty) |
| google-penalty-recovery | Google Penalty Recovery | 2026-04-06 | /images/stats/google-penalty-recovery-timeline.svg |
| google-update-portfolio-impact | Two of My 21 Sites Dropped 87% and 91%... | 2026-09-18 | (empty) |
| how-long-does-seo-take | How Long Does SEO Take | 2025-07-08 | /images/blog/how-long-does-seo-take.png |
| how-many-keywords | How Many Keywords | 2025-07-22 | /images/blog/how-many-keywords.png |
| how-many-websites-are-there | How Many Websites Are There in 2026?... | 2026-09-11 | (empty) |
| how-much-does-an-seo-consultant-charge-uk | How Much Does an SEO Consultant Charge UK | 2026-03-12 | /images/stats/seo-resourcing-cost-comparison.svg |
| how-to-add-schema-markup | How to Add Schema Markup... | 2026-07-11 | (empty) |
| how-to-be-an-seo | How to Be an SEO | 2025-12-10 | /images/blog/how-to-be-an-seo.png |
| how-to-build-topical-authority | How to Build Topical Authority | 2025-11-12 | /images/blog/how-to-build-topical-authority.png |
| how-to-calculate-seo-roi | How to Calculate SEO ROI... | 2026-07-11 | (empty) |
| how-to-choose-seo-consultant | How to Choose an SEO Consultant | 2025-11-26 | /images/blog/how-to-choose-seo-consultant.png |
| increase-organic-traffic | Increase Organic Traffic | 2025-08-05 | /images/blog/increase-organic-traffic.png |
| inhouse-seo-vs-agency-vs-consultant | In-House SEO vs Agency vs Consultant | 2026-04-06 | /images/stats/seo-resourcing-cost-comparison.svg |
| intent-competition-data | Intent Competition Data | 2025-08-19 | /images/blog/intent-competition-data.png |
| local-seo-berkshire-guide | Local SEO Berkshire Guide | 2026-01-07 | /images/blog/local-seo-berkshire-guide.png |
| local-seo-statistics | 46 Local SEO Statistics 2026 | 2026-01-28 | /images/stats/near-me-search-stats.svg |
| managing-44-websites-seo-data | Managing 44 Websites SEO Data | 2026-04-06 | /images/stats/portfolio-overview-44-sites.svg |
| negative-seo-backlink-attack-case-study | What an 83% Spam Backlink Blast Has Done... | 2026-09-18 | (empty) |
| optimise-content-for-ai-search | Optimise Content for AI Search | 2026-02-12 | /images/blog/optimise-content-for-ai-search.png |
| optimise-multiple-keywords | Optimise Multiple Keywords | 2025-09-02 | /images/blog/optimise-multiple-keywords.png |
| seo-after-acquisition | What Happens to SEO After You Acquire a Business | 2026-04-06 | /images/stats/post-acquisition-seo-timeline.svg |
| seo-agency-lying | How to Tell If Your SEO Agency Is Lying to You | 2026-04-06 | /images/stats/seo-agency-red-flags.svg |
| seo-consultant-vs-agency | SEO Consultant vs Agency | 2025-05-01 | /images/stats/seo-resourcing-decision-matrix.svg |
| seo-consultant-vs-seo-agency | SEO Consultant vs SEO Agency | 2026-03-12 | /images/blog/freelance-seo-consultant-uk.png |
| seo-due-diligence-investors | SEO Due Diligence Investors | 2026-04-06 | /images/stats/seo-due-diligence-traffic-split.svg |
| seo-for-multiple-websites | SEO for Multiple Websites | 2026-04-06 | /images/stats/multi-site-technical-debt.svg |
| seo-metrics-for-boards | SEO Metrics Your Board Should Actually See | 2026-04-06 | /images/stats/seo-board-metrics-overview.svg |
| seo-mistakes | SEO Mistakes | 2025-06-10 | /images/blog/seo-mistakes.png |
| seo-semantic-markup-guide | SEO Semantic Markup Guide | 2025-11-20 | /images/blog/seo-semantic-markup-guide.png |
| seo-statistics-uk | SEO Statistics UK | 2026-03-07 | /images/stats/uk-zero-click-2026.png |
| seo-vs-paid-ads | SEO vs Paid Ads Where to Spend First | 2026-04-06 | /images/stats/seo-vs-paid-12-month-comparison.svg |
| technical-seo-vs-on-page-seo | Technical SEO vs On-Page SEO | 2025-06-25 | /images/blog/technical-seo-vs-on-page-seo.png |
| top-geo-agencies | Top GEO Agencies UK 2026 | 2026-06-14 | (empty) |
| topical-authority-vs-domain-authority | Topical Authority vs Domain Authority | 2025-10-29 | /images/blog/topical-authority-vs-domain-authority.png |
| uk-dental-marketing-statistics | UK Dental Practice Marketing Statistics 2026 | 2026-09-11 | (empty) |
| uk-ecommerce-seo-statistics | UK Ecommerce SEO Statistics 2026 | 2026-09-11 | (empty) |
| value-website-organic-traffic | How to Value a Website by Its Organic Traffic | 2026-04-06 | /images/stats/organic-traffic-valuation-formula.svg |
| website-redesign-seo-checklist | Website Redesign SEO Checklist | 2026-04-06 | /images/stats/redesign-seo-checklist-phases.svg |
| what-is-a-content-brief | What is a Content Brief | 2025-09-16 | /images/blog/what-is-a-content-brief.png |
| what-is-eeat-seo | What is E-E-A-T in SEO | 2025-10-01 | /images/blog/what-is-eeat-seo.png |
| what-is-entity-seo | What is Entity SEO | 2025-10-15 | /images/blog/what-is-entity-seo.png |
| what-is-llm-optimisation | What is LLM Optimisation | 2026-02-05 | /images/blog/what-is-llm-optimisation.png |
| why-competitor-ranks-higher | Why Your Competitor Ranks Higher Than You | 2026-04-06 | /images/stats/competitor-ranking-gap-analysis.svg |
| wordpress-vs-webflow | WordPress vs Webflow | 2025-12-24 | /images/blog/wordpress-vs-webflow.png |

15 posts have an empty `ogImage`. Two of these (`best-local-seo-agencies`, `top-geo-agencies`) also have no title set in their yaml.

### REPORT_HERO_CONFIG (`src/app/blog/[slug]/page.tsx`)

Six slugs get the papercraft `heroImage` treatment (all others use the default article layout with no hero photo, only the small `ogImage` inline where it appears in the body):

| slug | heroImage |
|---|---|
| managing-44-websites-seo-data | /images/blog/hero-managing-44-websites.webp |
| how-long-does-seo-take | /images/blog/hero-how-long-does-seo-take.webp |
| google-update-portfolio-impact | /images/blog/hero-google-update-impact.webp |
| ai-search-traffic-portfolio-data | /images/blog/hero-ai-search-traffic.webp |
| negative-seo-backlink-attack-case-study | /images/blog/hero-negative-seo-case-study.webp |
| aged-domains-and-domain-collisions | /images/blog/hero-aged-domains.webp |

Note: three of these six slugs (`aged-domains-and-domain-collisions`, `ai-search-traffic-portfolio-data`, `google-update-portfolio-impact`) have an empty `ogImage` in their yaml, so their only image is the `heroImage` set in this config, not the OG/social image used for link previews — social shares of these three posts will fall back to the site-wide dynamic OG generator, not the new hero art.

### `public/images/blog/` (34 files), format/size/dimensions

| file | format | bytes | px | referenced in src? |
|---|---|---|---|---|
| ai-search-statistics.png | png | 235,265 | 1344x768 | **no** |
| best-aeo-agencies.webp | webp | 101,752 | 1600x900 | yes (1) |
| best-local-seo-agencies.webp | webp | 143,306 | 1600x900 | yes (1) |
| best-seo-companies-uk.png | png | 147,881 | 1344x768 | **no** |
| best-seo-companies-uk-shortlist.webp | webp | 197,022 | 1600x900 | yes (1) |
| content-marketing-statistics.png | png | 161,111 | 1344x768 | **no** |
| eeat-checker-audit-guide.png | png | 104,189 | 1200x686 | yes (1) |
| freelance-seo-consultant-uk.png | png | 239,431 | 1344x768 | yes (2) |
| hero-aged-domains.webp | webp | 235,142 | 2752x1536 | yes (1) |
| hero-ai-search-traffic.webp | webp | 170,336 | 2752x1536 | yes (1) |
| hero-google-update-impact.webp | webp | 161,160 | 2752x1536 | yes (1) |
| hero-how-long-does-seo-take.webp | webp | 191,936 | 2752x1536 | yes (1) |
| hero-managing-44-websites.webp | webp | 322,642 | 2752x1536 | yes (1) |
| hero-negative-seo-case-study.webp | webp | 307,900 | 2752x1536 | yes (1) |
| how-long-does-seo-take.png | png | 182,077 | 1344x768 | yes (1) |
| how-many-keywords.png | png | 186,708 | 1344x768 | yes (1) |
| how-to-be-an-seo.png | png | 222,286 | 1344x768 | yes (1) |
| how-to-build-topical-authority.png | png | 88,725 | 1200x686 | yes (1) |
| how-to-choose-seo-consultant.png | png | 8,254 | 1200x686 | yes (1) |
| increase-organic-traffic.png | png | 300,588 | 1344x768 | yes (1) |
| intent-competition-data.png | png | 5,596 | 1200x686 | yes (1) |
| local-seo-berkshire-guide.png | png | 30,500 | 1200x686 | yes (1) |
| local-seo-statistics.png | png | 166,207 | 1344x768 | **no** |
| optimise-content-for-ai-search.png | png | 287,227 | 1344x768 | yes (1) |
| optimise-multiple-keywords.png | png | 171,496 | 1344x768 | yes (1) |
| seo-mistakes.png | png | 43,831 | 1200x686 | yes (1) |
| seo-semantic-markup-guide.png | png | 146,686 | 1344x768 | yes (1) |
| seo-statistics-uk.png | png | 285,337 | 1344x768 | **no** |
| technical-seo-vs-on-page-seo.png | png | 215,154 | 1344x768 | yes (1) |
| topical-authority-vs-domain-authority.png | png | 146,574 | 1344x768 | yes (1) |
| what-is-a-content-brief.png | png | 3,862 | 1200x686 | yes (1) |
| what-is-eeat-seo.png | png | 252,874 | 1344x768 | yes (1) |
| what-is-entity-seo.png | png | 78,627 | 1200x686 | yes (1) |
| what-is-llm-optimisation.png | png | 73,632 | 1200x686 | yes (1) |
| wordpress-vs-webflow.png | png | 241,214 | 1344x768 | yes (1) |

Five PNGs are referenced nowhere in `src/` (grep across `.ts`/`.tsx`/`.yaml`/`.json`): `ai-search-statistics.png`, `best-seo-companies-uk.png`, `content-marketing-statistics.png`, `local-seo-statistics.png`, `seo-statistics-uk.png`. In each case the matching post's yaml now points to a `/images/stats/*.svg` (or, for `best-seo-companies-uk`, to the newer `-shortlist.webp`) instead — these five PNGs are stale leftovers from a prior image, not deleted when the post's `ogImage` was changed.

**PNGs over 150KB** (10 of 26 non-hero PNGs): `ai-search-statistics.png` (235KB, orphaned), `best-seo-companies-uk.png` (148KB, orphaned, just over), `content-marketing-statistics.png` (161KB, orphaned), `freelance-seo-consultant-uk.png` (239KB), `how-long-does-seo-take.png` (182KB), `how-many-keywords.png` (187KB), `how-to-be-an-seo.png` (222KB), `increase-organic-traffic.png` (301KB), `optimise-content-for-ai-search.png` (287KB), `seo-statistics-uk.png` (285KB, orphaned), `technical-seo-vs-on-page-seo.png` (215KB), `what-is-eeat-seo.png` (253KB), `wordpress-vs-webflow.png` (241KB). None are next-gen formats (webp/avif) except the newer batch.

### `public/images/` (top level, 8 files)

| file | format | bytes | px | notes |
|---|---|---|---|---|
| berkshire-seo-coverage.svg | svg | 4,694 | 680x280 | |
| berkshire-seo-results.svg | svg | 6,350 | 680x320 | |
| logo.png | png | 35,446 | 512x512 | |
| sunny-patel.jpg | jpg | 27,646 | 400x400 | used in `content-page.tsx`, `author/sunny-patel/page.tsx` |
| sunny-patel-profile.jpg | jpg | 81,765 | 745x745 | referenced only in `src/lib/schema.ts` (`profileImageSchema`) — not rendered visually on any page checked |
| sunny-patel-seo-consultant.png | png | 238,668 | 848x1264 | dead `DEFAULT_OG_IMAGE` constant in `metadata.ts` (see section 4) |
| sunny-patel-seo-consultant-reading-berkshire.png | png | 238,668 | 848x1264 | byte-identical to the file above (same size) — likely a duplicate/rename |
| sunny-patel-seo-consultant-teaching.png | png | 1,028,063 | 1280x1908 | used in `src/components/about/about-story.tsx`, **1MB, far over the 150KB flag** |

### `public/images/stats/` (40 files)

Mostly SVGs used as chart-style OG images for the data-heavy posts, plus two duplicated pairs that exist as both `.svg` and `.png`: `portfolio-ctr-study-2026` and `uk-zero-click-2026`. Did not individually verify reference status for all 40 (out of scope for the 400-line budget); the ones cited as `ogImage` in the blog table above are confirmed live.

### Default OG image (`src/lib/metadata.ts`)

`DEFAULT_OG_IMAGE` is set to `/images/sunny-patel-seo-consultant.png` (848x1264 — a **portrait** photo, wrong aspect ratio for Open Graph, which expects ~1200x630 landscape). The file exists on disk. However this constant is **never actually used**: `buildMetadata()` only adds an `images` array to `openGraph` when a per-page `ogImage` argument is passed in and is non-empty and non-svg; there is no fallback to `DEFAULT_OG_IMAGE` anywhere in the function body. It is dead code.

The real fallback for pages/posts with no `ogImage` is Next.js's file-convention `src/app/opengraph-image.tsx`, a dynamically generated 1200x630 PNG (`ImageResponse`) built from the brand's dark radial gradient, the "SP" monogram badge, and site name — properly sized and on-brand. So the 15 empty-`ogImage` posts are not actually broken for social sharing; they just don't get a bespoke image.

## 3. How the 6 new heroes were made

Searched: whole repo (excluding `node_modules`, `.next`) for `diorama`, `papercraft`, `hero-aged-domains`, `nano`/`gemini`; `C:\Users\sunny\repos\claude-code-skills\nano-banana` (files unmodified since 17 Jun, nothing from 19 Sep); `G:\My Drive\SunnyPatel.co.uk` (46 files total, no hits for diorama/papercraft/hero-aged).

**No prompt file, JSON prompt, generation script or log was found.** The only repo hits for "gemini"/"diorama" etc. are unrelated (blog content about AI models, tool config for `seo-prompts` tool, an unrelated research-protocols doc). The six `.webp` files sit in `git status` as newly staged/untracked additions with no prior commit history, so there is no commit message to check either. The closest thing to a prompt record is the `heroImageAlt` text hard-coded in `REPORT_HERO_CONFIG` (quoted in full in section 2 above under "REPORT_HERO_CONFIG"), which reads as a description of the finished image rather than the generation prompt itself. Conclusion: the actual prompts used to generate these six images are **not found in any location searched** and are not recoverable from this repo.

## 4. Service + key page visuals

| Route | Imagery used |
|---|---|
| `/` (homepage, `src/app/page.tsx` → `Hero`, `Services`, etc.) | No photography. Animated gradient/pill shapes (Framer Motion) + inline SVG logo mark. `Services` section uses `lucide-react` icon components, not images. |
| `/services/[slug]/` | No `<Image>` or `/images/` usage in the page component itself beyond passing through each service's own `ogImage` field for metadata. Body content is prose/tables. |
| `/services/paid-seo-audit/` (the £495 audit page) | CSS-only: a radial-gradient brand-blue glow plus a CSS `backgroundImage` dot-grid pattern (`radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)`), masked to fade out — no photo, no SVG illustration. |
| `/tools/` (hub) | No `Image`/`/images/` references found; likely icon/text-driven listing. |
| `/website-design/[[...slug]]/` (cluster) | Uses `src/data/website-design-visuals.tsx` — two custom inline SVG data visualisations per page (bar charts, built with a shared `BarChart` builder), styled to a fixed "clinical" palette (`#5B8AEF` primary, `#5a922c` secondary, `#d79f1e` accent, `#0a0a0f` background) that matches the global brand tokens. No photography. |
| `/ai-visibility-results/` | Same CSS dot-grid + radial-glow pattern as the paid-audit page — no photo. |
| `/about/` | Page-level component (`src/app/about/page.tsx`) has no direct `<Image>`; it emits `profileImageSchema()` (schema.org JSON-LD only, pointing to `sunny-patel-profile.jpg`, not visually rendered here). The actual visible photo of Sunny lives in `src/components/about/about-story.tsx`, which renders `sunny-patel-seo-consultant-teaching.png` (the 1MB file flagged above). |
| `/blog/[slug]/` | Default posts: whatever `ogImage` is set, generally an inline image inside the article body/header depending on template component (`content-page.tsx` uses `sunny-patel.jpg` as an author avatar, not a post hero). The 6 `REPORT_HERO_CONFIG` posts get the new papercraft hero images full-width in `ReportHero`. |

`src/data/website-design-visuals.tsx` in full: a reusable set of SVG chart builders (`BarChart` and presumably others further down the file) rendered inside a `Figure` wrapper with rounded border/background matching the card system, two per page (an "intro" and a "close" visual), built to a fixed colour constant object rather than reading CSS variables directly.

## 5. Gaps

- 15 of 60 blog posts have an empty `ogImage` and none of the six new papercraft heroes; they render with only the dynamic default OG generator and no in-article hero image at all.
- Three of the six new hero posts (`aged-domains-and-domain-collisions`, `ai-search-traffic-portfolio-data`, `google-update-portfolio-impact`) have their new hero art wired only into `REPORT_HERO_CONFIG`, not into `ogImage` — so social-link previews for these three still fall back to the generic site-wide OG card, not the new art.
- Five PNGs in `public/images/blog/` are referenced nowhere in the codebase (`ai-search-statistics.png`, `best-seo-companies-uk.png`, `content-marketing-statistics.png`, `local-seo-statistics.png`, `seo-statistics-uk.png`) — dead weight left behind when those posts' `ogImage` fields were repointed to `/images/stats/*.svg`.
- `DEFAULT_OG_IMAGE` in `src/lib/metadata.ts` points to a portrait (848x1264) photo that is never actually used by the code that defines it — dead code, and would be the wrong aspect ratio for Open Graph if it were wired up.
- `sunny-patel-seo-consultant.png` and `sunny-patel-seo-consultant-reading-berkshire.png` are identical file sizes (238,668 bytes) sitting in `public/images/` as what looks like an accidental duplicate under two names.
- `sunny-patel-seo-consultant-teaching.png`, the one real photo of Sunny used on the About page, is 1,028,063 bytes (1MB) — the largest single image in the repo and far past the 150KB flag threshold, with no responsive/next-gen variant.
- Roughly 26 of the 34 files in `public/images/blog/` are the older generic flat-line-icon illustration style (confirmed by direct view of `how-to-be-an-seo.png` and `freelance-seo-consultant-uk.png`): a small centred cluster of blue/gold outline icons (person silhouette, magnifying glass, laptop, bar chart, link icon) floating in a large empty dark-grey/near-black canvas. This reads as generic AI-illustration-kit stock art, visually unrelated to the new papercraft hero style and to each other beyond the shared icon set — there is no consistent illustration system across the blog image library.
- Colour mismatch between the new hero images and the CSS brand token: the new papercraft heroes (confirmed by viewing `hero-aged-domains.webp`) use a **muted, dark navy** for the "URL bar" plaque element, distinctly darker and less saturated than the site's actual brand blue `--color-brand: #5B8AEF` (a bright periwinkle-blue used everywhere else — nav, buttons, links, charts). If the papercraft style becomes the new brand direction, this navy needs reconciling with `#5B8AEF`, either by updating the CSS token or by regenerating the hero art in the CSS blue.
- The "report" style guide shell (`seo-companies-guide.module.css`, used by `ReportHero` and other guide templates) runs its own local colour variables (`--guide-link: #96b6ff`, `--guide-ink: #ededf1`) and its own 4px card radius, diverging from the global `--color-brand`/`--radius` tokens used by the rest of the site — two parallel, only loosely related visual systems exist depending on which template a page uses.
- No centralised heading type scale exists in `globals.css`; H1 sizes are set per-component/per-template (hero uses a `text-2xl`→`text-[2.5rem]` clamp via Tailwind classes, `ReportHero` uses a CSS-module `clamp(36px, 4vw, 56px)`), so establishing one scale is greenfield work, not a refactor of an existing rule.
- `best-local-seo-agencies` and `top-geo-agencies` posts have no `title` set in their yaml at all, a content gap independent of imagery but worth flagging since both also carry hero/OG images that will display without a matching page title.

## Summary for the brand-system author

The site currently runs one real palette (dark, near-black `#050507` background, `#5B8AEF` brand blue as the single workhorse accent, gold and muted green as minor secondary accents), Geist for headings and Hanken Grotesk for body, and a "glass on black" surface language of hairline low-opacity white borders rather than filled cards — but this system is applied inconsistently: the six new papercraft heroes (colour, navy vs. brand blue) and the "report" guide-page shell (its own link colour and radius) both sit outside the core token set, there is no shared heading scale, roughly three-quarters of the blog's 34 images are generic AI-illustration-kit icon art unrelated to any of the above, five images are dead files, the About page's only real photo is five to seven times over a reasonable size budget with no next-gen format, and the site-wide default OG image is both wrong-shaped and, per the code, never actually invoked. Any brand-system work should decide up front whether the papercraft navy or the existing `#5B8AEF` is the canonical blue going forward, and whether the report-guide shell gets folded into the main token system or stays a deliberately separate sub-brand.
