"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 280, suffix: "%", label: "Avg Traffic Increase", color: "from-[#5B8AEF] to-[#d79f1e]" },
  { value: 100, suffix: "+", label: "Clients Served", color: "from-[#d79f1e] to-[#5a922c]" },
  { value: 40, suffix: "+", label: "Sites Managed", color: "from-[#5a922c] to-[#4c7894]" },
  { value: 15, suffix: "+", label: "Years Experience", color: "from-[#4c7894] to-[#5B8AEF]" },
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

function StatItem({ value, suffix, label, color, started }: typeof stats[0] & { started: boolean }) {
  const count = useCountUp(value, 1800, started);

  return (
    <div className="text-center">
      <div
        className={`bg-gradient-to-r ${color} bg-clip-text text-3xl font-bold text-transparent md:text-5xl`}
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
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#5B8AEF]/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#5B8AEF]/20 to-transparent" />
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
