# Stage 03 — Sanity CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Schemas desplegados en Sanity Studio, client Astro configurado, queries GROQ tipadas, tipos TypeGen copiados, y seed de contenido listo para que el frontend consuma datos reales.

**Architecture:** Doc-level localization vía `@sanity/document-internationalization` para `post` y `product`; singletons localizados con IDs fijos para `brand` y `author`; campos `{ es, en }` para categorías y `siteSettings`. `@sanity/astro` provee el virtual module `sanity:client` en el repo Astro — no se instancia un client manual.

**Tech Stack:** Sanity v6 · `@sanity/document-internationalization` · `@sanity/astro` · `@sanity/image-url` · `groq` (defineQuery) · TypeGen

---

## Mapa de archivos

### Studio (`E:\esencia-magnetica-studio`)

| Archivo                                     | Acción                                 |
| ------------------------------------------- | -------------------------------------- |
| `sanity.cli.ts`                             | Modificar — añadir typegen config      |
| `sanity.config.ts`                          | Modificar — añadir plugins + structure |
| `schemaTypes/index.ts`                      | Modificar — registrar todos los tipos  |
| `schemaTypes/objects/blockContent.ts`       | Crear                                  |
| `schemaTypes/objects/coverImage.ts`         | Crear                                  |
| `schemaTypes/objects/seo.ts`                | Crear                                  |
| `schemaTypes/objects/youtubeEmbed.ts`       | Crear                                  |
| `schemaTypes/objects/productList.ts`        | Crear                                  |
| `schemaTypes/singletons/blogCategory.ts`    | Crear                                  |
| `schemaTypes/singletons/productCategory.ts` | Crear                                  |
| `schemaTypes/singletons/siteSettings.ts`    | Crear                                  |
| `schemaTypes/documents/post.ts`             | Crear                                  |
| `schemaTypes/documents/product.ts`          | Crear                                  |
| `schemaTypes/documents/author.ts`           | Crear                                  |
| `schemaTypes/documents/brand.ts`            | Crear                                  |
| `structure/index.ts`                        | Crear                                  |
| `seed.ts`                                   | Crear                                  |

### Astro (`E:\esencia-magnetica`)

| Archivo                     | Acción                                       |
| --------------------------- | -------------------------------------------- |
| `astro.config.mjs`          | Modificar — añadir @sanity/astro integration |
| `tsconfig.json`             | Modificar — añadir @sanity/astro/module type |
| `.env.local`                | Crear — vars sanity (no commitear)           |
| `.env.example`              | Modificar — añadir placeholders sanity       |
| `src/types/sanity.types.ts` | Crear — copiado desde Studio tras TypeGen    |
| `src/lib/sanity.ts`         | Crear — urlFor helper                        |
| `src/lib/queries.ts`        | Crear — queries GROQ                         |

---

## Task 1: Studio — Instalar plugin + TypeGen

**Files:**

- Modify: `E:\esencia-magnetica-studio\sanity.cli.ts`
- Modify: `E:\esencia-magnetica-studio\package.json` (via pnpm)

- [ ] **Step 1: Instalar `@sanity/document-internationalization` y `tsx` en Studio**

```bash
cd E:\esencia-magnetica-studio
pnpm add @sanity/document-internationalization
pnpm add -D tsx
```

Expected: `node_modules/@sanity/document-internationalization` existe, sin errores.

- [ ] **Step 2: Habilitar TypeGen en `sanity.cli.ts`**

Reemplazar el contenido de `E:\esencia-magnetica-studio\sanity.cli.ts`:

```typescript
import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "dtktkh9h",
    dataset: "production",
  },
  typegen: {
    generateConfigPath: "sanity.config.ts",
  },
  deployment: {
    autoUpdates: true,
  },
});
```

- [ ] **Step 3: Verificar que Studio arranca sin errores**

```bash
cd E:\esencia-magnetica-studio
pnpm dev
```

Expected: Studio abre en `http://localhost:3333` sin errores de consola.

- [ ] **Step 4: Commit**

```bash
cd E:\esencia-magnetica-studio
git add package.json pnpm-lock.yaml sanity.cli.ts
git commit -m "feat(studio): install document-internationalization, enable TypeGen"
```

---

## Task 2: Studio — Schemas de objetos compartidos

**Files:**

- Create: `E:\esencia-magnetica-studio\schemaTypes\objects\coverImage.ts`
- Create: `E:\esencia-magnetica-studio\schemaTypes\objects\seo.ts`
- Create: `E:\esencia-magnetica-studio\schemaTypes\objects\blockContent.ts`
- Create: `E:\esencia-magnetica-studio\schemaTypes\objects\youtubeEmbed.ts`
- Create: `E:\esencia-magnetica-studio\schemaTypes\objects\productList.ts`

- [ ] **Step 1: Crear directorios**

```bash
cd E:\esencia-magnetica-studio
mkdir schemaTypes\objects schemaTypes\singletons schemaTypes\documents
```

- [ ] **Step 2: Crear `schemaTypes/objects/coverImage.ts`**

```typescript
import { defineField, defineType } from "sanity";

export const coverImageType = defineType({
  name: "coverImage",
  title: "Imagen",
  type: "object",
  fields: [
    defineField({
      name: "asset",
      type: "image",
      title: "Subir imagen",
      options: { hotspot: true },
    }),
    defineField({
      name: "externalUrl",
      type: "url",
      title: "URL externa (alternativa a subir)",
    }),
    defineField({
      name: "alt",
      type: "string",
      title: "Texto alternativo",
      validation: (r) => r.required(),
    }),
  ],
});
```

- [ ] **Step 3: Crear `schemaTypes/objects/seo.ts`**

```typescript
import { defineField, defineType } from "sanity";

export const seoType = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({ name: "metaTitle", type: "string", title: "Meta título" }),
    defineField({
      name: "metaDescription",
      type: "string",
      title: "Meta descripción",
      validation: (r) => r.max(160),
    }),
    defineField({ name: "ogImage", type: "image", title: "Imagen OG" }),
  ],
});
```

- [ ] **Step 4: Crear `schemaTypes/objects/youtubeEmbed.ts`**

```typescript
import { defineField, defineType } from "sanity";

export const youtubeEmbedType = defineType({
  name: "youtubeEmbed",
  title: "Video de YouTube",
  type: "object",
  fields: [
    defineField({
      name: "url",
      type: "url",
      title: "URL de YouTube",
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { url: "url" },
    prepare({ url }) {
      return { title: "YouTube", subtitle: url };
    },
  },
});
```

- [ ] **Step 5: Crear `schemaTypes/objects/productList.ts`**

```typescript
import { defineArrayMember, defineField, defineType } from "sanity";

export const productListType = defineType({
  name: "productList",
  title: "Lista de productos",
  type: "object",
  fields: [
    defineField({
      name: "products",
      title: "Productos",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "product" }] })],
      validation: (r) => r.min(1),
    }),
  ],
  preview: {
    select: { products: "products" },
    prepare({ products }) {
      return {
        title: "Lista de productos",
        subtitle: `${products?.length ?? 0} producto(s)`,
      };
    },
  },
});
```

- [ ] **Step 6: Crear `schemaTypes/objects/blockContent.ts`**

```typescript
import { defineArrayMember, defineField, defineType } from "sanity";

export const blockContentType = defineType({
  name: "blockContent",
  title: "Contenido",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      marks: {
        decorators: [
          { title: "Negrita", value: "strong" },
          { title: "Cursiva", value: "em" },
        ],
        annotations: [
          defineArrayMember({
            name: "link",
            type: "object",
            fields: [
              defineField({
                name: "href",
                type: "url",
                validation: (r) => r.required(),
              }),
              defineField({
                name: "blank",
                type: "boolean",
                title: "Abrir en nueva pestaña",
                initialValue: true,
              }),
            ],
          }),
        ],
      },
    }),
    defineArrayMember({ type: "youtubeEmbed" }),
    defineArrayMember({ type: "productList" }),
  ],
});
```

- [ ] **Step 7: Commit**

```bash
cd E:\esencia-magnetica-studio
git add schemaTypes/objects/
git commit -m "feat(studio): add shared object schemas (coverImage, seo, blockContent, youtubeEmbed, productList)"
```

---

## Task 3: Studio — Schemas de referencia (categorías + siteSettings)

**Files:**

- Create: `E:\esencia-magnetica-studio\schemaTypes\singletons\blogCategory.ts`
- Create: `E:\esencia-magnetica-studio\schemaTypes\singletons\productCategory.ts`
- Create: `E:\esencia-magnetica-studio\schemaTypes\singletons\siteSettings.ts`

- [ ] **Step 1: Crear `schemaTypes/singletons/blogCategory.ts`**

```typescript
import { defineField, defineType } from "sanity";

export const blogCategoryType = defineType({
  name: "blogCategory",
  title: "Categoría de blog",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nombre",
      type: "object",
      fields: [
        defineField({
          name: "es",
          type: "string",
          title: "ES",
          validation: (r) => r.required(),
        }),
        defineField({
          name: "en",
          type: "string",
          title: "EN",
          validation: (r) => r.required(),
        }),
      ],
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "object",
      fields: [
        defineField({
          name: "es",
          type: "string",
          title: "Slug ES",
          validation: (r) => r.required(),
        }),
        defineField({
          name: "en",
          type: "string",
          title: "Slug EN",
          validation: (r) => r.required(),
        }),
      ],
    }),
  ],
  preview: {
    select: { name: "name" },
    prepare({ name }) {
      return { title: name?.es ?? "Sin nombre", subtitle: name?.en };
    },
  },
});
```

- [ ] **Step 2: Crear `schemaTypes/singletons/productCategory.ts`**

```typescript
import { defineField, defineType } from "sanity";

export const productCategoryType = defineType({
  name: "productCategory",
  title: "Categoría de producto",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nombre",
      type: "object",
      fields: [
        defineField({
          name: "es",
          type: "string",
          title: "ES",
          validation: (r) => r.required(),
        }),
        defineField({
          name: "en",
          type: "string",
          title: "EN",
          validation: (r) => r.required(),
        }),
      ],
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "object",
      fields: [
        defineField({
          name: "es",
          type: "string",
          title: "Slug ES",
          validation: (r) => r.required(),
        }),
        defineField({
          name: "en",
          type: "string",
          title: "Slug EN",
          validation: (r) => r.required(),
        }),
      ],
    }),
  ],
  preview: {
    select: { name: "name" },
    prepare({ name }) {
      return { title: name?.es ?? "Sin nombre", subtitle: name?.en };
    },
  },
});
```

- [ ] **Step 3: Crear `schemaTypes/singletons/siteSettings.ts`**

```typescript
import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Ajustes del sitio",
  type: "document",
  fields: [
    defineField({
      name: "navLinks",
      title: "Navegación",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "label",
              type: "object",
              fields: [
                defineField({
                  name: "es",
                  type: "string",
                  title: "ES",
                  validation: (r) => r.required(),
                }),
                defineField({
                  name: "en",
                  type: "string",
                  title: "EN",
                  validation: (r) => r.required(),
                }),
              ],
            }),
            defineField({
              name: "href",
              type: "string",
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: { label: "label" },
            prepare({ label }) {
              return {
                title: label?.es ?? "Sin etiqueta",
                subtitle: label?.en,
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "socialLinks",
      title: "Redes sociales",
      type: "object",
      fields: [
        defineField({ name: "instagram", type: "url" }),
        defineField({ name: "youtube", type: "url" }),
        defineField({ name: "facebook", type: "url" }),
      ],
    }),
    defineField({
      name: "affiliateDisclosure",
      title: "Aviso de afiliados",
      type: "object",
      fields: [
        defineField({
          name: "es",
          type: "text",
          title: "ES",
          validation: (r) => r.required(),
        }),
        defineField({
          name: "en",
          type: "text",
          title: "EN",
          validation: (r) => r.required(),
        }),
      ],
    }),
    defineField({
      name: "defaultSeo",
      title: "SEO por defecto",
      type: "object",
      fields: [
        defineField({
          name: "title",
          type: "object",
          fields: [
            defineField({ name: "es", type: "string" }),
            defineField({ name: "en", type: "string" }),
          ],
        }),
        defineField({
          name: "description",
          type: "object",
          fields: [
            defineField({ name: "es", type: "text" }),
            defineField({ name: "en", type: "text" }),
          ],
        }),
        defineField({ name: "ogImage", type: "image" }),
      ],
    }),
  ],
});
```

- [ ] **Step 4: Commit**

```bash
cd E:\esencia-magnetica-studio
git add schemaTypes/singletons/
git commit -m "feat(studio): add blogCategory, productCategory, siteSettings schemas"
```

---

## Task 4: Studio — Schemas de documentos (post, product, author, brand)

**Files:**

- Create: `E:\esencia-magnetica-studio\schemaTypes\documents\post.ts`
- Create: `E:\esencia-magnetica-studio\schemaTypes\documents\product.ts`
- Create: `E:\esencia-magnetica-studio\schemaTypes\documents\author.ts`
- Create: `E:\esencia-magnetica-studio\schemaTypes\documents\brand.ts`

- [ ] **Step 1: Crear `schemaTypes/documents/post.ts`**

```typescript
import { defineArrayMember, defineField, defineType } from "sanity";

export const postType = defineType({
  name: "post",
  title: "Post",
  type: "document",
  fields: [
    // El plugin @sanity/document-internationalization inyecta este campo.
    // Debe estar en el schema para que TypeGen lo reconozca.
    defineField({
      name: "language",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "title",
      type: "string",
      title: "Título",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "excerpt", type: "text", title: "Extracto", rows: 3 }),
    defineField({ name: "body", type: "blockContent", title: "Contenido" }),
    defineField({
      name: "coverImage",
      type: "coverImage",
      title: "Imagen de portada",
    }),
    defineField({
      name: "category",
      type: "reference",
      title: "Categoría",
      to: [{ type: "blogCategory" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "tags",
      type: "array",
      title: "Etiquetas",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      title: "Fecha de publicación",
    }),
    defineField({
      name: "featured",
      type: "boolean",
      title: "Destacado",
      initialValue: false,
    }),
    defineField({ name: "seo", type: "seo", title: "SEO" }),
  ],
  preview: {
    select: { title: "title", media: "coverImage.asset", language: "language" },
    prepare({ title, media, language }) {
      return { title, media, subtitle: language?.toUpperCase() };
    },
  },
});
```

- [ ] **Step 2: Crear `schemaTypes/documents/product.ts`**

```typescript
import { defineField, defineType } from "sanity";

export const productType = defineType({
  name: "product",
  title: "Producto",
  type: "document",
  fields: [
    defineField({
      name: "language",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "name",
      type: "string",
      title: "Nombre",
      validation: (r) => r.required(),
    }),
    defineField({ name: "image", type: "coverImage", title: "Imagen" }),
    defineField({
      name: "category",
      type: "reference",
      title: "Categoría",
      to: [{ type: "productCategory" }],
    }),
    defineField({
      name: "store",
      type: "string",
      title: "Tienda",
      options: {
        list: [
          { title: "Amazon", value: "amazon" },
          { title: "Shein", value: "shein" },
          { title: "Otra", value: "other" },
        ],
      },
    }),
    defineField({
      name: "affiliateUrl",
      type: "url",
      title: "URL de afiliado",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "shortDescription",
      type: "text",
      title: "Descripción corta",
      rows: 3,
    }),
    defineField({
      name: "active",
      type: "boolean",
      title: "Activo",
      initialValue: true,
    }),
    defineField({ name: "publishedAt", type: "datetime", title: "Fecha" }),
  ],
  preview: {
    select: { title: "name", media: "image.asset", language: "language" },
    prepare({ title, media, language }) {
      return { title, media, subtitle: language?.toUpperCase() };
    },
  },
});
```

- [ ] **Step 3: Crear `schemaTypes/documents/author.ts`**

```typescript
import { defineArrayMember, defineField, defineType } from "sanity";

export const authorType = defineType({
  name: "author",
  title: "Autora",
  type: "document",
  fields: [
    defineField({
      name: "name",
      type: "string",
      title: "Nombre",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "photo",
      type: "image",
      title: "Foto",
      options: { hotspot: true },
    }),
    defineField({ name: "role", type: "string", title: "Rol" }),
    defineField({
      name: "bio",
      type: "array",
      title: "Biografía",
      of: [defineArrayMember({ type: "block" })],
    }),
  ],
  preview: {
    select: { title: "name", media: "photo" },
  },
});
```

- [ ] **Step 4: Crear `schemaTypes/documents/brand.ts`**

```typescript
import { defineArrayMember, defineField, defineType } from "sanity";

export const brandType = defineType({
  name: "brand",
  title: "Marca",
  type: "document",
  fields: [
    defineField({
      name: "name",
      type: "string",
      title: "Nombre",
      validation: (r) => r.required(),
    }),
    defineField({ name: "tagline", type: "string", title: "Tagline" }),
    defineField({
      name: "photos",
      type: "array",
      title: "Fotos",
      of: [defineArrayMember({ type: "image", options: { hotspot: true } })],
    }),
    defineField({
      name: "mission",
      type: "array",
      title: "Misión",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "vision",
      type: "array",
      title: "Visión",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "philosophy",
      type: "array",
      title: "Filosofía",
      of: [defineArrayMember({ type: "block" })],
    }),
  ],
  preview: {
    select: { title: "name" },
  },
});
```

- [ ] **Step 5: Commit**

```bash
cd E:\esencia-magnetica-studio
git add schemaTypes/documents/
git commit -m "feat(studio): add post, product, author, brand document schemas"
```

---

## Task 5: Studio — Registrar schemas + actualizar sanity.config.ts

**Files:**

- Modify: `E:\esencia-magnetica-studio\schemaTypes\index.ts`
- Modify: `E:\esencia-magnetica-studio\sanity.config.ts`

- [ ] **Step 1: Reemplazar `schemaTypes/index.ts`**

```typescript
import { blockContentType } from "./objects/blockContent";
import { coverImageType } from "./objects/coverImage";
import { seoType } from "./objects/seo";
import { youtubeEmbedType } from "./objects/youtubeEmbed";
import { productListType } from "./objects/productList";
import { blogCategoryType } from "./singletons/blogCategory";
import { productCategoryType } from "./singletons/productCategory";
import { siteSettingsType } from "./singletons/siteSettings";
import { postType } from "./documents/post";
import { productType } from "./documents/product";
import { authorType } from "./documents/author";
import { brandType } from "./documents/brand";

export const schemaTypes = [
  // Objects
  blockContentType,
  coverImageType,
  seoType,
  youtubeEmbedType,
  productListType,
  // References / singletons
  blogCategoryType,
  productCategoryType,
  siteSettingsType,
  // Documents
  postType,
  productType,
  authorType,
  brandType,
];
```

- [ ] **Step 2: Reemplazar `sanity.config.ts`**

```typescript
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { documentInternationalization } from "@sanity/document-internationalization";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";

export default defineConfig({
  name: "default",
  title: "Esencia Magnética",
  projectId: "dtktkh9h",
  dataset: "production",
  plugins: [
    structureTool({ structure }),
    visionTool(),
    documentInternationalization({
      supportedLanguages: [
        { id: "es", title: "Español" },
        { id: "en", title: "English" },
      ],
      schemaTypes: ["post", "product"],
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
```

- [ ] **Step 3: Verificar que Studio arranca con los schemas cargados**

```bash
cd E:\esencia-magnetica-studio
pnpm dev
```

Expected: Studio abre, menú lateral muestra tipos (aunque sin estructura custom todavía). Sin errores rojos en consola.

- [ ] **Step 4: Commit**

```bash
cd E:\esencia-magnetica-studio
git add schemaTypes/index.ts sanity.config.ts
git commit -m "feat(studio): register all schemas and configure document-internationalization plugin"
```

---

## Task 6: Studio — Estructura del desk

**Files:**

- Create: `E:\esencia-magnetica-studio\structure\index.ts`

- [ ] **Step 1: Crear `structure/index.ts`**

```typescript
import type { StructureResolver } from "sanity/structure";

const LOCALES = [
  { id: "es", title: "Español" },
  { id: "en", title: "English" },
];

// Crea entradas de singleton localizadas con IDs fijos (brand-es, author-es, etc.)
function localizedSingleton(
  S: Parameters<StructureResolver>[0],
  typeName: string,
  title: string,
) {
  return S.listItem()
    .title(title)
    .child(
      S.list()
        .title(title)
        .items(
          LOCALES.map((locale) =>
            S.listItem()
              .title(`${title} (${locale.title})`)
              .child(
                S.document()
                  .schemaType(typeName)
                  .documentId(`${typeName}-${locale.id}`)
                  .title(`${title} (${locale.title})`),
              ),
          ),
        ),
    );
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Esencia Magnética")
    .items([
      S.listItem()
        .title("Posts")
        .child(S.documentTypeList("post").title("Posts")),

      S.listItem()
        .title("Productos")
        .child(S.documentTypeList("product").title("Productos")),

      S.divider(),

      S.listItem()
        .title("Taxonomía")
        .child(
          S.list()
            .title("Taxonomía")
            .items([
              S.documentTypeListItem("blogCategory").title(
                "Categorías de blog",
              ),
              S.documentTypeListItem("productCategory").title(
                "Categorías de producto",
              ),
            ]),
        ),

      S.divider(),

      localizedSingleton(S, "brand", "Marca"),
      localizedSingleton(S, "author", "Autora"),

      S.divider(),

      S.listItem()
        .title("Ajustes del sitio")
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings")
            .title("Ajustes del sitio"),
        ),
    ]);
```

- [ ] **Step 2: Verificar estructura en Studio**

```bash
cd E:\esencia-magnetica-studio
pnpm dev
```

Expected: menú lateral muestra Posts, Productos, Taxonomía, Marca, Autora, Ajustes del sitio. Al abrir Marca → lista ES / EN. Al abrir Ajustes del sitio → un único documento.

- [ ] **Step 3: Commit**

```bash
cd E:\esencia-magnetica-studio
git add structure/
git commit -m "feat(studio): add custom desk structure with singletons and localized brand/author"
```

---

## Task 7: Astro — Instalar dependencias + configurar integración

**Files:**

- Modify: `E:\esencia-magnetica\astro.config.mjs`
- Modify: `E:\esencia-magnetica\tsconfig.json`
- Create: `E:\esencia-magnetica\.env.local`
- Modify: `E:\esencia-magnetica\.env.example` (si existe, si no crear)

- [ ] **Step 1: Instalar dependencias en Astro**

```bash
cd E:\esencia-magnetica
pnpm add @sanity/astro @sanity/image-url groq
```

Expected: sin errores. `node_modules/@sanity/astro` existe.

- [ ] **Step 2: Crear `.env.local`**

Crear el archivo `E:\esencia-magnetica\.env.local` con los valores reales del proyecto (nunca commitear este archivo):

```
PUBLIC_SANITY_PROJECT_ID=dtktkh9h
PUBLIC_SANITY_DATASET=production
```

- [ ] **Step 3: Crear/actualizar `.env.example`**

Si no existe, crear `E:\esencia-magnetica\.env.example`. Si existe, añadir al final:

```
PUBLIC_SANITY_PROJECT_ID=your-project-id
PUBLIC_SANITY_DATASET=production
```

- [ ] **Step 4: Verificar `.env.local` está en `.gitignore`**

```bash
cd E:\esencia-magnetica
grep ".env.local" .gitignore
```

Expected: aparece `.env.local` en la salida. Si no, añadirlo:

```bash
echo ".env.local" >> .gitignore
```

- [ ] **Step 5: Actualizar `astro.config.mjs`**

Reemplazar el contenido completo de `E:\esencia-magnetica\astro.config.mjs`:

```javascript
// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";
import path from "path";
import { loadEnv } from "vite";
import sanity from "@sanity/astro";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } = loadEnv(
  process.env.NODE_ENV ?? "development",
  process.cwd(),
  "",
);

export default defineConfig({
  integrations: [
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      useCdn: false,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  },
});
```

- [ ] **Step 6: Actualizar `tsconfig.json`**

Reemplazar el contenido de `E:\esencia-magnetica\tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["@sanity/astro/module"]
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 7: Verificar que Astro arranca**

```bash
cd E:\esencia-magnetica
pnpm dev
```

Expected: servidor arranca en `http://localhost:4321` sin errores.

- [ ] **Step 8: Commit**

```bash
cd E:\esencia-magnetica
git add astro.config.mjs tsconfig.json .env.example
git commit -m "feat: add @sanity/astro integration with project config"
```

---

## Task 8: Astro — Helper urlFor + queries GROQ

**Files:**

- Create: `E:\esencia-magnetica\src\lib\sanity.ts`
- Create: `E:\esencia-magnetica\src\lib\queries.ts`

- [ ] **Step 1: Crear `src/lib/sanity.ts`**

```typescript
import imageUrlBuilder from "@sanity/image-url";
import { sanityClient } from "sanity:client";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

const builder = imageUrlBuilder(sanityClient);

export const urlFor = (source: SanityImageSource) => builder.image(source);
```

- [ ] **Step 2: Crear `src/lib/queries.ts`**

```typescript
import { defineQuery } from "groq";

export const postsQuery = defineQuery(`
  *[_type == "post" && language == $lang] | order(publishedAt desc) {
    _id, title, slug, excerpt, publishedAt, featured,
    coverImage, "category": category->{ name }
  }
`);

export const postBySlugQuery = defineQuery(`
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

export const authorQuery = defineQuery(`
  *[_id == "author-" + $lang][0] {
    name, photo, role, bio
  }
`);
```

- [ ] **Step 3: Verificar typecheck**

```bash
cd E:\esencia-magnetica
pnpm typecheck
```

Expected: 0 errores. Si `sanity:client` da error, verificar que `@sanity/astro/module` está en `tsconfig.json` y que `pnpm dev` estuvo corriendo al menos una vez para que Astro genere `.astro/types.d.ts`.

- [ ] **Step 4: Commit**

```bash
cd E:\esencia-magnetica
git add src/lib/sanity.ts src/lib/queries.ts
git commit -m "feat: add urlFor helper and GROQ queries for Sanity"
```

---

## Task 9: TypeGen — Generar y copiar tipos

**Files:**

- Create: `E:\esencia-magnetica\src\types\sanity.types.ts`

- [ ] **Step 1: Generar tipos en Studio**

```bash
cd E:\esencia-magnetica-studio
pnpm exec sanity schema extract
pnpm exec sanity typegen generate
```

Expected: se crea `sanity.types.ts` en la raíz del Studio y `schema.json`.

- [ ] **Step 2: Copiar tipos a Astro**

```powershell
New-Item -ItemType Directory -Force "E:\esencia-magnetica\src\types"
Copy-Item "E:\esencia-magnetica-studio\sanity.types.ts" "E:\esencia-magnetica\src\types\sanity.types.ts"
```

- [ ] **Step 3: Verificar typecheck en Astro tras copiar**

```bash
cd E:\esencia-magnetica
pnpm typecheck
```

Expected: 0 errores.

- [ ] **Step 4: Añadir `schema.json` y `sanity.types.ts` a `.gitignore` del Studio**

En `E:\esencia-magnetica-studio\.gitignore`, añadir:

```
schema.json
sanity.types.ts
```

Los tipos se regeneran cada vez que cambia el schema, no tiene sentido commitearlos en el Studio. En el repo Astro sí se commitean.

- [ ] **Step 5: Commit en Astro**

```bash
cd E:\esencia-magnetica
git add src/types/sanity.types.ts
git commit -m "feat: add Sanity TypeGen generated types"
```

---

## Task 10: Seed — Contenido inicial

**Files:**

- Create: `E:\esencia-magnetica-studio\seed.ts`

- [ ] **Step 1: Obtener un token de escritura de Sanity**

Ir a: `https://sanity.io/manage/project/dtktkh9h/api` → API → Tokens → Add API token → nombre "seed" → permisos "Editor" → copiar el token.

- [ ] **Step 2: Crear `seed.ts` en Studio**

```typescript
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "dtktkh9h",
  dataset: "production",
  token: process.env.SANITY_TOKEN,
  apiVersion: "2025-01-01",
  useCdn: false,
});

const blogCategories = [
  {
    name: { es: "Outfits", en: "Outfits" },
    slug: { es: "outfits", en: "outfits" },
  },
  {
    name: { es: "Tendencias", en: "Trends" },
    slug: { es: "tendencias", en: "trends" },
  },
  { name: { es: "Estilo", en: "Style" }, slug: { es: "estilo", en: "style" } },
  {
    name: { es: "Combinaciones", en: "Combinations" },
    slug: { es: "combinaciones", en: "combinations" },
  },
  {
    name: { es: "Ocasiones", en: "Occasions" },
    slug: { es: "ocasiones", en: "occasions" },
  },
  {
    name: { es: "Viajes", en: "Travel" },
    slug: { es: "viajes", en: "travel" },
  },
];

const productCategories = [
  {
    name: { es: "Outfits", en: "Outfits" },
    slug: { es: "outfits", en: "outfits" },
  },
  { name: { es: "Tops", en: "Tops" }, slug: { es: "tops", en: "tops" } },
  {
    name: { es: "Pantalones", en: "Pants" },
    slug: { es: "pantalones", en: "pants" },
  },
  {
    name: { es: "Vestidos", en: "Dresses" },
    slug: { es: "vestidos", en: "dresses" },
  },
  {
    name: { es: "Zapatos", en: "Shoes" },
    slug: { es: "zapatos", en: "shoes" },
  },
  { name: { es: "Bolsos", en: "Bags" }, slug: { es: "bolsos", en: "bags" } },
  {
    name: { es: "Accesorios", en: "Accessories" },
    slug: { es: "accesorios", en: "accessories" },
  },
  {
    name: { es: "Peinados", en: "Hairstyles" },
    slug: { es: "peinados", en: "hairstyles" },
  },
];

async function seed() {
  console.log("🌱 Iniciando seed...");

  // Crear blogCategories
  const blogCatDocs = await Promise.all(
    blogCategories.map((cat) =>
      client.create({ _type: "blogCategory", ...cat }),
    ),
  );
  console.log(`✅ ${blogCatDocs.length} categorías de blog creadas`);

  // Crear productCategories
  const prodCatDocs = await Promise.all(
    productCategories.map((cat) =>
      client.create({ _type: "productCategory", ...cat }),
    ),
  );
  console.log(`✅ ${prodCatDocs.length} categorías de producto creadas`);

  // Crear author-es y author-en (singletons con ID fijo)
  await client.createOrReplace({
    _id: "author-es",
    _type: "author",
    name: "Nombre de la autora",
    role: "Creadora de contenido de moda",
    bio: [
      {
        _type: "block",
        _key: "bio-es",
        children: [
          {
            _type: "span",
            _key: "s1",
            text: "Biografía placeholder en español.",
          },
        ],
        markDefs: [],
        style: "normal",
      },
    ],
  });
  await client.createOrReplace({
    _id: "author-en",
    _type: "author",
    name: "Author name",
    role: "Fashion content creator",
    bio: [
      {
        _type: "block",
        _key: "bio-en",
        children: [
          {
            _type: "span",
            _key: "s1",
            text: "Placeholder biography in English.",
          },
        ],
        markDefs: [],
        style: "normal",
      },
    ],
  });
  console.log("✅ Autora ES + EN creadas");

  // Crear brand-es y brand-en (singletons con ID fijo)
  await client.createOrReplace({
    _id: "brand-es",
    _type: "brand",
    name: "Esencia Magnética",
    tagline: "Estilo auténtico para mujeres de carácter",
    mission: [
      {
        _type: "block",
        _key: "mission-es",
        children: [{ _type: "span", _key: "s1", text: "Misión placeholder." }],
        markDefs: [],
        style: "normal",
      },
    ],
    vision: [
      {
        _type: "block",
        _key: "vision-es",
        children: [{ _type: "span", _key: "s1", text: "Visión placeholder." }],
        markDefs: [],
        style: "normal",
      },
    ],
    philosophy: [
      {
        _type: "block",
        _key: "philo-es",
        children: [
          { _type: "span", _key: "s1", text: "Filosofía placeholder." },
        ],
        markDefs: [],
        style: "normal",
      },
    ],
  });
  await client.createOrReplace({
    _id: "brand-en",
    _type: "brand",
    name: "Esencia Magnética",
    tagline: "Authentic style for women of character",
    mission: [
      {
        _type: "block",
        _key: "mission-en",
        children: [{ _type: "span", _key: "s1", text: "Mission placeholder." }],
        markDefs: [],
        style: "normal",
      },
    ],
    vision: [
      {
        _type: "block",
        _key: "vision-en",
        children: [{ _type: "span", _key: "s1", text: "Vision placeholder." }],
        markDefs: [],
        style: "normal",
      },
    ],
    philosophy: [
      {
        _type: "block",
        _key: "philo-en",
        children: [
          { _type: "span", _key: "s1", text: "Philosophy placeholder." },
        ],
        markDefs: [],
        style: "normal",
      },
    ],
  });
  console.log("✅ Brand ES + EN creadas");

  // Crear siteSettings singleton
  await client.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    navLinks: [
      { _key: "nav-blog", label: { es: "Blog", en: "Blog" }, href: "/blog" },
      {
        _key: "nav-products",
        label: { es: "Productos", en: "Products" },
        href: "/productos",
      },
      {
        _key: "nav-brand",
        label: { es: "La Marca", en: "About" },
        href: "/marca",
      },
    ],
    socialLinks: {
      instagram: "https://instagram.com/esenciamagnética",
      youtube: "https://youtube.com/@esenciamagnética",
      facebook: "https://facebook.com/esenciamagnética",
    },
    affiliateDisclosure: {
      es: "Este sitio contiene enlaces de afiliado. Si compras a través de ellos, recibo una pequeña comisión sin coste adicional para ti.",
      en: "This site contains affiliate links. If you purchase through them, I receive a small commission at no extra cost to you.",
    },
    defaultSeo: {
      title: { es: "Esencia Magnética", en: "Esencia Magnética" },
      description: {
        es: "Moda y estilo para mujeres de 40+",
        en: "Fashion and style for women 40+",
      },
    },
  });
  console.log("✅ Site settings creados");

  // Crear productos de ejemplo (4 ES + 4 EN)
  const firstProdCatId = prodCatDocs[0]._id;

  const sampleProductsEs = [
    {
      name: "Blusa lino manga larga",
      store: "amazon",
      affiliateUrl: "https://amazon.es",
      shortDescription: "Perfecta para look casual chic.",
    },
    {
      name: "Pantalón palazzo beige",
      store: "shein",
      affiliateUrl: "https://shein.com",
      shortDescription: "Cómodo y elegante para el día a día.",
    },
    {
      name: "Bolso tote cuero genuino",
      store: "amazon",
      affiliateUrl: "https://amazon.es",
      shortDescription: "Bolso versátil para cualquier ocasión.",
    },
    {
      name: "Sandalias planas trenzadas",
      store: "other",
      affiliateUrl: "https://example.com",
      shortDescription: "Comodidad con estilo mediterráneo.",
    },
  ];

  const sampleProductsEn = [
    {
      name: "Long sleeve linen blouse",
      store: "amazon",
      affiliateUrl: "https://amazon.com",
      shortDescription: "Perfect for a casual chic look.",
    },
    {
      name: "Beige palazzo pants",
      store: "shein",
      affiliateUrl: "https://shein.com",
      shortDescription: "Comfortable and elegant for everyday.",
    },
    {
      name: "Genuine leather tote bag",
      store: "amazon",
      affiliateUrl: "https://amazon.com",
      shortDescription: "Versatile bag for any occasion.",
    },
    {
      name: "Braided flat sandals",
      store: "other",
      affiliateUrl: "https://example.com",
      shortDescription: "Comfort with Mediterranean style.",
    },
  ];

  await Promise.all([
    ...sampleProductsEs.map((p) =>
      client.create({
        _type: "product",
        language: "es",
        active: true,
        publishedAt: new Date().toISOString(),
        category: { _type: "reference", _ref: firstProdCatId },
        ...p,
      }),
    ),
    ...sampleProductsEn.map((p) =>
      client.create({
        _type: "product",
        language: "en",
        active: true,
        publishedAt: new Date().toISOString(),
        category: { _type: "reference", _ref: firstProdCatId },
        ...p,
      }),
    ),
  ]);
  console.log("✅ 4 productos ES + 4 productos EN creados");

  // Crear posts de ejemplo (2 ES + 2 EN)
  const firstBlogCatId = blogCatDocs[0]._id;

  const block = (text: string, key: string) => ({
    _type: "block",
    _key: key,
    children: [{ _type: "span", _key: `${key}-s`, text }],
    markDefs: [],
    style: "normal",
  });

  await Promise.all([
    client.create({
      _type: "post",
      language: "es",
      title: "Cómo combinar colores neutros este otoño",
      slug: { _type: "slug", current: "como-combinar-colores-neutros-otono" },
      excerpt:
        "Los tonos tierra son tus aliados esta temporada. Descubre cómo mezclarlos con elegancia.",
      body: [
        block(
          "Los colores neutros como el beige, el camel y el marrón son la base perfecta para crear looks sofisticados y atemporales.",
          "p1",
        ),
      ],
      category: { _type: "reference", _ref: firstBlogCatId },
      featured: true,
      publishedAt: new Date().toISOString(),
    }),
    client.create({
      _type: "post",
      language: "es",
      title: "5 prendas clave para tu armario cápsula",
      slug: { _type: "slug", current: "5-prendas-clave-armario-capsula" },
      excerpt:
        "Un armario cápsula bien construido te ahorra tiempo y dinero cada mañana.",
      body: [
        block(
          "El armario cápsula es la filosofía que te permite vestir bien todos los días sin estrés. Aquí van las 5 prendas que no pueden faltar.",
          "p1",
        ),
      ],
      category: { _type: "reference", _ref: firstBlogCatId },
      featured: false,
      publishedAt: new Date().toISOString(),
    }),
    client.create({
      _type: "post",
      language: "en",
      title: "How to combine neutral colors this autumn",
      slug: { _type: "slug", current: "how-to-combine-neutral-colors-autumn" },
      excerpt:
        "Earth tones are your allies this season. Discover how to mix them with elegance.",
      body: [
        block(
          "Neutral colors like beige, camel, and brown are the perfect base for creating sophisticated and timeless looks.",
          "p1",
        ),
      ],
      category: { _type: "reference", _ref: firstBlogCatId },
      featured: true,
      publishedAt: new Date().toISOString(),
    }),
    client.create({
      _type: "post",
      language: "en",
      title: "5 key pieces for your capsule wardrobe",
      slug: { _type: "slug", current: "5-key-pieces-capsule-wardrobe" },
      excerpt:
        "A well-built capsule wardrobe saves you time and money every morning.",
      body: [
        block(
          "The capsule wardrobe is the philosophy that lets you dress well every day without stress. Here are the 5 pieces you cannot miss.",
          "p1",
        ),
      ],
      category: { _type: "reference", _ref: firstBlogCatId },
      featured: false,
      publishedAt: new Date().toISOString(),
    }),
  ]);
  console.log("✅ 2 posts ES + 2 posts EN creados");

  console.log("🎉 Seed completado.");
}

seed().catch((err) => {
  console.error("❌ Error en seed:", err);
  process.exit(1);
});
```

- [ ] **Step 3: Ejecutar el seed**

```bash
cd E:\esencia-magnetica-studio
$env:SANITY_TOKEN="tu-token-aqui"; pnpm exec tsx seed.ts
```

Expected:

```
🌱 Iniciando seed...
✅ 6 categorías de blog creadas
✅ 8 categorías de producto creadas
✅ Autora ES + EN creadas
✅ Brand ES + EN creadas
✅ Site settings creados
✅ 4 productos ES + 4 productos EN creados
✅ 2 posts ES + 2 posts EN creados
🎉 Seed completado.
```

- [ ] **Step 4: Verificar en Studio que el contenido aparece**

Abrir `http://localhost:3333` en el navegador y verificar:

- Posts → muestra 4 documentos (2 ES flag, 2 EN flag)
- Productos → muestra 8 documentos
- Taxonomía → Categorías de blog muestra 6, de producto muestra 8
- Marca → ES y EN tienen contenido
- Ajustes del sitio → tiene nav links y redes sociales

- [ ] **Step 5: Commit seed script (sin token en el código)**

```bash
cd E:\esencia-magnetica-studio
git add seed.ts
git commit -m "feat(studio): add seed script for initial content"
```

---

## Task 11: Verificación final en Astro

- [ ] **Step 1: Lint**

```bash
cd E:\esencia-magnetica
pnpm lint
```

Expected: 0 errores.

- [ ] **Step 2: Typecheck**

```bash
cd E:\esencia-magnetica
pnpm typecheck
```

Expected: 0 errores.

- [ ] **Step 3: Build**

```bash
cd E:\esencia-magnetica
pnpm build
```

Expected: build completa sin errores. La integración `@sanity/astro` no rompe el build aunque no haya páginas que consuman Sanity todavía.

- [ ] **Step 4: Smoke test de queries en Sanity Vision**

Abrir Studio → Vision → ejecutar estas queries para confirmar que el seed existe y los schemas están bien:

```groq
*[_type == "post" && language == "es"]{title, slug, language}
```

Expected: 2 resultados.

```groq
*[_type == "blogCategory"]{name}
```

Expected: 6 resultados.

```groq
*[_id == "siteSettings"][0]{navLinks}
```

Expected: objeto con 3 nav links.

- [ ] **Step 5: Commit final**

```bash
cd E:\esencia-magnetica
git add -A
git commit -m "feat(stage-03): complete Sanity CMS setup — schemas, client, queries, TypeGen"
```

---

## Notas de implementación

- **Deploy de Studio**: el usuario gestiona Studio en local (`E:\esencia-magnetica-studio`). El deploy a sanity.io (`pnpm sanity deploy`) queda fuera de Stage 03 — se hace en Stage 12 cuando haya que dar acceso a la brand owner desde Mac.
- **`sanity:client`** es un virtual module de `@sanity/astro`. Para que TypeScript lo reconozca, `"types": ["@sanity/astro/module"]` debe estar en `tsconfig.json` y el servidor de desarrollo debe haber corrido al menos una vez (genera `.astro/types.d.ts`).
- **TypeGen**: cada vez que se modifiquen schemas en Studio, repetir Task 9 (extraer + generar + copiar). En Stage 06+ se puede automatizar con un script npm.
- **Token de seed**: el token solo se necesita para el seed. No hardcodearlo — usar variable de entorno temporal.
- **Singletons localizados** (`brand-es`, `brand-en`, `author-es`, `author-en`): se consultan por ID fijo, no por `language`. Queries: `*[_id == "brand-" + $lang][0]`.
