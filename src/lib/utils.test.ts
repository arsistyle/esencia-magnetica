import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("joins two class names with a space", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("filters out null, undefined, and false", () => {
    expect(cn("foo", null, undefined, false, "bar")).toBe("foo bar");
  });

  it("returns empty string when all values are falsy", () => {
    expect(cn(null, undefined, false)).toBe("");
  });

  it("handles conditional objects", () => {
    expect(cn("foo", { bar: true, baz: false })).toBe("foo bar");
  });

  it("resolves Tailwind conflicts — last class wins", () => {
    expect(cn("bg-gold", "bg-cream")).toBe("bg-cream");
  });

  it("allows caller to override a variant class", () => {
    expect(cn("rounded-lg px-4", "rounded-md")).toBe("px-4 rounded-md");
  });

  it("keeps text-color and text-size classes together (brand font-size tokens)", () => {
    // text-white (color) and text-body (brand font-size) must NOT be merged.
    expect(cn("text-white text-body")).toBe("text-white text-body");
  });
});
