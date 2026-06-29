import type { UiKey } from "@/i18n/ui";
import type { Locale } from "@/types/index";

// Canonical slugs used to look up page documents in Sanity.
// Each page document must have slug.current matching one of these values.
// The `template` field in Sanity then controls how the page is rendered.
export const PAGE_SLUGS = {
  HOME: "home",
  BLOG: "blog",
  PRODUCTS: "products",
  BRAND: "brand",
} as const;

export const LOCALES = ["es", "en"] as const satisfies Locale[];

export const NAV_ITEMS = [
  { labelKey: "nav.home" as UiKey, href: "/" },
  { labelKey: "nav.blog" as UiKey, href: "/blog" },
  { labelKey: "nav.products" as UiKey, href: "/productos" },
  { labelKey: "nav.brand" as UiKey, href: "/marca" },
] as const;

export const SOCIAL_LINKS = [
  { name: "YouTube", href: "#" },
  { name: "Instagram", href: "#" },
  { name: "Pinterest", href: "#" },
] as const;

export const POSTS_PER_PAGE = 12;
export const PRODUCTS_PER_PAGE = 12;
