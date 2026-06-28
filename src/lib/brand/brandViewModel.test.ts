import { describe, it, expect } from "vitest";
import { ptToText, ptToHtml } from "./brandViewModel";
import type { SimplePortableText } from "@/types/sanity.types";

const block = (text: string): SimplePortableText[number] => ({
  _type: "block",
  _key: "k1",
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: "s1", text, marks: [] }],
});

describe("ptToText", () => {
  it("returns empty string for undefined", () => {
    expect(ptToText(undefined)).toBe("");
  });

  it("returns empty string for empty array", () => {
    expect(ptToText([])).toBe("");
  });

  it("extracts plain text from a single block", () => {
    expect(ptToText([block("Hola mundo")])).toBe("Hola mundo");
  });

  it("joins multiple blocks with a space", () => {
    expect(ptToText([block("Primero."), block("Segundo.")])).toBe(
      "Primero. Segundo.",
    );
  });
});

describe("ptToHtml", () => {
  it("returns empty string for undefined", () => {
    expect(ptToHtml(undefined)).toBe("");
  });

  it("wraps normal blocks in <p> tags", () => {
    const result = ptToHtml([block("Hola")]);
    expect(result).toContain("<p>");
    expect(result).toContain("Hola");
  });
});
