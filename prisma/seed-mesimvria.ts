// Μεσημβρία Οινοποιητική (Νέα Μεσημβρία, Θεσσαλονίκη) — πλήρης κατάλογος
// από https://mesimvriawines.gr/wines/ (12 κρασιά) + σύνοψη winery profile
// από https://mesimvriawines.gr/σχετικα-με-εμασ/, με άδεια του χρήστη.
// Το winery ήδη υπήρχε στη βάση με 1 κρασί (Mesimvria Assyrtiko) που ΔΕΝ
// εμφανίζεται πλέον στην τρέχουσα λίστα προϊόντων του site — παραμένει
// αμετάβλητο (ίδιο precedent με το Ovilos Rosé της Biblia Chora).
//
// ΕΞΑΙΡΕΘΗΚΑΝ ρητά: "Παυσίλυπος Λευκός" και "Παυσίλυπος Ερυθρός" — αυτά
// είναι winebox σειρές με πολλαπλές, μεταβλητές συνθέσεις (π.χ. ο
// "Ερυθρός" έχει 7 διαφορετικές δυνατές εκδοχές, ανάμεσά τους και ροζέ) —
// όχι ένα συγκεκριμένο κρασί με σταθερή σύνθεση. Δεν επινοούμε ποια
// εκδοχή να καταχωρήσουμε.

import { Appellation, ContentStatus, MacroRegion, WineColor, WineStyle } from "@prisma/client";
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
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "mesimvria-winery" } });

  console.log("Winery profile — σύνοψη από το επίσημο site…");
  await prisma.winery.update({
    where: { id: winery.id },
    data: {
      description:
        "Ιδρύθηκε το 1996 από τον Περικλή Ντράχα και τον Θεόδωρο Παρασκευόπουλο στη Νέα Μεσημβρία, 20χλμ βορειοδυτικά της Θεσσαλονίκης, σε λόφους ~200μ. Ελληνικοί πληθυσμοί διωγμένοι από την Ανατολική Ρωμυλία εγκαταστάθηκαν εκεί παλαιότερα, μεταφέροντας την αγάπη τους για το αμπέλι — οι εδαφοκλιματικές συνθήκες βοήθησαν την αμπελοκαλλιέργεια να ανθίσει. Στόχος των ιδρυτών, που μεγάλωσαν μέσα σε αυτούς τους αμπελώνες, ήταν να σταματήσει η εντατική καλλιέργεια και να παραχθούν σταφύλια ποιότητας ανάλογα με τις δυνατότητες κάθε αμπελοτοπίου.",
      story:
        "Το οινοποιείο βρίσκεται στο 2ο χλμ. Αγχιάλου-Νέας Μεσημβρίας, μέσα στον αμπελώνα. Διαθέτει ανοξείδωτες δεξαμενές με σύστημα ψύξης, κελάρι παλαίωσης δρύινων βαρελιών για τα ερυθρά (έναν χρόνο), κάβα παλαίωσης εμφιαλωμένων κρασιών, σύγχρονο εμφιαλωτήριο/συσκευαστήριο και πλήρως εξοπλισμένο εργαστήριο για καθημερινό ποιοτικό έλεγχο — πιστοποιημένο κατά ISO 22000. Οι αμπελώνες είναι σε αμμοπηλώδες έδαφος χωρίς άρδευση (χαμηλές αποδόσεις, καλύτερη ωρίμανση), γραμμικό σύστημα διαμόρφωσης. Καλλιεργούνται οι ελληνικές ποικιλίες Ροδίτης, Μαλαγουζιά, Ασύρτικο, Μοσχάτο Αλεξανδρείας, Μαυροδάφνη και Βιδιανό, συμπληρωματικά με Sauvignon Blanc, Chardonnay, Merlot, Syrah, Cabernet Sauvignon και Μοσχάτο Αμβούργου. Το οινοποιείο δέχεται επισκέπτες σε αίθουσα υποδοχής και αίθουσα γευστικής δοκιμής με προβολές βίντεο.",
      acceptsVisitors: true,
    },
  });

  console.log("Νέα περιοχή…");
  const makedonia = await ensureRegion(
    "makedonia",
    "Μακεδονία",
    MacroRegion.NORTHERN_GREECE,
    Appellation.PGI,
    "Ευρεία ζώνη ΠΓΕ που καλύπτει οίνους από τη Μακεδονία, Βόρεια Ελλάδα, χωρίς τον στενότερο γεωγραφικό περιορισμό ζωνών όπως η ΠΓΕ Θεσσαλονίκη."
  );
  const thessaloniki = await prisma.region.findUniqueOrThrow({ where: { slug: "thessaloniki" } });

  type WineSpec = {
    slug: string;
    name: string;
    color: WineColor;
    style: WineStyle;
    vintage: number;
    abv: number;
    appellation?: Appellation;
    regionId: string;
    varieties: Array<{ name: string; percentage: number }>;
    description: string;
    tastingNotes: string;
    vineyardNotes: string;
    winemakingNotes: string;
    servingTemp: string;
    foodPairings: string[];
  };

  const commonVineyard = (age: string) =>
    `Νέα Μεσημβρία, Θεσσαλονίκη, υψόμετρο 200m, αμμοπηλώδες έδαφος, σύστημα διαμόρφωσης Royat διπλό κορδόνι, ηλικία αμπελώνων ${age}.`;

  const wines: WineSpec[] = [
    {
      slug: "mesimvria-zoiforos-erythros",
      name: "Ζωηφόρος Ερυθρός",
      color: WineColor.RED,
      style: WineStyle.DRY,
      vintage: 2022,
      abv: 13,
      appellation: Appellation.PGI,
      regionId: thessaloniki.id,
      varieties: [
        { name: "Cabernet Sauvignon", percentage: 60 },
        { name: "Merlot", percentage: 40 },
      ],
      description: "ΠΓΕ Θεσσαλονίκη. 60% Cabernet Sauvignon, 40% Merlot — κλασική ερυθρή οινοποίηση με παλαίωση σε γαλλική δρυ.",
      tastingNotes: "Βαθύ πορφυρό χρώμα. Αποξηραμένα φρούτα, μπαχαρικά, κόκκινα φρούτα. Πλούσια γεύση, ισορροπημένη οξύτητα, πολύπλοκη μακρά επίγευση.",
      vineyardNotes: commonVineyard("18-22 χρόνων"),
      winemakingNotes: "Οι δύο ποικιλίες ζυμώνονται ξεχωριστά, κλασική ερυθρή οινοποίηση στους 18-22°C για 18-20 ημέρες σε ανοξείδωτες δεξαμενές, παλαίωση τουλάχιστον 1 χρόνο σε γαλλικά δρύινα βαρέλια.",
      servingTemp: "16-18°C",
      foodPairings: ["Κόκκινο κρέας με πικάντικες σάλτσες", "Ώριμα τυριά"],
    },
    {
      slug: "mesimvria-zoiforos-roze",
      name: "Ζωηφόρος Ροζέ",
      color: WineColor.ROSE,
      style: WineStyle.DRY,
      vintage: 2024,
      abv: 13,
      appellation: Appellation.PGI,
      regionId: thessaloniki.id,
      varieties: [
        { name: "Syrah", percentage: 80 },
        { name: "Cabernet Sauvignon", percentage: 20 },
      ],
      description: "ΠΓΕ Θεσσαλονίκη. 80% Syrah, 20% Cabernet Sauvignon.",
      tastingNotes: "Λαμπερό τριανταφυλλί χρώμα, αρώματα κόκκινων φρούτων. Πλούσια γεύση, ισορροπημένη οξύτητα, φρουτώδης μακρά επίγευση.",
      vineyardNotes: commonVineyard("10-12 χρόνια"),
      winemakingNotes: "Ελεγχόμενη κρυοεκχύλιση στους 14-16°C για 2-4 ώρες, αλκοολική ζύμωση 15 ημέρες, παλαίωση τουλάχιστον 3 μήνες στις οινολάσπες.",
      servingTemp: "10-12°C",
      foodPairings: ["Μακαρονάδες με θαλασσινά", "Λευκό κρέας"],
    },
    {
      slug: "mesimvria-zoiforos-leykos",
      name: "Ζωηφόρος Λευκός",
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      vintage: 2024,
      abv: 12.5,
      appellation: Appellation.PGI,
      regionId: thessaloniki.id,
      varieties: [
        { name: "Sauvignon Blanc", percentage: 60 },
        { name: "Ασύρτικο", percentage: 40 },
      ],
      description: "ΠΓΕ Θεσσαλονίκη. 60% Sauvignon Blanc, 40% Ασύρτικο — μέρος ωριμάζει σε καινούργια δρύινα βαρέλια.",
      tastingNotes: "Λαμπερό κίτρινο-πράσινο χρώμα, αρώματα λουλουδιών και φρούτων με νότες βανίλιας. Δροσερή, πλούσια γεύση, μέτρια έως μακρά επίγευση.",
      vineyardNotes: commonVineyard("10-15 χρόνων"),
      winemakingNotes: "Ελεγχόμενη κρυοεκχύλιση 14-16°C για 6-8 ώρες, ζύμωση ~15 ημέρες, παλαίωση τουλάχιστον 2 μήνες στις οινολάσπες· μέρος 2 μήνες σε καινούργια δρύινα βαρέλια.",
      servingTemp: "10-12°C",
      foodPairings: ["Φρέσκο ψάρι στη σχάρα", "Θαλασσινά", "Λευκό κρέας"],
    },
    {
      slug: "mesimvria-makedonikos-zoiforos-erythros",
      name: "Μακεδονικός Ζωηφόρος Ερυθρός",
      color: WineColor.RED,
      style: WineStyle.DRY,
      vintage: 2023,
      abv: 12.5,
      appellation: Appellation.PGI,
      regionId: makedonia.id,
      varieties: [
        { name: "Syrah", percentage: 50 },
        { name: "Merlot", percentage: 50 },
      ],
      description: "ΠΓΕ Μακεδονία. 50% Syrah, 50% Merlot.",
      tastingNotes: "Βαθύ πορφυρό χρώμα, νότες κόκκινων φρούτων. Πλούσια γεύση, ισορροπημένη οξύτητα, μαλακές τανίνες, μακρά ευχάριστη επίγευση.",
      vineyardNotes: commonVineyard("18-22 χρόνων"),
      winemakingNotes: "Οι δύο ποικιλίες ζυμώνονται ξεχωριστά, κλασική ερυθρή οινοποίηση 18-22°C για 18-20 ημέρες, παλαίωση σε γαλλικά δρύινα βαρέλια περίπου 1 χρόνο.",
      servingTemp: "16-18°C",
      foodPairings: ["Κόκκινο κρέας", "Μεσογειακή κουζίνα"],
    },
    {
      slug: "mesimvria-makedonikos-zoiforos-leykos",
      name: "Μακεδονικός Ζωηφόρος Λευκός",
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      vintage: 2024,
      abv: 11.5,
      appellation: Appellation.PGI,
      regionId: makedonia.id,
      varieties: [
        { name: "Ροδίτης", percentage: 60 },
        { name: "Sauvignon Blanc", percentage: 20 },
        { name: "Ασύρτικο", percentage: 20 },
      ],
      description: "ΠΓΕ Μακεδονία. 60% Ροδίτης, 20% Sauvignon Blanc, 20% Ασύρτικο.",
      tastingNotes: "Λαμπερό κίτρινο-πράσινο χρώμα, αρώματα λευκόσαρκων φρούτων. Δροσερή, πλούσια γεύση, μέτρια έως μακρά επίγευση.",
      vineyardNotes: commonVineyard("10-15 χρόνων"),
      winemakingNotes: "Οι ποικιλίες ζυμώνονται ξεχωριστά, ελεγχόμενη κρυοεκχύλιση 14-16°C για 6-8 ώρες, ζύμωση ~15 ημέρες, παλαίωση τουλάχιστον 3 μήνες στις οινολάσπες.",
      servingTemp: "10-12°C",
      foodPairings: ["Ορεκτικά", "Θαλασσινά", "Λευκό κρέας"],
    },
    {
      slug: "mesimvria-makedonikos-zoiforos-roze",
      name: "Μακεδονικός Ζωηφόρος Ροζέ",
      color: WineColor.ROSE,
      style: WineStyle.OFF_DRY,
      vintage: 2024,
      abv: 12,
      appellation: Appellation.PGI,
      regionId: makedonia.id,
      varieties: [
        { name: "Syrah", percentage: 50 },
        { name: "Merlot", percentage: 50 },
      ],
      description: "ΠΓΕ Μακεδονία, ημίξηρος. 50% Syrah, 50% Merlot.",
      tastingNotes: "Λαμπερό ρόδινο χρώμα, αρώματα κόκκινων φρούτων. Πλούσια γεύση, ισορροπημένη οξύτητα, φρουτώδης μακρά επίγευση.",
      vineyardNotes: commonVineyard("10-12 χρόνια"),
      winemakingNotes: "Οι δύο ποικιλίες ζυμώνονται ξεχωριστά, ελεγχόμενη κρυοεκχύλιση 14-16°C για 2-4 ώρες, ζύμωση 15 ημέρες, παλαίωση τουλάχιστον 3 μήνες στις οινολάσπες.",
      servingTemp: "10-12°C",
      foodPairings: ["Μακαρονάδες με θαλασσινά", "Λευκό κρέας", "Επιδόρπια"],
    },
    {
      slug: "mesimvria-moschato-bello-erythros-imigliko",
      name: "Μοσχάτο Bello Ερυθρός Ημίγλυκος",
      color: WineColor.RED,
      style: WineStyle.SEMI_SWEET,
      vintage: 2024,
      abv: 12,
      regionId: thessaloniki.id,
      varieties: [{ name: "Μοσχάτο Αμβούργου", percentage: 100 }],
      description: "Ημίγλυκος οίνος 100% Μοσχάτο Αμβούργου, φιάλη 500ml.",
      tastingNotes: "Πορφυρό κόκκινο χρώμα, αρώματα ανθέων και φρούτων. Πλούσια γεύση, μαλακές τανίνες, γλυκιά ευχάριστη επίγευση.",
      vineyardNotes: commonVineyard("15-18 χρόνων"),
      winemakingNotes: "Κλασική ερυθρή οινοποίηση στους 16-18°C, εκχύλιση 6-7 ημέρες.",
      servingTemp: "12-15°C",
      foodPairings: ["Κόκκινο κρέας με πικάντικες σάλτσες", "Ελληνικά τυριά", "Επιδόρπιο"],
    },
    {
      slug: "mesimvria-moschato-bello-leykos",
      name: "Μοσχάτο Bello Λευκός",
      color: WineColor.WHITE,
      style: WineStyle.OFF_DRY,
      vintage: 2024,
      abv: 12,
      regionId: thessaloniki.id,
      varieties: [{ name: "Μοσχάτο Αλεξανδρείας", percentage: 100 }],
      description: "Ημίξηρος οίνος 100% Μοσχάτο Αλεξανδρείας.",
      tastingNotes: "Έντονο χρυσοκίτρινο χρώμα, ανθικά αρώματα. Πλούσια γεύση, ισορροπημένη οξύτητα, ευχάριστη μακρά επίγευση.",
      vineyardNotes: commonVineyard("10-15 χρόνων"),
      winemakingNotes: "Ελεγχόμενη κρυοεκχύλιση 14-16°C για 6-8 ώρες, ζύμωση ~15 ημέρες σε ανοξείδωτες δεξαμενές.",
      servingTemp: "10-12°C",
      foodPairings: ["Θαλασσινά", "Ζυμαρικά", "Πικάντικα τυριά"],
    },
    {
      slug: "mesimvria-moschato-bello-roze",
      name: "Μοσχάτο Bello Ροζέ",
      color: WineColor.ROSE,
      style: WineStyle.OFF_DRY,
      vintage: 2024,
      abv: 12,
      regionId: thessaloniki.id,
      varieties: [{ name: "Μοσχάτο Αμβούργου", percentage: 100 }],
      description: "Ημίξηρος οίνος 100% Μοσχάτο Αμβούργου.",
      tastingNotes: "Λαμπερό ρόδινο χρώμα, αρώματα ανθέων και διακριτικών φρούτων. Πλούσια γεύση, ευχάριστη επίγευση.",
      vineyardNotes: commonVineyard("15-18 χρόνων"),
      winemakingNotes: "Ελεγχόμενη κρυοεκχύλιση 14-16°C για 24 ώρες, ζύμωση ~15 ημέρες σε ανοξείδωτες δεξαμενές.",
      servingTemp: "10-12°C",
      foodPairings: ["Θαλασσινά", "Ζυμαρικά", "Λευκό κρέας"],
    },
    {
      slug: "mesimvria-flogoinos-erythros",
      name: "Φλόγοινος Ερυθρός",
      color: WineColor.RED,
      style: WineStyle.DRY,
      vintage: 2021,
      abv: 13,
      appellation: Appellation.PGI,
      regionId: thessaloniki.id,
      varieties: [{ name: "Syrah", percentage: 100 }],
      description: "ΠΓΕ Θεσσαλονίκη. 100% Syrah.",
      tastingNotes: "Βαθύ πορφυρό χρώμα, μπαχαρικά, βανίλια, κόκκινα φρούτα. Πλούσια γεύση, μαλακές τανίνες, μαλακό πολύπλοκο μακρύ τελείωμα.",
      vineyardNotes: commonVineyard("18-22 χρόνων"),
      winemakingNotes: "Κλασική ερυθρή οινοποίηση 18-22°C για 18-20 ημέρες, παλαίωση τουλάχιστον 1 χρόνο σε γαλλικά δρύινα βαρέλια.",
      servingTemp: "16-18°C",
      foodPairings: ["Κόκκινο κρέας με πικάντικες σάλτσες", "Τυριά μακράς ωρίμανσης"],
    },
    {
      slug: "mesimvria-flogoinos-malagouzia",
      name: "Φλόγοινος Μαλαγουζιά",
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      vintage: 2024,
      abv: 13,
      appellation: Appellation.PGI,
      regionId: thessaloniki.id,
      varieties: [{ name: "Μαλαγουζιά", percentage: 100 }],
      description: "ΠΓΕ Θεσσαλονίκη. 100% Μαλαγουζιά, μέρος ωριμάζει σε καινούργια γαλλικά δρύινα βαρέλια.",
      tastingNotes: "Διαυγές κίτρινο-πράσινο χρώμα, λευκά λουλούδια, λευκόσαρκα φρούτα, βανιλάτες νότες βαρελιού. Λιπαρή γεύση, ισορροπημένη οξύτητα, μακρά επίγευση.",
      vineyardNotes: commonVineyard("10-15 χρόνων"),
      winemakingNotes: "Ελεγχόμενη κρυοεκχύλιση 14-16°C για 6-8 ώρες, ζύμωση ~15 ημέρες, παλαίωση τουλάχιστον 2 μήνες στις οινολάσπες· μικρό μέρος 2 μήνες σε καινούργια δρυ.",
      servingTemp: "10-12°C",
      foodPairings: ["Φρέσκα ψάρια στη σχάρα", "Λευκό κρέας", "Φρουτοσαλάτες"],
    },
    {
      slug: "mesimvria-retsina-basiliki",
      name: "Ρετσίνα Βασιλική",
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      vintage: 2024,
      abv: 11.5,
      appellation: Appellation.TABLE,
      regionId: thessaloniki.id,
      varieties: [{ name: "Ροδίτης", percentage: 100 }],
      description: "Ονομασία κατά παράδοση. 100% Ροδίτης, φιάλη 500ml.",
      tastingNotes: "Διαυγές κίτρινο-πράσινο χρώμα, λευκόσαρκα φρούτα με διακριτική ρητίνη πεύκου. Δροσερή γεύση, ισορροπημένη οξύτητα, μακρά επίγευση.",
      vineyardNotes: commonVineyard("10-15 χρόνων"),
      winemakingNotes: "Ελεγχόμενη οινοποίηση στους 14-16°C, αλκοολική ζύμωση ~15 ημέρες σε ανοξείδωτες δεξαμενές.",
      servingTemp: "10-12°C",
      foodPairings: ["Τηγανιτοί μεζέδες", "Θαλασσινά", "Ελληνικά τυριά"],
    },
  ];

  for (const w of wines) {
    const existing = await prisma.wine.findUnique({ where: { slug: w.slug } });
    if (existing) {
      console.log(`  ήδη υπάρχει, παράλειψη: ${w.name}`);
      continue;
    }
    const varietyRecords = await Promise.all(
      w.varieties.map(async (v) => ({
        variety: await prisma.variety.findUniqueOrThrow({ where: { name: v.name } }),
        percentage: v.percentage,
      }))
    );
    await prisma.wine.create({
      data: {
        name: w.name,
        slug: w.slug,
        wineryId: winery.id,
        regionId: w.regionId,
        color: w.color,
        style: w.style,
        vintage: w.vintage,
        abv: w.abv,
        appellation: w.appellation,
        description: w.description,
        tastingNotes: w.tastingNotes,
        vineyardNotes: w.vineyardNotes,
        winemakingNotes: w.winemakingNotes,
        servingTemp: w.servingTemp,
        foodPairings: w.foodPairings,
        status: ContentStatus.PUBLISHED,
        varieties: {
          create: varietyRecords.map((v) => ({ varietyId: v.variety.id, percentage: v.percentage })),
        },
      },
    });
    console.log(`  δημιουργήθηκε: ${w.name}`);
  }

  console.log("Ολοκληρώθηκε.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
