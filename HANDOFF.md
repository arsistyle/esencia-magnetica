# HANDOFF — Esencia Magnética

**Fecha:** 2026-06-29 (actualizado)
**Estado actual:** Stage 09 completo (Integrations) ✅ · Próximo: Stage 10

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

### CMS — Esquema de páginas (`page`) con campos condicionales por plantilla

El documento `page` centraliza todas las páginas del sitio. Cada página selecciona una **plantilla** (`template`), y los campos disponibles en Studio varían según la selección mediante `hidden: ({document}) => document?.template !== '<value>'`.

**Separación `brand` vs `page`:**

- **`brand`** = identidad global de la marca usada en todo el sitio (nombre de la creadora, `tagline`, `heroPhoto`, `mission`, `vision`, `logo`, `socialLinks`). IDs fijos: `brand-es` / `brand-en`. Se usa en Navbar, footer, JSON-LD global, SEO.
- **`page` con `template: 'about'`** = contenido profundo de `/marca` (intro del hero, secciones Historia, Filosofía, etc.). Estos campos NO van en `brand`.

**Plantillas definidas y sus campos:**

| `template` | Campos genéricos | Campos exclusivos                                                             |
| ---------- | ---------------- | ----------------------------------------------------------------------------- |
| `home`     | `hero` + `body`  | —                                                                             |
| `blog`     | `hero`           | — (listing via posts)                                                         |
| `products` | `hero`           | — (listing via products)                                                      |
| `about`    | —                | `aboutContent` { `intro`, `history`, `philosophy`, `whatYouFind`, `blogCta` } |
| `default`  | `hero` + `body`  | —                                                                             |

**Patrón section-enabled (Stage 08):** Cada sección de `aboutContent` es un objeto con `enabled: boolean` (initialValue: true en Studio). Los campos hijos se ocultan en Studio con `hidden: ({parent}) => !parent?.enabled`. En el frontend, `enabled ?? false` — la sección no renderiza si `enabled` es false o el campo no existe en el documento.

**Patrón para añadir una nueva plantilla:**

1. Añadir el valor al selector `template` en `page.ts`.
2. Añadir un `defineField` de tipo `object` con `hidden: ({document}) => document?.template !== '<value>'` que agrupe sus campos.
3. Cada sección debe seguir el patrón section-enabled: objeto con `enabled: boolean` + campos hijos.
4. Actualizar `Page` y el tipo de contenido correspondiente en `src/types/sanity.types.ts`.
5. En el frontend, la página Astro lee `page.template` y monta el layout correcto.

**Pendiente en el frontend:** las páginas `home`, `blog` y `products` actualmente no leen su documento `page` de Sanity — gestionan su propio hero hardcodeado o sin hero. Cuando se implemente la edición de heroes desde Studio, cada página deberá hacer una segunda query al documento `page` con su slug y locale.

**⚠️ Migración de datos en Sanity:** Al renombrar o reestructurar campos del schema, los documentos existentes conservan los valores en las rutas viejas. Siempre migrar con `patch_documents` (MCP): `set` nuevas rutas + `unset` rutas viejas + `publish_documents`. Si no se hace, la GROQ query no encuentra los datos aunque el schema y el frontend estén actualizados.

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

---

## Stage 08 — Marca / About Page (completado)

### Archivos creados / modificados

| Cambio                                                                       | Archivo                                                          |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `BrandHero.astro` — hero con foto, tagline, intro del hero                   | `src/components/brand/BrandHero.astro`                           |
| `BrandHistoria.astro` — foto 1:1 + Portable Text; tag y título condicionales | `src/components/brand/BrandHistoria.astro`                       |
| `BrandFilosofia.astro` — chip, título, descripción, pilares dinámicos        | `src/components/brand/BrandFilosofia.astro`                      |
| `BrandMisionVision.astro` — Portable Text para misión y visión del brand doc | `src/components/brand/BrandMisionVision.astro`                   |
| `BrandQueEncontrar.astro` — chip, título, cards dinámicas de Sanity          | `src/components/brand/BrandQueEncontrar.astro`                   |
| `BrandCTA.astro` — título y botón desde Sanity; buttonUrl default `/blog`    | `src/components/brand/BrandCTA.astro`                            |
| `BrandLayout.astro` — template que orquesta los 6 organismos                 | `src/layouts/BrandLayout.astro`                                  |
| Páginas `/marca` (ES) y `/en/brand` (EN)                                     | `src/pages/marca/index.astro` · `src/pages/en/brand/index.astro` |
| `brandQuery` + `aboutPageQuery`                                              | `src/lib/queries.ts`                                             |
| `ptToHtml()` para Portable Text sin React                                    | `src/lib/brand/brandViewModel.ts`                                |
| `AboutContent` type + `Brand` con `logo` y `socialLinks`                     | `src/types/sanity.types.ts`                                      |
| Schema `brand`: `logo` + `socialLinks` (array dinámico)                      | `E:\esencia-magnetica-studio\schemaTypes\documents\brand.ts`     |
| Schema `page`: `aboutContent` con 5 secciones section-enabled                | `E:\esencia-magnetica-studio\schemaTypes\documents\page.ts`      |
| Regla English-only en source code                                            | `CLAUDE.md`                                                      |

### Decisiones clave (Stage 08)

- **Dos fuentes de datos:** `brandQuery` (identidad global: nombre, foto, misión, visión, logo, redes) + `aboutPageQuery` (contenido de `/marca`: intro + secciones). El frontend hace las dos queries en paralelo con `Promise.all`.
- **`socialLinks` es array dinámico** `[{platform: select, url}]` — NO campos fijos por red social. El editor añade y ordena las redes que quiera.
- **Secciones ocultas por defecto** — `enabled ?? false` en BrandLayout. Las secciones solo aparecen cuando el editor las habilita explícitamente en Studio.
- **Texto condicional** — cada elemento de texto (`<span>`, `<h2>`, `<p>`) solo renderiza si el campo de Sanity tiene valor. Sin fallbacks i18n para contenido de sección.
- **`ptToHtml()`** en `src/lib/brand/brandViewModel.ts` convierte Portable Text a HTML para `BrandHistoria` y `BrandMisionVision`. Usa `@portabletext/to-html` (ya instalado para el blog).
- **Pilares de Filosofía** — solo los que tienen datos en Sanity, numerados desde el índice del array (`01`, `02`…). Sin fallback a i18n ni relleno de posiciones vacías.
- **`brand.mission` y `brand.vision`** viven en el documento global `brand-es`/`brand-en`, no en `aboutContent`. `BrandMisionVision` las lee directamente del brand doc.
- **English-only en code** — variables, nombres de función, tipos, comentarios, nombres de campos en schema Sanity: todo en inglés. Español solo en contenido de Sanity o en `src/i18n/ui.ts`.

### Datos Sanity actuales (ES)

- **`brand-es`**: `name: "Alexandra"` — faltan `tagline`, `heroPhoto`, `mission`, `vision`, `logo`, `socialLinks`.
- **`page` about ES** (`e0e09813-…`): `history.enabled=true`, `history.body` (3 bloques), `history.photo` (imagen 2304×3072), `philosophy.enabled=true`, `philosophy.pillars[0]` ("Práctico"). Secciones `whatYouFind` y `blogCta` habilitadas pero sin contenido.
- **Falta:** documento `page` about EN + documento `brand-en`.

---

## Stage 09 — Integrations (completado)

### Archivos creados / modificados

| Cambio                                                                                                             | Archivo                                      |
| ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| `src/types/gtag.d.ts` — declaración global `window.dataLayer` + función `gtag`                                     | `src/types/gtag.d.ts`                        |
| `Analytics.astro` — init de Consent Mode v2 (denied por defecto) via `<script is:inline set:html>`                 | `src/components/Analytics.astro`             |
| `CookieBanner.astro` — banner fixed bottom, carga gtag.js dinámicamente al aceptar                                 | `src/components/CookieBanner.astro`          |
| `BaseLayout.astro` — `<Analytics />` como primer hijo de `<head>`, `<CookieBanner />` antes de `</body>`           | `src/layouts/BaseLayout.astro`               |
| `FacebookComments.astro` — IntersectionObserver lazy-load, guard doble-inyección SDK                               | `src/components/blog/FacebookComments.astro` |
| `BlogPostLayout.astro` — pasa `url={canonical}` y `lang={lang}` a `<FacebookComments />`                           | `src/layouts/BlogPostLayout.astro`           |
| `PostBody.astro` — `data-ga-event="affiliate_click"` en links + `productList`; facade YouTube dispara `video_play` | `src/components/blog/PostBody.astro`         |
| `.env.example` — `PUBLIC_GA4_MEASUREMENT_ID` + `PUBLIC_FACEBOOK_PAGE_ID`                                           | `.env.example`                               |
| Keys i18n: `cookie.banner.text/accept/reject`, `comments.label`                                                    | `src/i18n/ui.ts`                             |
| `.prettierignore` — añadido `docs/superpowers/`                                                                    | `.prettierignore`                            |

### Decisiones clave (Stage 09)

- **Consent Mode v2 enfoque A (privacy-first):** `analytics_storage: "denied"` por defecto. GA4 no se carga hasta que el usuario acepta. Estado en `localStorage` bajo la clave `cookie_consent` (`'granted'` | `'denied'` | null). El banner no reaparece tras decidir.
- **`<script is:inline set:html={consentScript}>`** para el init de GA4 en `Analytics.astro` — workaround para un bug de Prettier que falla al parsear `...args` dentro de expresiones JSX en archivos `.astro`. El script se construye en frontmatter como string y se inyecta con `set:html`.
- **`PUBLIC_GA4_MEASUREMENT_ID` vacío por defecto** — si la env var no está definida, `Analytics.astro` y `CookieBanner.astro` no renderizan nada. El banner solo aparece cuando hay un GA ID configurado.
- **Facebook Page ID:** `61579741058238`. SDK lazy-loaded con `IntersectionObserver { rootMargin: "200px" }` — se carga cuando el usuario está a 200px del wrapper.
- **View Transitions + GA4:** `CookieBanner` registra `document.addEventListener("astro:page-load", ...)` para re-disparar `page_view` en cada navegación SPA del `ClientRouter`.
- **Seguridad XSS:** `escAttr()` (en frontmatter de `PostBody.astro`) escapa `&`, `"`, `<`, `>` antes de interpolar en atributos HTML generados por `@portabletext/to-html`.
- **`aria-labelledby` en CookieBanner** — no `aria-label` para evitar duplicar el texto del `<p>` como string de accesibilidad.

### Keys i18n nuevas (Stage 09)

```
cookie.banner.text · cookie.banner.accept · cookie.banner.reject · comments.label
```

### Próximo paso: Stage 10

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

## Próximo paso: Stage 09

Leer [`docs/stages/stage-09/FUNDAMENTS.md`](docs/stages/stage-09/FUNDAMENTS.md) antes de tocar código.

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
- `src/components/brand/` — BrandHero, BrandHistoria, BrandFilosofia, BrandMisionVision, BrandQueEncontrar, BrandCTA
- `src/layouts/` — BaseLayout (ClientRouter), BlogPostLayout, BrandLayout
- `src/lib/brand/brandViewModel.ts` — `ptToHtml()` para Portable Text sin React
- `src/lib/queries.ts` — todas las queries GROQ
- `src/types/sanity.types.ts` — tipos TypeGen (actualizar al cambiar schemas)
- `src/i18n/ui.ts` — todas las strings de UI ES+EN
- `CLAUDE.md` — convenciones del repo (leer siempre)
