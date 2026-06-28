import { describe, it, expect } from "vitest";
import { buildProductsUrl } from "./productViewModel";

describe("buildProductsUrl", () => {
  it("returns base path when no params", () => {
    expect(buildProductsUrl("/productos", {})).toBe("/productos");
  });

  it("adds categoria", () => {
    expect(buildProductsUrl("/productos", { categoria: "tops" })).toBe(
      "/productos?categoria=tops",
    );
  });

  it("adds tienda", () => {
    expect(buildProductsUrl("/productos", { tienda: "amazon" })).toBe(
      "/productos?tienda=amazon",
    );
  });

  it("omits page=1", () => {
    expect(buildProductsUrl("/productos", { page: 1 })).toBe("/productos");
  });

  it("includes page > 1", () => {
    expect(buildProductsUrl("/productos", { page: 3 })).toBe(
      "/productos?page=3",
    );
  });

  it("combines all params", () => {
    expect(
      buildProductsUrl("/productos", {
        categoria: "vestidos",
        tienda: "amazon",
        q: "midi",
        orden: "nombre",
        page: 2,
      }),
    ).toBe(
      "/productos?categoria=vestidos&tienda=amazon&q=midi&orden=nombre&page=2",
    );
  });

  it("skips empty string params", () => {
    expect(buildProductsUrl("/productos", { categoria: "", tienda: "" })).toBe(
      "/productos",
    );
  });
});
