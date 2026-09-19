const sharp = require('sharp');
const path = require('path');

const dir = path.join(__dirname, '..', '..', 'public', 'images', 'blog');
const files = [
  'hero-how-many-websites-are-there.webp',
  'hero-top-geo-agencies.webp',
  'hero-uk-dental-marketing-statistics.webp',
  'hero-uk-ecommerce-seo-statistics.webp',
  'hero-ai-referral-traffic-study.webp',
  'hero-autonomous-seo-agent.webp',
  'hero-how-to-add-schema-markup.webp',
  'hero-how-to-calculate-seo-roi.webp',
  'hero-chatgpt-prompts-for-seo.webp',
  'hero-google-open-knowledge-format.webp',
  'hero-seo-consultant-vs-seo-agency.webp',
  'hero-optimise-content-for-ai-search.webp',
  'hero-freelance-seo-consultant-uk.webp',
  'hero-wordpress-vs-webflow.webp',
  'hero-how-to-be-an-seo.webp',
  'hero-seo-semantic-markup-guide.webp',
  'hero-what-is-eeat-seo.webp',
  'hero-optimise-multiple-keywords.webp',
  'hero-increase-organic-traffic.webp',
  'hero-how-many-keywords.webp',
  'hero-technical-seo-vs-on-page-seo.webp',
  'hero-managing-44-websites.webp',
  'hero-how-long-does-seo-take.webp',
  'hero-google-update-impact.webp',
  'hero-ai-search-traffic.webp',
  'hero-negative-seo-case-study.webp',
  'hero-aged-domains.webp',
];

const needsHuman = new Set([
  'hero-optimise-content-for-ai-search.webp',
  'hero-freelance-seo-consultant-uk.webp',
  'hero-optimise-multiple-keywords.webp',
  'hero-google-update-impact.webp',
  'hero-ai-search-traffic.webp',
  'hero-negative-seo-case-study.webp',
]);

const COLS = 3;
const CELL_W = 500;
const CELL_H = 282;
const PAD = 12;
const LABEL_H = 28;
const ROWS = Math.ceil(files.length / COLS);
const W = COLS * (CELL_W + PAD) + PAD;
const H = ROWS * (CELL_H + LABEL_H + PAD) + PAD;

async function build() {
  const composites = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = PAD + col * (CELL_W + PAD);
    const y = PAD + row * (CELL_H + LABEL_H + PAD);
    const buf = await sharp(path.join(dir, f)).resize(CELL_W, CELL_H, { fit: 'cover' }).toBuffer();
    composites.push({ input: buf, left: x, top: y });
    const label = needsHuman.has(f) ? `${f} [NEEDS HUMAN]` : f;
    const svg = `<svg width="${CELL_W}" height="${LABEL_H}"><rect width="100%" height="100%" fill="#141418"/><text x="6" y="19" font-family="monospace" font-size="13" fill="${needsHuman.has(f) ? '#ff6b6b' : '#cfd3d8'}">${label}</text></svg>`;
    composites.push({ input: Buffer.from(svg), left: x, top: y + CELL_H });
  }
  await sharp({ create: { width: W, height: H, channels: 3, background: '#050507' } })
    .composite(composites)
    .jpeg({ quality: 88 })
    .toFile(path.join(__dirname, '07-contact-sheet.jpg'));
  console.log('done', W, H);
}
build();
