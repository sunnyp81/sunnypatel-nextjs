import { EXPERIMENTS } from "@/data/experiments";

export const dynamic = "force-static";

const COLUMNS = ["id", "slug", "title", "status", "label", "registered_date", "change_date", "readback_date", "metric", "window", "comparison", "outcome"];

const quote = (value: string | undefined) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export function GET() {
  const rows = EXPERIMENTS.map((e) =>
    [e.id, e.slug, e.title, e.status, e.label, e.registeredDate, e.changeDate, e.readbackDate, e.metric, e.window, e.comparison, e.outcome].map(quote).join(",")
  );
  return new Response(`﻿${[COLUMNS.join(","), ...rows].join("\r\n")}\r\n`, {
    headers: { "Content-Type": "text/csv; charset=utf-8" },
  });
}
