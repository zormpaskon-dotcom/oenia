import { describe, expect, it } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("transliterates Greek to Latin", () => {
    expect(slugify("Κτήμα Παλαιού Αμπελώνα")).toBe("ktima-palaioy-ampelona");
  });

  it("strips tonos accents", () => {
    expect(slugify("Ασύρτικο Καλντέρας")).toBe("asyrtiko-kalnteras");
  });

  it("collapses whitespace and punctuation into single hyphens", () => {
    expect(slugify("Κτήμα  Λυγαριά — Σαντορίνη!")).toBe("ktima-lygaria-santorini");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  Νεμέα  ")).toBe("nemea");
  });

  it("handles already-Latin input", () => {
    expect(slugify("Domaine Test 2024")).toBe("domaine-test-2024");
  });

  it("returns an empty string for input with no sluggable characters", () => {
    expect(slugify("!!!")).toBe("");
  });
});
