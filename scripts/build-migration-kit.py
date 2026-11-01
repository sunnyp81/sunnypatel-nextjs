"""Build public/downloads/migration-kit.xlsx. Run: python scripts/build-migration-kit.py"""
import os
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "downloads", "migration-kit.xlsx")
HEAD = PatternFill("solid", fgColor="1F2937")
SEC = PatternFill("solid", fgColor="E5E7EB")
INPUT = PatternFill("solid", fgColor="FEF9C3")
WHITE = Font(bold=True, color="FFFFFF")
BOLD = Font(bold=True)
thin = Side(style="thin", color="D1D5DB")
BOX = Border(left=thin, right=thin, top=thin, bottom=thin)
WRAP = Alignment(wrap_text=True, vertical="top")
SITE = "https://www.sunnypatel.co.uk"


def header(ws, row, labels):
    for i, l in enumerate(labels, 1):
        c = ws.cell(row=row, column=i, value=l)
        c.fill, c.font, c.alignment, c.border = HEAD, WHITE, WRAP, BOX


def put(ws, row, vals, fill=None):
    for i, v in enumerate(vals, 1):
        c = ws.cell(row=row, column=i, value=v)
        c.alignment, c.border = WRAP, BOX
        if fill is not None:
            c.fill = fill


def widths(ws, ws_widths):
    for i, w in enumerate(ws_widths, 1):
        ws.column_dimensions[chr(64 + i)].width = w


def yesno(ws, rng):
    dv = DataValidation(type="list", formula1='"yes,no"', allow_blank=True)
    ws.add_data_validation(dv)
    dv.add(rng)


wb = Workbook()

# ---------------- Read Me
ws = wb.active
ws.title = "Read Me"
rows = [
    ("Website migration kit", BOLD),
    ("A free working kit for a website rebuild or platform move. Made by Sunny Patel, sunnypatel.co.uk. Use it as it stands; nothing here needs a purchase.", None),
    ("", None),
    ("How to use it", BOLD),
    ("1. Before you touch anything, fill the Before-After Baseline tab (Before column). Export each item from the place named on the tab.", None),
    ("2. Build the URL Map from a full crawl of the old site. Every old URL gets a row. The URL Map tab shows 27 real examples from my own migration.", None),
    ("3. Practice first if you have never built a redirect map. The Practice tab has 8 deliberate mistakes; the Answer Key tab explains each one. Try before you look.", None),
    ("4. Work through Launch Day Checks on the day the new site goes live.", None),
    ("5. Use the 30-60-90 Day Watch tab to check the site through the first 90 days, then fill the After column of the baseline.", None),
    ("", None),
    ("Tabs", BOLD),
    ("URL Map: old URL, new URL, expected status code, the query the page should own, and a checked column.", None),
    ("Practice: 14 redirect rows, 8 with an error. Answer Key: what each error is and the fix.", None),
    ("Before-After Baseline: clicks, impressions, indexed pages, top 20 pages and top queries, with where to export each one.", None),
    ("Launch Day Checks and 30-60-90 Day Watch: tick lists with normal and escalate rules.", None),
    ("", None),
    ("Worked example: my own move from WordPress to Next.js", BOLD),
    ("Source: Google Search Console, property sc-domain:sunnypatel.co.uk, checked 31 Oct 2026.", None),
    ("1 Jul 2025 to 19 Feb 2026, on WordPress: 18 clicks, 12,998 impressions.", None),
    ("20 Feb to 28 Oct 2026, on Next.js: 506 clicks, 397,107 impressions.", None),
    ("Caveat: the rebuild also added new content (services pages and studies), so the gain is platform plus content, not the platform alone. The two periods are also different lengths, so treat it as a before and after record, not a controlled test.", None),
    ("Separate affiliate-site move from WordPress to Astro: duplicate H1s went from 55 to 0 and schema coverage from 34% to 100%.", None),
    ("", None),
    ("Notes", BOLD),
    ("The URL Map sample comes from the redirect rules on sunnypatel.co.uk. They are public paths on my own site. The Practice rows use made-up example paths.", None),
    ("Yellow cells are for you to fill in. Next.js sends 308 for permanent redirects; a 301 carries the same weight for Google. A 302 or 307 does not.", None),
    ("Google's migration guidance: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes", None),
    ("If you want me to run this on your site, the migration audit starts from £495: " + SITE + "/services/seo-migration-consultant/", None),
]
for i, (t, f) in enumerate(rows, 1):
    c = ws.cell(row=i, column=1, value=t)
    c.alignment = WRAP
    if f:
        c.font = f
ws["A1"].font = Font(bold=True, size=16)
ws.column_dimensions["A"].width = 130

# ---------------- URL Map
SAMPLE = [
    ("/tools/image-compressor", "/tools/", "Retired tool folded into the tools hub", "seo tools"),
    ("/services/paid-seo-audit", "/services/technical-seo-audit/", "Duplicate service page merged into the owner", "technical seo audit"),
    ("/services/ai-visibility-audit", "/services/technical-seo-audit/", "Points straight at the owner, no chain", "technical seo audit"),
    ("/services/generative-engine-optimisation", "/services/ai-search-optimisation/", "Renamed service", "ai search optimisation"),
    ("/services/seo-agency-reading", "/services/seo-consultant-reading/", "Never-indexed near-duplicate merged", "seo consultant reading"),
    ("/services/local-seo-agency", "/services/local-seo/", "Duplicate service page merged", "local seo"),
    ("/services/seo-consultant-leeds", "/services/freelance-seo-consultant/", "Thin location page pruned to closest consultant page", "freelance seo consultant"),
    ("/services/seo-consultant-york", "/services/freelance-seo-consultant/", "Thin location page pruned to closest consultant page", "freelance seo consultant"),
    ("/seo-berkshire", "/services/seo-berkshire/", "Root-level page moved into /services/", "seo berkshire"),
    ("/seo-bracknell", "/services/seo-bracknell/", "Root-level page moved into /services/", "seo bracknell"),
    ("/seo-slough", "/services/seo-slough/", "Root-level page moved into /services/", "seo slough"),
    ("/technical-seo-audit", "/services/technical-seo-audit/", "Root-level page moved into /services/", "technical seo audit"),
    ("/local-seo", "/services/local-seo/", "Root-level page moved into /services/", "local seo"),
    ("/seo-audit", "/services/technical-seo-audit/", "Old WordPress page mapped to nearest equivalent", "seo audit"),
    ("/seo-packages", "/services/seo-retainer/", "Old WordPress page mapped to nearest equivalent", "seo packages"),
    ("/seo-cost", "/services/how-much-does-seo-cost/", "Old WordPress page mapped to the page that owns the query", "how much does seo cost"),
    ("/b2b-content-marketing-services", "/services/b2b-seo/", "Old WordPress service page", "b2b content marketing"),
    ("/case-studies", "/portfolio/", "Old WordPress page mapped to nearest equivalent", "seo case studies"),
    ("/contact-us", "/contact/", "Slug shortened", "contact"),
    ("/about-2", "/about/", "WordPress duplicate slug (-2) removed", "about"),
    ("/home", "/", "Old WordPress home slug", "brand name"),
    ("/how-many-keywords", "/blog/how-many-keywords/", "Root-level WordPress post moved under /blog/", "how many keywords"),
    ("/how-long-does-seo-take", "/blog/how-long-does-seo-take/", "Root-level WordPress post moved under /blog/", "how long does seo take"),
    ("/blog/best-aeo-agencies-uk-2026", "/blog/best-aeo-agencies/", "Slug cleanup: year and duplicate uk dropped", "best aeo agencies"),
    ("/category/:slug", "/blog/", "WordPress category archives (pattern rule) sent to the blog index", "blog"),
    ("/author/:slug", "/about/", "WordPress author archives (pattern rule), real profile page excluded", "about"),
    ("/wp-sitemap.xml", "/sitemap.xml", "WordPress sitemap path", "n/a (sitemap)"),
]
ws = wb.create_sheet("URL Map")
ws["A1"] = f"URL Map: {len(SAMPLE)} real rows from sunnypatel.co.uk (WordPress to Next.js). Paths only; the site is {SITE}"
ws["A1"].font = BOLD
ws["A2"] = "Status code expected is 308 because Next.js sends 308 for permanent redirects. Use 301 if your server does. Owner query is the search term the new page should own. Fill Checked yes after you test the live redirect."
ws["A2"].alignment = WRAP
ws.merge_cells("A2:F2")
ws.row_dimensions[2].height = 45
header(ws, 4, ["Old URL", "New URL", "Status code expected", "Owner query", "Checked (yes/no)", "Note"])
for i, (o, n, note, q) in enumerate(SAMPLE, 5):
    put(ws, i, [o, n, 308, q, "no", note])
    ws.cell(row=i, column=5).fill = INPUT
last = 4 + len(SAMPLE)
yesno(ws, f"E5:E{last + 100}")
for r in range(last + 1, last + 6):
    put(ws, r, [None] * 6, INPUT)
widths(ws, [42, 42, 14, 28, 14, 55])
ws.freeze_panes = "A5"

# ---------------- Practice
ws = wb.create_sheet("Practice")
ws["A1"] = "Practice: 14 redirect rows on a made-up site (example-shop.co.uk). 8 have a deliberate error. Read the Observed column, which is what a live test returned, and mark each row ok or error."
ws["A1"].alignment = WRAP
ws.merge_cells("A1:G1")
ws.row_dimensions[1].height = 45
header(ws, 3, ["Row", "Old URL", "New URL", "Status code expected", "Owner query", "Observed on live test", "Your verdict (ok / error)"])
P = [
    (1, "/about-us", "/about/", 301, "about example shop", "301 to /about/, then 200"),
    (2, "/old-pricing", "/pricing-2024/", 301, "example shop pricing", "301 to /pricing-2024/, which 301s to /pricing/, then 200"),
    (3, "/shop/kettles", "/products/kettles/", 301, "buy kettles", "301 to /products/kettles/, then 200"),
    (4, "/gift-guide", "/gift-ideas/", 301, "gift ideas", "301 to /gift-ideas/, which 301s back to /gift-guide: loop, browser gives too many redirects"),
    (5, "/blog/how-to-descale-a-kettle", "/", 301, "how to descale a kettle", "301 to the homepage, then 200"),
    (6, "/delivery-info", "/delivery/", 301, "delivery times", "302 to /delivery/, then 200"),
    (7, "/contact", "/contact", 301, "contact example shop", "301 to /contact (no slash), then the site redirects to /contact/"),
    (8, "/shop/toasters", "/products/toasters/", 301, "buy toasters", "301 to /products/toasters/, then 200"),
    (9, "/shop/blenders", "", 301, "buy blenders", "404, no redirect rule exists"),
    (10, "/blog/best-kettles-2022", "/products/blenders/", 301, "best kettles", "301 to /products/blenders/, then 200"),
    (11, "/returns-policy", "/returns/", 301, "returns policy", "301 to /returns/, then 200"),
    (12, "/shop/cookers", "/products/cookers/", 301, "buy cookers", "301 to /products/cookers/, then 404"),
    (13, "/faq", "/help/faq/", 301, "example shop faq", "301 to /help/faq/, then 200"),
    (14, "/sitemap_index.xml", "/sitemap.xml", 301, "n/a (sitemap)", "301 to /sitemap.xml, then 200"),
]
for i, row in enumerate(P, 4):
    put(ws, i, list(row) + [None])
    ws.cell(row=i, column=7).fill = INPUT
dv = DataValidation(type="list", formula1='"ok,error"', allow_blank=True)
ws.add_data_validation(dv)
dv.add(f"G4:G{3 + len(P)}")
widths(ws, [6, 34, 30, 14, 26, 62, 18])
ws.freeze_panes = "A4"

# ---------------- Answer Key
ws = wb.create_sheet("Answer Key")
header(ws, 1, ["Practice row", "Error", "Why it hurts", "Fix"])
A = [
    (2, "Redirect chain", "Two hops where one will do. Every extra hop slows crawling and risks a break if the middle URL is changed later.", "Point /old-pricing straight at /pricing/ and update any other rule that targets /pricing-2024/."),
    (4, "Redirect loop", "The two URLs send each other back and forth. Nothing resolves, so users and Google reach neither page.", "Decide which URL is the live page, keep a redirect only from the other, and remove the return rule."),
    (5, "Redirect to the homepage", "The old page was about descaling a kettle. Sending it to the homepage loses the topic match, and Google can treat it as a soft 404.", "Redirect to the closest relevant page. If none exists, return 404 or 410 on purpose."),
    (6, "302 instead of a permanent redirect", "A 302 says the move is temporary, so Google may keep the old URL in its index.", "Change the rule to 301 (or 308)."),
    (7, "Trailing-slash mismatch", "The rule targets /contact but the site serves /contact/, so every visitor takes a second hop and the sitemap and internal links disagree.", "Point the rule at /contact/ exactly as the site serves it, and make links and sitemap use the same form."),
    (9, "Missing mapping", "The old URL has no rule, so it returns a 404 on launch day and loses its links and rankings.", "Add /shop/blenders to /products/blenders/ as a single-hop 301."),
    (10, "Mapping to an irrelevant page", "A kettles article redirects to blenders. The query match is gone and users bounce.", "Map it to a kettle page, such as /products/kettles/, or retire it with a 410."),
    (12, "Redirect to a 404", "The rule is fine, but the destination does not exist on the new site. The old URL dead-ends one hop later.", "Build /products/cookers/ or choose a live destination, then retest."),
]
for i, r in enumerate(A, 2):
    put(ws, i, list(r))
ws.cell(row=len(A) + 3, column=1, value="Rows 1, 3, 8, 11, 13 and 14 are correct.").font = BOLD
widths(ws, [14, 32, 70, 70])

# ---------------- Baseline
ws = wb.create_sheet("Before-After Baseline")
ws["A1"] = "Before/After Baseline. Fill Before this week, After at day 30 and again at day 90. Use the same date length for both columns."
ws["A1"].font = BOLD
header(ws, 3, ["Metric", "Where to export it", "Before (dates: ____ to ____)", "After (dates: ____ to ____)", "Change", "Note"])
M = [
    ("Clicks (web search, total)", "Google Search Console > Performance > Search results > set dates > read the Clicks tile."),
    ("Impressions (web search, total)", "Same screen, Impressions tile."),
    ("Indexed pages", "Google Search Console > Indexing > Pages > 'Indexed' count."),
    ("Sitemap URLs", "Open your sitemap and count the URLs (Screaming Frog > Sitemaps, or the sitemap report in Search Console)."),
    ("Pages returning 404 in a crawl", "Screaming Frog > Response Codes > Client Error (4xx). Run it on the old site before and the new site after."),
]
for i, (m, w) in enumerate(M, 4):
    put(ws, i, [m, w, None, None, f'=IF(AND(ISNUMBER(C{i}),ISNUMBER(D{i}),C{i}<>0),(D{i}-C{i})/C{i},"")', None])
    ws.cell(row=i, column=3).fill = INPUT
    ws.cell(row=i, column=4).fill = INPUT
    ws.cell(row=i, column=5).number_format = "0.0%"
r = 4 + len(M) + 1
for title, how in [
    ("Top 20 pages by clicks", "Search Console > Performance > Pages tab > sort by Clicks > Export > Download CSV. Paste the top 20 below. Keep the full CSV as your safe copy."),
    ("Top 20 queries by clicks", "Search Console > Performance > Queries tab > sort by Clicks > Export. Paste the top 20 below."),
]:
    c = ws.cell(row=r, column=1, value=title)
    c.font = BOLD
    for col in range(1, 7):
        ws.cell(row=r, column=col).fill = SEC
    ws.cell(row=r + 1, column=1, value="Where to export: " + how).alignment = WRAP
    ws.merge_cells(start_row=r + 1, start_column=1, end_row=r + 1, end_column=6)
    ws.row_dimensions[r + 1].height = 35
    header(ws, r + 2, ["Page or query", "Before clicks", "Before impressions", "After clicks", "After impressions", "Note"])
    for k in range(1, 21):
        put(ws, r + 2 + k, [None] * 6, INPUT)
    r += 2 + 20 + 2
c = ws.cell(row=r, column=1, value="Worked example: sunnypatel.co.uk, WordPress to Next.js")
c.font = BOLD
for col in range(1, 7):
    ws.cell(row=r, column=col).fill = SEC
header(ws, r + 1, ["Period", "Platform", "Clicks", "Impressions", "", "Source"])
put(ws, r + 2, ["1 Jul 2025 to 19 Feb 2026", "WordPress", 18, 12998, None, "Google Search Console, sc-domain:sunnypatel.co.uk, checked 31 Oct 2026"])
put(ws, r + 3, ["20 Feb to 28 Oct 2026", "Next.js", 506, 397107, None, "Google Search Console, sc-domain:sunnypatel.co.uk, checked 31 Oct 2026"])
ws.cell(row=r + 4, column=1, value="Caveat: the rebuild also added new content (services pages and studies), so the gain is platform plus content, not the platform alone. The periods differ in length, so this is a before and after record, not a controlled test.").alignment = WRAP
ws.merge_cells(start_row=r + 4, start_column=1, end_row=r + 4, end_column=6)
ws.row_dimensions[r + 4].height = 45
for rr in (r + 2, r + 3):
    ws.cell(row=rr, column=3).number_format = "#,##0"
    ws.cell(row=rr, column=4).number_format = "#,##0"
widths(ws, [46, 62, 26, 26, 14, 50])

# ---------------- Launch Day Checks
ws = wb.create_sheet("Launch Day Checks")
header(ws, 1, ["#", "When", "Check", "How to do it", "Pass means", "Done (yes/no)"])
L = [
    ("First hour", "robots.txt is not blocking the site", "Open yourdomain.com/robots.txt in a browser.", "No 'Disallow: /' left over from staging."),
    ("First hour", "No noindex left from staging", "View source on the home page and 3 key pages and search for noindex. Also check the X-Robots-Tag header.", "No noindex on any page you want indexed."),
    ("First hour", "Submit the new XML sitemap", "Search Console > Sitemaps > add the sitemap URL.", "Status shows Success."),
    ("First hour", "Test 20 old URLs against the URL Map", "Request each old URL with Screaming Frog list mode or a redirect checker.", "Changed URLs give one 301 or 308 to the right page; unchanged URLs load directly; retired URLs give 404 or 410."),
    ("First hour", "Redirects are single hop", "In the same crawl, look at redirect chains.", "No chains, no loops, no 302s."),
    ("First hour", "Canonicals point to the live URL", "Spot check 5 pages: canonical matches the address bar, same slash form.", "Canonical equals the final URL."),
    ("First hour", "Core Web Vitals lab test", "PageSpeed Insights on 5 key pages. Use the lab data; field data lags by about 28 days.", "No red lab scores you did not have before."),
    ("First hour", "Mobile rendering", "Open home, a service page and a post at 3 screen sizes.", "Nothing cut off, menu works."),
    ("First hour", "404 page returns a 404 status", "Request a nonsense URL and check the status code.", "Status is 404, not 200."),
    ("First 24 hours", "Full crawl of the new site", "Run Screaming Frog on the new site.", "Crawl completes."),
    ("First 24 hours", "Compare URL count with the pre-launch crawl", "Compare crawl totals against the Baseline tab.", "Any difference is explained by your URL Map."),
    ("First 24 hours", "Structured data carried over", "Rich Results Test on one page of each template.", "Same types as before."),
    ("First 24 hours", "Titles, descriptions and alt text carried over", "Compare the crawl exports for old and new.", "No blank titles or H1s."),
    ("First 24 hours", "Internal links use new URLs", "Crawl > Inlinks with redirect status.", "No internal link goes through a redirect."),
    ("First 24 hours", "Forms and calls to action work", "Test each conversion point yourself.", "Each goes where it should."),
    ("First 24 hours", "Analytics and Search Console tags fire", "Check realtime reports for your own visit.", "Your visit appears."),
]
for i, (w, c, h, p) in enumerate(L, 2):
    put(ws, i, [i - 1, w, c, h, p, "no"])
    ws.cell(row=i, column=6).fill = INPUT
yesno(ws, f"F2:F{len(L) + 1}")
widths(ws, [5, 16, 42, 60, 50, 14])
ws.freeze_panes = "A2"

# ---------------- 30-60-90
ws = wb.create_sheet("30-60-90 Day Watch")
header(ws, 1, ["Day", "Check", "Where", "Normal", "Escalate if", "Result / date checked", "Done (yes/no)"])
W = [
    ("1 to 14 (daily)", "Indexed pages count", "Search Console > Pages", "Drop matches pages you retired on purpose", "Drops by more than 5% beyond what your URL Map explains"),
    ("1 to 14 (daily)", "New 404s", "Search Console > Pages; server logs", "Only URLs you deliberately retired", "A URL that should have a relevant destination returns 404: add the missing row"),
    ("1 to 14 (daily)", "Impressions trend", "Search Console > Performance", "A 10 to 20% dip in week one as Google recrawls", "A drop of 40% or more"),
    ("7", "Redirect re-test", "Screaming Frog list mode on the whole URL Map", "All rows pass", "Any chain, loop, 302 or 404"),
    ("14", "Top 20 query positions", "Search Console > Queries, or your rank tracker", "Moves of 1 to 3 positions", "Drops of 10 or more positions: inspect that page for content, schema or redirect changes"),
    ("14", "Sitemap status", "Search Console > Sitemaps", "Discovered URLs close to submitted", "Large gap or fetch errors"),
    ("30", "Fill the After column on the baseline", "Before-After Baseline tab", "Clicks and impressions back near the Before level", "Still down 40% or more"),
    ("30", "Click-through rate against baseline", "Search Console > Performance > CTR", "Close to Before", "Impressions recovered but clicks did not: review the new titles"),
    ("30", "Core Web Vitals field data", "Search Console > Core Web Vitals; PageSpeed Insights field tab", "No new poor URLs", "New poor URLs after 28 days of traffic"),
    ("30", "'Crawled, currently not indexed' count", "Search Console > Pages", "Stable", "Rising on pages that used to be indexed"),
    ("60", "Pages that lost clicks", "Search Console > Performance > Pages, compared with the Before period", "Losses explained by retired pages", "Important pages down with no reason: check content and internal links"),
    ("60", "Old URLs still receiving traffic or links", "Server logs; Ahrefs or Search Console Links report", "Redirects catch them", "A linked old URL returns 404"),
    ("60", "Re-test every redirect in the URL Map", "Screaming Frog list mode", "No new gaps", "New gaps found: add the rows"),
    ("90", "Final baseline comparison", "Before-After Baseline tab", "Clicks and impressions at or above Before", "Still below Before with no content cause"),
    ("90", "Write down what you learned", "Your own notes", "Record that platform change and content changes are separate causes", "n/a"),
    ("90", "Keep the redirects live", "Your hosting or framework config", "Redirects stay in place", "n/a"),
]
for i, (d, c, w, n, e) in enumerate(W, 2):
    put(ws, i, [d, c, w, n, e, None, "no"])
    ws.cell(row=i, column=6).fill = INPUT
    ws.cell(row=i, column=7).fill = INPUT
yesno(ws, f"G2:G{len(W) + 1}")
widths(ws, [16, 40, 44, 42, 52, 26, 14])
ws.freeze_panes = "A2"

os.makedirs(os.path.dirname(OUT), exist_ok=True)
wb.save(OUT)
print("saved", os.path.normpath(OUT))
