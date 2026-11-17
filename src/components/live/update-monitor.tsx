import Link from "next/link";
import monitor from "@/data/live/update-monitor.json";
import tracker from "@/data/live/update-tracker.json";
import styles from "./update-monitor.module.css";

type NewsItem = { source: string; title: string; url: string; date: string; summary: string };
type CommunityItem = { source: string; author: string; handle: string; url: string; date: string; text: string; likes: number };
type Update = {
  id: string;
  name: string;
  type: string;
  start: string;
  end: string | null;
  status: string;
  url: string;
  googleNotes: { when: string; text: string }[];
  news: NewsItem[];
  community: CommunityItem[];
};

const DAY = 86400000;
const updates = monitor.updates as Update[];
const trackerById = new Map(tracker.updates.map((u) => [u.url.split("/").pop(), u]));

const TYPE_LABEL: Record<string, string> = { core: "Core", spam: "Spam", discover: "Discover", other: "Other" };

function day(iso: string, withYear = true) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}), timeZone: "UTC" });
}

function stamp(iso: string) {
  const d = new Date(iso);
  return `${day(iso)}, ${d.toISOString().slice(11, 16)} UTC`;
}

const lengthDays = (u: Update) => (u.end ? Math.max(1, Math.round((Date.parse(u.end) - Date.parse(u.start)) / DAY)) : null);
const expectedEnd = (u: Update) => new Date(Date.parse(u.start) + 14 * DAY).toISOString();
const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

function current() {
  return updates.find((u) => u.status === "rolling-out") ?? updates[0];
}

function StatusBadge({ u }: { u: Update }) {
  const live = u.status === "rolling-out";
  return (
    <span className={live ? styles.badgeLive : styles.badgeDone}>
      <span aria-hidden="true" className={styles.dot} />
      {live ? "Rolling out" : "Rollout complete"}
    </span>
  );
}

/** First screen: the update that is live now (or the latest one), in Google's own words. */
export function UpdateMonitorLead() {
  const u = current();
  const live = u.status === "rolling-out";
  const coreLengths = updates.filter((x) => x.type === "core" && x.end).slice(0, 3).map(lengthDays) as number[];
  const note = u.googleNotes.at(-1);

  return (
    <section className={styles.lead} aria-labelledby="current-update">
      <div className={styles.leadMain}>
        <div className={styles.leadTop}>
          <StatusBadge u={u} />
          <span className={styles.typeTag}>{TYPE_LABEL[u.type] ?? "Other"} update</span>
        </div>
        <h2 id="current-update" className={styles.leadTitle}>{u.name.replace(/^./, (c) => c.toUpperCase())}</h2>
        <dl className={styles.facts}>
          <div>
            <dt>Started</dt>
            <dd><time dateTime={u.start}>{stamp(u.start)}</time></dd>
          </div>
          <div>
            <dt>{live ? "Google's estimate" : "Finished"}</dt>
            <dd>
              {live ? (
                <>Up to 2 weeks, so about <time dateTime={expectedEnd(u)}>{day(expectedEnd(u))}</time></>
              ) : (
                <><time dateTime={u.end!}>{day(u.end!)}</time> ({lengthDays(u)} days)</>
              )}
            </dd>
          </div>
          <div>
            <dt>Last 3 core updates took</dt>
            <dd>{coreLengths.join(", ")} days</dd>
          </div>
        </dl>
        {note ? (
          <blockquote className={styles.google}>
            <p>&ldquo;{note.text}&rdquo;</p>
            <footer>
              Google Search Status Dashboard, <time dateTime={note.when}>{stamp(note.when)}</time>.{" "}
              <a href={u.url} {...ext}>Read Google&rsquo;s incident page</a>
            </footer>
          </blockquote>
        ) : null}
      </div>
      <div className={styles.leadSide}>
        <h3>What to do if your traffic moves</h3>
        <ol className={styles.steps}>
          <li><strong>Hold big changes until it settles.</strong> Rankings move for days during a rollout. A fix made mid-way is hard to judge.</li>
          <li><strong>Wait a week after it finishes.</strong> Then compare daily Search Console impressions before the start with the days after.</li>
          <li><strong>Look for a step, not a slope.</strong> A sharp drop in 24 to 48 hours that holds is the pattern worth acting on. <Link href="/blog/google-penalty-recovery/">How to tell an algorithm hit from other problems</Link>.</li>
          <li><strong>Check who replaced you in the results.</strong> Compare what their page answers that yours does not.</li>
        </ol>
        <p className={styles.sideLinks}>
          <a href="#whats-being-reported">What SEOs are reporting</a>
          <a href="#update-log">Every confirmed update</a>
          <a href="#update-tracker">Data from my own sites</a>
        </p>
      </div>
    </section>
  );
}

/** Rollout ribbon: each update as a bar on a 12-month line, linking to its row in the log. */
function Ribbon() {
  const latest = Date.parse(updates[0].start);
  const to = latest + 35 * DAY;
  const from = to - 395 * DAY;
  const span = to - from;
  const shown = updates.filter((u) => Date.parse(u.end ?? expectedEnd(u)) >= from).slice().reverse();
  const lanes: number[] = [];
  const bars = shown.map((u) => {
    const s = Math.max(Date.parse(u.start), from);
    const e = Date.parse(u.end ?? expectedEnd(u));
    let lane = lanes.findIndex((end) => end < s - 4 * DAY);
    if (lane === -1) lane = lanes.length;
    lanes[lane] = e;
    return { u, lane, left: ((s - from) / span) * 100, width: Math.max(((e - s) / span) * 100, 1.2) };
  });
  const months: { label: string; left: number }[] = [];
  const m = new Date(from);
  m.setUTCDate(1);
  m.setUTCMonth(m.getUTCMonth() + 1);
  for (; m.getTime() < to; m.setUTCMonth(m.getUTCMonth() + 1)) {
    months.push({ label: m.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }), left: ((m.getTime() - from) / span) * 100 });
  }

  return (
    <figure className={styles.ribbon}>
      <figcaption>Confirmed Google ranking updates, last 12 months. Select a bar to jump to its entry.</figcaption>
      <div className={styles.track} style={{ height: `${lanes.length * 34 + 30}px` }}>
        {months.map((mo) => (
          <span key={`${mo.label}-${mo.left}`} className={styles.month} style={{ left: `${mo.left}%` }}>{mo.label}</span>
        ))}
        {bars.map(({ u, lane, left, width }) => (
          <a
            key={u.id}
            href={`#u-${u.id}`}
            className={`${styles.bar} ${styles[`bar_${u.type}`] ?? styles.bar_other} ${u.status === "rolling-out" ? styles.barLive : ""}`}
            style={{ left: `${left}%`, width: `${width}%`, top: `${lane * 34}px` }}
            aria-label={`${u.name}: ${day(u.start)} to ${u.end ? day(u.end) : "still rolling out"}`}
          >
            <span className={`${styles.barLabel} ${left > 55 ? styles.barLabelEnd : ""}`}>{u.name.replace(/ update$/, "").replace(/ 20\d\d/, "")}</span>
          </a>
        ))}
      </div>
      <p className={styles.legend}>
        <span><i className={styles.keyCore} aria-hidden="true" /> Core</span>
        <span><i className={styles.keySpam} aria-hidden="true" /> Spam</span>
        <span><i className={styles.keyOther} aria-hidden="true" /> Other</span>
        <span><i className={styles.keyLive} aria-hidden="true" /> Still rolling out (Google&rsquo;s 2-week estimate)</span>
      </p>
    </figure>
  );
}

function Coverage({ u }: { u: Update }) {
  if (!u.news.length && !u.community.length) return null;
  return (
    <div className={styles.coverage}>
      <div>
        <h3>In the SEO press</h3>
        {u.news.length ? (
          <ul className={styles.items}>
            {u.news.slice(0, 5).map((n) => (
              <li key={n.url}>
                <p className={styles.meta}>{n.source} · <time dateTime={n.date}>{day(n.date, false)}</time></p>
                <a href={n.url} {...ext} className={styles.itemTitle}>{n.title}</a>
                {n.summary ? <p className={styles.summary}>{n.summary}</p> : null}
              </li>
            ))}
          </ul>
        ) : <p className={styles.summary}>No articles collected yet.</p>}
      </div>
      <div>
        <h3>What SEO practitioners are posting</h3>
        {u.community.length ? (
          <ul className={styles.items}>
            {u.community.slice(0, 5).map((c) => (
              <li key={c.url}>
                <p className={styles.meta}>{c.author} on {c.source} · <time dateTime={c.date}>{day(c.date, false)}</time></p>
                <p className={styles.post}>{c.text}</p>
                <a href={c.url} target="_blank" rel="nofollow ugc noopener noreferrer" className={styles.postLink}>
                  Read the post<span className="sr-only"> by {c.author}</span>
                </a>
              </li>
            ))}
          </ul>
        ) : <p className={styles.summary}>No posts collected yet.</p>}
      </div>
    </div>
  );
}

/** Coverage for the live update, the ribbon and the full log. Sits above the long-form study. */
export function UpdateMonitorBody() {
  const u = current();
  const recent = updates.filter((x) => x.id !== u.id && (x.news.length || x.community.length)).slice(0, 2);
  const changed = monitor.changedAt;

  return (
    <div className={styles.body}>
      <section id="whats-being-reported" aria-labelledby="reported-title">
        <h2 id="reported-title">What SEOs are reporting about the {u.name}</h2>
        <p>
          Short extracts from SEO news sites and from SEO practitioners on Bluesky, each linked to the original. I collect them
          automatically twice a day, only from a fixed list of sources, and only when they name the update. Quoting someone is
          not agreeing with them.
          {changed ? <> Last new item: <time dateTime={changed}>{stamp(changed)}</time>.</> : null}
        </p>
        <Coverage u={u} />
        {recent.map((r) => (
          <div key={r.id}>
            <h3 className={styles.prevTitle}>Earlier: {r.name}</h3>
            <Coverage u={r} />
          </div>
        ))}
      </section>

      <section id="update-log" aria-labelledby="log-title">
        <h2 id="log-title">Every confirmed Google ranking update</h2>
        <p>
          Dates come from <a href="https://status.search.google.com/products/rGHU1u87FJnkP6W2GwMi/history" {...ext}>Google&rsquo;s Search Status Dashboard</a> (Ranking).
          Where my own panel has a result, the last column links to it.
        </p>
        <Ribbon />
        <div className={styles.tableFrame} role="region" aria-label="Confirmed Google ranking updates" tabIndex={0}>
          <table className={styles.log}>
            <thead>
              <tr>
                <th scope="col">Update</th>
                <th scope="col">Started</th>
                <th scope="col">Finished</th>
                <th scope="col">Length</th>
                <th scope="col">My sites</th>
              </tr>
            </thead>
            <tbody>
              {updates.map((x) => {
                const t = trackerById.get(x.id);
                return (
                  <tr key={x.id} id={`u-${x.id}`}>
                    <th scope="row">
                      <a href={x.url} {...ext}>{x.name.replace(/^./, (c) => c.toUpperCase())}</a>
                      <span className={styles.rowType}>{TYPE_LABEL[x.type] ?? "Other"}</span>
                    </th>
                    <td><time dateTime={x.start}>{day(x.start)}</time></td>
                    <td>{x.end ? <time dateTime={x.end}>{day(x.end)}</time> : <StatusBadge u={x} />}</td>
                    <td>{x.end ? `${lengthDays(x)} day${lengthDays(x) === 1 ? "" : "s"}` : "Ongoing"}</td>
                    <td>
                      {t && t.n > 0 ? (
                        <a href="#update-tracker">{t.n} sites: {t.up20} up, {t.down20} down</a>
                      ) : t ? "Too early in my data" : x.type === "core" || x.type === "spam" ? (x.end ? "Row added about 4 weeks after it ends" : "After rollout ends") : "Not tracked"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className={styles.note}>
          &ldquo;Up&rdquo; and &ldquo;down&rdquo; mean Search Console impressions moved 20% or more between the windows explained in{" "}
          <a href="#update-method">how I measure each update</a>.
        </p>
      </section>
    </div>
  );
}
