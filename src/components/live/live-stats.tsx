import type { ReactNode } from "react";
import Link from "next/link";
import aiReferrals from "@/data/live/ai-referrals.json";
import updateTracker from "@/data/live/update-tracker.json";

const SITE = "https://sunnypatel.co.uk";
const AI_URL = `${SITE}/blog/ai-referral-traffic-study/`;
const UPDATE_URL = `${SITE}/blog/google-update-portfolio-impact/`;
const CHART_WEEKS = 26;
const MIN_COUNT = 30;

const count = (n: number) => n.toLocaleString("en-GB");
const signed = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;

function longDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function shortDate(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  return `${d.getUTCDate()} ${d.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }).slice(0, 3)}`;
}

function rollout(start: string, end: string) {
  const a = new Date(`${start}T12:00:00Z`);
  const b = new Date(`${end}T12:00:00Z`);
  const year = b.getUTCFullYear();
  if (a.getUTCMonth() === b.getUTCMonth()) return `${a.getUTCDate()} to ${b.getUTCDate()} ${shortDate(end).split(" ")[1]} ${year}`;
  return `${shortDate(start)} to ${shortDate(end)} ${year}`;
}

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function CiteBlock({ citation, children }: { citation: string; children: ReactNode }) {
  return (
    <aside className="not-prose my-6 rounded-xl border border-hairline-strong p-5 text-sm leading-6 text-foreground">
      <p className="font-semibold">How to cite this data</p>
      <p className="mt-2 break-words text-muted-foreground dark:text-white/80">{citation}</p>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">{children}</div>
    </aside>
  );
}

const downloadClass = "inline-flex min-h-11 items-center text-brand-ink underline underline-offset-4";

/** One line for the homepage and other summary spots. */
export const aiSummary = {
  ai: count(aiReferrals.window.ai),
  sites: aiReferrals.window.sitesWithAi,
  end: longDate(aiReferrals.window.end),
};

export function LiveAiTracker() {
  const { window: w, prior, frame, sourceRule, updatedAt } = aiReferrals;
  const weeks = aiReferrals.weekly.slice(-CHART_WEEKS);
  const max = Math.max(...weeks.map((week) => week.ai));
  const recent = aiReferrals.weekly.slice(-8).reverse();
  const assistants = Object.entries(w.assistants as Record<string, number>);
  const labelled = new Set([weeks[0].weekStart, weeks.at(-1)!.weekStart, weeks.reduce((a, b) => (b.ai > a.ai ? b : a)).weekStart]);
  const snapshot = `/downloads/live/ai-referrals-${w.end}.csv`;

  return (
    <div className="my-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          "@id": `${AI_URL}#live-tracker-dataset`,
          name: "Weekly AI assistant referral sessions, owned portfolio frame",
          description: `Weekly GA4 sessions matching AI referral source list version ${sourceRule.version}, with total sessions as the denominator, across a frozen frame of ${frame.properties} owned properties. Attributed visits, not citation counts.`,
          url: `${AI_URL}#live-tracker`,
          creator: { "@id": `${SITE}/#person` },
          license: "https://creativecommons.org/licenses/by/4.0/",
          isAccessibleForFree: true,
          dateModified: updatedAt,
          temporalCoverage: `${aiReferrals.weekly[0].weekStart}/${w.end}`,
          variableMeasured: ["AI assistant sessions", "Total sessions"],
          distribution: [
            { "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: `${SITE}/downloads/live/ai-referrals-latest.csv` },
            { "@type": "DataDownload", encodingFormat: "application/json", contentUrl: `${SITE}/downloads/live/ai-referrals-latest.json` },
          ],
        }}
      />
      <p>
        My {frame.properties}-property frame recorded <strong>{count(w.ai)} sessions attributed to AI assistants</strong> in the 28
        days to {longDate(w.end)}. That is {w.share}% of {count(w.sessions)} sessions. The previous 28 days recorded {count(prior.ai)} of{" "}
        {count(prior.sessions)} sessions or {prior.share}%. {w.sitesWithAi} of the {w.sitesWithSessions} properties with sessions had at
        least one. I refresh this every Monday and last refreshed it on {longDate(updatedAt)}.
      </p>

      <figure className="not-prose mt-6 rounded-xl border border-hairline-strong p-4 sm:p-6">
        <figcaption className="text-sm font-semibold text-foreground">Sessions attributed to AI assistants, per week</figcaption>
        <div className="mt-8 flex h-44 items-end gap-0.5" role="img" aria-label={`Weekly AI assistant sessions from ${longDate(weeks[0].weekStart)} to ${longDate(w.end)}. The table below lists the latest eight weeks.`}>
          {weeks.map((week) => (
            <div key={week.weekStart} className="relative h-full min-w-0 flex-1" title={`Week of ${shortDate(week.weekStart)}: ${count(week.ai)} AI sessions of ${count(week.sessions)}`}>
              {labelled.has(week.weekStart) && (
                <span
                  className="absolute left-1/2 -translate-x-1/2 text-xs font-semibold tabular-nums text-foreground"
                  style={{ bottom: `calc(${(week.ai / max) * 100}% + 0.25rem)` }}
                >
                  {count(week.ai)}
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 rounded-t bg-brand" style={{ height: `${(week.ai / max) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between border-t border-hairline-strong pt-2 text-xs text-muted-foreground dark:text-white/70">
          <span>Week of {shortDate(weeks[0].weekStart)}</span>
          <span>Week of {shortDate(weeks.at(-1)!.weekStart)}</span>
        </div>
      </figure>

      <h3>Latest eight weeks</h3>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Week starting</th>
              <th>AI sessions</th>
              <th>All sessions</th>
              <th>AI share</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((week) => (
              <tr key={week.weekStart}>
                <td>{shortDate(week.weekStart)}</td>
                <td>{count(week.ai)}</td>
                <td>{count(week.sessions)}</td>
                <td>{week.ai < MIN_COUNT ? "Not enough data" : `${week.share.toFixed(2)}%`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Sessions by assistant, 28 days to {longDate(w.end)}</h3>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Assistant</th>
              <th>Sessions</th>
              <th>Share of {count(w.ai)} AI sessions</th>
            </tr>
          </thead>
          <tbody>
            {assistants.map(([name, sessions]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{count(sessions)}</td>
                <td>{sessions < MIN_COUNT ? "Not enough data" : `${((100 * sessions) / w.ai).toFixed(1)}%`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>How to read these numbers</h3>
      <ul>
        <li>
          I count sessions whose source exactly matches my source list version {sourceRule.version}. Edition 2 below uses a different
          five-assistant rule. Keep the two apart when you describe a trend. The full list is in my{" "}
          <Link href="/blog/ai-referral-sources-ga4/">AI referral sources guide</Link>.
        </li>
        <li>
          The frame holds the {frame.properties} owned properties from edition 2 and was frozen on {longDate(frame.frozen)}. New sites stay
          out so the denominator does not drift. {frame.responded} of {frame.properties} responded in this refresh.
        </li>
        <li>
          AI share moves with total sessions as well as AI sessions. One week can carry unusual Direct traffic. The largest property holds{" "}
          {w.largestSiteSessionShare}% of sessions in this window. The share without it is {w.excludingLargest.share}%.
        </li>
        <li>
          Weeks run Monday to Sunday and only finished weeks appear. A count under {MIN_COUNT} shows no percentage.
        </li>
        <li>
          This is my own portfolio and not a sample of the web. A referral visit is not a citation count. I have not measured why a number
          moved.
        </li>
      </ul>

      <CiteBlock citation={`Sunny Patel, "Live AI referral tracker", sunnypatel.co.uk, data to ${longDate(w.end)}, GA4, ${frame.properties}-property owned frame. ${AI_URL}#live-tracker`}>
        <a className={downloadClass} href={snapshot} download>Dated snapshot CSV</a>
        <a className={downloadClass} href="/downloads/live/ai-referrals-latest.csv" download>Latest CSV</a>
        <a className={downloadClass} href="/downloads/live/ai-referrals-latest.json" download>Latest JSON</a>
      </CiteBlock>
    </div>
  );
}

const MARCH_OVERLAP = new Set(["2026-03-spam", "2026-03-core"]);

export function LiveUpdateTracker() {
  const { updates, minSitesForShares, panelSites, updatedAt } = updateTracker;
  const last = updates.at(-1)!;

  return (
    <div className="my-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          "@id": `${UPDATE_URL}#update-tracker-dataset`,
          name: "Search Console impressions on owned sites around Google updates",
          description: `For each confirmed Google core and spam update, the number of eligible owned sites whose Search Console impressions rose or fell by 20% and 50%, from a panel of ${panelSites} owned properties.`,
          url: `${UPDATE_URL}#update-tracker`,
          creator: { "@id": `${SITE}/#person` },
          license: "https://creativecommons.org/licenses/by/4.0/",
          isAccessibleForFree: true,
          dateModified: updatedAt,
          temporalCoverage: `${updates[0].start}/${last.after[1]}`,
          variableMeasured: "Change in Search Console impressions per site",
          distribution: [
            { "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: `${SITE}/downloads/live/google-update-tracker-latest.csv` },
            { "@type": "DataDownload", encodingFormat: "application/json", contentUrl: `${SITE}/downloads/live/google-update-tracker-latest.json` },
          ],
        }}
      />
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Update</th>
              <th>Rollout (Google status)</th>
              <th>n</th>
              <th>Up 50%+</th>
              <th>Down 50%+</th>
              <th>Up 20%+</th>
              <th>Down 20%+</th>
              <th>Median</th>
              <th>Pooled</th>
            </tr>
          </thead>
          <tbody>
            {updates.map((u) => {
              const none = u.n === 0;
              const small = u.n < minSitesForShares;
              return (
                <tr key={u.id}>
                  <td>
                    <a href={u.url} target="_blank" rel="noopener noreferrer">{u.name.replace(/ update$/, "")}</a>
                  </td>
                  <td>{rollout(u.start, u.end)}</td>
                  <td>
                    {u.n}
                    {!none && small ? "*" : ""}
                    {MARCH_OVERLAP.has(u.id) ? "†" : ""}
                  </td>
                  <td>{u.up50 ?? "n/a"}</td>
                  <td>{u.down50 ?? "n/a"}</td>
                  <td>{u.up20 ?? "n/a"}</td>
                  <td>{u.down20 ?? "n/a"}</td>
                  <td>{none ? "n/a" : small ? `n<${minSitesForShares}` : signed(u.median as number)}</td>
                  <td>{none ? "n/a" : small ? `n<${minSitesForShares}` : signed(u.pooled as number)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <CiteBlock citation={`Sunny Patel, "How my sites changed after each Google update", sunnypatel.co.uk, table to the ${last.name}, Search Console, ${panelSites}-property owned panel, updated ${longDate(updatedAt)}. ${UPDATE_URL}#update-tracker`}>
        <a className={downloadClass} href={`/downloads/live/google-update-tracker-${updatedAt}.csv`} download>Dated snapshot CSV</a>
        <a className={downloadClass} href="/downloads/live/google-update-tracker-latest.csv" download>Latest CSV</a>
        <a className={downloadClass} href="/downloads/live/google-update-tracker-latest.json" download>Latest JSON</a>
      </CiteBlock>
    </div>
  );
}
