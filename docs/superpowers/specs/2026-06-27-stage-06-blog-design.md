# Stage 06 — Blog: Listing + Post Detail

**Fecha:** 2026-06-27  
**Estado:** Aprobado — listo para implementación

---

## Objetivo

Implementar el blog completo en ambos locales (ES/EN):

- Listado `/blog` y `/en/blog` con filtros por categoría, búsqueda y paginación.
- Detalle `/blog/[slug]` y `/en/blog/[slug]` con Portable Text, YouTube embed, productos relacionados y SEO completo.

---

## Decisiones de arquitectura

| Decisión          | Elección                                               | Razón                                                             |
| ----------------- | ------------------------------------------------------ | ----------------------------------------------------------------- |
| Output Astro      | `hybrid`                                               | Posts dinámicos desde Sanity; sin contenido estático pre-generado |
| Filtros           | Query params server-side (`?categoria`, `?q`, `?page`) | El blog siempre funciona desde el servidor                        |
| Búsqueda          | Server-side vía GROQ `match`                           | Consistencia con el enfoque server-first                          |
| YouTube           | Façade (miniatura + click-to-load)                     | Core Web Vitals; sin scripts de YouTube hasta el click            |
| SEO               | `astro-seo`                                            | Plugin dedicado; reemplaza meta tags manuales en BaseLayout       |
| Facebook Comments | Placeholder `<!-- TODO Stage 09 -->`                   | Dependencia explícita del Stage 09 (FB SDK)                       |

---

## Cambios en configuración

### `astro.config.mjs`

```js
output: "hybrid";
```

Las páginas existentes siguen siendo estáticas por defecto. Solo las páginas del blog llevan `export const prerender = false`.

### Nueva dependencia

```bash
pnpm add astro-seo
```

---

## Capa de datos

### `src/lib/constants.ts` — añadir

```ts
export const POSTS_PER_PAGE = 12;
```

### `src/lib/queries.ts` — queries nuevas

```ts
// Listado filtrado con paginación
export const postsFilteredQuery = defineQuery(`
  *[_type == "post" && language == $lang
    && ($categoria == "" || category->slug.current == $categoria)
    && ($q == "" || title match $q || pt::text(body) match $q)
  ] | order(publishedAt desc) [$offset...$limit] {
    _id, title, slug, excerpt, publishedAt, featured,
    coverImage, "category": category->{ name, slug }
  }
`);

export const postsCountQuery = defineQuery(`
  count(*[_type == "post" && language == $lang
    && ($categoria == "" || category->slug.current == $categoria)
    && ($q == "" || title match $q || pt::text(body) match $q)
  ])
`);
```

Queries existentes reutilizadas sin cambios: `blogCategoriesQuery`, `postBySlugQuery`.

### `src/lib/blog/postViewModel.ts` — nueva

```ts
export function formatPostDate(iso: string, lang: "es" | "en"): string;
export function readingTime(body: unknown[]): number; // retorna minutos
```

Tests obligatorios por regla TDD del proyecto: `src/lib/blog/postViewModel.test.ts`.

---

## i18n — keys nuevas (`src/i18n/ui.ts`)

Añadir en ambos locales al mismo tiempo:

| Key                       | ES                                                             | EN                                                         |
| ------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- |
| `blog.description`        | Moda, estilo y consejos para mujeres que saben lo que quieren. | Fashion, style and tips for women who know what they want. |
| `blog.all`                | Todo                                                           | All                                                        |
| `blog.search.placeholder` | Buscar…                                                        | Search…                                                    |
| `blog.featured`           | Destacado                                                      | Featured                                                   |
| `blog.empty`              | No hay publicaciones todavía.                                  | No posts yet.                                              |
| `blog.empty.search`       | Sin resultados para "{q}".                                     | No results for "{q}".                                      |
| `blog.read`               | Leer más                                                       | Read more                                                  |
| `blog.pagination.prev`    | Anterior                                                       | Previous                                                   |
| `blog.pagination.next`    | Siguiente                                                      | Next                                                       |
| `blog.related`            | Productos relacionados                                         | Related products                                           |
| `blog.by`                 | Por                                                            | By                                                         |
| `blog.minutes`            | min de lectura                                                 | min read                                                   |
| `post.play`               | Reproducir video                                               | Play video                                                 |

---

## Estructura de archivos

```
src/
├── pages/
│   ├── blog/
│   │   ├── index.astro          # listing ES — prerender: false
│   │   └── [slug].astro         # detalle ES — prerender: false
│   └── en/blog/
│       ├── index.astro          # listing EN — prerender: false
│       └── [slug].astro         # detalle EN — prerender: false
├── layouts/
│   └── BlogPostLayout.astro     # template sin datos
├── components/blog/
│   ├── BlogFilters.astro        # chips categoría + form búsqueda
│   ├── FeaturedPost.astro       # tarjeta horizontal destacada
│   ├── PostCard.astro           # tarjeta de grid
│   ├── PostGrid.astro           # grid 3 col + estado vacío
│   ├── BlogPagination.astro     # paginación minimal
│   ├── PostHero.astro           # título, meta, cover
│   ├── PostBody.astro           # renderer Portable Text
│   ├── YouTubeEmbed.astro       # façade miniatura + click-to-load
│   ├── RelatedProducts.astro    # productos afiliados
│   └── FacebookComments.astro  # placeholder Stage 09
└── lib/
    └── blog/
        └── postViewModel.ts     # formatPostDate, readingTime
```

---

## Componentes — detalle

### `BlogFilters.astro`

- Props: `categories[]`, `activeCategoria: string`, `activeQ: string`, `lang`
- Form GET; chip "Todo" activo cuando `categoria` vacío; chip activo estilo gold
- Hidden input `name="categoria"` actualizado por JS mínimo al hacer click en chip
- Input `type="search" name="q"` — envía junto al chip activo
- Sin React; funciona sin JS (progressive enhancement para cambio de chip)

### `FeaturedPost.astro`

- Props: `post`, `lang`
- Solo montado en la página si: página 1 + sin `categoria` + sin `q` + `post.featured === true`
- Badge "DESTACADO" (i18n `blog.featured`), categoría, título serif grande, excerpt, fecha, CTA

### `PostCard.astro`

- Props: `post`, `lang`
- Imagen portada, badge categoría, título, fecha, excerpt recortado, link `blog.read`
- Molecule reutilizable

### `PostGrid.astro`

- Props: `posts[]`, `q: string`, `lang`
- Grid 3 columnas; estado vacío con `blog.empty` o `blog.empty.search` interpolando `q`

### `BlogPagination.astro`

- Props: `currentPage`, `totalPages`, `baseUrl`
- Números como `<a href>` con `?page=N`; página activa = `<span>` gold, no enlace
- Se omite si `totalPages <= 1`

### `BlogPostLayout.astro`

- Props: `post` (resultado de `postBySlugQuery`), `lang`
- Monta: `PostHero` → `PostBody` → `YouTubeEmbed` (condicional) → `RelatedProducts` (condicional) → `FacebookComments`

### `PostHero.astro`

- Imagen portada full-width, título serif, badge categoría, fecha formateada, autores, reading time

### `PostBody.astro`

- Renderer Portable Text en Astro puro (sin librería externa)
- Serializers custom:
  - `h2`, `h3` → serif, tokens type scale del design system
  - `blockquote` → borde izquierdo gold
  - `link` → externo: `target="_blank" rel="noopener"`; afiliado: `rel="sponsored nofollow noopener"`
  - `image` → `urlFor()` con width/height, `loading="lazy"`, `alt` requerido
  - `youtubeEmbed` → delega a `YouTubeEmbed.astro`
  - `productList` → delega a `RelatedProducts.astro`

### `YouTubeEmbed.astro`

- Props: `videoId: string`, `title: string`
- Miniatura: `https://i.ytimg.com/vi/{videoId}/hqdefault.jpg`
- Botón play con icono Lucide `Play` + label i18n `post.play` (visualmente oculto, accesible con `aria-label`)
- `<script>` inline: on click → inserta `<iframe src="https://www.youtube-nocookie.com/embed/{videoId}?autoplay=1">`
- `youtube-nocookie.com` — sin cookies de tracking hasta el click

### `RelatedProducts.astro`

- Props: `products[]`
- Badge tienda, nombre, imagen, botón "Ver producto" con `rel="sponsored nofollow noopener"`
- Sin precios (modelo afiliado)

### `FacebookComments.astro`

```astro
<!-- TODO Stage 09: Facebook Comments SDK -->
```

---

## Páginas — flujo de datos

### `blog/index.astro`

```ts
// frontmatter (---) del componente Astro
export const prerender = false;

const lang: Locale = "es";
const categoria = Astro.url.searchParams.get("categoria") ?? "";
const q = Astro.url.searchParams.get("q") ?? "";
const page = Math.max(1, Number(Astro.url.searchParams.get("page") ?? 1));
const offset = (page - 1) * POSTS_PER_PAGE;
const limit = offset + POSTS_PER_PAGE;

const [posts, total, categories] = await Promise.all([
  sanityClient.fetch(postsFilteredQuery, { lang, categoria, q, offset, limit }),
  sanityClient.fetch(postsCountQuery, { lang, categoria, q }),
  sanityClient.fetch(blogCategoriesQuery),
]);

const totalPages = Math.ceil(total / POSTS_PER_PAGE);
const featured =
  !categoria && !q && page === 1
    ? (posts.find((p) => p.featured) ?? null)
    : null;
const gridPosts = featured
  ? posts.filter((p) => p._id !== featured._id)
  : posts;
```

Monta `BlogFilters + FeaturedPost + PostGrid + BlogPagination` dentro de `BaseLayout`. ~60 líneas total.

### `blog/[slug].astro`

```ts
// frontmatter (---) del componente Astro
export const prerender = false;

const { slug } = Astro.params;
const post = await sanityClient.fetch(postBySlugQuery, { slug, lang: "es" });
if (!post) return Astro.redirect("/404");
```

Monta `BlogPostLayout`. ~40 líneas total.

---

## SEO — `BaseLayout.astro` refactor

### Nuevas props

```ts
interface Props {
  title: string;
  description?: string;
  lang?: Locale;
  ogImage?: string;
  canonical?: string;
  article?: {
    publishedTime?: string;
    authors?: string[];
    section?: string;
  };
}
```

### Uso del componente `<SEO>`

```html
<!-- En el <head> de BaseLayout.astro -->
<!-- import { SEO } from 'astro-seo' -->
<SEO
  title={title}
  titleTemplate="%s — Esencia Magnética"
  description={description}
  canonical={canonical}
  openGraph={{ basic: { title, type: article ? 'article' : 'website', image: ogImage ?? '', url: canonical ?? '' }, article }}
  languageAlternates={[{ hreflang: 'es', href: esUrl }, { hreflang: 'en', href: enUrl }, { hreflang: 'x-default', href: esUrl }]}
/>
```

Reemplaza los `<meta>` y `<link rel="alternate">` manuales existentes. El `<title>` manual también se elimina.

### En `blog/[slug].astro`

`canonical` usa `Astro.site` (configurado en `astro.config.mjs`):

```ts
// Props pasadas a BaseLayout desde blog/[slug].astro
// title={post.seo?.title ?? post.title}
// description={post.seo?.description ?? post.excerpt}
// ogImage={urlFor(post.seo?.image ?? post.coverImage).width(1200).url()}
// canonical={new URL(`/blog/${post.slug.current}`, Astro.site).toString()}
// lang="es"
// article={{ publishedTime: post.publishedAt, authors: post.authors?.map(a => a.name), section: post.category?.name }}
```

---

## Definition of Done

- [ ] `pnpm run lint` pasa sin warnings
- [ ] `pnpm run typecheck` pasa
- [ ] `pnpm run build` pasa (modo hybrid)
- [ ] `/blog` renderiza con filtros, búsqueda y paginación funcionales
- [ ] `/blog?categoria=outfits` filtra correctamente
- [ ] `/blog?q=vestido` muestra resultados o estado vacío
- [ ] `/blog/[slug]` renderiza post completo con SEO, YouTube façade y productos
- [ ] `/en/blog` y `/en/blog/[slug]` funcionan como pares EN
- [ ] Hreflang correcto en listing y detalle
- [ ] YouTube embed: sin scripts hasta el click
- [ ] Posts sin `featured` muestran grid normal sin tarjeta destacada
- [ ] Estado vacío aparece cuando no hay posts o no hay resultados de búsqueda
