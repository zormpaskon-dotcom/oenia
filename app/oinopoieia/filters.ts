import { MacroRegion } from "@prisma/client";

// Ίδιο URL-driven pattern με το app/krasia/filters.ts (reference implementation,
// δεν αλλάζει) — δύο πραγματικά filters εδώ (macroRegion, variety) αντί για
// πέντε, γιατί το Winery δεν έχει color/style/winery-of-itself equivalent.
export const SORT_OPTIONS = [
  { value: "featured", label: "Προτεινόμενα" },
  { value: "wines", label: "Περισσότερα κρασιά" },
  { value: "name_asc", label: "Α–Ω" },
  { value: "name_desc", label: "Ω–Α" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export const PAGE_SIZE = 24;

export type FilterState = {
  region: MacroRegion[];
  variety: string[]; // Variety.slug
  search?: string;
  sort?: string;
  page: number;
};

const MACRO_REGION_VALUES = new Set<string>(Object.values(MacroRegion));

export function toList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(",") : value;
  return raw.split(",").filter(Boolean);
}

export function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function isMacroRegionValue(value: string): value is MacroRegion {
  return MACRO_REGION_VALUES.has(value);
}

// Δεν γράφει ποτέ `page` — ίδιο σκεπτικό με το app/krasia/filters.ts.
export function hrefFor(state: Omit<FilterState, "page">): string {
  const params = new URLSearchParams();
  if (state.region.length) params.set("region", state.region.join(","));
  if (state.variety.length) params.set("variety", state.variety.join(","));
  if (state.search) params.set("search", state.search);
  if (state.sort) params.set("sort", state.sort);
  const qs = params.toString();
  return qs ? `/oinopoieia?${qs}` : "/oinopoieia";
}

export function hrefForPage(state: Omit<FilterState, "page">, page: number): string {
  const base = hrefFor(state);
  if (page <= 1) return base;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}page=${page}`;
}
