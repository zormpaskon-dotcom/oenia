import { Appellation, MacroRegion } from "@prisma/client";

// Ίδιο URL-driven pattern με /krasia και /oinopoieia — αλλά χωρίς page (δεν
// υπάρχει pagination εδώ, 53 περιοχές χωράνε ολόκληρες σε μία σελίδα).
export const SORT_OPTIONS = [
  { value: "featured", label: "Προτεινόμενα" },
  { value: "wines", label: "Περισσότερα κρασιά" },
  { value: "wineries", label: "Περισσότερα οινοποιεία" },
  { value: "name_asc", label: "Α–Ω" },
  { value: "name_desc", label: "Ω–Α" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

// "NONE" = regions χωρίς appellation (Appellation? είναι null στη βάση) —
// δεν υπάρχει σαν πραγματική enum τιμή, είναι δικό μας sentinel για το URL.
export type AppellationFilterValue = Appellation | "NONE";

export type FilterState = {
  macroRegion: MacroRegion[];
  appellation: AppellationFilterValue[];
  search?: string;
  sort?: string;
};

const MACRO_REGION_VALUES = new Set<string>(Object.values(MacroRegion));
const APPELLATION_FILTER_VALUES = new Set<string>([...Object.values(Appellation), "NONE"]);

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

export function isAppellationFilterValue(value: string): value is AppellationFilterValue {
  return APPELLATION_FILTER_VALUES.has(value);
}

// Χωρίς page — hrefFor παίρνει ολόκληρο το FilterState (δεν υπάρχει pagination
// που να χρειάζεται να το εξαιρέσουμε, σε αντίθεση με /krasia, /oinopoieia).
export function hrefFor(state: FilterState): string {
  const params = new URLSearchParams();
  if (state.macroRegion.length) params.set("macroRegion", state.macroRegion.join(","));
  if (state.appellation.length) params.set("appellation", state.appellation.join(","));
  if (state.search) params.set("search", state.search);
  if (state.sort) params.set("sort", state.sort);
  const qs = params.toString();
  return qs ? `/perioches?${qs}` : "/perioches";
}
