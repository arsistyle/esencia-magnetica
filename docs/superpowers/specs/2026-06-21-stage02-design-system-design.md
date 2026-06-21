# Stage 02 — Design System & Theme Tokens: Spec

**Date:** 2026-06-21  
**Stage:** 02 — Design System & Theme Tokens  
**Status:** Approved

---

## Goal

Wire the Esencia Magnética brand into the Astro project: migrate design tokens from Claude Design into Tailwind v4's `@theme` block, self-host the three brand fonts, and build five scalable UI primitives as `.astro` components with CVA-style variant props. Deliver a `/styleguide` dev page and a `DESIGN-SYSTEM.md` reference doc.

---

## Decisions

| Decision         | Choice                                                           | Reason                                                                |
| ---------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------- |
| Component format | `.astro` (no shadcn, no React)                                   | No component needs client-side state in Stage 02; keep it simple      |
| Variant system   | `cva` + `clsx` + `tailwind-merge`                                | Same pattern shadcn uses — typed variants, class merging, extensible  |
| Token layer      | Tailwind v4 `@theme` block                                       | CSS-first, generates native utilities (`bg-gold`, `text-olive`, etc.) |
| Font loading     | `@fontsource/*` (self-hosted)                                    | Privacy + performance; no Google Fonts CDN                            |
| Design reference | Claude Design MCP project `658592d3-5da1-4cd3-81b6-c1576c694e23` | Source of truth for all token values and component specs              |

---

## Token Layer

All tokens live in the `@theme` block inside `src/styles/global.css`. No separate token files — Tailwind v4 CSS-first config is the single source of truth.

### Colors → `bg-*`, `text-*`, `border-*`

| Tailwind token          | Value     | Use                             |
| ----------------------- | --------- | ------------------------------- |
| `--color-cream`         | `#F5F0EB` | Default page background         |
| `--color-gold`          | `#C4973A` | Primary accent, CTAs, kickers   |
| `--color-olive`         | `#3E3D2F` | Primary text, dark sections     |
| `--color-lavender`      | `#EDE6F2` | Soft accent bands               |
| `--color-rose-nude`     | `#E8C9BC` | Warm accent, product highlights |
| `--color-cream-deep`    | `#ECE3D8` | Surface on cream, hover fills   |
| `--color-cream-card`    | `#FFFFFF` | Card surfaces                   |
| `--color-gold-soft`     | `#DCC089` | Subtle fills, borders           |
| `--color-gold-deep`     | `#A87C28` | Hover/press on gold             |
| `--color-olive-soft`    | `#6E6C58` | Secondary text                  |
| `--color-olive-faint`   | `#9A9784` | Captions, meta                  |
| `--color-rose-deep`     | `#D9AC9B` | Hover on rose                   |
| `--color-lavender-deep` | `#DDD0E8` | Hover on lavender               |
| `--color-line`          | `#E3DACE` | Hairline borders on cream       |
| `--color-line-strong`   | `#CFC3B2` | Stronger dividers               |

Status colors (warm-tinted to stay on-brand):

| Token             | Value              |
| ----------------- | ------------------ |
| `--color-success` | `#5C7A4A`          |
| `--color-warning` | `#C4973A` (= gold) |
| `--color-danger`  | `#B0573F`          |

### Fonts → `font-serif`, `font-sans`, `font-script`

| Token           | Value                                                             |
| --------------- | ----------------------------------------------------------------- |
| `--font-serif`  | `'Cormorant Garamond', 'Times New Roman', serif`                  |
| `--font-sans`   | `'Lato', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif` |
| `--font-script` | `'Great Vibes', 'Brush Script MT', cursive`                       |

Loaded via `@fontsource/cormorant-garamond`, `@fontsource/lato`, `@fontsource/great-vibes`.

Required weights:

- Cormorant Garamond: 400, 400 italic, 500, 500 italic, 600, 700
- Lato: 300, 400, 400 italic, 700, 900
- Great Vibes: 400

### Type scale → `text-display`, `text-h1`, …

| Token             | Value                        |
| ----------------- | ---------------------------- |
| `--text-display`  | `clamp(3rem, 6vw, 5rem)`     |
| `--text-h1`       | `clamp(2.4rem, 4vw, 3.5rem)` |
| `--text-h2`       | `clamp(1.9rem, 3vw, 2.6rem)` |
| `--text-h3`       | `1.6rem`                     |
| `--text-h4`       | `1.3rem`                     |
| `--text-lead`     | `1.25rem`                    |
| `--text-body`     | `1.0625rem`                  |
| `--text-small`    | `0.9375rem`                  |
| `--text-caption`  | `0.8125rem`                  |
| `--text-overline` | `0.75rem`                    |

Line-height and letter-spacing tokens registered under `--leading-*` and `--tracking-*` since the brand values differ from Tailwind's defaults (e.g. `--leading-normal: 1.6` vs Tailwind's 1.5).

### Spacing, radii, layout

8px base rhythm. Tokens `--spacing-0` through `--spacing-10` (0 → 8rem).

| Radius token    | Value   |
| --------------- | ------- |
| `--radius-sm`   | `4px`   |
| `--radius-md`   | `8px`   |
| `--radius-lg`   | `14px`  |
| `--radius-xl`   | `22px`  |
| `--radius-pill` | `999px` |

Layout variables (not in `@theme`, used as plain CSS vars since they don't need utility generation):

- `--container: 1200px`
- `--container-text: 720px`
- `--gutter: clamp(1.25rem, 5vw, 4rem)`

### Effects → `shadow-*`, `ease-*`, `duration-*`

| Token             | Value                               |
| ----------------- | ----------------------------------- |
| `--shadow-xs`     | `0 1px 2px rgba(62,61,47,0.06)`     |
| `--shadow-sm`     | `0 2px 8px rgba(62,61,47,0.07)`     |
| `--shadow-md`     | `0 8px 24px rgba(62,61,47,0.09)`    |
| `--shadow-lg`     | `0 18px 48px rgba(62,61,47,0.12)`   |
| `--shadow-gold`   | `0 8px 22px rgba(196,151,58,0.28)`  |
| `--ease-soft`     | `cubic-bezier(0.22, 0.61, 0.36, 1)` |
| `--duration-fast` | `150ms`                             |
| `--duration-base` | `240ms`                             |
| `--duration-slow` | `420ms`                             |

---

## Dependencies

Install in Stage 02:

```
pnpm add cva clsx tailwind-merge
pnpm add @fontsource/cormorant-garamond @fontsource/lato @fontsource/great-vibes
```

Update `cn()` in `src/lib/utils.ts` to use `clsx` + `tailwind-merge`.

---

## Component Architecture

All components live in `src/components/ui/`. Each `.astro` file follows this pattern:

1. Import `cva` + `cn` in the frontmatter
2. Define a `cva()` call with base classes + variants
3. Export a typed `Props` interface extending `VariantProps<typeof variantFn>`
4. Include a `class?: string` prop so consumers can extend via `cn()`
5. Render the appropriate HTML tag

The `class` prop always goes through `cn(variantFn({...}), className)` so Tailwind Merge resolves conflicts cleanly.

---

## Component Specs

### Button

**File:** `src/components/ui/Button.astro`

**Props:**

| Prop       | Type                                    | Default   |
| ---------- | --------------------------------------- | --------- |
| `variant`  | `primary \| secondary \| ghost \| warm` | `primary` |
| `size`     | `sm \| md \| lg`                        | `md`      |
| `href`     | `string`                                | —         |
| `disabled` | `boolean`                               | `false`   |
| `class`    | `string`                                | —         |

Renders `<a>` when `href` is provided, `<button>` otherwise.

**Variants:**

| Variant     | Appearance                                  |
| ----------- | ------------------------------------------- |
| `primary`   | Gold fill, white text, gold shadow on hover |
| `secondary` | Transparent, olive text, strong border      |
| `ghost`     | Transparent, gold text, no border           |
| `warm`      | Rose nude fill, olive text                  |

Base classes: `inline-flex items-center gap-2 font-sans font-bold uppercase tracking-wide rounded-pill transition-all`.

---

### Badge

**File:** `src/components/ui/Badge.astro`

**Props:**

| Prop    | Type                                           | Default |
| ------- | ---------------------------------------------- | ------- |
| `tone`  | `gold \| olive \| lavender \| rose \| neutral` | `gold`  |
| `class` | `string`                                       | —       |

Base classes: `inline-flex items-center font-sans font-bold uppercase text-overline tracking-wider rounded-pill px-3 py-1`.

---

### Card

**File:** `src/components/ui/Card.astro`

**Props:**

| Prop      | Type                     | Default |
| --------- | ------------------------ | ------- |
| `hover`   | `boolean`                | `true`  |
| `padding` | `none \| sm \| md \| lg` | `md`    |
| `class`   | `string`                 | —       |

White surface (`bg-cream-card`), `border border-line`, `rounded-lg`. When `hover=true`: `hover:-translate-y-1 hover:shadow-md transition-all`.

Exposes a default `<slot />` for arbitrary content.

---

### Input

**File:** `src/components/ui/Input.astro`

**Props:**

| Prop       | Type      | Default         |
| ---------- | --------- | --------------- |
| `label`    | `string`  | —               |
| `hint`     | `string`  | —               |
| `id`       | `string`  | auto from label |
| `type`     | `string`  | `text`          |
| `required` | `boolean` | `false`         |
| `class`    | `string`  | —               |

Label: `font-sans text-overline font-bold uppercase tracking-wide text-olive-soft`.  
Input: `bg-cream-card border border-line-strong rounded-md px-3 py-3 text-body font-sans text-olive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/45 focus-visible:border-gold`.  
Focus ring uses CSS `:focus-visible` — no JS handlers needed.

---

### Checkbox

**File:** `src/components/ui/Checkbox.astro`

**Props:**

| Prop      | Type      | Default |
| --------- | --------- | ------- |
| `label`   | `string`  | —       |
| `name`    | `string`  | —       |
| `value`   | `string`  | —       |
| `checked` | `boolean` | `false` |
| `class`   | `string`  | —       |

Native `<input type="checkbox">` styled via CSS: `accent-gold` (CSS `accent-color`), wrapped in a `<label>` flex row. No JS required.

---

## Styleguide Page

**File:** `src/pages/styleguide.astro`

Dev-only gate at the top of the frontmatter:

```ts
if (import.meta.env.PROD) return Astro.redirect("/");
```

Sections rendered:

1. **Colors** — swatch grid for all `--color-*` tokens
2. **Typography** — each scale step (`display` → `overline`) rendered live with serif/sans/script
3. **Spacing & Radii** — visual scale
4. **Shadows** — boxes showing each shadow token
5. **Components** — all variants of Button, Badge, Card, Input, Checkbox

No router links, no layout. Standalone page, only reachable in `dev`.

---

## Documentation

**File:** `docs/DESIGN-SYSTEM.md`

Covers: token reference table, component prop tables, usage rules (no hardcoded hex, class extension pattern, `cn()` usage).

---

## File Map

```
src/
├── styles/
│   └── global.css                  ← @import @fontsource + @theme + base styles
├── lib/
│   ├── utils.ts                    ← cn() updated: clsx + tailwind-merge
│   └── utils.test.ts               ← update tests for new cn() signature
└── components/
    └── ui/
        ├── Button.astro
        ├── Badge.astro
        ├── Card.astro
        ├── Input.astro
        └── Checkbox.astro
src/pages/
└── styleguide.astro                ← dev-only
docs/
└── DESIGN-SYSTEM.md
```

---

## Definition of Done

- [ ] `pnpm run build` succeeds with no TypeScript errors
- [ ] `pnpm run lint` passes
- [ ] Styleguide page renders all tokens and component variants in `dev`
- [ ] Styleguide redirects to `/` in `PROD`
- [ ] No hardcoded hex values in any component file
- [ ] All component `class` props go through `cn()`
- [ ] `cn()` tests pass with the new `clsx + tailwind-merge` signature
- [ ] `@fontsource` packages load correctly (Cormorant Garamond, Lato, Great Vibes visible in styleguide)
