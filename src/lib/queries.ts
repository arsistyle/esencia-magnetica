import { defineQuery } from "groq";

export const postsQuery = defineQuery(`
  *[_type == "post" && language == $lang] | order(publishedAt desc) {
    _id, title, slug, excerpt, publishedAt, featured,
    coverImage, "category": category->{ name },
    "authors": authors[]->{ _id, name, photo, role }
  }
`);

export const postBySlugQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug && language == $lang][0] {
    ...,
    tags,
    "category": category->{ name, slug },
    "authors": authors[]->{ _id, name, photo, role, bio },
    body[]{
      ...,
      _type == "productList" => {
        products[]->{ _id, name, image, affiliateUrl, store }
      }
    }
  }
`);

export const productsQuery = defineQuery(`
  *[_type == "product" && language == $lang && active == true] | order(publishedAt desc) {
    _id, name, image, affiliateUrl, store,
    "category": category->{ name }
  }
`);

export const blogCategoriesQuery = defineQuery(`
  *[_type == "blogCategory"] | order(name.es asc) {
    _id, name, slug
  }
`);

export const productCategoriesQuery = defineQuery(`
  *[_type == "productCategory"] | order(name.es asc) {
    _id, name, slug
  }
`);

export const siteSettingsQuery = defineQuery(`
  *[_id == "siteSettings"][0] {
    navLinks, socialLinks, affiliateDisclosure, defaultSeo
  }
`);

export const brandQuery = defineQuery(`
  *[_type == "brand" && _id == $brandId][0] {
    name,
    tagline,
    heroPhoto { asset, hotspot, crop },
    mission,
    vision,
    logo { asset, hotspot, crop },
    socialLinks[] { platform, url }
  }
`);

export const authorsQuery = defineQuery(`
  *[_type == "author"] | order(name asc) {
    _id, name, photo, role, bio
  }
`);

export const pageBySlugQuery = defineQuery(`
  *[_type == "page" && slug.current == $slug && language == $lang][0]{
    _id,
    title,
    slug,
    template,
    hero{
      heading,
      subheading,
      image,
      cta
    },
    body,
    seo
  }
`);

export const postsFilteredQuery = defineQuery(`
  *[_type == "post" && language == $lang
    && ($categoria == "" || category->slug.es == $categoria)
    && ($q == "" || title match ($q + "*") || pt::text(body) match ($q + "*") || $q in tags)
  ] | order(publishedAt desc) [$offset...$end] {
    _id, title, slug, excerpt, publishedAt, featured,
    coverImage, "category": category->{ name, slug },
    "readTime": round(length(pt::text(body)) / 1000)
  }
`);

export const postsCountQuery = defineQuery(`
  count(*[_type == "post" && language == $lang
    && ($categoria == "" || category->slug.es == $categoria)
    && ($q == "" || title match ($q + "*") || pt::text(body) match ($q + "*") || $q in tags)
  ])
`);

export const productsFilteredQuery = defineQuery(`
  *[_type == "product" && language == $lang && active == true
    && ($categoria == "" || category->slug.es == $categoria)
    && ($tienda == "" || store == $tienda)
    && ($q == "" || name match ($q + "*") || shortDescription match ($q + "*"))
  ] | order(publishedAt desc) [$offset...$end] {
    _id, name, image, affiliateUrl, store, shortDescription,
    "category": category->{ _id, name, slug }
  }
`);

export const productsFilteredByNameQuery = defineQuery(`
  *[_type == "product" && language == $lang && active == true
    && ($categoria == "" || category->slug.es == $categoria)
    && ($tienda == "" || store == $tienda)
    && ($q == "" || name match ($q + "*") || shortDescription match ($q + "*"))
  ] | order(name asc) [$offset...$end] {
    _id, name, image, affiliateUrl, store, shortDescription,
    "category": category->{ _id, name, slug }
  }
`);

export const productsFilteredCountQuery = defineQuery(`
  count(*[_type == "product" && language == $lang && active == true
    && ($categoria == "" || category->slug.es == $categoria)
    && ($tienda == "" || store == $tienda)
    && ($q == "" || name match ($q + "*") || shortDescription match ($q + "*"))
  ])
`);

// Página /marca o /en/brand — template 'about' por locale.
// Retorna null si el documento no existe todavía (brand-en pendiente de crear).
export const aboutPageQuery = defineQuery(`
  *[_type == "page" && template == "about" && language == $lang][0] {
    title,
    aboutContent {
      intro,
      history { enabled, tag, title, photo { asset, hotspot, crop }, body },
      philosophy { enabled, chip, title, description, pillars[] { title, desc } },
      whatYouFind { enabled, chip, title, cards[] { tag, title, description, url } },
      blogCta { enabled, title, buttonText, buttonUrl }
    },
    seo
  }
`);
