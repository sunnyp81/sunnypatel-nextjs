'use client';

import { useState, useCallback, useMemo, useId, isValidElement, cloneElement } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';
import { countSchemaItems, createJsonLdScript } from '@/lib/schema-generator';

// ── Types ──────────────────────────────────────────────────────────────────────

type SchemaType =
  | 'FAQ' | 'Article' | 'LocalBusiness' | 'Product' | 'BreadcrumbList' | 'HowTo'
  | 'Organization' | 'Person' | 'Service' | 'WebSite' | 'JobPosting' | 'Event'
  | 'VideoObject' | 'Review' | 'ItemList' | 'SoftwareApplication';

type OutputFormat = 'jsonld' | 'microdata';
type CopyStatus = 'idle' | 'copied' | 'error';

interface FAQPair { question: string; answer: string }

interface ArticleData {
  headline: string; authorName: string; authorUrl: string;
  publisherName: string; publisherLogoUrl: string;
  datePublished: string; dateModified: string;
  imageUrl: string; description: string;
}

interface LocalBusinessData {
  name: string; type: string;
  street: string; city: string; region: string; postalCode: string; country: string;
  phone: string; url: string;
  hours: { day: string; open: string; close: string }[];
  latitude: string; longitude: string; priceRange: string;
}

interface ProductData {
  name: string; description: string; imageUrl: string; brand: string;
  sku: string; price: string; currency: string;
  availability: string; ratingValue: string; reviewCount: string; url: string;
}

interface BreadcrumbItem { name: string; url: string }

interface HowToStep { name: string; text: string; imageUrl: string }
interface HowToData {
  title: string; description: string; totalTime: string;
  estimatedCost: string; currency: string;
  steps: HowToStep[];
}

interface OrganizationData {
  name: string; url: string; logoUrl: string; description: string;
  street: string; city: string; region: string; postalCode: string; country: string;
  phone: string; email: string; sameAs: string;
}

interface PersonData {
  name: string; jobTitle: string; url: string; imageUrl: string; email: string;
  worksForName: string; worksForUrl: string; sameAs: string;
}

interface ServiceData {
  name: string; serviceType: string; description: string;
  providerName: string; providerUrl: string; areaServed: string; url: string;
}

interface WebSiteData {
  name: string; url: string; description: string; searchUrlTemplate: string;
}

interface JobPostingData {
  title: string; description: string; datePosted: string; validThrough: string;
  employmentType: string; hiringOrgName: string; hiringOrgUrl: string; hiringOrgLogo: string;
  locationType: string; // 'onsite' | 'remote'
  street: string; city: string; region: string; postalCode: string; country: string;
  salaryMin: string; salaryMax: string; salaryCurrency: string; salaryUnit: string;
}

interface EventData {
  name: string; description: string; startDate: string; endDate: string;
  attendanceMode: string; // 'Offline' | 'Online' | 'Mixed'
  eventStatus: string; imageUrl: string;
  venueName: string; street: string; city: string; region: string; postalCode: string; country: string;
  onlineUrl: string;
  organizerName: string; organizerUrl: string;
  offerPrice: string; offerCurrency: string; offerUrl: string; offerAvailability: string;
}

interface VideoData {
  name: string; description: string; thumbnailUrl: string; uploadDate: string;
  duration: string; contentUrl: string; embedUrl: string;
}

interface ReviewData {
  itemName: string; itemType: string; authorName: string; reviewBody: string;
  ratingValue: string; bestRating: string; datePublished: string;
}

interface ItemListEntry { name: string; url: string; imageUrl: string }
interface ItemListData {
  name: string; description: string; items: ItemListEntry[];
}

interface SoftwareApplicationData {
  name: string; applicationCategory: string; operatingSystem: string; url: string;
  description: string; price: string; currency: string;
  ratingValue: string; ratingCount: string;
}

interface PreviewData {
  title: string;
  description: string;
  urlLine: string;
  favicon: string;
  usingExample: boolean;
  articleDate?: string;
  articleAuthor?: string;
  panelName?: string;
  panelAddress?: string;
  panelPhone?: string;
  panelHours?: string;
  ratingValue?: string;
  ratingCount?: string;
  ratingBest?: string;
  price?: string;
  currency?: string;
  availability?: string;
  eventDate?: string;
  eventLocation?: string;
  videoDuration?: string;
  jobSalary?: string;
  jobLocation?: string;
  reviewAuthor?: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const SCHEMA_TYPES: SchemaType[] = [
  'FAQ', 'Article', 'LocalBusiness', 'Product', 'BreadcrumbList', 'HowTo',
  'Organization', 'Person', 'Service', 'WebSite', 'JobPosting', 'Event',
  'VideoObject', 'Review', 'ItemList', 'SoftwareApplication',
];

const BUSINESS_TYPES = [
  'LocalBusiness', 'Restaurant', 'Dentist', 'Plumber', 'Electrician', 'Attorney',
  'Physician', 'RealEstateAgent', 'AccountingService', 'AutoRepair', 'Bakery',
  'BarberShop', 'BeautySalon', 'CafeOrCoffeeShop', 'DayCare', 'Florist',
  'GasStation', 'GroceryStore', 'HairSalon', 'HealthClub', 'Hotel',
  'InsuranceAgency', 'LocksmithService', 'MovingCompany', 'Notary',
  'PetStore', 'Pharmacy', 'TravelAgency', 'VeterinaryCare',
];

const CURRENCIES = ['GBP', 'USD', 'EUR', 'AUD', 'CAD', 'INR', 'JPY'];
const AVAILABILITY_OPTIONS = ['InStock', 'OutOfStock', 'PreOrder'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'TEMPORARY', 'INTERN', 'VOLUNTEER', 'PER_DIEM', 'OTHER'];
const SALARY_UNITS = ['HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR'];
const EVENT_STATUSES = [
  { value: 'EventScheduled', label: 'Scheduled' },
  { value: 'EventCancelled', label: 'Cancelled' },
  { value: 'EventPostponed', label: 'Postponed' },
  { value: 'EventRescheduled', label: 'Rescheduled' },
  { value: 'EventMovedOnline', label: 'Moved online' },
];
const REVIEW_ITEM_TYPES = ['Product', 'LocalBusiness', 'Organization', 'Book', 'Movie', 'Recipe', 'Restaurant', 'CreativeWork'];
const GOOGLE_RICH_RESULT_TYPES = new Set<SchemaType>([
  'Article', 'LocalBusiness', 'Product', 'BreadcrumbList', 'Organization', 'JobPosting', 'Event',
  'VideoObject', 'Review', 'SoftwareApplication',
]);

// ── Style constants ────────────────────────────────────────────────────────────

const inputClass =
  'w-full rounded-lg border border-hairline-strong dark:border-white/[0.08] bg-surface-1 dark:bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand/50 focus:outline-none focus:ring-1 focus:ring-brand/30';
const labelClass = 'block text-sm font-medium text-foreground mb-1.5';
const cardClass = 'rounded-xl border border-hairline bg-wash dark:bg-white/[0.02] p-6 shadow-[var(--elev)]';
const btnPrimary =
  'rounded-lg bg-[#315fbd] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(49,95,189,0.35)] transition-colors hover:bg-[#274f9f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70';
const btnSecondary =
  'rounded-lg border border-hairline-strong dark:border-white/[0.12] bg-wash dark:bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-foreground hover:bg-brand-wash dark:hover:bg-white/[0.08] transition-colors';
const dangerText = 'text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors';
const toggleActive = 'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors bg-brand/15 text-brand-ink dark:text-brand border-brand/30';
const toggleInactive = 'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors border-hairline dark:border-white/[0.08] text-muted-foreground hover:text-foreground';

// ── Helpers ────────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const id = useId();
  const control = isValidElement(children)
    ? cloneElement(children as React.ReactElement<{ id?: string }>, {
        id: (children as React.ReactElement<{ id?: string }>).props.id ?? id,
      })
    : children;
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      {control}
    </div>
  );
}

function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((v) => v.trim())
    .filter(Boolean);
}

// ── Microdata rendering ──────────────────────────────────────────────────────
// Converts the same JSON-LD object into nested itemscope/itemtype/itemprop HTML.
// Kept generic so every schema type (including nested objects and arrays) renders
// correctly without per-type special casing.

const URL_PROPS = new Set([
  'url', 'image', 'logo', 'sameAs', 'contentUrl', 'embedUrl', 'thumbnailUrl', 'target',
]);
const DATE_PROPS = new Set([
  'datePublished', 'dateModified', 'startDate', 'endDate', 'uploadDate', 'datePosted', 'validThrough',
]);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function microdataObject(obj: Record<string, unknown>, indent: string, itemprop?: string): string {
  const rawType = obj['@type'];
  const typeStr = Array.isArray(rawType) ? rawType.join(' ') : (rawType as string | undefined);
  const typeUrls = typeStr
    ? typeStr.split(' ').filter(Boolean).map((t) => `https://schema.org/${t}`).join(' ')
    : '';
  const attrs = ['itemscope', typeUrls && `itemtype="${typeUrls}"`, itemprop && `itemprop="${itemprop}"`]
    .filter(Boolean)
    .join(' ');
  const childIndent = `${indent}  `;
  const children = Object.entries(obj)
    .filter(([k]) => k !== '@context' && k !== '@type' && k !== '@id')
    .map(([k, v]) => microdataValue(k, v, childIndent))
    .filter(Boolean)
    .join('\n');
  return `${indent}<div ${attrs}>\n${children}\n${indent}</div>`;
}

function microdataValue(key: string, value: unknown, indent: string): string {
  if (value === undefined || value === null || value === '') return '';
  if (Array.isArray(value)) {
    return value.map((v) => microdataValue(key, v, indent)).filter(Boolean).join('\n');
  }
  if (typeof value === 'object') {
    return microdataObject(value as Record<string, unknown>, indent, key);
  }
  const str = String(value);
  if (URL_PROPS.has(key)) {
    return `${indent}<link itemprop="${key}" href="${escapeHtml(str)}" />`;
  }
  if (DATE_PROPS.has(key)) {
    return `${indent}<time itemprop="${key}" datetime="${escapeHtml(str)}">${escapeHtml(str)}</time>`;
  }
  return `${indent}<span itemprop="${key}">${escapeHtml(str)}</span>`;
}

function jsonLdToMicrodata(obj: Record<string, unknown>): string {
  return microdataObject(obj, '');
}

// ── Rich-result preview helpers ─────────────────────────────────────────────
// Pure formatting helpers for the "How this could appear in Google" preview.
// Google's own light-mode SERP colours are used inside the white mock card so
// it reads as a faithful, simplified preview; everything outside the white
// card uses the site's own design tokens.

function formatPreviewDate(value: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatIsoDuration(iso: string): string {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i.exec(iso.trim());
  if (!match) return iso;
  const [, h, m, s] = match;
  const parts: string[] = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (!h && !m && s) parts.push(`${s}s`);
  return parts.length > 0 ? parts.join(' ') : iso;
}

function getHostname(url: string, fallback = 'yoursite.com'): string {
  if (!url) return fallback;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return fallback;
  }
}

function StarRating({ value, best = '5' }: { value: string; best?: string }) {
  const v = Math.max(0, parseFloat(value) || 0);
  const b = parseFloat(best) || 5;
  const pct = b > 0 ? Math.min(1, v / b) * 100 : 0;
  return (
    <span className="relative inline-block text-sm leading-none tracking-[1px] text-[#dadce0]" aria-hidden="true">
      <span>★★★★★</span>
      <span className="absolute inset-0 overflow-hidden whitespace-nowrap text-[#fbbc04]" style={{ width: `${pct}%` }}>
        ★★★★★
      </span>
    </span>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function SchemaGenerator({ initialType }: { initialType?: SchemaType } = {}) {
  const [activeType, setActiveType] = useState<SchemaType>(initialType ?? 'FAQ');
  const [format, setFormat] = useState<OutputFormat>('jsonld');
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
  const [actionFeedback, setActionFeedback] = useState('');

  // FAQ
  const [faqPairs, setFaqPairs] = useState<FAQPair[]>([{ question: '', answer: '' }]);

  // Article
  const [article, setArticle] = useState<ArticleData>({
    headline: '', authorName: '', authorUrl: '', publisherName: '', publisherLogoUrl: '',
    datePublished: '', dateModified: '', imageUrl: '', description: '',
  });

  // LocalBusiness
  const [business, setBusiness] = useState<LocalBusinessData>({
    name: '', type: 'LocalBusiness', street: '', city: '', region: '', postalCode: '', country: 'GB',
    phone: '', url: '', hours: [{ day: 'Monday', open: '09:00', close: '17:00' }],
    latitude: '', longitude: '', priceRange: '',
  });

  // Product
  const [product, setProduct] = useState<ProductData>({
    name: '', description: '', imageUrl: '', brand: '', sku: '', price: '', currency: 'GBP',
    availability: 'InStock', ratingValue: '', reviewCount: '', url: '',
  });

  // BreadcrumbList
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { name: 'Home', url: 'https://example.com/' },
    { name: '', url: '' },
  ]);

  // HowTo
  const [howTo, setHowTo] = useState<HowToData>({
    title: '', description: '', totalTime: '', estimatedCost: '', currency: 'GBP',
    steps: [{ name: '', text: '', imageUrl: '' }],
  });

  // Organization
  const [organization, setOrganization] = useState<OrganizationData>({
    name: '', url: '', logoUrl: '', description: '',
    street: '', city: '', region: '', postalCode: '', country: 'GB',
    phone: '', email: '', sameAs: '',
  });

  // Person
  const [person, setPerson] = useState<PersonData>({
    name: '', jobTitle: '', url: '', imageUrl: '', email: '',
    worksForName: '', worksForUrl: '', sameAs: '',
  });

  // Service
  const [service, setService] = useState<ServiceData>({
    name: '', serviceType: '', description: '', providerName: '', providerUrl: '', areaServed: '', url: '',
  });

  // WebSite
  const [website, setWebsite] = useState<WebSiteData>({
    name: '', url: '', description: '', searchUrlTemplate: '',
  });

  // JobPosting
  const [job, setJob] = useState<JobPostingData>({
    title: '', description: '', datePosted: '', validThrough: '',
    employmentType: 'FULL_TIME', hiringOrgName: '', hiringOrgUrl: '', hiringOrgLogo: '',
    locationType: 'onsite',
    street: '', city: '', region: '', postalCode: '', country: 'GB',
    salaryMin: '', salaryMax: '', salaryCurrency: 'GBP', salaryUnit: 'YEAR',
  });

  // Event
  const [event, setEvent] = useState<EventData>({
    name: '', description: '', startDate: '', endDate: '',
    attendanceMode: 'Offline', eventStatus: 'EventScheduled', imageUrl: '',
    venueName: '', street: '', city: '', region: '', postalCode: '', country: 'GB',
    onlineUrl: '',
    organizerName: '', organizerUrl: '',
    offerPrice: '', offerCurrency: 'GBP', offerUrl: '', offerAvailability: 'InStock',
  });

  // VideoObject
  const [video, setVideo] = useState<VideoData>({
    name: '', description: '', thumbnailUrl: '', uploadDate: '',
    duration: '', contentUrl: '', embedUrl: '',
  });

  // Review
  const [review, setReview] = useState<ReviewData>({
    itemName: '', itemType: 'Product', authorName: '', reviewBody: '',
    ratingValue: '', bestRating: '5', datePublished: '',
  });

  // ItemList
  const [itemList, setItemList] = useState<ItemListData>({
    name: '', description: '',
    items: [{ name: '', url: '', imageUrl: '' }, { name: '', url: '', imageUrl: '' }],
  });

  // SoftwareApplication
  const [app, setApp] = useState<SoftwareApplicationData>({
    name: '', applicationCategory: 'DeveloperApplication', operatingSystem: 'Web', url: '',
    description: '', price: '0', currency: 'GBP', ratingValue: '', ratingCount: '',
  });

  const loadExample = useCallback(() => {
    switch (activeType) {
      case 'FAQ':
        setFaqPairs([
          { question: 'How long does delivery take?', answer: 'Standard UK delivery takes 3 to 5 working days.' },
          { question: 'Can I return my order?', answer: 'Yes. Unused items can be returned within 30 days.' },
        ]);
        break;
      case 'Article':
        setArticle({
          headline: 'A practical guide to structured data', authorName: 'Alex Morgan',
          authorUrl: 'https://example.com/authors/alex-morgan', publisherName: 'Example Studio',
          publisherLogoUrl: 'https://example.com/logo.png', datePublished: '2026-09-01',
          dateModified: '2026-09-10', imageUrl: 'https://example.com/images/structured-data-guide.jpg',
          description: 'A step-by-step introduction to adding structured data to a website.',
        });
        break;
      case 'LocalBusiness':
        setBusiness({
          name: 'Example Plumbing Ltd', type: 'Plumber', street: '10 Market Street', city: 'Reading',
          region: 'Berkshire', postalCode: 'RG1 1AA', country: 'GB', phone: '+44 118 000 0000',
          url: 'https://example.com', hours: [
            { day: 'Monday', open: '09:00', close: '17:00' },
            { day: 'Tuesday', open: '09:00', close: '17:00' },
          ], latitude: '51.4543', longitude: '-0.9781', priceRange: '££',
        });
        break;
      case 'Product':
        setProduct({
          name: 'Example Desk Lamp', description: 'An adjustable LED desk lamp.',
          imageUrl: 'https://example.com/images/desk-lamp.jpg', brand: 'Example Home', sku: 'LAMP-100',
          price: '39.00', currency: 'GBP', availability: 'InStock', ratingValue: '4.7',
          reviewCount: '86', url: 'https://example.com/products/desk-lamp',
        });
        break;
      case 'BreadcrumbList':
        setBreadcrumbs([
          { name: 'Home', url: 'https://example.com/' },
          { name: 'Guides', url: 'https://example.com/guides/' },
          { name: 'Structured data', url: 'https://example.com/guides/structured-data/' },
        ]);
        break;
      case 'HowTo':
        setHowTo({
          title: 'How to change a tap washer', description: 'Replace a worn tap washer safely.',
          totalTime: 'PT30M', estimatedCost: '8', currency: 'GBP', steps: [
            { name: 'Turn off the water', text: 'Close the isolation valve before opening the tap.', imageUrl: '' },
            { name: 'Replace the washer', text: 'Remove the old washer and fit a matching replacement.', imageUrl: '' },
          ],
        });
        break;
      case 'Organization':
        setOrganization({
          name: 'Example Studio Ltd', url: 'https://example.com', logoUrl: 'https://example.com/logo.png',
          description: 'A UK design studio.', street: '10 Market Street', city: 'Reading', region: 'Berkshire',
          postalCode: 'RG1 1AA', country: 'GB', phone: '+44 118 000 0000', email: 'hello@example.com',
          sameAs: 'https://www.linkedin.com/company/example\nhttps://www.instagram.com/example',
        });
        break;
      case 'Person':
        setPerson({
          name: 'Alex Morgan', jobTitle: 'Technical Director', url: 'https://example.com/alex-morgan',
          imageUrl: 'https://example.com/images/alex-morgan.jpg', email: 'alex@example.com',
          worksForName: 'Example Studio Ltd', worksForUrl: 'https://example.com',
          sameAs: 'https://www.linkedin.com/in/example',
        });
        break;
      case 'Service':
        setService({
          name: 'Technical SEO audit', serviceType: 'Technical SEO consulting',
          description: 'A technical review with prioritised developer-ready fixes.',
          providerName: 'Example Studio Ltd', providerUrl: 'https://example.com', areaServed: 'United Kingdom',
          url: 'https://example.com/services/technical-seo-audit',
        });
        break;
      case 'WebSite':
        setWebsite({
          name: 'Example Studio', url: 'https://example.com', description: 'Guides and services from Example Studio.',
          searchUrlTemplate: 'https://example.com/search?q={search_term_string}',
        });
        break;
      case 'JobPosting':
        setJob({
          title: 'Technical SEO consultant', description: 'Audit websites and explain practical fixes to clients.',
          datePosted: '2026-09-01', validThrough: '2026-10-01', employmentType: 'FULL_TIME',
          hiringOrgName: 'Example Studio Ltd', hiringOrgUrl: 'https://example.com',
          hiringOrgLogo: 'https://example.com/logo.png', locationType: 'onsite', street: '10 Market Street',
          city: 'Reading', region: 'Berkshire', postalCode: 'RG1 1AA', country: 'GB', salaryMin: '40000',
          salaryMax: '50000', salaryCurrency: 'GBP', salaryUnit: 'YEAR',
        });
        break;
      case 'Event':
        setEvent({
          name: 'Structured data workshop', description: 'A practical workshop for website owners.',
          startDate: '2026-10-15T10:00', endDate: '2026-10-15T13:00', attendanceMode: 'Offline',
          eventStatus: 'EventScheduled', imageUrl: 'https://example.com/images/workshop.jpg', venueName: 'Example Hall',
          street: '10 Market Street', city: 'Reading', region: 'Berkshire', postalCode: 'RG1 1AA', country: 'GB',
          onlineUrl: '', organizerName: 'Example Studio Ltd', organizerUrl: 'https://example.com',
          offerPrice: '25', offerCurrency: 'GBP', offerUrl: 'https://example.com/events/workshop',
          offerAvailability: 'InStock',
        });
        break;
      case 'VideoObject':
        setVideo({
          name: 'How to add JSON-LD', description: 'A short guide to placing JSON-LD on a web page.',
          thumbnailUrl: 'https://example.com/images/json-ld-video.jpg', uploadDate: '2026-09-01', duration: 'PT4M20S',
          contentUrl: 'https://example.com/videos/json-ld.mp4', embedUrl: 'https://example.com/embed/json-ld',
        });
        break;
      case 'Review':
        setReview({
          itemName: 'Example Desk Lamp', itemType: 'Product', authorName: 'Jordan Lee',
          reviewBody: 'The lamp is sturdy, bright and easy to adjust.', ratingValue: '4.5', bestRating: '5',
          datePublished: '2026-09-01',
        });
        break;
      case 'ItemList':
        setItemList({
          name: 'Useful structured data resources', description: 'A short ordered reading list.', items: [
            { name: 'Google Search structured data guide', url: 'https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data', imageUrl: '' },
            { name: 'Schema.org documentation', url: 'https://schema.org/docs/documents.html', imageUrl: '' },
          ],
        });
        break;
      case 'SoftwareApplication':
        setApp({
          name: 'Example Audit App', applicationCategory: 'DeveloperApplication', operatingSystem: 'Web',
          url: 'https://example.com/app', description: 'A browser-based website audit tool.', price: '0',
          currency: 'GBP', ratingValue: '4.8', ratingCount: '42',
        });
        break;
    }

    setCopyStatus('idle');
    setActionFeedback(`${activeType} example loaded. Only this type's fields were replaced.`);
  }, [activeType]);

  // ── Updaters ─────────────────────────────────────────────────────────────────

  const updateFaq = useCallback((i: number, field: keyof FAQPair, value: string) => {
    setFaqPairs(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  }, []);

  const updateArticle = useCallback((field: keyof ArticleData, value: string) => {
    setArticle(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateBusiness = useCallback((field: keyof LocalBusinessData, value: string) => {
    setBusiness(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateBusinessHour = useCallback((i: number, field: keyof LocalBusinessData['hours'][0], value: string) => {
    setBusiness(prev => ({
      ...prev,
      hours: prev.hours.map((h, idx) => idx === i ? { ...h, [field]: value } : h),
    }));
  }, []);

  const updateProduct = useCallback((field: keyof ProductData, value: string) => {
    setProduct(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateBreadcrumb = useCallback((i: number, field: keyof BreadcrumbItem, value: string) => {
    setBreadcrumbs(prev => prev.map((b, idx) => idx === i ? { ...b, [field]: value } : b));
  }, []);

  const updateHowTo = useCallback((field: keyof HowToData, value: string) => {
    setHowTo(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateHowToStep = useCallback((i: number, field: keyof HowToStep, value: string) => {
    setHowTo(prev => ({
      ...prev,
      steps: prev.steps.map((s, idx) => idx === i ? { ...s, [field]: value } : s),
    }));
  }, []);

  const updateOrganization = useCallback((field: keyof OrganizationData, value: string) => {
    setOrganization(prev => ({ ...prev, [field]: value }));
  }, []);

  const updatePerson = useCallback((field: keyof PersonData, value: string) => {
    setPerson(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateService = useCallback((field: keyof ServiceData, value: string) => {
    setService(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateWebsite = useCallback((field: keyof WebSiteData, value: string) => {
    setWebsite(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateJob = useCallback((field: keyof JobPostingData, value: string) => {
    setJob(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateEvent = useCallback((field: keyof EventData, value: string) => {
    setEvent(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateVideo = useCallback((field: keyof VideoData, value: string) => {
    setVideo(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateReview = useCallback((field: keyof ReviewData, value: string) => {
    setReview(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateItemListMeta = useCallback((field: 'name' | 'description', value: string) => {
    setItemList(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateItemListEntry = useCallback((i: number, field: keyof ItemListEntry, value: string) => {
    setItemList(prev => ({
      ...prev,
      items: prev.items.map((it, idx) => idx === i ? { ...it, [field]: value } : it),
    }));
  }, []);

  const updateApp = useCallback((field: keyof SoftwareApplicationData, value: string) => {
    setApp(prev => ({ ...prev, [field]: value }));
  }, []);

  // ── Validation ───────────────────────────────────────────────────────────────

  const completenessIssues = useMemo<string[]>(() => {
    const w: string[] = [];
    switch (activeType) {
      case 'FAQ':
        if (faqPairs.every(p => !p.question && !p.answer)) w.push('Add at least one Q&A pair');
        faqPairs.forEach((p, i) => {
          if (p.question && !p.answer) w.push(`Q${i + 1}: Answer is missing`);
          if (!p.question && p.answer) w.push(`Q${i + 1}: Question is missing`);
        });
        break;
      case 'Article':
        if (!article.headline) w.push('Headline is required');
        if (!article.authorName) w.push('Author name is required');
        if (!article.datePublished) w.push('Date published is required');
        break;
      case 'LocalBusiness':
        if (!business.name) w.push('Business name is required');
        if (!business.street && !business.city) w.push('Address is required');
        break;
      case 'Product':
        if (!product.name) w.push('Product name is required');
        if (!product.price) w.push('Price is required');
        break;
      case 'BreadcrumbList':
        if (breadcrumbs.filter(b => b.name && b.url).length < 2) w.push('At least 2 breadcrumb items needed');
        break;
      case 'HowTo':
        if (!howTo.title) w.push('Title is required');
        if (howTo.steps.every(s => !s.name && !s.text)) w.push('Add at least one step');
        break;
      case 'Organization':
        if (!organization.name) w.push('Organization name is required');
        break;
      case 'Person':
        if (!person.name) w.push('Name is required');
        break;
      case 'Service':
        if (!service.name) w.push('Service name is required');
        if (!service.providerName) w.push('Provider name is required');
        break;
      case 'WebSite':
        if (!website.name) w.push('Site name is required');
        if (!website.url) w.push('Site URL is required');
        break;
      case 'JobPosting':
        if (!job.title) w.push('Job title is required');
        if (!job.description) w.push('Description is required');
        if (!job.datePosted) w.push('Date posted is required');
        if (!job.hiringOrgName) w.push('Hiring organisation name is required');
        if (job.locationType === 'onsite' && !job.city) w.push('City is required for an on-site job');
        break;
      case 'Event':
        if (!event.name) w.push('Event name is required');
        if (!event.startDate) w.push('Start date is required');
        if (event.attendanceMode === 'Online' && !event.onlineUrl) w.push('Online event URL is required');
        if (event.attendanceMode !== 'Online' && !event.venueName) w.push('Venue name is required');
        break;
      case 'VideoObject':
        if (!video.name) w.push('Video name is required');
        if (!video.thumbnailUrl) w.push('Thumbnail URL is required');
        if (!video.uploadDate) w.push('Upload date is required');
        break;
      case 'Review':
        if (!review.itemName) w.push('Item name is required');
        if (!review.authorName) w.push('Author name is required');
        if (!review.ratingValue) w.push('Rating value is required');
        break;
      case 'ItemList':
        if (itemList.items.filter(i => i.name).length < 2) w.push('At least 2 list items needed');
        break;
      case 'SoftwareApplication':
        if (!app.name) w.push('App name is required');
        if (!app.price) w.push('Price is required (use 0 for free)');
        break;
    }
    return w;
  }, [activeType, faqPairs, article, business, product, breadcrumbs, howTo, organization, person, service, website, job, event, video, review, itemList, app]);

  const googleEligibility = useMemo(() => {
    if (!GOOGLE_RICH_RESULT_TYPES.has(activeType)) {
      return {
        supported: false,
        message: 'This schema.org type has no dedicated Google rich result in the current Search Gallery. The Schema Markup Validator can still check its vocabulary and syntax.',
      };
    }

    if (activeType === 'SoftwareApplication' && (!app.ratingValue || !app.ratingCount)) {
      return {
        supported: true,
        message: 'Google has a related rich result, but this example is missing a genuine rating value and count. Passing this tool’s basic checks does not establish eligibility.',
      };
    }

    return {
      supported: true,
      message: 'Google has a related rich-result feature for this type. Eligibility also depends on page content, type-specific policies and Google’s test; a rich result is never guaranteed.',
    };
  }, [activeType, app.ratingValue, app.ratingCount]);

  // ── Schema generation ────────────────────────────────────────────────────────

  const schemaObj = useMemo<Record<string, unknown>>(() => {
    switch (activeType) {
      case 'FAQ': {
        const items = faqPairs.filter(p => p.question || p.answer);
        return {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: items.map(p => ({
            '@type': 'Question',
            name: p.question,
            acceptedAnswer: { '@type': 'Answer', text: p.answer },
          })),
        };
      }
      case 'Article': {
        return {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.headline,
          author: { '@type': 'Person', name: article.authorName, ...(article.authorUrl && { url: article.authorUrl }) },
          ...(article.publisherName && {
            publisher: {
              '@type': 'Organization',
              name: article.publisherName,
              ...(article.publisherLogoUrl && { logo: { '@type': 'ImageObject', url: article.publisherLogoUrl } }),
            },
          }),
          ...(article.datePublished && { datePublished: article.datePublished }),
          ...(article.dateModified && { dateModified: article.dateModified }),
          ...(article.imageUrl && { image: article.imageUrl }),
          ...(article.description && { description: article.description }),
        };
      }
      case 'LocalBusiness': {
        return {
          '@context': 'https://schema.org',
          '@type': business.type,
          name: business.name,
          address: {
            '@type': 'PostalAddress',
            streetAddress: business.street,
            addressLocality: business.city,
            addressRegion: business.region,
            postalCode: business.postalCode,
            addressCountry: business.country,
          },
          ...(business.phone && { telephone: business.phone }),
          ...(business.url && { url: business.url }),
          ...(business.latitude && business.longitude && {
            geo: { '@type': 'GeoCoordinates', latitude: business.latitude, longitude: business.longitude },
          }),
          ...(business.priceRange && { priceRange: business.priceRange }),
          ...(business.hours.length > 0 && {
            openingHoursSpecification: business.hours.map(h => ({
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: h.day,
              opens: h.open,
              closes: h.close,
            })),
          }),
        };
      }
      case 'Product': {
        return {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          ...(product.description && { description: product.description }),
          ...(product.imageUrl && { image: product.imageUrl }),
          ...(product.brand && { brand: { '@type': 'Brand', name: product.brand } }),
          ...(product.sku && { sku: product.sku }),
          ...(product.url && { url: product.url }),
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: product.currency,
            availability: `https://schema.org/${product.availability}`,
          },
          ...((product.ratingValue || product.reviewCount) && {
            aggregateRating: {
              '@type': 'AggregateRating',
              ...(product.ratingValue && { ratingValue: product.ratingValue }),
              ...(product.reviewCount && { reviewCount: product.reviewCount }),
            },
          }),
        };
      }
      case 'BreadcrumbList': {
        const items = breadcrumbs.filter(b => b.name || b.url);
        return {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((b, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: b.name,
            item: b.url,
          })),
        };
      }
      case 'HowTo': {
        const steps = howTo.steps.filter(s => s.name || s.text);
        return {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: howTo.title,
          ...(howTo.description && { description: howTo.description }),
          ...(howTo.totalTime && { totalTime: howTo.totalTime }),
          ...(howTo.estimatedCost && {
            estimatedCost: { '@type': 'MonetaryAmount', currency: howTo.currency, value: howTo.estimatedCost },
          }),
          step: steps.map((s, i) => ({
            '@type': 'HowToStep',
            position: i + 1,
            name: s.name,
            text: s.text,
            ...(s.imageUrl && { image: s.imageUrl }),
          })),
        };
      }
      case 'Organization': {
        const hasAddress = organization.street || organization.city || organization.postalCode;
        const sameAsList = splitLines(organization.sameAs);
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: organization.name,
          ...(organization.url && { url: organization.url }),
          ...(organization.logoUrl && { logo: organization.logoUrl }),
          ...(organization.description && { description: organization.description }),
          ...(hasAddress && {
            address: {
              '@type': 'PostalAddress',
              streetAddress: organization.street,
              addressLocality: organization.city,
              addressRegion: organization.region,
              postalCode: organization.postalCode,
              addressCountry: organization.country,
            },
          }),
          ...(organization.phone && { telephone: organization.phone }),
          ...(organization.email && { email: organization.email }),
          ...(sameAsList.length > 0 && { sameAs: sameAsList }),
        };
      }
      case 'Person': {
        const sameAsList = splitLines(person.sameAs);
        return {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: person.name,
          ...(person.jobTitle && { jobTitle: person.jobTitle }),
          ...(person.url && { url: person.url }),
          ...(person.imageUrl && { image: person.imageUrl }),
          ...(person.email && { email: person.email }),
          ...(person.worksForName && {
            worksFor: {
              '@type': 'Organization',
              name: person.worksForName,
              ...(person.worksForUrl && { url: person.worksForUrl }),
            },
          }),
          ...(sameAsList.length > 0 && { sameAs: sameAsList }),
        };
      }
      case 'Service': {
        return {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: service.name,
          ...(service.serviceType && { serviceType: service.serviceType }),
          ...(service.description && { description: service.description }),
          provider: {
            '@type': 'Organization',
            name: service.providerName,
            ...(service.providerUrl && { url: service.providerUrl }),
          },
          ...(service.areaServed && { areaServed: service.areaServed }),
          ...(service.url && { url: service.url }),
        };
      }
      case 'WebSite': {
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: website.name,
          ...(website.url && { url: website.url }),
          ...(website.description && { description: website.description }),
          ...(website.searchUrlTemplate && {
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: website.searchUrlTemplate,
              },
              'query-input': 'required name=search_term_string',
            },
          }),
        };
      }
      case 'JobPosting': {
        const salary = job.salaryMin ? {
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: job.salaryCurrency,
            value: {
              '@type': 'QuantitativeValue',
              ...(job.salaryMax ? { minValue: job.salaryMin, maxValue: job.salaryMax } : { value: job.salaryMin }),
              unitText: job.salaryUnit,
            },
          },
        } : {};
        const location = job.locationType === 'remote'
          ? {
            jobLocationType: 'TELECOMMUTE',
            applicantLocationRequirements: { '@type': 'Country', name: job.country || 'GB' },
          }
          : {
            jobLocation: {
              '@type': 'Place',
              address: {
                '@type': 'PostalAddress',
                streetAddress: job.street,
                addressLocality: job.city,
                addressRegion: job.region,
                postalCode: job.postalCode,
                addressCountry: job.country,
              },
            },
          };
        return {
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          title: job.title,
          description: job.description,
          ...(job.datePosted && { datePosted: job.datePosted }),
          ...(job.validThrough && { validThrough: job.validThrough }),
          ...(job.employmentType && { employmentType: job.employmentType }),
          hiringOrganization: {
            '@type': 'Organization',
            name: job.hiringOrgName,
            ...(job.hiringOrgUrl && { sameAs: job.hiringOrgUrl }),
            ...(job.hiringOrgLogo && { logo: job.hiringOrgLogo }),
          },
          ...location,
          ...salary,
        };
      }
      case 'Event': {
        const location = event.attendanceMode === 'Online'
          ? { '@type': 'VirtualLocation', url: event.onlineUrl }
          : {
            '@type': 'Place',
            name: event.venueName,
            address: {
              '@type': 'PostalAddress',
              streetAddress: event.street,
              addressLocality: event.city,
              addressRegion: event.region,
              postalCode: event.postalCode,
              addressCountry: event.country,
            },
          };
        return {
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: event.name,
          ...(event.description && { description: event.description }),
          ...(event.startDate && { startDate: event.startDate }),
          ...(event.endDate && { endDate: event.endDate }),
          ...(event.imageUrl && { image: event.imageUrl }),
          eventAttendanceMode: `https://schema.org/${event.attendanceMode}EventAttendanceMode`,
          ...(event.eventStatus && { eventStatus: `https://schema.org/${event.eventStatus}` }),
          location,
          organizer: {
            '@type': 'Organization',
            name: event.organizerName,
            ...(event.organizerUrl && { url: event.organizerUrl }),
          },
          ...(event.offerPrice && {
            offers: {
              '@type': 'Offer',
              price: event.offerPrice,
              priceCurrency: event.offerCurrency,
              availability: `https://schema.org/${event.offerAvailability}`,
              ...(event.offerUrl && { url: event.offerUrl }),
            },
          }),
        };
      }
      case 'VideoObject': {
        return {
          '@context': 'https://schema.org',
          '@type': 'VideoObject',
          name: video.name,
          description: video.description,
          thumbnailUrl: video.thumbnailUrl,
          uploadDate: video.uploadDate,
          ...(video.duration && { duration: video.duration }),
          ...(video.contentUrl && { contentUrl: video.contentUrl }),
          ...(video.embedUrl && { embedUrl: video.embedUrl }),
        };
      }
      case 'Review': {
        return {
          '@context': 'https://schema.org',
          '@type': 'Review',
          itemReviewed: { '@type': review.itemType, name: review.itemName },
          author: { '@type': 'Person', name: review.authorName },
          reviewRating: {
            '@type': 'Rating',
            ratingValue: review.ratingValue,
            bestRating: review.bestRating || '5',
          },
          ...(review.reviewBody && { reviewBody: review.reviewBody }),
          ...(review.datePublished && { datePublished: review.datePublished }),
        };
      }
      case 'ItemList': {
        const items = itemList.items.filter(i => i.name);
        return {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          ...(itemList.name && { name: itemList.name }),
          ...(itemList.description && { description: itemList.description }),
          itemListElement: items.map((it, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
              '@type': 'Thing',
              name: it.name,
              ...(it.url && { url: it.url }),
              ...(it.imageUrl && { image: it.imageUrl }),
            },
          })),
        };
      }
      case 'SoftwareApplication': {
        return {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: app.name,
          ...(app.applicationCategory && { applicationCategory: app.applicationCategory }),
          ...(app.operatingSystem && { operatingSystem: app.operatingSystem }),
          ...(app.url && { url: app.url }),
          ...(app.description && { description: app.description }),
          offers: { '@type': 'Offer', price: app.price, priceCurrency: app.currency },
          ...((app.ratingValue || app.ratingCount) && {
            aggregateRating: {
              '@type': 'AggregateRating',
              ...(app.ratingValue && { ratingValue: app.ratingValue }),
              ...(app.ratingCount && { ratingCount: app.ratingCount }),
            },
          }),
        };
      }
      default:
        return {};
    }
  }, [activeType, faqPairs, article, business, product, breadcrumbs, howTo, organization, person, service, website, job, event, video, review, itemList, app]);

  const schemaJson = useMemo(() => JSON.stringify(schemaObj, null, 2), [schemaObj]);

  const scriptTag = useMemo(() => createJsonLdScript(schemaObj), [schemaObj]);

  const microdataHtml = useMemo(() => jsonLdToMicrodata(schemaObj), [schemaObj]);

  const outputCode = format === 'jsonld' ? scriptTag : microdataHtml;
  const schemaItemCount = useMemo(() => countSchemaItems(schemaObj), [schemaObj]);

  // Derived data for the "How this could appear in Google" preview panel.
  // Every field that is still empty falls back to that field's own form
  // placeholder example (the same text shown in that input elsewhere in
  // this file), and usingExample records whenever any of those fallbacks
  // are in use so the UI can flag it. Which type gets a rich-result
  // enhancement block is decided purely by GOOGLE_RICH_RESULT_TYPES, the
  // same set the "Google rich-result check" box above already uses — see
  // renderPreview().
  const previewData = useMemo<PreviewData>(() => {
    const faviconLetter = (label: string) => (label.trim().charAt(0) || 'S').toUpperCase();
    const withExample = (value: string, example: string) => ({
      display: value || example,
      isExample: !value,
    });

    switch (activeType) {
      case 'FAQ': {
        const q = withExample(faqPairs[0]?.question ?? '', 'What is schema markup?');
        const a = withExample(faqPairs[0]?.answer ?? '', 'Schema markup is structured data...');
        return {
          title: q.display,
          description: a.display,
          urlLine: 'yoursite.com',
          favicon: 'S',
          usingExample: q.isExample || a.isExample,
        };
      }
      case 'Article': {
        const headline = withExample(article.headline, 'Article headline');
        const description = withExample(article.description, 'Brief description');
        const author = withExample(article.authorName, 'John Doe');
        const authorUrl = withExample(article.authorUrl, 'https://example.com/author');
        return {
          title: headline.display,
          description: description.display,
          urlLine: getHostname(authorUrl.display),
          favicon: faviconLetter(article.publisherName || headline.display),
          articleDate: formatPreviewDate(article.datePublished),
          articleAuthor: author.display,
          usingExample: headline.isExample || description.isExample || author.isExample,
        };
      }
      case 'LocalBusiness': {
        const name = withExample(business.name, 'Acme Plumbing');
        const street = withExample(business.street, '123 High Street');
        const city = withExample(business.city, 'London');
        const region = withExample(business.region, 'Greater London');
        const postalCode = withExample(business.postalCode, 'SW1A 1AA');
        const phone = withExample(business.phone, '+44 20 1234 5678');
        const url = withExample(business.url, 'https://example.com');
        const addressParts = [city.display, region.display].filter(Boolean).join(', ');
        return {
          title: name.display,
          description: [business.type, addressParts].filter(Boolean).join(' · '),
          urlLine: getHostname(url.display),
          favicon: faviconLetter(name.display),
          panelName: name.display,
          panelAddress: [street.display, addressParts, postalCode.display].filter(Boolean).join(', '),
          panelPhone: phone.display,
          panelHours: business.hours[0]
            ? `${business.hours[0].day} ${business.hours[0].open}–${business.hours[0].close}${business.hours.length > 1 ? ` (+${business.hours.length - 1} more)` : ''}`
            : '',
          usingExample: name.isExample || street.isExample || city.isExample || phone.isExample,
        };
      }
      case 'Product': {
        const name = withExample(product.name, 'Wireless Headphones');
        const description = withExample(product.description, 'Premium noise-cancelling headphones');
        const url = withExample(product.url, 'https://example.com/product');
        const ratingValue = withExample(product.ratingValue, '4.5');
        const reviewCount = withExample(product.reviewCount, '128');
        const price = withExample(product.price, '299.99');
        return {
          title: name.display,
          description: description.display,
          urlLine: getHostname(url.display),
          favicon: faviconLetter(product.brand || name.display),
          ratingValue: ratingValue.display,
          ratingCount: reviewCount.display,
          price: price.display,
          currency: product.currency,
          availability: product.availability,
          usingExample: name.isExample || description.isExample || ratingValue.isExample || reviewCount.isExample || price.isExample,
        };
      }
      case 'BreadcrumbList': {
        const filled = breadcrumbs.filter(b => b.name || b.url);
        const usingExample = filled.length < 2;
        const items = usingExample
          ? [...filled, { name: 'Page name', url: 'https://example.com/page' }]
          : filled;
        const host = getHostname(items[0]?.url);
        const trail = items.length > 1 ? items.slice(1).map(b => b.name || '…').join(' › ') : '';
        return {
          title: items[items.length - 1]?.name || 'Page name',
          description: 'Your page description will appear here as you fill in the fields above.',
          urlLine: trail ? `${host} › ${trail}` : host,
          favicon: faviconLetter(items[0]?.name || host),
          usingExample,
        };
      }
      case 'HowTo': {
        const title = withExample(howTo.title, 'How to Change a Tyre');
        const description = withExample(howTo.description, 'Step-by-step guide to...');
        return {
          title: title.display,
          description: description.display,
          urlLine: 'yoursite.com',
          favicon: faviconLetter(title.display),
          usingExample: title.isExample || description.isExample,
        };
      }
      case 'Organization': {
        const name = withExample(organization.name, 'Acme Ltd');
        const description = withExample(organization.description, 'What the organisation does');
        const street = withExample(organization.street, '123 High Street');
        const city = withExample(organization.city, 'London');
        const region = withExample(organization.region, 'Greater London');
        const postalCode = withExample(organization.postalCode, 'SW1A 1AA');
        const phone = withExample(organization.phone, '+44 20 1234 5678');
        const url = withExample(organization.url, 'https://example.com');
        const addressParts = [city.display, region.display].filter(Boolean).join(', ');
        return {
          title: name.display,
          description: description.display,
          urlLine: getHostname(url.display),
          favicon: faviconLetter(name.display),
          panelName: name.display,
          panelAddress: [street.display, addressParts, postalCode.display].filter(Boolean).join(', '),
          panelPhone: phone.display,
          usingExample: name.isExample || description.isExample || street.isExample || phone.isExample,
        };
      }
      case 'Person': {
        const name = withExample(person.name, 'Jane Doe');
        const jobTitle = withExample(person.jobTitle, 'Marketing Director');
        const url = withExample(person.url, 'https://example.com/team/jane-doe');
        return {
          title: name.display,
          description: jobTitle.display,
          urlLine: getHostname(url.display),
          favicon: faviconLetter(name.display),
          usingExample: name.isExample || jobTitle.isExample,
        };
      }
      case 'Service': {
        const name = withExample(service.name, 'Boiler Repair');
        const description = withExample(service.description, 'What the service covers');
        const url = withExample(service.url || service.providerUrl, 'https://example.com/services/boiler-repair');
        return {
          title: name.display,
          description: description.display,
          urlLine: getHostname(url.display),
          favicon: faviconLetter(service.providerName || name.display),
          usingExample: name.isExample || description.isExample,
        };
      }
      case 'WebSite': {
        const name = withExample(website.name, 'Acme Ltd');
        const description = withExample(website.description, 'What the site is about');
        const url = withExample(website.url, 'https://example.com');
        return {
          title: name.display,
          description: description.display,
          urlLine: getHostname(url.display),
          favicon: faviconLetter(name.display),
          usingExample: name.isExample || description.isExample,
        };
      }
      case 'JobPosting': {
        const title = withExample(job.title, 'Senior Plumber');
        const description = withExample(job.description, 'Full job description...');
        const hiringOrgName = withExample(job.hiringOrgName, 'Acme Plumbing');
        const hiringOrgUrl = withExample(job.hiringOrgUrl, 'https://example.com');
        const city = withExample(job.city, 'London');
        const region = withExample(job.region, 'Greater London');
        const salaryMin = withExample(job.salaryMin, '30000');
        const salaryMax = withExample(job.salaryMax, '40000');
        const salary = `${job.salaryCurrency} ${salaryMin.display}–${salaryMax.display} / ${job.salaryUnit.toLowerCase()}`;
        const location = job.locationType === 'remote'
          ? 'Remote'
          : [city.display, region.display].filter(Boolean).join(', ');
        return {
          title: title.display,
          description: description.display,
          urlLine: getHostname(hiringOrgUrl.display),
          favicon: faviconLetter(hiringOrgName.display),
          jobSalary: salary,
          jobLocation: location,
          usingExample: title.isExample || description.isExample || hiringOrgName.isExample || salaryMin.isExample || city.isExample,
        };
      }
      case 'Event': {
        const name = withExample(event.name, 'Reading SEO Meetup');
        const description = withExample(event.description, 'What the event covers');
        const venueName = withExample(event.venueName, 'The Conference Centre');
        const city = withExample(event.city, 'Reading');
        const organizerName = withExample(event.organizerName, 'Acme Events Ltd');
        const organizerUrl = withExample(event.organizerUrl || event.offerUrl, 'https://example.com');
        const location = event.attendanceMode === 'Online'
          ? getHostname(event.onlineUrl, 'Online event')
          : [venueName.display, city.display].filter(Boolean).join(', ');
        return {
          title: name.display,
          description: description.display,
          urlLine: getHostname(organizerUrl.display),
          favicon: faviconLetter(organizerName.display),
          eventDate: formatPreviewDate(event.startDate),
          eventLocation: location,
          usingExample: name.isExample || description.isExample || venueName.isExample || city.isExample || organizerName.isExample,
        };
      }
      case 'VideoObject': {
        const name = withExample(video.name, 'How to fix a leaking tap');
        const description = withExample(video.description, 'What the video covers');
        const url = withExample(video.contentUrl || video.embedUrl, 'https://example.com/video.mp4');
        const duration = withExample(video.duration, 'PT1M33S');
        return {
          title: name.display,
          description: description.display,
          urlLine: getHostname(url.display),
          favicon: faviconLetter(name.display),
          videoDuration: formatIsoDuration(duration.display),
          usingExample: name.isExample || description.isExample || duration.isExample,
        };
      }
      case 'Review': {
        const itemName = withExample(review.itemName, 'Acme Boiler Service');
        const authorName = withExample(review.authorName, 'Jane Doe');
        const ratingValue = withExample(review.ratingValue, '4.5');
        const reviewBody = withExample(review.reviewBody, 'What the review says...');
        return {
          title: itemName.display,
          description: reviewBody.display,
          urlLine: 'yoursite.com',
          favicon: faviconLetter(itemName.display),
          ratingValue: ratingValue.display,
          ratingBest: review.bestRating || '5',
          reviewAuthor: authorName.display,
          usingExample: itemName.isExample || authorName.isExample || ratingValue.isExample,
        };
      }
      case 'ItemList': {
        const name = withExample(itemList.name, 'Best plumbers in Reading');
        const description = withExample(itemList.description, 'What the list ranks');
        return {
          title: name.display,
          description: description.display,
          urlLine: 'yoursite.com',
          favicon: faviconLetter(name.display),
          usingExample: name.isExample || description.isExample,
        };
      }
      case 'SoftwareApplication': {
        const name = withExample(app.name, 'Schema Markup Generator');
        const description = withExample(app.description, 'What the app does');
        const url = withExample(app.url, 'https://example.com/app');
        const ratingValue = withExample(app.ratingValue, '4.6');
        const ratingCount = withExample(app.ratingCount, '52');
        return {
          title: name.display,
          description: description.display,
          urlLine: getHostname(url.display),
          favicon: faviconLetter(name.display),
          ratingValue: ratingValue.display,
          ratingCount: ratingCount.display,
          price: app.price,
          currency: app.currency,
          usingExample: name.isExample || description.isExample || ratingValue.isExample,
        };
      }
      default:
        return { title: 'Your page title', description: 'Your page description will appear here.', urlLine: 'yoursite.com', favicon: 'S', usingExample: false };
    }
  }, [activeType, faqPairs, article, business, product, breadcrumbs, howTo, organization, person, service, website, job, event, video, review, itemList, app]);

  // ── Actions ──────────────────────────────────────────────────────────────────

  const copyToClipboard = useCallback(async () => {
    let copied = false;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(outputCode);
      copied = true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = outputCode;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        copied = document.execCommand('copy');
      } catch {
        copied = false;
      } finally {
        document.body.removeChild(ta);
      }
    }

    setCopyStatus(copied ? 'copied' : 'error');
    setActionFeedback(copied
      ? 'Markup copied. Open a validator, choose its code option, then paste.'
      : 'Copy failed. Select the code in the output panel and copy it manually.');
    trackEvent('schema_copy', {
      tool: 'schema_generator', schema_type: activeType, format, status: copied ? 'success' : 'error',
      issue_count: completenessIssues.length, schema_item_count: schemaItemCount,
    });
    window.setTimeout(() => setCopyStatus('idle'), 3000);
  }, [outputCode, activeType, format, completenessIssues.length, schemaItemCount]);

  const downloadJson = useCallback(() => {
    const blob = new Blob([schemaJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeType.toLowerCase()}-schema.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setActionFeedback('JSON file downloaded.');
    trackEvent('schema_download', {
      tool: 'schema_generator', schema_type: activeType, format, status: 'success',
      issue_count: completenessIssues.length, schema_item_count: schemaItemCount,
    });
  }, [schemaJson, activeType, format, completenessIssues.length, schemaItemCount]);

  const openRichResultsTest = useCallback(() => {
    const opened = window.open('https://search.google.com/test/rich-results', '_blank');
    if (opened) opened.opener = null;
    const status = opened ? 'opened' : 'blocked';
    setActionFeedback(opened
      ? 'Google’s test opened. Choose Code, then paste the copied markup.'
      : 'The browser blocked the new tab. Allow pop-ups, then try again.');
    trackEvent('schema_test_open', {
      tool: 'schema_generator', validator: 'google_rich_results', schema_type: activeType, format, status,
      issue_count: completenessIssues.length, schema_item_count: schemaItemCount,
    });
  }, [activeType, format, completenessIssues.length, schemaItemCount]);

  const openSchemaValidator = useCallback(() => {
    const opened = window.open('https://validator.schema.org/', '_blank');
    if (opened) opened.opener = null;
    const status = opened ? 'opened' : 'blocked';
    setActionFeedback(opened
      ? 'Schema Markup Validator opened. Paste the copied markup into its code field.'
      : 'The browser blocked the new tab. Allow pop-ups, then try again.');
    trackEvent('schema_test_open', {
      tool: 'schema_generator', validator: 'schema_org', schema_type: activeType, format, status,
      issue_count: completenessIssues.length, schema_item_count: schemaItemCount,
    });
  }, [activeType, format, completenessIssues.length, schemaItemCount]);

  // ── Render forms ─────────────────────────────────────────────────────────────

  function renderFAQForm() {
    return (
      <div className="space-y-4">
        {faqPairs.map((pair, i) => (
          <div key={i} className={`${cardClass} space-y-3`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Q&A Pair {i + 1}</span>
              {faqPairs.length > 1 && (
                <button
                  type="button"
                  className={`text-sm ${dangerText}`}
                  onClick={() => setFaqPairs(prev => prev.filter((_, idx) => idx !== i))}
                >
                  Remove
                </button>
              )}
            </div>
            <Field label="Question">
              <input className={inputClass} placeholder="What is schema markup?" value={pair.question}
                onChange={e => updateFaq(i, 'question', e.target.value)} />
            </Field>
            <Field label="Answer">
              <textarea className={`${inputClass} min-h-[80px] resize-y`} placeholder="Schema markup is structured data..."
                value={pair.answer} onChange={e => updateFaq(i, 'answer', e.target.value)} />
            </Field>
          </div>
        ))}
        <button type="button" className={btnSecondary}
          onClick={() => setFaqPairs(prev => [...prev, { question: '', answer: '' }])}>
          + Add Q&A Pair
        </button>
      </div>
    );
  }

  function renderArticleForm() {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Headline *">
            <input className={inputClass} placeholder="Article headline" value={article.headline}
              onChange={e => updateArticle('headline', e.target.value)} />
          </Field>
          <Field label="Description">
            <input className={inputClass} placeholder="Brief description" value={article.description}
              onChange={e => updateArticle('description', e.target.value)} />
          </Field>
          <Field label="Author Name *">
            <input className={inputClass} placeholder="John Doe" value={article.authorName}
              onChange={e => updateArticle('authorName', e.target.value)} />
          </Field>
          <Field label="Author URL">
            <input className={inputClass} placeholder="https://example.com/author" value={article.authorUrl}
              onChange={e => updateArticle('authorUrl', e.target.value)} />
          </Field>
          <Field label="Publisher Name">
            <input className={inputClass} placeholder="Publisher Inc." value={article.publisherName}
              onChange={e => updateArticle('publisherName', e.target.value)} />
          </Field>
          <Field label="Publisher Logo URL">
            <input className={inputClass} placeholder="https://example.com/logo.png" value={article.publisherLogoUrl}
              onChange={e => updateArticle('publisherLogoUrl', e.target.value)} />
          </Field>
          <Field label="Date Published *">
            <input type="date" className={inputClass} value={article.datePublished}
              onChange={e => updateArticle('datePublished', e.target.value)} />
          </Field>
          <Field label="Date Modified">
            <input type="date" className={inputClass} value={article.dateModified}
              onChange={e => updateArticle('dateModified', e.target.value)} />
          </Field>
          <Field label="Image URL">
            <input className={inputClass} placeholder="https://example.com/image.jpg" value={article.imageUrl}
              onChange={e => updateArticle('imageUrl', e.target.value)} />
          </Field>
        </div>
      </div>
    );
  }

  function renderLocalBusinessForm() {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Business Name *">
            <input className={inputClass} placeholder="Acme Plumbing" value={business.name}
              onChange={e => updateBusiness('name', e.target.value)} />
          </Field>
          <Field label="Business Type">
            <select className={inputClass} value={business.type}
              onChange={e => updateBusiness('type', e.target.value)}>
              {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Street Address *">
            <input className={inputClass} placeholder="123 High Street" value={business.street}
              onChange={e => updateBusiness('street', e.target.value)} />
          </Field>
          <Field label="City *">
            <input className={inputClass} placeholder="London" value={business.city}
              onChange={e => updateBusiness('city', e.target.value)} />
          </Field>
          <Field label="Region">
            <input className={inputClass} placeholder="Greater London" value={business.region}
              onChange={e => updateBusiness('region', e.target.value)} />
          </Field>
          <Field label="Postal Code">
            <input className={inputClass} placeholder="SW1A 1AA" value={business.postalCode}
              onChange={e => updateBusiness('postalCode', e.target.value)} />
          </Field>
          <Field label="Country">
            <input className={inputClass} placeholder="GB" value={business.country}
              onChange={e => updateBusiness('country', e.target.value)} />
          </Field>
          <Field label="Phone">
            <input className={inputClass} placeholder="+44 20 1234 5678" value={business.phone}
              onChange={e => updateBusiness('phone', e.target.value)} />
          </Field>
          <Field label="Website URL">
            <input className={inputClass} placeholder="https://example.com" value={business.url}
              onChange={e => updateBusiness('url', e.target.value)} />
          </Field>
          <Field label="Price Range">
            <input className={inputClass} placeholder="$$" value={business.priceRange}
              onChange={e => updateBusiness('priceRange', e.target.value)} />
          </Field>
          <Field label="Latitude">
            <input className={inputClass} placeholder="51.5074" value={business.latitude}
              onChange={e => updateBusiness('latitude', e.target.value)} />
          </Field>
          <Field label="Longitude">
            <input className={inputClass} placeholder="-0.1278" value={business.longitude}
              onChange={e => updateBusiness('longitude', e.target.value)} />
          </Field>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Opening Hours</h3>
          {business.hours.map((h, i) => (
            <div key={i} className="flex items-end gap-3">
              <Field label="Day">
                <select className={inputClass} value={h.day}
                  onChange={e => updateBusinessHour(i, 'day', e.target.value)}>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Opens">
                <input type="time" className={inputClass} value={h.open}
                  onChange={e => updateBusinessHour(i, 'open', e.target.value)} />
              </Field>
              <Field label="Closes">
                <input type="time" className={inputClass} value={h.close}
                  onChange={e => updateBusinessHour(i, 'close', e.target.value)} />
              </Field>
              {business.hours.length > 1 && (
                <button type="button" className={`text-sm pb-2.5 ${dangerText}`}
                  onClick={() => setBusiness(prev => ({ ...prev, hours: prev.hours.filter((_, idx) => idx !== i) }))}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" className={btnSecondary}
            onClick={() => setBusiness(prev => ({ ...prev, hours: [...prev.hours, { day: 'Monday', open: '09:00', close: '17:00' }] }))}>
            + Add Hours
          </button>
        </div>
      </div>
    );
  }

  function renderProductForm() {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Product Name *">
            <input className={inputClass} placeholder="Wireless Headphones" value={product.name}
              onChange={e => updateProduct('name', e.target.value)} />
          </Field>
          <Field label="Description">
            <input className={inputClass} placeholder="Premium noise-cancelling headphones" value={product.description}
              onChange={e => updateProduct('description', e.target.value)} />
          </Field>
          <Field label="Image URL">
            <input className={inputClass} placeholder="https://example.com/product.jpg" value={product.imageUrl}
              onChange={e => updateProduct('imageUrl', e.target.value)} />
          </Field>
          <Field label="Brand">
            <input className={inputClass} placeholder="Sony" value={product.brand}
              onChange={e => updateProduct('brand', e.target.value)} />
          </Field>
          <Field label="SKU">
            <input className={inputClass} placeholder="WH-1000XM5" value={product.sku}
              onChange={e => updateProduct('sku', e.target.value)} />
          </Field>
          <Field label="Price *">
            <input className={inputClass} placeholder="299.99" value={product.price}
              onChange={e => updateProduct('price', e.target.value)} />
          </Field>
          <Field label="Currency">
            <select className={inputClass} value={product.currency}
              onChange={e => updateProduct('currency', e.target.value)}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Availability">
            <select className={inputClass} value={product.availability}
              onChange={e => updateProduct('availability', e.target.value)}>
              {AVAILABILITY_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </Field>
          <Field label="Review Rating (1-5)">
            <input className={inputClass} placeholder="4.5" value={product.ratingValue}
              onChange={e => updateProduct('ratingValue', e.target.value)} />
          </Field>
          <Field label="Review Count">
            <input className={inputClass} placeholder="128" value={product.reviewCount}
              onChange={e => updateProduct('reviewCount', e.target.value)} />
          </Field>
          <Field label="Product URL">
            <input className={inputClass} placeholder="https://example.com/product" value={product.url}
              onChange={e => updateProduct('url', e.target.value)} />
          </Field>
        </div>
      </div>
    );
  }

  function renderBreadcrumbForm() {
    return (
      <div className="space-y-4">
        {breadcrumbs.map((b, i) => (
          <div key={i} className="flex items-end gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-hairline dark:border-white/[0.08] bg-wash dark:bg-white/[0.04] text-xs font-semibold text-muted-foreground">
              {i + 1}
            </div>
            <div className="flex-1">
              <Field label="Name">
                <input className={inputClass} placeholder="Page name" value={b.name}
                  onChange={e => updateBreadcrumb(i, 'name', e.target.value)} />
              </Field>
            </div>
            <div className="flex-1">
              <Field label="URL">
                <input className={inputClass} placeholder="https://example.com/page" value={b.url}
                  onChange={e => updateBreadcrumb(i, 'url', e.target.value)} />
              </Field>
            </div>
            {breadcrumbs.length > 2 && (
              <button type="button" className={`text-sm pb-2.5 ${dangerText}`}
                onClick={() => setBreadcrumbs(prev => prev.filter((_, idx) => idx !== i))}>
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" className={btnSecondary}
          onClick={() => setBreadcrumbs(prev => [...prev, { name: '', url: '' }])}>
          + Add Breadcrumb
        </button>
      </div>
    );
  }

  function renderHowToForm() {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title *">
            <input className={inputClass} placeholder="How to Change a Tyre" value={howTo.title}
              onChange={e => updateHowTo('title', e.target.value)} />
          </Field>
          <Field label="Description">
            <input className={inputClass} placeholder="Step-by-step guide to..." value={howTo.description}
              onChange={e => updateHowTo('description', e.target.value)} />
          </Field>
          <Field label="Total Time (ISO 8601)">
            <input className={inputClass} placeholder="PT30M" value={howTo.totalTime}
              onChange={e => updateHowTo('totalTime', e.target.value)} />
          </Field>
          <div className="flex gap-3">
            <div className="flex-1">
              <Field label="Estimated Cost">
                <input className={inputClass} placeholder="50" value={howTo.estimatedCost}
                  onChange={e => updateHowTo('estimatedCost', e.target.value)} />
              </Field>
            </div>
            <div className="w-28">
              <Field label="Currency">
                <select className={inputClass} value={howTo.currency}
                  onChange={e => updateHowTo('currency', e.target.value)}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Steps</h3>
          {howTo.steps.map((step, i) => (
            <div key={i} className={`${cardClass} space-y-3`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Step {i + 1}</span>
                {howTo.steps.length > 1 && (
                  <button type="button" className={`text-sm ${dangerText}`}
                    onClick={() => setHowTo(prev => ({ ...prev, steps: prev.steps.filter((_, idx) => idx !== i) }))}>
                    Remove
                  </button>
                )}
              </div>
              <Field label="Step Name">
                <input className={inputClass} placeholder="Jack up the car" value={step.name}
                  onChange={e => updateHowToStep(i, 'name', e.target.value)} />
              </Field>
              <Field label="Step Text">
                <textarea className={`${inputClass} min-h-[60px] resize-y`} placeholder="Place the jack under..."
                  value={step.text} onChange={e => updateHowToStep(i, 'text', e.target.value)} />
              </Field>
              <Field label="Step Image URL (optional)">
                <input className={inputClass} placeholder="https://example.com/step1.jpg" value={step.imageUrl}
                  onChange={e => updateHowToStep(i, 'imageUrl', e.target.value)} />
              </Field>
            </div>
          ))}
          <button type="button" className={btnSecondary}
            onClick={() => setHowTo(prev => ({ ...prev, steps: [...prev.steps, { name: '', text: '', imageUrl: '' }] }))}>
            + Add Step
          </button>
        </div>
      </div>
    );
  }

  function renderOrganizationForm() {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Organization Name *">
          <input className={inputClass} placeholder="Acme Ltd" value={organization.name}
            onChange={e => updateOrganization('name', e.target.value)} />
        </Field>
        <Field label="Website URL">
          <input className={inputClass} placeholder="https://example.com" value={organization.url}
            onChange={e => updateOrganization('url', e.target.value)} />
        </Field>
        <Field label="Logo URL">
          <input className={inputClass} placeholder="https://example.com/logo.png" value={organization.logoUrl}
            onChange={e => updateOrganization('logoUrl', e.target.value)} />
        </Field>
        <Field label="Description">
          <input className={inputClass} placeholder="What the organisation does" value={organization.description}
            onChange={e => updateOrganization('description', e.target.value)} />
        </Field>
        <Field label="Street Address">
          <input className={inputClass} placeholder="123 High Street" value={organization.street}
            onChange={e => updateOrganization('street', e.target.value)} />
        </Field>
        <Field label="City">
          <input className={inputClass} placeholder="London" value={organization.city}
            onChange={e => updateOrganization('city', e.target.value)} />
        </Field>
        <Field label="Region">
          <input className={inputClass} placeholder="Greater London" value={organization.region}
            onChange={e => updateOrganization('region', e.target.value)} />
        </Field>
        <Field label="Postal Code">
          <input className={inputClass} placeholder="SW1A 1AA" value={organization.postalCode}
            onChange={e => updateOrganization('postalCode', e.target.value)} />
        </Field>
        <Field label="Country">
          <input className={inputClass} placeholder="GB" value={organization.country}
            onChange={e => updateOrganization('country', e.target.value)} />
        </Field>
        <Field label="Phone">
          <input className={inputClass} placeholder="+44 20 1234 5678" value={organization.phone}
            onChange={e => updateOrganization('phone', e.target.value)} />
        </Field>
        <Field label="Email">
          <input className={inputClass} placeholder="hello@example.com" value={organization.email}
            onChange={e => updateOrganization('email', e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Social profile URLs (sameAs, one per line)">
            <textarea className={`${inputClass} min-h-[70px] resize-y`} placeholder={'https://linkedin.com/company/example\nhttps://twitter.com/example'}
              value={organization.sameAs} onChange={e => updateOrganization('sameAs', e.target.value)} />
          </Field>
        </div>
      </div>
    );
  }

  function renderPersonForm() {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name *">
          <input className={inputClass} placeholder="Jane Doe" value={person.name}
            onChange={e => updatePerson('name', e.target.value)} />
        </Field>
        <Field label="Job Title">
          <input className={inputClass} placeholder="Marketing Director" value={person.jobTitle}
            onChange={e => updatePerson('jobTitle', e.target.value)} />
        </Field>
        <Field label="Profile URL">
          <input className={inputClass} placeholder="https://example.com/team/jane-doe" value={person.url}
            onChange={e => updatePerson('url', e.target.value)} />
        </Field>
        <Field label="Photo URL">
          <input className={inputClass} placeholder="https://example.com/jane.jpg" value={person.imageUrl}
            onChange={e => updatePerson('imageUrl', e.target.value)} />
        </Field>
        <Field label="Email">
          <input className={inputClass} placeholder="jane@example.com" value={person.email}
            onChange={e => updatePerson('email', e.target.value)} />
        </Field>
        <Field label="Works For (Organization Name)">
          <input className={inputClass} placeholder="Acme Ltd" value={person.worksForName}
            onChange={e => updatePerson('worksForName', e.target.value)} />
        </Field>
        <Field label="Employer URL">
          <input className={inputClass} placeholder="https://example.com" value={person.worksForUrl}
            onChange={e => updatePerson('worksForUrl', e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Social profile URLs (sameAs, one per line)">
            <textarea className={`${inputClass} min-h-[70px] resize-y`} placeholder={'https://linkedin.com/in/jane-doe\nhttps://twitter.com/janedoe'}
              value={person.sameAs} onChange={e => updatePerson('sameAs', e.target.value)} />
          </Field>
        </div>
      </div>
    );
  }

  function renderServiceForm() {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Service Name *">
          <input className={inputClass} placeholder="Boiler Repair" value={service.name}
            onChange={e => updateService('name', e.target.value)} />
        </Field>
        <Field label="Service Type">
          <input className={inputClass} placeholder="Plumbing" value={service.serviceType}
            onChange={e => updateService('serviceType', e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description">
            <input className={inputClass} placeholder="What the service covers" value={service.description}
              onChange={e => updateService('description', e.target.value)} />
          </Field>
        </div>
        <Field label="Provider Name *">
          <input className={inputClass} placeholder="Acme Plumbing" value={service.providerName}
            onChange={e => updateService('providerName', e.target.value)} />
        </Field>
        <Field label="Provider URL">
          <input className={inputClass} placeholder="https://example.com" value={service.providerUrl}
            onChange={e => updateService('providerUrl', e.target.value)} />
        </Field>
        <Field label="Area Served">
          <input className={inputClass} placeholder="London" value={service.areaServed}
            onChange={e => updateService('areaServed', e.target.value)} />
        </Field>
        <Field label="Service Page URL">
          <input className={inputClass} placeholder="https://example.com/services/boiler-repair" value={service.url}
            onChange={e => updateService('url', e.target.value)} />
        </Field>
      </div>
    );
  }

  function renderWebsiteForm() {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Site Name *">
          <input className={inputClass} placeholder="Acme Ltd" value={website.name}
            onChange={e => updateWebsite('name', e.target.value)} />
        </Field>
        <Field label="Site URL *">
          <input className={inputClass} placeholder="https://example.com" value={website.url}
            onChange={e => updateWebsite('url', e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description">
            <input className={inputClass} placeholder="What the site is about" value={website.description}
              onChange={e => updateWebsite('description', e.target.value)} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Internal search URL template (optional)">
            <input className={inputClass} placeholder="https://example.com/search?q={search_term_string}" value={website.searchUrlTemplate}
              onChange={e => updateWebsite('searchUrlTemplate', e.target.value)} />
          </Field>
        </div>
      </div>
    );
  }

  function renderJobPostingForm() {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Job Title *">
            <input className={inputClass} placeholder="Senior Plumber" value={job.title}
              onChange={e => updateJob('title', e.target.value)} />
          </Field>
          <Field label="Employment Type">
            <select className={inputClass} value={job.employmentType}
              onChange={e => updateJob('employmentType', e.target.value)}>
              {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description *">
              <textarea className={`${inputClass} min-h-[80px] resize-y`} placeholder="Full job description..."
                value={job.description} onChange={e => updateJob('description', e.target.value)} />
            </Field>
          </div>
          <Field label="Date Posted *">
            <input type="date" className={inputClass} value={job.datePosted}
              onChange={e => updateJob('datePosted', e.target.value)} />
          </Field>
          <Field label="Valid Through">
            <input type="date" className={inputClass} value={job.validThrough}
              onChange={e => updateJob('validThrough', e.target.value)} />
          </Field>
          <Field label="Hiring Organisation Name *">
            <input className={inputClass} placeholder="Acme Plumbing" value={job.hiringOrgName}
              onChange={e => updateJob('hiringOrgName', e.target.value)} />
          </Field>
          <Field label="Hiring Organisation URL">
            <input className={inputClass} placeholder="https://example.com" value={job.hiringOrgUrl}
              onChange={e => updateJob('hiringOrgUrl', e.target.value)} />
          </Field>
          <Field label="Hiring Organisation Logo URL">
            <input className={inputClass} placeholder="https://example.com/logo.png" value={job.hiringOrgLogo}
              onChange={e => updateJob('hiringOrgLogo', e.target.value)} />
          </Field>
          <Field label="Location Type">
            <select className={inputClass} value={job.locationType}
              onChange={e => updateJob('locationType', e.target.value)}>
              <option value="onsite">On-site</option>
              <option value="remote">Remote</option>
            </select>
          </Field>
        </div>

        {job.locationType === 'onsite' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Street Address">
              <input className={inputClass} placeholder="123 High Street" value={job.street}
                onChange={e => updateJob('street', e.target.value)} />
            </Field>
            <Field label="City *">
              <input className={inputClass} placeholder="London" value={job.city}
                onChange={e => updateJob('city', e.target.value)} />
            </Field>
            <Field label="Region">
              <input className={inputClass} placeholder="Greater London" value={job.region}
                onChange={e => updateJob('region', e.target.value)} />
            </Field>
            <Field label="Postal Code">
              <input className={inputClass} placeholder="SW1A 1AA" value={job.postalCode}
                onChange={e => updateJob('postalCode', e.target.value)} />
            </Field>
            <Field label="Country">
              <input className={inputClass} placeholder="GB" value={job.country}
                onChange={e => updateJob('country', e.target.value)} />
            </Field>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Salary Min">
            <input className={inputClass} placeholder="30000" value={job.salaryMin}
              onChange={e => updateJob('salaryMin', e.target.value)} />
          </Field>
          <Field label="Salary Max">
            <input className={inputClass} placeholder="40000" value={job.salaryMax}
              onChange={e => updateJob('salaryMax', e.target.value)} />
          </Field>
          <Field label="Currency">
            <select className={inputClass} value={job.salaryCurrency}
              onChange={e => updateJob('salaryCurrency', e.target.value)}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Per">
            <select className={inputClass} value={job.salaryUnit}
              onChange={e => updateJob('salaryUnit', e.target.value)}>
              {SALARY_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </Field>
        </div>
      </div>
    );
  }

  function renderEventForm() {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Event Name *">
            <input className={inputClass} placeholder="Reading SEO Meetup" value={event.name}
              onChange={e => updateEvent('name', e.target.value)} />
          </Field>
          <Field label="Attendance Mode">
            <select className={inputClass} value={event.attendanceMode}
              onChange={e => updateEvent('attendanceMode', e.target.value)}>
              <option value="Offline">In person</option>
              <option value="Online">Online</option>
              <option value="Mixed">Mixed</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <input className={inputClass} placeholder="What the event covers" value={event.description}
                onChange={e => updateEvent('description', e.target.value)} />
            </Field>
          </div>
          <Field label="Start Date *">
            <input type="datetime-local" className={inputClass} value={event.startDate}
              onChange={e => updateEvent('startDate', e.target.value)} />
          </Field>
          <Field label="End Date">
            <input type="datetime-local" className={inputClass} value={event.endDate}
              onChange={e => updateEvent('endDate', e.target.value)} />
          </Field>
          <Field label="Status">
            <select className={inputClass} value={event.eventStatus}
              onChange={e => updateEvent('eventStatus', e.target.value)}>
              {EVENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="Image URL">
            <input className={inputClass} placeholder="https://example.com/event.jpg" value={event.imageUrl}
              onChange={e => updateEvent('imageUrl', e.target.value)} />
          </Field>
        </div>

        {event.attendanceMode === 'Online' ? (
          <Field label="Online Event URL *">
            <input className={inputClass} placeholder="https://example.com/live" value={event.onlineUrl}
              onChange={e => updateEvent('onlineUrl', e.target.value)} />
          </Field>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Venue Name *">
              <input className={inputClass} placeholder="The Conference Centre" value={event.venueName}
                onChange={e => updateEvent('venueName', e.target.value)} />
            </Field>
            <Field label="Street Address">
              <input className={inputClass} placeholder="123 High Street" value={event.street}
                onChange={e => updateEvent('street', e.target.value)} />
            </Field>
            <Field label="City">
              <input className={inputClass} placeholder="Reading" value={event.city}
                onChange={e => updateEvent('city', e.target.value)} />
            </Field>
            <Field label="Region">
              <input className={inputClass} placeholder="Berkshire" value={event.region}
                onChange={e => updateEvent('region', e.target.value)} />
            </Field>
            <Field label="Postal Code">
              <input className={inputClass} placeholder="RG1 1AA" value={event.postalCode}
                onChange={e => updateEvent('postalCode', e.target.value)} />
            </Field>
            <Field label="Country">
              <input className={inputClass} placeholder="GB" value={event.country}
                onChange={e => updateEvent('country', e.target.value)} />
            </Field>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Organiser Name">
            <input className={inputClass} placeholder="Acme Events Ltd" value={event.organizerName}
              onChange={e => updateEvent('organizerName', e.target.value)} />
          </Field>
          <Field label="Organiser URL">
            <input className={inputClass} placeholder="https://example.com" value={event.organizerUrl}
              onChange={e => updateEvent('organizerUrl', e.target.value)} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Ticket Price">
            <input className={inputClass} placeholder="0" value={event.offerPrice}
              onChange={e => updateEvent('offerPrice', e.target.value)} />
          </Field>
          <Field label="Currency">
            <select className={inputClass} value={event.offerCurrency}
              onChange={e => updateEvent('offerCurrency', e.target.value)}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Ticket URL">
            <input className={inputClass} placeholder="https://example.com/tickets" value={event.offerUrl}
              onChange={e => updateEvent('offerUrl', e.target.value)} />
          </Field>
        </div>
      </div>
    );
  }

  function renderVideoForm() {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Video Name *">
          <input className={inputClass} placeholder="How to fix a leaking tap" value={video.name}
            onChange={e => updateVideo('name', e.target.value)} />
        </Field>
        <Field label="Upload Date *">
          <input type="date" className={inputClass} value={video.uploadDate}
            onChange={e => updateVideo('uploadDate', e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description">
            <textarea className={`${inputClass} min-h-[70px] resize-y`} placeholder="What the video covers"
              value={video.description} onChange={e => updateVideo('description', e.target.value)} />
          </Field>
        </div>
        <Field label="Thumbnail URL *">
          <input className={inputClass} placeholder="https://example.com/thumb.jpg" value={video.thumbnailUrl}
            onChange={e => updateVideo('thumbnailUrl', e.target.value)} />
        </Field>
        <Field label="Duration (ISO 8601)">
          <input className={inputClass} placeholder="PT1M33S" value={video.duration}
            onChange={e => updateVideo('duration', e.target.value)} />
        </Field>
        <Field label="Content URL">
          <input className={inputClass} placeholder="https://example.com/video.mp4" value={video.contentUrl}
            onChange={e => updateVideo('contentUrl', e.target.value)} />
        </Field>
        <Field label="Embed URL">
          <input className={inputClass} placeholder="https://example.com/embed/123" value={video.embedUrl}
            onChange={e => updateVideo('embedUrl', e.target.value)} />
        </Field>
      </div>
    );
  }

  function renderReviewForm() {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Item Reviewed Name *">
          <input className={inputClass} placeholder="Acme Boiler Service" value={review.itemName}
            onChange={e => updateReview('itemName', e.target.value)} />
        </Field>
        <Field label="Item Type">
          <select className={inputClass} value={review.itemType}
            onChange={e => updateReview('itemType', e.target.value)}>
            {REVIEW_ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Reviewer Name *">
          <input className={inputClass} placeholder="Jane Doe" value={review.authorName}
            onChange={e => updateReview('authorName', e.target.value)} />
        </Field>
        <Field label="Date Published">
          <input type="date" className={inputClass} value={review.datePublished}
            onChange={e => updateReview('datePublished', e.target.value)} />
        </Field>
        <Field label="Rating (out of 5) *">
          <input className={inputClass} placeholder="4.5" value={review.ratingValue}
            onChange={e => updateReview('ratingValue', e.target.value)} />
        </Field>
        <Field label="Best Rating">
          <input className={inputClass} placeholder="5" value={review.bestRating}
            onChange={e => updateReview('bestRating', e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Review Text">
            <textarea className={`${inputClass} min-h-[80px] resize-y`} placeholder="What the review says..."
              value={review.reviewBody} onChange={e => updateReview('reviewBody', e.target.value)} />
          </Field>
        </div>
        {(review.itemType === 'LocalBusiness' || review.itemType === 'Organization') && (
          <div className="sm:col-span-2 rounded-lg border border-amber-600/30 dark:border-yellow-500/20 bg-amber-50 dark:bg-yellow-500/5 px-4 py-3">
            <p className="text-sm text-amber-900 dark:text-yellow-400/80">
              Google does not show review snippets when a business reviews itself. Use this markup for third-party
              reviews only, not for a business rating its own products or services.
            </p>
          </div>
        )}
      </div>
    );
  }

  function renderItemListForm() {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="List Name">
            <input className={inputClass} placeholder="Best plumbers in Reading" value={itemList.name}
              onChange={e => updateItemListMeta('name', e.target.value)} />
          </Field>
          <Field label="Description">
            <input className={inputClass} placeholder="What the list ranks" value={itemList.description}
              onChange={e => updateItemListMeta('description', e.target.value)} />
          </Field>
        </div>
        {itemList.items.map((it, i) => (
          <div key={i} className="flex items-end gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-hairline dark:border-white/[0.08] bg-wash dark:bg-white/[0.04] text-xs font-semibold text-muted-foreground">
              {i + 1}
            </div>
            <div className="flex-1">
              <Field label="Name">
                <input className={inputClass} placeholder="Item name" value={it.name}
                  onChange={e => updateItemListEntry(i, 'name', e.target.value)} />
              </Field>
            </div>
            <div className="flex-1">
              <Field label="URL">
                <input className={inputClass} placeholder="https://example.com/item" value={it.url}
                  onChange={e => updateItemListEntry(i, 'url', e.target.value)} />
              </Field>
            </div>
            {itemList.items.length > 2 && (
              <button type="button" className={`text-sm pb-2.5 ${dangerText}`}
                onClick={() => setItemList(prev => ({ ...prev, items: prev.items.filter((_, idx) => idx !== i) }))}>
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" className={btnSecondary}
          onClick={() => setItemList(prev => ({ ...prev, items: [...prev.items, { name: '', url: '', imageUrl: '' }] }))}>
          + Add Item
        </button>
      </div>
    );
  }

  function renderSoftwareApplicationForm() {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="App Name *">
          <input className={inputClass} placeholder="Schema Markup Generator" value={app.name}
            onChange={e => updateApp('name', e.target.value)} />
        </Field>
        <Field label="Application Category">
          <input className={inputClass} placeholder="DeveloperApplication" value={app.applicationCategory}
            onChange={e => updateApp('applicationCategory', e.target.value)} />
        </Field>
        <Field label="Operating System">
          <input className={inputClass} placeholder="Web" value={app.operatingSystem}
            onChange={e => updateApp('operatingSystem', e.target.value)} />
        </Field>
        <Field label="URL">
          <input className={inputClass} placeholder="https://example.com/app" value={app.url}
            onChange={e => updateApp('url', e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description">
            <input className={inputClass} placeholder="What the app does" value={app.description}
              onChange={e => updateApp('description', e.target.value)} />
          </Field>
        </div>
        <Field label="Price *">
          <input className={inputClass} placeholder="0" value={app.price}
            onChange={e => updateApp('price', e.target.value)} />
        </Field>
        <Field label="Currency">
          <select className={inputClass} value={app.currency}
            onChange={e => updateApp('currency', e.target.value)}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Rating Value (real ratings only)">
          <input className={inputClass} placeholder="4.6" value={app.ratingValue}
            onChange={e => updateApp('ratingValue', e.target.value)} />
        </Field>
        <Field label="Rating Count">
          <input className={inputClass} placeholder="52" value={app.ratingCount}
            onChange={e => updateApp('ratingCount', e.target.value)} />
        </Field>
      </div>
    );
  }

  const formRenderers: Record<SchemaType, () => React.ReactNode> = {
    FAQ: renderFAQForm,
    Article: renderArticleForm,
    LocalBusiness: renderLocalBusinessForm,
    Product: renderProductForm,
    BreadcrumbList: renderBreadcrumbForm,
    HowTo: renderHowToForm,
    Organization: renderOrganizationForm,
    Person: renderPersonForm,
    Service: renderServiceForm,
    WebSite: renderWebsiteForm,
    JobPosting: renderJobPostingForm,
    Event: renderEventForm,
    VideoObject: renderVideoForm,
    Review: renderReviewForm,
    ItemList: renderItemListForm,
    SoftwareApplication: renderSoftwareApplicationForm,
  };

  function renderPreview() {
    const hasRichResult = GOOGLE_RICH_RESULT_TYPES.has(activeType);
    return (
      <div className={cardClass}>
        <h2 className="mb-1 text-lg font-semibold text-foreground">How this could appear in Google</h2>
        <div className="mb-4 flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Simplified SERP preview</p>
          {previewData.usingExample && (
            <span className="rounded-full border border-hairline-strong dark:border-white/[0.12] bg-wash dark:bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Example values
            </span>
          )}
        </div>

        <div className="rounded-xl border border-black/10 bg-white p-4 sm:p-5">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e8eaed] text-[10px] font-bold text-[#5f6368]"
            >
              {previewData.favicon}
            </span>
            <p className="min-w-0 truncate text-sm text-[#202124]">{previewData.urlLine}</p>
          </div>
          <p className="mt-1.5 truncate text-lg text-[#1a0dab]">{previewData.title}</p>
          <p className="mt-1 line-clamp-2 text-sm leading-snug text-[#4d5156]">{previewData.description}</p>

          {hasRichResult && activeType === 'Product' && (
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
              {previewData.ratingValue && (
                <span className="inline-flex items-center gap-1.5">
                  <StarRating value={previewData.ratingValue} />
                  <span className="text-[#4d5156]">{previewData.ratingValue}{previewData.ratingCount ? ` (${previewData.ratingCount})` : ''}</span>
                </span>
              )}
              {previewData.price && (
                <span className="font-medium text-[#202124]">{previewData.currency} {previewData.price}</span>
              )}
              {previewData.availability && (
                <span className={previewData.availability === 'InStock' ? 'text-xs font-medium text-[#188038]' : 'text-xs font-medium text-[#b3261e]'}>
                  {previewData.availability === 'InStock' ? 'In stock' : previewData.availability === 'PreOrder' ? 'Pre-order' : 'Out of stock'}
                </span>
              )}
            </div>
          )}

          {hasRichResult && activeType === 'Review' && previewData.ratingValue && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <StarRating value={previewData.ratingValue} best={previewData.ratingBest} />
              <span className="text-[#4d5156]">{previewData.ratingValue} / {previewData.ratingBest}</span>
              {previewData.reviewAuthor && <span className="text-xs text-[#5f6368]">Reviewed by {previewData.reviewAuthor}</span>}
            </div>
          )}

          {hasRichResult && activeType === 'Event' && (previewData.eventDate || previewData.eventLocation) && (
            <div className="mt-3 space-y-1 text-sm text-[#4d5156]">
              {previewData.eventDate && <p><span className="font-medium text-[#202124]">Date</span> · {previewData.eventDate}</p>}
              {previewData.eventLocation && <p><span className="font-medium text-[#202124]">Location</span> · {previewData.eventLocation}</p>}
            </div>
          )}

          {hasRichResult && (activeType === 'LocalBusiness' || activeType === 'Organization') && (
            <div className="mt-3 rounded-lg border border-black/10 bg-[#f8f9fa] p-3 text-sm">
              <p className="font-medium text-[#202124]">{previewData.panelName}</p>
              {previewData.panelAddress && <p className="mt-0.5 text-[#4d5156]">{previewData.panelAddress}</p>}
              {previewData.panelPhone && <p className="mt-0.5 text-[#4d5156]">{previewData.panelPhone}</p>}
              {previewData.panelHours && <p className="mt-0.5 text-[#4d5156]">{previewData.panelHours}</p>}
            </div>
          )}

          {hasRichResult && activeType === 'Article' && (previewData.articleDate || previewData.articleAuthor) && (
            <p className="mt-3 text-xs text-[#5f6368]">
              {[previewData.articleAuthor, previewData.articleDate].filter(Boolean).join(' · ')}
            </p>
          )}

          {hasRichResult && activeType === 'BreadcrumbList' && (
            <p className="mt-3 text-xs text-[#5f6368]">Google may show this trail in place of the raw URL above.</p>
          )}

          {hasRichResult && activeType === 'VideoObject' && (
            <div className="mt-3 flex items-center gap-3">
              <span aria-hidden="true" className="relative flex h-[54px] w-[96px] shrink-0 items-center justify-center rounded-md bg-[#3c4043]">
                <span className="h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-white" />
                {previewData.videoDuration && (
                  <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[10px] font-medium text-white">{previewData.videoDuration}</span>
                )}
              </span>
              <span className="text-xs text-[#5f6368]">Video result</span>
            </div>
          )}

          {hasRichResult && activeType === 'JobPosting' && (previewData.jobSalary || previewData.jobLocation) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {previewData.jobLocation && (
                <span className="rounded-full border border-black/10 bg-[#f1f3f4] px-2.5 py-1 text-xs font-medium text-[#3c4043]">{previewData.jobLocation}</span>
              )}
              {previewData.jobSalary && (
                <span className="rounded-full border border-[#188038]/40 px-2.5 py-1 text-xs font-medium text-[#188038]">{previewData.jobSalary}</span>
              )}
            </div>
          )}

          {hasRichResult && activeType === 'SoftwareApplication' && (
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
              {previewData.ratingValue && (
                <span className="inline-flex items-center gap-1.5">
                  <StarRating value={previewData.ratingValue} />
                  <span className="text-[#4d5156]">{previewData.ratingValue}{previewData.ratingCount ? ` (${previewData.ratingCount})` : ''}</span>
                </span>
              )}
              <span className="font-medium text-[#202124]">
                {Number(previewData.price) === 0 ? 'Free' : `${previewData.currency} ${previewData.price}`}
              </span>
            </div>
          )}

          {!hasRichResult && (
            <p className="mt-3 text-xs text-[#5f6368]">No special Google enhancement for this type right now.</p>
          )}
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Preview only. Google decides whether to show rich results; valid markup does not guarantee them.
        </p>

        <p className="mt-4 border-t border-hairline dark:border-white/[0.08] pt-3 text-xs leading-relaxed text-muted-foreground">
          Want schema added and validated across your whole site?{' '}
          <Link href="/contact/" className="text-brand underline underline-offset-2 hover:opacity-80">
            Request a free SEO diagnosis
          </Link>
          .
        </p>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl" style={{ fontFamily: 'var(--font-heading)' }}>
          Schema Markup Generator
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          Generate valid JSON-LD or Microdata structured data for 16 schema types. Select a schema type, fill in the fields, and copy the markup to your site. Not sure where the code goes once you have it? Read{' '}
          <Link href="/blog/how-to-add-schema-markup/" className="text-brand underline underline-offset-2 hover:opacity-80">
            how to add schema markup to your website
          </Link>{' '}
          for the exact steps on WordPress, Shopify, Wix, and custom sites.
        </p>
      </div>

      {/* Schema type tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {SCHEMA_TYPES.map(type => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setActiveType(type);
              setCopyStatus('idle');
              setActionFeedback('');
            }}
            aria-pressed={activeType === type}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              activeType === type
                ? 'bg-brand/15 text-brand-ink dark:text-brand border-brand/30'
                : 'border-hairline dark:border-white/[0.08] text-muted-foreground hover:text-foreground'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
        {/* Form panel */}
        <div className="lg:row-span-2 xl:row-span-1">
          <div className={cardClass}>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{activeType} Fields</h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Your entries for other schema types stay saved when you switch tabs.
                </p>
              </div>
              <button type="button" className={btnSecondary} onClick={loadExample}>
                Replace with {activeType} example
              </button>
            </div>
            {formRenderers[activeType]()}
          </div>
        </div>

        {/* Structured data output panel */}
        <div className={cardClass}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">Structured Data Output</h2>
            <div className="flex gap-2">
              <button type="button" onClick={() => setFormat('jsonld')}
                className={format === 'jsonld' ? toggleActive : toggleInactive}>
                JSON-LD
              </button>
              <button type="button" onClick={() => setFormat('microdata')}
                className={format === 'microdata' ? toggleActive : toggleInactive}>
                Microdata
              </button>
            </div>
          </div>

          <div className="mb-4 space-y-3" aria-label="Markup checks">
            {completenessIssues.length > 0 ? (
              <div className="rounded-lg border border-amber-600/30 dark:border-yellow-500/20 bg-amber-50 dark:bg-yellow-500/5 px-4 py-3">
                <p className="mb-1 text-sm font-medium text-amber-900 dark:text-yellow-300">
                  Template incomplete: {completenessIssues.length} {completenessIssues.length === 1 ? 'field needs' : 'fields need'} attention
                </p>
                <ul className="space-y-0.5">
                  {completenessIssues.map((issue, i) => (
                    <li key={i} className="text-sm text-amber-800 dark:text-yellow-200/80">- {issue}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-lg border border-emerald-600/30 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 px-4 py-3">
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Template fields complete</p>
                <p className="mt-1 text-xs leading-relaxed text-emerald-700 dark:text-emerald-100/70">
                  The generator&apos;s basic field checks pass. This is separate from Google eligibility and page-level validation.
                </p>
              </div>
            )}

            <div className={`rounded-lg border px-4 py-3 ${
              googleEligibility.supported
                ? 'border-brand/20 bg-brand/5'
                : 'border-hairline dark:border-white/[0.08] bg-wash dark:bg-white/[0.02]'
            }`}>
              <p className="text-sm font-medium text-foreground">
                {googleEligibility.supported ? 'Google rich-result check' : 'Schema.org validation check'}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{googleEligibility.message}</p>
            </div>
          </div>

          {/* Code block */}
          <div className="rounded-lg bg-surface-2 dark:bg-[#0d0d14] border border-hairline dark:border-white/[0.08] p-4 font-mono text-sm overflow-x-auto">
            <pre className="text-foreground/90 whitespace-pre-wrap break-words">
              <code>{outputCode}</code>
            </pre>
          </div>

          <div className="mt-4 rounded-lg border border-hairline dark:border-white/[0.08] bg-wash dark:bg-white/[0.02] px-4 py-3">
            <p className="text-sm font-medium text-foreground">Validate by copy, open and paste</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Copy the markup, open a validator, choose its code option where shown, then paste. The validators do not support a reliable prefilled-code link.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className={btnPrimary} onClick={copyToClipboard}>
              {copyStatus === 'copied' ? 'Markup copied' : copyStatus === 'error' ? 'Copy failed — try again' : 'Copy markup'}
            </button>
            <button type="button" className={btnSecondary} onClick={openRichResultsTest}>
              Open Google Rich Results Test
            </button>
            <button type="button" className={btnSecondary} onClick={openSchemaValidator}>
              Open Schema Markup Validator
            </button>
            <button type="button" className={btnSecondary} onClick={downloadJson}>
              Download JSON
            </button>
          </div>
          <p
            className={`mt-3 min-h-5 text-xs ${copyStatus === 'error' ? 'text-red-700 dark:text-red-300' : 'text-muted-foreground'}`}
            role="status"
            aria-live="polite"
          >
            {actionFeedback}
          </p>
        </div>

        {/* Rich-result preview panel */}
        {renderPreview()}
      </div>
    </div>
  );
}
