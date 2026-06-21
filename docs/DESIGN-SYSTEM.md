# Design System

> **Reference** — tokens, components, and usage rules for Esencia Magnética.

## Token Reference

### Colors

| Token                   | Value     | Usage                       |
| ----------------------- | --------- | --------------------------- |
| `--color-cream`         | `#F5F0EB` | Default page background     |
| `--color-gold`          | `#C4973A` | Primary accent, CTAs        |
| `--color-olive`         | `#3E3D2F` | Primary text                |
| `--color-lavender`      | `#EDE6F2` | Soft accent bands           |
| `--color-rose-nude`     | `#E8C9BC` | Warm accent                 |
| `--color-cream-deep`    | `#ECE3D8` | Surface hover fills         |
| `--color-cream-card`    | `#FFFFFF` | Card surfaces               |
| `--color-gold-soft`     | `#DCC089` | Subtle fills, borders       |
| `--color-gold-deep`     | `#A87C28` | Hover/press on gold         |
| `--color-olive-soft`    | `#6E6C58` | Secondary text              |
| `--color-olive-faint`   | `#9A9784` | Captions, meta              |
| `--color-rose-deep`     | `#D9AC9B` | Hover on rose               |
| `--color-lavender-deep` | `#DDD0E8` | Hover on lavender           |
| `--color-line`          | `#E3DACE` | Hairline borders            |
| `--color-line-strong`   | `#CFC3B2` | Stronger dividers           |
| `--color-white`         | `#FFFFFF` | Text on colored backgrounds |
| `--color-success`       | `#5C7A4A` | Success states              |
| `--color-warning`       | `#C4973A` | Warning states (= gold)     |
| `--color-danger`        | `#B0573F` | Error states                |

### Fonts

| Token           | Stack                                        |
| --------------- | -------------------------------------------- |
| `--font-serif`  | Cormorant Garamond → Times New Roman → serif |
| `--font-sans`   | Lato → system-ui → sans-serif                |
| `--font-script` | Great Vibes → Brush Script MT → cursive      |

### Type Scale

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

### Radii

| Token           | Value   |
| --------------- | ------- |
| `--radius-sm`   | `4px`   |
| `--radius-md`   | `8px`   |
| `--radius-lg`   | `14px`  |
| `--radius-xl`   | `22px`  |
| `--radius-pill` | `999px` |

### Shadows

| Token           | Value                              |
| --------------- | ---------------------------------- |
| `--shadow-xs`   | `0 1px 2px rgba(62,61,47,0.06)`    |
| `--shadow-sm`   | `0 2px 8px rgba(62,61,47,0.07)`    |
| `--shadow-md`   | `0 8px 24px rgba(62,61,47,0.09)`   |
| `--shadow-lg`   | `0 18px 48px rgba(62,61,47,0.12)`  |
| `--shadow-gold` | `0 8px 22px rgba(196,151,58,0.28)` |

### Effects

| Token             | Value                               |
| ----------------- | ----------------------------------- |
| `--ease-soft`     | `cubic-bezier(0.22, 0.61, 0.36, 1)` |
| `--duration-fast` | `150ms`                             |
| `--duration-base` | `240ms`                             |
| `--duration-slow` | `420ms`                             |

---

## Components

### Button

**File:** `src/components/ui/Button.astro`

| Prop       | Type                                    | Default   |
| ---------- | --------------------------------------- | --------- |
| `variant`  | `primary \| secondary \| ghost \| warm` | `primary` |
| `size`     | `sm \| md \| lg`                        | `md`      |
| `href`     | `string`                                | —         |
| `disabled` | `boolean`                               | `false`   |
| `class`    | `string`                                | —         |

Renders `<a>` when `href` is provided, `<button>` otherwise.

```astro
<Button>Primary</Button>
<Button variant="ghost" size="lg">Large Ghost</Button>
<Button href="/articulos">Ver artículos</Button>
```

### Badge

**File:** `src/components/ui/Badge.astro`

| Prop    | Type                                           | Default |
| ------- | ---------------------------------------------- | ------- |
| `tone`  | `gold \| olive \| lavender \| rose \| neutral` | `gold`  |
| `size`  | `sm \| md`                                     | `md`    |
| `class` | `string`                                       | —       |

```astro
<Badge>Tendencias</Badge>
<Badge tone="lavender" size="sm">Nuevo</Badge>
```

### Card

**File:** `src/components/ui/Card.astro`

| Prop      | Type                     | Default |
| --------- | ------------------------ | ------- |
| `hover`   | `boolean`                | `true`  |
| `padding` | `none \| sm \| md \| lg` | `md`    |
| `class`   | `string`                 | —       |

```astro
<Card>
  <p>Contenido del card</p>
</Card>
<Card hover={false} padding="none">
  <img src="..." alt="..." />
</Card>
```

### Input

**File:** `src/components/ui/Input.astro`

| Prop       | Type        | Default         |
| ---------- | ----------- | --------------- |
| `label`    | `string`    | —               |
| `hint`     | `string`    | —               |
| `id`       | `string`    | auto from label |
| `type`     | `InputType` | `text`          |
| `required` | `boolean`   | `false`         |
| `class`    | `string`    | —               |

```astro
<Input label="Email" type="email" required />
<Input label="Nombre" hint="Nombre completo" />
```

### Checkbox

**File:** `src/components/ui/Checkbox.astro`

| Prop      | Type      | Default |
| --------- | --------- | ------- |
| `label`   | `string`  | —       |
| `name`    | `string`  | —       |
| `value`   | `string`  | —       |
| `checked` | `boolean` | `false` |
| `class`   | `string`  | —       |

```astro
<Checkbox label="Acepto los términos" name="terms" value="yes" />
```

---

## Usage Rules

1. **No hardcoded hex** — always use Tailwind utility classes backed by `@theme` tokens (`bg-gold`, `text-olive`, etc.)
2. **Class extension** — all components accept a `class` prop; use it to override or extend via `cn()`
3. **cn() usage** — import from `@/lib/utils`: `import { cn } from '@/lib/utils'`
4. **Affiliate links** — open in new tab: `<Button href="..." target="_blank" rel="sponsored nofollow noopener">`
5. **No prices** — never show prices in product listings (affiliate model)
6. **Styleguide** — visit `/styleguide` in dev to see all tokens and components live
