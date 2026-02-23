export function ProcessTimeline({
  steps,
  accentColor,
}: {
  steps: Array<{ phase: string; label: string; description: string }>;
  accentColor: string;
}) {
  return (
    <div className="rounded-2xl border border-[#5B8AEF]/20 bg-white/[0.02] p-6 shadow-[0_0_24px_rgba(91,138,239,0.10)]">
      <h2
        className="mb-8 text-xl font-bold text-foreground"
        style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
      >
        How It Works
      </h2>

      {/* Desktop */}
      <div className="hidden md:block">
        <div className="relative flex justify-between">
          <div
            className="absolute left-4 right-4 top-4 h-px"
            style={{ backgroundColor: `${accentColor}25` }}
          />
          {steps.map((step, i) => (
            <div
              key={i}
              className="relative flex flex-col items-center"
              style={{ width: `${100 / steps.length}%` }}
            >
              <p
                className="mb-2 text-[10px] font-medium uppercase tracking-widest"
                style={{ fontFamily: "monospace", color: `${accentColor}80` }}
              >
                {step.phase}
              </p>
              <div
                className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shadow-[0_0_12px_rgba(91,138,239,0.5)]"
                style={{ backgroundColor: accentColor }}
              >
                {i + 1}
              </div>
              <p className="mt-3 text-center text-sm font-semibold text-foreground">
                {step.label}
              </p>
              <p className="mt-1 max-w-[160px] text-center text-xs leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="relative space-y-6 pl-10">
          <div
            className="absolute bottom-0 left-[15px] top-0 w-px"
            style={{ backgroundColor: `${accentColor}25` }}
          />
          {steps.map((step, i) => (
            <div key={i} className="relative">
              <div
                className="absolute -left-10 top-0 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shadow-[0_0_12px_rgba(91,138,239,0.4)]"
                style={{ backgroundColor: accentColor }}
              >
                {i + 1}
              </div>
              <p
                className="mb-1 text-[10px] font-medium uppercase tracking-widest"
                style={{ fontFamily: "monospace", color: `${accentColor}80` }}
              >
                {step.phase}
              </p>
              <p className="text-sm font-semibold text-foreground">{step.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
