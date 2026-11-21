import monitor from "@/data/live/update-monitor.json";

export const TRACKER_SLUG = "google-update-portfolio-impact";

// Date the monitor content last really changed (refresh.mjs only moves changedAt on content change).
const monitorChanged = (monitor.changedAt ?? "").slice(0, 10);

export function trackerLastUpdated(slug: string, lastUpdated?: string | null): string | undefined {
  const base = lastUpdated || undefined;
  if (slug !== TRACKER_SLUG || !monitorChanged) return base;
  return !base || monitorChanged > base ? monitorChanged : base;
}

export function liveRankingUpdate(): { name: string; start: string } | null {
  const u = (monitor.updates as { name: string; start: string; status: string }[]).find((x) => x.status === "rolling-out");
  return u ? { name: u.name, start: u.start } : null;
}
