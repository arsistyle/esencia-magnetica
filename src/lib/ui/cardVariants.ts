import { cva, type VariantProps } from "class-variance-authority";

export const cardVariants = cva(
  "bg-cream-card border border-line rounded-lg overflow-hidden",
  {
    variants: {
      hover: {
        true: "hover:-translate-y-1 hover:shadow-md transition-all duration-base ease-soft",
        false: "",
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        md: "p-5",
        lg: "p-8",
      },
    },
    defaultVariants: { hover: true, padding: "md" },
  },
);

export type CardVariants = VariantProps<typeof cardVariants>;
