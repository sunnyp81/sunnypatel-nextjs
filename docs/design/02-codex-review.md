- **2.2 and 2.4, `--color-brand-deep` contrast:** `#3D6FE8` is about **4.499:1** on `#050507`, not 4.50:1. It narrowly fails normal-text AA rather than passing at the boundary.  
  **Fix:** State it as failing on both surfaces, and retain the existing ban on text use.

- **2.5, table dividers:** “Raise to 14 percent minimum” does not meet the stated 3:1 requirement if dividers are needed to understand the table’s rows or columns. At 14 percent white over `#050507`, contrast is only about **1.39:1**.  
  **Fix:** Require a 3:1 divider or an alternative structure that does not depend on divider lines, such as spacing, header fills, and explicit row grouping.

- **2.1, surface-level rule:** “At most two surface levels in a viewport” conflicts with permitted table patterns: page ground L0, an L1 table container, and an L2 table header necessarily coexist. The alternative wording, “L1 plus L2,” is also impossible because L0 remains the page backdrop.  
  **Fix:** Define the rule as “at most two raised levels above L0,” allowing L0 + L1 + L2 where L2 is nested within an L1 component.

- **1.1, 4.4, and 4.5, stat-tile count:** The document says “exactly three tiles,” “maximum three per page,” and requires a three-tile hero proof row. A builder could incorrectly add three tiles to every page.  
  **Fix:** Specify: “The homepage proof row has exactly three tiles. Other pages may have zero to three, only where each tile has linked evidence.”

- **2.3 and 7.2, enforceability of image-blue rule:** “Anything within a just-noticeable distance” is undefined, and prompt-based image generation cannot reliably prohibit an exact hex or perceptual neighborhood. This will create inconsistent approvals.  
  **Fix:** Replace it with a reviewable rule: “Use only subdued navy paper in the approved range `#1A2340` to `#3F4A68`; reject vivid, emitted, or periwinkle blue.” If a numerical threshold is required, define an OKLCH/Delta E method and tolerance.

- **7.2, 7.3, 7.6, and worked examples, focal-light contradiction:** The system says one warm glow and one focal card, but example A has three glowing cards. Example C makes the torn navy card read first and the glowing intact card second, producing two competing focal elements.  
  **Fix:** Define one focal group, not one focal object. Rewrite A as one warm-lit cluster of the first three cards, and C so only one card is visually dominant, with the other subordinate through position, scale, or lower luminance.

- **7.2 and 7.8, navy-element limit:** “Exactly one element” followed by “one navy element repeated in a deliberate group” leaves “group” unconstrained. It could become multiple unrelated navy objects and weaken the visual signature.  
  **Fix:** Define a group as repetitions of one identical semantic object in one contiguous composition, for example a row of arrows, and prohibit mixed navy objects in the same image.

- **7.4, camera specification:** “50mm to 85mm lens on a medium format back” spans materially different fields of view. Prompt writers can generate either a relatively wide scene or a compressed close view.  
  **Fix:** Specify one target framing per setup, such as “approximately 45 to 55 degree horizontal field of view, moderate compression, focal subject sharp, background softly defocused,” rather than a broad focal-length range.

- **8, LCP claim:** Omitting `priority` does not ensure the above-the-fold image will not be LCP. If it is visually large, the browser may select it as LCP anyway, while a lazy or deprioritized request can make the desktop hero feel late.  
  **Fix:** Make LCP intentional: test the desktop composition in production-like conditions, then either optimize and prioritize the image if it is the actual LCP, or constrain its rendered area so the lead heading is reliably larger and validate that outcome with Web Vitals.

- **8, mobile hiding:** CSS-hiding a Next.js image below 1024px does not reliably guarantee that the image will not be requested on mobile. That can add unnecessary transfer and compete with the form’s first-screen resources.  
  **Fix:** Require a breakpoint-gated render strategy and verify the 390px and 768px network waterfalls show no hero-image request.

- **8, 1024px breakpoint:** Starting a form-plus-image two-column layout at exactly 1024px risks a narrow lead form at a common tablet landscape width, directly harming completion rate.  
  **Fix:** Use a minimum form-column width in the grid and keep the single-column layout until that minimum is available, likely nearer 1200px to 1280px, then verify completion-critical controls at 1024px.