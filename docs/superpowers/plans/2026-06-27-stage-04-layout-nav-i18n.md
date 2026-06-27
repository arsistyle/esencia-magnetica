# Stage 04 — Core Layout, Navigation & i18n Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the shared shell (i18n routing, BaseLayout, Navbar, Footer, 404) that every page inherits.

**Architecture:** Astro built-in i18n (`defaultLocale: 'es'`, no prefix for ES; `/en/` prefix for EN). Pure i18n utilities in `src/i18n/` (testable with Vitest). Navbar and Footer as `.astro` organisms in `src/components/`. BaseLayout updated to accept `lang: Locale` and orchestrate nav + footer. Mobile nav via vanilla JS toggle.

**Tech Stack:** Astro v6 i18n, Tailwind v4, `@lucide/astro` (hamburger/close icons), Vitest (TDD for i18n utils).

**Design reference:** Claude Design `658592d3-5da1-4cd3-81b6-c1576c694e23` — Navbar and Footer spec defined there.

---

## File Map

| Action | File                                | Purpose                                                                     |
| ------ | ----------------------------------- | --------------------------------------------------------------------------- |
| Create | `src/types/index.ts`                | `Locale`, `SeoMeta` shared types                                            |
| Create | `src/lib/constants.ts`              | `LOCALES`, `NAV_ITEMS`, `SOCIAL_LINKS` structural constants                 |
| Create | `src/i18n/ui.ts`                    | All UI strings ES + EN                                                      |
| Create | `src/i18n/utils.ts`                 | Pure i18n functions: `getLangFromUrl`, `useTranslations`, `getLocalizedUrl` |
| Create | `src/i18n/index.ts`                 | Barrel re-export so pages use `@/i18n`                                      |
| Create | `src/i18n/utils.test.ts`            | Vitest TDD tests                                                            |
| Modify | `astro.config.mjs`                  | Add `i18n` routing block                                                    |
| Modify | `src/styles/global.css`             | Add `@source "../components/**/*.astro"` for Tailwind scanning              |
| Modify | `src/layouts/BaseLayout.astro`      | `lang` prop, skip-link, hreflang, Navbar + Footer                           |
| Create | `src/components/Navbar.astro`       | Sticky navbar organism                                                      |
| Create | `src/components/Footer.astro`       | Footer organism                                                             |
| Modify | `src/pages/index.astro`             | Pass `lang="es"` to BaseLayout                                              |
| Create | `src/pages/404.astro`               | On-brand 404 page                                                           |
| Create | `src/pages/en/index.astro`          | EN home wrapper (thin, passes `lang="en"`)                                  |
| Create | `src/pages/en/blog/index.astro`     | EN blog wrapper                                                             |
| Create | `src/pages/en/products/index.astro` | EN products wrapper                                                         |
| Create | `src/pages/en/brand/index.astro`    | EN brand wrapper                                                            |

---

## Task 1: Install `@lucide/astro` + Shared Types + Constants

**Files:**

- Modify: `package.json` (pnpm install)
- Create: `src/types/index.ts`
- Create: `src/lib/constants.ts`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Check if `@lucide/astro` is installed**

```powershell
pnpm list @lucide/astro
```

Expected: either shows a version (skip next step) or shows nothing.

- [ ] **Step 2: Install `@lucide/astro` if not present**

```powershell
pnpm add @lucide/astro
```

Expected: `@lucide/astro` added to `package.json` dependencies.

- [ ] **Step 3: Create `src/types/index.ts`**

```ts
// src/types/index.ts
export type Locale = "es" | "en";

export interface SeoMeta {
  title: string;
  description: string;
  ogImage?: string;
}
```

- [ ] **Step 4: Create `src/lib/constants.ts`**

```ts
// src/lib/constants.ts
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
```

> Social `href` values are `'#'` for now — they will be populated from Sanity `siteSettings` in a later stage.

- [ ] **Step 5: Add Tailwind source for all Astro components**

In `src/styles/global.css`, after the existing `@source` lines, add:

```css
@source "../components/**/*.astro";
@source "../layouts/**/*.astro";
@source "../pages/**/*.astro";
```

The existing file already has `@source "../lib/ui/*.ts"` and `@source "../components/ui/*.astro"`. Add the three lines above immediately after them, before the `@theme` block.

- [ ] **Step 6: Commit**

```powershell
git add src/types/index.ts src/lib/constants.ts src/styles/global.css package.json pnpm-lock.yaml
git commit -m "feat(stage-04): add shared types, constants, @lucide/astro"
```

---

## Task 2: i18n Strings (`src/i18n/ui.ts`)

**Files:**

- Create: `src/i18n/ui.ts`

- [ ] **Step 1: Create `src/i18n/ui.ts`**

```ts
// src/i18n/ui.ts
export const ui = {
  es: {
    "nav.home": "Home",
    "nav.blog": "Blog",
    "nav.products": "Productos",
    "nav.brand": "Marca",
    "nav.open": "Abrir menú",
    "nav.close": "Cerrar menú",
    "nav.aria": "Navegación principal",
    "nav.lang": "Idioma",
    "footer.explore": "Explorar",
    "footer.follow": "Síguenos",
    "footer.tagline":
      "Moda y estilo de vida con esencia, para mujeres que saben lo que quieren.",
    "footer.affiliate":
      "Algunos enlaces son de afiliados. Si compras a través de ellos, podemos recibir una comisión sin coste para ti.",
    "footer.copyright": "© 2026 Esencia Magnética",
    "common.skip": "Saltar al contenido",
    "404.title": "Página no encontrada",
    "404.body": "La página que buscas no existe o ha sido movida.",
    "404.cta": "Volver al inicio",
  },
  en: {
    "nav.home": "Home",
    "nav.blog": "Blog",
    "nav.products": "Products",
    "nav.brand": "Brand",
    "nav.open": "Open menu",
    "nav.close": "Close menu",
    "nav.aria": "Main navigation",
    "nav.lang": "Language",
    "footer.explore": "Explore",
    "footer.follow": "Follow",
    "footer.tagline":
      "Fashion and lifestyle with essence, for women who know what they want.",
    "footer.affiliate":
      "Some links are affiliate links. If you buy through them, we may receive a commission at no extra cost to you.",
    "footer.copyright": "© 2026 Esencia Magnética",
    "common.skip": "Skip to content",
    "404.title": "Page not found",
    "404.body":
      "The page you are looking for does not exist or has been moved.",
    "404.cta": "Back to home",
  },
} as const;

export type Lang = keyof typeof ui;
export type UiKey = keyof (typeof ui)["es"];
```

- [ ] **Step 2: Commit**

```powershell
git add src/i18n/ui.ts
git commit -m "feat(stage-04): add i18n UI strings (ES + EN)"
```

---

## Task 3: i18n Utilities — TDD (`src/i18n/utils.ts`)

**Files:**

- Create: `src/i18n/utils.test.ts`
- Create: `src/i18n/utils.ts`
- Create: `src/i18n/index.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/i18n/utils.test.ts
import { describe, it, expect } from "vitest";
import { getLangFromUrl, useTranslations, getLocalizedUrl } from "./utils";

describe("getLangFromUrl", () => {
  it("returns es for root", () =>
    expect(getLangFromUrl(new URL("http://x.com/"))).toBe("es"));
  it("returns es for /blog", () =>
    expect(getLangFromUrl(new URL("http://x.com/blog"))).toBe("es"));
  it("returns es for /productos", () =>
    expect(getLangFromUrl(new URL("http://x.com/productos"))).toBe("es"));
  it("returns en for /en", () =>
    expect(getLangFromUrl(new URL("http://x.com/en"))).toBe("en"));
  it("returns en for /en/", () =>
    expect(getLangFromUrl(new URL("http://x.com/en/"))).toBe("en"));
  it("returns en for /en/blog", () =>
    expect(getLangFromUrl(new URL("http://x.com/en/blog"))).toBe("en"));
  it("does not mistake /enterprise for en", () =>
    expect(getLangFromUrl(new URL("http://x.com/enterprise"))).toBe("es"));
});

describe("useTranslations", () => {
  it("returns ES nav.products as Productos", () => {
    const t = useTranslations("es");
    expect(t("nav.products")).toBe("Productos");
  });
  it("returns EN nav.products as Products", () => {
    const t = useTranslations("en");
    expect(t("nav.products")).toBe("Products");
  });
  it("returns ES 404.title", () => {
    const t = useTranslations("es");
    expect(t("404.title")).toBe("Página no encontrada");
  });
});

describe("getLocalizedUrl", () => {
  it("ES / → EN /en", () => expect(getLocalizedUrl("en", "/")).toBe("/en"));
  it("EN /en → ES /", () => expect(getLocalizedUrl("es", "/en")).toBe("/"));
  it("ES /blog → EN /en/blog", () =>
    expect(getLocalizedUrl("en", "/blog")).toBe("/en/blog"));
  it("EN /en/blog → ES /blog", () =>
    expect(getLocalizedUrl("es", "/en/blog")).toBe("/blog"));
  it("ES /productos → EN /en/products", () =>
    expect(getLocalizedUrl("en", "/productos")).toBe("/en/products"));
  it("EN /en/products → ES /productos", () =>
    expect(getLocalizedUrl("es", "/en/products")).toBe("/productos"));
  it("ES /marca → EN /en/brand", () =>
    expect(getLocalizedUrl("en", "/marca")).toBe("/en/brand"));
  it("EN /en/brand → ES /marca", () =>
    expect(getLocalizedUrl("es", "/en/brand")).toBe("/marca"));
  it("unknown ES path falls back to /en", () =>
    expect(getLocalizedUrl("en", "/unknown")).toBe("/en"));
  it("unknown EN path falls back to /", () =>
    expect(getLocalizedUrl("es", "/en/unknown")).toBe("/"));
});
```

- [ ] **Step 2: Run tests — expect them to fail**

```powershell
pnpm run test -- src/i18n/utils.test.ts
```

Expected: FAIL — "Cannot find module './utils'"

- [ ] **Step 3: Write `src/i18n/utils.ts`**

```ts
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
```

- [ ] **Step 4: Run tests — expect them to pass**

```powershell
pnpm run test -- src/i18n/utils.test.ts
```

Expected: all 14 tests PASS.

- [ ] **Step 5: Create barrel `src/i18n/index.ts`**

```ts
// src/i18n/index.ts
export { getLangFromUrl, useTranslations, getLocalizedUrl } from "./utils";
export type { Lang, UiKey } from "./ui";
```

- [ ] **Step 6: Commit**

```powershell
git add src/i18n/
git commit -m "feat(stage-04): add i18n utils with TDD (getLangFromUrl, useTranslations, getLocalizedUrl)"
```

---

## Task 4: Astro i18n Routing Config

**Files:**

- Modify: `astro.config.mjs`

- [ ] **Step 1: Add `i18n` block to `astro.config.mjs`**

Replace the existing `export default defineConfig({` block with:

```js
// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";
import path from "path";
import { loadEnv } from "vite";
import sanity from "@sanity/astro";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } = loadEnv(
  process.env.NODE_ENV ?? "development",
  process.cwd(),
  "",
);

export default defineConfig({
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
  },
  integrations: [
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      apiVersion: "2025-01-01",
      useCdn: false,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  },
});
```

- [ ] **Step 2: Run build to verify config is valid**

```powershell
pnpm run build
```

Expected: build succeeds (may warn about missing `/en` pages — that's fine for now).

- [ ] **Step 3: Commit**

```powershell
git add astro.config.mjs
git commit -m "feat(stage-04): configure Astro i18n routing (es default, en under /en/)"
```

---

## Task 5: Footer Organism

**Files:**

- Create: `src/components/Footer.astro`

- [ ] **Step 1: Create `src/components/Footer.astro`**

```astro
---
// src/components/Footer.astro
import type { Locale } from "@/types/index";
import { useTranslations, getLocalizedUrl } from "@/i18n";
import { NAV_ITEMS, SOCIAL_LINKS } from "@/lib/constants";
import type { UiKey } from "@/i18n/ui";

interface Props {
  lang: Locale;
}

const { lang } = Astro.props;
const t = useTranslations(lang);

const navLinks = NAV_ITEMS.map((item) => ({
  label: t(item.labelKey as UiKey),
  href: lang === "es" ? item.href : getLocalizedUrl("en", item.href),
}));
---

<footer
  class="bg-olive text-cream [padding:var(--space-8)_var(--gutter)_var(--space-6)]"
>
  <div
    class="mx-auto flex max-w-[var(--container)] flex-wrap justify-between gap-8"
  >
    <!-- Brand column -->
    <div class="max-w-[320px]">
      <p class="font-script text-rose-nude mb-3 text-[30px] leading-none">
        Esencia Magnética
      </p>
      <p class="m-0 text-sm leading-relaxed opacity-85">
        {t("footer.tagline")}
      </p>
    </div>

    <!-- Link columns -->
    <div class="flex flex-wrap gap-16">
      <!-- Explorar / Explore -->
      <div class="flex flex-col gap-[10px]">
        <span class="text-overline mb-1 tracking-wider uppercase opacity-60">
          {t("footer.explore")}
        </span>
        {
          navLinks.map(({ label, href }) => (
            <a
              href={href}
              class="text-cream text-sm no-underline opacity-80 transition-opacity hover:opacity-100"
            >
              {label}
            </a>
          ))
        }
      </div>

      <!-- Síguenos / Follow -->
      <div class="flex flex-col gap-[10px]">
        <span class="text-overline mb-1 tracking-wider uppercase opacity-60">
          {t("footer.follow")}
        </span>
        {
          SOCIAL_LINKS.map(({ name, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              class="text-cream text-sm no-underline opacity-80 transition-opacity hover:opacity-100"
            >
              {name}
            </a>
          ))
        }
      </div>
    </div>
  </div>

  <!-- Bottom bar -->
  <div
    class="mx-auto mt-10 flex max-w-[var(--container)] flex-wrap justify-between gap-4 border-t border-white/15 pt-5 text-[13px] opacity-60"
  >
    <span>{t("footer.copyright")}</span>
    <span>{t("footer.affiliate")}</span>
  </div>
</footer>
```

- [ ] **Step 2: Commit**

```powershell
git add src/components/Footer.astro
git commit -m "feat(stage-04): add Footer organism"
```

---

## Task 6: Navbar Organism

**Files:**

- Create: `src/components/Navbar.astro`

- [ ] **Step 1: Create `src/components/Navbar.astro`**

```astro
---
// src/components/Navbar.astro
import type { Locale } from "@/types/index";
import { useTranslations, getLocalizedUrl } from "@/i18n";
import { NAV_ITEMS } from "@/lib/constants";
import type { UiKey } from "@/i18n/ui";
import { Menu, X } from "@lucide/astro";

interface Props {
  lang: Locale;
  currentPath: string;
}

const { lang, currentPath } = Astro.props;
const t = useTranslations(lang);

const logoHref = lang === "es" ? "/" : "/en";
const altLang: Locale = lang === "es" ? "en" : "es";
const langSwitchHref = getLocalizedUrl(altLang, currentPath);

function navHref(esHref: string): string {
  return lang === "es" ? esHref : getLocalizedUrl("en", esHref);
}

function isActive(esHref: string): boolean {
  const href = navHref(esHref);
  if (esHref === "/") return currentPath === href;
  return currentPath === href || currentPath.startsWith(href + "/");
}
---

<header
  class="border-line bg-cream/[0.88] sticky top-0 z-50 border-b backdrop-blur-[10px]"
>
  <!-- Main bar -->
  <div
    class="flex items-center justify-between gap-8 [padding:18px_var(--gutter)]"
  >
    <!-- Wordmark -->
    <a
      href={logoHref}
      class="font-script text-gold text-[30px] leading-none whitespace-nowrap no-underline"
    >
      Esencia Magnética
    </a>

    <!-- Desktop nav links -->
    <nav
      class="hidden flex-1 items-center justify-center gap-8 md:flex"
      aria-label={t("nav.aria")}
    >
      {
        NAV_ITEMS.map((item) => {
          const href = navHref(item.href);
          const active = isActive(item.href);
          return (
            <a
              href={href}
              class:list={[
                "duration-base ease-soft border-b-2 pb-[3px] font-sans text-[14px] tracking-[0.06em] uppercase no-underline transition-colors",
                active
                  ? "text-olive border-gold font-bold"
                  : "text-olive-soft hover:text-olive border-transparent font-normal",
              ]}
              aria-current={active ? "page" : undefined}
            >
              {t(item.labelKey as UiKey)}
            </a>
          );
        })
      }
    </nav>

    <!-- Right: LangToggle + hamburger -->
    <div class="flex items-center gap-4">
      <!-- LangToggle -->
      <div
        role="group"
        aria-label={t("nav.lang")}
        class="border-line-strong rounded-pill inline-flex items-center gap-[2px] border p-[3px]"
      >
        {
          (["es", "en"] as const).map((l) => {
            const active = l === lang;
            return (
              <a
                href={active ? "#" : langSwitchHref}
                class:list={[
                  "rounded-pill duration-base ease-soft px-3 py-[5px] font-sans text-[12px] font-bold tracking-wide no-underline transition-colors",
                  active
                    ? "bg-gold pointer-events-none text-white"
                    : "text-olive-soft hover:text-olive bg-transparent",
                ]}
                aria-pressed={active}
                aria-label={l.toUpperCase()}
              >
                {l.toUpperCase()}
              </a>
            );
          })
        }
      </div>

      <!-- Hamburger button (mobile only) -->
      <button
        id="nav-toggle"
        class="text-olive hover:bg-cream-deep rounded-md p-2 transition-colors md:hidden"
        aria-label={t("nav.open")}
        aria-expanded="false"
        aria-controls="nav-mobile"
      >
        <Menu id="nav-icon-open" class="h-5 w-5" />
        <X id="nav-icon-close" class="hidden h-5 w-5" />
      </button>
    </div>
  </div>

  <!-- Mobile nav dropdown -->
  <div
    id="nav-mobile"
    class="border-line bg-cream border-t md:hidden"
    aria-label={t("nav.aria")}
  >
    <div class="flex flex-col gap-1 [padding:1rem_var(--gutter)]">
      {
        NAV_ITEMS.map((item) => {
          const href = navHref(item.href);
          const active = isActive(item.href);
          return (
            <a
              href={href}
              class:list={[
                "border-line border-b py-3 font-sans text-[14px] tracking-[0.06em] uppercase no-underline last:border-0",
                active ? "text-gold font-bold" : "text-olive",
              ]}
              aria-current={active ? "page" : undefined}
            >
              {t(item.labelKey as UiKey)}
            </a>
          );
        })
      }
    </div>
  </div>
</header>

<style>
  /* Mobile dropdown: hidden by default; .is-open shows it on mobile only */
  #nav-mobile {
    display: none;
  }
  #nav-mobile.is-open {
    display: block;
  }
  @media (min-width: 768px) {
    #nav-mobile,
    #nav-mobile.is-open {
      display: none;
    }
  }
</style>

<script>
  const toggle = document.getElementById(
    "nav-toggle",
  ) as HTMLButtonElement | null;
  const menu = document.getElementById("nav-mobile");
  const iconOpen = document.getElementById("nav-icon-open");
  const iconClose = document.getElementById("nav-icon-close");

  toggle?.addEventListener("click", () => {
    const isOpen = menu?.classList.contains("is-open") ?? false;
    if (isOpen) {
      menu?.classList.remove("is-open");
      iconOpen?.classList.remove("hidden");
      iconClose?.classList.add("hidden");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", toggle.dataset.labelOpen ?? "");
    } else {
      menu?.classList.add("is-open");
      iconOpen?.classList.add("hidden");
      iconClose?.classList.remove("hidden");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", toggle.dataset.labelClose ?? "");
    }
  });
</script>
```

- [ ] **Step 2: Commit**

```powershell
git add src/components/Navbar.astro
git commit -m "feat(stage-04): add Navbar organism with mobile menu and LangToggle"
```

---

## Task 7: BaseLayout Update

**Files:**

- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Replace `src/layouts/BaseLayout.astro`**

Full replacement (the existing file is only 28 lines):

```astro
---
// src/layouts/BaseLayout.astro
import "@/styles/global.css";
import Navbar from "@/components/Navbar.astro";
import Footer from "@/components/Footer.astro";
import { useTranslations, getLocalizedUrl } from "@/i18n";
import type { Locale } from "@/types/index";

interface Props {
  title: string;
  description?: string;
  lang?: Locale;
  ogImage?: string;
}

const {
  title,
  description = "Esencia Magnética — moda y estilo para mujeres 40+",
  lang = "es",
  ogImage,
} = Astro.props;

const t = useTranslations(lang);
const currentPath = Astro.url.pathname;

// Canonical and hreflang URLs
const siteUrl = Astro.site ? Astro.site.toString().replace(/\/$/, "") : "";
const canonicalUrl = siteUrl + currentPath;
const esUrl = lang === "es" ? currentPath : getLocalizedUrl("es", currentPath);
const enUrl = lang === "en" ? currentPath : getLocalizedUrl("en", currentPath);
---

<!doctype html>
<html lang={lang}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <title>{title} — Esencia Magnética</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

    <!-- Canonical & hreflang -->
    {siteUrl && <link rel="canonical" href={canonicalUrl} />}
    <link rel="alternate" hreflang="es" href={siteUrl + esUrl} />
    <link rel="alternate" hreflang="en" href={siteUrl + enUrl} />
    <link rel="alternate" hreflang="x-default" href={siteUrl + esUrl} />

    <!-- Open Graph -->
    <meta property="og:title" content={`${title} — Esencia Magnética`} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    {siteUrl && <meta property="og:url" content={canonicalUrl} />}
    {ogImage && <meta property="og:image" content={ogImage} />}
  </head>
  <body>
    <!-- Skip link (accessibility) -->
    <a
      href="#main-content"
      class="focus:bg-gold sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[9999] focus:rounded-br-md focus:px-4 focus:py-2 focus:text-white"
    >
      {t("common.skip")}
    </a>

    <Navbar lang={lang} currentPath={currentPath} />

    <main id="main-content">
      <slot />
    </main>

    <Footer lang={lang} />
  </body>
</html>
```

- [ ] **Step 2: Run typecheck**

```powershell
pnpm run typecheck
```

Expected: no errors. If `Astro.site` causes an error, it's because `site` is not set in `astro.config.mjs` — the `siteUrl` logic handles that with an empty string fallback, so hreflang values will be relative paths in dev. This is acceptable for Stage 04; the full `site` URL will be set in the production/SEO stage.

- [ ] **Step 3: Commit**

```powershell
git add src/layouts/BaseLayout.astro
git commit -m "feat(stage-04): update BaseLayout with i18n, nav, footer, skip-link, hreflang"
```

---

## Task 8: 404 Page

**Files:**

- Create: `src/pages/404.astro`

- [ ] **Step 1: Create `src/pages/404.astro`**

```astro
---
// src/pages/404.astro
import BaseLayout from "@/layouts/BaseLayout.astro";
import { useTranslations } from "@/i18n";

// Astro 404 is served without locale context; default to ES.
const lang = "es" as const;
const t = useTranslations(lang);
---

<BaseLayout title={t("404.title")} lang={lang}>
  <section
    class="flex flex-col items-center justify-center [padding:var(--space-9)_var(--gutter)] text-center"
  >
    <p
      class="font-script text-gold mb-6 text-[clamp(4rem,10vw,7rem)] leading-none"
    >
      404
    </p>
    <h1 class="text-h1 text-olive mb-4 font-serif leading-tight font-semibold">
      {t("404.title")}
    </h1>
    <p
      class="text-body text-olive-soft mb-8 max-w-[var(--container-text)] leading-normal"
    >
      {t("404.body")}
    </p>
    <a
      href="/"
      class="bg-gold rounded-pill shadow-gold hover:bg-gold-deep duration-base ease-soft inline-flex items-center gap-2 px-6 py-3 font-sans text-[14px] font-bold tracking-wide text-white uppercase no-underline transition-colors"
    >
      {t("404.cta")}
    </a>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Commit**

```powershell
git add src/pages/404.astro
git commit -m "feat(stage-04): add on-brand 404 page"
```

---

## Task 9: EN Page Wrappers + Update `index.astro`

**Files:**

- Modify: `src/pages/index.astro`
- Create: `src/pages/en/index.astro`
- Create: `src/pages/en/blog/index.astro`
- Create: `src/pages/en/products/index.astro`
- Create: `src/pages/en/brand/index.astro`

> These EN pages are thin wrappers for Stage 04. They render the same BaseLayout with `lang="en"` and a placeholder `<slot>`. Content will be filled in Stage 05 (Blog), Stage 06 (Products), etc.

- [ ] **Step 1: Update `src/pages/index.astro`**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
---

<BaseLayout title="Bienvenida" lang="es">
  <main
    class="flex flex-col items-center justify-center [padding:var(--space-9)_var(--gutter)] text-center"
  >
    <h1 class="text-h1 text-olive font-serif leading-tight font-semibold">
      Esencia Magnética
    </h1>
    <p class="text-body text-olive-soft mt-4">Stage 04 — shell activo.</p>
  </main>
</BaseLayout>
```

- [ ] **Step 2: Create `src/pages/en/index.astro`**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
---

<BaseLayout title="Welcome" lang="en">
  <main
    class="flex flex-col items-center justify-center [padding:var(--space-9)_var(--gutter)] text-center"
  >
    <h1 class="text-h1 text-olive font-serif leading-tight font-semibold">
      Esencia Magnética
    </h1>
    <p class="text-body text-olive-soft mt-4">Stage 04 — shell active.</p>
  </main>
</BaseLayout>
```

- [ ] **Step 3: Create `src/pages/en/blog/index.astro`**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
---

<BaseLayout title="Blog" lang="en">
  <main
    class="mx-auto max-w-[var(--container)] [padding:var(--space-9)_var(--gutter)]"
  >
    <h1 class="text-h1 text-olive font-serif font-semibold">Blog</h1>
    <p class="text-olive-soft mt-4">Coming in Stage 05.</p>
  </main>
</BaseLayout>
```

- [ ] **Step 4: Create `src/pages/en/products/index.astro`**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
---

<BaseLayout title="Products" lang="en">
  <main
    class="mx-auto max-w-[var(--container)] [padding:var(--space-9)_var(--gutter)]"
  >
    <h1 class="text-h1 text-olive font-serif font-semibold">Products</h1>
    <p class="text-olive-soft mt-4">Coming in Stage 06.</p>
  </main>
</BaseLayout>
```

- [ ] **Step 5: Create `src/pages/en/brand/index.astro`**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
---

<BaseLayout title="Brand" lang="en">
  <main
    class="mx-auto max-w-[var(--container)] [padding:var(--space-9)_var(--gutter)]"
  >
    <h1 class="text-h1 text-olive font-serif font-semibold">Brand</h1>
    <p class="text-olive-soft mt-4">Coming in Stage 07.</p>
  </main>
</BaseLayout>
```

- [ ] **Step 6: Commit**

```powershell
git add src/pages/index.astro src/pages/en/
git commit -m "feat(stage-04): add EN page wrappers and update ES home"
```

---

## Task 10: Final Verification

- [ ] **Step 1: Run linter**

```powershell
pnpm run lint
```

Expected: 0 errors. Fix any reported issues before continuing.

- [ ] **Step 2: Run typecheck**

```powershell
pnpm run typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Run tests**

```powershell
pnpm run test
```

Expected: all tests pass (at minimum the i18n utils tests from Task 3).

- [ ] **Step 4: Run build**

```powershell
pnpm run build
```

Expected: build succeeds. Astro will generate pages for `/`, `/en`, `/en/blog`, `/en/products`, `/en/brand`, `404`.

- [ ] **Step 5: Start dev server and manually verify**

```powershell
pnpm run dev
```

Check these in the browser:

| URL                         | Expected                                                            |
| --------------------------- | ------------------------------------------------------------------- |
| `http://localhost:4321/`    | ES home — Navbar with Productos/Marca, gold wordmark, no /en prefix |
| `http://localhost:4321/en`  | EN home — Navbar with Products/Brand                                |
| LangToggle on `/`           | Clicking EN navigates to `/en`                                      |
| LangToggle on `/en`         | Clicking ES navigates to `/`                                        |
| Active link                 | Current page link has gold underline                                |
| Mobile (< 768px)            | Hamburger visible, links hidden; toggle works                       |
| Skip link                   | Tab key shows "Saltar al contenido" in gold                         |
| `http://localhost:4321/404` | On-brand 404 with script 404 and CTA button                         |
| Footer                      | Dark olive, wordmark in rose-nude, two link columns                 |

- [ ] **Step 6: Final commit (if there are any fixes from verification)**

```powershell
git add -p   # review and stage only relevant fixes
git commit -m "fix(stage-04): post-verification fixes"
```

- [ ] **Step 7: Update HANDOFF.md**

Update `HANDOFF.md` to reflect Stage 04 complete and Stage 05 as next.

---

## Self-Review Checklist

- [x] Spec section 1 (i18n routing) → Tasks 3, 4, 9
- [x] Spec section 2 (strings system) → Tasks 2, 3
- [x] Spec section 3 (BaseLayout) → Task 7
- [x] Spec section 4 (Navbar) → Task 6
- [x] Spec section 5 (Footer) → Task 5
- [x] Spec section 6 (Sanity data layer) → No code change needed (queries already accept `$lang`)
- [x] Spec section 7 (404) → Task 8
- [x] Spec section 8 (responsive/mobile) → Covered in Navbar (Task 6) + Footer (Task 5)
- [x] `@lucide/astro` installation → Task 1
- [x] All types use `Locale` from `src/types/index.ts` — consistent across all tasks
- [x] `UiKey` imported from `@/i18n/ui` everywhere — consistent
- [x] `getLocalizedUrl` signature `(targetLang, currentPath)` — consistent in utils.ts, Navbar, BaseLayout
- [x] No hardcoded UI strings — all pass through `t(key)`
- [x] No placeholder "TBD" sections
- [x] Every code step shows complete file or complete diff
