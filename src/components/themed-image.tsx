import Image, { type ImageProps } from "next/image";
import { hasLightVariant, lightVariantPath } from "@/lib/light-image";

type ThemedImageProps = Omit<ImageProps, "src"> & {
  src: string;
  /** Alt text for the light-mode image, if it needs to differ from `alt`. */
  lightAlt?: string;
};

/**
 * Renders a branded image with a light-theme counterpart when one exists.
 *
 * Convention: the light variant lives next to the original as
 * `<name>.light.<ext>` and is discovered at build time via
 * scripts/build-light-image-manifest.mjs -> src/data/light-images.json.
 *
 * - No light file yet: renders the original once, unchanged. Safe to ship
 *   before any light art exists.
 * - Light file present: renders both, toggled with `hidden dark:block` /
 *   `dark:hidden` so only one is ever visible. Only the dark image keeps
 *   `priority` (the site defaults to dark theme on first paint, so
 *   preloading the light image too would waste bandwidth for the common
 *   case and doesn't help LCP for either theme).
 */
export function ThemedImage({ src, alt, lightAlt, className, priority, ...rest }: ThemedImageProps) {
  if (!hasLightVariant(src)) {
    return <Image src={src} alt={alt} className={className} priority={priority} {...rest} />;
  }

  const lightClass = className ? `dark:hidden ${className}` : "dark:hidden";
  const darkClass = className ? `hidden dark:block ${className}` : "hidden dark:block";

  return (
    <>
      <Image src={src} alt={alt} className={darkClass} priority={priority} {...rest} />
      <Image src={lightVariantPath(src)} alt={lightAlt ?? alt} className={lightClass} {...rest} />
    </>
  );
}
