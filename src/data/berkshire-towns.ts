export interface BerkshireTown {
  name: string;
  lat: number;
  lon: number;
  /** Service page slug if a dedicated town page exists, else null. */
  slug: string | null;
  /** True only for Reading, the base node. */
  isBase?: boolean;
}

// West to east by longitude; Maidenhead and Slough are north of Bracknell.
export const BERKSHIRE_TOWNS: BerkshireTown[] = [
  { name: "Hungerford", lat: 51.4144, lon: -1.5164, slug: null },
  { name: "Newbury", lat: 51.4014, lon: -1.3230, slug: null },
  { name: "Thatcham", lat: 51.4020, lon: -1.2540, slug: null },
  { name: "Reading", lat: 51.4543, lon: -0.9781, slug: "seo-consultant-reading", isBase: true },
  { name: "Wokingham", lat: 51.4109, lon: -0.8347, slug: "seo-wokingham" },
  { name: "Bracknell", lat: 51.4142, lon: -0.7526, slug: "seo-bracknell" },
  { name: "Maidenhead", lat: 51.5225, lon: -0.7212, slug: "seo-maidenhead" },
  { name: "Windsor", lat: 51.4816, lon: -0.6046, slug: "seo-windsor" },
  { name: "Slough", lat: 51.5105, lon: -0.5950, slug: "seo-slough" },
];

// Equirectangular projection: longitude degrees shrink with latitude.
export function projectTown(t: BerkshireTown, refLat: number): { x: number; y: number } {
  return {
    x: t.lon * Math.cos((refLat * Math.PI) / 180),
    y: -t.lat, // SVG y grows downwards; latitude grows northwards.
  };
}
