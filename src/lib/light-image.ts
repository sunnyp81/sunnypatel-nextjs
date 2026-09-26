import lightImages from "@/data/light-images.json";

const manifest: Record<string, boolean> = lightImages;

// public/images/services/foo.webp -> public/images/services/foo.light.webp
export function lightVariantPath(src: string): string {
  const idx = src.lastIndexOf(".");
  if (idx === -1) return src;
  return `${src.slice(0, idx)}.light${src.slice(idx)}`;
}

export function hasLightVariant(src: string): boolean {
  return manifest[src] === true;
}
