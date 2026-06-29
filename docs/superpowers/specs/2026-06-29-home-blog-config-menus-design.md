# Design Spec: Home sections, page templates, logo & nav menus

**Date:** 2026-06-29  
**Status:** Approved

---

## Scope

Four independent deliverables, all part of completing the pending work before Stage 12:

1. Home page missing sections (Lo último + Shop el look)
2. Logo integration from Sanity brand doc
3. Dynamic page templates with section-enabled pattern (Home + Blog + Products)
4. Sanity-managed nav menus (WordPress-style)

---

## 1. Home page sections

Two new organisms added to `index.astro` (ES) and `en/index.astro` (EN), after the marquee rows.

### HomeLatest.astro
- Fetches the 3 most recent published posts for the locale via `homePostsQuery`
- Layout: H2 ("Lo último" / "Latest") + "Ver todo →" link to blog + 3-col `PostCard` grid
- Same projection as `postsFilteredQuery` (title, slug, category, publishedAt, readTime, coverImage)
- Empty state: section not rendered if 0 posts

### HomeShopLook.astro
- Fetches 2 most recent published products for the locale via `homeProductsQuery`
- Layout: lavender background, Badge(gold) + H2 + lead text + warm Button to catalog + 2 product images in a 2-col grid (second image offset with `mt-6`)
- Product images: `ProductCard`-style (square crop, Sanity CDN URL)
- Fallback: if < 2 products, missing slots show gradient placeholder (`rose-nude→cream`, `cream-deep→gold-soft`)

**New queries in `queries.ts`:**
```groq
homePostsQuery:
*[_type == "post" && language == $lang && defined(publishedAt)]
  | order(publishedAt desc)[0...3] {
    _id, title, "slug": slug.current,
    "category": category->{title},
    publishedAt,
    "readTime": round(length(pt::text(body)) / 1000),
    coverImage
  }

homeProductsQuery:
*[_type == "product" && language == $lang]
  | order(publishedAt desc)[0...2] {
    _id, name, affiliateUrl, coverImage
  }
```

**New i18n keys (ES + EN):**
```
home.latest.heading      "Lo último"           / "Latest"
home.latest.cta          "Ver todo"             / "View all"
home.shop.badge          "Shop el look"         / "Shop the look"
home.shop.heading        "Las piezas favoritas de esta semana" / "This week's favourite pieces"
home.shop.lead           "Selección curada con enlaces directos. Compra lo que ves, sin buscar." / "A curated selection with direct links. Shop what you see — no searching."
home.shop.cta            "Ir al catálogo"       / "Go to catalogue"
```

---

## 2. Logo integration

`BaseLayout.astro` fetches `brand-${lang}` logo field via a small inline query. Passes it to `Navbar` as an optional prop.

**`Navbar.astro` change:**
- New optional prop `logoUrl?: string`
- If `logoUrl` present: render `<img src={logoUrl} alt="Esencia Magnética" class="h-8 w-auto" />`
- If absent: render the current script wordmark (fallback)

**Query (inline in BaseLayout, not added to queries.ts — too small):**
```groq
*[_type == "brand" && _id == $id][0]{ "logoUrl": logo.asset->url }
```

No change to any page component — logo data lives in BaseLayout.

---

## 3. Dynamic page templates with section-enabled pattern

Follows the exact same pattern established by `aboutContent` in `page.ts`.

### Studio changes — `page.ts`

#### Home template → new `homeContent` field
The generic `hero` field is hidden when `template === 'home'`. `homeContent` is shown instead.

```
homeContent (hidden unless template === 'home')
  hero section
    enabled: boolean (initialValue: true)
    tagline: string             (script font line above H1)
    heading: string             (H1 text)
    lead: text rows:3           (lead paragraph)
    primaryCta { label, href }
    secondaryCta { label, href }

  gallery section
    enabled: boolean (initialValue: true)
    images[]: image (max: 20)
      description: "First 10 images → top row, next 10 → bottom row. Order matters."

  latestPosts section
    enabled: boolean (initialValue: true)
    heading: string
    ctaLabel: string

  shopLook section
    enabled: boolean (initialValue: true)
    heading: string
    lead: text rows:2
    ctaLabel: string
```

#### Blog template → new `blogContent` field
The generic `hero` field is hidden when `template === 'blog'`. `blogContent` is shown instead.

```
blogContent (hidden unless template === 'blog')
  hero section
    enabled: boolean (initialValue: true)
    heading: string
    lead: text rows:2

  settings (no enabled — always applies)
    postsPerPage: number (default: 12, min: 1, max: 48)
    showFeatured: boolean (default: true)
```

#### Products template → new `productsContent` field
Same pattern as blogContent minus `settings`.

```
productsContent (hidden unless template === 'products')
  hero section
    enabled: boolean (initialValue: true)
    heading: string
    lead: text rows:2
```

#### Generic `hero` field
Hidden for `home`, `blog`, `products` templates (keep for `default` and as fallback).
Update `hidden` condition: `({document}) => ['home', 'blog', 'products', 'about'].includes(document?.template as string)`

### Frontend changes

**`HomeHero.astro`:** Accepts optional `heroData` prop from Sanity. Falls back to i18n strings if field is absent.

**`index.astro` + `en/index.astro`:**
- New query: fetch `page` doc where `slug.current == 'home' && language == $lang`
- Pass `homeContent` sections to HomeHero, MarqueeRow (gallery images), HomeLatest, HomeShopLook
- Each section renders only if `enabled !== false`
- Gallery: split `homeContent.gallery.images` → first 10 as ROW1, next 10 as ROW2; fallback to `ROW1_ITEMS`/`ROW2_ITEMS` if no Sanity images

**`blog/index.astro` + `en/blog/index.astro`:**
- Fetch blog page doc, read `blogContent.hero` and `blogContent.settings`
- Hero heading/lead: use Sanity value if present, else i18n fallback
- `POSTS_PER_PAGE` replaced by `blogContent.settings.postsPerPage ?? 12`
- `showFeatured`: if false, skip `FeaturedPost` and show all posts in `PostGrid`

**`productos/index.astro` + `en/products/index.astro`:**
- Same hero read pattern as blog. No settings changes.

**`src/types/sanity.types.ts`:** Add `HomeContent`, `BlogContent`, `ProductsContent` types.

---

## 4. Sanity nav menus

### New schema: `navMenu.ts` (document type)

```
navMenu {
  title: string                         (internal name, e.g. "Header ES")
  slot: select('header' | 'footer' | 'mobile')
  locale: select('es' | 'en')
  items[]: {
    label: string
    href: string                        (ES-relative path for internal, full URL for external)
    isExternal: boolean (default: false)
  }
}
```

Register in `schemaTypes/index.ts`. No i18n plugin needed (locale is a field).

### Frontend changes

**`queries.ts`:** New `navMenuQuery`:
```groq
*[_type == "navMenu" && slot == $slot && locale == $locale][0] {
  items[] { label, href, isExternal }
}
```

**`BaseLayout.astro`:** Fetches header menu (ES or EN by lang). Passes `navItems` to `Navbar`.

**`Navbar.astro`:**
- New optional prop `navItems?: {label: string, href: string, isExternal: boolean}[]`
- If present, uses Sanity items instead of `NAV_ITEMS` from constants
- Fallback: `NAV_ITEMS` from `constants.ts` (unchanged, safety net)
- For internal links: applies existing `isActive()` + `getLocalizedUrl()` logic
- For external links: opens in new tab with `rel="noopener noreferrer"`

**`Footer.astro`:** Same pattern — fetches footer menu from Sanity if available.

**`constants.ts`:** `NAV_ITEMS` stays as-is (fallback only, never removed).

---

## Files touched

### Studio (`E:\esencia-magnetica-studio`)
- `schemaTypes/documents/page.ts` — add homeContent, blogContent, productsContent
- `schemaTypes/documents/navMenu.ts` — new file
- `schemaTypes/index.ts` — register navMenu

### Frontend (`E:\esencia-magnetica`)
- `src/lib/queries.ts` — homePostsQuery, homeProductsQuery, navMenuQuery, homePageQuery, blogPageQuery, productsPageQuery
- `src/components/home/HomeHero.astro` — accept Sanity data prop
- `src/components/home/HomeLatest.astro` — new
- `src/components/home/HomeShopLook.astro` — new
- `src/layouts/BaseLayout.astro` — logo query + nav menu query
- `src/components/Navbar.astro` — logoUrl + navItems props
- `src/components/Footer.astro` — navItems prop
- `src/pages/index.astro` + `src/pages/en/index.astro`
- `src/pages/blog/index.astro` + `src/pages/en/blog/index.astro`
- `src/pages/productos/index.astro` + `src/pages/en/products/index.astro`
- `src/i18n/ui.ts` — new home.latest.* and home.shop.* keys
- `src/types/sanity.types.ts` — new types

---

## Out of scope
- Product detail pages
- Newsletter
- Sub-menu / mega-menu (navMenu items are flat)
- Menu item icons
