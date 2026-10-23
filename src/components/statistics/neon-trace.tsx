// A glass-tube trace in the site blue-to-gold grammar. The line is decoration; the labelled nodes are a jump menu to each statistic.
export type TraceItem = { href: string; value: string; name: string };

export function NeonTrace({ items }: { items: TraceItem[] }) {
  const nodes = items.length;
  const w = 1200;
  const h = 200;
  const pts = Array.from({ length: nodes }, (_, i) => {
    const x = 40 + (i * (w - 80)) / Math.max(nodes - 1, 1);
    const y = 150 - 105 * Math.sin((i / Math.max(nodes - 1, 1)) * Math.PI * 0.85) + (i % 2 === 0 ? 10 : -10);
    return [Math.round(x), Math.round(y)] as const;
  });
  const d = pts
    .map(([x, y], i) => {
      if (i === 0) return `M${x} ${y}`;
      const [px, py] = pts[i - 1];
      const cx = (px + x) / 2;
      return `C${cx} ${py} ${cx} ${y} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="stat-trace relative w-full">
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .stat-trace path.tube { stroke-dasharray: 2600; stroke-dashoffset: 2600; animation: stat-draw 1.8s cubic-bezier(.3,.7,.2,1) .15s forwards; }
          .stat-trace circle.node { opacity: 0; animation: stat-node .5s ease-out forwards; }
        }
        @keyframes stat-draw { to { stroke-dashoffset: 0; } }
        @keyframes stat-node { to { opacity: 1; } }
      `}</style>
      <svg aria-hidden="true" viewBox={`0 0 ${w} ${h}`} className="pointer-events-none h-auto w-full overflow-visible" focusable="false">
        <defs>
          <linearGradient id="stat-tube" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="var(--brand-ink)" />
            <stop offset="1" stopColor="var(--gold-ink)" />
          </linearGradient>
          <filter id="stat-bloom" x="-5%" y="-60%" width="110%" height="220%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <path d={d} fill="none" stroke="url(#stat-tube)" strokeWidth="14" strokeLinecap="round" opacity="0.5" filter="url(#stat-bloom)" />
        <path className="tube" d={d} fill="none" stroke="url(#stat-tube)" strokeWidth="4.5" strokeLinecap="round" />
        {pts.map(([x, y], i) => (
          <circle
            key={i}
            className="node"
            cx={x}
            cy={y}
            r="6.5"
            fill="var(--background)"
            stroke="url(#stat-tube)"
            strokeWidth="2.5"
            style={{ animationDelay: `${0.5 + i * 0.16}s` }}
          />
        ))}
      </svg>
      <nav aria-label="Jump to a statistic" className="hidden md:block">
        <ol>
          {pts.map(([x, y], i) => {
            const above = i % 2 === 0;
            return (
              <li
                key={items[i].href}
                className="absolute w-32"
                style={{ left: `${(x / w) * 100}%`, top: `${(y / h) * 100}%`, transform: `translate(-50%, ${above ? "calc(-100% - 16px)" : "16px"})` }}
              >
                <a
                  href={items[i].href}
                  className="group block rounded-sm text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                >
                  <span className="block text-sm font-bold tabular-nums text-foreground transition-colors group-hover:text-brand-ink" style={{ fontFamily: "var(--font-heading)" }}>
                    {items[i].value}
                  </span>
                  <span className="block text-[11px] leading-tight text-muted-foreground">{items[i].name}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
