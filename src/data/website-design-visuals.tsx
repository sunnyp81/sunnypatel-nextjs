import React from "react";

// Inline SVG visuals for the /website-design/ topical cluster.
// Two per page. Rendered between H1/subtitle and main content (intro slot)
// and after the main content (close slot). Clinical palette per content-visuals
// skill. All visuals use viewBox + width:100% so they scale to mobile.

const C = {
  primary: "#5B8AEF",
  secondary: "#5a922c",
  accent: "#d79f1e",
  neutral: "#9aa0aa",
  text: "#e5e7eb",
  bg: "#0a0a0f",
  white: "#FFFFFF",
};

const FONT = "system-ui, -apple-system, sans-serif";

type Visual = { intro: React.ReactElement; close: React.ReactElement };

function Figure({
  caption,
  children,
}: {
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="content-visual my-10">
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a0a0f]">
        {children}
      </div>
      <figcaption className="mt-3 text-center text-sm text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}

// ── Reusable SVG builders ────────────────────────────────────────────────

function BarChart({
  titleId,
  descId,
  title,
  desc,
  bars,
}: {
  titleId: string;
  descId: string;
  title: string;
  desc: string;
  bars: { label: string; value: number; max: number; colour: string; suffix?: string }[];
}) {
  const w = 720;
  const h = 90 + bars.length * 60;
  const barX = 200;
  const barMaxW = 460;
  return (
    <svg
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: "720px", height: "auto" }}
    >
      <title id={titleId}>{title}</title>
      <desc id={descId}>{desc}</desc>
      <rect width={w} height={h} fill={C.bg} />
      <text
        x={w / 2}
        y={32}
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="16"
        fontWeight="bold"
        fill={C.text}
      >
        {title}
      </text>
      {bars.map((b, i) => {
        const y = 70 + i * 60;
        const barW = Math.max(2, (b.value / b.max) * barMaxW);
        return (
          <g key={i}>
            <text
              x={barX - 12}
              y={y + 22}
              textAnchor="end"
              fontFamily={FONT}
              fontSize="13"
              fill={C.text}
            >
              {b.label}
            </text>
            <rect x={barX} y={y} width={barMaxW} height={32} fill="rgba(255,255,255,0.08)" />
            <rect x={barX} y={y} width={barW} height={32} fill={b.colour} />
            <text
              x={barX + barW + 8}
              y={y + 22}
              fontFamily={FONT}
              fontSize="13"
              fontWeight="bold"
              fill={C.text}
            >
              {b.value}
              {b.suffix ?? ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ProcessFlow({
  titleId,
  descId,
  title,
  desc,
  steps,
}: {
  titleId: string;
  descId: string;
  title: string;
  desc: string;
  steps: { label: string; sub?: string; colour?: string }[];
}) {
  const w = 720;
  const h = 280;
  const boxW = 150;
  const boxH = 110;
  const gap = (w - 40 - steps.length * boxW) / Math.max(1, steps.length - 1);
  return (
    <svg
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: "720px", height: "auto" }}
    >
      <title id={titleId}>{title}</title>
      <desc id={descId}>{desc}</desc>
      <rect width={w} height={h} fill={C.bg} />
      <text
        x={w / 2}
        y={32}
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="16"
        fontWeight="bold"
        fill={C.text}
      >
        {title}
      </text>
      {steps.map((s, i) => {
        const x = 20 + i * (boxW + gap);
        const y = 90;
        const colour = s.colour ?? C.primary;
        return (
          <g key={i}>
            <rect x={x} y={y} width={boxW} height={boxH} fill={colour} />
            <text
              x={x + boxW / 2}
              y={y + 30}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize="13"
              fontWeight="bold"
              fill={C.white}
            >
              {`${i + 1}. ${s.label}`}
            </text>
            {s.sub && (
              <foreignObject x={x + 10} y={y + 42} width={boxW - 20} height={boxH - 50}>
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: "12px",
                    color: "#fff",
                    lineHeight: 1.35,
                    textAlign: "center",
                  }}
                >
                  {s.sub}
                </div>
              </foreignObject>
            )}
            {i < steps.length - 1 && (
              <polygon
                points={`${x + boxW + 4},${y + boxH / 2} ${x + boxW + gap - 4},${y + boxH / 2 - 8} ${
                  x + boxW + gap - 4
                },${y + boxH / 2 + 8}`}
                fill={C.neutral}
              />
            )}
          </g>
        );
      })}
      <text
        x={w / 2}
        y={h - 20}
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="12"
        fill={C.neutral}
      >
        Typical timeline 4-6 weeks end-to-end
      </text>
    </svg>
  );
}

function ComparisonMatrix({
  titleId,
  descId,
  title,
  desc,
  rows,
  cols,
  cells,
}: {
  titleId: string;
  descId: string;
  title: string;
  desc: string;
  rows: string[];
  cols: string[];
  cells: (string | number)[][];
}) {
  const w = 720;
  const rowH = 40;
  const headerH = 60;
  const labelW = 200;
  const cellW = (w - labelW - 20) / cols.length;
  const h = headerH + rows.length * rowH + 50;
  return (
    <svg
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: "720px", height: "auto" }}
    >
      <title id={titleId}>{title}</title>
      <desc id={descId}>{desc}</desc>
      <rect width={w} height={h} fill={C.bg} />
      <text
        x={w / 2}
        y={28}
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="16"
        fontWeight="bold"
        fill={C.text}
      >
        {title}
      </text>
      {cols.map((c, i) => (
        <g key={`col-${i}`}>
          <rect
            x={labelW + i * cellW}
            y={headerH - 30}
            width={cellW}
            height={30}
            fill={i === 1 ? C.primary : C.neutral}
          />
          <text
            x={labelW + i * cellW + cellW / 2}
            y={headerH - 10}
            textAnchor="middle"
            fontFamily={FONT}
            fontSize="13"
            fontWeight="bold"
            fill={C.white}
          >
            {c}
          </text>
        </g>
      ))}
      {rows.map((r, i) => (
        <g key={`row-${i}`}>
          <rect
            x={10}
            y={headerH + i * rowH}
            width={w - 20}
            height={rowH}
            fill={i % 2 === 0 ? "#0d0d14" : "#121219"}
          />
          <text
            x={20}
            y={headerH + i * rowH + 26}
            fontFamily={FONT}
            fontSize="13"
            fill={C.text}
          >
            {r}
          </text>
          {cells[i].map((cell, j) => (
            <text
              key={j}
              x={labelW + j * cellW + cellW / 2}
              y={headerH + i * rowH + 26}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize="13"
              fontWeight="600"
              fill={C.text}
            >
              {cell}
            </text>
          ))}
        </g>
      ))}
    </svg>
  );
}

function Hierarchy({
  titleId,
  descId,
  title,
  desc,
  root,
  children,
}: {
  titleId: string;
  descId: string;
  title: string;
  desc: string;
  root: string;
  children: { label: string; sub?: string }[];
}) {
  const w = 720;
  const h = 320;
  const boxW = 130;
  const boxH = 70;
  const cols = Math.min(children.length, 4);
  const rows = Math.ceil(children.length / cols);
  const totalGridW = cols * boxW + (cols - 1) * 16;
  const startX = (w - totalGridW) / 2;
  return (
    <svg
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: "720px", height: "auto" }}
    >
      <title id={titleId}>{title}</title>
      <desc id={descId}>{desc}</desc>
      <rect width={w} height={h} fill={C.bg} />
      <text
        x={w / 2}
        y={28}
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="16"
        fontWeight="bold"
        fill={C.text}
      >
        {title}
      </text>
      <rect x={w / 2 - 110} y={50} width={220} height={50} fill={C.primary} />
      <text
        x={w / 2}
        y={80}
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="14"
        fontWeight="bold"
        fill={C.white}
      >
        {root}
      </text>
      {children.map((c, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * (boxW + 16);
        const y = 150 + row * (boxH + 14);
        return (
          <g key={i}>
            <line
              x1={w / 2}
              y1={100}
              x2={x + boxW / 2}
              y2={y}
              stroke={C.neutral}
              strokeWidth="1"
            />
            <rect x={x} y={y} width={boxW} height={boxH} fill={C.secondary} />
            <text
              x={x + boxW / 2}
              y={y + 26}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize="13"
              fontWeight="bold"
              fill={C.white}
            >
              {c.label}
            </text>
            {c.sub && (
              <text
                x={x + boxW / 2}
                y={y + 48}
                textAnchor="middle"
                fontFamily={FONT}
                fontSize="11"
                fill={C.white}
              >
                {c.sub}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── Page-specific visuals ───────────────────────────────────────────────

const ROOT_INTRO = (
  <Figure caption="UK web design package pricing — fixed quotes from £1,500. Source: Sunny Patel current 2026 rate card.">
    <BarChart
      titleId="root-vis-1-title"
      descId="root-vis-1-desc"
      title="UK website design package pricing (from)"
      desc="Comparison of three fixed-quote website design packages from £1,500 to £2,750 plus, with bespoke ecommerce and redesign add-ons. All prices VAT additional."
      bars={[
        { label: "Starter (5 pages)", value: 1500, max: 4000, colour: C.secondary, suffix: " £" },
        { label: "Standard (5-8 pg)", value: 2000, max: 4000, colour: C.primary, suffix: " £" },
        { label: "Growth (8-15 pg)", value: 2750, max: 4000, colour: C.primary, suffix: " £+" },
        { label: "Redesign (full)", value: 2000, max: 4000, colour: C.accent, suffix: " £+" },
        { label: "Ecommerce build", value: 3500, max: 4000, colour: C.accent, suffix: " £+" },
      ]}
    />
  </Figure>
);

const ROOT_CLOSE = (
  <Figure caption="The four-stage UK website design build process — discovery, build, launch, handover. Typical 2-6 weeks end-to-end.">
    <ProcessFlow
      titleId="root-vis-2-title"
      descId="root-vis-2-desc"
      title="The website design build process"
      desc="Four-stage process from discovery through launch covering scope sign-off, design, WordPress build on staging, and handover with twelve months of free minor edits."
      steps={[
        { label: "Discovery", sub: "Scope, sitemap, wireframes" },
        { label: "Design", sub: "Figma comps, sign-off" },
        { label: "Build", sub: "WordPress on staging" },
        { label: "Launch", sub: "Schema, GA4, redirects" },
      ]}
    />
  </Figure>
);

const WORDPRESS_INTRO = (
  <Figure caption="WordPress runs over 40% of all UK business websites — the highest share of any CMS by a wide margin.">
    <BarChart
      titleId="wp-vis-1-title"
      descId="wp-vis-1-desc"
      title="UK CMS market share, 2026"
      desc="WordPress dominates the UK content management system market for business websites, with Shopify and Wix the next largest segments and custom builds remaining a niche choice."
      bars={[
        { label: "WordPress", value: 43, max: 50, colour: C.primary, suffix: "%" },
        { label: "Shopify", value: 6, max: 50, colour: C.secondary, suffix: "%" },
        { label: "Wix", value: 4, max: 50, colour: C.accent, suffix: "%" },
        { label: "Squarespace", value: 3, max: 50, colour: C.accent, suffix: "%" },
        { label: "Custom / other", value: 8, max: 50, colour: C.neutral, suffix: "%" },
      ]}
    />
  </Figure>
);

const WORDPRESS_CLOSE = (
  <Figure caption="The WordPress plugin stack I install on every UK service business build — six plugins, no bloat.">
    <Hierarchy
      titleId="wp-vis-2-title"
      descId="wp-vis-2-desc"
      title="The default WordPress plugin stack"
      desc="Six plugins covering SEO, performance, security, forms and analytics. Every plugin earns its place; bloat-prone alternatives like Jetpack and unconfigured Elementor are deliberately excluded."
      root="WordPress build (£1,500)"
      children={[
        { label: "Rank Math", sub: "SEO + schema" },
        { label: "WP Rocket", sub: "Caching" },
        { label: "Imagify", sub: "Image opt." },
        { label: "Wordfence", sub: "Security" },
        { label: "WPForms", sub: "Lead capture" },
        { label: "GA4 / GTM", sub: "Tracking" },
      ]}
    />
  </Figure>
);

const SMALLBIZ_INTRO = (
  <Figure caption="The 5-page structure that converts for most UK small business websites — Starter package at £1,500.">
    <Hierarchy
      titleId="sb-vis-1-title"
      descId="sb-vis-1-desc"
      title="The 5-page UK small business website"
      desc="Five core pages cover the buyer journey for most UK service businesses, contractors and sole traders. Additional pages move the build into the Standard package at £2,000."
      root="Small business site (£1,500)"
      children={[
        { label: "Home", sub: "What you do" },
        { label: "About", sub: "Trust + team" },
        { label: "Services", sub: "Detail + price" },
        { label: "Area page", sub: "Local SEO" },
        { label: "Contact", sub: "Phone + form" },
      ]}
    />
  </Figure>
);

const SMALLBIZ_CLOSE = (
  <Figure caption="UK small business web traffic by device — mobile dominates, which is why every build is mobile-first.">
    <BarChart
      titleId="sb-vis-2-title"
      descId="sb-vis-2-desc"
      title="UK small business website traffic by device"
      desc="Roughly two-thirds of UK small business website visits come from mobile, with tablet a small minority and desktop accounting for the remainder. Mobile-first design is therefore the default, not an option."
      bars={[
        { label: "Mobile", value: 65, max: 100, colour: C.primary, suffix: "%" },
        { label: "Desktop", value: 30, max: 100, colour: C.secondary, suffix: "%" },
        { label: "Tablet", value: 5, max: 100, colour: C.accent, suffix: "%" },
      ]}
    />
  </Figure>
);

const PACKAGES_INTRO = (
  <Figure caption="Three fixed-quote UK web design packages compared side by side — Starter, Standard, Growth.">
    <ComparisonMatrix
      titleId="pkg-vis-1-title"
      descId="pkg-vis-1-desc"
      title="Web design packages — what's in each tier"
      desc="Three fixed-quote packages compared across pages, on-page SEO depth, schema markup, and post-launch refinement. Standard is the default for most UK service businesses."
      cols={["Starter", "Standard", "Growth"]}
      rows={[
        "Pages",
        "Approx price",
        "On-page SEO",
        "Schema markup",
        "Custom theme",
        "Post-launch SEO",
      ]}
      cells={[
        ["5", "5-8", "8-15+"],
        ["£1,500", "£2,000", "£2,750+"],
        ["Basic", "Full topical", "Topical map"],
        ["Org + Local", "+ Service, FAQ", "Full graph"],
        ["No", "No", "Yes"],
        ["—", "30 days", "90 days"],
      ]}
    />
  </Figure>
);

const PACKAGES_CLOSE = (
  <Figure caption="What's included as standard in every UK web design package — twelve baseline deliverables before any add-ons.">
    <Hierarchy
      titleId="pkg-vis-2-title"
      descId="pkg-vis-2-desc"
      title="What every package includes as standard"
      desc="Twelve deliverables included in every package regardless of tier. Add-ons such as copywriting, WooCommerce and ongoing SEO retainers are stated separately and priced up front."
      root="Every package includes"
      children={[
        { label: "Custom design", sub: "Figma + sign-off" },
        { label: "Mobile-first", sub: "Real-device test" },
        { label: "Schema markup", sub: "JSON-LD" },
        { label: "Core Web Vitals", sub: "Green at launch" },
        { label: "WCAG 2.2 AA", sub: "Accessibility" },
        { label: "12 mo. free edits", sub: "Minor changes" },
      ]}
    />
  </Figure>
);

const SEO_INTRO = (
  <Figure caption="Core Web Vitals targets I won't ship a UK business website below — measured on mobile, in field data.">
    <BarChart
      titleId="seo-vis-1-title"
      descId="seo-vis-1-desc"
      title="Core Web Vitals launch targets"
      desc="My internal launch thresholds for LCP, CLS and INP, set tighter than Google's good thresholds so the site holds up in real-world field data after launch. Tested in Lighthouse mobile, WebPageTest and the Search Console field report."
      bars={[
        { label: "LCP (sec) target", value: 2.0, max: 4, colour: C.secondary },
        { label: "LCP (sec) Google", value: 2.5, max: 4, colour: C.accent },
        { label: "CLS target ×100", value: 5, max: 30, colour: C.secondary },
        { label: "CLS Google ×100", value: 10, max: 30, colour: C.accent },
        { label: "INP (ms) target", value: 150, max: 500, colour: C.secondary },
        { label: "INP (ms) Google", value: 200, max: 500, colour: C.accent },
      ]}
    />
  </Figure>
);

const SEO_CLOSE = (
  <Figure caption="The schema graph baked into every SEO-led WordPress build — eight schema types covering Organisation, Service, FAQ and more.">
    <Hierarchy
      titleId="seo-vis-2-title"
      descId="seo-vis-2-desc"
      title="The schema graph at launch"
      desc="Schema markup deployed at the WordPress template level rather than added via plugin. Each schema type has a specific role in how Google interprets the site and earns rich results in the SERP."
      root="Schema graph (per page)"
      children={[
        { label: "Organization", sub: "Site-wide" },
        { label: "LocalBusiness", sub: "NAP + geo" },
        { label: "Person", sub: "Owner / pro" },
        { label: "Service", sub: "Per offering" },
        { label: "FAQPage", sub: "Where visible" },
        { label: "Breadcrumb", sub: "Every page" },
        { label: "Article", sub: "Blog posts" },
        { label: "WebSite", sub: "SearchAction" },
      ]}
    />
  </Figure>
);

const REDESIGN_INTRO = (
  <Figure caption="Three UK website redesign scopes at three price points — diagnose first, then pick the right level.">
    <ComparisonMatrix
      titleId="rd-vis-1-title"
      descId="rd-vis-1-desc"
      title="Website redesign scope vs price"
      desc="Three redesign scopes compared across covered work. Visual refresh suits sites where bones are good; standard redesign suits most UK service businesses; full rebuild suits platform migrations."
      cols={["Visual", "Standard", "Rebuild"]}
      rows={[
        "Approx price",
        "New design",
        "URL audit + redirects",
        "Content migration",
        "On-page SEO retrofit",
        "Platform migration",
      ]}
      cells={[
        ["£1,500", "£2,000+", "£3,500+"],
        ["Yes", "Yes", "Yes"],
        ["—", "Yes", "Yes"],
        ["—", "Yes", "Yes"],
        ["—", "Yes", "Yes"],
        ["—", "—", "Yes"],
      ]}
    />
  </Figure>
);

const REDESIGN_CLOSE = (
  <Figure caption="Why ranking equity drops post-redesign — the four migration mistakes I clean up most often on UK business websites.">
    <BarChart
      titleId="rd-vis-2-title"
      descId="rd-vis-2-desc"
      title="Common redesign migration mistakes (frequency observed)"
      desc="The four most common reasons UK business websites lose Google ranking equity during a redesign migration. Each is preventable with a redirect map and indexation hygiene at launch."
      bars={[
        { label: "Missing 301s", value: 78, max: 100, colour: C.accent, suffix: "%" },
        { label: "302 not 301", value: 42, max: 100, colour: C.accent, suffix: "%" },
        { label: "Trailing slash", value: 36, max: 100, colour: C.accent, suffix: "%" },
        { label: "Internal links not updated", value: 51, max: 100, colour: C.accent, suffix: "%" },
      ]}
    />
  </Figure>
);

const PLATFORMS_INTRO = (
  <Figure caption="Choosing a UK business website platform — five-question decision framework before you brief a designer.">
    <ProcessFlow
      titleId="pf-vis-1-title"
      descId="pf-vis-1-desc"
      title="Five questions before you choose a platform"
      desc="A five-question decision framework for choosing between WordPress, Shopify, Webflow, custom builds and other UK web platforms. Lead model and editor capability are the biggest deciders."
      steps={[
        { label: "Lead model?", sub: "Brochure or shop?" },
        { label: "Who edits?", sub: "Tech ability" },
        { label: "5-yr traffic?", sub: "Growth ceiling" },
        { label: "Integrations?", sub: "CRM, booking" },
      ]}
    />
  </Figure>
);

const PLATFORMS_CLOSE = (
  <Figure caption="UK web design platform pricing compared — typical build cost from launch to launch, ex-VAT.">
    <BarChart
      titleId="pf-vis-2-title"
      descId="pf-vis-2-desc"
      title="Typical UK web design build cost by platform"
      desc="Approximate fixed-quote build prices for WordPress, Shopify, Webflow and custom Astro / Next.js builds. Ranges reflect scope; lower bounds are starter/template-led, upper bounds bespoke."
      bars={[
        { label: "WordPress Starter", value: 1500, max: 8000, colour: C.secondary, suffix: " £" },
        { label: "WordPress Growth", value: 2750, max: 8000, colour: C.primary, suffix: " £+" },
        { label: "Shopify", value: 3500, max: 8000, colour: C.primary, suffix: " £" },
        { label: "Webflow", value: 4000, max: 8000, colour: C.accent, suffix: " £" },
        { label: "Custom Astro/Next", value: 6000, max: 8000, colour: C.accent, suffix: " £" },
      ]}
    />
  </Figure>
);

const INDUSTRIES_INTRO = (
  <Figure caption="UK web design budget by industry vertical — trust-sensitive sectors carry higher floor prices.">
    <BarChart
      titleId="ind-vis-1-title"
      descId="ind-vis-1-desc"
      title="UK web design starting price by industry"
      desc="Typical starting prices by industry. Small business and trades anchor at the Starter package; healthcare, legal and B2B services typically need Standard or Growth due to compliance content depth."
      bars={[
        { label: "Sole trader / trade", value: 1500, max: 4000, colour: C.secondary, suffix: " £" },
        { label: "Small business", value: 1500, max: 4000, colour: C.secondary, suffix: " £" },
        { label: "B2B services", value: 2000, max: 4000, colour: C.primary, suffix: " £" },
        { label: "Healthcare", value: 2500, max: 4000, colour: C.primary, suffix: " £" },
        { label: "Legal practice", value: 2750, max: 4000, colour: C.accent, suffix: " £+" },
      ]}
    />
  </Figure>
);

const INDUSTRIES_CLOSE = (
  <Figure caption="Trust signals by industry — healthcare and legal need credentials early; trades need photo proof and reviews.">
    <Hierarchy
      titleId="ind-vis-2-title"
      descId="ind-vis-2-desc"
      title="Trust signals by sector"
      desc="The trust signals that drive enquiry conversion vary by sector. Regulated industries lead with credentials; service trades lead with photo proof and reviews; B2B leads with case studies."
      root="Trust signals that convert"
      children={[
        { label: "Trades", sub: "Photo, reviews" },
        { label: "Healthcare", sub: "GMC/GDC, before/after" },
        { label: "Legal", sub: "SRA, partner bios" },
        { label: "B2B", sub: "Case studies, logos" },
      ]}
    />
  </Figure>
);

const PRICING_INTRO = (
  <Figure caption="What a £499 UK web design quote really costs — line items the headline price hides.">
    <BarChart
      titleId="pr-vis-1-title"
      descId="pr-vis-1-desc"
      title="The 'from £499' web design quote — real cost breakdown"
      desc="Common line items added to a £499 starter quote that bring the final invoice closer to £2,500. Each is included as standard in my Starter package at £1,500 — not billed separately."
      bars={[
        { label: "Headline", value: 499, max: 3000, colour: C.neutral, suffix: " £" },
        { label: "+ Custom design", value: 800, max: 3000, colour: C.accent, suffix: " £" },
        { label: "+ Schema/SEO", value: 400, max: 3000, colour: C.accent, suffix: " £" },
        { label: "+ Revisions", value: 300, max: 3000, colour: C.accent, suffix: " £" },
        { label: "+ Hosting yr1", value: 360, max: 3000, colour: C.accent, suffix: " £" },
        { label: "Real total", value: 2359, max: 3000, colour: C.primary, suffix: " £" },
      ]}
    />
  </Figure>
);

const PRICING_CLOSE = (
  <Figure caption="UK web design package and add-on pricing — fixed quotes, no surprise invoices.">
    <ComparisonMatrix
      titleId="pr-vis-2-title"
      descId="pr-vis-2-desc"
      title="Add-ons priced up front"
      desc="Common add-ons not included in the headline package price. Each is stated up front before signing so the final invoice matches the quote."
      cols={["Add-on", "Price", "Common?"]}
      rows={[
        "Copywriting / page",
        "Logo design",
        "WooCommerce setup",
        "CRM integration",
        "Maintenance / month",
      ]}
      cells={[
        ["Copy", "£80", "Often"],
        ["Logo", "£150-£400", "Sometimes"],
        ["Shop", "£500-£1,500", "Some"],
        ["CRM", "£150-£800", "Some"],
        ["Care", "£40", "Most"],
      ]}
    />
  </Figure>
);

const SEO_PERF_INTRO = (
  <Figure caption="The five SEO retrofit problems on existing UK business websites — fixable post-launch but cheaper to build right.">
    <BarChart
      titleId="sp-vis-1-title"
      descId="sp-vis-1-desc"
      title="SEO retrofit cost on existing sites (typical)"
      desc="Typical fix costs for the five most common SEO problems found on existing UK business websites. Together these regularly add up to a third or more of the original build cost."
      bars={[
        { label: "URL restructure", value: 600, max: 1500, colour: C.accent, suffix: " £" },
        { label: "Schema add", value: 400, max: 1500, colour: C.accent, suffix: " £" },
        { label: "Internal linking", value: 500, max: 1500, colour: C.accent, suffix: " £" },
        { label: "Core Web Vitals", value: 800, max: 1500, colour: C.accent, suffix: " £" },
        { label: "Indexation fix", value: 300, max: 1500, colour: C.accent, suffix: " £" },
      ]}
    />
  </Figure>
);

const SEO_PERF_CLOSE = (
  <Figure caption="The SEO and performance build checklist — what greens-on-launch means in practice.">
    <Hierarchy
      titleId="sp-vis-2-title"
      descId="sp-vis-2-desc"
      title="SEO and performance launch checklist"
      desc="The eight technical foundations checked at launch on every SEO-led WordPress build. Each is template-level rather than plugin-driven so it scales with the site."
      root="Greens at launch"
      children={[
        { label: "URL hierarchy", sub: "Hyphens, lc" },
        { label: "Schema graph", sub: "JSON-LD" },
        { label: "Sitemap", sub: "Filtered" },
        { label: "Robots", sub: "Explicit" },
        { label: "Canonicals", sub: "Self-ref" },
        { label: "Redirects", sub: "301s" },
        { label: "Trailing slash", sub: "Consistent" },
        { label: "HTTPS + HSTS", sub: "Hardened" },
      ]}
    />
  </Figure>
);

const REDESIGN_UX_INTRO = (
  <Figure caption="Should you redesign? The four-option decision tree before paying for a rebuild.">
    <ProcessFlow
      titleId="rdux-vis-1-title"
      descId="rdux-vis-1-desc"
      title="Redesign decision tree — four options at four price points"
      desc="The four common scopes I quote against when a UK business owner asks for a website redesign. About half the redesign enquiries I get land on a cheaper scope after diagnosis."
      steps={[
        { label: "UX fix", sub: "£400-£800" },
        { label: "Landing", sub: "£600-£1,500" },
        { label: "Redesign", sub: "£2,000+" },
        { label: "Rebuild", sub: "£3,500+" },
      ]}
    />
  </Figure>
);

const REDESIGN_UX_CLOSE = (
  <Figure caption="The UX changes with the highest payback on UK business websites — ordered by enquiry-rate impact.">
    <BarChart
      titleId="rdux-vis-2-title"
      descId="rdux-vis-2-desc"
      title="UX changes ranked by enquiry impact"
      desc="The single-change UX improvements with the highest measurable lift on UK service business enquiry rates. Most are sub-£500 sprints; combined they often outperform a full redesign."
      bars={[
        { label: "Phone in header", value: 35, max: 50, colour: C.secondary, suffix: "%" },
        { label: "Form to 3 fields", value: 28, max: 50, colour: C.secondary, suffix: "%" },
        { label: "State 'from £' price", value: 24, max: 50, colour: C.primary, suffix: "%" },
        { label: "Sticky mobile CTA", value: 18, max: 50, colour: C.primary, suffix: "%" },
        { label: "Real photos", value: 14, max: 50, colour: C.accent, suffix: "%" },
      ]}
    />
  </Figure>
);

const PROOF_INTRO = (
  <Figure caption="Three measures of UK web design success — enquiries first, rankings second, technical floor third.">
    <Hierarchy
      titleId="pr-pr-vis-1-title"
      descId="pr-pr-vis-1-desc"
      title="How I judge a website's success"
      desc="The three measures used to judge whether a UK business website has done its job. Enquiries are the only revenue-linked measure; the others are leading indicators."
      root="Did the site work?"
      children={[
        { label: "Enquiries", sub: "Phone + form" },
        { label: "Rankings", sub: "Commercial intent" },
        { label: "Tech floor", sub: "CWV + a11y" },
      ]}
    />
  </Figure>
);

const PROOF_CLOSE = (
  <Figure caption="Aatma Aesthetics outcomes after the redesign — local pack, organic and enquiry trajectory at month 5.">
    <BarChart
      titleId="pr-pr-vis-2-title"
      descId="pr-pr-vis-2-desc"
      title="Aatma Aesthetics — month 5 outcome indicators"
      desc="Indicative outcomes for the Aatma Aesthetics redesign at month five post-launch. Numbers shown directionally; full case study covers methodology and Search Console data."
      bars={[
        { label: "Local pack visibility", value: 1, max: 1, colour: C.secondary },
        { label: "Organic growth (YoY)", value: 1, max: 1, colour: C.secondary },
        { label: "Core Web Vitals", value: 1, max: 1, colour: C.secondary },
        { label: "Enquiry uplift", value: 1, max: 1, colour: C.secondary },
      ]}
    />
  </Figure>
);

const PORTFOLIO_INTRO = (
  <Figure caption="How I curate the UK web design portfolio — four criteria before a build is published.">
    <Hierarchy
      titleId="por-vis-1-title"
      descId="por-vis-1-desc"
      title="Portfolio curation criteria"
      desc="The four criteria a build must meet before it goes onto the public portfolio. The result is a smaller portfolio than most agencies show, and a higher signal-to-noise ratio."
      root="Published only if"
      children={[
        { label: "I led design", sub: "+ build" },
        { label: "Outcome measurable", sub: "Numbers" },
        { label: "Client named", sub: "Permission" },
        { label: "Site live", sub: "As shipped" },
      ]}
    />
  </Figure>
);

const PORTFOLIO_CLOSE = (
  <Figure caption="The kind of UK web design work I take on next — sectors and scopes most likely to convert into enquiries.">
    <BarChart
      titleId="por-vis-2-title"
      descId="por-vis-2-desc"
      title="Most active enquiry types, 2026"
      desc="Distribution of active website design enquiries by build type. WordPress small business and redesign of existing sites dominate; B2B Growth-package builds are growing."
      bars={[
        { label: "Small business WP", value: 38, max: 50, colour: C.primary, suffix: "%" },
        { label: "Redesign existing", value: 32, max: 50, colour: C.primary, suffix: "%" },
        { label: "B2B Growth pkg", value: 14, max: 50, colour: C.secondary, suffix: "%" },
        { label: "Healthcare", value: 9, max: 50, colour: C.accent, suffix: "%" },
        { label: "Other", value: 7, max: 50, colour: C.neutral, suffix: "%" },
      ]}
    />
  </Figure>
);

const CASESTUDIES_INTRO = (
  <Figure caption="Aatma Aesthetics — the diagnosis findings that drove the website redesign brief.">
    <BarChart
      titleId="cs-vis-1-title"
      descId="cs-vis-1-desc"
      title="Aatma Aesthetics — pre-redesign issues found"
      desc="The five technical and conversion issues found during the free pre-redesign diagnosis on the Aatma Aesthetics website. Each was scoped into the redesign and fixed at launch."
      bars={[
        { label: "Avg position", value: 30, max: 30, colour: C.accent, suffix: "" },
        { label: "LCP (sec, mobile)", value: 4, max: 5, colour: C.accent },
        { label: "Treatment pg words", value: 400, max: 1200, colour: C.accent },
        { label: "Schema types", value: 1, max: 8, colour: C.accent },
        { label: "Service area pages", value: 0, max: 5, colour: C.accent },
      ]}
    />
  </Figure>
);

const CASESTUDIES_CLOSE = (
  <Figure caption="Aatma Aesthetics — the redesign methodology, six-step process from diagnosis to launch.">
    <ProcessFlow
      titleId="cs-vis-2-title"
      descId="cs-vis-2-desc"
      title="The Aatma redesign methodology"
      desc="Six-step methodology applied to the Aatma Aesthetics redesign — diagnosis, architecture, content depth, schema, mobile UX, and launch. Same methodology applies to every healthcare and trust-sensitive build."
      steps={[
        { label: "Diagnose", sub: "GSC + audit" },
        { label: "Architect", sub: "Treatment IA" },
        { label: "Deepen", sub: "1,000-wd pages" },
        { label: "Schema", sub: "Medical graph" },
      ]}
    />
  </Figure>
);

// ── Lookup map ───────────────────────────────────────────────────────────

const VISUALS: Record<string, Visual> = {
  "website-design": { intro: ROOT_INTRO, close: ROOT_CLOSE },
  wordpress: { intro: WORDPRESS_INTRO, close: WORDPRESS_CLOSE },
  "small-business": { intro: SMALLBIZ_INTRO, close: SMALLBIZ_CLOSE },
  packages: { intro: PACKAGES_INTRO, close: PACKAGES_CLOSE },
  seo: { intro: SEO_INTRO, close: SEO_CLOSE },
  redesign: { intro: REDESIGN_INTRO, close: REDESIGN_CLOSE },
  platforms: { intro: PLATFORMS_INTRO, close: PLATFORMS_CLOSE },
  industries: { intro: INDUSTRIES_INTRO, close: INDUSTRIES_CLOSE },
  pricing: { intro: PRICING_INTRO, close: PRICING_CLOSE },
  "seo-performance": { intro: SEO_PERF_INTRO, close: SEO_PERF_CLOSE },
  "redesign-ux": { intro: REDESIGN_UX_INTRO, close: REDESIGN_UX_CLOSE },
  proof: { intro: PROOF_INTRO, close: PROOF_CLOSE },
  portfolio: { intro: PORTFOLIO_INTRO, close: PORTFOLIO_CLOSE },
  "case-studies": { intro: CASESTUDIES_INTRO, close: CASESTUDIES_CLOSE },
};

export function getWebsiteDesignVisuals(slug: string): Visual | null {
  return VISUALS[slug] ?? null;
}
