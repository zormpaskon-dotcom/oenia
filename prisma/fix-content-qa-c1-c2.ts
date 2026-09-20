// FINAL CONTENT FIX — C1 + C2 (Final Content & Editorial QA, 2026-09-20)
// C1: "Π.Ο.Π." → "ΠΟΠ" (formatting-only, matches the sitewide undotted convention
// already used everywhere else — no wording/meaning change).
// C2: link the 2 of 6 articles that explicitly name real, published wineries in
// their own body text, via the existing ArticleOnWinery join table. The other
// 4 articles name no specific winery/wine and are intentionally left unlinked —
// no relationship is invented. No wine-level links: no article names a specific
// bottled wine, only wineries/varieties/regions.
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // ── C1 ──────────────────────────────────────────────────────────────
  const wine = await prisma.wine.findUniqueOrThrow({ where: { slug: "messenicola-syllekton" } });
  if (wine.description?.includes("Π.Ο.Π.")) {
    await prisma.wine.update({
      where: { slug: "messenicola-syllekton" },
      data: { description: wine.description.replace("Π.Ο.Π.", "ΠΟΠ") },
    });
    console.log("✓ wine messenicola-syllekton: description Π.Ο.Π. → ΠΟΠ");
  }

  const variety = await prisma.variety.findUniqueOrThrow({ where: { slug: "mavro-messenikola" } });
  if (variety.description?.includes("Π.Ο.Π.")) {
    await prisma.variety.update({
      where: { slug: "mavro-messenikola" },
      data: { description: variety.description.replace("Π.Ο.Π.", "ΠΟΠ") },
    });
    console.log("✓ variety mavro-messenikola: description Π.Ο.Π. → ΠΟΠ");
  }

  // ── C2 ──────────────────────────────────────────────────────────────
  // "Οι ποικιλίες που σώθηκαν την τελευταία στιγμή" explicitly names, by
  // winery/family name, all 5 of these: Κτήμα Ζαφειράκη (Λημνιώνα), Magoutes
  // Vineyard (Μοσχόμαυρο, Σιάτιστα — matches article's "στην τοποθεσία
  // «Μαγούτες», Σιάτιστα Δυτικής Μακεδονίας"), Tetramythos (Μαύρο
  // Καλαβρυτινό), Οινοποιείο Λυραράκη (Δαφνί, Πλυτό), Vriniotis Winery
  // (Βραδιανό). No specific bottled wine is named — only varieties and
  // families — so no ArticleOnWine rows for this one.
  const savedVarietiesArticle = await prisma.article.findUniqueOrThrow({
    where: { slug: "oi-poikilies-pou-sothikan-tin-teleutaia-stigmi" },
  });
  const savedVarietiesWineries = ["domaine-zafeirakis", "magoutes-vineyard", "tetramythos-winery", "lyrarakis", "vriniotis-winery"];
  for (const slug of savedVarietiesWineries) {
    const w = await prisma.winery.findUniqueOrThrow({ where: { slug } });
    await prisma.articleOnWinery.upsert({
      where: { articleId_wineryId: { articleId: savedVarietiesArticle.id, wineryId: w.id } },
      update: {},
      create: { articleId: savedVarietiesArticle.id, wineryId: w.id },
    });
  }
  console.log(`✓ article oi-poikilies-pou-sothikan-tin-teleutaia-stigmi: linked ${savedVarietiesWineries.length} wineries`);

  // "Τρία οινοποιεία, δύο άνθρωποι" is explicitly, entirely about these 3
  // wineries by name (the whole article is their founding story) — no
  // specific bottled wine named, only the wineries themselves.
  const threeWineriesArticle = await prisma.article.findUniqueOrThrow({
    where: { slug: "tria-oinopoieia-duo-anthropoi" },
  });
  const threeWineries = ["ktima-biblia-chora", "mikra-thira", "mikro-ktima-titou"];
  for (const slug of threeWineries) {
    const w = await prisma.winery.findUniqueOrThrow({ where: { slug } });
    await prisma.articleOnWinery.upsert({
      where: { articleId_wineryId: { articleId: threeWineriesArticle.id, wineryId: w.id } },
      update: {},
      create: { articleId: threeWineriesArticle.id, wineryId: w.id },
    });
  }
  console.log(`✓ article tria-oinopoieia-duo-anthropoi: linked ${threeWineries.length} wineries`);

  // The remaining 4 articles (xinomavro-to-barolo-tis-elladas,
  // pos-na-diavaseis-mia-elliniki-etiketa-krasiou,
  // giati-to-asyrtiko-den-moiazei-me-kanena-allo-lefko,
  // pente-mikra-oinopoieia-sti-nemea) name no specific winery or wine in their
  // body text — intentionally left with zero relationships, per "do not
  // invent relationships."

  console.log("\nDone.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
