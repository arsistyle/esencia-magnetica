# HANDOFF — Esencia Magnética

**Fecha:** 2026-06-21  
**Estado actual:** Stage 02 completado ✅ · Próximo: Stage 03

---

## Dónde estamos

Stage 01 y Stage 02 terminados y pusheados a `origin/main`.

**Stack:** Astro v6.4.8 · TypeScript strict · Tailwind v4 · ESLint v9 · Prettier · Vitest · Husky + lint-staged.

---

## Decisiones clave ya tomadas

- **Sin shadcn/ui** — componentes como `.astro` puro con CVA (`class-variance-authority`). shadcn se reserva para interactividad real futura (React islands).
- **CVA en `src/lib/ui/*.ts`**, nunca en frontmatter `.astro` — necesario para que Tailwind v4 escanee las clases correctamente.
- **`cn()` en `src/lib/utils.ts`** — `clsx` + `extendTailwindMerge` con tokens font-size del brand registrados para que `text-white` y `text-body` coexistan.
- **`leading-none` siempre después de `text-*`** en strings de CVA — tailwind-merge v3 usa composed class groups; si `leading-none` va antes de `text-{size}`, se elimina.
- Husky en lugar de GitHub Actions por ahora; GA en Stage 12.
- TDD enforced via regla en CLAUDE.md — invocar `superpowers:test-driven-development` antes de cualquier implementación.
- Path alias `@/*` → `src/`.

---

## Stage 02 — Design System (completado)

Todos los entregables listos y pasando lint/typecheck/build:

| Entregable                               | Archivo                                                                 |
| ---------------------------------------- | ----------------------------------------------------------------------- |
| Tokens Tailwind v4 (`@theme`)            | `src/styles/global.css`                                                 |
| Fuentes self-hosted (@fontsource)        | `src/styles/global.css`                                                 |
| `cn()` con tailwind-merge extendido      | `src/lib/utils.ts`                                                      |
| Button · Badge · Card · Input · Checkbox | `src/components/ui/`                                                    |
| Variantes CVA                            | `src/lib/ui/buttonVariants.ts` · `badgeVariants.ts` · `cardVariants.ts` |
| Styleguide dev-only                      | `src/pages/styleguide.astro` → `/styleguide`                            |
| Documentación                            | `docs/DESIGN-SYSTEM.md`                                                 |

**Tamaños de botón:** sm=31px · md=35px · lg=46px (altura natural; usar `items-center` en flex containers que mezclen tamaños).

---

## Próximo paso: Stage 03

Leer [`docs/stages/stage-03/FUNDAMENTS.md`](docs/stages/stage-03/FUNDAMENTS.md) antes de tocar código.

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
- `docs/DESIGN-SYSTEM.md` — tokens, componentes, uso
- `src/styles/global.css` — @theme con todos los tokens
- `src/lib/utils.ts` — `cn()` con tailwind-merge extendido
- `src/lib/ui/` — variantes CVA de los primitivos
- `src/components/ui/` — Button, Badge, Card, Input, Checkbox
- `CLAUDE.md` — convenciones del repo (leer siempre)
