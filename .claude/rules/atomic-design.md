---
paths:
  - 'src/**/*.{ts,tsx,astro}'
---

# Atomic Design: decomposing components, pages, and routes (Astro)

## Principle

Components and pages must not grow without bound. This rule is the **complement of `utils-organization`**: that one moves non-markup logic out into utilities; this one organizes the **markup** (`.astro` and island JSX) into Atomic Design levels.

A UI file should read as a **composition of lower-level components + data + imported utilities**, never as a wall of markup mixing layout, sections, cards, filters, and state in one place.

> No folder is renamed. Atomic Design is mapped onto the project's **existing** structure (`src/components`, `src/layouts`, `src/pages`, `src/lib`) and acts as a decision criterion plus decomposition thresholds.

---

## Stack context

- **Astro** with **file-based routing**: every page is an `.astro` file under `src/pages/`. There is no `createFileRoute` or runtime router.
- **React only as islands** (`@astrojs/react` + shadcn/ui) for interactivity. Static markup lives in `.astro`.
- **ES/EN i18n**: ES is the default (no prefix) under `src/pages/`, EN lives under `src/pages/en/`. Every ES page ships an EN pair.
- **There is no `features/` folder.** Domain code is grouped by component folder (`src/components/<domain>/`).

---

## The 5 levels mapped to the current structure

| Level          | What it is                                                                   | Where it lives in this repo                                                       |
| -------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Atoms**      | Domain-free primitives: `button`, `input`, `badge`, `card`, `select`         | `src/components/ui/` (shadcn, React islands)                                       |
| **Molecules**  | 2–3 atoms with a simple, reusable purpose, **no business state**             | `src/components/` (cross-cutting, e.g. `ProductCard.astro`, `SocialLinks.astro`)   |
| **Organisms**  | A composed block with its own structure and/or state                         | `src/components/<domain>/` if domain-specific · `src/components/blocks/` if cross-cutting |
| **Templates**  | Page layout **without data**: where header, hero, sections, footer go        | `src/layouts/` (`Layout.astro`, `*PageLayout.astro`)                              |
| **Pages**      | Template + **real data** (Sanity GROQ, route params)                         | `src/pages/**/*.astro` (ES) and `src/pages/en/**/*.astro` (EN)                     |

**Location key:** atoms, molecules, and templates are **global** (cross-cutting). Organisms are cross-cutting (`components/blocks/`) **or** domain-specific (`components/<domain>/`, e.g. `blog/`, `product/`, `brand/`, `home/`). Pages are **always** `.astro` files under `src/pages/`.

> **Islands:** an interactive React component (`.tsx`) is an atom/molecule/organism just like an `.astro` one; it is mounted in the page with the right hydration directive (`client:load`, `client:visible`, etc.). The level is defined by its role, not its extension.

---

## Composition golden rule

A level **N** component composes only level **< N** components (imported) + data + utils. It **never defines inline** a component that:

- has its own reusable identity, or
- exceeds the thresholds below.

---

## Line thresholds (mandatory triggers)

| Situation                                                                        | Action                                                       |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `.astro` / `.tsx` file **> 150 lines**                                           | Review for splitting                                         |
| `.astro` / `.tsx` file **> 250 lines**                                           | Split **mandatory**, unless justified in writing in the file |
| **More than one organism** defined in the same file                              | Each organism to its own file                                |
| Subcomponent (markup fragment with its own identity) **> 40 lines** or used **2+ times** | Extract to its own file, at the appropriate level    |
| Page with **> 1 inline organism** or mixed fetch + composition logic             | Organisms move to `components/<domain>/`                     |

> **Order of operations:** extract non-markup logic first (rule `utils-organization`), **then** decompose markup (this rule). Often the file shrinks enough just by pulling out the utilities — measure before splitting markup.

---

## Rules for pages (`src/pages/`)

An `.astro` page is **orchestration, not detail UI**. A file in `src/pages/` is limited to:

- The frontmatter (`---`): fetch data (GROQ helpers from `src/lib/sanity.ts`), resolve route params and the locale.
- Define `<head>`/SEO via the layout and mount **one** template/organisms imported from elsewhere.
- **No** long sections, card lists, filters, or extensive domain markup inline.

Goal: pages read in **≤ ~80 lines**. Heavy markup lives in `src/components/<domain>/` and the layout in `src/layouts/`.

```astro
---
// src/pages/blog/[slug].astro — orchestration only
import BlogPostLayout from '@/layouts/BlogPostLayout.astro'
import { getPostBySlug } from '@/lib/sanity'

const { slug } = Astro.params
const post = await getPostBySlug(slug, 'es')
---

<BlogPostLayout post={post} />
```

Every ES page must have its EN pair under `src/pages/en/` mounting the same template with the matching locale (see rule `i18n`).

---

## Example ❌ → ✅

### ❌ `src/pages/blog/[slug].astro` with everything inline

A single page file mixing:

- Date-formatting and post view-model helpers.
- The post hero, body, YouTube embed, related-products grid, and Facebook comments box, all as inline markup.
- SEO/meta repeated by hand.

### ✅ Target

```
src/pages/blog/[slug].astro            # ~60 lines: fetch + mount BlogPostLayout
src/pages/en/blog/[slug].astro         # EN pair
src/layouts/BlogPostLayout.astro       # post template (no data of its own)
src/components/blog/
├── PostHero.astro                     # organism
├── PostBody.astro                     # organism
├── YouTubeEmbed.astro                 # molecule/organism
├── RelatedProducts.astro              # organism
└── FacebookComments.astro             # organism (island if it needs JS)
src/lib/blog/postViewModel.ts          # non-markup logic (rule utils-organization)
```

---

## Naming

- **Pages:** standard Astro route files (`index.astro`, `[slug].astro`, `productos.astro`); the EN pair replicates the route under `src/pages/en/`.
- **Templates:** `<Name>Layout.astro` → `Layout.astro`, `BlogPostLayout.astro`, `ListPageLayout.astro`.
- **Domain organisms:** descriptive PascalCase → `PostHero.astro`, `ProductFilters.tsx`, `BrandStory.astro`.
- **Subfolders inside `components/`:** group by **domain cohesion** (`blog/`, `product/`, `brand/`, `home/`), **not** by atomic level. Do not create literal `atoms/`, `molecules/`, `organisms/` folders — the agreement is to map onto the existing structure.

---

## Decision table: which level does it belong to?

| Question                                                                       | Level → destination                                   |
| ------------------------------------------------------------------------------ | ----------------------------------------------------- |
| Is it a shadcn primitive with no domain?                                       | Atom → already in `components/ui/`, leave it           |
| Does it combine 2–3 atoms, no business state, reusable in any domain?          | Molecule → `src/components/`                           |
| Does it have its own structure/state and is cross-cutting?                     | Cross-cutting organism → `components/blocks/`          |
| Does it have its own structure/state but belongs to a domain?                  | Domain organism → `components/<domain>/`               |
| Does it define the page layout without data?                                   | Template → `src/layouts/`                             |
| Does it fetch data (GROQ) and connect it to the template?                      | Page → `src/pages/**/*.astro`                         |

---

## Quick checklist

- [ ] No `.astro`/`.tsx` file exceeds 250 lines without a written justification in the file.
- [ ] Pages in `src/pages/` only orchestrate (fetch + mount template/organisms).
- [ ] No file defines more than one organism.
- [ ] Subcomponents > 40 lines or reused 2+ times are extracted to their own file.
- [ ] Every component composes lower levels; it doesn't recreate inline something that deserves a file.
- [ ] Atoms / molecules / templates in global folders; domain organisms and pages by domain.
- [ ] Every ES page has its EN pair under `src/pages/en/`.
- [ ] Non-markup logic was extracted first (`utils-organization`), then markup was decomposed.

---

See also: `utils-organization.md` (non-markup logic), `hooks-extraction.md` (island logic) and `i18n.md` (ES/EN pairs).
