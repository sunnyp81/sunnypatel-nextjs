import { AlertCircle, CheckCircle2 } from "lucide-react";

// Shared field styling, previously copy-pasted across all three lead forms.
const FIELD_CLASS =
  "w-full rounded-xl border border-white/[0.08] bg-[#0a0a0f] px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 transition-all duration-300 focus:border-brand/40 focus:shadow-[0_0_20px_rgba(91,138,239,0.1)] focus:outline-none disabled:opacity-50";

export function FormField({
  id,
  label,
  type = "text",
  placeholder,
  required = false,
  optional = false,
  value,
  onChange,
  disabled,
  multiline = false,
  rows = 4,
  srOnlyLabel = false,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  srOnlyLabel?: boolean;
}) {
  const labelEl = (
    <label
      htmlFor={id}
      className={
        srOnlyLabel
          ? "sr-only"
          : "mb-2 block text-sm font-medium text-muted-foreground"
      }
    >
      {label}
      {required && <span className="ml-1 text-brand">*</span>}
      {optional && (
        <span className="ml-1 text-muted-foreground/70">(optional)</span>
      )}
    </label>
  );

  const shared = {
    id,
    value,
    onChange,
    placeholder,
    required,
    disabled,
    "aria-required": required || undefined,
  };

  return (
    <div>
      {labelEl}
      {multiline ? (
        <textarea {...shared} rows={rows} className={`${FIELD_CLASS} resize-none`} />
      ) : (
        <input {...shared} type={type} className={FIELD_CLASS} />
      )}
    </div>
  );
}

/** Error banner — announced to assistive tech via role="alert". */
export function FormError({
  message,
  compact = false,
}: {
  message: string;
  compact?: boolean;
}) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={
        compact
          ? "flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400"
          : "flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
      }
    >
      <AlertCircle className={compact ? "h-3 w-3 shrink-0" : "h-4 w-4 shrink-0"} />
      {message}
    </div>
  );
}

/** Shared success panel used by the Contact + ServiceInlineForm cards. */
export function FormSuccess({
  message,
  onReset,
}: {
  message: string;
  onReset: () => void;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-success/30 bg-success/10">
        <CheckCircle2 className="h-8 w-8 text-success" />
      </div>
      <h3
        className="text-xl font-bold text-foreground"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Message sent!
      </h3>
      <p className="max-w-xs text-sm text-muted-foreground">{message}</p>
      <button
        onClick={onReset}
        className="mt-2 text-sm text-brand transition-colors hover:text-brand/80"
      >
        Send another message
      </button>
    </div>
  );
}
