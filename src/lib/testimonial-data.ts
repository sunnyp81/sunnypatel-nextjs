// =============================================================================
// REAL CLIENT TESTIMONIALS
// =============================================================================
// These feed TWO places:
//   1. reviewSchema() in layout.tsx → JSON-LD LocalBusiness review + aggregateRating
//   2. GENERIC_DATA.testimonials in [slug]/page.tsx → visual TestimonialGrid
//
// When a new GBP review comes in or a client sends a testimonial, add it here
// AND copy it into GENERIC_DATA.testimonials in src/app/services/[slug]/page.tsx
// =============================================================================

export const TESTIMONIALS = [
  {
    text: "The SEO work delivered real results — I'm seeing more clicks compared to this time last year in Google Analytics, without having to spend loads on advertising. Super impressed.",
    author: "Dr Shaan Patel",
    role: "Founder, Aatma Aesthetics",
  },
] as const;
