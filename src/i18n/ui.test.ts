import { describe, it, expect } from "vitest";
import { ui } from "./ui";

describe("ui", () => {
  it("en has all es keys", () => {
    const esKeys = Object.keys(ui.es);
    const enKeys = new Set(Object.keys(ui.en));
    const missing = esKeys.filter((k) => !enKeys.has(k));
    expect(missing).toEqual([]);
  });
});
