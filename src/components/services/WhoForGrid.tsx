export function WhoForGrid({
  yesItems,
  noItems,
}: {
  yesItems: string[];
  noItems: string[];
}) {
  return (
    <div>
      <h2
        className="mb-6 text-2xl font-bold text-foreground"
        style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
      >
        Is This Right for You?
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5 shadow-[0_0_20px_rgba(16,185,129,0.08)]">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Good fit
          </p>
          <ul className="space-y-2.5">
            {yesItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <span className="mt-0.5 shrink-0 font-bold text-emerald-400">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-5 shadow-[0_0_20px_rgba(239,68,68,0.06)]">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-red-400">
            Not the best fit
          </p>
          <ul className="space-y-2.5">
            {noItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <span className="mt-0.5 shrink-0 font-bold text-red-400">✗</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
