'use client';

import { useState, useCallback, useMemo, useId, isValidElement, cloneElement } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────

type SchemaType =
  | 'FAQ' | 'Article' | 'LocalBusiness' | 'Product' | 'BreadcrumbList' | 'HowTo'
  | 'Organization' | 'Person' | 'Service' | 'WebSite' | 'JobPosting' | 'Event'
  | 'VideoObject' | 'Review' | 'ItemList' | 'SoftwareApplication';

type OutputFormat = 'jsonld' | 'microdata';

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

// ── Style constants ────────────────────────────────────────────────────────────

const inputClass =
  'w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand/50 focus:outline-none focus:ring-1 focus:ring-brand/30';
const labelClass = 'block text-sm font-medium text-foreground mb-1.5';
const cardClass = 'rounded-xl border border-white/[0.06] bg-white/[0.02] p-6';
const btnPrimary =
  'rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(91,138,239,0.35)] hover:bg-[#4a7be0] transition-colors';
const btnSecondary =
  'rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-foreground hover:bg-white/[0.08] transition-colors';
const dangerText = 'text-red-400 hover:text-red-300 transition-colors';
const toggleActive = 'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors bg-brand/15 text-brand border-brand/30';
const toggleInactive = 'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors border-white/[0.08] text-muted-foreground hover:text-foreground';

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

// ── Component ──────────────────────────────────────────────────────────────────

export default function SchemaGenerator({ initialType }: { initialType?: SchemaType } = {}) {
  const [activeType, setActiveType] = useState<SchemaType>(initialType ?? 'FAQ');
  const [format, setFormat] = useState<OutputFormat>('jsonld');
  const [copied, setCopied] = useState(false);

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

  const warnings = useMemo<string[]>(() => {
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
        if (!app.ratingValue && !app.ratingCount) w.push('Add a real rating to be eligible for the software app rich result');
        break;
    }
    return w;
  }, [activeType, faqPairs, article, business, product, breadcrumbs, howTo, organization, person, service, website, job, event, video, review, itemList, app]);

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

  const scriptTag = useMemo(() => {
    return `<script type="application/ld+json">\n${schemaJson}\n</script>`;
  }, [schemaJson]);

  const microdataHtml = useMemo(() => jsonLdToMicrodata(schemaObj), [schemaObj]);

  const outputCode = format === 'jsonld' ? scriptTag : microdataHtml;

  // ── Actions ──────────────────────────────────────────────────────────────────

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(outputCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = outputCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [outputCode]);

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
  }, [schemaJson, activeType]);

  const openRichResultsTest = useCallback(() => {
    const url = `https://search.google.com/test/rich-results?code=${encodeURIComponent(scriptTag)}`;
    window.open(url, '_blank', 'noopener');
  }, [scriptTag]);

  const openSchemaValidator = useCallback(() => {
    window.open('https://validator.schema.org/', '_blank', 'noopener');
  }, []);

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
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-xs font-semibold text-muted-foreground">
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
          <div className="sm:col-span-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-3">
            <p className="text-sm text-yellow-400/80">
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
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-xs font-semibold text-muted-foreground">
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
          <a href="/blog/how-to-add-schema-markup/" className="text-brand underline underline-offset-2 hover:opacity-80">
            how to add schema markup to your website
          </a>{' '}
          for the exact steps on WordPress, Shopify, Wix, and custom sites.
        </p>
      </div>

      {/* Schema type tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {SCHEMA_TYPES.map(type => (
          <button
            key={type}
            type="button"
            onClick={() => setActiveType(type)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              activeType === type
                ? 'bg-brand/15 text-brand border-brand/30'
                : 'border-white/[0.08] text-muted-foreground hover:text-foreground'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form panel */}
        <div>
          <div className={cardClass}>
            <h2 className="mb-4 text-lg font-semibold text-foreground">{activeType} Fields</h2>
            {formRenderers[activeType]()}
          </div>
        </div>

        {/* Preview panel */}
        <div className="space-y-4">
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

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-3">
                <p className="mb-1 text-sm font-medium text-yellow-400">Missing required fields:</p>
                <ul className="space-y-0.5">
                  {warnings.map((w, i) => (
                    <li key={i} className="text-sm text-yellow-400/80">- {w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Code block */}
            <div className="rounded-lg bg-[#0d0d14] border border-white/[0.08] p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground/90 whitespace-pre-wrap break-words">
                <code>{outputCode}</code>
              </pre>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className={btnSecondary} onClick={openRichResultsTest}>
                Test in Google Rich Results
              </button>
              <button type="button" className={btnSecondary} onClick={openSchemaValidator}>
                Validate in Schema Markup Validator
              </button>
              <button type="button" className={btnSecondary} onClick={downloadJson}>
                Download .json
              </button>
              <button type="button" className={btnPrimary} onClick={copyToClipboard}>
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
