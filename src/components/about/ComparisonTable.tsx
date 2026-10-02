import React from 'react';

export function ComparisonTable() {
  return (
    <div className="mx-auto mt-16 max-w-4xl px-6">
      <h3 className="mb-8 text-center text-2xl font-bold text-foreground"
          style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
        How to Compare My SEO Service with an Agency
      </h3>
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        This comparison describes my SEO service and questions to verify with another provider. Agency delivery varies; the questions are not claims about every agency.
      </p>
      <div className="overflow-x-auto rounded-xl border border-hairline dark:border-white/[0.06]">
        <table className="w-full min-w-[560px] text-left text-sm text-muted-foreground">
          <thead className="border-b border-hairline dark:border-white/[0.06] bg-surface-1 dark:bg-white/[0.02] text-xs uppercase text-foreground">
            <tr>
              <th scope="col" className="px-6 py-3">Feature</th>
              <th scope="col" className="px-6 py-3">My Service (Sole Consultant)</th>
              <th scope="col" className="px-6 py-3">Questions to Ask an Agency</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-hairline dark:border-white/[0.03]">
              <th scope="row" className="whitespace-nowrap px-6 py-4 font-medium text-foreground">Approach</th>
              <td className="px-6 py-4">Semantic, Entity-based, AI-driven</td>
              <td className="px-6 py-4">How do you research intent and support content claims?</td>
            </tr>
            <tr className="border-b border-hairline dark:border-white/[0.03]">
              <th scope="row" className="whitespace-nowrap px-6 py-4 font-medium text-foreground">Focus</th>
              <td className="px-6 py-4">Long-term organic growth, Topical Authority</td>
              <td className="px-6 py-4">Which business outcomes will the work target?</td>
            </tr>
            <tr className="border-b border-hairline dark:border-white/[0.03]">
              <th scope="row" className="whitespace-nowrap px-6 py-4 font-medium text-foreground">Reporting</th>
              <td className="px-6 py-4">Detailed GSC insights, Revenue-aligned</td>
              <td className="px-6 py-4">Which data sources and metrics will the reports use?</td>
            </tr>
            <tr className="border-b border-hairline dark:border-white/[0.03]">
              <th scope="row" className="whitespace-nowrap px-6 py-4 font-medium text-foreground">Team Structure</th>
              <td className="px-6 py-4">Solo expert, Direct communication</td>
              <td className="px-6 py-4">Who plans, implements and reviews the work?</td>
            </tr>
            <tr>
              <th scope="row" className="whitespace-nowrap px-6 py-4 font-medium text-foreground">Cost Model</th>
              <td className="px-6 py-4">Retainer/Project-based, Value-driven</td>
              <td className="px-6 py-4">What is included in the quoted fee?</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
