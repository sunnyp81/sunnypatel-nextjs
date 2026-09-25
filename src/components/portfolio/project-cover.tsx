"use client";

const tagColorMap: Array<{ test: RegExp; color: string; secondary: string }> = [
  { test: /health|medical|aesthet|care/i,          color: "var(--brand-ink)", secondary: "var(--teal-ink)" }, // Blue
  { test: /\bai\b|copilot|citation|generative/i,   color: "var(--teal-ink)", secondary: "var(--brand-ink)" }, // Purple
  { test: /analytics|cross.platform|audit/i,       color: "var(--gold-ink)", secondary: "var(--brand-ink)" }, // Gold
  { test: /edtech|education|tutor/i,               color: "var(--gold-ink)", secondary: "var(--success-ink)" }, // Gold
  { test: /affiliate|conversion|e-commerce/i,      color: "var(--teal-ink)", secondary: "var(--success-ink)" }, // Teal
  { test: /design|brand|creative/i,                color: "var(--gold-ink)", secondary: "var(--brand-ink)" }, // Gold
  { test: /dev|code|tech|software/i,               color: "var(--teal-ink)", secondary: "var(--success-ink)" }, // Teal
  { test: /seo|content|search|organic/i,           color: "var(--success-ink)", secondary: "var(--teal-ink)" }, // Green
  { test: /legal|law|finance/i,                    color: "var(--teal-ink)", secondary: "var(--brand-ink)" }, // Purple
];

function getColors(tags: readonly string[], industry?: string | null) {
  const haystack = [...(tags ?? []), industry ?? ""].join(" ");
  for (const entry of tagColorMap) {
    if (entry.test.test(haystack)) return entry;
  }
  return { color: "var(--brand-ink)", secondary: "var(--teal-ink)" };
}

export function ProjectCover({
  title,
  tags,
  industry,
}: {
  title: string;
  tags?: readonly string[] | null;
  industry?: string | null;
}) {
  const { color, secondary } = getColors(tags ?? [], industry);

  return (
    <div className="relative h-44 w-full overflow-hidden rounded-t-xl bg-surface-1 dark:bg-[#050507]">
      {/* Primary blob */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 30% 65%, color-mix(in srgb, ${color} 38%, transparent), transparent 55%)`,
        }}
      />
      {/* Secondary blob */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 75% 30%, color-mix(in srgb, ${secondary} 25%, transparent), transparent 50%)`,
        }}
      />
      {/* Top-right accent */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 85% 15%, color-mix(in srgb, ${color} 15%, transparent), transparent 40%)`,
        }}
      />
      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--grid-line) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      {/* Faint horizontal lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "linear-gradient(transparent calc(100% - 1px), var(--ink-faint) 1px)",
          backgroundSize: "100% 40px",
        }}
      />

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-surface-1 dark:from-[#050507] via-surface-1/60 dark:via-[#050507]/60 to-transparent p-5">
        {industry && (
          <span
            className="mb-2 w-fit rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
            style={{
              borderColor: `color-mix(in srgb, ${color} 25%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${color} 8%, transparent)`,
              color,
            }}
          >
            {industry}
          </span>
        )}
        <h3
          className="text-base font-bold leading-snug text-ink-strong dark:text-white/90"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {title}
        </h3>
      </div>
    </div>
  );
}
