import { BERKSHIRE_TOWNS, projectTown } from "@/data/berkshire-towns";
import styles from "./CoverageMap.module.css";

interface CoverageMapProps {
  /** Pass explicitly per page; do not assume UK-wide remote coverage. */
  caption: string;
  /** Heading for the accessible town navigation. */
  listHeading?: string;
}

const WIDTH = 360;
const HEIGHT = 270;
const PADDING = 32;
const refLat = BERKSHIRE_TOWNS.find((town) => town.isBase)!.lat;
const projected = BERKSHIRE_TOWNS.map((town) => ({ ...town, ...projectTown(town, refLat) }));
const minX = Math.min(...projected.map((town) => town.x));
const maxX = Math.max(...projected.map((town) => town.x));
const minY = Math.min(...projected.map((town) => town.y));
const maxY = Math.max(...projected.map((town) => town.y));
// One scale for both axes preserves relative geography; centre the bounding box.
const scale = Math.min((WIDTH - 2 * PADDING) / (maxX - minX), (HEIGHT - 2 * PADDING) / (maxY - minY));
const towns = projected.map((town) => ({
  ...town,
  x: WIDTH / 2 + (town.x - (minX + maxX) / 2) * scale,
  y: HEIGHT / 2 + (town.y - (minY + maxY) / 2) * scale,
}));
const base = towns.find((town) => town.isBase)!;

// Stagger only labels, never nodes. Fine leader lines identify close neighbours.
const labels: Record<string, { x: number; y: number; anchor: "start" | "middle" | "end" }> = {
  Hungerford: { x: 12, y: 137, anchor: "start" },
  Newbury: { x: 68, y: 202, anchor: "middle" },
  Thatcham: { x: 121, y: 231, anchor: "middle" },
  Reading: { x: 183, y: 104, anchor: "middle" },
  Wokingham: { x: 229, y: 258, anchor: "middle" },
  Bracknell: { x: 302, y: 211, anchor: "middle" },
  Maidenhead: { x: 259, y: 49, anchor: "middle" },
  Windsor: { x: 348, y: 154, anchor: "end" },
  Slough: { x: 348, y: 80, anchor: "end" },
};

export function CoverageMap({ caption, listHeading = "Towns covered" }: CoverageMapProps) {
  return (
    <figure className={styles.figure}>
      <svg
        className={styles.map}
        role="img"
        aria-labelledby="coverage-map-title coverage-map-desc"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width="100%"
        height="auto"
      >
        <title id="coverage-map-title">Berkshire towns served</title>
        <desc id="coverage-map-desc">
          Schematic map of Berkshire towns served, with Reading as the base.
          Positions approximate; north is up and west is left. Use the town list below to navigate.
        </desc>
        <defs>
          <filter id="coverage-map-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="1.8" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {towns.filter((town) => !town.isBase).map((town) => (
            <linearGradient
              key={town.name}
              id={`coverage-map-line-${town.name}`}
              gradientUnits="userSpaceOnUse"
              x1={town.x} y1={town.y} x2={base.x} y2={base.y}
            >
              <stop offset="0%" stopColor="#5B8AEF" />
              <stop offset="100%" stopColor="#D79F1E" />
            </linearGradient>
          ))}
        </defs>
        <rect width={WIDTH} height={HEIGHT} fill="#050507" />
        <g className={styles.connections} aria-hidden="true" opacity="0.6" filter="url(#coverage-map-glow)">
          {towns.filter((town) => !town.isBase).map((town) => (
            <line key={town.name} x1={town.x} y1={town.y} x2={base.x} y2={base.y}
              stroke={`url(#coverage-map-line-${town.name})`} strokeWidth="1.5" />
          ))}
        </g>
        {towns.map((town) => {
          const label = labels[town.name];
          const node = (
            <>
              <line
                x1={town.x} y1={town.y}
                x2={Math.max(label.x - 24, Math.min(town.x, label.x + 24))}
                y2={label.y > town.y ? label.y - 17 : label.y + 5}
                stroke="#F2F2F2" strokeOpacity="0.3" strokeWidth="0.75"
                pointerEvents="none"
              />
              <circle className={styles.focusRing} cx={town.x} cy={town.y} r="10" fill="none" />
              <circle cx={town.x} cy={town.y} r={town.isBase ? 6 : 4.5}
                fill={town.isBase ? "#D79F1E" : "#5B8AEF"}
                filter="url(#coverage-map-glow)" />
              <text x={label.x} y={label.y} textAnchor={label.anchor}
                fill="#F2F2F2" fontSize="16" className={styles.label}>
                {town.isBase ? "Reading (base)" : town.name}
              </text>
            </>
          );
          return town.slug ? (
            <a key={town.name} className={styles.townLink} href={`/services/${town.slug}/`}>
              {node}
            </a>
          ) : <g key={town.name}>{node}</g>;
        })}
      </svg>
      <div className={styles.navigation}>
        <p id="coverage-towns-label" className={styles.heading}>{listHeading}</p>
        <ul className={styles.townList} aria-labelledby="coverage-towns-label">
          {BERKSHIRE_TOWNS.map((town) => (
            <li key={town.name}>
              {town.slug ? <a href={`/services/${town.slug}/`}>{town.name}</a> : town.name}
            </li>
          ))}
        </ul>
      </div>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
