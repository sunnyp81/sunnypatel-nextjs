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
measured: (2026-07-20, GSC direct API, before=2026-06-09/07-06, after=2026-07-07/07-17, ~11d) "seo consultant reading" on /services/seo-consultant-reading/: CTR 0.36% to 0% (1/277 impr before, 0/70 after), position flat ~1.95 to 1.93. ai-search-statistics: CTR 0.34% to 0.42% (9/2639 before, 3/712 after) but position slipped 8.8 to 10.6. seo-berkshire and seo-consulting stayed at 0-1 clicks. technical-seo-audit's title/H1 was rewritten again by iteration 9 (2026-07-15), inside this measurement window, so its CTR effect from iteration 1 can't be isolated there.
verdict: refuted
learning: CTR copy alone didn't move clicks at pos ~2 on a near-zero-CTR local query (Reading actually went to 0 clicks in the after window); the click is most likely being absorbed by the local pack / competing local-intent results above the blue link, which reinforces GBP + reviews (active-hypotheses #5) as the higher-leverage lever over further on-page CTR tweaks for Reading. For ai-search-statistics, position dropped alongside the small CTR gain, so don't credit the title rewrite without first ruling out a ranking-driven mix-shift. Samples are thin (70 and 712 impressions) so treat this as directional, not definitive.

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
measured: (2026-07-20, GSC direct API, before=2026-06-12/07-09 28d, after=2026-07-10/07-17 8d) /tools/seo-prompts/ position moved 18.7 to 30.6 while impressions/day rose sharply (~1.1/day to ~21.6/day, 32 to 173 impr) — the page is now surfacing for a wider, noisier query set rather than climbing on its core terms. New post /blog/chatgpt-prompts-for-seo/ is indexed and already earning impressions (12 impr, pos 14, 1 click in its first 8 days).
verdict: inconclusive
learning: only 10 of the predicted 21-28 days have elapsed; the seo-prompts position move is a mixed signal (more visibility, worse average rank), not a clean confirm or refute. Re-check next week — if avg position keeps drifting worse as impressions grow, that's normal early-indexing noise from the new post's broad long-tail pull, but worth a second look before calling the tactic a win.

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
measured: (2026-07-20, GA4 property 409078193) cta_click event count = 0 site-wide for both the last 7 days (Jul13-19) and the full 10 days since ship (Jul10-19), despite ~107 page_view events in the last 7 days alone and confirmed-working event tracking (generate_lead fired 2x, event tracking pipeline is not broken).
verdict: inconclusive
learning: 10 of 28 predicted days elapsed; flat zero across every CTA on the site (not just these 2 posts) is a real early warning but the window isn't closed. Top priority before next verdict pass: manually click through /blog/google-open-knowledge-format/ and /blog/ai-search-statistics/ in production to confirm the contextual offer block actually renders and its click handler fires — this same zero-click pattern also shows up in iterations 4 and 5, which points more toward a possible shared rendering/instrumentation issue than 3 independently failed hypotheses.

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
measured: (2026-07-20, GA4 property 409078193) cta_click event count = 0 for both "Hero Grade My Site" and "Book Free Consultation" (0 total cta_click events site-wide) over the last 7 days and the full 10 days since ship. /proof/ confirmed live and returning 200 in production. /for/ not checked here (outreach tracker, not GA4/GSC).
verdict: inconclusive
learning: same zero-click pattern as iterations 3 and 5 — 10 of 28 predicted days elapsed, too early to call, but worth ruling out a bug before trusting the trend. Recommend a manual test drive of the homepage grader flow (enter a domain, confirm it navigates to /tools/website-grader/?url=... and autoruns) this week; if it works cleanly and clicks are still zero next pass, that's a real signal the hero concept isn't landing.
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
measured: (2026-07-20) ai_visibility_check event count = 0 in both the 7-day and 10-day-since-ship GA4 windows (target run-rate would need to be already trending toward 20/month). /blog/autonomous-seo-agent/ barely indexed yet (1 impression, pos 25, 0 clicks in 8 days). /blog/google-ctr-study/ has modest early impressions (60 impr, pos 12.3, 0 clicks) with 0 referring-domain data collected this pass.
verdict: inconclusive
learning: ai_visibility_check is the third tool sharing the site-wide zero-cta_click/zero-tool-completion pattern with iterations 3 and 4 (see iteration 4's learning) — same recommendation applies, verify the checker actually completes and fires its event before trusting the trend. The link-earning (60d) and story-post-ranking (4wk) predictions haven't reached their measurement windows yet; re-check both at the next verdict pass in ~3 weeks.
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
measured: (2026-07-20, GSC direct API, before=2026-06-15/07-12 28d page-level, after=2026-07-13/07-17 5d post-ship) Page-level position improved 65.4 to 58.7 but is still deep in the tail. Of the 5 target queries, only "best seo companies list" appears in the top-20-by-impressions for the post-ship window: pos 25.5 (2 impressions) — already near the <=25 target, but n is too small to trust. "seo company list", "seo agency list", "reputable seo companies", and "independent uk seo agency" don't surface in the top 20 for this short window, so no reading on them yet.
verdict: inconclusive
learning: only 7 of the predicted 28 days elapsed. Re-check in ~3 weeks once the full recrawl window has passed; if the list-intent cluster still isn't surfacing meaningfully by then, that's evidence even list-intent realignment can't overcome this page's severe head-term drag (pos 58+ overall).

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
measured: (2026-08-17, GSC direct API, before=2026-06-16/07-13 28d, after=2026-07-14/08-14 32d) Page-level: clicks 2 to 8, impressions 1,300 to 733, position 21.1 to 15.55. "schema markup generator" pos 17.85 to 11.98 (hits the <=12 target). "free schema markup generator" 18.8 to 14.6 (improved, not at target). "free schema generator" 22.0 to 23.3 (flat). "json-ld schema generator" 19.5 to 24.25 (worse). JSON-LD cluster overall did not consolidate cleanly, mixed by variant.
verdict: confirmed
learning: on-page depth clearly moved the page's average position (21 to 15.5) and roughly 4x'd its click rate, and the single highest-volume core query hit the <=12 target, so the core hypothesis (content depth beats a bare form for impression-earning tool pages) holds. But the JSON-LD long-tail didn't consolidate as predicted, some variants got worse, and total impressions fell 44% (page is now ranking for a narrower, more relevant query set rather than a wide noisy one) — a good tradeoff for CTR/position but worth noting when predicting impression volume from future page-depth iterations.
note: active-hypotheses #3 (London upgrade) demoted, page has 58 impr/28d live vs 1,605 stale. Deploy needs Sunny's npx vercel --prod.

---

iteration: 9
date: 2026-07-15
hypothesis: /services/technical-seo-audit/ (3,873 impr/28d, 0 clicks, pos 34.1) earns nearly all visible impressions on "seo audit services" language (seo audit services uk 128 impr pos 45.4, seo audit services technical seo 52 pos 29.5, seo audit service uk 33 pos 48.9, seo audit services 10 pos 45.3, seo audit price uk 5 pos 24.2) while its title/H1 target "technical seo audit", a head term it barely surfaces for. Realigning title/H1/meta and section order to the services cluster (the query language Google already matches the page to) lifts the cluster from pos 29-49 toward page 2/1. This is active-hypotheses #6; the serp-analyze step was blocked (DDG + Bing both serve bot challenges from this VPS), so diagnosis used GSC query language directly. Live GSC also killed the alternative targets: /tools/seo-prompts/ has only ~50 impr/28d and /tools/seo-roi-calculator/ returned zero rows, so tool on-page depth beyond iteration 8 is not worth an iteration.
playbook_tactic: query-language-realignment (title/H1/meta + section reorder to match earned impression cluster)
affected_urls:
  - /services/technical-seo-audit/
change: metaTitle to "SEO Audit Services UK | Fixed-Fee Technical SEO Audit £500", H1 to "SEO Audit Services UK: Technical SEO Audit From £500", new subtitle (independent consultant, 50+ verified checks, one-off fee). content.mdoc reordered: "What Are SEO Audit Services?" moved from bottom to section 2, "How Much Does an SEO Audit Cost?" retitled "How Much Do SEO Audit Services Cost in the UK?" (seo audit price uk pos 24.2), new "How to Choose an SEO Audit Service in the UK" section (4 buyer questions) with funnel cross-link to the fixed-fee GBP495 /services/paid-seo-audit/ (fee-credit framing). SERVICE_FAQS["technical-seo-audit"] gained "What are SEO audit services?" + "How do I choose an SEO audit service in the UK?" Q&As. All em/en dashes stripped from page content and its FAQ block per site rule; internal links trimmed to 1 per main section. Semantic audit 92/100. Build passes.
commit: 77bc757
predicted_outcome: services cluster (seo audit services uk + variants, ~230 impr/28d visible at pos 29-49) moves to pos <=25 within 4 weeks of recrawl; seo audit price uk from 24.2 into top 20; page earns first clicks (>=3/28d vs current 0). Head terms (technical seo audit) not the target. Funnel effect: first referred sessions from this page to /services/paid-seo-audit/.
measured: (2026-08-17, GSC direct API, before=2026-06-17/07-14 28d, after=2026-07-15/08-14 31d) Page-level: clicks 0 to 2, impressions 3,746 to 3,649 (flat), position 33.9 to 25.4 (hits the <=25 target). "seo audit consultant" is now the page's top query at 231 impr/pos 16.1 in the last 25 days, a query not named in the original hypothesis.
verdict: inconclusive
learning: directionally this looks like a win (position cleared the target, first clicks appeared), but the OOB-2026-07-19 consolidation ship rewrote this same page's title/H1 again just 4 days into this iteration's measurement window (see active-hypotheses binding constraint #6), so iteration 9's isolated effect can't be separated from that later change. Treat the position gain as attributable to the combined query-language-realignment + productisation work, not iteration 9 alone.
note: iteration 1 (Jul 7) rewrote this page's title/meta for CTR, but at pos 34 CTR was never the constraint; this supersedes it for this URL, note when filling iteration 1 verdict. Deploy needs Sunny's npx vercel --prod.

---

iteration: 10
date: 2026-07-16
hypothesis: Of the 7 Jun14-15 gap pages, the 3 tools were de-orphaned in iterations 2/6/8 and best-seo-companies-uk was refreshed in iteration 7, but seo-for-plumbers, seo-for-roofers, and white-label-seo (3 service pages from the same batch) were never touched and have zero real contextual inbound links (only the generic /services/ index card). Live GSC confirms this is the worst-performing surface left: seo-for-plumbers and white-label-seo have 0 impressions/28d, seo-for-roofers has 2, versus top-geo-agencies (37 impr, several queries at pos 5-13) and best-local-seo-agencies (37 impr, pos 20-60) which are weak but not dead. Contextual internal links from topically relevant, already-indexed pages (the tactic that worked for the tools in iteration 2) is the cheapest fix.
playbook_tactic: contextual-link-injection
affected_urls:
  - /services/seo-for-plumbers/   (0 impr/28d, was zero contextual inbound links)
  - /services/seo-for-roofers/    (2 impr/28d, was zero contextual inbound links)
  - /services/white-label-seo/    (0 impr/28d, was zero contextual inbound links)
change: Added contextual links (no new pages) from 5 already-indexed pages. /services/local-seo/ and /services/local-seo-agency/ each gained a new paragraph linking seo-for-plumbers and seo-for-roofers as trade-specific examples of local content strategy. /services/amazon-seo-consultant/ and /services/seo-consultant-brighton/ each had an existing unlinked "white-label" mention turned into a link to /services/white-label-seo/. /blog/best-local-seo-agencies/ (agency-owner audience) gained a White Label SEO entry in its Related Articles list as a resell cross-sell. Build verified clean.
commit: pending
predicted_outcome: seo-for-plumbers, seo-for-roofers, and white-label-seo move from 0-2 impr/28d toward first sustained visibility (5+ impr/28d) within 3-4 weeks as link equity and topical relevance signals reach them from local-seo/local-seo-agency (established, indexed pages) and the agency-audience listicle.
measured: (2026-08-17, GSC direct API, before=2026-06-18/07-15 28d, after=2026-07-16/08-14 30d) seo-for-plumbers: 0 to 146 impr, pos 35.4 (from unranked). seo-for-roofers: 10 to 140 impr, pos 29.4 to 31.4 (flat). white-label-seo: 7 to 8 impr (flat), pos 26.4 to 22.9, first-ever click (0 to 1).
verdict: confirmed
learning: plumbers and roofers both cleared the 5+ impr/28d target by a wide margin (146 and 140 impr over the after window, well above the ~28d-equivalent bar), confirming contextual link injection from established pages is a reliable de-orphaning tactic, consistent with iteration 2's tool-page result. white-label-seo barely moved (7 to 8 impr) despite getting the same treatment — its 2 inbound links were single-mention conversions inside existing paragraphs rather than new dedicated sections, which may be a weaker signal; worth a dedicated paragraph (not just an anchor swap) if it's still flat next pass.

---

iteration: 11
date: 2026-07-21
hypothesis: top-geo-agencies and best-local-seo-agencies (37 impr/28d each, top-geo-agencies with several queries at pos 5-13) are the last two of the 7 Jun14-15 gap pages with zero contextual inbound links (only the generic tag-based RelatedPosts component). The same contextual-link-injection tactic that worked for the 3 tools (iteration 2) and the 3 service pages (iteration 10) is the cheapest fix here too: pull link equity and topical relevance from already-indexed, topically adjacent pages rather than writing new content.
playbook_tactic: contextual-link-injection
affected_urls:
  - /blog/top-geo-agencies/          (0 contextual inbound links before this change)
  - /blog/best-local-seo-agencies/   (0 contextual inbound links before this change)
change: Added contextual links (no new pages) from 4 already-indexed pages. /blog/best-aeo-agencies/ Related Articles gained a reciprocal link to top-geo-agencies (top-geo-agencies already linked best-aeo-agencies one-way). /blog/best-seo-companies-uk/ Related Articles (the general hub, already linking best-aeo-agencies) gained links to both top-geo-agencies and best-local-seo-agencies. /services/local-seo-agency/ and /services/local-seo/ Related Guides each gained a link to best-local-seo-agencies. All new list entries use commas/colons/hyphens per site rule, not em dashes, even where surrounding legacy entries in the same file already violate it (best-aeo-agencies has 44 pre-existing em dashes, local-seo has 4; left untouched, out of scope for this iteration). Build verified clean, no errors or warnings.
commit: pending
predicted_outcome: top-geo-agencies and best-local-seo-agencies move from 37 impr/28d each toward first sustained link-equity gains (higher impressions on their existing pos 5-13 / pos 20-60 queries) within 3-4 weeks as the new inbound links get crawled. Not a content-depth change, so no shift expected in query coverage, only position/impression lift on already-earned queries.
measured: (2026-08-24, GSC direct API, before=2026-06-23/07-20 28d, after=2026-07-21/08-21 32d) top-geo-agencies: 1,181 to 4,054 impr (3.4x), 2 to 5 clicks, position 19.7 to 20.4 (flat). best-local-seo-agencies: 1,098 to 5,784 impr (5.3x), 2 to 2 clicks (flat), position 43.5 to 42.4 (flat). Query mix on both pages after-ship is now dominated by broad long-tail variants (e.g. "affordable local seo agencies/services/uk", "geo agency uk") rather than a clean climb on the specific pos 5-13/20-60 queries named in the hypothesis.
verdict: inconclusive
learning: impressions and clicks moved the right direction (up), matching the "higher impressions" half of the prediction, but position did not lift on either page as predicted, and the query mix broadened into noisy long-tail rather than concentrating on already-earned queries, the same pattern seen in iteration 2. This iteration's 32-day window also overlaps the 2026-08-02 demand-map ship, which touched one of the two inbound-link source pages (best-aeo-agencies) and shipped sitewide impression growth, so the impression rise here cannot be cleanly attributed to the contextual-link-injection tactic alone. Confounded, not a clean read.
note: Deploy needs Sunny's manual npx vercel --prod. This closes out the 7 Jun14-15 gap pages: all now have contextual internal link support (tools: iteration 2/6/8, service pages: iteration 10, listicles: iteration 11).

---

iteration: OUT-OF-BAND (manual, not a loop iteration)
date: 2026-07-19
source: Sunny + Claude session (Fable strategy call), "Ship all"
hypothesis: Site had 103k impr / 35 clicks / 0.03% CTR over 90d, stranded pos ~30 for commercial local terms because authority was diluted across 200+ pages with 3+ URLs cannibalising every Reading/Berkshire query. Consolidation + local focus > incremental per-page iteration.
change: (1) Homepage retargeted to "SEO Consultant Reading". (2) 301 /services/seo-consultant-reading/ -> / (deleted). (3) 17 national location pages pruned: 301 -> / + content deleted. (4) /services/seo-berkshire/ reworked as single Berkshire+Wokingham hub. (5) technical-seo-audit productised at fixed £495 (kept iteration-9 "SEO Audit Services UK" cluster targeting). (6) CTR titles on surviving local pages. (7) Site-wide pricing reconciled: 25 technical-audit £500 refs -> £495 (other products left). (8) Hardened /api/contact (honeypot, email regex, rate limit, optional Turnstile) + gated GA to NODE_ENV=production. See binding constraints in active-hypotheses.md.
commits: 3545b82 (merge/consolidation, includes evolve iterations 7-10 which were committed but never deployed), 67b97f5 (endpoint + GA), plus this session's pricing/coordination commit.
predicted_outcome: local cluster (seo berkshire pos 14, seo company/services reading pos 17) moves toward top 5 as cannibalisation clears and equity pools on homepage + seo-berkshire. Real lead lift depends on off-site (GBP + reviews + barnacle listicles) per Fable — that is the lead channel at these positions, not organic blue links.
measured: (2026-08-24, GSC direct API, before=2026-06-21/07-18 28d, after=2026-07-19/08-21 34d, exact-match queries) "seo berkshire" pos 9.2 to 10.9 (1,171 to 764 impr). "seo company reading" pos 11.7 to 14.8 (743 to 685 impr). "seo services reading" pos 12.2 to 14.0 (501 to 562 impr). All three named queries got worse, none moved toward top 5. /services/seo-berkshire/ page-level: 0 to 1 click, 4,348 to 6,040 impr, pos 21.4 to 19.3. /services/seo-consultant-reading/: 3 to 1 click, 6,531 to 6,311 impr, pos 21.3 to 23.9 (worse). Homepage: 6 to 24 clicks, but 2,008 to 1,265 impr and pos 13.7 to 44.3 (collapsed, consistent with the same-day reversal off Reading-targeting back to broad "SEO Consultant UK" per binding constraint #2 — now competing on much harder national terms). Site-wide: 58 to 81 clicks, 40,593 to 56,105 impr, pos 32.8 to 29.4 (improved).
verdict: refuted
learning: the core hypothesis, that consolidating equity onto homepage + seo-berkshire would lift the named local-cluster queries toward top 5, did not happen; all three specifically-named queries (seo berkshire, seo company reading, seo services reading) got measurably worse over a full 34-day window, well past the 4-week check point. Homepage clicks did rise, but that's more likely the CTR-title effect from the "150-280% Growth" homepage copy than a position lift. The site-wide click/impression/position improvement over this window is real but almost certainly attributable to the 2026-08-02 demand-map ship (new GEO pages, 9-page CTR realignment, sitewide impression tripling documented in that entry) landing inside this measurement window, not to the consolidation itself. Confirms active-hypotheses #5: local-pack/GBP presence, not on-page consolidation, is the binding constraint on the Reading/Berkshire cluster.
note: DEPLOYED to prod (verified live: homepage title, 308 redirects, £495, kept pages 200). Unlike normal iterations this one was deployed immediately, not left for manual npx vercel --prod.

---

iteration: OUT-OF-BAND (manual, not a loop iteration)
date: 2026-08-02
source: Sunny + Claude session (demand-map widen-the-net, "do all of it")
hypothesis: GSC demand tripled Apr-Jul (39k -> 142k impr/quarter) but CTR stayed ~0.03%. Demand-map clustering showed the constraint is (a) unshipped GEO/AEO surface for a 6.1k-impr emerging cluster, (b) title/query misalignment on pages OUTSIDE the Jul-19 consolidation window, (c) zero lead capture on tool pages earning the site's only clicks.
change: (1) SHIPPED the 3 WIP AI-visibility pages (/geo-agency/, /ai-visibility-consultant/, /is-your-brand-visible-in-ai-search/) + sitemap entries (also added missing /ai-visibility/ sitemap entry) + contextual inbound links from what-is-llm-optimisation, ai-search-optimisation, brand-not-appearing-in-chatgpt, best-aeo-agencies; added AEO-vs-GEO FAQ to geo-agency. (2) CTR/query realignment on 9 NON-window pages: seo-consulting (retarget "seo strategy consultant", 3.3k impr cluster), how-much-does-an-seo-consultant-charge-uk (broken truncated metaTitle fixed), woocommerce-seo-consultant (expert-first), best-aeo-agencies (+"aeo agency uk"; +thought-leaders section + FAQ for 664-impr "aeo thought leaders/experts" queries), what-is-llm-optimisation, freelance-seo-consultant-uk, website-grader (+"seo page grader"), website-design/packages + keyword-scraper (em-dash/mojibake fixes only). (3) ServiceInlineForm lead capture added to keyword-scraper + schema-generator. (4) NEW /blog/ai-referral-traffic-study/: original 90d GA4 dataset (5,240 AI sessions, 12 sites, pulled 2 Aug), semantic audit 88/100. (5) Stale "Q2 2026 client slots" scarcity claim removed from ai-search-optimisation.
constraints_respected: homepage, seo-consultant-reading, seo-berkshire ring, technical-seo-audit titles UNTOUCHED (Jul-19 consolidation measurement window, verdict due ~Aug 16). Pruned national pages not recreated. £495 audit price unchanged. it7/it11 measured targets (best-seo-companies-uk, top-geo-agencies, best-local-seo-agencies) untouched except a planned inbound link from best-aeo-agencies content per it11's own pattern.
predicted_outcome: geo-aeo-ai cluster (6.1k impr/quarter, pos 14-53) gains a commercial landing surface and moves toward page 1-2 within 4-6 weeks; "seo strategy consulting/consultant" cluster (3.3k impr, pos 21-31) lifts on realigned title; first tool-page leads from the 2 new inline forms; data-study post earns AI citations (its own thesis).
measured: (2026-08-24, GSC direct API, 22 days since ship, before window 2026-07-05/08-01, after 2026-08-02/08-21, partial: only 20-22 of the predicted 28-42 days elapsed) The 3 new commercial landing pages (/geo-agency/, /ai-visibility-consultant/, /is-your-brand-visible-in-ai-search/) have ZERO GSC impressions in 20 days despite being live (200 OK, confirmed via curl) and present in sitemap.xml — no indexing/ranking signal at all yet, checked via both exact-match and "contains" page filters. Supporting cluster pages mixed: what-is-llm-optimisation improved (904 to 1,023 impr, pos 19.4 to 17.5), best-aeo-agencies worsened (1,765 to 1,536 impr, pos 34.1 to 39.6). "seo strategy consulting" (dominant query) pos 11.9 to 12.7 (impr 436 to 305, but after window is 8 days shorter); "seo strategy consultant" pos 23.8 to 24.75. /services/seo-consulting/ page-level improved: pos 24.9 to 20.75, first click (0 to 1). GA4: cta_click totals 2 site-wide since 2026-07-10 (both on "Hero Grade My Site", Aug 6 and Aug 13), ai_visibility_check still just 1 total — too low to read tool-page-lead impact.
verdict: inconclusive
learning: window not closed (need to 2026-09-01+ for the 4-6wk claim), and signals are mixed rather than trending clearly either way: the realigned service page and one supporting post improved, best-aeo-agencies and the strategy-consultant query got worse, and the "seo strategy consulting" apparent position dip may just be a shorter after-window artifact, not a real decline. The one genuinely concerning signal, not just "too early", is the 3 new flagship pages showing literally zero search impressions after 20 days live and sitemapped, that's below normal indexing lag and worth checking directly (fetch as Google / URL Inspection, the GSC service account here only has readonly search-analytics scope, no inspection API) before the next pass.
note: DEPLOYED to prod this session via npx vercel --prod.
