export const localSeoShortlistReviewed = "2026-09-12";
export const localSeoNeeds = [
  { id: "all", label: "All business needs" },
  { id: "single", label: "One shop, clinic or premises" },
  { id: "service-area", label: "A business that visits customers" },
  { id: "multi", label: "Several locations or branches" },
  { id: "integrated", label: "Local SEO with website or paid media work" },
  { id: "consultant", label: "Direct consultant support" },
] as const;
type LocalNeed = (typeof localSeoNeeds)[number]["id"];
export type LocalSeoProvider = {
  id: string; name: string; url: string; needs: LocalNeed[]; fit: string;
  summary: string; evidence: string; question: string; scope: string; price: string;
  serviceNote?: string;
  sources: { label: string; url: string }[]; checked: string; owned?: boolean; disclosure?: string;
};

// Alphabetical editorial comparison, including the visibly labelled author's practice.
export const localSeoProviders: LocalSeoProvider[] = [
  {
    id: "bird", name: "Bird Marketing", url: "https://bird.co.uk/", needs: ["single", "service-area", "integrated"],
    fit: "Local website improvements alongside Business Profile work",
    summary: "Bird's UK local SEO service covers website and profile audits, citations, reviews and location pages. Consider it when the website and local presence both need practical attention.",
    evidence: "Its Skylar Solar project is labelled local SEO, but the case narrative mainly describes website redesign and brand presentation. Ask for separate evidence of map visibility and qualified enquiries.",
    question: "Which website and profile changes will you implement, and how will you measure their contribution to leads?",
    scope: "Confirm website implementation and ongoing profile management within the fee.",
    price: "Quote required. No fixed local SEO rate was published on the reviewed service page.",
    serviceNote: "Bird says its local SEO KPIs include organic traffic, local rankings, reviews and conversion rates. Ask for location and date-range detail so those measures can be compared with qualified enquiries.",
    sources: [{ label: "Bird UK local SEO services", url: "https://bird.co.uk/seo/local/" }, { label: "Skylar Solar project", url: "https://bird.co.uk/case-studies/skylar-solar/" }], checked: "2026-10-03",
  },
  {
    id: "click-intelligence", name: "Click Intelligence", url: "https://www.clickintelligence.co.uk/", needs: ["single", "service-area"],
    fit: "A defined local package with clearly scoped deliverables",
    summary: "Click Intelligence publishes local SEO packages covering website audits, landing-page work, citations and links. Package contents differ, so compare the specific work rather than the package name.",
    evidence: "Its local legal-client case describes Cheltenham search terms, on-page changes and links. The client is unnamed. The case's historic monthly fee and estimated PPC value are not current pricing or realised revenue.",
    question: "Does the package include ongoing Google Business Profile management and the pages our business needs?",
    scope: "Confirm billing frequency, keyword and area coverage, GBP work and setup costs.",
    price: "The four listed tiers start at £200, £400, £600 and £800; each lists a one-off £200 setup fee. The £200 tier includes three local keywords and 30-day delivery. The page describes a monthly SEO campaign workflow, but the package cards do not state whether the listed fees recur monthly. It says reporting starts after the first month of work is completed. Confirm billing frequency, VAT and scope for the package being quoted.",
    serviceNote: "Click Intelligence describes a team campaign workflow and a digital reporting dashboard; it says reporting starts after the first month's work is completed. Ask which actions the team will implement and when the first report is due.",
    sources: [{ label: "Local SEO packages and pricing", url: "https://www.clickintelligence.co.uk/seo/local-seo/" }, { label: "Local legal-client case study", url: "https://www.clickintelligence.co.uk/case-studies/local-legal-client-case-study/" }], checked: "2026-10-03",
  },
  {
    id: "clickslice", name: "ClickSlice", url: "https://www.clickslice.co.uk/", needs: ["single", "service-area", "integrated"],
    fit: "Local search campaigns that may also involve paid search",
    summary: "ClickSlice's local service covers keyword and competitor research, Maps and listing checks, on-page work and local citations. Its wider site emphasises ecommerce, so confirm that it currently accepts your type of local brief.",
    evidence: "The FS Drainage case concerns paid-search restructuring and landing pages. It is relevant to a local service business, but its conversion figure should not be read as an isolated local SEO result.",
    question: "What written conditions govern keyword choice, locations, result type, exclusions and the ranking offer?",
    scope: "Separate organic SEO, Maps work, paid media fees and any ranking-offer conditions.",
    price: "Quote required. The published ranking offer is a contractual claim to examine, not proof that the agency controls Google's results.",
    sources: [{ label: "Local SEO service and offer terms", url: "https://www.clickslice.co.uk/local-seo-services-london/" }, { label: "FS Drainage paid-search case", url: "https://www.clickslice.co.uk/case-studies/fs-drainage/" }], checked: "2026-10-03",
  },
  {
    id: "hallam", name: "Hallam", url: "https://hallam.agency/", needs: ["multi", "integrated"],
    fit: "Several locations needing coordinated local search delivery",
    summary: "Hallam describes large-scale local SEO with Google Business Profile, Bing Places, citation management, reviews and local landing pages. Its offer includes technology choices and reporting across locations.",
    evidence: "The local service page documents the delivery scope. The linked general ecommerce work does not independently establish Maps results for a branch network. Request a comparable multi-location case.",
    question: "Can you show how branch-level reporting changes the work assigned to each location?",
    scope: "Agree profile permissions, local staff input, platform costs and reporting per branch.",
    price: "Quote required. No fixed local SEO rate was published on the reviewed service page.",
    sources: [{ label: "Hallam local SEO service", url: "https://hallam.agency/seo/local-seo/" }], checked: "2026-10-03",
  },
  {
    id: "ignite", name: "Ignite SEO", url: "https://www.igniteseo.co.uk/", needs: ["single", "service-area", "multi"],
    fit: "Local businesses needing profile and citation cleanup",
    summary: "Ignite SEO's local service covers Business Profile setup and optimisation, citation audits, locally focused content and monthly reporting. Consider it when inaccurate business information or weak local pages need work.",
    evidence: "Its Shortland Horne estate-agent case describes Coventry search terms, technical fixes, office citations and Leamington Spa expansion. The engagement began in 2016; it is historical evidence, not a recent result audit.",
    question: "Which citation and website problems would you fix first for our premises or service area?",
    scope: "Distinguish a diagnostic audit from implementation and ongoing local SEO.",
    price: "Ongoing work requires a quote. The local service page advertises a £450 SEO Health Audit and says the spend is returned if you continue with Ignite. This is an audit offer, not a monthly local SEO fee; confirm its conditions and VAT.",
    serviceNote: "Ignite SEO's local service page describes monthly reports and quarterly reviews. Ask which local outcomes each report covers and what implementation follows the audit.",
    sources: [{ label: "Ignite local SEO service and audit offer", url: "https://www.igniteseo.co.uk/local-seo-london/" }, { label: "Shortland Horne estate-agent case", url: "https://www.igniteseo.co.uk/seo-case-studies/estate-agents-seo-case-study/" }], checked: "2026-10-03",
  },
  {
    id: "impression", name: "Impression", url: "https://www.impressiondigital.com/", needs: ["multi", "integrated"],
    fit: "Location pages, profile work and coordinated measurement",
    summary: "Impression offers Business Profile optimisation, local citations and PR, location-based rank tracking and testing across groups of location pages. It suits a conversation about coordinated work across several markets or branches.",
    evidence: "Its Skills Training Group case describes Glasgow and Edinburgh landing pages and location-level reporting. The published comparison follows a new website and covers 2020-21 versus 2019-20, rather than current GBP-only performance.",
    question: "Which locations need different interventions, and who implements the website changes?",
    scope: "Confirm implementation capacity and whether your site has enough locations for meaningful tests.",
    price: "Quote required. No fixed local SEO rate was published on the reviewed service page.",
    sources: [{ label: "Impression local SEO services", url: "https://www.impressiondigital.com/seo/local-seo/" }, { label: "Skills Training Group case", url: "https://www.impressiondigital.com/our-work/skills-training-group/" }], checked: "2026-10-03",
  },
  {
    id: "localiq", name: "LOCALiQ", url: "https://localiq.co.uk/", needs: ["single", "multi", "integrated"],
    fit: "Local SEO within a wider marketing programme",
    summary: "LOCALiQ offers service and location-page optimisation, Business Profile management, review support and local reporting. Consider it when local SEO needs to coordinate with advertising or the launch of new premises.",
    evidence: "Its Cut & Craft restaurant case covers expansion across York, Leeds and Manchester using SEO and PPC. Read the channel-specific work rather than attributing the combined campaign to organic search alone.",
    question: "How will reports distinguish organic enquiries from paid campaigns and new-opening effects?",
    scope: "Separate SEO delivery, advertising spend, campaign management and location coverage.",
    price: "Quote required. Its local service page says price depends on scope and complexity.",
    serviceNote: "LOCALiQ says its specialists implement work across websites, content, Google Business Profiles and the wider local presence. Its local page describes real-time, tailored reporting on local rank, organic traffic and enquiries, with regular account reviews.",
    sources: [{ label: "LOCALiQ local SEO services", url: "https://localiq.co.uk/digital-marketing-services/seo/local-seo" }, { label: "Cut & Craft SEO and PPC case", url: "https://localiq.co.uk/success-stories/cut-and-craft" }], checked: "2026-10-03",
  },
  {
    id: "sunny-patel", name: "Sunny Patel", url: "https://sunnypatel.co.uk/", needs: ["single", "service-area", "consultant"], owned: true,
    fit: "Direct local SEO support for an SME or service business",
    summary: "I'm an independent SEO consultant based in Reading. My local service covers Google Business Profile, citations, location pages, reviews and local links. You can discuss a focused setup project or ongoing work directly with me.",
    evidence: "My Aatma Aesthetics case describes a clinic website and local search project. It is my published account of the work, not an independent audit of Maps performance. Ask for evidence relevant to your services and area.",
    question: "What would you implement first for our business, and what work will you need from our team?",
    scope: "Confirm my delivery capacity, website implementation and the locations covered.",
    price: "My published local SEO service starts at £600 per month; one-off setup projects start at £800. My local service page states a monthly rolling engagement with no minimum term and cancellation on 30 days' notice. Confirm the agreed scope, additional work and VAT treatment in writing.",
    serviceNote: "Sunny Patel's published local SEO page lists Google Business Profile posts, quarterly citation audit and clean-up, review monitoring and response strategy, 2 to 3 local links per month, and performance-based location-page updates. Monthly reports are described as covering traffic, rankings and milestone progress.",
    disclosure: "This is my consultancy and I wrote this guide. My inclusion is a commercial interest, not an independent recommendation.",
    sources: [{ label: "My local SEO service and starting prices", url: "https://sunnypatel.co.uk/services/local-seo/" }, { label: "Aatma Aesthetics project", url: "https://sunnypatel.co.uk/portfolio/aatma-aesthetics-website-design-development-seo/" }], checked: "2026-10-03",
  },
  {
    id: "seo-works", name: "The SEO Works", url: "https://www.seoworks.co.uk/", needs: ["single", "service-area", "multi"],
    fit: "A managed local programme covering profiles and website pages",
    summary: "The SEO Works lists Business Profile optimisation, citations, local on-page content, location pages and conversion reporting. It also describes support for businesses with multiple branches.",
    evidence: "Its local service page includes a Wet n Warm Plumbers example. The reported profile interactions are relevant evidence to inspect, but they are not independently verified completed jobs or revenue.",
    question: "How will you distinguish clicks on the call button from genuine new-business enquiries?",
    scope: "Agree conversion definitions and ownership of tracking numbers, accounts and reporting.",
    price: "Quote required. No fixed local SEO rate was published on the reviewed service page.",
    serviceNote: "The SEO Works says clients receive a tailored monthly report covering keyword movements, LLM visibility, conversions and site traffic, with an account manager sharing progress and deliverables. Its Wet n Warm case reports profile interactions, which do not by themselves establish qualified enquiries or completed jobs.",
    sources: [{ label: "Local SEO service and plumbing case", url: "https://www.seoworks.co.uk/local-seo/" }], checked: "2026-10-03",
  },
  {
    id: "tom-riley", name: "Tom Riley", url: "https://tom-riley.co.uk/", needs: ["single", "service-area", "consultant"],
    fit: "Direct consultant support for trades and local services",
    summary: "Tom Riley's local service describes Business Profile work, reviews, citations and location pages for trades and service businesses. His separate AI-search offer can be discussed alongside the core Google search work.",
    evidence: "He describes operating his own trade websites and offers results demonstrations on request. Ask to inspect named projects, dates and enquiry data; the public claims are not an independent result audit.",
    question: "Which comparable local business can you show, and what changed in its qualified enquiries?",
    scope: "Confirm GBP maintenance, website implementation and capacity for your service area.",
    price: "Quote required. No fixed local SEO fee was published on the reviewed service page.",
    disclosure: "Tom has also included me in his GEO and AI SEO consultant roundups. That connection is disclosed so you can weigh this inclusion.",
    sources: [{ label: "Tom Riley local SEO service", url: "https://tom-riley.co.uk/services/seo-consultant-local-services/" }, { label: "Local AI-search service", url: "https://tom-riley.co.uk/services/ai-seo-consultant-local-services/" }], checked: "2026-10-03",
  },
];

export const localProposalCriteria = [
  { name: "Relevant local evidence", weight: 30, prompt: "Comparable business model, area, baseline and qualified enquiry results." },
  { name: "Implementation plan", weight: 25, prompt: "Specific profile and website changes, named owners and delivery capacity." },
  { name: "Lead measurement", weight: 20, prompt: "Clear metric definitions and reporting of qualified enquiries by location." },
  { name: "Profile and account care", weight: 15, prompt: "Eligible locations, honest reviews, business ownership and appropriate access." },
  { name: "Commercial clarity", weight: 10, prompt: "Full cost, locations, exclusions, notice period and handover in writing." },
] as const;
