import { NextResponse } from "next/server";

const MAIL_FROM = process.env.MAIL_FROM ?? "SunnyPatel.co.uk <forms@sunnypatel.co.uk>";
const MAIL_TO = process.env.MAIL_TO ?? "2012.infinite@gmail.com";
const LEAD_MAGNET_FROM = "Sunny Patel <hello@sunnypatel.co.uk>";

const HOW_HEARD_LABELS: Record<string, string> = {
  google: "Google search",
  ai_assistant: "ChatGPT, Perplexity, or another AI assistant",
  linkedin: "LinkedIn",
  referral: "Referral or word of mouth",
  directory: "A directory listing (Clutch, The Manifest, etc.)",
  existing_client: "Existing client",
  other: "Other",
};

const LEAD_MAGNETS: Record<string, { subject: string; url: string; description: string }> = {
  "seo-audit-checklist": {
    subject: "Your SEO audit checklist",
    url: "https://sunnypatel.co.uk/downloads/seo-audit-checklist.pdf",
    description: "the 47-point checklist I run against every site I audit, including the 44 in my own portfolio",
  },
};

// Basic email shape check. Not RFC-perfect, but rejects the obvious junk.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatSource(fields: {
  utm_source?: unknown;
  utm_medium?: unknown;
  utm_campaign?: unknown;
  referrer?: unknown;
  landing_page?: unknown;
}): string {
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
  const utmSource = str(fields.utm_source);
  const utmMedium = str(fields.utm_medium);
  const utmCampaign = str(fields.utm_campaign);
  const referrer = str(fields.referrer);
  const landing = str(fields.landing_page);

  let source: string;
  if (utmSource) {
    source = utmMedium ? `${utmSource} / ${utmMedium}` : utmSource;
    if (utmCampaign) source += ` (campaign: ${utmCampaign})`;
  } else if (referrer) {
    try {
      source = new URL(referrer).hostname;
    } catch {
      source = referrer;
    }
  } else {
    source = "Direct / no referrer";
  }
  return landing ? `${source} — landed on ${landing}` : source;
}

// Lightweight per-IP rate limit. Serverless memory is per-instance and resets on
// cold start, so this is a speed bump against loops, not a hard guarantee.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

async function turnstileOk(token: unknown, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // Not configured yet: skip so nothing breaks.
  if (typeof token !== "string" || !token) return false;
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
    });
    const data = (await r.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const body = await request.json();
    const {
      name,
      email,
      phone,
      message,
      company,
      turnstileToken,
      leadMagnet,
      howHeard,
      utm_source,
      utm_medium,
      utm_campaign,
      referrer,
      landing_page,
    } = body;

    // Honeypot: real users never see or fill `company`. Bots fill every field.
    if (typeof company === "string" && company.trim() !== "") {
      return NextResponse.json({ error: "Rejected." }, { status: 400 });
    }

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      name.length > 100 ||
      email.length > 150 ||
      (typeof message === "string" && message.length > 5000) ||
      !EMAIL_RE.test(email)
    ) {
      return NextResponse.json(
        { error: "Please enter a valid name and email." },
        { status: 400 }
      );
    }

    if (rateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        { status: 429 }
      );
    }

    if (!(await turnstileOk(turnstileToken, ip))) {
      return NextResponse.json(
        { error: "Verification failed. Please try again." },
        { status: 400 }
      );
    }

    const res = await fetch("https://api.emailit.com/v2/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.EMAILIT_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: MAIL_TO,
        reply_to: email,
        subject: `New enquiry from ${name}`,
        text: [
          `Name: ${name}`,
          `Email: ${email}`,
          `Phone: ${phone || "Not provided"}`,
          `How they heard about me: ${
            typeof howHeard === "string" && HOW_HEARD_LABELS[howHeard]
              ? HOW_HEARD_LABELS[howHeard]
              : "Not provided"
          }`,
          `Traffic source: ${formatSource({
            utm_source,
            utm_medium,
            utm_campaign,
            referrer,
            landing_page,
          })}`,
          ``,
          `Message:`,
          message,
        ].join("\n"),
        tags: ["contact", "sunnypatel"],
        scheduled_at: null,
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.error("EmailIt send failed:", res.status, err);
      return NextResponse.json(
        { error: "Failed to send message. Please try again." },
        { status: 502 }
      );
    }

    // Deliver the requested lead magnet straight to the lead, no manual step. Awaited
    // (not fire-and-forget) so a failure is logged, but it never fails the request:
    // the enquiry above already captured the lead regardless of this send's outcome.
    const magnet = typeof leadMagnet === "string" ? LEAD_MAGNETS[leadMagnet] : undefined;
    if (magnet) {
      try {
        const magnetRes = await fetch("https://api.emailit.com/v2/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.EMAILIT_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: LEAD_MAGNET_FROM,
            to: email,
            subject: magnet.subject,
            text: [
              `Hi ${name},`,
              ``,
              `Here's ${magnet.description}:`,
              ``,
              magnet.url,
              ``,
              `If you want a second pair of eyes on your own site, just reply to this email.`,
              ``,
              `Sunny`,
              `sunnypatel.co.uk`,
              ``,
              `--`,
              `You're receiving this because you requested it from sunnypatel.co.uk. It isn't part of a mailing list and you won't be added to one.`,
            ].join("\n"),
            tags: ["lead-magnet", "sunnypatel"],
            scheduled_at: null,
          }),
        });
        if (!magnetRes.ok) {
          const err = await magnetRes.text().catch(() => "");
          console.error("EmailIt lead-magnet send failed:", magnetRes.status, err);
        }
      } catch (err) {
        console.error("Lead-magnet email error:", err);
      }
    }

    // Fire and forget: the intake worker records the lead in Trafft CRM and posts
    // the Hermes webhook that sends the actual notification. It is never awaited
    // so a slow Trafft call, or a client disconnect, can never delay or drop lead
    // capture. The enquiry email above does not depend on this call.
    if (process.env.AAA_INTAKE_SECRET && process.env.AAA_INTAKE_ENABLED === "1") {
      fetch("https://aaa-intake.sunnypat81.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-intake-secret": process.env.AAA_INTAKE_SECRET },
        body: JSON.stringify({ brand: "SP", name, email, phone: phone || null, message }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
