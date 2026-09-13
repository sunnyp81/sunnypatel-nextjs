# Next CTR and AI referral studies: feasibility protocol

Status: draft prepared 13 September 2026. No Search Console or GA4 data were collected. Freeze the private manifests and matching rules before the prospective windows; keep both published studies unchanged.

## Existing evidence and boundaries

The July CTR files establish a historical edition of **53 qualifying Search Console properties and 2,615 retained query-property rows, 9 April–7 July 2026**. It had no country or device filter, no explicit brand exclusion, one unpaginated 5,000-row request per property and no retained property inventory or raw rows. It cannot be recast as UK-only, non-brand or 53 distinct domains, and its property overlap and extraction coverage cannot be reconstructed.

The AI article establishes **4,717 identified AI-source sessions across a deliberately enriched 12-site panel**, selected from 70+ sites for high AI traffic. It has no all-session denominator, checked-in raw export, extractor, exact source rules or private GA4 property map. Preserve it as the `AI-high 12` series; it cannot estimate a portfolio-wide average or assistant market share.

One date issue needs explicit treatment: the article calls 28 May–26 August 2026 a 90-day window. GA4 date endpoints are inclusive, and those dates span **91 calendar dates**. Preserve the original reported result and recover its source request before deciding whether the date range or duration label needs a dated correction. Future editions must give both exact dates and the inclusive date count. [GA4 date-range definition](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1alpha/DateRange).

Available read-only GA4 capabilities can list properties and run aggregate reports, but tool availability does not establish which properties are readable or approved for publication. No GA4 request was made. There is no current GSC connector; the legacy script’s `/root/.hermes/...` credential default is not evidence that access exists in this Windows workspace. Do not inspect or copy credentials.

## A. Fresh UK non-brand CTR edition

**Question.** Across a frozen managed portfolio, what impression-weighted web CTR is observed for available named, non-brand queries from the UK, by period-average position and device? This remains a fixed convenience portfolio, not a sample of all UK websites or searches.

**Window.** Target **14 September–12 December 2026 inclusive (90 dates)** if manifests are frozen by 13 September. Pull no earlier than 16 December and verify final data for every date. If the freeze slips, start the next full day and end 89 days later. Search Console dates are Pacific Time. A later extraction for 8 July–5 October may be labelled retrospective feasibility evidence, not preregistered evidence.

**Frozen panel.** From an authorised read-only `sites.list`, include only verified, readable production sites managed for the full window, authorised for private query analysis and anonymised publication, and supplied with an approved brand dictionary. Use one property per site identity. Prefer `sc-domain:`; when it overlaps URL-prefix properties, keep only the domain property. Treat protocol/`www` variants, redirects and staging as duplicates. If distinct sites share a registrable domain, include at most one unless non-overlapping URL-prefix scopes are proved before collection. Freeze private opaque site ID, exact property, canonical domain identity, property type, authorisation, brand-rule version and exclusion reason. Never replace a weak or failed site after viewing results.

**Retrieval.** For each site/day request finalized Search Analytics data with `dimensions: ["query","device"]`, `type: "web"`, `aggregationType: "byProperty"`, and an AND filter of `country equals GBR`. Use `rowLimit: 25000` and advance `startRow` by 25,000 to an empty response. Separately request `dimensions: ["device"]` with the same settings and no query dimension/filter for coverage totals. Require returned aggregation type `byProperty`. [Search Analytics query reference](https://developers.google.com/webmaster-tools/v1/searchanalytics/query).

Google exposes at most 25,000 rows per response and 50,000 rows per property/day/search type; query results are sorted by clicks, and query detail can lose rows. A 50,000-row day is potentially truncated. Anonymised queries cannot be recovered. Keep raw requests/responses and hashes private. [Search Console extraction limits](https://developers.google.com/webmaster-tools/v1/how-tos/all-your-data), [query-data limitations](https://support.google.com/webmasters/answer/17011259).

Do not apply brand regex in the API: Google says query filters remove anonymised queries from totals. Retrieve available named rows, then classify locally. This permits:

`named-query impression coverage = returned named-query impressions / no-query UK web impressions`.

Also report click coverage, failed pages, 50,000-row days and the unreturned/anonymised residual. Never label that residual non-brand.

**Brand handling.** Before collection, freeze per-site legal/trading/site names, domain stems, distinctive products, abbreviations, approved misspellings, ambiguous common-word patterns and false-positive exceptions. Normalize with Unicode NFKC, lowercase and collapsed whitespace; retain originals privately. Deterministic anchored patterns assign `brand`, `nonbrand` or `ambiguous`. The primary analysis excludes brand and ambiguous; a sensitivity cut treats ambiguous as non-brand. A lower-cost model may draft aliases and triage samples using opaque site IDs, but a human approves every rule before freeze and reviews all ambiguous rows plus the higher of 100 rows or a 5% deterministic non-brand sample per site (capped at the available rows).

**Unit and formulas.** Aggregate daily rows to `site × query × device` over the window:

- `clicks_u = Σ daily clicks`
- `impressions_u = Σ daily impressions`
- `position_u = Σ(daily position × daily impressions) / Σ daily impressions`

Eligible primary units are non-brand, non-ambiguous, have at least 50 window impressions and `position_u >= 1`. Buckets are `1: [1,1.5)`, integer `k=2…10: [k−0.5,k+0.5)`, `11–20: [10.5,20.5)`, and `21+: [20.5,∞)`. The new boundary does not alter July’s legacy totals.

Primary bucket CTR is `100 × Σ clicks_u / Σ impressions_u`. Publish combined device, mobile and desktop; tablet gets a separate table only if it passes the same gates. Show clicks, impressions, units and properties. As a property-balanced sensitivity, report median and IQR of property CTRs for properties with at least 100 bucket impressions, plus leave-one-property-out pooled CTR range.

**Release gates.** A point estimate needs ≥10 properties, ≥100 units and ≥1,000 impressions; a headline needs ≥20 properties and ≥5,000 impressions. Otherwise suppress CTR or use preregistered combined buckets `1–3`, `4–5`, `6–10`. Hold release for overlap, unresolved aggregation, missing site/date pages, post-outcome manifest/rule edits, pooled impression coverage below 80%, or any property below 50% without a predeclared coverage-exclusion rule applied consistently and a sensitivity result. A 50,000-row day blocks claims of complete query coverage. Independently recompute tables and verify public files/charts against daily totals before release.

## B. AI referral follow-on

Run two distinct series.

**Series A: AI-high 12 continuity.** Recover the exact 12 historical GA4 property/site identities; substitutions are prohibited. Target **27 August–24 November 2026 inclusive (90 dates)**, non-overlapping with the published end date, and pull after 26 November in each property’s time zone. Compare rates and sessions per day because the preceding stated dates span 91 dates. If any identity is unrecoverable, publish only a partial operational snapshot, not same-panel continuity.

**Series B: complete eligible portfolio baseline.** Freeze every readable, publication-authorised production GA4 web property, including zero-AI sites. If frozen 13 September, use **14 September–12 December 2026 inclusive**; otherwise shift the full 90-date window. Label it a managed-portfolio baseline and never splice it into Series A.

Private manifests need opaque site ID, property ID, production site/stream identity, sector, reporting time zone, full-window tracking status, authorisation and series membership. Use one source-of-record GA4 property per website. Exclude app/staging properties, unapproved clients, roll-ups/duplicates and multi-site properties that cannot be separated. Record outages, cross-domain/unwanted-referral settings and mid-window configuration changes without changing account settings or replacing sites.

**Allowlist.** The published labels (`chatgpt`, `perplexity`, `claude`, `gemini`, `copilot`, `openai`) do not reveal exact matching semantics. Before outcome reports, run a narrow pre-window `sessionSource × sessionMedium` inventory and freeze `ai-referrer-allowlist-v2.json`. Candidate values including `chatgpt.com`, `chat.openai.com`, `openai.com`, `perplexity.ai`, `claude.ai`, `gemini.google.com`, `bard.google.com` and `copilot.microsoft.com` require observed-value and provenance review; they are not asserted as present. Do not treat all `openai.com` or `bing.com` traffic as assistant clicks.

Each accepted exact value or anchored hostname rule stores provider, allowed media, evidence, reviewer and version. Match lowercased/trimmed values deterministically and retain originals privately. New values enter the next version, not the visible result. A historical recalculation under a new list is a labelled sensitivity result, never a rewrite.

Primary `identified AI-origin sessions` use allowlisted session sources regardless of medium, consistent with the article’s stated source-based concept. Report medium distribution and a narrower `sessionMedium = referral` sensitivity. Keep legacy `openai` separate from verified ChatGPT-domain traffic.

**Reports and formulas.** Per property/window retain: (1) no-dimension `sessions`; (2) `sessionDefaultChannelGroup × sessions` for Organic Search and reconciliation; (3) `sessionSource × sessionMedium × sessions` for local classification. Use absolute dates and paginate from GA4’s 10,000-row default up to 250,000 per request with `limit`/`offset` until `rowCount` is complete. Record response time zone, sampling metadata, thresholding, `(other)` data loss and empty reason. Do not API-filter to allowlisted sources because filters do not inspect values rolled into `(other)`. [GA4 report basics](https://developers.google.com/analytics/devguides/reporting/data/v1/basics), [reporting expectations](https://developers.google.com/analytics/devguides/reporting/data/v1/reporting-data-expectations).

Session counts use approximation, and adding dimensions can change reported totals. Record dimensional-versus-undimensioned differences explicitly; do not silently force them to add up or describe these counts as exact. Investigate discrepancies before interpreting the ratios. [GA4 counting and dimension limitations](https://developers.google.com/analytics/devguides/reporting/data/v1/reporting-data-expectations).

For property `p`: `AI share_p = 100 × AI_p / ALL_p`; `AI-to-organic ratio_p = 100 × AI_p / ORG_p`; `provider share_j,p = 100 × AI_j,p / AI_p`; and `AI/day_p = AI_p / inclusive dates`. Undefined denominators remain undefined. Per series publish pooled `100 × ΣAI/ΣALL`, median/IQR site share, organic comparison and zero-AI site count. Provider share means share of identified AI-origin sessions in this panel, not market share. AI is not a subset of Organic Search. Device is secondary and cannot replace property totals.

GA4 attribution does not identify every AI-origin visit: document referrer may populate source when campaign values are absent, while missing UTMs/referrers, redirects, shorteners, blockers, unwanted-referral and cross-domain rules can move traffic to direct or another source. Campaign tags and classification errors also prevent treating the reported count as a guaranteed lower bound. Allocate none of `(direct)/(none)` to AI. Referral analytics do not measure citations, impressions, brand mentions or zero-click answers. Do not request user-level data or report leads/revenue until event definitions, authority and comparability are separately verified. [Campaign/source collection](https://support.google.com/analytics/answer/11242841), [direct traffic](https://support.google.com/analytics/answer/15258820), [unwanted referrals](https://support.google.com/analytics/answer/10327750).

**Release gates.** Hold headlines if a primary report is sampled, thresholded, affected by `(other)`, incompletely paginated or has unexplained date/time-zone mismatch. Keep outages and attrition visible and show partial-property sensitivity rather than silently dropping sites. Before release, verify every source rule, report/property/date join, formulas, public aggregate and chart. Claims about causal update resilience, sector winners, citations or conversions remain outside this protocol.

## Deliverables, blockers and next action

Each released study needs frozen private manifest/rule hashes, request ledger/raw hashes, anonymised aggregate CSV/JSON, coverage and missingness tables, data dictionary, method/limitations, chart-source reconciliation and correction history. Lower-cost models can handle alias/source triage and first-pass narrative checks; deterministic code owns joins, formulas and exports, with human approval of rules and claims.

Three inputs block execution: (1) the private historical 12-site GA4 mapping and publication authority for the broader GA4 frame; (2) a metadata-only current GSC property inventory and site-overlap decisions; (3) approved site brand dictionaries and an observed exact GA4 source allowlist. The concrete next action is to obtain only those metadata/manifests, resolve duplicates, and hash the frozen inputs before any performance report is requested.

## Official Google documentation checked

- [Search Analytics query reference](https://developers.google.com/webmaster-tools/v1/searchanalytics/query): country/device filters, RE2 operators, aggregation, finalized data, ordering and pagination.
- [Getting Search Console performance data](https://developers.google.com/webmaster-tools/v1/how-tos/all-your-data): daily extraction, 25,000-row pages, 50,000 daily exposure and query-detail loss.
- [Search Console dimensions and query limits](https://support.google.com/webmasters/answer/17011259): anonymised queries, truncation and query-filter effects.
- [GA4 Data API schema](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema) and [report basics](https://developers.google.com/analytics/devguides/reporting/data/v1/basics): session dimensions and pagination.
- [GA4 reporting expectations](https://developers.google.com/analytics/devguides/reporting/data/v1/reporting-data-expectations): session approximation, sampling, thresholding and `(other)` metadata.
- [GA4 campaign/source collection](https://support.google.com/analytics/answer/11242841), [direct traffic](https://support.google.com/analytics/answer/15258820) and [unwanted referrals](https://support.google.com/analytics/answer/10327750): source and missing-referrer caveats.
- [GA4 DateRange](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1alpha/DateRange): inclusive endpoints and property-time-zone relative dates.
