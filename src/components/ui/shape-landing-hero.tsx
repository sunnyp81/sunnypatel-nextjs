"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

function ElegantShape({
    className,
    delay = 0,
    width = 400,
    height = 100,
    rotate = 0,
    tone = "blue",
}: {
    className?: string;
    delay?: number;
    width?: number;
    height?: number;
    rotate?: number;
    tone?: "blue" | "gold";
}) {
    const prefersReducedMotion = useReducedMotion();
    return (
        <motion.div
            initial={prefersReducedMotion ? {
                opacity: 1,
                y: 0,
                rotate,
            } : {
                opacity: 0,
                y: -150,
                rotate: rotate - 15,
            }}
            animate={{
                opacity: 1,
                y: 0,
                rotate: rotate,
            }}
            transition={{
                duration: prefersReducedMotion ? 0 : 2.4,
                delay: prefersReducedMotion ? 0 : delay,
                ease: [0.23, 0.86, 0.39, 0.96] as [number, number, number, number],
                opacity: { duration: 1.2 },
            }}
            className={cn("absolute", className)}
        >
            <motion.div
                animate={prefersReducedMotion ? undefined : {
                    y: [0, 15, 0],
                }}
                transition={{
                    duration: 12,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
                style={{
                    width,
                    height,
                }}
                className="relative"
            >
                <div className={cn("hero-tube", tone === "gold" && "hero-tube--gold")} />
            </motion.div>
        </motion.div>
    );
}

function HeroGeometric({
    badge = "SEO Consultant",
    title1 = "SEO Consulting That",
    title2 = "Generates Clients, Not Reports",
    children,
}: {
    badge?: string;
    title1?: string;
    title2?: string;
    children?: React.ReactNode;
}) {
    return (
        <section id="homepage-hero" className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#f5f7fb] dark:bg-[#030303]">
            <div className="absolute inset-0 bg-gradient-to-br from-brand/[0.14] via-transparent to-gold/[0.09] blur-3xl dark:from-brand/[0.06] dark:to-gold/[0.04]" />
            <div
                className="absolute inset-0 opacity-100 dark:opacity-0 pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                    maskImage: "linear-gradient(to bottom, black 55%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, black 55%, transparent 100%)",
                }}
                aria-hidden="true"
            />

            <div className="absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,black_70%,transparent)]">
                <ElegantShape
                    delay={0.6}
                    width={200}
                    height={60}
                    rotate={20}
                    tone="gold"
                    className="right-[-92px] top-[96px] [scale:0.5] md:right-[20%] md:top-[15%] md:[scale:1]"
                />

                <ElegantShape
                    delay={0.7}
                    width={150}
                    height={40}
                    rotate={-25}
                    className="left-[-56px] top-[214px] [scale:0.55] md:left-[25%] md:top-[10%] md:[scale:1]"
                />
            </div>

            <div className="relative z-10 container mx-auto px-4 pt-24 pb-24 md:px-6 md:pt-28 md:pb-32">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="mb-8 md:mb-12">
                        <span className="lit-label">{badge}</span>
                    </div>

                    <div>
                        <h1 className="text-2xl sm:text-4xl md:text-[2.5rem] font-bold mb-6 md:mb-8 tracking-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#0a1024] to-[#2a5bd7] dark:from-white dark:to-white/80">
                                {title1}{" "}
                            </span>
                            <br />
                            <span
                                className={cn(
                                    "text-[#2F5FD6] dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-r dark:from-[#7ba3f5] dark:via-white/90 dark:to-gold"
                                )}
                            >
                                {title2}
                            </span>
                        </h1>
                    </div>

                    {children && (
                        <div>
                            {children}
                        </div>
                    )}
                </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-[#f5f7fb]/80 dark:to-[#030303]/80 pointer-events-none" />
        </section>
    );
}

export { HeroGeometric };
