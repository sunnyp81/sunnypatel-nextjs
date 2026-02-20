import { writeFileSync } from 'fs';
import { join } from 'path';

const OUT = join(import.meta.dirname, '..', 'public', 'images', 'blog');

const BG = '#050507';
const BLUE = '#5B8AEF';
const GOLD = '#d79f1e';

// Shared SVG defs — noise, glow, blur filters + gradients
function defs(extras = '') {
  return `<defs>
    <!-- Noise texture -->
    <filter id="noise" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <!-- Soft blur for atmosphere -->
    <filter id="blur-lg"><feGaussianBlur stdDeviation="60"/></filter>
    <filter id="blur-md"><feGaussianBlur stdDeviation="35"/></filter>
    <filter id="blur-sm"><feGaussianBlur stdDeviation="18"/></filter>
    <!-- Glow filter -->
    <filter id="glow">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="glow-strong">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    ${extras}
  </defs>`;
}

function svg(inner, extraDefs = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
${defs(extraDefs)}
<!-- Background -->
<rect width="1200" height="630" fill="${BG}"/>
${inner}
<!-- Noise overlay -->
<rect width="1200" height="630" filter="url(#noise)" opacity="0.03"/>
</svg>`;
}

// ── 1. B2B Content Marketing ── Funnel gradient shape
const b2bContent = svg(`
  <!-- Ambient blobs -->
  <ellipse cx="400" cy="350" rx="280" ry="220" fill="${BLUE}" opacity="0.07" filter="url(#blur-lg)"/>
  <ellipse cx="750" cy="280" rx="200" ry="180" fill="${GOLD}" opacity="0.05" filter="url(#blur-lg)"/>
  <!-- Funnel shape with gradient -->
  <path d="M500,200 L700,200 Q690,310 650,380 L550,380 Q510,310 500,200 Z" fill="url(#funnel-grad)" filter="url(#glow)" opacity="0.85"/>
  <path d="M550,390 L650,390 L640,440 L560,440 Z" fill="${GOLD}" opacity="0.35" filter="url(#glow)"/>
  <!-- Subtle entry lines -->
  <line x1="460" y1="220" x2="500" y2="220" stroke="${BLUE}" stroke-width="1.5" opacity="0.25"/>
  <line x1="440" y1="250" x2="505" y2="240" stroke="${BLUE}" stroke-width="1" opacity="0.15"/>
  <line x1="700" y1="220" x2="740" y2="220" stroke="${BLUE}" stroke-width="1.5" opacity="0.25"/>
  <!-- Output dot -->
  <circle cx="600" cy="465" r="4" fill="${GOLD}" filter="url(#glow)" opacity="0.6"/>
`, `<linearGradient id="funnel-grad" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="${BLUE}" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="${BLUE}" stop-opacity="0.08"/>
</linearGradient>`);

// ── 2. Generative Engine Optimisation ── AI sparkle with lens
const geo = svg(`
  <ellipse cx="550" cy="320" rx="300" ry="250" fill="${BLUE}" opacity="0.06" filter="url(#blur-lg)"/>
  <ellipse cx="700" cy="260" rx="180" ry="160" fill="${GOLD}" opacity="0.04" filter="url(#blur-lg)"/>
  <!-- Lens circle -->
  <circle cx="560" cy="310" r="90" fill="none" stroke="${BLUE}" stroke-width="1.5" opacity="0.35" filter="url(#glow)"/>
  <circle cx="560" cy="310" r="91" fill="${BLUE}" opacity="0.03"/>
  <line x1="623" y1="373" x2="690" y2="440" stroke="${BLUE}" stroke-width="2.5" stroke-linecap="round" opacity="0.3" filter="url(#glow)"/>
  <!-- AI sparkle — bold, centered in lens -->
  <path d="M560,250 L568,290 L608,298 L568,306 L560,346 L552,306 L512,298 L552,290 Z" fill="${GOLD}" opacity="0.55" filter="url(#glow-strong)"/>
  <!-- Tiny accent sparkles -->
  <path d="M680,230 L683,242 L695,245 L683,248 L680,260 L677,248 L665,245 L677,242 Z" fill="${BLUE}" opacity="0.2" filter="url(#glow)"/>
  <path d="M470" y1="400" d="M470,390 L472,397 L479,399 L472,401 L470,408 L468,401 L461,399 L468,397 Z" fill="${GOLD}" opacity="0.15"/>
`);

// ── 3. Google Algorithm Update Recovery ── Smooth recovery curve
const recovery = svg(`
  <ellipse cx="500" cy="380" rx="300" ry="200" fill="${GOLD}" opacity="0.04" filter="url(#blur-lg)"/>
  <ellipse cx="750" cy="250" rx="250" ry="200" fill="${BLUE}" opacity="0.06" filter="url(#blur-lg)"/>
  <!-- Recovery curve — bold, smooth, confident -->
  <path d="M250,250 C350,250 400,260 480,380 C510,430 530,440 560,430 C600,410 650,340 750,260 C820,210 880,195 950,190"
    fill="none" stroke="url(#recovery-grad)" stroke-width="3" stroke-linecap="round" filter="url(#glow)"/>
  <!-- Glow under the recovery section -->
  <path d="M560,430 C600,410 650,340 750,260 C820,210 880,195 950,190"
    fill="none" stroke="${GOLD}" stroke-width="8" opacity="0.1" filter="url(#blur-sm)"/>
  <!-- Subtle dip indicator -->
  <circle cx="545" cy="435" r="3" fill="${GOLD}" opacity="0.5" filter="url(#glow)"/>
  <!-- Recovery endpoint -->
  <circle cx="950" cy="190" r="4" fill="${GOLD}" opacity="0.6" filter="url(#glow)"/>
`, `<linearGradient id="recovery-grad" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0%" stop-color="${BLUE}" stop-opacity="0.4"/>
  <stop offset="40%" stop-color="${BLUE}" stop-opacity="0.6"/>
  <stop offset="60%" stop-color="${GOLD}" stop-opacity="0.7"/>
  <stop offset="100%" stop-color="${GOLD}" stop-opacity="0.9"/>
</linearGradient>`);

// ── 4. How Long Does SEO Take ── Elegant hourglass
const howLong = svg(`
  <ellipse cx="600" cy="315" rx="250" ry="220" fill="${BLUE}" opacity="0.05" filter="url(#blur-lg)"/>
  <ellipse cx="600" cy="400" rx="150" ry="120" fill="${GOLD}" opacity="0.04" filter="url(#blur-lg)"/>
  <!-- Hourglass — clean, elegant curves -->
  <path d="M540,180 L660,180 M540,180 C540,280 600,310 600,315 C600,310 660,280 660,180"
    fill="none" stroke="${BLUE}" stroke-width="1.8" opacity="0.5" filter="url(#glow)"/>
  <path d="M540,450 L660,450 M540,450 C540,350 600,320 600,315 C600,320 660,350 660,450"
    fill="none" stroke="${BLUE}" stroke-width="1.8" opacity="0.5" filter="url(#glow)"/>
  <!-- Top bar -->
  <line x1="530" y1="180" x2="670" y2="180" stroke="${BLUE}" stroke-width="2.5" stroke-linecap="round" opacity="0.5" filter="url(#glow)"/>
  <!-- Bottom bar -->
  <line x1="530" y1="450" x2="670" y2="450" stroke="${BLUE}" stroke-width="2.5" stroke-linecap="round" opacity="0.5" filter="url(#glow)"/>
  <!-- Sand fill — gradient in bottom -->
  <path d="M555,440 C555,380 600,335 600,315 C600,335 645,380 645,440 Z" fill="url(#sand-grad)" opacity="0.3"/>
  <!-- Sand stream -->
  <line x1="600" y1="310" x2="600" y2="340" stroke="${GOLD}" stroke-width="1" opacity="0.4"/>
  <!-- Sand in top, smaller -->
  <path d="M555,195 L645,195 L610,280 L590,280 Z" fill="${GOLD}" opacity="0.1"/>
`, `<linearGradient id="sand-grad" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.1"/>
  <stop offset="100%" stop-color="${GOLD}" stop-opacity="0.6"/>
</linearGradient>`);

// ── 5. How Many Keywords ── Floating keyword pills, minimal
const howMany = svg(`
  <ellipse cx="550" cy="300" rx="300" ry="230" fill="${BLUE}" opacity="0.05" filter="url(#blur-lg)"/>
  <!-- Keyword pills — varying sizes, subtle, floating -->
  <rect x="380" y="230" width="110" height="36" rx="18" fill="${BLUE}" opacity="0.12" filter="url(#glow)"/>
  <rect x="390" y="242" width="55" height="5" rx="2.5" fill="${BLUE}" opacity="0.3"/>
  <rect x="520" y="200" width="90" height="36" rx="18" fill="${GOLD}" opacity="0.1" filter="url(#glow)"/>
  <rect x="530" y="212" width="45" height="5" rx="2.5" fill="${GOLD}" opacity="0.25"/>
  <rect x="640" y="240" width="130" height="36" rx="18" fill="${BLUE}" opacity="0.08"/>
  <rect x="650" y="252" width="70" height="5" rx="2.5" fill="${BLUE}" opacity="0.2"/>
  <rect x="440" y="340" width="100" height="36" rx="18" fill="${BLUE}" opacity="0.06"/>
  <rect x="450" y="352" width="50" height="5" rx="2.5" fill="${BLUE}" opacity="0.15"/>
  <rect x="580" y="360" width="120" height="36" rx="18" fill="${GOLD}" opacity="0.08"/>
  <rect x="590" y="372" width="65" height="5" rx="2.5" fill="${GOLD}" opacity="0.2"/>
  <rect x="730" y="310" width="80" height="36" rx="18" fill="${BLUE}" opacity="0.05"/>
  <rect x="740" y="322" width="40" height="5" rx="2.5" fill="${BLUE}" opacity="0.12"/>
  <!-- Central question -->
  <text x="600" y="320" text-anchor="middle" fill="${BLUE}" font-family="system-ui,sans-serif" font-size="120" font-weight="200" opacity="0.06">?</text>
`);

// ── 6. How to Be an SEO ── Ascending steps with glow
const beAnSeo = svg(`
  <ellipse cx="650" cy="300" rx="280" ry="230" fill="${BLUE}" opacity="0.06" filter="url(#blur-lg)"/>
  <!-- Ascending steps — bold, confident -->
  <rect x="380" y="400" width="80" height="10" rx="5" fill="${BLUE}" opacity="0.15" filter="url(#glow)"/>
  <rect x="470" y="360" width="80" height="10" rx="5" fill="${BLUE}" opacity="0.22" filter="url(#glow)"/>
  <rect x="560" y="320" width="80" height="10" rx="5" fill="${BLUE}" opacity="0.3" filter="url(#glow)"/>
  <rect x="650" y="280" width="80" height="10" rx="5" fill="${BLUE}" opacity="0.4" filter="url(#glow)"/>
  <rect x="740" y="240" width="80" height="10" rx="5" fill="${GOLD}" opacity="0.5" filter="url(#glow-strong)"/>
  <!-- Connecting path -->
  <path d="M420,395 L510,355 L600,315 L690,275 L780,235"
    fill="none" stroke="${BLUE}" stroke-width="1" opacity="0.15" stroke-dasharray="4,6"/>
  <!-- Glow at top step -->
  <ellipse cx="780" cy="240" rx="60" ry="40" fill="${GOLD}" opacity="0.06" filter="url(#blur-md)"/>
`);

// ── 7. How to Build Topical Authority ── Hierarchy/tree
const topicalAuthBuild = svg(`
  <ellipse cx="600" cy="280" rx="250" ry="200" fill="${BLUE}" opacity="0.05" filter="url(#blur-lg)"/>
  <!-- Hierarchy — pillar page top, clusters below -->
  <circle cx="600" cy="210" r="24" fill="${GOLD}" opacity="0.25" filter="url(#glow-strong)"/>
  <circle cx="480" cy="320" r="18" fill="${BLUE}" opacity="0.2" filter="url(#glow)"/>
  <circle cx="600" cy="340" r="18" fill="${BLUE}" opacity="0.2" filter="url(#glow)"/>
  <circle cx="720" cy="320" r="18" fill="${BLUE}" opacity="0.2" filter="url(#glow)"/>
  <!-- Bottom tier -->
  <circle cx="420" cy="420" r="12" fill="${BLUE}" opacity="0.1" filter="url(#glow)"/>
  <circle cx="530" cy="430" r="12" fill="${BLUE}" opacity="0.1" filter="url(#glow)"/>
  <circle cx="670" cy="430" r="12" fill="${BLUE}" opacity="0.1" filter="url(#glow)"/>
  <circle cx="780" cy="420" r="12" fill="${BLUE}" opacity="0.1" filter="url(#glow)"/>
  <!-- Connections -->
  <line x1="600" y1="234" x2="480" y2="302" stroke="${BLUE}" stroke-width="1" opacity="0.15"/>
  <line x1="600" y1="234" x2="600" y2="322" stroke="${BLUE}" stroke-width="1" opacity="0.15"/>
  <line x1="600" y1="234" x2="720" y2="302" stroke="${BLUE}" stroke-width="1" opacity="0.15"/>
  <line x1="480" y1="338" x2="420" y2="408" stroke="${BLUE}" stroke-width="0.8" opacity="0.1"/>
  <line x1="480" y1="338" x2="530" y2="418" stroke="${BLUE}" stroke-width="0.8" opacity="0.1"/>
  <line x1="720" y1="338" x2="670" y2="418" stroke="${BLUE}" stroke-width="0.8" opacity="0.1"/>
  <line x1="720" y1="338" x2="780" y2="408" stroke="${BLUE}" stroke-width="0.8" opacity="0.1"/>
`);

// ── 8. How to Choose SEO Consultant ── Checklist with glow
const chooseSeo = svg(`
  <ellipse cx="580" cy="310" rx="220" ry="200" fill="${BLUE}" opacity="0.05" filter="url(#blur-lg)"/>
  <!-- Checklist card -->
  <rect x="480" y="180" width="240" height="280" rx="16" fill="${BLUE}" opacity="0.04" stroke="${BLUE}" stroke-width="1" stroke-opacity="0.1"/>
  <!-- Check rows -->
  <circle cx="520" cy="230" r="8" fill="${GOLD}" opacity="0.25" filter="url(#glow)"/>
  <line x1="545" y1="230" x2="670" y2="230" stroke="${BLUE}" stroke-width="2" opacity="0.12"/>
  <circle cx="520" cy="278" r="8" fill="${GOLD}" opacity="0.2" filter="url(#glow)"/>
  <line x1="545" y1="278" x2="650" y2="278" stroke="${BLUE}" stroke-width="2" opacity="0.1"/>
  <circle cx="520" cy="326" r="8" fill="${GOLD}" opacity="0.15" filter="url(#glow)"/>
  <line x1="545" y1="326" x2="660" y2="326" stroke="${BLUE}" stroke-width="2" opacity="0.08"/>
  <circle cx="520" cy="374" r="8" fill="none" stroke="${BLUE}" stroke-width="1.5" opacity="0.12"/>
  <line x1="545" y1="374" x2="640" y2="374" stroke="${BLUE}" stroke-width="2" opacity="0.06"/>
  <circle cx="520" cy="422" r="8" fill="none" stroke="${BLUE}" stroke-width="1.5" opacity="0.08"/>
  <line x1="545" y1="422" x2="655" y2="422" stroke="${BLUE}" stroke-width="2" opacity="0.05"/>
`);

// ── 9. Increase Organic Traffic ── Bold ascending curve
const increaseTraffic = svg(`
  <ellipse cx="650" cy="350" rx="300" ry="230" fill="${BLUE}" opacity="0.06" filter="url(#blur-lg)"/>
  <ellipse cx="800" cy="250" rx="200" ry="150" fill="${GOLD}" opacity="0.04" filter="url(#blur-lg)"/>
  <!-- Bold growth curve -->
  <path d="M280,420 C380,410 480,390 560,350 C640,310 720,240 840,180 C880,160 920,155 950,155"
    fill="none" stroke="url(#traffic-grad)" stroke-width="3" stroke-linecap="round" filter="url(#glow)"/>
  <!-- Area fill under curve -->
  <path d="M280,420 C380,410 480,390 560,350 C640,310 720,240 840,180 C880,160 920,155 950,155 L950,480 L280,480 Z"
    fill="url(#traffic-area)" opacity="0.15"/>
  <!-- Endpoint glow -->
  <circle cx="950" cy="155" r="5" fill="${GOLD}" filter="url(#glow-strong)" opacity="0.7"/>
  <!-- Arrow tip -->
  <polygon points="955,148 965,158 950,160" fill="${GOLD}" opacity="0.5"/>
`, `<linearGradient id="traffic-grad" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0%" stop-color="${BLUE}" stop-opacity="0.3"/>
  <stop offset="100%" stop-color="${GOLD}" stop-opacity="0.8"/>
</linearGradient>
<linearGradient id="traffic-area" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="${BLUE}" stop-opacity="0.4"/>
  <stop offset="100%" stop-color="${BLUE}" stop-opacity="0"/>
</linearGradient>`);

// ── 10. Intent, Competition & Data ── Concentric rings with data points
const intentData = svg(`
  <ellipse cx="600" cy="315" rx="280" ry="230" fill="${BLUE}" opacity="0.05" filter="url(#blur-lg)"/>
  <!-- Concentric rings -->
  <circle cx="600" cy="315" r="140" fill="none" stroke="${BLUE}" stroke-width="0.8" opacity="0.1"/>
  <circle cx="600" cy="315" r="100" fill="none" stroke="${BLUE}" stroke-width="1" opacity="0.15"/>
  <circle cx="600" cy="315" r="60" fill="none" stroke="${BLUE}" stroke-width="1.2" opacity="0.2"/>
  <!-- Center point -->
  <circle cx="600" cy="315" r="8" fill="${GOLD}" opacity="0.45" filter="url(#glow-strong)"/>
  <!-- Data points on rings -->
  <circle cx="540" cy="265" r="5" fill="${BLUE}" opacity="0.35" filter="url(#glow)"/>
  <circle cx="680" cy="360" r="4" fill="${BLUE}" opacity="0.25" filter="url(#glow)"/>
  <circle cx="560" cy="395" r="4.5" fill="${GOLD}" opacity="0.3" filter="url(#glow)"/>
  <circle cx="660" cy="245" r="3.5" fill="${GOLD}" opacity="0.2" filter="url(#glow)"/>
  <circle cx="500" cy="340" r="3" fill="${BLUE}" opacity="0.2"/>
  <circle cx="710" cy="290" r="3" fill="${BLUE}" opacity="0.15"/>
`);

// ── 11. Local SEO Berkshire ── Map pin with radiating pulse
const localSeo = svg(`
  <ellipse cx="600" cy="340" rx="250" ry="200" fill="${BLUE}" opacity="0.05" filter="url(#blur-lg)"/>
  <!-- Radiating pulses -->
  <circle cx="600" cy="370" r="150" fill="none" stroke="${BLUE}" stroke-width="0.8" opacity="0.06"/>
  <circle cx="600" cy="370" r="110" fill="none" stroke="${BLUE}" stroke-width="1" opacity="0.08"/>
  <circle cx="600" cy="370" r="70" fill="none" stroke="${BLUE}" stroke-width="1" opacity="0.12"/>
  <!-- Pin shape — elegant -->
  <path d="M600,210 C565,210 540,240 540,275 C540,325 600,390 600,390 C600,390 660,325 660,275 C660,240 635,210 600,210 Z"
    fill="url(#pin-grad)" opacity="0.4" filter="url(#glow)"/>
  <!-- Pin inner dot -->
  <circle cx="600" cy="270" r="14" fill="${GOLD}" opacity="0.4" filter="url(#glow)"/>
`, `<linearGradient id="pin-grad" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="${BLUE}" stop-opacity="0.8"/>
  <stop offset="100%" stop-color="${BLUE}" stop-opacity="0.2"/>
</linearGradient>`);

// ── 12. Optimise Content for AI Search ── Document with AI glow
const aiContent = svg(`
  <ellipse cx="560" cy="310" rx="250" ry="210" fill="${BLUE}" opacity="0.05" filter="url(#blur-lg)"/>
  <ellipse cx="680" cy="260" rx="150" ry="130" fill="${GOLD}" opacity="0.04" filter="url(#blur-lg)"/>
  <!-- Document -->
  <rect x="480" y="190" width="180" height="240" rx="12" fill="${BLUE}" opacity="0.06" stroke="${BLUE}" stroke-width="1" stroke-opacity="0.15"/>
  <!-- Content lines -->
  <line x1="510" y1="235" x2="630" y2="235" stroke="${BLUE}" stroke-width="2" opacity="0.12"/>
  <line x1="510" y1="265" x2="610" y2="265" stroke="${BLUE}" stroke-width="2" opacity="0.1"/>
  <line x1="510" y1="295" x2="625" y2="295" stroke="${BLUE}" stroke-width="2" opacity="0.08"/>
  <line x1="510" y1="325" x2="590" y2="325" stroke="${BLUE}" stroke-width="2" opacity="0.06"/>
  <line x1="510" y1="355" x2="615" y2="355" stroke="${BLUE}" stroke-width="2" opacity="0.05"/>
  <!-- AI sparkle — overlapping top-right -->
  <path d="M670,220 L678,256 L714,264 L678,272 L670,308 L662,272 L626,264 L662,256 Z"
    fill="${GOLD}" opacity="0.4" filter="url(#glow-strong)"/>
`);

// ── 13. Optimise Multiple Keywords ── Multiple targets
const multiKeywords = svg(`
  <ellipse cx="580" cy="310" rx="280" ry="220" fill="${BLUE}" opacity="0.05" filter="url(#blur-lg)"/>
  <!-- Main target -->
  <circle cx="520" cy="300" r="80" fill="none" stroke="${BLUE}" stroke-width="0.8" opacity="0.12"/>
  <circle cx="520" cy="300" r="50" fill="none" stroke="${BLUE}" stroke-width="1" opacity="0.2"/>
  <circle cx="520" cy="300" r="20" fill="none" stroke="${BLUE}" stroke-width="1.5" opacity="0.3"/>
  <circle cx="520" cy="300" r="5" fill="${BLUE}" opacity="0.4" filter="url(#glow)"/>
  <!-- Second target -->
  <circle cx="720" cy="260" r="55" fill="none" stroke="${GOLD}" stroke-width="0.8" opacity="0.1"/>
  <circle cx="720" cy="260" r="30" fill="none" stroke="${GOLD}" stroke-width="1" opacity="0.15"/>
  <circle cx="720" cy="260" r="4" fill="${GOLD}" opacity="0.35" filter="url(#glow)"/>
  <!-- Third target -->
  <circle cx="660" cy="400" r="40" fill="none" stroke="${BLUE}" stroke-width="0.8" opacity="0.08"/>
  <circle cx="660" cy="400" r="18" fill="none" stroke="${BLUE}" stroke-width="1" opacity="0.12"/>
  <circle cx="660" cy="400" r="3" fill="${BLUE}" opacity="0.25" filter="url(#glow)"/>
`);

// ── 14. SEO Mistakes ── Warning triangle, minimal
const seoMistakes = svg(`
  <ellipse cx="600" cy="320" rx="250" ry="200" fill="${GOLD}" opacity="0.04" filter="url(#blur-lg)"/>
  <!-- Triangle — clean lines, gradient stroke feel -->
  <path d="M600,180 L760,430 L440,430 Z" fill="none" stroke="${GOLD}" stroke-width="2" opacity="0.3" filter="url(#glow)"/>
  <!-- Inner glow of triangle -->
  <path d="M600,210 L740,415 L460,415 Z" fill="${GOLD}" opacity="0.02"/>
  <!-- Exclamation -->
  <line x1="600" y1="270" x2="600" y2="360" stroke="${GOLD}" stroke-width="3" stroke-linecap="round" opacity="0.4" filter="url(#glow)"/>
  <circle cx="600" cy="390" r="4" fill="${GOLD}" opacity="0.4" filter="url(#glow)"/>
`);

// ── 15. Technical SEO vs On-Page SEO ── Split composition
const techVsOnpage = svg(`
  <ellipse cx="400" cy="315" rx="250" ry="200" fill="${BLUE}" opacity="0.05" filter="url(#blur-lg)"/>
  <ellipse cx="800" cy="315" rx="250" ry="200" fill="${GOLD}" opacity="0.04" filter="url(#blur-lg)"/>
  <!-- Divider — subtle gradient line -->
  <line x1="600" y1="180" x2="600" y2="450" stroke="${BLUE}" stroke-width="0.8" opacity="0.1"/>
  <!-- Left: code bracket -->
  <text x="430" y="340" text-anchor="middle" fill="${BLUE}" font-family="ui-monospace,monospace" font-size="90" font-weight="300" opacity="0.2" filter="url(#glow)">&lt;/&gt;</text>
  <!-- Right: content/edit icon — simple pencil line -->
  <path d="M740,260 L780,300 L730,350 L690,310 Z" fill="none" stroke="${GOLD}" stroke-width="1.5" opacity="0.25" filter="url(#glow)"/>
  <line x1="730" y1="350" x2="710" y2="370" stroke="${GOLD}" stroke-width="1.5" stroke-linecap="round" opacity="0.2"/>
`);

// ── 16. Topical Authority vs Domain Authority ── Two pillars
const topVsDomain = svg(`
  <ellipse cx="430" cy="315" rx="220" ry="200" fill="${BLUE}" opacity="0.05" filter="url(#blur-lg)"/>
  <ellipse cx="770" cy="315" rx="220" ry="200" fill="${GOLD}" opacity="0.04" filter="url(#blur-lg)"/>
  <!-- Left pillar — topical (clustered nodes) -->
  <rect x="400" y="200" width="120" height="250" rx="12" fill="${BLUE}" opacity="0.06" stroke="${BLUE}" stroke-width="1" stroke-opacity="0.12"/>
  <circle cx="460" cy="270" r="12" fill="${BLUE}" opacity="0.15" filter="url(#glow)"/>
  <circle cx="440" cy="320" r="9" fill="${BLUE}" opacity="0.1" filter="url(#glow)"/>
  <circle cx="480" cy="340" r="10" fill="${BLUE}" opacity="0.1" filter="url(#glow)"/>
  <circle cx="460" cy="390" r="8" fill="${BLUE}" opacity="0.08"/>
  <line x1="460" y1="282" x2="445" y2="311" stroke="${BLUE}" stroke-width="0.8" opacity="0.1"/>
  <line x1="460" y1="282" x2="478" y2="330" stroke="${BLUE}" stroke-width="0.8" opacity="0.1"/>
  <!-- Right pillar — domain (bar/authority) -->
  <rect x="680" y="200" width="120" height="250" rx="12" fill="${GOLD}" opacity="0.04" stroke="${GOLD}" stroke-width="1" stroke-opacity="0.1"/>
  <rect x="700" y="380" width="80" height="8" rx="4" fill="${GOLD}" opacity="0.15"/>
  <rect x="700" y="350" width="65" height="8" rx="4" fill="${GOLD}" opacity="0.12"/>
  <rect x="700" y="320" width="50" height="8" rx="4" fill="${GOLD}" opacity="0.1"/>
  <rect x="700" y="290" width="35" height="8" rx="4" fill="${GOLD}" opacity="0.07"/>
  <!-- VS -->
  <text x="600" y="332" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="14" font-weight="300" opacity="0.1">vs</text>
`);

// ── 17. What is a Content Brief ── Blueprint document
const contentBrief = svg(`
  <ellipse cx="580" cy="310" rx="250" ry="210" fill="${BLUE}" opacity="0.05" filter="url(#blur-lg)"/>
  <!-- Document with structure -->
  <rect x="450" y="170" width="240" height="310" rx="14" fill="${BLUE}" opacity="0.04" stroke="${BLUE}" stroke-width="1" stroke-opacity="0.12"/>
  <!-- Heading block -->
  <rect x="480" y="205" width="100" height="12" rx="6" fill="${GOLD}" opacity="0.2" filter="url(#glow)"/>
  <!-- Content lines -->
  <line x1="480" y1="245" x2="660" y2="245" stroke="${BLUE}" stroke-width="1.5" opacity="0.1"/>
  <line x1="480" y1="270" x2="630" y2="270" stroke="${BLUE}" stroke-width="1.5" opacity="0.08"/>
  <line x1="480" y1="295" x2="650" y2="295" stroke="${BLUE}" stroke-width="1.5" opacity="0.06"/>
  <!-- Section divider -->
  <line x1="480" y1="325" x2="660" y2="325" stroke="${GOLD}" stroke-width="0.5" opacity="0.1"/>
  <!-- Sub heading -->
  <rect x="480" y="345" width="70" height="10" rx="5" fill="${GOLD}" opacity="0.12"/>
  <!-- More lines -->
  <line x1="480" y1="378" x2="640" y2="378" stroke="${BLUE}" stroke-width="1.5" opacity="0.06"/>
  <line x1="480" y1="403" x2="620" y2="403" stroke="${BLUE}" stroke-width="1.5" opacity="0.05"/>
  <line x1="480" y1="428" x2="645" y2="428" stroke="${BLUE}" stroke-width="1.5" opacity="0.04"/>
  <!-- Corner fold -->
  <path d="M660,170 L690,170 L690,200 Z" fill="${BLUE}" opacity="0.06"/>
`);

// ── 18. What is E-E-A-T ── Shield
const eeat = svg(`
  <ellipse cx="600" cy="310" rx="220" ry="200" fill="${BLUE}" opacity="0.05" filter="url(#blur-lg)"/>
  <ellipse cx="600" cy="360" rx="150" ry="120" fill="${GOLD}" opacity="0.03" filter="url(#blur-lg)"/>
  <!-- Shield — elegant path -->
  <path d="M600,180 L700,225 L700,340 C700,410 600,450 600,450 C600,450 500,410 500,340 L500,225 Z"
    fill="url(#shield-grad)" opacity="0.2" filter="url(#glow)"/>
  <path d="M600,180 L700,225 L700,340 C700,410 600,450 600,450 C600,450 500,410 500,340 L500,225 Z"
    fill="none" stroke="${BLUE}" stroke-width="1.5" opacity="0.25"/>
  <!-- E E A T letters — stacked, refined -->
  <text x="600" y="270" text-anchor="middle" fill="${GOLD}" font-family="system-ui,sans-serif" font-size="18" font-weight="500" letter-spacing="4" opacity="0.4">E</text>
  <text x="600" y="303" text-anchor="middle" fill="${GOLD}" font-family="system-ui,sans-serif" font-size="18" font-weight="500" letter-spacing="4" opacity="0.35">E</text>
  <text x="600" y="336" text-anchor="middle" fill="${GOLD}" font-family="system-ui,sans-serif" font-size="18" font-weight="500" letter-spacing="4" opacity="0.3">A</text>
  <text x="600" y="369" text-anchor="middle" fill="${GOLD}" font-family="system-ui,sans-serif" font-size="18" font-weight="500" letter-spacing="4" opacity="0.25">T</text>
`, `<linearGradient id="shield-grad" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="${BLUE}" stop-opacity="0.6"/>
  <stop offset="100%" stop-color="${BLUE}" stop-opacity="0.05"/>
</linearGradient>`);

// ── 19. What is Entity SEO ── Knowledge graph nodes
const entitySeo = svg(`
  <ellipse cx="600" cy="310" rx="280" ry="220" fill="${BLUE}" opacity="0.05" filter="url(#blur-lg)"/>
  <!-- Central entity node -->
  <circle cx="600" cy="305" r="30" fill="${GOLD}" opacity="0.12" filter="url(#glow-strong)"/>
  <circle cx="600" cy="305" r="30" fill="none" stroke="${GOLD}" stroke-width="1.5" opacity="0.25"/>
  <!-- Connected nodes -->
  <circle cx="450" cy="230" r="20" fill="${BLUE}" opacity="0.08" filter="url(#glow)"/>
  <circle cx="450" cy="230" r="20" fill="none" stroke="${BLUE}" stroke-width="1" opacity="0.18"/>
  <circle cx="750" cy="250" r="20" fill="${BLUE}" opacity="0.08" filter="url(#glow)"/>
  <circle cx="750" cy="250" r="20" fill="none" stroke="${BLUE}" stroke-width="1" opacity="0.18"/>
  <circle cx="470" cy="410" r="18" fill="${BLUE}" opacity="0.06" filter="url(#glow)"/>
  <circle cx="470" cy="410" r="18" fill="none" stroke="${BLUE}" stroke-width="1" opacity="0.12"/>
  <circle cx="740" cy="400" r="18" fill="${BLUE}" opacity="0.06" filter="url(#glow)"/>
  <circle cx="740" cy="400" r="18" fill="none" stroke="${BLUE}" stroke-width="1" opacity="0.12"/>
  <!-- Connections — subtle gradient lines -->
  <line x1="573" y1="290" x2="468" y2="245" stroke="${BLUE}" stroke-width="1" opacity="0.1"/>
  <line x1="627" y1="290" x2="733" y2="263" stroke="${BLUE}" stroke-width="1" opacity="0.1"/>
  <line x1="580" y1="328" x2="486" y2="396" stroke="${BLUE}" stroke-width="0.8" opacity="0.08"/>
  <line x1="622" y1="328" x2="724" y2="388" stroke="${BLUE}" stroke-width="0.8" opacity="0.08"/>
  <!-- Cross connections -->
  <line x1="468" y1="245" x2="475" y2="392" stroke="${BLUE}" stroke-width="0.5" opacity="0.05"/>
  <line x1="733" y1="263" x2="735" y2="383" stroke="${BLUE}" stroke-width="0.5" opacity="0.05"/>
`);

// ── 20. What is LLM Optimisation ── Chat + AI sparkle
const llmOpt = svg(`
  <ellipse cx="550" cy="310" rx="270" ry="220" fill="${BLUE}" opacity="0.05" filter="url(#blur-lg)"/>
  <ellipse cx="700" cy="260" rx="180" ry="150" fill="${GOLD}" opacity="0.03" filter="url(#blur-lg)"/>
  <!-- Chat bubble — rounded, elegant -->
  <rect x="440" y="220" width="230" height="160" rx="20" fill="${BLUE}" opacity="0.06" stroke="${BLUE}" stroke-width="1" stroke-opacity="0.15"/>
  <!-- Bubble tail -->
  <path d="M510,380 L530,380 L490,420 Z" fill="${BLUE}" opacity="0.06" stroke="${BLUE}" stroke-width="1" stroke-opacity="0.12"/>
  <!-- Content lines in bubble -->
  <line x1="475" y1="265" x2="600" y2="265" stroke="${BLUE}" stroke-width="1.5" opacity="0.1"/>
  <line x1="475" y1="295" x2="635" y2="295" stroke="${BLUE}" stroke-width="1.5" opacity="0.08"/>
  <line x1="475" y1="325" x2="580" y2="325" stroke="${BLUE}" stroke-width="1.5" opacity="0.06"/>
  <!-- AI sparkle -->
  <path d="M720,250 L728,284 L762,292 L728,300 L720,334 L712,300 L678,292 L712,284 Z"
    fill="${GOLD}" opacity="0.35" filter="url(#glow-strong)"/>
  <path d="M760,330 L763,342 L775,345 L763,348 L760,360 L757,348 L745,345 L757,342 Z"
    fill="${GOLD}" opacity="0.15" filter="url(#glow)"/>
`);

// ── 21. WordPress vs Webflow ── Two circles, split
const wpVsWebflow = svg(`
  <ellipse cx="400" cy="315" rx="250" ry="200" fill="${BLUE}" opacity="0.05" filter="url(#blur-lg)"/>
  <ellipse cx="800" cy="315" rx="250" ry="200" fill="${GOLD}" opacity="0.04" filter="url(#blur-lg)"/>
  <!-- Divider -->
  <line x1="600" y1="190" x2="600" y2="440" stroke="white" stroke-width="0.5" opacity="0.06"/>
  <!-- Left: WordPress circle -->
  <circle cx="440" cy="315" r="80" fill="${BLUE}" opacity="0.06" filter="url(#glow)"/>
  <circle cx="440" cy="315" r="80" fill="none" stroke="${BLUE}" stroke-width="1.5" opacity="0.2"/>
  <text x="440" y="335" text-anchor="middle" fill="${BLUE}" font-family="Georgia,serif" font-size="55" font-weight="400" opacity="0.2">W</text>
  <!-- Right: Webflow circle -->
  <circle cx="760" cy="315" r="80" fill="${GOLD}" opacity="0.04" filter="url(#glow)"/>
  <circle cx="760" cy="315" r="80" fill="none" stroke="${GOLD}" stroke-width="1.5" opacity="0.15"/>
  <text x="760" y="335" text-anchor="middle" fill="${GOLD}" font-family="system-ui,sans-serif" font-size="50" font-weight="300" opacity="0.18">W</text>
  <!-- VS -->
  <text x="600" y="322" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="13" font-weight="300" opacity="0.1">vs</text>
`);

// Write all files
const images = {
  'b2b-content-marketing-services': b2bContent,
  'generative-engine-optimisation-2': geo,
  'google-algorithm-update-recovery': recovery,
  'how-long-does-seo-take': howLong,
  'how-many-keywords': howMany,
  'how-to-be-an-seo': beAnSeo,
  'how-to-build-topical-authority': topicalAuthBuild,
  'how-to-choose-seo-consultant': chooseSeo,
  'increase-organic-traffic': increaseTraffic,
  'intent-competition-data': intentData,
  'local-seo-berkshire-guide': localSeo,
  'optimise-content-for-ai-search': aiContent,
  'optimise-multiple-keywords': multiKeywords,
  'seo-mistakes': seoMistakes,
  'technical-seo-vs-on-page-seo': techVsOnpage,
  'topical-authority-vs-domain-authority': topVsDomain,
  'what-is-a-content-brief': contentBrief,
  'what-is-eeat-seo': eeat,
  'what-is-entity-seo': entitySeo,
  'what-is-llm-optimisation': llmOpt,
  'wordpress-vs-webflow': wpVsWebflow,
};

for (const [slug, content] of Object.entries(images)) {
  const path = join(OUT, `${slug}.svg`);
  writeFileSync(path, content.trim());
  console.log(`✓ ${slug}.svg`);
}

console.log(`\nDone: ${Object.keys(images).length} premium images generated.`);
