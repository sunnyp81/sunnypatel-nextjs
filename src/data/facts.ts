// Fact register for /facts/. Every value here is already published on the page named in `source`.
// To change a fact: edit it here, update the source page if needed, and set FACTS_LAST_CHECKED
// to the date you re-read the source. Leave a fact out when two pages disagree on it.

export const FACTS_LAST_CHECKED = "2026-10-22";

export type Fact = {
  id: string;
  label: string;
  value: string;
  /** Path on this site, or a full URL for a third-party profile. */
  source: string;
  sourceLabel: string;
};

export type FactGroup = { id: string; title: string; note?: string; facts: Fact[] };

export const FACT_GROUPS: FactGroup[] = [
  {
    id: "who",
    title: "Who and where",
    facts: [
      { id: "F01", label: "Name", value: "Sunny Patel", source: "/about/", sourceLabel: "About" },
      {
        id: "F02",
        label: "Role",
        value: "SEO consultant and AI strategist",
        source: "/about/",
        sourceLabel: "About",
      },
      {
        id: "F03",
        label: "Business name",
        value: "Sunny Patel SEO & AI Consultant",
        source: "/",
        sourceLabel: "Home",
      },
      {
        id: "F04",
        label: "Base",
        value: "Reading, Berkshire, United Kingdom",
        source: "/contact/",
        sourceLabel: "Contact",
      },
      {
        id: "F05",
        label: "Experience",
        value: "More than 15 years in SEO",
        source: "/about/",
        sourceLabel: "About",
      },
      {
        id: "F06",
        label: "Works with",
        value: "UK businesses, including local clients in Berkshire",
        source: "/services/",
        sourceLabel: "Services",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    facts: [
      {
        id: "F07",
        label: "Email",
        value: "hello@sunnypatel.co.uk",
        source: "/contact/",
        sourceLabel: "Contact",
      },
      {
        id: "F08",
        label: "Phone",
        value: "07305 523333",
        source: "/contact/",
        sourceLabel: "Contact",
      },
    ],
  },
  {
    id: "offers",
    title: "What is offered",
    note: "Only prices that every page agrees on are listed here. Other prices are on the pages linked.",
    facts: [
      {
        id: "F09",
        label: "First step",
        value: "Free 20-minute SEO diagnosis",
        source: "/contact/",
        sourceLabel: "Contact",
      },
      {
        id: "F10",
        label: "Technical SEO audit",
        value: "£495 for a standard site of up to around 500 pages; implementation is scoped separately",
        source: "/services/technical-seo-audit/",
        sourceLabel: "Technical SEO audit",
      },
      {
        id: "F11",
        label: "Other pricing",
        value: "Ranges for consulting, local SEO and monthly work",
        source: "/services/affordable-seo-consultant/",
        sourceLabel: "SEO cost guide",
      },
      {
        id: "F12",
        label: "AI search work",
        value: "AI search optimisation and visibility audits",
        source: "/ai-visibility/",
        sourceLabel: "AI visibility",
      },
    ],
  },
  {
    id: "book",
    title: "Book",
    facts: [
      {
        id: "F13",
        label: "Title",
        value: "Get Your Business Seen Online: A practical guide to websites, SEO and AI search for UK businesses",
        source: "/book/",
        sourceLabel: "Book",
      },
      { id: "F14", label: "Author", value: "Sunny Patel", source: "/book/", sourceLabel: "Book" },
      { id: "F15", label: "Format", value: "Kindle edition", source: "/book/", sourceLabel: "Book" },
      {
        id: "F16",
        label: "Where to buy",
        value: "amazon.co.uk/dp/B0HMPBBK3B",
        source: "https://www.amazon.co.uk/dp/B0HMPBBK3B",
        sourceLabel: "Amazon UK listing",
      },
      {
        id: "F17",
        label: "Sources cited",
        value: "Every source in the book, with link checks",
        source: "/book/sources/",
        sourceLabel: "Book sources",
      },
    ],
  },
  {
    id: "profiles",
    title: "Profiles that are mine",
    note: "These are the only third-party profiles linked from this site's structured data as belonging to Sunny Patel or the business.",
    facts: [
      {
        id: "F18",
        label: "LinkedIn",
        value: "linkedin.com/in/sunny-patel-co-uk",
        source: "https://www.linkedin.com/in/sunny-patel-co-uk/",
        sourceLabel: "LinkedIn profile",
      },
      {
        id: "F19",
        label: "Clutch",
        value: "clutch.co/profile/sunny-patel",
        source: "https://clutch.co/profile/sunny-patel",
        sourceLabel: "Clutch profile",
      },
      {
        id: "F20",
        label: "GitHub",
        value: "github.com/sunnyp81",
        source: "https://github.com/sunnyp81",
        sourceLabel: "GitHub profile",
      },
      {
        id: "F21",
        label: "Google Business Profile",
        value: "Reading, Berkshire listing",
        source: "https://maps.google.com/?cid=2292818604572155987",
        sourceLabel: "Google Maps listing",
      },
      {
        id: "F22",
        label: "theorg",
        value: "theorg.com/org/sunnypatel-co-uk",
        source: "https://theorg.com/org/sunnypatel-co-uk",
        sourceLabel: "theorg profile",
      },
      {
        id: "F23",
        label: "Facebook",
        value: "Business page",
        source: "https://www.facebook.com/profile.php?id=61594791483419",
        sourceLabel: "Facebook page",
      },
    ],
  },
];

export const FACT_COUNT = FACT_GROUPS.reduce((n, g) => n + g.facts.length, 0);
