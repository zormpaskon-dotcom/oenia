// PHASE 3B — BATCH 2 — Group 2 (Alpha Estate) — Vintage enrichment.
// Γράφει ΜΟΝΟ το πεδίο `vintage` για 8 κρασιά του Κτήμα Άλφα (Alpha Estate),
// όπου η επίσημη σελίδα προϊόντος έχει ένα per-vintage "TECHNICAL
// INFORMATION" panel (data-group="YYYY") του οποίου το "Alcohol: X% vol."
// ταιριάζει ΑΚΡΙΒΩΣ με το ήδη υπάρχον `abv` στη βάση. Το abv δεν αλλάζει —
// χρησιμοποιείται μόνο ως cross-match evidence για να προσδιοριστεί ποιο
// vintage panel αντιστοιχεί στο συγκεκριμένο record. Κανένα άλλο πεδίο
// αγγίζεται (abv/appellation/varieties/descriptions/tastingNotes/
// winemakingNotes/foodPairings/winery data).
//
// 1. alpha-one            : vintage null → 2018
//    Πηγή: alpha-estate.com/product/alpha-one/ — panel data-group="2018",
//    "Alcohol: 14,64% vol." (DB abv=14.64, exact match).
//
// 2. axia                 : vintage null → 2020
//    Πηγή: alpha-estate.com/product/axia/ — panel data-group="2020",
//    "Alcohol: 14,32% vol." (DB abv=14.32, exact match).
//
// 3. ecosystem-chardonnay-trampa : vintage null → 2023
//    Πηγή: alpha-estate.com/product/ecosystem-chardonnay/ — panel
//    data-group="2023", "Alcohol: 13,14% vol." (DB abv=13.14, exact match).
//
// 4. ecosystem-sauvignon-blanc-fume : vintage null → 2023
//    Πηγή: alpha-estate.com/product/ecosystem-sauvignon-blanc/ — panel
//    data-group="2023", "Alcohol: 13,06% vol." (DB abv=13.06, exact match).
//
// 5. ecosystem-tannat-vrachos : vintage null → 2020
//    Πηγή: alpha-estate.com/product/ecosystem-tannat/ — panel
//    data-group="2020", "Alcohol: 14,71% vol." (DB abv=14.71, exact match).
//
// 6. ecosystem-malagouzia-latypes : vintage null → 2022
//    Πηγή: alpha-estate.com/product/ecosystem-malagouzia/ — μόνο δύο panels
//    διαθέσιμα: data-group="2023" (Alcohol 12,67%) και data-group="2022"
//    (Alcohol 12,97%). DB abv=12.97 ταιριάζει ΜΟΝΟ με το 2022 panel.
//
// 7. omega-opsimos-trygos : vintage null → 2020
//    Πηγή: alpha-estate.com/product/omega-white/ — panel data-group="2020",
//    "Alcohol: 12,12% vol." (DB abv=12.12, exact match). Επιπλέον cross-
//    validated: επίσημη variety composition (Gewürztraminer 85% /
//    Μαλαγουζιά 15%) ταυτίζεται ακριβώς με τα υπάρχοντα VarietyOnWine
//    relations του record, επιβεβαιώνοντας ότι είναι το σωστό προϊόν.
//
// 8. ktima-alfa-erythro-smx : vintage null → 2021
//    Πηγή: alpha-estate.com/product/ktima-alpha-red-smx/ — panel
//    data-group="2021", "Alcohol: 14,54% vol." (DB abv=14.54, exact match).
//
// ΔΕΝ αγγίζεται: ecosystem-pinot-noir-strofi (παραμένει UNRESOLVED — το
// official archive του προϊόντος δεν έχει καθόλου vintage 2023 panel).
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const updates: { slug: string; vintage: number }[] = [
  { slug: "alpha-one", vintage: 2018 },
  { slug: "axia", vintage: 2020 },
  { slug: "ecosystem-chardonnay-trampa", vintage: 2023 },
  { slug: "ecosystem-sauvignon-blanc-fume", vintage: 2023 },
  { slug: "ecosystem-tannat-vrachos", vintage: 2020 },
  { slug: "ecosystem-malagouzia-latypes", vintage: 2022 },
  { slug: "omega-opsimos-trygos", vintage: 2020 },
  { slug: "ktima-alfa-erythro-smx", vintage: 2021 },
];

async function main() {
  for (const { slug, vintage } of updates) {
    const wine = await prisma.wine.findUniqueOrThrow({
      where: { slug },
      select: { id: true, slug: true, vintage: true },
    });

    if (wine.vintage !== null) {
      console.log(`✗ SKIPPED ${slug}: vintage is already ${wine.vintage} (expected null) — no overwrite`);
      continue;
    }

    await prisma.wine.update({
      where: { id: wine.id },
      data: { vintage },
    });
    console.log(`✓ ${slug}: vintage null → ${vintage}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
