import type { UiKey } from "@/i18n/ui";
import type { Locale } from "@/types/index";

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
