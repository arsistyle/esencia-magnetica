# Home sections, page templates, logo & nav menus — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the 4 pending pieces: (1) home "Lo último" + "Shop el look" sections, (2) Sanity-managed logo in Navbar, (3) configurable page templates following the section-enabled pattern, (4) WordPress-style nav menus from Sanity.

**Architecture:** New Studio schemas (navMenu, homeContent/blogContent/productsContent in page) feed into new GROQ queries consumed by updated Astro components. Each page section has an `enabled` toggle; fallbacks to hardcoded i18n values when Sanity doc is absent. BaseLayout fetches logo + all menus in one combined query to minimize round-trips.

**Tech Stack:** Astro v6 (hybrid/SSR) · Sanity v6 + `@sanity/astro` · TypeScript strict · Tailwind v4 · Vitest

---

## File map

### Studio — `E:\esencia-magnetica-studio`
| Action | File |
|--------|------|
| Create | `schemaTypes/documents/navMenu.ts` |
| Modify | `schemaTypes/documents/page.ts` |
| Modify | `schemaTypes/index.ts` |

### Frontend — `E:\esencia-magnetica\src`
| Action | File |
|--------|------|
| Create | `lib/home/galleryViewModel.ts` |
| Create | `lib/home/galleryViewModel.test.ts` |
| Create | `components/home/HomeLatest.astro` |
| Create | `components/home/HomeShopLook.astro` |
| Modify | `lib/queries.ts` |
| Modify | `lib/home/marqueeItems.ts` (export interface only) |
| Modify | `components/home/HomeHero.astro` |
| Modify | `components/Navbar.astro` |
| Modify | `components/Footer.astro` |
| Modify | `layouts/BaseLayout.astro` |
| Modify | `pages/index.astro` |
| Modify | `pages/en/index.astro` |
| Modify | `pages/blog/index.astro` |
| Modify | `pages/en/blog/index.astro` |
| Modify | `pages/productos/index.astro` |
| Modify | `pages/en/products/index.astro` |
| Modify | `i18n/ui.ts` |
| Modify | `types/sanity.types.ts` |

---

## Task 1: navMenu Studio schema

**Files:**
- Create: `E:\esencia-magnetica-studio\schemaTypes\documents\navMenu.ts`
- Modify: `E:\esencia-magnetica-studio\schemaTypes\index.ts`

- [ ] **Step 1: Create navMenu schema**

```ts
// schemaTypes/documents/navMenu.ts
import {defineArrayMember, defineField, defineType} from 'sanity'

export const navMenuType = defineType({
  name: 'navMenu',
  title: 'Nav Menu',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Internal name',
      description: 'E.g. "Header ES", "Footer EN". Not shown on site.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slot',
      type: 'string',
      title: 'Menu slot',
      options: {
        list: [
          {title: 'Header', value: 'header'},
          {title: 'Mobile', value: 'mobile'},
          {title: 'Footer', value: 'footer'},
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'locale',
      type: 'string',
      title: 'Locale',
      options: {
        list: [
          {title: 'Español (ES)', value: 'es'},
          {title: 'English (EN)', value: 'en'},
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'items',
      type: 'array',
      title: 'Menu items',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'label', type: 'string', title: 'Label', validation: (r) => r.required()}),
            defineField({
              name: 'href',
              type: 'string',
              title: 'URL or path',
              description: 'Internal: /blog · External: https://...',
              validation: (r) => r.required(),
            }),
            defineField({name: 'isExternal', type: 'boolean', title: 'Open in new tab', initialValue: false}),
          ],
          preview: {select: {title: 'label', subtitle: 'href'}},
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'title', slot: 'slot', locale: 'locale'},
    prepare({title, slot, locale}) {
      return {title, subtitle: [locale?.toUpperCase(), slot].filter(Boolean).join(' · ')}
    },
  },
})
```

- [ ] **Step 2: Register navMenuType in index.ts**

Add the import and include it in the `schemaTypes` array:

```ts
// Add import at the top:
import {navMenuType} from './documents/navMenu'

// Add to schemaTypes array (after pageType):
navMenuType,
```

- [ ] **Step 3: Verify Studio compiles**

```bash
cd E:\esencia-magnetica-studio
pnpm exec tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
cd E:\esencia-magnetica-studio
git add schemaTypes/documents/navMenu.ts schemaTypes/index.ts
git commit -m "feat(studio): add navMenu schema with slot/locale/items"
```

---

## Task 2: page.ts — homeContent, blogContent, productsContent

**Files:**
- Modify: `E:\esencia-magnetica-studio\schemaTypes\documents\page.ts`

- [ ] **Step 1: Update generic `hero` hidden condition**

The generic `hero` field currently hides only for `about`. Update to also hide for `home`, `blog`, `products`:

```ts
// Find this line:
hidden: ({document}) => document?.template === 'about',
// Replace with:
hidden: ({document}) =>
  ['about', 'home', 'blog', 'products'].includes(document?.template as string),
```

Apply the same change to the `body` field (it hides for `about`; now also hide for `home`, `blog`, `products`):

```ts
// Find body field hidden:
hidden: ({document}) => document?.template === 'about',
// Replace with:
hidden: ({document}) =>
  ['about', 'home', 'blog', 'products'].includes(document?.template as string),
```

- [ ] **Step 2: Add homeContent field (after aboutContent)**

Insert this `defineField` block before the closing `seo` field:

```ts
// Fields exclusive to template: 'home'
defineField({
  name: 'homeContent',
  type: 'object',
  title: 'Content — Home page',
  hidden: ({document}) => document?.template !== 'home',
  fields: [
    // Hero section
    defineField({
      name: 'hero',
      type: 'object',
      title: 'Hero section',
      fields: [
        defineField({name: 'enabled', type: 'boolean', title: 'Show section', initialValue: true}),
        defineField({name: 'tagline', type: 'string', title: 'Tagline (script font)', hidden: ({parent}) => !parent?.enabled}),
        defineField({name: 'heading', type: 'string', title: 'Main heading (H1)', hidden: ({parent}) => !parent?.enabled}),
        defineField({name: 'lead', type: 'text', title: 'Lead paragraph', rows: 3, hidden: ({parent}) => !parent?.enabled}),
        defineField({
          name: 'primaryCta',
          type: 'object',
          title: 'Primary CTA button',
          hidden: ({parent}) => !parent?.enabled,
          fields: [
            defineField({name: 'label', type: 'string', title: 'Button label'}),
            defineField({name: 'href', type: 'string', title: 'URL or path'}),
          ],
        }),
        defineField({
          name: 'secondaryCta',
          type: 'object',
          title: 'Secondary CTA button',
          hidden: ({parent}) => !parent?.enabled,
          fields: [
            defineField({name: 'label', type: 'string', title: 'Button label'}),
            defineField({name: 'href', type: 'string', title: 'URL or path'}),
          ],
        }),
      ],
    }),

    // Gallery section
    defineField({
      name: 'gallery',
      type: 'object',
      title: 'Photo gallery (marquee)',
      fields: [
        defineField({name: 'enabled', type: 'boolean', title: 'Show gallery', initialValue: true}),
        defineField({
          name: 'images',
          type: 'array',
          title: 'Gallery images (max 20)',
          description: 'First 10 → top row · Next 10 → bottom row. Order matters.',
          hidden: ({parent}) => !parent?.enabled,
          of: [defineArrayMember({type: 'image', options: {hotspot: false}})],
          validation: (r) => r.max(20),
        }),
      ],
    }),

    // Latest posts section
    defineField({
      name: 'latestPosts',
      type: 'object',
      title: '"Lo último" section',
      fields: [
        defineField({name: 'enabled', type: 'boolean', title: 'Show section', initialValue: true}),
        defineField({name: 'heading', type: 'string', title: 'Section heading', hidden: ({parent}) => !parent?.enabled}),
        defineField({name: 'ctaLabel', type: 'string', title: '"View all" link label', hidden: ({parent}) => !parent?.enabled}),
      ],
    }),

    // Shop the look section
    defineField({
      name: 'shopLook',
      type: 'object',
      title: '"Shop el look" section',
      fields: [
        defineField({name: 'enabled', type: 'boolean', title: 'Show section', initialValue: true}),
        defineField({name: 'heading', type: 'string', title: 'Section heading', hidden: ({parent}) => !parent?.enabled}),
        defineField({name: 'lead', type: 'text', title: 'Lead text', rows: 2, hidden: ({parent}) => !parent?.enabled}),
        defineField({name: 'ctaLabel', type: 'string', title: 'Button label', hidden: ({parent}) => !parent?.enabled}),
      ],
    }),
  ],
}),

// Fields exclusive to template: 'blog'
defineField({
  name: 'blogContent',
  type: 'object',
  title: 'Content — Blog listing',
  hidden: ({document}) => document?.template !== 'blog',
  fields: [
    defineField({
      name: 'hero',
      type: 'object',
      title: 'Hero section',
      fields: [
        defineField({name: 'enabled', type: 'boolean', title: 'Show hero', initialValue: true}),
        defineField({name: 'heading', type: 'string', title: 'Page heading', hidden: ({parent}) => !parent?.enabled}),
        defineField({name: 'lead', type: 'text', title: 'Lead text', rows: 2, hidden: ({parent}) => !parent?.enabled}),
      ],
    }),
    defineField({
      name: 'settings',
      type: 'object',
      title: 'Listing settings',
      fields: [
        defineField({
          name: 'postsPerPage',
          type: 'number',
          title: 'Posts per page',
          initialValue: 12,
          validation: (r) => r.min(1).max(48),
        }),
        defineField({
          name: 'showFeatured',
          type: 'boolean',
          title: 'Show featured post at top',
          initialValue: true,
        }),
      ],
    }),
  ],
}),

// Fields exclusive to template: 'products'
defineField({
  name: 'productsContent',
  type: 'object',
  title: 'Content — Products listing',
  hidden: ({document}) => document?.template !== 'products',
  fields: [
    defineField({
      name: 'hero',
      type: 'object',
      title: 'Hero section',
      fields: [
        defineField({name: 'enabled', type: 'boolean', title: 'Show hero', initialValue: true}),
        defineField({name: 'heading', type: 'string', title: 'Page heading', hidden: ({parent}) => !parent?.enabled}),
        defineField({name: 'lead', type: 'text', title: 'Lead text', rows: 2, hidden: ({parent}) => !parent?.enabled}),
      ],
    }),
  ],
}),
```

- [ ] **Step 3: Verify Studio compiles**

```bash
cd E:\esencia-magnetica-studio
pnpm exec tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
cd E:\esencia-magnetica-studio
git add schemaTypes/documents/page.ts
git commit -m "feat(studio): add homeContent, blogContent, productsContent to page schema"
```

---

## Task 3: galleryViewModel utility + tests (TDD)

**Files:**
- Modify: `src/lib/home/marqueeItems.ts` (export the interface)
- Create: `src/lib/home/galleryViewModel.ts`
- Create: `src/lib/home/galleryViewModel.test.ts`

- [ ] **Step 1: Export MarqueeItem interface from marqueeItems.ts**

Open `src/lib/home/marqueeItems.ts`. The `MarqueeItem` interface must be exported (add `export` if missing):

```ts
export interface MarqueeItem {
  bg: string;
  src?: string;
  alt?: string;
  aspectRatio?: string;
}
```

- [ ] **Step 2: Write failing tests**

```ts
// src/lib/home/galleryViewModel.test.ts
import { describe, it, expect } from "vitest";
import { buildMarqueeRows } from "./galleryViewModel";
import type { MarqueeItem } from "./marqueeItems";

const F1: MarqueeItem[] = [{ bg: "red" }];
const F2: MarqueeItem[] = [{ bg: "blue" }];
const img = (n: number) => ({ url: `https://cdn/${n}.jpg` });

describe("buildMarqueeRows", () => {
  it("returns fallbacks when images is null", () => {
    const [r1, r2] = buildMarqueeRows(null, F1, F2);
    expect(r1).toBe(F1);
    expect(r2).toBe(F2);
  });

  it("returns fallbacks when images is empty array", () => {
    const [r1, r2] = buildMarqueeRows([], F1, F2);
    expect(r1).toBe(F1);
    expect(r2).toBe(F2);
  });

  it("puts 5 images in row1, fallback in row2", () => {
    const images = Array.from({ length: 5 }, (_, i) => img(i));
    const [r1, r2] = buildMarqueeRows(images, F1, F2);
    expect(r1).toHaveLength(5);
    expect(r1[0].src).toBe("https://cdn/0.jpg");
    expect(r2).toBe(F2);
  });

  it("splits 15 images: row1=10, row2=5", () => {
    const images = Array.from({ length: 15 }, (_, i) => img(i));
    const [r1, r2] = buildMarqueeRows(images, F1, F2);
    expect(r1).toHaveLength(10);
    expect(r2).toHaveLength(5);
    expect(r2[0].src).toBe("https://cdn/10.jpg");
  });

  it("splits 20 images: row1=10, row2=10", () => {
    const images = Array.from({ length: 20 }, (_, i) => img(i));
    const [r1, r2] = buildMarqueeRows(images, F1, F2);
    expect(r1).toHaveLength(10);
    expect(r2).toHaveLength(10);
  });

  it("each item has src and bg set", () => {
    const images = [img(0)];
    const [r1] = buildMarqueeRows(images, F1, F2);
    expect(r1[0].src).toBe("https://cdn/0.jpg");
    expect(typeof r1[0].bg).toBe("string");
    expect(r1[0].bg.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 3: Run tests — verify they FAIL**

```bash
cd E:\esencia-magnetica
pnpm run test src/lib/home/galleryViewModel.test.ts
```

Expected: error — `Cannot find module './galleryViewModel'`

- [ ] **Step 4: Implement galleryViewModel.ts**

```ts
// src/lib/home/galleryViewModel.ts
import type { MarqueeItem } from "@/lib/home/marqueeItems";

export interface SanityGalleryImage {
  url: string;
  alt?: string;
}

const BG_CYCLE = [
  "linear-gradient(135deg, var(--color-rose-nude), var(--color-lavender))",
  "linear-gradient(135deg, var(--color-cream-deep), var(--color-gold-soft))",
  "linear-gradient(135deg, var(--color-lavender), var(--color-cream))",
  "linear-gradient(135deg, var(--color-gold-soft), var(--color-rose-nude))",
  "linear-gradient(135deg, var(--color-rose-nude), var(--color-cream))",
  "linear-gradient(135deg, var(--color-lavender), var(--color-rose-nude))",
  "linear-gradient(135deg, var(--color-cream), var(--color-gold-soft))",
  "linear-gradient(135deg, var(--color-cream-deep), var(--color-rose-nude))",
];

function toItem(img: SanityGalleryImage, idx: number): MarqueeItem {
  return {
    bg: BG_CYCLE[idx % BG_CYCLE.length],
    src: img.url,
    alt: img.alt ?? "",
  };
}

export function buildMarqueeRows(
  images: SanityGalleryImage[] | null | undefined,
  fallback1: MarqueeItem[],
  fallback2: MarqueeItem[]
): [MarqueeItem[], MarqueeItem[]] {
  if (!images?.length) return [fallback1, fallback2];
  const row1 = images.slice(0, 10).map(toItem);
  const row2 = images.slice(10, 20).map(toItem);
  return [row1, row2.length ? row2 : fallback2];
}
```

- [ ] **Step 5: Run tests — verify they PASS**

```bash
pnpm run test src/lib/home/galleryViewModel.test.ts
```

Expected: 6 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/home/galleryViewModel.ts src/lib/home/galleryViewModel.test.ts src/lib/home/marqueeItems.ts
git commit -m "feat(home): add buildMarqueeRows utility with tests"
```

---

## Task 4: i18n keys

**Files:**
- Modify: `src/i18n/ui.ts`

- [ ] **Step 1: Add keys to both locales**

In `src/i18n/ui.ts`, find the `es` object and add inside the `home` group (or create it if not present):

```ts
// ES locale — home section additions
"home.latest.heading": "Lo último",
"home.latest.cta": "Ver todo",
"home.shop.badge": "Shop el look",
"home.shop.heading": "Las piezas favoritas de esta semana",
"home.shop.lead": "Selección curada con enlaces directos. Compra lo que ves, sin buscar.",
"home.shop.cta": "Ir al catálogo",
```

In the `en` object, add:

```ts
// EN locale — home section additions
"home.latest.heading": "Latest",
"home.latest.cta": "View all",
"home.shop.badge": "Shop the look",
"home.shop.heading": "This week's favourite pieces",
"home.shop.lead": "A curated selection with direct links. Shop what you see — no searching.",
"home.shop.cta": "Go to catalogue",
```

- [ ] **Step 2: Run existing i18n tests**

```bash
pnpm run test src/i18n/ui.test.ts
```

Expected: all pass (EN has all ES keys).

- [ ] **Step 3: Commit**

```bash
git add src/i18n/ui.ts
git commit -m "feat(i18n): add home.latest.* and home.shop.* keys"
```

---

## Task 5: New GROQ queries

**Files:**
- Modify: `src/lib/queries.ts`

- [ ] **Step 1: Add all new queries at the end of queries.ts**

```ts
// Home page queries
export const homePageQuery = defineQuery(`
  *[_type == "page" && template == "home" && language == $lang][0] {
    homeContent {
      hero { enabled, tagline, heading, lead, primaryCta, secondaryCta },
      gallery {
        enabled,
        "images": images[].asset->url
      },
      latestPosts { enabled, heading, ctaLabel },
      shopLook { enabled, heading, lead, ctaLabel }
    }
  }
`);

export const homePostsQuery = defineQuery(`
  *[_type == "post" && language == $lang && defined(publishedAt)]
    | order(publishedAt desc) [0...3] {
    _id, title, slug, excerpt, publishedAt, featured,
    coverImage, "category": category->{ name, slug },
    "readTime": round(length(pt::text(body)) / 1000)
  }
`);

export const homeProductsQuery = defineQuery(`
  *[_type == "product" && language == $lang && active == true]
    | order(publishedAt desc) [0...2] {
    _id, name, affiliateUrl, image
  }
`);

// Blog listing page config
export const blogPageQuery = defineQuery(`
  *[_type == "page" && template == "blog" && language == $lang][0] {
    blogContent {
      hero { enabled, heading, lead },
      settings { postsPerPage, showFeatured }
    }
  }
`);

// Products listing page config
export const productsPageQuery = defineQuery(`
  *[_type == "page" && template == "products" && language == $lang][0] {
    productsContent {
      hero { enabled, heading, lead }
    }
  }
`);

// Combined site navigation: logo + all menus in one round-trip
export const siteNavQuery = defineQuery(`
  {
    "logo": *[_type == "brand" && _id == $brandId][0].logo.asset->url,
    "headerMenu": *[_type == "navMenu" && slot == "header" && locale == $locale][0].items,
    "mobileMenu": *[_type == "navMenu" && slot == "mobile" && locale == $locale][0].items,
    "footerMenu": *[_type == "navMenu" && slot == "footer" && locale == $locale][0].items
  }
`);
```

- [ ] **Step 2: Run typecheck**

```bash
cd E:\esencia-magnetica
pnpm run typecheck
```

Expected: 0 errors (new queries are just strings at this point).

- [ ] **Step 3: Commit**

```bash
git add src/lib/queries.ts
git commit -m "feat(queries): add homePageQuery, homePostsQuery, homeProductsQuery, blogPageQuery, productsPageQuery, siteNavQuery"
```

---

## Task 6: HomeLatest organism

**Files:**
- Create: `src/components/home/HomeLatest.astro`

- [ ] **Step 1: Create HomeLatest.astro**

```astro
---
// src/components/home/HomeLatest.astro
import type { Locale } from "@/types/index";
import { useTranslations, getLocalizedUrl } from "@/i18n";
import PostCard from "@/components/blog/PostCard.astro";

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  publishedAt: string;
  featured?: boolean;
  coverImage?: unknown;
  readTime?: number;
  category?: { name: Record<string, string>; slug: { current: string } };
}

interface Props {
  lang: Locale;
  posts: Post[];
  heading?: string | null;
  ctaLabel?: string | null;
}

const { lang, posts, heading, ctaLabel } = Astro.props;
const t = useTranslations(lang);

const blogHref = lang === "es" ? "/blog" : getLocalizedUrl("en", "/blog");
const sectionHeading = heading ?? t("home.latest.heading");
const sectionCta = ctaLabel ?? t("home.latest.cta");
---

{
  posts.length > 0 && (
    <section class="[padding:var(--space-8)_var(--gutter)]">
      <div class="mx-auto max-w-[var(--container)]">
        <div class="mb-10 flex flex-wrap items-baseline justify-between gap-3">
          <h2 class="font-serif text-h2 text-olive m-0 font-semibold leading-tight">
            {sectionHeading}
          </h2>
          <a
            href={blogHref}
            class="text-gold hover:text-gold-deep text-small font-bold uppercase tracking-wide no-underline transition-colors"
          >
            {sectionCta} →
          </a>
        </div>
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard post={post} lang={lang} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify typecheck**

```bash
pnpm run typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/HomeLatest.astro
git commit -m "feat(home): add HomeLatest organism"
```

---

## Task 7: HomeShopLook organism

**Files:**
- Create: `src/components/home/HomeShopLook.astro`

- [ ] **Step 1: Create HomeShopLook.astro**

```astro
---
// src/components/home/HomeShopLook.astro
import type { Locale } from "@/types/index";
import { useTranslations, getLocalizedUrl } from "@/i18n";
import Badge from "@/components/ui/Badge.astro";
import Button from "@/components/ui/Button.astro";
import { safeUrlFor } from "@/lib/sanity";

interface Product {
  _id: string;
  name: string;
  affiliateUrl?: string;
  image?: unknown;
}

interface Props {
  lang: Locale;
  products: Product[];
  heading?: string | null;
  lead?: string | null;
  ctaLabel?: string | null;
}

const { lang, products, heading, lead, ctaLabel } = Astro.props;
const t = useTranslations(lang);

const catalogHref =
  lang === "es" ? "/productos" : getLocalizedUrl("en", "/productos");

const sectionHeading = heading ?? t("home.shop.heading");
const sectionLead = lead ?? t("home.shop.lead");
const sectionCta = ctaLabel ?? t("home.shop.cta");

const GRADIENTS = [
  "linear-gradient(135deg, var(--color-rose-nude), var(--color-cream))",
  "linear-gradient(135deg, var(--color-cream-deep), var(--color-gold-soft))",
];

function productImageUrl(product: Product): string | null {
  if (!product.image) return null;
  return (
    safeUrlFor(product.image as Parameters<typeof safeUrlFor>[0])
      ?.width(480)
      .height(600)
      .format("webp")
      .quality(85)
      .url() ?? null
  );
}
---

<section class="bg-lavender [padding:var(--space-8)_var(--gutter)]">
  <div
    class="mx-auto grid max-w-[var(--container)] items-center gap-16 lg:grid-cols-2"
  >
    <!-- Copy -->
    <div>
      <Badge tone="gold">{t("home.shop.badge")}</Badge>
      <h2
        class="font-serif text-h2 text-olive my-6 font-semibold leading-tight"
      >
        {sectionHeading}
      </h2>
      <p class="text-olive-soft mb-8 text-lead leading-normal">
        {sectionLead}
      </p>
      <Button href={catalogHref} variant="warm">{sectionCta}</Button>
    </div>

    <!-- Product images grid -->
    <div class="grid grid-cols-2 gap-6">
      {
        [0, 1].map((i) => {
          const product = products[i];
          const imgUrl = product ? productImageUrl(product) : null;
          const bg = imgUrl ? undefined : GRADIENTS[i];
          return (
            <div
              class:list={[
                "rounded-lg overflow-hidden shadow-sm",
                i === 1 && "mt-8",
              ]}
              style={`aspect-ratio: 4/5${bg ? `; background: ${bg}` : ""}`}
            >
              {imgUrl && (
                <img
                  src={imgUrl}
                  alt={product?.name ?? ""}
                  class="block h-full w-full object-cover"
                  loading="lazy"
                />
              )}
            </div>
          );
        })
      }
    </div>
  </div>
</section>
```

- [ ] **Step 2: Verify typecheck**

```bash
pnpm run typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/HomeShopLook.astro
git commit -m "feat(home): add HomeShopLook organism"
```

---

## Task 8: Update HomeHero — accept Sanity data

**Files:**
- Modify: `src/components/home/HomeHero.astro`

- [ ] **Step 1: Add optional `hero` prop and use Sanity values with i18n fallback**

Replace the entire file content:

```astro
---
// src/components/home/HomeHero.astro
import type { Locale } from "@/types/index";
import { useTranslations, getLocalizedUrl } from "@/i18n";
import Button from "@/components/ui/Button.astro";

interface HeroData {
  enabled?: boolean;
  tagline?: string;
  heading?: string;
  lead?: string;
  primaryCta?: { label?: string; href?: string } | null;
  secondaryCta?: { label?: string; href?: string } | null;
}

interface Props {
  lang: Locale;
  hero?: HeroData | null;
}

const { lang, hero } = Astro.props;
const t = useTranslations(lang);

if (hero?.enabled === false) return;

const blogHref = lang === "es" ? "/blog" : getLocalizedUrl("en", "/blog");
const catalogHref =
  lang === "es" ? "/productos" : getLocalizedUrl("en", "/productos");

const tagline = hero?.tagline ?? t("home.welcome");
const heading = hero?.heading ?? t("home.headline");
const leadText = hero?.lead ?? t("home.lead");
const primaryLabel = hero?.primaryCta?.label ?? t("home.cta.blog");
const primaryHref = hero?.primaryCta?.href ?? blogHref;
const secondaryLabel = hero?.secondaryCta?.label ?? t("home.cta.catalog");
const secondaryHref = hero?.secondaryCta?.href ?? catalogHref;
---

<section
  class="[padding:var(--space-9)_var(--gutter)_var(--space-8)] text-center"
>
  <div class="mx-auto max-w-[900px]">
    <div
      class="font-script text-gold mb-3 [font-size:clamp(2.4rem,5vw,64px)] leading-none"
    >
      {tagline}
    </div>
    <h1
      class="m-0 mb-8 font-serif [font-size:clamp(3rem,8vw,110px)] leading-none font-semibold tracking-tight"
    >
      {heading}
    </h1>
    <p
      class="text-olive-soft mx-auto mt-0 mb-10 max-w-[620px] text-[20px] leading-normal"
    >
      {leadText}
    </p>
    <div class="flex flex-wrap justify-center gap-4">
      <Button href={primaryHref} variant="primary" size="lg">
        {primaryLabel}
      </Button>
      <Button href={secondaryHref} variant="secondary" size="lg">
        {secondaryLabel}
      </Button>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Verify typecheck**

```bash
pnpm run typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/HomeHero.astro
git commit -m "feat(home): HomeHero accepts optional Sanity hero data with i18n fallback"
```

---

## Task 9: Update index.astro + en/index.astro

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/en/index.astro`

- [ ] **Step 1: Replace src/pages/index.astro**

```astro
---
// src/pages/index.astro
export const prerender = false;
import BaseLayout from "@/layouts/BaseLayout.astro";
import HomeHero from "@/components/home/HomeHero.astro";
import MarqueeRow from "@/components/home/MarqueeRow.astro";
import HomeLatest from "@/components/home/HomeLatest.astro";
import HomeShopLook from "@/components/home/HomeShopLook.astro";
import { ROW1_ITEMS, ROW2_ITEMS } from "@/lib/home/marqueeItems";
import { buildMarqueeRows } from "@/lib/home/galleryViewModel";
import { sanityClient } from "sanity:client";
import {
  siteSettingsQuery,
  homePageQuery,
  homePostsQuery,
  homeProductsQuery,
} from "@/lib/queries";
import { resolveImageUrl, type CoverImageLike } from "@/lib/sanity";

const lang = "es" as const;

const [settings, pageData, posts, products] = await Promise.all([
  sanityClient.fetch(siteSettingsQuery),
  sanityClient.fetch(homePageQuery, { lang }),
  sanityClient.fetch(homePostsQuery, { lang }),
  sanityClient.fetch(homeProductsQuery, { lang }),
]);

const hc = pageData?.homeContent;

// Gallery: build marquee rows from Sanity images or fallback
type GalleryImage = { url: string };
const galleryImages: GalleryImage[] | null =
  hc?.gallery?.enabled !== false && hc?.gallery?.images?.length
    ? (hc.gallery.images as GalleryImage[])
    : null;
const [row1Items, row2Items] = buildMarqueeRows(
  galleryImages,
  ROW1_ITEMS,
  ROW2_ITEMS
);

const seoTitle = settings?.defaultSeo?.metaTitle ?? "Esencia Magnética";
const seoDescription = settings?.defaultSeo?.metaDescription ?? "";
const seoOgImage = settings?.defaultSeo?.ogImage
  ? (resolveImageUrl(settings.defaultSeo.ogImage as CoverImageLike, {
      width: 1200,
      format: "webp",
    }) ?? undefined)
  : undefined;
---

<BaseLayout
  title={seoTitle}
  description={seoDescription}
  ogImage={seoOgImage}
  lang="es"
>
  <HomeHero lang="es" hero={hc?.hero} />
  {hc?.gallery?.enabled !== false && (
    <>
      <MarqueeRow direction="left" items={row1Items} />
      <MarqueeRow direction="right" items={row2Items} />
    </>
  )}
  {(!hc?.latestPosts || hc.latestPosts.enabled !== false) && (
    <HomeLatest
      lang="es"
      posts={posts ?? []}
      heading={hc?.latestPosts?.heading}
      ctaLabel={hc?.latestPosts?.ctaLabel}
    />
  )}
  {(!hc?.shopLook || hc.shopLook.enabled !== false) && (
    <HomeShopLook
      lang="es"
      products={products ?? []}
      heading={hc?.shopLook?.heading}
      lead={hc?.shopLook?.lead}
      ctaLabel={hc?.shopLook?.ctaLabel}
    />
  )}
</BaseLayout>
```

- [ ] **Step 2: Replace src/pages/en/index.astro**

Same as above but with `lang = "en" as const` and `lang="en"` on `<BaseLayout>` and all components. The `seoTitle` fallback becomes `"Esencia Magnética"` (same since site name is always in Spanish).

```astro
---
// src/pages/en/index.astro
export const prerender = false;
import BaseLayout from "@/layouts/BaseLayout.astro";
import HomeHero from "@/components/home/HomeHero.astro";
import MarqueeRow from "@/components/home/MarqueeRow.astro";
import HomeLatest from "@/components/home/HomeLatest.astro";
import HomeShopLook from "@/components/home/HomeShopLook.astro";
import { ROW1_ITEMS, ROW2_ITEMS } from "@/lib/home/marqueeItems";
import { buildMarqueeRows } from "@/lib/home/galleryViewModel";
import { sanityClient } from "sanity:client";
import {
  siteSettingsQuery,
  homePageQuery,
  homePostsQuery,
  homeProductsQuery,
} from "@/lib/queries";
import { resolveImageUrl, type CoverImageLike } from "@/lib/sanity";

const lang = "en" as const;

const [settings, pageData, posts, products] = await Promise.all([
  sanityClient.fetch(siteSettingsQuery),
  sanityClient.fetch(homePageQuery, { lang }),
  sanityClient.fetch(homePostsQuery, { lang }),
  sanityClient.fetch(homeProductsQuery, { lang }),
]);

const hc = pageData?.homeContent;

type GalleryImage = { url: string };
const galleryImages: GalleryImage[] | null =
  hc?.gallery?.enabled !== false && hc?.gallery?.images?.length
    ? (hc.gallery.images as GalleryImage[])
    : null;
const [row1Items, row2Items] = buildMarqueeRows(
  galleryImages,
  ROW1_ITEMS,
  ROW2_ITEMS
);

const seoTitle = settings?.defaultSeo?.metaTitle ?? "Esencia Magnética";
const seoDescription = settings?.defaultSeo?.metaDescription ?? "";
const seoOgImage = settings?.defaultSeo?.ogImage
  ? (resolveImageUrl(settings.defaultSeo.ogImage as CoverImageLike, {
      width: 1200,
      format: "webp",
    }) ?? undefined)
  : undefined;
---

<BaseLayout
  title={seoTitle}
  description={seoDescription}
  ogImage={seoOgImage}
  lang="en"
>
  <HomeHero lang="en" hero={hc?.hero} />
  {hc?.gallery?.enabled !== false && (
    <>
      <MarqueeRow direction="left" items={row1Items} />
      <MarqueeRow direction="right" items={row2Items} />
    </>
  )}
  {(!hc?.latestPosts || hc.latestPosts.enabled !== false) && (
    <HomeLatest
      lang="en"
      posts={posts ?? []}
      heading={hc?.latestPosts?.heading}
      ctaLabel={hc?.latestPosts?.ctaLabel}
    />
  )}
  {(!hc?.shopLook || hc.shopLook.enabled !== false) && (
    <HomeShopLook
      lang="en"
      products={products ?? []}
      heading={hc?.shopLook?.heading}
      lead={hc?.shopLook?.lead}
      ctaLabel={hc?.shopLook?.ctaLabel}
    />
  )}
</BaseLayout>
```

Note: Both home pages must add `export const prerender = false;` if not already present (needed since they now fetch per-request data).

- [ ] **Step 3: Verify typecheck**

```bash
pnpm run typecheck
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/pages/en/index.astro
git commit -m "feat(home): wire homeContent, HomeLatest, HomeShopLook into home pages"
```

---

## Task 10: Update blog/index.astro + en/blog/index.astro

**Files:**
- Modify: `src/pages/blog/index.astro`
- Modify: `src/pages/en/blog/index.astro`

- [ ] **Step 1: Update blog/index.astro**

Add `blogPageQuery` to the imports:

```ts
import {
  postsFilteredQuery,
  postsCountQuery,
  blogCategoriesQuery,
  siteSettingsQuery,
  blogPageQuery,         // ← add
} from "@/lib/queries";
```

Add `POSTS_PER_PAGE` import stays, but it becomes the fallback default:

```ts
import { POSTS_PER_PAGE } from "@/lib/constants"; // fallback default
```

Add `blogPageQuery` to the `Promise.all`:

```ts
const [rawPosts, total, categories, settings, blogPage] = await Promise.all([
  sanityClient.fetch(postsFilteredQuery, { lang, categoria, q, offset, end }),
  sanityClient.fetch(postsCountQuery, { lang, categoria, q }),
  sanityClient.fetch(blogCategoriesQuery),
  sanityClient.fetch(siteSettingsQuery),
  sanityClient.fetch(blogPageQuery, { lang }),   // ← add
]);
```

Extract config from blogPage:

```ts
const bc = blogPage?.blogContent;
const postsPerPage = bc?.settings?.postsPerPage ?? POSTS_PER_PAGE;
const showFeatured = bc?.settings?.showFeatured ?? true;
const blogHeroEnabled = bc?.hero?.enabled !== false;
const blogHeroHeading = bc?.hero?.heading ?? t("blog.headline");
const blogHeroLead = bc?.hero?.lead ?? t("blog.lead");
```

Replace `POSTS_PER_PAGE` usage in offset/end/totalPages with `postsPerPage`:

```ts
const offset = (page - 1) * postsPerPage;
const end = offset + postsPerPage;
// ...
const totalPages = Math.ceil((total ?? 0) / postsPerPage);
```

Replace the `featured` assignment to respect `showFeatured`:

```ts
const featured =
  showFeatured && !categoria && !q && page === 1
    ? (posts.find((p) => p.featured) ?? null)
    : null;
```

In the template, wrap the blog listing header section conditionally. Find where the blog hero/heading is rendered and update to use Sanity values. The blog listing page template already uses `t("blog.headline")` etc. — replace with the new variables:

In the JSX/template part, find the heading and lead display and replace hardcoded i18n keys with the `blogHeroHeading` / `blogHeroLead` variables. Only show the hero if `blogHeroEnabled`.

- [ ] **Step 2: Apply same changes to en/blog/index.astro**

Identical changes with `lang = "en" as const`.

- [ ] **Step 3: Verify typecheck**

```bash
pnpm run typecheck
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/blog/index.astro src/pages/en/blog/index.astro
git commit -m "feat(blog): read postsPerPage and showFeatured from Sanity blogContent"
```

---

## Task 11: Update productos/index.astro + en/products/index.astro

**Files:**
- Modify: `src/pages/productos/index.astro`
- Modify: `src/pages/en/products/index.astro`

- [ ] **Step 1: Update productos/index.astro**

Add `productsPageQuery` to imports:

```ts
import {
  productsFilteredQuery,
  // ... existing imports
  productsPageQuery,  // ← add
} from "@/lib/queries";
```

Add to `Promise.all`:

```ts
const [/* ...existing... */, productsPage] = await Promise.all([
  // ...existing fetches...
  sanityClient.fetch(productsPageQuery, { lang }),  // ← add
]);
```

Extract hero config:

```ts
const pc = productsPage?.productsContent;
const heroEnabled = pc?.hero?.enabled !== false;
const heroHeading = pc?.hero?.heading ?? t("product.headline");
const heroLead = pc?.hero?.lead ?? t("product.lead");
```

In the template, use `heroHeading` / `heroLead` instead of hardcoded i18n calls, and wrap the hero in `{heroEnabled && (...)}`.

- [ ] **Step 2: Apply same to en/products/index.astro**

Identical changes with `lang = "en" as const`.

- [ ] **Step 3: Verify typecheck**

```bash
pnpm run typecheck
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/productos/index.astro src/pages/en/products/index.astro
git commit -m "feat(products): read hero heading/lead from Sanity productsContent"
```

---

## Task 12: BaseLayout — siteNavQuery (logo + menus)

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Add siteNavQuery fetch to BaseLayout**

Add to imports:

```ts
import { sanityClient } from "sanity:client";
import { siteNavQuery } from "@/lib/queries";
```

Add fetch in frontmatter (after existing const declarations):

```ts
const brandId = `brand-${lang}`;
const siteNav = await sanityClient.fetch(siteNavQuery, {
  brandId,
  locale: lang,
});
const logoUrl: string | null = siteNav?.logo ?? null;
const headerMenuItems: NavItem[] | null = siteNav?.headerMenu ?? null;
const mobileMenuItems: NavItem[] | null = siteNav?.mobileMenu ?? null;
const footerMenuItems: NavItem[] | null = siteNav?.footerMenu ?? null;
```

Add the `NavItem` type import or define it inline:

```ts
interface NavItem {
  label: string;
  href: string;
  isExternal: boolean;
}
```

Pass props to `<Navbar>` and `<Footer>`:

```astro
<Navbar
  lang={lang}
  currentPath={currentPath}
  logoUrl={logoUrl}
  headerNavItems={headerMenuItems}
  mobileNavItems={mobileMenuItems ?? headerMenuItems}
/>
<!-- ... -->
<Footer lang={lang} footerNavItems={footerMenuItems} />
```

- [ ] **Step 2: Verify typecheck**

```bash
pnpm run typecheck
```

Expected: 0 errors (props not yet accepted — typecheck will error on Navbar/Footer until Tasks 13-14 are done; proceed in order).

- [ ] **Step 3: Commit after Tasks 13 and 14 pass typecheck together**

Commit is at end of Task 14.

---

## Task 13: Navbar — logoUrl + navItems props

**Files:**
- Modify: `src/components/Navbar.astro`

- [ ] **Step 1: Add logoUrl, headerNavItems, mobileNavItems props**

In the Props interface:

```ts
interface Props {
  lang: Locale;
  currentPath: string;
  logoUrl?: string | null;
  headerNavItems?: { label: string; href: string; isExternal?: boolean }[] | null;
  mobileNavItems?: { label: string; href: string; isExternal?: boolean }[] | null;
}

const { lang, currentPath, logoUrl, headerNavItems, mobileNavItems } = Astro.props;
```

Replace desktop nav link generation to use `headerNavItems` when available, else `NAV_ITEMS` fallback.

**Desktop nav links — replace the `NAV_ITEMS.map(...)` block:**

```astro
{
  (headerNavItems
    ? headerNavItems.map(({ label, href, isExternal }) => {
        const active = !isExternal && (href === "/" ? currentPath === href : currentPath.startsWith(href));
        return (
          <a
            href={isExternal ? href : (lang === "es" ? href : getLocalizedUrl("en", href))}
            class:list={[
              "duration-base ease-soft border-b-2 pb-[3px] font-sans text-[14px] tracking-[0.06em] uppercase no-underline transition-colors",
              active
                ? "text-olive border-gold font-bold"
                : "text-olive-soft hover:text-olive border-transparent font-normal",
            ]}
            aria-current={active ? "page" : undefined}
            {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {label}
          </a>
        );
      })
    : NAV_ITEMS.map((item) => {
        const href = navHref(item.href);
        const active = isActive(item.href);
        return (
          <a
            href={href}
            class:list={[
              "duration-base ease-soft border-b-2 pb-[3px] font-sans text-[14px] tracking-[0.06em] uppercase no-underline transition-colors",
              active
                ? "text-olive border-gold font-bold"
                : "text-olive-soft hover:text-olive border-transparent font-normal",
            ]}
            aria-current={active ? "page" : undefined}
          >
            {t(item.labelKey as UiKey)}
          </a>
        );
      }))
}
```

**Mobile nav links — apply same logic for `mobileNavItems`:**

Replace the mobile `NAV_ITEMS.map(...)` block with an equivalent using `mobileNavItems ?? headerNavItems` (with the same fallback pattern).

**Logo — replace wordmark `<a>` with conditional:**

```astro
<a
  href={logoHref}
  class="no-underline"
  aria-label="Esencia Magnética"
>
  {logoUrl ? (
    <img
      src={logoUrl}
      alt="Esencia Magnética"
      class="h-8 w-auto"
      loading="eager"
    />
  ) : (
    <span class="font-script text-gold text-[30px] leading-none whitespace-nowrap">
      Esencia Magnética
    </span>
  )}
</a>
```

- [ ] **Step 2: Verify typecheck**

```bash
pnpm run typecheck
```

Expected: 0 errors.

---

## Task 14: Footer — footerNavItems prop

**Files:**
- Modify: `src/components/Footer.astro`

- [ ] **Step 1: Add footerNavItems prop**

```ts
interface Props {
  lang: Locale;
  footerNavItems?: { label: string; href: string; isExternal?: boolean }[] | null;
}

const { lang, footerNavItems } = Astro.props;
const t = useTranslations(lang);

// Use Sanity items if available; fall back to NAV_ITEMS
const navLinks = footerNavItems
  ? footerNavItems.map(({ label, href, isExternal }) => ({
      label,
      href: isExternal ? href : (lang === "es" ? href : getLocalizedUrl("en", href)),
      isExternal: isExternal ?? false,
    }))
  : NAV_ITEMS.map((item) => ({
      label: t(item.labelKey as UiKey),
      href: lang === "es" ? item.href : getLocalizedUrl("en", item.href),
      isExternal: false,
    }));
```

Update the nav links template to use `navLinks` (already does — verify the `isExternal` case opens in new tab):

```astro
{
  navLinks.map(({ label, href, isExternal }) => (
    <a
      href={href}
      class="text-cream text-sm no-underline opacity-80 transition-opacity hover:opacity-100"
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {label}
    </a>
  ))
}
```

- [ ] **Step 2: Run lint + typecheck + tests**

```bash
pnpm run lint && pnpm run typecheck && pnpm run test
```

Expected: 0 errors, all tests pass.

- [ ] **Step 3: Commit Tasks 12 + 13 + 14 together**

```bash
git add src/layouts/BaseLayout.astro src/components/Navbar.astro src/components/Footer.astro
git commit -m "feat(nav): Sanity-managed logo and nav menus with hardcoded fallback"
```

---

## Task 15: Update sanity.types.ts

**Files:**
- Modify: `src/types/sanity.types.ts`

- [ ] **Step 1: Add new types**

Append to the end of `src/types/sanity.types.ts`:

```ts
// ─── Nav menu ──────────────────────────────────
export interface NavMenuItem {
  label: string;
  href: string;
  isExternal: boolean;
}

export interface NavMenu {
  _id: string;
  _type: "navMenu";
  title: string;
  slot: "header" | "footer" | "mobile";
  locale: "es" | "en";
  items: NavMenuItem[];
}

// ─── Home page template ───────────────────────
export interface HomeHeroSection {
  enabled?: boolean;
  tagline?: string;
  heading?: string;
  lead?: string;
  primaryCta?: { label?: string; href?: string };
  secondaryCta?: { label?: string; href?: string };
}

export interface HomeGallerySection {
  enabled?: boolean;
  images?: string[]; // resolved to URL strings by GROQ projection
}

export interface HomeLatestPostsSection {
  enabled?: boolean;
  heading?: string;
  ctaLabel?: string;
}

export interface HomeShopLookSection {
  enabled?: boolean;
  heading?: string;
  lead?: string;
  ctaLabel?: string;
}

export interface HomeContent {
  hero?: HomeHeroSection;
  gallery?: HomeGallerySection;
  latestPosts?: HomeLatestPostsSection;
  shopLook?: HomeShopLookSection;
}

// ─── Blog page template ───────────────────────
export interface BlogHeroSection {
  enabled?: boolean;
  heading?: string;
  lead?: string;
}

export interface BlogListingSettings {
  postsPerPage?: number;
  showFeatured?: boolean;
}

export interface BlogContent {
  hero?: BlogHeroSection;
  settings?: BlogListingSettings;
}

// ─── Products page template ───────────────────
export interface ProductsHeroSection {
  enabled?: boolean;
  heading?: string;
  lead?: string;
}

export interface ProductsContent {
  hero?: ProductsHeroSection;
}
```

- [ ] **Step 2: Run lint + typecheck + tests**

```bash
pnpm run lint && pnpm run typecheck && pnpm run test
```

Expected: 0 errors, all tests pass (81+ tests).

- [ ] **Step 3: Commit**

```bash
git add src/types/sanity.types.ts
git commit -m "feat(types): add HomeContent, BlogContent, ProductsContent, NavMenu types"
```

---

## Task 16: Dev server smoke test + final commit

- [ ] **Step 1: Start dev server and verify each route**

```bash
pnpm run dev
```

Visit and verify:
- `http://localhost:4321/` — HomeHero renders (fallback text if no Sanity page doc), marquee rows visible, HomeLatest shows posts if any, HomeShopLook shows (section visible)
- `http://localhost:4321/en` — same in EN
- `http://localhost:4321/blog` — listing renders, pagination works
- `http://localhost:4321/productos` — catalog renders
- `http://localhost:4321/marca` — About page unaffected
- Navbar logo: wordmark renders (no logo in Sanity yet — fallback to script font)
- Footer nav links render (from `NAV_ITEMS` fallback)

- [ ] **Step 2: Run full test suite**

```bash
pnpm run lint && pnpm run typecheck && pnpm run test
```

Expected: all pass.

- [ ] **Step 3: Final commit + update HANDOFF**

Update `HANDOFF.md` to reflect the completed work under a new "Pending work (post-Stage 10)" section. Then:

```bash
git add HANDOFF.md
git commit -m "docs: update HANDOFF — home sections, page templates, logo, nav menus complete"
```

---

## Self-review checklist

- [x] navMenu schema covers all 3 slots (header/mobile/footer) with locale ✓
- [x] homeContent covers all 4 sections with enabled pattern ✓
- [x] blogContent has hero + settings (postsPerPage + showFeatured) ✓
- [x] productsContent has hero ✓
- [x] galleryViewModel tested (6 cases) ✓
- [x] i18n keys added ES + EN ✓
- [x] All queries defined ✓
- [x] Both ES + EN home pages updated ✓
- [x] Both ES + EN blog pages updated ✓
- [x] Both ES + EN products pages updated ✓
- [x] BaseLayout fetches logo + menus in single query ✓
- [x] Navbar: logo fallback to wordmark ✓
- [x] Footer: Sanity items with NAV_ITEMS fallback ✓
- [x] Types added ✓
- [x] No placeholders ("TBD", "similar to") in any step ✓
