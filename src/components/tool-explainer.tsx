import type { ReactNode } from "react";

export type ExplainerFaq = { q: string; a: ReactNode };

export function ExplainerLink({ href, children, external = false }: { href: string; children: ReactNode; external?: boolean }) {
  return (
    <a
      className="text-brand underline underline-offset-2"
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

export function ToolExplainer({
  does,
  steps,
  limits,
  faqs,
}: {
  does: ReactNode;
  steps: ReactNode[];
  limits: ReactNode;
  faqs: ExplainerFaq[];
}) {
  const h2 = "mb-3 text-xl font-bold text-foreground";
  const body = "space-y-3 text-sm leading-relaxed text-muted-foreground";
  return (
    <div className="mx-auto mt-6 max-w-6xl px-4 sm:px-6">
      <div className="max-w-3xl space-y-10">
        <section>
          <h2 className={h2}>What this tool does</h2>
          <div className={body}>{does}</div>
        </section>
        <section>
          <h2 className={h2}>How to use it</h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            {steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </section>
        <section>
          <h2 className={h2}>What it cannot tell you</h2>
          <div className={body}>{limits}</div>
        </section>
        <section>
          <h2 className={h2}>Questions</h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <div key={f.q}>
                <h3 className="font-semibold text-foreground">{f.q}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
