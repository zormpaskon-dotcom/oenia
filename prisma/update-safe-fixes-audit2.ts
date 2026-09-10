// Υλοποιεί ακριβώς τα "SAFE TO IMPLEMENT" ευρήματα του Data & Content
// Quality Audit #2 — 4 wine variety relations (τεκμηριωμένες: 2 self-sourced
// από ήδη υπάρχοντα Oenia data, 2 από ανεξάρτητες εξωτερικές πηγές) + 2
// Region.recognizedYear data-fills. Καμία άλλη αλλαγή. Επαληθεύει πριν από
// κάθε write ότι δεν υπάρχει ήδη η σχέση/τιμή, ώστε να μην τρέξει δύο φορές
// κατά λάθος.

import { prisma } from "../lib/prisma";

const WINE_VARIETIES: {
  wineSlug: string;
  varieties: { slug: string; percentage: number | null }[];
}[] = [
  {
    wineSlug: "domaine-florian-terzetto",
    varieties: [
      { slug: "malagousia", percentage: null },
      { slug: "asyrtiko", percentage: null },
    ],
  },
  {
    wineSlug: "muses-sweet-muse",
    varieties: [{ slug: "moschato", percentage: 100 }],
  },
  {
    wineSlug: "manousakis-hartman-molavi",
    varieties: [
      { slug: "xinomavro", percentage: null },
      { slug: "romeiko", percentage: null },
    ],
  },
  {
    wineSlug: "manousakis-nostos-alexandras",
    varieties: [
      { slug: "syrah", percentage: 40 },
      { slug: "grenache", percentage: 40 },
      { slug: "mourvedre", percentage: 20 },
    ],
  },
];

const REGION_YEARS: { slug: string; recognizedYear: number }[] = [
  { slug: "messenikola", recognizedYear: 1994 },
  { slug: "chalkidiki", recognizedYear: 1982 },
];

async function main() {
  console.log("=== Wine varieties ===");
  for (const spec of WINE_VARIETIES) {
    const wine = await prisma.wine.findUnique({
      where: { slug: spec.wineSlug },
      select: { id: true, name: true, varieties: true },
    });
    if (!wine) throw new Error(`Wine not found: ${spec.wineSlug}`);
    if (wine.varieties.length > 0) {
      throw new Error(
        `Wine "${spec.wineSlug}" έχει ήδη ${wine.varieties.length} variety relation(s) — abort χωρίς αλλαγές.`
      );
    }

    for (const v of spec.varieties) {
      const variety = await prisma.variety.findUnique({ where: { slug: v.slug } });
      if (!variety) throw new Error(`Variety not found: ${v.slug}`);
      await prisma.varietyOnWine.create({
        data: { wineId: wine.id, varietyId: variety.id, percentage: v.percentage },
      });
    }
    console.log(`✓ "${spec.wineSlug}" (${wine.name}) → ${spec.varieties.map((v) => `${v.slug}${v.percentage ? `(${v.percentage}%)` : ""}`).join(", ")}`);
  }

  console.log("\n=== Region recognizedYear ===");
  for (const spec of REGION_YEARS) {
    const region = await prisma.region.findUnique({ where: { slug: spec.slug }, select: { id: true, name: true, recognizedYear: true } });
    if (!region) throw new Error(`Region not found: ${spec.slug}`);
    if (region.recognizedYear !== null) {
      throw new Error(
        `Region "${spec.slug}" recognizedYear δεν είναι null όπως αναμενόταν (${region.recognizedYear}) — abort χωρίς αλλαγές.`
      );
    }
    await prisma.region.update({ where: { id: region.id }, data: { recognizedYear: spec.recognizedYear } });
    console.log(`✓ Region "${spec.slug}" (${region.name}) recognizedYear → ${spec.recognizedYear}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
