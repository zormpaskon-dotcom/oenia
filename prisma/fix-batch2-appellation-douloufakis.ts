// PHASE 3B — BATCH 2 — Group 4 (Douloufakis) — Appellation enrichment.
// Γράφει ΜΟΝΟ το πεδίο `appellation` για 4 κρασιά του Οινοποιείου Δουλουφάκη,
// όπου το επίσημο technical-sheet PDF (douloufakis.wine/downloads/) δηλώνει
// ρητά "Οίνος Επιτραπέζιος" / "Επιτραπέζιος Οίνος" — που αντιστοιχεί ακριβώς
// στο DB enum Appellation.TABLE (βλ. prisma/schema.prisma: "TABLE // Τοπικός
// / επιτραπέζιος"). Κάθε PDF είναι vintage-specific (τίτλος + filename) και
// επιβεβαιώθηκε επιπλέον με exact ABV cross-match έναντι της ήδη υπάρχουσας
// τιμής στη βάση, ώστε να είναι βέβαιο ότι πρόκειται για το ίδιο προϊόν/
// vintage. Vintage και ABV ΔΕΝ αγγίζονται — ήδη σωστά στη βάση.
//
// 1. douloufakis-sangiovese : appellation null → TABLE
//    PDF: EL_DOULOUFAKIS_SANGIOVESE_ERYTHRO_KRASI-2019.pdf
//    Evidence: "Οίνος Ερυθρός Ξηρός, Επιτραπέζιος" (τίτλος "SANGIOVESE
//    ΔΟΥΛΟΥΦΑΚΗ 2019"). Verified vintage: 2019 (matches DB). Verified ABV
//    cross-check: PDF "ΑΛΚΟΟΛ 13,7 % vol" = DB abv 13.7 (exact match).
//
// 2. douloufakis-helios : appellation null → TABLE
//    PDF: EL_DOULOUFAKIS_HELIOS_ERYTHRO_KRASI-2014-1.pdf
//    Evidence: "Οίνος Επιτραπέζιος" (τίτλος "HELIOS ΔΟΥΛΟΥΦΑΚΗ 2014").
//    Verified vintage: 2014 (matches DB). Verified ABV cross-check: PDF
//    "ΑΛΚΟΟΛ 14,8 % vol" = DB abv 14.8 (exact match).
//
// 3. douloufakis-notos-borias : appellation null → TABLE
//    PDF: EL_DOULOUFAKIS_ΝΟΤΟΣ-ΒΟΡΙΑΣ_ERYTHR_KRASI_2019-νεο-1.pdf
//    Evidence: "Επιτραπέζιος Οίνος Ερυθρός Ξηρός" (τίτλος "«NΟΤΟΣεγώ
//    ΒΟΡΙΑΣεσύ» ΔΟΥΛΟΥΦΑΚΗ 2019"). Verified vintage: 2019 (matches DB).
//    Verified ABV cross-check: PDF "ΑΛΚΟΟΛ 13,2 % vol" = DB abv 13.2
//    (exact match).
//
// 4. douloufakis-tachtas : appellation null → TABLE
//    PDF: EL_DOULOUFAKIS_TACHTAS_LEYKO_KRASI_2025.pdf
//    Evidence: "Επιτραπέζιος Οίνος Λευκός Ξηρός" (τίτλος "ΤΑΧΤΑΣ ΔΟΥΛΟΥΦΑΚΗ
//    2025"). Verified vintage: 2025 (matches DB). Verified ABV cross-check:
//    PDF "ΑΛΚΟΟΛ 12.3 % vol" = DB abv 12.3 (exact match).
//
// ΔΕΝ αγγίζεται: douloufakis-afrodis (παραμένει UNRESOLVED — το επίσημο PDF
// επιβεβαιώνει vintage 2021 + abv 12.25 αλλά δεν δηλώνει καμία appellation/
// κατηγορία οίνου, καθώς πρόκειται για αφρώδες με ετικέτα "Méthode
// Traditionnelle... BRUT", όχι ΠΟΠ/ΠΓΕ/Επιτραπέζιος).
import { PrismaClient, Appellation } from "@prisma/client";
const prisma = new PrismaClient();

const updates: { slug: string; appellation: Appellation }[] = [
  { slug: "douloufakis-sangiovese", appellation: Appellation.TABLE },
  { slug: "douloufakis-helios", appellation: Appellation.TABLE },
  { slug: "douloufakis-notos-borias", appellation: Appellation.TABLE },
  { slug: "douloufakis-tachtas", appellation: Appellation.TABLE },
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
