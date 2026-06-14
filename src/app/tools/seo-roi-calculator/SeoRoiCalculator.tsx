'use client';

import { useState, useMemo, useCallback } from 'react';

// Aggregated organic CTR by Google position (desktop + mobile blended).
// Indices 1..20; positions beyond 20 use a small floor value.
const CTR_BY_POSITION: Record<number, number> = {
  1: 0.271, 2: 0.158, 3: 0.110, 4: 0.080, 5: 0.061,
  6: 0.047, 7: 0.038, 8: 0.031, 9: 0.026, 10: 0.022,
  11: 0.019, 12: 0.017, 13: 0.015, 14: 0.013, 15: 0.012,
  16: 0.011, 17: 0.010, 18: 0.009, 19: 0.008, 20: 0.007,
};

function ctrForPosition(position: number): number {
  if (position <= 1) return CTR_BY_POSITION[1];
  if (position >= 20) return CTR_BY_POSITION[20];
  const low = Math.floor(position);
  const high = Math.ceil(position);
  if (low === high) return CTR_BY_POSITION[low];
  const frac = position - low;
  return CTR_BY_POSITION[low] + (CTR_BY_POSITION[high] - CTR_BY_POSITION[low]) * frac;
}

interface MonthRow {
  month: number;
  position: number;
  clicks: number;
  leads: number;
  revenue: number;
  cumRevenue: number;
  cumCost: number;
}

const GBP = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
});

const NUM = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 });

export default function SeoRoiCalculator() {
  const [searchVolume, setSearchVolume] = useState(2000);
  const [currentPosition, setCurrentPosition] = useState(18);
  const [targetPosition, setTargetPosition] = useState(3);
  const [conversionRate, setConversionRate] = useState(3);
  const [dealValue, setDealValue] = useState(500);
  const [monthlyCost, setMonthlyCost] = useState(750);
  const [rampMonths, setRampMonths] = useState(6);

  const model = useMemo(() => {
    const currentCTR = ctrForPosition(currentPosition);
    const targetCTR = ctrForPosition(targetPosition);

    const currentClicks = searchVolume * currentCTR;
    const targetClicks = searchVolume * targetCTR;
    const extraClicksAtTarget = Math.max(0, targetClicks - currentClicks);
    const extraLeadsAtTarget = extraClicksAtTarget * (conversionRate / 100);
    const extraRevenueAtTarget = extraLeadsAtTarget * dealValue;

    const rows: MonthRow[] = [];
    let cumRevenue = 0;
    let cumCost = 0;
    for (let m = 1; m <= 12; m++) {
      const ramp = rampMonths <= 0 ? 1 : Math.min(1, m / rampMonths);
      const position = currentPosition + (targetPosition - currentPosition) * ramp;
      const clicks = searchVolume * ctrForPosition(position);
      const extraClicks = Math.max(0, clicks - currentClicks);
      const leads = extraClicks * (conversionRate / 100);
      const revenue = leads * dealValue;
      cumRevenue += revenue;
      cumCost += monthlyCost;
      rows.push({ month: m, position, clicks, leads, revenue, cumRevenue, cumCost });
    }

    const year1Revenue = cumRevenue;
    const year1Cost = monthlyCost * 12;
    const year1Profit = year1Revenue - year1Cost;
    const roi = year1Cost > 0 ? (year1Profit / year1Cost) * 100 : 0;

    const paybackRow = rows.find((r) => r.cumRevenue >= r.cumCost);
    const paybackMonth = paybackRow ? paybackRow.month : null;

    return {
      currentCTR,
      targetCTR,
      currentClicks,
      targetClicks,
      extraClicksAtTarget,
      extraLeadsAtTarget,
      extraRevenueAtTarget,
      rows,
      year1Revenue,
      year1Cost,
      year1Profit,
      roi,
      paybackMonth,
    };
  }, [searchVolume, currentPosition, targetPosition, conversionRate, dealValue, monthlyCost, rampMonths]);

  const exportCSV = useCallback(() => {
    const header = 'Month,Position,Incremental clicks,Incremental leads,Incremental revenue,Cumulative revenue,Cumulative cost\n';
    const body = model.rows
      .map((r) =>
        [
          r.month,
          r.position.toFixed(1),
          Math.round(r.clicks),
          r.leads.toFixed(1),
          Math.round(r.revenue),
          Math.round(r.cumRevenue),
          Math.round(r.cumCost),
        ].join(',')
      )
      .join('\n');
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'seo-roi-projection.csv';
    link.click();
    URL.revokeObjectURL(url);
  }, [model]);

  const maxRevenue = Math.max(...model.rows.map((r) => r.revenue), 1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          SEO ROI Calculator
        </h1>
        <p className="mt-3 text-base text-muted-foreground max-w-2xl">
          Estimate the return on an SEO campaign from one keyword: enter the search volume, your
          current and target ranking, conversion rate, and deal value to see projected clicks,
          leads, revenue, payback time, and first-year ROI.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* Inputs */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-5 h-fit">
          <NumberField
            label="Monthly search volume"
            value={searchVolume}
            onChange={setSearchVolume}
            min={0}
            step={100}
            hint="Combined volume for the keyword you are targeting."
          />
          <RangeField
            label="Current ranking position"
            value={currentPosition}
            onChange={setCurrentPosition}
            min={1}
            max={20}
          />
          <RangeField
            label="Target ranking position"
            value={targetPosition}
            onChange={setTargetPosition}
            min={1}
            max={20}
          />
          <NumberField
            label="Conversion rate (%)"
            value={conversionRate}
            onChange={setConversionRate}
            min={0}
            step={0.5}
            hint="Share of visitors that become a lead or sale."
          />
          <NumberField
            label="Average deal or order value (£)"
            value={dealValue}
            onChange={setDealValue}
            min={0}
            step={50}
            hint="Revenue per converted visitor."
          />
          <NumberField
            label="Monthly SEO investment (£)"
            value={monthlyCost}
            onChange={setMonthlyCost}
            min={0}
            step={50}
          />
          <RangeField
            label="Months to reach target"
            value={rampMonths}
            onChange={setRampMonths}
            min={1}
            max={12}
          />
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Extra clicks / mo"
              value={NUM.format(Math.round(model.extraClicksAtTarget))}
              color="text-foreground"
            />
            <StatCard
              label="Extra leads / mo"
              value={NUM.format(Math.round(model.extraLeadsAtTarget))}
              color="text-foreground"
            />
            <StatCard
              label="Extra revenue / mo"
              value={GBP.format(model.extraRevenueAtTarget)}
              color="text-brand"
            />
            <StatCard
              label="First-year ROI"
              value={`${NUM.format(Math.round(model.roi))}%`}
              color={model.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard
              label="Year 1 revenue"
              value={GBP.format(model.year1Revenue)}
              color="text-foreground"
            />
            <StatCard
              label="Year 1 net profit"
              value={GBP.format(model.year1Profit)}
              color={model.year1Profit >= 0 ? 'text-emerald-400' : 'text-red-400'}
            />
            <StatCard
              label="Payback"
              value={model.paybackMonth ? `Month ${model.paybackMonth}` : '> 12 mo'}
              color="text-foreground"
            />
          </div>

          {/* 12-month projection chart */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-lg font-semibold text-foreground"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                12-month incremental revenue
              </h2>
              <button
                onClick={exportCSV}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(91,138,239,0.35)] transition-opacity hover:opacity-90"
              >
                Export CSV
              </button>
            </div>
            <div className="flex items-end gap-1.5 h-40">
              {model.rows.map((r) => (
                <div key={r.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex items-end h-full">
                    <div
                      className="w-full rounded-t bg-brand/70 transition-all"
                      style={{ height: `${(r.revenue / maxRevenue) * 100}%` }}
                      title={`Month ${r.month}: ${GBP.format(r.revenue)}`}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{r.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly table */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Month</th>
                    <th className="px-4 py-3 font-medium">Position</th>
                    <th className="px-4 py-3 font-medium">Clicks</th>
                    <th className="px-4 py-3 font-medium">Leads</th>
                    <th className="px-4 py-3 font-medium">Revenue</th>
                    <th className="px-4 py-3 font-medium">Cumulative</th>
                  </tr>
                </thead>
                <tbody>
                  {model.rows.map((r) => (
                    <tr key={r.month} className="border-b border-white/[0.04] last:border-0">
                      <td className="px-4 py-2.5 text-foreground">{r.month}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{r.position.toFixed(1)}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{NUM.format(Math.round(r.clicks))}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{r.leads.toFixed(1)}</td>
                      <td className="px-4 py-2.5 text-foreground">{GBP.format(r.revenue)}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{GBP.format(r.cumRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 mt-8">
        <h2
          className="text-xl font-bold tracking-tight text-foreground mb-4"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          How the SEO ROI calculation works
        </h2>
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            The calculator turns a ranking improvement into a revenue forecast. It multiplies your
            keyword search volume by the organic click-through rate for a given position, then
            applies your conversion rate and deal value to estimate revenue.
          </p>
          <p>
            Click-through rate falls steeply with position. Position 1 earns around 27% of clicks,
            position 3 around 11%, and position 10 around 2%. Moving a keyword from page 2 to the top
            three captures most of the available revenue.
          </p>
          <p>
            The 12-month projection assumes your ranking improves in a straight line from the current
            position to the target over the ramp period you set, then holds. Payback is the first
            month where cumulative incremental revenue passes cumulative SEO cost. First-year ROI is
            year-one net profit divided by year-one cost.
          </p>
          <p>
            Treat the output as a directional estimate, not a guarantee. Real CTR varies by SERP
            features, brand, and intent, and rankings are never linear. Use it to sanity-check
            whether a keyword is worth the investment.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
      <p className={`text-xl font-bold sm:text-2xl ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  step,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  step: number;
  hint?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground block mb-1.5">{label}</label>
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground focus:border-brand/50 focus:outline-none focus:ring-1 focus:ring-brand/30"
      />
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function RangeField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="text-sm font-semibold text-brand">{value}</span>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand"
      />
    </div>
  );
}
