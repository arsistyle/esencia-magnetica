import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { sanityClient } from "sanity:client";

const builder = createImageUrlBuilder(sanityClient);

export const urlFor = (source: SanityImageSource) => builder.image(source);

/** Para imágenes Sanity estándar (tipo `image`). Retorna el builder o null si el ref está vacío. */
export function safeUrlFor(source: unknown) {
  const ref = (source as { asset?: { _ref?: string } } | undefined)?.asset
    ?._ref;
  if (!ref) return null;
  return builder.image(source as SanityImageSource);
}

/** Tipo mínimo que describe un campo CoverImage (objeto personalizado con asset + externalUrl). */
export type CoverImageLike =
  | { externalUrl?: string; asset?: unknown }
  | null
  | undefined;

/**
 * Resuelve la URL final de un campo CoverImage.
 * Prioridad: externalUrl → imagen Sanity.
 * Retorna null si no hay ninguna fuente válida.
 */
export function resolveImageUrl(
  source: CoverImageLike,
  opts: { width?: number; height?: number } = {},
): string | null {
  if (!source) return null;
  if (source.externalUrl) return source.externalUrl;
  const b = safeUrlFor(source.asset);
  if (!b) return null;
  if (opts.width && opts.height)
    return b.width(opts.width).height(opts.height).url();
  if (opts.width) return b.width(opts.width).url();
  if (opts.height) return b.height(opts.height).url();
  return b.url();
}
