'use client';

import { useState, useCallback, useMemo } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────

type SchemaType = 'FAQ' | 'Article' | 'LocalBusiness' | 'Product' | 'BreadcrumbList' | 'HowTo';

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

// ── Constants ──────────────────────────────────────────────────────────────────

const SCHEMA_TYPES: SchemaType[] = ['FAQ', 'Article', 'LocalBusiness', 'Product', 'BreadcrumbList', 'HowTo'];

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

// ── Style constants ────────────────────────────────────────────────────────────

const inputClass =
  'w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30';
const labelClass = 'block text-sm font-medium text-foreground mb-1.5';
const cardClass = 'rounded-xl border border-white/[0.06] bg-white/[0.02] p-6';
const btnPrimary =
  'rounded-lg bg-[#5B8AEF] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(91,138,239,0.35)] hover:bg-[#4a7be0] transition-colors';
const btnSecondary =
  'rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-foreground hover:bg-white/[0.08] transition-colors';
const dangerText = 'text-red-400 hover:text-red-300 transition-colors';

// ── Helpers ────────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function SchemaGenerator() {
  const [activeType, setActiveType] = useState<SchemaType>('FAQ');
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
    }
    return w;
  }, [activeType, faqPairs, article, business, product, breadcrumbs, howTo]);

  // ── Schema generation ────────────────────────────────────────────────────────

  const schemaJson = useMemo<string>(() => {
    let obj: Record<string, unknown> = {};

    switch (activeType) {
      case 'FAQ': {
        const items = faqPairs.filter(p => p.question || p.answer);
        obj = {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: items.map(p => ({
            '@type': 'Question',
            name: p.question,
            acceptedAnswer: { '@type': 'Answer', text: p.answer },
          })),
        };
        break;
      }
      case 'Article': {
        obj = {
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
        break;
      }
      case 'LocalBusiness': {
        obj = {
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
        break;
      }
      case 'Product': {
        obj = {
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
        break;
      }
      case 'BreadcrumbList': {
        const items = breadcrumbs.filter(b => b.name || b.url);
        obj = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((b, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: b.name,
            item: b.url,
          })),
        };
        break;
      }
      case 'HowTo': {
        const steps = howTo.steps.filter(s => s.name || s.text);
        obj = {
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
        break;
      }
    }

    return JSON.stringify(obj, null, 2);
  }, [activeType, faqPairs, article, business, product, breadcrumbs, howTo]);

  const scriptTag = useMemo(() => {
    return `<script type="application/ld+json">\n${schemaJson}\n</script>`;
  }, [schemaJson]);

  // ── Actions ──────────────────────────────────────────────────────────────────

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(scriptTag);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = scriptTag;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [scriptTag]);

  const openRichResultsTest = useCallback(() => {
    const url = `https://search.google.com/test/rich-results?code=${encodeURIComponent(scriptTag)}`;
    window.open(url, '_blank', 'noopener');
  }, [scriptTag]);

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

  const formRenderers: Record<SchemaType, () => React.ReactNode> = {
    FAQ: renderFAQForm,
    Article: renderArticleForm,
    LocalBusiness: renderLocalBusinessForm,
    Product: renderProductForm,
    BreadcrumbList: renderBreadcrumbForm,
    HowTo: renderHowToForm,
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
          Generate valid JSON-LD structured data for Google rich results. Select a schema type, fill in the fields, and copy the markup to your site.
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
                ? 'bg-[#5B8AEF]/15 text-[#5B8AEF] border-[#5B8AEF]/30'
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
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">JSON-LD Output</h2>
              <div className="flex gap-2">
                <button type="button" className={btnSecondary} onClick={openRichResultsTest}>
                  Test in Google
                </button>
                <button type="button" className={btnPrimary} onClick={copyToClipboard}>
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
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
                <code>{scriptTag}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
