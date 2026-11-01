"""Builds public/downloads/diy-seo-workbook.xlsx. Run: python scripts/build-diy-workbook.py"""
from pathlib import Path
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.utils import get_column_letter

OUT = Path(__file__).resolve().parent.parent / "public" / "downloads" / "diy-seo-workbook.xlsx"
SITE = "https://sunnypatel.co.uk"
ACCENT = "00E5FF"
HEAD_FILL = PatternFill("solid", fgColor=ACCENT)
HEAD_FONT = Font(bold=True, color="111111")
EX_FILL = PatternFill("solid", fgColor="F2F2F2")
EX_FONT = Font(italic=True, color="555555")
LINK_FONT = Font(color="0563C1", underline="single")
thin = Side(style="thin", color="BBBBBB")
BORDER = Border(left=thin, right=thin, top=thin, bottom=thin)
WRAP = Alignment(wrap_text=True, vertical="top")

STATUS = ["Not started", "In progress", "Done", "Blocked"]
LOG_STATUS = ["Done", "Draft awaiting approval", "Live", "Not done", "Carried forward"]

# ---------- sessions (shared with the blog post) ----------
# (minutes, step, exact clicks, free tool label, tool path, done-check)
S1 = ("Session 1: Search Console triage", [
    (5, "Set up the comparison view",
     "Open search.google.com/search-console and pick your property. Click Performance, then Search results. Click the Date filter, choose Last 3 months, click the Compare tab, choose Compare last 3 months to the previous period, click Apply.",
     "", "", "The Date line shows two date ranges and the chart draws two lines."),
    (10, "Find the pages losing clicks",
     "Click the Pages tab under the chart. Make sure the Clicks box above the chart is switched on. In the table, click the Clicks Difference column heading until the biggest losses sit at the top. Copy the top 10 URLs and their click change.",
     "", "", "You have a list of up to 10 pages with their click change."),
    (10, "See which queries caused the loss on your top 3",
     "Click the first losing page, which adds it as a filter. Click the Queries tab and sort by Clicks Difference. If impressions fell, demand or ranking dropped. If only clicks fell, the snippet is weak. Remove the filter and repeat for pages 2 and 3.",
     "", "", "Each of the 3 pages has a one-line cause: lost ranking, lost demand, or weak snippet."),
    (5, "Rule out a seasonal dip",
     "Click Date, Custom, then set the same 3 months last year, tick Compare, add this year's dates and click Apply. If last year dipped the same way, mark the page 'seasonal' and leave it.",
     "", "", "Each page is marked 'real drop' or 'seasonal'."),
    (10, "Export queries for the striking-distance list",
     "Remove the compare setting. Click the Queries tab, then Export top right, then Google Sheets. In the new sheet click Data, Create a filter.",
     "gsc-export-coverage: check that your export holds all the rows", "/tools/gsc-export-coverage/",
     "A Google Sheet of your queries is open with filter arrows on the header row."),
    (10, "Filter to positions 5 to 15",
     "Filter the Position column to Is between 5 and 15, and Impressions to at least 30. Sort Impressions Z to A. Copy the top 5 queries to the Page and Query Map tab.",
     "", "", "5 queries sit in the Query group column of the Page and Query Map tab."),
    (5, "Name the owner page for each query",
     "In Search Console click a query row, then the Pages tab. If 2 or more of your pages show, put the weaker URL in Other pages that also rank and the flag turns to CHECK.",
     "keyword-cannibalisation-checker: finds queries with 2 competing pages from a GSC CSV", "/tools/keyword-cannibalisation-checker/",
     "Every one of the 5 queries has exactly one owner page, or a flag."),
    (5, "Pick next session's page and log it",
     "Choose the page with the most impressions and the clearest fix. Update the Scoreboard clicks and impressions and add a Work Log row.",
     "", "", "Scoreboard updated, Work Log row added, one page chosen for Session 2."),
])

S2 = ("Session 2: Fix one page", [
    (5, "Open the page and copy its real queries",
     "In Search Console click Performance, Pages tab, your chosen page, then the Queries tab. Copy the top 5 queries and the average position.",
     "", "", "You can name the one main query this page should win."),
    (10, "Rewrite the title",
     "Put the main query near the front, keep it under about 60 characters and say what the reader gets. Paste old and new into the checker.",
     "title-checker: character and pixel length", "/tools/title-checker/",
     "New title is under 60 characters, has the main query, and differs from the old one."),
    (10, "Rewrite the meta description",
     "Write about 150 characters: who it is for, what they get and the next step. Preview it next to the title.",
     "serp-preview: see the result as Google shows it", "/tools/serp-preview/",
     "Preview shows no cut-off text on desktop or mobile."),
    (15, "Write the opening answer",
     "Under the main heading write 40 to 60 words that answer the main query directly, with no link in that paragraph. Move any long intro below it.",
     "", "", "A stranger reading only the first paragraph gets the answer."),
    (10, "Add one internal link",
     "Paste the text of the page you are fixing and a strong related page into the tool. Pick one natural anchor and add a single link from the strong page. One link, not ten.",
     "internal-links: finds natural anchor text between two pages", "/tools/internal-links/",
     "The link is live, the anchor describes the target, and no other page now competes for the same query."),
    (5, "Publish and ask Google to recrawl",
     "Save the change. In Search Console click the search bar at the top, paste the page URL, press Enter, then click Request indexing. If the URL changed, confirm a single 301.",
     "redirect-checker: only if a URL changed", "/tools/redirect-checker/",
     "Inspection says URL is on Google, and you clicked Request indexing."),
    (5, "Log it with a before and after",
     "Add a Work Log row with page, old title, new title and date live. Add an Action Plan row due in 28 days: 're-check clicks and position'.",
     "", "", "Work Log row and 28-day check are both written down."),
])

S3 = ("Session 3: Facts and listings check", [
    (10, "Write down the one true set of facts",
     "Open the Facts to Confirm tab and fill the True value column: name, address, phone, email, hours, bank holiday hours and main prices.",
     "", "", "Every row in the True value column is filled."),
    (10, "Check your Google Business Profile against it",
     "Search Google for your business name while signed in as the owner. Click Edit profile, then Business information. Compare each fact, fix differences and click Save. Do not add keywords to the business name.",
     "", "", "GBP column on Facts to Confirm shows Yes or No for every row, and the No rows are fixed."),
    (10, "Check your own website",
     "Check the header, footer and contact page on desktop and mobile, then run your home page through the audit. Fix any difference.",
     "local-seo-audit: checks a business page for local signals", "/tools/local-seo-audit/",
     "Website column on Facts to Confirm is filled."),
    (10, "Check 5 directories",
     "Search your business name plus postcode. Open Bing Places, Apple Business Connect, Facebook, Yell and your main trade directory. Record match or mismatch and correct each mismatch.",
     "", "", "Five directory columns filled and mismatches corrected or logged as Blocked."),
    (10, "Reply to reviews and ask for one",
     "Search your business name, click the review count, then Reply under each unanswered review. Thank them and mention one detail. Then send your review link to one recent customer.",
     "review-link: builds your direct review link", "/tools/review-link/",
     "Every review has a reply and one review request is sent."),
    (5, "Read the profile numbers",
     "On your Business Profile click Performance. Note calls, direction requests and website clicks for the last 28 days. Put the totals into the enquiries row on the Scoreboard.",
     "", "", "Scoreboard enquiries row has this month's figure and the date checked."),
    (5, "Log it",
     "Add a Work Log row for each fix, and state 'live-site changes this month: none' if you changed nothing on the website.",
     "", "", "Work Log is up to date for the week."),
])

SESSIONS = [S1, S2, S3]


def title_row(ws, text, ncols, height=70):
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=ncols)
    c = ws.cell(row=1, column=1, value=text)
    c.alignment = WRAP
    c.font = Font(size=11)
    ws.row_dimensions[1].height = height


def header(ws, row, names):
    for i, n in enumerate(names, 1):
        c = ws.cell(row=row, column=i, value=n)
        c.fill, c.font, c.border = HEAD_FILL, HEAD_FONT, BORDER
        c.alignment = Alignment(wrap_text=True, vertical="center")
    ws.row_dimensions[row].height = 32


def widths(ws, ws_widths):
    for i, w in enumerate(ws_widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w


def body(ws, r0, r1, ncols, example_rows=()):
    for r in range(r0, r1 + 1):
        for c in range(1, ncols + 1):
            cell = ws.cell(row=r, column=c)
            cell.border, cell.alignment = BORDER, WRAP
            if r in example_rows:
                cell.fill, cell.font = EX_FILL, EX_FONT


def dropdown(ws, values, rng):
    dv = DataValidation(type="list", formula1='"' + ",".join(values) + '"', allow_blank=True)
    dv.error, dv.errorTitle, dv.showErrorMessage = "Pick a value from the list.", "Not in list", True
    ws.add_data_validation(dv)
    dv.add(rng)


def link(cell, url, text=None):
    cell.value = text or url
    cell.hyperlink = url
    cell.font = LINK_FONT


wb = Workbook()

# ---------- 1 Start Here ----------
ws = wb.active
ws.title = "Start Here"
widths(ws, [28, 100])
title_row(ws, "DIY SEO Workbook. This is the sheet I use with clients, rewritten for a business owner running their own site. It is free to copy and use. Nothing in it needs a paid tool: Google Search Console, Google Business Profile and GA4 are free.", 2, 55)
rows = [
    ("What it is", "Nine tabs that turn SEO into three one-hour sessions a week. You pull numbers from Search Console and Business Profile, write down what you changed, and check a month later whether it worked."),
    ("Before you start", "Download this file, then in Google Sheets click File, Import, Upload to use it online, or keep it in Excel. Verify your site in Search Console (search.google.com/search-console) and connect GA4 if you have not."),
    ("The weekly rhythm", "Session 1 Search Console triage (60 min). Session 2 Fix one page (60 min). Session 3 Facts and listings check (60 min). Steps, minutes and exact clicks are on the Weekly Sessions tab."),
    ("The monthly extras", "First week of the month: fill the Scoreboard (10 min) and run the AI Search Panel (15 min). Add both to Session 3 that week."),
    ("Colour code", "Cyan rows are headers. Grey italic rows marked EXAMPLE show a fictional bakery. Delete them when you add your own."),
    ("How to read a number", "Search Console shows clicks and impressions for your site on Google. A change under a few clicks a week is noise. Write the date and the window beside every number so you can trust it later."),
    ("Free tools", "Short links to the free tools used in the sessions: " + SITE + "/tools/"),
    ("Next step", "Using it yourself is the whole product. If you would rather hand it over: I fill this in for your site as a £495 technical SEO audit, or I review your sheet every month as £600/month advisory. Free 20-minute diagnosis first if you are unsure."),
]
for i, (a, b) in enumerate(rows, 3):
    ws.cell(row=i, column=1, value=a).font = Font(bold=True)
    ws.cell(row=i, column=2, value=b)
    for c in (1, 2):
        ws.cell(row=i, column=c).alignment = WRAP
        ws.cell(row=i, column=c).border = BORDER
    ws.cell(row=i, column=1).fill = HEAD_FILL
    ws.cell(row=i, column=1).font = HEAD_FONT
r = 3 + len(rows) + 1
link(ws.cell(row=r, column=1), SITE + "/book/", "Book the free diagnosis")
link(ws.cell(row=r + 1, column=1), SITE + "/services/technical-seo-audit/", "£495 technical SEO audit")
link(ws.cell(row=r + 2, column=1), SITE + "/services/seo-consulting/", "£600/month advisory")
link(ws.cell(row=r + 3, column=1), SITE + "/tools/", "Free SEO tools")
ws.freeze_panes = "A3"
start_rows = r + 3

# ---------- 2 Scoreboard ----------
ws = wb.create_sheet("Scoreboard")
cols = ["Metric", "Where the number comes from", "Exactly where to click", "Baseline", "Target (3 months)",
        "Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6", "Last checked", "Note"]
title_row(ws, "The scoreboard shows whether the work is paying off. Write the baseline once, set a target, then enter one figure per month from the same source and the same date window. Always date the last check. If enquiries are not being counted anywhere, fixing that is your priority 1.", len(cols), 55)
header(ws, 2, cols)
data = [
    ("Clicks from Google (28 days)", "Search Console", "Performance, Search results, Date: Last 28 days, read Total clicks", "", "", "Compare each month with the same 28-day window."),
    ("Impressions (28 days)", "Search Console", "Same page, read Total impressions", "", "", "Impressions rise before clicks do."),
    ("Qualified enquiries (month)", "Your own log: form, phone, email", "Count genuine leads only. Also read Business Profile, Performance, Calls", "", "", "No tracking yet? Add a form notification and a call log first."),
    ("AI referral sessions (month)", "GA4", "Reports, Acquisition, Traffic acquisition, set dimension to Session source, search for chatgpt, perplexity, gemini, copilot", "", "", "Under 30 sessions is not enough data to show a percentage change."),
]
for i, d in enumerate(data, 3):
    for j, v in enumerate(d[:3], 1):
        ws.cell(row=i, column=j, value=v)
    ws.cell(row=i, column=13, value=d[5])
body(ws, 3, 6, len(cols))
for rr in range(3, 7):
    ws.cell(row=rr, column=12).number_format = "dd mmm yyyy"
widths(ws, [28, 24, 44, 11, 14, 10, 10, 10, 10, 10, 10, 14, 42])
ws.freeze_panes = "B3"

# ---------- 3 Action Plan ----------
ws = wb.create_sheet("Action Plan")
cols = ["ID", "Action", "Owner", "Due date", "How I check it is done", "Status", "Evidence link"]
title_row(ws, "Every action gets a number, one owner, a due date and a way to prove it is done. Keep the top ten in this list and move the rest to the bottom. The grey EXAMPLE rows use a fictional bakery called Crumb and Co: delete them and write your own.", len(cols), 55)
header(ws, 2, cols)
ex = [
    ("EXAMPLE A1", "Rewrite the title on /sourdough-classes/ to lead with 'sourdough classes Reading'", "Owner (me)", "2026-11-14", "Search Console shows the new title in the URL Inspection live test, and clicks are checked 28 days later", "Done", "https://example.com/evidence/a1 (fictional)"),
    ("EXAMPLE A2", "Add one internal link from /about/ to /sourdough-classes/", "Owner (me)", "2026-11-14", "Link visible on the page and the anchor describes the class", "In progress", "https://example.com/evidence/a2 (fictional)"),
    ("EXAMPLE A3", "Fix opening hours on the Business Profile (Sunday closes 2pm, not 4pm)", "Owner (me)", "2026-11-07", "Profile and website show the same hours", "Done", "https://example.com/evidence/a3 (fictional)"),
    ("EXAMPLE A4", "Reply to the 3 unanswered Google reviews", "Owner (me)", "2026-11-10", "Review list shows an owner reply under each", "Not started", "https://example.com/evidence/a4 (fictional)"),
    ("EXAMPLE A5", "Redirect /classes-old/ to /sourdough-classes/ with one 301", "Web helper", "2026-11-21", "Redirect checker shows one 301, final status 200", "Blocked", "https://example.com/evidence/a5 (fictional)"),
]
for i, row in enumerate(ex, 3):
    for j, v in enumerate(row, 1):
        ws.cell(row=i, column=j, value=v)
body(ws, 3, 32, len(cols), example_rows=range(3, 8))
widths(ws, [14, 52, 16, 13, 52, 14, 38])
dropdown(ws, STATUS, "F3:F32")
ws.freeze_panes = "A3"
for rr in range(3, 33):
    ws.cell(row=rr, column=4).number_format = "yyyy-mm-dd"

# ---------- 4 Page and Query Map ----------
ws = wb.create_sheet("Page and Query Map")
cols = ["Query group", "Example queries", "Owner page (one URL)", "Impressions (3 months)", "Other pages that also rank", "Cannibalisation flag", "Next move"]
title_row(ws, "Give every group of related searches exactly one owner page. If a second page of yours also ranks for the group, the flag turns to CHECK: pick the stronger page, then merge, redirect or re-aim the other. Fill the first three columns from the Page and Query tab data in Search Console.", len(cols), 55)
header(ws, 2, cols)
exm = [
    ("EXAMPLE sourdough classes", "sourdough class reading; learn sourdough baking", "/sourdough-classes/", 420, "", ""),
    ("EXAMPLE wedding cakes", "wedding cake reading; bespoke wedding cakes", "/wedding-cakes/", 310, "/blog/cake-ideas/", ""),
    ("EXAMPLE gluten free bread", "gluten free bakery near me", "/gluten-free/", 95, "", ""),
]
for i, row in enumerate(exm, 3):
    for j, v in enumerate(row, 1):
        ws.cell(row=i, column=j, value=v)
nxt = {3: "Fix title and opening answer (Session 2)", 4: "Re-aim /blog/cake-ideas/ at inspiration queries, link to owner", 5: "Leave alone until impressions pass 100"}
for rr in range(3, 33):
    ws.cell(row=rr, column=6, value=f'=IF(C{rr}="","",IF(E{rr}="","OK","CHECK: pick one owner"))')
    if rr in nxt:
        ws.cell(row=rr, column=7, value=nxt[rr])
body(ws, 3, 32, len(cols), example_rows=range(3, 6))
widths(ws, [26, 44, 30, 14, 34, 22, 44])
ws.freeze_panes = "A3"

# ---------- 5 Technical Issues ----------
ws = wb.create_sheet("Technical Issues")
cols = ["ID", "Check", "How to check it", "Free tool", "Pages affected", "Severity", "Fix", "Status", "Date fixed"]
title_row(ws, "A short list of technical problems that block pages from being found or trusted. Work top to bottom once, then re-run once a quarter. Severity: High stops pages appearing, Medium wastes ranking signals, Low is tidy-up. Log each fix on the Work Log.", len(cols), 55)
header(ws, 2, cols)
tech = [
    ("T1", "Pages not indexed", "Search Console, Pages (left menu), read 'Why pages aren't indexed' and click each reason", "", "High"),
    ("T2", "Sitemap submitted and error-free", "Search Console, Sitemaps, add sitemap.xml, check Status says Success", "", "High"),
    ("T3", "robots.txt not blocking pages", "Open yoursite.com/robots.txt and look for a 'Disallow: /' line", "", "High"),
    ("T4", "Redirect chains and 302s", "Run old URLs through the checker; there should be one 301 to a 200 page", "Redirect checker: " + SITE + "/tools/redirect-checker/", "Medium"),
    ("T5", "Broken internal links (404)", "Scan your top pages for dead links and fix or remove them", "Broken link checker: " + SITE + "/tools/broken-links/", "Medium"),
    ("T6", "Duplicate or missing titles", "Paste your page titles in and look for repeats, blanks and over-long ones", "Title checker: " + SITE + "/tools/title-checker/", "Medium"),
    ("T7", "Site speed on mobile", "Test the home page and one service page; note the slowest element", "Speed checker: " + SITE + "/tools/speed-checker/", "Medium"),
    ("T8", "HTTPS works, one version only", "Type http:// and www versions; each should land on one https address", "SSL checker: " + SITE + "/tools/ssl-checker/", "High"),
    ("T9", "Mobile usability", "Open the site on your phone; tap every button; check text needs no zooming", "", "Medium"),
    ("T10", "Schema matches the page", "Test the page and check the details inside match the visible text", "Schema validator: " + SITE + "/tools/schema-validator/", "Low"),
]
for i, t in enumerate(tech, 3):
    for j, v in zip((1, 2, 3, 4, 6), t):
        ws.cell(row=i, column=j, value=v)
    ws.cell(row=i, column=8, value="Not started")
body(ws, 3, 32, len(cols))
widths(ws, [8, 32, 56, 44, 22, 11, 40, 14, 13])
dropdown(ws, STATUS, "H3:H32")
dropdown(ws, ["High", "Medium", "Low"], "F3:F32")
ws.freeze_panes = "A3"

# ---------- 6 AI Search Panel ----------
ws = wb.create_sheet("AI Search Panel")
months = [f"Month {i}" for i in range(1, 7)]
cols = ["#", "Buyer prompt (keep fixed)"] + months + ["Notes"]
title_row(ws, "A fixed list of 10 questions a buyer would ask an AI assistant. Ask the same 10 each month in a logged-out browser window, one engine you pick and keep. Score 0 = not mentioned, 1 = named but not recommended, 2 = listed among the options, 3 = recommended first or cited with a link to you. Fewer than 30 checks in total is not enough data: do not quote a percentage change.", len(cols), 75)
header(ws, 2, cols)
prompts = [
    "Best [your service] in [your town]?",
    "Who should I hire for [your service] near [your town]?",
    "How much does [your service] cost in [your town]?",
    "[Your service] near me, who is reliable?",
    "What should I check before choosing a [your trade] in [your town]?",
    "Is [your business name] any good?",
    "[Your business name] vs [main local competitor]?",
    "Cheapest [your service] in [your town] that is still good?",
    "Which [your trade] in [your town] has the best reviews?",
    "Who offers [your most specific product or service] in [your county]?",
]
for i, p in enumerate(prompts, 3):
    ws.cell(row=i, column=1, value=i - 2)
    ws.cell(row=i, column=2, value=p)
body(ws, 3, 12, len(cols))
ws.cell(row=14, column=2, value="Checks logged so far").font = Font(bold=True)
ws.cell(row=14, column=3, value="=COUNT(C3:H12)")
ws.cell(row=15, column=2, value="Total score (out of 30 per month)").font = Font(bold=True)
for k, colL in enumerate("CDEFGH"):
    ws.cell(row=15, column=3 + k, value=f'=IF(COUNT({colL}3:{colL}12)=0,"",SUM({colL}3:{colL}12))')
ws.cell(row=16, column=2, value="Can I trust the trend?").font = Font(bold=True)
ws.cell(row=16, column=3, value='=IF(C14<30,"Not enough data: "&C14&" of 30 checks","30 checks reached: compare months, keep it modest")')
dv = DataValidation(type="whole", operator="between", formula1="0", formula2="3", allow_blank=True)
dv.error, dv.showErrorMessage = "Score must be 0, 1, 2 or 3.", True
ws.add_data_validation(dv)
dv.add("C3:H12")
widths(ws, [5, 60, 10, 10, 10, 10, 10, 10, 40])
ws.freeze_panes = "C3"

# ---------- 7 Facts to Confirm ----------
ws = wb.create_sheet("Facts to Confirm")
cols = ["Fact", "True value (write it once)", "Website matches?", "Google Business Profile matches?", "Directory 1", "Directory 2", "Directory 3", "Directory 4", "Directory 5", "Date checked", "Fix needed"]
title_row(ws, "One true set of facts, then a check that every place that shows them agrees. Name your five directories in the header cells (for example Bing Places, Apple Business Connect, Facebook, Yell, a trade directory). Do not put a fact in schema, About copy or a directory until it is confirmed here.", len(cols), 65)
header(ws, 2, cols)
facts = ["Business name (exact wording)", "Address (as you want it written)", "Phone number", "Email address", "Opening hours (normal week)", "Bank holiday and seasonal hours",
         "Main price or price-from", "Service area", "Website address", "Main category / what you do", "Year started (only if provable)"]
for i, f in enumerate(facts, 3):
    ws.cell(row=i, column=1, value=f)
body(ws, 3, 22, len(cols))
yn = ["Yes", "No", "Not checked", "Not listed"]
dropdown(ws, yn, "C3:I22")
for rr in range(3, 23):
    ws.cell(row=rr, column=10).number_format = "yyyy-mm-dd"
widths(ws, [34, 40, 16, 20, 14, 14, 14, 14, 14, 14, 36])
ws.freeze_panes = "B3"

# ---------- 8 Work Log ----------
ws = wb.create_sheet("Work Log")
cols = ["Month", "Date", "Item", "Type", "What it produced", "Evidence", "Status"]
types = ["Page fix", "New page", "Technical fix", "Listing fix", "Review reply", "Measurement", "Other"]
title_row(ws, "A month-by-month record of every piece of work you did, so you can match changes to results later. Every month needs a line stating the live-site changes made, even if there were none. Anything planned but not done goes in with the status Not done or Carried forward.", len(cols), 55)
header(ws, 2, cols)
lg = [
    ("EXAMPLE 2026-11", "2026-11-03", "Search Console triage: found 4 pages losing clicks", "Measurement", "List of 4 pages, 2 real drops, 2 seasonal", "Action Plan A1 to A5 (fictional)", "Done"),
    ("EXAMPLE 2026-11", "2026-11-10", "Rewrote title and opening paragraph on /sourdough-classes/", "Page fix", "Title 58 characters, opening answer 46 words", "https://example.com/evidence/a1 (fictional)", "Live"),
    ("EXAMPLE 2026-11", "2026-11-17", "Corrected Sunday hours on the Business Profile", "Listing fix", "Hours now match the website", "https://example.com/evidence/a3 (fictional)", "Done"),
    ("EXAMPLE 2026-11", "2026-11-24", "Redirect from /classes-old/", "Technical fix", "Not built: waiting on the web helper", "", "Carried forward"),
    ("EXAMPLE 2026-11", "2026-11-30", "Live-site changes this month: none", "Other", "Nothing else changed on the live site beyond the rows above. Replace with your own line each month.", "", "Done"),
]
for i, row in enumerate(lg, 3):
    for j, v in enumerate(row, 1):
        ws.cell(row=i, column=j, value=v)
body(ws, 3, 52, len(cols), example_rows=range(3, 8))
widths(ws, [20, 13, 54, 16, 48, 40, 22])
dropdown(ws, LOG_STATUS, "G3:G52")
dropdown(ws, types, "D3:D52")
ws.freeze_panes = "A3"

# ---------- 9 Weekly Sessions ----------
ws = wb.create_sheet("Weekly Sessions")
cols = ["Session", "Step", "Minutes", "Exact clicks", "Free tool", "Done-check", "Done this week?"]
title_row(ws, "Three one-hour sessions: do one a day on three days of the week. Work in order; each step has a done-check so you know when to move on. Tick the last column, then reset it to Not yet next week. Google moves menu items sometimes: if a label has changed, look for the nearest match.", len(cols), 60)
header(ws, 2, cols)
r = 3
for name, steps in SESSIONS:
    first = r
    for mins, step, clicks, tool, path, done in steps:
        ws.cell(row=r, column=1, value=name)
        ws.cell(row=r, column=2, value=step)
        ws.cell(row=r, column=3, value=mins)
        ws.cell(row=r, column=4, value=clicks)
        if path:
            link(ws.cell(row=r, column=5), SITE + path, tool)
        ws.cell(row=r, column=6, value=done)
        ws.cell(row=r, column=7, value="Not yet")
        r += 1
    body(ws, first, r - 1, len(cols))
    for rr in range(first, r):
        if ws.cell(row=rr, column=5).hyperlink:
            ws.cell(row=rr, column=5).font = LINK_FONT
    ws.cell(row=r, column=2, value="Session total (minutes)").font = Font(bold=True)
    ws.cell(row=r, column=3, value=f"=SUM(C{first}:C{r - 1})").font = Font(bold=True)
    r += 2
dropdown(ws, ["Not yet", "Done"], f"G3:G{r}")
widths(ws, [30, 34, 9, 70, 40, 44, 16])
ws.freeze_panes = "A3"

OUT.parent.mkdir(parents=True, exist_ok=True)
wb.save(OUT)
print("saved", OUT)
