import { NextRequest, NextResponse } from "next/server";
import { safePublicFetch } from "@/lib/safe-public-fetch";

export const runtime = "nodejs";

interface SslResult {
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

interface CtIssuance {
  dns_names: string[];
  issuer: { friendly_name?: string; name: string };
  not_before: string;
  not_after: string;
  cert_sha256: string;
  revoked?: boolean;
}

const EMPTY: Omit<SslResult, "error"> = {
  valid: false,
  subject: { CN: "" },
  issuer: { O: "", CN: "" },
  validFrom: "",
  validTo: "",
  daysUntilExpiry: 0,
  serialNumber: "",
  signatureAlgorithm: "",
  subjectAltNames: [],
  chainValid: false,
};

function dnField(dn: string, key: string): string {
  const m = dn.match(new RegExp(`(?:^|,\\s*)${key}=("[^"]*"|[^,]*)`));
  return m ? m[1].replace(/^"|"$/g, "").trim() : "";
}

function coversDomain(entry: CtIssuance, domain: string): boolean {
  return entry.dns_names.some((n) => {
    const name = n.trim().toLowerCase();
    if (name === domain) return true;
    return name.startsWith("*.") && domain.endsWith(name.slice(1)) && domain.split(".").length === name.split(".").length;
  });
}

// Certificate details come from transparency logs; trust is checked with
// a verified HTTPS handshake through the public-only Node transport.
async function checkSsl(domain: string): Promise<SslResult> {
  let chainValid = false;
  let handshakeError = "";
  try {
    await safePublicFetch(`https://${domain}/`, {
      method: "HEAD",
      redirect: "manual",
      timeoutMs: 5000,
    });
    chainValid = true;
  } catch (err) {
    handshakeError = err instanceof Error ? err.message : String(err);
  }

  let entries: CtIssuance[] = [];
  try {
    const res = await safePublicFetch(
      `https://api.certspotter.com/v1/issuances?domain=${encodeURIComponent(domain)}&expand=dns_names&expand=issuer&expand=revocation`,
      { timeoutMs: 8000 }
    );
    if (res.ok) entries = (await res.json()) as CtIssuance[];
  } catch {}

  const now = Date.now();
  const cert = entries
    .filter((e) => coversDomain(e, domain) && Date.parse(e.not_before) <= now)
    .sort((a, b) => Date.parse(b.not_before) - Date.parse(a.not_before))[0];

  if (!cert) {
    return {
      ...EMPTY,
      chainValid,
      error: !chainValid
        ? `Could not establish a trusted HTTPS connection to ${domain}${handshakeError ? ` (${handshakeError})` : ""}`
        : "Certificate details unavailable from certificate transparency logs, try again shortly",
    };
  }

  const validFrom = new Date(cert.not_before);
  const validTo = new Date(cert.not_after);
  const daysUntilExpiry = Math.floor((validTo.getTime() - now) / (1000 * 60 * 60 * 24));
  const isExpired = validTo.getTime() < now;
  const subjectAltNames = Array.from(new Set(cert.dns_names));

  return {
    valid: chainValid && !isExpired,
    subject: { CN: subjectAltNames.includes(domain) ? domain : subjectAltNames[0] || "" },
    issuer: { O: dnField(cert.issuer.name, "O") || cert.issuer.friendly_name || "", CN: dnField(cert.issuer.name, "CN") },
    validFrom: validFrom.toUTCString(),
    validTo: validTo.toUTCString(),
    daysUntilExpiry,
    serialNumber: "",
    signatureAlgorithm: "Unknown",
    subjectAltNames,
    chainValid,
    ...(chainValid ? {} : { error: `HTTPS handshake failed: ${handshakeError || "untrusted or invalid certificate"}` }),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { domain } = body;

    if (!domain || typeof domain !== "string") {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

    // Strip protocol, path, port — just keep the hostname
    let cleanDomain = domain.trim();
    try {
      if (cleanDomain.includes("://")) {
        cleanDomain = new URL(cleanDomain).hostname;
      } else if (cleanDomain.includes("/")) {
        cleanDomain = cleanDomain.split("/")[0];
      }
    } catch {
      // If URL parsing fails, try using it as-is
    }

    // Remove port if present
    cleanDomain = cleanDomain.split(":")[0];

    // Basic domain validation
    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanDomain)) {
      return NextResponse.json(
        { error: "Invalid domain format" },
        { status: 400 }
      );
    }

    const result = await checkSsl(cleanDomain);

    return NextResponse.json({ domain: cleanDomain, ...result });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
