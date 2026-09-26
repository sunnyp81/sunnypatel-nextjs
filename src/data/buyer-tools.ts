// Shared by the homepage buyer tools section (UI) and src/lib/schema.ts (JSON-LD).
export type BuyerToolId = "quote" | "agency" | "resourcing";

export interface BuyerTool {
  id: BuyerToolId;
  label: string;
  question: string;
  description: string;
  sourceHref: string;
  sourceLabel: string;
}

export const BUYER_TOOLS: BuyerTool[] = [
  {
    id: "quote",
    label: "SEO quote checker",
    question: "Is the SEO quote I've been given fair?",
    description:
      "Enter a quoted price and it checks it against the 2026 UK price bands for retainers, day rates, hourly rates and one-off projects, then flags contract terms worth questioning.",
    sourceHref: "/services/how-much-does-seo-cost/",
    sourceLabel: "Read the full SEO pricing guide",
  },
  {
    id: "agency",
    label: "Agency red flag scorer",
    question: "Is my current SEO agency doing a good job?",
    description:
      "Tick the statements that are true of your agency's reporting and access, and it scores how serious the problem is, from monitor closely through to time to leave.",
    sourceHref: "/blog/seo-agency-lying/",
    sourceLabel: "Read how to tell if your SEO agency is lying to you",
  },
  {
    id: "resourcing",
    label: "Resourcing picker",
    question: "Should I hire in-house, use an agency, or bring in a consultant?",
    description:
      "Pick your monthly organic revenue and the SEO resource you have now, and it returns the starting recommendation from this site's in-house vs agency vs consultant framework.",
    sourceHref: "/blog/inhouse-seo-vs-agency-vs-consultant/",
    sourceLabel: "Read the full in-house vs agency vs consultant guide",
  },
];
