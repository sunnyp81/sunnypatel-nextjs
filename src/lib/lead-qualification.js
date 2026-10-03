/** @typedef {"ongoing_implementation" | "ongoing_advice" | "one_off_audit" | "single_session" | "quarterly_strategy_review" | "not_sure"} SupportType */

export const SUPPORT_TYPE_LABELS = Object.freeze({
  ongoing_implementation: "Ongoing implementation (from £1,500/month)",
  ongoing_advice: "Ongoing advice (£600/month for four hours)",
  one_off_audit: "One-off audit",
  single_session: "Single consulting session (£200)",
  quarterly_strategy_review: "Quarterly strategy review (£500)",
  not_sure: "Not sure yet",
});

export const SUPPORT_OFFER_COPY = Object.freeze({
  ongoing_implementation: {
    offerId: "ongoing_implementation",
    offerLabel: "Ongoing SEO implementation (from £1,500/month)",
    eyebrow: "Ongoing implementation",
    heading: "Discuss ongoing search implementation",
    intro: "From £1,500/month. Before a retainer starts, we’ll agree the tasks, allowance, owners, costs and approvals. Share your website and priorities; I’ll reply within one working day.",
    submitLabel: "Send implementation enquiry",
  },
  ongoing_advice: {
    offerId: "ongoing_advice",
    offerLabel: "Ongoing SEO advice (£600/month for four hours)",
    eyebrow: "Ongoing advice",
    heading: "Discuss ongoing SEO advice",
    intro: "£600/month for four hours. Before a retainer starts, we’ll agree the tasks, allowance, owners, costs and approvals. Share your priorities; I’ll reply within one working day.",
    submitLabel: "Send advisory enquiry",
  },
  one_off_audit: {
    offerId: "paid_seo_audit_495",
    offerLabel: "Paid SEO Audit (£495)",
    eyebrow: "One-off audit",
    heading: "Discuss the £495 SEO audit",
    intro: "The £495 audit covers technical SEO, content and AI-search visibility, with a written report, prioritised spreadsheet and 45-minute walkthrough, delivered in five working days. For sites over 500 indexed pages or complex enterprise architectures, contact me to discuss scope before booking.",
    submitLabel: "Send SEO audit enquiry",
  },
  single_session: {
    offerId: "seo_consulting_session_200",
    offerLabel: "Single SEO consulting session (£200)",
    eyebrow: "Single consulting session",
    heading: "Discuss a single SEO consulting session",
    intro: "A single 90-minute session costs £200. Tell me the question or issue you want to work through; I’ll reply within one working day.",
    submitLabel: "Send session enquiry",
  },
  quarterly_strategy_review: {
    offerId: "quarterly_strategy_review_500",
    offerLabel: "Quarterly strategy review (£500)",
    eyebrow: "Quarterly strategy review",
    heading: "Discuss a quarterly strategy review",
    intro: "The quarterly strategy review is £500. Share the priorities you would like to review, and I’ll confirm what is included before anything is booked.",
    submitLabel: "Send review enquiry",
  },
  not_sure: {
    offerId: "free_20_minute_seo_diagnosis",
    offerLabel: "Free 20-minute SEO diagnosis",
    eyebrow: "Free SEO Diagnosis",
    heading: "Start with the biggest search problem",
    intro: "Request a free 20-minute diagnosis and I’ll help identify the most useful next step. For a full documented review, choose the £495 SEO audit.",
    submitLabel: "Request My Free Diagnosis",
  },
});

/** @param {unknown} supportType */
export function getSupportOfferCopy(supportType) {
  return typeof supportType === "string" && Object.hasOwn(SUPPORT_OFFER_COPY, supportType)
    ? SUPPORT_OFFER_COPY[/** @type {keyof typeof SUPPORT_OFFER_COPY} */ (supportType)]
    : null;
}

const BUDGET_VALUES = new Set(["under_600", "600_1499", "1500_plus", "not_sure"]);
const TIMING_VALUES = new Set(["now", "within_3_months", "later", "not_sure"]);
const MAX_WEBSITE_LENGTH = 2048;

/**
 * @param {unknown} input
 * @returns {{ ok: true, value: { website: string, websiteOmitted: boolean, supportType: string, budget: string, timing: string } } | { ok: false, error: string }}
 */
export function parseLeadQualification(input) {
  const fields = input && typeof input === "object" ? /** @type {Record<string, unknown>} */ (input) : {};
  for (const [key, max] of [["supportType", 40], ["budget", 24], ["timing", 24]]) {
    const value = fields[key];
    if (value !== undefined && value !== null && typeof value !== "string") {
      return { ok: false, error: "Please check the optional enquiry details and try again." };
    }
    if (typeof value === "string" && value.length > max) {
      return { ok: false, error: "Please check the optional enquiry details and try again." };
    }
  }
  const supportType = boundedText(fields.supportType, 40);
  const websiteValue = fields.website;
  const websiteTooLong = typeof websiteValue === "string" && websiteValue.length > MAX_WEBSITE_LENGTH;
  const websiteInput = typeof websiteValue === "string" && !websiteTooLong
    ? boundedText(websiteValue, MAX_WEBSITE_LENGTH)
    : "";
  const budget = boundedText(fields.budget, 24);
  const timing = boundedText(fields.timing, 24);
  let website = "";
  let websiteOmitted = websiteTooLong || (websiteValue !== undefined && websiteValue !== null && typeof websiteValue !== "string");

  if (supportType && !Object.hasOwn(SUPPORT_TYPE_LABELS, supportType)) {
    return { ok: false, error: "Please choose a valid type of support." };
  }
  if (websiteInput) {
    try {
      if (/[\u0000-\u0020\u007f\\]/.test(websiteInput) || websiteInput.startsWith("//")) {
        throw new Error("Malformed website address");
      }
      const candidate = websiteInput.includes("://")
        ? websiteInput
        : `https://${websiteInput}`;
      if (websiteInput.includes("://") && !/^https?:\/\//i.test(websiteInput)) {
        throw new Error("Unsupported website protocol");
      }
      const parsed = new URL(candidate);
      if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password) {
        throw new Error("Unsafe website address");
      }
      if (!isValidWebsiteHostname(parsed.hostname)) {
        throw new Error("Unrecognised website hostname");
      }
      // Keep only the site origin. Paths, query strings and fragments are unnecessary
      // for qualification and may contain private tracking data.
      website = parsed.origin;
    } catch {
      websiteOmitted = true;
    }
  }
  if (budget && !BUDGET_VALUES.has(budget)) {
    return { ok: false, error: "Please choose a valid monthly budget range." };
  }
  if (timing && !TIMING_VALUES.has(timing)) {
    return { ok: false, error: "Please choose a valid timing option." };
  }

  return {
    ok: true,
    value: {
      website,
      websiteOmitted,
      supportType,
      budget,
      timing,
    },
  };
}

function isValidWebsiteHostname(hostname) {
  const value = hostname.toLowerCase();
  if (value.startsWith("[") && value.endsWith("]")) return true; // URL parser validates IPv6 literals.
  const labels = value.split(".");
  if (labels.length === 4 && labels.every((label) => /^\d{1,3}$/.test(label) && Number(label) <= 255)) {
    return true;
  }
  return value.length <= 253
    && labels.length >= 2
    && labels.at(-1).length >= 2
    && labels.every((label) => label.length <= 63 && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label));
}

/** @param {unknown} value @param {number} max */
function boundedText(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** @param {{ website: string, websiteOmitted?: boolean, supportType: string, budget: string, timing: string }} qualification */
export function formatQualificationDetails(qualification) {
  const budgetLabels = {
    under_600: "Below £600/month",
    "600_1499": "£600 to £1,499/month",
    "1500_plus": "£1,500/month or more",
    not_sure: "Not sure",
  };
  const timingLabels = {
    now: "Ready to start now",
    within_3_months: "Within three months",
    later: "Exploring for later",
    not_sure: "Not sure",
  };
  const support = qualification.supportType
    ? SUPPORT_TYPE_LABELS[/** @type {SupportType} */ (qualification.supportType)]
    : "Not selected";
  return [
    `Selected support: ${support}`,
    qualification.websiteOmitted
      ? "Website omitted because format not recognised"
      : `Website: ${qualification.website || "Not provided"}`,
    `Monthly budget: ${budgetLabels[/** @type {keyof typeof budgetLabels} */ (qualification.budget)] || "Not provided"}`,
    `Timing: ${timingLabels[/** @type {keyof typeof timingLabels} */ (qualification.timing)] || "Not provided"}`,
  ];
}

/** Analytics gets only the allowlisted support category; empty/unknown values add nothing. */
export function qualificationAnalyticsParams(supportType) {
  return typeof supportType === "string" && Object.hasOwn(SUPPORT_TYPE_LABELS, supportType)
    ? { support_type: supportType }
    : {};
}
