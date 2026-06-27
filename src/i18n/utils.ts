// src/i18n/utils.ts
import type { Locale } from "@/types/index";
import { ui, type UiKey } from "./ui";

/** Pairs of [ES path, EN path] for all top-level routes. */
const ROUTE_PAIRS: [string, string][] = [
  ["/", "/en"],
  ["/blog", "/en/blog"],
  ["/productos", "/en/products"],
  ["/marca", "/en/brand"],
];

export function getLangFromUrl(url: URL): Locale {
  const path = url.pathname;
  return path === "/en" || path.startsWith("/en/") ? "en" : "es";
}

export function useTranslations(lang: Locale) {
  return (key: UiKey): string => ui[lang][key];
}

/** Returns the equivalent URL in `targetLang` for the given `currentPath`.
 *  Only handles top-level routes. Dynamic slug pages handled in Stage 05+.
 */
export function getLocalizedUrl(
  targetLang: Locale,
  currentPath: string,
): string {
  for (const [es, en] of ROUTE_PAIRS) {
    if (targetLang === "en" && currentPath === es) return en;
    if (targetLang === "es" && currentPath === en) return es;
  }
  // ponytail: static map only covers top-level routes; fallback to locale root
  return targetLang === "en" ? "/en" : "/";
}
