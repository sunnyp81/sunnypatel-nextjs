// Clears Cloudflare's edge cache for sunnypatel.co.uk after a Vercel production deploy.
// Token needs Zone > Cache Purge on the sunnypatel.co.uk zone: set CF_PURGE_TOKEN or CF_PURGE_TOKEN_FILE.
import { readFileSync } from "node:fs";

const ZONE_ID = "65d9bfc130d9f8d39f137f2d983b953a";
const token = (process.env.CF_PURGE_TOKEN || (process.env.CF_PURGE_TOKEN_FILE && readFileSync(process.env.CF_PURGE_TOKEN_FILE, "utf8")) || "").trim();

if (!token) {
  console.error("purge-cf-cache: no CF_PURGE_TOKEN or CF_PURGE_TOKEN_FILE; Cloudflare may serve old pages for up to 2 hours.");
  process.exit(1);
}

const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ purge_everything: true }),
});
const body = await res.json();
if (!body.success) {
  console.error("purge-cf-cache: failed", JSON.stringify(body.errors));
  process.exit(1);
}
console.log("purge-cf-cache: Cloudflare cache cleared");
