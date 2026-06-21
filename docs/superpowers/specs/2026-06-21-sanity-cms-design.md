# Stage 03 — Sanity CMS: Design Spec

**Fecha:** 2026-06-21  
**Scope:** Schemas, client Astro, GROQ queries, TypeGen flow, seed y estructura de Studio.

---

## 1. Estrategia de localización

**Documentos separados por idioma** (plugin `@sanity/document-internationalization`) para tipos con URL propia y texto largo:

- `post`, `product`, `author`, `brand`
- El campo `language` inyectado por el plugin mapea al routing de Astro: `language === 'es'` → `/blog/slug`, `language === 'en'` → `/en/blog/slug`

**Campos localizados** `{ es: string, en: string }` para datos de referencia sin URL propia:

- `blogCategory`, `productCategory`, `siteSettings`

La localización está activa desde el día uno.

---

## 2. Schemas

### `post`

| Campo                 | Tipo                       | Notas                                               |
| --------------------- | -------------------------- | --------------------------------------------------- |
| `title`               | string                     | required                                            |
| `slug`                | slug                       | required, source: title                             |
| `excerpt`             | text                       | ~160 chars                                          |
| `body`                | Portable Text              | marks: strong, em, link + bloques custom            |
| `coverImage`          | object                     | `{ asset?: image, externalUrl?: url, alt: string }` |
| `category`            | reference → `blogCategory` | required                                            |
| `tags`                | array\<string\>            |                                                     |
| `publishedAt`         | datetime                   |                                                     |
| `featured`            | boolean                    | default false                                       |
| `seo.metaTitle`       | string                     |                                                     |
| `seo.metaDescription` | string                     | max 160 chars                                       |
| `seo.ogImage`         | image                      |                                                     |

**Bloques custom en `body`:**

- `youtubeEmbed` — `{ url: url }` (URL completa de YouTube)
- `productList` — `{ products: array<reference → product> }`

**`coverImage`** acepta subida a Sanity (`asset`) o URL externa (`externalUrl`). El frontend usa `externalUrl` si existe, si no el asset. El campo `alt` es siempre requerido.

### `product`

| Campo              | Tipo                          | Notas                                               |
| ------------------ | ----------------------------- | --------------------------------------------------- |
| `name`             | string                        | required                                            |
| `image`            | object                        | `{ asset?: image, externalUrl?: url, alt: string }` |
| `category`         | reference → `productCategory` |                                                     |
| `store`            | string enum                   | `amazon \| shein \| other`                          |
| `affiliateUrl`     | url                           | required                                            |
| `shortDescription` | text                          |                                                     |
| `active`           | boolean                       | default true                                        |
| `publishedAt`      | datetime                      | para ordenar                                        |

### `blogCategory`

```
name: { es: string, en: string }   // required
slug: { es: string, en: string }   // required, unique por idioma
```

Seeds: Outfits · Tendencias · Estilo · Combinaciones · Ocasiones · Viajes

### `productCategory`

```
name: { es: string, en: string }   // required
slug: { es: string, en: string }   // required, unique por idioma
```

Seeds: Outfits · Tops · Pantalones · Vestidos · Zapatos · Bolsos · Accesorios · Peinados

### `author`

`name` (string) · `photo` (image) · `role` (string) · `bio` (Portable Text)  
Localizado vía doc-level (un documento ES + uno EN).

### `brand`

`name` (string) · `tagline` (string) · `photos[]` (image) · `mission` (Portable Text) · `vision` (Portable Text) · `philosophy` (Portable Text)  
Localizado vía doc-level.

### `siteSettings` (singleton)

```
navLinks[]:     { label: { es, en }, href: string }
socialLinks:    { instagram, youtube, facebook }
affiliateDisclosure: { es: string, en: string }
defaultSeo:     { title: { es, en }, description: { es, en }, ogImage: image }
```

---

## 3. Client Astro + GROQ

### `src/lib/sanity.ts`

```ts
import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const sanity = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET,
  apiVersion: "2025-01-01",
  useCdn: import.meta.env.PROD,
});

const builder = imageUrlBuilder(sanity);
export const urlFor = (source: Parameters<typeof builder.image>[0]) =>
  builder.image(source);
```

Env vars en `.env.local` (nunca commiteadas): `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`.

### `src/lib/queries.ts`

Queries con `groq` tagged template. Filtro base: `language == $lang`.

```ts
export const postsQuery = groq`
  *[_type == "post" && language == $lang] | order(publishedAt desc) {
    _id, title, slug, excerpt, publishedAt, featured,
    coverImage, "category": category->{ name }
  }
`;

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug && language == $lang][0] {
    ...,
    "category": category->{ name },
    body[]{
      ...,
      _type == "productList" => {
        products[]->{ _id, name, image, affiliateUrl, store }
      }
    }
  }
`;
```

Mismo patrón para `productsQuery`, `categoriesQuery`, `siteSettingsQuery`.

---

## 4. TypeGen flow

1. Correr `npx sanity typegen generate` en `E:\esencia-magnetica-studio`
2. Copiar el `sanity.types.ts` generado a `src/types/sanity.types.ts` en este repo
3. Las queries y componentes importan tipos desde `@/types/sanity.types`

Paso manual por ahora. Automatizable con script npm si se vuelve tedioso.

---

## 5. Estructura de Studio (desk)

```
Studio
├── 📝 Contenido
│   ├── Posts (ES)
│   ├── Posts (EN)
│   ├── Productos (ES)
│   └── Productos (EN)
├── 🗂️ Taxonomía
│   ├── Categorías de blog
│   └── Categorías de producto
├── 🏷️ Marca
│   ├── Autora
│   └── Brand (ES / EN)
└── ⚙️ Ajustes
    └── Site Settings (singleton)
```

El plugin `@sanity/document-internationalization` añade selector ES/EN en cada documento. La estructura del desk agrupa por sección para que el editor vea todo el contenido junto.

---

## 6. Seed inicial

| Tipo              | Cantidad                                             |
| ----------------- | ---------------------------------------------------- |
| `blogCategory`    | 6 (campo-localizado, un documento)                   |
| `productCategory` | 8 (campo-localizado, un documento)                   |
| `author`          | 1 ES + 1 EN (placeholder)                            |
| `brand`           | 1 ES + 1 EN (placeholder)                            |
| `siteSettings`    | 1 singleton                                          |
| `post`            | 2 ES + 2 EN (con youtubeEmbed y productList en body) |
| `product`         | 4 ES + 4 EN (2 Amazon, 1 Shein, 1 other)             |

---

## 7. Infraestructura separada

- **Studio:** `E:\esencia-magnetica-studio` — repo independiente, el usuario lo gestiona
- **Astro:** `E:\esencia-magnetica` — solo instala `@sanity/client` y `@sanity/image-url`
- **Pendiente (Stage 12 o antes):** Crear ejecutable Mac clickable (Automator/AppleScript) para que la brand owner arranque Studio sin línea de comandos

---

## Definición de hecho

- Brand owner puede crear un post localizado (ES + EN) y un producto desde Studio
- Los tipos TypeGen son importables en Astro sin errores de typecheck
- `pnpm run lint && pnpm run typecheck && pnpm run build` pasan en verde
