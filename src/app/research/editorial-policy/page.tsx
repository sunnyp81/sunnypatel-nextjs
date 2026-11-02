import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { breadcrumbSchema, schemaGraph } from "@/lib/schema";
import { ResearchShell, Section, NextStep, linkClass } from "@/components/research/shell";
import { RESEARCH_LAST_CHECKED, SITE_URL, formatDate } from "@/data/research-catalogue";

const PAGE_URL = `${SITE_URL}/research/editorial-policy/`;

export function generateMetadata() {
  return buildMetadata({
    title: "Editorial Policy: Who Writes, What Is Mine, How I Correct | Sunny Patel",
    description:
      "Who writes my research, what is my own data and what is third-party, how I handle paid placements, corrections, page dates and client data.",
    path: "/research/editorial-policy",
  });
}

const SCHEMA = schemaGraph(
  {
    "@type": "AboutPage",
    "@id": `${PAGE_URL}#webpage`,
    url: PAGE_URL,
    name: "Editorial policy",
    description:
      "Who writes the research on sunnypatel.co.uk, what is original data and what is third-party, how paid placements, corrections, dates and client data are handled.",
    inLanguage: "en-GB",
    dateModified: RESEARCH_LAST_CHECKED,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    author: { "@id": `${SITE_URL}/#person` },
    about: { "@id": `${SITE_URL}/#person` },
  },
  breadcrumbSchema([
    { name: "Home", url: `${SITE_URL}/` },
    { name: "Research", url: `${SITE_URL}/research/` },
    { name: "Editorial policy", url: PAGE_URL },
  ])
);

export default function EditorialPolicyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SCHEMA }} />
      <ResearchShell
        current="/research/editorial-policy/"
        crumbs={[{ label: "Research", href: "/research/" }, { label: "Editorial policy" }]}
        eyebrow="Research"
        title="Editorial policy"
        intro={
          <>
            <p>I research and write the content on this site and I am responsible for every claim on it. I fix mistakes in public.</p>
            <p className="text-base">
              Last checked <time dateTime={RESEARCH_LAST_CHECKED}>{formatDate(RESEARCH_LAST_CHECKED)}</time>.
            </p>
          </>
        }
      >
        <Section id="who" title="Who writes the research?">
          <p>I do. I pull the data, write up the findings and publish them.</p>
          <p>I use AI tools to help with data processing, research and first drafts. I check each figure against its source and edit every page myself before it goes live.</p>
          <p>
            I sell SEO services, so I gain when readers trust SEO data. Where a guide lists my own business, it says so
            next to the listing. The commercial disclosure in my{" "}
            <Link href="/blog/best-seo-companies-uk/" className={linkClass}>
              UK SEO companies guide
            </Link>{" "}
            is an example.
          </p>
        </Section>

        <Section id="mine-or-third-party" title="What is mine and what is third-party?">
          <p>
            An original study uses data I collected from my own Search Console and GA4 properties, my own Ahrefs pulls
            or my own checks of public pages. The research hub lists every one.
          </p>
          <p>
            A roundup collects figures that other organisations measured. Each figure names who measured it, when and on
            what sample. When an original study quotes someone else&apos;s benchmark, it names the source and date beside
            it. The data catalogue marks files I compiled and does not present them as my own measurements.
          </p>
          <p>
            The roundups sit in the{" "}
            <Link href="/statistics/" className={linkClass}>
              statistics library
            </Link>
            .
          </p>
        </Section>

        <Section id="payment" title="Do I take payment for a place in my guides?">
          <p>No provider has paid to be listed in a guide on this site. One listing came from a reciprocal arrangement. Tom Riley lists me in his consultant guides and I list him in mine. Each guide that includes him says so in his profile.</p>
          <p>
            If one ever did, the listing would read Paid inclusion and its links would be marked sponsored. My AI search
            agencies guide already supports that label. I would not publish a paid place without it.
          </p>
          <p>
            A guide that lists my own business is an editorial choice and not a recommendation I have been paid for. It
            is labelled as mine.
          </p>
        </Section>

        <Section id="corrections" title="How do I correct mistakes?">
          <p>I fix the page, add a dated note and leave the old figure visible beside the new one.</p>
          <p>
            If I cannot trace a figure to its source, I remove it. I do not round it or soften it. When I withdraw a
            study, I keep it online, mark it withdrawn and give the reasons.
          </p>
          <p>If you spot an error, tell me and I will check it. Past corrections are listed in the methodology.</p>
        </Section>

        <Section id="dates" title="How do I date and update pages?">
          <p>Every page carries a published date, and an updated date when I have re-checked its figures.</p>
          <p>
            An updated date moves only after the figures were re-checked at the source. A weekly script lists any
            content page whose review date is older than 25 days. Each study states its data window and the day I
            pulled the data. Data files carry the date or edition in the file name.
          </p>
          <p>
            The update tracker is a recurring study. I add a row about four weeks after Google marks an update complete,
            so the data has settled.
          </p>
        </Section>

        <Section id="client-data" title="How do I treat client data?">
          <p>
            I do not publish client data that identifies a client without permission. One study, on multimodal search,
            includes anonymised figures from client properties, described by type only.
          </p>
          <p>Client sites are not in the 100-site Search Console sample or in the GA4 frame.</p>
        </Section>

        <Section id="reuse" title="Can you reuse my data?">
          <p>
            Yes, with credit. The files use CC BY 4.0. Keep the window and sample with every figure you quote, and say
            whether the figure comes from my sites or from a source I compiled.
          </p>
          <p>
            Each file has suggested citation text in the{" "}
            <Link href="/research/data/" className={linkClass}>
              data catalogue
            </Link>
            .
          </p>
        </Section>

        <NextStep />
      </ResearchShell>
    </>
  );
}
