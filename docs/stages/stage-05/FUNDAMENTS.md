# Stage 05 — Home Page 🔴

> Part of the [Esencia Magnética Implementation Plan](../../PLAN.md).

**Goal:** The home page matching the approved design.

> Build against the Claude Design reference imported in [Stage 02](../stage-02/FUNDAMENTS.md).

## Tasks
1. Build the Hero: "Bienvenida" (Great Vibes script), large headline, two CTAs — IR AL BLOG (primary gold) and IR AL CATÁLOGO (secondary).
2. Build the full-bleed double-row marquee gallery (left/right loop), 3:4 photos, pure CSS loop, no text/hover.
3. Implement the dev note: increase marquee speed on scroll (scroll-linked speed boost).
4. Wire imagery to Sanity (or a curated home gallery field in `siteSettings`); use placeholders until real 3:4 images are supplied.
5. Localize all home copy and CTAs for EN.
6. Responsive pass (mobile → desktop) and reduced-motion fallback for the marquee.

## Deliverables
`/` and `/en` home pages.

## Definition of Done
Hero + marquee match design, run smoothly, respect `prefers-reduced-motion`, and work in both locales.
