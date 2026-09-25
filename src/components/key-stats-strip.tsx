import { GlowStat, GlowStatRow } from "@/components/glow/glow-blocks";
import styles from "@/components/glow/glow.module.css";

export function KeyStatsStrip({
  stats,
  jumpHref,
}: {
  stats: readonly { value: string; label: string; source?: string }[];
  jumpHref?: string;
}) {
  if (!stats?.length) return null;
  return (
    <section aria-label="Key statistics" className="not-prose mt-8 mb-2">
      <GlowStatRow>
        {stats.map((stat) => (
          <GlowStat key={stat.value + stat.label} {...stat} />
        ))}
      </GlowStatRow>
      {jumpHref ? (
        <div className="mt-3 text-center">
          <a href={jumpHref} className={`text-sm text-brand-ink hover:underline ${styles.statJumpLink}`}>
            Jump to all statistics ↓
          </a>
        </div>
      ) : null}
    </section>
  );
}
