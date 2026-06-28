# Stage 07 — Product Catalog: Design Spec

**Date:** 2026-06-28  
**Route:** `/productos` (ES) · `/en/products` (EN)  
**Goal:** Affiliate product catalog with filter modals, 3-col grid, no prices, outbound CTA links.

---

## Architecture

Server-side filtering via queryParams — consistent with the blog pattern.  
QueryParams: `?categoria=<slug>&tienda=<store>&q=<text>&orden=<recientes|nombre>&pagina=<n>`

No client-side filtering. Page reloads on filter changes. `prerender = false` on both pages.

Design reference: Claude Design project `658592d3-5da1-4cd3-81b6-c1576c694e23` → `ui_kits/website/ProductCatalog.jsx`.  
**Note:** FUNDAMENTS.md describes a sticky sidebar; Claude Design uses filter modals (same pattern as blog). This spec follows Claude Design.

---

## Components

### `src/components/product/ProductCard.astro`

Props: `name`, `category`, `image`, `badge`, `href`, `ctaLabel`, `lang`

- 1:1 aspect ratio image (or gradient fallback)
- Optional badge (pill, gold background, top-left)
- Category kicker: gold, uppercase, 12px
- Name: serif, 20px
- CTA: "Ver producto ↗" / "View product ↗", `target="_blank"`, `rel="sponsored nofollow noopener"`
- No price, ever.

### `src/components/product/ProductGrid.astro`

Props: `products[]`, `lang`

- 1 col mobile, 2 col tablet, 3 col desktop
- Empty state: "No encontramos productos con estos filtros."

### `src/components/product/ProductFilterModals.astro`

Props: `lang`, `categories[]`, `activeCategory`, `activeStore`, `activeQuery`

- Two buttons: Buscar (opens search overlay) + Filtrar (opens filter overlay)
- Search overlay: text input, Confirmar closes and submits
- Filter overlay: CATEGORÍAS checkboxes (Todo + Sanity categories) + TIENDA checkboxes (Amazon, Shein)
- Close on backdrop click or Escape
- Active filters shown via CSS `has-[input:checked]` state
- On Confirmar: native form GET submit

### `src/components/product/ProductResultsBar.astro`

Props: `total`, `sort`, `lang`

- Left: "N productos" / "N products"
- Right: "ORDENAR POR" label + `<select>` (Más recientes / Más populares)
- Sort change submits form via JS `onchange`
- Bottom border separator

### `src/components/product/ProductPagination.astro`

Props: `page`, `totalPages`, `lang`, `baseUrl` (current URL without `pagina` param)

- Same pattern as `BlogPagination.astro`
- Active page: gold underline, bold

---

## Data

### Queries (additions to `src/lib/queries.ts`)

```groq
// productsFilteredQuery — sorted by publishedAt desc (default)
*[_type == "product" && language == $lang && active == true
  && ($categoria == "" || category->slug.current == $categoria)
  && ($tienda == "" || store == $tienda)
  && ($q == "" || name match ($q + "*") || shortDescription match ($q + "*"))
] | order(publishedAt desc) [$offset...$end] {
  _id, name, image, affiliateUrl, store, shortDescription,
  "category": category->{ name, slug }
}

// productsFilteredByNameQuery — sorted by name asc
// Same filter block, | order(name asc)

// productsFilteredCountQuery — count(*[...same filters...])
```

### Constants (`src/lib/constants.ts`)

Add: `export const PRODUCTS_PER_PAGE = 12`

### View model (`src/lib/product/productViewModel.ts`)

- `buildProductsUrl(params)` — builds URL with queryParams (same shape as blog)

---

## Pages

### `src/pages/productos/index.astro`

`export const prerender = false`  
Reads queryParams: `categoria`, `tienda`, `q`, `orden`, `pagina`  
Fetches: productCategories + filtered products + count  
Mounts: Badge + header + `ProductFilterModals` + `ProductResultsBar` + `ProductGrid` + `ProductPagination` + disclosure  
~80 lines max

### `src/pages/en/products/index.astro`

Same, `lang = 'en'`

---

## i18n keys (both locales)

```
product.headline    "Catálogo de Selección"         "Curated Catalogue"
product.lead        "Selección con enlaces directos…" "A selection with direct links…"
product.results     "{n} productos"                 "{n} products"
product.result      "1 producto"                    "1 product"
product.sort.label  "Ordenar por"                   "Sort by"
product.sort.recent "Más recientes"                 "Most recent"
product.sort.popular "Más populares"                "Most popular"
product.view        "Ver producto"                  "View product"
product.empty       "No encontramos productos…"     "No products match these filters."
product.filter.categories "Categorías"              "Categories"
product.filter.store "Tienda"                       "Store"
product.disclosure  "Enlaces de afiliados. Podemos recibir una comisión sin coste para ti."
                    "Affiliate links. We may earn a commission at no cost to you."
```

---

## Definition of Done

- Filters (category + store + search) and sort work together with pagination
- All product links: `target="_blank"` + `rel="sponsored nofollow noopener"`
- Affiliate disclosure visible at bottom
- ES + EN pages with correct hreflang
- `lint` + `typecheck` + `test` pass
