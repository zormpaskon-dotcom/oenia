// BATCH 1 (continued) — Alpha One missing variety.
// Δημιουργεί το ελάχιστο master Variety record για "Montepulciano" (δεν
// υπήρχε καθόλου στη βάση) και συνδέει το Alpha One με Xinomavro 55% +
// Montepulciano 45%, όπως αναφέρεται ρητά στην επίσημη σελίδα προϊόντος:
// "Variety Composition: Xinomavro 55%, Montepulciano 45%" —
// alpha-estate.com/product/alpha-one/ (HIGH confidence).
// Καμία άλλη πληροφορία (description/originRegion/characteristics/...)
// προστίθεται χωρίς πηγή.
import { PrismaClient, VarietyType } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const montepulciano = await prisma.variety.create({
    data: { name: "Montepulciano", slug: "montepulciano", type: VarietyType.RED },
  });
  console.log(`✓ Νέα Variety: ${montepulciano.name} (${montepulciano.slug})`);

  const xinomavro = await prisma.variety.findUniqueOrThrow({ where: { name: "Ξινόμαυρο" } });
  const alphaOne = await prisma.wine.findUniqueOrThrow({ where: { slug: "alpha-one" } });

  await prisma.varietyOnWine.createMany({
    data: [
      { wineId: alphaOne.id, varietyId: xinomavro.id, percentage: 55 },
      { wineId: alphaOne.id, varietyId: montepulciano.id, percentage: 45 },
    ],
  });
  console.log("✓ Alpha One: Ξινόμαυρο 55% + Montepulciano 45%");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
