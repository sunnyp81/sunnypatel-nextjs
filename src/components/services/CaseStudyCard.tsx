export function CaseStudyCard({
  industry,
  challenge,
  result,
  metric,
  timeline,
  accentColor,
}: {
  industry: string;
  challenge: string;
  result: string;
  metric: string;
  timeline: string;
  accentColor: string;
}) {
  return (
    <div
      className="rounded-2xl border border-brand/20 bg-surface-1 dark:bg-white/[0.02] p-6 shadow-[var(--elev)] dark:shadow-[0_0_24px_rgba(91,138,239,0.10)] transition-shadow duration-300 hover:shadow-[0_10px_30px_-10px_rgba(42,91,215,0.25)] dark:hover:shadow-[0_0_36px_rgba(91,138,239,0.18)]"
    >
      <span
        className="lit-label lit-label--sm mb-4"
      >
        {industry}
      </span>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
            Challenge
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">{challenge}</p>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
            Result
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">{result}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-hairline pt-4">
        <p className="text-lg font-bold" style={{ color: accentColor }}>
          {metric}
        </p>
        <span className="tag-plain">
          {timeline}
        </span>
      </div>
    </div>
  );
}
