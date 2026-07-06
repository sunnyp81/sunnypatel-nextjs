# evolve-site baseline — sunnypatel.co.uk

T0: 2026-07-07. Success metric: **clicks per day, 28-day rolling average** (GSC, sc-domain:sunnypatel.co.uk). Secondary: GA4 generate_lead events per 28d.

## GSC 2026-06-08 to 2026-07-06 (28d)

- Total: ~44 clicks / ~40,000 impressions, sitewide CTR ~0.11%.
- Top pages by impressions:

| Page | Clicks | Impr | Pos |
|---|---|---|---|
| /blog/best-seo-companies-uk/ | 1 | 9,209 | 68.9 |
| /services/seo-consultant-reading/ | 2 | 6,639 | 21.0 |
| /services/seo-berkshire/ | 1 | 4,471 | 20.6 |
| /services/technical-seo-audit/ | 0 | 4,057 | 34.4 |
| /blog/ai-search-statistics/ | 9 | 2,715 | 8.8 |
| / (homepage) | 3 | 1,820 | 11.1 |
| /services/seo-consultant-london/ | 0 | 1,605 | 48.1 |
| /tools/schema-generator/ | 1 | 1,520 | 21.1 |
| /blog/best-aeo-agencies/ | 0 | 1,202 | 39.5 |
| /services/seo-consulting/ | 0 | 1,165 | 27.3 |
| /tools/website-grader/ | 0 | 1,026 | 32.5 |
| /blog/google-open-knowledge-format/ | 16 | 762 | 9.4 |

- Key query anomaly: "seo consultant reading" pos 1.98, 283 impr, 1 click (0.35% CTR at position 2).
- Reading page variant queries stuck: "reading seo company" 419 impr pos 18.2, "reading seo" 171 impr pos 25.2, "local seo services in reading" 169 impr pos 13.3.

## GA4 (property 409078193), same window

- generate_lead: 37 events in 90d, all from /contact/ (35) + homepage (2). Zero from service inline forms or blog CTAs.
- Key events metric: 6 in 28d, homepage only. generate_lead NOT marked as key event (Sunny manual item).
- Organic landing sessions concentrate on blog (OKF 17, ai-search-stats 11); service pages get 2 organic sessions each.

## Bing (28d)

- 22 clicks / 3,746 impressions. Led by /blog/chatgpt-ads/ (5c) and /tools/readability-score/ (4c).

## Structural facts

- Footer already links all money pages sitewide. Top blog posts already densely linked to services.
- Conversion machinery works (useLeadForm fires generate_lead; ServiceInlineForm on service pages; BlogStickyCta on blog+service).
- Known off-page ceiling: "seo consultant reading" ~200 searches/mo; AEO growth needs third-party mentions (outreach parked).
