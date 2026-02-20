export function Stats() {
  const stats = [
    { value: "280%", label: "Avg Traffic Increase", color: "from-[#dd7bbb] to-[#d79f1e]" },
    { value: "100+", label: "Clients Served", color: "from-[#d79f1e] to-[#5a922c]" },
    { value: "40+", label: "Ranking Opportunities", color: "from-[#5a922c] to-[#4c7894]" },
    { value: "15+", label: "Years Experience", color: "from-[#4c7894] to-[#dd7bbb]" },
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Gradient lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#dd7bbb]/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#dd7bbb]/20 to-transparent" />

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          background:
            "radial-gradient(ellipse at center, #dd7bbb, transparent 60%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className={`bg-gradient-to-r ${stat.color} bg-clip-text text-3xl font-bold text-transparent md:text-5xl`}
                style={{
                  fontFamily: "var(--font-heading)",
                  letterSpacing: "-0.03em",
                }}
              >
                {stat.value}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
