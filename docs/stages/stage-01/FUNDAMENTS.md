# Stage 01 — Project Setup & Foundations 🔴

> Part of the [Esencia Magnética Implementation Plan](../../PLAN.md).

**Goal:** A running Astro + TypeScript + Tailwind + shadcn project with linting, formatting, and CI, committed to the existing repo.

## Tasks
1. Initialize Astro project (`pnpm create astro@latest`) with the TypeScript (strict) template inside the existing `esencia-magnetica` repo.
2. Add and configure Tailwind CSS via the official Astro integration.
3. Install and configure shadcn/ui for Astro (React island setup: `@astrojs/react`, `tailwindcss-animate`, `components.json`).
4. Set up project structure: `src/components`, `src/layouts`, `src/pages`, `src/lib`, `src/styles`, `src/content` or `src/sanity`.
5. Configure path aliases (`@/*`) in `tsconfig.json` and `astro.config.mjs`.
6. Add tooling: ESLint, Prettier (with `prettier-plugin-astro` + `prettier-plugin-tailwindcss`), `.editorconfig`, and `.nvmrc`.
7. Add pnpm scripts: `dev`, `build`, `preview`, `lint`, `format`, `typecheck`.
8. Set up environment variable handling (`.env`, `.env.example`) and document required keys.
9. Configure GitHub Actions CI: install, typecheck, lint, build on every PR.
10. Write/extend `README.md` with local setup and run instructions.

## Deliverables
Working `pnpm run dev`, green CI, committed scaffold.

## Definition of Done
A fresh clone builds and runs with documented steps; CI passes on `main`.
