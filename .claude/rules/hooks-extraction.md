---
paths:
  - 'src/**/*.{ts,tsx}'
---

# Custom hook extraction (React islands)

## Principle

State and effect logic that is self-contained or reusable **does not live inline in the component** — it is extracted to a `use<Name>.ts` hook. A component should read as a composition of JSX + imported hooks + imported utils, not as a block of 30 `useState`/`useEffect` calls mixed with the render.

> **Astro scope:** hooks are a React concept and apply **only inside islands** (`.tsx`). `.astro` components have no hooks — for them, the relevant rules are `utils-organization` (frontmatter logic) and `atomic-design` (markup decomposition). This rule applies to interactive shadcn/React islands only.

---

## When to extract a hook

Extract when **at least one** of these holds:

- The block of state logic uses **3 or more** React hook calls (`useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`…) and forms its own conceptual unit.
- The same logic is needed in **2 or more** components.
- The block exceeds **~20 lines** and can be described with its own name (`useProductFilters`, `useLanguageSwitcher`, `useMediaQuery`).
- It manages an effect with cleanup (`addEventListener` + `removeEventListener`, observers, timers).

**Do not extract** if:

- The logic is a single `useState` with its setter — it doesn't justify a new file.
- It depends directly on JSX props and the resulting hook would be a single-use wrapper with no real abstraction.
- The logic block is < 10 lines and is not reused.

---

## Where each hook lives

| Scope                                       | Destination                              |
| ------------------------------------------- | ---------------------------------------- |
| Used in 2+ domains or cross-cutting         | `src/hooks/use<Name>.ts`                 |
| Only makes sense within one domain          | `src/components/<domain>/hooks/use<Name>.ts` |

Promotion rule: born in the domain; if needed elsewhere, promoted to `src/hooks/`.

---

## Naming and structure conventions

```
src/components/<domain>/hooks/
└── use<Name>.ts    # one hook per file, camelCase with the use prefix

src/hooks/
└── use<Name>.ts    # cross-cutting hooks
```

- Name: `use` + descriptive domain PascalCase → `useProductFilters`, `useLanguageSwitcher`, `useMediaQuery`.
- One file per hook. Do not group unrelated hooks in a single file.
- No `index.ts` barrel; import directly from the file via the `@/` alias.

---

## Example

```tsx
// ❌ Media-query logic inline in a filter island (20+ lines of hooks)
function ProductFilters() {
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)')
    const onChange = () => setIsDesktop(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  // ... more logic
}

// ✅ Extracted to src/hooks/useMediaQuery.ts
import { useMediaQuery } from '@/hooks/useMediaQuery'

function ProductFilters() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  // component stays clean
}
```

---

## Hook tests

Hooks with non-trivial logic must have tests in a co-located `use<Name>.test.ts` (vitest: `pnpm run test`).

- For hooks with pure logic (transformations, calculations, no effects): test directly.
- For hooks with DOM effects: use `@testing-library/react` with `renderHook`.
- Do not test hooks that are thin wrappers over a single call.
