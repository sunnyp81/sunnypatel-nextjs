"use client";

const tagColorMap: Array<{ test: RegExp; color: string; secondary: string }> = [
  { test: /health|medical|aesthet|care/i, color: "#5B8AEF", secondary: "#4c7894" },
  { test: /design|brand|creative/i,       color: "#d79f1e", secondary: "#5B8AEF" },
  { test: /dev|code|tech|software/i,      color: "#4c7894", secondary: "#5a922c" },
  { test: /seo|content|search|organic/i,  color: "#5a922c", secondary: "#4c7894" },
  { test: /legal|law|finance/i,           color: "#8b5cf6", secondary: "#5B8AEF" },
];

function getColors(tags: readonly string[], industry?: string | null) {
  const haystack = [...(tags ?? []), industry ?? ""].join(" ");
  for (const entry of tagColorMap) {
    if (entry.test.test(haystack)) return entry;
  }
  return { color: "#5B8AEF", secondary: "#4c7894" };
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
    <div className="relative h-44 w-full overflow-hidden rounded-t-xl bg-[#050507]">
      {/* Primary blob */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 25% 60%, ${color}35, transparent 55%)`,
        }}
      />
      {/* Secondary blob */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 75% 35%, ${secondary}20, transparent 50%)`,
        }}
      />
      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      {/* Faint horizontal lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "linear-gradient(transparent calc(100% - 1px), rgba(255,255,255,0.5) 1px)",
          backgroundSize: "100% 40px",
        }}
      />

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#050507] via-[#050507]/60 to-transparent p-5">
        {industry && (
          <span
            className="mb-2 w-fit rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
            style={{
              borderColor: `${color}40`,
              backgroundColor: `${color}15`,
              color,
            }}
          >
            {industry}
          </span>
        )}
        <h3
          className="text-base font-bold leading-snug text-white/90"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {title}
        </h3>
      </div>
    </div>
  );
}
