import { writeFileSync } from 'fs';
import { join } from 'path';

const OUT = join(import.meta.dirname, '..', 'public', 'images', 'blog');

// Colors
const BG = '#050507';
const BLUE = '#5B8AEF';
const GOLD = '#d79f1e';
const DIM_BLUE = '#5B8AEF33';
const DIM_GOLD = '#d79f1e22';
const MUTED = '#ffffff12';
const SOFT = '#ffffff08';

// Shared: subtle dot grid background
function dotGrid() {
  return `<defs>
    <pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="15" cy="15" r="0.6" fill="${MUTED}"/>
    </pattern>
    <radialGradient id="glow" cx="50%" cy="50%" r="45%">
      <stop offset="0%" stop-color="${BLUE}" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="${BG}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="${BG}"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect width="1200" height="630" fill="url(#dots)"/>`;
}

function svg(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
${dotGrid()}
${inner}
</svg>`;
}

// ── 1. B2B Content Marketing Services ── Funnel with content blocks
const b2bContent = svg(`
  <!-- Funnel -->
  <polygon points="480,180 720,180 660,420 540,420" fill="none" stroke="${BLUE}" stroke-width="2" opacity="0.7"/>
  <polygon points="540,420 660,420 640,470 560,470" fill="none" stroke="${BLUE}" stroke-width="2" opacity="0.5"/>
  <!-- Content blocks falling in -->
  <rect x="530" y="140" width="40" height="30" rx="4" fill="${BLUE}" opacity="0.5"/>
  <rect x="590" y="120" width="40" height="30" rx="4" fill="${GOLD}" opacity="0.5"/>
  <rect x="640" y="150" width="40" height="30" rx="4" fill="${BLUE}" opacity="0.3"/>
  <!-- Lines on blocks -->
  <line x1="536" y1="150" x2="562" y2="150" stroke="${BG}" stroke-width="2"/>
  <line x1="536" y1="157" x2="556" y2="157" stroke="${BG}" stroke-width="2"/>
  <line x1="596" y1="130" x2="622" y2="130" stroke="${BG}" stroke-width="2"/>
  <line x1="596" y1="137" x2="616" y2="137" stroke="${BG}" stroke-width="2"/>
  <!-- Output arrow -->
  <line x1="600" y1="470" x2="600" y2="510" stroke="${GOLD}" stroke-width="2.5"/>
  <polygon points="590,510 600,525 610,510" fill="${GOLD}"/>
  <!-- Dollar sign at bottom -->
  <text x="600" y="555" text-anchor="middle" fill="${GOLD}" font-family="system-ui" font-size="24" font-weight="600">$</text>
`);

// ── 2. Generative Engine Optimisation ── AI sparkle with search lens
const geo = svg(`
  <!-- Search magnifying glass -->
  <circle cx="570" cy="300" r="70" fill="none" stroke="${BLUE}" stroke-width="2.5" opacity="0.8"/>
  <line x1="619" y1="349" x2="670" y2="400" stroke="${BLUE}" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
  <!-- AI sparkle inside lens -->
  <path d="M570,260 L575,285 L600,290 L575,295 L570,320 L565,295 L540,290 L565,285 Z" fill="${GOLD}" opacity="0.8"/>
  <!-- Small sparkles around -->
  <path d="M500,240 L503,250 L513,253 L503,256 L500,266 L497,256 L487,253 L497,250 Z" fill="${BLUE}" opacity="0.3"/>
  <path d="M660,270 L662,277 L669,279 L662,281 L660,288 L658,281 L651,279 L658,277 Z" fill="${BLUE}" opacity="0.25"/>
  <path d="M530,370 L532,377 L539,379 L532,381 L530,388 L528,381 L521,379 L528,377 Z" fill="${GOLD}" opacity="0.25"/>
`);

// ── 3. Google Algorithm Update Recovery ── Chart with dip and recovery
const recovery = svg(`
  <!-- Axis -->
  <line x1="380" y1="450" x2="820" y2="450" stroke="${MUTED}" stroke-width="1.5"/>
  <line x1="380" y1="180" x2="380" y2="450" stroke="${MUTED}" stroke-width="1.5"/>
  <!-- Recovery line -->
  <polyline points="400,220 480,230 520,240 540,350 560,400 580,420 610,380 660,300 720,240 780,210 800,200"
    fill="none" stroke="${BLUE}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Dip zone highlight -->
  <rect x="530" y="330" width="80" height="100" rx="4" fill="${GOLD}" opacity="0.08"/>
  <!-- Recovery arrow -->
  <path d="M610,390 C640,390 660,350 680,310" fill="none" stroke="${GOLD}" stroke-width="2" stroke-dasharray="4,4"/>
  <polygon points="682,304 688,316 676,314" fill="${GOLD}" opacity="0.7"/>
  <!-- Lightning bolt at dip -->
  <path d="M570,340 L560,360 L572,358 L564,380" fill="none" stroke="${GOLD}" stroke-width="2" stroke-linecap="round"/>
`);

// ── 4. How Long Does SEO Take ── Hourglass
const howLong = svg(`
  <!-- Hourglass frame -->
  <line x1="540" y1="180" x2="660" y2="180" stroke="${BLUE}" stroke-width="3" stroke-linecap="round"/>
  <line x1="540" y1="450" x2="660" y2="450" stroke="${BLUE}" stroke-width="3" stroke-linecap="round"/>
  <!-- Glass shape -->
  <path d="M550,185 L550,270 C550,315 600,315 600,315 C600,315 650,315 650,270 L650,185" fill="none" stroke="${BLUE}" stroke-width="2" opacity="0.7"/>
  <path d="M550,445 L550,360 C550,315 600,315 600,315 C600,315 650,315 650,360 L650,445" fill="none" stroke="${BLUE}" stroke-width="2" opacity="0.7"/>
  <!-- Sand top -->
  <path d="M560,225 L640,225 L610,290 L590,290 Z" fill="${GOLD}" opacity="0.2"/>
  <!-- Sand stream -->
  <line x1="600" y1="295" x2="600" y2="340" stroke="${GOLD}" stroke-width="1.5" opacity="0.5"/>
  <!-- Sand bottom -->
  <path d="M565,430 L635,430 L615,370 L585,370 Z" fill="${GOLD}" opacity="0.3"/>
  <!-- Time marks -->
  <text x="690" y="230" fill="${MUTED}" font-family="system-ui" font-size="13">3 mo</text>
  <text x="690" y="315" fill="${BLUE}" font-family="system-ui" font-size="13" opacity="0.5">6 mo</text>
  <text x="690" y="430" fill="${GOLD}" font-family="system-ui" font-size="13" opacity="0.5">12 mo</text>
`);

// ── 5. How Many Keywords ── Scattered keys with question mark
const howMany = svg(`
  <!-- Central question mark -->
  <text x="600" y="340" text-anchor="middle" fill="${BLUE}" font-family="system-ui" font-size="100" font-weight="700" opacity="0.15">?</text>
  <!-- Keyword pills scattered -->
  <rect x="430" y="220" width="90" height="32" rx="16" fill="${BLUE}" opacity="0.2"/>
  <rect x="440" y="230" width="50" height="4" rx="2" fill="${BLUE}" opacity="0.4"/>
  <rect x="540" y="190" width="70" height="32" rx="16" fill="${GOLD}" opacity="0.2"/>
  <rect x="550" y="200" width="40" height="4" rx="2" fill="${GOLD}" opacity="0.4"/>
  <rect x="630" y="210" width="100" height="32" rx="16" fill="${BLUE}" opacity="0.15"/>
  <rect x="640" y="220" width="60" height="4" rx="2" fill="${BLUE}" opacity="0.3"/>
  <rect x="460" y="370" width="80" height="32" rx="16" fill="${BLUE}" opacity="0.15"/>
  <rect x="470" y="380" width="45" height="4" rx="2" fill="${BLUE}" opacity="0.3"/>
  <rect x="580" y="390" width="110" height="32" rx="16" fill="${GOLD}" opacity="0.15"/>
  <rect x="590" y="400" width="65" height="4" rx="2" fill="${GOLD}" opacity="0.3"/>
  <rect x="680" y="350" width="75" height="32" rx="16" fill="${BLUE}" opacity="0.12"/>
  <rect x="690" y="360" width="40" height="4" rx="2" fill="${BLUE}" opacity="0.25"/>
`);

// ── 6. How to Be an SEO ── Person silhouette with growth path
const beAnSeo = svg(`
  <!-- Simple person icon -->
  <circle cx="520" cy="270" r="22" fill="none" stroke="${BLUE}" stroke-width="2.5"/>
  <path d="M495,340 Q495,300 520,295 Q545,300 545,340" fill="none" stroke="${BLUE}" stroke-width="2.5"/>
  <!-- Career stepping stones going up -->
  <rect x="580" y="380" width="50" height="8" rx="4" fill="${BLUE}" opacity="0.3"/>
  <rect x="620" y="340" width="50" height="8" rx="4" fill="${BLUE}" opacity="0.4"/>
  <rect x="660" y="300" width="50" height="8" rx="4" fill="${BLUE}" opacity="0.5"/>
  <rect x="700" y="260" width="50" height="8" rx="4" fill="${GOLD}" opacity="0.6"/>
  <!-- Arrow going up -->
  <polyline points="605,384 645,344 685,304 725,264" fill="none" stroke="${GOLD}" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.5"/>
  <polygon points="728,258 730,270 720,265" fill="${GOLD}" opacity="0.5"/>
`);

// ── 7. How to Build Topical Authority ── Pyramid of connected blocks
const topicalAuthority = svg(`
  <!-- Pyramid blocks -->
  <!-- Top -->
  <rect x="565" y="190" width="70" height="45" rx="6" fill="${GOLD}" opacity="0.25" stroke="${GOLD}" stroke-width="1.5" stroke-opacity="0.4"/>
  <!-- Middle row -->
  <rect x="500" y="260" width="70" height="45" rx="6" fill="${BLUE}" opacity="0.2" stroke="${BLUE}" stroke-width="1.5" stroke-opacity="0.3"/>
  <rect x="630" y="260" width="70" height="45" rx="6" fill="${BLUE}" opacity="0.2" stroke="${BLUE}" stroke-width="1.5" stroke-opacity="0.3"/>
  <!-- Bottom row -->
  <rect x="435" y="330" width="70" height="45" rx="6" fill="${BLUE}" opacity="0.12" stroke="${BLUE}" stroke-width="1" stroke-opacity="0.2"/>
  <rect x="565" y="330" width="70" height="45" rx="6" fill="${BLUE}" opacity="0.12" stroke="${BLUE}" stroke-width="1" stroke-opacity="0.2"/>
  <rect x="695" y="330" width="70" height="45" rx="6" fill="${BLUE}" opacity="0.12" stroke="${BLUE}" stroke-width="1" stroke-opacity="0.2"/>
  <!-- Connecting lines -->
  <line x1="600" y1="235" x2="535" y2="260" stroke="${BLUE}" stroke-width="1" opacity="0.3"/>
  <line x1="600" y1="235" x2="665" y2="260" stroke="${BLUE}" stroke-width="1" opacity="0.3"/>
  <line x1="535" y1="305" x2="470" y2="330" stroke="${BLUE}" stroke-width="1" opacity="0.2"/>
  <line x1="535" y1="305" x2="600" y2="330" stroke="${BLUE}" stroke-width="1" opacity="0.2"/>
  <line x1="665" y1="305" x2="600" y2="330" stroke="${BLUE}" stroke-width="1" opacity="0.2"/>
  <line x1="665" y1="305" x2="730" y2="330" stroke="${BLUE}" stroke-width="1" opacity="0.2"/>
  <!-- Lines inside blocks (content) -->
  <line x1="578" y1="207" x2="622" y2="207" stroke="${GOLD}" stroke-width="2" opacity="0.5"/>
  <line x1="583" y1="218" x2="615" y2="218" stroke="${GOLD}" stroke-width="2" opacity="0.3"/>
`);

// ── 8. How to Choose an SEO Consultant ── Magnifying glass over checkmarks
const chooseSeo = svg(`
  <!-- Checklist -->
  <rect x="470" y="200" width="200" height="260" rx="10" fill="none" stroke="${BLUE}" stroke-width="1.5" opacity="0.3"/>
  <!-- Check items -->
  <polyline points="495,240 502,248 515,232" fill="none" stroke="${GOLD}" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="530" y1="240" x2="640" y2="240" stroke="${MUTED}" stroke-width="2"/>
  <polyline points="495,280 502,288 515,272" fill="none" stroke="${GOLD}" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="530" y1="280" x2="620" y2="280" stroke="${MUTED}" stroke-width="2"/>
  <polyline points="495,320 502,328 515,312" fill="none" stroke="${GOLD}" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="530" y1="320" x2="635" y2="320" stroke="${MUTED}" stroke-width="2"/>
  <rect x="490" y="352" width="20" height="20" rx="3" fill="none" stroke="${BLUE}" stroke-width="1.5" opacity="0.3"/>
  <line x1="530" y1="362" x2="610" y2="362" stroke="${MUTED}" stroke-width="2"/>
  <rect x="490" y="392" width="20" height="20" rx="3" fill="none" stroke="${BLUE}" stroke-width="1.5" opacity="0.3"/>
  <line x1="530" y1="402" x2="630" y2="402" stroke="${MUTED}" stroke-width="2"/>
  <!-- Magnifying glass overlaid -->
  <circle cx="680" cy="320" r="55" fill="${BG}" fill-opacity="0.6" stroke="${BLUE}" stroke-width="2.5"/>
  <line x1="718" y1="358" x2="760" y2="400" stroke="${BLUE}" stroke-width="3.5" stroke-linecap="round"/>
`);

// ── 9. Increase Organic Traffic ── Bold growth chart with arrow
const increaseTraffic = svg(`
  <!-- Bar chart -->
  <rect x="430" y="380" width="40" height="70" rx="4" fill="${BLUE}" opacity="0.15"/>
  <rect x="490" y="350" width="40" height="100" rx="4" fill="${BLUE}" opacity="0.2"/>
  <rect x="550" y="310" width="40" height="140" rx="4" fill="${BLUE}" opacity="0.3"/>
  <rect x="610" y="270" width="40" height="180" rx="4" fill="${BLUE}" opacity="0.4"/>
  <rect x="670" y="220" width="40" height="230" rx="4" fill="${BLUE}" opacity="0.5"/>
  <rect x="730" y="180" width="40" height="270" rx="4" fill="${GOLD}" opacity="0.4"/>
  <!-- Baseline -->
  <line x1="410" y1="450" x2="790" y2="450" stroke="${MUTED}" stroke-width="1.5"/>
  <!-- Growth arrow -->
  <path d="M440,370 Q600,300 760,185" fill="none" stroke="${GOLD}" stroke-width="2.5" stroke-linecap="round"/>
  <polygon points="765,178 770,195 755,190" fill="${GOLD}"/>
`);

// ── 10. Intent, Competition & Data ── Target crosshair with data rings
const intentData = svg(`
  <!-- Outer rings -->
  <circle cx="600" cy="315" r="120" fill="none" stroke="${BLUE}" stroke-width="1" opacity="0.15"/>
  <circle cx="600" cy="315" r="85" fill="none" stroke="${BLUE}" stroke-width="1.5" opacity="0.25"/>
  <circle cx="600" cy="315" r="50" fill="none" stroke="${BLUE}" stroke-width="2" opacity="0.4"/>
  <circle cx="600" cy="315" r="15" fill="${GOLD}" opacity="0.4"/>
  <!-- Crosshair -->
  <line x1="600" y1="175" x2="600" y2="455" stroke="${BLUE}" stroke-width="1" opacity="0.2"/>
  <line x1="460" y1="315" x2="740" y2="315" stroke="${BLUE}" stroke-width="1" opacity="0.2"/>
  <!-- Data points scattered on rings -->
  <circle cx="520" cy="260" r="5" fill="${BLUE}" opacity="0.5"/>
  <circle cx="680" cy="370" r="5" fill="${BLUE}" opacity="0.5"/>
  <circle cx="560" cy="385" r="4" fill="${GOLD}" opacity="0.4"/>
  <circle cx="650" cy="250" r="4" fill="${GOLD}" opacity="0.4"/>
  <circle cx="540" cy="315" r="4" fill="${BLUE}" opacity="0.35"/>
  <circle cx="660" cy="300" r="3" fill="${BLUE}" opacity="0.3"/>
`);

// ── 11. Local SEO Berkshire Guide ── Map pin with radiating circles
const localSeo = svg(`
  <!-- Pin -->
  <path d="M600,220 C570,220 545,248 545,280 C545,330 600,400 600,400 C600,400 655,330 655,280 C655,248 630,220 600,220 Z"
    fill="none" stroke="${BLUE}" stroke-width="2.5" opacity="0.7"/>
  <circle cx="600" cy="278" r="18" fill="${GOLD}" opacity="0.35"/>
  <!-- Radiating location circles -->
  <circle cx="600" cy="350" r="60" fill="none" stroke="${BLUE}" stroke-width="1" opacity="0.12" stroke-dasharray="4,4"/>
  <circle cx="600" cy="350" r="100" fill="none" stroke="${BLUE}" stroke-width="1" opacity="0.08" stroke-dasharray="4,4"/>
  <circle cx="600" cy="350" r="140" fill="none" stroke="${BLUE}" stroke-width="1" opacity="0.05" stroke-dasharray="4,4"/>
`);

// ── 12. Optimise Content for AI Search ── Document with AI sparkle
const aiContent = svg(`
  <!-- Document -->
  <rect x="510" y="190" width="140" height="180" rx="8" fill="none" stroke="${BLUE}" stroke-width="2" opacity="0.5"/>
  <!-- Document lines -->
  <line x1="530" y1="225" x2="630" y2="225" stroke="${MUTED}" stroke-width="2"/>
  <line x1="530" y1="250" x2="610" y2="250" stroke="${MUTED}" stroke-width="2"/>
  <line x1="530" y1="275" x2="625" y2="275" stroke="${MUTED}" stroke-width="2"/>
  <line x1="530" y1="300" x2="590" y2="300" stroke="${MUTED}" stroke-width="2"/>
  <line x1="530" y1="325" x2="615" y2="325" stroke="${MUTED}" stroke-width="2"/>
  <line x1="530" y1="350" x2="580" y2="350" stroke="${MUTED}" stroke-width="2"/>
  <!-- AI sparkle overlapping top-right -->
  <path d="M660,210 L666,235 L691,241 L666,247 L660,272 L654,247 L629,241 L654,235 Z" fill="${GOLD}" opacity="0.6"/>
  <!-- Small sparkles -->
  <path d="M690,270 L693,280 L703,283 L693,286 L690,296 L687,286 L677,283 L687,280 Z" fill="${GOLD}" opacity="0.3"/>
  <!-- AI arrow going into doc -->
  <path d="M670,300 C655,310 645,330 640,350" fill="none" stroke="${GOLD}" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.4"/>
`);

// ── 13. Optimise Multiple Keywords ── Multiple bullseye targets
const multiKeywords = svg(`
  <!-- Main target -->
  <circle cx="560" cy="300" r="60" fill="none" stroke="${BLUE}" stroke-width="1.5" opacity="0.3"/>
  <circle cx="560" cy="300" r="35" fill="none" stroke="${BLUE}" stroke-width="1.5" opacity="0.5"/>
  <circle cx="560" cy="300" r="10" fill="${BLUE}" opacity="0.5"/>
  <!-- Second target -->
  <circle cx="700" cy="250" r="45" fill="none" stroke="${GOLD}" stroke-width="1.5" opacity="0.2"/>
  <circle cx="700" cy="250" r="25" fill="none" stroke="${GOLD}" stroke-width="1.5" opacity="0.35"/>
  <circle cx="700" cy="250" r="7" fill="${GOLD}" opacity="0.4"/>
  <!-- Third target -->
  <circle cx="660" cy="390" r="35" fill="none" stroke="${BLUE}" stroke-width="1" opacity="0.2"/>
  <circle cx="660" cy="390" r="18" fill="none" stroke="${BLUE}" stroke-width="1" opacity="0.3"/>
  <circle cx="660" cy="390" r="5" fill="${BLUE}" opacity="0.35"/>
  <!-- Connecting dashes -->
  <line x1="610" y1="275" x2="660" y2="260" stroke="${MUTED}" stroke-width="1" stroke-dasharray="3,3"/>
  <line x1="595" y1="340" x2="635" y2="375" stroke="${MUTED}" stroke-width="1" stroke-dasharray="3,3"/>
`);

// ── 14. SEO Mistakes ── Warning triangle with X marks
const seoMistakes = svg(`
  <!-- Warning triangle -->
  <path d="M600,190 L720,410 L480,410 Z" fill="none" stroke="${GOLD}" stroke-width="2.5" opacity="0.5"/>
  <!-- Exclamation mark -->
  <line x1="600" y1="260" x2="600" y2="340" stroke="${GOLD}" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
  <circle cx="600" cy="370" r="5" fill="${GOLD}" opacity="0.6"/>
  <!-- X marks around -->
  <g opacity="0.3">
    <line x1="430" y1="260" x2="455" y2="285" stroke="${BLUE}" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="455" y1="260" x2="430" y2="285" stroke="${BLUE}" stroke-width="2.5" stroke-linecap="round"/>
  </g>
  <g opacity="0.25">
    <line x1="740" y1="280" x2="765" y2="305" stroke="${BLUE}" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="765" y1="280" x2="740" y2="305" stroke="${BLUE}" stroke-width="2.5" stroke-linecap="round"/>
  </g>
  <g opacity="0.2">
    <line x1="500" y1="430" x2="520" y2="450" stroke="${BLUE}" stroke-width="2" stroke-linecap="round"/>
    <line x1="520" y1="430" x2="500" y2="450" stroke="${BLUE}" stroke-width="2" stroke-linecap="round"/>
  </g>
`);

// ── 15. Technical SEO vs On-Page SEO ── Code brackets vs pencil
const techVsOnpage = svg(`
  <!-- Divider line -->
  <line x1="600" y1="190" x2="600" y2="440" stroke="${MUTED}" stroke-width="1.5"/>
  <text x="600" y="475" text-anchor="middle" fill="${MUTED}" font-family="system-ui" font-size="14">vs</text>
  <!-- Left: Code brackets (Technical) -->
  <text x="500" y="330" text-anchor="middle" fill="${BLUE}" font-family="monospace" font-size="80" opacity="0.4">&lt;/&gt;</text>
  <!-- Right: Pencil icon (On-Page/Content) -->
  <g transform="translate(680,280) rotate(-45)">
    <rect x="-8" y="-50" width="16" height="70" rx="2" fill="none" stroke="${GOLD}" stroke-width="2" opacity="0.5"/>
    <polygon points="-8,20 8,20 0,35" fill="none" stroke="${GOLD}" stroke-width="2" opacity="0.5"/>
    <line x1="-8" y1="-30" x2="8" y2="-30" stroke="${GOLD}" stroke-width="1.5" opacity="0.3"/>
  </g>
  <!-- Small labels -->
  <text x="500" y="390" text-anchor="middle" fill="${BLUE}" font-family="system-ui" font-size="12" opacity="0.35">TECHNICAL</text>
  <text x="700" y="390" text-anchor="middle" fill="${GOLD}" font-family="system-ui" font-size="12" opacity="0.35">ON-PAGE</text>
`);

// ── 16. Topical Authority vs Domain Authority ── Two pillars
const topVsDomain = svg(`
  <!-- Left pillar (Topical) -->
  <rect x="430" y="220" width="100" height="220" rx="6" fill="${BLUE}" opacity="0.12" stroke="${BLUE}" stroke-width="2" stroke-opacity="0.3"/>
  <!-- Internal structure (content clusters) -->
  <circle cx="480" cy="270" r="12" fill="${BLUE}" opacity="0.2"/>
  <circle cx="460" cy="310" r="8" fill="${BLUE}" opacity="0.15"/>
  <circle cx="500" cy="305" r="10" fill="${BLUE}" opacity="0.15"/>
  <circle cx="480" cy="350" r="9" fill="${BLUE}" opacity="0.12"/>
  <line x1="480" y1="282" x2="465" y2="302" stroke="${BLUE}" stroke-width="1" opacity="0.2"/>
  <line x1="480" y1="282" x2="497" y2="297" stroke="${BLUE}" stroke-width="1" opacity="0.2"/>
  <line x1="475" y1="318" x2="478" y2="341" stroke="${BLUE}" stroke-width="1" opacity="0.15"/>
  <!-- Right pillar (Domain) -->
  <rect x="670" y="220" width="100" height="220" rx="6" fill="${GOLD}" opacity="0.1" stroke="${GOLD}" stroke-width="2" stroke-opacity="0.25"/>
  <!-- Internal (links/authority) -->
  <line x1="695" y1="270" x2="745" y2="270" stroke="${GOLD}" stroke-width="2" opacity="0.2"/>
  <line x1="695" y1="300" x2="735" y2="300" stroke="${GOLD}" stroke-width="2" opacity="0.15"/>
  <line x1="695" y1="330" x2="740" y2="330" stroke="${GOLD}" stroke-width="2" opacity="0.12"/>
  <line x1="695" y1="360" x2="725" y2="360" stroke="${GOLD}" stroke-width="2" opacity="0.1"/>
  <line x1="695" y1="390" x2="730" y2="390" stroke="${GOLD}" stroke-width="2" opacity="0.08"/>
  <!-- VS -->
  <text x="600" y="340" text-anchor="middle" fill="${MUTED}" font-family="system-ui" font-size="18">vs</text>
  <!-- Labels -->
  <text x="480" y="465" text-anchor="middle" fill="${BLUE}" font-family="system-ui" font-size="11" opacity="0.4">TOPICAL</text>
  <text x="720" y="465" text-anchor="middle" fill="${GOLD}" font-family="system-ui" font-size="11" opacity="0.35">DOMAIN</text>
`);

// ── 17. What is a Content Brief ── Blueprint/document with structure
const contentBrief = svg(`
  <!-- Main document -->
  <rect x="460" y="170" width="220" height="290" rx="8" fill="none" stroke="${BLUE}" stroke-width="2" opacity="0.4"/>
  <!-- Corner fold -->
  <path d="M640,170 L680,170 L680,210 L640,210 Z" fill="${BG}" stroke="${BLUE}" stroke-width="2" opacity="0.4"/>
  <path d="M640,170 L680,210" fill="none" stroke="${BLUE}" stroke-width="1.5" opacity="0.3"/>
  <!-- Structure lines -->
  <rect x="485" y="200" width="80" height="10" rx="3" fill="${GOLD}" opacity="0.3"/>
  <line x1="485" y1="235" x2="640" y2="235" stroke="${MUTED}" stroke-width="2"/>
  <line x1="485" y1="260" x2="620" y2="260" stroke="${MUTED}" stroke-width="2"/>
  <line x1="485" y1="285" x2="635" y2="285" stroke="${MUTED}" stroke-width="2"/>
  <!-- Section divider -->
  <line x1="485" y1="310" x2="655" y2="310" stroke="${BLUE}" stroke-width="1" opacity="0.2"/>
  <!-- Sub heading -->
  <rect x="485" y="325" width="60" height="8" rx="3" fill="${GOLD}" opacity="0.2"/>
  <line x1="485" y1="352" x2="630" y2="352" stroke="${MUTED}" stroke-width="2"/>
  <line x1="485" y1="377" x2="610" y2="377" stroke="${MUTED}" stroke-width="2"/>
  <line x1="485" y1="402" x2="625" y2="402" stroke="${MUTED}" stroke-width="2"/>
  <line x1="485" y1="427" x2="580" y2="427" stroke="${MUTED}" stroke-width="2"/>
  <!-- Annotation arrow -->
  <path d="M710,250 L670,250" fill="none" stroke="${GOLD}" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.4"/>
  <circle cx="716" cy="250" r="3" fill="${GOLD}" opacity="0.4"/>
`);

// ── 18. What is E-E-A-T in SEO ── Shield with EEAT letters
const eeat = svg(`
  <!-- Shield shape -->
  <path d="M600,190 L680,230 L680,340 C680,400 600,440 600,440 C600,440 520,400 520,340 L520,230 Z"
    fill="none" stroke="${BLUE}" stroke-width="2.5" opacity="0.5"/>
  <!-- Inner glow -->
  <path d="M600,210 L665,242 L665,335 C665,385 600,420 600,420 C600,420 535,385 535,335 L535,242 Z"
    fill="${BLUE}" opacity="0.05"/>
  <!-- EEAT letters stacked -->
  <text x="600" y="275" text-anchor="middle" fill="${GOLD}" font-family="system-ui" font-size="16" font-weight="600" opacity="0.6">E</text>
  <text x="600" y="305" text-anchor="middle" fill="${GOLD}" font-family="system-ui" font-size="16" font-weight="600" opacity="0.5">E</text>
  <text x="600" y="335" text-anchor="middle" fill="${GOLD}" font-family="system-ui" font-size="16" font-weight="600" opacity="0.4">A</text>
  <text x="600" y="365" text-anchor="middle" fill="${GOLD}" font-family="system-ui" font-size="16" font-weight="600" opacity="0.35">T</text>
  <!-- Checkmark on shield -->
  <polyline points="575,395 595,415 630,370" fill="none" stroke="${GOLD}" stroke-width="0" opacity="0"/>
`);

// ── 19. What is Entity SEO ── Knowledge graph with labeled nodes
const entitySeo = svg(`
  <!-- Central entity -->
  <circle cx="600" cy="310" r="35" fill="${GOLD}" opacity="0.12" stroke="${GOLD}" stroke-width="2" stroke-opacity="0.4"/>
  <text x="600" y="315" text-anchor="middle" fill="${GOLD}" font-family="system-ui" font-size="11" opacity="0.6">ENTITY</text>
  <!-- Connected nodes -->
  <circle cx="470" cy="240" r="25" fill="${BLUE}" opacity="0.08" stroke="${BLUE}" stroke-width="1.5" stroke-opacity="0.3"/>
  <text x="470" y="244" text-anchor="middle" fill="${BLUE}" font-family="system-ui" font-size="9" opacity="0.45">Person</text>
  <circle cx="730" cy="260" r="25" fill="${BLUE}" opacity="0.08" stroke="${BLUE}" stroke-width="1.5" stroke-opacity="0.3"/>
  <text x="730" y="264" text-anchor="middle" fill="${BLUE}" font-family="system-ui" font-size="9" opacity="0.45">Brand</text>
  <circle cx="490" cy="410" r="25" fill="${BLUE}" opacity="0.08" stroke="${BLUE}" stroke-width="1.5" stroke-opacity="0.3"/>
  <text x="490" y="414" text-anchor="middle" fill="${BLUE}" font-family="system-ui" font-size="9" opacity="0.45">Topic</text>
  <circle cx="720" cy="400" r="25" fill="${BLUE}" opacity="0.08" stroke="${BLUE}" stroke-width="1.5" stroke-opacity="0.3"/>
  <text x="720" y="404" text-anchor="middle" fill="${BLUE}" font-family="system-ui" font-size="9" opacity="0.45">Place</text>
  <!-- Connections -->
  <line x1="568" y1="295" x2="493" y2="258" stroke="${BLUE}" stroke-width="1.5" opacity="0.2"/>
  <line x1="633" y1="298" x2="707" y2="272" stroke="${BLUE}" stroke-width="1.5" opacity="0.2"/>
  <line x1="578" y1="338" x2="510" y2="392" stroke="${BLUE}" stroke-width="1.5" opacity="0.2"/>
  <line x1="628" y1="335" x2="698" y2="385" stroke="${BLUE}" stroke-width="1.5" opacity="0.2"/>
`);

// ── 20. What is LLM Optimisation ── Chat bubble with AI sparkle
const llmOpt = svg(`
  <!-- Chat bubble -->
  <rect x="470" y="210" width="200" height="140" rx="16" fill="none" stroke="${BLUE}" stroke-width="2" opacity="0.5"/>
  <polygon points="530,350 550,350 520,385" fill="${BG}" stroke="${BLUE}" stroke-width="2" opacity="0.5"/>
  <line x1="531" y1="349" x2="549" y2="349" stroke="${BG}" stroke-width="3"/>
  <!-- Content lines inside bubble -->
  <line x1="500" y1="255" x2="580" y2="255" stroke="${MUTED}" stroke-width="2"/>
  <line x1="500" y1="280" x2="640" y2="280" stroke="${MUTED}" stroke-width="2"/>
  <line x1="500" y1="305" x2="610" y2="305" stroke="${MUTED}" stroke-width="2"/>
  <!-- AI sparkle -->
  <path d="M700,250 L706,275 L731,281 L706,287 L700,312 L694,287 L669,281 L694,275 Z" fill="${GOLD}" opacity="0.5"/>
  <!-- Small sparkle -->
  <path d="M730,310 L733,320 L743,323 L733,326 L730,336 L727,326 L717,323 L727,320 Z" fill="${GOLD}" opacity="0.25"/>
  <!-- Connection from sparkle to bubble -->
  <path d="M685,281 L670,281" fill="none" stroke="${GOLD}" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.3"/>
`);

// ── 21. WordPress vs Webflow ── Two platform icons facing off
const wpVsWebflow = svg(`
  <!-- Divider -->
  <line x1="600" y1="200" x2="600" y2="430" stroke="${MUTED}" stroke-width="1.5"/>
  <!-- Left: WordPress W -->
  <circle cx="480" cy="315" r="70" fill="none" stroke="${BLUE}" stroke-width="2" opacity="0.3"/>
  <text x="480" y="340" text-anchor="middle" fill="${BLUE}" font-family="serif" font-size="60" font-weight="700" opacity="0.4">W</text>
  <!-- Right: Webflow abstract -->
  <circle cx="720" cy="315" r="70" fill="none" stroke="${GOLD}" stroke-width="2" opacity="0.25"/>
  <text x="720" y="340" text-anchor="middle" fill="${GOLD}" font-family="system-ui" font-size="48" font-weight="700" opacity="0.35">W</text>
  <!-- VS -->
  <circle cx="600" cy="315" r="20" fill="${BG}" stroke="${MUTED}" stroke-width="1.5"/>
  <text x="600" y="321" text-anchor="middle" fill="${MUTED}" font-family="system-ui" font-size="14" font-weight="600">vs</text>
`);

// Write all files
const images = {
  'b2b-content-marketing-services': b2bContent,
  'generative-engine-optimisation-2': geo,
  'google-algorithm-update-recovery': recovery,
  'how-long-does-seo-take': howLong,
  'how-many-keywords': howMany,
  'how-to-be-an-seo': beAnSeo,
  'how-to-build-topical-authority': topicalAuthority,
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

console.log(`\nDone: ${Object.keys(images).length} images generated.`);
