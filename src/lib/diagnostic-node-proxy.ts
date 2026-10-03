// Cloudflare's node:http shim cannot pin DNS. These public diagnostics run on
// our real Node deployment; no caller can choose the upstream host or route.
const paths = new Set([
  "fetch-page", "fetch-og", "grade-website", "check-links",
  "check-redirect", "check-ssl", "ai-visibility",
].map(name => `/api/${name}`));
const origin = "https://sunnypatel-nextjs.vercel.app";

async function boundedBody(body: ReadableStream<Uint8Array> | null, limit: number, signal: AbortSignal) {
  if (!body) return new Uint8Array();
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  const cancel = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener("abort", cancel, { once: true });
  try {
    if (signal.aborted) throw new Error("Cancelled");
    while (true) {
      const { done, value } = await reader.read();
      if (signal.aborted) throw new Error("Cancelled");
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new Error("Too large"); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return bytes;
  } finally { signal.removeEventListener("abort", cancel); reader.releaseLock(); }
}

export async function proxyDiagnosticRequest(request: Request, send: typeof fetch = fetch): Promise<Response | null> {
  const path = new URL(request.url).pathname.replace(/\/$/, "");
  if (!paths.has(path)) return null;
  const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };
  const error = (message: string, status: number) => Response.json({ error: message }, { status, headers });
  if (request.method !== "POST") return error("Use POST for this diagnostic.", 405);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 35_000);
  const abort = () => controller.abort();
  request.signal.addEventListener("abort", abort, { once: true });
  if (request.signal.aborted) abort();
  try {
    let input: unknown;
    try {
      const bytes = await boundedBody(request.body, 4096, controller.signal);
      input = JSON.parse(new TextDecoder().decode(bytes));
    } catch { return error("Enter a valid diagnostic request of at most 4 KB.", 400); }
    const key = path === "/api/check-ssl" ? "domain" : "url";
    if (!input || typeof input !== "object" || !Object.hasOwn(input, key) ||
      typeof (input as Record<string, unknown>)[key] !== "string") return error(`Enter a ${key}.`, 400);
    // Forward only the public diagnostic input, never cookies/auth/client headers.
    const upstream = await send(`${origin}${path}/`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: (input as Record<string, string>)[key] }),
      redirect: "manual", signal: controller.signal,
    });
    if (upstream.status >= 300 && upstream.status < 400) {
      await upstream.body?.cancel(); return error("Diagnostic service unavailable.", 502);
    }
    if (!/^application\/json\b/i.test(upstream.headers.get("Content-Type") || "")) {
      await upstream.body?.cancel(); return error("Diagnostic service unavailable.", 502);
    }
    const bytes = await boundedBody(upstream.body, 4_000_000, controller.signal);
    return new Response(bytes, { status: upstream.status, headers });
  } catch { return error("Diagnostic service unavailable. Please try again.", 502); }
  finally { clearTimeout(timer); request.signal.removeEventListener("abort", abort); }
}
