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
    "category": category->{ name },
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
  *[_id == "brand-" + $lang][0] {
    name, tagline, photos, mission, vision, philosophy
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
