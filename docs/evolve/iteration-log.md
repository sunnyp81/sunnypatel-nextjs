# Iteration log — sunnypatel.co.uk

Append-only. Verdict pass fills `measured:` 7-14 days after each change.

---

iteration: 1
date: 2026-07-07
hypothesis: Rewriting titles/metas on 5 high-impression pages lifts CTR at current positions and nudges striking-distance rankings via better query match.
playbook_tactic: ctr-title-rewrite
affected_urls:
  - /services/seo-consultant-reading/  (pos 1.98 on money query, 0.35% CTR)
  - /services/seo-berkshire/           (pos 20.6, 4,471 impr; also fixed em/en dashes in H1/subtitle)
  - /services/technical-seo-audit/     (pos 34.4, 4,057 impr; fixed-fee £500 anchor added)
  - /services/seo-consulting/          (pos 27.3, 1,165 impr)
  - /blog/ai-search-statistics/        (pos 8.8, 2,715 impr, 0.33% CTR; number-led title)
change: metaTitle + description rewrites in Keystatic index.yaml frontmatter. Specific proof point (180 to 620 visits) on Reading; fixed-fee anchors on audit; UK+independent positioning on consulting.
commit: b55cf1c
predicted_outcome: Reading page CTR on "seo consultant reading" from 0.35% to >=5% within 14 days (~14 clicks/28d vs 1); ai-search-statistics CTR from 0.33% to >=1.5%.
measured: pending
verdict: pending
learning: pending

---

iteration: 2
date: 2026-07-10
hypothesis: The 3 tool pages shipped Jun14-15 rank pos24-75 despite the Jun15 internal-link push (6a5ee23) because they are thin and topically unsupported, not because they lack link equity. A dedicated supporting post gives one tool (seo-prompts, weakest-linked of the 3 at 1 inbound link vs 3 each for the other two) topical depth plus a reciprocal internal link, without cannibalising existing AI-search posts.
playbook_tactic: supporting-post-for-orphaned-tool
affected_urls:
  - /blog/chatgpt-prompts-for-seo/  (new post, targets "chatgpt prompts for seo")
  - /tools/seo-prompts/             (fixed stale "22 prompts" claim to accurate 20; added reciprocal link to new post)
change: New Keystatic blog post (src/content/blog/chatgpt-prompts-for-seo/, 1,350 words, FAQPage + BlogPosting schema, 6 internal links out to services/tools/posts) walking through the tool's 8 prompt categories and chaining method. Added BLOG_TOPICS entry in schema.ts. Corrected /tools/seo-prompts/ metadata title/description (was overstating 22 prompts, actual count is 20) and added a contextual link back to the new post from the tool's "how to use" section.
commit: d663b08
predicted_outcome: seo-prompts climbs from thin/orphaned toward page-2 territory (pos <30) within 3-4 weeks as the new post gets indexed and passes topical + link support; new post itself earns incremental impressions on "chatgpt prompts for seo" / "ai prompts for seo" long-tail.
measured: pending
verdict: pending
learning: pending

---

## Queued but not done this iteration
- ROI explainer post -> /tools/seo-roi-calculator/ (already has 3 inbound links from Jun15 push, lower priority than seo-prompts)
- how-to-add-schema post -> /tools/schema-generator/ (risk: may cannibalise existing /blog/seo-semantic-markup-guide/, needs a genuinely distinct angle before writing)
- best-seo-companies-uk refresh (12.5k impr, pos 68) — separate hypothesis #2 in active-hypotheses.md, not started
