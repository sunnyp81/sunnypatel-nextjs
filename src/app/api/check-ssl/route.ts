import { NextRequest, NextResponse } from "next/server";
import * as tls from "tls";

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

function checkSsl(domain: string): Promise<SslResult> {
  return new Promise((resolve) => {
    const timeout = 5000;
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        try {
          socket.destroy();
        } catch {}
        resolve({
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
          error: `Connection timed out after ${timeout / 1000}s`,
        });
      }
    }, timeout);

    const socket = tls.connect(
      {
        host: domain,
        port: 443,
        servername: domain,
        rejectUnauthorized: false,
        timeout,
      },
      () => {
        if (settled) return;

        const cert = socket.getPeerCertificate(true);
        const authorized = socket.authorized;

        if (!cert || !cert.subject) {
          settled = true;
          clearTimeout(timer);
          socket.destroy();
          resolve({
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
            error: "No certificate returned by server",
          });
          return;
        }

        const validFrom = cert.valid_from;
        const validTo = cert.valid_to;
        const now = new Date();
        const expiryDate = new Date(validTo);
        const startDate = new Date(validFrom);
        const daysUntilExpiry = Math.floor(
          (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        const isExpired = expiryDate < now || startDate > now;

        // Parse SAN
        let subjectAltNames: string[] = [];
        if (cert.subjectaltname) {
          subjectAltNames = cert.subjectaltname
            .split(", ")
            .map((s: string) => s.replace(/^DNS:/, ""));
        }

        // Determine signature algorithm from raw cert info
        // Node.js doesn't directly expose this, but we can get it from the cert object
        const sigAlg =
          (cert as unknown as Record<string, unknown>).sigalg as string ||
          (cert as unknown as Record<string, unknown>).signatureAlgorithm as string ||
          "Unknown";

        settled = true;
        clearTimeout(timer);
        socket.destroy();

        resolve({
          valid: authorized && !isExpired,
          subject: {
            CN: cert.subject?.CN || "",
          },
          issuer: {
            O: cert.issuer?.O || "",
            CN: cert.issuer?.CN || "",
          },
          validFrom: validFrom,
          validTo: validTo,
          daysUntilExpiry,
          serialNumber: cert.serialNumber || "",
          signatureAlgorithm: sigAlg,
          subjectAltNames,
          chainValid: authorized,
        });
      }
    );

    socket.on("error", (err: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);

      let errorMsg = err.message;
      if (err.message.includes("ENOTFOUND")) {
        errorMsg = `DNS lookup failed: ${domain} does not resolve`;
      } else if (err.message.includes("ECONNREFUSED")) {
        errorMsg = `Connection refused: ${domain} is not accepting connections on port 443`;
      } else if (err.message.includes("ECONNRESET")) {
        errorMsg = `Connection reset by ${domain}`;
      } else if (err.message.includes("ETIMEDOUT")) {
        errorMsg = `Connection timed out for ${domain}`;
      }

      resolve({
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
        error: errorMsg,
      });
    });

    socket.on("timeout", () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.destroy();

      resolve({
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
        error: `Connection timed out for ${domain}`,
      });
    });
  });
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
