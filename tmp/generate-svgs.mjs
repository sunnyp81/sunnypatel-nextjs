/**
 * Generate unique abstract SVG hero images for each blog post.
 * Each image uses theme colors and has a unique composition seeded by the slug.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const OUT = join(process.cwd(), 'public/images/blog');
mkdirSync(OUT, { recursive: true });

const BLUE = '#5B8AEF';
const GOLD = '#d79f1e';
const BG = '#050507';
const W = 1200, H = 600;

// Simple hash from string for deterministic randomness
function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function generateSVG(slug, concept) {
  const seed = hash(slug);
  const rand = seededRandom(seed);

  // Pick a pattern type based on slug
  const patterns = [
    generateNodes,
    generateWaves,
    generateCircuits,
    generateConstellations,
    generateHexGrid,
    generateFlowField,
    generateRadial,
  ];
  const pattern = patterns[seed % patterns.length];

  const elements = pattern(rand, concept);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <radialGradient id="glow-${seed}" cx="${30 + rand() * 40}%" cy="${30 + rand() * 40}%" r="50%">
      <stop offset="0%" stop-color="${BLUE}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${BG}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2-${seed}" cx="${50 + rand() * 30}%" cy="${50 + rand() * 30}%" r="40%">
      <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="${BG}" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur-${seed}">
      <feGaussianBlur stdDeviation="2"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect width="${W}" height="${H}" fill="url(#glow-${seed})"/>
  <rect width="${W}" height="${H}" fill="url(#glow2-${seed})"/>
  ${elements}
</svg>`;
}

function generateNodes(rand) {
  let svg = '';
  const nodes = [];
  const count = 12 + Math.floor(rand() * 10);

  for (let i = 0; i < count; i++) {
    const x = 80 + rand() * (W - 160);
    const y = 60 + rand() * (H - 120);
    const r = 2 + rand() * 4;
    const isGold = rand() > 0.75;
    const color = isGold ? GOLD : BLUE;
    const opacity = 0.3 + rand() * 0.5;
    nodes.push({ x, y, r });
    svg += `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${opacity}"/>`;
    svg += `<circle cx="${x}" cy="${y}" r="${r * 3}" fill="${color}" opacity="${opacity * 0.1}"/>`;
  }

  // Connect nearby nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200 && rand() > 0.3) {
        const opacity = (1 - dist / 200) * 0.15;
        svg += `<line x1="${nodes[i].x}" y1="${nodes[i].y}" x2="${nodes[j].x}" y2="${nodes[j].y}" stroke="${BLUE}" stroke-width="0.5" opacity="${opacity}"/>`;
      }
    }
  }
  return svg;
}

function generateWaves(rand) {
  let svg = '';
  const layers = 5 + Math.floor(rand() * 4);
  for (let l = 0; l < layers; l++) {
    const y0 = 100 + l * 70 + rand() * 40;
    const amp = 20 + rand() * 40;
    const freq = 0.003 + rand() * 0.005;
    const phase = rand() * Math.PI * 2;
    const isGold = l === layers - 1;
    const color = isGold ? GOLD : BLUE;
    const opacity = 0.08 + rand() * 0.15;

    let d = `M 0 ${y0}`;
    for (let x = 0; x <= W; x += 4) {
      const y = y0 + Math.sin(x * freq + phase) * amp + Math.cos(x * freq * 0.5 + phase * 1.3) * amp * 0.5;
      d += ` L ${x} ${y}`;
    }
    svg += `<path d="${d}" fill="none" stroke="${color}" stroke-width="${0.5 + rand()}" opacity="${opacity}"/>`;
  }

  // Accent dots along one wave
  const wy = 200 + rand() * 200;
  for (let x = 100; x < W - 100; x += 60 + rand() * 80) {
    const y = wy + Math.sin(x * 0.005) * 30;
    svg += `<circle cx="${x}" cy="${y}" r="${1.5 + rand() * 2}" fill="${BLUE}" opacity="${0.4 + rand() * 0.3}"/>`;
  }
  return svg;
}

function generateCircuits(rand) {
  let svg = '';
  const lines = 15 + Math.floor(rand() * 10);

  for (let i = 0; i < lines; i++) {
    const x1 = rand() * W;
    const y1 = rand() * H;
    const segments = 2 + Math.floor(rand() * 4);
    const isGold = rand() > 0.8;
    const color = isGold ? GOLD : BLUE;
    const opacity = 0.1 + rand() * 0.2;

    let d = `M ${x1} ${y1}`;
    let cx = x1, cy = y1;
    for (let s = 0; s < segments; s++) {
      if (rand() > 0.5) {
        cx += (rand() > 0.5 ? 1 : -1) * (40 + rand() * 120);
        d += ` L ${cx} ${cy}`;
      } else {
        cy += (rand() > 0.5 ? 1 : -1) * (40 + rand() * 80);
        d += ` L ${cx} ${cy}`;
      }
    }
    svg += `<path d="${d}" fill="none" stroke="${color}" stroke-width="0.5" opacity="${opacity}"/>`;

    // Node at junction points
    svg += `<circle cx="${cx}" cy="${cy}" r="${2 + rand() * 2}" fill="${color}" opacity="${opacity + 0.1}"/>`;
    svg += `<rect x="${x1 - 2}" y="${y1 - 2}" width="4" height="4" fill="${color}" opacity="${opacity + 0.1}" rx="0.5"/>`;
  }
  return svg;
}

function generateConstellations(rand) {
  let svg = '';
  const clusters = 3 + Math.floor(rand() * 3);

  for (let c = 0; c < clusters; c++) {
    const cx = 150 + rand() * (W - 300);
    const cy = 100 + rand() * (H - 200);
    const starCount = 5 + Math.floor(rand() * 8);
    const stars = [];

    for (let i = 0; i < starCount; i++) {
      const x = cx + (rand() - 0.5) * 300;
      const y = cy + (rand() - 0.5) * 200;
      const size = 1 + rand() * 3;
      const isGold = rand() > 0.85;
      const color = isGold ? GOLD : BLUE;
      const opacity = 0.3 + rand() * 0.5;
      stars.push({ x, y });

      svg += `<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" opacity="${opacity}"/>`;
      // Glow
      svg += `<circle cx="${x}" cy="${y}" r="${size * 4}" fill="${color}" opacity="${opacity * 0.06}"/>`;
    }

    // Connect stars in cluster
    for (let i = 0; i < stars.length - 1; i++) {
      const j = i + 1 + Math.floor(rand() * Math.min(2, stars.length - i - 1));
      if (j < stars.length) {
        svg += `<line x1="${stars[i].x}" y1="${stars[i].y}" x2="${stars[j].x}" y2="${stars[j].y}" stroke="${BLUE}" stroke-width="0.3" opacity="0.12"/>`;
      }
    }
  }

  // Scattered small dots (background stars)
  for (let i = 0; i < 40; i++) {
    const x = rand() * W;
    const y = rand() * H;
    svg += `<circle cx="${x}" cy="${y}" r="${0.3 + rand() * 0.8}" fill="white" opacity="${0.05 + rand() * 0.15}"/>`;
  }
  return svg;
}

function generateHexGrid(rand) {
  let svg = '';
  const size = 35 + rand() * 15;
  const rows = Math.ceil(H / (size * 1.5)) + 1;
  const cols = Math.ceil(W / (size * Math.sqrt(3))) + 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * size * Math.sqrt(3) + (r % 2 ? size * Math.sqrt(3) / 2 : 0);
      const y = r * size * 1.5;
      const show = rand() > 0.55;
      if (!show) continue;

      const isGold = rand() > 0.9;
      const color = isGold ? GOLD : BLUE;
      const opacity = 0.04 + rand() * 0.12;
      const filled = rand() > 0.85;

      let points = '';
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = x + size * 0.8 * Math.cos(angle);
        const py = y + size * 0.8 * Math.sin(angle);
        points += `${px},${py} `;
      }

      if (filled) {
        svg += `<polygon points="${points}" fill="${color}" opacity="${opacity}"/>`;
      } else {
        svg += `<polygon points="${points}" fill="none" stroke="${color}" stroke-width="0.5" opacity="${opacity}"/>`;
      }
    }
  }
  return svg;
}

function generateFlowField(rand) {
  let svg = '';
  const particles = 60 + Math.floor(rand() * 40);
  const angleBase = rand() * Math.PI * 2;

  for (let i = 0; i < particles; i++) {
    let x = rand() * W;
    let y = rand() * H;
    const steps = 8 + Math.floor(rand() * 15);
    const isGold = rand() > 0.85;
    const color = isGold ? GOLD : BLUE;
    const opacity = 0.06 + rand() * 0.14;

    let d = `M ${x} ${y}`;
    for (let s = 0; s < steps; s++) {
      const angle = angleBase + Math.sin(x * 0.005) * Math.cos(y * 0.005) * Math.PI * 2;
      x += Math.cos(angle) * 8;
      y += Math.sin(angle) * 8;
      d += ` L ${x} ${y}`;
    }
    svg += `<path d="${d}" fill="none" stroke="${color}" stroke-width="${0.3 + rand() * 0.8}" opacity="${opacity}" stroke-linecap="round"/>`;
  }
  return svg;
}

function generateRadial(rand) {
  let svg = '';
  const cx = W * (0.3 + rand() * 0.4);
  const cy = H * (0.3 + rand() * 0.4);
  const rings = 6 + Math.floor(rand() * 4);

  for (let r = 1; r <= rings; r++) {
    const radius = r * (40 + rand() * 20);
    const isGold = r === rings;
    const color = isGold ? GOLD : BLUE;
    const opacity = 0.05 + rand() * 0.1;
    const dashed = rand() > 0.5;

    svg += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${color}" stroke-width="0.5" opacity="${opacity}" ${dashed ? `stroke-dasharray="${3 + rand() * 8} ${5 + rand() * 10}"` : ''}/>`;

    // Dots on ring
    const dotCount = 3 + Math.floor(rand() * 5);
    for (let d = 0; d < dotCount; d++) {
      const angle = (d / dotCount) * Math.PI * 2 + rand() * 0.5;
      const dx = cx + radius * Math.cos(angle);
      const dy = cy + radius * Math.sin(angle);
      svg += `<circle cx="${dx}" cy="${dy}" r="${1 + rand() * 2}" fill="${color}" opacity="${opacity + 0.15}"/>`;
    }
  }

  // Radial lines
  const lineCount = 6 + Math.floor(rand() * 6);
  for (let l = 0; l < lineCount; l++) {
    const angle = (l / lineCount) * Math.PI * 2;
    const len = 80 + rand() * 150;
    const x2 = cx + len * Math.cos(angle);
    const y2 = cy + len * Math.sin(angle);
    svg += `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="${BLUE}" stroke-width="0.3" opacity="0.08"/>`;
  }
  return svg;
}

// All blog posts
const posts = [
  'what-is-llm-optimisation',
  'google-algorithm-update-recovery',
  'technical-seo-vs-on-page-seo',
  'what-is-a-content-brief',
  'how-to-choose-an-seo-consultant',
  'local-seo-berkshire-guide',
  'what-is-eeat-in-seo',
  'topical-authority-vs-domain-authority',
  'how-to-build-topical-authority',
  'what-is-entity-seo',
  'optimise-content-for-ai-search',
  'generative-engine-optimisation-2',
  'how-long-does-seo-take',
  'b2b-content-marketing-services',
  'how-to-be-an-seo',
  'increase-organic-traffic',
  'wordpress-vs-webflow',
  'how-many-keywords',
  'seo-mistakes',
  'intent-competition-data',
  'optimise-multiple-keywords',
];

let count = 0;
for (const slug of posts) {
  const svg = generateSVG(slug);
  const path = join(OUT, `${slug}.svg`);
  writeFileSync(path, svg);
  count++;
  console.log(`Created: ${slug}.svg`);
}
console.log(`\nDone: ${count} images generated`);
