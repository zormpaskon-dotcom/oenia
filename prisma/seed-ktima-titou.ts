// Μικρό Κτήμα Τίτου (Γουμένισσα) — εμπλουτισμός winery profile + προσθήκη του
// δεύτερου κρασιού (Negoska). Το winery ήδη υπήρχε στη βάση (batch-5) με 1
// μόνο κρασί (Goumenissa). Πηγή: επίσημο site https://www.mikroktimatitos.com
// (σελίδες Κτήμα, Κρασιά, Επισκέψεις), ζωντανά fetched, με άδεια του χρήστη.

import { Appellation, MacroRegion } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function ensureRegion(
  slug: string,
  name: string,
  macroRegion: MacroRegion,
  appellation: Appellation,
  description: string
) {
  return prisma.region.upsert({
    where: { slug },
    update: {},
    create: { slug, name, macroRegion, appellation, description },
  });
}

async function main() {
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "mikro-ktima-titou" } });

  console.log("Winery profile — εμπλουτισμός από το επίσημο 'Κτήμα' / 'Επισκέψεις'…");
  await prisma.winery.update({
    where: { id: winery.id },
    data: {
      description:
        "Στους πρόποδες του όρους Πάικου, στη Γουμένισσα, πλάι στον ποταμό Σείριο, ο Τίτος Ευτυχίδης φυτεύει το 1972 αμπελώνα 40 στρεμμάτων με τις ποικιλίες Ξινόμαυρο, Νεγκόσκα, Cabernet Sauvignon, Λημνιό και Viognier. Η μακρόχρονη φιλία του Τίτου με τον Βαγγέλη Γεροβασιλείου οδηγεί, το 2018, τη χήρα του Αγγελική Ευτυχίδη να μεταβιβάσει το κτήμα στον Γεροβασιλείου και τον συνεργάτη του Βασίλη Τσακτσαρλή (Κτήμα Βιβλία Χώρα) — που το 2022 ολοκλήρωσαν την ανακαίνιση του αρχικού κτηρίου σε ένα σύγχρονο οινοποιείο εναρμονισμένο με το φυσικό τοπίο, με χώρο οινοποίησης, παραδοσιακό κελάρι ωρίμασης, αίθουσα παλαίωσης και χώρους γευσιγνωσίας.",
      story:
        "Σήμερα καλλιεργούνται συνολικά ~270 στρέμματα: 45 στρέμματα γύρω από το οινοποιείο κοντά στα Δύο Ποτάμια (Ξινόμαυρο, Νεγκόσκα), 155 στρέμματα στον Γερακώνα — μία από τις καλύτερες περιοχές της ζώνης ΠΟΠ Γουμένισσα — και ~70 στρέμματα στη Φιλυριά και τον Πεντάλοφο. Η καλλιέργεια ακολουθεί τα πρότυπα της βιολογικής γεωργίας, με τις περισσότερες εργασίες να γίνονται χειρωνακτικά· ο τρύγος ξεκινά στα τέλη Σεπτεμβρίου.",
      foundedYear: 1972,
      vineyardHectares: 27,
      isOrganic: true,
      acceptsVisitors: true,
      visitingHours: "Δευτέρα-Παρασκευή 9:00-15:00 · Κυριακή 11:00-18:00 (Μάρτιος-Οκτώβριος) / 11:00-17:00 (Νοέμβριος-Φεβρουάριος)",
      visitingNotes:
        "Ξεναγήσεις και γευστικές δοκιμές κατόπιν συνεννόησης. Τις Κυριακές οι ξεναγήσεις γίνονται ανά ώρα (πρώτη στις 11:00). Εισιτήριο 5€, μειωμένο 2,5€. Προσβάσιμο σε άτομα με αναπηρία.",
      address: "Θέση Δύο Ποτάμια, Γουμένισσα 61300",
      phone: "+30 23430 43074",
      email: "info@mikroktimatitos.com",
      // logoImage/coverImage: βλ. upload-ktima-titou-images.ts — ανεβαίνουν στο
      // δικό μας Vercel Blob αντί να παραμένουν hotlinked (το site έχει
      // Referer-based hotlink protection, ασταθές αν ξαναλλάξει ρυθμίσεις).
    },
  });

  console.log("Νέα περιοχή…");
  const plagiesPaikou = await ensureRegion(
    "plagies-paikou",
    "Πλαγιές Πάικου",
    MacroRegion.NORTHERN_GREECE,
    Appellation.PGI,
    "Ζώνη ΠΓΕ γύρω από το όρος Πάικο, Κεντρική Μακεδονία — καλύπτει οίνους από τοπικές ποικιλίες της περιοχής (π.χ. μονοποικιλιακή Νεγκόσκα) που δεν εμπίπτουν στη στενότερη ζώνη ΠΟΠ Γουμένισσα."
  );

  const negoska = await prisma.variety.findUniqueOrThrow({ where: { name: "Νεγκόσκα" } });

  console.log("Εμπλουτισμός του ήδη υπαρκτού Goumenissa (φωτογραφία + βραβεία)…");
  await prisma.wine.update({
    where: { slug: "mikro-ktima-titou-goumenissa" },
    data: {
      description:
        "80% Ξινόμαυρο, 20% Νεγκόσκα — χειρωδιαλεγμένος τρύγος τέλη Σεπτεμβρίου, κοινή εκχύλιση και ζύμωση των δύο ποικιλιών, παλαίωση 12 μήνες σε γαλλική δρυ. Πολυβραβευμένο: χρυσό μετάλλιο στο Mundus Vini (2024, 2025, 2026) και στο Challenge International du Vin 2024, 91 πόντοι από το Robert Parker's Wine Advocate (σοδειά 2022).",
      // labelImage: βλ. upload-ktima-titou-images.ts.
    },
  });

  const existingNegoska = await prisma.wine.findUnique({ where: { slug: "mikro-ktima-titou-negoska" } });
  if (existingNegoska) {
    console.log("  Negoska ήδη υπάρχει, παράλειψη δημιουργίας.");
  } else {
    console.log("Νέο κρασί: Negoska…");
    await prisma.wine.create({
      data: {
        name: "Negoska",
        slug: "mikro-ktima-titou-negoska",
        wineryId: winery.id,
        regionId: plagiesPaikou.id,
        color: "ROSE",
        style: "DRY",
        appellation: Appellation.PGI,
        vintage: 2025,
        description:
          "Μονοποικιλιακή, ανοιχτόχρωμη ροζέ εκδοχή της τοπικής Νεγκόσκα, με απευθείας πίεση των σταφυλιών χωρίς εκχύλιση. Βραβευμένο με χρυσό μετάλλιο στο Mundus Vini 2026 και 90 πόντους από το Robert Parker's Wine Advocate (σοδειά 2025).",
        tastingNotes:
          "Λαμπερό, απαλό ροζ χρώμα. Ζωηρή, κομψή μύτη με κυρίαρχες νότες γκρέιπφρουτ, φλούδας νερατζιού και κόκκινων φρούτων (φράουλα, ρόδι, cranberry), δεμένες με ανθικές νύξεις γιασεμιού. Στο στόμα δροσερή οξύτητα, φρουτώδης χαρακτήρας, ευχάριστη αρωματική επίγευση με νότες εσπεριδοειδών, λευκών ανθών και κόκκινων φρούτων. Ιδανικό να καταναλωθεί νέο.",
        vineyardNotes:
          "Τοπική ποικιλία Νεγκόσκα από τους αμπελώνες του κτήματος στη ζώνη Πλαγιές Πάικου, Γουμένισσα. Τρύγος αρχές Οκτωβρίου.",
        winemakingNotes:
          "Μετά την έκθλιψη γίνεται απευθείας πίεση και εξαγωγή του μούστου (χωρίς εκχύλιση), και η ζύμωση εκτυλίσσεται σε ανοξείδωτες, ψυχόμενες δεξαμενές στους 18°C.",
        servingTemp: "8-10°C",
        foodPairings: ["Θαλασσινά", "Σαλάτες"],
        // labelImage: βλ. upload-ktima-titou-images.ts.
        varieties: { create: [{ varietyId: negoska.id, percentage: 100 }] },
      },
    });
  }

  console.log("Ολοκληρώθηκε.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
