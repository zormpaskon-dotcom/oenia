import { DOMINANT_VARIETY_THRESHOLD, STYLE_SWEETNESS } from "./config";
import type { BlendResolution, WineInput, WineTraits, WineVarietyInput } from "./types";

type TraitKey = "acidity" | "body" | "tannins";

function determineBlend(varieties: WineVarietyInput[]): {
  resolution: BlendResolution;
  dominant: WineVarietyInput | null;
} {
  if (varieties.length === 0) return { resolution: "no-variety", dominant: null };
  if (varieties.length === 1) return { resolution: "single-variety", dominant: varieties[0] };

  const allHavePercentage = varieties.every((v) => v.percentage !== null);
  if (allHavePercentage) return { resolution: "full-percentage-blend", dominant: null };

  let dominant: WineVarietyInput | null = null;
  let maxPct = -1;
  for (const v of varieties) {
    if (v.percentage !== null && v.percentage > maxPct) {
      maxPct = v.percentage;
      dominant = v;
    }
  }
  if (dominant && maxPct >= DOMINANT_VARIETY_THRESHOLD) {
    return { resolution: "dominant-variety-estimate", dominant };
  }
  return { resolution: "unresolved-blend", dominant: null };
}

function resolveTrait(
  varieties: WineVarietyInput[],
  resolution: BlendResolution,
  dominant: WineVarietyInput | null,
  traitKey: TraitKey
): number | null {
  if (resolution === "no-variety" || resolution === "unresolved-blend") return null;
  if (resolution === "single-variety") return varieties[0].variety[traitKey];
  if (resolution === "dominant-variety-estimate") return dominant!.variety[traitKey];

  // full-percentage-blend — μόνο αν ΟΛΕΣ οι ποικιλίες έχουν τιμή για το trait,
  // αλλιώς non-computable (ποτέ partial-weighted average πάνω σε ελλιπή σύνολο).
  const values = varieties.map((v) => v.variety[traitKey]);
  if (values.some((v) => v === null)) return null;

  const totalPct = varieties.reduce((sum, v) => sum + (v.percentage as number), 0);
  if (totalPct === 0) return null;

  const weightedSum = varieties.reduce(
    (sum, v) => sum + (v.variety[traitKey] as number) * (v.percentage as number),
    0
  );
  return weightedSum / totalPct;
}

// Pure — καμία DB πρόσβαση. Μετατρέπει το ήδη-φορτωμένο wine+varieties σε
// resolved acidity/body/tannins/sweetness, με ρητή σήμανση κάθε non-computable
// τιμής (ποτέ silent 0) και του blend-resolution path που ακολουθήθηκε.
export function resolveWineTraits(wine: WineInput): WineTraits {
  const { resolution, dominant } = determineBlend(wine.varieties);

  const acidity = resolveTrait(wine.varieties, resolution, dominant, "acidity");
  const body = resolveTrait(wine.varieties, resolution, dominant, "body");
  const tannins = resolveTrait(wine.varieties, resolution, dominant, "tannins");

  const dataQualityFlags: string[] = [];
  if (resolution === "no-variety") dataQualityFlags.push("no-variety-data");
  if (resolution === "unresolved-blend") dataQualityFlags.push("unresolved-blend");
  if (resolution === "dominant-variety-estimate") dataQualityFlags.push("dominant-variety-estimate");
  if (resolution !== "no-variety" && resolution !== "unresolved-blend") {
    if (acidity === null) dataQualityFlags.push("missing-acidity-data");
    if (body === null) dataQualityFlags.push("missing-body-data");
    if (tannins === null) dataQualityFlags.push("missing-tannins-data");
  }

  return {
    acidity,
    body,
    tannins,
    wineSweetness: STYLE_SWEETNESS[wine.style],
    blendResolution: resolution,
    dataQualityFlags,
  };
}
