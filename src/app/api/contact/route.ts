import { NextResponse } from "next/server";

const MAIL_FROM = process.env.MAIL_FROM ?? "SunnyPatel.co.uk <forms@sunnypatel.co.uk>";
const MAIL_TO = process.env.MAIL_TO ?? "2012.infinite@gmail.com";

// Basic email shape check. Not RFC-perfect, but rejects the obvious junk.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    const { name, email, phone, message, company, turnstileToken } = body;

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

    if (process.env.AAA_INTAKE_SECRET) {
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
