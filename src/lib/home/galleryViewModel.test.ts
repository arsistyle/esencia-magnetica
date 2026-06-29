import { describe, it, expect } from "vitest";
import { buildMarqueeRows } from "./galleryViewModel";
import type { MarqueeItem } from "./marqueeItems";

const F1: MarqueeItem[] = [{ bg: "red" }];
const F2: MarqueeItem[] = [{ bg: "blue" }];
const img = (n: number) => ({ url: `https://cdn/${n}.jpg` });

describe("buildMarqueeRows", () => {
  it("returns fallbacks when images is null", () => {
    const [r1, r2] = buildMarqueeRows(null, F1, F2);
    expect(r1).toBe(F1);
    expect(r2).toBe(F2);
  });

  it("returns fallbacks when images is empty array", () => {
    const [r1, r2] = buildMarqueeRows([], F1, F2);
    expect(r1).toBe(F1);
    expect(r2).toBe(F2);
  });

  it("puts 5 images in row1, fallback in row2", () => {
    const images = Array.from({ length: 5 }, (_, i) => img(i));
    const [r1, r2] = buildMarqueeRows(images, F1, F2);
    expect(r1).toHaveLength(5);
    expect(r1[0].src).toBe("https://cdn/0.jpg");
    expect(r2).toBe(F2);
  });

  it("splits 15 images: row1=10, row2=5", () => {
    const images = Array.from({ length: 15 }, (_, i) => img(i));
    const [r1, r2] = buildMarqueeRows(images, F1, F2);
    expect(r1).toHaveLength(10);
    expect(r2).toHaveLength(5);
    expect(r2[0].src).toBe("https://cdn/10.jpg");
  });

  it("splits 20 images: row1=10, row2=10", () => {
    const images = Array.from({ length: 20 }, (_, i) => img(i));
    const [r1, r2] = buildMarqueeRows(images, F1, F2);
    expect(r1).toHaveLength(10);
    expect(r2).toHaveLength(10);
  });

  it("each item has src and bg set", () => {
    const images = [img(0)];
    const [r1] = buildMarqueeRows(images, F1, F2);
    expect(r1[0].src).toBe("https://cdn/0.jpg");
    expect(typeof r1[0].bg).toBe("string");
    expect(r1[0].bg.length).toBeGreaterThan(0);
  });
});
