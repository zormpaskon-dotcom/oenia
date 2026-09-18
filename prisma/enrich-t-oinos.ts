// Εμπλουτισμός του υπάρχοντος T-Oinos (Τηνιακοί Αμπελώνες) με πραγματικά
// στοιχεία από το επίσημο press kit του οινοποιείου (winery-supplied PDFs:
// PresentationENGs April 2025.pdf + τεχνικά δελτία ανά ετικέτα/vintage).
// Δεν δημιουργεί δεύτερο winery — ενημερώνει το υπάρχον (slug "t-oinos") και
// το υπάρχον μοναδικό κρασί του (slug "t-oinos-clos-stegasta-assyrtiko"),
// και προσθέτει τις υπόλοιπες 5 ετικέτες της σειράς Clos Stegasta / Mavrose.
//
// Πηγή ανά κρασί: το πιο πρόσφατο τεχνικό δελτίο (vintage) που υπάρχει στον
// φάκελο TECHNICAL SHEETS του press kit για κάθε ετικέτα.

import { Appellation, ContentStatus, VarietyType, WineColor, WineStyle } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { slugify } from "../lib/slugify";

async function ensureVariety(name: string, type: VarietyType, fields: Record<string, unknown> = {}) {
  return prisma.variety.upsert({
    where: { name },
    update: {},
    create: { name, slug: slugify(name), type, ...fields },
  });
}

async function main() {
  const tinos = await prisma.region.findUniqueOrThrow({ where: { slug: "tinos" } });

  const asyrtiko = await prisma.variety.findUniqueOrThrow({ where: { name: "Ασύρτικο" } });
  const mavrotragano = await prisma.variety.findUniqueOrThrow({ where: { name: "Μαυροτράγανο" } });
  const malagousia = await prisma.variety.findUniqueOrThrow({ where: { name: "Μαλαγουζιά" } });

  console.log("Νέα ποικιλία…");
  const avgoustiatis = await ensureVariety("Αυγουστιάτης", VarietyType.RED, {
    originRegion: "Ζάκυνθος",
    description:
      "Γηγενής ερυθρή ποικιλία με καταγωγή από τη Ζάκυνθο, σήμερα σπάνια καλλιεργούμενη και αλλού (π.χ. Τήνος). Δίνει κρασιά με ζωηρό χρώμα, φρουτώδη χαρακτήρα και ζωντανή οξύτητα.",
    characteristics: "Ανοιχτόχρωμο, φρουτώδες, με μέτριες τανίνες και ζωηρή οξύτητα — συχνά σε συνδυασμό με άλλες ποικιλίες σε ροζέ ή ελαφριά ερυθρά.",
    acidity: 70,
    body: 45,
    tannins: 35,
  });

  console.log("Winery: εμπλουτισμός T-Oinos…");
  const winery = await prisma.winery.update({
    where: { slug: "t-oinos" },
    data: {
      foundedYear: 1999,
      websiteUrl: "https://toinos.com",
      email: "info@toinos.com",
      phone: "+30 210 7295713",
      address: "67 Λ. Βασιλίσσης Σοφίας, 11521 Αθήνα",
      isOrganic: true,
      isBiodynamic: true,
      vineyardHectares: 17,
      philosophy:
        "Τέσσερις λέξεις-κλειδιά συνοψίζουν τη φιλοσοφία του T-Oinos: Energy, Intensity, Precision, Purity. Βιολογική καλλιέργεια πιστοποιημένη από τη ΔΗΩ, με στοιχεία βιοδυναμικής πρακτικής στον αμπελώνα — προτεραιότητα στην ανάδειξη ενός μοναδικού, ανεμοδαρμένου γρανιτικού terroir, όχι σε κάποια συγκεκριμένη οινολογική συνταγή.",
      story:
        "Το 1999 ο Αλέξανδρος Αβαταγγέλου, φιλόσοφος και θεολόγος από την Κέρκυρα, αποφασίζει να αναβιώσει την αρχαία αμπελουργική παράδοση της Τήνου (πρώτα ίχνη από το 4000 π.Χ.) στο σεληνιακό τοπίο του Φαλατάδου και του Βώλακα, ανάμεσα σε τεράστιους στρογγυλούς γρανιτόλιθους. Μαζί του, ο Gérard Margeon — σομελιέ του ομίλου Alain Ducasse — ερωτεύεται το μέρος με την πρώτη ματιά. Οι πρώτες φυτεύσεις γίνονται το 2002, η πρώτη οινοποίηση το 2008 και η πρώτη εμφιάλωση το 2009. Το 2016 προστίθεται στην ομάδα ως συνέταιρος-οινολόγος ο Stéphane Derenoncourt, διεθνούς φήμης σύμβουλος οινοποιίας στο Μπορντό, με στόχο να αναδείξει τον χαρακτήρα του τόπου και όχι μια τυποποιημένη γεύση. Το 2013 κυκλοφορεί το πρώτο Clos Stegasta Mavrotragano. Το κτήμα σήμερα καλλιεργεί βιολογικά περίπου 17 εκτάρια σε τρία διαφορετικά οικόπεδα (Στεγάστα, Ρασσώνα, Άγιος Δημήτριος), παράγοντας γύρω στις 25.000 φιάλες τον χρόνο σε 6 ετικέτες.",
    },
  });

  console.log("Wine 1/6: Clos Stegasta Assyrtiko (ενημέρωση υπάρχοντος, vintage 2023)…");
  const wineAsyrtiko = await prisma.wine.update({
    where: { slug: "t-oinos-clos-stegasta-assyrtiko" },
    data: {
      vintage: 2023,
      appellation: Appellation.PGI,
      abv: 13.5,
      description:
        "T-OINOS wine is the leading example, after all it is not just a wine but liquid energy. Χειρωνακτικός τρύγος νωρίς το πρωί, σταδιακή συγκομιδή ανά τεμάχιο ανάλογα με την ωρίμανση. Πίεση σε πνευματικό πιεστήριο, αλκοολική ζύμωση με ιθαγενείς ζύμες, παλαίωση επί οινολασπών 4 μήνες, εν μέρει σε ανοξείδωτες δεξαμενές, amphores και βαρέλια.",
      tastingNotes:
        "Κομψή ανθική και εσπεριδοειδής μύτη σε συνδυασμό με βαθιά αλμυρή μεταλλικότητα και πλούσιες, βουτυρώδεις γεύσεις. Μεταλλικό, πλούσιο στόμα με εξαιρετική οξύτητα και αλμυρότητα. Κομψό, φρέσκο και ισορροπημένο τέλος.",
      vineyardNotes:
        "Γρανιτικό υπέδαφος με αμμώδες έδαφος. Βιολογικά καλλιεργημένα σταφύλια. Το οικόπεδο Ασύρτικο βρίσκεται στα 450μ υψόμετρο με 10.000 πρέμνα/εκτάριο, βορειοανατολικό προσανατολισμό. Απόδοση 25hl/ha.",
      servingTemp: null,
      foodPairings: [],
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: wineAsyrtiko.id, varietyId: asyrtiko.id } },
    update: { percentage: 100 },
    create: { wineId: wineAsyrtiko.id, varietyId: asyrtiko.id, percentage: 100 },
  });

  console.log("Wine 2/6: Clos Stegasta Assyrtiko Rare (νέο, vintage 2022)…");
  const wineAsyrtikoRare = await prisma.wine.upsert({
    where: { slug: "t-oinos-clos-stegasta-assyrtiko-rare" },
    update: {},
    create: {
      name: "Clos Stegasta Assyrtiko Rare",
      slug: "t-oinos-clos-stegasta-assyrtiko-rare",
      wineryId: winery.id,
      regionId: tinos.id,
      vintage: 2022,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      abv: 14,
      description:
        "We experience wines of a site with distinctive rarity, without a doubt. Χειρωνακτικός τρύγος νωρίς το πρωί από συγκεκριμένο επιλεγμένο οικόπεδο στον αμπελώνα Στεγάστα. Πίεση σε πνευματικό πιεστήριο, αλκοολική ζύμωση με ιθαγενείς ζύμες, παλαίωση επί οινολασπών 8 μήνες, εν μέρει σε ανοξείδωτες δεξαμενές, amphores και βαρέλια.",
      tastingNotes:
        "Ο εσπεριδοειδής χαρακτήρας της ποικιλίας αντισταθμίζεται από μια ελαφριά νότα δρυός, δίνοντας μια σχεδόν κρεμώδη αίσθηση στο στόμα. Το τέλος είναι μακρύ και καλά ισορροπημένο, με μια ξεχωριστή μεταλλική και αλμυρή πολυπλοκότητα.",
      vineyardNotes:
        "Γρανιτικό υπέδαφος με αμμώδες έδαφος. Βιολογικά καλλιεργημένα σταφύλια. Το οικόπεδο Ασύρτικο βρίσκεται στα 450μ υψόμετρο με 10.000 πρέμνα/εκτάριο, βορειοανατολικό προσανατολισμό. Απόδοση 25hl/ha.",
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: wineAsyrtikoRare.id, varietyId: asyrtiko.id } },
    update: { percentage: 100 },
    create: { wineId: wineAsyrtikoRare.id, varietyId: asyrtiko.id, percentage: 100 },
  });

  console.log("Wine 3/6: Clos Stegasta Mavrotragano (νέο, vintage 2022)…");
  const wineMavrotragano = await prisma.wine.upsert({
    where: { slug: "t-oinos-clos-stegasta-mavrotragano" },
    update: {},
    create: {
      name: "Clos Stegasta Mavrotragano",
      slug: "t-oinos-clos-stegasta-mavrotragano",
      wineryId: winery.id,
      regionId: tinos.id,
      vintage: 2022,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      abv: 14.5,
      description:
        "Η μαγεία του τόπου, η τραχύτητα του κλίματος στο νησί, η πίεση στα κλήματα αποδεικνύουν μια φιλοσοφία παραγωγής βασισμένη στην καθαρότητα. Ολόκληρες ρώγες εισάγονται απαλά σε ανοιχτά ξύλινα κάδους 2-3,5 τόνων. Ζύμωση με ιθαγενείς ζύμες από τους ίδιους τους αμπελώνες (ερευνητικό πρόγραμμα σε συνεργασία με τη Biocepage), ελεγχόμενη θερμοκρασία. Μηλογαλακτική ζύμωση σε βαρέλια. Παλαίωση 10-12 μήνες σε βαρέλια δρυός 500lt, 20% καινούργια.",
      tastingNotes:
        "Βαθύ κόκκινο χρώμα. Αρώματα πιπεριού, μπαχαρικών, φρέσκων μαύρων φρούτων, κακάο και κερασιού. Πλούσιο, σύνθετο και δυναμικό στόμα με απαλές, ακριβείς τανίνες. Μακρά επίγευση και μεγάλο δυναμικό παλαίωσης.",
      vineyardNotes:
        "Γρανιτικό υπέδαφος με αμμοαργιλώδες έδαφος. Βιολογικά καλλιεργημένα σταφύλια. Το οικόπεδο Μαυροτράγανο βρίσκεται στα 450μ υψόμετρο με 10.000 πρέμνα/εκτάριο, βορειοανατολικό προσανατολισμό. Απόδοση 20hl/ha.",
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: wineMavrotragano.id, varietyId: mavrotragano.id } },
    update: { percentage: 100 },
    create: { wineId: wineMavrotragano.id, varietyId: mavrotragano.id, percentage: 100 },
  });

  console.log("Wine 4/6: Clos Stegasta Mavrotragano Rare (νέο, vintage 2021)…");
  const wineMavrotraganoRare = await prisma.wine.upsert({
    where: { slug: "t-oinos-clos-stegasta-mavrotragano-rare" },
    update: {},
    create: {
      name: "Clos Stegasta Mavrotragano Rare",
      slug: "t-oinos-clos-stegasta-mavrotragano-rare",
      wineryId: winery.id,
      regionId: tinos.id,
      vintage: 2021,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      abv: 14,
      description:
        "Μετά από δύο χρόνια αμπελουργίας εστιασμένης στη δομή του εδάφους, το βάθος των ριζών των κλημάτων και τη βελτίωση του ανοσοποιητικού τους συστήματος, το vintage του 2021 μας επέτρεψε να παράγουμε κρασιά σπάνιας ενέργειας και ταυτότητας. Επιλεγμένα τεμάχια εντός του ίδιου οικοπέδου. Ολόκληρες ρώγες με μικρό ποσοστό τσαμπιού εισάγονται απαλά σε ανοιχτά ξύλινα κάδους 2-3,5 τόνων. Ζύμωση με ιθαγενείς ζύμες (ερευνητικό πρόγραμμα με Biocepage), ελεγχόμενη θερμοκρασία. Μηλογαλακτική ζύμωση σε βαρέλια. Παλαίωση 12-14 μήνες σε βαρέλια δρυός 500lt, 20% καινούργια.",
      tastingNotes:
        "Έντονο κόκκινο χρώμα. Σκούρα μαύρα φρούτα, ώριμα, με μεγάλο αρωματικό βάθος. Το στόμα είναι σφριγηλό, εκφραστικό και ενεργητικό, με σχιστολιθική διάσταση. Εξαιρετικό δυναμικό παλαίωσης.",
      vineyardNotes:
        "Σχιστόλιθος με αμμοαργιλώδες έδαφος. Βιολογικά καλλιεργημένα σταφύλια στον αμπελώνα Ρασσώνα. Το οικόπεδο Μαυροτράγανο βρίσκεται σε αναβαθμίδες στα 400μ υψόμετρο με 11.000 πρέμνα/εκτάριο, βορειοανατολικό προσανατολισμό. Απόδοση 20hl/ha.",
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: wineMavrotraganoRare.id, varietyId: mavrotragano.id } },
    update: { percentage: 100 },
    create: { wineId: wineMavrotraganoRare.id, varietyId: mavrotragano.id, percentage: 100 },
  });

  console.log("Wine 5/6: Clos Stegasta Rose (νέο, vintage 2023)…");
  const wineRose = await prisma.wine.upsert({
    where: { slug: "t-oinos-clos-stegasta-rose" },
    update: {},
    create: {
      name: "Clos Stegasta Rose",
      slug: "t-oinos-clos-stegasta-rose",
      wineryId: winery.id,
      regionId: tinos.id,
      vintage: 2023,
      color: WineColor.ROSE,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      abv: 12,
      description:
        "Αμπελώνας πάνω σε βράχο, χαμένος στο Αιγαίο, στο νησί της Τήνου. Ξεχωριστός και διαδοχικός χειρωνακτικός τρύγος σε κοφίνια των είκοσι κιλών, νωρίς το πρωί. Άμεση πίεση των σταφυλιών. Ζύμωση σε ελεγχόμενες θερμοκρασίες.",
      tastingNotes:
        "Γαστρονομικό κρασί, συνδυάζει επιδέξια φρούτο και αλμυρότητα σε μια σύνθετη και πλούσια γεύση. Έντονη οξύτητα με μεταλλική επίγευση, σε ένα όμορφα δομημένο ροζέ.",
      vineyardNotes:
        "Συνδυασμός γρανιτικού υπεδάφους με αμμοαργιλώδες έδαφος στον αμπελώνα Στεγάστα και σχιστολίθου με αμμοαργιλώδες έδαφος στον αμπελώνα Άγιος Δημήτριος. Βιολογικά καλλιεργημένα σταφύλια. Τα οικόπεδα Ασύρτικο, Μαυροτράγανο και Αυγουστιάτης βρίσκονται στα 450μ και 400μ υψόμετρο αντίστοιχα, πυκνότητα 10.000 πρέμνα/εκτάριο. Απόδοση 25hl/ha.",
      status: ContentStatus.PUBLISHED,
    },
  });
  for (const [variety, percentage] of [
    [asyrtiko, 35],
    [mavrotragano, 35],
    [avgoustiatis, 20],
    [malagousia, 10],
  ] as const) {
    await prisma.varietyOnWine.upsert({
      where: { wineId_varietyId: { wineId: wineRose.id, varietyId: variety.id } },
      update: { percentage },
      create: { wineId: wineRose.id, varietyId: variety.id, percentage },
    });
  }

  console.log("Wine 6/6: Mavrose (νέο, vintage 2023)…");
  const wineMavrose = await prisma.wine.upsert({
    where: { slug: "t-oinos-mavrose" },
    update: {},
    create: {
      name: "Mavrose",
      slug: "t-oinos-mavrose",
      wineryId: winery.id,
      regionId: tinos.id,
      vintage: 2023,
      color: WineColor.ROSE,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      abv: 12,
      description:
        "Το fine wine από ένα καλό κλήμα φυτεμένο στο σωστό μέρος, είναι ο κρίκος που λείπει ανάμεσα στη γεωργία και την υψηλή ραπτική. Στο άγγιγμά του, βουτάμε στην ομορφιά. Ξεχωριστός και διαδοχικός χειρωνακτικός τρύγος σε κοφίνια των είκοσι κιλών, νωρίς το πρωί. Άμεση πίεση των σταφυλιών. Ζύμωση σε ελεγχόμενες θερμοκρασίες.",
      tastingNotes:
        "Ανοιχτό ροζ χρώμα με βιολετί ανταύγειες. Μύτη γεμάτη αρώματα κερασιού με απαλή μυρωδιά κόκκινης σταφίδας. Στοματοφρεσκαντικό και φρέσκο με αλμυρή μεταλλικότητα στην επίγευση. Ένα γοητευτικό κρασί.",
      vineyardNotes:
        "Γρανιτικό υπέδαφος με αμμοπηλώδες έδαφος. Βιολογικά καλλιεργημένα σταφύλια Μαυροτράγανο και Αυγουστιάτης, στα 400μ υψόμετρο, πυκνότητα 10.000 πρέμνα/εκτάριο. Απόδοση 25hl/ha.",
      status: ContentStatus.PUBLISHED,
    },
  });
  for (const [variety, percentage] of [
    [avgoustiatis, 80],
    [mavrotragano, 20],
  ] as const) {
    await prisma.varietyOnWine.upsert({
      where: { wineId_varietyId: { wineId: wineMavrose.id, varietyId: variety.id } },
      update: { percentage },
      create: { wineId: wineMavrose.id, varietyId: variety.id, percentage },
    });
  }

  console.log("T-Oinos: 1 winery εμπλουτίστηκε, 6 κρασιά (1 ενημερώθηκε + 5 νέα), 1 νέα ποικιλία (Αυγουστιάτης).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
