// Content for the per-schema-type landing pages at /tools/schema-generator/[type]/.
// Each entry targets one of the schema-generator queries with its own title, intro,
// and FAQ, and preselects the shared SchemaGenerator component to that type.

export type SchemaTypeKey =
  | 'FAQ' | 'Article' | 'LocalBusiness' | 'Product' | 'BreadcrumbList' | 'HowTo'
  | 'Organization' | 'Person' | 'Service' | 'WebSite' | 'JobPosting' | 'Event'
  | 'VideoObject' | 'Review' | 'ItemList' | 'SoftwareApplication';

export interface SchemaTypeEntry {
  slug: string;
  schemaType: SchemaTypeKey;
  label: string; // short display label, e.g. "FAQ"
  title: string; // meta title (no site name, template appends it)
  metaDescription: string;
  h1: string;
  intro: string[]; // paragraphs, 120-200 words total
  faqs: { q: string; a: string }[];
}

export const SCHEMA_TYPE_ENTRIES: SchemaTypeEntry[] = [
  {
    slug: 'faq',
    schemaType: 'FAQ',
    label: 'FAQ',
    title: 'Free FAQ Schema Generator (JSON-LD and Microdata)',
    metaDescription:
      "Generate valid FAQPage JSON-LD or Microdata from question and answer pairs. Google removed the FAQ rich result from Search in May 2026, and this page explains what that means for your markup.",
    h1: 'FAQ Schema Generator',
    intro: [
      "FAQPage schema marks up a list of questions and their answers using the mainEntity, Question, and acceptedAnswer properties from schema.org. Fill in your Q&A pairs below and this tool builds a valid JSON-LD block, or a Microdata version if you prefer itemprop attributes in your HTML.",
      "Google removed the FAQ rich result from Search results on 7 May 2026, after restricting it to government and health sites back in 2023. Adding FAQPage markup will not add an expandable snippet under your listing any more, and there is no current Google feature it enables. It is still valid, widely understood structured data, so it can help AI assistants and other search engines that read schema.org markup extract your Q&A content directly, and it keeps your on-page questions and answers explicitly structured for anyone parsing the page.",
    ],
    faqs: [
      {
        q: 'Do FAQ rich results still appear in Google Search?',
        a: "No. Google's Search Central changelog confirms the FAQ rich result feature was removed from Search results on 7 May 2026, following a deprecation notice published a few days earlier. FAQPage markup no longer changes how your listing looks in Google.",
      },
      {
        q: 'Should I still add FAQPage schema to my pages?',
        a: 'It is optional now that Google does not use it for a rich result. Some sites keep it because it is a clean, structured way to mark up genuine Q&A content for AI assistants and other search engines, but do not add it expecting a snippet in Google.',
      },
      {
        q: 'What is the difference between the JSON-LD and Microdata output?',
        a: 'Both describe the same FAQPage data. JSON-LD sits in one script tag and is easier to maintain. Microdata uses itemscope, itemtype, and itemprop attributes woven through your visible HTML. Use the toggle above the code block to switch between them.',
      },
      {
        q: 'Where do I paste the code once it is generated?',
        a: "Anywhere in the page's HTML, head or body. Read how to add schema markup to your website for the exact steps on WordPress, Shopify, Wix, and custom sites.",
      },
    ],
  },
  {
    slug: 'article',
    schemaType: 'Article',
    label: 'Article',
    title: 'Free Article Schema Generator (JSON-LD and Microdata)',
    metaDescription:
      'Generate valid Article JSON-LD or Microdata with headline, author, publisher, and dates. Free tool with a one-click check in Google\'s Rich Results Test.',
    h1: 'Article Schema Generator',
    intro: [
      "Article schema describes a blog post or news piece with a headline, author, publisher, and the dates it was published and last updated. Google's own documentation says there are no strictly required properties, but recommends adding as many as apply so it can surface accurate title text, images, and date information for the article in Search, Google News, and the Google Assistant.",
      "Fill in the fields below and this tool builds a complete Article block, including nested Person and Organization objects for the author and publisher. Authorship and freshness are two signals Google reads when deciding how to present blog posts and news content, and clear, consistent Article markup across your site supports the E-E-A-T signals search engines use to assess content quality. Choose JSON-LD or Microdata output with the toggle above the code block.",
    ],
    faqs: [
      {
        q: 'What does Article schema actually control?',
        a: "It gives Google explicit title, author, publisher, image, and date data for the piece, rather than leaving it to guess from the page's HTML. Google uses this for how the article is presented across Search, News, and the Assistant.",
      },
      {
        q: 'Do I need both datePublished and dateModified?',
        a: "datePublished is the more important of the two. Add dateModified whenever you genuinely update the content, since an inaccurate or artificially bumped date can work against you rather than for you.",
      },
      {
        q: 'Does Article schema help with Google Discover?',
        a: "Article markup is one of several signals search engines use to understand and present editorial content, including on Discover, but no schema type guarantees inclusion there. Content quality and topical relevance do the actual work.",
      },
      {
        q: 'Can I use Article schema alongside FAQPage or BreadcrumbList on the same page?',
        a: 'Yes. A single page can carry multiple JSON-LD blocks. Generate each type separately in this tool and add every script tag to the page.',
      },
    ],
  },
  {
    slug: 'local-business',
    schemaType: 'LocalBusiness',
    label: 'LocalBusiness',
    title: 'Free LocalBusiness Schema Generator (JSON-LD and Microdata)',
    metaDescription:
      'Generate valid LocalBusiness JSON-LD or Microdata with address, opening hours, geo coordinates, and 29 business types. Free, no signup.',
    h1: 'LocalBusiness Schema Generator',
    intro: [
      'LocalBusiness schema states your business name, type, address, phone number, opening hours, and geographic coordinates in a machine-readable format. Google lists a local business feature that can show hours, ratings, directions, and booking options, but for most businesses the local pack and Maps listing are driven primarily by your Google Business Profile, not by page markup.',
      'What LocalBusiness schema does reliably is corroborate the details in your Google Business Profile with an independent, structured statement on your own site, using one of 29 specific business types from Plumber to Dentist rather than the generic LocalBusiness type alone. Fill in the fields below, including opening hours and price range, and generate either JSON-LD or Microdata output. Keep the name, address, and phone number here identical to your Google Business Profile listing.',
    ],
    faqs: [
      {
        q: 'Will adding this schema get me into the Google local pack?',
        a: 'No single piece of markup does that. The local pack is driven mainly by your Google Business Profile, proximity, relevance, and reviews. LocalBusiness schema on your site supports and corroborates those signals rather than replacing them.',
      },
      {
        q: 'Which business type should I pick?',
        a: 'Choose the most specific type that fits, such as Dentist or Plumber, rather than the generic LocalBusiness type. A specific type gives search engines a clearer statement of what the business does.',
      },
      {
        q: 'Do I need latitude and longitude?',
        a: "They are optional but useful if your address alone does not pinpoint your location precisely, for example in a large retail park. Leave them blank if you are not sure of the exact coordinates.",
      },
      {
        q: 'Does the address here need to match my Google Business Profile exactly?',
        a: "Yes. Inconsistent name, address, and phone details between your site and your Google Business Profile are a known source of local ranking confusion, so keep them aligned.",
      },
    ],
  },
  {
    slug: 'product',
    schemaType: 'Product',
    label: 'Product',
    title: 'Free Product Schema Generator (JSON-LD and Microdata)',
    metaDescription:
      'Generate valid Product JSON-LD or Microdata with price, availability, brand, and rating. Free tool for ecommerce and affiliate pages.',
    h1: 'Product Schema Generator',
    intro: [
      'Product schema describes an item for sale, its price, currency, availability, brand, and SKU, plus an optional aggregate rating built from a real ratingValue and reviewCount. Google lists a dedicated Product rich result that can show price, availability, and review ratings directly in search, which is one of the clearer commercial wins available from structured data.',
      'The offers block below is required, since price and availability are what Google reads to decide whether your listing qualifies. Star ratings only appear when the aggregateRating figures are genuine, drawn from actual reviews rather than invented numbers, since fabricated ratings breach both schema.org guidance and Google\'s structured data policies. Fill in the fields and switch between JSON-LD and Microdata output with the toggle above the code block.',
    ],
    faqs: [
      {
        q: 'Is the offers block required?',
        a: 'Yes. Price, currency, and availability inside the offers object are what make a Product listing eligible for the price and stock rich result. Leave any of them out and the code will still be valid schema, but incomplete for that feature.',
      },
      {
        q: 'Can I add a rating without real reviews?',
        a: 'No. Fabricated ratings and review counts break schema.org guidance and Google\'s structured data policies, and can lead to a manual action. Only add ratingValue and reviewCount when they reflect genuine reviews.',
      },
      {
        q: 'What availability values does Google accept?',
        a: 'InStock, OutOfStock, and PreOrder are the common ones and are included in the dropdown above. Keep this in sync with what is actually true on the page, since Google can penalise mismatched availability.',
      },
      {
        q: 'Does this work for affiliate or comparison pages?',
        a: 'Yes, Product schema is commonly used on affiliate and comparison content as well as direct ecommerce listings, as long as the price, availability, and any rating shown genuinely reflect what a visitor will find.',
      },
    ],
  },
  {
    slug: 'breadcrumb',
    schemaType: 'BreadcrumbList',
    label: 'Breadcrumb',
    title: 'Free Breadcrumb Schema Generator (JSON-LD and Microdata)',
    metaDescription:
      'Generate valid BreadcrumbList JSON-LD or Microdata from your page hierarchy. Free tool, replaces the raw URL with a readable trail in search.',
    h1: 'Breadcrumb Schema Generator',
    intro: [
      'BreadcrumbList schema states the position of a page in your site hierarchy as an ordered list of named steps, each with a name and a URL. Google\'s breadcrumb rich result is one of the more reliably active structured data features, and it typically replaces the raw URL under your search listing with a readable trail, for example Home > Services > Boiler Repair.',
      'Breadcrumb eligibility is broader than most rich results, since Google will use this markup as long as it accurately reflects the page\'s real position in your site, so it is one of the simplest wins available from structured data. Add each step below in order, starting with your homepage, and generate either the JSON-LD script tag or the Microdata equivalent.',
    ],
    faqs: [
      {
        q: 'Does the breadcrumb trail need to match my visible navigation?',
        a: "It should reflect the page's real position in your site structure. It does not have to be an exact copy of a visible breadcrumb bar on the page, but it should not contradict one if you have one.",
      },
      {
        q: 'How many steps should I include?',
        a: "At least two, typically your homepage and the current page, with any category pages in between. Keep it to the genuine hierarchy rather than padding it out.",
      },
      {
        q: 'Will this always change how my listing looks in Google?',
        a: "Not guaranteed on every result, but breadcrumb rich results have broad eligibility and are commonly shown when the markup is valid and matches the page's actual structure.",
      },
      {
        q: 'Can I generate breadcrumbs for every page on my site?',
        a: 'Yes, generate one BreadcrumbList per page, adjusting the steps to match that page\'s position, then paste each into the relevant page.',
      },
    ],
  },
  {
    slug: 'how-to',
    schemaType: 'HowTo',
    label: 'HowTo',
    title: 'Free HowTo Schema Generator (JSON-LD and Microdata)',
    metaDescription:
      'Generate valid HowTo JSON-LD or Microdata with named steps, total time, and cost. Free tool. Note: Google retired HowTo rich results in 2023.',
    h1: 'HowTo Schema Generator',
    intro: [
      "HowTo schema describes a set of instructions as named steps, each with its own text and optional image, plus an overall total time and estimated cost. Google removed the HowTo rich result from Search results in September 2023, on both desktop and mobile, so this markup no longer produces the step-by-step panel it once did.",
      "The schema itself remains valid and part of the schema.org vocabulary, and some sites still use it because it gives AI assistants and other tools reading structured data a clear, ordered breakdown of a process, separate from the prose on the page. If you are adding new instructional content today, treat HowTo schema as a structuring choice rather than a way to earn a Google rich result. Fill in your steps below and generate JSON-LD or Microdata output.",
    ],
    faqs: [
      {
        q: 'Are HowTo rich results still shown in Google Search?',
        a: "No. Google's documentation confirms the HowTo rich result was removed from Search results in September 2023, across both desktop and mobile, and the feature has not returned.",
      },
      {
        q: 'Is it still worth adding HowTo schema?',
        a: "It is optional. Since there is no Google rich result to gain, only add it if you want a machine-readable, step-by-step version of your instructions for AI assistants or other tools, separate from the visible content.",
      },
      {
        q: 'What is totalTime for?',
        a: "It states how long the whole process takes, in ISO 8601 duration format, for example PT30M for thirty minutes. It is optional and only useful if genuinely accurate.",
      },
      {
        q: 'Can I still validate HowTo markup?',
        a: 'Yes, use the Schema Markup Validator button above for a syntax check against the schema.org vocabulary. The Rich Results Test will not show a HowTo preview since Google no longer supports that feature.',
      },
    ],
  },
  {
    slug: 'organization',
    schemaType: 'Organization',
    label: 'Organization',
    title: 'Free Organization Schema Generator (JSON-LD and Microdata)',
    metaDescription:
      "Generate valid Organization JSON-LD or Microdata with logo, address, and social profiles. Free tool, helps Google choose your knowledge panel logo.",
    h1: 'Organization Schema Generator',
    intro: [
      "Organization schema identifies your business as an entity, with a name, logo, address, contact details, and sameAs links to your social profiles and other authoritative pages about you. Google's own documentation says there are no strictly required properties for Organization markup, and recommends adding as many relevant ones as you can.",
      "What this markup does is help Google choose which logo to show in your knowledge panel and other brand-related surfaces, and it helps disambiguate your organisation from others with a similar name. It is also one of the clearest ways to tell search engines and AI assistants who you are, separate from what any individual page says. Fill in the fields below, add a line per profile in the sameAs box, and generate JSON-LD or Microdata output.",
    ],
    faqs: [
      {
        q: 'What does Organization schema actually change in search results?',
        a: "It can influence which logo Google shows in a knowledge panel or brand result, and it helps disambiguate you from other organisations. It has no dedicated rich result snippet of its own.",
      },
      {
        q: 'What should I put in sameAs?',
        a: 'Add one URL per line for your official social profiles, Wikipedia or Wikidata entry if you have one, and any other authoritative page that clearly identifies your organisation. These act as corroborating links, not ranking factors.',
      },
      {
        q: 'Should every page on my site have Organization schema?',
        a: 'Typically it sits once on the homepage or is referenced across the site with an @id, rather than being repeated in full on every page. This generator produces a standalone block you can adapt either way.',
      },
      {
        q: 'How is this different from LocalBusiness schema?',
        a: 'LocalBusiness extends Organization with address, opening hours, and geo data aimed at physical or service-area businesses. Use Organization for the general entity statement, and LocalBusiness when location and hours matter.',
      },
    ],
  },
  {
    slug: 'person',
    schemaType: 'Person',
    label: 'Person',
    title: 'Free Person Schema Generator (JSON-LD and Microdata)',
    metaDescription:
      'Generate valid Person JSON-LD or Microdata for an author, founder, or team member bio. Free tool for E-E-A-T and author markup.',
    h1: 'Person Schema Generator',
    intro: [
      "Person schema describes an individual, typically an author, founder, or team member, with a name, job title, employer, photo, and sameAs links to their social and professional profiles. There is no dedicated Google rich result that Person markup alone produces, unlike Product schema, which still can be.",
      "What it does support is the entity and authorship signals search engines use when assessing E-E-A-T, experience, expertise, authoritativeness, and trustworthiness, particularly on author bio pages and byline links. It gives a clear, structured statement of who wrote something and where else they can be verified, separate from the free text of a bio. Fill in the fields below and generate either JSON-LD or Microdata output.",
    ],
    faqs: [
      {
        q: 'Does Person schema create a rich result in Google Search?',
        a: 'No, Person markup does not have a dedicated rich result feature on its own. Its value is in supporting entity and authorship signals rather than changing how a listing looks in search.',
      },
      {
        q: 'Where should I add Person schema?',
        a: "Commonly on author bio pages, about pages for founders and team members, and nested inside Article schema as the author property. It is often paired with Organization schema for the employer relationship.",
      },
      {
        q: 'What should go in sameAs for a person?',
        a: 'Their genuine LinkedIn, professional profile, or verified social accounts, one per line. These act as corroborating links that help confirm the identity of the person the markup describes.',
      },
      {
        q: 'Can I use this alongside Article schema?',
        a: 'Yes. Generate the Article schema separately and use the same name, URL, and image details for the author property there, so the two stay consistent.',
      },
    ],
  },
  {
    slug: 'service',
    schemaType: 'Service',
    label: 'Service',
    title: 'Free Service Schema Generator (JSON-LD and Microdata)',
    metaDescription:
      'Generate valid Service JSON-LD or Microdata naming what you offer, who provides it, and the area served. Free tool for service businesses.',
    h1: 'Service Schema Generator',
    intro: [
      "Service schema names a specific service you offer, such as boiler repair or SEO audits, states who provides it, and states where it is available. There is no standalone Google rich result tied to Service markup, so it will not add stars or a badge to your listing on its own.",
      "Its value is in giving search engines and AI assistants an explicit, structured statement of what a business does, which can support how your offering is summarised and matched to relevant queries, separate from the phrasing on the page itself. It is often nested inside Organization or LocalBusiness schema as part of a wider offer catalogue, or used standalone on a dedicated service page. Fill in the fields below and generate JSON-LD or Microdata output.",
    ],
    faqs: [
      {
        q: 'Does Service schema improve my rankings?',
        a: "No schema type is a direct ranking factor, Service markup included. It gives search engines an explicit statement of your offering, which supports relevance matching rather than acting as a ranking boost by itself.",
      },
      {
        q: 'Should I use Service or Product schema for what I sell?',
        a: 'Use Product for a physical or digital item with a price and availability state. Use Service for work carried out, such as a repair, consultation, or audit, where provider and area served matter more than stock status.',
      },
      {
        q: 'What goes in areaServed?',
        a: 'The city, region, or country the service covers, for example Reading, Berkshire, or United Kingdom. Keep it accurate to where you genuinely operate.',
      },
      {
        q: 'Can I list several services on one page?',
        a: "Yes, generate a separate Service block for each one and add every script tag to the page, or nest them inside an Organization's makesOffer array if you prefer a single combined block.",
      },
    ],
  },
  {
    slug: 'website',
    schemaType: 'WebSite',
    label: 'WebSite',
    title: 'Free WebSite Schema Generator (JSON-LD and Microdata)',
    metaDescription:
      'Generate valid WebSite JSON-LD or Microdata with an optional SearchAction. Free tool. Note: Google retired the sitelinks search box in 2024.',
    h1: 'WebSite Schema Generator',
    intro: [
      "WebSite schema is a top-level statement of your site's name, URL, and description, optionally paired with a SearchAction that points to your internal search results page. That SearchAction used to be what powered Google's sitelinks search box, the search field that could appear directly under a brand's listing for its own name.",
      "Google retired the sitelinks search box in November 2024, so adding a SearchAction here will not bring that box back. The WebSite type itself remains valid schema.org markup, and some sites still add it as a clear, structured statement of site identity for other search engines and AI assistants that read schema.org data, separate from any Google-specific feature. Fill in the fields below and generate JSON-LD or Microdata output.",
    ],
    faqs: [
      {
        q: 'Will adding a SearchAction bring back the sitelinks search box?',
        a: "No. Google removed the sitelinks search box feature from Search results in November 2024, and WebSite plus SearchAction markup no longer triggers it.",
      },
      {
        q: 'Is WebSite schema still worth adding?',
        a: "It is optional now that its main Google feature is gone. Some sites keep a basic WebSite block as a clear statement of site identity, name, and URL for other tools that read schema.org markup.",
      },
      {
        q: 'What goes in the search URL template?',
        a: 'Your internal search results URL with {search_term_string} in place of the query, for example https://example.com/search?q={search_term_string}. Leave it blank if you do not have on-site search.',
      },
      {
        q: 'Does every page need its own WebSite schema?',
        a: "No, WebSite schema is typically added once, often in the site's global template or homepage, rather than repeated on every page.",
      },
    ],
  },
  {
    slug: 'job-posting',
    schemaType: 'JobPosting',
    label: 'JobPosting',
    title: 'Free Job Posting Schema Generator (JSON-LD and Microdata)',
    metaDescription:
      'Generate valid JobPosting JSON-LD or Microdata with title, description, dates, and salary. Free tool for Google for Jobs eligibility.',
    h1: 'Job Posting Schema Generator',
    intro: [
      "JobPosting schema marks up a vacancy with a title, full description, the date it was posted, the hiring organisation, and where the role is based. Google for Jobs reads this structured data to surface a listing in its dedicated job search experience, which sits above regular results for many job-related queries and lets jobseekers filter by salary, location, and employment type.",
      "The required fields are title, description, datePosted, hiringOrganization, and jobLocation, or an applicant location requirement if the role is remote. Salary is optional but strengthens the listing when you are able to share it, since jobseekers can filter search results by pay. Fill in the fields below, choose on-site or remote, and generate either JSON-LD or Microdata output for your careers page or job board listing.",
    ],
    faqs: [
      {
        q: 'What properties does Google require for JobPosting?',
        a: 'Title, description, datePosted, hiringOrganization, and jobLocation are the core required properties. For a remote role, jobLocationType and an applicant location requirement replace the physical jobLocation.',
      },
      {
        q: 'Should I include salary information?',
        a: "It is optional but recommended where you are able to share it, since salary detail is one of the more useful fields to jobseekers using Google for Jobs' filters.",
      },
      {
        q: 'What happens after the role is filled?',
        a: 'Remove the listing or update validThrough so Google stops treating it as an open vacancy. Leaving expired listings live can hurt trust in your other job postings.',
      },
      {
        q: 'Does this work for remote roles?',
        a: "Yes, select Remote as the location type and the generator switches to the TELECOMMUTE jobLocationType with an applicant location requirement instead of a physical address.",
      },
    ],
  },
  {
    slug: 'event',
    schemaType: 'Event',
    label: 'Event',
    title: 'Free Event Schema Generator (JSON-LD and Microdata)',
    metaDescription:
      "Generate valid Event JSON-LD or Microdata with dates, venue, and tickets. Free tool for Google's event rich result.",
    h1: 'Event Schema Generator',
    intro: [
      "Event schema marks up something happening at a specific time and place, whether that is in person, online, or a mix of both, with an organiser and optional ticket details. Google's event rich result can show the date and location of your listing directly in search results, which is one of the more visible wins available from structured data.",
      "The required properties are name, startDate, and location, with the location expressed as a Place for in-person events or a VirtualLocation URL for online ones. Fill in the fields below, choose the attendance mode, and generate either JSON-LD or Microdata output. Keep dates accurate and up to date, since Google can flag or ignore markup for events that appear stale or incorrect.",
    ],
    faqs: [
      {
        q: 'What does Google require for an Event rich result?',
        a: 'name, startDate, and location are the required properties. For an in-person event, location needs a full address. For an online event, use a VirtualLocation with the streaming or joining URL.',
      },
      {
        q: 'How do I mark up a hybrid event?',
        a: 'Set the attendance mode to Mixed, which sets eventAttendanceMode to MixedEventAttendanceMode, and fill in both the venue address and the online URL fields.',
      },
      {
        q: 'What is eventStatus for?',
        a: 'It tells Google whether the event is still going ahead, cancelled, postponed, rescheduled, or moved online, so search results reflect changes rather than showing outdated details.',
      },
      {
        q: 'Do I need to add ticket details?',
        a: 'They are optional. Adding a price, currency, and ticket URL through the offers fields can make the listing more useful, but is not required for basic Event eligibility.',
      },
    ],
  },
  {
    slug: 'video',
    schemaType: 'VideoObject',
    label: 'Video',
    title: 'Free Video Schema Generator (JSON-LD and Microdata)',
    metaDescription:
      "Generate valid VideoObject JSON-LD or Microdata with thumbnail, upload date, and duration. Free tool for Google's video rich result.",
    h1: 'Video Schema Generator',
    intro: [
      "VideoObject schema describes a video with its name, thumbnail, upload date, and duration, plus optional links to the file or an embeddable player. Google's video rich result reads this markup to show a thumbnail, duration badge, and other details directly in search and video results, rather than relying on the page's visible text alone, and it can also help a video surface in Google's dedicated video results tab.",
      "The required properties are name, thumbnailUrl, and uploadDate, each covered below. Duration is optional but recommended, expressed in ISO 8601 format such as PT1M33S for one minute thirty-three seconds. Fill in the fields and generate JSON-LD or Microdata output, then check the code with the Rich Results Test button before publishing it to your video's landing page.",
    ],
    faqs: [
      {
        q: 'What does Google require for VideoObject markup?',
        a: 'name, thumbnailUrl, and uploadDate are the required properties. Without all three, the video is not reliably eligible for the video rich result.',
      },
      {
        q: 'Do I need both contentUrl and embedUrl?',
        a: "No, one is usually enough. contentUrl points to the raw video file, embedUrl to a player page such as a YouTube embed. Use whichever applies to how your video is hosted.",
      },
      {
        q: 'How do I format duration correctly?',
        a: 'Use ISO 8601 duration format, for example PT1M33S for one minute thirty-three seconds, or PT2H for two hours. Get this wrong and Google may ignore the field rather than reject the whole block.',
      },
      {
        q: 'Does this work for videos hosted on YouTube?',
        a: 'Yes, use the YouTube thumbnail and embed URLs in the relevant fields. YouTube also generates its own VideoObject markup automatically, so check you are not duplicating conflicting data on the same page.',
      },
    ],
  },
  {
    slug: 'review',
    schemaType: 'Review',
    label: 'Review',
    title: 'Free Review Schema Generator (JSON-LD and Microdata)',
    metaDescription:
      "Generate valid Review JSON-LD or Microdata with rating and author. Free tool. Note: Google restricts self-serving reviews.",
    h1: 'Review Schema Generator',
    intro: [
      "Review schema records a genuine rating and review of a product, business, or other item, with the reviewer's name, a rating value, and optional review text. Google's review snippet rich result can show star ratings under a listing, but with one significant restriction: for LocalBusiness or Organization markup, Google does not display review snippets where the entity being reviewed controls the reviews about itself.",
      "In practice, that means a business marking up its own self-authored rating of its own LocalBusiness or Organization listing will not get a review snippet, whether the rating sits directly in the structured data or comes through an embedded widget. Product, Book, Recipe, and similar content types do not carry that restriction. Fill in the fields below, choose what is being reviewed, and generate JSON-LD or Microdata output.",
    ],
    faqs: [
      {
        q: 'Can a business add Review schema for its own reviews?',
        a: "Not for a rich result. Google does not show review snippets for LocalBusiness or Organization markup where the business controls the reviews about itself, including its own testimonials page or an embedded reviews widget.",
      },
      {
        q: 'Does this restriction apply to Product reviews?',
        a: "No, Product, Book, Recipe, and several other content types do not carry the self-review restriction, so genuine customer reviews of a product can be marked up and shown as a rich result.",
      },
      {
        q: 'What is the difference between Review and AggregateRating?',
        a: 'A single Review covers one reviewer\'s rating and comments. AggregateRating summarises many reviews into one average score and count. This generator produces a single Review; use Product schema\'s aggregateRating fields for a summary figure.',
      },
      {
        q: 'What rating scale should I use?',
        a: 'Set bestRating to match your scale, for example 5 for a five-star system or 10 for a ten-point one, and keep ratingValue consistent with that scale.',
      },
    ],
  },
  {
    slug: 'item-list',
    schemaType: 'ItemList',
    label: 'ItemList',
    title: 'Free Item List Schema Generator (JSON-LD and Microdata)',
    metaDescription:
      "Generate valid ItemList JSON-LD or Microdata for a ranked list. Free tool. Note: Google's carousel result is limited to specific content types.",
    h1: 'Item List Schema Generator',
    intro: [
      "ItemList schema states a set of items in a specific order, each with a name, URL, and position, commonly used for listicles, rankings, and roundup content. It is a genuinely useful way to give search engines and AI assistants an explicit, ordered structure behind a list that might otherwise only exist as visible headings and paragraphs.",
      "Where it does not stretch is Google's carousel rich result, which the documentation limits to specific content types such as Recipe, Course list, Restaurant, and Movie. A general \"best plumbers in Reading\" or \"top ten tools\" list marked up as a plain ItemList is not eligible for that carousel display, even though the markup itself is entirely valid schema.org structured data. Use it for structure and machine readability, not as a guaranteed rich result. Fill in your items below and generate JSON-LD or Microdata output.",
    ],
    faqs: [
      {
        q: 'Will ItemList schema give my listicle a carousel in Google?',
        a: "Not on its own. Google's carousel rich result is restricted to specific content types, including Recipe, Course list, Restaurant, and Movie. A general ranked list of products, services, or articles marked up as ItemList does not qualify for that carousel.",
      },
      {
        q: 'Is it still worth adding ItemList schema to a listicle?',
        a: 'It can help search engines and AI assistants parse the order and structure of your list explicitly, separate from the visible headings. Treat it as a structural aid rather than a rich-result trigger.',
      },
      {
        q: 'How many items do I need?',
        a: 'At least two to form a meaningful list. Add every item in the order they appear on the page, since position matters for how the list is represented.',
      },
      {
        q: 'What if my list is actually a set of recipes or courses?',
        a: 'If the items themselves are Recipe, Course, Restaurant, or Movie content with their own dedicated schema, nest that specific markup inside the list rather than using ItemList alone, to stay eligible for the carousel feature.',
      },
    ],
  },
  {
    slug: 'software-application',
    schemaType: 'SoftwareApplication',
    label: 'SoftwareApplication',
    title: 'Free Software Application Schema Generator (JSON-LD and Microdata)',
    metaDescription:
      "Generate valid SoftwareApplication JSON-LD or Microdata with price and rating. Free tool for Google's software app rich result.",
    h1: 'Software Application Schema Generator',
    intro: [
      "SoftwareApplication schema describes an app or piece of software, its category, operating system, price, and, where genuine reviews exist, an aggregate rating. Google's software app rich result can show ratings, descriptions, and download links directly in search, but only when the markup includes a price and either an aggregateRating or a review, alongside the app's name.",
      "That rating requirement matters: fabricating a score or review count to qualify for the rich result breaches Google's structured data policies, so only add ratingValue and ratingCount when they reflect real reviews you can stand behind. Fill in the fields below, including price (use 0 for free software), and generate JSON-LD or Microdata output. This tool's own schema markup, visible on the hub page, follows the same rule and lists no fabricated rating.",
    ],
    faqs: [
      {
        q: 'What does Google require for the software app rich result?',
        a: "The name, a price inside the offers property (0 for free apps), and either an aggregateRating or at least one review. Without a rating or review, the markup is valid schema but not eligible for that specific rich result.",
      },
      {
        q: 'Can I add a rating if I do not have real reviews yet?',
        a: "No. Inventing a rating or review count to qualify for the rich result breaches Google's structured data policies and can lead to a manual action. Leave the rating fields blank until you have genuine reviews.",
      },
      {
        q: 'What goes in applicationCategory?',
        a: 'A schema.org application category such as DeveloperApplication, BusinessApplication, or GameApplication. Pick the closest match to what your software actually does.',
      },
      {
        q: 'Does this work for web apps as well as downloadable software?',
        a: 'Yes, set operatingSystem to "Web" for a browser-based tool, as this generator does for itself, rather than listing a specific desktop or mobile operating system.',
      },
    ],
  },
];

export function getEntry(slug: string): SchemaTypeEntry | undefined {
  return SCHEMA_TYPE_ENTRIES.find((e) => e.slug === slug);
}
