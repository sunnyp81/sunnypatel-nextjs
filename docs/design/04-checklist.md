# Phase 4 pass/fail checklist: blog hero images

Apply per image, against the row in `04-visual-spec.md` and the law in `02-brand-system.md` section 7. Four groups, one decision rule.

**Decision rule: any numeric or defect fail means regenerate. Any brand or subject fail means needs human.** A pass on all four groups is required before an image moves from `spec` to shipped.

---

## 1. Numeric

- [ ] Master file is exactly 2400x1350 pixels.
- [ ] File format is `.webp`.
- [ ] File size is under 250KB (250,000 bytes).
- [ ] Filename matches the spec row exactly: `hero-<slug>.webp`.
- [ ] File exists at the exact path in `public/images/blog/` given in the spec row.

**How to check (6 lines):**
1. Run `node -e "const s=require('sharp'); s('public/images/blog/hero-<slug>.webp').metadata().then(m=>console.log(m.width,m.height,m.format))"` from the repo root and confirm `2400 1350 webp`.
2. Run `node -e "console.log(require('fs').statSync('public/images/blog/hero-<slug>.webp').size)"` and confirm the number is under 250000.
3. Compare the printed filename against the `output path` column in `04-visual-spec.md` character for character.
4. Confirm the file is inside `public/images/blog/`, not `public/images/` or `public/images/stats/`.
5. If any of the above fails, re-run the sharp resize step from `04-prompts/README.md` with a lower quality value before shipping.
6. Re-check bytes after any re-encode; do not eyeball file size in an OS file browser, it rounds.

## 2. Brand

- [ ] Only the section 7.2 materials appear: cream `#EDE1D7`, aged cream `#D6C3AC` (age-only), warm grey `#A59C9A`, mid grey `#999596`, navy paper `#2E3D60`, warm glow `#FDE7C8`.
- [ ] Exactly one warm glow in the image.
- [ ] Exactly one navy element, or one navy element repeated as a single deliberate group (e.g. a row of arrows), matching what the row specifies.
- [ ] Background reads as dark charcoal in the `#1A1A1E` to `#2D2D31` range, never pure black.
- [ ] No brand blue `#5B8AEF` or anything near it appears anywhere in the image.

**How to check (6 lines):**
1. Open the image at 100% with the Read tool and sample the background, the lit element, and the navy element by eye against the hex values above.
2. Count warm-glow sources; if more than one card or object glows, fail.
3. Count navy elements or navy element groups; if two unrelated navy objects appear, fail.
4. Zoom into the darkest corner of the frame; if it reads as flat pure black rather than charcoal with visible tone, fail.
5. Scan the whole frame for any periwinkle-blue accent; if present anywhere, fail regardless of size.
6. Cross-check against the two approved references (`hero-managing-44-websites.webp`, `hero-negative-seo-case-study.webp`) side by side for overall material and lighting consistency.

## 3. Subject

- [ ] The image depicts the row's literal topic, not a generic metaphor for it.
- [ ] The cut-paper browser-card prop appears, unless the row explicitly says otherwise.
- [ ] Every object is physically plausible: it could stand, lean or lie the way it appears to.

**How to check (6 lines):**
1. Re-read the row's `source topic` and `subject depicted` columns, then look at the image without reading them again; confirm the scene reads as that topic unaided.
2. Confirm at least one browser-card prop (rounded rectangle, chrome strip, slotted address bar, recessed panel) is present and recognisable.
3. Check every standing or leaning object has a plausible base or support; flag anything that looks like it would fall over.
4. Check every cut or layered edge looks like it was actually cut from card stock, not rendered as a solid 3D shape.
5. Confirm the composition follows the row's stated camera (A three-quarter elevated or B straight-on macro).
6. If the scene could equally illustrate a different, unrelated post, it has drifted into metaphor; fail as subject and needs human.

## 4. Defects

- [ ] No text, lettering, numerals, labels or watermarks anywhere in the image.
- [ ] No people, faces, hands, body parts or silhouettes.
- [ ] No real or invented logos, including Google, browser or search-engine marks.
- [ ] No extra limbs, duplicated objects, or floating disconnected pieces that break physical plausibility.
- [ ] No neon, glow-edge lighting, bloom, lens flare, or any gradient background (including purple or blue gradients).

**How to check (6 lines):**
1. Scan the full frame at 100% for any rendered character, glyph or numeral, including inside a card's content panel; the panel content must be abstract marks, never legible text.
2. Scan for any human feature, including a reflection or a shadow shaped like one.
3. Scan for anything resembling a real company mark, a browser chrome icon, or a search-engine wordmark.
4. Check every card and prop has a single, complete, connected form; nothing should appear cut off mid-air or duplicated without reason.
5. Check the background is a flat charcoal seamless, not a gradient, and that no rim light or lens artefact appears around any edge.
6. If a banned item from section 7.8 appears in any form, including a stylised or partial version, fail as a defect and regenerate.

## Placement

- [ ] The focal element (the row's `focal lit element`) sits inside the centre 1200x600 pixel safe area of the 2400x1350 master, so the Open Graph crop never loses the subject.
- [ ] The upper third of the frame is visually quiet, with no fine detail that would be lost to an overlay or crop.

**How to check (6 lines):**
1. Overlay a 1200x600 rectangle centred on the 2400x1350 master (crop coordinates: x 600 to 1800, y 375 to 975) and confirm the focal element and navy element both fall inside it.
2. Check the row's `OG safe-area note` column for the specific placement called out for that image and confirm it matches.
3. Look at the top 450 pixels of the frame (the upper third) and confirm nothing critical to understanding the scene sits there.
4. Check the focal element sits off centre, roughly on a third, not dead centre, per section 7.6.
5. If the crop would cut through the lit element or the navy element, fail as placement and regenerate with the composition shifted.
6. Re-check placement after any re-encode or crop adjustment, since a resize step can shift framing if the source aspect ratio was wrong.

---

## Status definitions

- **spec**, this checklist has not yet been run against a generated file. All 21 rows in `04-visual-spec.md` are currently at this status.
- **pass**, every group above passes for the specific generated file at the specific output path.
- **regenerate**, a numeric or defect fail occurred; re-run generation (and/or the sharp resize step) and re-check.
- **needs human**, a brand or subject fail occurred; the JSON prompt or the row's scene description needs a person to adjust it, not another blind regeneration attempt.

**Clarification (orchestrator, 2026-09-19):** the warm key-light falloff on the charcoal backdrop (brighter upper-left, darker toward the top and edges) is specified in brand system 7.3 and 7.5 and is NOT a gradient-background defect. The gradient ban means flat colour gradient fills (purple, blue, rainbow, neon) or a gradient used instead of a physical backdrop. Likewise, a cluster of two to five cards lit by one practical is one focal group under 7.6, not multiple light sources; the defect is two separate warm sources with different directions or colour.
