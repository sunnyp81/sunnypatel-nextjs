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
