// PHASE 3B — BATCH 2 — Group 7 (T-Oinos) — Winemaking notes enrichment.
// Γράφει ΜΟΝΟ το πεδίο `winemakingNotes` για 4 κρασιά του T-Oinos, όπου το
// επίσημο per-vintage "TECHNICAL DATA" PDF (toinos.com/the-wine-collection/)
// δίνει σαφή, wine-specific περιγραφή της διαδικασίας οινοποίησης (τρύγος,
// πίεση, ζύμωση, ωρίμανση) — ξεχωριστή από το γενικό vintage-weather
// narrative. Κάθε PDF αντιστοιχεί ακριβώς στο vintage που ήδη υπάρχει στη
// βάση για το συγκεκριμένο κρασί. Κανένα άλλο πεδίο αγγίζεται.
//
// 1. t-oinos-clos-stegasta-assyrtiko-rare (vintage 2022)
//    PDF: CLOS-STEGASTA-ASYRTIKO-RARE-2022.pdf
//    EN: "Handpicked clusters placed in 20 Kg bins, were pressed in
//    pneumatic press. Alcoholic fermentation with indigenous yeasts. Ageing
//    over lees for 8 months partly in stainless steel tanks, amphores, and
//    barrels."
//
// 2. t-oinos-clos-stegasta-mavrotragano-rare (vintage 2021)
//    PDF: CLOS-STEGASTA-MAVROTRAGANO-RARE-2021.pdf
//    EN: "Whole berry with a percentage of whole cluster grapes were gently
//    introduced in two and three and a half tones open wooden vats...
//    grapes were inoculated with the yeasts from our vineyards (research
//    program in collaboration with Biocepage). The temperature is
//    controlled. Malolactic fermentation is completed in barrels. The wine
//    matures for twelve to fourteen months in 500lt oak barrels, 20% of
//    which are new."
//
// 3. t-oinos-clos-stegasta-mavrotragano (vintage 2022)
//    PDF: CLOS-STEGASTA-MAVROTRAGANO-2022.pdf
//    EN: "Whole berries are gently introduced in two and three and a half
//    tones open wooden vats... grapes were inoculated with the yeasts from
//    our vineyards (research program in collaboration with Biocepage). The
//    temperature is controlled. Malolactic fermentation is completed in
//    barrels. The wine matures for ten to twelve months in 500lt oak
//    barrels, 20% of which are new."
//
// 4. t-oinos-clos-stegasta-rose (vintage 2023)
//    PDF: CLOS-STEGASTA-ROSE-2023-EN.pdf
//    EN: "Separate and successive handpicking of the grapes, in twenty
//    kilos bins early in the morning. Grapes directly pressed. Fermentation
//    in controlled temperatures."
//
// ΔΕΝ αγγίζεται: t-oinos-mavrose (vintage 2023) — μόνο technical sheet
// 2024 υπάρχει, όχι exact-vintage πηγή, παραμένει MEDIUM/no-write.
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const updates: { slug: string; winemakingNotes: string }[] = [
  {
    slug: "t-oinos-clos-stegasta-assyrtiko-rare",
    winemakingNotes:
      "Χειρωνακτικός τρύγος νωρίς το πρωί, με διαδοχική συγκομιδή από συγκεκριμένο οικόπεδο εντός του αμπελώνα Στεγάστα. Τα τσαμπιά τοποθετήθηκαν σε κιβώτια 20 κιλών και πιέστηκαν σε πνευματικό πιεστήριο. Αλκοολική ζύμωση με αυθόρμητες (ιθαγενείς) ζύμες. Ωρίμανση με τις οινολάσπες για 8 μήνες, εν μέρει σε ανοξείδωτες δεξαμενές, αμφορείς και βαρέλια.",
  },
  {
    slug: "t-oinos-clos-stegasta-mavrotragano-rare",
    winemakingNotes:
      "Επιλεγμένα τσαμπιά από συγκεκριμένες πεζούλες του ίδιου αγροτεμαχίου. Ολόκληρες ρώγες, με ποσοστό ολόκληρου τσαμπιού, τοποθετήθηκαν απαλά σε ανοιχτούς ξύλινους κάδους 2 και 3,5 τόνων. Εμβολιασμός με ζύμες από τους δικούς μας αμπελώνες (ερευνητικό πρόγραμμα σε συνεργασία με τη Biocepage), με ελεγχόμενη θερμοκρασία. Η μηλογαλακτική ζύμωση ολοκληρώνεται σε βαρέλια. Ωρίμανση 12–14 μήνες σε βαρέλια δρυός των 500 λίτρων, 20% εκ των οποίων καινούρια.",
  },
  {
    slug: "t-oinos-clos-stegasta-mavrotragano",
    winemakingNotes:
      "Ολόκληρες ρώγες τοποθετήθηκαν απαλά σε ανοιχτούς ξύλινους κάδους 2 και 3,5 τόνων. Εμβολιασμός με ζύμες από τους δικούς μας αμπελώνες (ερευνητικό πρόγραμμα σε συνεργασία με τη Biocepage), με ελεγχόμενη θερμοκρασία. Η μηλογαλακτική ζύμωση ολοκληρώνεται σε βαρέλια. Ωρίμανση 10–12 μήνες σε βαρέλια δρυός των 500 λίτρων, 20% εκ των οποίων καινούρια.",
  },
  {
    slug: "t-oinos-clos-stegasta-rose",
    winemakingNotes:
      "Ξεχωριστός και διαδοχικός χειρωνακτικός τρύγος, σε κιβώτια 20 κιλών, νωρίς το πρωί. Τα σταφύλια πιέστηκαν απευθείας. Ζύμωση σε ελεγχόμενη θερμοκρασία.",
  },
];

async function main() {
  for (const { slug, winemakingNotes } of updates) {
    const wine = await prisma.wine.findUniqueOrThrow({
      where: { slug },
      select: { id: true, slug: true, winemakingNotes: true },
    });

    if (wine.winemakingNotes && wine.winemakingNotes.trim() !== "") {
      console.log(`✗ SKIPPED ${slug}: winemakingNotes already has content — no overwrite`);
      continue;
    }

    await prisma.wine.update({
      where: { id: wine.id },
      data: { winemakingNotes },
    });
    console.log(`✓ ${slug}: winemakingNotes set (${winemakingNotes.length} chars)`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
