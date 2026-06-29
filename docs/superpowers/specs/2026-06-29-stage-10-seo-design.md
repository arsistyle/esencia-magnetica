# Stage 10 — SEO & i18n Finalization: Design Spec

**Date:** 2026-06-29  
**Status:** Approved  

---

## Goal

Make the site fully indexable and correctly internationalized. Pass Rich Results test for posts; validate hreflang; achieve Lighthouse SEO ≥ 95.

---

## What's Already Working (no changes needed)

- `hreflang` ES/EN/x-default — implemented in `BaseLayout.astro`
- Canonical URLs — automatic via `astro-seo`
- `astro-seo` plugin — in use across all layouts
- Article metadata (publishedTime, authors, section) — in `BlogPostLayout.astro`
- Skip-to-content link — in `BaseLayout.astro`
- `jsonLd` prop infrastructure — `BaseLayout` already has `<script type="application/ld+json">`

---

## Architecture

### New files

| File | Purpose |
|------|---------|
| `src/lib/seo.ts` | JSON-LD builders |
| `src/pages/sitemap.xml.ts` | SSR endpoint — queries Sanity, returns XML |
| `public/robots.txt` | Static file |

### Modified files

| File | Change |
|------|--------|
| `src/lib/sanity.ts` | Add `format`/`quality` params to `resolveImageUrl()`; new `buildSrcSet()` helper |
| `src/layouts/BlogPostLayout.astro` | Pass `jsonLd` (Article + BreadcrumbList) to BaseLayout |
| `src/layouts/BrandLayout.astro` | Pass `jsonLd` (Organization) to BaseLayout |
| `src/components/blog/PostCard.astro` | `srcset`, `loading="lazy"`, explicit dims, alt fallback |
| `src/components/blog/PostHero.astro` | `srcset`, `loading="eager"` (above-fold), explicit dims, alt fallback |
| `src/components/blog/FeaturedPost.astro` | `srcset`, `loading="eager"` (above-fold), explicit dims, alt fallback |
| `src/components/product/ProductCard.astro` | `srcset`, `loading="lazy"`, explicit dims, alt fallback |
| `src/components/brand/BrandHero.astro` | `srcset`, `loading="eager"` (above-fold), explicit dims, alt fallback |
| `src/pages/index.astro` + `en/index.astro` | Fetch `siteSettings.defaultSeo` as meta fallback |
| `src/pages/blog/index.astro` + EN | Fetch `siteSettings.defaultSeo` as meta fallback |
| `src/pages/productos/index.astro` + EN | Fetch `siteSettings.defaultSeo` as meta fallback |
| `src/pages/marca/index.astro` + EN | Fetch `siteSettings.defaultSeo` as meta fallback |

---

## Section 1: JSON-LD (`src/lib/seo.ts`)

Three exported builder functions. Each returns a serialized JSON string for the `jsonLd` prop of `BaseLayout`.

### `buildArticleJsonLd(post, lang, url)`

```ts
// Input types already exist in src/types/sanity.types.ts
buildArticleJsonLd(post: Post, lang: Locale, url: string): string
```

Output schema: `schema.org/Article`

Fields:
- `@type`: `"Article"`
- `headline`: `post.title`
- `datePublished`: `post.publishedAt`
- `dateModified`: `post._updatedAt` (fallback to `publishedAt`)
- `author`: `{ @type: "Person", name: post.authors[0].name }` (first author)
- `image`: `resolveImageUrl(post.coverImage, { width: 1200, format: 'webp' })`
- `url`: canonical URL passed in
- `inLanguage`: `lang`

Multiple schemas on a page are passed as a JSON array: `[articleSchema, breadcrumbSchema]`.

### `buildOrganizationJsonLd(brand, siteUrl)`

```ts
buildOrganizationJsonLd(brand: Brand, siteUrl: string): string
```

Output schema: `schema.org/Organization`

Fields:
- `@type`: `"Organization"`
- `name`: `brand.name`
- `url`: `siteUrl`
- `logo`: `resolveImageUrl(brand.logo, { width: 400, format: 'webp' })`
- `sameAs`: `brand.socialLinks.map(l => l.url)` (array of social URLs)

Used in: `BrandLayout` only. Adding it to the home page would require an extra Sanity query with no meaningful SEO gain.

### `buildBreadcrumbJsonLd(items)`

```ts
buildBreadcrumbJsonLd(items: { name: string; url: string }[]): string
```

Output schema: `schema.org/BreadcrumbList`

Reuses the same `{ label, href }[]` shape that `Breadcrumb.astro` already receives (rename `label→name`, `href→url` at call site).

Used in: `BlogPostLayout` (combined with Article as JSON array).

---

## Section 2: Sitemap + robots.txt

### `src/pages/sitemap.xml.ts`

- `prerender = false` (SSR endpoint)
- `@sanity/document-internationalization` creates separate documents per locale with independent slugs. ES `_id: "abc123"`, EN `_id: "abc123__i18n_en"`. Slugs may differ (`mi-post` ≠ `my-post`).
- Two Sanity queries in parallel:
  1. ES posts: `*[_type == "post" && !(_id in path("drafts.**")) && __i18n_lang == "es"]{ slug, _updatedAt }`
  2. EN posts: `*[_type == "post" && !(_id in path("drafts.**")) && __i18n_lang == "en"]{ _id, slug }`
- Match pairs by stripping `__i18n_en` suffix: EN `_id.replace('__i18n_en', '') === ES _id`
- Each matched pair generates two `<url>` entries with `<xhtml:link rel="alternate">` pairs
- Unmatched ES posts (no EN translation yet) generate a single `<url>` with only ES hreflang + x-default
- Static pages list hardcoded: `/`, `/blog`, `/productos`, `/marca`, and EN equivalents
- Returns `new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })`

XML structure per matched ES+EN pair:
```xml
<url>
  <loc>https://esencia-magnetica.com/blog/mi-post</loc>
  <lastmod>2026-06-01</lastmod>
  <xhtml:link rel="alternate" hreflang="es" href="https://esencia-magnetica.com/blog/mi-post"/>
  <xhtml:link rel="alternate" hreflang="en" href="https://esencia-magnetica.com/en/blog/my-post"/>
  <xhtml:link rel="alternate" hreflang="x-default" href="https://esencia-magnetica.com/blog/mi-post"/>
</url>
```

### `public/robots.txt`

```
User-agent: *
Allow: /
Sitemap: https://esencia-magnetica.com/sitemap.xml
```

---

## Section 3: Image Optimization

### Extend `resolveImageUrl()` in `src/lib/sanity.ts`

Current signature: `resolveImageUrl(source, { width?, height? })`

New signature: `resolveImageUrl(source, { width?, height?, format?, quality? })`

- `format`: `'webp' | 'jpg'`, default `'webp'` → Sanity param `fm=webp`
- `quality`: `number`, default `80` → Sanity param `q=80`

### New helper `buildSrcSet()`

```ts
buildSrcSet(source: CoverImageLike, widths: number[]): string
// Returns: "url?w=400&fm=webp 400w, url?w=800&fm=webp 800w, url?w=1200&fm=webp 1200w"
```

### Component updates

| Component | `srcset` widths | `sizes` | `loading` |
|-----------|----------------|---------|-----------|
| `PostCard` | 400, 800 | `(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw` | `lazy` |
| `FeaturedPost` | 800, 1200 | `(min-width: 1024px) 60vw, 100vw` | `eager` |
| `PostHero` | 800, 1200 | `(min-width: 1024px) 800px, 100vw` | `eager` |
| `ProductCard` | 400, 800 | `(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw` | `lazy` |
| `BrandHero` | 600, 1200 | `(min-width: 1024px) 50vw, 100vw` | `eager` |

Alt text fallback pattern for all components:
```astro
alt={image.alt ?? post.title}
```

Explicit `width` and `height` on every `<img>` to prevent CLS. Use the largest srcset width as `width` and derive `height` from the aspect ratio (16:9 for blog, 1:1 for products, free for brand hero).

---

## Section 4: defaultSeo from siteSettings

`siteSettingsQuery` already fetches `defaultSeo` in `src/lib/queries.ts`. Pages without content-specific SEO fields add a second `loadQuery` call:

```ts
const { data: settings } = await loadQuery(siteSettingsQuery)
```

Then pass to `BaseLayout`:
```astro
title={settings?.defaultSeo?.metaTitle ?? 'Esencia Magnética'}
description={settings?.defaultSeo?.metaDescription ?? ''}
ogImage={settings?.defaultSeo?.ogImage ? resolveImageUrl(settings.defaultSeo.ogImage, { width: 1200 }) : undefined}
```

Pages affected: `index.astro`, `blog/index.astro`, `productos/index.astro`, `marca/index.astro` (ES + EN).

---

## Section 5: Accessibility Pass

- **Alt text**: All `<img>` components updated with `alt={field.alt ?? fallbackText}` where `fallbackText` is the content title or empty string for decorative images.
- **Heading hierarchy**: Audit each page — no duplicate `<h1>`, no skipped levels. PostCard uses `<h2>` or `<h3>` depending on context.
- **Landmarks**: `<nav>`, `<main>`, `<footer>` already in BaseLayout. Verify blog/product page content is inside `<main>`.

---

## Definition of Done

- [ ] Rich Results test passes for a post URL
- [ ] hreflang validator shows no errors
- [ ] `/sitemap.xml` returns valid XML with ES+EN URLs
- [ ] `/robots.txt` accessible and references sitemap
- [ ] Lighthouse SEO ≥ 95 on home, blog listing, post detail
- [ ] No CLS from images (explicit width/height on all img tags)
- [ ] `pnpm run lint` + `pnpm run typecheck` + `pnpm run test` pass
