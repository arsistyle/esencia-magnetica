import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource, ImageFormat } from "@sanity/image-url";
import { sanityClient } from "sanity:client";

const builder = createImageUrlBuilder(sanityClient);

export const urlFor = (source: SanityImageSource) => builder.image(source);

/** For standard Sanity images (type `image`). Returns the builder or null if the asset ref is missing. */
export function safeUrlFor(source: unknown) {
  const ref = (source as { asset?: { _ref?: string } } | undefined)?.asset
    ?._ref;
  if (!ref) return null;
  return builder.image(source as SanityImageSource);
}

/** Minimal type describing a CoverImage field (custom object with asset + externalUrl). */
export type CoverImageLike =
  | { externalUrl?: string; asset?: unknown; alt?: string }
  | null
  | undefined;

export interface ImageOpts {
  width?: number;
  height?: number;
  format?: ImageFormat;
  quality?: number;
}

/**
 * Resolves the final URL for a CoverImage field.
 * Priority: externalUrl → Sanity image with transformation params.
 * format/quality are not applied to externalUrl (external CDN, not Sanity).
 * Returns null if no valid source is found.
 */
export function resolveImageUrl(
  source: CoverImageLike,
  opts: ImageOpts = {},
): string | null {
  if (!source) return null;
  if (source.externalUrl) return source.externalUrl;
  const b = safeUrlFor(source);
  if (!b) return null;
  let img = b;
  if (opts.width && opts.height)
    img = img.width(opts.width).height(opts.height);
  else if (opts.width) img = img.width(opts.width);
  else if (opts.height) img = img.height(opts.height);
  if (opts.format) img = img.format(opts.format);
  if (opts.quality) img = img.quality(opts.quality);
  return img.url();
}

/**
 * Generates a srcset string with multiple widths from the Sanity CDN.
 * Returns '' for external sources (cannot be resized via Sanity).
 */
export function buildSrcSet(
  source: CoverImageLike,
  widths: number[],
  opts: Pick<ImageOpts, "format" | "quality"> = {},
): string {
  if (!source || source.externalUrl) return "";
  const entries = widths.flatMap((w) => {
    const url = resolveImageUrl(source, { width: w, ...opts });
    return url ? [`${url} ${w}w`] : [];
  });
  return entries.join(", ");
}
