"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { GlowCard } from "@/components/ui/glow-card";
import { trackEvent } from "@/lib/analytics";
import s from "./local-pack-calculator.module.css";
import t from "./buyer-tools.module.css";

type Band = { name: string; min: number; max: number; open?: boolean };

const gbp = (n: number) => `£${n.toLocaleString("en-GB")}`;
const bandText = (b: Band) => `${gbp(b.min)}-${gbp(b.max)}${b.open ? "+" : ""}`;

const AMOUNT_RE = /^£?(\d{1,3}(,\d{3})+|\d+)(\.\d{1,2})?$/;

function parseAmount(v: string): { n: number | null; invalid: boolean } {
  const x = v.trim().replace(/\s/g, "");
  if (!x) return { n: null, invalid: false };
  if (!AMOUNT_RE.test(x)) return { n: null, invalid: true };
  const n = Number(x.replace(/[£,]/g, ""));
  return n > 0 ? { n, invalid: false } : { n: null, invalid: true };
}

function useTrackOnce(name: string) {
  const done = useRef(false);
  return () => {
    if (done.current) return;
    done.current = true;
    trackEvent(name, { page: typeof window !== "undefined" ? window.location.pathname : "" });
  };
}

/* ---------- Tool 1: SEO quote checker ---------- */

const RATE_BANDS: Record<"retainer" | "day" | "hour", { unit: string; bands: Band[] }> = {
  retainer: {
    unit: "/month",
    bands: [
      { name: "Entry-level", min: 300, max: 800 },
      { name: "Mid-level", min: 800, max: 2000 },
      { name: "Senior consultant", min: 1500, max: 4000 },
      { name: "Expert / niche specialist", min: 3000, max: 8000, open: true },
    ],
  },
  day: {
    unit: "/day",
    bands: [
      { name: "Entry-level (0-3 years)", min: 200, max: 400 },
      { name: "Mid-level (3-7 years)", min: 400, max: 700 },
      { name: "Senior (7-12 years)", min: 700, max: 1200 },
      { name: "Expert / specialist (12+ years)", min: 1200, max: 2500, open: true },
    ],
  },
  hour: {
    unit: "/hour",
    bands: [
      { name: "Entry-level", min: 40, max: 80 },
      { name: "Mid-level", min: 80, max: 150 },
      { name: "Senior", min: 150, max: 250 },
      { name: "Expert", min: 250, max: 500, open: true },
    ],
  },
};

const PROJECTS: Band[] = [
  { name: "Technical SEO audit (small site, <100 pages)", min: 500, max: 800 },
  { name: "Technical SEO audit (medium site, 100-500 pages)", min: 800, max: 1500 },
  { name: "Technical SEO audit (large site, 500+ pages)", min: 1500, max: 3000, open: true },
  { name: "Topical map / content architecture", min: 800, max: 3000 },
  { name: "Keyword research and strategy document", min: 500, max: 2000 },
  { name: "Content brief production (per brief)", min: 150, max: 400 },
  { name: "SEO strategy document (12-month roadmap)", min: 1500, max: 4000 },
  { name: "Algorithm penalty recovery assessment", min: 1000, max: 3000 },
];

const BUDGETS: Record<string, { label: string; minimum: Band; appropriate: Band }> = {
  local: {
    label: "Small local business",
    minimum: { name: "Minimum meaningful investment", min: 800, max: 1500 },
    appropriate: { name: "Appropriate range", min: 1000, max: 2500 },
  },
  sme: {
    label: "Growing SME",
    minimum: { name: "Minimum meaningful investment", min: 1500, max: 2000 },
    appropriate: { name: "Appropriate range", min: 2000, max: 4000 },
  },
  scale: {
    label: "Scale-up or larger business",
    minimum: { name: "Minimum meaningful investment", min: 3000, max: 4000 },
    appropriate: { name: "Appropriate range", min: 4000, max: 8000, open: true },
  },
};

const QUOTE_FLAGS = [
  {
    id: "guarantee",
    label: "They guarantee rankings for a fixed price",
    why: "Google's algorithm cannot be guaranteed. Anyone promising first-page rankings for specific terms by a specific date is either chasing low-competition terms with minimal business value, or making a promise they cannot keep.",
  },
  {
    id: "lockin",
    label: "Contract over 12 months without deliverable milestones",
    why: "Long contracts without clearly defined deliverables and review points protect the agency, not the client.",
  },
  {
    id: "who",
    label: "No clear answer on who will do the work",
    why: "If you cannot get a clear answer about which specific person will be doing the SEO work on your account, and what their experience level is, that is worth investigating before you sign.",
  },
  {
    id: "rigid",
    label: "Same fixed price and scope, whatever changes",
    why: "A rigid fixed price for the same scope month after month often signals that the work has become templated and the strategic thinking has stopped.",
  },
];

function position(amount: number, b: Band): "below" | "within" | "above" | "open-above" {
  if (amount < b.min) return "below";
  if (amount <= b.max) return "within";
  return b.open ? "open-above" : "above";
}

const posText = (p: ReturnType<typeof position>) =>
  p === "below" ? "below" : p === "within" ? "within" : "above";

export function SeoQuoteChecker() {
  const [type, setType] = useState<"retainer" | "day" | "hour" | "project">("retainer");
  const [amount, setAmount] = useState("");
  const [biz, setBiz] = useState("");
  const [project, setProject] = useState(PROJECTS[0].name);
  const [flags, setFlags] = useState<string[]>([]);
  const track = useTrackOnce("quote_checker_used");

  const r = useMemo(() => {
    const { n } = parseAmount(amount);
    if (n === null) return null;
    if (type === "project") {
      const b = PROJECTS.find((p) => p.name === project)!;
      return { n, kind: "project" as const, band: b, pos: position(n, b) };
    }
    const { bands, unit } = RATE_BANDS[type];
    const matches = bands.filter((b) => n >= b.min && (n <= b.max || b.open));
    const top = bands[bands.length - 1];
    const budget = type === "retainer" && biz ? BUDGETS[biz] : null;
    return {
      n,
      kind: "rate" as const,
      unit,
      matches,
      belowAll: n < bands[0].min,
      aboveTopRef: n > top.max,
      topRef: top,
      under300: type === "retainer" && n < 300,
      budget: budget
        ? { label: budget.label, min: budget.minimum, minPos: position(n, budget.minimum), app: budget.appropriate, appPos: position(n, budget.appropriate) }
        : null,
    };
  }, [amount, type, biz, project]);

  const ticked = QUOTE_FLAGS.filter((f) => flags.includes(f.id));
  const invalid = parseAmount(amount).invalid;

  return (
    <GlowCard className={`not-prose ${s.wrap}`}>
      <section className={s.card} aria-labelledby="qc-title">
        <p className={s.eyebrow}>Free quote checker</p>
        <h2 id="qc-title" className={s.title}>
          How does your SEO quote compare?
        </h2>
        <p className={s.lede}>
          Enter a quote you&apos;ve been given and see which of this page&apos;s 2026 price bands it falls into, how it sits
          against the budget ranges for your type of business, and what to ask before you sign. It runs in your browser:
          nothing you type is sent anywhere.
        </p>

        <div className={s.grid}>
          <fieldset className={`${s.field} ${s.full}`}>
            <legend>What kind of quote is it?</legend>
            <div className={`${s.segment} ${t.seg4}`}>
              {(
                [
                  ["retainer", "Monthly retainer"],
                  ["day", "Day rate"],
                  ["hour", "Hourly rate"],
                  ["project", "One-off project"],
                ] as const
              ).map(([v, l]) => (
                <label key={v} className={type === v ? s.segOn : ""}>
                  <input
                    type="radio"
                    name="qc-type"
                    checked={type === v}
                    onChange={() => {
                      setType(v);
                      track();
                    }}
                  />
                  {l}
                </label>
              ))}
            </div>
          </fieldset>

          {type === "project" ? (
            <div className={`${s.field} ${s.full}`}>
              <label htmlFor="qc-project">Project type</label>
              <select
                id="qc-project"
                className={t.select}
                value={project}
                onChange={(e) => {
                  setProject(e.target.value);
                  track();
                }}
              >
                {PROJECTS.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className={s.field}>
            <label htmlFor="qc-amount">
              Quoted price (£{type === "retainer" ? " per month" : type === "day" ? " per day" : type === "hour" ? " per hour" : ""})
            </label>
            <input
              id="qc-amount"
              inputMode="decimal"
              aria-invalid={invalid || undefined}
              aria-describedby={invalid ? "qc-amount-error" : undefined}
              placeholder="e.g. 1,200"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                track();
              }}
            />
            {invalid ? (
              <span id="qc-amount-error" className={t.error}>
                Enter a number in pounds, like 1,200 or 1200.
              </span>
            ) : null}
          </div>

          {type === "retainer" ? (
            <div className={s.field}>
              <label htmlFor="qc-biz">
                Your business <span className={s.opt}>optional</span>
              </label>
              <select id="qc-biz" className={t.select} value={biz} onChange={(e) => setBiz(e.target.value)}>
                <option value="">Choose one</option>
                {Object.entries(BUDGETS).map(([k, b]) => (
                  <option key={k} value={k}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <fieldset className={`${s.field} ${s.full}`}>
            <legend>Tick anything that applies to this quote</legend>
            <div className={s.checks}>
              {QUOTE_FLAGS.map((f) => (
                <label key={f.id}>
                  <input
                    type="checkbox"
                    checked={flags.includes(f.id)}
                    onChange={(e) => {
                      setFlags(e.target.checked ? [...flags, f.id] : flags.filter((x) => x !== f.id));
                      track();
                    }}
                  />
                  {f.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className={s.results}>
          <p className={t.summary} aria-live="polite">
            {r === null
              ? invalid
                ? "Check the price format."
                : "Enter a price to see where it sits."
              : r.kind === "project"
                ? r.pos === "open-above"
                  ? `${gbp(r.n)} is above ${gbp(r.band.max)}, the top reference figure for this project. The page gives no upper limit for it.`
                  : `${gbp(r.n)} is ${posText(r.pos)} the typical range for this project (${bandText(r.band)}).`
                : r.belowAll
                  ? `${gbp(r.n)}${r.unit} is below the lowest published band.`
                  : `${gbp(r.n)}${r.unit} matches: ${r.matches.map((m) => m.name).join(" and ")}.`}
          </p>

          {r?.kind === "rate" ? (
            <ul className={t.bandList} aria-label="Published price bands">
              {RATE_BANDS[type as "retainer" | "day" | "hour"].bands.map((b) => {
                const hit = r.matches.includes(b);
                return (
                  <li key={b.name} className={hit ? t.bandHit : ""}>
                    <span>{b.name}</span>
                    <span className={t.bandRange}>
                      {bandText(b)}
                      {r.unit}
                    </span>
                    <span className={t.bandTag}>{hit ? "Matches" : ""}</span>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {r?.kind === "rate" && r.aboveTopRef ? (
            <p className={t.para}>
              That is above {gbp(r.topRef.max)}
              {r.unit}, the top reference figure the page lists. The {r.topRef.name.toLowerCase()} range has no upper
              limit, so a higher price isn&apos;t automatically wrong: ask what the extra covers.
            </p>
          ) : null}

          {r?.kind === "project" && r.pos === "below" ? (
            <p className={t.para}>
              Below the typical range isn&apos;t automatically a problem: some fixed-fee offers sit there. Check exactly what
              is included and who does the work.
            </p>
          ) : null}

          {r?.kind === "rate" && r.budget ? (
            <div className={t.budget}>
              <p className={s.subhead}>Against the budget ranges for a {r.budget.label.toLowerCase()}</p>
              <ul className={t.plain}>
                <li>
                  {r.budget.min.name} ({bandText(r.budget.min)}/month): your quote is <strong>{posText(r.budget.minPos)}</strong>{" "}
                  this range.
                </li>
                <li>
                  {r.budget.app.name} ({bandText(r.budget.app)}/month):{" "}
                  {r.budget.appPos === "open-above" ? (
                    <>
                      your quote is <strong>above the {gbp(r.budget.app.max)} reference figure</strong>. The range has no
                      upper limit.
                    </>
                  ) : (
                    <>
                      your quote is <strong>{posText(r.budget.appPos)}</strong> this range.
                    </>
                  )}
                </li>
              </ul>
              <p className={t.para}>
                The minimum figures are the point below which there is typically not enough resource for the strategy,
                implementation and iteration that produce sustained organic growth.
              </p>
            </div>
          ) : null}

          {(r?.kind === "rate" && r.under300) || ticked.length ? (
            <>
              <p className={s.subhead}>Worth questioning</p>
              <ul className={t.flagList}>
                {r?.kind === "rate" && r.under300 ? (
                  <li>
                    <strong>Below £300/month.</strong> At this price point, no credible SEO practitioner is covering the
                    hours required for meaningful strategic work.
                  </li>
                ) : null}
                {ticked.map((f) => (
                  <li key={f.id}>
                    <strong>{f.label}.</strong> {f.why}
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {r !== null ? (
            <>
              <p className={s.subhead}>Ask before you sign</p>
              {type === "project" ? (
                <ol className={s.actions}>
                  <li>
                    <strong>Who exactly will do the work, and at what experience level?</strong>
                  </li>
                  <li>
                    <strong>What exactly is delivered, and in what format?</strong>
                  </li>
                  <li>
                    <strong>When will it be finished?</strong>
                  </li>
                  <li>
                    <strong>Are the recommendations specific and prioritised, or a long generic list?</strong>
                  </li>
                </ol>
              ) : (
                <ol className={s.actions}>
                  <li>
                    <strong>Who exactly will do the work, and at what experience level?</strong>
                  </li>
                  <li>
                    <strong>What will you deliver each month, and when do we review it?</strong>
                  </li>
                  <li>
                    <strong>What timeline do you expect?</strong>
                    <span>SEO typically takes 6-12 months for competitive terms, not 4-8 weeks.</span>
                  </li>
                  <li>
                    <strong>Is it on monthly rolling terms?</strong>
                  </li>
                  <li>
                    <strong>Will you report rankings and business outcomes, not just traffic and impressions?</strong>
                  </li>
                </ol>
              )}
              <p className={t.para}>
                Price alone doesn&apos;t tell you whether a quote is good value. The page&apos;s measure is organic growth
                relative to what you spend.
              </p>
              <div className={s.footer}>
                <Link href="/contact/" className={s.cta} data-cta-offer="free_20_minute_seo_diagnosis">
                  Get a free 20-minute second opinion
                </Link>
              </div>
            </>
          ) : null}
        </div>

        <p className={s.note}>
          Bands and budget ranges are the 2026 UK benchmarks published on this page. They overlap by design, so one price
          can match more than one band. A match describes the price, not the provider&apos;s actual experience.
        </p>
      </section>
    </GlowCard>
  );
}

/* ---------- Tool 2: agency red flag scorer ---------- */

const AGENCY_FLAGS = [
  {
    id: "gsc",
    label: "No Google Search Console owner access",
    why: "You should have owner access from day one. Non-negotiable.",
    critical: true,
  },
  {
    id: "da",
    label: "Domain Authority is the headline metric",
    why: "DA is not a Google ranking factor, it's a third-party estimate.",
  },
  {
    id: "brand",
    label: "Reports show brand keyword rankings",
    why: "You'd rank for your own name without an agency. This is padding.",
  },
  {
    id: "template",
    label: "Same report template every month",
    why: "Copy-paste analysis means nobody actually reviewed your data.",
  },
  {
    id: "competitor",
    label: "No competitor analysis included",
    why: "SEO without competitor context is flying blind.",
  },
  {
    id: "fixes",
    label: "No technical fixes log in reports",
    why: "If they can't list what they fixed, they probably didn't fix anything.",
  },
];

export function AgencyRedFlagScorer() {
  const [on, setOn] = useState<string[]>([]);
  const track = useTrackOnce("agency_scorer_used");
  const score = on.length;
  const band = score <= 2 ? "Monitor closely" : score <= 4 ? "A serious talk is needed" : "Time to leave";
  const gsc = on.includes("gsc");

  return (
    <GlowCard className={`not-prose ${s.wrap}`}>
      <section className={s.card} aria-labelledby="ars-title">
        <p className={s.eyebrow}>Red flag scorecard</p>
        <h2 id="ars-title" className={s.title}>
          Score your SEO agency
        </h2>
        <p className={s.lede}>
          Tick every statement that&apos;s true of your agency. 0-2 flags means monitor closely, 3-4 means a serious talk is
          needed, 5 or more means it&apos;s time to leave.
        </p>

        <ul className={t.flagChecks}>
          {AGENCY_FLAGS.map((f) => {
            const checked = on.includes(f.id);
            return (
              <li key={f.id} className={checked ? t.flagOn : ""}>
                <label>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      setOn(e.target.checked ? [...on, f.id] : on.filter((x) => x !== f.id));
                      track();
                    }}
                  />
                  <span>
                    <strong>
                      {f.label}
                      {f.critical ? <span className={t.critical}>Critical</span> : null}
                    </strong>
                    <span className={t.why}>{f.why}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>

        <div className={s.results}>
          <div className={t.meterRow}>
            <span className={`${s.big} ${score >= 3 ? s.gold : ""}`}>
              {score}/{AGENCY_FLAGS.length}
            </span>
            <div className={t.meter} aria-hidden="true">
              {AGENCY_FLAGS.map((_, i) => (
                <span key={i} className={i < score ? (score >= 3 ? t.segGold : t.segBlue) : ""} />
              ))}
            </div>
          </div>
          <p className={t.summary} aria-live="polite">
            {score} {score === 1 ? "flag" : "flags"}: {band.toLowerCase()}.
          </p>

          {gsc ? (
            <p className={t.alert}>
              <strong>Fix GSC access first, whatever your score.</strong> Request owner access today. There is zero excuse for
              an agency withholding it at any point in the engagement, and if they push back, that tells you everything.
            </p>
          ) : null}

          <div className={s.footer}>
            {score >= 3 ? (
              <Link href="/services/technical-seo-audit/" className={s.cta}>
                3+ red flags: get a technical SEO audit
              </Link>
            ) : (
              <Link href="/contact/" className={s.cta} data-cta-offer="free_20_minute_seo_diagnosis">
                Get a free 20-minute second opinion
              </Link>
            )}
          </div>
        </div>
      </section>
    </GlowCard>
  );
}

/* ---------- Tool 3: resourcing picker ---------- */

const ROWS = ["Under £10K a month", "£10K to under £50K", "£50K to under £150K", "£150K+ a month"];
const ROW_SOURCE = ["Under £10K", "£10K-50K", "£50K-150K", "£150K+/mo"];
const COLS = ["No SEO resource", "Junior in-house", "Mid-level in-house", "Senior in-house"];
const CELLS = [
  [
    "Consultant, 1-2 days/mo, £500-1,500/mo",
    "Consultant strategy direction + exec support",
    "Premature: reduce overhead first",
    "Premature: significant overinvestment",
  ],
  [
    "Consultant, 2-4 days/mo, or agency £2K/mo",
    "Hybrid: consultant strategy + junior execution",
    "Agency or strong hybrid, £2-3K retainer",
    "In-house: self-sufficient but watch silo risk",
  ],
  [
    "Consultant, urgent: you're leaving growth unmanaged",
    "Hybrid: consultant + junior, best ROI at this stage",
    "Hybrid: mid-hire + consultant oversight, 2 days/mo",
    "In-house: senior lead, good annual consultant review",
  ],
  [
    "Hire urgently: SEO gap = revenue risk at this scale",
    "Hybrid: promote + consultant interim strategy",
    "In-house lead: dedicated channel ownership justified",
    "In-house team: full function, consider agency for link acquisition",
  ],
];

export function ResourcingPicker() {
  const [row, setRow] = useState<number | null>(null);
  const [col, setCol] = useState<number | null>(null);
  const track = useTrackOnce("resourcing_picker_used");
  const cell = row !== null && col !== null ? CELLS[row][col] : null;
  const [lead, ...rest] = cell ? cell.split(": ") : [""];
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = scrollRef.current;
    const td = box?.querySelector<HTMLElement>("[aria-current]");
    if (!box || !td) return;
    const left = td.offsetLeft - (box.clientWidth - td.offsetWidth) / 2;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    box.scrollTo({ left: Math.max(0, left), behavior: reduce ? "auto" : "smooth" });
  }, [row, col]);

  return (
    <GlowCard className={`not-prose ${s.wrap}`}>
      <section className={s.card} aria-labelledby="rp-title">
        <p className={s.eyebrow}>Match your stage and budget</p>
        <h2 id="rp-title" className={s.title}>
          Which SEO resourcing model fits you?
        </h2>
        <p className={s.lede}>
          Pick your monthly organic revenue and the SEO resource you have in-house. You get this article&apos;s starting
          recommendation for that combination: a framework, not a calculation, and it can&apos;t see things like developer
          access or procurement rules.
        </p>

        <div className={s.grid}>
          <fieldset className={s.field}>
            <legend>Monthly organic revenue</legend>
            <div className={t.stack}>
              {ROWS.map((l, i) => (
                <label key={l} className={row === i ? s.segOn : ""}>
                  <input
                    type="radio"
                    name="rp-row"
                    checked={row === i}
                    onChange={() => {
                      setRow(i);
                      track();
                    }}
                  />
                  {l}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className={s.field}>
            <legend>SEO resource you have now</legend>
            <div className={t.stack}>
              {COLS.map((l, i) => (
                <label key={l} className={col === i ? s.segOn : ""}>
                  <input
                    type="radio"
                    name="rp-col"
                    checked={col === i}
                    onChange={() => {
                      setCol(i);
                      track();
                    }}
                  />
                  {l}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className={s.results}>
          <div aria-live="polite">
            {cell ? (
              <div className={t.pick}>
                <span className={t.pickLead}>{rest.length ? lead : cell}</span>
                {rest.length ? <span className={t.pickRest}>{rest.join(": ")}</span> : null}
              </div>
            ) : (
              <p className={s.empty}>Choose both options to see the recommendation.</p>
            )}
          </div>

          <div ref={scrollRef} className={t.tableScroll} tabIndex={0} role="region" aria-label="SEO resourcing decision matrix, scrollable">
            <table className={t.matrix}>
              <caption className={t.caption}>SEO resourcing decision matrix</caption>
              <thead>
                <tr>
                  <th scope="col">Monthly organic revenue</th>
                  {COLS.map((c, j) => (
                    <th scope="col" key={c} className={col === j ? t.hiHead : ""}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[3, 2, 1, 0].map((i) => (
                  <tr key={i}>
                    <th scope="row" className={row === i ? t.hiHead : ""}>
                      {ROW_SOURCE[i]}
                    </th>
                    {CELLS[i].map((c, j) => {
                      const selected = row === i && col === j;
                      return (
                        <td
                          key={j}
                          className={selected ? t.cellOn : row === i || col === j ? t.cellLine : ""}
                          aria-current={selected ? "true" : undefined}
                        >
                          {selected ? <span className={t.srOnly}>Selected: </span> : null}
                          {c}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={s.footer}>
            <a href="#resourcing-costs" className={s.copy}>
              See the cost comparison
            </a>
            <Link href="/contact/" className={s.cta} data-cta-offer="free_20_minute_seo_diagnosis">
              Talk it through: free 20-minute call
            </Link>
          </div>
        </div>
      </section>
    </GlowCard>
  );
}
