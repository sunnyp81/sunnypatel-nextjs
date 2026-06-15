import { NextResponse } from "next/server";

const MAIL_FROM = process.env.MAIL_FROM ?? "SunnyPatel.co.uk <forms@sunnypatel.co.uk>";
const MAIL_TO = process.env.MAIL_TO ?? "2012.infinite@gmail.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
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
