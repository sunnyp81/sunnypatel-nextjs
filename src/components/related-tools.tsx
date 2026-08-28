import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { tools } from "@/lib/tools-data";

export function RelatedTools({ currentHref }: { currentHref: string }) {
  const current = tools.find((t) => t.href === currentHref);
  const rest = tools.filter((t) => t.href !== currentHref);

  const sameCategory = current
    ? rest.filter((t) => t.category === current.category)
    : [];
  const others = rest.filter((t) => !sameCategory.includes(t));
  const picked = [...sameCategory, ...others].slice(0, 3);

  if (picked.length === 0) return null;

  return (
    <div className="border-t border-white/[0.05]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2
          className="mb-6 text-lg font-semibold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          More free SEO tools
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {picked.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-300 hover:border-brand/30 hover:bg-brand/[0.04]"
            >
              <h3 className="font-semibold text-foreground group-hover:text-brand transition-colors">
                {tool.name}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {tool.description}
              </p>
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-muted-foreground/70 transition-all duration-200 group-hover:gap-2 group-hover:text-brand">
                Try it <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
