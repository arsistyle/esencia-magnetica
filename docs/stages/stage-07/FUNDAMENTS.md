# Stage 07 — Product Catalog 🔴

> Part of the [Esencia Magnética Implementation Plan](../../PLAN.md).

**Goal:** The affiliate catalog page with sidebar filters and outbound product cards (no detail pages).

> Build against the Claude Design reference imported in [Stage 02](../stage-02/FUNDAMENTS.md).

## Tasks

1. Build the layout: sticky left sidebar (~240px) + right grid.
2. Sidebar — search box (lupa).
3. Sidebar — CATEGORÍAS checkboxes (Todo active by default; Outfits/Tops/Pantalones/Vestidos/Zapatos/Bolsos/Accesorios/Peinados), from Sanity.
4. Sidebar — TIENDA checkboxes (Amazon, Shein), from product `store` field.
5. Build the results bar above the grid: "N productos · ORDENAR POR [Más recientes ▾]", right-aligned.
6. Build the 3-column grid, 1:1 cards, **no prices**, "VER PRODUCTO →" linking out to the affiliate URL (`rel="sponsored nofollow noopener"`, new tab).
7. Implement combined filtering (category + store + search) and sorting (most recent default).
8. Add pagination at the end of the grid.
9. Add the affiliate disclosure: "Enlaces de afiliados. Podemos recibir una comisión sin coste para ti."
10. Localize all catalog UI for EN.

## Deliverables

`/productos` and `/en/productos`.

## Definition of Done

Filters/sort/search/pagination work together; all product links are correctly attributed and open externally; disclosure present.
