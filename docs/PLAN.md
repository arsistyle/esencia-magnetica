# Esencia Magnética — Implementation Plan

This document breaks the build into sequential stages. Each stage links to its own `FUNDAMENTS.md` under [`docs/stages/`](./stages/), which holds the full detail (goal, tasks, deliverables, and Definition of Done). Stages are ordered by dependency: each one assumes the previous is complete, though Sanity schema work (Stage 03) and frontend layout (Stage 04) can overlap once the project scaffold exists.

The target for v1 is the scope defined in `PROJECT.md`: a static Astro site, Sanity-driven content, shadcn/ui components, ES/EN i18n, affiliate monetization, and YouTube + Facebook Comments + GA4 integrations. No ecommerce, accounts, or newsletter in v1.

**Legend:** 🔴 blocking for launch · 🟡 important · 🟢 nice-to-have / can ship post-launch

---

## Stages

| # | Stage | Priority | Detail |
|---|---|---|---|
| 01 | Project Setup & Foundations | 🔴 | [FUNDAMENTS](./stages/stage-01/FUNDAMENTS.md) |
| 02 | Design System & Theme Tokens | 🔴 | [FUNDAMENTS](./stages/stage-02/FUNDAMENTS.md) |
| 03 | Sanity CMS: Schemas & Content Modeling | 🔴 | [FUNDAMENTS](./stages/stage-03/FUNDAMENTS.md) |
| 04 | Core Layout, Navigation & i18n | 🔴 | [FUNDAMENTS](./stages/stage-04/FUNDAMENTS.md) |
| 05 | Home Page | 🔴 | [FUNDAMENTS](./stages/stage-05/FUNDAMENTS.md) |
| 06 | Blog: Listing + Post Detail | 🔴 | [FUNDAMENTS](./stages/stage-06/FUNDAMENTS.md) |
| 07 | Product Catalog | 🔴 | [FUNDAMENTS](./stages/stage-07/FUNDAMENTS.md) |
| 08 | Marca / About Page | 🔴 | [FUNDAMENTS](./stages/stage-08/FUNDAMENTS.md) |
| 09 | Integrations | 🟡 | [FUNDAMENTS](./stages/stage-09/FUNDAMENTS.md) |
| 10 | SEO & i18n Finalization | 🔴 | [FUNDAMENTS](./stages/stage-10/FUNDAMENTS.md) |
| 11 | QA, Performance & Accessibility | 🔴 | [FUNDAMENTS](./stages/stage-11/FUNDAMENTS.md) |
| 12 | Deployment & Launch | 🔴 | [FUNDAMENTS](./stages/stage-12/FUNDAMENTS.md) |

---

## Stage 01 — Project Setup & Foundations 🔴
A running Astro + TypeScript + Tailwind + shadcn project with linting, formatting, and CI, committed to the existing repo.
→ Full detail: [`stages/stage-01/FUNDAMENTS.md`](./stages/stage-01/FUNDAMENTS.md)

## Stage 02 — Design System & Theme Tokens 🔴
Brand tokens, typography, and base shadcn theme wired into Tailwind so all later UI is consistent.
→ Full detail: [`stages/stage-02/FUNDAMENTS.md`](./stages/stage-02/FUNDAMENTS.md)

## Stage 03 — Sanity CMS: Schemas & Content Modeling 🔴
A deployed Sanity Studio with schemas covering posts, products, categories, and site settings, ready for the brand owner to publish.
→ Full detail: [`stages/stage-03/FUNDAMENTS.md`](./stages/stage-03/FUNDAMENTS.md)

## Stage 04 — Core Layout, Navigation & i18n 🔴
Shared layout, navbar/footer, and the ES/EN routing/i18n framework that every page builds on.
→ Full detail: [`stages/stage-04/FUNDAMENTS.md`](./stages/stage-04/FUNDAMENTS.md)

## Stage 05 — Home Page 🔴
The home page matching the approved design (hero + double-row marquee).
→ Full detail: [`stages/stage-05/FUNDAMENTS.md`](./stages/stage-05/FUNDAMENTS.md)

## Stage 06 — Blog: Listing + Post Detail 🔴
The blog index with filters/search and the individual post template.
→ Full detail: [`stages/stage-06/FUNDAMENTS.md`](./stages/stage-06/FUNDAMENTS.md)

## Stage 07 — Product Catalog 🔴
The affiliate catalog page with sidebar filters and outbound product cards (no detail pages).
→ Full detail: [`stages/stage-07/FUNDAMENTS.md`](./stages/stage-07/FUNDAMENTS.md)

## Stage 08 — Marca / About Page 🔴
The brand/creator page supporting trust + E-E-A-T.
→ Full detail: [`stages/stage-08/FUNDAMENTS.md`](./stages/stage-08/FUNDAMENTS.md)

## Stage 09 — Integrations 🟡
Wire the external services required for v1 (YouTube, Facebook Comments, affiliate links, GA4).
→ Full detail: [`stages/stage-09/FUNDAMENTS.md`](./stages/stage-09/FUNDAMENTS.md)

## Stage 10 — SEO & i18n Finalization 🔴
Make the site fully indexable and correctly internationalized.
→ Full detail: [`stages/stage-10/FUNDAMENTS.md`](./stages/stage-10/FUNDAMENTS.md)

## Stage 11 — QA, Performance & Accessibility 🔴
Verify quality before launch.
→ Full detail: [`stages/stage-11/FUNDAMENTS.md`](./stages/stage-11/FUNDAMENTS.md)

## Stage 12 — Deployment & Launch 🔴
Ship v1 to production.
→ Full detail: [`stages/stage-12/FUNDAMENTS.md`](./stages/stage-12/FUNDAMENTS.md)

---

## Post-v1 (Out of Scope, Backlog) 🟢

Tracked for later, not part of v1 per `PROJECT.md` (see [`stages/stage-12/FUNDAMENTS.md`](./stages/stage-12/FUNDAMENTS.md)):

- Newsletter / email capture.
- Sponsored post workflow and partner-facing media kit.
- Shein affiliate workflow automation (once manual process is validated).
- Product detail pages (currently outbound-only).
- Advanced analytics dashboards / A/B testing of CTAs.

---

## Suggested Sequence & Dependencies

```
01 ──► 02 ──► 04 ──► 05 ──► 06 ──► 07 ──► 08 ──► 09 ──► 10 ──► 11 ──► 12
        │                  ▲        ▲
        └──► 03 ───────────┴────────┘   (Sanity can run in parallel after Stage 01)
```

Stage 03 (Sanity) can be developed in parallel with Stages 02/04 once the scaffold exists, but Stages 05–08 depend on both the design system (02) and the content layer (03/04). Stage 09 integrations can begin as soon as the relevant page exists.

---

*Last updated: 2026-06-20 · Aligns with `PROJECT.md` and `ABOUT.md` · Per-stage detail in [`docs/stages/`](./stages/)*
