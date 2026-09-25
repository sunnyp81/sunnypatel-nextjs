"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const stats = [
  { value: 340, suffix: "%", label: "Aatma Organic Growth YoY", color: "dark:from-brand dark:to-gold", accent: "border-brand-ink" },
  { value: 45, suffix: "", label: "SEO Test Sites", color: "dark:from-gold dark:to-success", accent: "border-gold-ink" },
  { value: 12, suffix: "+", label: "Testing Verticals", color: "dark:from-success dark:to-teal", accent: "border-success-ink" },
  { value: 15, suffix: "+", label: "Years Experience", color: "dark:from-teal dark:to-brand", accent: "border-teal-ink" },
];

function useCountUp(target: number, duration = 1800, started: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    let raf: number;

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, started]);

  return count;
}

function StatItem({ value, suffix, label, color, accent, started }: typeof stats[0] & { started: boolean }) {
  const count = useCountUp(value, 1800, started);

  return (
    <div className={cn("rounded-2xl border-t-2 bg-white px-4 py-6 text-center shadow-[var(--elev)]", "dark:border-t-0 dark:bg-transparent dark:px-0 dark:py-0 dark:shadow-none", accent)}>
      <div
        className={cn("text-3xl font-bold md:text-5xl text-foreground dark:bg-gradient-to-r dark:bg-clip-text dark:text-transparent", color)}
        style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
      >
        {count}{suffix}
      </div>
      <div className="mt-2 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

export function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative overflow-hidden py-20" ref={ref}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/30 dark:via-brand/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/30 dark:via-brand/20 to-transparent" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{ background: "radial-gradient(ellipse at center, #5B8AEF, transparent 60%)" }}
      />
      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
          {stats.map((stat) => (
            <StatItem key={stat.label} {...stat} started={started} />
          ))}
        </div>
      </div>
    </section>
  );
}
