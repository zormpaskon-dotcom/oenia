// PHASE 3B — BATCH 2 — Group 8 — Short wine description enrichment.
// Γράφει ΜΟΝΟ το πεδίο `description` για 16 κρασιά με ανεπαρκές (<50
// χαρακτήρων ή απόν) description — Category A "CLEARLY INSUFFICIENT" και
// Category C "MISSING" από το Group 8 research audit. Κανένα άλλο πεδίο
// αγγίζεται (tastingNotes, winemakingNotes, vintage, abv, varieties,
// appellation, region παραμένουν ως έχουν).
//
// Τεκμηρίωση ανά κρασί:
// - Mesimvria (5): official product pages (mesimvriawines.gr) — πλήρες
//   spec block (τοποθεσία Νέα Μεσημβρία Θεσσαλονίκης, υψόμετρο, έδαφος,
//   ηλικία αμπελώνων, σύστημα διαμόρφωσης, οινοποίηση, ωρίμανση) με exact
//   vintage match στο DB για όλα τα 5.
// - Domaine Porto Carras Syrah (1): official product page
//   (domaineportocarras.com) — "one of the largest single organic
//   vineyards in Greece", Σιθωνία Χαλκιδικής.
// - Mantinia / Κτήμα Τσέλεπος (1, missing): official product page
//   (tselepos.gr) — αμπελοτόπια στις κοινότητες Ρίζες/Λιθοβούνια/
//   Αγιωργίτικα, υψόμετρο 680μ. (Σημείωση: η σελίδα δηλώνει επίσης PDO
//   Μαντίνεια, εκτός scope αυτού του batch — appellation ΔΕΝ γράφεται.)
// - Κτήμα Βιβλία Χώρα (2) / Avantis Estate (1) / Semeli Estate (6): καμία
//   νέα επίσημη πηγή βρέθηκε πέρα από ήδη επιβεβαιωμένα DB facts
//   (variety/region/appellation) — το νέο κείμενο είναι editorial
//   αναδιατύπωση αυτών των ήδη-verified στοιχείων, όχι νέα ισχυρισμοί.
//
// ΔΕΝ αγγίζεται: Ρομπόλα Κεφαλληνίας (παραμένει χωρίς description — καμία
// official producer source βρέθηκε για το συγκεκριμένο bottling).
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const updates: { slug: string; description: string }[] = [
  {
    slug: "mesimvria-flogoinos-erythros",
    description:
      "Μονοποικιλιακό Syrah από αμπελώνες 18–22 ετών στη Νέα Μεσημβρία Θεσσαλονίκης, σε αμμοπηλώδες έδαφος, με τουλάχιστον έναν χρόνο ωρίμανσης σε γαλλική δρυ.",
  },
  {
    slug: "mesimvria-makedonikos-zoiforos-erythros",
    description:
      "Χαρμάνι 50% Syrah και 50% Merlot από τη Νέα Μεσημβρία Θεσσαλονίκης, με τις δύο ποικιλίες να ζυμώνονται και να ωριμάζουν ξεχωριστά σε γαλλική δρυ.",
  },
  {
    slug: "mesimvria-makedonikos-zoiforos-roze",
    description:
      "Ημίξηρο ροζέ χαρμάνι 50% Syrah και 50% Merlot, από αμπελώνες 10–12 ετών στη Νέα Μεσημβρία Θεσσαλονίκης.",
  },
  {
    slug: "mesimvria-moschato-bello-leykos",
    description:
      "Ημίξηρο λευκό από 100% Μοσχάτο Αλεξανδρείας, αμπελώνες 10–15 ετών στη Νέα Μεσημβρία Θεσσαλονίκης.",
  },
  {
    slug: "mesimvria-moschato-bello-roze",
    description:
      "Ημίξηρο ροζέ από 100% Μοσχάτο Αμβούργου, αμπελώνες 15–18 ετών στη Νέα Μεσημβρία Θεσσαλονίκης, σε φιάλη 500ml.",
  },
  {
    slug: "porto-carras-syrah",
    description:
      "Μονοποικιλιακό Syrah από τους βιολογικούς αμπελώνες του Domaine Porto Carras στη Σιθωνία Χαλκιδικής, έναν από τους μεγαλύτερους ενιαίους βιολογικούς αμπελώνες της Ελλάδας.",
  },
  {
    slug: "mantinia-tselepos",
    description:
      "Μονοποικιλιακό Μοσχοφίλερο από επιλεγμένα αμπελοτόπια στις κοινότητες Ρίζες, Λιθοβούνια και Αγιωργίτικα της Μαντίνειας, σε υψόμετρο 680μ.",
  },
  {
    slug: "areti-erythro",
    description:
      "Μονοποικιλιακό Αγιωργίτικο από το Κτήμα Βιβλία Χώρα στο Παγγαίο, δεύτερη ετικέτα της σειράς Αρετή.",
  },
  {
    slug: "plagios-erythro",
    description:
      "Μονοποικιλιακό Merlot από τους αμπελώνες του Κτήματος Βιβλία Χώρα στους πρόποδες του Παγγαίου, δεύτερη ετικέτα της σειράς Πλαγίως.",
  },
  {
    slug: "avantis-amygdalies",
    description:
      "Μονοποικιλιακό ξηρό ροζέ από 100% Syrah, ΠΓΕ Εύβοια, από το Κτήμα Avantis.",
  },
  {
    slug: "giorti-erythros",
    description:
      "Μονοποικιλιακό Αγιωργίτικο από τη Νεμέα, μέρος της σειράς «Γιορτή» του Κτήματος Semeli.",
  },
  {
    slug: "giorti-lefkos",
    description:
      "Μονοποικιλιακό Μοσχοφίλερο από τη Μαντινεία, μέρος της σειράς «Γιορτή» του Κτήματος Semeli.",
  },
  {
    slug: "semeli-elixir",
    description:
      "Μονοποικιλιακό Gewürztraminer, μια σπάνια επιλογή ποικιλίας για την Αρκαδία, από το Κτήμα Semeli.",
  },
  {
    slug: "oreinos-helios-roze",
    description:
      "Ροζέ από 100% Αγιωργίτικο της Νεμέας, εμφιαλωμένο υπό την Προστατευόμενη Γεωγραφική Ένδειξη Κορινθίας.",
  },
  {
    slug: "piccolo-mondo-lefkos",
    description:
      "Ημίγλυκο λευκό από 100% Μοσχοφίλερο, προσιτή, καθημερινή ετικέτα του Κτήματος Semeli.",
  },
  {
    slug: "piccolo-mondo-erythros",
    description:
      "Ημίγλυκο ερυθρό από 100% Αγιωργίτικο, προσιτή, καθημερινή ετικέτα του Κτήματος Semeli.",
  },
];

async function main() {
  for (const { slug, description } of updates) {
    const wine = await prisma.wine.findUniqueOrThrow({
      where: { slug },
      select: { id: true, slug: true, description: true },
    });

    await prisma.wine.update({
      where: { id: wine.id },
      data: { description },
    });
    console.log(`✓ ${slug}: description updated (${description.length} chars)`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
