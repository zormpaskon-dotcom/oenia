import { VarietyType } from "@prisma/client";

// Ίδιο URL-driven pattern με /krasia, /oinopoieia, /perioches — αλλά χωρίς
// page (καμία pagination, 72 ποικιλίες χωράνε ολόκληρες). Το type είναι
// single-select (Όλες/Λευκές/Κόκκινες), όχι multi-select checkbox list.
export const SORT_OPTIONS = [
  { value: "featured", label: "Προτεινόμενες" },
  { value: "wines", label: "Περισσότερα κρασιά" },
  { value: "name_asc", label: "Α–Ω" },
  { value: "name_desc", label: "Ω–Α" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export type TypeFilterValue = "white" | "red";

export type FilterState = {
  type?: TypeFilterValue;
  search?: string;
  sort?: string;
};

export const TYPE_ENUM: Record<TypeFilterValue, VarietyType> = {
  white: VarietyType.WHITE,
  red: VarietyType.RED,
};

export function isTypeFilterValue(value: string): value is TypeFilterValue {
  return value === "white" || value === "red";
}

// Δεν γράφει ποτέ page — δεν υπάρχει pagination σε αυτή τη σελίδα.
export function hrefFor(state: FilterState): string {
  const params = new URLSearchParams();
  if (state.type) params.set("type", state.type);
  if (state.search) params.set("search", state.search);
  if (state.sort) params.set("sort", state.sort);
  const qs = params.toString();
  return qs ? `/poikilies?${qs}` : "/poikilies";
}
