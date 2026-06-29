import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource, ImageFormat } from "@sanity/image-url";
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
 * Resuelve la URL final de un campo CoverImage.
 * Prioridad: externalUrl → imagen Sanity con parámetros de transformación.
 * format/quality no se aplican a externalUrl (CDN externo, no Sanity).
 * Retorna null si no hay ninguna fuente válida.
 */
export function resolveImageUrl(
  source: CoverImageLike,
  opts: ImageOpts = {},
): string | null {
  if (!source) return null;
  if (source.externalUrl) return source.externalUrl;
  const b = safeUrlFor(source.asset);
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
 * Genera una cadena srcset con múltiples anchos desde Sanity CDN.
 * Retorna '' para fuentes externas (no se pueden redimensionar via Sanity).
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
