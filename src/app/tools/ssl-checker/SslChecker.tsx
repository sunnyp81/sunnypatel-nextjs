'use client';

import { useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface SslResult {
  domain: string;
  valid: boolean;
  subject: { CN: string };
  issuer: { O: string; CN: string };
  validFrom: string;
  validTo: string;
  daysUntilExpiry: number;
  serialNumber: string;
  signatureAlgorithm: string;
  subjectAltNames: string[];
  chainValid: boolean;
  error?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function stripProtocol(input: string): string {
  let cleaned = input.trim();
  cleaned = cleaned.replace(/^https?:\/\//i, '');
  cleaned = cleaned.replace(/\/.*$/, '');
  cleaned = cleaned.split(':')[0];
  return cleaned;
}

function isStrongAlgorithm(alg: string): boolean {
  if (!alg) return false;
  const lower = alg.toLowerCase();
  return (
    lower.includes('sha256') ||
    lower.includes('sha384') ||
    lower.includes('sha512') ||
    lower.includes('sha-256') ||
    lower.includes('sha-384') ||
    lower.includes('sha-512') ||
    lower.includes('ecdsa')
  );
}

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */
function CheckCircle() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-emerald-400 shrink-0">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XCircle() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-red-400 shrink-0">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ShieldCheck() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
      <path d="M12 2l7 4v5c0 5.25-3.5 8.25-7 10-3.5-1.75-7-4.75-7-10V6l7-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldX() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-red-400">
      <path d="M12 2l7 4v5c0 5.25-3.5 8.25-7 10-3.5-1.75-7-4.75-7-10V6l7-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14.5 9.5l-5 5M9.5 9.5l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ShieldWarning() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-amber-400">
      <path d="M12 2l7 4v5c0 5.25-3.5 8.25-7 10-3.5-1.75-7-4.75-7-10V6l7-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#5B8AEF]">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Spinner                                                            */
/* ------------------------------------------------------------------ */
function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin text-[#5B8AEF]" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Status Banner                                                      */
/* ------------------------------------------------------------------ */
function StatusBanner({ result }: { result: SslResult }) {
  if (result.error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 mb-6">
        <div className="flex items-center gap-4">
          <ShieldX />
          <div>
            <h2 className="text-lg font-bold text-red-400">SSL Check Failed</h2>
            <p className="text-sm text-red-400/80 mt-1">{result.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const isExpiringSoon = result.valid && result.daysUntilExpiry <= 30;
  const isExpired = !result.valid;

  if (isExpired) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 mb-6">
        <div className="flex items-center gap-4">
          <ShieldX />
          <div>
            <h2 className="text-lg font-bold text-red-400">SSL Invalid or Expired</h2>
            <p className="text-sm text-red-400/80 mt-1">
              The SSL certificate for {result.domain} is not valid. Visitors will see a browser warning.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isExpiringSoon) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 mb-6">
        <div className="flex items-center gap-4">
          <ShieldWarning />
          <div>
            <h2 className="text-lg font-bold text-amber-400">SSL Expiring Soon</h2>
            <p className="text-sm text-amber-400/80 mt-1">
              The certificate for {result.domain} expires in {result.daysUntilExpiry} day{result.daysUntilExpiry !== 1 ? 's' : ''}. Renew it now to avoid downtime.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 mb-6">
      <div className="flex items-center gap-4">
        <ShieldCheck />
        <div>
          <h2 className="text-lg font-bold text-emerald-400">SSL Valid</h2>
          <p className="text-sm text-emerald-400/80 mt-1">
            The certificate for {result.domain} is valid and expires in {result.daysUntilExpiry} day{result.daysUntilExpiry !== 1 ? 's' : ''}.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Expiry Bar                                                         */
/* ------------------------------------------------------------------ */
function ExpiryBar({ days }: { days: number }) {
  const maxDays = 365;
  const pct = Math.min(100, Math.max(0, (days / maxDays) * 100));

  let barColor = 'bg-emerald-500';
  if (days <= 30) barColor = 'bg-red-500';
  else if (days <= 60) barColor = 'bg-amber-500';

  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>{days} day{days !== 1 ? 's' : ''} remaining</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/[0.06]">
        <div
          className={`h-2 rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Certificate Details Card                                           */
/* ------------------------------------------------------------------ */
function CertificateDetails({ result }: { result: SslResult }) {
  const [serialExpanded, setSerialExpanded] = useState(false);

  const issuerDisplay = result.issuer.O
    ? `${result.issuer.O} (${result.issuer.CN})`
    : result.issuer.CN || 'Unknown';

  const serialDisplay = serialExpanded
    ? result.serialNumber
    : result.serialNumber.length > 20
      ? result.serialNumber.slice(0, 20) + '...'
      : result.serialNumber;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 mb-6">
      <h3
        className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        <LockIcon />
        Certificate Details
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Domain (Common Name)
          </label>
          <p className="text-sm text-foreground mt-1 font-mono">{result.subject.CN || result.domain}</p>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Issuer
          </label>
          <p className="text-sm text-foreground mt-1">{issuerDisplay}</p>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Valid From
          </label>
          <p className="text-sm text-foreground mt-1">{formatDate(result.validFrom)}</p>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Valid To
          </label>
          <p className="text-sm text-foreground mt-1">{formatDate(result.validTo)}</p>
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Days Until Expiry
          </label>
          <ExpiryBar days={result.daysUntilExpiry} />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Signature Algorithm
          </label>
          <p className="text-sm text-foreground mt-1 font-mono">{result.signatureAlgorithm || 'Unknown'}</p>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Serial Number
          </label>
          <p className="text-sm text-foreground mt-1 font-mono">
            {serialDisplay}
            {result.serialNumber.length > 20 && (
              <button
                type="button"
                onClick={() => setSerialExpanded(!serialExpanded)}
                className="ml-2 text-xs text-[#5B8AEF] hover:underline"
              >
                {serialExpanded ? 'collapse' : 'expand'}
              </button>
            )}
          </p>
        </div>
      </div>

      {result.subjectAltNames.length > 0 && (
        <div className="mt-4">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Subject Alternative Names ({result.subjectAltNames.length})
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {result.subjectAltNames.map((san) => (
              <span
                key={san}
                className="inline-flex rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs font-mono text-foreground/80"
              >
                {san}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Security Checklist                                                 */
/* ------------------------------------------------------------------ */
function SecurityChecklist({ result }: { result: SslResult }) {
  const checks = [
    {
      label: 'HTTPS connection',
      passed: !result.error,
    },
    {
      label: 'Certificate not expired',
      passed: result.valid || (result.daysUntilExpiry > 0 && !result.error),
    },
    {
      label: 'Certificate matches domain',
      passed: result.chainValid || result.valid,
    },
    {
      label: 'Strong signature algorithm (SHA-256 or better)',
      passed: isStrongAlgorithm(result.signatureAlgorithm),
    },
    {
      label: 'Certificate expiry > 30 days',
      passed: result.daysUntilExpiry > 30,
    },
  ];

  const passedCount = checks.filter((c) => c.passed).length;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-lg font-bold text-foreground"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Security Checklist
        </h3>
        <span className="text-sm text-muted-foreground">
          {passedCount}/{checks.length} passed
        </span>
      </div>
      <div className="space-y-3">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-3">
            {check.passed ? <CheckCircle /> : <XCircle />}
            <span className={`text-sm ${check.passed ? 'text-foreground' : 'text-foreground/60'}`}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function SslChecker() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SslResult | null>(null);
  const [error, setError] = useState('');

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = stripProtocol(domain);
    if (!cleaned) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/check-ssl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: cleaned }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || `API error ${res.status}`);
        return;
      }

      setResult(data);
    } catch {
      setError('Failed to connect to the SSL checker. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          SSL Certificate Checker
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Verify your SSL certificate status, expiry date, issuer, and chain validity. HTTPS is a confirmed Google ranking signal.
        </p>
      </div>

      {/* Input form */}
      <form onSubmit={handleCheck} className="mb-8">
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          Domain
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">
              https://
            </span>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] pl-[4.5rem] pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#5B8AEF]/50 focus:outline-none focus:ring-1 focus:ring-[#5B8AEF]/30"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !domain.trim()}
            className="rounded-lg bg-[#5B8AEF] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(91,138,239,0.35)] transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Checking...
              </span>
            ) : (
              'Check SSL'
            )}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
          <Spinner />
          Connecting to {stripProtocol(domain)} on port 443...
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div>
          <StatusBanner result={result} />

          {!result.error && (
            <>
              <CertificateDetails result={result} />
              <SecurityChecklist result={result} />
            </>
          )}
        </div>
      )}

      {/* SEO Impact Section */}
      <div className="mt-16">
        <h2
          className="text-xl font-bold tracking-tight text-foreground mb-4"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Why SSL Matters for SEO
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">Google Ranking Signal</h3>
            <p className="text-sm text-muted-foreground">
              HTTPS has been a confirmed Google ranking signal since August 2014.
              Sites with valid SSL certificates receive a small but measurable boost
              in search rankings over their HTTP equivalents.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">Browser Trust Signals</h3>
            <p className="text-sm text-muted-foreground">
              Chrome, Firefox, and Edge all display &ldquo;Not Secure&rdquo; warnings for HTTP sites.
              This degrades user trust and directly hurts click-through rates. Visitors are
              far less likely to submit forms or make purchases on insecure pages.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">Expired Certificate Impact</h3>
            <p className="text-sm text-muted-foreground">
              An expired SSL certificate triggers a full-page browser warning that most users
              will not bypass. This effectively takes your site offline. Google will also
              stop ranking pages it cannot safely crawl.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h3 className="text-sm font-semibold text-foreground mb-2">SSL Best Practices</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground/80">Use auto-renewing certificates</strong> &mdash; Services
              like Let&apos;s Encrypt and Cloudflare offer free auto-renewing certificates that eliminate manual renewal.
            </li>
            <li>
              <strong className="text-foreground/80">Monitor expiry dates</strong> &mdash; Set up alerts for at
              least 30 days before expiry. Most hosting providers and DNS services include this.
            </li>
            <li>
              <strong className="text-foreground/80">Redirect HTTP to HTTPS</strong> &mdash; Ensure all HTTP
              requests 301 redirect to HTTPS to consolidate link equity and avoid duplicate content.
            </li>
            <li>
              <strong className="text-foreground/80">Use strong algorithms</strong> &mdash; SHA-256 is the
              current minimum standard. SHA-1 certificates are rejected by modern browsers.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
