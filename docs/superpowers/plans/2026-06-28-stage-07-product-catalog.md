# Stage 07 — Product Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the affiliate product catalog at `/productos` (ES) and `/en/products` (EN) with filter modals, 3-col grid, sort, pagination, and affiliate disclosure.

**Architecture:** Server-side filtering via queryParams (same pattern as blog). `prerender = false` on both pages. Filter modals (Buscar + Filtrar) using the same overlay pattern as `BlogFilterModals.astro`. Sort via a GET form with hidden inputs preserving other params.

**Tech Stack:** Astro · Tailwind v4 · `@lucide/astro` · `sanity:client` · GROQ `defineQuery` · `@sanity/image-url` via `resolveImageUrl`

---

## File Map

| Action | File                                               | Responsibility                                 |
| ------ | -------------------------------------------------- | ---------------------------------------------- |
| Modify | `src/i18n/ui.ts`                                   | Add product catalog strings (ES + EN)          |
| Create | `src/i18n/ui.test.ts`                              | Verify EN has all ES keys                      |
| Modify | `src/lib/constants.ts`                             | Add `PRODUCTS_PER_PAGE = 12`                   |
| Create | `src/lib/product/productViewModel.ts`              | `buildProductsUrl()` utility                   |
| Create | `src/lib/product/productViewModel.test.ts`         | Tests for `buildProductsUrl`                   |
| Modify | `src/lib/queries.ts`                               | Add 3 product-filter queries                   |
| Create | `src/components/product/ProductCard.astro`         | Affiliate card: 1:1 image, category, name, CTA |
| Create | `src/components/product/ProductGrid.astro`         | 3-col responsive grid + empty state            |
| Create | `src/components/product/ProductFilterModals.astro` | Search + filter overlays for products          |
| Create | `src/components/product/ProductResultsBar.astro`   | "N productos · ORDENAR POR [select]"           |
| Modify | `src/pages/productos/index.astro`                  | Replace placeholder — ES catalog page          |
| Create | `src/pages/en/products/index.astro`                | EN catalog page                                |

---

## Task 1: i18n keys

**Files:**

- Modify: `src/i18n/ui.ts`
- Create: `src/i18n/ui.test.ts`

- [ ] **Step 1: Write failing test** — create `src/i18n/ui.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { ui } from "./ui";

describe("ui", () => {
  it("en has all es keys", () => {
    const esKeys = Object.keys(ui.es);
    const enKeys = new Set(Object.keys(ui.en));
    const missing = esKeys.filter((k) => !enKeys.has(k));
    expect(missing).toEqual([]);
  });
});
```

- [ ] **Step 2: Run to see it fail**

```
pnpm run test -- src/i18n/ui.test.ts
```

Expected: FAIL (or PASS if keys are already identical — that's fine, move to step 3).

- [ ] **Step 3: Add product keys to `src/i18n/ui.ts`**

In the `es` block, after `"breadcrumb.aria"`, add:

```ts
"product.headline": "Catálogo de Selección",
"product.lead": "Selección con enlaces directos a tiendas. Lo que ves, lo compras.",
"product.result": "producto",
"product.results": "productos",
"product.sort.label": "Ordenar por",
"product.sort.recent": "Más recientes",
"product.sort.popular": "Más populares",
"product.view": "Ver producto",
"product.empty": "No encontramos productos con estos filtros.",
"product.filter.categories": "Categorías",
"product.filter.store": "Tienda",
"product.filter.all_stores": "Todas",
"product.disclosure": "Enlaces de afiliados. Podemos recibir una comisión sin coste para ti.",
```

In the `en` block, after `"breadcrumb.aria"`, add:

```ts
"product.headline": "Curated Catalogue",
"product.lead": "A selection with direct links to retailers. What you see is what you shop.",
"product.result": "product",
"product.results": "products",
"product.sort.label": "Sort by",
"product.sort.recent": "Most recent",
"product.sort.popular": "Most popular",
"product.view": "View product",
"product.empty": "No products match these filters.",
"product.filter.categories": "Categories",
"product.filter.store": "Store",
"product.filter.all_stores": "All stores",
"product.disclosure": "Affiliate links. We may earn a commission at no cost to you.",
```

- [ ] **Step 4: Run test — verify it passes**

```
pnpm run test -- src/i18n/ui.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/i18n/ui.ts src/i18n/ui.test.ts
git commit -m "feat(i18n): add product catalog strings (ES + EN)"
```

---

## Task 2: Constants

**Files:**

- Modify: `src/lib/constants.ts`

- [ ] **Step 1: Add `PRODUCTS_PER_PAGE` to `src/lib/constants.ts`**

After the existing `POSTS_PER_PAGE` line, add:

```ts
export const PRODUCTS_PER_PAGE = 12;
```

- [ ] **Step 2: Run typecheck**

```
pnpm run typecheck
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/constants.ts
git commit -m "feat(catalog): add PRODUCTS_PER_PAGE constant"
```

---

## Task 3: productViewModel + tests

**Files:**

- Create: `src/lib/product/productViewModel.ts`
- Create: `src/lib/product/productViewModel.test.ts`

- [ ] **Step 1: Write failing tests** — create `src/lib/product/productViewModel.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildProductsUrl } from "./productViewModel";

describe("buildProductsUrl", () => {
  it("returns base path when no params", () => {
    expect(buildProductsUrl("/productos", {})).toBe("/productos");
  });

  it("adds categoria", () => {
    expect(buildProductsUrl("/productos", { categoria: "tops" })).toBe(
      "/productos?categoria=tops",
    );
  });

  it("adds tienda", () => {
    expect(buildProductsUrl("/productos", { tienda: "amazon" })).toBe(
      "/productos?tienda=amazon",
    );
  });

  it("omits page=1", () => {
    expect(buildProductsUrl("/productos", { page: 1 })).toBe("/productos");
  });

  it("includes page > 1", () => {
    expect(buildProductsUrl("/productos", { page: 3 })).toBe(
      "/productos?page=3",
    );
  });

  it("combines all params", () => {
    expect(
      buildProductsUrl("/productos", {
        categoria: "vestidos",
        tienda: "amazon",
        q: "midi",
        orden: "nombre",
        page: 2,
      }),
    ).toBe(
      "/productos?categoria=vestidos&tienda=amazon&q=midi&orden=nombre&page=2",
    );
  });

  it("skips empty string params", () => {
    expect(buildProductsUrl("/productos", { categoria: "", tienda: "" })).toBe(
      "/productos",
    );
  });
});
```

- [ ] **Step 2: Run to see it fail**

```
pnpm run test -- src/lib/product/productViewModel.test.ts
```

Expected: FAIL — `buildProductsUrl` not found.

- [ ] **Step 3: Create `src/lib/product/productViewModel.ts`**

```ts
// src/lib/product/productViewModel.ts

export interface ProductUrlParams {
  categoria?: string;
  tienda?: string;
  q?: string;
  orden?: string;
  page?: number;
}

export function buildProductsUrl(
  basePath: string,
  params: ProductUrlParams,
): string {
  const url = new URL(basePath, "http://x");
  if (params.categoria) url.searchParams.set("categoria", params.categoria);
  if (params.tienda) url.searchParams.set("tienda", params.tienda);
  if (params.q) url.searchParams.set("q", params.q);
  if (params.orden) url.searchParams.set("orden", params.orden);
  if (params.page && params.page > 1)
    url.searchParams.set("page", String(params.page));
  return url.pathname + (url.search || "");
}
```

- [ ] **Step 4: Run tests — verify they pass**

```
pnpm run test -- src/lib/product/productViewModel.test.ts
```

Expected: all 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/product/productViewModel.ts src/lib/product/productViewModel.test.ts
git commit -m "feat(catalog): add productViewModel with buildProductsUrl"
```

---

## Task 4: GROQ queries

**Files:**

- Modify: `src/lib/queries.ts`

The existing `productsQuery` is for the blog's `productList` block — keep it. Add three new queries for the catalog page.

- [ ] **Step 1: Add queries to `src/lib/queries.ts`**

After the last query in the file, append:

```ts
export const productsFilteredQuery = defineQuery(`
  *[_type == "product" && language == $lang && active == true
    && ($categoria == "" || category->slug.current == $categoria)
    && ($tienda == "" || store == $tienda)
    && ($q == "" || name match ($q + "*") || shortDescription match ($q + "*"))
  ] | order(publishedAt desc) [$offset...$end] {
    _id, name, image, affiliateUrl, store, shortDescription,
    "category": category->{ _id, name, slug }
  }
`);

export const productsFilteredByNameQuery = defineQuery(`
  *[_type == "product" && language == $lang && active == true
    && ($categoria == "" || category->slug.current == $categoria)
    && ($tienda == "" || store == $tienda)
    && ($q == "" || name match ($q + "*") || shortDescription match ($q + "*"))
  ] | order(name asc) [$offset...$end] {
    _id, name, image, affiliateUrl, store, shortDescription,
    "category": category->{ _id, name, slug }
  }
`);

export const productsFilteredCountQuery = defineQuery(`
  count(*[_type == "product" && language == $lang && active == true
    && ($categoria == "" || category->slug.current == $categoria)
    && ($tienda == "" || store == $tienda)
    && ($q == "" || name match ($q + "*") || shortDescription match ($q + "*"))
  ])
`);
```

- [ ] **Step 2: Run typecheck**

```
pnpm run typecheck
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/queries.ts
git commit -m "feat(catalog): add filtered product GROQ queries"
```

---

## Task 5: ProductCard

**Files:**

- Create: `src/components/product/ProductCard.astro`

- [ ] **Step 1: Create `src/components/product/ProductCard.astro`**

```astro
---
// src/components/product/ProductCard.astro
import { ArrowUpRight } from "@lucide/astro";
import { resolveImageUrl } from "@/lib/sanity";

interface Props {
  name: string;
  category?: string;
  image?: unknown;
  badge?: string;
  href: string;
  ctaLabel: string;
}

const { name, category, image, badge, href, ctaLabel } = Astro.props;
const imgUrl = resolveImageUrl(image as Parameters<typeof resolveImageUrl>[0], {
  width: 480,
  height: 480,
});
---

<div
  class="bg-surface-card border-line flex flex-col overflow-hidden rounded-xl border transition-shadow hover:shadow-md"
>
  <div
    class="from-cream-deep to-rose-nude relative aspect-square overflow-hidden bg-gradient-to-br"
  >
    {
      imgUrl && (
        <img
          src={imgUrl}
          alt={name}
          width="480"
          height="480"
          loading="lazy"
          class="h-full w-full object-cover"
        />
      )
    }
    {
      badge && (
        <span class="bg-gold text-cream rounded-pill absolute top-3 left-3 px-2.5 py-1 font-sans text-[11px] font-bold tracking-[0.1em] uppercase">
          {badge}
        </span>
      )
    }
  </div>
  <div class="flex flex-1 flex-col gap-1.5 p-5">
    {
      category && (
        <span class="text-gold font-sans text-[12px] font-bold tracking-[0.12em] uppercase">
          {category}
        </span>
      )
    }
    <h4 class="text-olive font-serif text-[20px] leading-snug font-semibold">
      {name}
    </h4>
    <a
      href={href}
      target="_blank"
      rel="sponsored nofollow noopener"
      class="text-gold mt-auto inline-flex items-center gap-2 pt-4 font-sans text-[13px] font-bold tracking-[0.06em] uppercase transition-opacity hover:opacity-75"
    >
      {ctaLabel}
      <ArrowUpRight class="h-4 w-4 shrink-0" aria-hidden="true" />
    </a>
  </div>
</div>
```

- [ ] **Step 2: Run typecheck**

```
pnpm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/product/ProductCard.astro
git commit -m "feat(catalog): add ProductCard component"
```

---

## Task 6: ProductGrid

**Files:**

- Create: `src/components/product/ProductGrid.astro`

- [ ] **Step 1: Create `src/components/product/ProductGrid.astro`**

```astro
---
// src/components/product/ProductGrid.astro
import type { Locale } from "@/types/index";
import { useTranslations } from "@/i18n";
import ProductCard from "./ProductCard.astro";

interface ProductItem {
  _id: string;
  name: string;
  image?: unknown;
  affiliateUrl: string;
  store?: string;
  category?: {
    _id: string;
    name: Record<string, string>;
    slug: { current: string };
  };
}

interface Props {
  products: ProductItem[];
  lang: Locale;
}

const { products, lang } = Astro.props;
const t = useTranslations(lang);
---

{
  products.length === 0 ? (
    <p class="text-olive-soft text-lead py-16 text-center">
      {t("product.empty")}
    </p>
  ) : (
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <ProductCard
          name={p.name}
          category={p.category?.name?.[lang] ?? p.category?.name?.es}
          image={p.image}
          href={p.affiliateUrl}
          ctaLabel={t("product.view")}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Run typecheck**

```
pnpm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/product/ProductGrid.astro
git commit -m "feat(catalog): add ProductGrid component"
```

---

## Task 7: ProductFilterModals

**Files:**

- Create: `src/components/product/ProductFilterModals.astro`

Same overlay pattern as `BlogFilterModals.astro`. Two filter groups: CATEGORÍAS (radio: Todo + Sanity categories) and TIENDA (radio: Todas/Amazon/Shein). Both forms preserve `orden` param; search form also preserves `tienda`; filter form preserves `q`.

- [ ] **Step 1: Create `src/components/product/ProductFilterModals.astro`**

```astro
---
// src/components/product/ProductFilterModals.astro
import { Search, SlidersHorizontal, X } from "@lucide/astro";

interface Category {
  _id: string;
  name: Record<string, string>;
  slug: { current: string };
}

export interface ProductFilterLabels {
  search: string;
  filter: string;
  placeholder: string;
  categories: string;
  store: string;
  allStores: string;
  all: string;
  clearAll: string;
  confirm: string;
}

interface Props {
  categories: Category[];
  activeCategoria: string;
  activeTienda: string;
  activeQ: string;
  activeOrden: string;
  basePath: string;
  lang: string;
  labels: ProductFilterLabels;
}

const {
  categories,
  activeCategoria,
  activeTienda,
  activeQ,
  activeOrden,
  basePath,
  lang,
  labels,
} = Astro.props;

const btnBase =
  "flex items-center gap-1.5 border border-line-strong rounded-pill px-4 py-2 text-small font-sans uppercase tracking-widest text-olive-soft hover:border-olive hover:text-olive transition-colors bg-transparent cursor-pointer";

const chipClass =
  "rounded-pill border px-[18px] py-2 text-small font-sans transition-colors cursor-pointer inline-flex items-center " +
  "border-line-strong bg-transparent text-olive-soft hover:border-olive hover:text-olive " +
  "has-[input:checked]:bg-olive has-[input:checked]:border-olive has-[input:checked]:text-cream has-[input:checked]:font-bold";
---

<div class="flex flex-none gap-2">
  <button type="button" id="btn-psearch-open" class={btnBase}>
    <Search class="h-4 w-4 shrink-0" aria-hidden="true" />
    {labels.search}
  </button>
  <button type="button" id="btn-pfilter-open" class={btnBase}>
    <SlidersHorizontal class="h-4 w-4 shrink-0" aria-hidden="true" />
    {labels.filter}
  </button>
</div>

<!-- Search overlay -->
<div
  id="overlay-psearch"
  class="fixed inset-0 z-50 flex hidden items-center justify-center p-5"
  style="background: rgba(62, 61, 47, 0.55)"
>
  <div
    role="dialog"
    aria-modal="true"
    class="bg-cream border-line relative w-full max-w-[460px] rounded-xl border p-8 shadow-lg"
  >
    <button
      type="button"
      id="btn-psearch-close"
      class="text-olive-soft hover:text-olive absolute top-5 right-5 cursor-pointer transition-colors"
      aria-label="Cerrar"
    >
      <X class="h-5 w-5" />
    </button>
    <h2 class="text-olive mb-5 font-serif text-[28px] font-semibold">
      {labels.search}
    </h2>
    <form method="GET" action={basePath}>
      {
        activeCategoria && (
          <input type="hidden" name="categoria" value={activeCategoria} />
        )
      }
      {
        activeTienda && (
          <input type="hidden" name="tienda" value={activeTienda} />
        )
      }
      {activeOrden && <input type="hidden" name="orden" value={activeOrden} />}
      <div class="relative mb-6">
        <Search
          class="text-olive-faint absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <input
          type="search"
          name="q"
          value={activeQ}
          placeholder={labels.placeholder}
          class="border-line-strong text-body text-olive placeholder:text-olive-faint focus:border-gold w-full rounded-md border bg-transparent py-3 pr-4 pl-10 transition-colors focus:outline-none"
        />
      </div>
      <button
        type="submit"
        class="bg-gold text-cream text-small w-full cursor-pointer rounded-md border-0 py-3 font-sans tracking-widest uppercase transition-opacity hover:opacity-90"
      >
        {labels.search.toUpperCase()}
      </button>
    </form>
  </div>
</div>

<!-- Filter overlay -->
<div
  id="overlay-pfilter"
  class="fixed inset-0 z-50 flex hidden items-center justify-center p-5"
  style="background: rgba(62, 61, 47, 0.55)"
>
  <div
    role="dialog"
    aria-modal="true"
    class="bg-cream border-line relative max-h-[90vh] w-full max-w-[500px] overflow-y-auto rounded-xl border p-8 shadow-lg"
  >
    <button
      type="button"
      id="btn-pfilter-close"
      class="text-olive-soft hover:text-olive absolute top-5 right-5 cursor-pointer transition-colors"
      aria-label="Cerrar"
    >
      <X class="h-5 w-5" />
    </button>
    <h2
      class="text-olive mb-6 font-sans text-[22px] font-bold tracking-widest uppercase"
    >
      {labels.filter.toUpperCase()}
    </h2>
    <form method="GET" action={basePath}>
      {activeQ && <input type="hidden" name="q" value={activeQ} />}
      {activeOrden && <input type="hidden" name="orden" value={activeOrden} />}

      <!-- Categories -->
      <p
        class="text-olive-soft mb-3 font-sans text-[11px] font-bold tracking-[0.16em] uppercase"
      >
        {labels.categories.toUpperCase()}
      </p>
      <div class="mb-7 flex flex-wrap gap-2">
        <label class={chipClass}>
          <input
            type="radio"
            name="categoria"
            value=""
            class="sr-only"
            checked={!activeCategoria}
          />
          {labels.all}
        </label>
        {
          categories.map((cat) => {
            const name = cat.name?.[lang] ?? cat.name?.es ?? "";
            return (
              <label class={chipClass}>
                <input
                  type="radio"
                  name="categoria"
                  value={cat.slug.current}
                  class="sr-only"
                  checked={activeCategoria === cat.slug.current}
                />
                {name}
              </label>
            );
          })
        }
      </div>

      <!-- Store -->
      <p
        class="text-olive-soft mb-3 font-sans text-[11px] font-bold tracking-[0.16em] uppercase"
      >
        {labels.store.toUpperCase()}
      </p>
      <div class="mb-8 flex flex-wrap gap-2">
        {
          [
            { value: "", label: labels.allStores },
            { value: "amazon", label: "Amazon" },
            { value: "shein", label: "Shein" },
          ].map(({ value, label }) => (
            <label class={chipClass}>
              <input
                type="radio"
                name="tienda"
                value={value}
                class="sr-only"
                checked={activeTienda === value}
              />
              {label}
            </label>
          ))
        }
      </div>

      <div class="flex gap-3">
        <a
          href={basePath}
          class="border-line-strong rounded-pill text-small text-olive-soft hover:border-olive flex-1 border py-2.5 text-center font-sans tracking-wider uppercase transition-colors"
        >
          {labels.clearAll.toUpperCase()}
        </a>
        <button
          type="submit"
          class="bg-gold text-cream rounded-pill text-small flex-1 cursor-pointer border-0 py-2.5 font-sans tracking-wider uppercase transition-opacity hover:opacity-90"
        >
          {labels.confirm.toUpperCase()}
        </button>
      </div>
    </form>
  </div>
</div>

<script>
  const sOverlay = document.getElementById("overlay-psearch");
  const fOverlay = document.getElementById("overlay-pfilter");

  function openS() {
    sOverlay?.classList.remove("hidden");
    (
      sOverlay?.querySelector('input[type="search"]') as HTMLInputElement | null
    )?.focus();
  }
  function closeS() {
    sOverlay?.classList.add("hidden");
  }
  function openF() {
    fOverlay?.classList.remove("hidden");
  }
  function closeF() {
    fOverlay?.classList.add("hidden");
  }

  document.getElementById("btn-psearch-open")?.addEventListener("click", openS);
  document
    .getElementById("btn-psearch-close")
    ?.addEventListener("click", closeS);
  document.getElementById("btn-pfilter-open")?.addEventListener("click", openF);
  document
    .getElementById("btn-pfilter-close")
    ?.addEventListener("click", closeF);

  sOverlay?.addEventListener("click", (e) => {
    if (e.target === sOverlay) closeS();
  });
  fOverlay?.addEventListener("click", (e) => {
    if (e.target === fOverlay) closeF();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeS();
      closeF();
    }
  });
</script>
```

- [ ] **Step 2: Run typecheck**

```
pnpm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/product/ProductFilterModals.astro
git commit -m "feat(catalog): add ProductFilterModals component"
```

---

## Task 8: ProductResultsBar

**Files:**

- Create: `src/components/product/ProductResultsBar.astro`

Sort select auto-submits via `<script>`. Hidden inputs preserve `categoria`, `tienda`, `q`.

- [ ] **Step 1: Create `src/components/product/ProductResultsBar.astro`**

```astro
---
// src/components/product/ProductResultsBar.astro
import type { Locale } from "@/types/index";
import { useTranslations } from "@/i18n";

interface Props {
  total: number;
  sort: string;
  basePath: string;
  activeCategoria: string;
  activeTienda: string;
  activeQ: string;
  lang: Locale;
}

const { total, sort, basePath, activeCategoria, activeTienda, activeQ, lang } =
  Astro.props;
const t = useTranslations(lang);
const noun = total === 1 ? t("product.result") : t("product.results");
---

<div
  class="border-line mb-7 flex flex-wrap items-center justify-between gap-4 border-b pb-5"
>
  <span class="text-small text-olive-soft">{total} {noun}</span>
  <form method="GET" action={basePath} class="flex items-center gap-3">
    {
      activeCategoria && (
        <input type="hidden" name="categoria" value={activeCategoria} />
      )
    }
    {activeTienda && <input type="hidden" name="tienda" value={activeTienda} />}
    {activeQ && <input type="hidden" name="q" value={activeQ} />}
    <span
      class="text-olive-soft font-sans text-[13px] font-bold tracking-[0.1em] whitespace-nowrap uppercase"
    >
      {t("product.sort.label")}
    </span>
    <select
      id="sort-select"
      name="orden"
      class="border-line-strong text-small text-olive focus:border-gold cursor-pointer rounded-md border bg-transparent px-3 py-2 font-sans focus:outline-none"
    >
      <option value="recientes" selected={sort !== "nombre"}
        >{t("product.sort.recent")}</option
      >
      <option value="nombre" selected={sort === "nombre"}
        >{t("product.sort.popular")}</option
      >
    </select>
  </form>
</div>

<script>
  document.getElementById("sort-select")?.addEventListener("change", (e) => {
    (e.currentTarget as HTMLSelectElement).closest("form")?.submit();
  });
</script>
```

- [ ] **Step 2: Run typecheck**

```
pnpm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/product/ProductResultsBar.astro
git commit -m "feat(catalog): add ProductResultsBar with sort select"
```

---

## Task 9: ES page — /productos

**Files:**

- Modify: `src/pages/productos/index.astro`

Replace the "Coming in Stage 08" placeholder with the real catalog.

- [ ] **Step 1: Replace `src/pages/productos/index.astro`** with:

```astro
---
// src/pages/productos/index.astro
export const prerender = false;

import BaseLayout from "@/layouts/BaseLayout.astro";
import Breadcrumb from "@/components/Breadcrumb.astro";
import Badge from "@/components/ui/Badge.astro";
import ProductFilterModals from "@/components/product/ProductFilterModals.astro";
import ProductResultsBar from "@/components/product/ProductResultsBar.astro";
import ProductGrid from "@/components/product/ProductGrid.astro";
import BlogPagination from "@/components/blog/BlogPagination.astro";
import { sanityClient } from "sanity:client";
import {
  productsFilteredQuery,
  productsFilteredByNameQuery,
  productsFilteredCountQuery,
  productCategoriesQuery,
} from "@/lib/queries";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";
import { useTranslations } from "@/i18n";
import type { Locale } from "@/types/index";

const lang: Locale = "es";
const t = useTranslations(lang);

const categoria = Astro.url.searchParams.get("categoria") ?? "";
const tienda = Astro.url.searchParams.get("tienda") ?? "";
const q = Astro.url.searchParams.get("q") ?? "";
const orden = Astro.url.searchParams.get("orden") ?? "recientes";
const page = Math.max(1, Number(Astro.url.searchParams.get("page") ?? "1"));
const offset = (page - 1) * PRODUCTS_PER_PAGE;
const end = offset + PRODUCTS_PER_PAGE;

const activeQuery =
  orden === "nombre" ? productsFilteredByNameQuery : productsFilteredQuery;

const [rawProducts, total, categories] = await Promise.all([
  sanityClient.fetch(activeQuery, { lang, categoria, tienda, q, offset, end }),
  sanityClient.fetch(productsFilteredCountQuery, {
    lang,
    categoria,
    tienda,
    q,
  }),
  sanityClient.fetch(productCategoriesQuery),
]);

const totalPages = Math.ceil((total ?? 0) / PRODUCTS_PER_PAGE);
---

<BaseLayout
  title={t("nav.products")}
  description={t("product.lead")}
  lang={lang}
>
  <div
    class="mx-auto max-w-[var(--container)] [padding:var(--space-8)_var(--gutter)_var(--space-9)]"
  >
    <Breadcrumb
      items={[
        { label: t("nav.home"), href: "/" },
        { label: t("nav.products") },
      ]}
      lang={lang}
      class="mb-2.5"
    />
    <header
      class="border-line mb-7 flex flex-wrap items-end justify-between gap-6 border-b pb-6"
    >
      <div class="max-w-[640px]">
        <Badge tone="gold" class="mb-3">{t("nav.products")}</Badge>
        <h1
          class="text-h1 text-olive my-3 font-serif leading-tight font-semibold"
        >
          {t("product.headline")}
        </h1>
        <p class="text-lead text-olive-soft">{t("product.lead")}</p>
      </div>
      <ProductFilterModals
        categories={categories}
        activeCategoria={categoria}
        activeTienda={tienda}
        activeQ={q}
        activeOrden={orden}
        basePath="/productos"
        lang={lang}
        labels={{
          search: t("common.search"),
          filter: t("common.filter"),
          placeholder: t("blog.search.placeholder"),
          categories: t("product.filter.categories"),
          store: t("product.filter.store"),
          allStores: t("product.filter.all_stores"),
          all: t("blog.all"),
          clearAll: t("common.clear_all"),
          confirm: t("common.confirm"),
        }}
      />
    </header>

    <ProductResultsBar
      total={total ?? 0}
      sort={orden}
      basePath="/productos"
      activeCategoria={categoria}
      activeTienda={tienda}
      activeQ={q}
      lang={lang}
    />

    <ProductGrid products={rawProducts ?? []} lang={lang} />

    <BlogPagination
      currentPage={page}
      totalPages={totalPages}
      currentUrl={Astro.url.toString()}
      lang={lang}
    />

    <p class="text-olive-faint mt-10 text-center text-[13px]">
      {t("product.disclosure")}
    </p>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Run lint + typecheck**

```
pnpm run lint && pnpm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Start dev server and verify**

```
pnpm run dev
```

Open `http://localhost:4321/productos` and check:

- Header with Badge + H1 + description + filter buttons
- Results bar with count + sort select
- 3-col product grid (or empty state if no Sanity data)
- Pagination (if > 12 products)
- Disclosure at the bottom
- Buscar modal opens/closes (Escape and backdrop)
- Filtrar modal shows Categorías + Tienda sections
- Sort select triggers page reload with `?orden=nombre`
- Filter Confirmar navigates with queryParams

- [ ] **Step 4: Commit**

```bash
git add src/pages/productos/index.astro
git commit -m "feat(catalog): implement ES product catalog page"
```

---

## Task 10: EN page — /en/products

**Files:**

- Create: `src/pages/en/products/index.astro`

Identical to the ES page except `lang = 'en'` and `basePath = '/en/products'`.

- [ ] **Step 1: Create `src/pages/en/products/index.astro`**

```astro
---
// src/pages/en/products/index.astro
export const prerender = false;

import BaseLayout from "@/layouts/BaseLayout.astro";
import Breadcrumb from "@/components/Breadcrumb.astro";
import Badge from "@/components/ui/Badge.astro";
import ProductFilterModals from "@/components/product/ProductFilterModals.astro";
import ProductResultsBar from "@/components/product/ProductResultsBar.astro";
import ProductGrid from "@/components/product/ProductGrid.astro";
import BlogPagination from "@/components/blog/BlogPagination.astro";
import { sanityClient } from "sanity:client";
import {
  productsFilteredQuery,
  productsFilteredByNameQuery,
  productsFilteredCountQuery,
  productCategoriesQuery,
} from "@/lib/queries";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";
import { useTranslations } from "@/i18n";
import type { Locale } from "@/types/index";

const lang: Locale = "en";
const t = useTranslations(lang);

const categoria = Astro.url.searchParams.get("categoria") ?? "";
const tienda = Astro.url.searchParams.get("tienda") ?? "";
const q = Astro.url.searchParams.get("q") ?? "";
const orden = Astro.url.searchParams.get("orden") ?? "recientes";
const page = Math.max(1, Number(Astro.url.searchParams.get("page") ?? "1"));
const offset = (page - 1) * PRODUCTS_PER_PAGE;
const end = offset + PRODUCTS_PER_PAGE;

const activeQuery =
  orden === "nombre" ? productsFilteredByNameQuery : productsFilteredQuery;

const [rawProducts, total, categories] = await Promise.all([
  sanityClient.fetch(activeQuery, { lang, categoria, tienda, q, offset, end }),
  sanityClient.fetch(productsFilteredCountQuery, {
    lang,
    categoria,
    tienda,
    q,
  }),
  sanityClient.fetch(productCategoriesQuery),
]);

const totalPages = Math.ceil((total ?? 0) / PRODUCTS_PER_PAGE);
---

<BaseLayout
  title={t("nav.products")}
  description={t("product.lead")}
  lang={lang}
>
  <div
    class="mx-auto max-w-[var(--container)] [padding:var(--space-8)_var(--gutter)_var(--space-9)]"
  >
    <Breadcrumb
      items={[
        { label: t("nav.home"), href: "/en" },
        { label: t("nav.products") },
      ]}
      lang={lang}
      class="mb-2.5"
    />
    <header
      class="border-line mb-7 flex flex-wrap items-end justify-between gap-6 border-b pb-6"
    >
      <div class="max-w-[640px]">
        <Badge tone="gold" class="mb-3">{t("nav.products")}</Badge>
        <h1
          class="text-h1 text-olive my-3 font-serif leading-tight font-semibold"
        >
          {t("product.headline")}
        </h1>
        <p class="text-lead text-olive-soft">{t("product.lead")}</p>
      </div>
      <ProductFilterModals
        categories={categories}
        activeCategoria={categoria}
        activeTienda={tienda}
        activeQ={q}
        activeOrden={orden}
        basePath="/en/products"
        lang={lang}
        labels={{
          search: t("common.search"),
          filter: t("common.filter"),
          placeholder: t("blog.search.placeholder"),
          categories: t("product.filter.categories"),
          store: t("product.filter.store"),
          allStores: t("product.filter.all_stores"),
          all: t("blog.all"),
          clearAll: t("common.clear_all"),
          confirm: t("common.confirm"),
        }}
      />
    </header>

    <ProductResultsBar
      total={total ?? 0}
      sort={orden}
      basePath="/en/products"
      activeCategoria={categoria}
      activeTienda={tienda}
      activeQ={q}
      lang={lang}
    />

    <ProductGrid products={rawProducts ?? []} lang={lang} />

    <BlogPagination
      currentPage={page}
      totalPages={totalPages}
      currentUrl={Astro.url.toString()}
      lang={lang}
    />

    <p class="text-olive-faint mt-10 text-center text-[13px]">
      {t("product.disclosure")}
    </p>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Run lint + typecheck**

```
pnpm run lint && pnpm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Verify EN page in dev server**

Open `http://localhost:4321/en/products` and confirm:

- UI text is in English (Products, Search, Filter, View product…)
- LangToggle on Navbar switches correctly between ES and EN
- Filters and sort work with the `/en/products` basePath

- [ ] **Step 4: Commit**

```bash
git add src/pages/en/products/index.astro
git commit -m "feat(catalog): implement EN product catalog page"
```

---

## Task 11: Final verification

- [ ] **Step 1: Run full test suite**

```
pnpm run test
```

Expected: all tests pass (including the new `ui.test.ts` and `productViewModel.test.ts`).

- [ ] **Step 2: Run lint + typecheck**

```
pnpm run lint && pnpm run typecheck
```

Expected: clean.

- [ ] **Step 3: Update HANDOFF.md**

Add a Stage 07 section documenting:

- Files created
- i18n keys added
- Known limitations (sort "Más populares" sorts by `name asc`, no real popularity metric)
- ProductFilterModals uses radio buttons for store (not multi-select checkboxes as FUNDAMENTS described)

- [ ] **Step 4: Final commit**

```bash
git add HANDOFF.md
git commit -m "docs: update HANDOFF for Stage 07 completion"
```
