import { describe, it, expect } from "vitest";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildBrandJsonLd,
} from "./seo";

describe("buildArticleJsonLd", () => {
  const base = {
    title: "Test Post",
    publishedAt: "2026-01-01",
    url: "https://esencia-magnetica.com/blog/test",
    lang: "es",
  };

  it("produces a valid Article schema", () => {
    const json = JSON.parse(buildArticleJsonLd(base));
    expect(json["@context"]).toBe("https://schema.org");
    expect(json["@type"]).toBe("Article");
    expect(json.headline).toBe("Test Post");
    expect(json.datePublished).toBe("2026-01-01");
    expect(json.inLanguage).toBe("es");
    expect(json.url).toBe("https://esencia-magnetica.com/blog/test");
  });

  it("sets dateModified to updatedAt when provided", () => {
    const json = JSON.parse(
      buildArticleJsonLd({ ...base, updatedAt: "2026-06-01" }),
    );
    expect(json.dateModified).toBe("2026-06-01");
  });

  it("falls back dateModified to publishedAt when no updatedAt", () => {
    const json = JSON.parse(buildArticleJsonLd(base));
    expect(json.dateModified).toBe("2026-01-01");
  });

  it("includes image when imageUrl provided", () => {
    const json = JSON.parse(
      buildArticleJsonLd({
        ...base,
        imageUrl: "https://cdn.sanity.io/test.jpg",
      }),
    );
    expect(json.image).toBe("https://cdn.sanity.io/test.jpg");
  });

  it("omits image when imageUrl is null", () => {
    const json = JSON.parse(buildArticleJsonLd({ ...base, imageUrl: null }));
    expect(json.image).toBeUndefined();
  });

  it("includes author when authorName provided", () => {
    const json = JSON.parse(
      buildArticleJsonLd({ ...base, authorName: "Alexandra" }),
    );
    expect(json.author).toEqual({ "@type": "Person", name: "Alexandra" });
  });
});

describe("buildBreadcrumbJsonLd", () => {
  const items = [
    { name: "Inicio", url: "https://esencia-magnetica.com/" },
    { name: "Blog", url: "https://esencia-magnetica.com/blog" },
    { name: "Mi Post", url: "https://esencia-magnetica.com/blog/mi-post" },
  ];

  it("returns an empty itemListElement for empty input", () => {
    const json = JSON.parse(buildBreadcrumbJsonLd([]));
    expect(json.itemListElement).toHaveLength(0);
  });

  it("produces a valid BreadcrumbList schema", () => {
    const json = JSON.parse(buildBreadcrumbJsonLd(items));
    expect(json["@context"]).toBe("https://schema.org");
    expect(json["@type"]).toBe("BreadcrumbList");
    expect(json.itemListElement).toHaveLength(3);
  });

  it("assigns sequential positions starting at 1", () => {
    const json = JSON.parse(buildBreadcrumbJsonLd(items));
    expect(json.itemListElement[0].position).toBe(1);
    expect(json.itemListElement[2].position).toBe(3);
  });

  it("sets name and item on each list element", () => {
    const json = JSON.parse(buildBreadcrumbJsonLd(items));
    expect(json.itemListElement[1].name).toBe("Blog");
    expect(json.itemListElement[2].item).toBe(
      "https://esencia-magnetica.com/blog/mi-post",
    );
  });
});

describe("buildBrandJsonLd", () => {
  const base = {
    personName: "Alexandra",
    siteUrl: "https://esencia-magnetica.com",
    brandUrl: "https://esencia-magnetica.com/marca",
  };

  it("includes both Person and Organization in @graph", () => {
    const json = JSON.parse(buildBrandJsonLd(base));
    expect(json["@context"]).toBe("https://schema.org");
    expect(json["@graph"]).toHaveLength(2);
    expect(json["@graph"][0]["@type"]).toBe("Person");
    expect(json["@graph"][1]["@type"]).toBe("Organization");
  });

  it("omits Person when personName is empty", () => {
    const json = JSON.parse(buildBrandJsonLd({ ...base, personName: "" }));
    expect(json["@graph"]).toHaveLength(1);
    expect(json["@graph"][0]["@type"]).toBe("Organization");
  });

  it("includes sameAs in Organization when socialUrls provided", () => {
    const json = JSON.parse(
      buildBrandJsonLd({ ...base, socialUrls: ["https://instagram.com/test"] }),
    );
    expect(json["@graph"][1].sameAs).toEqual(["https://instagram.com/test"]);
  });

  it("includes heroUrl as image on Person", () => {
    const json = JSON.parse(
      buildBrandJsonLd({ ...base, heroUrl: "https://cdn.sanity.io/hero.jpg" }),
    );
    expect(json["@graph"][0].image).toBe("https://cdn.sanity.io/hero.jpg");
  });

  it("includes logoUrl on Organization", () => {
    const json = JSON.parse(
      buildBrandJsonLd({ ...base, logoUrl: "https://cdn.sanity.io/logo.png" }),
    );
    expect(json["@graph"][1].logo).toBe("https://cdn.sanity.io/logo.png");
  });
});
