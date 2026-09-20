import { describe, expect, it } from "vitest";
import { facetSeo } from "./facet-seo";

describe("facetSeo", () => {
  it("keeps the clean base URL indexable (no params)", () => {
    expect(facetSeo([], ["color", "style"])).toEqual({ indexable: true });
  });

  it("keeps a single meaningful filter indexable", () => {
    expect(facetSeo(["color"], ["color", "style"])).toEqual({ indexable: true });
  });

  it("noindexes a single non-meaningful filter", () => {
    expect(facetSeo(["region"], ["color", "style"])).toEqual({ indexable: false });
  });

  it("noindexes utility params (sort/page/search)", () => {
    expect(facetSeo(["sort"], ["color", "style"])).toEqual({ indexable: false });
    expect(facetSeo(["page"], ["color", "style"])).toEqual({ indexable: false });
    expect(facetSeo(["search"], ["color", "style"])).toEqual({ indexable: false });
  });

  it("noindexes a combination even if one key is meaningful", () => {
    expect(facetSeo(["color", "style"], ["color", "style"])).toEqual({ indexable: false });
    expect(facetSeo(["color", "sort"], ["color", "style"])).toEqual({ indexable: false });
  });

  it("supports pages with no meaningful keys at all", () => {
    expect(facetSeo(["region"], [])).toEqual({ indexable: false });
    expect(facetSeo([], [])).toEqual({ indexable: true });
  });
});
