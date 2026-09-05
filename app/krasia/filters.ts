import { PriceRange, WineColor, WineStyle } from "@prisma/client";

export const COLOR_LABELS: Record<string, string> = {
  white: "Λευκό",
  red: "Κόκκινο",
  rose: "Ροζέ",
  orange: "Πορτοκαλί",
};

export const COLOR_ENUM: Record<string, WineColor> = {
  white: WineColor.WHITE,
  red: WineColor.RED,
  rose: WineColor.ROSE,
  orange: WineColor.ORANGE,
};

export const COLOR_SLUG_BY_ENUM: Record<WineColor, string> = {
  WHITE: "white",
  RED: "red",
  ROSE: "rose",
  ORANGE: "orange",
};

export const PRICE_LABELS: Record<string, string> = {
  budget: "€",
  mid: "€€",
  premium: "€€€",
};

export const PRICE_ENUM: Record<string, PriceRange> = {
  budget: PriceRange.BUDGET,
  mid: PriceRange.MID,
  premium: PriceRange.PREMIUM,
};

export const STYLE_LABELS: Record<string, string> = {
  dry: "Ξηρό",
  off_dry: "Ημίξηρο",
  semi_sweet: "Ημίγλυκο",
  sweet: "Γλυκό",
};

export const STYLE_ENUM: Record<string, WineStyle> = {
  dry: WineStyle.DRY,
  off_dry: WineStyle.OFF_DRY,
  semi_sweet: WineStyle.SEMI_SWEET,
  sweet: WineStyle.SWEET,
};

export const STYLE_SLUG_BY_ENUM: Record<WineStyle, string> = {
  DRY: "dry",
  OFF_DRY: "off_dry",
  SEMI_SWEET: "semi_sweet",
  SWEET: "sweet",
};

export const SORT_OPTIONS = [
  { value: "popular", label: "Δημοφιλή" },
  { value: "rating", label: "Καλύτερη βαθμολογία" },
  { value: "new", label: "Νεότερα" },
  { value: "name", label: "Αλφαβητικά" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export type FilterState = {
  color: string[];
  region: string[];
  variety: string[];
  minRating?: number;
  style?: string;
  sort?: string;
};

export function toList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(",") : value;
  return raw.split(",").filter(Boolean);
}

export function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function hrefFor(state: FilterState): string {
  const params = new URLSearchParams();
  if (state.color.length) params.set("color", state.color.join(","));
  if (state.region.length) params.set("region", state.region.join(","));
  if (state.variety.length) params.set("variety", state.variety.join(","));
  if (state.minRating) params.set("minRating", String(state.minRating));
  if (state.style) params.set("style", state.style);
  if (state.sort) params.set("sort", state.sort);
  const qs = params.toString();
  return qs ? `/krasia?${qs}` : "/krasia";
}
