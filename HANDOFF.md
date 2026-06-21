# HANDOFF — Esencia Magnética

**Fecha:** 2026-06-21  
**Estado actual:** Stage 01 completado ✅ · Próximo: Stage 02

---

## Dónde estamos

Stage 01 (Project Setup & Foundations) terminado y pusheado a `origin/main`.

**Stack instalado:** Astro v6.4.8 · TypeScript strict · Tailwind v4 (vía `@tailwindcss/vite`) · ESLint v9 flat config · Prettier · Vitest 4.1.9 · Husky 9.1.7 + lint-staged.

**Sin shadcn/ui todavía** — se añade solo cuando haya componentes complejos (YAGNI).

---

## Decisiones clave ya tomadas

- `cn()` en `src/lib/utils.ts`: firma básica `(string | undefined | null | false)[]`. Reemplazar con `clsx + tailwind-merge` si se añade shadcn/cva.
- Husky en lugar de GitHub Actions por ahora; GA en Stage 12.
- TDD enforced via regla en CLAUDE.md — invocar `superpowers:test-driven-development` antes de cualquier implementación.
- Path alias `@/*` → `src/`.

---

## Próximo paso: Stage 02 — Design System & Theme Tokens

Leer [`docs/stages/stage-02/FUNDAMENTS.md`](docs/stages/stage-02/FUNDAMENTS.md) antes de tocar código.

**Tokens de diseño ya definidos en CLAUDE.md:**

| Token         | Valor     | Uso         |
| ------------- | --------- | ----------- |
| Warm Cream    | `#F5F0EB` | background  |
| Aged Gold     | `#C4973A` | primary     |
| Dark Olive    | `#3E3D2F` | text        |
| Pale Lavender | `#EDE6F2` | accent-soft |
| Rose Nude     | `#E8C9BC` | accent-warm |

Fuentes: Cormorant Garamond (headings serif) · Lato (body sans) · Great Vibes (script decorativo).

**Regla:** usar CSS variables / tokens — sin hex hardcodeados en componentes.

---

## Comandos habituales

```bash
pnpm run dev         # servidor local
pnpm run lint        # ESLint
pnpm run typecheck   # tsc
pnpm run test        # Vitest
pnpm run build       # build estático
```

---

## Archivos clave

- `docs/PLAN.md` — 12 stages, orden de dependencias
- `docs/stages/stage-02/FUNDAMENTS.md` — detalle del próximo stage
- `src/lib/utils.ts` — utilidad `cn()`
- `src/layouts/BaseLayout.astro` — layout base
- `CLAUDE.md` — convenciones del repo (leer siempre)
