# UI Updates — Esencia Magnética

> Cambios de UI pendientes de implementar en el código.  
> Todos los diseños están prototipados en **Claude Design**:  
> **[Esencia Magnética Design System](https://claude.ai/design/p/658592d3-5da1-4cd3-81b6-c1576c694e23)**  
> El proyecto tiene configurado el MCP de Claude Design para conectarse y consultar los archivos directamente.

---

## 1. Patrón BUSCAR + FILTRAR (Blog y Productos)

### Cambio

Reemplazar los filtros de categoría inline (chips horizontales) y la barra de búsqueda inline por dos botones de acción que abren diálogos modales.

### Aplica a

- `/blog` — reemplaza `BlogFilters.astro` (chips + form de búsqueda)
- `/productos` — reemplaza la sidebar de filtros completa

### Componente de referencia en Claude Design

`FilterModals.jsx` — componente compartido que contiene ambos diálogos.

### Especificación

**Botones (top-right del encabezado de página):**

- `🔍 BUSCAR` — outline, borde fino, texto uppercase small caps
- `⚙ FILTRAR` — outline, mismo estilo

**Dialog BUSCAR:**

- Título: "Buscar"
- Input full-width, placeholder: "Buscar artículos…"
- Botón: `BUSCAR` (gold `#C4973A`, full-width)
- Overlay oscuro, X para cerrar

**Dialog FILTRAR — Blog:**

- Título: "FILTRAR" (bold caps)
- Sección CATEGORÍAS: chips pill-shaped
  - Activo: fondo Dark Olive `#3E3D2F` / texto Warm Cream `#F5F0EB`
  - Inactivo: borde sutil, texto olive-soft
- Botones footer: `LIMPIAR TODO` (outline) + `CONFIRMAR` (gold)
- Overlay oscuro, X para cerrar

**Dialog FILTRAR — Productos:**

- Igual que Blog más sección adicional:
- Sección TIENDA: chips para Amazon y Shein (mismo estilo pill)

### Notas de implementación

- Este patrón es el estándar para **todos los filtros futuros** (tags, etc.)
- Sin sidebar en Productos — la sidebar desaparece completamente
- Estado de filtros activos sincronizado al abrir el dialog (no en cada render)

---

## 2. Breadcrumbs

### Cambio

Añadir breadcrumb de navegación en todas las páginas interiores. Actualmente no existe en el proyecto.

### Aplica a

| Página         | Breadcrumb                        |
| -------------- | --------------------------------- |
| `/blog`        | `Home — Blog`                     |
| `/blog/[slug]` | `Home — Blog — [Título del post]` |
| `/productos`   | `Home — Productos`                |
| `/marca`       | `Home — Marca`                    |

### Especificación visual

- Fuente: `text-small` (Lato sans)
- Color: `olive-soft` (`text-olive-soft`)
- Separador por defecto: `—` (configurable)
- Links: hover con underline; último segmento es texto plano (sin link)
- Alineación: izquierda, dentro del mismo `--container` y `--gutter` que el resto de la página

### Tweaks (panel de diseño)

El componente tiene dos controles en el Tweaks panel:

- **Mostrar breadcrumb**: toggle on/off
- **Separador**: opciones `/` `·` `›` `—` (activo: `—`)

### Posición en el layout

- Justo debajo del navbar, antes del badge/título
- Espacio entre breadcrumb y contenido siguiente: **~10px** (el breadcrumb debe sentirse parte del encabezado, no flotante)

### Componente de referencia en Claude Design

Shared breadcrumb component, visible en `BlogIndex.jsx`, `BlogPost.jsx`, `ProductCatalog.jsx` y `Marca.jsx`.

---

## 3. Hero del Post individual — alineación izquierda

### Cambio

El hero de `/blog/[slug]` estaba centrado. Debe alinearse a la izquierda, igual que el resto de páginas.

### Aplica a

- `/blog/[slug]` — componente `BlogPost.jsx` / futuro `[slug].astro`

### Especificación

- Badge de categoría: alineado a la izquierda
- Título (`h1`): alineado a la izquierda
- Subtítulo/excerpt: alineado a la izquierda
- Meta (autor · fecha · tiempo de lectura): alineado a la izquierda
- Mismo `max-width: var(--container)` y `padding: var(--gutter)` que el resto de páginas — **sin max-width adicional** que desplace el contenido
- La imagen hero permanece full-width debajo del bloque de texto

### Referencia en Claude Design

`BlogPost.jsx` — hero section, primera parte visible de la página.

---

## 4. Reducción de espacio breadcrumb → contenido

### Cambio

El espacio entre el breadcrumb y el primer elemento de contenido (badge + título) era excesivo. Se redujo a ~10px en todas las páginas.

### Aplica a

- `/blog`
- `/blog/[slug]`
- `/productos`
- `/marca`

### Nota

Marca usa `--space-9` (96px) de padding superior mientras el resto usa `--space-8` (64px). El offset del breadcrumb se calcula por página para que el hueco visual sea consistente en todas.

---

## Estado

| Cambio                              | Diseñado | Implementado |
| ----------------------------------- | -------- | ------------ |
| Patrón BUSCAR + FILTRAR (Blog)      | ✅       | ⬜           |
| Patrón BUSCAR + FILTRAR (Productos) | ✅       | ⬜           |
| Breadcrumbs (todas las páginas)     | ✅       | ⬜           |
| Hero post individual — left-align   | ✅       | ⬜           |
| Espacio breadcrumb → contenido      | ✅       | ⬜           |
