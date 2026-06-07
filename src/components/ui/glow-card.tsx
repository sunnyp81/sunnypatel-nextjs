import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

/**
 * GlowCard — the repeated "outer rounded border + GlowingEffect" shell used
 * across services, portfolio, about and the forms. The inner card markup is
 * passed as children so each surface keeps its exact content, while the glow
 * wrapper and its props live in one place.
 */
export function GlowCard({
  children,
  className,
  spread = 40,
  proximity = 64,
  borderWidth = 3,
  blur = 0,
}: {
  children: React.ReactNode;
  className?: string;
  spread?: number;
  proximity?: number;
  borderWidth?: number;
  blur?: number;
}) {
  return (
    <div className={cn("relative rounded-[1.25rem] border-[0.75px] border-border p-2", className)}>
      <GlowingEffect
        spread={spread}
        glow
        disabled={false}
        proximity={proximity}
        inactiveZone={0.01}
        borderWidth={borderWidth}
        blur={blur}
      />
      {children}
    </div>
  );
}
