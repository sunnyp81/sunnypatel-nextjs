"use client";

import { useState } from "react";
import { fetchPage } from "@/lib/fetch-page-client";

type Status = "pass" | "warn" | "fail";
type Check = {
  label: string;
  weight: number;
  status: Status;
  reason: string;
  action: string;
};

const WHY: Record<string, string> = {
  "Business details in page text": "Visitors need a clear way to identify and contact the business serving this area.",
  "Details agree with structured data": "Conflicting contact details make the page harder to interpret and trust.",
  "LocalBusiness structured data": "Accurate structured data gives machines an explicit description of the business.",
  "Town in page title": "The title helps a visitor judge whether the page covers their location.",
  "Town in main heading": "The main heading should quickly confirm the area this page serves.",
  "Town in meta description": "A location-specific description can help a reader understand the result before opening it.",
  "Map or directions": "Directions help visitors reach a business with a public location.",
  "Google listing link": "A direct link lets visitors inspect the business listing for themselves.",
  "Click-to-call link": "A telephone link makes contact easier on a mobile device.",
  "Reviews or testimonials": "Genuine customer feedback can help visitors assess the service.",
  "Service and town headings": "A specific heading confirms the service offered in the stated area.",
};
type Business = {
  name?: string;
  telephone?: string;
  address?: unknown;
  geo?: unknown;
  openingHours?: unknown;
  openingHoursSpecification?: unknown;
  sameAs?: unknown;
  "@type"?: string | string[];
};

const normal = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const digits = (value: string) => {
  const raw = value.replace(/\D/g, "");
  return raw.startsWith("44") ? `0${raw.slice(2)}` : raw;
};
const hasPhone = (text: string, phone: string) => {
  const target = digits(phone);
  return target.length >= 9 && digits(text).includes(target);
};
const includes = (text: string, phrase: string) =>
  normal(text).includes(normal(phrase));

function collectEntities(value: unknown): Business[] {
  if (Array.isArray(value)) return value.flatMap(collectEntities);
  if (!value || typeof value !== "object") return [];
  const node = value as Record<string, unknown>;
  const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
  const found = types.some(
    (type) =>
      typeof type === "string" &&
      /^(LocalBusiness|[A-Za-z]+(?:Store|Service|Contractor)|Organization)$/i.test(
        type,
      ),
  )
    ? [node as Business]
    : [];
  return [...found, ...collectEntities(node["@graph"])];
}

function inspect(
  html: string,
  input: { name: string; town: string; phone: string },
): Check[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const visible = doc.body.cloneNode(true) as HTMLElement;
  visible
    .querySelectorAll("script,style,template,noscript,svg")
    .forEach((node) => node.remove());
  const text = visible.textContent || "";
  const title = doc.title;
  const description =
    doc.querySelector('meta[name="description"]')?.getAttribute("content") ||
    "";
  const h1 = [...doc.querySelectorAll("h1")]
    .map((el) => el.textContent || "")
    .join(" ");
  const headings = [...doc.querySelectorAll("h1,h2,h3")].map(
    (el) => el.textContent || "",
  );
  const links = [...doc.querySelectorAll("a[href]")].map(
    (a) => a.getAttribute("href") || "",
  );
  const entities = [
    ...doc.querySelectorAll('script[type="application/ld+json"]'),
  ].flatMap((script) => {
    try {
      return collectEntities(JSON.parse(script.textContent || ""));
    } catch {
      return [];
    }
  });
  const local = entities.find((entity) => {
    const types = Array.isArray(entity["@type"])
      ? entity["@type"]
      : [entity["@type"]];
    return types.some(
      (type) => typeof type === "string" && type.includes("LocalBusiness"),
    );
  });
  const business =
    local || entities.find((entity) => entity["@type"] === "Organization");
  const address =
    business?.address && typeof business.address === "object"
      ? (business.address as Record<string, unknown>)
      : null;
  const visibleAddresses = [
    ...doc.querySelectorAll("address,[itemprop='address']"),
  ]
    .map((el) => el.textContent || "")
    .filter(Boolean);
  const schemaName =
    typeof business?.name === "string" && includes(business.name, input.name);
  const schemaPhone =
    typeof business?.telephone === "string" &&
    hasPhone(business.telephone, input.phone);
  const schemaTown =
    typeof address?.addressLocality === "string" &&
    includes(address.addressLocality, input.town);
  const schemaStreet =
    typeof address?.streetAddress === "string" ? address.streetAddress : "";
  const visibleAddressMatches =
    schemaStreet &&
    visibleAddresses.some((value) => includes(value, schemaStreet));
  const namePresent = includes(text, input.name);
  const phonePresent = hasPhone(text, input.phone);
  const townPresent = includes(text, input.town);
  const check = (
    label: string,
    weight: number,
    status: Status,
    reason: string,
    action: string,
  ): Check => ({ label, weight, status, reason, action });

  return [
    check(
      "Business details in page text",
      18,
      namePresent &&
        phonePresent &&
        townPresent &&
        (visibleAddresses.length > 0 || !schemaStreet)
        ? "pass"
        : namePresent && (phonePresent || townPresent)
          ? "warn"
          : "fail",
      `Name: ${namePresent ? "found" : "missing"}; phone: ${phonePresent ? "found" : "missing"}; town: ${townPresent ? "found" : "missing"}; address element: ${visibleAddresses.length ? "found" : "not found"}.`,
      "Show the genuine business name, contact number and service area clearly. Add a public address only if appropriate.",
    ),
    check(
      "Details agree with structured data",
      16,
      schemaName &&
        schemaPhone &&
        schemaTown &&
        (!schemaStreet || visibleAddressMatches)
        ? "pass"
        : business && (schemaName || schemaPhone || schemaTown)
          ? "warn"
          : "fail",
      business
        ? `Schema name: ${schemaName ? "matches" : "missing or different"}; phone: ${schemaPhone ? "matches" : "missing or different"}; town: ${schemaTown ? "matches" : "missing or different"}; street address: ${schemaStreet ? (visibleAddressMatches ? "matches visible address" : "not matched in an address element") : "not supplied"}.`
        : "No LocalBusiness or Organization entity found.",
      "Align structured data with the real details shown on the page. Check address differences manually.",
    ),
    check(
      "LocalBusiness structured data",
      12,
      local &&
        address &&
        business?.telephone &&
        business?.geo &&
        (business?.openingHours || business?.openingHoursSpecification) &&
        business?.sameAs
        ? "pass"
        : local
          ? "warn"
          : "fail",
      local
        ? `Fields: address ${address ? "yes" : "no"}, telephone ${business?.telephone ? "yes" : "no"}, geo ${business?.geo ? "yes" : "no"}, opening hours ${business?.openingHours || business?.openingHoursSpecification ? "yes" : "no"}, sameAs ${business?.sameAs ? "yes" : "no"}.`
        : "No LocalBusiness entity found.",
      "Add accurate LocalBusiness fields only where they describe the real business.",
    ),
    check(
      "Town in page title",
      8,
      includes(title, input.town) ? "pass" : "fail",
      title ? `Title: ${title}` : "No title found.",
      "Use the town in a natural, specific title if this page serves that area.",
    ),
    check(
      "Town in main heading",
      8,
      includes(h1, input.town) ? "pass" : "fail",
      h1 ? `H1: ${h1}` : "No H1 found.",
      "Name the service area in the main heading where it fits the page.",
    ),
    check(
      "Town in meta description",
      6,
      includes(description, input.town) ? "pass" : "fail",
      description
        ? `Description: ${description}`
        : "No meta description found.",
      "Write a truthful description that identifies the town.",
    ),
    check(
      "Map or directions",
      6,
      doc.querySelector(
        'iframe[src*="google.com/maps"],iframe[src*="maps.google"],iframe[src*="openstreetmap"]',
      ) ||
        links.some((href) =>
          /(?:google\.[^/]+\/maps|maps\.app\.goo\.gl|openstreetmap\.org|\/directions(?:\/|\?|$))/i.test(
            href,
          ),
        )
        ? "pass"
        : "fail",
      "Checked map embeds and directions links.",
      "Add a useful map or directions link when visitors can attend the location.",
    ),
    check(
      "Google listing link",
      6,
      links.some((href) =>
        /google\.[^/]+\/maps|maps\.app\.goo\.gl|g\.page\//i.test(href),
      )
        ? "pass"
        : "fail",
      "Checked links to Google Maps and Business Profiles.",
      "Link to your real Google listing if one is available.",
    ),
    check(
      "Click-to-call link",
      8,
      links.some(
        (href) => href.startsWith("tel:") && hasPhone(href, input.phone),
      )
        ? "pass"
        : links.some((href) => href.startsWith("tel:"))
          ? "warn"
          : "fail",
      "Checked tel: links against the entered number.",
      "Make the displayed number clickable with a matching tel: link.",
    ),
    check(
      "Reviews or testimonials",
      5,
      /\b(reviews?|testimonials?|client feedback)\b/i.test(text)
        ? "pass"
        : "fail",
      "Checked visible text for review and testimonial wording.",
      "Show genuine, attributable customer feedback when you have permission to publish it.",
    ),
    check(
      "Service and town headings",
      7,
      headings.some(
        (heading) =>
          includes(heading, input.town) &&
          /\b(seo|service|consult|repair|install|design|clean|plumb|electric|account|dent|legal|roof|build|market)\w*/i.test(
            heading,
          ),
      )
        ? "pass"
        : headings.some((heading) => includes(heading, input.town))
          ? "warn"
          : "fail",
      "Checked headings for the town alongside a service term.",
      "Describe the actual service and town together in a useful heading.",
    ),
  ];
}

export default function LocalSeoAudit() {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [town, setTown] = useState("");
  const [phone, setPhone] = useState("");
  const [checks, setChecks] = useState<Check[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function run(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setChecks([]);
    setLoading(true);
    try {
      const page = await fetchPage(url.trim());
      if (!/text\/html|application\/xhtml\+xml/i.test(page.contentType)) {
        throw new Error("The URL did not return an HTML page.");
      }
      setChecks(
        inspect(page.text, {
          name: name.trim(),
          town: town.trim(),
          phone: phone.trim(),
        }),
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not check this page.",
      );
    } finally {
      setLoading(false);
    }
  }
  const score = checks.reduce(
    (sum, item) =>
      sum +
      item.weight *
        (item.status === "pass" ? 1 : item.status === "warn" ? 0.5 : 0),
    0,
  );
  return (
    <section className="rounded-xl border border-hairline bg-wash p-5 sm:p-7">
      <form onSubmit={run} className="grid gap-4 sm:grid-cols-2">
        {[
          ["Business page URL", url, setUrl, "url"],
          ["Business name", name, setName, "text"],
          ["Town", town, setTown, "text"],
          ["Phone number", phone, setPhone, "tel"],
        ].map(([label, value, setter, type]) => (
          <label
            key={label as string}
            className="text-sm font-medium text-foreground"
          >
            {label as string}
            <input
              required
              type={type as string}
              value={value as string}
              onChange={(event) =>
                (setter as (value: string) => void)(event.target.value)
              }
              className="mt-1 block w-full min-w-0 rounded-lg border border-hairline bg-background px-3 py-2 text-foreground focus-visible:outline-2 focus-visible:outline-brand"
            />
          </label>
        ))}
        <button
          disabled={loading}
          className="rounded-lg bg-brand px-5 py-3 font-semibold text-background disabled:opacity-60 sm:col-span-2"
        >
          {loading ? "Checking page..." : "Run local audit"}
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {checks.length > 0 && (
        <div className="mt-8" aria-live="polite">
          <h2 className="text-2xl font-bold text-foreground">
            Page checklist: {score}/100
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Each check has the weight shown below. Pass earns full points,
            warning half and fail zero. This is an on-page checklist score, not
            a Google metric.
          </p>
          <div className="mt-5 space-y-3">
            {[...checks]
              .sort(
                (a, b) =>
                  (a.status === "pass" ? 1 : 0) -
                    (b.status === "pass" ? 1 : 0) || b.weight - a.weight,
              )
              .map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-hairline bg-background p-4"
                >
                  <h3 className="font-semibold text-foreground">
                    {item.label}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({item.weight} points)
                    </span>
                  </h3>
                  <p className="mt-1 text-sm font-semibold capitalize text-foreground">
                    {item.status}
                  </p>
                  <p className="mt-1 break-words text-sm text-muted-foreground">
                    {item.reason}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Why it matters: {WHY[item.label]}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    What to do: {item.action}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </section>
  );
}
