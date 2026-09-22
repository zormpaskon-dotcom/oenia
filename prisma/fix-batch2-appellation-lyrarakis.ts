// PHASE 3B — BATCH 2 — Group 6 (Lyrarakis) — Appellation enrichment.
// Γράφει ΜΟΝΟ το πεδίο `appellation` για 2 κρασιά του Οινοποιείου Λυραράκη,
// όπου το επίσημο per-vintage technical-sheet PDF (lyrarakis.com, "Technical
// Sheet" download archive) δηλώνει ρητά στην κεφαλίδα "PROTECTED
// GEOGRAPHICAL INDICATION CRETE" — που αντιστοιχεί ακριβώς στο DB enum
// Appellation.PGI. Vintage και ABV ΔΕΝ αγγίζονται.
//
// 1. lyrarakis-plyto-psarades : appellation null → PGI
//    PDF: "Plyto Psarades - 2025.pdf"
//    Evidence: "PROTECTED GEOGRAPHICAL INDICATION CRETE" (τίτλος "PLYTO
//    PSARADES 2025"). Exact vintage match: DB vintage=2025 = PDF "2025".
//    (Σημείωση εκτός scope: το PDF αναφέρει Alcohol 13.4% έναντι DB abv=13 —
//    μικρή απόκλιση, ΔΕΝ γράφεται εδώ, εκτός scope αυτού του group.)
//
// 2. lyrarakis-dafni-psarades : appellation null → PGI
//    PDF: "Dafni Psarades - 2024_compressed.pdf"
//    Evidence: "PROTECTED GEOGRAPHICAL INDICATION CRETE" (τίτλος "DAFNI
//    PSARADES 2024"). Cross-validated με exact ABV match: PDF "Alcohol:
//    12.5%" = DB abv 12.5 (exact match), επιβεβαιώνοντας το σωστό vintage
//    παρόλο που το DB vintage παραμένει null (δεν αγγίζεται εδώ).
import { PrismaClient, Appellation } from "@prisma/client";
const prisma = new PrismaClient();

const updates: { slug: string; appellation: Appellation }[] = [
  { slug: "lyrarakis-plyto-psarades", appellation: Appellation.PGI },
  { slug: "lyrarakis-dafni-psarades", appellation: Appellation.PGI },
];

async function main() {
  for (const { slug, appellation } of updates) {
    const wine = await prisma.wine.findUniqueOrThrow({
      where: { slug },
      select: { id: true, slug: true, appellation: true },
    });

    if (wine.appellation !== null) {
      console.log(`✗ SKIPPED ${slug}: appellation is already ${wine.appellation} (expected null) — no overwrite`);
      continue;
    }

    await prisma.wine.update({
      where: { id: wine.id },
      data: { appellation },
    });
    console.log(`✓ ${slug}: appellation null → ${appellation}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
