# HANDOFF — Esencia Magnética

**Fecha:** 2026-06-21  
**Estado actual:** Stage 03 completado ✅ · Próximo: Stage 04

---

## Dónde estamos

Stages 01, 02 y 03 terminados y pusheados a `origin/main` en ambos repos.

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
| `tsconfig.json`             | `"types": ["@sanity/astro/module"]`                                                                                            |
| `.env.local`                | `PUBLIC_SANITY_PROJECT_ID=dtktkh9h` · `PUBLIC_SANITY_DATASET=production` (no commitear)                                        |
| `.env.example`              | Placeholders para nuevos devs                                                                                                  |
| `src/lib/sanity.ts`         | `urlFor()` helper con `createImageUrlBuilder`                                                                                  |
| `src/lib/queries.ts`        | 9 queries GROQ con `defineQuery`: posts, post by slug, products, categories, siteSettings, brand, authors, **pageBySlugQuery** |
| `src/types/sanity.types.ts` | TypeGen output — actualizar tras cambios de schema en Studio                                                                   |

---

## Próximo paso: Stage 04

Leer [`docs/stages/stage-04/FUNDAMENTS.md`](docs/stages/stage-04/FUNDAMENTS.md) antes de tocar código.

Stage 04 probablemente involucra construir las páginas del frontend consumiendo los datos de Sanity. El patrón de templates ya está preparado:

- `src/pages/[...slug].astro` — ruta dinámica que lee `page.template` y renderiza el template correspondiente
- `src/templates/HomePage.astro`, `BlogPage.astro`, `ProductsPage.astro`, `AboutPage.astro`, `DefaultPage.astro`

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
- `docs/superpowers/specs/2026-06-21-sanity-cms-design.md` — spec de Stage 03
- `docs/superpowers/plans/2026-06-21-stage-03-sanity-cms.md` — plan de Stage 03
- `src/styles/global.css` — @theme con todos los tokens
- `src/lib/utils.ts` — `cn()` con tailwind-merge extendido
- `src/lib/ui/` — variantes CVA de los primitivos
- `src/components/ui/` — Button, Badge, Card, Input, Checkbox
- `src/lib/queries.ts` — todas las queries GROQ
- `src/types/sanity.types.ts` — tipos TypeGen (actualizar al cambiar schemas)
- `CLAUDE.md` — convenciones del repo (leer siempre)
