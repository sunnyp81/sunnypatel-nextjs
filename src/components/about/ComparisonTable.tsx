import React from 'react';

export function ComparisonTable() {
  return (
    <div className="mx-auto mt-16 max-w-4xl px-6">
      <h3 className="mb-8 text-center text-2xl font-bold text-foreground"
          style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
        Why Choose a Specialist vs. a Generalist Agency
      </h3>
      <div className="overflow-hidden rounded-xl border border-white/[0.06]">
        <table className="w-full text-left text-sm text-muted-foreground">
          <thead className="border-b border-white/[0.06] bg-white/[0.02] text-xs uppercase text-foreground">
            <tr>
              <th scope="col" className="px-6 py-3">Feature</th>
              <th scope="col" className="px-6 py-3">Sunny Patel (Specialist)</th>
              <th scope="col" className="px-6 py-3">Generic SEO Agency (Generalist)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/[0.03]">
              <th scope="row" className="whitespace-nowrap px-6 py-4 font-medium text-foreground">Approach</th>
              <td className="px-6 py-4">Semantic, Entity-based, AI-driven</td>
              <td className="px-6 py-4">Keyword-centric, Volume-focused</td>
            </tr>
            <tr className="border-b border-white/[0.03]">
              <th scope="row" className="whitespace-nowrap px-6 py-4 font-medium text-foreground">Focus</th>
              <td className="px-6 py-4">Long-term organic growth, Topical Authority</td>
              <td className="px-6 py-4">Quick wins, Traffic metrics</td>
            </tr>
            <tr className="border-b border-white/[0.03]">
              <th scope="row" className="whitespace-nowrap px-6 py-4 font-medium text-foreground">Reporting</th>
              <td className="px-6 py-4">Detailed GSC insights, Revenue-aligned</td>
              <td className="px-6 py-4">Standard analytics, Rank tracking</td>
            </tr>
            <tr className="border-b border-white/[0.03]">
              <th scope="row" className="whitespace-nowrap px-6 py-4 font-medium text-foreground">Team Structure</th>
              <td className="px-6 py-4">Solo expert, Direct communication</td>
              <td className="px-6 py-4">Account managers, Junior staff</td>
            </tr>
            <tr>
              <th scope="row" className="whitespace-nowrap px-6 py-4 font-medium text-foreground">Cost Model</th>
              <td className="px-6 py-4">Retainer/Project-based, Value-driven</td>
              <td className="px-6 py-4">Hourly/Fixed-price, Activity-driven</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}