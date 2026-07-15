# Iteration log — sunnypatel.co.uk

Append-only. Verdict pass fills `measured:` 7-14 days after each change.

---

iteration: 1
date: 2026-07-07
hypothesis: Rewriting titles/metas on 5 high-impression pages lifts CTR at current positions and nudges striking-distance rankings via better query match.
playbook_tactic: ctr-title-rewrite
affected_urls:
  - /services/seo-consultant-reading/  (pos 1.98 on money query, 0.35% CTR)
  - /services/seo-berkshire/           (pos 20.6, 4,471 impr; also fixed em/en dashes in H1/subtitle)
  - /services/technical-seo-audit/     (pos 34.4, 4,057 impr; fixed-fee £500 anchor added)
  - /services/seo-consulting/          (pos 27.3, 1,165 impr)
  - /blog/ai-search-statistics/        (pos 8.8, 2,715 impr, 0.33% CTR; number-led title)
change: metaTitle + description rewrites in Keystatic index.yaml frontmatter. Specific proof point (180 to 620 visits) on Reading; fixed-fee anchors on audit; UK+independent positioning on consulting.
commit: b55cf1c
predicted_outcome: Reading page CTR on "seo consultant reading" from 0.35% to >=5% within 14 days (~14 clicks/28d vs 1); ai-search-statistics CTR from 0.33% to >=1.5%.
measured: pending
verdict: pending
learning: pending

---

iteration: 2
date: 2026-07-10
hypothesis: The 3 tool pages shipped Jun14-15 rank pos24-75 despite the Jun15 internal-link push (6a5ee23) because they are thin and topically unsupported, not because they lack link equity. A dedicated supporting post gives one tool (seo-prompts, weakest-linked of the 3 at 1 inbound link vs 3 each for the other two) topical depth plus a reciprocal internal link, without cannibalising existing AI-search posts.
playbook_tactic: supporting-post-for-orphaned-tool
affected_urls:
  - /blog/chatgpt-prompts-for-seo/  (new post, targets "chatgpt prompts for seo")
  - /tools/seo-prompts/             (fixed stale "22 prompts" claim to accurate 20; added reciprocal link to new post)
change: New Keystatic blog post (src/content/blog/chatgpt-prompts-for-seo/, 1,350 words, FAQPage + BlogPosting schema, 6 internal links out to services/tools/posts) walking through the tool's 8 prompt categories and chaining method. Added BLOG_TOPICS entry in schema.ts. Corrected /tools/seo-prompts/ metadata title/description (was overstating 22 prompts, actual count is 20) and added a contextual link back to the new post from the tool's "how to use" section.
commit: d663b08
predicted_outcome: seo-prompts climbs from thin/orphaned toward page-2 territory (pos <30) within 3-4 weeks as the new post gets indexed and passes topical + link support; new post itself earns incremental impressions on "chatgpt prompts for seo" / "ai prompts for seo" long-tail.
measured: pending
verdict: pending
learning: pending

---

iteration: 3
date: 2026-07-10
hypothesis: The generic "SEO checklist" lead magnet on every blog post mismatches the intent of the 2 top-traffic posts (google-open-knowledge-format 16 clicks/28d, ai-search-statistics 9 clicks/28d), whose readers are AI-search-curious. An intent-matched offer block (£495 AI-visibility audit + free Website Grader fallback) converts that traffic better than the checklist. This is active-hypotheses #4.
playbook_tactic: contextual-blog-offer
affected_urls:
  - /blog/google-open-knowledge-format/  (checklist magnet replaced by contextual offer)
  - /blog/ai-search-statistics/          (same)
change: New src/components/blog-contextual-offer.tsx (server component, two-card offer: /services/paid-seo-audit/ primary, /tools/website-grader/ free fallback), slug-mapped in blog/[slug]/page.tsx, all other posts keep BlogLeadMagnet. Added both CTA texts to the cta_click matcher in analytics-events.tsx.
commit: pending
predicted_outcome: cta_click events on the 2 posts (currently ~0 from lead magnet on these slugs) plus first paid-audit page referrals from blog within 28 days; watch GA4 cta_click event_label "Get the £495 Audit" / "Run Free Website Grader".
measured: pending
verdict: pending
learning: pending

---

iteration: 4
date: 2026-07-10
hypothesis: (Sunny-directed conversion sprint, 3 changes at once — page-level attribution only, not clean A/B.) A homepage that DOES something (domain-input grader hero) converts the 1,882 impr/mo homepage better than static CTAs; personalised /for/ pages lift Loom-outreach reply rates; a radical-transparency /proof/ page (live GSC data + public experiment log) converts trust-cold visitors.
playbook_tactic: conversion-sprint (hero-tool + outreach-landers + proof-page)
affected_urls:
  - /                       (hero: domain input -> /tools/website-grader/?url=X autorun; "Hero Grade My Site" cta_click event)
  - /tools/website-grader/  (accepts ?url= autorun param)
  - /for/[slug]/            (noindexed personalised outreach pages, src/data/prospects.json, robots-blocked, expire by date; /for/demo/ is the template)
  - /proof/                 (live GSC stats + rankings table + public iteration log; footer link + sitemap; refresh via scripts/update-proof-data.mjs)
change: hero.tsx form, WebsiteGrader runGrade refactor + ?url= autorun, new /for/[slug] route + prospects.json, new /proof/ page + proof.json + proof-iterations.json + update-proof-data.mjs (JWT via node:crypto, no deps, tested live against GSC API).
commit: pending
predicted_outcome: "Hero Grade My Site" cta_click > "Book Free Consultation" clicks within 28 days; grader completions up 3x; /proof/ appears in session paths of contact submissions. /for/ measured per-campaign in outreach tracker, not GSC.
measured: pending
verdict: pending
learning: pending
note: update-proof-data.mjs should run before each deploy so /proof/ stays fresh; wire into seo-monitor-loop or pre-deploy step.

---

iteration: 5
date: 2026-07-10
hypothesis: (Sunny-directed.) Original data + unique story earn links/citations the portfolio site cannot get from service pages; an AI-visibility self-serve tool converts the AI-curious audience better than generic tools.
playbook_tactic: original-data-study + story-post + flagship-tool
affected_urls:
  - /blog/google-ctr-study/          (original research: 53 sites, 2,615 queries, 383k impressions; contrarian CTR-by-position findings; data in src/data/ctr-study.json, regenerate via scripts/portfolio-ctr-study.mjs)
  - /blog/autonomous-seo-agent/      (first-person story of the evolve loop, links /proof/)
  - /tools/ai-visibility-checker/    (heuristic scanner: robots.txt AI bots, llms.txt, JSON-LD identity, Wikipedia/Wikidata entity, answerability; /api/ai-visibility; GA4 event ai_visibility_check)
change: 2 agent-written self-audited posts (88/100 and verified-against-dataset), new tool + API route, blog contextual offer free-option swapped from website-grader to the new checker (better intent match, swapped pre-deploy so iteration 3 measurement is unaffected), BLOG_TOPICS entries, /proof/ links the story post.
commit: pending
predicted_outcome: ctr-study earns first external links/AI citations within 60 days (watch referring domains + Copilot citations); ai_visibility_check events > 20/month; story post ranks for "autonomous seo agent" long-tail within 4 weeks.
measured: pending
verdict: pending
learning: pending
note: weekly monitor installed: /root/.hermes/scripts/sunnypatel-monitor.sh (cron Mon 08:12), refreshes proof.json, fills verdicts 7+ days old, writes docs/evolve/weekly-digest.md, telegram digest.

---

## Queued but not done this iteration
- ROI explainer post -> /tools/seo-roi-calculator/ (already has 3 inbound links from Jun15 push, lower priority than seo-prompts)
- how-to-add-schema post -> /tools/schema-generator/ (risk: may cannibalise existing /blog/seo-semantic-markup-guide/, needs a genuinely distinct angle before writing)
- best-seo-companies-uk refresh (12.5k impr, pos 68) — separate hypothesis #2 in active-hypotheses.md, not started

---

iteration: 7
date: 2026-07-13
hypothesis: best-seo-companies-uk (9,870 impr/28d, pos 66.7, 2 clicks) is dragged down by unwinnable head terms (seo agency pos 80, seo company pos 73) but its list-intent queries cluster at pos 32-45 (best seo companies list 32.4, seo company list 33.5, reputable seo companies 33.6, seo agency list 34.0) and independent uk seo agency sits at pos 12.6. Realigning the page to explicit list intent (numbered 1-15 entries, list-framed title/meta), expanding entity coverage from 11 to 15 verified agencies, and adding a section + FAQ for the striking-distance independent query moves the list-intent cluster toward page 2/1 without chasing head terms. This is active-hypotheses #2 (rescue, not retire).
playbook_tactic: listicle-intent-realignment + entity-expansion
affected_urls:
  - /blog/best-seo-companies-uk/
change: Title/meta rewritten to list intent (Best SEO Companies UK, List of 15 Top Agencies); fixed false "13+" meta claim (was 11 actual); all 15 entries numbered; 4 new verified agencies added (Screaming Frog, SALT.agency, NOVOS, Candour, each checked live 2026-07-13, no invented pricing, all "on application"); new "Independent SEO Agencies UK" section + FAQ targeting independent uk seo agency (pos 12.6, 18 impr); NOVOS added to London section; ItemList schema numberOfItems 11 to 15; lastUpdated 2026-07-13; all em dashes stripped per site rule. Semantic audit 92/100.
commit: 70c7998
predicted_outcome: list-intent query cluster (best seo companies list, seo company list, seo agency list, reputable seo companies, ~230 impr/28d combined at pos 32-45) moves to pos <=25 within 4 weeks of recrawl; independent uk seo agency from 12.6 into top 10; page CTR rises from 0.02% as list queries replace head-term impressions. Head terms (seo agency, seo company) expected to stay pos 60+, not the target.
measured: pending
verdict: pending
learning: pending

---

iteration: 8
date: 2026-07-14
hypothesis: /tools/schema-generator/ earns 1,392 impr/28d at pos 21.2 with zero content depth (H1 + one intro paragraph + the form). Its query clusters are core (schema markup generator 243 impr pos 18.2, free schema generator 32 pos 21.6), JSON-LD (json-ld/json ld/json schema generator variants ~180 impr pos 12-19), and type-specific (faq/article/product/job schema generator, pos 21-46). Server-rendered on-page depth keyed to those exact clusters plus SoftwareApplication + FAQPage JSON-LD (the roi-calculator pattern from iteration 6) moves the core cluster from page 2 to page 1. This is the "on-page depth on impression-earning queries" step of the tools plan; London upgrade (active-hypotheses #3) was checked and skipped: live GSC shows only 58 impr/28d, the 1,605 figure was stale.
playbook_tactic: tool-page-content-depth
affected_urls:
  - /tools/schema-generator/
change: page.tsx rebuilt on the seo-roi-calculator pattern: SoftwareApplication + FAQPage JSON-LD; new sections "What is a JSON-LD schema generator?" (JSON-LD cluster), "Schema types this generator supports" (6 h3 cards matching faq/article/local business/product/breadcrumb/howto generator queries, honest about Google's 2023 FAQ rich result restriction and HowTo retirement), "How to use the generated code" (3 steps, links how-to-add-schema-markup post), FAQ (6 Q&As mirroring query language, boolean answers first). Meta description rewritten to name all 6 types. 1 internal link per section max (semantic-markup-guide, how-to-add-schema-markup, paid-seo-audit CTA). Fixed false "28 options" claim to actual 29 business types. Micro-semantic audit 93/100. Bonus hygiene: em dash removed from seo-consultant-london subtitle.
commit: 6fab853
predicted_outcome: core cluster (schema markup generator + free schema generator, ~275 impr/28d at pos 18-22) reaches pos <=12 within 4 weeks of recrawl; JSON-LD cluster consolidates pos <=12; page earns first sustained clicks (>=5/28d vs current 2). Type-specific long-tail (product/article/faq schema generator) improves as h3 sections index.
measured: pending
verdict: pending
learning: pending
note: active-hypotheses #3 (London upgrade) demoted, page has 58 impr/28d live vs 1,605 stale. Deploy needs Sunny's npx vercel --prod.

---

iteration: 9
date: 2026-07-15
hypothesis: /services/technical-seo-audit/ (3,873 impr/28d, 0 clicks, pos 34.1) earns nearly all visible impressions on "seo audit services" language (seo audit services uk 128 impr pos 45.4, seo audit services technical seo 52 pos 29.5, seo audit service uk 33 pos 48.9, seo audit services 10 pos 45.3, seo audit price uk 5 pos 24.2) while its title/H1 target "technical seo audit", a head term it barely surfaces for. Realigning title/H1/meta and section order to the services cluster (the query language Google already matches the page to) lifts the cluster from pos 29-49 toward page 2/1. This is active-hypotheses #6; the serp-analyze step was blocked (DDG + Bing both serve bot challenges from this VPS), so diagnosis used GSC query language directly. Live GSC also killed the alternative targets: /tools/seo-prompts/ has only ~50 impr/28d and /tools/seo-roi-calculator/ returned zero rows, so tool on-page depth beyond iteration 8 is not worth an iteration.
playbook_tactic: query-language-realignment (title/H1/meta + section reorder to match earned impression cluster)
affected_urls:
  - /services/technical-seo-audit/
change: metaTitle to "SEO Audit Services UK | Fixed-Fee Technical SEO Audit £500", H1 to "SEO Audit Services UK: Technical SEO Audit From £500", new subtitle (independent consultant, 50+ verified checks, one-off fee). content.mdoc reordered: "What Are SEO Audit Services?" moved from bottom to section 2, "How Much Does an SEO Audit Cost?" retitled "How Much Do SEO Audit Services Cost in the UK?" (seo audit price uk pos 24.2), new "How to Choose an SEO Audit Service in the UK" section (4 buyer questions) with funnel cross-link to the fixed-fee GBP495 /services/paid-seo-audit/ (fee-credit framing). SERVICE_FAQS["technical-seo-audit"] gained "What are SEO audit services?" + "How do I choose an SEO audit service in the UK?" Q&As. All em/en dashes stripped from page content and its FAQ block per site rule; internal links trimmed to 1 per main section. Semantic audit 92/100. Build passes.
commit: pending
predicted_outcome: services cluster (seo audit services uk + variants, ~230 impr/28d visible at pos 29-49) moves to pos <=25 within 4 weeks of recrawl; seo audit price uk from 24.2 into top 20; page earns first clicks (>=3/28d vs current 0). Head terms (technical seo audit) not the target. Funnel effect: first referred sessions from this page to /services/paid-seo-audit/.
measured: pending
verdict: pending
learning: pending
note: iteration 1 (Jul 7) rewrote this page's title/meta for CTR, but at pos 34 CTR was never the constraint; this supersedes it for this URL, note when filling iteration 1 verdict. Deploy needs Sunny's npx vercel --prod.
