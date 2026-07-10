# Loom teardown campaign — Reading/Berkshire

Goal: meetings. Personalised 3-minute video audits sent cold to local businesses that are close to ranking but losing clicks. Matches the step-in-the-door rule: show the money first, fixed-fee £495 audit as the ask, retainer as the path.

## Why this format
- Video teardowns get the highest cold reply rates of any format because the prospect sees you doing free work on THEIR site before you ask for anything.
- You are position 1 for "seo consultant reading": every prospect who Googles you after the email finds proof.

## Prospect criteria (10-15 per batch)
1. Reading/Berkshire business in a vertical with real ticket size: law, dental, aesthetics, accountancy, home improvement (roofing, knotweed, heat pumps), lettings/estate agents.
2. Ranking positions 5-15 for their own money term ("dentist reading", "solicitor wokingham"): check manually or via Ahrefs. They feel the pain (visible but losing) and the fix is demonstrable.
3. Has a website with at least one obvious, showable defect (slow LCP, missing title, no local schema, thin service pages, no GBP link).
4. NOT currently working with an agency (no agency footer credit, no fresh blog cadence).

## Sourcing workflow (30 min per batch)
1. Search each money term in an incognito window, note who sits positions 5-15.
2. Run each candidate through /tools/website-grader/ and screenshot the score: this becomes the video opener.
3. Log in the tracking table below before recording.

## Video script (3 min max, Loom, face bubble on)
1. 0:00-0:20: "Hi [name], Sunny here, SEO consultant in Reading. I was searching for [money term] and noticed you're on page 2, so I recorded this quick look at why."
2. 0:20-1:30: Screen-share their site. Show 2 concrete problems, name the fix for each. Use the grader score as the hook.
3. 1:30-2:20: Show the competitor above them and the one thing that competitor does that they don't.
4. 2:20-3:00: "There are maybe 5 or 6 more things like this. If you want the full list, I do a fixed-fee £495 audit, delivered in 5 days with a 45-minute call. Or just reply and I'll answer questions for free. Either way, the two fixes in this video are yours."

## Personalised landing page (new, use it)
Each prospect gets a private page at sunnypatel.co.uk/for/[slug]/ — add an entry to src/data/prospects.json (copy the "demo" entry), commit, deploy. The page carries their name, position, grader score, the Loom embed, both fixes in writing, and the £495 CTA. Link THIS page in the emails instead of the raw Loom link: it converts better and the video, fixes and booking live in one place. Pages are noindexed, robots-blocked, out of the sitemap, and 404 after the expires date.

## Email sequence
### Email 1 (with video)
Subject: `[Company] is on page 2 for "[money term]", here's why (3-min video)`

> Hi [name],
>
> I recorded a 3-minute look at why [company] sits behind [competitor] for "[money term]":
>
> [Loom thumbnail link]
>
> Two fixes in the video are free to keep. If you want the full picture, I do a fixed-fee £495 audit: every issue, prioritised by revenue impact, delivered in 5 working days with a 45-minute walkthrough.
>
> Sunny Patel
> SEO consultant, Reading. sunnypatel.co.uk

### Email 2 (day 4, no reply)
Subject: `Re: [Company] on page 2`

> Quick nudge: the video's 3 minutes and the two fixes in it are worth having whether or not we ever speak. [Loom link]. Worth a look?

### Email 3 (day 10, no reply, breakup)
Subject: `Closing the file on [Company]`

> No response needed: I'll assume rankings aren't a priority right now. If that changes, the video stays live for 30 days. One line of context in case it's useful: businesses at position [X] for "[money term]" typically capture under [Y]% of the clicks the top 3 take.

## Tracking
| Date | Company | Money term | Pos | Grader score | Video sent | Reply | Meeting | Outcome |
|------|---------|-----------|-----|--------------|-----------|-------|---------|---------|

## Targets
- Batch of 10 videos per week, 30 min sourcing + 10x15 min recording = under 3 hours.
- Expected: 30-50% watch rate, 10-20% reply, 1-2 meetings per batch. Kill the campaign if 3 batches produce 0 meetings.
