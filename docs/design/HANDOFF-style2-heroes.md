# Handoff: re-render all 27 blog heroes in the approved "textbook infographic" style

Run this in a fresh Claude Code session, model Sonnet, from `C:\Users\sunny\repos\sunnypatel-nextjs`. Paste the whole file as the first message. No other model is needed unless the contact sheet fails twice.

## Decisions already made (do not reopen)

- The papercraft style is rejected. The 27 `public/images/blog/hero-*.webp` files on disk are papercraft and must be overwritten in place, same filenames, so the `ogImage` wiring already done on 27 posts stays valid.
- Approved style for every blog hero is **style 2, flat vector textbook diagram, isometric**. The four approved reference frames and their exact prompts are in `docs/design/approved/` (`*__2-infographic.png` and `.json`). They are the guideline. Match them, do not reinterpret them.
- Styles 6 (glass) and 3 (desk photo) are approved for later phases (services and tools, about and homepage). Not in this job.
- Brand words: educational, trusted, technical.

## Style 2 rules (the whole guideline, keep it this short)

1. Flat vector, isometric, two-tone shading, subtle long shadows. No photoreal, no gloss, no glass, no neon, no gradient backgrounds.
2. Ground is dark charcoal, `#141418` to `#1E1E24`, sitting on a `#050507` page. Never pure black, never a gradient fill.
3. Colours: grey shapes `#8A8A92` to `#B0B0B8` for the population; **brand blue `#5B8AEF` on exactly one focal object or cluster**; **gold `#d79f1e` on exactly one small marker** (pin, dot, badge, arrow). Nothing else coloured.
4. Callouts: one to three thin grey leader lines ending in small empty circles. They point at the focal element. No text anywhere, ever.
5. Subject is the literal topic of the post, built from page tiles, stacks, grids, arrows and simple geometric props. One idea per image. Focal element off-centre on a third, upper third quiet.
6. Master 16:9, generated at 2K, delivered at 2400x1350 WebP quality 82, under 250KB. `ContentPage` crops to 2:1, so keep the focal element inside the middle 80 percent vertically.
7. Banned: text, letters, numerals, people, hands, faces, logos, rockets, lightbulbs, magnifying glasses, handshakes, trophies, robots, confetti, particles, lens flare, purple or blue gradients, any 3D render look, any metal or chrome material.

## Pipeline (proven today, copy exactly)

Reference PNGs for every call, already at 2K in `docs/design/approved/`:
`A-data-how-many-websites__2-infographic.png` and `C-compare-consultant-vs-agency__2-infographic.png`.

Generate (Git Bash, run one at a time, never in parallel):
```
cd /c/Users/sunny/repos/claude-code-skills/nano-banana && python scripts/generate_image.py --model pro --aspect-ratio 16:9 --resolution 2K --no-open --image /c/Users/sunny/repos/sunnypatel-nextjs/docs/design/approved/A-data-how-many-websites__2-infographic.png --image /c/Users/sunny/repos/sunnypatel-nextjs/docs/design/approved/C-compare-consultant-vs-agency__2-infographic.png < /c/Users/sunny/repos/sunnypatel-nextjs/docs/design/07-prompts/<ID>-<slug>.json
```
Output lands in `C:\Users\sunny\Downloads\nano_banana_<timestamp>.png`. Take the newest file with `ls -t ~/Downloads/nano_banana_*.png | head -1`.

Process (node needs `C:/...` paths, not `/c/...`):
```
cd /c/Users/sunny/repos/sunnypatel-nextjs && node -e "require('sharp')('C:/Users/sunny/Downloads/<file>.png').resize(2400,1350,{fit:'cover'}).webp({quality:82}).toFile('public/images/blog/hero-<slug>.webp').then(i=>console.log(i.width,i.height,i.size))"
```

Prompt JSON shape: copy `docs/design/approved/C-compare-consultant-vs-agency__2-infographic.json` and change only `subject` and `scene`. Keep `style`, `render`, `camera`, `light`, `composition` and `negative` identical. Do NOT include any site notes, hex-code commentary or brand words as free text in the prompt (a leak today made the model paint a fake website nav bar with hex codes in it). Colour hex values belong only inside the `render` string as they already are.

## The 27 posts

Filename is `hero-<slug>.webp` unless an alias is given. Write `scene` as one literal isometric picture of the topic using tiles, stacks, grids, arrows and simple props, in the voice of the four approved prompts.

| ID | slug | literal topic |
|---|---|---|
| H01 | how-many-websites-are-there | 400m registered domains, only about 217m active |
| H02 | top-geo-agencies | 12 GEO agencies ranked for AI-search visibility |
| H03 | uk-dental-marketing-statistics | dental register data, NHS vs private split, honest gaps |
| H04 | uk-ecommerce-seo-statistics | market size, platform share, organic vs paid traffic |
| H05 | ai-referral-traffic-study | 4,717 sessions from five AI assistants into the most-cited sites |
| H06 | autonomous-seo-agent | an agent that reads Search Console, edits the site, measures, repeats |
| H07 | how-to-add-schema-markup | pick type, generate JSON-LD, paste, validate (approved frame D covers this, regenerate anyway for a 2K master) |
| H08 | how-to-calculate-seo-roi | revenue minus cost over cost, ramping over months |
| H09 | chatgpt-prompts-for-seo | 20 prompts organised by task and chained |
| H10 | google-open-knowledge-format | a folder of linked markdown files, orphan pages vs a linked cluster |
| H11 | seo-consultant-vs-seo-agency | one consultant vs a stacked agency (approved frame C, regenerate at 2K) |
| H12 | optimise-content-for-ai-search | how AI answers select and cite sources |
| H13 | freelance-seo-consultant-uk | what to look for, red flags, realistic pricing |
| H14 | wordpress-vs-webflow | two platforms compared on SEO, cost, flexibility |
| H15 | how-to-be-an-seo | building the skills and the business |
| H16 | seo-semantic-markup-guide | structured data and semantic HTML enabling rich results |
| H17 | what-is-eeat-seo | experience, expertise, authority, trust as signals not a score |
| H18 | optimise-multiple-keywords | long-tail keywords spread across posts |
| H19 | increase-organic-traffic | a system, not a bag of tactics |
| H20 | how-many-keywords | keyword count is the wrong question |
| H21 | technical-seo-vs-on-page-seo | two layers of the same page working together |
| H22 | managing-44-websites-seo-data | alias `hero-managing-44-websites.webp`; a field of 44 tiles, a handful picked out |
| H23 | how-long-does-seo-take | `hero-how-long-does-seo-take.webp`; a row of tiles lighting up over a timeline |
| H24 | google-update-portfolio-impact | alias `hero-google-update-impact.webp`; two tiles of many collapsing on the same day |
| H25 | ai-search-traffic-portfolio-data | alias `hero-ai-search-traffic.webp`; AI-assistant traffic arriving at a few tiles |
| H26 | negative-seo-backlink-attack-case-study | alias `hero-negative-seo-case-study.webp`; tangled grey lines hitting a tile, blue shield (approved frame B, regenerate at 2K) |
| H27 | aged-domains-and-domain-collisions | alias `hero-aged-domains.webp`; an old faded tile beside a new one sharing one address bar |

## Defect check (per image, view the file with Read)

Regenerate once on any of: letterforms or numerals anywhere; a face, hand or person; a logo; more than one blue focal group; more than one gold marker; a gradient fill or neon glow; glossy, glass or metal material; the focal element cut by the 2:1 crop zone. **Not a defect:** soft directional shadow, the isometric ground fading darker at the edges.
Max one retry per image, then log it as "needs human" and move on.

Log every attempt in `docs/design/07-render-log.md`: ID | attempt | source png | final webp | bytes | check | note.

## Finish

1. Build a contact sheet of all 27 finals (sharp composite, 3 columns, labels) to `docs/design/07-contact-sheet.jpg` and open it with `Start-Process`.
2. Run `npx tsc --noEmit` and `KEYSTATIC_GITHUB_CLIENT_ID=x KEYSTATIC_GITHUB_CLIENT_SECRET=x KEYSTATIC_SECRET=x npm run build`; both must pass.
3. Report in under 15 lines: count produced, retries, needs-human list, total bytes, build result. Do not commit, push or deploy. Sunny decides after the sheet.

Budget: about 27 to 35 Pro generations, roughly 4 to 5 USD. Stop and report if the generate script errors three times in a row.
