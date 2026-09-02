import { describe, expect, it } from "vitest";
import { hrefFor, toggleValue, toList, type FilterState } from "./filters";

describe("toList", () => {
  it("returns an empty array for undefined", () => {
    expect(toList(undefined)).toEqual([]);
  });

  it("splits a comma-separated string", () => {
    expect(toList("red,white")).toEqual(["red", "white"]);
  });

  it("joins and re-splits an array of query values", () => {
    expect(toList(["red", "white,rose"])).toEqual(["red", "white", "rose"]);
  });

  it("drops empty segments", () => {
    expect(toList("red,,white,")).toEqual(["red", "white"]);
  });
});

describe("toggleValue", () => {
  it("adds a value not already present", () => {
    expect(toggleValue(["red"], "white")).toEqual(["red", "white"]);
  });

  it("removes a value that is already present", () => {
    expect(toggleValue(["red", "white"], "red")).toEqual(["white"]);
  });
});

const baseState: FilterState = {
  color: [],
  region: [],
  variety: [],
};

describe("hrefFor", () => {
  it("returns the bare route when no filters are active", () => {
    expect(hrefFor(baseState)).toBe("/krasia");
  });

  it("serializes multiple filter dimensions as comma-joined query params", () => {
    const href = hrefFor({
      ...baseState,
      color: ["red", "rose"],
      region: ["naoussa"],
      minRating: 4,
      price: "mid",
      sort: "rating",
    });
    const url = new URL(href, "http://example.com");
    expect(url.pathname).toBe("/krasia");
    expect(url.searchParams.get("color")).toBe("red,rose");
    expect(url.searchParams.get("region")).toBe("naoussa");
    expect(url.searchParams.get("minRating")).toBe("4");
    expect(url.searchParams.get("price")).toBe("mid");
    expect(url.searchParams.get("sort")).toBe("rating");
  });

  it("omits falsy fields entirely rather than emitting empty params", () => {
    const href = hrefFor({ ...baseState, color: ["red"] });
    expect(href).toBe("/krasia?color=red");
  });
});
