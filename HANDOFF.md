# HANDOFF — Esencia Magnética

**Fecha:** 2026-06-27  
**Estado actual:** Stage 05 completado ✅ · Próximo: Stage 06

---

## Dónde estamos

Stages 01–05 terminados y pusheados a `origin/main`.

**Stack:** Astro v6.4.8 · TypeScript strict · Tailwind v4 · ESLint v9 · Prettier · Vitest · Husky + lint-staged · Sanity v6 · `@sanity/document-internationalization` · `@sanity/astro`.

**Repos:**

- Frontend: https://github.com/arsistyle/esencia-magnetica (`E:\esencia-magnetica`)
- Studio: https://github.com/arsistyle/esencia-magnetica-studio (`E:\esencia-magnetica-studio`)

---

## Decisiones clave ya tomadas

### Design System (Stage 02)

- **Sin shadcn/ui** — componentes como `.astro` puro con CVA. shadcn se reserva para React islands cuando haya interactividad real.
- **CVA en `src/lib/ui/*.ts`**, nunca en frontmatter `.astro` — necesario para escaneo de Tailwind v4.
- **`cn()` en `src/lib/utils.ts`** — `clsx` + `extendTailwindMerge` con tokens font-size del brand.
- **`leading-none` siempre después de `text-*`** en strings CVA — tailwind-merge v3 composed class groups.
- Husky en lugar de GitHub Actions; GA en Stage 12.
- Path alias `@/*` → `src/`.

### CMS (Stage 03)

- **Estrategia i18n híbrida:**
  - Doc-level via `@sanity/document-internationalization` → `post`, `product`, `page`
  - Field-level `{es, en}` → `blogCategory`, `productCategory`, `siteSettings`
  - Singletons con IDs fijos → `brand-es` / `brand-en`
- **`author` es multi-documento** (no singleton) — posts tienen campo `authors: array<reference→author>`.
- **`@sanity/astro`** provee el virtual module `sanity:client` — no se instancia `createClient` manualmente.
- **TypeGen types** copiados manualmente a `src/types/sanity.types.ts` en el repo Astro (auto-generados en Studio, no committear en Studio).
- **`createImageUrlBuilder`** (named export, no el default deprecated) de `@sanity/image-url`.
- **Studio en repo separado** (`E:\esencia-magnetica-studio`) — solo uso local. Pendiente crear ejecutable Mac para que la brand owner pueda correrlo (Stage 12 o antes si urge).
- **Páginas dinámicas** con campo `template` (enum) que enlaza con archivos `src/templates/*.astro` en Astro — patrón CMS-driven templates.

### i18n / Layout (Stage 04)

- **i18n architecture:** `src/i18n/ui.ts` (22 keys ES+EN) + `src/i18n/utils.ts` (puro) + `src/i18n/index.ts` (barrel).
- **astro.config.mjs:** bloque `i18n: { defaultLocale: 'es', locales: ['es', 'en'] }`.
- **ROUTE_PAIRS estático** en `getLocalizedUrl` — `/productos` ↔ `/en/products`, `/marca` ↔ `/en/brand` no son transformaciones algorítmicas.
- **LangToggle:** locale activo = `<span aria-current="true">` (no interactivo), locale inactivo = `<a href>`.
- **Mobile nav:** clase CSS `is-open` (no `hidden` Tailwind) para evitar conflictos con media queries.
- **404.astro:** siempre `lang='es'` — Astro sirve la 404 sin contexto de locale.

### Home Page (Stage 05)

- **`MarqueeRow.astro` es independiente por fila** — no hay un componente "gallery" contenedor. Las páginas montan dos instancias `<MarqueeRow>` separadas.
- **Animación pixel-based** (adaptada de `docs/refs/MediaMarquee.tsx`): posiciones en px con `getBoundingClientRect()`, contenido triplicado, velocidad de scroll acumulada con `FRICTION=0.92`, función `wrapValue(x, -setWidth, 0)`. Sin GSAP, sin React.
- **`height` prop configurable** en `MarqueeRow` (default `"300px"`). Los tiles no tienen `aspect-ratio` fijo — las imágenes usan `height: 100%; width: auto` para respetar su aspecto natural.
- **`MarqueeItem`:** `{ bg, src?, alt?, aspectRatio? }` — `bg` es el degradado CSS que sirve de placeholder de carga. Cuando vengan imágenes de Sanity, se pasan como `src`.
- **`src/lib/home/marqueeItems.ts`** — items placeholder con degradados de brand. Reemplazar con fetch de Sanity cuando lleguen las imágenes.
- **`document.querySelectorAll`** (no `window.document`) — Prettier parte `window.document` en línea propia y ESLint lanza `no-unused-expressions`.
- **`docs/refs/` excluido** de TypeScript en `tsconfig.json` — contiene `MediaMarquee.tsx` (React/GSAP de referencia) que no debe compilarse.

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

**Tamaños de botón:** sm=31px · md=35px · lg=46px.

---

## Stage 03 — Sanity CMS (completado)

### Studio (`E:\esencia-magnetica-studio`)

| Archivo                   | Descripción                                                                  |
| ------------------------- | ---------------------------------------------------------------------------- |
| `sanity.config.ts`        | Plugins: document-i18n (post/product/page), structureTool, vision            |
| `sanity.cli.ts`           | TypeGen habilitado (`typegen: { enabled: true }`)                            |
| `schemaTypes/objects/`    | blockContent, coverImage, seo, youtubeEmbed, productList                     |
| `schemaTypes/singletons/` | blogCategory, productCategory, siteSettings                                  |
| `schemaTypes/documents/`  | post, product, author, brand, **page**                                       |
| `structure/index.ts`      | Desk con Páginas, Posts, Productos, Autores, Marca, Ajustes                  |
| `seed.ts`                 | Seed inicial — correr con `$env:SANITY_TOKEN="token"; pnpm exec tsx seed.ts` |

**Tipos de página disponibles (`page.template`):** `home`, `blog`, `products`, `about`, `default`

### Astro (`E:\esencia-magnetica`)

| Archivo                     | Descripción                                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `astro.config.mjs`          | @sanity/astro integration con apiVersion pinned a 2025-01-01                                                                   |
| `tsconfig.json`             | `"types": ["@sanity/astro/module"]`, `"exclude": ["dist", "docs/refs"]`                                                        |
| `.env.local`                | `PUBLIC_SANITY_PROJECT_ID=dtktkh9h` · `PUBLIC_SANITY_DATASET=production` (no commitear)                                        |
| `.env.example`              | Placeholders para nuevos devs                                                                                                  |
| `src/lib/sanity.ts`         | `urlFor()` helper con `createImageUrlBuilder`                                                                                  |
| `src/lib/queries.ts`        | 9 queries GROQ con `defineQuery`: posts, post by slug, products, categories, siteSettings, brand, authors, **pageBySlugQuery** |
| `src/types/sanity.types.ts` | TypeGen output — actualizar tras cambios de schema en Studio                                                                   |

---

## Stage 04 — Core Layout, Navigation & i18n (completado)

| Entregable                   | Archivo                               |
| ---------------------------- | ------------------------------------- |
| Tipos base (Locale, SeoMeta) | `src/types/index.ts`                  |
| Constantes (NAV_ITEMS, etc.) | `src/lib/constants.ts`                |
| Strings i18n (22 keys ES+EN) | `src/i18n/ui.ts`                      |
| Utilidades i18n + 37 tests   | `src/i18n/utils.ts` + `utils.test.ts` |
| Barrel i18n                  | `src/i18n/index.ts`                   |
| Footer organism              | `src/components/Footer.astro`         |
| Navbar organism              | `src/components/Navbar.astro`         |
| BaseLayout template          | `src/layouts/BaseLayout.astro`        |
| 404 on-brand                 | `src/pages/404.astro`                 |
| Wrappers EN                  | `src/pages/en/` (4 páginas)           |

---

## Stage 05 — Home Page (completado)

| Entregable                          | Archivo                                |
| ----------------------------------- | -------------------------------------- |
| Keys i18n home (ES+EN, 5 keys)      | `src/i18n/ui.ts`                       |
| HomeHero organism                   | `src/components/home/HomeHero.astro`   |
| MarqueeRow organism (independiente) | `src/components/home/MarqueeRow.astro` |
| Items placeholder del marquee       | `src/lib/home/marqueeItems.ts`         |
| Home ES                             | `src/pages/index.astro`                |
| Home EN                             | `src/pages/en/index.astro`             |

**Keys i18n añadidas:** `home.welcome` · `home.headline` · `home.lead` · `home.cta.blog` · `home.cta.catalog`

**MarqueeRow props:**

```
<MarqueeRow direction="left" | "right" height="300px" items={MarqueeItem[]} />
```

**Integrar imágenes de Sanity (futuro):** reemplazar `ROW1_ITEMS` / `ROW2_ITEMS` en las páginas con un fetch GROQ y pasar `{ bg, src, alt }` por item.

---

## Próximo paso: Stage 06

Leer [`docs/stages/stage-06/FUNDAMENTS.md`](docs/stages/stage-06/FUNDAMENTS.md) antes de tocar código.

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
pnpm run build       # build estático

# Studio (E:\esencia-magnetica-studio)
pnpm dev             # Studio en localhost:3333
pnpm exec tsc --noEmit  # typecheck del studio
```

---

## Archivos clave

- `docs/PLAN.md` — 12 stages, orden de dependencias
- `docs/DESIGN-SYSTEM.md` — tokens, componentes, uso
- `docs/stages/stage-05/FUNDAMENTS.md` — spec de Stage 05
- `src/styles/global.css` — @theme con todos los tokens + `--space-*` en `:root`
- `src/lib/utils.ts` — `cn()` con tailwind-merge extendido
- `src/lib/ui/` — variantes CVA de los primitivos
- `src/components/ui/` — Button, Badge, Card, Input, Checkbox
- `src/lib/queries.ts` — todas las queries GROQ
- `src/types/sanity.types.ts` — tipos TypeGen (actualizar al cambiar schemas)
- `src/i18n/ui.ts` — todas las strings de UI (ES+EN)
- `CLAUDE.md` — convenciones del repo (leer siempre)
