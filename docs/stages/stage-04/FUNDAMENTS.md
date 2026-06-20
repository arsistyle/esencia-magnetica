# Stage 04 — Core Layout, Navigation & i18n 🔴

> Part of the [Esencia Magnética Implementation Plan](../../PLAN.md).

**Goal:** Shared layout, navbar/footer, and the ES/EN routing/i18n framework that every page builds on.

## Tasks
1. Configure Astro i18n routing: ES default (no prefix), EN under `/en/` per `PROJECT.md` route map.
2. Build a translation/strings system for UI copy (no hardcoded text in components); source labels from `siteSettings` where appropriate.
3. Implement the base `Layout.astro`: `<head>` (meta, fonts, favicon), skip-link, main, footer.
4. Build the Navbar: HOME · BLOG · PRODUCTOS · MARCA + ES/EN language switcher (preserves current route where possible).
5. Build the Footer: brand, social links (YouTube, Facebook), affiliate disclosure, copyright.
6. Implement the Sanity client/data layer (`src/lib/sanity.ts`) with typed GROQ query helpers and locale awareness.
7. Add a global error/404 page on-brand.
8. Set responsive breakpoints and verify mobile nav behavior.

## Deliverables
Layout, navbar, footer, i18n wiring, Sanity data layer.

## Definition of Done
Both `/` and `/en` render the shared shell; language switcher works; all visible strings are translatable.
