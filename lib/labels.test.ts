import { describe, expect, it } from "vitest";
import {
  ArticleCategory,
  Appellation,
  MacroRegion,
  WineColor,
  WineStyle,
} from "@prisma/client";
import {
  APPELLATION_LABEL,
  CATEGORY_LABEL,
  COLOR_GRADIENT,
  COLOR_NAME,
  MACRO_REGION_LABEL,
  STYLE_NAME,
  reviewCountLabel,
} from "./labels";

// Αυτά τα tests υπάρχουν για ένα συγκεκριμένο σενάριο: κάποιος προσθέτει μια νέα τιμή
// σε ένα Prisma enum (π.χ. νέο WineColor) αλλά ξεχνάει να ενημερώσει το αντίστοιχο label
// map. Χωρίς αυτόν τον έλεγχο, το UI θα δείξει "undefined" αθόρυβα σε production.

describe("label map completeness", () => {
  it("COLOR_NAME covers every WineColor", () => {
    for (const color of Object.values(WineColor)) {
      expect(COLOR_NAME[color], `missing COLOR_NAME for ${color}`).toBeDefined();
    }
  });

  it("COLOR_GRADIENT covers every WineColor", () => {
    for (const color of Object.values(WineColor)) {
      expect(COLOR_GRADIENT[color], `missing COLOR_GRADIENT for ${color}`).toBeDefined();
    }
  });

  it("STYLE_NAME covers every WineStyle", () => {
    for (const style of Object.values(WineStyle)) {
      expect(STYLE_NAME[style], `missing STYLE_NAME for ${style}`).toBeDefined();
    }
  });

  it("APPELLATION_LABEL covers every Appellation", () => {
    for (const appellation of Object.values(Appellation)) {
      expect(APPELLATION_LABEL[appellation], `missing APPELLATION_LABEL for ${appellation}`).toBeDefined();
    }
  });

  it("MACRO_REGION_LABEL covers every MacroRegion", () => {
    for (const region of Object.values(MacroRegion)) {
      expect(MACRO_REGION_LABEL[region], `missing MACRO_REGION_LABEL for ${region}`).toBeDefined();
    }
  });

  it("CATEGORY_LABEL covers every ArticleCategory", () => {
    for (const category of Object.values(ArticleCategory)) {
      expect(CATEGORY_LABEL[category], `missing CATEGORY_LABEL for ${category}`).toBeDefined();
    }
  });
});

describe("reviewCountLabel", () => {
  it("uses singular for exactly one review", () => {
    expect(reviewCountLabel(1)).toBe("1 αξιολόγηση");
  });

  it("uses plural for zero and for more than one", () => {
    expect(reviewCountLabel(0)).toBe("0 αξιολογήσεις");
    expect(reviewCountLabel(5)).toBe("5 αξιολογήσεις");
  });
});
