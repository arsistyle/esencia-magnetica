# Stage 03 — Sanity CMS: Schemas & Content Modeling 🔴

> Part of the [Esencia Magnética Implementation Plan](../../PLAN.md).

**Goal:** A deployed Sanity Studio with schemas covering posts, products, categories, and site settings, ready for the brand owner to publish.

## Tasks

1. Create the Sanity project + dataset; install Studio (embedded in repo or separate folder).
2. Model **localized fields** strategy for ES/EN (per-field localization or document-level — decide and document).
3. Define schemas:
   - `post` — title, slug, excerpt, body (Portable Text), cover image, category (ref), tags, YouTube video ID/URL, related products (refs), publish date, featured flag, SEO fields (meta title, meta description, OG image).
   - `product` — name, image, category (ref), store (Amazon/Shein/other), affiliate URL, short description, active flag, sort/date fields. (No price — affiliate model.)
   - `blogCategory` — name, slug (seed: Outfits · Tendencias · Estilo · Combinaciones · Ocasiones · Viajes).
   - `productCategory` — name, slug (seed: Outfits · Tops · Pantalones · Vestidos · Zapatos · Bolsos · Accesorios · Peinados).
   - `author` / `brand` — name, bio, photos, mission, vision, philosophy (for `/marca` + E-E-A-T).
   - `siteSettings` — nav labels, social links, affiliate disclosure text, default SEO/OG.
4. Add validation rules (required slug, required affiliate URL on products, etc.).
5. Configure Studio structure (desk) for an intuitive editor experience grouped by ES/EN.
6. Set up image pipeline (`@sanity/image-url`) and define hotspot/crop usage.
7. Generate TypeScript types from schemas (Sanity TypeGen) and wire into the frontend.
8. Seed initial categories and a couple of sample posts/products for development.
9. Deploy the Studio and grant the brand owner access.

## Deliverables

Deployed Studio, typed schemas, seed content.

## Definition of Done

Brand owner can create a localized post and product; types are generated and importable in Astro.
