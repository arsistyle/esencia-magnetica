// src/lib/product/productViewModel.ts

export interface ProductUrlParams {
  categoria?: string;
  tienda?: string;
  q?: string;
  orden?: string;
  page?: number;
}

export function buildProductsUrl(
  basePath: string,
  params: ProductUrlParams,
): string {
  const url = new URL(basePath, "http://x");
  if (params.categoria) url.searchParams.set("categoria", params.categoria);
  if (params.tienda) url.searchParams.set("tienda", params.tienda);
  if (params.q) url.searchParams.set("q", params.q);
  if (params.orden) url.searchParams.set("orden", params.orden);
  if (params.page && params.page > 1)
    url.searchParams.set("page", String(params.page));
  return url.pathname + (url.search || "");
}
