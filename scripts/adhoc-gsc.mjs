// One-off GSC query runner for the weekly verdict pass. Not committed to repo history as a permanent tool.
// Usage: node scripts/adhoc-gsc.mjs '<JSON array of {label, startDate, endDate, dimensions, dimensionFilterGroups, rowLimit}>'
import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";

const SITE = "sc-domain:sunnypatel.co.uk";
const KEY_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || "/root/.hermes/gsc-service-account.json";

async function getToken() {
  const sa = JSON.parse(readFileSync(KEY_PATH, "utf8"));
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;
  const sig = createSign("RSA-SHA256").update(unsigned).sign(sa.private_key, "base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${sig}`,
    }),
  });
  if (!res.ok) throw new Error(`token: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

async function query(token, body) {
  const res = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error(`query: ${res.status} ${await res.text()}`);
  return (await res.json()).rows || [];
}

const specs = JSON.parse(process.argv[2]);
const token = await getToken();
const out = {};
for (const spec of specs) {
  const { label, ...body } = spec;
  try {
    out[label] = await query(token, { rowLimit: 25, ...body });
  } catch (e) {
    out[label] = { error: String(e) };
  }
}
console.log(JSON.stringify(out, null, 2));
