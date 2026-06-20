# Esencia Magnética — Project Definition

## Overview

A fashion and lifestyle website for women aged 40–55+. The site acts as the owned-media hub for the Esencia Magnética brand, driving traffic to YouTube videos and converting visitors through affiliate product links.

All content is AI-assisted and reviewed by the brand owner before publishing.

---

## Tech Stack

| Layer         | Choice                              |
| ------------- | ----------------------------------- |
| Framework     | [Astro](https://astro.build/)       |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) |
| CMS           | [Sanity](https://www.sanity.io/)    |
| Language      | TypeScript                          |
| Styling       | Tailwind CSS                        |

**Rationale:**

- Astro gives exceptional SEO performance out of the box (static output, minimal JS)
- Sanity lets the brand owner publish content independently without touching code
- shadcn/ui handles complex interactive components (product filters, nav, etc.)
- Categories, tags, and product data are all managed from Sanity — not hardcoded

---

## Monetization

- **Affiliate links** — Primary revenue. Products link out to Amazon, Shein, and similar retailers.
- **Sponsored posts** — Planned for a future stage, not in scope for v1.
- No ecommerce, no checkout, no cart.

> **Note on Shein:** Affiliate URLs are currently obtained manually via the Shein app. The workflow for adding Shein links to Sanity is being defined by the brand owner.

---

## Internationalization (i18n)

- **Default language:** Spanish (ES) — no URL prefix
- **Secondary language:** English (EN) — `/en/` prefix
- Content is written in ES first, then translated to EN
- All UI strings must be translatable (no hardcoded copy in components)

---

## Route Structure

```
# Spanish (default)
/                        Home
/blog                    Blog listing
/blog/[slug]             Blog post (may include embedded YouTube videos)
/productos               Product catalog
/marca                   About the brand

# English
/en                      Home EN
/en/blog/[slug]          Blog post EN
/en/productos            Product catalog EN
/en/brand                About the brand EN
```

**Notes:**

- YouTube videos are embedded within blog posts — no standalone video page
- Product pages are catalog-only: filters, cards, outbound links. No detail pages.
- Newsletter / email capture is deferred to a later stage

---

## Design System

### Color Palette

| Token               | Name          | Hex       |
| ------------------- | ------------- | --------- |
| `color-bg`          | Warm Cream    | `#F5F0EB` |
| `color-primary`     | Aged Gold     | `#C4973A` |
| `color-text`        | Dark Olive    | `#3E3D2F` |
| `color-accent-soft` | Pale Lavender | `#EDE6F2` |
| `color-accent-warm` | Rose Nude     | `#E8C9BC` |

Derived from the official logo. Rose Nude (`#E8C9BC`) is proposed as a CTA / product highlight accent.

### Typography (TBD)

- Serif for headings (elegant, editorial feel)
- Sans-serif for body (readability)
- Script only for decorative elements (matches logo wordmark style)

---

## Content Strategy

### Publishing Cadence

~4 posts per week, one post per YouTube video or Facebook post published.

### Post Structure

Each blog post:

1. Expands on the video topic in written form
2. Embeds the related YouTube video
3. Links to the products mentioned
4. Includes a Facebook Comments box at the bottom (tied to the brand's Facebook Page)
5. Is translated to EN after the ES version is approved

### Blog Categories

Sourced from Sanity. Initial seed:

`Outfits · Tendencias · Estilo · Combinaciones · Ocasiones · Viajes`

### Product Catalog Categories

Sourced from Sanity. Initial seed:

`Outfits · Tops · Pantalones · Vestidos · Zapatos · Bolsos · Accesorios · Peinados`

---

## Brand Voice

- Warm, empowering, elegant
- Practical and actionable — not aspirational to the point of being unrealistic
- Never condescending or ageist
- The brand speaks as an authority on style, not as a personal diary

### About the Brand (`/marca`)

The brand owner will appear personally on the site. The About page should communicate:

- Who she is and her story
- The mission and vision of Esencia Magnética
- Her philosophy on style for women 40–55+
- What visitors can expect to find on the site

Having a real face behind the brand builds trust with the target audience and strengthens E-E-A-T signals for SEO. This also creates consistency with future sponsored content opportunities, where partners need to know who they are working with.

---

## SEO Strategy

- Astro static output ensures fast Core Web Vitals
- Each post targets a long-tail keyword related to the video topic
- E-E-A-T signals via consistent brand authorship and structured content
- Hreflang tags for ES/EN content pairs
- Sanity schema will include SEO fields (meta title, meta description, OG image) per post

---

## Integrations (Planned)

| Service                  | Purpose                             | Stage             |
| ------------------------ | ----------------------------------- | ----------------- |
| YouTube API              | Embed videos, display channel stats | v1                |
| Amazon Associates        | Affiliate product links             | v1                |
| Shein Affiliate          | Affiliate product links             | v1 (workflow TBD) |
| Google Analytics 4       | Traffic and conversion tracking     | v1                |
| Facebook Comments Plugin | Comment section on every blog post  | v1                |
| Newsletter provider      | Email capture                       | v2+               |
| Sponsored post system    | Brand partnerships                  | v2+               |

---

## Out of Scope (v1)

- Shopping cart or checkout
- User accounts or login
- Newsletter / email capture
- Sponsored post workflow

---

_Last updated: 2026-06-20_
