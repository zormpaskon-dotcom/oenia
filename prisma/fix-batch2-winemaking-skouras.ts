// PHASE 3B — BATCH 2 — Group 11 (Domaine Skouras) — Winemaking notes
// enrichment. Γράφει ΜΟΝΟ το πεδίο `winemakingNotes` για 6 κρασιά, όπου η
// επίσημη σελίδα προϊόντος (skouras.gr) έχει ξεχωριστό "Vinification /
// Ageing" section (διακριτό από το "Characteristics"/tasting-notes section).
// Κάθε σελίδα επιβεβαιώθηκε exact-match: ο τίτλος δηλώνει το ίδιο vintage
// που ήδη υπάρχει στη βάση, και το "Alcohol by volume" ταυτίζεται ακριβώς
// με το υπάρχον DB abv — cross-check που επιβεβαιώνει το σωστό product/
// vintage πριν την εξαγωγή κειμένου. Κανένα άλλο πεδίο αγγίζεται.
//
// 1. viognier-eclectique (vintage 2024, abv 13.5 — exact match)
//    Πηγή: skouras.gr/en/wines/whites/viognier-eclectique
//
// 2. assyrtiko-skoyra (vintage 2025, abv 13.5 — exact match)
//    Πηγή: skouras.gr/en/wines/whites/assyrtiko
//
// 3. zoe-white (vintage 2025, abv 12.5 — exact match)
//    Πηγή: skouras.gr/en/wines/whites/zoe-white
//
// 4. zoe-rose (vintage 2025, abv 12 — exact match)
//    Πηγή: skouras.gr/en/wines/rose/zoe-rose
//
// 5. zoe-red (vintage 2025, abv 13 — exact match)
//    Πηγή: skouras.gr/en/wines/reds/zoe-red
//
// 6. titanas (vintage 2015, abv 14.5 — exact match)
//    Πηγή: skouras.gr/en/wines/reds/titanas
//    Σημείωση (εκτός scope, όχι write): η ίδια σελίδα αναφέρει "Harvest
//    dates: 24 September 2013", ασυνεπές με τον τίτλο "Titanas 2015" /
//    το ήδη υπάρχον DB vintage=2015. Το vintage ΔΕΝ αγγίζεται εδώ.
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const updates: { slug: string; winemakingNotes: string }[] = [
  {
    slug: "viognier-eclectique",
    winemakingNotes:
      "Ο τρύγος γίνεται μέσα Αυγούστου. Επαφή με τα στέμφυλα για 6 ώρες στους 14°C, αλκοολική ζύμωση στους 17°C σε καινούρια (50%) γαλλικά barriques 225L, με πλήρη μηλογαλακτική ζύμωση. Ωρίμανση 12 μηνών επί οινολασπών με τακτικό batonnage. Εμφιάλωση με βιδωτό πώμα.",
  },
  {
    slug: "assyrtiko-skoyra",
    winemakingNotes:
      "Ο τρύγος γίνεται τον Σεπτέμβριο. Πίεση ολόκληρων τσαμπιών και ζύμωση με αυτόχθονες ζύμες σε ανοξείδωτες δεξαμενές στους 15°C. Παραμονή με τις λεπτές οινολάσπες για 4 μήνες, χωρίς μηλογαλακτική ζύμωση.",
  },
  {
    slug: "zoe-white",
    winemakingNotes:
      "Ο τρύγος του Ροδίτη Αλεπού γίνεται αρχές-μέσα Σεπτεμβρίου και του Μοσχοφίλερου τέλη Σεπτεμβρίου-αρχές Οκτωβρίου. Επαφή με τα στέμφυλα 3-6 ώρες στους 14°C, αλκοολική ζύμωση σε ανοξείδωτες δεξαμενές στους 16°C και σύντομη ωρίμανση επί λεπτών οινολασπών. Εμφιάλωση με βιδωτό πώμα.",
  },
  {
    slug: "zoe-rose",
    winemakingNotes:
      "Ο τρύγος γίνεται τέλη Σεπτεμβρίου-αρχές Οκτωβρίου. Επαφή με τα στέμφυλα του Μοσχοφίλερου για 6 ώρες στους 16°C, ανάμειξη και αλκοολική ζύμωση σε ανοξείδωτες δεξαμενές στους 16°C, χωρίς μηλογαλακτική ζύμωση. Σύντομη ωρίμανση επί λεπτών οινολασπών. Εμφιάλωση με βιδωτό πώμα.",
  },
  {
    slug: "zoe-red",
    winemakingNotes:
      "Ο τρύγος του Αγιωργίτικου γίνεται μέσα Σεπτεμβρίου και του Cabernet Sauvignon τέλη Αυγούστου. Αλκοολική ζύμωση και εκχύλιση σε ανοξείδωτες δεξαμενές στους 23°C για 6 ημέρες, με πλήρη μηλογαλακτική ζύμωση σε δεξαμενή. Σύντομη ωρίμανση επί λεπτών οινολασπών.",
  },
  {
    slug: "titanas",
    winemakingNotes:
      "Τα σταφύλια εκτίθενται στον ήλιο για οκτώ ημέρες και στη σκιά για ακόμα τριάντα οκτώ ημέρες πριν την οινοποίηση. Ακολουθεί εκχύλιση 25 ημερών με αλκοολική ζύμωση, η οποία ολοκληρώνεται σε δρύινα βαρέλια μετά από πέντε μήνες, όπου το κρασί παραμένει για πέντε χρόνια παλαίωσης.",
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
