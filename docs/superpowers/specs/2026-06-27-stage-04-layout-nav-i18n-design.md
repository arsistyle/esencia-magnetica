# Stage 04 — Core Layout, Navigation & i18n

**Fecha:** 2026-06-27  
**Repo:** `E:\esencia-magnetica`  
**Referencia de diseño:** Claude Design `658592d3-5da1-4cd3-81b6-c1576c694e23`

---

## Objetivo

Implementar el shell compartido que todas las páginas del sitio heredan: routing bilingüe ES/EN, sistema de strings para UI copy, layout base, navbar, footer y página 404. Es el cimiento sobre el que Stage 05+ construye el contenido.

---

## 1. Routing i18n (Astro nativo)

### Configuración

```js
// astro.config.mjs
i18n: {
  defaultLocale: 'es',
  locales: ['es', 'en'],
}
```

- **ES** — locale por defecto, sin prefijo de URL: `/`, `/blog`, `/productos`, `/marca`
- **EN** — bajo `/en/`: `/en`, `/en/blog`, `/en/products`, `/en/brand`

Astro i18n nativo no requiere dependencia adicional. No se usa `routing: 'prefix-always'` — solo el inglés lleva prefijo.

### Estructura de páginas

```
src/pages/
  index.astro          → /
  blog/index.astro     → /blog
  productos/index.astro → /productos
  marca/index.astro    → /marca
  404.astro            → /404
  en/
    index.astro        → /en
    blog/index.astro   → /en/blog
    products/index.astro → /en/products
    brand/index.astro  → /en/brand
```

Las páginas EN son wrappers finos: importan el mismo template/layout, pasan `lang="en"`.

---

## 2. Sistema de strings i18n

### `src/i18n/ui.ts`

Objeto tipado con todos los strings estáticos de UI en ES y EN:

```ts
export const ui = {
  es: {
    "nav.home": "Home",
    "nav.blog": "Blog",
    "nav.products": "Productos",
    "nav.brand": "Marca",
    "footer.explore": "Explorar",
    "footer.follow": "Síguenos",
    "footer.affiliate":
      "Algunos enlaces son de afiliados. Si compras a través de ellos, podemos recibir una comisión sin coste para ti.",
    "footer.tagline":
      "Moda y estilo de vida con esencia, para mujeres que saben lo que quieren.",
    "lang.es": "ES",
    "lang.en": "EN",
    "404.title": "Página no encontrada",
    "404.body": "La página que buscas no existe o ha sido movida.",
    "404.cta": "Volver al inicio",
  },
  en: {
    "nav.home": "Home",
    "nav.blog": "Blog",
    "nav.products": "Products",
    "nav.brand": "Brand",
    "footer.explore": "Explore",
    "footer.follow": "Follow",
    "footer.affiliate":
      "Some links are affiliate links. If you buy through them, we may receive a commission at no extra cost to you.",
    "footer.tagline":
      "Fashion and lifestyle with essence, for women who know what they want.",
    "lang.es": "ES",
    "lang.en": "EN",
    "404.title": "Page not found",
    "404.body":
      "The page you are looking for does not exist or has been moved.",
    "404.cta": "Back to home",
  },
} as const;

export type Lang = keyof typeof ui;
export type UiKey = keyof (typeof ui)["es"];
```

### `src/i18n/utils.ts`

```ts
export function getLangFromUrl(url: URL): Lang;
export function useTranslations(lang: Lang): (key: UiKey) => string;
export function getLocalizedUrl(lang: Lang, path: string): string;
```

- `getLangFromUrl` — extrae `'en'` si pathname empieza con `/en/`, sino `'es'`
- `useTranslations` — retorna función `t(key)` que busca en `ui[lang]`
- `getLocalizedUrl` — prefija `/en/` para EN, deja la ruta tal cual para ES

---

## 3. BaseLayout.astro

Props: `title`, `description`, `lang: Lang`, `image?: string`

Responsabilidades:

- `<html lang={lang}>` dinámico
- `<head>`: charset, viewport, canonical, hreflang alternates (es/en), og tags, título, descripción, importa `global.css`
- Skip-link accesible: `<a href="#main-content" class="skip-link">Saltar al contenido</a>`
- Sticky `<Navbar>` con `{lang}` y ruta activa detectada del `Astro.url`
- `<main id="main-content">` con `<slot />`
- `<Footer>` con `{lang}`

El BaseLayout reemplaza el `BaseLayout.astro` existente (actualmente tiene `lang="es"` fijo y sin nav/footer).

---

## 4. Navbar

**Archivo:** `src/components/Navbar.astro`

Diseño (del kit de diseño):

- **Izquierda:** wordmark "Esencia Magnética" en `font-script` (Great Vibes), color gold, enlaza a `/` (ES) o `/en/` (EN)
- **Centro:** links HOME · BLOG · PRODUCTOS · MARCA en uppercase, Lato 14px, `letter-spacing: 0.06em`
- **Derecha:** LangToggle — pill con botones ES | EN; el activo en fondo gold, el inactivo transparente
- **Fondo:** `rgba(245,240,235,0.88)` + `backdrop-filter: blur(10px)` + `border-bottom: 1px solid var(--border)`
- **Link activo:** `border-bottom: 2px solid var(--gold)`, `font-weight: 700`
- **Posición:** sticky aplicada en BaseLayout (`position: sticky; top: 0; z-index: 50`)

Props: `lang: Lang`, `currentPath: string`

### Mobile nav

- Bajo `md` breakpoint (768px): links ocultos, botón hamburguesa visible
- Apertura con atributo `data-nav-open` + `<script>` inline vanilla JS (sin Alpine, sin React)
- El LangToggle permanece visible en mobile

### LangToggle — lógica de routing

El toggle construye la URL equivalente en el otro idioma:

- ES → EN: antepone `/en` a la ruta actual
- EN → ES: elimina el prefijo `/en`

Implementado como lógica en el `.astro` del Navbar (server-side, sin JS extra para el cambio de idioma en desktop).

---

## 5. Footer

**Archivo:** `src/components/Footer.astro`

Diseño (del kit de diseño):

- Fondo `var(--olive)` (dark olive), texto `var(--cream)`
- **Columna izquierda:** wordmark "Esencia Magnética" en rose-nude, tagline en 14px opacity 0.85
- **Columna derecha:** dos grupos — "Explorar" (Home, Blog, Productos, Marca) y "Síguenos" (YouTube, Instagram, Pinterest)
  - Links sociales abren en nueva pestaña con `rel="noopener noreferrer"` (YouTube y Pinterest son afiliados/externos: añadir `sponsored nofollow` a los de afiliado)
- **Barra inferior:** `© 2026 Esencia Magnética` · disclosure de afiliados
- Layout: `flex justify-between`, responsive (`flex-direction: column` en mobile)

Props: `lang: Lang`

---

## 6. Capa de datos Sanity — locale awareness

**Archivo:** `src/lib/sanity.ts` (actualización)

Las queries GROQ de Stage 03 ya aceptan `$lang: string`. El locale de Astro i18n (`'es'` | `'en'`) coincide directamente con los valores que esperan las queries — no se necesita ningún helper adicional. Las páginas pasan `lang` directamente al llamar `sanityClient.fetch(query, { lang })`.

No hay cambio de código en `src/lib/sanity.ts`; solo se documenta el patrón de uso.

---

## 7. Página 404

**Archivo:** `src/pages/404.astro`

- Usa BaseLayout con `lang='es'` (Astro sirve el 404 sin información de locale)
- Copy on-brand: título serif grande, copy cuerpo en olive-soft, CTA "Volver al inicio" → Button primario
- Sin iframe ni lógica de redireccionamiento

---

## 8. Responsive / mobile nav

Breakpoints del design system (definidos en Stage 02 global.css):

- `sm`: 640px · `md`: 768px · `lg`: 1024px · `xl`: 1280px

El Navbar colapsa los links de navegación bajo `md`. El layout de dos columnas del Footer colapsa a columna única bajo `sm`.

---

## Archivos a crear / modificar

| Acción    | Archivo                                                 |
| --------- | ------------------------------------------------------- |
| Modificar | `astro.config.mjs` — añadir bloque `i18n`               |
| Crear     | `src/i18n/ui.ts`                                        |
| Crear     | `src/i18n/utils.ts`                                     |
| Modificar | `src/layouts/BaseLayout.astro` — añadir nav/footer/i18n |
| Crear     | `src/components/Navbar.astro`                           |
| Crear     | `src/components/Footer.astro`                           |
| Modificar | `src/lib/sanity.ts` — añadir `getLang()`                |
| Crear     | `src/pages/404.astro`                                   |
| Crear     | `src/pages/en/index.astro` (wrapper EN del home)        |

---

## Definición de Done

- `pnpm run lint` + `pnpm run typecheck` + `pnpm run build` sin errores
- `/` y `/en` renderizan el shell; navbar y footer visibles
- Language switcher en navbar navega correctamente entre ES y EN
- Link activo del navbar coincide con la página actual
- Mobile nav funciona bajo 768px
- Todos los strings visibles pasan por `t(key)`, ninguno hardcodeado en ES
- 404 on-brand renderiza correctamente
