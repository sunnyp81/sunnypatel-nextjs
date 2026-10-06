// Heuristic for vendor pitches that come through the contact form. Label-only:
// callers tag the email, they never drop the submission.

const MESSAGE_PATTERNS: RegExp[] = [
  /back-?links?/i,
  /guest post/i,
  /link[- ]building/i,
  /quality (websites|sites|links)/i,
  /\b\d+k\+? (sites|websites|blogs)/i,
  /price starts? from/i,
  /(rank|ranking)s? (your|on|in) (website|site|google|first page)/i,
  /first page of google/i,
  /i (can|will) (help|get) you (rank|more (traffic|leads|clients))/i,
  /(seo|marketing|web design) (services|packages|proposal|audit) (for|to) your/i,
  /contact[- ]form (marketing|blaster|outreach)/i,
  /through your contact form/i,
  /submits? (personali[sz]ed )?outreach/i,
  /white[- ]?label/i,
  /send you my (site|website) lists?/i,
  /(casino|crypto|loan|viagra)/i,
];

const SENDER_PATTERNS: RegExp[] = [
  /(seo|backlink|publisher|onlinemedia|webseo|linkbuild|worldmedia|digitalmarketing)/i,
];

export function spamScore(input: { message?: unknown; email?: unknown; howHeard?: unknown }): number {
  const message = typeof input.message === "string" ? input.message : "";
  const email = typeof input.email === "string" ? input.email : "";
  let score = 0;
  for (const re of MESSAGE_PATTERNS) if (re.test(message)) score += 1;
  if (SENDER_PATTERNS.some((re) => re.test(email.split("@")[0] ?? ""))) score += 2;
  if ((message.match(/https?:\/\//g) ?? []).length >= 3) score += 1;
  return score;
}

export const SPAM_THRESHOLD = 2;
