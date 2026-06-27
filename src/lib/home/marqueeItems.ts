// Placeholder gradient tiles — replace with Sanity image items when available.
// bg is always rendered as the CSS background (visible during image load / as fallback).
export interface MarqueeItem {
  bg: string;
  src?: string;
  alt?: string;
}

const BASE: MarqueeItem[] = [
  {
    bg: "linear-gradient(135deg, var(--color-rose-nude), var(--color-lavender))",
  },
  {
    bg: "linear-gradient(135deg, var(--color-cream-deep), var(--color-gold-soft))",
  },
  { bg: "linear-gradient(135deg, var(--color-lavender), var(--color-cream))" },
  {
    bg: "linear-gradient(135deg, var(--color-gold-soft), var(--color-rose-nude))",
  },
  { bg: "linear-gradient(135deg, var(--color-rose-nude), var(--color-cream))" },
  {
    bg: "linear-gradient(135deg, var(--color-lavender), var(--color-rose-nude))",
  },
  { bg: "linear-gradient(135deg, var(--color-cream), var(--color-gold-soft))" },
  {
    bg: "linear-gradient(135deg, var(--color-cream-deep), var(--color-rose-nude))",
  },
];

export const ROW1_ITEMS: MarqueeItem[] = BASE;
export const ROW2_ITEMS: MarqueeItem[] = [
  ...BASE.slice(3),
  ...BASE.slice(0, 3),
];
