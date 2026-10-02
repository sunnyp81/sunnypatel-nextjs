import React from 'react';
import { CheckCircle } from 'lucide-react';

export function HowIWorkSteps() {
  const steps = [
    {
      title: 'Initial Consultation & Discovery',
      description: 'I start with a free 20-minute SEO diagnosis focused on your business, its main search problem and a useful next step.',
    },
    {
      title: 'Strategic Audit & Proposal',
      description: 'A scoped audit or proposal follows when deeper work is appropriate. I agree the technical, content and competitive analysis required before the work begins.',
    },
    {
      title: 'Implementation & Optimisation',
      description: 'After you approve the scope, I implement the agreed technical and content changes. Ongoing analysis checks results and informs the next priorities.',
    },
    {
      title: 'Transparent Reporting & Communication',
      description: 'You receive regular, clear reports detailing progress, key metrics, and upcoming priorities. Open communication ensures you\'re always informed and aligned with the strategic direction.',
    },
  ];

  return (
    <div className="mx-auto mt-16 max-w-4xl px-6">
      <h3 className="mb-8 text-center text-2xl font-bold text-foreground"
          style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
        How My Process Works
      </h3>
      <div className="space-y-8">
        {steps.map((step) => (
          <div key={step.title} className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand-ink">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground"
                 style={{ fontFamily: 'var(--font-heading)' }}>
                {step.title}
              </p>
              <p className="mt-1 text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
