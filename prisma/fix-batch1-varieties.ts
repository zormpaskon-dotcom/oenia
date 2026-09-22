// BATCH 1 — Missing wine varieties (Phase 3B).
// Γράφει ΜΟΝΟ τα 2 κρασιά με HIGH-confidence official-source ποικιλίες όπου
// ΟΛΕΣ οι ποικιλίες ήδη υπάρχουν στη βάση (καμία νέα Variety δημιουργείται
// εδώ). Τα υπόλοιπα 9 κρασιά του batch ΔΕΝ αγγίζονται — βλ. source log στο
// report: Alpha One μπλοκαρισμένο (χρειάζεται νέα Variety "Montepulciano",
// χρειάζεται ρητή επιβεβαίωση χρήστη πριν δημιουργηθεί), τα υπόλοιπα 7 δεν
// έχουν αξιόπιστη πηγή με ονομαστική σύνθεση ποικιλιών.
//
// Πηγές (HIGH confidence, official product pages, καμία percentage δόθηκε):
// - Symphony (Domaine Florian): "In 2010 we added the endemic Greek
//   varieties Xinomavro, Agiorghitiko and some Syrah..." — domaineflorian.com/product/symphony/
// - Symphony Ροζέ (Domaine Florian): "Variety: Agioritiko, Syrah" —
//   domaineflorian.com/product/symphony-rose/
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const xinomavro = await prisma.variety.findUniqueOrThrow({ where: { name: "Ξινόμαυρο" } });
  const agiorgitiko = await prisma.variety.findUniqueOrThrow({ where: { name: "Αγιωργίτικο" } });
  const syrah = await prisma.variety.findUniqueOrThrow({ where: { name: "Syrah" } });

  const symphony = await prisma.wine.findUniqueOrThrow({ where: { slug: "domaine-florian-symphony" } });
  const symphonyRose = await prisma.wine.findUniqueOrThrow({ where: { slug: "domaine-florian-symphony-rose" } });

  await prisma.varietyOnWine.createMany({
    data: [
      { wineId: symphony.id, varietyId: xinomavro.id, percentage: null },
      { wineId: symphony.id, varietyId: agiorgitiko.id, percentage: null },
      { wineId: symphony.id, varietyId: syrah.id, percentage: null },
      { wineId: symphonyRose.id, varietyId: agiorgitiko.id, percentage: null },
      { wineId: symphonyRose.id, varietyId: syrah.id, percentage: null },
    ],
  });
  console.log("✓ Symphony: Ξινόμαυρο + Αγιωργίτικο + Syrah");
  console.log("✓ Symphony Ροζέ: Αγιωργίτικο + Syrah");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
