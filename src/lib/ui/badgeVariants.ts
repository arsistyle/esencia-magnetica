import { cva, type VariantProps } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center font-sans font-bold uppercase text-overline tracking-wider rounded-pill",
  {
    variants: {
      tone: {
        gold: "bg-gold text-white",
        olive: "bg-olive text-cream-card",
        lavender: "bg-lavender text-olive",
        rose: "bg-rose-nude text-olive",
        neutral: "bg-cream-deep text-olive-soft",
      },
      size: {
        sm: "px-2 py-0.5",
        md: "px-3 py-1",
      },
    },
    defaultVariants: { tone: "gold", size: "md" },
  },
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;
