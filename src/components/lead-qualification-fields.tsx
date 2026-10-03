"use client";

import { FormField } from "@/components/ui/form-field";
import { SUPPORT_TYPE_LABELS } from "@/lib/lead-qualification";

const SUPPORT_OPTIONS = Object.entries(SUPPORT_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const BUDGET_OPTIONS = [
  { value: "under_600", label: "Below £600 per month" },
  { value: "600_1499", label: "£600 to £1,499 per month" },
  { value: "1500_plus", label: "£1,500 or more per month" },
  { value: "not_sure", label: "Not sure" },
];
const TIMING_OPTIONS = [
  { value: "now", label: "Ready to start now" },
  { value: "within_3_months", label: "Within three months" },
  { value: "later", label: "Exploring for later" },
  { value: "not_sure", label: "Not sure" },
];

const SELECT_CLASS =
  "w-full min-h-11 rounded-xl border border-hairline-strong bg-white px-4 py-3 text-sm text-foreground transition-[border-color,box-shadow,opacity] duration-300 focus:border-brand-ink/50 focus:outline-none focus:ring-2 focus:ring-brand-ink/25 disabled:opacity-50 dark:border-input dark:bg-[#0a0a0f]";

function OptionalSelect({
  id,
  field,
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  id: string;
  field: "budget" | "timing";
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (key: string, event: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-muted-foreground">
        {label} <span className="text-muted-foreground">(optional)</span>
      </label>
      <select id={id} value={value} onChange={(event) => onChange(field, event)} disabled={disabled} className={`${SELECT_CLASS} appearance-none`}>
        <option value="">Choose if known</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  );
}

/** Qualification answers are optional and remain separate from the free-text message. */
export function LeadQualificationFields({
  idPrefix,
  formData,
  onChange,
  disabled,
}: {
  idPrefix: string;
  formData: Record<string, string>;
  onChange: (key: string, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  disabled?: boolean;
}) {
  const supportId = `${idPrefix}-supportType`;
  return (
    <div className="space-y-5">
      <div>
        <label htmlFor={supportId} className="mb-2 block text-sm font-medium text-muted-foreground">
          Type of support <span className="text-muted-foreground">(optional)</span>
        </label>
        <select id={supportId} value={formData.supportType ?? ""} onChange={(event) => onChange("supportType", event)} disabled={disabled} className={`${SELECT_CLASS} appearance-none`}>
          <option value="">Choose if known</option>
          {SUPPORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>

      <FormField
        id={`${idPrefix}-website`}
        label="Website"
        type="text"
        inputMode="url"
        placeholder="https://example.com"
        optional
        value={formData.website ?? ""}
        onChange={(event) => onChange("website", event)}
        disabled={disabled}
      />

      <details className="group rounded-lg">
        <summary className="min-h-11 cursor-pointer py-2 text-sm font-medium text-brand-ink underline decoration-brand/50 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ink/50">
          Add budget and timing (optional)
        </summary>
        <div className="space-y-5 pt-4">
          <OptionalSelect id={`${idPrefix}-budget`} field="budget" label="Monthly budget range" value={formData.budget ?? ""} options={BUDGET_OPTIONS} onChange={onChange} disabled={disabled} />
          <OptionalSelect id={`${idPrefix}-timing`} field="timing" label="When are you looking to start?" value={formData.timing ?? ""} options={TIMING_OPTIONS} onChange={onChange} disabled={disabled} />
        </div>
      </details>
    </div>
  );
}
