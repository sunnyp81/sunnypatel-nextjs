export function WhoForGrid({
  yesItems,
  noItems,
}: {
  yesItems: string[];
  noItems: string[];
}) {
  return (
    <div className="my-10">
      <h2
        className="mb-6 text-2xl font-bold text-foreground"
        style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
      >
        Is This Right for You?
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Yes column */}
        <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.03] p-5">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-emerald-400">
            Good fit
          </p>
          <ul className="space-y-2.5">
            {yesItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <span className="mt-0.5 shrink-0 text-emerald-400">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* No column */}
        <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.03] p-5">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-red-400">
            Not the best fit
          </p>
          <ul className="space-y-2.5">
            {noItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <span className="mt-0.5 shrink-0 text-red-400">✗</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
