import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { liveRankingUpdate, TRACKER_SLUG } from "@/lib/update-monitor-meta";

// Shows only while Google's dashboard lists a ranking update as rolling out.
export function UpdateAlert({ className = "" }: { className?: string }) {
  const u = liveRankingUpdate();
  if (!u) return null;
  const since = new Date(u.start).toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" });
  return (
    <Link
      href={`/blog/${TRACKER_SLUG}/`}
      className={`group flex items-start gap-2.5 text-left text-sm sm:items-center sm:justify-center sm:text-center text-muted-foreground ${className}`}
    >
      <span className="relative mt-1.5 flex h-2 w-2 shrink-0 sm:mt-0" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60 motion-reduce:animate-none" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
      </span>
      <span>
        <strong className="font-semibold text-foreground">The {u.name} is rolling out</strong> (since {since}). Live status and what SEOs are seeing.
      </span>
      <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand sm:mt-0 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
