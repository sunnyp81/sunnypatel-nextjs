import React from 'react';
import { CheckCircle } from 'lucide-react';

export function HowIWorkSteps() {
  const steps = [
    {
      title: 'Initial Consultation & Discovery',
      description: 'We begin with a free, in-depth discussion to understand your business, goals, and current challenges. This helps identify key opportunities for organic growth.',
    },
    {
      title: 'Strategic Audit & Proposal',
      description: 'I conduct a comprehensive technical, semantic, and competitive audit of your website. Based on these insights, a tailored, data-driven SEO strategy and proposal are developed.',
    },
    {
      title: 'Implementation & Optimisation',
      description: 'Once approved, the strategy is put into action, covering on-page, technical, and content SEO. This involves ongoing monitoring, analysis, and iterative adjustments for optimal performance.',
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
        {steps.map((step, index) => (
          <div key={step.title} className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#5B8AEF]/10 text-[#5B8AEF]">
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
