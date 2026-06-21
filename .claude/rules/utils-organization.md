---
paths:
  - 'src/**/*.{ts,tsx,astro}'
---

# Utility organization: one file per utility

## Principle

Components and pages must not accumulate logic. **Every function that does not return markup lives outside the component, in its own utility file, and is imported to be used** — regardless of whether it is used only once today.

The goal is to keep files short and readable: an `.astro` file or a `.tsx` island should read as a composition of markup + data + imported utilities, not as a wall mixing transformations, calculations, parsing, and formatting.

---

## What to extract (strict rule)

Any function that **does not return markup** (`.astro`/JSX) is extracted to a utility file. This includes:

- Data transformations (mapping a Sanity document → view model, grouping, sorting).
- Calculations (totals, ranges, percentages, a post's estimated reading time).
- Parsing and formatting (dates, slugs, IDs, strings). Note: the catalog shows **no prices**.
- Predicates and filters (`isPublished`, `matchesCategory`).
- Builders for query params, affiliate URLs, or reusable GROQ projections.

**Do not extract** what is intrinsic to the component: island handlers that only orchestrate state/effects (`onClick`, `onSubmit`) and hooks. If a handler contains transformation or calculation logic, that logic *is* extracted and the handler calls it.

```tsx
// ❌ Logic embedded in an island
function ProductFilters({ products }: Props) {
  const visible = products
    .filter((p) => p.published && !p.hidden)
    .sort((a, b) => a.order - b.order)
  // ...
}

// ✅ Logic in utilities, the component only composes
import { selectVisibleProducts } from '@/lib/product/visibleProducts'

function ProductFilters({ products }: Props) {
  const visible = selectVisibleProducts(products)
  // ...
}
```

---

## Where each utility lives

### Cross-cutting → `src/lib/`

If the utility serves more than one domain (or is cross-cutting by nature: dates, strings, formatting, slugs, Sanity helpers), it lives in `src/lib/<name>.ts`.

```
src/lib/utils.ts          # cn() and class helpers (already exists)
src/lib/dates.ts
src/lib/slug.ts
src/lib/sanity.ts         # client + GROQ helpers (locale-aware)
```

### Domain scope → `src/lib/<domain>/`

If the utility only makes sense within one domain (`blog`, `product`, `brand`, `home`), it lives in a domain subfolder under `src/lib/`.

```
src/lib/blog/postViewModel.ts
src/lib/product/affiliateUrl.ts
```

**Promotion rule:** a utility is born in its domain. If it is later needed in a second domain, it is promoted to the root of `src/lib/` — never import a domain utility from another domain.

---

## Naming convention: descriptive, by domain

The file name describes **what it does or what it operates on**, in camelCase, with no `Utils` suffix.

| ✅ Correct          | ❌ Avoid           |
| ------------------- | ------------------ |
| `postViewModel.ts`  | `postUtils.ts`     |
| `affiliateUrl.ts`   | `productUtils.ts`  |
| `readingTime.ts`    | `helpers.ts`       |
| `dates.ts`          | `misc.ts`          |

- A file groups one function or a cohesive set of functions from the same domain. Do not mix different domains in one file.
- No catch-all files (`utils.ts` per domain, `helpers.ts`, `misc.ts`). The exception is the existing cross-cutting `src/lib/utils.ts` for `cn()`.

---

## No barrel (`index.ts`)

Do not create an `index.ts` in `src/lib/` or its subfolders. Each utility is imported from its concrete file via the `@/` alias.

```ts
// ✅ Direct import to the file
import { postViewModel } from '@/lib/blog/postViewModel'

// ❌ Barrel re-exporting everything
import { postViewModel } from '@/lib'
```

This avoids circular imports, keeps tree-shaking clean, and makes the origin of each function explicit.

---

## Tests

Extracted pure logic is exactly what should be tested (vitest is configured: `pnpm run test`). Tests live next to the file they test, replicating its name.

```
src/lib/blog/postViewModel.ts
src/lib/blog/postViewModel.test.ts
```

> The repo already follows this pattern: `src/lib/utils.ts` ↔ `src/lib/utils.test.ts`.

---

## Quick checklist

| Situation                                       | Action                                       |
| ----------------------------------------------- | -------------------------------------------- |
| Function that doesn't return markup in a component | Extract to a utility file                 |
| Serves 2+ domains                               | `src/lib/<name>.ts`                          |
| Serves only one domain                          | `src/lib/<domain>/<name>.ts`                 |
| Domain utility needed in another domain         | Promote to the root of `src/lib`             |
| File name                                       | Descriptive, by domain, no `Utils` suffix    |
| `index.ts` barrel                               | Do not create                                |
