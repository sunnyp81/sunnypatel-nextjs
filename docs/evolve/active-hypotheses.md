# Active hypotheses queue — sunnypatel.co.uk

Ordered by expected value. One per iteration.

## Binding constraints (2026-07-19 consolidation ship — do NOT violate)

A manual Reading/Berkshire consolidation shipped to prod on 2026-07-19 (commits 3545b82 + 67b97f5). Every iteration MUST respect these or it will undo shipped work:

1. **Pricing is a fixed £495 for the technical/paid SEO audit.** Never reintroduce £500 or a tiered £500/£800/£1,200 model for the audit. Iteration 9 set £500; that has been superseded site-wide to £495 for consistency with /services/paid-seo-audit/. (Other products keep their own prices: internal linking £500, quarterly review £500, implementation projects — those are not the audit.)
2. **The homepage owns "SEO Consultant Reading"** (title "SEO Consultant Reading | Direct Expert, No Juniors", H1 "SEO Consultant in Reading"). Do not retarget the homepage to a national head term.
3. **17 national location pages are pruned + 301'd to / and their content deleted:** seo-consultant-london, manchester, kent, oxford, surrey, southampton, nottingham, preston, sheffield, bradford, york, birmingham, cardiff, glasgow, brighton, harrogate, essex. Do NOT recreate or "upgrade" them (kills hypothesis #3 below). The Berkshire ring (seo-berkshire, seo-wokingham, seo-slough, seo-maidenhead, seo-bracknell, seo-windsor) + vertical service pages are the kept surface.
4. **/services/seo-consultant-reading/ is 301'd to / (deleted).** Its equity consolidates to the homepage. Do not link to it; link to / or /services/seo-berkshire/.
5. **/services/seo-berkshire/ is the single Berkshire hub** absorbing Berkshire + Wokingham query variants.
6. **technical-seo-audit** keeps BOTH the £495 productisation block AND the "SEO Audit Services UK" query-cluster targeting from iteration 9. Both are intentional; do not delete either.

1. ~~Homepage services section links money pages directly~~ verified already shipped in 981b004 (services.tsx links 7 money pages + 4 local pills as of 2026-07-10).
2. ~~best-seo-companies-uk rescue or retire~~ shipped iteration 7 (2026-07-13): list-intent realignment + 15-agency expansion, see iteration-log.md.
3. ~~/services/seo-consultant-london/ content upgrade~~ DEAD 2026-07-19: page pruned + 301'd to / in the consolidation ship (see binding constraint #3). Do not resurrect.
4. ~~Blog-to-lead contextual offers~~ shipped iteration 3 (see iteration-log.md, 2026-07-10).
5. **Local pack / GBP presence** — "seo consultant reading" CTR at pos 2 is 0.35%, suggesting local pack + competitors absorb clicks. GBP profile + reviews (Sunny manual) likely worth more than any on-page change.
6. ~~technical-seo-audit content vs SERP intent~~ shipped iteration 9 (2026-07-15): query-language realignment to the "seo audit services uk" cluster, see iteration-log.md. (serp-analyze blocked by bot challenges from this VPS; GSC query language used instead.)
7. ~~Supporting post for seo-prompts tool (de-orphan + de-thin)~~ shipped iteration 2 (see iteration-log.md). ~~ROI explainer -> seo-roi-calculator, how-to-add-schema -> schema-generator~~ both shipped iteration 6 (a07800a); this list was stale, both posts are live and linked.
8. ~~De-orphan seo-for-plumbers, seo-for-roofers, white-label-seo (0-2 impr/28d, zero contextual inbound links)~~ shipped iteration 10 (2026-07-16): contextual links added from local-seo, local-seo-agency, amazon-seo-consultant, seo-consultant-brighton, best-local-seo-agencies. See iteration-log.md.
9. **top-geo-agencies and best-local-seo-agencies on-page/link support** — both still weak (37 impr/28d each) but not dead; top-geo-agencies has several queries at pos 5-13. Lower priority than item 8 was; worth an iteration once item 10's verdict lands.

## Sunny manual queue (not loop-executable)

- ~~Mark GA4 generate_lead as key event~~ verified already marked (2026-07-07). Note: GA4 keyEvents attribute to session LANDING page, so /contact/ conversions show under "/".
- GBP / Bark / Yell profiles + uncomment sameAs lines in src/lib/schema.ts. Step-by-step: docs/gbp-setup-checklist.md (written 2026-07-10, ~45 min). UPDATE 2026-07-19: fuller pack now at G:\My Drive\SEO\sites\sunnypatel.co.uk\gbp-reviews-pack.md (primary cat "SEO consultant", service-area Reading+6 ring towns, 10 services, review playbook, 12 NAP citations). Blocker: Sunny must supply phone + address for consistent NAP.
- Barnacle/listicle + link plan: G:\My Drive\SEO\sites\sunnypatel.co.uk\link-barnacle-plan.md (2026-07-19). First 3: TechBehemoths Reading, Clutch UK, Sortlist.
- Loom teardown cold-outreach campaign: outreach/loom-teardown-campaign.md (script + sequence ready, needs Sunny to source prospects + record).
- Clutch reviews (0 live) — unblocks the Clutch barnacle listing.
- ~~Decide fate of uncommitted WIP~~ shipped 2026-07-07 (981b004) with 301 ai-visibility-audit -> paid-seo-audit.
