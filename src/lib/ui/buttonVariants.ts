import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-sans font-bold uppercase tracking-wide rounded-pill transition-all duration-base ease-soft cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:
          "bg-gold text-white border border-gold shadow-gold hover:bg-gold-deep hover:border-gold-deep",
        secondary:
          "bg-transparent text-olive border border-line-strong hover:bg-cream-deep",
        ghost:
          "bg-transparent text-gold border border-transparent hover:bg-cream-deep",
        warm: "bg-rose-nude text-olive border border-rose-nude hover:bg-rose-deep",
      },
      size: {
        sm: "px-3 py-1.5 text-small leading-none",
        md: "px-5 py-2 text-small leading-none",
        lg: "px-7 py-3 text-body leading-none",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
