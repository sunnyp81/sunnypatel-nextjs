import Link from "next/link";

export function ToolNextStep({ lead, href, label }: { lead: string; href: string; label: string }) {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <p className="mt-8 text-sm text-muted-foreground">
        {lead}{" "}
        <Link className="text-brand underline underline-offset-2" href={href}>
          {label}
        </Link>
        .
      </p>
    </div>
  );
}
