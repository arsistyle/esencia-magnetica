# Stage 01 — Project Setup & Foundations: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a working Astro + TypeScript strict + Tailwind v4 project with ESLint v9, Prettier, Vitest, and Husky git hooks into the existing repo.

**Architecture:** Astro static site with Tailwind v4 via `@tailwindcss/vite` (no `tailwind.config.js` needed — config is CSS-first). Husky replaces GitHub Actions for local validation (CI added in Stage 12). ESLint v9 flat config with Astro and a11y rules. Vitest for unit tests enforced by a TDD rule in CLAUDE.md.

**Tech Stack:** Astro (latest), TypeScript (strict), Tailwind CSS v4, ESLint v9, Prettier, Vitest, Husky + lint-staged, pnpm v11, Node v22

**Spec:** [`docs/superpowers/specs/2026-06-20-stage-01-project-setup-design.md`](../specs/2026-06-20-stage-01-project-setup-design.md)

---

## Files Overview

| File | Action | Purpose |
|---|---|---|
| `astro.config.mjs` | Create | Astro config: Tailwind v4 vite plugin + `@/*` alias |
| `tsconfig.json` | Create | TypeScript strict + `@/*` path alias |
| `src/styles/global.css` | Create | `@import "tailwindcss"` — Tailwind entry point |
| `src/layouts/BaseLayout.astro` | Create | Base HTML shell (imports global.css) |
| `src/pages/index.astro` | Create | Minimal home page using BaseLayout |
| `src/lib/utils.ts` | Create | `cn()` class name utility |
| `src/lib/utils.test.ts` | Create | Vitest unit tests for utils.ts |
| `src/components/.gitkeep` | Create | Preserve empty components directory |
| `src/content/.gitkeep` | Create | Preserve empty content directory |
| `eslint.config.mjs` | Create | ESLint v9 flat config |
| `.prettierrc` | Create | Prettier + astro + tailwind plugins |
| `.prettierignore` | Create | Ignore dist/, .astro/ |
| `vitest.config.ts` | Create | Vitest config |
| `.husky/pre-commit` | Create | Runs lint-staged |
| `.husky/pre-push` | Create | Runs typecheck + test |
| `.nvmrc` | Create | Node version: `22` |
| `.editorconfig` | Create | Editor settings |
| `.env` | Create | Local secrets (gitignored) |
| `.env.example` | Create | Documented required keys |
| `README.md` | Create | Setup instructions |
| `package.json` | Modify | Scripts + lint-staged config + prepare |
| `CLAUDE.md` | Modify | TDD workflow rule |

---

### Task 1: Scaffold Astro in a temp directory and merge to repo

**Files:**
- Create: `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro`, `public/favicon.svg`, `.gitignore`, `package.json`
- Create: `src/components/.gitkeep`, `src/content/.gitkeep`

- [ ] **Step 1.1: Create Astro scaffold in temp directory**

Run in PowerShell:
```powershell
pnpm create astro@latest "$env:USERPROFILE\astro-scaffold" --template minimal --no-install --no-git --typescript strict --yes
```

Expected output ends with something like:
```
 next   Liftoff confirmed. Explore your project!
```

- [ ] **Step 1.2: Merge scaffold into repo (excluding .git)**

```powershell
Get-ChildItem "$env:USERPROFILE\astro-scaffold" -Force |
  Where-Object { $_.Name -ne '.git' } |
  ForEach-Object { Copy-Item $_.FullName "E:\esencia-magnetica\" -Recurse -Force }
```

Expected: files copied without errors. `docs/`, `.claude/`, `CLAUDE.md` are preserved (they don't exist in the scaffold).

- [ ] **Step 1.3: Clean up temp directory**

```powershell
Remove-Item "$env:USERPROFILE\astro-scaffold" -Recurse -Force
```

- [ ] **Step 1.4: Create empty src/ directories (git doesn't track empty dirs)**

```powershell
New-Item -ItemType Directory -Force "E:\esencia-magnetica\src\components"
New-Item -ItemType Directory -Force "E:\esencia-magnetica\src\content"
New-Item -ItemType Directory -Force "E:\esencia-magnetica\src\lib"
"" | Out-File "E:\esencia-magnetica\src\components\.gitkeep" -Encoding utf8
"" | Out-File "E:\esencia-magnetica\src\content\.gitkeep" -Encoding utf8
```

- [ ] **Step 1.5: Install base dependencies**

```powershell
pnpm install
```

Expected: `pnpm-lock.yaml` created, `node_modules/` populated.

- [ ] **Step 1.6: Verify dev server starts**

```powershell
pnpm dev
```

Open `http://localhost:4321` — minimal Astro page loads without errors. Stop server (Ctrl+C).

- [ ] **Step 1.7: Commit**

```bash
git add astro.config.mjs tsconfig.json package.json pnpm-lock.yaml src/ public/ .gitignore
git commit -m "feat: scaffold Astro minimal project"
```

---

### Task 2: Configure TypeScript strict mode and path aliases

**Files:**
- Modify: `tsconfig.json`
- Modify: `astro.config.mjs` (add Vite alias — Tailwind plugin added in Task 3)
- Modify: `package.json` (add `typecheck` script)

- [ ] **Step 2.1: Install TypeScript checker**

```powershell
pnpm add -D @astrojs/check typescript
```

`@astrojs/check` is required for `astro check` to run TypeScript diagnostics.

- [ ] **Step 2.2: Replace tsconfig.json**

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

- [ ] **Step 2.3: Replace astro.config.mjs (adds Vite alias only — Tailwind added in Task 3)**

```js
// astro.config.mjs
import { defineConfig } from 'astro/config'
import path from 'path'

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
  },
})
```

- [ ] **Step 2.4: Add typecheck script to package.json**

In `package.json`, add to `scripts`:
```json
"typecheck": "astro check"
```

- [ ] **Step 2.5: Run typecheck to verify**

```powershell
pnpm typecheck
```

Expected: `0 errors, 0 warnings`. If Astro prompts to install `@astrojs/check`, cancel — it was already installed in Step 2.1.

- [ ] **Step 2.6: Commit**

```bash
git add tsconfig.json astro.config.mjs package.json pnpm-lock.yaml
git commit -m "feat: configure TypeScript strict mode and @/* path alias"
```

---

### Task 3: Configure Tailwind v4 and create base layout

**Files:**
- Modify: `astro.config.mjs`
- Create: `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 3.1: Install Tailwind v4**

```powershell
pnpm add -D tailwindcss @tailwindcss/vite
```

Tailwind v4 uses a Vite plugin instead of PostCSS. No `tailwind.config.js` is needed.

- [ ] **Step 3.2: Update astro.config.mjs to add Tailwind plugin**

```js
// astro.config.mjs
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
  },
})
```

- [ ] **Step 3.3: Create src/styles/global.css**

```css
@import "tailwindcss";
```

This single line replaces the old `@tailwind base/components/utilities` directives.

- [ ] **Step 3.4: Create src/layouts/BaseLayout.astro**

```astro
---
import '@/styles/global.css'

interface Props {
  title: string
  description?: string
}

const {
  title,
  description = 'Esencia Magnética — moda y estilo para mujeres 40+',
} = Astro.props
---

<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <title>{title}</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 3.5: Replace src/pages/index.astro**

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro'
---

<BaseLayout title="Esencia Magnética">
  <main class="min-h-screen flex items-center justify-center">
    <h1 class="text-4xl font-bold">Esencia Magnética</h1>
  </main>
</BaseLayout>
```

- [ ] **Step 3.6: Verify Tailwind renders in dev**

```powershell
pnpm dev
```

Open `http://localhost:4321`. The heading should be bold, large, and centered. Inspect the element — Tailwind utility classes should produce visible styles. Stop server (Ctrl+C).

- [ ] **Step 3.7: Run typecheck to confirm no regressions**

```powershell
pnpm typecheck
```

Expected: `0 errors, 0 warnings`.

- [ ] **Step 3.8: Commit**

```bash
git add astro.config.mjs src/styles/ src/layouts/ src/pages/index.astro package.json pnpm-lock.yaml
git commit -m "feat: configure Tailwind v4 and add base layout"
```

---

### Task 4: Configure ESLint v9

**Files:**
- Create: `eslint.config.mjs`
- Modify: `package.json` (add lint scripts)

- [ ] **Step 4.1: Install ESLint packages**

```powershell
pnpm add -D eslint @eslint/js typescript-eslint eslint-plugin-astro eslint-plugin-jsx-a11y
```

- [ ] **Step 4.2: Create eslint.config.mjs**

```js
// eslint.config.mjs
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import astro from 'eslint-plugin-astro'
import jsxA11y from 'eslint-plugin-jsx-a11y'

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    plugins: { 'jsx-a11y': jsxA11y },
    rules: jsxA11y.configs.recommended.rules,
  },
  {
    ignores: ['dist/', '.astro/', 'node_modules/'],
  },
]
```

- [ ] **Step 4.3: Add lint scripts to package.json**

In `scripts`:
```json
"lint": "eslint .",
"lint:fix": "eslint . --fix",
"lint:ci": "eslint . --max-warnings 0"
```

- [ ] **Step 4.4: Run lint and fix any auto-fixable issues**

```powershell
pnpm lint:fix
```

Then verify clean:
```powershell
pnpm lint
```

Expected: no errors. Warnings are acceptable at this stage.

- [ ] **Step 4.5: Commit**

```bash
git add eslint.config.mjs package.json pnpm-lock.yaml
git commit -m "feat: configure ESLint v9 flat config with Astro and a11y rules"
```

---

### Task 5: Configure Prettier

**Files:**
- Create: `.prettierrc`
- Create: `.prettierignore`
- Modify: `package.json` (add format script)

- [ ] **Step 5.1: Install Prettier packages**

```powershell
pnpm add -D prettier prettier-plugin-astro prettier-plugin-tailwindcss
```

- [ ] **Step 5.2: Create .prettierrc**

```json
{
  "plugins": ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  "overrides": [
    {
      "files": "*.astro",
      "options": {
        "parser": "astro"
      }
    }
  ]
}
```

- [ ] **Step 5.3: Create .prettierignore**

```
dist/
.astro/
node_modules/
pnpm-lock.yaml
```

- [ ] **Step 5.4: Add format script to package.json**

In `scripts`:
```json
"format": "prettier --write ."
```

- [ ] **Step 5.5: Run format to verify**

```powershell
pnpm format
```

Expected: files processed with no errors. Some files may be reformatted — that's correct.

- [ ] **Step 5.6: Commit any reformatted files**

```bash
git add .prettierrc .prettierignore package.json pnpm-lock.yaml src/
git commit -m "feat: configure Prettier with Astro and Tailwind plugins"
```

---

### Task 6: Create first utility and set up Vitest (TDD)

**Files:**
- Create: `vitest.config.ts`
- Create: `src/lib/utils.test.ts` (written first — TDD)
- Create: `src/lib/utils.ts` (written after test)
- Modify: `package.json` (add test scripts)

- [ ] **Step 6.1: Install Vitest**

```powershell
pnpm add -D vitest @vitest/ui
```

- [ ] **Step 6.2: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
})
```

- [ ] **Step 6.3: Add test scripts to package.json**

In `scripts`:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:ui": "vitest --ui"
```

- [ ] **Step 6.4: Write the failing tests first (TDD — test before implementation)**

Create `src/lib/utils.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('joins two class names with a space', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('filters out null, undefined, and false', () => {
    expect(cn('foo', null, undefined, false, 'bar')).toBe('foo bar')
  })

  it('returns empty string when all values are falsy', () => {
    expect(cn(null, undefined, false)).toBe('')
  })
})
```

- [ ] **Step 6.5: Run tests to confirm they fail**

```powershell
pnpm test
```

Expected: `FAIL src/lib/utils.test.ts` with error `Cannot find module './utils'`. This confirms the test is wired up correctly.

- [ ] **Step 6.6: Implement utils.ts to make tests pass**

Create `src/lib/utils.ts`:

```ts
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
```

- [ ] **Step 6.7: Run tests to confirm they pass**

```powershell
pnpm test
```

Expected:
```
✓ src/lib/utils.test.ts (3 tests)
Test Files  1 passed (1)
Tests       3 passed (3)
```

- [ ] **Step 6.8: Commit**

```bash
git add vitest.config.ts src/lib/utils.ts src/lib/utils.test.ts package.json pnpm-lock.yaml
git commit -m "feat: add Vitest and cn() utility with TDD tests"
```

---

### Task 7: Set up Husky and lint-staged

**Files:**
- Create: `.husky/pre-commit`
- Create: `.husky/pre-push`
- Modify: `package.json` (prepare script + lint-staged config)

- [ ] **Step 7.1: Install Husky and lint-staged**

```powershell
pnpm add -D husky lint-staged
```

- [ ] **Step 7.2: Initialize Husky**

```powershell
pnpm exec husky init
```

Expected: `.husky/` directory created with a default `pre-commit` file and `prepare` script added to `package.json`.

- [ ] **Step 7.3: Replace .husky/pre-commit**

Overwrite the generated file with exactly:
```sh
pnpm exec lint-staged
```

- [ ] **Step 7.4: Create .husky/pre-push**

Create `.husky/pre-push` with exactly:
```sh
pnpm typecheck && pnpm test
```

- [ ] **Step 7.5: Add lint-staged config to package.json**

Add at the root level of `package.json` (same level as `"scripts"`, `"devDependencies"`, etc.):

```json
"lint-staged": {
  "*.{ts,astro}": ["eslint --fix", "prettier --write"],
  "*.{css,md,json}": ["prettier --write"]
}
```

- [ ] **Step 7.6: Verify pre-commit hook triggers**

Stage a small change and commit to test:

```bash
# Make a trivial change to trigger the hook
echo "" >> src/lib/utils.ts
git add src/lib/utils.ts
git commit -m "test: verify husky pre-commit hook"
```

Expected: lint-staged runs on `utils.ts`, reports success, and the commit completes.

- [ ] **Step 7.7: Commit Husky config**

```bash
git add .husky/ package.json pnpm-lock.yaml
git commit -m "feat: configure Husky pre-commit (lint-staged) and pre-push (typecheck + test)"
```

---

### Task 8: Configure environment files and editor settings

**Files:**
- Create: `.env`
- Create: `.env.example`
- Create: `.nvmrc`
- Create: `.editorconfig`
- Verify: `.gitignore`

- [ ] **Step 8.1: Verify .gitignore includes .env entries**

Open `.gitignore` and confirm it contains these lines (add them if missing):

```
.env
.env.*
!.env.example
```

- [ ] **Step 8.2: Create .env (local secrets, gitignored)**

```
# Local secrets — never commit this file
```

- [ ] **Step 8.3: Create .env.example**

```
# Sanity CMS (configured in Stage 03)
PUBLIC_SANITY_PROJECT_ID=
PUBLIC_SANITY_DATASET=
SANITY_API_READ_TOKEN=

# Google Analytics (configured in Stage 09)
PUBLIC_GA4_MEASUREMENT_ID=
```

`PUBLIC_` prefix = exposed to the browser (Astro convention). Variables without the prefix are server-only.

- [ ] **Step 8.4: Create .nvmrc**

```
22
```

- [ ] **Step 8.5: Create .editorconfig**

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_size = 2
indent_style = space
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

- [ ] **Step 8.6: Verify .env is gitignored**

```bash
git status
```

Expected: `.env` does NOT appear in the output. `.env.example` should appear as untracked.

- [ ] **Step 8.7: Commit (do NOT add .env)**

```bash
git add .env.example .nvmrc .editorconfig .gitignore
git commit -m "feat: add .env.example, .nvmrc, and .editorconfig"
```

---

### Task 9: Add TDD rule to CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 9.1: Add TDD section to CLAUDE.md**

Open `CLAUDE.md` and insert after the `## Conventions` section:

```markdown
## TDD

When creating any function, utility, or component, invoke the `superpowers:test-driven-development` skill before writing implementation code.
```

- [ ] **Step 9.2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add TDD workflow rule to CLAUDE.md"
```

---

### Task 10: Write README.md

**Files:**
- Modify: `README.md` (replace Astro's default content)

- [ ] **Step 10.1: Replace README.md with project documentation**

Write `README.md` with the following content (use literal backtick fences for code blocks inside):

**Header:** `# Esencia Magnética`

**Description:** "Fashion & lifestyle website for women 40–55+. Drives traffic to YouTube and monetizes through affiliate links. Built with Astro · TypeScript · Tailwind CSS v4 · Sanity CMS."

**Requirements section** with:
- Node.js v22 (use `nvm use` to switch)
- pnpm v11+

**Setup section** with these commands in a bash code block:
```bash
git clone https://github.com/arsistyle/esencia-magnetica.git
cd esencia-magnetica
cp .env.example .env
pnpm install
pnpm dev
```
Followed by: "Open `http://localhost:4321`."

**Scripts table:**

| Script | Description |
|---|---|
| `pnpm dev` | Start dev server at localhost:4321 |
| `pnpm build` | Build static output to `dist/` |
| `pnpm preview` | Preview the built output |
| `pnpm typecheck` | TypeScript type check |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Run ESLint and auto-fix |
| `pnpm format` | Format all files with Prettier |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm test:watch` | Run Vitest in watch mode |

**Environment variables table:**

| Variable | Used in | Description |
|---|---|---|
| `PUBLIC_SANITY_PROJECT_ID` | Stage 03 | Sanity project ID |
| `PUBLIC_SANITY_DATASET` | Stage 03 | Sanity dataset name |
| `SANITY_API_READ_TOKEN` | Stage 03 | Server-only read token |
| `PUBLIC_GA4_MEASUREMENT_ID` | Stage 09 | Google Analytics 4 ID |

**Project structure** as a code block:
```
src/
├── components/   Reusable Astro components
├── layouts/      Page layouts (BaseLayout.astro)
├── lib/          TypeScript utilities
├── pages/        Routes (file-based)
├── styles/       Global CSS (Tailwind entry)
└── content/      Content collections (Stage 03)
```

**Documentation links:**
- [Implementation Plan](docs/PLAN.md)
- [Project Definition](docs/PROJECT.md)
- [Brand & Audience](docs/ABOUT.md)

- [ ] **Step 10.2: Commit**

```bash
git add README.md
git commit -m "docs: write README with setup, scripts, and env vars"
```

---

### Task 11: Final verification

- [ ] **Step 11.1: Run full check suite**

```powershell
pnpm typecheck && pnpm lint:ci && pnpm test && pnpm build
```

Expected:
- `typecheck` → `0 errors, 0 warnings`
- `lint:ci` → `0 errors, 0 warnings`
- `test` → `3 passed`
- `build` → static output in `dist/` with no errors

- [ ] **Step 11.2: Verify dev server**

```powershell
pnpm dev
```

Open `http://localhost:4321` — centered bold heading loads, no console errors. Stop server (Ctrl+C).

- [ ] **Step 11.3: Verify Husky hook files exist**

```powershell
Get-ChildItem .husky/
```

Expected: `pre-commit` and `pre-push` files present.

- [ ] **Step 11.4: Verify .env is not tracked**

```bash
git status
```

Expected: `.env` does NOT appear. All other tracked files show clean.

- [ ] **Step 11.5: Push to remote**

```powershell
git push origin main
```

Expected: Husky `pre-push` hook runs `pnpm typecheck && pnpm test` before the push completes. Both pass. Remote updated.

---

## Definition of Done

- [ ] `pnpm dev` starts without errors at `http://localhost:4321`
- [ ] `pnpm build` produces static output in `dist/`
- [ ] `pnpm typecheck` → 0 errors
- [ ] `pnpm lint:ci` → 0 errors, 0 warnings
- [ ] `pnpm test` → all tests pass
- [ ] `git commit` triggers Husky pre-commit (lint-staged runs)
- [ ] `git push` triggers Husky pre-push (typecheck + test run)
- [ ] `.env` is gitignored; `.env.example` is tracked
- [ ] TDD rule present in `CLAUDE.md`
- [ ] `README.md` documents local setup
