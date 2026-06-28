# HANDOFF — Esencia Magnética

**Fecha:** 2026-06-28 (actualizado)
**Estado actual:** Stage 07 completo (Product Catalog + Search/Filter UX) ✅ · Próximo: Stage 08

---

## Dónde estamos

Stages 01–06 terminados. Stage 06 tuvo una ronda de fixes después de la entrega inicial; están todos commiteados.

**Stack:** Astro v6.4.8 · TypeScript strict · Tailwind v4 · ESLint v9 · Prettier · Vitest · Husky + lint-staged · Sanity v6 · `@sanity/document-internationalization` · `@sanity/astro` · `@astrojs/cloudflare` · `astro-seo`.

**Repos:**

- Frontend: `E:\esencia-magnetica`
- Studio: `E:\esencia-magnetica-studio`

---

## Decisiones clave ya tomadas

### Design System (Stage 02)

- **Sin shadcn/ui** — componentes como `.astro` puro con CVA. shadcn se reserva para React islands cuando haya interactividad real.
- **CVA en `src/lib/ui/*.ts`**, nunca en frontmatter `.astro` — necesario para escaneo de Tailwind v4.
- **`cn()` en `src/lib/utils.ts`** — `clsx` + `extendTailwindMerge` con tokens font-size del brand.
- **`leading-none` siempre después de `text-*`** en strings CVA — tailwind-merge v3 composed class groups.
- **Clases de radio en Tailwind v4:** los tokens `--radius-lg`, `--radius-md` etc. en `@theme` generan `rounded-lg`, `rounded-md` (sin el prefijo `radius`). `rounded-radius-lg` **NO existe** — produce 0px. Usar siempre `rounded-lg`, `rounded-t-lg`, `rounded-l-lg`, etc.
- Husky en lugar de GitHub Actions; GA en Stage 12.
- Path alias `@/*` → `src/`.

### CMS (Stage 03)

- **Estrategia i18n híbrida:**
  - Doc-level via `@sanity/document-internationalization` → `post`, `product`, `page`
  - Field-level `{es, en}` → `blogCategory`, `productCategory`, `siteSettings`
  - Singletons con IDs fijos → `brand-es` / `brand-en`
- **`author` es multi-documento** (no singleton) — posts tienen campo `authors: array<reference→author>`.
- **`@sanity/astro`** provee el virtual module `sanity:client` — no se instancia `createClient` manualmente.
- **TypeGen types** en `src/types/sanity.types.ts` — actualizar manualmente al cambiar schemas en Studio.
- **`createImageUrlBuilder`** (named export, no el default deprecated) de `@sanity/image-url`.
- **Studio en repo separado** (`E:\esencia-magnetica-studio`) — solo uso local.
- **`coverImage` es un objeto custom**, NO extiende el tipo `image` base. Estructura:
  ```
  { _type: "coverImage", asset: { _type: "image", asset: SanityImageAssetReference }, externalUrl?, alt? }
  ```
  Usar siempre `resolveImageUrl(post.coverImage)` (en `src/lib/sanity.ts`), NUNCA `urlFor(post.coverImage)` directamente.
- **Todos los campos de imagen soportan URL externa** via `externalUrl` — `coverImage` type ya lo tenía; `seo.ogImage` se cambió a tipo `coverImage` en Studio también.

### i18n / Layout (Stage 04)

- **i18n architecture:** `src/i18n/ui.ts` (ES+EN) + `src/i18n/utils.ts` (puro) + `src/i18n/index.ts` (barrel).
- **astro.config.mjs:** bloque `i18n: { defaultLocale: 'es', locales: ['es', 'en'] }`.
- **ROUTE_PAIRS estático** en `getLocalizedUrl` — `/productos` ↔ `/en/products`, `/marca` ↔ `/en/brand` no son transformaciones algorítmicas.
- **LangToggle:** locale activo = `<span aria-current="true">` (no interactivo), locale inactivo = `<a href>`.
- **Mobile nav:** clase CSS `is-open` (no `hidden` Tailwind) para evitar conflictos con media queries.
- **404.astro:** siempre `lang='es'` — Astro sirve la 404 sin contexto de locale.

### Home Page (Stage 05)

- **`MarqueeRow.astro` es independiente por fila** — no hay un componente "gallery" contenedor.
- **Animación pixel-based:** posiciones en px con `getBoundingClientRect()`, contenido triplicado, velocidad con `FRICTION=0.92`, `wrapValue(x, -setWidth, 0)`. Sin GSAP, sin React.
- **`height` prop configurable** en `MarqueeRow` (default `"300px"`).
- **`document.querySelectorAll`** (no `window.document`) — ESLint lanza `no-unused-expressions` con `window.document`.

### Blog UI/UX improvements (post Stage 06)

- **No React** — todo el blog es Astro puro con `<script>` vanilla JS. No instalar ni usar React islands en esta área.
- **Filtros como overlays modales** (`BlogFilterModals.astro`) — reemplaza `BlogFilters.astro`. Dos botones (Buscar / Filtrar) abren overlays separados. Estado del chip activo via `has-[input:checked]:*` (CSS puro, sin JS). Overlay cierra con clic en backdrop o Escape.
- **`@apply` en `<style>` de componente Astro requiere `@reference`** — en Tailwind v4 no ve los tokens custom del `@theme`. Solución alternativa: usar los variants de Tailwind directamente en el atributo `class`, o CSS con `var(--token)` en `<style is:global>`.
- **Clases en template literals de frontmatter** — clases Tailwind dentro de callbacks de `toHTML()` pueden no ser escaneadas de forma fiable. Solución: CSS class `.post-body` en `global.css` con `var()` custom properties (sin `@apply`).
- **`.post-body` usa selectores hijo directo (`>`)** — `& > p`, `& > h2`, etc. Evita que los estilos afecten al `<section>` anidado del `productList`. Los links de texto son `& > p a` (siempre dentro de `<p>`).
- **`YoutubeEmbed.url` no `YoutubeEmbed.videoId`** — el schema Sanity guarda la URL completa en `url`, no el ID. Extraer con: `url.match(/[?&]v=([^&]+)/) ?? url.match(/youtu\.be\/([^?/]+)/)`.
- **`blockContent` sin H1** — el schema del Studio define `styles` explícito: `normal`, `h2`, `h3`, `blockquote`. H1 removido para no competir con el título del post.
- **Excerpt limitado a 200 caracteres** — validación `r.max(200)` en `post.ts` del Studio. El frontend no necesita `line-clamp` — la fuente de verdad es el schema.
- **`Breadcrumb.astro`** — componente cross-cutting en `src/components/`. Separator `" — "` por defecto. Recibe `items: { label, href? }[]` y `lang`.

### Blog (Stage 06)

- **`output: 'static'` + `prerender = false` por página** — `output: 'hybrid'` fue eliminado en Astro v6. Las páginas del blog usan `export const prerender = false` para ser SSR.
- **Adapter:** `@astrojs/cloudflare` (v14.0.1) para Cloudflare Pages.
- **Filtros server-side:** todos los filtros (categoría, búsqueda, página) son queryParams de URL leídos en servidor, sin client-side JS.
- **GROQ listing query:** `"readTime": round(length(pt::text(body)) / 1000)` — estimación sin traer body completo.
- **`@portabletext/to-html`** para renderizar Portable Text sin React (evita islands).
- **YouTube façade:** thumbnail → `replaceChildren(iframe)` on click. Usar `replaceChildren()` en lugar de `innerHTML = ""` — hook de seguridad bloquea innerHTML.
- **SEO:** plugin `astro-seo` con `hrefLang` (camelCase, NO `hreflang`).
- **Design del blog:** respeta Claude Design proyecto `658592d3-5da1-4cd3-81b6-c1576c694e23`.
- **`resolveImageUrl(source, { width, height })`** en `src/lib/sanity.ts`: prioriza `source.externalUrl`, si no pasa `source.asset` (imagen interna) a `safeUrlFor`. Retorna `string | null`.
- **`seo.metaTitle` / `seo.metaDescription` / `seo.ogImage`** — campos reales del schema Sanity (NO `seo.title` / `seo.description` / `seo.image`). `BlogPostLayout` ya usa los nombres correctos.
- **View Transitions:** `ClientRouter` (Astro v6, antes `ViewTransitions`) en `BaseLayout`. `transition:name="post-image-{slug}"` en PostCard, FeaturedPost y PostHero para morphing de imagen al navegar card → detalle.
- **Imágenes siempre 16:9:** PostCard, FeaturedPost y PostHero usan `aspect-video`. FeaturedPost en desktop mantiene el grid `1.5fr_1fr` pero la imagen del grid izquierdo es siempre 16:9 (sin `lg:aspect-auto lg:h-full`).
- **Fecha corta:** `formatPostDate` usa `month: 'short'` → "5 jun 2026".

### Build conocido (pendiente)

- **`pnpm run build` falla** con: `rollupOptions.input should not be an html file when building for SSR`. Incompatibilidad entre `@astrojs/cloudflare@14.0.1` y Vite 7.3.5. **El dev server funciona correctamente.** Resolver actualizando el adapter cuando haya un patch compatible.

---

## Stage 06 — UI/UX Improvements (2026-06-28)

### Archivos creados / modificados

| Cambio                                                                                     | Archivo                                                           |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `BlogFilterModals.astro` — overlays Buscar + Filtrar (reemplaza `BlogFilters.astro`)       | `src/components/blog/BlogFilterModals.astro`                      |
| `Breadcrumb.astro` — componente cross-cutting                                              | `src/components/Breadcrumb.astro`                                 |
| PostHero — alineado a la izquierda (era centrado)                                          | `src/components/blog/PostHero.astro`                              |
| Blog listing ES+EN — breadcrumb + header flex space-between                                | `src/pages/blog/index.astro` · `src/pages/en/blog/index.astro`    |
| BlogPostLayout — breadcrumb sobre PostHero                                                 | `src/layouts/BlogPostLayout.astro`                                |
| PostBody — YouTube: `value.url` → extrae ID con regex                                      | `src/components/blog/PostBody.astro`                              |
| PostBody — block handlers sin clases inline (CSS maneja los estilos)                       | `src/components/blog/PostBody.astro`                              |
| `.post-body` en global.css — estilos tipográficos con `var()`, selectores hijo directo `>` | `src/styles/global.css`                                           |
| blockContent — `styles` explícito sin H1                                                   | `E:\esencia-magnetica-studio\schemaTypes\objects\blockContent.ts` |
| post.ts — excerpt `max(200)` con descripción                                               | `E:\esencia-magnetica-studio\schemaTypes\documents\post.ts`       |
| Páginas placeholder `/productos` y `/marca` (eran 404)                                     | `src/pages/productos/index.astro` · `src/pages/marca/index.astro` |

### Keys i18n nuevas

```
common.search · common.filter · common.clear_all · common.confirm
blog.filter.categories · breadcrumb.aria
```

---

## Stage 07 — Product Catalog (completado)

### Archivos creados / modificados

| Cambio                                                                                                  | Archivo                                                                                           |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `ProductCard.astro` — card afiliado: wrapper `<a>`, imagen 1:1, category kicker, nombre serif, CTA span | `src/components/product/ProductCard.astro`                                                        |
| `ProductGrid.astro` — grid 3 cols responsive + empty state                                              | `src/components/product/ProductGrid.astro`                                                        |
| `ProductFilterModals.astro` — overlays Buscar + Filtrar (categorías radio + tienda radio)               | `src/components/product/ProductFilterModals.astro`                                                |
| `ProductResultsBar.astro` — "N productos · ORDENAR POR" + dropdown Alpine.js                            | `src/components/product/ProductResultsBar.astro`                                                  |
| `productViewModel.ts` — `buildProductsUrl()` para construir URLs de filtro                              | `src/lib/product/productViewModel.ts`                                                             |
| `productViewModel.test.ts` — 7 tests para `buildProductsUrl`                                            | `src/lib/product/productViewModel.test.ts`                                                        |
| GROQ queries filtradas (publishedAt desc + name asc + count)                                            | `src/lib/queries.ts`                                                                              |
| Constante `PRODUCTS_PER_PAGE = 12`                                                                      | `src/lib/constants.ts`                                                                            |
| 13 keys i18n `product.*` (ES + EN)                                                                      | `src/i18n/ui.ts`                                                                                  |
| Test que EN tiene todas las keys de ES                                                                  | `src/i18n/ui.test.ts`                                                                             |
| Página catálogo ES (`prerender = false`, SSR, queryParams)                                              | `src/pages/productos/index.astro`                                                                 |
| Página catálogo EN                                                                                      | `src/pages/en/products/index.astro`                                                               |
| Alpine.js integration + `[x-cloak]` CSS                                                                 | `astro.config.mjs` · `src/styles/global.css`                                                      |
| Fix View Transitions: scripts filtros envueltos en `astro:page-load` + AbortController                  | `src/components/blog/BlogFilterModals.astro` · `src/components/product/ProductFilterModals.astro` |

### Decisiones clave

- **Sin sidebar desktop** — el FUNDAMENTS.md describía un sidebar sticky de 240px; Claude Design muestra filtros modales (mismo patrón que el blog). Se siguió Claude Design.
- **Sort "Más populares" = `order(name asc)`** — el schema de `product` no tiene campo de popularidad; se usa orden alfabético como proxy. Renombrar si se añade un campo `featured`.
- **Tienda como radio (no checkbox)** — selección única por tienda para simplificar el queryParam server-side. Cambiar a checkboxes + múltiples valores si se necesita multi-select.
- **`ProductCard` wrapper `<a>`** — la card entera es clickeable. El CTA "Ver producto" es un `<span>` visual dentro del `<a>` exterior.
- **Alpine.js dropdown reemplazado** — Se instaló Alpine.js (`@astrojs/alpinejs@1.0.0`) pero no re-inicializa DOM swapeado por View Transitions. Reemplazado por vanilla JS + AbortController en `ProductResultsBar`. Alpine.js sigue configurado en `astro.config.mjs` pero no se usa en ningún componente activo.
- **View Transitions init pattern** — La clave es llamar `init()` **inmediatamente** (para la carga inicial) Y registrar el listener `astro:page-load`. Solo registrar el listener no funciona porque `astro:page-load` se dispara ANTES de que el module script se registre en la carga inicial.

### Keys i18n nuevas (Stage 07)

```
product.headline · product.lead · product.result · product.results
product.sort.label · product.sort.recent · product.sort.popular
product.view · product.empty · product.filter.categories
product.filter.store · product.filter.all_stores · product.disclosure
common.result_for · common.results_for · common.clear_search
```

---

## Stage 07 — Search & Filter UX improvements (2026-06-28)

### Bugs críticos corregidos

| Bug                                                       | Causa                                                                                                                                                                                                     | Fix                                                                                                                                                                   |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Filtros nunca filtraban (`?categoria=on`)                 | Schema `blogCategory`/`productCategory` usa `slug: { es, en }` (objeto custom), NO `slug` type de Sanity con `.current`. El valor `cat.slug.current` era `undefined` → browser enviaba `"on"` por defecto | Radio values: `cat.slug?.es ?? ""` · Interface: `slug: { es?: string; en?: string }`                                                                                  |
| GROQ nunca filtraba por categoría                         | Queries usaban `category->slug.current` que no existe — siempre retornaba todos los posts/productos                                                                                                       | Fix: `category->slug.es` en 5 queries (`postsFilteredQuery`, `postsCountQuery`, `productsFilteredQuery`, `productsFilteredByNameQuery`, `productsFilteredCountQuery`) |
| URL contaminada (`?tienda=&categoria=`)                   | Form GET nativo incluye todos los campos aunque estén vacíos                                                                                                                                              | Interceptar `submit`: `FormData` → `URLSearchParams` filtrando valores vacíos → `window.location.href`                                                                |
| Botones de búsqueda/filtro no funcionaban tras navegación | Listeners registrados solo en `astro:page-load` — ese evento se dispara antes de que el module script se registre en la carga inicial                                                                     | Patrón correcto: `function init() {...}` + `document.addEventListener("astro:page-load", init)` + `init()` inmediato                                                  |
| Sort dropdown roto tras View Transitions                  | Alpine.js no re-inicializa elementos swapeados por View Transitions                                                                                                                                       | Reemplazado por vanilla JS + AbortController (`astro:before-swap` abort, mismo patrón que modales)                                                                    |

### Features añadidas

| Feature                                 | Implementación                                                                                                                    |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| "N resultados para **X**"               | Blog: inline en `pages/blog/index.astro`. Productos: en `ProductResultsBar.astro`                                                 |
| "× Limpiar búsqueda"                    | `inline-flex leading-none` + `<span>` para alinear icono y texto. Aparece solo cuando `activeQ` activo                            |
| Badge en botón FILTRAR                  | Badge absoluto `bg-gold` con `filterCount` (Blog: max 1, Productos: max 2)                                                        |
| Tags en detalle del post                | `PostHero.astro`: chips debajo de la fecha → `?q={tag}`. GROQ incluye `$q in tags` (match exacto) para que funcionen como filtros |
| Categoría linkeable en detalle          | Badge de categoría en `PostHero` es `<a href="?categoria={slug.es}">`                                                             |
| "Limpiar filtros" preserva búsqueda     | `clearFiltersUrl` preserva `q` (y `orden` en Productos). Búsqueda y filtros son independientes                                    |
| `maxlength="100"` en inputs de búsqueda | Ambos modales (Blog + Productos)                                                                                                  |

### Archivos modificados (esta sesión)

| Archivo                                                        | Cambios                                                                                                 |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `src/components/blog/BlogFilterModals.astro`                   | Init pattern, badge filterCount, clearFiltersUrl, maxlength, fix slug interface                         |
| `src/components/blog/PostHero.astro`                           | Tags chips, categoría linkeable, blogPath por lang                                                      |
| `src/components/product/ProductFilterModals.astro`             | Init pattern, badge filterCount, clearFiltersUrl, maxlength, fix slug interface                         |
| `src/components/product/ProductResultsBar.astro`               | Vanilla JS sort (sin Alpine), count con activeQ, "× Limpiar búsqueda"                                   |
| `src/lib/queries.ts`                                           | `slug.es` en 5 queries, `tags` + `category.slug` en `postBySlugQuery`, `$q in tags` en filtered queries |
| `src/i18n/ui.ts`                                               | `common.result_for`, `common.results_for`, `common.clear_search`                                        |
| `src/pages/blog/index.astro` · `src/pages/en/blog/index.astro` | "N resultados" row, clearSearchUrl, `inline-flex leading-none` fix                                      |

### Próximo paso: Stage 08

---

## Stage 06 — Blog: Listing + Post Detail (completado + fixes)

### Archivos creados / modificados

| Entregable                                                  | Archivo                                                  |
| ----------------------------------------------------------- | -------------------------------------------------------- |
| `resolveImageUrl()` + `CoverImageLike` type                 | `src/lib/sanity.ts`                                      |
| `formatPostDate()` fecha corta + `readingTime()`            | `src/lib/blog/postViewModel.ts`                          |
| PostCard — `<a>` completa, 16:9, `rounded-t-lg`, transition | `src/components/blog/PostCard.astro`                     |
| BlogFilters — FilterTag olive-active, search underline      | `src/components/blog/BlogFilters.astro`                  |
| FeaturedPost — grid 1.5fr/1fr, 16:9, transition             | `src/components/blog/FeaturedPost.astro`                 |
| PostGrid — 3 cols responsive, estado vacío                  | `src/components/blog/PostGrid.astro`                     |
| BlogPagination — active con underline dorado                | `src/components/blog/BlogPagination.astro`               |
| PostBody — Portable Text → HTML sin React                   | `src/components/blog/PostBody.astro`                     |
| PostHero — centrado, Badge gold, hero 16:9, transition      | `src/components/blog/PostHero.astro`                     |
| RelatedProducts — bg-cream-deep, Badge rose                 | `src/components/blog/RelatedProducts.astro`              |
| FacebookComments — placeholder                              | `src/components/blog/FacebookComments.astro`             |
| BlogPostLayout — template de post detail                    | `src/layouts/BlogPostLayout.astro`                       |
| BaseLayout — ClientRouter (View Transitions)                | `src/layouts/BaseLayout.astro`                           |
| Blog listing ES (prerender=false)                           | `src/pages/blog/index.astro`                             |
| Blog listing EN (prerender=false)                           | `src/pages/en/blog/index.astro`                          |
| Post detail ES (prerender=false)                            | `src/pages/blog/[slug].astro`                            |
| Post detail EN (prerender=false)                            | `src/pages/en/blog/[slug].astro`                         |
| ogImage → tipo `coverImage` (soporta URL externa)           | `E:\esencia-magnetica-studio\schemaTypes\objects\seo.ts` |
| Tipo Seo.ogImage actualizado                                | `src/types/sanity.types.ts`                              |

### Keys i18n blog

```
blog.description · blog.all · blog.search.placeholder · blog.featured
blog.empty · blog.empty.search · blog.read · blog.pagination.prev
blog.pagination.next · blog.related · blog.view · blog.by · blog.minutes
post.play · blog.headline · blog.lead · blog.shop · blog.shop.subtitle
```

### Fixes post-entrega (esta sesión)

| Fix                                        | Causa                                                                                                                                                                                              |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Imágenes no aparecían                      | `safeUrlFor(coverImage)` buscaba `_ref` en nivel incorrecto; `CoverImage.asset` es un objeto imagen, no una referencia. Fix: `resolveImageUrl(coverImage)` pasa `coverImage.asset` a `safeUrlFor`. |
| Bordes redondeados no aplicaban            | `rounded-radius-lg` no es clase Tailwind v4 válida (genera 0px). Fix: `rounded-lg`, `rounded-t-lg`, `rounded-l-lg` etc.                                                                            |
| `seo.title/description/image` inexistentes | Los campos reales son `seo.metaTitle`, `seo.metaDescription`, `seo.ogImage`. Fix: corregidos en `BlogPostLayout`.                                                                                  |
| Fecha larga                                | `month: 'long'` → `month: 'short'` en `formatPostDate`.                                                                                                                                            |
| FeaturedPost rompía 16:9 en desktop        | `lg:aspect-auto lg:h-full` en la imagen. Fix: eliminados.                                                                                                                                          |
| View Transitions API                       | En Astro v6 el componente se llama `ClientRouter`, no `ViewTransitions`.                                                                                                                           |

### Verificación UI (dev server)

| Vista                                           | Resultado             |
| ----------------------------------------------- | --------------------- |
| `/blog` — header, filtros, PostCard con imagen  | ✅                    |
| FeaturedPost — imagen 16:9, grid 1.5fr/1fr      | ✅                    |
| `/blog/[slug]` — PostHero centrado, imagen 16:9 | ✅                    |
| View Transition card → detalle                  | ✅                    |
| `lint` + `typecheck` + `tests`                  | ✅                    |
| `build`                                         | ⚠️ (ver bug conocido) |

### Problema de datos de prueba en Sanity

- **`publishedAt` vacío** → "Invalid Date". Editar post en Studio y añadir fecha.
- **Slugs de categorías sin `.current`** → chips de filtro no generan URL con `?categoria=`. Editar cada `blogCategory` en Studio → campo slug → "Generate".

---

## Stage 02 — Design System (completado)

| Entregable                               | Archivo                                                                 |
| ---------------------------------------- | ----------------------------------------------------------------------- |
| Tokens Tailwind v4 (`@theme`)            | `src/styles/global.css`                                                 |
| Fuentes self-hosted (@fontsource)        | `src/styles/global.css`                                                 |
| `cn()` con tailwind-merge extendido      | `src/lib/utils.ts`                                                      |
| Button · Badge · Card · Input · Checkbox | `src/components/ui/`                                                    |
| Variantes CVA                            | `src/lib/ui/buttonVariants.ts` · `badgeVariants.ts` · `cardVariants.ts` |
| Styleguide dev-only                      | `src/pages/styleguide.astro` → `/styleguide`                            |
| Documentación                            | `docs/DESIGN-SYSTEM.md`                                                 |

---

## Stage 03 — Sanity CMS (completado)

### Studio (`E:\esencia-magnetica-studio`)

| Archivo                   | Descripción                                                       |
| ------------------------- | ----------------------------------------------------------------- |
| `sanity.config.ts`        | Plugins: document-i18n (post/product/page), structureTool, vision |
| `schemaTypes/objects/`    | blockContent, coverImage, seo, youtubeEmbed, productList          |
| `schemaTypes/singletons/` | blogCategory, productCategory, siteSettings                       |
| `schemaTypes/documents/`  | post, product, author, brand, page                                |
| `seed.ts`                 | Seed inicial — `$env:SANITY_TOKEN="token"; pnpm exec tsx seed.ts` |

### Astro

| Archivo                     | Descripción                                                       |
| --------------------------- | ----------------------------------------------------------------- |
| `src/lib/sanity.ts`         | `urlFor()`, `safeUrlFor()`, `resolveImageUrl()`, `CoverImageLike` |
| `src/lib/queries.ts`        | Todas las queries GROQ                                            |
| `src/types/sanity.types.ts` | TypeGen output — actualizar tras cambios de schema en Studio      |

---

## Stage 04 — Core Layout, Navigation & i18n (completado)

| Entregable                   | Archivo                               |
| ---------------------------- | ------------------------------------- |
| Tipos base (Locale, SeoMeta) | `src/types/index.ts`                  |
| Constantes (NAV_ITEMS, etc.) | `src/lib/constants.ts`                |
| Strings i18n                 | `src/i18n/ui.ts`                      |
| Utilidades i18n + 37 tests   | `src/i18n/utils.ts` + `utils.test.ts` |
| Footer organism              | `src/components/Footer.astro`         |
| Navbar organism              | `src/components/Navbar.astro`         |
| BaseLayout template          | `src/layouts/BaseLayout.astro`        |

---

## Stage 05 — Home Page (completado)

| Entregable                          | Archivo                                    |
| ----------------------------------- | ------------------------------------------ |
| HomeHero organism                   | `src/components/home/HomeHero.astro`       |
| MarqueeRow organism (independiente) | `src/components/home/MarqueeRow.astro`     |
| Items placeholder del marquee       | `src/lib/home/marqueeItems.ts`             |
| Home ES + EN                        | `src/pages/index.astro` + `en/index.astro` |

---

## Próximo paso: Stage 08

Leer [`docs/stages/stage-08/FUNDAMENTS.md`](docs/stages/stage-08/FUNDAMENTS.md) antes de tocar código.

---

## Cómo correr el seed (primera vez)

1. Obtener write token en https://sanity.io → proyecto `dtktkh9h` → API → Tokens
2. En PowerShell dentro de `E:\esencia-magnetica-studio`:

```powershell
$env:SANITY_TOKEN="tu-token"; pnpm exec tsx seed.ts
```

---

## Comandos habituales

```bash
# Astro (E:\esencia-magnetica)
pnpm run dev         # servidor local
pnpm run lint        # ESLint
pnpm run typecheck   # tsc
pnpm run test        # Vitest
pnpm run build       # ⚠️ falla por bug @astrojs/cloudflare@14 + Vite 7

# Studio (E:\esencia-magnetica-studio)
pnpm dev             # Studio en localhost:3333
pnpm exec tsc --noEmit  # typecheck del studio
```

---

## Archivos clave

- `docs/PLAN.md` — 12 stages, orden de dependencias
- `docs/DESIGN-SYSTEM.md` — tokens, componentes, uso
- `src/styles/global.css` — @theme con todos los tokens Tailwind v4
- `src/lib/utils.ts` — `cn()` con tailwind-merge extendido
- `src/lib/sanity.ts` — `resolveImageUrl()` para campos CoverImage
- `src/lib/ui/` — variantes CVA de los primitivos
- `src/components/ui/` — Button, Badge, Card, Input, Checkbox
- `src/components/blog/` — todos los componentes del blog
- `src/layouts/` — BaseLayout (ClientRouter), BlogPostLayout
- `src/lib/queries.ts` — todas las queries GROQ
- `src/types/sanity.types.ts` — tipos TypeGen (actualizar al cambiar schemas)
- `src/i18n/ui.ts` — todas las strings de UI ES+EN
- `CLAUDE.md` — convenciones del repo (leer siempre)
