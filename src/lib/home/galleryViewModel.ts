import type { MarqueeItem } from "@/lib/home/marqueeItems";

export interface SanityGalleryImage {
  url: string;
  alt?: string;
}

const BG_CYCLE = [
  "linear-gradient(135deg, var(--color-rose-nude), var(--color-lavender))",
  "linear-gradient(135deg, var(--color-cream-deep), var(--color-gold-soft))",
  "linear-gradient(135deg, var(--color-lavender), var(--color-cream))",
  "linear-gradient(135deg, var(--color-gold-soft), var(--color-rose-nude))",
  "linear-gradient(135deg, var(--color-rose-nude), var(--color-cream))",
  "linear-gradient(135deg, var(--color-lavender), var(--color-rose-nude))",
  "linear-gradient(135deg, var(--color-cream), var(--color-gold-soft))",
  "linear-gradient(135deg, var(--color-cream-deep), var(--color-rose-nude))",
];

function toItem(img: SanityGalleryImage, idx: number): MarqueeItem {
  return {
    bg: BG_CYCLE[idx % BG_CYCLE.length],
    src: img.url,
    alt: img.alt ?? "",
  };
}

export function buildMarqueeRows(
  images: SanityGalleryImage[] | null | undefined,
  fallback1: MarqueeItem[],
  fallback2: MarqueeItem[],
): [MarqueeItem[], MarqueeItem[]] {
  if (!images?.length) return [fallback1, fallback2];
  const row1 = images.slice(0, 10).map(toItem);
  const row2 = images.slice(10, 20).map(toItem);
  return [row1, row2.length ? row2 : fallback2];
}
