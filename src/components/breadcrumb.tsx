import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 flex flex-wrap items-center gap-1 text-xs text-muted-foreground/60"
    >
      {items.map((item, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3 shrink-0" />}
          {item.href && i < items.length - 1 ? (
            <Link
              href={item.href}
              className="transition-colors hover:text-foreground/80"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-muted-foreground/40">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
