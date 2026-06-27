import { describe, it, expect } from "vitest";
import { formatPostDate, readingTime } from "./postViewModel";

describe("formatPostDate", () => {
  it("formats date in Spanish", () => {
    const result = formatPostDate("2026-06-15T00:00:00Z", "es");
    expect(result).toMatch(/junio/i);
    expect(result).toMatch(/2026/);
  });

  it("formats date in English", () => {
    const result = formatPostDate("2026-06-15T00:00:00Z", "en");
    expect(result).toMatch(/june/i);
    expect(result).toMatch(/2026/);
  });
});

describe("readingTime", () => {
  it("returns at least 1 minute for empty body", () => {
    expect(readingTime([])).toBe(1);
  });

  it("counts words across block children", () => {
    const body = [
      {
        _type: "block",
        children: [{ text: Array(201).fill("word").join(" ") }],
      },
    ];
    expect(readingTime(body)).toBe(2);
  });

  it("ignores non-block entries", () => {
    const body = [
      { _type: "youtubeEmbed", videoId: "abc" },
      { _type: "block", children: [{ text: "one two three" }] },
    ];
    expect(readingTime(body)).toBe(1);
  });
});
