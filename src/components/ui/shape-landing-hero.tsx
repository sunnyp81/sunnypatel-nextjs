"use client";

import Image from "next/image";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

function HeroGeometric({
    badge = "SEO Consultant",
    title1 = "SEO Consulting That",
    title2 = "Generates Clients, Not Reports",
    children,
    heroImage,
}: {
    badge?: string;
    title1?: string;
    title2?: string;
    children?: React.ReactNode;
    heroImage?: { src: string; alt: string };
}) {
    return (
        <section id="homepage-hero" className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030303]">
            <div className="absolute inset-0 bg-gradient-to-br from-brand/[0.06] via-transparent to-gold/[0.04] blur-3xl" />

            <div className="relative z-10 container mx-auto px-4 pt-24 md:px-6 md:pt-28">
                <div className={heroImage ? "grid gap-8 lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] lg:items-center lg:gap-10" : undefined}>
                    <div className={cn("max-w-3xl mx-auto text-center", heroImage && "relative z-10 w-full min-w-0 lg:mx-0 lg:text-left")}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8 md:mb-12">
                            <Circle className="h-2 w-2 fill-brand/80" />
                            <span className="text-sm text-white/60 tracking-wide">
                                {badge}
                            </span>
                        </div>

                        <div>
                            <h1 className="text-2xl sm:text-4xl md:text-[2.5rem] font-bold mb-6 md:mb-8 tracking-tight">
                                <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                                    {title1}{" "}
                                </span>
                                <br />
                                <span
                                    className={cn(
                                        "bg-clip-text text-transparent bg-gradient-to-r from-[#7ba3f5] via-white/90 to-gold"
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
                    {heroImage && (
                        <div className="pointer-events-none relative z-0 mx-auto w-full max-w-sm overflow-visible lg:max-w-none">
                            <Image
                                src={heroImage.src}
                                alt={heroImage.alt}
                                width={800}
                                height={450}
                                className="h-auto w-full scale-[1.35] mix-blend-screen"
                                style={{
                                    maskImage: 'radial-gradient(ellipse 60% 55% at center, #000 55%, transparent 100%)',
                                    WebkitMaskImage: 'radial-gradient(ellipse 60% 55% at center, #000 55%, transparent 100%)',
                                }}
                                priority
                                sizes="(max-width: 1023px) 384px, 45vw"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-[#030303]/80 pointer-events-none" />
        </section>
    );
}

export { HeroGeometric };
