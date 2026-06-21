# Stage 02 — Design System & Theme Tokens: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire Esencia Magnética brand tokens into Tailwind v4's `@theme` block, self-host three fonts via `@fontsource`, and build 5 scalable `.astro` UI primitives (Button, Badge, Card, Input, Checkbox) with CVA-style variant props; deliver a dev-only `/styleguide` page and `docs/DESIGN-SYSTEM.md`.

**Architecture:** All tokens live in a single `@theme` block in `src/styles/global.css` — Tailwind v4 CSS-first, no separate token files. Components use `cva` (class-variance-authority) for typed variant props and `cn()` (clsx + tailwind-merge) for class merging — same pattern as shadcn, but as `.astro` files with zero React. Styleguide is a dev-only Astro page that redirects in PROD.

**Tech Stack:** Astro, Tailwind CSS v4, TypeScript, `cva`, `clsx`, `tailwind-merge`, `@fontsource/cormorant-garamond`, `@fontsource/lato`, `@fontsource/great-vibes`

---

## File Map

| Action | Path                               | Responsibility                                             |
| ------ | ---------------------------------- | ---------------------------------------------------------- |
| Modify | `src/styles/global.css`            | @fontsource imports + @theme token block + base styles     |
| Modify | `src/lib/utils.ts`                 | Upgrade `cn()` to clsx + tailwind-merge                    |
| Modify | `src/lib/utils.test.ts`            | Add tests for class-merge and conditional class behavior   |
| Modify | `src/pages/index.astro`            | Smoke-test scaffold (reverted in Task 9)                   |
| Create | `src/components/ui/Button.astro`   | Button — 4 variants × 3 sizes, renders `<a>` or `<button>` |
| Create | `src/components/ui/Badge.astro`    | Badge — 5 tones × 2 sizes                                  |
| Create | `src/components/ui/Card.astro`     | Card — hover-lift variant + padding variants               |
| Create | `src/components/ui/Input.astro`    | Input — label, hint, CSS focus ring                        |
| Create | `src/components/ui/Checkbox.astro` | Checkbox — native styled with accent-color                 |
| Create | `src/pages/styleguide.astro`       | Dev-only visual QA page (PROD → redirect `/`)              |
| Create | `docs/DESIGN-SYSTEM.md`            | Token reference + component prop tables                    |

---

## Task 1 — Install dependencies

**Files:** `package.json`, `pnpm-lock.yaml`

- [ ] Run:

```bash
pnpm add cva clsx tailwind-merge
pnpm add @fontsource/cormorant-garamond @fontsource/lato @fontsource/great-vibes
```

- [ ] Verify terminal shows no errors. `package.json` should list all 6 new packages.

- [ ] Commit:

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add cva, clsx, tailwind-merge and @fontsource packages"
```

---

## Task 2 — Upgrade cn() with clsx + tailwind-merge (TDD)

**Files:**

- Modify: `src/lib/utils.ts`
- Modify: `src/lib/utils.test.ts`

The current `cn()` uses a basic `filter(Boolean).join(' ')`. It needs clsx (conditional object syntax) and tailwind-merge (resolves conflicts like `bg-gold bg-cream` → keeps last).

- [ ] **Add failing tests** to `src/lib/utils.test.ts` (keep existing tests, append these):

```ts
it("handles conditional objects", () => {
  expect(cn("foo", { bar: true, baz: false })).toBe("foo bar");
});

it("resolves Tailwind conflicts — last class wins", () => {
  expect(cn("bg-gold", "bg-cream")).toBe("bg-cream");
});

it("allows caller to override a variant class", () => {
  expect(cn("rounded-pill px-4", "rounded-md")).toBe("px-4 rounded-md");
});
```

Full `src/lib/utils.test.ts` after edit:

```ts
import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("joins two class names with a space", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("filters out null, undefined, and false", () => {
    expect(cn("foo", null, undefined, false, "bar")).toBe("foo bar");
  });

  it("returns empty string when all values are falsy", () => {
    expect(cn(null, undefined, false)).toBe("");
  });

  it("handles conditional objects", () => {
    expect(cn("foo", { bar: true, baz: false })).toBe("foo bar");
  });

  it("resolves Tailwind conflicts — last class wins", () => {
    expect(cn("bg-gold", "bg-cream")).toBe("bg-cream");
  });

  it("allows caller to override a variant class", () => {
    expect(cn("rounded-pill px-4", "rounded-md")).toBe("px-4 rounded-md");
  });
});
```

- [ ] Run tests to verify the 3 new ones fail:

```bash
pnpm run test src/lib/utils.test.ts
```

Expected output: 3 existing tests pass, 3 new tests fail with errors about object handling or class conflict.

- [ ] **Implement** new `cn()` in `src/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] Run tests to verify all 6 pass:

```bash
pnpm run test src/lib/utils.test.ts
```

Expected: `6 passed`.

- [ ] Run typecheck:

```bash
pnpm run typecheck
```

Expected: no errors.

- [ ] Commit:

```bash
git add src/lib/utils.ts src/lib/utils.test.ts
git commit -m "feat: upgrade cn() to clsx + tailwind-merge"
```

---

## Task 3 — Token layer: @theme + fonts in global.css

**Files:**

- Modify: `src/styles/global.css`

This replaces the one-liner `@import "tailwindcss"` with the full token layer. The `@theme` block registers brand tokens as Tailwind v4 CSS-first utilities. `--color-gold` → `bg-gold`, `text-gold`, etc. `--radius-pill` → `rounded-pill`. All values are pulled verbatim from the Claude Design MCP project.

- [ ] **Replace** the entire `src/styles/global.css` with:

```css
/* ─── Fonts (self-hosted via @fontsource) ────────── */
@import "@fontsource/cormorant-garamond/400.css";
@import "@fontsource/cormorant-garamond/400-italic.css";
@import "@fontsource/cormorant-garamond/500.css";
@import "@fontsource/cormorant-garamond/500-italic.css";
@import "@fontsource/cormorant-garamond/600.css";
@import "@fontsource/cormorant-garamond/700.css";
@import "@fontsource/lato/300.css";
@import "@fontsource/lato/400.css";
@import "@fontsource/lato/400-italic.css";
@import "@fontsource/lato/700.css";
@import "@fontsource/lato/900.css";
@import "@fontsource/great-vibes/400.css";

/* ─── Tailwind ───────────────────────────────────── */
@import "tailwindcss";

/* ─── Design tokens ──────────────────────────────── */
@theme {
  /* Colors — generates bg-*, text-*, border-* utilities */
  --color-cream: #f5f0eb;
  --color-gold: #c4973a;
  --color-olive: #3e3d2f;
  --color-lavender: #ede6f2;
  --color-rose-nude: #e8c9bc;
  --color-cream-deep: #ece3d8;
  --color-cream-card: #ffffff;
  --color-gold-soft: #dcc089;
  --color-gold-deep: #a87c28;
  --color-olive-soft: #6e6c58;
  --color-olive-faint: #9a9784;
  --color-rose-deep: #d9ac9b;
  --color-lavender-deep: #ddd0e8;
  --color-line: #e3dace;
  --color-line-strong: #cfc3b2;
  --color-success: #5c7a4a;
  --color-warning: #c4973a;
  --color-danger: #b0573f;

  /* Font families — generates font-serif, font-sans, font-script */
  --font-serif: "Cormorant Garamond", "Times New Roman", serif;
  --font-sans: "Lato", -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
  --font-script: "Great Vibes", "Brush Script MT", cursive;

  /* Type scale — generates text-display, text-h1, … */
  --text-display: clamp(3rem, 6vw, 5rem);
  --text-h1: clamp(2.4rem, 4vw, 3.5rem);
  --text-h2: clamp(1.9rem, 3vw, 2.6rem);
  --text-h3: 1.6rem;
  --text-h4: 1.3rem;
  --text-lead: 1.25rem;
  --text-body: 1.0625rem;
  --text-small: 0.9375rem;
  --text-caption: 0.8125rem;
  --text-overline: 0.75rem;

  /* Line heights (overrides Tailwind defaults to match brand) */
  --leading-tight: 1.1;
  --leading-snug: 1.25;
  --leading-normal: 1.6;
  --leading-relaxed: 1.75;

  /* Letter spacing (overrides Tailwind defaults to match brand) */
  --tracking-tight: -0.01em;
  --tracking-normal: 0em;
  --tracking-wide: 0.08em;
  --tracking-wider: 0.18em;

  /* Radii — generates rounded-sm, rounded-pill, etc. */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 14px;
  --radius-xl: 22px;
  --radius-pill: 999px;

  /* Shadows — generates shadow-xs, shadow-gold, etc. */
  --shadow-xs: 0 1px 2px rgba(62, 61, 47, 0.06);
  --shadow-sm: 0 2px 8px rgba(62, 61, 47, 0.07);
  --shadow-md: 0 8px 24px rgba(62, 61, 47, 0.09);
  --shadow-lg: 0 18px 48px rgba(62, 61, 47, 0.12);
  --shadow-gold: 0 8px 22px rgba(196, 151, 58, 0.28);

  /* Easing & duration — generates ease-soft, duration-fast, etc. */
  --ease-soft: cubic-bezier(0.22, 0.61, 0.36, 1);
  --duration-fast: 150ms;
  --duration-base: 240ms;
  --duration-slow: 420ms;
}

/* ─── Layout variables (plain CSS vars, no utility needed) */
:root {
  --container: 1200px;
  --container-text: 720px;
  --gutter: clamp(1.25rem, 5vw, 4rem);
}

/* ─── Base styles ────────────────────────────────── */
html {
  background-color: var(--color-cream);
  color: var(--color-olive);
  font-family: var(--font-sans);
  font-size: var(--text-body);
  line-height: var(--leading-normal);
  -webkit-font-smoothing: antialiased;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}
```

- [ ] Start dev server and check for CSS errors:

```bash
pnpm run dev
```

Expected: server starts cleanly. Open `http://localhost:4321` — background should be warm cream `#F5F0EB`, text should be dark olive `#3E3D2F`.

- [ ] Verify fonts: open browser DevTools → Network tab, filter by `font`. Should see Lato and Cormorant Garamond being loaded from `/assets/` (bundled by Vite, not from Google Fonts).

- [ ] Stop server. Run build:

```bash
pnpm run build
```

Expected: build succeeds with no errors.

- [ ] Commit:

```bash
git add src/styles/global.css
git commit -m "feat: add brand design tokens to Tailwind v4 @theme and self-host fonts"
```

---

## Task 4 — Button component

**Files:**

- Create: `src/components/ui/Button.astro`
- Modify: `src/pages/index.astro` (smoke test — reverted in Task 9)

- [ ] **Create** `src/components/ui/Button.astro`:

```astro
---
import { cva, type VariantProps } from "cva";
import { cn } from "@/lib/utils";

const button = cva(
  "inline-flex items-center justify-center gap-2 font-sans font-bold uppercase tracking-wide rounded-pill transition-all duration-base ease-soft cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:
          "bg-gold text-white border border-gold shadow-gold hover:bg-gold-deep hover:border-gold-deep",
        secondary:
          "bg-transparent text-olive border border-line-strong hover:bg-cream-deep",
        ghost:
          "bg-transparent text-gold border border-transparent hover:bg-cream-deep",
        warm: "bg-rose-nude text-olive border border-rose-nude hover:bg-rose-deep",
      },
      size: {
        sm: "px-4 py-2 text-small",
        md: "px-6 py-3 text-body",
        lg: "px-8 py-4 text-lead",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonVariants = VariantProps<typeof button>;

interface Props extends ButtonVariants {
  class?: string;
  href?: string;
  disabled?: boolean;
  target?: string;
  rel?: string;
  type?: "button" | "submit" | "reset";
}

const {
  variant,
  size,
  class: className,
  href,
  disabled = false,
  target,
  rel,
  type = "button",
} = Astro.props;

const classes = cn(button({ variant, size }), className);
---

{
  href ? (
    <a href={href} class={classes} target={target} rel={rel}>
      <slot />
    </a>
  ) : (
    <button class={classes} disabled={disabled} type={type}>
      <slot />
    </button>
  )
}
```

- [ ] **Update** `src/pages/index.astro` to smoke-test the button:

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import Button from "@/components/ui/Button.astro";
---

<BaseLayout title="Smoke test">
  <div class="flex flex-wrap items-center gap-4 p-8">
    <Button>Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="warm">Warm</Button>
    <Button size="sm">Small</Button>
    <Button size="lg">Large</Button>
    <Button href="#" variant="secondary">Link Button</Button>
    <Button disabled>Disabled</Button>
    <Button class="w-full">Full width override</Button>
  </div>
</BaseLayout>
```

- [ ] Start dev, open `http://localhost:4321`. Verify:
  - Primary: gold fill, white text, gold shadow
  - Secondary: transparent, olive text, border
  - Ghost: transparent, gold text
  - Warm: rose nude fill
  - Disabled: visibly faded
  - Link Button: renders as `<a>` (inspect element)

- [ ] Run typecheck:

```bash
pnpm run typecheck
```

Expected: no errors.

- [ ] Commit:

```bash
git add src/components/ui/Button.astro src/pages/index.astro
git commit -m "feat: add Button component with cva variants (primary/secondary/ghost/warm)"
```

---

## Task 5 — Badge component

**Files:**

- Create: `src/components/ui/Badge.astro`
- Modify: `src/pages/index.astro`

- [ ] **Create** `src/components/ui/Badge.astro`:

```astro
---
import { cva, type VariantProps } from "cva";
import { cn } from "@/lib/utils";

const badge = cva(
  "inline-flex items-center font-sans font-bold uppercase tracking-wider leading-none",
  {
    variants: {
      tone: {
        gold: "bg-gold text-white",
        olive: "bg-olive text-cream",
        lavender: "bg-lavender text-olive",
        rose: "bg-rose-nude text-olive",
        neutral: "bg-cream-deep text-olive-soft",
      },
      size: {
        sm: "px-2 py-1 text-[10px] rounded-sm",
        md: "px-3 py-1 text-overline rounded-pill",
      },
    },
    defaultVariants: { tone: "gold", size: "md" },
  },
);

type BadgeVariants = VariantProps<typeof badge>;

interface Props extends BadgeVariants {
  class?: string;
}

const { tone, size, class: className } = Astro.props;
---

<span class={cn(badge({ tone, size }), className)}>
  <slot />
</span>
```

- [ ] **Update** `src/pages/index.astro` — append a badge row below the buttons:

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import Button from "@/components/ui/Button.astro";
import Badge from "@/components/ui/Badge.astro";
---

<BaseLayout title="Smoke test">
  <div class="flex flex-wrap items-center gap-4 p-8">
    <Button>Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="warm">Warm</Button>
    <Button size="sm">Small</Button>
    <Button size="lg">Large</Button>
    <Button href="#" variant="secondary">Link Button</Button>
    <Button disabled>Disabled</Button>
    <Button class="w-full">Full width override</Button>
  </div>
  <div class="flex flex-wrap items-center gap-3 p-8">
    <Badge>TENDENCIAS</Badge>
    <Badge tone="olive">OLIVE</Badge>
    <Badge tone="lavender">LAVENDER</Badge>
    <Badge tone="rose">ROSE</Badge>
    <Badge tone="neutral">NEUTRAL</Badge>
    <Badge size="sm">SMALL</Badge>
  </div>
</BaseLayout>
```

- [ ] Verify in dev: each badge tone renders with correct colors. Small badge has smaller text and rounded-sm.

- [ ] Run typecheck:

```bash
pnpm run typecheck
```

- [ ] Commit:

```bash
git add src/components/ui/Badge.astro src/pages/index.astro
git commit -m "feat: add Badge component with tone variants (gold/olive/lavender/rose/neutral)"
```

---

## Task 6 — Card component

**Files:**

- Create: `src/components/ui/Card.astro`
- Modify: `src/pages/index.astro`

- [ ] **Create** `src/components/ui/Card.astro`:

```astro
---
import { cva, type VariantProps } from "cva";
import { cn } from "@/lib/utils";

const card = cva(
  "bg-cream-card border border-line rounded-lg overflow-hidden",
  {
    variants: {
      hover: {
        true: "transition-all duration-base ease-soft hover:-translate-y-1 hover:shadow-md",
        false: "",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-5",
        lg: "p-8",
      },
    },
    defaultVariants: { hover: true, padding: "none" },
  },
);

type CardVariants = VariantProps<typeof card>;

interface Props extends CardVariants {
  class?: string;
}

const { hover, padding, class: className } = Astro.props;
---

<div class={cn(card({ hover, padding }), className)}>
  <slot />
</div>
```

- [ ] **Update** `src/pages/index.astro` — append a card grid:

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import Button from "@/components/ui/Button.astro";
import Badge from "@/components/ui/Badge.astro";
import Card from "@/components/ui/Card.astro";
---

<BaseLayout title="Smoke test">
  <div class="flex flex-wrap items-center gap-4 p-8">
    <Button>Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="warm">Warm</Button>
    <Button size="sm">Small</Button>
    <Button size="lg">Large</Button>
    <Button href="#" variant="secondary">Link Button</Button>
    <Button disabled>Disabled</Button>
    <Button class="w-full">Full width override</Button>
  </div>
  <div class="flex flex-wrap items-center gap-3 p-8">
    <Badge>TENDENCIAS</Badge>
    <Badge tone="olive">OLIVE</Badge>
    <Badge tone="lavender">LAVENDER</Badge>
    <Badge tone="rose">ROSE</Badge>
    <Badge tone="neutral">NEUTRAL</Badge>
    <Badge size="sm">SMALL</Badge>
  </div>
  <div class="grid grid-cols-3 gap-6 p-8">
    <Card padding="md">
      <p class="text-olive font-sans">Hover lift card (default)</p>
    </Card>
    <Card padding="lg" hover={false}>
      <p class="text-olive font-sans">No hover card</p>
    </Card>
    <Card class="border-gold p-6">
      <p class="text-olive font-sans">Class override (gold border)</p>
    </Card>
  </div>
</BaseLayout>
```

- [ ] Verify in dev: first card lifts on hover with shadow; second card is static; third has gold border via class override.

- [ ] Run typecheck:

```bash
pnpm run typecheck
```

- [ ] Commit:

```bash
git add src/components/ui/Card.astro src/pages/index.astro
git commit -m "feat: add Card component with hover-lift and padding variants"
```

---

## Task 7 — Input component

**Files:**

- Create: `src/components/ui/Input.astro`
- Modify: `src/pages/index.astro`

- [ ] **Create** `src/components/ui/Input.astro`:

```astro
---
import { cn } from "@/lib/utils";

interface Props {
  label?: string;
  hint?: string;
  id?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  class?: string;
}

const {
  label,
  hint,
  id,
  name,
  type = "text",
  placeholder,
  required = false,
  disabled = false,
  value,
  class: className,
} = Astro.props;

const inputId = id ?? (name ? `input-${name}` : undefined);
---

<div class="flex flex-col gap-1.5">
  {
    label && (
      <label
        for={inputId}
        class="text-overline text-olive-soft font-sans font-bold tracking-wider uppercase"
      >
        {label}
        {required && (
          <span class="text-danger ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>
    )
  }
  <input
    id={inputId}
    name={name}
    type={type}
    placeholder={placeholder}
    required={required}
    disabled={disabled}
    value={value}
    class={cn(
      "bg-cream-card border border-line-strong rounded-md px-3 py-3 font-sans text-body text-olive w-full",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/45 focus-visible:border-gold",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "transition-colors duration-fast ease-soft",
      className,
    )}
  />
  {hint && <span class="text-caption text-olive-faint font-sans">{hint}</span>}
</div>
```

- [ ] **Update** `src/pages/index.astro` — append a form section:

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import Button from "@/components/ui/Button.astro";
import Badge from "@/components/ui/Badge.astro";
import Card from "@/components/ui/Card.astro";
import Input from "@/components/ui/Input.astro";
---

<BaseLayout title="Smoke test">
  <div class="flex flex-wrap items-center gap-4 p-8">
    <Button>Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="warm">Warm</Button>
    <Button size="sm">Small</Button>
    <Button size="lg">Large</Button>
    <Button href="#" variant="secondary">Link Button</Button>
    <Button disabled>Disabled</Button>
    <Button class="w-full">Full width override</Button>
  </div>
  <div class="flex flex-wrap items-center gap-3 p-8">
    <Badge>TENDENCIAS</Badge>
    <Badge tone="olive">OLIVE</Badge>
    <Badge tone="lavender">LAVENDER</Badge>
    <Badge tone="rose">ROSE</Badge>
    <Badge tone="neutral">NEUTRAL</Badge>
    <Badge size="sm">SMALL</Badge>
  </div>
  <div class="grid grid-cols-3 gap-6 p-8">
    <Card padding="md">
      <p class="text-olive font-sans">Hover lift card (default)</p>
    </Card>
    <Card padding="lg" hover={false}>
      <p class="text-olive font-sans">No hover card</p>
    </Card>
    <Card class="border-gold p-6">
      <p class="text-olive font-sans">Class override (gold border)</p>
    </Card>
  </div>
  <div class="flex max-w-sm flex-col gap-4 p-8">
    <Input label="Nombre" placeholder="Tu nombre" />
    <Input label="Email" type="email" placeholder="tu@email.com" required />
    <Input
      label="Con hint"
      hint="Máximo 100 caracteres"
      placeholder="Escribe aquí"
    />
    <Input disabled placeholder="Campo deshabilitado" />
  </div>
</BaseLayout>
```

- [ ] Verify in dev:
  - Label renders in uppercase olive-soft
  - Required label shows red asterisk
  - Focus shows gold ring (tab into field)
  - Hint text renders below in faint olive
  - Disabled field is visibly muted

- [ ] Run typecheck:

```bash
pnpm run typecheck
```

- [ ] Commit:

```bash
git add src/components/ui/Input.astro src/pages/index.astro
git commit -m "feat: add Input component with label, hint, and CSS focus ring"
```

---

## Task 8 — Checkbox component

**Files:**

- Create: `src/components/ui/Checkbox.astro`
- Modify: `src/pages/index.astro`

- [ ] **Create** `src/components/ui/Checkbox.astro`:

```astro
---
import { cn } from "@/lib/utils";

interface Props {
  label?: string;
  id?: string;
  name?: string;
  value?: string;
  checked?: boolean;
  required?: boolean;
  disabled?: boolean;
  class?: string;
}

const {
  label,
  id,
  name,
  value,
  checked = false,
  required = false,
  disabled = false,
  class: className,
} = Astro.props;

const inputId =
  id ?? (name ? `checkbox-${name}${value ? `-${value}` : ""}` : undefined);
---

<label
  class={cn(
    "inline-flex items-center gap-2 font-sans text-body text-olive cursor-pointer select-none",
    disabled && "opacity-50 cursor-not-allowed",
    className,
  )}
>
  <input
    id={inputId}
    type="checkbox"
    name={name}
    value={value}
    checked={checked}
    required={required}
    disabled={disabled}
    class="accent-gold h-4 w-4 cursor-pointer rounded-sm"
  />
  {label && <span>{label}</span>}
</label>
```

- [ ] **Update** `src/pages/index.astro` — append a checkbox section:

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import Button from "@/components/ui/Button.astro";
import Badge from "@/components/ui/Badge.astro";
import Card from "@/components/ui/Card.astro";
import Input from "@/components/ui/Input.astro";
import Checkbox from "@/components/ui/Checkbox.astro";
---

<BaseLayout title="Smoke test">
  <div class="flex flex-wrap items-center gap-4 p-8">
    <Button>Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="warm">Warm</Button>
    <Button size="sm">Small</Button>
    <Button size="lg">Large</Button>
    <Button href="#" variant="secondary">Link Button</Button>
    <Button disabled>Disabled</Button>
    <Button class="w-full">Full width override</Button>
  </div>
  <div class="flex flex-wrap items-center gap-3 p-8">
    <Badge>TENDENCIAS</Badge>
    <Badge tone="olive">OLIVE</Badge>
    <Badge tone="lavender">LAVENDER</Badge>
    <Badge tone="rose">ROSE</Badge>
    <Badge tone="neutral">NEUTRAL</Badge>
    <Badge size="sm">SMALL</Badge>
  </div>
  <div class="grid grid-cols-3 gap-6 p-8">
    <Card padding="md">
      <p class="text-olive font-sans">Hover lift card (default)</p>
    </Card>
    <Card padding="lg" hover={false}>
      <p class="text-olive font-sans">No hover card</p>
    </Card>
    <Card class="border-gold p-6">
      <p class="text-olive font-sans">Class override (gold border)</p>
    </Card>
  </div>
  <div class="flex max-w-sm flex-col gap-4 p-8">
    <Input label="Nombre" placeholder="Tu nombre" />
    <Input label="Email" type="email" placeholder="tu@email.com" required />
    <Input
      label="Con hint"
      hint="Máximo 100 caracteres"
      placeholder="Escribe aquí"
    />
    <Input disabled placeholder="Campo deshabilitado" />
  </div>
  <div class="flex flex-col gap-3 p-8">
    <Checkbox label="Acepto los términos y condiciones" name="terms" />
    <Checkbox label="Recibir novedades" name="newsletter" checked />
    <Checkbox label="Opción deshabilitada" disabled />
  </div>
</BaseLayout>
```

- [ ] Verify in dev:
  - Checkboxes render with gold accent color when checked
  - Clicking label checks/unchecks the box
  - Disabled checkbox is faded and non-interactive

- [ ] Run typecheck:

```bash
pnpm run typecheck
```

- [ ] Commit:

```bash
git add src/components/ui/Checkbox.astro src/pages/index.astro
git commit -m "feat: add Checkbox component with gold accent and label prop"
```

---

## Task 9 — Styleguide page + revert index.astro

**Files:**

- Create: `src/pages/styleguide.astro`
- Modify: `src/pages/index.astro` (revert to clean state)

- [ ] **Create** `src/pages/styleguide.astro`:

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import Button from "@/components/ui/Button.astro";
import Badge from "@/components/ui/Badge.astro";
import Card from "@/components/ui/Card.astro";
import Input from "@/components/ui/Input.astro";
import Checkbox from "@/components/ui/Checkbox.astro";

if (import.meta.env.PROD) return Astro.redirect("/");

const colors = [
  { name: "cream", hex: "#F5F0EB", label: "Cream" },
  { name: "gold", hex: "#C4973A", label: "Gold" },
  { name: "olive", hex: "#3E3D2F", label: "Olive" },
  { name: "lavender", hex: "#EDE6F2", label: "Lavender" },
  { name: "rose-nude", hex: "#E8C9BC", label: "Rose Nude" },
  { name: "cream-deep", hex: "#ECE3D8", label: "Cream Deep" },
  { name: "cream-card", hex: "#FFFFFF", label: "Cream Card" },
  { name: "gold-soft", hex: "#DCC089", label: "Gold Soft" },
  { name: "gold-deep", hex: "#A87C28", label: "Gold Deep" },
  { name: "olive-soft", hex: "#6E6C58", label: "Olive Soft" },
  { name: "olive-faint", hex: "#9A9784", label: "Olive Faint" },
  { name: "rose-deep", hex: "#D9AC9B", label: "Rose Deep" },
  { name: "lavender-deep", hex: "#DDD0E8", label: "Lavender Deep" },
  { name: "line", hex: "#E3DACE", label: "Line" },
  { name: "line-strong", hex: "#CFC3B2", label: "Line Strong" },
];

const typeScale = [
  {
    label: "display",
    cls: "font-serif text-display font-semibold leading-tight",
    sample: "El estilo no tiene edad",
  },
  {
    label: "h1",
    cls: "font-serif text-h1 font-semibold leading-tight",
    sample: "Cormorant Garamond H1",
  },
  {
    label: "h2",
    cls: "font-serif text-h2 font-semibold",
    sample: "Cormorant Garamond H2",
  },
  {
    label: "h3",
    cls: "font-serif text-h3 font-semibold",
    sample: "Cormorant Garamond H3",
  },
  {
    label: "h4",
    cls: "font-serif text-h4 font-semibold",
    sample: "Cormorant Garamond H4",
  },
  {
    label: "lead",
    cls: "font-sans text-lead",
    sample: "Lato lead — párrafo introductorio",
  },
  {
    label: "body",
    cls: "font-sans text-body",
    sample: "Lato body — texto principal de artículos",
  },
  {
    label: "small",
    cls: "font-sans text-small",
    sample: "Lato small — metadata, pies de foto",
  },
  {
    label: "caption",
    cls: "font-sans text-caption",
    sample: "Lato caption — timestamps, detalles",
  },
  {
    label: "overline",
    cls: "font-sans text-overline font-bold uppercase tracking-wider text-gold",
    sample: "TENDENCIAS · ESTILO",
  },
  {
    label: "script",
    cls: "font-script text-h2 text-gold",
    sample: "Esencia Magnética",
  },
];
---

<BaseLayout title="Styleguide — Esencia Magnética">
  <main class="mx-auto flex max-w-[1200px] flex-col gap-20 px-8 py-16">
    <header>
      <p class="font-script text-h2 text-gold">Esencia Magnética</p>
      <h1 class="text-h1 text-olive font-serif leading-tight font-semibold">
        Design System
      </h1>
      <p class="text-lead text-olive-soft mt-3 font-sans">
        Tokens, escala tipográfica y componentes UI. Solo visible en desarrollo.
      </p>
    </header>

    <!-- Colors -->
    <section>
      <h2 class="text-h3 text-olive mb-6 font-serif font-semibold">Colores</h2>
      <div class="grid grid-cols-5 gap-4">
        {
          colors.map(({ name, hex, label }) => (
            <div>
              <div
                class="border-line mb-2 h-14 rounded-md border"
                style={`background-color: ${hex}`}
              />
              <p class="text-caption text-olive font-sans font-bold">{label}</p>
              <p class="text-caption text-olive-faint font-mono font-sans">
                {hex}
              </p>
              <p class="text-caption text-olive-faint font-mono font-sans">
                bg-{name}
              </p>
            </div>
          ))
        }
      </div>
    </section>

    <!-- Typography -->
    <section>
      <h2 class="text-h3 text-olive mb-6 font-serif font-semibold">
        Tipografía
      </h2>
      <div class="divide-line flex flex-col divide-y">
        {
          typeScale.map(({ label, cls, sample }) => (
            <div class="flex items-baseline gap-6 py-4">
              <span class="text-caption text-olive-faint w-20 shrink-0 font-sans">
                {label}
              </span>
              <p class={`${cls} text-olive m-0`}>{sample}</p>
            </div>
          ))
        }
      </div>
    </section>

    <!-- Radii -->
    <section>
      <h2 class="text-h3 text-olive mb-6 font-serif font-semibold">Radii</h2>
      <div class="flex flex-wrap items-end gap-8">
        {
          [
            { label: "sm (4px)", cls: "rounded-sm" },
            { label: "md (8px)", cls: "rounded-md" },
            { label: "lg (14px)", cls: "rounded-lg" },
            { label: "xl (22px)", cls: "rounded-xl" },
            { label: "pill (999px)", cls: "rounded-pill" },
          ].map(({ label, cls }) => (
            <div class="flex flex-col items-center gap-2">
              <div class={`bg-gold h-16 w-16 ${cls}`} />
              <span class="text-caption text-olive-faint text-center font-sans">
                {label}
              </span>
            </div>
          ))
        }
      </div>
    </section>

    <!-- Shadows -->
    <section>
      <h2 class="text-h3 text-olive mb-6 font-serif font-semibold">Sombras</h2>
      <div class="flex flex-wrap items-end gap-10">
        {
          [
            { label: "xs", cls: "shadow-xs" },
            { label: "sm", cls: "shadow-sm" },
            { label: "md", cls: "shadow-md" },
            { label: "lg", cls: "shadow-lg" },
            { label: "gold", cls: "shadow-gold" },
          ].map(({ label, cls }) => (
            <div class="flex flex-col items-center gap-3">
              <div class={`bg-cream-card h-20 w-20 rounded-lg ${cls}`} />
              <span class="text-caption text-olive-faint font-sans">
                {label}
              </span>
            </div>
          ))
        }
      </div>
    </section>

    <!-- Button -->
    <section>
      <h2 class="text-h3 text-olive mb-6 font-serif font-semibold">Button</h2>
      <div class="flex flex-col gap-5">
        <div class="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="warm">Warm</Button>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <Button href="#" target="_blank" rel="noopener">Link Button</Button>
          <Button disabled>Disabled</Button>
          <Button class="w-64">Width override</Button>
        </div>
      </div>
    </section>

    <!-- Badge -->
    <section>
      <h2 class="text-h3 text-olive mb-6 font-serif font-semibold">Badge</h2>
      <div class="flex flex-wrap items-center gap-3">
        <Badge>GOLD</Badge>
        <Badge tone="olive">OLIVE</Badge>
        <Badge tone="lavender">LAVENDER</Badge>
        <Badge tone="rose">ROSE</Badge>
        <Badge tone="neutral">NEUTRAL</Badge>
        <Badge size="sm">SMALL GOLD</Badge>
        <Badge tone="lavender" size="sm">SMALL LAVENDER</Badge>
      </div>
    </section>

    <!-- Card -->
    <section>
      <h2 class="text-h3 text-olive mb-6 font-serif font-semibold">Card</h2>
      <div class="grid grid-cols-3 gap-6">
        <Card padding="md">
          <Badge class="mb-3">TENDENCIAS</Badge>
          <h3
            class="text-h3 text-olive mt-0 font-serif leading-snug font-semibold"
          >
            Título editorial del artículo
          </h3>
          <p class="text-small text-olive-soft mt-2 font-sans leading-relaxed">
            Hover para ver el efecto de elevación.
          </p>
        </Card>
        <Card padding="md">
          <Badge tone="lavender" class="mb-3">ESTILO</Badge>
          <h3
            class="text-h3 text-olive mt-0 font-serif leading-snug font-semibold"
          >
            Segunda card editorial
          </h3>
          <p class="text-small text-olive-soft mt-2 font-sans leading-relaxed">
            Misma card, distinto tono de badge.
          </p>
        </Card>
        <Card padding="md" hover={false}>
          <Badge tone="neutral" class="mb-3">SIN HOVER</Badge>
          <h3
            class="text-h3 text-olive mt-0 font-serif leading-snug font-semibold"
          >
            Card estática
          </h3>
          <p class="text-small text-olive-soft mt-2 font-sans leading-relaxed">
            Con hover={false} no hay elevación.
          </p>
        </Card>
      </div>
    </section>

    <!-- Form Controls -->
    <section>
      <h2 class="text-h3 text-olive mb-6 font-serif font-semibold">
        Formularios
      </h2>
      <div class="grid grid-cols-2 gap-10">
        <div class="flex flex-col gap-5">
          <Input label="Nombre" placeholder="Tu nombre" />
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            required
          />
          <Input
            label="Con hint"
            hint="Ayuda contextual debajo del campo"
            placeholder="Escribe aquí"
          />
          <Input disabled placeholder="Campo deshabilitado" />
        </div>
        <div class="flex flex-col justify-center gap-4">
          <Checkbox label="Acepto los términos y condiciones" name="terms" />
          <Checkbox
            label="Recibir novedades por email"
            name="newsletter"
            checked
          />
          <Checkbox label="Opción deshabilitada" disabled />
        </div>
      </div>
    </section>
  </main>
</BaseLayout>
```

- [ ] **Revert** `src/pages/index.astro` to clean state:

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
---

<BaseLayout title="Esencia Magnética">
  <main
    style="max-width: var(--container); margin: 0 auto; padding: 4rem var(--gutter)"
  >
    <h1 class="text-h1 text-olive font-serif leading-tight font-semibold">
      El estilo no tiene edad. Tiene esencia.
    </h1>
  </main>
</BaseLayout>
```

- [ ] Start dev server. Verify:
  - `http://localhost:4321/styleguide` → full styleguide renders
  - `http://localhost:4321` → only the clean headline
  - Styleguide sections: colors, type scale, radii, shadows, all 5 components

- [ ] Verify the PROD redirect. Run:

```bash
pnpm run build && pnpm run preview
```

Open `http://localhost:4321/styleguide` in preview mode → should redirect to `/`.

- [ ] Run typecheck:

```bash
pnpm run typecheck
```

- [ ] Commit:

```bash
git add src/pages/styleguide.astro src/pages/index.astro
git commit -m "feat: add dev-only styleguide page with full token and component QA"
```

---

## Task 10 — DESIGN-SYSTEM.md

**Files:**

- Create: `docs/DESIGN-SYSTEM.md`

- [ ] **Create** `docs/DESIGN-SYSTEM.md`:

````markdown
# Esencia Magnética — Design System

Token reference and component API.
Live preview: run `pnpm run dev` → `http://localhost:4321/styleguide`

---

## Tokens

All tokens are defined in `src/styles/global.css` inside `@theme`.
They are available as Tailwind utilities AND as CSS custom properties via `var()`.

### Colors

| Tailwind utility                  | CSS variable          | Hex       | Use                             |
| --------------------------------- | --------------------- | --------- | ------------------------------- |
| `bg-cream` / `text-cream`         | `--color-cream`       | `#F5F0EB` | Page background                 |
| `bg-gold` / `text-gold`           | `--color-gold`        | `#C4973A` | Primary accent, CTAs, kickers   |
| `bg-olive` / `text-olive`         | `--color-olive`       | `#3E3D2F` | Primary text, dark sections     |
| `bg-lavender` / `text-lavender`   | `--color-lavender`    | `#EDE6F2` | Soft section bands              |
| `bg-rose-nude` / `text-rose-nude` | `--color-rose-nude`   | `#E8C9BC` | Warm accent, product highlights |
| `text-olive-soft`                 | `--color-olive-soft`  | `#6E6C58` | Secondary text                  |
| `text-olive-faint`                | `--color-olive-faint` | `#9A9784` | Captions, meta                  |
| `bg-cream-card`                   | `--color-cream-card`  | `#FFFFFF` | Card surfaces                   |
| `bg-cream-deep`                   | `--color-cream-deep`  | `#ECE3D8` | Hover fills, muted surfaces     |
| `bg-gold-deep` / `text-gold-deep` | `--color-gold-deep`   | `#A87C28` | Gold hover/press state          |
| `border-line`                     | `--color-line`        | `#E3DACE` | Hairline borders                |
| `border-line-strong`              | `--color-line-strong` | `#CFC3B2` | Stronger borders                |
| `text-danger`                     | `--color-danger`      | `#B0573F` | Error states                    |
| `text-success`                    | `--color-success`     | `#5C7A4A` | Success states                  |

### Typography

| Utility         | Size                         | Use                          |
| --------------- | ---------------------------- | ---------------------------- |
| `text-display`  | `clamp(3rem, 6vw, 5rem)`     | Hero headlines               |
| `text-h1`       | `clamp(2.4rem, 4vw, 3.5rem)` | Page titles                  |
| `text-h2`       | `clamp(1.9rem, 3vw, 2.6rem)` | Section titles               |
| `text-h3`       | `1.6rem`                     | Subsection titles            |
| `text-h4`       | `1.3rem`                     | Card titles                  |
| `text-lead`     | `1.25rem`                    | Intro paragraphs             |
| `text-body`     | `1.0625rem`                  | Body copy (default)          |
| `text-small`    | `0.9375rem`                  | Metadata, captions           |
| `text-caption`  | `0.8125rem`                  | Timestamps, details          |
| `text-overline` | `0.75rem`                    | Category kickers (UPPERCASE) |

Font families: `font-serif` (Cormorant Garamond) · `font-sans` (Lato) · `font-script` (Great Vibes — decorative only, never body copy).

### Radii

| Utility        | Value | Use                        |
| -------------- | ----- | -------------------------- |
| `rounded-sm`   | 4px   | Checkboxes, small elements |
| `rounded-md`   | 8px   | Inputs, small cards        |
| `rounded-lg`   | 14px  | Cards, modals              |
| `rounded-xl`   | 22px  | Large cards                |
| `rounded-pill` | 999px | Buttons, badges, tags      |

### Shadows

| Utility       | Use                 |
| ------------- | ------------------- |
| `shadow-xs`   | Subtle lift         |
| `shadow-sm`   | Small cards at rest |
| `shadow-md`   | Cards on hover      |
| `shadow-lg`   | Modals, dropdowns   |
| `shadow-gold` | Primary CTA button  |

---

## Components

All components live in `src/components/ui/`. They accept a `class` prop
merged via `cn()` (clsx + tailwind-merge) so you can extend or override
any variant class without specificity fights.

### Button

```astro
import Button from '@/components/ui/Button.astro'

<!-- Default: primary gold, medium size -->
<Button>Ver el look</Button>

<!-- With variant and size -->
<Button variant="secondary" size="lg">Descubrir más</Button>

<!-- As link (renders <a>) -->
<Button href="/productos" variant="ghost">Ver productos</Button>

<!-- External affiliate link -->
<Button
  href="https://amazon.es/..."
  target="_blank"
  rel="sponsored nofollow noopener"
>
  Comprar en Amazon
</Button>

<!-- Class override -->
<Button class="w-full">Botón ancho completo</Button>
```
````

| Prop       | Values                                     | Default   | Notes                               |
| ---------- | ------------------------------------------ | --------- | ----------------------------------- |
| `variant`  | `primary` · `secondary` · `ghost` · `warm` | `primary` |                                     |
| `size`     | `sm` · `md` · `lg`                         | `md`      |                                     |
| `href`     | string                                     | —         | Renders `<a>` instead of `<button>` |
| `target`   | string                                     | —         | Only relevant with `href`           |
| `rel`      | string                                     | —         | Only relevant with `href`           |
| `disabled` | boolean                                    | `false`   | Only applies to `<button>`          |
| `type`     | `button` · `submit` · `reset`              | `button`  | Only applies to `<button>`          |
| `class`    | string                                     | —         | Merged via `cn()`                   |

### Badge

```astro
import Badge from '@/components/ui/Badge.astro'

<Badge>TENDENCIAS</Badge>
<Badge tone="lavender" size="sm">ESTILO</Badge>
```

| Prop    | Values                                             | Default |
| ------- | -------------------------------------------------- | ------- |
| `tone`  | `gold` · `olive` · `lavender` · `rose` · `neutral` | `gold`  |
| `size`  | `sm` · `md`                                        | `md`    |
| `class` | string                                             | —       |

### Card

```astro
import Card from '@/components/ui/Card.astro'

<!-- Default: hover lift, no padding (add your own via slot content or class) -->
<Card>
  <img src="..." alt="..." />
  <div class="p-5">...</div>
</Card>

<!-- With built-in padding -->
<Card padding="md">
  <p>Contenido con padding uniforme</p>
</Card>

<!-- Static card (no hover effect) -->
<Card hover={false} padding="lg">
  <p>Sin elevación</p>
</Card>
```

| Prop      | Values                      | Default |
| --------- | --------------------------- | ------- |
| `hover`   | `true` · `false`            | `true`  |
| `padding` | `none` · `sm` · `md` · `lg` | `none`  |
| `class`   | string                      | —       |

### Input

```astro
import Input from '@/components/ui/Input.astro'

<Input label="Nombre" placeholder="Tu nombre" />
<Input label="Email" type="email" required />
<Input label="Mensaje" hint="Máximo 500 caracteres" />
```

| Prop          | Type    | Default                    |
| ------------- | ------- | -------------------------- |
| `label`       | string  | —                          |
| `hint`        | string  | —                          |
| `id`          | string  | Auto-generated from `name` |
| `name`        | string  | —                          |
| `type`        | string  | `text`                     |
| `placeholder` | string  | —                          |
| `required`    | boolean | `false`                    |
| `disabled`    | boolean | `false`                    |
| `value`       | string  | —                          |
| `class`       | string  | —                          |

### Checkbox

```astro
import Checkbox from '@/components/ui/Checkbox.astro'

<Checkbox label="Acepto los términos" name="terms" />
<Checkbox label="Recibir novedades" name="newsletter" checked />
```

| Prop       | Type    | Default                              |
| ---------- | ------- | ------------------------------------ |
| `label`    | string  | —                                    |
| `id`       | string  | Auto-generated from `name` + `value` |
| `name`     | string  | —                                    |
| `value`    | string  | —                                    |
| `checked`  | boolean | `false`                              |
| `required` | boolean | `false`                              |
| `disabled` | boolean | `false`                              |
| `class`    | string  | —                                    |

---

## Rules

1. **No hardcoded hex values.** Use Tailwind utilities (`bg-gold`) or CSS variables (`var(--color-gold)`).
2. **Class extension via `class` prop.** Every component accepts a `class` prop processed through `cn()`. Use it to extend or override — never duplicate a component just to add a class.
3. **Affiliate / external links.** Use `rel="sponsored nofollow noopener"` on Button's `href` prop for affiliate links.
4. **No prices.** Products are affiliate links. Never show prices in components.
5. **Script font.** `font-script` (Great Vibes) is for the brand wordmark and decorative accents only. Never use it for headings, body text, or UI labels.

````

- [ ] Final quality check — run everything:

```bash
pnpm run typecheck && pnpm run lint && pnpm run build
````

Expected: all three pass with zero errors.

- [ ] Commit:

```bash
git add docs/DESIGN-SYSTEM.md
git commit -m "docs: add DESIGN-SYSTEM.md token reference and component API"
```

---

## Self-review

**Spec coverage:**

- [x] Token layer in Tailwind v4 `@theme` → Task 3
- [x] @fontsource self-hosted fonts (Cormorant, Lato, Great Vibes) → Task 3
- [x] `cn()` upgraded to clsx + tailwind-merge → Task 2
- [x] Button (4 variants × 3 sizes, `<a>` / `<button>`) → Task 4
- [x] Badge (5 tones × 2 sizes) → Task 5
- [x] Card (hover + 4 padding variants) → Task 6
- [x] Input (label, hint, CSS focus ring, required) → Task 7
- [x] Checkbox (gold accent, label, disabled) → Task 8
- [x] `/styleguide` dev-only page with all sections → Task 9
- [x] PROD redirect on styleguide → Task 9
- [x] `docs/DESIGN-SYSTEM.md` → Task 10
- [x] Final `lint + typecheck + build` gate → Task 10

**Placeholder scan:** No TBDs. All code blocks show complete, runnable content.

**Type consistency:** `ButtonVariants`, `BadgeVariants`, `CardVariants` use `VariantProps<typeof button/badge/card>` consistently. `cn(...inputs: ClassValue[])` signature used identically in utils.ts and across all components. `inputId` derivation logic identical in Input and Checkbox.
