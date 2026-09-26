"use client";

import { useId, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { BUYER_TOOLS as TOOLS, type BuyerToolId as ToolId } from "@/data/buyer-tools";

function ToolSkeleton() {
  return (
    <div
      className="min-h-[420px] w-full animate-pulse rounded-2xl border border-hairline bg-surface-2 dark:border-white/[0.08] dark:bg-black/20"
      role="status"
      aria-label="Loading tool"
    />
  );
}

const SeoQuoteChecker = dynamic(
  () => import("@/components/glow/buyer-tools").then((m) => m.SeoQuoteChecker),
  { ssr: false, loading: ToolSkeleton },
);
const AgencyRedFlagScorer = dynamic(
  () => import("@/components/glow/buyer-tools").then((m) => m.AgencyRedFlagScorer),
  { ssr: false, loading: ToolSkeleton },
);
const ResourcingPicker = dynamic(
  () => import("@/components/glow/buyer-tools").then((m) => m.ResourcingPicker),
  { ssr: false, loading: ToolSkeleton },
);

const TOOL_COMPONENTS: Record<ToolId, React.ComponentType> = {
  quote: SeoQuoteChecker,
  agency: AgencyRedFlagScorer,
  resourcing: ResourcingPicker,
};

export function BuyerToolsSection() {
  const tabBaseId = useId();
  const [active, setActive] = useState<ToolId>("quote");
  const tabRefs = useRef<Partial<Record<ToolId, HTMLButtonElement | null>>>({});

  const activeIndex = TOOLS.findIndex((t) => t.id === active);

  function focusTab(index: number) {
    const wrapped = (index + TOOLS.length) % TOOLS.length;
    const next = TOOLS[wrapped];
    setActive(next.id);
    tabRefs.current[next.id]?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      focusTab(activeIndex + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusTab(activeIndex - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusTab(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusTab(TOOLS.length - 1);
    }
  }

  const ActiveTool = TOOL_COMPONENTS[active];
  const activeTool = TOOLS[activeIndex];

  return (
    <section
      id="buyer-tools"
      aria-labelledby="buyer-tools-heading"
      className="bg-surface-1 py-24 md:py-32 dark:bg-transparent"
    >
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-ink">
            Free tools, no email required
          </p>
          <h2
            id="buyer-tools-heading"
            className="text-2xl font-bold text-foreground md:text-3xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
          >
            Check your SEO quote, agency or hire before you commit
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
            I built these for the three questions I get asked most. They run entirely in your browser: nothing you
            enter is sent anywhere.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Buyer tools"
          onKeyDown={onKeyDown}
          className="grid grid-cols-1 gap-2 sm:grid-cols-3"
        >
          {TOOLS.map((tool) => {
            const selected = tool.id === active;
            return (
              <button
                key={tool.id}
                ref={(el) => {
                  tabRefs.current[tool.id] = el;
                }}
                role="tab"
                type="button"
                id={`${tabBaseId}-tab-${tool.id}`}
                aria-selected={selected}
                aria-controls={`${tabBaseId}-panel-${tool.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(tool.id)}
                className={`min-h-11 rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                  selected
                    ? "border-brand-ink bg-brand-wash text-ink-strong"
                    : "border-hairline bg-background text-muted-foreground hover:border-hairline-strong hover:text-ink-soft dark:border-white/[0.08] dark:hover:border-white/[0.16]"
                }`}
              >
                <span className="block">{tool.label}</span>
                <span className="mt-0.5 block text-xs font-normal text-ink-faint">{tool.question}</span>
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground" aria-live="polite">
          {activeTool.description}
        </p>

        <div className="mt-4">
          {TOOLS.map((tool) => {
            const Tool = TOOL_COMPONENTS[tool.id];
            const selected = tool.id === active;
            return (
              <div
                key={tool.id}
                role="tabpanel"
                id={`${tabBaseId}-panel-${tool.id}`}
                aria-labelledby={`${tabBaseId}-tab-${tool.id}`}
                hidden={!selected}
                tabIndex={0}
              >
                {selected ? <Tool /> : null}
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-sm">
          <Link
            href={activeTool.sourceHref}
            className="text-brand-ink underline-offset-4 hover:underline"
          >
            {activeTool.sourceLabel}
          </Link>
        </p>
      </div>
    </section>
  );
}
