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
});
