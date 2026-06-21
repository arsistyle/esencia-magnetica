---
paths:
  - 'src/**/*.{ts,tsx,astro}'
---

# No text icons — use SVG components

## Principle

**No visual icon may be a text character.** Visual indicators (arrows, checkmarks, crosses, dots, stars, etc.) are always implemented with **Lucide** SVG icon components.

Using unicode characters or emoji as icons is fragile: it doesn't scale, doesn't accept `className`, can't be sized with `h-4 w-4`, isn't accessible, and produces visual inconsistencies across operating systems and fonts.

---

## How to use Lucide in this stack

- **React islands (`.tsx`)** — shadcn/ui ships with `lucide-react`. Import the icon component directly.
- **`.astro` components** — use the Astro Lucide integration (`@lucide/astro`) or inline the SVG. Do not paste a unicode glyph.

Always give icons an explicit size (`h-4 w-4`) and, for status icons, a semantic color token from the project design system — no hardcoded hex (see CLAUDE.md / docs/DESIGN-SYSTEM.md).

---

## What NOT to do

```tsx
// ❌ Unicode characters as icons
<span>→ destino</span>
<p>✓ disponible</p>
<p>✗ agotado</p>
<span>• activo</span>
<span>★ destacado</span>

// ❌ Emoji as UI icons
<button>🔍 Buscar</button>
<span>⚠️ Error</span>
```

---

## What TO do

```tsx
// React island
import { ArrowRight, Check, X, Search } from 'lucide-react'

<ArrowRight className="h-4 w-4 shrink-0" />
<Check className="h-4 w-4 text-primary" />
<button><Search className="h-4 w-4" /> {t('search.label')}</button>
```

```astro
---
// .astro component
import { ChevronRight } from '@lucide/astro'
---
<ChevronRight class="h-4 w-4 shrink-0" />
```

---

## Common icon reference

| Use case                 | Lucide to use                 |
| ------------------------ | ----------------------------- |
| Next / navigate          | `ArrowRight`, `ChevronRight`  |
| Up / down                | `ArrowUp`, `ArrowDown`        |
| Success / available      | `Check`, `CheckCircle`        |
| Error / unavailable      | `X`, `XCircle`                |
| Warning                  | `AlertTriangle`               |
| Information              | `Info`                        |
| Status dot / active      | `Circle` (fill via CSS)       |
| Star rating              | `Star`                        |
| External / affiliate link | `ExternalLink`               |
| Search                   | `Search`                      |
| Filter                   | `Filter`, `SlidersHorizontal` |
| Menu (mobile nav)        | `Menu`                        |
| Close                    | `X`                           |
| YouTube / play           | `Youtube`, `Play`             |
| Social: Facebook         | `Facebook`                    |

---

## Exceptions

- **Sanity / API content:** if content from Sanity contains a special character as part of the data (a category label, a brand description with `•`), it is rendered as-is — the source is not controlled here.
- **Text separators:** using `·` or `/` as a separator between text values is acceptable (`Tendencias · Estilo`), as long as it doesn't act as a visual status icon.
- **Rendered rich text / Portable Text** from Sanity: characters that come inside it are not the component's responsibility.
