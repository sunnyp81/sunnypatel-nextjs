# Google Business Profile setup — sunnypatel.co.uk (Sunny manual, ~45 min)

Why first: "seo consultant reading" is position 1.8 organically with 0.35% CTR because the local pack sits above you and you are not in it. The Reading/Berkshire query cluster has ~4,500 impressions/month with zero clicks. GBP is the single highest-leverage visibility fix available and no code change can substitute for it.

## Setup (one-off)
1. business.google.com, create profile: "Sunny Patel SEO" (matches sitewide LocalBusiness schema name, keep identical).
2. Type: Service Area Business (no storefront address shown). Service areas: Reading, Wokingham, Bracknell, Maidenhead, Windsor, Slough, Berkshire.
3. Category primary: "Marketing consultant". Secondary: "Internet marketing service", "Website designer" (covers the /website-design/ cluster).
4. Phone + website: use the same NAP as the site footer and schema.ts.
5. Verification: usually video verification for SABs, have a screen recording of GSC/GA4 ownership + client work ready.

## Immediately after verification
6. Services: add each money service with the fixed fee where one exists: Paid SEO Audit £495, Technical SEO Audit, Local SEO, AI Search Optimisation, Website Design (from £1,500).
7. Description: 750 chars, lead with "SEO consultant in Reading, Berkshire" + AI-visibility angle + fixed-fee audit offer.
8. Photos: headshot, laptop/work shots, one results graph (the 180-to-620 visits chart).
9. Booking link: Trafft "Free SEO Audit" URL as the appointment link.
10. Uncomment the GBP sameAs line in src/lib/schema.ts, push, redeploy (tell Claude, this part is loop-executable).

## Reviews engine (ongoing, this is what ranks the profile)
11. First 5 reviews: Dr Shaan Patel (Aatma Aesthetics), James W., Sarah M., Tom B., Claire H. — the testimonials already on the site. Use /tools/review-link/ to generate the direct review URL.
12. Ask Mike/Hummingbird for one if scope allows.
13. Weekly GBP post cadence: repurpose each new blog post as a GBP update (loop-executable once profile exists, gbp-optimizer skill).

## Also while you're at it (same session, 20 min)
- Bark.com + Yell free listings (same NAP), then uncomment their sameAs lines too.
- These + GBP were flagged in the Apr 14 GEO audit as worth more than the 53 bulk citations.
