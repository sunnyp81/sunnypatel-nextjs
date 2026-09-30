import { NextRequest, NextResponse } from "next/server";

function allowed(raw: string): URL | null {
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase().replace(/\.$/, "");
    if (
      !/^https?:$/.test(url.protocol) ||
      url.username ||
      url.password ||
      !host ||
      host === "localhost" ||
      host.endsWith(".localhost") ||
      host.endsWith(".local") ||
      host.endsWith(".internal") ||
      host.endsWith(".test") ||
      /^\[.*\]$/.test(host) ||
      /^\d+(?:\.\d+){0,3}$/.test(host) ||
      !host.includes(".")
    )
      return null;
    return url;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  let raw: unknown;
  try {
    raw = (await request.json()).url;
  } catch {
    return NextResponse.json(
      { error: "Send a JSON body with a URL." },
      { status: 400 },
    );
  }
  const url =
    typeof raw === "string" && raw.length <= 2048 ? allowed(raw) : null;
  if (!url)
    return NextResponse.json(
      { error: "Enter a public http or https URL with a domain name." },
      { status: 400 },
    );
  try {
    const response = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent": "SunnyPatelTools/1.0 (+https://sunnypatel.co.uk/tools/)",
        Accept: "text/html,application/xml,text/xml,text/plain;q=0.9,*/*;q=0.5",
      },
    });
    if (response.status >= 300 && response.status < 400)
      return NextResponse.json(
        { error: "This URL redirects. Enter its final public URL." },
        { status: 400 },
      );
    if (!response.ok)
      return NextResponse.json(
        { error: `Remote server returned HTTP ${response.status}.` },
        { status: 502 },
      );
    const length = Number(response.headers.get("content-length") || 0);
    if (length > 2_000_000)
      return NextResponse.json(
        { error: "Response exceeds the 2 MB limit." },
        { status: 413 },
      );
    const reader = response.body?.getReader();
    if (!reader)
      return NextResponse.json(
        { error: "The remote response has no body." },
        { status: 502 },
      );
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 2_000_000) {
        await reader.cancel();
        return NextResponse.json(
          { error: "Response exceeds the 2 MB limit." },
          { status: 413 },
        );
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return NextResponse.json({
      url: url.href,
      text: new TextDecoder().decode(bytes),
      contentType: response.headers.get("content-type") || "",
      lastModified: response.headers.get("last-modified"),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.name === "TimeoutError"
            ? "Remote request timed out after 8 seconds."
            : "Could not fetch the remote URL.",
      },
      { status: 502 },
    );
  }
}
