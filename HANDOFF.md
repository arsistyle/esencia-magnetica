# HANDOFF — Esencia Magnética

**Fecha:** 2026-06-27  
**Estado actual:** Stage 06 completo (+ fixes post-entrega) ✅ · Próximo: Stage 07

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

## Próximo paso: Stage 07

Leer [`docs/stages/stage-07/FUNDAMENTS.md`](docs/stages/stage-07/FUNDAMENTS.md) antes de tocar código.

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
