# Stage 01 — Project Setup & Foundations: Design Spec

**Date:** 2026-06-20
**Status:** Approved
**Stage:** 01 of 12 — [Implementation Plan](../../PLAN.md)

---

## Goal

A running Astro + TypeScript + Tailwind v4 project with linting, formatting, local git hooks, unit testing, and a TDD workflow rule — committed to the existing repo.

---

## Stack Decisions

| Element | Decision | Rationale |
|---|---|---|
| Node | v22 LTS | Stable LTS; pinned via `.nvmrc` |
| Package manager | pnpm v11 | Already adopted project-wide |
| Astro | Latest stable | Core framework |
| TypeScript | Strict mode | Required by project conventions |
| Tailwind | v4 via `@tailwindcss/vite` | Modern CSS-first config; no `tailwind.config.js` needed |
| shadcn/ui | Deferred | Added only when complex interactive components are needed |
| React islands | Deferred | No interactive components in Stage 01 |
| ESLint | v9 flat config (`eslint.config.mjs`) | Modern default; better composability |
| CI | Husky local hooks | Solo developer; GitHub Actions added in Stage 12 |
| Tests | Vitest | Lightweight, Vite-native; integrates cleanly with Astro |

---

## Project Structure

```
esencia-magnetica/
├── src/
│   ├── components/        # Reusable Astro components
│   ├── layouts/           # Base layouts (BaseLayout.astro)
│   ├── pages/             # Astro routes (index.astro, en/index.astro)
│   ├── lib/               # TypeScript utilities and helpers
│   ├── styles/            # global.css — @import "tailwindcss"
│   └── content/           # Astro content collections (Sanity bridge in Stage 03)
├── public/                # Static assets
├── docs/                  # Project documentation (already exists)
├── .husky/
│   ├── pre-commit         # lint-staged
│   └── pre-push           # typecheck + test
├── .env.example           # Documented keys, no real values
├── .env                   # Gitignored
├── .editorconfig
├── .nvmrc                 # "22"
├── astro.config.mjs       # Tailwind v4 via vite.plugins
├── tsconfig.json          # strict: true, @/* path alias
├── eslint.config.mjs      # ESLint v9 flat config
├── .prettierrc            # prettier-plugin-astro + prettier-plugin-tailwindcss
├── vitest.config.ts       # Unit test config
└── package.json           # All scripts
```

---

## Architecture

### Tailwind v4 Integration

Tailwind v4 does not use a `tailwind.config.js`. Configuration is CSS-first.

**`astro.config.mjs`:**
```js
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
})
```

**`src/styles/global.css`:**
```css
@import "tailwindcss";
```

Custom theme tokens (Stage 02) will be added via `@theme { }` in this file.

### TypeScript Path Alias

**`tsconfig.json`:**
```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**`astro.config.mjs`** (alias for Vite resolver):
```js
import path from 'path'
// vite.resolve.alias: { '@': path.resolve('./src') }
```

### ESLint v9 Flat Config

**`eslint.config.mjs`** includes:
- `eslint-plugin-astro` — Astro-specific rules
- `@typescript-eslint/eslint-plugin` — TypeScript rules (no type-aware rules for speed)
- `eslint-plugin-jsx-a11y` — Accessibility rules from day one

### Husky Git Hooks

**`pre-commit`** → runs `lint-staged`:
- `*.{ts,astro}` → `eslint --fix` + `prettier --write`
- `*.{css,md,json}` → `prettier --write`

**`pre-push`** → runs `pnpm typecheck && pnpm test`

### Vitest

**`vitest.config.ts`:**
```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
})
```

Tests live alongside source files: `src/**/*.test.ts`.

---

## pnpm Scripts

```json
{
  "dev":         "astro dev",
  "build":       "astro build",
  "preview":     "astro preview",
  "typecheck":   "astro check",
  "lint":        "eslint .",
  "lint:fix":    "eslint . --fix",
  "format":      "prettier --write .",
  "test":        "vitest run",
  "test:watch":  "vitest",
  "test:ui":     "vitest --ui"
}
```

---

## Environment Variables

**`.env.example`:**
```
# Sanity CMS (configured in Stage 03)
PUBLIC_SANITY_PROJECT_ID=
PUBLIC_SANITY_DATASET=
SANITY_API_READ_TOKEN=

# Google Analytics (configured in Stage 09)
PUBLIC_GA4_MEASUREMENT_ID=
```

`PUBLIC_` prefix = exposed to the client (Astro convention).
Non-prefixed = server-only.

---

## CLAUDE.md Addition

The following rule is added to enforce TDD workflow:

```markdown
## TDD
When creating any function, utility, or component,
invoke the `superpowers:test-driven-development` skill before writing implementation code.
```

---

## Scaffold Strategy

`pnpm create astro@latest` requires a clean directory. Since the repo already has `docs/`, `CLAUDE.md`, and `.git/`:

1. Run `pnpm create astro@latest` in a **temporary directory** with the `strict` TypeScript template and no git init.
2. Copy scaffolded files into the repo root, preserving existing `docs/` and `.claude/`.
3. Install additional dependencies (`@tailwindcss/vite`, eslint stack, husky, vitest, etc.).
4. Configure each tool per this spec.
5. Run `pnpm dev` to verify the dev server works.
6. Commit the complete scaffold.

---

## Definition of Done

- [ ] `pnpm dev` starts the dev server without errors
- [ ] `pnpm build` produces a static output
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes with zero warnings
- [ ] `pnpm test` runs (no tests yet, but Vitest executes)
- [ ] `git commit` triggers Husky pre-commit (lint-staged)
- [ ] `git push` triggers Husky pre-push (typecheck + test)
- [ ] `README.md` documents local setup steps
- [ ] `.env.example` lists all required keys
- [ ] TDD rule present in `CLAUDE.md`
