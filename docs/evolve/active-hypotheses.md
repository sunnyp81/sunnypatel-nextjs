# Active hypotheses queue — sunnypatel.co.uk

Ordered by expected value. One per iteration.

1. ~~Homepage services section links money pages directly~~ verified already shipped in 981b004 (services.tsx links 7 money pages + 4 local pills as of 2026-07-10).
2. ~~best-seo-companies-uk rescue or retire~~ shipped iteration 7 (2026-07-13): list-intent realignment + 15-agency expansion, see iteration-log.md.
3. **/services/seo-consultant-london/ content upgrade** — DEMOTED 2026-07-14: live GSC shows only 58 impr/28d pos 32 (1,605 figure was stale). Not worth an iteration until impressions return.
4. ~~Blog-to-lead contextual offers~~ shipped iteration 3 (see iteration-log.md, 2026-07-10).
5. **Local pack / GBP presence** — "seo consultant reading" CTR at pos 2 is 0.35%, suggesting local pack + competitors absorb clicks. GBP profile + reviews (Sunny manual) likely worth more than any on-page change.
6. ~~technical-seo-audit content vs SERP intent~~ shipped iteration 9 (2026-07-15): query-language realignment to the "seo audit services uk" cluster, see iteration-log.md. (serp-analyze blocked by bot challenges from this VPS; GSC query language used instead.)
7. ~~Supporting post for seo-prompts tool (de-orphan + de-thin)~~ shipped iteration 2 (see iteration-log.md). ~~ROI explainer -> seo-roi-calculator, how-to-add-schema -> schema-generator~~ both shipped iteration 6 (a07800a); this list was stale, both posts are live and linked.
8. ~~De-orphan seo-for-plumbers, seo-for-roofers, white-label-seo (0-2 impr/28d, zero contextual inbound links)~~ shipped iteration 10 (2026-07-16): contextual links added from local-seo, local-seo-agency, amazon-seo-consultant, seo-consultant-brighton, best-local-seo-agencies. See iteration-log.md.
9. ~~top-geo-agencies and best-local-seo-agencies on-page/link support~~ DEMOTED 2026-07-18: fresh GSC pull shows both already climbing on their own (top-geo-agencies 735 impr/28d pos 19.3, best-local-seo-agencies 514 impr/28d pos 42.8, up from 37 impr each at iteration 10) — no intervention needed yet, re-check at the next site-level GSC pull.
10. ~~/tools/seo-roi-calculator/ never indexed~~ shipped iteration 11 (2026-07-18): coverageState was "URL is unknown to Google" despite 34 days live, 7 inbound links, clean sitemap/canonical/robots. Submitted via Google Indexing API + IndexNow. See iteration-log.md. Verdict check at day 14: did coverageState change?
11. **best-seo-companies-uk still stuck at 2 clicks despite iteration 7's list-intent realignment** — 9,672 impr/28d pos 63.7 (improved from pos 68 but clicks unchanged). Worth investigating once iteration 7's 4-week verdict window closes (due ~2026-08-10).

## Sunny manual queue (not loop-executable)

- ~~Mark GA4 generate_lead as key event~~ verified already marked (2026-07-07). Note: GA4 keyEvents attribute to session LANDING page, so /contact/ conversions show under "/".
- GBP / Bark / Yell profiles + uncomment sameAs lines in src/lib/schema.ts. Step-by-step: docs/gbp-setup-checklist.md (written 2026-07-10, ~45 min).
- Loom teardown cold-outreach campaign: outreach/loom-teardown-campaign.md (script + sequence ready, needs Sunny to source prospects + record).
- Clutch reviews (0 live).
- ~~Decide fate of uncommitted WIP~~ shipped 2026-07-07 (981b004) with 301 ai-visibility-audit -> paid-seo-audit.
