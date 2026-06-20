# Stage 06 — Blog: Listing + Post Detail 🔴

> Part of the [Esencia Magnética Implementation Plan](../../PLAN.md).

**Goal:** The blog index with filters/search and the individual post template.

> Build against the Claude Design reference imported in [Stage 02](../stage-02/FUNDAMENTS.md).

## Tasks — Listing (`/blog`, `/en/blog`)
1. Build category filter chips: Todo · Outfits · Tendencias · Estilo · Combinaciones · Ocasiones · Viajes (sourced from Sanity).
2. Add the search box below filters (search-as-you-type over title/excerpt).
3. Build the featured post card (horizontal, full-width, large image, DESTACADO + category badges) — shown only on page 1 with no active filter/search.
4. Build the 3-column post grid with 1:1 image cards.
5. Implement pagination (minimal, gold = active page).
6. Handle empty/no-results states.

## Tasks — Post Detail (`/blog/[slug]`, `/en/blog/[slug]`)
7. Build the post template: title (serif), meta (date, category), cover, Portable Text body renderer with custom serializers (headings, images, links, embeds).
8. Embed the related YouTube video (lazy-loaded façade for performance).
9. Render the "related products" section linking to the catalog/affiliate URLs.
10. Add the Facebook Comments box at the bottom (Stage 09 dependency for the FB SDK).
11. Implement per-post SEO (meta title/description, OG image, canonical) and hreflang ES↔EN pairing.

## Deliverables
Blog listing + post pages in both locales.

## Definition of Done
Filtering, search, pagination, and featured logic work; posts render rich content + video + related products; SEO/hreflang present.
