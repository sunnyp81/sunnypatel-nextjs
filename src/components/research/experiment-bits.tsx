import { statusLabelOf, type Experiment } from "@/data/experiments";

export const BUILD_DATE = new Date().toISOString().slice(0, 10);

export function isOverdue(e: Experiment) {
  return e.status === "running" && !!e.readbackDate && e.readbackDate < BUILD_DATE;
}

export function StatusChips({ e }: { e: Experiment }) {
  return (
    <>
      <span className="inline-flex items-center rounded-md border border-hairline-strong px-2 py-0.5 text-xs font-semibold text-foreground">
        {statusLabelOf(e)}
      </span>
      <span className="inline-flex items-center rounded-md border border-dashed border-hairline-strong px-2 py-0.5 text-xs font-semibold text-foreground">
        {e.label}
      </span>
      {isOverdue(e) && (
        <span className="inline-flex items-center rounded-md border-2 border-foreground px-2 py-0.5 text-xs font-semibold text-foreground">
          Readback overdue
        </span>
      )}
    </>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-hairline py-3 first:border-t-0 first:pt-0 md:grid-cols-[9rem_1fr] md:gap-6">
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground md:pt-1">{label}</dt>
      <dd className="m-0 text-base leading-relaxed text-foreground">{children}</dd>
    </div>
  );
}
