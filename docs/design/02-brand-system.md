# Phase 2 brand system: sunnypatel.co.uk

Codified 2026-09-19. This is the fixed rulebook. Every later page, component and generated image follows it.

The site already works visually. It is dark, it is coherent enough to be recognisable, and it ranks. It does not convert. So this document tightens and locks what exists, it does not replace it. There is no second direction proposed and no light mode. Repo engineering rules, security rules and the content release standard take precedence over anything written here.

All contrast figures below were computed from the actual token values in `src/app/globals.css` using the WCAG 2.x relative luminance formula. All image colours were sampled from the six approved hero files in `public/images/blog/`, not estimated by eye.

---

## 1. Subject anchors

Five literal anchors. Every visual decision in this document traces to at least one of them. Category words like "professional", "technical", "modern" and "data-driven" are rejected. They describe every competitor in the set.

### 1.1 The 44-site portfolio

Not "experience". Forty-four live websites that Sunny owns, runs and breaks on purpose. The visual consequence is **repetition with one exception**. A field of near-identical units where one or four are picked out is the truest picture of this business, and it is already the composition of `hero-managing-44-websites.webp` and `hero-how-long-does-seo-take.webp`.

Drives: the recurring composition rule in every generated image (a population, then a focal element). Drives the stat-tile rule: the homepage proof row has exactly three tiles, and other pages may have zero to three, only where each tile has linked evidence, because three is what one person can honestly prove. Forbids any "trusted by" logo wall, because there is no logo wall to show.

### 1.2 Search Console data, published raw

Sunny publishes his own GSC exports, including the losses. Two sites down 87 percent and 91 percent is a published post title. The visual consequence is **the chart is the artwork**. The `/images/stats/*.svg` set and `src/data/website-design-visuals.tsx` are already doing this and are correct.

Drives: numbers are typeset large in the heading face and are always linked to the page that proves them. Drives the ban on any unlinked or round-number statistic. Drives gold as the colour of a measured highlight, never decoration.

### 1.3 The browser window motif

The recurring object across the approved hero set is a flat browser window: a rounded rectangle, a title bar with grey dots, a slotted address bar, a recessed content panel. Locked after Sunny's review of H08, H11 and H12 (approved frames and prompts in `docs/design/approved-v3/`), this is the ownable asset, not a stock icon.

Drives: the entire image system in section 7. Drives the radius decision in section 4 (a small consistent corner radius, never 4px and never a pill). Drives the "one idea, one object" composition rule.

### 1.4 Reading and Berkshire, solo operator

One person, one phone number, one name on the byline. Not a team, not an agency, and the voice guide bans "we" outright. The visual consequence is **the absence of agency furniture**: no team grid, no office photography, no client logo carousel, no invented testimonial wall.

Drives: the trust placement rules in section 4.5. Drives the visible phone number in the hero, which already exists at `src/components/sections/hero.tsx:112`. Drives a byline on every long-form template rather than a brand mark.

### 1.5 Blue as the subject, gold as the result

Inside every generated image, colour carries meaning, not decoration: brand blue `#5B8AEF` marks the one thing the page is about, gold `#D79F1E` marks the one thing that changed, and it is the same hex the interface uses for links, focus and proof numbers. A reader who has seen the site once does not have to relearn a second colour system inside the images.

Drives: the palette rule in section 7.2. Drives the rule that gold never appears without a linked, measured result behind it.

---

## 2. Palette, as built and locked

### 2.1 Surfaces and ink

| Token | Value | Role | Allowed uses |
|---|---|---|---|
| `--background` | `#050507` | Page ground, L0 | `<body>`, full-bleed sections. Also hard-coded in the pre-hydration style block in `src/app/layout.tsx`. Never used as a card fill. |
| `--card` / `--popover` | `#0a0a0f` | Raised surface, L1 | Cards, panels, popovers, the lead-form shell. |
| `--secondary` / `--muted` / `--accent` | `#111118` | Raised surface, L2 | Table header rows, inset code and data blocks, disabled control fills. |
| `--foreground` | `oklch(0.95 0 0)` = `#EEEEEE` | Primary ink | Headings, body copy, any text that must be read. |
| `--muted-foreground` | `oklch(0.6 0 0)` = `#808080` | Secondary ink | Captions, bylines, dates, helper text. Never for a sentence a visitor must read to make a decision. |
| `--border` | `oklch(1 0 0 / 8%)`, effective `#19191B` | Decorative grouping rule | Card edges and section dividers where the border is not the only thing identifying the element. |
| `--input` | `oklch(1 0 0 / 12%)`, effective `#232325` | Form field boundary | **Fails WCAG 1.4.11 at 1.30:1. See 2.5.** |
| `--ring` | `oklch(0.5 0 0)` | Unused in practice | Focus is drawn by the unlayered `:focus-visible` rule at `globals.css:377`, which uses `#5B8AEF`. |

Hard rule: at most two raised levels above L0, and L2 only nested inside an L1 component. Three independent sibling levels on one viewport is what makes a page read as a component-library demo rather than a document.

### 2.2 Brand colours

| Token | Hex | Role | Allowed uses | Banned uses |
|---|---|---|---|---|
| `--color-brand` | `#5B8AEF` | The interface blue. Light, not material. | Links, focus outline, hover glow, chart primary, skip link, active nav, CTA icon, table header text. | As a large flat fill behind white text below 4.5:1. As a paper colour in any generated image. |
| `--color-brand-deep` | `#3D6FE8` | Gradient stop only | The nav logo gradient and the lower stop of a brand gradient. | As text. It measures 4.499:1 on `#050507` and 4.36:1 on `#0a0a0f`, failing AA normal text on both surfaces. |
| `--color-gold` | `#D79F1E` | Measured highlight | A proof number that is genuinely the headline figure. Guide-page accent rules. | More than one gold element per viewport. Any decorative use. Any number that is not sourced. |
| `--color-success` | `#5A922C` | Success state | Form success confirmation, a positive delta in a chart. | As a brand accent or a third decorative colour. |
| `--color-teal` | `#4C7894` | Chart series only | A secondary series in an SVG data visual. | Any text use. It measures 4.29:1 on ground and 4.16:1 on cards, failing AA. |

Two colours currently live inline in components and must be promoted to tokens or removed. `#7BA3F5` appears in the hero title gradient, the nav logo gradient and the hero proof tiles. `#96B6FF` is the guide-page link colour in `seo-companies-guide.module.css`. Rule: `#7BA3F5` becomes `--color-brand-light`, used only as the upper stop of a brand gradient and as proof-number ink where it measures 8.15:1. `#96B6FF` is retired and the guide shell adopts `--color-brand` for links, folding the second parallel system back into the first.

### 2.3 Image blue equals interface blue

An earlier direction needed a separate image-blue token because its physical medium could not be lit to read as `#5B8AEF`. The approved flat-vector style in section 7 has no physical medium and no warm key, so that problem does not exist: images carry the same `#5B8AEF` on the subject and `#D79F1E` on the result as the interface tokens. That earlier token is retired and there is no reconciliation table. If a future image direction reintroduces a photographed or textured medium, this is where that reconciliation gets written, not invented ad hoc on a single page.

### 2.4 Contrast results

Computed against the live dark palette. AA requires 4.5:1 for ordinary text, 3:1 for large text (18.66px bold or 24px regular) and for meaningful non-text graphics.

**On `--background` `#050507`:**

| Colour | Ratio | Verdict |
|---|---|---|
| `--foreground` `#EEEEEE` | 17.55:1 | AAA. |
| `--color-gold` `#D79F1E` | 8.60:1 | AAA. |
| `--color-brand` `#5B8AEF` | 6.14:1 | AA for all text, AAA for large text. |
| `--muted-foreground` `#808080` | 5.16:1 | AA for all text. Do not drop this token any darker. |
| `--color-success` `#5A922C` | 5.41:1 | AA. |
| `--color-brand-deep` `#3D6FE8` | 4.499:1 | **Fails AA for body text.** Not for text. |
| `--color-teal` `#4C7894` | 4.29:1 | **Fails AA for body text.** Chart fills only. |

**On `--card` `#0a0a0f`:**

| Colour | Ratio | Verdict |
|---|---|---|
| `--foreground` `#EEEEEE` | 17.02:1 | AAA. |
| `--color-gold` `#D79F1E` | 8.34:1 | AAA. |
| `--color-brand` `#5B8AEF` | 5.95:1 | AA. |
| `--muted-foreground` `#808080` | 5.00:1 | AA, with 0.5 of headroom. Any further darkening of the card fails it. |
| `--color-success` `#5A922C` | 5.25:1 | AA. |
| `--color-brand-deep` `#3D6FE8` | 4.36:1 | **Fails AA.** |
| `--color-teal` `#4C7894` | 4.16:1 | **Fails AA.** |

Supporting figures used elsewhere in this document: `#7BA3F5` measures 8.15:1 on ground and 7.90:1 on card. `#96B6FF` measures 10.12:1 and 9.81:1. White at 65 percent opacity over ground resolves to `#A8A8A8` at 8.56:1, so the existing `text-white/65` eyebrows pass. White on the primary button fill `#2854C5` measures 6.64:1 and passes.

### 2.5 The border failure, stated plainly

`--border` at 8 percent white resolves to `#19191B` and measures **1.16:1** against the page ground. `--input` at 12 percent resolves to `#232325` and measures **1.30:1**. The hover border at 18 percent reaches only 1.59:1.

WCAG 2.2 success criterion 1.4.11 requires 3:1 for a visual boundary that is needed to identify a control. Reaching 3:1 on this ground needs roughly 36 percent white, which resolves to `#5F5F60` at 3.19:1.

The rule, split by what the border is actually doing:

- **Form fields and any control whose boundary is the only thing identifying it**: must reach 3:1. Either raise the boundary to `rgba(255,255,255,0.36)`, or give the field a fill that itself measures 3:1 against the page, or give it a `#5B8AEF` boundary. This is a known accessibility defect today, not a preference.
- **Decorative grouping rules on cards and sections**: 1.4.11 does not apply, because the card is identified by its content and fill rather than its edge. The 8 to 9 percent hairline may stay, but see the AI-tell finding in section 6, which is a separate argument about the same line.
- **Table row and column dividers that carry the data structure**: reach 3:1, or use an alternative structure that does not depend on divider lines, such as spacing, header fills and explicit row grouping.

---

## 3. Type

Geist for headings, Hanken Grotesk for body. Both already load through `next/font/google` in `src/app/layout.tsx`. This pairing stays and the reason is stated so it stops being an unexamined default: Geist is a screen-native grotesque drawn for interface chrome, which is what the subject is made of, and Hanken Grotesk has a taller x-height and a looser fit, so long GSC-heavy prose stays readable at 17px on a near-black ground where a tighter face closes up. Two grotesques with clearly different jobs, no serif anywhere, which is deliberate: an editorial serif on this content would borrow authority the voice guide explicitly refuses to borrow.

### 3.1 The scale

There is no shared scale today. The two shipped H1s disagree: the homepage hero is `text-2xl sm:text-4xl md:text-[2.5rem]` with `tracking-tight` at `shape-landing-hero.tsx:150`, and the report hero is `clamp(36px, 4vw, 56px)` at `-0.04em` and weight 700 in `seo-companies-guide.module.css:16`. Meanwhile the majority of shipped H2s are `text-lg` or `text-xl`, which is 18 to 20px against body copy at 16 to 17px. A section heading two pixels larger than the paragraph under it is the main reason long pages read flat.

The scale below keeps both shipped H1 anchors and fixes the collapsed middle. It belongs in `@layer base` in `globals.css` so future pages stop inventing sizes.

| Role | Mobile | Desktop | Weight | Letter-spacing | Line-height |
|---|---|---|---|---|---|
| H1 display (homepage hero, report hero) | 32px | 56px | 700 | -0.03em | 1.06 |
| H1 page (service, blog, standard templates) | 28px | 40px | 600 | -0.025em | 1.12 |
| H2 section | 24px | 32px | 600 | -0.02em | 1.20 |
| H3 subsection | 19px | 22px | 600 | -0.015em | 1.32 |
| H4 card or table title | 16px | 17px | 600 | -0.01em | 1.38 |
| Dek or lead paragraph | 18px | 22px | 400 | -0.01em | 1.45 |
| Body | 16px | 17px | 400 | 0 | 1.65 |
| Small, caption, byline | 13px | 14px | 400 | 0 | 1.50 |
| Eyebrow | 12px | 12px | 600 | 0.14em | 1.20 |

Notes that make this enforceable:

- The existing `@layer base` rule setting `letter-spacing: -0.02em` on all headings stays as the fallback. The per-level values above override it. The report shell's `-0.04em` is tightened past legibility at 36px on mobile and moves to `-0.03em`.
- Two H1 variants exist on purpose, and only two. Display is for a page whose job is to be arresting. Page is for a page whose job is to be read. A third variant is not permitted.
- Fluid sizing uses `clamp()` between the mobile and desktop values with a `vw` middle term, matching the pattern already in the report shell.
- Numbers inside stat tiles and charts are set in the heading face, because a number is a headline here, not a data label. This is already the behaviour at `hero.tsx:124`.
- Body never goes below 16px. Captions never go below 13px.

### 3.2 Eyebrow and label rule

Five different tracking values ship today: `0.08em`, `0.10em`, `0.12em`, `0.16em` and `0.18em` across components, plus `0.14em` in the guide module. **Standardise on `0.14em`.** One value, everywhere.

The eyebrow spec: 12px, uppercase, weight 600, `0.14em` tracking, heading face, colour either `--color-brand` (5.95:1 on card) or `text-white/65` (8.56:1 on ground). One eyebrow per section, maximum. It must name a real category or offer. "Free 20-Minute SEO Diagnosis" qualifies. A decorative tag that restates the heading does not.

**Mono eyebrow labels are banned.** A small uppercase monospaced label above a heading is the most recognisable tell in current machine-made design, and it is doubly wrong here because monospace on this site already carries a real meaning: machine output. Monospace is permitted only inside `/tools` for URLs, code, JSON, diffs and raw response bodies, which is exactly where it currently lives across eighteen tool components. It may not leak out of that context into headings, eyebrows, badges, step numbers, footer labels or stat captions.

---

## 4. Layout and components

### 4.1 Surfaces, borders, radius

Surfaces are the three levels in 2.1, two per viewport maximum.

Radius is derived from the anchor in 1.3, the browser window motif's own small consistent corner radius. That gives a soft but small radius, not a pill and not a sharp industrial corner. The base token `--radius: 0.625rem` (10px) is correct and stays.

| Element | Radius | Note |
|---|---|---|
| Card, panel, table container | 12px (`rounded-xl`) | |
| Button, input, select | 10px (base) | |
| Stat tile, pill, badge | 8px | |
| Image frame in a figure | 12px | Matches the card, keeping the image frame visually part of the same system as the card it sits beside. |
| Anything | 4px | **Retired.** The guide shell's 4px corners are the visible seam between the two parallel systems. |

Uniform rounding applied without thought is an AI tell, so the variation above is the decision: containers are softer than controls, controls are softer than tiles, and the reason is the physical prop.

### 4.2 Card rule

A card exists only when the container encodes a real relationship: one service, one post, one stat, one form. Prose does not go in a card. A section does not get a card just to separate it from the section above, that is what spacing and a rule are for.

Banned outright: a coloured accent bar or rail down the side of a card. It does not appear on the site today and it must not be introduced.

### 4.3 Button hierarchy

| Level | Implementation | Rule |
|---|---|---|
| Primary | `.gradient-button`, royal blue vertical fill `#2854C5` to `#1F469F`, inset top highlight, blue glow, 1px lift on hover | **One per viewport.** Reserved for the single highest-value action on that screen. White on this fill measures 6.64:1. |
| Secondary | `.gradient-button-variant`, `rgba(91,138,239,0.06)` fill with a `rgba(91,138,239,0.32)` border | Alternative routes: call, read the proof, see pricing. May appear more than once. |
| Ghost or text | Brand-blue link, underline at 4px offset, thickens on hover | In-prose routes and tertiary navigation. Never styled to look like a button. |

Every level needs hover, focus-visible, active and disabled states. The global `:focus-visible` rule at `globals.css:377` already draws a 2px `#5B8AEF` outline at 2px offset and must not be overridden by a `focus:outline-none` utility.

The animated spinning conic-gradient border on in-prose contact links (`globals.css:143` onwards, 3.5s infinite loop) is **retired**. It is perpetual decorative motion with no communication job, it conflicts with section 5, and a link that spins forever reads as an advert rather than an offer. In-prose contact links become the secondary button.

### 4.4 Stat tile rule

- **The homepage proof row has exactly three tiles. Other pages may have zero to three, only where each tile has linked evidence.** Three is what one operator can honestly prove and it is the ceiling the agency-pattern research names.
- **Outcome-flavoured, not activity-flavoured.** "+340% Aatma organic traffic YoY" qualifies. "200+ audits completed" does not.
- **Real numbers only, each linked to the page that proves it.** The existing hero row at `hero.tsx:13-17` does this correctly and is the reference implementation.
- The number is set in the heading face, in `--color-gold`, `--color-brand-light` or `--color-success`, one colour per tile, with the label in `text-white/75` beneath.
- No round numbers presented as measurements. No "over" or "more than" as a substitute for a figure.

Open defect: the hero tile says "45 sites" while the voice guide, the blog titles and every other reference say 44. One number, one source of truth, everywhere. Until that is reconciled the tile is an unsupported count.

### 4.5 Proof and trust placement

Following the agency-patterns research, filtered through the honesty constraint that this is a solo operator with a small number of real case studies.

Use:

- A three-tile proof row immediately below the hero, not in the footer.
- Case studies that pair a named client with a specific percentage or pound figure.
- The phone number visible above the fold, which it already is.
- A named byline and a link to the author page on every long-form template.
- Original portfolio data, which is the actual differentiator and cannot be copied by an agency.

Do not use, because the material does not exist:

- A client logo wall or "trusted by" strip.
- A testimonial carousel.
- Invented customer counts, ratings, certifications or urgency banners.
- A team grid or stock office photography.

Honesty constraints, non-negotiable and inherited from the content release standard:

- No fabricated logos, testimonials, names, ratings or metrics, in any component, ever, including as placeholder content in a draft that might ship.
- Every statistic renders with a route to its source. A number without a link is not shipped.
- A global "last reviewed" date may not be presented as per-item verification.
- Owned services are visually and verbally separated from editorial listings and rankings.

---

## 5. Motion

One rule. Motion confirms an interaction or the arrival of one element, it lasts 150 to 300ms, it animates only `transform` and `opacity`, and nothing loops forever. Anything that cannot be described in those terms does not ship.

This retires the three aurora keyframe loops, the five floating animated pills in the hero, and the 3.5s spinning CTA border. It keeps hover lift, focus transitions, form state changes and single fade-up entrances.

The global `prefers-reduced-motion` block at the end of `globals.css` stays exactly as written and every new animation must be neutralised by it. `transition-all` is banned, name the properties.

---

## 6. AI-tell check on the current site

Honest audit of what is on the site today, not of what this document proposes.

| Generic pattern risk | Present now? | Evidence | Design response | Verdict |
|---|---|---|---|---|
| Warm-neutral palette (cream ground, serif display, terracotta accent) | No | No serif face loads anywhere in `src/`. No cream or terracotta in any CSS token or in the approved image style, which uses a dark charcoal ground per section 7. | None needed. | **Pass** |
| Near-black ground with one lone restrained accent | Partly | `globals.css:87` sets `#050507`; `--color-brand` is the workhorse across nav, CTAs, links, focus and charts. | It is not a lone accent: gold carries measured highlights, green carries success, and both blue and gold derive from the fixed subject/result rule in section 7.2 rather than being chosen for contrast. Condition: gold must keep a real job. The moment gold becomes decoration this becomes a fail. | **Pass, conditional** |
| Mono eyebrow labels | No | Eyebrows use the heading and body faces (`hero.tsx:119`, `seo-companies-guide.module.css:17`). Monospace appears only in eighteen `/tools` components, where it marks machine output. | Ban written into 3.2 so it cannot drift in. | **Pass** |
| Hairline cards | Yes | `border-white/[0.06]` to `border-white/[0.09]` with `bg-white/[0.02]` to `bg-white/[0.06]`, repeated across roughly twenty files including `hero.tsx:122` and `globals.css:206`. | Two problems in one line. It is the AI house style, and at 1.16:1 to 1.20:1 it is also a WCAG 1.4.11 failure on form fields. Fix per 2.5: real boundary contrast on controls, and per 4.2, fewer cards overall so the surviving ones are identified by content rather than by a barely-visible edge. | **Fail** |
| 01/02/03 spec strips | No | Grep across `src/**/*.tsx` returns no decorative numbered-step markup. | None needed. Numbered sequences remain permitted only where the content is genuinely ordered. | **Pass** |
| Gradient blobs | Yes | The identical `h-[400px] w-[700px] -translate-x-1/2 rounded-full opacity-[0.05] blur-[120px]` block is copy-pasted into roughly twenty page and component files, including `content-page.tsx:105,245,249` and thirteen route files. Plus three `animate-aurora-*` keyframe loops and five animated pills in the hero. | The most template-signalling thing on the site: one decoration, pasted everywhere, communicating nothing. Remove the per-page blob entirely. Where a section genuinely needs depth, use the surface levels in 2.1. The homepage gets the treatment in section 8 instead. | **Fail** |
| Generic icon walls | Yes | `src/components/sections/services.tsx` renders six `lucide-react` icons in a grid, each as icon plus heading plus paragraph, each assigned a colour from a four-colour set. | Named as an anti-pattern in both the agency-pattern research and the design skill. Replace with a treatment that carries real information: the service, the deliverable, the price floor or starting point, and the page that proves it. If a card cannot carry evidence it should be a list row, not a card. | **Fail** |
| Grotesque plus serif pairing | No | Two grotesques only, Geist and Hanken Grotesk. No serif loads. | None needed, and section 3 states why the pairing exists rather than leaving it unexamined. | **Pass** |
| Everything centred | Partly | Hero headline, body, form, eyebrow and all three proof tiles are centred; the in-prose CTA is forced to `text-align: center` at `globals.css:145`. Article and service prose is correctly left-aligned. | Centring is legitimate for the hero, which is a single arresting block. It is wrong for the proof tiles, where three centred columns of different-length labels produce three ragged shapes. Left-align tile content. Drop the forced centring on in-prose CTAs. | **Partial fail** |
| Perpetual decorative animation | Yes | `cta-border-spin` at `globals.css:141`, 3.5s linear infinite; `animate-aurora-1/2/3` at 15s, 20s and 18s infinite. | Retired by the single motion rule in section 5. | **Fail** |
| Uniform radius applied without reason | Partly | `rounded-xl` and `rounded-2xl` used broadly with no stated rule, and the guide shell contradicts them at 4px. | Section 4.1 assigns radius by element class and states the physical reason. 4px is retired. | **Partial fail** |
| Coloured accent rail down a card | No | Not present in any component read. | Explicitly banned in 4.2 so it does not get introduced. | **Pass** |

Summary: four clear failures and two partial failures. In priority order: the gradient blobs, the icon wall, the hairline borders (which is also the accessibility defect), the perpetual animation, then the centred proof tiles and the unreasoned radius.

---

## 7. Image style rules

Locked after Sunny's review of H08, H11 and H12 (2026-09-19): "loving this style". Two earlier directions were rejected the same day and are not permitted to resurface. Approved frames and their exact prompts live in `docs/design/approved-v3/`; the 27 live heroes are `public/images/blog/hero-*.webp`; the full concept list is `docs/design/08-concepts.md`.

### 7.1 The rule

One familiar object a non-expert already recognises, plus one clear cause and effect, readable in one second. No random tiles, no leader lines, no callout circles, no decoration that carries no meaning. If a concept needs a caption to work, it is wrong.

### 7.2 Palette inside images

Ground: dark charcoal `#141418` to `#1E1E24`, sitting on the page's `#050507`. Greys `#8E8E96` to `#B4B4BC` for everything that is not the subject or the result. Brand blue `#5B8AEF` on exactly the subject, the same hex as the interface token, never a separate paper or image blue. Gold `#D79F1E` on exactly the result or the win, one gold element per image. Browser window dots are always grey.

### 7.3 Composition

Never more than three object groups. At least half the frame empty. Upper third quiet, so the image survives being overlaid or cropped. Isometric or straight-on, whichever reads faster. The focal element sits inside the middle 80 percent of the frame vertically: `ContentPage` crops the 16:9 master to 2:1 for the article template, and a focal element near the top or bottom edge gets cut off.

### 7.4 Object vocabulary

Browser window, chat bubble, search bar and answer card, balance scale, podium, calendar page, price tag, folder, pillars, steps, shield, coins, bar chart, line chart. When a real interface exists that people already recognise, draw that, not a symbol standing in for it.

### 7.5 Sizes

Master 2400 x 1350, WebP, quality 82, under 250KB. Open Graph uses the same master file; there is no separate OG render.

### 7.6 Banned

Text, numerals, labels or watermarks; people, hands, faces, logos; neon, glow, gradients; purple; photoreal or 3D-render look; glossy or metal surfaces; leader lines; callout circles; random tile fields; rockets, lightbulbs, handshakes, magnifying glasses.

### 7.7 How to make one

Write the one-line concept first: what a layperson thinks in one second. Copy `docs/design/approved-v3/H12d-answer-box.json` and change only the scene. Pass two approved frames as references. Review the frame in place on the page before approving, not a contact sheet alone. One regen max; if it still needs a caption, the concept is wrong, not the render.

### 7.8 Three worked examples

Taken verbatim from `08-concepts.md`.

**H08, how-to-calculate-seo-roi.** A balance scale: a small grey coin stack on the left pan (cost), a tall gold coin stack on the right pan (return), tipped right; blue beam. Return outweighs cost.

**H11, seo-consultant-vs-seo-agency.** Left: one blue browser window with a single gold coin. Right: a tall grey office block with a big pile of grey coins. One person, less cost.

**H12, optimise-content-for-ai-search.** A search bar, an AI answer card with three text bars, your blue page pinned under it as the source with a gold star.

---

## 8. Signature upgrade for the homepage

Recommended, and scoped tightly.

Replace the five animated gradient pills behind the homepage hero with one still hero image: the 44-site scene already generated at `public/images/blog/hero-managing-44-websites.webp`, placed in the right-hand column beside the lead-capture form on viewports 1280px and wider, with a minimum form-column width held in the grid, and single column below 1280px.

Why I am confident. It is the only asset that literally shows the thing the whole pitch rests on, a field of forty-four sites with a handful picked out, so it is subject-derived by definition. It deletes the site's largest AI tell in the place that matters most. It replaces perpetual decorative motion with a still object, which is what a practitioner site should do. It costs nothing to make.

Conditions. Desktop only, because on mobile the form must own the first screen and nothing may push it down. Below the breakpoint the image element is not rendered at all, a breakpoint-gated render rather than a CSS hide, verified by confirming the 390px and 768px network waterfalls show no hero-image request. LCP is made intentional rather than assumed: the desktop composition is tested in production-like conditions, then either the image is prioritised and optimised if it is the actual LCP, or its rendered area is constrained so the lead heading remains reliably larger, and the outcome is validated with Web Vitals. It loads with explicit width and height and a `sizes` value capped at its rendered width. It carries a one-line caption linking to the portfolio page, which turns decoration into proof. If it cannot meet those conditions it does not ship and the blobs are simply deleted with nothing replacing them.

---

## 9. Scorecard

Scored against `build-scorecard.md` from what the Phase 1 discovery and this session's source and token analysis show. Rendered browser inspection was not performed in this session, so the evidence caps apply and are stated.

| Category | Score | Evidence |
|---|---|---|
| Brand distinctiveness | 6 | The hero image system is genuinely ownable and the palette is coherent, but three AI tells are live (gradient blobs across roughly twenty files, a six-icon service wall, hairline cards) and two parallel visual systems run side by side, the global tokens and the guide module with its own link blue and 4px radius. Capped at 8 regardless, no rendered inspection. |
| Visual hierarchy | 6 | No shared type scale exists. Shipped H2s are 18 to 20px against body at 16 to 17px, so section hierarchy reads flat, and the two H1 variants disagree on size, weight and tracking. Capped at 8, no rendered inspection. |
| UX and conversion | 7 | Strong foundations: a working lead form with a real success state, a visible phone number, analytics attributes on every CTA, and a skip link. Against that, the brief states conversion is near zero, the primary CTA repeats mechanically rather than at decision points, and the in-prose CTA spins forever. Capped at 8, no rendered inspection. |
| Trust and credibility | 5 | The hero proof tile claims 45 sites while the voice guide, blog titles and portfolio route all say 44. The rubric caps trust at 5 for an ambiguous or unsupported count. Everything else here is sound: real linked numbers, no fabricated logos or testimonials, honest framing. Fix the count and this moves to 8. |
| Accessibility | 5 | Known WCAG 2.2 1.4.11 failure. `--input` at 12 percent white measures 1.30:1 and `--border` at 8 percent measures 1.16:1 against the page ground, where 3:1 is required for a control boundary that identifies the control. A known failure caps the category at 5. Text contrast is otherwise good throughout, focus-visible is correctly unlayered, and reduced-motion is honoured globally. |
| Technical and release quality | 5 | No production build or live verification was run in this session, which caps at 7. Below that cap: a 1MB unoptimised About photo with no next-gen variant, five orphaned images, a byte-identical duplicate pair in `public/images/`, and a `DEFAULT_OG_IMAGE` constant that is both the wrong aspect ratio and dead code. |

**Overall: 6 out of 10.** Competent and coherent, held down by two hard caps at 5, one of which (the site count) is a fifteen-minute fix and the other (border contrast) is a token change.

### Top 5 fixes, in priority order

1. **Raise control boundary contrast to 3:1.** `src/app/globals.css:101-102`. `--input` from `oklch(1 0 0 / 12%)` to roughly 36 percent white or a 3:1 fill, and any divider carrying data structure raised to 3:1 or replaced with spacing, header fills or row grouping. This is the only known WCAG failure and it is capping accessibility at 5.
2. **Reconcile the site count.** `src/components/sections/hero.tsx:15` says "45 sites"; `brand-voice.md` and the blog titles say 44. Pick one, propagate to the hero tile, the portfolio route text, the voice guide and the schema. This lifts trust from 5 to 8.
3. **Add the heading scale to `@layer base`.** `src/app/globals.css:120-133`, using the table in section 3.1, then retire the per-component `text-lg` and `text-xl` H2s and the `-0.04em` override at `src/components/seo-companies-guide.module.css:16`.
4. **Delete the gradient blob.** The identical block in roughly twenty files, starting with `src/components/content-page.tsx:105,245,249` and the thirteen route files that copy it, plus the three `animate-aurora-*` rules at `src/app/globals.css:263-278` and the five animated pills in `src/components/ui/shape-landing-hero.tsx`. Replace on the homepage only, per section 8.
5. **Replace the icon wall with evidence.** `src/components/sections/services.tsx`. Six coloured `lucide-react` icons over heading-plus-paragraph is the pattern both the design skill and the agency-pattern research name as generic. Each card carries the deliverable, the starting price or commitment, and a link to the page that proves it, or it becomes a list row.
