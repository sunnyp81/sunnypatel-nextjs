"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { GlowCard } from "@/components/ui/glow-card";
import { trackEvent } from "@/lib/analytics";
import styles from "./local-pack-calculator.module.css";

const CTR: Record<string, number> = { "1": 17.8, "2": 13.6, "3": 10.4, out: 0 };
const PROFILE_ITEMS = [
  { id: "cat", label: "Primary and secondary categories set", short: "categories" },
  { id: "svc", label: "Services listed", short: "services" },
  { id: "desc", label: "Full business description", short: "description" },
  { id: "hours", label: "Opening hours, including bank holidays", short: "opening hours" },
  { id: "photos", label: "Recent photos", short: "photos" },
  { id: "qa", label: "Q&A answered", short: "Q&A" },
];
const REVIEW_THRESHOLD = 50;
const TOP3_AVG_REVIEWS = 561;

type State = {
  searches: string;
  position: string;
  reviews: string;
  rival: string;
  value: string;
  rate: string;
  profile: string[];
};

const EMPTY: State = { searches: "", position: "", reviews: "", rival: "", value: "", rate: "", profile: [] };

function num(v: string) {
  const n = Number(v.replace(/[,£%\s]/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

const fmt = (n: number) => Math.round(n).toLocaleString("en-GB");

function encode(s: State) {
  const p = new URLSearchParams();
  (["searches", "position", "reviews", "rival", "value", "rate"] as const).forEach((k) => s[k] && p.set(k, s[k]));
  if (s.profile.length) p.set("profile", s.profile.join("."));
  return p.toString();
}

function decode(hash: string): State | null {
  if (!hash.startsWith("#calc?")) return null;
  const p = new URLSearchParams(hash.slice(6));
  const s: State = { ...EMPTY };
  (["searches", "position", "reviews", "rival", "value", "rate"] as const).forEach((k) => {
    const v = p.get(k);
    if (v) s[k] = v.slice(0, 12);
  });
  if (!(s.position in CTR)) s.position = "";
  s.profile = (p.get("profile") || "").split(".").filter((id) => PROFILE_ITEMS.some((i) => i.id === id));
  return s;
}

export function LocalPackCalculator({ variant }: { variant?: "dental" }) {
  const [s, setS] = useState<State>(EMPTY);
  const [copied, setCopied] = useState(false);
  const tracked = useRef(false);
  const dental = variant === "dental";
  const uid = dental ? "lpc-dental" : "lpc";

  useEffect(() => {
    const restored = decode(window.location.hash);
    if (restored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setS(restored);
      requestAnimationFrame(() => document.getElementById("calc")?.scrollIntoView({ block: "start" }));
    }
  }, []);

  const set = <K extends keyof State>(k: K, v: State[K]) => {
    setS((prev) => ({ ...prev, [k]: v }));
    if (!tracked.current) {
      tracked.current = true;
      trackEvent("local_pack_calc_used", { variant: variant || "general" });
    }
  };

  const r = useMemo(() => {
    const searches = num(s.searches);
    const reviews = num(s.reviews);
    const rival = num(s.rival);
    const value = num(s.value);
    const rate = num(s.rate);
    const ctr = s.position ? CTR[s.position] : null;
    const now = searches !== null && ctr !== null ? Math.round((searches * ctr) / 100) : null;
    const top = searches !== null ? Math.round((searches * CTR["1"]) / 100) : null;
    const gap = now !== null && top !== null ? top - now : null;
    const money = gap !== null && value !== null && rate !== null && rate <= 100 ? gap * (rate / 100) * value : null;
    const missing = PROFILE_ITEMS.filter((i) => !s.profile.includes(i.id));

    const actions: { title: string; body: string }[] = [];
    if (missing.length) {
      actions.push({
        title: `Finish your Business Profile: ${missing.length} of ${PROFILE_ITEMS.length} items missing`,
        body: `Missing: ${missing.map((m) => m.short).join(", ")}. Google says a complete profile earns 7x more clicks than an incomplete one, and only 44% of profiles are fully optimised (SOCi). This is the cheapest fix on the list.`,
      });
    }
    if (reviews !== null && reviews < REVIEW_THRESHOLD) {
      actions.push({
        title: `Get to ${REVIEW_THRESHOLD} reviews: ${fmt(REVIEW_THRESHOLD - reviews)} to go`,
        body: `Businesses with 50 or more reviews are 266% more likely to appear in the Local Pack (BrightLocal). Recency counts too, so a steady trickle beats a one-off push.`,
      });
    }
    if (reviews !== null && rival !== null && rival > reviews) {
      actions.push({
        title: `Close the review gap: ${fmt(rival - reviews)} behind the business in position 1`,
        body: `Top-three pack listings average ${TOP3_AVG_REVIEWS} reviews each. You don't need to match that overnight, but a gap this size is visible to anyone comparing you side by side.`,
      });
    }
    if (s.position && s.position !== "1" && gap !== null && gap > 0) {
      actions.push({
        title:
          s.position === "out"
            ? `Get into the pack: about ${fmt(top!)} clicks a month at position 1`
            : `Move from position ${s.position} to 1: about ${fmt(gap)} more clicks a month`,
        body: `Pack rankings mostly come down to relevance, distance and prominence. Categories, reviews and local links are the levers you control.`,
      });
    }
    return { searches, reviews, rival, now, top, gap, money, missing, actions };
  }, [s]);

  const hasOutput = r.now !== null || r.reviews !== null || s.profile.length > 0;

  const copyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#calc?${encode(s)}`;
    try {
      await navigator.clipboard.writeText(url);
      window.history.replaceState(null, "", `#calc?${encode(s)}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.history.replaceState(null, "", `#calc?${encode(s)}`);
    }
  };

  return (
    <GlowCard className={`not-prose ${styles.wrap}`}>
      <section id="calc" className={styles.card} aria-labelledby={`${uid}-title`}>
        <p className={styles.eyebrow}>Free calculator</p>
        <h2 id={`${uid}-title`} className={styles.title}>
          {dental ? "How many patients is your Local Pack spot worth?" : "What is your Local Pack position worth?"}
        </h2>
        <p className={styles.lede}>
          Plug in your own numbers to see the clicks you&apos;re likely getting from the map pack now, what position 1 would
          add, and which fix to do first. It runs in your browser: nothing you type is sent anywhere.
        </p>

        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor={`${uid}-searches`}>
              Monthly searches for your main {dental ? "treatment + town" : "service + town"} term
            </label>
            <input
              id={`${uid}-searches`}
              inputMode="numeric"
              placeholder="e.g. 500"
              value={s.searches}
              onChange={(e) => set("searches", e.target.value)}
            />
            <span className={styles.hint}>Google Keyword Planner, or impressions in Search Console.</span>
          </div>

          <fieldset className={styles.field}>
            <legend>Where you sit in the map pack</legend>
            <div className={styles.segment}>
              {[
                ["1", "1st"],
                ["2", "2nd"],
                ["3", "3rd"],
                ["out", "Not in top 3"],
              ].map(([v, l]) => (
                <label key={v} className={s.position === v ? styles.segOn : ""}>
                  <input
                    type="radio"
                    name={`${uid}-pos`}
                    value={v}
                    checked={s.position === v}
                    onChange={() => set("position", v)}
                  />
                  {l}
                </label>
              ))}
            </div>
            <span className={styles.hint}>Check in a logged-out browser, not your own phone.</span>
          </fieldset>

          <div className={styles.field}>
            <label htmlFor={`${uid}-reviews`}>Your Google reviews</label>
            <input
              id={`${uid}-reviews`}
              inputMode="numeric"
              placeholder="e.g. 34"
              value={s.reviews}
              onChange={(e) => set("reviews", e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor={`${uid}-rival`}>
              Reviews on the {dental ? "practice" : "business"} in position 1 <span className={styles.opt}>optional</span>
            </label>
            <input
              id={`${uid}-rival`}
              inputMode="numeric"
              placeholder="e.g. 210"
              value={s.rival}
              onChange={(e) => set("rival", e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor={`${uid}-value`}>
              Value of a new {dental ? "patient" : "customer"} (£) <span className={styles.opt}>optional</span>
            </label>
            <input
              id={`${uid}-value`}
              inputMode="decimal"
              placeholder={dental ? "e.g. 400" : "e.g. 250"}
              value={s.value}
              onChange={(e) => set("value", e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor={`${uid}-rate`}>
              % of clicks that become {dental ? "patients" : "customers"} <span className={styles.opt}>optional</span>
            </label>
            <input
              id={`${uid}-rate`}
              inputMode="decimal"
              placeholder="your own figure, e.g. 5"
              value={s.rate}
              onChange={(e) => set("rate", e.target.value)}
            />
          </div>

          <fieldset className={`${styles.field} ${styles.full}`}>
            <legend>Tick what your Google Business Profile already has</legend>
            <div className={styles.checks}>
              {PROFILE_ITEMS.map((item) => (
                <label key={item.id}>
                  <input
                    type="checkbox"
                    checked={s.profile.includes(item.id)}
                    onChange={(e) =>
                      set(
                        "profile",
                        e.target.checked ? [...s.profile, item.id] : s.profile.filter((x) => x !== item.id),
                      )
                    }
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className={styles.results} aria-live="polite">
          {!hasOutput ? (
            <p className={styles.empty}>Your results appear here as you fill in the form.</p>
          ) : (
            <>
              <div className={styles.tiles}>
                {r.now !== null ? (
                  <div className={styles.tile}>
                    <span className={styles.big}>{fmt(r.now)}</span>
                    <span>estimated pack clicks a month now</span>
                  </div>
                ) : null}
                {r.top !== null && s.position !== "1" && s.position ? (
                  <div className={styles.tile}>
                    <span className={`${styles.big} ${styles.gold}`}>+{fmt(r.gap ?? 0)}</span>
                    <span>more a month at position 1 (about {fmt(r.top)} total)</span>
                  </div>
                ) : null}
                {r.money !== null && r.money > 0 ? (
                  <div className={styles.tile}>
                    <span className={`${styles.big} ${styles.gold}`}>£{fmt(r.money)}</span>
                    <span>a month in new {dental ? "patient" : "customer"} value that gap represents, on your figures</span>
                  </div>
                ) : null}
                {s.profile.length > 0 || r.missing.length < PROFILE_ITEMS.length ? (
                  <div className={styles.tile}>
                    <span className={styles.big}>
                      {PROFILE_ITEMS.length - r.missing.length}/{PROFILE_ITEMS.length}
                    </span>
                    <span>Business Profile essentials in place</span>
                  </div>
                ) : null}
              </div>

              {r.now !== null && r.top !== null ? (
                <div className={styles.bars} aria-hidden="true">
                  {[
                    ["You now", r.now],
                    ["Position 1", r.top],
                  ].map(([label, v]) => (
                    <div key={label as string} className={styles.barRow}>
                      <span>{label}</span>
                      <div className={styles.track}>
                        <div
                          className={label === "Position 1" ? styles.fillGold : styles.fill}
                          style={{ width: `${r.top ? Math.max(1.5, ((v as number) / r.top) * 100) : 0}%` }}
                        />
                      </div>
                      <span className={styles.barVal}>{fmt(v as number)}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              {r.actions.length ? (
                <>
                  <p className={styles.subhead}>What to fix first</p>
                  <ol className={styles.actions}>
                    {r.actions.map((a) => (
                      <li key={a.title}>
                        <strong>{a.title}</strong>
                        <span>{a.body}</span>
                      </li>
                    ))}
                  </ol>
                </>
              ) : r.now !== null && s.position === "1" && r.missing.length === 0 ? (
                <p className={styles.subhead}>
                  Position 1 with a complete profile. The job now is defending it: keep reviews coming in steadily.
                </p>
              ) : null}

              <div className={styles.footer}>
                <button type="button" className={styles.copy} onClick={copyLink}>
                  {copied ? "Link copied" : "Copy a link to these results"}
                </button>
                <Link href="/contact/" className={styles.cta} data-cta-offer="free_20_minute_seo_diagnosis">
                  Get a free 20-minute diagnosis
                </Link>
              </div>
            </>
          )}
        </div>

        <p className={styles.note}>
          Estimates use the benchmarks on this page: Local Pack click-through rates of 17.8%, 13.6% and 10.4% for positions
          1 to 3 (BrightLocal, 2026){dental ? ", which are general local-business figures, not dental-specific" : ""}. They
          are averages, not a forecast for your {dental ? "practice" : "business"}. Pack clicks outside the top three
          aren&apos;t covered by the data, so they count as zero here.
        </p>
      </section>
    </GlowCard>
  );
}
