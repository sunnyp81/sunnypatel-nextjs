# Organic landing page refresh, 13 September 2026

Six existing organic entry pages were repaired and refreshed following a Search Console and source-code audit. Existing URLs, the 16 schema leaf routes, advertised prices and the research protocols are preserved.

## Changes

| Page | Result |
|---|---|
| `/tools/schema-generator/` | HTML-safe JSON-LD exports; examples for all 16 types; separate completeness and search-eligibility guidance; honest copy/open/paste validation; clipboard failures and popup blocking handled. |
| `/tools/keyword-scraper/` | Correct France region; deterministic merged region results; bounded, cancellable requests; stale-run isolation; clear empty/error states; CSV formula neutralisation. |
| `/tools/seo-prompts/` | 20 searchable prompts with evidence requirements, locally editable inputs, fictional examples, previews, output checks and reliable clipboard feedback. Inputs survive filtering. |
| `/services/technical-seo-audit/` | £495 scope, five-working-day delivery conditions, 60-minute walkthrough, competitor review, fictional work-product sample and an offer-specific enquiry form. Stale retainer blocks and FAQ markup removed. |
| `/services/content-briefs/` | Existing £150/£1,200/£2,500 offers, delivery conditions, Google Doc format, batch tracker, fictional sample and a specific enquiry form. |
| `/blog/how-long-does-seo-take/` | Dated Ahrefs cohorts and Google guidance, separate progress stages, stalled-progress checks, explicit limitations and a downloadable progress tracker. |

The service forms and timeline guide no longer have a floating free-diagnosis promotion covering their content. Shared text/button contrast, mobile-menu Escape handling and focus clearance were repaired. The Services directory's pre-existing case-insensitive redirect loop is replaced by a case-sensitive legacy-path redirect.

## Measurement

Tool events use categorical identifiers and counts. They do not include entered URLs, keywords, prompt text or business inputs. Clipboard failures do not count as successful use. Failed keyword runs do not also count as completed runs.

Successful tool use records a bounded list of three allowed tool IDs in session storage. A later successful enquiry adds `last_tool_used`, `tools_used` and `tool_count` to `generate_lead`. The actual enquiry continues to carry the selected service offer and the existing attribution fields. Enquiries are not purchases; the service prices are not reported as realised revenue.

Event names include `schema_copy`, `schema_download`, `schema_test_open`, `keyword_start`, `keyword_complete`, `keyword_error`, `keyword_stop`, `keyword_download`, `prompt_copy`, `prompt_copy_error`, `prompt_category` and `prompt_search`.

GA4 reporting access was not changed. New event parameters need corresponding event-scoped custom dimensions if they are to appear as dimensions in standard GA4 explorations. This release verifies event emission and the lead payload, not GA4 processing or an increase in conversions. Compare equivalent post-release periods once enough real visits and enquiries exist; the original six-page sample contained only 16 Google clicks in 28 days.

## Verification

- Production build: 446 routes generated; TypeScript passed. Targeted ESLint and content validation passed.
- Unit regressions: 12 passed across schema escaping, keyword state/data/CSV, prompt preparation and tool-journey storage.
- Browser interactions: 14 schema checks; 16 schema leaf routes; five keyword checks including React Strict Mode; prompt filtering/personalisation/copy and both forms' validation/error/retry/success paths.
- All six pages inspected at desktop and mobile sizes, including 320px reflow, keyboard focus, reduced-motion mode and mobile navigation. Automated WCAG checks found no violations in the checked final pages.
- Production HTML validator: six pages, zero errors and warnings. Local link/asset check: 74 destinations, no failures. Download contents inspected.
- Test autocomplete, analytics and contact traffic intercepted. No paid collection or real lead submission was used for testing.
- Secret scan: full candidate tree and known credential values, no findings. All seven frozen research artifact hashes matched. Public credential/config probes did not expose files.
- Dependency audit: zero high/critical advisories; two moderate and one low pre-existing advisories remain. No dependency versions changed in this release.

Private working evidence is retained under `tmp/organic-landing-review-2026-09-13/`: original snapshots and GSC data, browser scripts and screenshots, interaction reports, HTML checks and release scans. Live publication is checked against the exact Git commit and production deployment after the push.

## Performance limits

Mobile Lighthouse 12.8.2 lab baseline, local production server with analytics blocked:

| Representative page | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|
| Keyword tool | 90 | 100 | 100 | 100 | 3.2s | 180ms | 0 |
| Technical audit | 92 | 100 | 100 | 100 | 3.4s | 40ms | 0 |
| Timeline guide | 89 | 100 | 100 | 100 | 3.7s | 50ms | 0 |

These are a reproducible lab baseline, not field Core Web Vitals or a before/after improvement claim. Shared render-blocking CSS and hero-image prioritisation remain performance opportunities. Mobile LCP in these runs is above the 2.5-second field target.

## Evidence sources

Service terms are recorded in [the entity register](entity-source-of-truth.md). The timeline distinguishes the [2024 practitioner poll](https://ahrefs.com/blog/how-long-does-seo-take/) from the [2025 URL cohort and US ranking-age study](https://ahrefs.com/blog/how-long-does-it-take-to-rank-in-google-and-how-old-are-top-ranking-pages/). [Google recrawl guidance](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl) does not guarantee indexation. Redirect implementation follows the installed Next.js proxy documentation and its [official reference](https://nextjs.org/docs/app/api-reference/file-conventions/proxy).
