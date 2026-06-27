// src/i18n/utils.test.ts
import { describe, it, expect } from "vitest";
import { getLangFromUrl, useTranslations, getLocalizedUrl } from "./utils";

describe("getLangFromUrl", () => {
  it("returns es for root", () =>
    expect(getLangFromUrl(new URL("http://x.com/"))).toBe("es"));
  it("returns es for /blog", () =>
    expect(getLangFromUrl(new URL("http://x.com/blog"))).toBe("es"));
  it("returns es for /productos", () =>
    expect(getLangFromUrl(new URL("http://x.com/productos"))).toBe("es"));
  it("returns en for /en", () =>
    expect(getLangFromUrl(new URL("http://x.com/en"))).toBe("en"));
  it("returns en for /en/", () =>
    expect(getLangFromUrl(new URL("http://x.com/en/"))).toBe("en"));
  it("returns en for /en/blog", () =>
    expect(getLangFromUrl(new URL("http://x.com/en/blog"))).toBe("en"));
  it("does not mistake /enterprise for en", () =>
    expect(getLangFromUrl(new URL("http://x.com/enterprise"))).toBe("es"));
});

describe("useTranslations", () => {
  it("returns ES nav.products as Productos", () => {
    const t = useTranslations("es");
    expect(t("nav.products")).toBe("Productos");
  });
  it("returns EN nav.products as Products", () => {
    const t = useTranslations("en");
    expect(t("nav.products")).toBe("Products");
  });
  it("returns ES 404.title", () => {
    const t = useTranslations("es");
    expect(t("404.title")).toBe("Página no encontrada");
  });
});

describe("getLocalizedUrl", () => {
  it("ES / → EN /en", () => expect(getLocalizedUrl("en", "/")).toBe("/en"));
  it("EN /en → ES /", () => expect(getLocalizedUrl("es", "/en")).toBe("/"));
  it("ES /blog → EN /en/blog", () =>
    expect(getLocalizedUrl("en", "/blog")).toBe("/en/blog"));
  it("EN /en/blog → ES /blog", () =>
    expect(getLocalizedUrl("es", "/en/blog")).toBe("/blog"));
  it("ES /productos → EN /en/products", () =>
    expect(getLocalizedUrl("en", "/productos")).toBe("/en/products"));
  it("EN /en/products → ES /productos", () =>
    expect(getLocalizedUrl("es", "/en/products")).toBe("/productos"));
  it("ES /marca → EN /en/brand", () =>
    expect(getLocalizedUrl("en", "/marca")).toBe("/en/brand"));
  it("EN /en/brand → ES /marca", () =>
    expect(getLocalizedUrl("es", "/en/brand")).toBe("/marca"));
  it("unknown ES path falls back to /en", () =>
    expect(getLocalizedUrl("en", "/unknown")).toBe("/en"));
  it("unknown EN path falls back to /", () =>
    expect(getLocalizedUrl("es", "/en/unknown")).toBe("/"));
});
