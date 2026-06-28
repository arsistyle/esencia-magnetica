# Stage 08 — Página Marca/About Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir las páginas `/marca` (ES) y `/en/brand` (EN) con todas las secciones del diseño de Claude Design, datos gestionados desde Sanity y JSON-LD para E-E-A-T.

**Architecture:** Dos fuentes de datos: `brand-{lang}` (identidad global: nombre, foto, misión/visión) + `page` con `template: 'about'` y `language: '{lang}'` (contenido profundo: intro, historia). Si alguna fuente es `null` las secciones correspondientes se omiten sin romper la página. `BrandLayout.astro` compone seis organismos en `src/components/brand/`.

**Tech Stack:** Astro v6 (SSR, `prerender = false`) · Sanity GROQ · `@portabletext/to-html` · Tailwind v4 tokens · `astro-seo` · JSON-LD (Person + Organization) · Vitest

---

## Archivos que se crean o modifican

| Acción       | Archivo                                        | Responsabilidad                                    |
| ------------ | ---------------------------------------------- | -------------------------------------------------- |
| Modificar    | `src/i18n/ui.ts`                               | Keys `brand.*` ES + EN                             |
| Modificar    | `src/lib/queries.ts`                           | `brandQuery` + `aboutPageQuery`                    |
| Crear        | `src/lib/brand/brandViewModel.ts`              | `ptToHtml()` + `ptToText()`                        |
| Crear        | `src/lib/brand/brandViewModel.test.ts`         | Tests de las dos funciones                         |
| Modificar    | `src/layouts/BaseLayout.astro`                 | Prop `jsonLd?: string`                             |
| Crear        | `src/components/brand/BrandHero.astro`         | Sección hero (tagline + nombre + intro + foto 4:5) |
| Crear        | `src/components/brand/BrandHistoria.astro`     | Sección "Mi historia" (foto 1:1 + texto)           |
| Crear        | `src/components/brand/BrandFilosofia.astro`    | 3 pillars hardcoded (i18n)                         |
| Crear        | `src/components/brand/BrandMisionVision.astro` | Misión + Visión en fondo olive                     |
| Crear        | `src/components/brand/BrandQueEncontrar.astro` | 2 cards (Blog + Productos)                         |
| Crear        | `src/components/brand/BrandCTA.astro`          | CTA final en fondo rose-nude                       |
| Crear        | `src/layouts/BrandLayout.astro`                | Template: BaseLayout + JSON-LD + 6 organismos      |
| Sobrescribir | `src/pages/marca/index.astro`                  | Página ES — fetch + mount BrandLayout              |
| Crear        | `src/pages/en/brand/index.astro`               | Página EN — fetch + mount BrandLayout              |

---

## Task 1: Keys i18n `brand.*`

**Archivos:**

- Modificar: `src/i18n/ui.ts`

- [ ] **Paso 1: Añadir keys ES al objeto `es`** — insertar antes del cierre `},` del bloque `es` en `src/i18n/ui.ts`:

```ts
    // ── Marca / About ────────────────────────────────────────────────────────
    "brand.historia.kicker": "Mi historia",
    "brand.historia.heading": "Por qué nació Esencia Magnética",
    "brand.filosofia.badge": "Mi filosofía",
    "brand.filosofia.heading": "Estilo para mujeres de 40 a 55+",
    "brand.filosofia.lead": "Tres principios que guían cada recomendación.",
    "brand.pillar.1.title": "Práctico",
    "brand.pillar.1.desc": "Looks que funcionan en tu vida real, no solo en un escaparate. Fáciles de copiar y adaptar.",
    "brand.pillar.2.title": "Atemporal",
    "brand.pillar.2.desc": "Piezas y combinaciones que duran más de una temporada. La elegancia no caduca.",
    "brand.pillar.3.title": "Empoderador",
    "brand.pillar.3.desc": "El estilo como herramienta de confianza. Tú decides quién quieres ser cada día.",
    "brand.mision.label": "Misión",
    "brand.vision.label": "Visión",
    "brand.site.badge": "En el sitio",
    "brand.site.heading": "Qué encontrarás aquí",
    "brand.blog.title": "Historias de estilo",
    "brand.blog.desc": "Outfits, tendencias y combinaciones paso a paso.",
    "brand.products.title": "Selección curada",
    "brand.products.desc": "Piezas favoritas con enlaces directos a tiendas de confianza.",
    "brand.site.cta": "Explorar",
    "brand.cta.heading": "¿Lista para encontrar tu esencia?",
    "brand.cta.button": "Empezar por el blog",
```

- [ ] **Paso 2: Añadir keys EN al objeto `en`** — insertar antes del cierre `},` del bloque `en`:

```ts
    // ── Brand / About ────────────────────────────────────────────────────────
    "brand.historia.kicker": "My story",
    "brand.historia.heading": "Why Esencia Magnética began",
    "brand.filosofia.badge": "My philosophy",
    "brand.filosofia.heading": "Style for women aged 40 to 55+",
    "brand.filosofia.lead": "Three principles that guide every recommendation.",
    "brand.pillar.1.title": "Practical",
    "brand.pillar.1.desc": "Looks that work in your real life, not just a shop window. Easy to copy and adapt.",
    "brand.pillar.2.title": "Timeless",
    "brand.pillar.2.desc": "Pieces and pairings that last beyond a season. Elegance never expires.",
    "brand.pillar.3.title": "Empowering",
    "brand.pillar.3.desc": "Style as a tool for confidence. You decide who you want to be each day.",
    "brand.mision.label": "Mission",
    "brand.vision.label": "Vision",
    "brand.site.badge": "On the site",
    "brand.site.heading": "What you'll find here",
    "brand.blog.title": "Style stories",
    "brand.blog.desc": "Outfits, trends and pairings step by step.",
    "brand.products.title": "Curated edit",
    "brand.products.desc": "Favourite pieces with direct links to trusted stores.",
    "brand.site.cta": "Explore",
    "brand.cta.heading": "Ready to find your essence?",
    "brand.cta.button": "Start with the blog",
```

- [ ] **Paso 3: Verificar que el test de completitud pasa**

```bash
pnpm run test -- src/i18n/ui.test.ts
```

Esperado: PASS (el test verifica que EN tiene todas las keys de ES).

- [ ] **Paso 4: Commit**

```bash
git add src/i18n/ui.ts
git commit -m "feat(i18n): add brand.* keys for Stage 08 Marca page"
```

---

## Task 2: GROQ queries

**Archivos:**

- Modificar: `src/lib/queries.ts`

- [ ] **Paso 1: Añadir `brandQuery` y `aboutPageQuery`** al final de `src/lib/queries.ts`:

```ts
// Identidad global de la marca por locale. brandId = "brand-es" | "brand-en"
export const brandQuery = defineQuery(`
  *[_type == "brand" && _id == $brandId][0] {
    name,
    tagline,
    heroPhoto { asset, hotspot, crop },
    mission,
    vision
  }
`);

// Página /marca o /en/brand — template 'about' por locale.
// Retorna null si el documento no existe todavía (brand-en pendiente de crear).
export const aboutPageQuery = defineQuery(`
  *[_type == "page" && template == "about" && language == $lang][0] {
    title,
    aboutContent {
      intro,
      historiaPhoto { asset, hotspot, crop },
      historia
    },
    seo
  }
`);
```

- [ ] **Paso 2: Commit**

```bash
git add src/lib/queries.ts
git commit -m "feat(queries): add brandQuery and aboutPageQuery for Stage 08"
```

---

## Task 3: Utilidad `brandViewModel` + tests

**Archivos:**

- Crear: `src/lib/brand/brandViewModel.ts`
- Crear: `src/lib/brand/brandViewModel.test.ts`

- [ ] **Paso 1: Escribir los tests primero** — crear `src/lib/brand/brandViewModel.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { ptToText, ptToHtml } from "./brandViewModel";
import type { SimplePortableText } from "@/types/sanity.types";

const block = (text: string): SimplePortableText[number] => ({
  _type: "block",
  _key: "k1",
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: "s1", text, marks: [] }],
});

describe("ptToText", () => {
  it("returns empty string for undefined", () => {
    expect(ptToText(undefined)).toBe("");
  });

  it("returns empty string for empty array", () => {
    expect(ptToText([])).toBe("");
  });

  it("extracts plain text from a single block", () => {
    expect(ptToText([block("Hola mundo")])).toBe("Hola mundo");
  });

  it("joins multiple blocks with a space", () => {
    expect(ptToText([block("Primero."), block("Segundo.")])).toBe(
      "Primero. Segundo.",
    );
  });
});

describe("ptToHtml", () => {
  it("returns empty string for undefined", () => {
    expect(ptToHtml(undefined)).toBe("");
  });

  it("wraps normal blocks in <p> tags", () => {
    const result = ptToHtml([block("Hola")]);
    expect(result).toContain("<p>");
    expect(result).toContain("Hola");
  });
});
```

- [ ] **Paso 2: Verificar que los tests fallan**

```bash
pnpm run test -- src/lib/brand/brandViewModel.test.ts
```

Esperado: FAIL — `Cannot find module './brandViewModel'`.

- [ ] **Paso 3: Implementar** — crear `src/lib/brand/brandViewModel.ts`:

```ts
import { toHTML } from "@portabletext/to-html";
import type { SimplePortableText } from "@/types/sanity.types";

/** Convierte SimplePortableText a HTML. Solo bloques normales (sin YouTube ni ProductList). */
export function ptToHtml(blocks: SimplePortableText | undefined): string {
  if (!blocks?.length) return "";
  return toHTML(blocks as Parameters<typeof toHTML>[0], {
    components: {
      block: {
        normal: ({ children }) => `<p>${children}</p>`,
        blockquote: ({ children }) => `<blockquote>${children}</blockquote>`,
      },
    },
  });
}

/** Extrae texto plano de SimplePortableText. Útil para JSON-LD y atributos title. */
export function ptToText(blocks: SimplePortableText | undefined): string {
  if (!blocks?.length) return "";
  return blocks
    .map((b) => b.children?.map((s) => s.text ?? "").join("") ?? "")
    .join(" ")
    .trim();
}
```

- [ ] **Paso 4: Verificar que los tests pasan**

```bash
pnpm run test -- src/lib/brand/brandViewModel.test.ts
```

Esperado: PASS (4 tests en `ptToText`, 2 en `ptToHtml`).

- [ ] **Paso 5: Commit**

```bash
git add src/lib/brand/brandViewModel.ts src/lib/brand/brandViewModel.test.ts
git commit -m "feat(brand): add ptToHtml and ptToText utilities with tests"
```

---

## Task 4: Prop `jsonLd` en `BaseLayout`

**Archivos:**

- Modificar: `src/layouts/BaseLayout.astro`

- [ ] **Paso 1: Añadir prop `jsonLd?: string`** — en la interface `Props` de `BaseLayout.astro`, añadir:

```ts
  jsonLd?: string;
```

Y en la destructuración:

```ts
const {
  title,
  description = "Esencia Magnética — moda y estilo para mujeres 40+",
  lang = "es",
  ogImage,
  canonical,
  alternates,
  article,
  jsonLd, // ← añadir
} = Astro.props;
```

- [ ] **Paso 2: Inyectar el JSON-LD en el `<head>`** — añadir justo antes de `</head>`:

```astro
{jsonLd && <script type="application/ld+json" set:html={jsonLd} />}
```

- [ ] **Paso 3: Typecheck**

```bash
pnpm run typecheck
```

Esperado: 0 errores.

- [ ] **Paso 4: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat(layout): add jsonLd prop to BaseLayout for structured data"
```

---

## Task 5: `BrandHero.astro`

**Archivos:**

- Crear: `src/components/brand/BrandHero.astro`

Hero: columna izquierda (tagline script + h1 nombre + párrafo intro) + columna derecha (foto 4:5 o placeholder).

- [ ] **Paso 1: Crear `src/components/brand/BrandHero.astro`**:

```astro
---
// src/components/brand/BrandHero.astro
import type { Brand, SimpleImage } from "@/types/sanity.types";
import { safeUrlFor } from "@/lib/sanity";

interface Props {
  brand: Brand | null;
  intro?: string;
}

const { brand, intro } = Astro.props;

const heroUrl = brand?.heroPhoto
  ? (safeUrlFor(brand.heroPhoto)?.width(600).height(750).url() ?? null)
  : null;
---

<section
  class="mx-auto grid max-w-[var(--container)] grid-cols-1 items-center gap-10 px-[var(--gutter)] py-[var(--space-9)] md:grid-cols-[1.05fr_1fr]"
>
  <div>
    {
      brand?.tagline && (
        <div
          class="font-script text-gold mb-2 leading-none"
          style="font-size: clamp(2rem, 4vw, 46px)"
        >
          {brand.tagline}
        </div>
      )
    }
    {
      brand?.name && (
        <h1
          class="text-olive mb-5 font-serif leading-none font-semibold tracking-tight"
          style="font-size: clamp(2.8rem, 5vw, 4.2rem)"
        >
          {brand.name}
        </h1>
      )
    }
    {
      intro && (
        <p class="text-olive-soft leading-normal" style="font-size: 20px">
          {intro}
        </p>
      )
    }
  </div>

  {
    heroUrl ? (
      <img
        src={heroUrl}
        alt={brand?.name ?? ""}
        class="aspect-[4/5] w-full rounded-xl object-cover shadow-md"
        loading="eager"
      />
    ) : (
      <div
        class="from-rose-nude to-gold-soft aspect-[4/5] w-full rounded-xl bg-gradient-to-br shadow-md"
        aria-hidden="true"
      />
    )
  }
</section>
```

- [ ] **Paso 2: Commit**

```bash
git add src/components/brand/BrandHero.astro
git commit -m "feat(brand): add BrandHero organism"
```

---

## Task 6: `BrandHistoria.astro`

**Archivos:**

- Crear: `src/components/brand/BrandHistoria.astro`

Fondo lavanda. Columna izquierda foto 1:1; columna derecha kicker + h2 + texto Portable Text.

- [ ] **Paso 1: Crear `src/components/brand/BrandHistoria.astro`**:

```astro
---
// src/components/brand/BrandHistoria.astro
import type { SimpleImage } from "@/types/sanity.types";
import { safeUrlFor } from "@/lib/sanity";
import type { useTranslations } from "@/i18n";

interface Props {
  photo?: SimpleImage;
  historiaHtml: string;
  t: ReturnType<typeof useTranslations>;
}

const { photo, historiaHtml, t } = Astro.props;

const photoUrl = photo
  ? (safeUrlFor(photo)?.width(600).height(600).url() ?? null)
  : null;
---

<section class="bg-lavender px-[var(--gutter)] py-[var(--space-9)]">
  <div
    class="mx-auto grid max-w-[var(--container)] grid-cols-1 items-center gap-10 md:grid-cols-[1fr_1.2fr]"
  >
    {
      photoUrl ? (
        <img
          src={photoUrl}
          alt=""
          class="aspect-square w-full rounded-xl object-cover shadow-md"
        />
      ) : (
        <div
          class="from-cream to-rose-nude aspect-square w-full rounded-xl bg-gradient-to-br shadow-md"
          aria-hidden="true"
        />
      )
    }

    <div>
      <span
        class="text-gold text-overline font-sans font-bold tracking-wider uppercase"
      >
        {t("brand.historia.kicker")}
      </span>
      <h2
        class="text-olive mt-3 mb-4 font-serif leading-tight font-semibold"
        style="font-size: clamp(2rem, 3.5vw, 2.8rem)"
      >
        {t("brand.historia.heading")}
      </h2>

      {
        historiaHtml ? (
          <div
            class="brand-historia text-olive leading-normal"
            style="font-size: 17px"
            set:html={historiaHtml}
          />
        ) : (
          <p
            class="text-olive-soft leading-normal italic"
            style="font-size: 17px"
          >
            — Contenido próximamente —
          </p>
        )
      }
    </div>
  </div>
</section>

<style>
  .brand-historia :global(p) {
    margin-bottom: 1rem;
    color: var(--color-olive);
  }
  .brand-historia :global(p:last-child) {
    margin-bottom: 0;
    color: var(--color-olive-soft);
  }
</style>
```

- [ ] **Paso 2: Commit**

```bash
git add src/components/brand/BrandHistoria.astro
git commit -m "feat(brand): add BrandHistoria organism"
```

---

## Task 7: `BrandFilosofia.astro`

**Archivos:**

- Crear: `src/components/brand/BrandFilosofia.astro`

3 pillars hardcoded vía i18n. Badge + h2 + lead + grid 3 columnas con número serif italic gold.

- [ ] **Paso 1: Crear `src/components/brand/BrandFilosofia.astro`**:

```astro
---
// src/components/brand/BrandFilosofia.astro
import type { useTranslations } from "@/i18n";
import Badge from "@/components/ui/Badge.astro";

interface Props {
  t: ReturnType<typeof useTranslations>;
}

const { t } = Astro.props;

const pillars = [
  {
    num: "01",
    title: t("brand.pillar.1.title"),
    desc: t("brand.pillar.1.desc"),
  },
  {
    num: "02",
    title: t("brand.pillar.2.title"),
    desc: t("brand.pillar.2.desc"),
  },
  {
    num: "03",
    title: t("brand.pillar.3.title"),
    desc: t("brand.pillar.3.desc"),
  },
];
---

<section
  class="mx-auto max-w-[var(--container)] px-[var(--gutter)] py-[var(--space-9)]"
>
  <div class="mb-[var(--space-7)] text-center">
    <Badge tone="rose">{t("brand.filosofia.badge")}</Badge>
    <h2
      class="text-olive mt-3 mb-2 font-serif leading-tight font-semibold"
      style="font-size: clamp(2rem, 3.5vw, 2.8rem)"
    >
      {t("brand.filosofia.heading")}
    </h2>
    <p class="text-olive-soft mx-auto max-w-[560px]" style="font-size: 17px">
      {t("brand.filosofia.lead")}
    </p>
  </div>

  <div class="grid grid-cols-1 gap-[var(--space-7)] sm:grid-cols-3">
    {
      pillars.map((p) => (
        <div class="text-center">
          <span
            class="text-gold font-serif leading-none italic"
            style="font-size: 40px"
            aria-hidden="true"
          >
            {p.num}
          </span>
          <h3 class="text-olive mt-3 mb-2 font-serif text-2xl font-semibold">
            {p.title}
          </h3>
          <p class="text-olive-soft leading-normal" style="font-size: 16px">
            {p.desc}
          </p>
        </div>
      ))
    }
  </div>
</section>
```

- [ ] **Paso 2: Commit**

```bash
git add src/components/brand/BrandFilosofia.astro
git commit -m "feat(brand): add BrandFilosofia organism"
```

---

## Task 8: `BrandMisionVision.astro`

**Archivos:**

- Crear: `src/components/brand/BrandMisionVision.astro`

Fondo olive, texto cream. 2 columnas: Misión / Visión como texto serif grande.

- [ ] **Paso 1: Crear `src/components/brand/BrandMisionVision.astro`**:

```astro
---
// src/components/brand/BrandMisionVision.astro
import type { useTranslations } from "@/i18n";
import type { SimplePortableText } from "@/types/sanity.types";
import { ptToText } from "@/lib/brand/brandViewModel";

interface Props {
  mission?: SimplePortableText;
  vision?: SimplePortableText;
  t: ReturnType<typeof useTranslations>;
}

const { mission, vision, t } = Astro.props;

const misionText = ptToText(mission);
const visionText = ptToText(vision);
---

{
  (misionText || visionText) && (
    <section class="bg-olive px-[var(--gutter)] py-[var(--space-9)]">
      <div class="mx-auto grid max-w-[var(--container)] grid-cols-1 gap-[var(--space-8)] md:grid-cols-2">
        {misionText && (
          <div>
            <span class="text-rose-nude text-overline font-sans font-bold tracking-wider uppercase">
              {t("brand.mision.label")}
            </span>
            <p
              class="text-cream mt-3 font-serif leading-snug"
              style="font-size: 25px"
            >
              {misionText}
            </p>
          </div>
        )}
        {visionText && (
          <div>
            <span class="text-rose-nude text-overline font-sans font-bold tracking-wider uppercase">
              {t("brand.vision.label")}
            </span>
            <p
              class="text-cream mt-3 font-serif leading-snug"
              style="font-size: 25px"
            >
              {visionText}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Paso 2: Commit**

```bash
git add src/components/brand/BrandMisionVision.astro
git commit -m "feat(brand): add BrandMisionVision organism"
```

---

## Task 9: `BrandQueEncontrar.astro` + `BrandCTA.astro`

**Archivos:**

- Crear: `src/components/brand/BrandQueEncontrar.astro`
- Crear: `src/components/brand/BrandCTA.astro`

- [ ] **Paso 1: Crear `src/components/brand/BrandQueEncontrar.astro`**:

```astro
---
// src/components/brand/BrandQueEncontrar.astro
import type { useTranslations } from "@/i18n";
import type { Locale } from "@/types/index";
import Badge from "@/components/ui/Badge.astro";
import { ArrowRight } from "@lucide/astro";

interface Props {
  t: ReturnType<typeof useTranslations>;
  lang: Locale;
}

const { t, lang } = Astro.props;

const cards = [
  {
    label: t("nav.blog"),
    title: t("brand.blog.title"),
    desc: t("brand.blog.desc"),
    href: lang === "en" ? "/en/blog" : "/blog",
  },
  {
    label: t("nav.products"),
    title: t("brand.products.title"),
    desc: t("brand.products.desc"),
    href: lang === "en" ? "/en/products" : "/productos",
  },
];
---

<section
  class="mx-auto max-w-[var(--container)] px-[var(--gutter)] py-[var(--space-9)]"
>
  <div class="mb-[var(--space-7)] text-center">
    <Badge tone="gold">{t("brand.site.badge")}</Badge>
    <h2
      class="text-olive mt-3 font-serif leading-tight font-semibold"
      style="font-size: clamp(2rem, 3.5vw, 2.8rem)"
    >
      {t("brand.site.heading")}
    </h2>
  </div>

  <div
    class="mx-auto grid max-w-[760px] grid-cols-1 gap-[var(--space-6)] sm:grid-cols-2"
  >
    {
      cards.map((card) => (
        <a
          href={card.href}
          class="border-line bg-cream-card block rounded-lg border p-[var(--space-6)] shadow-none transition hover:-translate-y-1 hover:shadow-md"
        >
          <span class="text-gold text-overline font-sans font-bold tracking-wide uppercase">
            {card.label}
          </span>
          <h3 class="text-olive mt-2 mb-3 font-serif text-2xl leading-tight font-semibold">
            {card.title}
          </h3>
          <p
            class="text-olive-soft mb-4 leading-normal"
            style="font-size: 16px"
          >
            {card.desc}
          </p>
          <span class="text-gold text-small inline-flex items-center gap-1 font-sans font-bold tracking-wide uppercase">
            {t("brand.site.cta")}
            <ArrowRight class="h-4 w-4 shrink-0" />
          </span>
        </a>
      ))
    }
  </div>
</section>
```

- [ ] **Paso 2: Crear `src/components/brand/BrandCTA.astro`**:

```astro
---
// src/components/brand/BrandCTA.astro
import type { useTranslations } from "@/i18n";
import type { Locale } from "@/types/index";
import Button from "@/components/ui/Button.astro";

interface Props {
  t: ReturnType<typeof useTranslations>;
  lang: Locale;
}

const { t, lang } = Astro.props;
const blogPath = lang === "en" ? "/en/blog" : "/blog";
---

<section
  class="bg-rose-nude px-[var(--gutter)] py-[var(--space-9)] text-center"
>
  <h2
    class="text-olive mx-auto mb-[var(--space-5)] font-serif leading-tight font-semibold"
    style="font-size: clamp(2rem, 3.5vw, 2.8rem); max-width: 600px"
  >
    {t("brand.cta.heading")}
  </h2>
  <Button variant="primary" size="lg" href={blogPath}>
    {t("brand.cta.button")}
  </Button>
</section>
```

> **Nota:** Si `Button.astro` no soporta prop `href` (renderiza `<button>` en vez de `<a>`), reemplaza por: `<a href={blogPath} class="...clases del variant primary lg...">{t("brand.cta.button")}</a>` usando las mismas clases CVA que usa el componente Button con `variant="primary"` y `size="lg"`.

- [ ] **Paso 3: Commit**

```bash
git add src/components/brand/BrandQueEncontrar.astro src/components/brand/BrandCTA.astro
git commit -m "feat(brand): add BrandQueEncontrar and BrandCTA organisms"
```

---

## Task 10: `BrandLayout.astro`

**Archivos:**

- Crear: `src/layouts/BrandLayout.astro`

Template que: construye JSON-LD, resuelve SEO, compone los 6 organismos. Acepta `brand` y `page` que pueden ser `null`.

- [ ] **Paso 1: Crear `src/layouts/BrandLayout.astro`**:

```astro
---
// src/layouts/BrandLayout.astro
import BaseLayout from "@/layouts/BaseLayout.astro";
import BrandHero from "@/components/brand/BrandHero.astro";
import BrandHistoria from "@/components/brand/BrandHistoria.astro";
import BrandFilosofia from "@/components/brand/BrandFilosofia.astro";
import BrandMisionVision from "@/components/brand/BrandMisionVision.astro";
import BrandQueEncontrar from "@/components/brand/BrandQueEncontrar.astro";
import BrandCTA from "@/components/brand/BrandCTA.astro";
import { useTranslations, getLocalizedUrl } from "@/i18n";
import { ptToHtml, ptToText } from "@/lib/brand/brandViewModel";
import { safeUrlFor } from "@/lib/sanity";
import type { Brand, Page } from "@/types/sanity.types";
import type { Locale } from "@/types/index";

interface Props {
  brand: Brand | null;
  page: Page | null;
  lang: Locale;
}

const { brand, page, lang } = Astro.props;
const t = useTranslations(lang);

// SEO
const seoTitle = page?.seo?.metaTitle ?? t("nav.brand");
const seoDescription =
  page?.seo?.metaDescription ??
  (brand ? `${brand.tagline ?? ""} ${brand.name ?? ""}`.trim() : undefined);
const heroUrl = brand?.heroPhoto
  ? (safeUrlFor(brand.heroPhoto)?.width(800).height(1000).url() ?? undefined)
  : undefined;

// Contenido de la página (puede ser null si brand-en aún no existe)
const intro = page?.aboutContent?.intro;
const historiaHtml = ptToHtml(page?.aboutContent?.historia);
const historiaPhoto = page?.aboutContent?.historiaPhoto;

// JSON-LD: Person + Organization
const personName = brand?.name ?? "";
const siteUrl = Astro.site?.toString().replace(/\/$/, "") ?? "";
const brandPath = lang === "en" ? "/en/brand" : "/marca";

const jsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    ...(personName
      ? [
          {
            "@type": "Person",
            name: personName,
            url: `${siteUrl}${brandPath}`,
            ...(heroUrl ? { image: heroUrl } : {}),
          },
        ]
      : []),
    {
      "@type": "Organization",
      name: "Esencia Magnética",
      url: siteUrl,
      ...(personName
        ? { founder: { "@type": "Person", name: personName } }
        : {}),
    },
  ],
});

// hreflang alternates
const esPath = lang === "es" ? brandPath : "/marca";
const enPath = lang === "en" ? brandPath : "/en/brand";
---

<BaseLayout
  title={seoTitle}
  description={seoDescription}
  lang={lang}
  ogImage={heroUrl}
  alternates={{ es: esPath, en: enPath }}
  jsonLd={jsonLd}
>
  <BrandHero brand={brand} intro={intro} />
  <BrandHistoria photo={historiaPhoto} historiaHtml={historiaHtml} t={t} />
  <BrandFilosofia t={t} />
  <BrandMisionVision mission={brand?.mission} vision={brand?.vision} t={t} />
  <BrandQueEncontrar t={t} lang={lang} />
  <BrandCTA t={t} lang={lang} />
</BaseLayout>
```

- [ ] **Paso 2: Typecheck**

```bash
pnpm run typecheck
```

Esperado: 0 errores.

- [ ] **Paso 3: Commit**

```bash
git add src/layouts/BrandLayout.astro
git commit -m "feat(brand): add BrandLayout template with JSON-LD"
```

---

## Task 11: Páginas ES + EN

**Archivos:**

- Sobrescribir: `src/pages/marca/index.astro`
- Crear: `src/pages/en/brand/index.astro`

- [ ] **Paso 1: Sobrescribir `src/pages/marca/index.astro`**:

```astro
---
// src/pages/marca/index.astro
export const prerender = false;

import { sanityClient } from "sanity:client";
import { brandQuery, aboutPageQuery } from "@/lib/queries";
import BrandLayout from "@/layouts/BrandLayout.astro";
import type { Locale } from "@/types/index";

const lang: Locale = "es";
const [brand, page] = await Promise.all([
  sanityClient.fetch(brandQuery, { brandId: "brand-es" }),
  sanityClient.fetch(aboutPageQuery, { lang }),
]);
---

<BrandLayout brand={brand} page={page} lang={lang} />
```

- [ ] **Paso 2: Crear `src/pages/en/brand/index.astro`**:

```astro
---
// src/pages/en/brand/index.astro
export const prerender = false;

import { sanityClient } from "sanity:client";
import { brandQuery, aboutPageQuery } from "@/lib/queries";
import BrandLayout from "@/layouts/BrandLayout.astro";
import type { Locale } from "@/types/index";

const lang: Locale = "en";
const [brand, page] = await Promise.all([
  sanityClient.fetch(brandQuery, { brandId: "brand-en" }),
  sanityClient.fetch(aboutPageQuery, { lang }),
]);
---

<BrandLayout brand={brand} page={page} lang={lang} />
```

- [ ] **Paso 3: Commit**

```bash
git add src/pages/marca/index.astro src/pages/en/brand/index.astro
git commit -m "feat(brand): add /marca and /en/brand pages (Stage 08)"
```

---

## Task 12: Verificación final

- [ ] **Paso 1: Lint**

```bash
pnpm run lint
```

Esperado: 0 errores.

- [ ] **Paso 2: Typecheck completo**

```bash
pnpm run typecheck
```

Esperado: 0 errores.

- [ ] **Paso 3: Tests completos**

```bash
pnpm run test
```

Esperado: todos los tests pasando (incluyendo los nuevos de `brandViewModel` y el de completitud de i18n).

- [ ] **Paso 4: Dev server — verificar `/marca`**

```bash
pnpm run dev
```

Abrir `http://localhost:4321/marca` y verificar:

- Hero: tagline "Hola, soy" + nombre "Alexandra" + foto si existe.
- Sección lavanda "Mi historia": placeholder si aún no hay contenido en Studio.
- Filosofía: 3 pillars con 01/02/03 en gold serif.
- Sección olive Misión/Visión: texto desde Sanity.
- 2 cards "Qué encontrarás".
- CTA rose-nude.

- [ ] **Paso 5: Verificar `/en/brand`**

Abrir `http://localhost:4321/en/brand`. Si `brand-en` no existe en Sanity, las secciones de hero y misión/visión deben estar vacías (sin error 500). Las secciones hardcoded (Filosofía, cards, CTA) deben mostrar el texto en inglés.

- [ ] **Paso 6: Verificar JSON-LD**

En el `<head>` de `/marca` debe aparecer:

```html
<script type="application/ld+json">
  {"@context":"https://schema.org","@graph":[{"@type":"Person",...},{"@type":"Organization",...}]}
</script>
```

Validar en https://validator.schema.org o con el Rich Results Test de Google.

- [ ] **Paso 7: Commit final si hay correcciones menores**

```bash
git add -p
git commit -m "fix(brand): post-review corrections Stage 08"
```

---

## Pendientes post-Stage 08

- Crear documento `brand-en` en Studio (Sanity) con nombre, foto, misión y visión en inglés.
- Crear documentos `page` con `template: 'about'` en Studio para ES y EN, y añadir `intro` + `historia`.
- Cuando se implemente la foto de la creadora real, subirla a `brand-es.heroPhoto` en Studio.
