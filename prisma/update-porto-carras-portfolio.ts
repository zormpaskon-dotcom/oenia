// Ενημέρωση Domaine Porto Carras με στοιχεία από το επίσημο τεχνικό
// portfolio (PDF, "porto carras portfolio GR (2).pdf", δόθηκε από τον
// χρήστη) — πιο αναλυτικό από τις σελίδες του site: appellation,
// αμπελουργικά χαρακτηριστικά (υψόμετρο/έδαφος), πλήρης παραγωγική
// διαδικασία, θερμοκρασία σερβιρίσματος. Όπου το PDF δίνει διαφορετική
// ποικιλιακή σύνθεση από το site (Rose 5, Magnus B.) προτιμήθηκε το PDF
// ως το πληρέστερο επίσημο έγγραφο. Προστίθενται επίσης δύο περιορισμένες
// εμφιαλώσεις (Chateau Porto Carras 1990 και 2012) και ενημερώνεται το
// vintage του Πορφυρογέννητος (1993, όπως αναγράφεται στην ίδια την
// ετικέτα — "Grande Reserve 1993").

import { Appellation, ContentStatus, VarietyType, WineColor, WineStyle } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "domaine-porto-carras" } });
  const chalkidiki = await prisma.region.findUniqueOrThrow({ where: { slug: "chalkidiki" } });

  const malagousia = await prisma.variety.findUniqueOrThrow({ where: { slug: "malagousia" } });
  const assyrtiko = await prisma.variety.findUniqueOrThrow({ where: { slug: "asyrtiko" } });
  const limnio = await prisma.variety.findUniqueOrThrow({ where: { slug: "limnio" } });
  const merlot = await prisma.variety.findUniqueOrThrow({ where: { slug: "merlot" } });
  const cabernetFranc = await prisma.variety.findUniqueOrThrow({ where: { slug: "cabernet-franc" } });
  const cabernetSauvignon = await prisma.variety.findUniqueOrThrow({ where: { slug: "cabernet-sauvignon" } });
  const syrahVariety = await prisma.variety.findUniqueOrThrow({ where: { slug: "syrah" } });
  const cinsault = await prisma.variety.upsert({
    where: { slug: "cinsault" },
    update: {},
    create: {
      name: "Cinsault",
      slug: "cinsault",
      nameLatin: "Cinsault",
      type: VarietyType.RED,
      originRegion: "Νότια Γαλλία",
      description: "Γαλλική ερυθρή ποικιλία χαμηλών τανινών, παραδοσιακά χρησιμοποιούμενη σε ροζέ κρασιά της Προβηγκίας και του Ρον.",
    },
  });

  async function updateVarieties(slug: string, varieties: Array<{ varietyId: string; percentage: number | null }>) {
    const wine = await prisma.wine.findUniqueOrThrow({ where: { slug } });
    await prisma.varietyOnWine.deleteMany({ where: { wineId: wine.id } });
    await prisma.varietyOnWine.createMany({
      data: varieties.map((v) => ({ wineId: wine.id, ...v })),
    });
    return wine;
  }

  console.log("Ενημέρωση Domaine Porto Carras με στοιχεία portfolio…");

  // Μαλαγουζιά
  await prisma.wine.update({
    where: { slug: "porto-carras-malagouzia" },
    data: {
      appellation: Appellation.PGI,
      vineyardNotes: "Αμπελώνας στις πλαγιές του Μελίτωνα, σε υψόμετρο 100-150μ, σε αργιλοπηλώδες έδαφος, βιολογική καλλιέργεια.",
      winemakingNotes: "Προζυμωτική εκχύλιση σε χαμηλή θερμοκρασία. Οινοποίηση σε ανοξείδωτες δεξαμενές με επιλεγμένες ζύμες στους 16-18°C. Παραμονή με τις οινολάσπες για μερικούς μήνες με περιοδική ανάδευση. Μέρος του οίνου ωριμάζει σε δρύινα γαλλικά βαρέλια.",
      servingTemp: "10-12 °C",
      foodPairings: ["Ψάρια", "Πουλερικά", "Ζυμαρικά", "Φρούτα"],
    },
  });
  console.log("✓ malagouzia");

  // Blanc de Blancs
  await prisma.wine.update({
    where: { slug: "porto-carras-blanc-de-blancs" },
    data: {
      vineyardNotes: "Αμπελώνας σε υψόμετρο 100-150μ, σε αργιλοπηλώδες έδαφος, βιολογική καλλιέργεια.",
    },
  });
  console.log("✓ blanc-de-blancs");

  // Ασύρτικο 2023 (στο portfolio αναφέρεται ως "Ασύρτικο Mainland")
  await prisma.wine.update({
    where: { slug: "porto-carras-asyrtiko-2023" },
    data: {
      appellation: Appellation.PGI,
      description:
        "100% Ασύρτικο από τον μεγαλύτερο ενιαίο βιολογικό αμπελώνα της Ελλάδας, όπου καλλιεργήθηκε για πρώτη φορά η ποικιλία σε ηπειρωτικό έδαφος, στα τέλη της δεκαετίας του '60 — στο επίσημο portfolio του κτήματος αναφέρεται και ως «Ασύρτικο Mainland».",
      vineyardNotes: "Αμπελώνας σε υψόμετρο 200-250μ, σε αμμοπηλώδες έδαφος, βιολογική καλλιέργεια.",
    },
  });
  console.log("✓ asyrtiko-2023");

  // Πλαγιές Μελίτωνα 2024
  await prisma.wine.update({
    where: { slug: "porto-carras-plagies-melitona-2024" },
    data: {
      vineyardNotes: "Αμπελώνες στις Πλαγιές του όρους Μελίτωνα, σε υψόμετρο 100-200μ, σε αμμοπηλώδες και αργιλοπηλώδες έδαφος, βιολογική καλλιέργεια.",
      winemakingNotes: "Ζύμωση σε ανοξείδωτη δεξαμενή με επιλεγμένες ζύμες έως τους 18°C. Παραμονή με τις οινολάσπες για μερικούς μήνες με περιοδική ανάδευση. Ωριμάζει σε δρύινα βαρέλια για 5 μήνες.",
      servingTemp: "10-12 °C",
      foodPairings: ["Πουλερικά με λευκή σάλτσα", "Ζυμαρικά", "Λιπαρά θαλασσινά", "Τυριά ωρίμανσης"],
    },
  });
  console.log("✓ plagies-melitona-2024");

  // Chateau - Le Grand Blanc 2019 — το portfolio δίνει συγκεκριμένη σύνθεση
  await prisma.wine.update({
    where: { slug: "porto-carras-le-grand-blanc-2019" },
    data: {
      appellation: Appellation.PGI,
      vineyardNotes: "Αμπελώνες σε υψόμετρο 100-150μ, σε αργιλοπηλώδες έδαφος, βιολογική καλλιέργεια.",
      servingTemp: "10-12 °C",
      foodPairings: ["Ψάρια", "Θαλασσινά", "Ψητό σολομό", "Ριζότο θαλασσινών", "Ημίσκληρα και ώριμα τυριά"],
    },
  });
  await updateVarieties("porto-carras-le-grand-blanc-2019", [
    { varietyId: malagousia.id, percentage: 60 },
    { varietyId: assyrtiko.id, percentage: 30 },
    { varietyId: limnio.id, percentage: 10 },
  ]);
  console.log("✓ le-grand-blanc-2019");

  // Rose 5 — διόρθωση: το portfolio δίνει 45% Merlot, 30% Cinsault, 25%
  // Cabernet Franc (όχι Cabernet Sauvignon/Λημνιό όπως έδειχναν οι ετικέτες
  // ποικιλιών στο site) και διευκρινίζει ότι το "5" αναφέρεται σε 5
  // διαφορετικά αμπελοτόπια, όχι σε 5 ποικιλίες.
  await prisma.wine.update({
    where: { slug: "porto-carras-rose-5" },
    data: {
      description: "Οίνος ροζέ ξηρός (Ποικιλιακός) από 45% Merlot, 30% Cinsault και 25% Cabernet Franc, προερχόμενος από 5 διαφορετικά αμπελοτόπια του κτήματος — εξ ου και το όνομα «Rose 5».",
      vineyardNotes: "Προέρχεται από 5 διαφορετικά αμπελοτόπια του κτήματος, σε υψόμετρο 100-250μ, σε αμμοπηλώδες έδαφος, βιολογική καλλιέργεια.",
      winemakingNotes: "Σύντομη εκχύλιση σε χαμηλές θερμοκρασίες. Αλκοολική ζύμωση σε ανοξείδωτες δεξαμενές στους 16-18°C. Παραμονή με τις φίνες οινολάσπες για μερικούς μήνες με περιοδικές αναδεύσεις.",
      servingTemp: "10-12 °C",
      foodPairings: [
        "Μανιτάρια", "Προσούτο", "Ψητά λαχανικά", "Σολομός", "Γαρίδες", "Κοτόπουλο",
        "Σάλτσες με μάνγκο, ανανά ή σόγια", "Ντοματίνια με βασιλικό και μοτσαρέλα",
        "Γκοργκοντζόλα", "Χαλούμι", "Μαλακά τυριά",
      ],
    },
  });
  await updateVarieties("porto-carras-rose-5", [
    { varietyId: merlot.id, percentage: 45 },
    { varietyId: cinsault.id, percentage: 30 },
    { varietyId: cabernetFranc.id, percentage: 25 },
  ]);
  console.log("✓ rose-5");

  // Λημνιό 2022
  await prisma.wine.update({
    where: { slug: "porto-carras-limnio-2022" },
    data: {
      appellation: Appellation.PGI,
      vineyardNotes: "Αμπελώνες σε υψόμετρο 150-300μ, σε αμμοπηλώδες έδαφος, βιολογική καλλιέργεια.",
      winemakingNotes: "Κλασική μέθοδος ερυθρής οινοποίησης σε ελεγχόμενες θερμοκρασίες. Ωριμάζει σε δρύινα γαλλικά βαρέλια για 12 μήνες.",
      servingTemp: "10-12 °C",
      foodPairings: ["Θαλασσινά", "Οστρακοειδή", "Λιπαρά ψάρια", "Κίτρινα ώριμα τυριά"],
    },
  });
  console.log("✓ limnio-2022");

  // Chateau Porto Carras (χωρίς vintage) — το portfolio δίνει συγκεκριμένη
  // σύνθεση 70% Λημνιό, 30% Cabernet Sauvignon-Cabernet Franc (χωρίς
  // διαχωρισμό των δύο Cabernet μεταξύ τους)
  await prisma.wine.update({
    where: { slug: "porto-carras-chateau" },
    data: {
      description: "Το εμβληματικό κρασί του Domaine Porto Carras — Ονομασία Προέλευσης Πλαγιές Μελίτωνα, από 70% Λημνιό και 30% Cabernet Sauvignon-Cabernet Franc.",
      vineyardNotes: "Αμπελώνες σε υψόμετρο 150-300μ, σε αμμοπηλώδες έδαφος, βιολογική καλλιέργεια.",
      winemakingNotes: "Κλασική μέθοδος ερυθρής οινοποίησης με επιλεγμένες ζύμες σε ελεγχόμενες θερμοκρασίες. Παλαιώνει σε νέα κυρίως δρύινα γαλλικά βαρέλια για 24 μήνες και στη συνέχεια παραμένει στη φιάλη για περισσότερο από δύο χρόνια στις υπόγειες κάβες του οινοποιείου.",
      foodPairings: ["Κυνήγι", "Κόκκινα κρέατα με πικάντικες σάλτσες"],
    },
  });
  await updateVarieties("porto-carras-chateau", [
    { varietyId: limnio.id, percentage: 70 },
    { varietyId: cabernetSauvignon.id, percentage: null },
    { varietyId: cabernetFranc.id, percentage: null },
  ]);
  console.log("✓ chateau");

  // Syrah
  await prisma.wine.update({
    where: { slug: "porto-carras-syrah" },
    data: {
      vineyardNotes: "Αμπελώνες σε υψόμετρο 200-350μ, σε αμμοπηλώδες έδαφος, βιολογική καλλιέργεια.",
      winemakingNotes: "Κλασική μέθοδος ερυθρής οινοποίησης με επιλεγμένες ζύμες σε ελεγχόμενες θερμοκρασίες. Παλαιώνει σε δρύινα γαλλικά βαρέλια για 12 μήνες.",
      tastingNotes: "Σκούρο πορφυρό χρώμα. Πυκνά αρώματα ώριμων φρούτων, σοκολάτας και καπνού, με νότες βανίλιας και γλυκών μπαχαρικών. Κομψό στο στόμα, με βελούδινες τανίνες και πικάντικο τελείωμα με εξαιρετική ισορροπία.",
      foodPairings: ["Κυνήγι", "Φιλέτο μόσχου", "Γλυκά με μαύρη σοκολάτα"],
    },
  });
  console.log("✓ syrah");

  // Magnus B. — διόρθωση: το portfolio δίνει 60% Syrah, 40% Cabernet
  // Sauvignon (όχι Cabernet Franc/Λημνιό όπως έδειχνε το site)
  await prisma.wine.update({
    where: { slug: "porto-carras-magnus-b" },
    data: {
      description: "Premium ερυθρός — ΠΓΕ Σιθωνία, από 60% Syrah και 40% Cabernet Sauvignon.",
      vineyardNotes: "Αμπελώνες σε υψόμετρο 200-300μ, σε αμμοπηλώδες έδαφος, βιολογική καλλιέργεια.",
      winemakingNotes: "Κλασική μέθοδος ερυθρής οινοποίησης σε ελεγχόμενες θερμοκρασίες. Ωριμάζει σε δρύινα γαλλικά βαρέλια για 12 μήνες.",
      tastingNotes: "Βαθύ πορφυρό χρώμα. Αρώματα μαύρων φρούτων και πιπεριού, γλυκών μπαχαρικών και κομψών αρωμάτων δρυός. Πλούσιο και ισορροπημένο στη γεύση με αρωματική, μακριά επίγευση.",
      foodPairings: ["Κόκκινα κρέατα", "Κυνήγι", "Παλαιωμένα κίτρινα τυριά"],
    },
  });
  await updateVarieties("porto-carras-magnus-b", [
    { varietyId: syrahVariety.id, percentage: 60 },
    { varietyId: cabernetSauvignon.id, percentage: 40 },
  ]);
  console.log("✓ magnus-b");

  // Πορφυρογέννητος — η ετικέτα της κυκλοφορούσας σοδειάς αναγράφει
  // "Grande Reserve 1993"
  await prisma.wine.update({
    where: { slug: "porto-carras-porfyrogennitos" },
    data: {
      vintage: 1993,
      description:
        "Συλλεκτικός και σπάνιος «Grand Reserve» οίνος από το θρυλικό Κτήμα Πόρτο Καρράς — επιλεγμένα βαρέλια του ερυθρού Chateau Porto Carras από συγκεκριμένα αμπελοτεμάχια, εμφιαλωμένα μόνο σε εξέχουσες χρονιές. Με επιλεκτικές εμφανίσεις μέσα στην ιστορία του κτήματος: πρωτοεμφανίστηκε το 1975, ακολούθησαν το 1977, το 1993 και η σοδειά του 2001. Κυκλοφορεί η σοδειά του 1993, σε περιορισμένο αριθμό φιαλών.",
    },
  });
  console.log("✓ porfyrogennitos (vintage 1993)");

  // Νέες περιορισμένες εμφιαλώσεις από το portfolio
  const chateau1990 = await prisma.wine.upsert({
    where: { slug: "porto-carras-chateau-1990" },
    update: {
      name: "Chateau Porto Carras 1990",
      wineryId: winery.id,
      regionId: chalkidiki.id,
      vintage: 1990,
      abv: 12,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "Ερυθρό κρασί-σύμβολο που αντικατοπτρίζει τη φινέτσα, την κληρονομιά και την ιστορικότητα του κτήματος. Διαθέσιμο σε περιορισμένο αριθμό φιαλών, σοδειά 1990.",
      status: ContentStatus.PUBLISHED,
    },
    create: {
      slug: "porto-carras-chateau-1990",
      name: "Chateau Porto Carras 1990",
      wineryId: winery.id,
      regionId: chalkidiki.id,
      vintage: 1990,
      abv: 12,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "Ερυθρό κρασί-σύμβολο που αντικατοπτρίζει τη φινέτσα, την κληρονομιά και την ιστορικότητα του κτήματος. Διαθέσιμο σε περιορισμένο αριθμό φιαλών, σοδειά 1990.",
      foodPairings: [],
      status: ContentStatus.PUBLISHED,
    },
  });
  console.log(`✓ ${chateau1990.slug}`);

  const chateau2012 = await prisma.wine.upsert({
    where: { slug: "porto-carras-chateau-2012" },
    update: {
      name: "Chateau Porto Carras 2012",
      wineryId: winery.id,
      regionId: chalkidiki.id,
      vintage: 2012,
      abv: 13.5,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "Ερυθρό κρασί από το ιστορικότερο αμπελοτόπι του κτήματος, το Μελίσσι, που δείχνει τη μοναδικότητα και σπανιότητα του κτήματος με σημαντικό δυναμικό παλαίωσης. Διαθέσιμο σε περιορισμένο αριθμό φιαλών, σοδειά 2012.",
      vineyardNotes: "Αμπελοτόπι Μελίσσι — το ιστορικότερο αμπελοτόπι του κτήματος.",
      status: ContentStatus.PUBLISHED,
    },
    create: {
      slug: "porto-carras-chateau-2012",
      name: "Chateau Porto Carras 2012",
      wineryId: winery.id,
      regionId: chalkidiki.id,
      vintage: 2012,
      abv: 13.5,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "Ερυθρό κρασί από το ιστορικότερο αμπελοτόπι του κτήματος, το Μελίσσι, που δείχνει τη μοναδικότητα και σπανιότητα του κτήματος με σημαντικό δυναμικό παλαίωσης. Διαθέσιμο σε περιορισμένο αριθμό φιαλών, σοδειά 2012.",
      vineyardNotes: "Αμπελοτόπι Μελίσσι — το ιστορικότερο αμπελοτόπι του κτήματος.",
      foodPairings: [],
      status: ContentStatus.PUBLISHED,
    },
  });
  console.log(`✓ ${chateau2012.slug}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
