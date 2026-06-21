# Lemlist Citation Campaign — Jun 2026
# sunnypatel.co.uk / sunnypatelseo.com cold outreach

**Send from:** sunny@sunnypatelseo.com
**Reply-to:** sunny@sunnypatel.co.uk
**Status:** DRAFT — do not send until go/no-go confirmed (see checklist below)
**Created:** 2026-06-21
**Hermes operator note:** This file is the canonical source for the Lemlist sequences.
When sunnypatelseo.com is confirmed warm, wire Campaign A into Lemlist via the API
key in reference_lemlist_api_credentials.md (local Drive vault, team London Web Design).
Campaign B can be wired at the same time or as a separate Lemlist campaign.

---

## Go / No-Go Checklist

Complete every item before loading a single contact into Lemlist.
Tick each off in person -- do not delegate.

### 1. Warmup health (HOLD if any item fails)

- [ ] Lemwarm dashboard shows warmup score of 80 or higher
- [ ] No spam placement flagged in Lemwarm inbox tests (check the "Reports" tab)
- [ ] Mailshake warmup tool shows inbox placement at 90%+ for primary folder
- [ ] **Minimum 3 weeks from warmup start (Jun 14) before first cold send.**
      Today is Jun 21 -- that puts earliest safe send date at approximately Jul 7.
      Do not rush this. One spam flag on a new domain kills deliverability for months.

### 2. Domain authentication (verify at mail-tester.com -- target score 10/10)

- [ ] SPF record on sunnypatelseo.com: `v=spf1 include:_spf.hostinger.com ~all`
      (confirm exact include value in Hostinger email help docs -- varies by plan)
- [ ] DKIM: TXT or CNAME record from Hostinger DNS settings is live and propagated
      (test at mxtoolbox.com/dkim -- enter selector "default" or check Hostinger panel)
- [ ] DMARC: `v=DMARC1; p=quarantine; rua=mailto:2012.infinite@gmail.com; pct=100`
      (start p=quarantine not p=reject until you have 2 weeks of clean reports)
- [ ] MX records: pointing to Hostinger mail servers and resolving cleanly
- [ ] Send a test to mail-tester.com and screenshot the result -- keep it on file

### 3. Mailbox and Lemlist setup

- [ ] sunny@sunnypatelseo.com is connected as the sending mailbox in Lemlist
      (not sunnypatel.co.uk -- that domain should stay clean for transactional mail)
- [ ] From name set to "Sunny Patel" (not "Sunny" alone -- builds brand recall)
- [ ] Daily send cap: 30 emails/day maximum for the first four weeks post-warmup,
      increasing to 50/day by week six only if no deliverability flags appear
- [ ] Sending schedule: Mon-Thu, 08:00-16:00 UK time. Avoid Fridays.

### 4. Compliance (B2B legitimate interest basis -- document before sending)

- [ ] Unsubscribe link: Lemlist native {{unsubscribe}} variable in every step
      (place it at the very bottom, plain text: "Don't want these? Unsubscribe.")
- [ ] Physical address in email footer: Reading, Berkshire, UK
      (required under UK PECR for commercial email)
- [ ] Suppression list: load all contacts from cold-email-campaign.md (the agency
      partnership list) into Lemlist suppression before importing new contacts
- [ ] Suppression list: load any existing Trafft leads and contact form submissions
- [ ] No personal Gmail or hotmail addresses in the target list --
      B2B legitimate interest does not cover personal inboxes

---

## Campaign A: Citation and Link Asks

### Purpose

Get sunnypatel.co.uk cited in UK SEO/marketing publications that publish
"best local SEO agencies", "best GEO agencies", or similar roundup content.
The two anchor assets are:

- https://sunnypatel.co.uk/blog/best-local-seo-agencies/ (Sunny listed #1, ItemList + FAQ schema)
- https://sunnypatel.co.uk/blog/top-geo-agencies/ (GEO sibling to the AEO flagship)

The ask is simple: they write about agency lists, so does Sunny -- either
cite the post as a resource, link to it from an existing roundup, or mention
it in a future update. No reciprocal link implied or offered.

### Lemlist variables used in Campaign A

| Variable | What to populate |
|---|---|
| {{first}} | Contact first name |
| {{company}} | Publication or domain name |
| {{their_article_title}} | Exact title of their relevant roundup article |
| {{their_article_url}} | URL of their article (for your reference -- not included in email body) |
| {{asset_title}} | Sunny's article title to pitch (see per-target column below) |
| {{asset_url}} | Sunny's article URL to pitch |
| {{specific_hook}} | One sentence personalised to that contact's article -- see target list |

---

### Target List A: UK SEO and Marketing Publishers

Verify every email address before importing. Formats given are patterns -- confirm via
the publication's contact page, LinkedIn, or Hunter.io. Mark unverifiable contacts as
"needs manual verify" and do not import until confirmed.

---

#### A1 -- BrightLocal Blog
- **Contact:** Joy Hawkins or Claire Carlile (regular contributors / editors)
  Find current blog editor at: brightlocal.com/about (staff page) or LinkedIn search "BrightLocal editor"
- **Email pattern:** firstname@brightlocal.com (verify)
- **Their relevant content:** BrightLocal publishes local SEO roundups, agency lists, and local SEO statistics
- **Asset to pitch:** /blog/best-local-seo-agencies/
- **Hook:** BrightLocal's local SEO agency roundups are the benchmark in the space -- reference their
  most recent "best local SEO agencies" post by name and note that Sunny's post uses a methodology
  that cross-references GSC data across a live 44-site portfolio, which their readers might find useful
  as a complementary data source.

---

#### A2 -- Whitespark Blog
- **Contact:** Darren Shaw (founder) or blog editor
  LinkedIn: linkedin.com/in/darrenshaw / Email pattern: darren@whitespark.ca (verify)
- **Their relevant content:** Whitespark publishes the annual Local Search Ranking Factors survey
  and agency resource lists
- **Asset to pitch:** /blog/best-local-seo-agencies/
- **Hook:** Reference the Local Search Ranking Factors survey specifically -- note that Sunny's
  local SEO agency post cites the survey and links back to Whitespark, and ask if there is a
  resource page or roundup post where it would fit.

---

#### A3 -- Search Engine Land (UK contributors)
- **Contact:** Danny Goodwin (editor) or search for the byline on their most recent agency roundup
  Email pattern: dgoodwin@searchengineland.com (verify -- SEL uses various formats)
- **Their relevant content:** SEL publishes "best SEO agencies" and "best local SEO" listicles
- **Asset to pitch:** /blog/best-local-seo-agencies/ or /blog/top-geo-agencies/ depending on their article
- **Hook:** Reference the specific SEL article that covers agency lists and note that Sunny's post
  includes a methodology section (GSC-verified, live portfolio data) that they don't typically see
  in UK-specific agency roundups.

---

#### A4 -- Search Engine Journal
- **Contact:** Loren Baker (founder) or the editor who wrote the most recent agency roundup
  Email pattern: lbaker@searchenginejournal.com (verify)
- **Their relevant content:** SEJ publishes "best SEO agencies" and GEO/AEO content
- **Asset to pitch:** /blog/top-geo-agencies/ (strong GEO angle fits SEJ's AI search coverage)
- **Hook:** Reference their GEO or AI Overviews coverage specifically. Note that Sunny's GEO
  agencies post is one of the few UK-specific resources with schema (SpeakableSpecification)
  and cites data from the live portfolio.

---

#### A5 -- The Drum
- **Contact:** Agency editor or digital marketing reporter
  Find current agency desk contact at: thedrum.com/about (or LinkedIn search "The Drum editor agencies")
  Email pattern: firstname.lastname@thedrum.com (verify)
- **Their relevant content:** The Drum regularly publishes "best agencies" rankings and roundups
- **Asset to pitch:** /blog/best-local-seo-agencies/
- **Hook:** The Drum's audience is agency-side and marketing professionals. Reference their most
  recent agency ranking or roundup by name, note it focuses on large agencies, and position
  Sunny's post as the independent consultant's take on which agencies are worth knowing about.

---

#### A6 -- Econsultancy
- **Contact:** Senior editor or content editor
  Email pattern: firstname.lastname@econsultancy.com (verify via econsultancy.com/about)
- **Their relevant content:** Econsultancy publishes digital agency guides and SEO resources
- **Asset to pitch:** /blog/best-local-seo-agencies/
- **Hook:** Econsultancy's subscribers are in-house marketing teams looking for agency partners.
  Reference their most recent agency evaluation guide or local SEO guide and suggest Sunny's
  post as a complementary resource for subscribers evaluating local SEO agencies.

---

#### A7 -- Prolific North
- **Contact:** Editorial team (UK digital / north-focused but covers national agency news)
  Email: editorial@prolificnorth.co.uk (check site for current address)
- **Their relevant content:** Prolific North covers UK digital agencies and marketing news
- **Asset to pitch:** /blog/best-local-seo-agencies/
- **Hook:** Prolific North readers are agency owners and marketers in the UK. Reference their
  most recent agency roundup or top agencies feature and flag that Sunny's list includes a
  handful of UK agencies they haven't covered.

---

#### A8 -- Detailed.com (Glen Allsopp)
- **Contact:** Glen Allsopp
  Email: glen@detailed.com (verify -- he is publicly contactable)
- **Their relevant content:** Glen writes deep-dive SEO content and maintains resource lists
- **Asset to pitch:** /blog/top-geo-agencies/ (fits his research-heavy style)
- **Hook:** Glen's work is data-first and methodology-heavy. Reference a specific Detailed.com
  post by name. Note that Sunny's GEO agencies post follows a similar approach --
  GSC-verified data, live portfolio testing -- and ask if he'd consider it for any future
  GEO or AI search roundup he is working on.

---

#### A9 -- Ahrefs Blog
- **Contact:** Si Quan Ong or the blog editor handling agency/tool roundups
  Email pattern: firstname@ahrefs.com (verify)
- **Their relevant content:** Ahrefs publishes "best SEO agencies" and "SEO tools" roundups
  that consistently rank well
- **Asset to pitch:** /blog/best-local-seo-agencies/
- **Hook:** Ahrefs blog posts rank for years. Reference the specific Ahrefs roundup post
  that covers local SEO agencies. Note that Sunny's post is the only one with a
  GSC-verified methodology and a live portfolio data source -- makes a useful addition
  to their "further reading" or "external resources" section.

---

#### A10 -- Semrush Blog (UK contributors)
- **Contact:** Blog editor or content partnerships team
  Email: blog@semrush.com or find contributor editor via Semrush.com/about (verify)
- **Their relevant content:** Semrush blog publishes agency roundups and local SEO guides
- **Asset to pitch:** /blog/best-local-seo-agencies/
- **Hook:** Reference a specific Semrush blog roundup on local SEO agencies or the
  local SEO guide. Note that Sunny's post targets the same search intent but with
  a UK-specific focus and a portfolio-verified methodology that Semrush's readers
  working in UK markets might find useful.

---

#### A11 -- Marketing Week
- **Contact:** Digital / performance marketing editor
  Email pattern: firstname.lastname@marketingweek.com (verify via marketingweek.com/contact)
- **Their relevant content:** Marketing Week covers agency news, rankings, and digital marketing
- **Asset to pitch:** /blog/best-local-seo-agencies/
- **Hook:** Marketing Week readers are in-house marketing leads at mid-size UK businesses.
  Reference their most recent agency ranking or SEO coverage. Sunny's post is an independent
  view, not an agency self-promotion, which is rare in the "best agencies" space.

---

#### A12 -- Clutch.co (UK editorial team)
- **Contact:** UK content manager or editorial team
  Email: content@clutch.co or find UK editor on LinkedIn (verify)
- **Their relevant content:** Clutch publishes agency lists and industry rankings
- **Asset to pitch:** /blog/best-local-seo-agencies/
- **Hook:** Clutch ranks agencies by reviews and verified data. Sunny's post uses a
  different methodology (GSC portfolio data). Reference Clutch's local SEO agency list
  and note that the two approaches complement each other -- suggest a mention or link
  in their related resources.

---

### Target List B: UK Trade Directories and Associations (Vertical Pitches)

These targets are relevant to the plumber and roofer service pages.
The pitch is different: not a citation ask, but an introduction to the
specialist service pages for their members or directory listings.

#### B1 -- Association of Plumbing and Heating Contractors (APHC)
- **Contact:** Communications manager or membership director
  Website: aphc.co.uk -- find contact via Contact page or membership team
- **Their focus:** UK plumbing and heating trade association
- **Service to pitch:** /services/seo-for-plumbers/
- **Hook:** APHC members are sole traders and small businesses who rely on local
  search to get enquiries. Reference APHC's member resources section and ask if
  they'd consider featuring Sunny's SEO for plumbers guide in their next newsletter
  or resource page.

---

#### B2 -- Chartered Institute of Plumbing and Heating Engineering (CIPHE)
- **Contact:** Marketing or communications team
  Website: ciphe.org.uk
- **Their focus:** Professional body for plumbing and heating engineers
- **Service to pitch:** /services/seo-for-plumbers/
- **Hook:** CIPHE members often struggle to compete with larger companies in local
  search. Reference their member CPD resources or newsletter and suggest the
  SEO for plumbers page as a practical resource for members who do not have a
  marketing budget for agencies.

---

#### B3 -- National Federation of Roofing Contractors (NFRC)
- **Contact:** Communications or marketing manager
  Website: nfrc.co.uk
- **Their focus:** UK roofing trade body, 700+ member companies
- **Service to pitch:** /services/seo-for-roofers/
- **Hook:** NFRC members are typically small-to-medium roofing companies competing
  for local jobs against large directories like Checkatrade. Reference NFRC's
  member benefits or digital resources section and offer the SEO for roofers page
  as a free resource for members.

---

#### B4 -- Federation of Master Builders (FMB)
- **Contact:** Digital communications team or regional manager
  Website: fmb.org.uk
- **Their focus:** UK trade association for small and medium building firms
  (covers plumbing, roofing, and all trades)
- **Service to pitch:** /services/seo-for-plumbers/ and /services/seo-for-roofers/
- **Hook:** FMB members include plumbers and roofers across the UK. Reference their
  "digital skills for builders" resources or any recent communications about
  helping members get online. Offer the two trade-specific SEO pages as
  free resources for member firms.

---

#### B5 -- Checkatrade (editorial / supplier team)
- **Contact:** Content or partnerships team
  Website: checkatrade.com -- partnerships page or LinkedIn
- **Their focus:** UK trades directory with editorial content for tradespeople
- **Service to pitch:** /services/seo-for-plumbers/ and /services/seo-for-roofers/
- **Hook:** Checkatrade already teaches tradespeople about getting reviews and
  building their profile. SEO is the next logical step. Reference their blog
  or guide content for tradespeople and suggest Sunny's pages as complementary
  resources or as a partnership for joint content.

---

#### B6 -- Gas Safe Register (communications team)
- **Contact:** Communications or marketing manager
  Website: gassaferegister.co.uk
- **Their focus:** UK official gas safety body -- all registered gas engineers
- **Service to pitch:** /services/seo-for-plumbers/ (plumbers overlap with gas)
- **Hook:** Gas Safe engineers are sole traders who need to rank locally for
  "gas engineer [town]" queries. Reference Gas Safe's consumer-facing content or
  engineer resources. Offer the plumber SEO page as a practical guide for
  registered engineers who want more local enquiries without paying lead-gen sites.

---

#### B7 -- TrustMark (digital resources team)
- **Contact:** Communications team
  Website: trustmark.org.uk
- **Their focus:** Government-endorsed quality scheme for tradespeople (all trades)
- **Service to pitch:** /services/seo-for-plumbers/ and /services/seo-for-roofers/
- **Hook:** TrustMark membership is a trust signal, but members still need to be
  found online. Reference TrustMark's member resources or guidance for tradespeople
  and suggest including an SEO guide for tradespeople as a member benefit.

---

#### B8 -- Roofing Today Magazine
- **Contact:** Editorial team
  Website: roofingtoday.co.uk
- **Their focus:** UK trade magazine for the roofing industry
- **Service to pitch:** /services/seo-for-roofers/
- **Hook:** Roofing Today readers are roofing contractors who run their own businesses.
  Reference a recent issue or article on business development for roofers. Offer
  the SEO for roofers page as a contributed resource or ask if they cover digital
  marketing topics that could link to it.

---

## Campaign A Sequences: Citation / Link Asks

Three emails per contact. Plain text, under 100 words each.
No bullet points, no bold, no formatting in the email body.
Lemlist variables in {{double_curly_braces}}.

**Sending schedule:** Mon-Thu, 08:00-16:00 UK time.
Step 1: Day 0. Step 2: Day 5. Step 3: Day 11.
Stop sequence on reply (Lemlist default).

---

### Step A1 -- Initial (Day 0)

Subject: {{their_article_title}} -- one addition worth considering

Hi {{first}},

I came across your {{their_article_title}} recently -- it's one of the cleaner takes on the topic I've seen.

I published a complementary piece at {{asset_url}} that uses a different methodology: I cross-referenced agency selection criteria against GSC data from a live 44-site portfolio, so the rankings reflect real search performance rather than just reputation.

Thought it might be worth a mention or a link if you update the piece.

Either way, good work on the article.

Sunny
sunnypatel.co.uk

Don't want these? {{unsubscribe}}

---

### Step A2 -- Follow-up (Day 5)

Subject: (same thread)

Hi {{first}},

Following up on my note from a few days ago.

One thing I should have mentioned: the post at {{asset_url}} includes a FAQ section with schema markup, which means it surfaces in AI Overviews and SGE results for queries like "best local SEO agency UK" -- so any link from {{company}} would also carry topical relevance signals for your own site on that topic.

Happy to share the underlying data if it's useful.

Sunny

Don't want these? {{unsubscribe}}

---

### Step A3 -- Final (Day 11)

Subject: (same thread)

Last note from me, {{first}}.

I won't keep nudging. If you do revisit {{their_article_title}} in the future, the piece at {{asset_url}} is there.

One thing I'll leave you with: the post benchmarks agency selection criteria against 15 years of live GSC data across 44 sites. If your readers are trying to evaluate agencies rather than just find a list of names, that angle tends to be more useful than a pure directory.

Take care.

Sunny
sunnypatel.co.uk

Don't want these? {{unsubscribe}}

---

## Campaign B Sequences: Vertical Service Pitches (Trades)

For trade associations, directories, and publications in the plumber and roofer verticals.
These are warm introductions, not hard pitches. The goal is a mention in a newsletter,
a link from a member resource page, or a referral relationship.

**Sending schedule:** Same as Campaign A. Step 1: Day 0. Step 2: Day 6. Step 3: Day 12.

---

### Step B1 -- Initial (Day 0)

Subject: Free SEO resource for {{company}} members

Hi {{first}},

I'm an SEO consultant in Reading, Berkshire. I recently published a practical guide specifically for {{trade}} businesses trying to rank locally: {{asset_url}}.

It covers the exact search queries their customers use, the technical fixes that move the needle fastest, and why directories like Checkatrade are eating their rankings. No agency pitch, no paywall.

I thought it might be useful for {{company}} members who are trying to get more enquiries without paying for leads.

Worth sharing in your next newsletter or resources section?

Sunny
sunnypatel.co.uk

Don't want these? {{unsubscribe}}

---

### Step B2 -- Follow-up (Day 6)

Subject: (same thread)

Hi {{first}},

Quick follow-up.

The guide at {{asset_url}} is getting read by {{trade}} business owners who found it through search -- so the angle resonates. The most common feedback is that they didn't know their Google Business Profile and website were competing against each other, which is causing them to lose local rankings.

If {{company}} has a digital skills programme or a member newsletter where this fits, I'd be glad to tailor a version for your audience.

Sunny

Don't want these? {{unsubscribe}}

---

### Step B3 -- Final (Day 12)

Subject: (same thread)

Last one from me, {{first}}.

If the timing isn't right, no problem. I'll leave the resource at {{asset_url}} for whenever it's useful.

One thing worth knowing for your members: the biggest reason {{trade}} businesses lose local rankings isn't their Google Business Profile -- it's that their website doesn't match the service-area keywords their customers actually search. That's what the guide addresses.

Good luck with everything at {{company}}.

Sunny
sunnypatel.co.uk

Don't want these? {{unsubscribe}}

---

## Campaign B: Lemlist Variable Reference

For each trade target, populate these variables when building the Lemlist campaign:

| Variable | Plumber targets | Roofer targets |
|---|---|---|
| {{trade}} | plumbing businesses | roofing businesses |
| {{asset_url}} | sunnypatel.co.uk/services/seo-for-plumbers/ | sunnypatel.co.uk/services/seo-for-roofers/ |
| {{first}} | Contact first name | Contact first name |
| {{company}} | Association/publication name | Association/publication name |

---

## Lemlist Setup Notes

### Campaign A structure in Lemlist

1. Create a new campaign: "Citation Outreach - Best Local SEO + GEO Agencies"
2. Import contacts from Target List A above (verify emails first)
3. Add three email steps with the delays above
4. Set auto-stop on reply
5. Enable {{unsubscribe}} Lemlist variable (Settings > Unsubscribe)
6. A/B test the subject line on Step A1 -- alternative: "Adding one resource to {{their_article_title}}"

### Campaign B structure in Lemlist

1. Create a new campaign: "Trade SEO - Plumber/Roofer Associations"
2. Import contacts from Target List B above (verify emails first)
3. Segment by trade: plumber targets and roofer targets as separate lists
   (so {{trade}} and {{asset_url}} are pre-populated correctly without manual merging)
4. Same three-step structure with B delays
5. Set auto-stop on reply

### Hermes operator wiring (when ready)

The Lemlist API key is in reference_lemlist_api_credentials.md (local Drive vault,
team London Web Design). When sunnypatelseo.com warmup is confirmed:

- POST to Lemlist /api/v2/campaigns to create each campaign
- POST to /api/v2/campaigns/{id}/leads with the target list CSV
- Confirm campaign status via /api/v2/campaigns/{id} before activating
- Do not auto-activate: keep campaigns in "paused" state and activate manually
  after reviewing the first 10 contacts in Lemlist UI

---

## Listicle Citation Asset Summary

| Asset | URL | Schema | Intent |
|---|---|---|---|
| Best Local SEO Agencies | /blog/best-local-seo-agencies/ | ItemList + FAQ | Citation from local SEO publishers |
| Top GEO Agencies | /blog/top-geo-agencies/ | ItemList + FAQ | Citation from AI/GEO search publishers |
| SEO for Plumbers | /services/seo-for-plumbers/ | ProfessionalService | Trade association resources |
| SEO for Roofers | /services/seo-for-roofers/ | ProfessionalService | Trade association resources |
| White-Label SEO | /services/white-label-seo/ | ProfessionalService | Agency partnership outreach (separate campaign) |

White-label SEO (/services/white-label-seo/) is a separate pitch angle aimed at
web agencies and design studios. It fits the existing cold-email-campaign.md
framework (already used with the South East agency list) -- extend that campaign
rather than building a new one here.

---

*Last updated: 2026-06-21. Do not send until go/no-go checklist above is complete.*
