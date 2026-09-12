export const aeoReviewed = "2026-09-12";
export const aeoNeeds = [
  { id: "all", label: "All business needs" },
  { id: "audit", label: "An audit and a clear implementation plan" },
  { id: "technical", label: "Technical SEO and content improvements" },
  { id: "authority", label: "Digital PR and third-party coverage" },
  { id: "integrated", label: "An agency to coordinate ongoing delivery" },
  { id: "consultant", label: "Direct consultant support" },
] as const;
type AeoNeed = (typeof aeoNeeds)[number]["id"];
type AeoProvider = {
  id: string; name: string; url: string; needs: AeoNeed[]; fit: string;
  summary: string; evidence: string; question: string; scope: string; price: string;
  sources: { label: string; url: string }[]; checked: string; owned?: boolean; disclosure?: string;
};

// Alphabetical editorial shortlist. Scope and provider-reported evidence are distinct.
export const aeoProviders: AeoProvider[] = [
  {
    id: "aira", name: "Aira", url: "https://aira.net/", needs: ["authority"],
    fit: "Digital PR as the off-site part of an AEO programme",
    summary: "Aira positions relevant earned coverage and third-party mentions as support for generative-search visibility. Consider it when the missing capability is digital PR, particularly for finance and other sectors with demanding approval processes.",
    evidence: "Its personal-loans case reports coverage, links and search-position changes. That is PR and organic-search evidence, rather than a measured AI-citation result. Aira says bottom-line attribution for that case was not completed.",
    question: "Which AI-search sources would you target, and what measurement or technical work needs another team?",
    scope: "This profile covers off-site GEO and PR. Confirm who owns technical work and AI measurement.",
    price: "Aira publishes digital PR starting generally from £3,000 per month. This is a PR starting price, not a complete AEO programme quote. Confirm scope and VAT.",
    sources: [{ label: "Digital PR scope and pricing", url: "https://aira.net/digital-pr/" }, { label: "Personal-loans PR case", url: "https://aira.net/case-studies/digital-pr-for-personal-loans/" }], checked: aeoReviewed,
  },
  {
    id: "distinctly", name: "Distinctly", url: "https://distinctly.co/", needs: ["technical", "authority", "integrated"],
    fit: "Consumer brands coordinating content, search and PR",
    summary: "Distinctly's AI-search offer combines visibility tracking, content and structured data, competitor analysis, digital PR and referral reporting. Consider it for consumer, ecommerce and travel brands that need content and PR to work together.",
    evidence: "The Away Resorts case reports organic growth alongside a combined uplift labelled LLM visibility and revenue. That wording does not establish a separate revenue figure. Ask for the definition, baseline and attribution before using it to forecast your results.",
    question: "Which outcomes in the case study came from AI referrals, and which came from wider organic work?",
    scope: "Separate AI visibility, organic traffic and revenue definitions in the proposal.",
    price: "Quote required. No fixed AEO fee was published on the reviewed service page.",
    sources: [{ label: "AI at Distinctly", url: "https://distinctly.co/ai-at-distinctly/" }, { label: "Away Resorts case study", url: "https://distinctly.co/case-studies/away-resorts-organic-case-study/" }], checked: aeoReviewed,
  },
  {
    id: "impression", name: "Impression", url: "https://www.impressiondigital.com/", needs: ["audit", "technical", "authority", "integrated"],
    fit: "B2B brands with complex sites and an in-house team",
    summary: "Impression offers GEO audits and delivery across technical SEO, content, digital PR and AI visibility reporting. Its service includes prompt tracking, mentions, citations, sentiment and referral or conversion measurement.",
    evidence: "Its Tensar case reports AI Overview citations tracked in Ahrefs and Search Console traffic for keywords displaying AI Overviews. Those keyword clicks are not an isolated count of clicks on AI Overview citations. Ask for the reporting boundaries.",
    question: "How will your dashboard distinguish AI Overview keyword traffic from directly attributable AI referrals?",
    scope: "Agree the reporting definitions and who implements technical and content changes.",
    price: "Bespoke quote required for audits and ongoing work. No standard GEO price is published.",
    sources: [{ label: "Impression GEO services", url: "https://www.impressiondigital.com/generative-engine-optimisation-agency/" }, { label: "Tensar GEO case study", url: "https://www.impressiondigital.com/our-work/tensar-geo/" }], checked: aeoReviewed,
  },
  {
    id: "reboot", name: "Reboot Online", url: "https://www.rebootonline.com/", needs: ["audit", "technical", "authority", "integrated"],
    fit: "Established brands wanting research and coordinated GEO delivery",
    summary: "Reboot's GEO service covers audits, prompt research, visibility mapping, technical and content work, digital PR and reporting. Its published research and client cases give buyers specific methods to question before commissioning a programme.",
    evidence: "The TUI case describes a set of 10 monitored prompts and reports presence across all 10. That is a result within a selected tracked set, not evidence that TUI appears in every relevant AI answer. Request repeated runs and the before-and-after period.",
    question: "How are prompts selected, and how much does the result change when you repeat the same test?",
    scope: "Confirm the prompt sample, delivery allowance and what happens after an audit.",
    price: "GEO retainers start from £2,500 per month; GEO audits typically start from £5,000. These cover different scopes. Confirm the full fee, term and VAT.",
    sources: [{ label: "Reboot GEO service and retainer pricing", url: "https://www.rebootonline.com/geo/" }, { label: "GEO audit scope and pricing", url: "https://www.rebootonline.com/geo/geo-audits/" }, { label: "TUI AI visibility case", url: "https://www.rebootonline.com/case-studies/increasing-category-ai-visibility-tui/" }], checked: aeoReviewed,
  },
  {
    id: "rise-at-seven", name: "Rise at Seven", url: "https://riseatseven.com/", needs: ["technical", "authority", "integrated"],
    fit: "Consumer brands investing across search, content and PR",
    summary: "Rise at Seven's AI SEO offer includes prompt research, citation and sentiment analysis, technical and entity work, content and digital PR. Consider it for consumer or ecommerce campaigns requiring several discovery channels and substantial implementation capacity.",
    evidence: "Its AI service page presents brand examples alongside visibility claims. The linked Parkdean Easter campaign establishes campaign work; ask for a separate AI baseline, tracked surfaces and attributable outcomes rather than treating PR coverage as an AI result.",
    question: "Which part of the fee changes owned content, and which part funds research, PR or other channels?",
    scope: "Request the AI-search deliverables and implementation allowance within the wider programme.",
    price: "Its services page states minimums of £5,000 per month or £15,000 per project. Another onsite-SEO page starts at £4,000. These are broader service figures, not a fixed AI SEO tariff; request a current quote and VAT treatment.",
    sources: [{ label: "AI SEO service", url: "https://riseatseven.com/services/ai-seo-agency/" }, { label: "Published service minimums", url: "https://riseatseven.com/services/" }, { label: "Onsite SEO pricing", url: "https://riseatseven.com/services/onsite-seo/" }, { label: "Parkdean campaign", url: "https://riseatseven.com/work/parkdean-resorts-easter-breaks/" }], checked: aeoReviewed,
  },
  {
    id: "sunny-patel", name: "Sunny Patel", url: "https://sunnypatel.co.uk/", needs: ["audit", "consultant"], owned: true,
    fit: "A fixed-fee AI visibility audit with direct consultant access",
    summary: "My AI Visibility Audit covers repeated prompt runs, technical access, entity information, source analysis, three competitors and a prioritised 90-day plan. It is intended for mid-size and large UK businesses with considered buying journeys and includes a walkthrough.",
    evidence: "I publish selected portfolio AI-referral observations and report that a healthcare client found my practice through Bing Copilot before hiring me. The acquisition account is mine. It is not an independently audited result or a basis for claiming exclusivity over other providers.",
    question: "Which prompts and competitors will you measure, and who will implement the resulting plan?",
    scope: "An audit delivers a plan. Agree implementation separately and confirm my capacity.",
    price: "£1,500 fixed audit, advertised for delivery in two weeks. Fractional support starts at £1,500 per month. Confirm scope, availability and VAT before booking.",
    disclosure: "This is my consultancy and I wrote this guide. My inclusion is a commercial interest, not an independent recommendation.",
    sources: [{ label: "My AI visibility audit and pricing", url: "https://sunnypatel.co.uk/ai-visibility/" }, { label: "Portfolio AI referral observations", url: "https://sunnypatel.co.uk/ai-visibility-results/" }, { label: "Referral study and my acquisition account", url: "https://sunnypatel.co.uk/blog/ai-referral-traffic-study/" }], checked: aeoReviewed,
  },
  {
    id: "seo-works", name: "The SEO Works", url: "https://www.seoworks.co.uk/", needs: ["audit", "technical", "integrated"],
    fit: "An established search team combining organic SEO and GEO",
    summary: "The SEO Works publishes dedicated GEO and AI optimisation services covering question research, structured content and citation or referral measurement. Consider it when answer-engine work needs to sit within an ongoing organic-search programme.",
    evidence: "Its pool-rental case reports a citation rate across a 14-query AI Overview subset. That denominator matters: the figure is not a rate across all customer searches. Other cases use referral and sales measures, which need separate definitions.",
    question: "Which measure in your case study matches our objective, and what is its denominator?",
    scope: "Confirm paid delivery beyond the advertised free LLM audit and separate each reporting metric.",
    price: "Quote required for paid services. A free LLM audit is advertised; no fixed ongoing AEO price was published on the reviewed pages.",
    sources: [{ label: "GEO services", url: "https://www.seoworks.co.uk/seo-services/generative-engine-optimisation-geo/" }, { label: "AI optimisation services", url: "https://www.seoworks.co.uk/seo-services/ai-optimisation-services-aio/" }, { label: "Pool-rental AI Overview case", url: "https://www.seoworks.co.uk/case-studies/ai-overview-visibility-for-pool-rental/" }], checked: aeoReviewed,
  },
  {
    id: "tom-riley", name: "Tom Riley", url: "https://tom-riley.co.uk/", needs: ["audit", "technical", "authority", "consultant"],
    fit: "Direct AI-search consultancy for competitive service sectors",
    summary: "Tom Riley offers AI-search and SEO consultancy spanning audits, implementation, digital PR and entity-focused work. His published experience includes insurance and fintech, making those relevant sectors to ask about during a scope discussion.",
    evidence: "His site describes client citations, recommendations and lead stories. Treat those as practitioner-reported accounts and request dates, prompts and supporting analytics for a comparable project.",
    question: "Can you show the prompt set, repeated observations and enquiry evidence behind a comparable case?",
    scope: "Confirm direct delivery capacity, implementation responsibilities and measurement access.",
    price: "Quote required. No fixed consultancy fee was published on the reviewed pages.",
    disclosure: "Tom has included me in his GEO and AI SEO consultant guides. That connection is disclosed so you can weigh this inclusion.",
    sources: [{ label: "Tom Riley consultancy", url: "https://tom-riley.co.uk/" }, { label: "Background and experience", url: "https://tom-riley.co.uk/about/" }, { label: "AI SEO consultant guide and disclosure", url: "https://tom-riley.co.uk/best-ai-seo-consultants-uk-2026/" }, { label: "GEO consultant guide", url: "https://tom-riley.co.uk/best-geo-consultants-uk-2026/" }], checked: aeoReviewed,
  },
];

export const aeoProposalCriteria = [
  { name: "Measurement quality", weight: 30, prompt: "Defined prompts, repeated runs, surfaces, dates, denominators and metric limits." },
  { name: "Implementation plan", weight: 25, prompt: "Specific changes, responsible people, approvals and realistic delivery capacity." },
  { name: "Relevant evidence", weight: 20, prompt: "Comparable work with a baseline and clearly attributed outcomes." },
  { name: "Source and content quality", weight: 15, prompt: "Accurate owned content and a credible plan for relevant third-party sources." },
  { name: "Commercial clarity", weight: 10, prompt: "Full cost, tool access, ownership, exclusions and an agreed exit process." },
] as const;
