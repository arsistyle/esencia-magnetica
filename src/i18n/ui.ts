// src/i18n/ui.ts
export const ui = {
  es: {
    "nav.home": "Home",
    "nav.blog": "Blog",
    "nav.products": "Productos",
    "nav.brand": "Marca",
    "nav.open": "Abrir menú",
    "nav.close": "Cerrar menú",
    "nav.aria": "Navegación principal",
    "nav.lang": "Idioma",
    "footer.explore": "Explorar",
    "footer.follow": "Síguenos",
    "footer.tagline":
      "Moda y estilo de vida con esencia, para mujeres que saben lo que quieren.",
    "footer.affiliate":
      "Algunos enlaces son de afiliados. Si compras a través de ellos, podemos recibir una comisión sin coste para ti.",
    "footer.copyright": "© 2026 Esencia Magnética",
    "common.skip": "Saltar al contenido",
    "404.title": "Página no encontrada",
    "404.body": "La página que buscas no existe o ha sido movida.",
    "404.cta": "Volver al inicio",
    "home.welcome": "Bienvenida",
    "home.headline": "El estilo no tiene edad. Tiene esencia.",
    "home.lead":
      "Moda práctica, looks reales y consejos accionables para mujeres que saben lo que quieren.",
    "home.cta.blog": "Ir al blog",
    "home.cta.catalog": "Ir al catálogo",
  },
  en: {
    "nav.home": "Home",
    "nav.blog": "Blog",
    "nav.products": "Products",
    "nav.brand": "Brand",
    "nav.open": "Open menu",
    "nav.close": "Close menu",
    "nav.aria": "Main navigation",
    "nav.lang": "Language",
    "footer.explore": "Explore",
    "footer.follow": "Follow",
    "footer.tagline":
      "Fashion and lifestyle with essence, for women who know what they want.",
    "footer.affiliate":
      "Some links are affiliate links. If you buy through them, we may receive a commission at no extra cost to you.",
    "footer.copyright": "© 2026 Esencia Magnética",
    "common.skip": "Skip to content",
    "404.title": "Page not found",
    "404.body":
      "The page you are looking for does not exist or has been moved.",
    "404.cta": "Back to home",
    "home.welcome": "Welcome",
    "home.headline": "Style has no age. It has essence.",
    "home.lead":
      "Practical fashion, real looks and actionable advice for women who know what they want.",
    "home.cta.blog": "Go to the blog",
    "home.cta.catalog": "Go to the catalogue",
  },
} as const;

export type Lang = keyof typeof ui;
export type UiKey = keyof (typeof ui)["es"];
