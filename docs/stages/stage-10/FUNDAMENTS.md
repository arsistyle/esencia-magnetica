# Stage 10 — SEO & i18n Finalization 🔴

> Part of the [Esencia Magnética Implementation Plan](../../PLAN.md).

**Goal:** Make the site fully indexable and correctly internationalized.

## Tasks

1. Per-page meta titles/descriptions and Open Graph/Twitter cards (defaults from `siteSettings`, overrides from content).
2. Generate `sitemap.xml` (`@astrojs/sitemap`) including ES/EN URLs; add `robots.txt`.
3. Implement hreflang tags for every ES↔EN pair, plus `x-default`.
4. Add JSON-LD: `Article` (posts), `BreadcrumbList`, `Organization`/`Person` (brand).
5. Verify canonical URLs and clean slug handling.
6. Optimize images (responsive `srcset`, AVIF/WebP, lazy loading, explicit dimensions).
7. Accessibility-aligned semantic structure (headings, landmarks, alt text from Sanity).

## Deliverables

Sitemap, robots, hreflang, structured data, image optimization.

## Definition of Done

Rich Results test passes for posts; hreflang validates; Lighthouse SEO ≥ 95.
