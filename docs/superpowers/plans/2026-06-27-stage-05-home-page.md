# Stage 05 — Home Page (Hero + Marquee) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corregir tokens de spacing faltantes de Stage 04 y construir la home page con Hero + Marquee gallery full-bleed, ES y EN, responsive, con reduced-motion fallback y scroll speed boost.

**Architecture:** Fix `--space-*` CSS vars en `global.css` (Stage 04 bug), añadir `home.*` i18n keys con TDD, crear dos organisms en `src/components/home/` (`HomeHero`, `MarqueeGallery`), y orquestar desde `src/pages/index.astro` y `src/pages/en/index.astro`. El Marquee usa CSS `@keyframes` + vanilla JS rAF para el boost de velocidad al hacer scroll.

**Tech Stack:** Astro · Tailwind v4 tokens · CVA + Button.astro · Vitest · CSS keyframes · vanilla JS rAF

---

### Task 1: Fix Stage 04 — `--space-*` tokens faltantes

`--space-0` a `--space-10` se usan en `Footer.astro`, `Navbar.astro` y las páginas placeholder, pero nunca se añadieron a `global.css`. Sin ellos, `var(--space-*)` resuelve a vacío y el padding colapsa.

**Files:**

- Modify: `src/styles/global.css`

- [ ] **Step 1: Añadir spacing scale al bloque `:root` de `global.css`**

Localizar el bloque `:root` existente (después del `@theme`) y reemplazarlo:

```css
/* ─── Layout variables (plain CSS vars, no utility needed) */
:root {
  --container: 1200px;
  --container-text: 720px;
  --gutter: clamp(1.25rem, 5vw, 4rem);
  /* Spacing scale — 8px base (Claude Design tokens/spacing.css) */
  --space-0: 0;
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.5rem; /* 24px */
  --space-6: 2rem; /* 32px */
  --space-7: 3rem; /* 48px */
  --space-8: 4rem; /* 64px */
  --space-9: 6rem; /* 96px */
  --space-10: 8rem; /* 128px */
}
```

- [ ] **Step 2: Arrancar dev server y verificar en Chrome**

```powershell
pnpm run dev
```

Abrir http://localhost:4321. Verificar:

- Footer tiene padding visible top/bottom (no está pegado a los bordes)
- El wordmark y los nav links del Navbar tienen el espacio correcto
- Ningún elemento está colapsado ni flush contra los bordes

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "fix(stage-04): add missing --space-* tokens to :root"
```

---

### Task 2: Añadir strings i18n para home page (TDD)

**Files:**

- Modify: `src/i18n/ui.ts`
- Modify: `src/i18n/utils.test.ts`

- [ ] **Step 1: Escribir tests que FALLAN para las nuevas claves `home.*`**

Añadir al final de `src/i18n/utils.test.ts` (después del último `describe`):

```ts
describe("home page keys", () => {
  it("returns ES home.welcome", () => {
    const t = useTranslations("es");
    expect(t("home.welcome")).toBe("Bienvenida");
  });
  it("returns EN home.welcome", () => {
    const t = useTranslations("en");
    expect(t("home.welcome")).toBe("Welcome");
  });
  it("returns ES home.headline", () => {
    const t = useTranslations("es");
    expect(t("home.headline")).toBe("El estilo no tiene edad. Tiene esencia.");
  });
  it("returns EN home.headline", () => {
    const t = useTranslations("en");
    expect(t("home.headline")).toBe("Style has no age. It has essence.");
  });
  it("returns ES home.cta.blog", () => {
    const t = useTranslations("es");
    expect(t("home.cta.blog")).toBe("Ir al blog");
  });
  it("returns EN home.cta.blog", () => {
    const t = useTranslations("en");
    expect(t("home.cta.blog")).toBe("Go to the blog");
  });
  it("returns ES home.cta.catalog", () => {
    const t = useTranslations("es");
    expect(t("home.cta.catalog")).toBe("Ir al catálogo");
  });
  it("returns EN home.cta.catalog", () => {
    const t = useTranslations("en");
    expect(t("home.cta.catalog")).toBe("Go to the catalogue");
  });
});
```

- [ ] **Step 2: Ejecutar tests — verificar que FALLAN**

```powershell
pnpm run test -- --reporter=verbose
```

Esperado: error de TypeScript en compilación o fallos porque `"home.*"` no existe en `UiKey`.

- [ ] **Step 3: Añadir las 5 claves `home.*` a ambos locales en `ui.ts`**

En el objeto `es`, añadir después de `"404.cta": "Volver al inicio",`:

```ts
    "home.welcome": "Bienvenida",
    "home.headline": "El estilo no tiene edad. Tiene esencia.",
    "home.lead":
      "Moda práctica, looks reales y consejos accionables para mujeres que saben lo que quieren.",
    "home.cta.blog": "Ir al blog",
    "home.cta.catalog": "Ir al catálogo",
```

En el objeto `en`, añadir después de `"404.cta": "Back to home",`:

```ts
    "home.welcome": "Welcome",
    "home.headline": "Style has no age. It has essence.",
    "home.lead":
      "Practical fashion, real looks and actionable advice for women who know what they want.",
    "home.cta.blog": "Go to the blog",
    "home.cta.catalog": "Go to the catalogue",
```

- [ ] **Step 4: Ejecutar tests — verificar que PASAN**

```powershell
pnpm run test -- --reporter=verbose
```

Esperado: todos los tests pasan, incluyendo los 8 nuevos.

- [ ] **Step 5: Commit**

```bash
git add src/i18n/ui.ts src/i18n/utils.test.ts
git commit -m "feat(stage-05): add home.* i18n keys (ES + EN)"
```

---

### Task 3: Construir HomeHero organism

**Files:**

- Create: `src/components/home/HomeHero.astro`

- [ ] **Step 1: Crear `src/components/home/HomeHero.astro`**

```astro
---
// src/components/home/HomeHero.astro
import type { Locale } from "@/types/index";
import { useTranslations, getLocalizedUrl } from "@/i18n";
import Button from "@/components/ui/Button.astro";

interface Props {
  lang: Locale;
}

const { lang } = Astro.props;
const t = useTranslations(lang);

const blogHref = lang === "es" ? "/blog" : getLocalizedUrl("en", "/blog");
const catalogHref =
  lang === "es" ? "/productos" : getLocalizedUrl("en", "/productos");
---

<section
  class="[padding:var(--space-9)_var(--gutter)_var(--space-8)] text-center"
>
  <div class="mx-auto max-w-[900px]">
    <div
      class="font-script text-gold mb-3 [font-size:clamp(2.4rem,5vw,64px)] leading-none"
    >
      {t("home.welcome")}
    </div>
    <h1
      class="m-0 mb-8 font-serif [font-size:clamp(3rem,8vw,110px)] leading-none font-semibold tracking-tight"
    >
      {t("home.headline")}
    </h1>
    <p
      class="text-olive-soft mx-auto mt-0 mb-10 max-w-[620px] text-[20px] leading-normal"
    >
      {t("home.lead")}
    </p>
    <div class="flex flex-wrap justify-center gap-4">
      <Button href={blogHref} variant="primary" size="lg">
        {t("home.cta.blog")}
      </Button>
      <Button href={catalogHref} variant="secondary" size="lg">
        {t("home.cta.catalog")}
      </Button>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Montar en `src/pages/index.astro` para previsualizar**

Reemplazar el contenido completo del archivo:

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import HomeHero from "@/components/home/HomeHero.astro";
---

<BaseLayout title="Bienvenida" lang="es">
  <HomeHero lang="es" />
</BaseLayout>
```

- [ ] **Step 3: Verificar en Chrome**

Abrir http://localhost:4321. Comprobar:

- "Bienvenida" en Great Vibes script, dorado, ~64px
- H1 "El estilo no tiene edad. Tiene esencia." serif grande, dark olive, `clamp(3rem, 8vw, 110px)`
- Párrafo lead en `text-olive-soft`, max-width 620px, centrado
- Dos botones: dorado primary y bordered secondary, con texto en UPPERCASE por CSS
- Espaciado generoso: 96px arriba, 64px abajo

- [ ] **Step 4: Commit**

```bash
git add src/components/home/HomeHero.astro src/pages/index.astro
git commit -m "feat(stage-05): add HomeHero organism"
```

---

### Task 4: Construir MarqueeGallery organism

**Files:**

- Create: `src/components/home/MarqueeGallery.astro`

- [ ] **Step 1: Crear `src/components/home/MarqueeGallery.astro`**

```astro
---
// src/components/home/MarqueeGallery.astro
const BASE_GRADS = [
  "linear-gradient(135deg, var(--color-rose-nude), var(--color-lavender))",
  "linear-gradient(135deg, var(--color-cream-deep), var(--color-gold-soft))",
  "linear-gradient(135deg, var(--color-lavender), var(--color-cream))",
  "linear-gradient(135deg, var(--color-gold-soft), var(--color-rose-nude))",
  "linear-gradient(135deg, var(--color-rose-nude), var(--color-cream))",
  "linear-gradient(135deg, var(--color-lavender), var(--color-rose-nude))",
  "linear-gradient(135deg, var(--color-cream), var(--color-gold-soft))",
  "linear-gradient(135deg, var(--color-cream-deep), var(--color-rose-nude))",
];

// Offset row 2 so the rows don't mirror each other
const ROW2_GRADS = [...BASE_GRADS.slice(3), ...BASE_GRADS.slice(0, 3)];

// Duplicate for seamless -50% translateX loop
const rows = [
  { dir: "left", tiles: [...BASE_GRADS, ...BASE_GRADS] },
  { dir: "right", tiles: [...ROW2_GRADS, ...ROW2_GRADS] },
];
---

<section aria-hidden="true" class="overflow-hidden">
  {
    rows.map(({ dir, tiles }) => (
      <div class="h-[300px] w-full overflow-hidden">
        <div class:list={["mq-track", dir]}>
          {tiles.map((bg) => (
            <div class="mq-tile" style={`background: ${bg}`} />
          ))}
        </div>
      </div>
    ))
  }
</section>

<style>
  @keyframes em-marquee-left {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-50%);
    }
  }
  @keyframes em-marquee-right {
    from {
      transform: translateX(-50%);
    }
    to {
      transform: translateX(0);
    }
  }
  .mq-track {
    display: flex;
    width: max-content;
    height: 100%;
  }
  .mq-track.left {
    animation: em-marquee-left var(--mq-duration, 48s) linear infinite;
  }
  .mq-track.right {
    animation: em-marquee-right var(--mq-duration, 48s) linear infinite;
  }
  .mq-tile {
    flex: none;
    height: 100%;
    aspect-ratio: 3 / 4;
  }
  @media (prefers-reduced-motion: reduce) {
    .mq-track.left,
    .mq-track.right {
      animation: none;
    }
  }
</style>

<script>
  // ponytail: rAF decay loop — velocity capped at 20px/frame, duration floor 10s
  let velocity = 0;
  let prevY = window.scrollY;
  let duration = 48;

  window.addEventListener(
    "scroll",
    () => {
      velocity = Math.min(20, Math.abs(window.scrollY - prevY));
      prevY = window.scrollY;
    },
    { passive: true },
  );

  function tick() {
    velocity *= 0.92; // exponential decay back to idle speed
    duration = Math.max(10, 48 - velocity * 1.9);
    document.documentElement.style.setProperty(
      "--mq-duration",
      `${duration.toFixed(1)}s`,
    );
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
</script>
```

- [ ] **Step 2: Añadir MarqueeGallery a `src/pages/index.astro`**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import HomeHero from "@/components/home/HomeHero.astro";
import MarqueeGallery from "@/components/home/MarqueeGallery.astro";
---

<BaseLayout title="Bienvenida" lang="es">
  <HomeHero lang="es" />
  <MarqueeGallery />
</BaseLayout>
```

- [ ] **Step 3: Verificar en Chrome**

Abrir http://localhost:4321. Comprobar:

- Dos filas de tiles con gradientes de la paleta del brand se mueven horizontalmente
- Fila 1 → izquierda, Fila 2 → derecha
- Sin seam/gap visible en el loop
- Tiles en formato retrato (3:4), cada fila ~300px de alto
- Hacer scroll en la página acelera el marquee; al parar el scroll, la velocidad decae suavemente de vuelta a la normal
- Sin scrollbar horizontal en la página

- [ ] **Step 4: Commit**

```bash
git add src/components/home/MarqueeGallery.astro src/pages/index.astro
git commit -m "feat(stage-05): add MarqueeGallery organism with scroll speed boost"
```

---

### Task 5: Wire-up final ES + EN

**Files:**

- Modify: `src/pages/index.astro` (verificar que ya está correcto del Task 4)
- Modify: `src/pages/en/index.astro`

- [ ] **Step 1: Verificar `src/pages/index.astro`**

Debe contener exactamente:

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import HomeHero from "@/components/home/HomeHero.astro";
import MarqueeGallery from "@/components/home/MarqueeGallery.astro";
---

<BaseLayout title="Bienvenida" lang="es">
  <HomeHero lang="es" />
  <MarqueeGallery />
</BaseLayout>
```

- [ ] **Step 2: Actualizar `src/pages/en/index.astro`**

Reemplazar el contenido completo:

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import HomeHero from "@/components/home/HomeHero.astro";
import MarqueeGallery from "@/components/home/MarqueeGallery.astro";
---

<BaseLayout title="Welcome" lang="en">
  <HomeHero lang="en" />
  <MarqueeGallery />
</BaseLayout>
```

- [ ] **Step 3: Verificar versión EN en Chrome**

Abrir http://localhost:4321/en. Comprobar:

- Navbar muestra "EN" activo en LangToggle
- Hero: "Welcome" en script dorado, "Style has no age. It has essence." en serif
- Botones: "GO TO THE BLOG" y "GO TO THE CATALOGUE" (uppercase por CSS del Button)
- LangToggle en la navbar navega correctamente `/en` ↔ `/`
- Marquee idéntico (sin contenido localizable)

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/pages/en/index.astro
git commit -m "feat(stage-05): wire up ES and EN home pages"
```

---

### Task 6: Responsive pass + verificación final

- [ ] **Step 1: Mobile 375px en Chrome DevTools**

DevTools → toggle device toolbar → 375px. Comprobar:

- Headline H1 escala correctamente con `clamp(3rem, 8vw, 110px)` — no overflow
- Botones wrap vertical con `flex-wrap` si es necesario
- Marquee visible (300px height fija, no afectada)
- Navbar hamburger abre y cierra correctamente

- [ ] **Step 2: Tablet 768px**

DevTools → 768px. Comprobar:

- Nav desktop visible, sin solapamiento
- Hero centrado y proporcional

- [ ] **Step 3: reduced-motion**

Chrome DevTools → Rendering → "Emulate CSS media feature" → `prefers-reduced-motion: reduce`. Comprobar que las dos filas del marquee están estáticas (tiles visibles, sin animación).

- [ ] **Step 4: lint + typecheck + build**

```powershell
pnpm run lint && pnpm run typecheck && pnpm run build
```

Esperado: cero errores. Corregir cualquier error antes de continuar.

- [ ] **Step 5: Commit final**

```bash
git add src/styles/global.css src/i18n/ui.ts src/i18n/utils.test.ts src/components/home/HomeHero.astro src/components/home/MarqueeGallery.astro src/pages/index.astro src/pages/en/index.astro
git commit -m "feat(stage-05): home page complete — Hero + Marquee, ES+EN, responsive"
```

> Solo ejecutar este commit si los pasos anteriores NO crearon commits individuales por task. Si cada task ya tiene su commit, este paso se omite.
