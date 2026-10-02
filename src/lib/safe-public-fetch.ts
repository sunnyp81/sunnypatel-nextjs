// Node runtime only. Never use global fetch for URLs supplied by tool users.
import { lookup } from "node:dns/promises";
import { request as httpRequest, type RequestOptions } from "node:http";
import { request as httpsRequest } from "node:https";
import { isIP } from "node:net";

type Address = { address: string; family: number };
type Dependencies = {
  resolve: (hostname: string) => Promise<Address[]>;
  httpRequest: typeof httpRequest;
  httpsRequest: typeof httpsRequest;
};
export interface PublicFetchOptions {
  method?: "GET" | "HEAD";
  headers?: Record<string, string>;
  redirect?: "follow" | "manual";
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
  signal?: AbortSignal;
  headersOnly?: boolean;
}

export class PublicFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PublicFetchError";
  }
}

function v6Number(address: string): bigint | null {
  if (address.includes(".") || address.includes("%")) return null;
  const sides = address.toLowerCase().split("::");
  if (sides.length > 2) return null;
  const left = sides[0] ? sides[0].split(":") : [];
  const right = sides.length === 2 && sides[1] ? sides[1].split(":") : [];
  const fill = 8 - left.length - right.length;
  if (fill < 0 || (sides.length === 1 && fill !== 0)) return null;
  const groups = [...left, ...Array(fill).fill("0"), ...right];
  if (groups.some((g) => !/^[0-9a-f]{1,4}$/.test(g))) return null;
  return groups.reduce((n, g) => (n << BigInt(16)) | BigInt(parseInt(g, 16)), BigInt(0));
}

// Conservative public-unicast allow policy. Documentation, benchmark,
// translation/tunnel and special-use ranges fail closed as well as private IPs.
export function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) {
    const [a, b, c] = address.split(".").map(Number);
    return !(a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
      (a === 192 && b === 0 && (c === 0 || c === 2)) ||
      (a === 192 && b === 88 && c === 99) ||
      (a === 198 && (b === 18 || b === 19)) ||
      (a === 198 && b === 51 && c === 100) || (a === 203 && b === 0 && c === 113));
  }
  if (family !== 6) return false;
  const n = v6Number(address);
  if (n === null || n >> BigInt(125) !== BigInt(1)) return false; // 2000::/3 only
  const prefix = (value: string, bits: number) => n >> BigInt(128 - bits) === v6Number(value)! >> BigInt(128 - bits);
  return !prefix("2001::", 23) && !prefix("2001:db8::", 32) &&
    !prefix("2002::", 16) && !prefix("3fff::", 20);
}

export function parsePublicUrl(raw: string | URL): URL {
  const value = String(raw);
  if (value.length > 2048 || /[\u0000-\u0020\u007f]/.test(value)) {
    throw new PublicFetchError("Enter a valid public HTTP or HTTPS URL.");
  }
  let url: URL;
  try { url = new URL(value); } catch { throw new PublicFetchError("Enter a valid public HTTP or HTTPS URL."); }
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!/^https?:$/.test(url.protocol) || url.username || url.password || url.port ||
    !host || !host.includes(".") || isIP(host.replace(/^\[|\]$/g, "")) ||
    ["localhost", "local", "internal", "test", "invalid", "example", "home", "lan", "onion"].some((suffix) => host === suffix || host.endsWith(`.${suffix}`))) {
    throw new PublicFetchError("Enter a public HTTP or HTTPS URL with a domain name and standard port.");
  }
  url.hostname = host;
  url.hash = "";
  return url;
}

// Dependency seam is for offline tests. The exported production fetcher below
// always uses OS DNS and Node TLS with certificate verification enabled.
export function createPublicFetcher(dependencies: Dependencies) {
  return async function publicFetch(raw: string | URL, options: PublicFetchOptions = {}): Promise<Response> {
    let url = parsePublicUrl(raw);
    const timeoutMs = Math.min(15_000, Math.max(1, options.timeoutMs ?? 10_000));
    const maxBytes = Math.min(2_000_000, Math.max(1, options.maxBytes ?? 2_000_000));
    const maxRedirects = Math.min(10, Math.max(0, options.maxRedirects ?? 5));
    const controller = new AbortController();
    const timeoutError = new PublicFetchError("Remote request timed out.");
    const timer = setTimeout(() => controller.abort(timeoutError), timeoutMs);
    const abort = () => controller.abort(new PublicFetchError("Remote request cancelled."));
    options.signal?.addEventListener("abort", abort, { once: true });
    if (options.signal?.aborted) abort();
    const signal = controller.signal;
    async function resolvePublic(target: URL): Promise<Address> {
      if (signal.aborted) throw signal.reason;
      const addresses = await new Promise<Address[]>((resolve, reject) => {
        const cancel = () => reject(signal.reason);
        signal.addEventListener("abort", cancel, { once: true });
        dependencies.resolve(target.hostname).then(resolve, () => reject(new PublicFetchError("Could not resolve the public domain.")))
          .finally(() => signal.removeEventListener("abort", cancel));
      });
      if (!addresses.length || addresses.some((item) => !isPublicAddress(item.address) || isIP(item.address) !== item.family)) {
        throw new PublicFetchError("The domain must resolve only to public addresses.");
      }
      return addresses[0];
    }
    async function requestOne(target: URL, address: Address): Promise<Response> {
      if (signal.aborted) throw signal.reason;
      return new Promise<Response>((resolve, reject) => {
        // No shared agent/proxy or second DNS lookup: the validated address is
        // pinned for this connection, while Host and TLS SNI remain the domain.
        const requestOptions: RequestOptions & { autoSelectFamily: boolean } = {
          method: options.method ?? "GET", agent: false, family: address.family,
          autoSelectFamily: false, maxHeaderSize: 16_384,
          headers: { ...options.headers, "Accept-Encoding": "identity" }, signal,
          lookup: (_hostname, _opts, callback) => callback(null, address.address, address.family),
        };
        const request = (target.protocol === "https:" ? dependencies.httpsRequest : dependencies.httpRequest)(target, requestOptions, (incoming) => {
          const fail = (message: string) => {
            incoming.destroy(); request.destroy();
            reject(new PublicFetchError(message));
          };
          try {
            const status = incoming.statusCode;
            if (typeof status !== "number" || !Number.isInteger(status) || status < 200 || status > 599) {
              fail("Remote server returned an unsupported HTTP status.");
              return;
            }
            const headers = new Headers();
            for (const [key, value] of Object.entries(incoming.headers)) {
              if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
            }
            const noBody = options.headersOnly || options.method === "HEAD" || [204, 205, 304].includes(status) || [301, 302, 303, 307, 308].includes(status);
            const length = Number(headers.get("content-length") ?? 0);
            const encoding = headers.get("content-encoding");
            if (!noBody && (length > maxBytes || (encoding && encoding.toLowerCase() !== "identity"))) {
              incoming.destroy(); request.destroy();
              reject(new PublicFetchError(length > maxBytes ? "Response exceeds the 2 MB limit." : "Remote server returned an unsupported compressed response."));
              return;
            }
            if (noBody) {
              incoming.destroy();
              const result = new Response(null, { status, headers });
              Object.defineProperty(result, "url", { value: target.href });
              resolve(result);
              return;
            }
            const chunks: Buffer[] = []; let size = 0;
            incoming.on("data", (chunk: Buffer) => {
              size += chunk.length;
              if (size > maxBytes) {
                incoming.destroy(); request.destroy();
                reject(new PublicFetchError("Response exceeds the 2 MB limit."));
              } else chunks.push(chunk);
            });
            incoming.on("error", () => reject(new PublicFetchError("Remote response was interrupted.")));
            incoming.on("aborted", () => reject(new PublicFetchError("Remote response was interrupted.")));
            incoming.on("end", () => {
              try {
                const result = new Response(new Uint8Array(Buffer.concat(chunks)), { status, headers });
                Object.defineProperty(result, "url", { value: target.href });
                resolve(result);
              } catch {
                fail("Could not read the remote response.");
              }
            });
          } catch {
            fail("Remote server returned an invalid response.");
          }
        });
        request.on("error", () => reject(signal.aborted ? signal.reason : new PublicFetchError("Could not connect to the public URL.")));
        request.end();
      });
    }
    try {
      const visited = new Set<string>();
      for (let hop = 0; ; hop++) {
        if (visited.has(url.href)) throw new PublicFetchError("Redirect loop detected.");
        visited.add(url.href);
        const response = await requestOne(url, await resolvePublic(url));
        const location = response.headers.get("location");
        if (![301, 302, 303, 307, 308].includes(response.status) || !location) return response;
        const next = parsePublicUrl(new URL(location, url));
        // Even manual redirects must not expose an unchecked target to callers.
        await resolvePublic(next);
        if (options.redirect === "manual") return response;
        if (hop >= maxRedirects) throw new PublicFetchError("Too many redirects.");
        url = next;
      }
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", abort);
    }
  };
}

export const safePublicFetch = createPublicFetcher({
  resolve: (hostname) => lookup(hostname, { all: true, verbatim: true }),
  httpRequest, httpsRequest,
});
