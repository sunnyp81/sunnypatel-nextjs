# The 47-Point SEO Audit Checklist

I run this list against every site I audit, including the 44 in my own portfolio. It exists because I kept finding the same problems on sites that had already been "audited": pages returning 200 for URLs that don't exist, headings styled to look like headings but rendered as divs, canonicals pointing at redirects. Everything here is a concrete check, so two people running it on the same site should find the same faults.

## Technical Foundations

1. One canonical hostname. Pick https plus www or non-www once, then confirm the other three variants 301 directly to it with `curl -I` on each.
2. robots.txt returns 200 and doesn't block CSS, JS, or any template folder your pages need to render. Test specific paths in Screaming Frog's robots.txt tester, don't read the file and assume.
3. A made-up URL returns an actual 404 status, not a 200 with a friendly page. Check with `curl -I yoursite.com/this-does-not-exist`. Static hosts like Cloudflare Pages serve soft 200s by default if you've no 404.html.
4. XML sitemap contains only 200-status, indexable, self-canonical URLs. Crawl the sitemap in Screaming Frog list mode and confirm zero redirects, 404s, or noindexed pages inside it.
5. Sitemap is referenced in robots.txt and submitted to both Google Search Console and Bing Webmaster Tools. Bing feeds Copilot and ChatGPT search, so it's not optional any more.
6. No staging, dev, or preview subdomains in the index. Search `site:staging.domain.com` and `site:dev.domain.com`, and check your host's default preview URLs (*.pages.dev, *.vercel.app) aren't indexed.
7. No redirect chains beyond one hop. Export all redirects from a full crawl and fix anything with two or more hops, especially old migration leftovers.
8. Zero mixed content. Load key templates with DevTools console open and confirm no http:// assets or blocked requests.

## Indexation & Crawlability

9. Indexed page count in GSC roughly matches the sitemap count. A gap over 10% either way needs a named explanation per URL group, not a shrug.
10. Every URL in "Crawled, currently not indexed" reviewed individually. Thin or duplicate ones get consolidated or noindexed, they don't sit there for six months.
11. No accidental noindex in the rendered HTML. Check the rendered DOM, not view-source, because JS frameworks and SEO plugins can inject robots meta after load.
12. Canonical tags are self-referencing on unique pages and never point at a URL that redirects or 404s. Crawl canonicals as a list and check their status codes.
13. Parameter URLs, faceted filters, and internal search results are canonicalised or blocked. Search `site:domain.com inurl:?` and see what Google actually holds.
14. Index bloat check: `site:domain.com` result count against your known page count. Triple the real number means duplicates, parameters, or tag pages leaking in.
15. Paginated archives are crawlable with plain `<a href>` links, not load-more buttons that only work in JS. Disable JS and confirm you can still reach page 2.
16. Deleted pages return 404 or 410, or 301 to a genuinely equivalent page. No blanket redirects of everything to the homepage, Google treats those as soft 404s.

## On-Page & Content

17. Title tags unique, query first, and checked in a SERP pixel-width preview tool, not by character count. 60 characters of wide letters still truncates.
18. Exactly one H1 per page, and it's a real `<h1>` element in the rendered DOM. I've audited pages that passed a grep but rendered zero heading tags.
19. Heading hierarchy is genuine h2/h3 structure, not styled paragraphs. Inspect the rendered output on your top five templates.
20. Meta descriptions rewritten for any page ranking in the top 10 with CTR below the site's average for that position. Pull the list from GSC, don't guess which pages need it.
21. Page format matches what actually ranks. If the top five results for your target query are listicles or comparison tables, a 2,000-word essay won't break in. Check the live SERP before writing.
22. Cannibalisation check: in GSC, filter by your main queries and look for two URLs trading impressions for the same term. Pick one owner per query and consolidate.
23. Content decay: compare each key page's last 3 months of GSC clicks against the same period last year. Anything down 30%+ goes on the refresh list before you write anything new.
24. Pages under roughly 300 words with zero clicks in 12 months get merged, redirected, or noindexed. Every one of them dilutes the crawl and the site's quality signals.
25. Visible dates are real. dateModified in schema matches an actual content change, not the last time the plugin resaved the page.

## Core Web Vitals & Performance

26. LCP under 2.5s on mobile using the field data (CrUX) section of PageSpeed Insights, not the lab score and not desktop.
27. INP under 200ms in field data. Long tasks from third-party scripts, chat widgets, and consent tools are the usual cause, check the Performance panel.
28. CLS under 0.1. Every image has width and height attributes, and ad slots or embeds have reserved space before they load.
29. The LCP image is preloaded and never lazy-loaded. `loading="lazy"` on the hero image is one of the most common self-inflicted LCP failures I see.
30. Fonts self-hosted with `font-display: swap`, and no more than two families loading. Check the network tab for fonts pulled from third-party CDNs on every pageview.
31. Images served as WebP or AVIF at the displayed size, lazy-loaded below the fold only. Sort a crawl by image size and fix anything over 200KB.

## Internal Linking & Architecture

32. Every money page sits within three clicks of the homepage. Run a crawl depth report and flag revenue pages at depth four or more.
33. Zero orphan pages. Compare the crawl, the sitemap, and GSC's indexed list, and link anything that exists in only one of the three.
34. Zero broken internal links and zero internal links to redirects. Both come straight out of a crawl, both should be at nil before you call the audit done.
35. No `href="#"` or empty-href placeholder links in templates. They orphan whole sections when a nav gets rebuilt, grep the rendered HTML for them.
36. Older high-traffic pages link forward to newer money pages with descriptive anchors, not the other way round only. Check the inlinks report for every page you want to rank.

## Authority & Brand

37. Referring domains trend in Ahrefs over 12 months. Flat or declining while competitors grow is the finding, a raw DR number on its own tells you nothing.
38. Sudden link spikes investigated: pull the new referring domains for the spike month and confirm they're real sites, not a scraper network you'll later regret.
39. Link gap: run the top three ranking competitors through Ahrefs' link intersect and list the domains that link to two or more of them but not to you. That's the outreach list.
40. You own page one for your brand name: site, key social profiles, and Google Business Profile if local. Anything you don't control on that page gets noted.
41. Unlinked brand mentions found via Google search for the brand name minus your domain, and turned into links where the site is worth it.

## AI Search Readiness

42. robots.txt doesn't block GPTBot, ClaudeBot, PerplexityBot, or Google-Extended unless that's a deliberate decision someone signed off. Check the live file, CDN bot protection can block them silently too.
43. AI referral traffic is measured: a GA4 segment or exploration covering chatgpt.com, perplexity.ai, copilot.microsoft.com, and claude.ai referrers. You can't grow what you're not counting.
44. The first two sentences under each H2 answer that heading's question directly. AI engines lift self-contained chunks, so a heading followed by throat-clearing gets skipped.
45. Organization or Person schema with a sameAs array pointing at the exact, verified profile URLs. Validate in the Rich Results Test, and check the URLs resolve, a guessed LinkedIn slug in schema is worse than none.
46. Author pages exist with real credentials, and the author entity is consistent across the site, schema, and external profiles.
47. Ask ChatGPT, Perplexity, and Copilot your five most valuable queries and record whether you're cited. Repeat monthly, this is the new rank tracking.

That's the list. It gets longer every year and I'd rather it didn't. More at sunnypatel.co.uk.
