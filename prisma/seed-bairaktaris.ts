// Κτήμα Μπαϊρακτάρη (Νεμέα) — πλήρης κατάλογος 10 κρασιών. Πηγή: επίσημα
// τεχνικά φύλλα (PDF) του ίδιου του οινοποιείου, δόθηκαν από τον χρήστη.
// Vintage όπου φαίνεται τυπωμένο στην ίδια την ετικέτα (Ktima 2018,
// Monolithos Red/Rose/White 2022, Rock 'n' Rose 2021, Sustainable Roditis
// 2021, Rarus K 2021, Terra Opus 2019) — για 3/.13 και Thesis Malagousia
// δεν αναγράφεται vintage ούτε στο PDF ούτε στην ετικέτα.
//
// Appellation: τα ΠΟΠ Νεμέας κρασιά (100% Αγιωργίτικο) κρατούν την
// υπάρχουσα περιοχή "Νεμέα". Τα ΠΓΕ Πελοποννήσου κρασιά χαρτογραφούνται σε
// νέα περιοχή "Πελοπόννησος" (ΠΓΕ), αντίστοιχα με το πώς το ΠΓΕ Κυκλάδων
// χαρτογραφήθηκε σε δική του περιοχή για τα Mikra Thira / Venetsanos.
// Τα "Ποικιλιακά" κρασιά (χωρίς ΠΟΠ/ΠΓΕ) χαρτογραφούνται στην ακριβή
// περιοχή αμπελώνα που αναφέρει το τεχνικό φύλλο (Ορεινή Κορινθία /
// Ορεινή Αργολίδα), αφού δεν έχουν επίσημη ονομασία προέλευσης.

import { Appellation, ContentStatus, MacroRegion, VarietyType, WineColor, WineStyle } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "bairaktaris" } });
  const nemea = await prisma.region.findUniqueOrThrow({ where: { slug: "nemea" } });

  const peloponnisos = await prisma.region.upsert({
    where: { slug: "peloponnisos" },
    update: {},
    create: {
      slug: "peloponnisos",
      name: "Πελοπόννησος",
      macroRegion: MacroRegion.PELOPONNESE,
      appellation: Appellation.PGI,
      description:
        "Ευρεία ζώνη ΠΓΕ που καλύπτει το σύνολο της Πελοποννήσου, για κρασιά που δεν εμπίπτουν σε πιο συγκεκριμένη τοπική ΠΟΠ/ΠΓΕ ζώνη.",
    },
  });
  const korinthia = await prisma.region.upsert({
    where: { slug: "korinthia" },
    update: {},
    create: {
      slug: "korinthia",
      name: "Κορινθία",
      macroRegion: MacroRegion.PELOPONNESE,
      description: "Ορεινή περιοχή της Κορινθίας, με αμπελώνες σε υψόμετρο έως και 950μ.",
    },
  });
  const argolida = await prisma.region.upsert({
    where: { slug: "argolida" },
    update: {},
    create: {
      slug: "argolida",
      name: "Αργολίδα",
      macroRegion: MacroRegion.PELOPONNESE,
      description: "Ορεινή περιοχή της Αργολίδας, με αμπελώνες σε υψόμετρο έως και 900μ.",
    },
  });

  const agiorgitiko = await prisma.variety.findUniqueOrThrow({ where: { slug: "agiorgitiko" } });
  const assyrtiko = await prisma.variety.findUniqueOrThrow({ where: { slug: "asyrtiko" } });
  const malagousia = await prisma.variety.findUniqueOrThrow({ where: { slug: "malagousia" } });
  const roditis = await prisma.variety.findUniqueOrThrow({ where: { slug: "roditis" } });
  const cabernetSauvignon = await prisma.variety.findUniqueOrThrow({ where: { slug: "cabernet-sauvignon" } });
  const kidonitsa = await prisma.variety.upsert({
    where: { slug: "kidonitsa" },
    update: {},
    create: {
      name: "Κυδωνίτσα",
      slug: "kidonitsa",
      nameLatin: "Kidonitsa",
      type: VarietyType.WHITE,
      originRegion: "Πελοπόννησος",
      description: "Σπάνια λευκή γηγενής ποικιλία της Πελοποννήσου, με χαρακτηριστικό άρωμα κυδωνιού.",
    },
  });
  const moschato = await prisma.variety.upsert({
    where: { slug: "moschato" },
    update: {},
    create: {
      name: "Μοσχάτο",
      slug: "moschato",
      nameLatin: "Muscat",
      type: VarietyType.WHITE,
      description: "Αρωματική οικογένεια ποικιλιών Muscat — το τεχνικό φύλλο του Monolithos White δεν προσδιορίζει τον συγκεκριμένο τύπο Μοσχάτου.",
    },
  });

  async function upsertWine(spec: {
    slug: string;
    name: string;
    regionId: string;
    vintage: number | null;
    abv: number | null;
    color: WineColor;
    style: WineStyle;
    appellation: Appellation | null;
    description: string;
    tastingNotes: string;
    vineyardNotes: string | null;
    winemakingNotes: string;
    servingTemp: string | null;
    foodPairings: string[];
    varieties: Array<{ varietyId: string; percentage: number | null }>;
  }) {
    const wine = await prisma.wine.upsert({
      where: { slug: spec.slug },
      update: {
        name: spec.name,
        regionId: spec.regionId,
        vintage: spec.vintage,
        abv: spec.abv,
        color: spec.color,
        style: spec.style,
        appellation: spec.appellation,
        description: spec.description,
        tastingNotes: spec.tastingNotes,
        vineyardNotes: spec.vineyardNotes,
        winemakingNotes: spec.winemakingNotes,
        servingTemp: spec.servingTemp,
        foodPairings: spec.foodPairings,
        status: ContentStatus.PUBLISHED,
      },
      create: {
        slug: spec.slug,
        name: spec.name,
        wineryId: winery.id,
        regionId: spec.regionId,
        vintage: spec.vintage,
        abv: spec.abv,
        color: spec.color,
        style: spec.style,
        appellation: spec.appellation,
        description: spec.description,
        tastingNotes: spec.tastingNotes,
        vineyardNotes: spec.vineyardNotes,
        winemakingNotes: spec.winemakingNotes,
        servingTemp: spec.servingTemp,
        foodPairings: spec.foodPairings,
        status: ContentStatus.PUBLISHED,
      },
    });
    await prisma.varietyOnWine.deleteMany({ where: { wineId: wine.id } });
    for (const v of spec.varieties) {
      await prisma.varietyOnWine.create({ data: { wineId: wine.id, varietyId: v.varietyId, percentage: v.percentage } });
    }
    console.log(`✓ ${spec.slug}`);
    return wine;
  }

  console.log("Κτήμα Μπαϊρακτάρη — 10 κρασιά…");

  // 3/.13
  await upsertWine({
    slug: "bairaktaris-313",
    name: "3/.13",
    regionId: nemea.id,
    vintage: null,
    abv: 13,
    color: WineColor.RED,
    style: WineStyle.SEMI_SWEET,
    appellation: Appellation.PDO,
    description:
      "100% Αγιωργίτικο από τον κάμπο της Νεμέας. Μετά τη διαλογή, τα υπερώριμα σταφύλια λιάζονται για μικρό χρονικό διάστημα και ακολουθεί απορραγισμός, με παραμονή του γλεύκους στις ρόγες μέχρι τη διακοπή της ζύμωσης στο 13% vol. Παλαιώνει 12 μήνες σε δρύινα γαλλικά βαρέλια.",
    tastingNotes:
      "Βαθύ πορφυρό χρώμα με ιδιαίτερη μεθυστική μύτη που θυμίζει αρώματα πικρής σοκολάτας. Μαλακές τανίνες που συμπληρώνουν τέλεια την απαλή γλυκιά γεύση των αζύμωτων σταφυλοσακχάρων. Επίγευση σχετικά μεγάλης διάρκειας.",
    vineyardNotes: "Κάμπος της Νεμέας, σε υψόμετρο κάτω των 400μ. Στρεμματική απόδοση 900kg/στρέμμα, μέση ηλικία φυτών 40 έτη.",
    winemakingNotes: "Διαλογή υπερώριμων σταφυλιών, σύντομο λιάσιμο, απορραγισμός και παραμονή του γλεύκους με τις ρόγες μέχρι τη διακοπή της ζύμωσης στο 13% vol. Παλαίωση 12 μήνες σε δρύινα γαλλικά βαρέλια. Ανάγοντα σάκχαρα 50g/L, ολική οξύτητα 5,6g/L, pH 3,60.",
    servingTemp: null,
    foodPairings: ["Φρούτα", "Επιδόρπια με σοκολάτα"],
    varieties: [{ varietyId: agiorgitiko.id, percentage: 100 }],
  });

  // Ktima (ενημέρωση υπάρχουσας εγγραφής)
  await upsertWine({
    slug: "bairaktaris-ktima",
    name: "Ktima",
    regionId: nemea.id,
    vintage: 2018,
    abv: 14.5,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PDO,
    description:
      "100% Αγιωργίτικο από το Κούτσι Νεμέας, σε υψόμετρο 700μ, από αμπέλια μέσης ηλικίας 50 ετών. Κλασική ερυθρή οινοποίηση με εκχύλιση 45 ημερών, ωρίμανση 16 μήνες σε 100% καινούργια γαλλικά δρύινα βαρέλια των 300L και 8 μήνες στη φιάλη.",
    tastingNotes:
      "Βαθύ κόκκινο ρουμπινί χρώμα που δηλώνει την αντοχή του σε μακροπρόθεσμη παλαίωση. Συνδυάζει αρώματα φρούτου με τις γεύσεις και τα αρώματα της δρυός σε απόλυτη ισορροπία. Γεμάτο σώμα με απόλυτα ισορροπημένες τανίνες.",
    vineyardNotes: "Κούτσι Νεμέας, σε υψόμετρο 700μ. Στρεμματική απόδοση 700-800kg/στρέμμα, μέση ηλικία φυτών 50 έτη.",
    winemakingNotes: "Κλασική ερυθρή οινοποίηση με εκχύλιση 45 ημερών. Ωρίμανση 16 μήνες σε 100% καινούργια γαλλικά δρύινα βαρέλια των 300L και 8 μήνες στη φιάλη σε συνθήκες κάβας. Ανάγοντα σάκχαρα 1,5g/L, ολική οξύτητα 5,2g/L, pH 3,7.",
    servingTemp: null,
    foodPairings: ["Κόκκινο κρέας", "Κρεμώδεις σάλτσες με μπαχαρικά", "Ριζότο με λάδι τρούφας", "Σκληρά και παλαιωμένα τυριά"],
    varieties: [{ varietyId: agiorgitiko.id, percentage: 100 }],
  });

  // Monolithos Red
  await upsertWine({
    slug: "bairaktaris-monolithos-red",
    name: "Monolithos Red",
    regionId: nemea.id,
    vintage: 2022,
    abv: 13.3,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PDO,
    description:
      "100% Αγιωργίτικο από επιλεγμένους αμπελώνες στο Τζιτάρι και τα Καλύβια Νεμέας, σε υψόμετρο 450-500μ. Προζυμωτική κρυοεκχύλιση 24 ωρών, κλασική ερυθρή οινοποίηση 7-8 ημερών, με πλήρη μηλογαλακτική ζύμωση.",
    tastingNotes:
      "Λαμπερό κόκκινο χρώμα με μωβ ανταύγειες. Έντονα πολύπλοκα αρώματα μαύρων άγριων φρούτων που συνδυάζονται τέλεια με τις μαλακές τανίνες, αποδίδοντας πλούσια, τραγανή και ισορροπημένη γεύση.",
    vineyardNotes: "Τζιτάρι και Καλύβια Νεμέας, σε υψόμετρο 450-500μ. Στρεμματική απόδοση 850-950kg/στρέμμα, μέση ηλικία φυτών 40 έτη.",
    winemakingNotes: "Προζυμωτική κρυοεκχύλιση 24 ωρών, κλασική ερυθρή οινοποίηση 7-8 ημερών, παραμονή σε δεξαμενές για πλήρη μηλογαλακτική ζύμωση. Ανάγοντα σάκχαρα 1,7g/L, ολική οξύτητα 5,1g/L, pH 3,54.",
    servingTemp: null,
    foodPairings: ["Λευκά και κόκκινα κρέατα", "Αλλαντικά", "Σάλτσες αρωματικών μπαχαρικών", "Ψητά λαχανικά", "Μοτσαρέλα", "Φέτα", "Πεκορίνο"],
    varieties: [{ varietyId: agiorgitiko.id, percentage: 100 }],
  });

  // Rock 'n' Rose
  await upsertWine({
    slug: "bairaktaris-rock-n-rose",
    name: "Rock 'n' Rose",
    regionId: korinthia.id,
    vintage: 2021,
    abv: 12,
    color: WineColor.ROSE,
    style: WineStyle.SEMI_SWEET,
    appellation: null,
    description:
      "60% Μαλαγουζιά και 40% Αγιωργίτικο από τις πλαγιές της ορεινής Κορινθίας, σε υψόμετρο 600μ. Προζυμωτική κρυοεκχύλιση, ζύμωση σε ανοξείδωτες δεξαμενές και ωρίμανση με τις φίνες οινολάσπες.",
    tastingNotes:
      "Απαλό, ανοιχτό ροδί χρώμα με ζωηρά αρώματα μικρών κόκκινων φρούτων και διακριτικές νότες εσπεριδοειδών. Απαλή γλυκιά γεύση με σύντομη επίγευση και γεμάτο, ισορροπημένο σώμα. Φρέσκο και ευχάριστο.",
    vineyardNotes: "Πλαγιές ορεινής Κορινθίας, σε υψόμετρο 600μ. Στρεμματική απόδοση 900kg/στρέμμα, ηλικία φυτών 15 έτη.",
    winemakingNotes: "Προζυμωτική κρυοεκχύλιση, ζύμωση σε ανοξείδωτες δεξαμενές και ωρίμανση με τις φίνες οινολάσπες.",
    servingTemp: null,
    foodPairings: ["Φρούτα", "Δροσερές σαλάτες με φρούτα", "Μαλακά τυριά", "Κινέζικη κουζίνα", "Ταϋλανδέζικη κουζίνα"],
    varieties: [
      { varietyId: malagousia.id, percentage: 60 },
      { varietyId: agiorgitiko.id, percentage: 40 },
    ],
  });

  // Monolithos Rose
  await upsertWine({
    slug: "bairaktaris-monolithos-rose",
    name: "Monolithos Rose",
    regionId: argolida.id,
    vintage: 2022,
    abv: 12.5,
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    appellation: null,
    description:
      "80% Αγιωργίτικο και 20% Ασύρτικο από την ορεινή Αργολίδα, σε υψόμετρο 800-900μ. Πρώιμος τρύγος, προζυμωτική κρυοεκχύλιση 3 ωρών και διαχωρισμός του χυμού χωρίς πίεση. Αλκοολική ζύμωση σε σταθερά χαμηλή θερμοκρασία 14-16°C.",
    tastingNotes:
      "Ελκυστικό, απαλό τριανταφυλλί χρώμα. Εκλεπτισμένα αρώματα κερασιού, βύσσινου και ροδιού, με διακριτικές στρογγυλές τανίνες από το Αγιωργίτικο και ιδιαίτερη οξύτητα από το Ασύρτικο, που χαρίζουν γεμάτη και παρατεταμένη επίγευση.",
    vineyardNotes: "Ορεινή Αργολίδα, σε υψόμετρο 800-900μ. Στρεμματική απόδοση 900-950kg/στρέμμα, μέση ηλικία φυτών 25 έτη.",
    winemakingNotes: "Πρώιμος τρύγος, προζυμωτική κρυοεκχύλιση 3 ωρών, διαχωρισμός του χυμού χωρίς πίεση, αλκοολική ζύμωση σε σταθερά χαμηλή θερμοκρασία 14-16°C. Ωρίμανση με φίνες οινολάσπες για τρεις μήνες σε ανοξείδωτες δεξαμενές. Ανάγοντα σάκχαρα 2g/L, ολική οξύτητα 5,3g/L, pH 3,40.",
    servingTemp: null,
    foodPairings: ["Λευκά κρέατα", "Λαδερά", "Ζυμαρικά", "Φρέσκες σαλάτες"],
    varieties: [
      { varietyId: agiorgitiko.id, percentage: 80 },
      { varietyId: assyrtiko.id, percentage: 20 },
    ],
  });

  // Sustainable Roditis
  await upsertWine({
    slug: "bairaktaris-sustainable-roditis",
    name: "Sustainable Roditis",
    regionId: peloponnisos.id,
    vintage: 2021,
    abv: 12.7,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description:
      "100% Ροδίτης από την ορεινή Κορινθία, σε υψόμετρο 650μ, από αμπέλια μέσης ηλικίας 70 ετών. Ιδιαίτερη τεχνική οινοποίησης μηδενικής παρέμβασης, χωρίς φιλτράρισμα, με στόχο να αναδειχθούν τα χαρακτηριστικά της ποικιλίας και το μοναδικό terroir της περιοχής. «Sustainable» — μια προσπάθεια ελαχιστοποίησης των παρεμβάσεων στην καλλιέργεια και την οινοποίηση, με σεβασμό στο περιβάλλον σε κάθε στάδιο της παραγωγής.",
    tastingNotes:
      "Λευκοκίτρινο χρώμα με χαρακτηριστικό άρωμα πεπονιού, περγαμόντου, αχλαδιού, νεραντζιού, κουμκουάτ και πράσινου μήλου. Γεμάτο σώμα και δροσιστική οξύτητα, με φρουτώδη και αναζωογονητική επίγευση.",
    vineyardNotes: "Ορεινή Κορινθία, σε υψόμετρο 650μ. Στρεμματική απόδοση 300kg/στρέμμα, μέση ηλικία φυτών 70 έτη.",
    winemakingNotes: "Ζύμωση μηδενικής παρέμβασης, χωρίς φιλτράρισμα. Ανάγοντα σάκχαρα 1,1g/L, ολική οξύτητα 5,7g/L, pH 3,43.",
    servingTemp: null,
    foodPairings: ["Θαλασσινά", "Οστρακοειδή", "Πράσινες σαλάτες", "Ριζότο με λαχανικά", "Ζυμαρικά με λεμόνι"],
    varieties: [{ varietyId: roditis.id, percentage: 100 }],
  });

  // Monolithos White
  await upsertWine({
    slug: "bairaktaris-monolithos-white",
    name: "Monolithos White",
    regionId: peloponnisos.id,
    vintage: 2022,
    abv: 12.5,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description:
      "40% Μαλαγουζιά, 30% Ασύρτικο και 30% Μοσχάτο από την ορεινή Κορινθία, σε υψόμετρο 850-950μ. Τα σταφύλια ψύχονται στους 5°C για 8 ώρες πριν από σύντομη προζυμωτική εκχύλιση, ελεγχόμενη ζύμωση στους 14-16°C και bâtonnage στο τέλος της ζύμωσης.",
    tastingNotes:
      "Απαλό λευκόχρυσο χρώμα με μπουκέτο εξωτικών αρωμάτων και γλυκών τροπικών φρούτων όπως μπανάνα, ανανάς και μάνγκο. Γεμάτο σώμα, με τα αρώματα του στόματος να ακολουθούν αυτά της μύτης.",
    vineyardNotes: "Ορεινή Κορινθία, σε υψόμετρο 850-950μ. Στρεμματική απόδοση 800kg/στρέμμα, μέση ηλικία φυτών 30 έτη.",
    winemakingNotes: "Ψύξη σταφυλιών στους 5°C για 8 ώρες, σύντομη προζυμωτική εκχύλιση, ελεγχόμενη θερμοκρασία ζύμωσης 14-16°C και bâtonnage στο τέλος της ζύμωσης. Ανάγοντα σάκχαρα 1,5g/L, ολική οξύτητα 5,5g/L, pH 3,30.",
    servingTemp: null,
    foodPairings: ["Ψάρια", "Όστρακα", "Μαλάκια", "Λευκά κρέατα", "Πολύχρωμες σαλάτες", "Ζυμαρικά με λευκές κρεμώδεις σάλτσες", "Ψητά λαχανικά"],
    varieties: [
      { varietyId: malagousia.id, percentage: 40 },
      { varietyId: assyrtiko.id, percentage: 30 },
      { varietyId: moschato.id, percentage: 30 },
    ],
  });

  // Thesis Malagousia
  await upsertWine({
    slug: "bairaktaris-thesis-malagousia",
    name: "Thesis Malagousia",
    regionId: peloponnisos.id,
    vintage: null,
    abv: 12.5,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description:
      "100% Μαλαγουζιά από την ορεινή Κορινθία, σε υψόμετρο 650μ, από αμπέλια μέσης ηλικίας 40 ετών. Κρυοεκχύλιση 6-8 ωρών και ελεγχόμενη ζύμωση σε χαμηλές θερμοκρασίες, με ωρίμανση σε ανοξείδωτες δεξαμενές και σταδιακή ανάδευση φίνων οινολασπών για 8-10 εβδομάδες. Το «THESIS» εκφράζει τη φιλοσοφία του κτήματος για την καλλιέργεια και οινοποίηση επιλεγμένων τοπικών ποικιλιών.",
    tastingNotes:
      "Ανοιχτό χρυσό χρώμα με πράσινες ανταύγειες. Πολύπλοκο, φινετσάτο αρωματικό προφίλ με πυρηνόκαρπα φρούτα και εσπεριδοειδή — βερίκοκο, γκρέιπφρουτ, φλούδα λεμονιού και λευκά λουλούδια. Στο στόμα λιπαρό, με δροσιστική οξύτητα και νύξεις ορυκτών.",
    vineyardNotes: "Ορεινή Κορινθία, σε υψόμετρο 650μ. Στρεμματική απόδοση 900kg/στρέμμα, μέση ηλικία φυτών 40 έτη.",
    winemakingNotes: "Κρυοεκχύλιση 6-8 ωρών, ελεγχόμενη ζύμωση σε χαμηλές θερμοκρασίες, ωρίμανση σε ανοξείδωτες δεξαμενές με σταδιακή ανάδευση φίνων οινολασπών για 8-10 εβδομάδες. Ανάγοντα σάκχαρα 1,2g/L, ολική οξύτητα 6g/L, pH 3,3.",
    servingTemp: null,
    foodPairings: ["Πράσινες σαλάτες", "Λιπαρά ψητά ψάρια", "Οστρακοειδή", "Ριζότο με λευκές σάλτσες", "Ψητά λαχανικά", "Ψητά λευκά κρέατα", "Ζυμαρικά με σολομό"],
    varieties: [{ varietyId: malagousia.id, percentage: 100 }],
  });

  // Rarus K
  await upsertWine({
    slug: "bairaktaris-rarus-k",
    name: "Rarus K",
    regionId: korinthia.id,
    vintage: 2021,
    abv: 13,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    description:
      "100% Κυδωνίτσα από την ορεινή Κορινθία, σε υψόμετρο 600μ, με πυκνή φύτευση 0,9μ x 1,9μ που κάνει τα κλήματα να ανταγωνίζονται μεταξύ τους για χαμηλότερη απόδοση και πιο πλούσιο χαρακτήρα. Ιδιαίτερη τεχνική λευκής οινοποίησης με ελάχιστες παρεμβάσεις, ώστε να αναδειχθεί ο μοναδικός χαρακτήρας της ποικιλίας.",
    tastingNotes:
      "Λευκοκίτρινο χρώμα με χαρακτηριστικό άρωμα κυδωνιού, γλυκών εσπεριδοειδών και έντονα ορυκτά στοιχεία. Γεμάτο σώμα, δροσιστική οξύτητα και μακρά επίγευση.",
    vineyardNotes: "Ορεινή Κορινθία, σε υψόμετρο 600μ, με πυκνή φύτευση 0,9μ x 1,9μ. Στρεμματική απόδοση 900kg/στρέμμα, μέση ηλικία φυτών 20 έτη.",
    winemakingNotes: "Τα σταφύλια επεξεργάζονται κρύα, με σύντομη κρυοεκχύλιση και ελάχιστα παρεμβατική ζύμωση. Ελαφρύ φιλτράρισμα στο τέλος για διατήρηση του χαρακτήρα της ποικιλίας. Ανάγοντα σάκχαρα 1,1g/L, ολική οξύτητα 6,4g/L, pH 3,43.",
    servingTemp: null,
    foodPairings: ["Ψάρι και θαλασσινά της ελληνικής κουζίνας", "Λευκό κρέας", "Μαλακά τυριά", "Ψητά λαχανικά"],
    varieties: [{ varietyId: kidonitsa.id, percentage: 100 }],
  });

  // Terra Opus
  await upsertWine({
    slug: "bairaktaris-terra-opus",
    name: "Terra Opus",
    regionId: peloponnisos.id,
    vintage: 2019,
    abv: 15,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description:
      "Αγιωργίτικο και Cabernet Sauvignon από τη Ντούρμιζα, σε υψόμετρο 700μ, από τα γηραιότερα αμπέλια του κτήματος (μέση ηλικία 80 ετών). Ερυθρή οινοποίηση με εκχύλιση μακράς διάρκειας, ωρίμανση σε αμφορέα και βαρέλι για τουλάχιστον 24 μήνες και περαιτέρω παλαίωση στη φιάλη. Το «Terra Opus» είναι το δημιούργημα ενός επιλεγμένου κομματιού γης, από τα μεγαλύτερα σε ηλικία κλήματα του κτήματος, σε συνδυασμό με αυστηρή διαλογή πρώτης ύλης.",
    tastingNotes: "Ανοιχτό ρουμπινί χρώμα. Πολύπλοκο αρωματικό προφίλ με κυρίαρχα τα φρούτα του δάσους. Γεμάτο σώμα με απόλυτα ισορροπημένες τανίνες.",
    vineyardNotes: "Ντούρμιζα Νεμέας, σε υψόμετρο 700μ, από τα γηραιότερα αμπέλια του κτήματος (μέση ηλικία 80 ετών). Στρεμματική απόδοση 450kg/στρέμμα.",
    winemakingNotes: "Ερυθρή οινοποίηση με εκχύλιση μακράς διάρκειας. Ωρίμανση σε αμφορέα και βαρέλι για τουλάχιστον 24 μήνες, με περαιτέρω παλαίωση στη φιάλη. Ανάγοντα σάκχαρα 1,5g/L, ολική οξύτητα 5,30g/L, pH 3,8.",
    servingTemp: null,
    foodPairings: ["Κόκκινο κρέας", "Κρεμώδεις σάλτσες με μπαχαρικά", "Ριζότο με λάδι τρούφας", "Σκληρά και παλαιωμένα τυριά"],
    varieties: [
      { varietyId: agiorgitiko.id, percentage: null },
      { varietyId: cabernetSauvignon.id, percentage: null },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
