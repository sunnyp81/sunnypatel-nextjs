"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

function ElegantShape({
    className,
    delay = 0,
    width = 400,
    height = 100,
    rotate = 0,
    gradient = "from-white/[0.08]",
}: {
    className?: string;
    delay?: number;
    width?: number;
    height?: number;
    rotate?: number;
    gradient?: string;
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
                <div
                    className={cn(
                        "absolute inset-0 rounded-full",
                        "bg-gradient-to-r to-transparent",
                        gradient,
                        "backdrop-blur-[2px] border-2 border-black/[0.08] dark:border-white/[0.15]",
                        "shadow-[0_8px_32px_0_rgba(42,91,215,0.18)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
                        "after:absolute after:inset-0 after:rounded-full",
                        "after:bg-[radial-gradient(circle_at_50%_50%,rgba(42,91,215,0.14),transparent_70%)] dark:after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
                    )}
                />
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
                }}
                aria-hidden="true"
            />

            <div className="absolute inset-0 overflow-hidden">
                <ElegantShape
                    delay={0.3}
                    width={600}
                    height={140}
                    rotate={12}
                    gradient="from-brand/[0.15]"
                    className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
                />

                <ElegantShape
                    delay={0.5}
                    width={500}
                    height={120}
                    rotate={-15}
                    gradient="from-gold/[0.12]"
                    className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
                />

                <ElegantShape
                    delay={0.4}
                    width={300}
                    height={80}
                    rotate={-8}
                    gradient="from-teal/[0.15]"
                    className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
                />

                <ElegantShape
                    delay={0.6}
                    width={200}
                    height={60}
                    rotate={20}
                    gradient="from-gold/[0.14]"
                    className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
                />

                <ElegantShape
                    delay={0.7}
                    width={150}
                    height={40}
                    rotate={-25}
                    gradient="from-brand/[0.12]"
                    className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
                />
            </div>

            <div className="relative z-10 container mx-auto px-4 pt-24 md:px-6 md:pt-28">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/[0.06] border border-brand/[0.18] dark:bg-white/[0.03] dark:border-white/[0.08] mb-8 md:mb-12">
                        <Circle className="h-2 w-2 fill-brand/80" />
                        <span className="text-sm text-ink-soft dark:text-white/60 tracking-wide">
                            {badge}
                        </span>
                    </div>

                    <div>
                        <h1 className="text-2xl sm:text-4xl md:text-[2.5rem] font-bold mb-6 md:mb-8 tracking-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#0a1024] to-[#2a5bd7] dark:from-white dark:to-white/80">
                                {title1}{" "}
                            </span>
                            <br />
                            <span
                                className={cn(
                                    "bg-clip-text text-transparent bg-gradient-to-r from-[#1d3fa8] via-[#2a5bd7] to-[#8a5a00] dark:from-[#7ba3f5] dark:via-white/90 dark:to-gold"
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
