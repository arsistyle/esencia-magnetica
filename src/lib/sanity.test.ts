import { describe, it, expect, vi } from "vitest";

vi.mock("sanity:client", () => ({
  sanityClient: {
    config: () => ({ projectId: "testproject", dataset: "production" }),
  },
}));

import { resolveImageUrl, buildSrcSet } from "./sanity";

describe("resolveImageUrl", () => {
  it("returns null for null source", () => {
    expect(resolveImageUrl(null)).toBeNull();
  });

  it("returns null for undefined source", () => {
    expect(resolveImageUrl(undefined)).toBeNull();
  });

  it("returns externalUrl unchanged regardless of format/quality opts", () => {
    const src = { externalUrl: "https://example.com/img.jpg" };
    expect(resolveImageUrl(src, { format: "webp", quality: 80 })).toBe(
      "https://example.com/img.jpg",
    );
  });

  it("returns null for source with no asset ref", () => {
    expect(resolveImageUrl({})).toBeNull();
  });

  it("applies format param to Sanity asset URL", () => {
    const src = {
      asset: { asset: { _ref: "image-abc123def456-100x100-jpg" } },
    };
    const url = resolveImageUrl(src, { format: "webp" });
    expect(url).toContain("fm=webp");
  });

  it("applies quality param to Sanity asset URL", () => {
    const src = {
      asset: { asset: { _ref: "image-abc123def456-100x100-jpg" } },
    };
    const url = resolveImageUrl(src, { quality: 80 });
    expect(url).toContain("q=80");
  });
});

describe("buildSrcSet", () => {
  it("returns empty string for null source", () => {
    expect(buildSrcSet(null, [400, 800])).toBe("");
  });

  it("returns empty string for externalUrl source", () => {
    expect(
      buildSrcSet({ externalUrl: "https://example.com/img.jpg" }, [400, 800]),
    ).toBe("");
  });

  it("returns empty string for source with no asset", () => {
    expect(buildSrcSet({}, [400, 800])).toBe("");
  });

  it("returns srcset string for Sanity asset with multiple widths", () => {
    const src = {
      asset: { asset: { _ref: "image-abc123def456-100x100-jpg" } },
    };
    const result = buildSrcSet(src, [400, 800], { format: "webp" });
    expect(result).toContain("400w");
    expect(result).toContain("800w");
    expect(result).toContain("fm=webp");
  });
});
