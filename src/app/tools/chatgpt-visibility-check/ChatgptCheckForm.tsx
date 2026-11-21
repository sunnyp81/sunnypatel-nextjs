'use client';

import { ArrowRight, Loader2 } from 'lucide-react';
import { FormField, FormError, FormSuccess } from '@/components/ui/form-field';
import { useLeadForm } from '@/lib/use-lead-form';

export function buyerQuestions(service: string, town: string): string[] {
  const s = service.trim() || 'your service';
  const t = town.trim() || 'your town';
  return [
    `Who is the best ${s} in ${t}?`,
    `Can you recommend a good ${s} near ${t}?`,
    `Which ${s} in ${t} has the best reviews?`,
  ];
}

export default function ChatgptCheckForm() {
  const { status, setStatus, errorMsg, formData, handleChange, handleSubmit } = useLeadForm({
    initial: { name: '', email: '', business: '', website: '', town: '', service: '' },
    eventCategory: 'contact',
    eventLabel: 'chatgpt_check_form',
    offerId: 'free_chatgpt_check',
    leadValue: 80,
    transform: (d) => ({
      name: d.name,
      email: d.email,
      offer: 'Free ChatGPT check (3 questions)',
      message: [
        `Business: ${d.business}`,
        `Website: ${d.website}`,
        `Town or area: ${d.town}`,
        `Service: ${d.service}`,
        '',
        'Questions to ask in signed-out ChatGPT (new chat each):',
        ...buyerQuestions(d.service, d.town).map((q, i) => `${i + 1}. ${q}`),
      ].join('\n'),
    }),
  });

  const questions = buyerQuestions(formData.service, formData.town);
  const busy = status === 'loading';

  if (status === 'success') {
    return (
      <FormSuccess
        message="Your free ChatGPT check is booked. I'll email the three answers within one working day."
        onReset={() => setStatus('idle')}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="business" label="Business name" placeholder="Smith & Sons Electrical" required value={formData.business} onChange={handleChange} disabled={busy} />
          <FormField id="website" label="Website" type="url" inputMode="url" placeholder="https://example.co.uk" required value={formData.website} onChange={handleChange} disabled={busy} />
          <FormField id="service" label="What buyers search for" placeholder="electrician" required value={formData.service} onChange={handleChange} disabled={busy} />
          <FormField id="town" label="Town or area" placeholder="Reading" required value={formData.town} onChange={handleChange} disabled={busy} />
          <FormField id="name" label="Your name" autoComplete="name" required value={formData.name} onChange={handleChange} disabled={busy} />
          <FormField id="email" label="Email for the results" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} disabled={busy} />
        </div>
        <FormError message={errorMsg} />
        <button
          type="submit"
          disabled={busy}
          aria-busy={busy}
          data-cta-location="chatgpt_check_form"
          data-cta-offer="free_chatgpt_check"
          className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-semibold text-white transition-[transform,box-shadow,opacity] duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
          style={{ fontFamily: 'var(--font-heading)', background: 'linear-gradient(135deg, #2854C5 0%, #1F469F 100%)' }}
        >
          {busy ? (<><Loader2 className="h-4 w-4 animate-spin" />Sending…</>) : (<>Send me my free ChatGPT check<ArrowRight className="h-4 w-4" /></>)}
        </button>
        <p className="text-xs text-muted-foreground">Free. One check per business. I reply by email within one working day.</p>
      </div>

      <div className="rounded-2xl border border-hairline bg-wash p-5 dark:border-white/[0.08] dark:bg-white/[0.02]" aria-live="polite">
        <p className="text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
          The three questions I will ask ChatGPT
        </p>
        <ol className="mt-4 space-y-3">
          {questions.map((q, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
              <span className="font-semibold text-brand-ink">{i + 1}.</span>
              <span>{q}</span>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          These update as you type. For each answer I note whether your business is named, whether your website is cited and which businesses ChatGPT names instead.
        </p>
      </div>
    </form>
  );
}
