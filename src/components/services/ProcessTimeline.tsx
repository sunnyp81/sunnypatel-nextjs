export function ProcessTimeline({
  steps,
  accentColor,
}: {
  steps: Array<{ phase: string; label: string; description: string }>;
  accentColor: string;
}) {
  return (
    <div className="my-10">
      <h2
        className="mb-8 text-2xl font-bold text-foreground"
        style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
      >
        How It Works
      </h2>

      {/* Desktop — horizontal */}
      <div className="hidden md:block">
        <div className="relative flex justify-between">
          {/* Connector line */}
          <div
            className="absolute left-0 right-0 top-4 h-px"
            style={{ backgroundColor: `${accentColor}30` }}
          />

          {steps.map((step, i) => (
            <div key={i} className="relative flex flex-col items-center" style={{ width: `${100 / steps.length}%` }}>
              <p
                className="mb-2 text-xs font-medium uppercase tracking-wider"
                style={{ fontFamily: "monospace", color: `${accentColor}99` }}
              >
                {step.phase}
              </p>
              <div
                className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: accentColor }}
              >
                {i + 1}
              </div>
              <p className="mt-3 text-center text-sm font-semibold text-foreground">
                {step.label}
              </p>
              <p className="mt-1 max-w-[180px] text-center text-xs leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile — vertical */}
      <div className="md:hidden">
        <div className="relative space-y-6 pl-10">
          {/* Vertical connector */}
          <div
            className="absolute bottom-0 left-[15px] top-0 w-px"
            style={{ backgroundColor: `${accentColor}30` }}
          />

          {steps.map((step, i) => (
            <div key={i} className="relative">
              <div
                className="absolute -left-10 top-0 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: accentColor }}
              >
                {i + 1}
              </div>
              <p
                className="mb-1 text-xs font-medium uppercase tracking-wider"
                style={{ fontFamily: "monospace", color: `${accentColor}99` }}
              >
                {step.phase}
              </p>
              <p className="text-sm font-semibold text-foreground">
                {step.label}
              </p>
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
