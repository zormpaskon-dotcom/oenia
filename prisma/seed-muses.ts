// Κτήμα Μουσών (Muses Estate) — πλήρης κατάλογος 18 κρασιών (17 νέα +
// ενημέρωση του υπάρχοντος "Μούχταρο"), με άδεια του οινοποιείου. Στοιχεία
// από τις επίσημες σελίδες κατηγορίας στο musesestate.com (κάθε σελίδα
// καλύπτει πολλά κρασιά — Muses Estate Premium, Prestige & Unique, Simply
// Elegant, 9 Collection, Clione) και από τις ίδιες τις φωτογραφημένες
// ετικέτες για vintage/ABV/μήνες παλαίωσης όπου διαφέρουν από το γενικό
// tech sheet του site (η ετικέτα είναι πιο συγκεκριμένη για τη
// συγκεκριμένη φιάλη/εσοδεία). Το "Unicorn" είναι περιορισμένης κυκλοφορίας
// κρασί που δεν βρέθηκε στο δημόσιο site — μόνο τα στοιχεία της ετικέτας.

import { Appellation, ContentStatus, WineColor, WineStyle } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "muses-estate" } });
  const voiotia = await prisma.region.findUniqueOrThrow({ where: { slug: "voiotia" } });

  const mouchtaro = await prisma.variety.findUniqueOrThrow({ where: { slug: "moychtaro" } });
  const chardonnay = await prisma.variety.findUniqueOrThrow({ where: { slug: "chardonnay" } });
  const cabernetSauvignon = await prisma.variety.findUniqueOrThrow({ where: { slug: "cabernet-sauvignon" } });
  const assyrtiko = await prisma.variety.findUniqueOrThrow({ where: { slug: "asyrtiko" } });
  const syrah = await prisma.variety.findUniqueOrThrow({ where: { slug: "syrah" } });
  const malagousia = await prisma.variety.findUniqueOrThrow({ where: { slug: "malagousia" } });
  const merlot = await prisma.variety.findUniqueOrThrow({ where: { slug: "merlot" } });
  const sauvignonBlanc = await prisma.variety.findUniqueOrThrow({ where: { slug: "sauvignon-blanc" } });
  const savatiano = await prisma.variety.findUniqueOrThrow({ where: { slug: "savvatiano" } });
  const roditis = await prisma.variety.findUniqueOrThrow({ where: { slug: "roditis" } });
  const grenache = await prisma.variety.findUniqueOrThrow({ where: { slug: "grenache" } });
  const agiorgitiko = await prisma.variety.findUniqueOrThrow({ where: { slug: "agiorgitiko" } });

  const trebbiano = await prisma.variety.upsert({
    where: { slug: "trebbiano" },
    update: {},
    create: {
      name: "Trebbiano",
      slug: "trebbiano",
      type: "WHITE",
      originRegion: "Ιταλία",
      description: "Διεθνής λευκή ποικιλία ιταλικής καταγωγής, με ουδέτερο έως ελαφρώς φρουτώδη χαρακτήρα και υψηλή οξύτητα. Χρησιμοποιείται συχνά σε blends.",
    },
  });

  const VALLEY_SOIL =
    "Ο αμπελώνας βρίσκεται στην Κοιλάδα των Μουσών, στους πρόποδες του Ελικώνα στη Στερεά Ελλάδα, σε γόνιμο έδαφος αμμοπηλώδες έως αργιλοπηλώδες, σε υψόμετρο 450-550m με κλίση 3-7%. Ο μικρός ποταμός Πέρμησσος συμβάλλει σε ένα ήπιο ηπειρωτικό μικροκλίμα με ήπιους, υγρούς χειμώνες και ξηρά καλοκαίρια.";

  async function upsertWine(spec: {
    slug: string;
    name: string;
    vintage: number | null;
    abv: number | null;
    color: WineColor;
    style: WineStyle;
    appellation: Appellation | null;
    description: string;
    tastingNotes: string | null;
    vineyardNotes: string;
    winemakingNotes: string | null;
    servingTemp: string | null;
    foodPairings: string[];
    varieties: Array<{ varietyId: string; percentage: number | null }>;
  }) {
    const wine = await prisma.wine.upsert({
      where: { slug: spec.slug },
      update: {
        name: spec.name,
        vintage: spec.vintage,
        abv: spec.abv,
        color: spec.color,
        style: spec.style,
        appellation: spec.appellation,
        regionId: voiotia.id,
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
        regionId: voiotia.id,
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

  console.log("Κτήμα Μουσών — 18 κρασιά…");

  await upsertWine({
    slug: "muses-estate-mouchtaro",
    name: "Κτήμα Μουσών Μούχταρο",
    vintage: 2024,
    abv: 14,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: null,
    description:
      "Η πολύ σπάνια ερυθρή ποικιλία Μούχταρο, γηγενής της Άσκρης Βοιωτίας. Το Κτήμα Μουσών ήταν το πρώτο οινοποιείο που αναβίωσε την ποικιλία χάρη στον Αθανάσιο Ζαχαρία.",
    tastingNotes: "Βαθύ μοβ χρώμα, αρώματα ώριμων κόκκινων φρούτων και μπαχαρικών, γεμάτο σώμα, ήπιες μεταξένιες τανίνες και έντονη οξύτητα.",
    vineyardNotes: VALLEY_SOIL,
    winemakingNotes: "Παλαίωση 12 μηνών σε βαρέλια δρυός 225L δεύτερης-τρίτης χρήσης και 6 μήνες στη φιάλη πριν την κυκλοφορία.",
    servingTemp: "16-18 °C",
    foodPairings: ["Tartar βοδινού", "Κυνήγι", "Αρνί", "Ζυμαρικά σε κόκκινη σάλτσα", "Σκληρό κίτρινο τυρί"],
    varieties: [{ varietyId: mouchtaro.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "muses-unicorn-mouchtaro",
    name: "Unicorn Μούχταρο",
    vintage: 2022,
    abv: null,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: null,
    description:
      "Περιορισμένης κυκλοφορίας ετικέτα Μούχταρο του Κτήματος Μουσών — δεν κυκλοφορεί μέσω του δημόσιου καταλόγου του οινοποιείου, οπότε δεν υπάρχουν επιπλέον επίσημα τεχνικά στοιχεία διαθέσιμα πέρα από την ίδια την ετικέτα.",
    tastingNotes: null,
    vineyardNotes: VALLEY_SOIL,
    winemakingNotes: null,
    servingTemp: null,
    foodPairings: [],
    varieties: [{ varietyId: mouchtaro.id, percentage: null }],
  });

  await upsertWine({
    slug: "muses-chardonnay-fume",
    name: "Chardonnay Fumé",
    vintage: 2025,
    abv: 13,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    description: "Σύνθετο Chardonnay από αμπέλια υψηλής απόδοσης στην Κοιλάδα των Μουσών — το πρώτο βαρελιασμένο Chardonnay της περιοχής.",
    tastingNotes: "Πλούσιο και συμπυκνωμένο, με ροδάκινο, καβουρδισμένο ξηρό καρπό, πικάντικο χαρακτήρα δρυός και μεταξένια επίγευση.",
    vineyardNotes: VALLEY_SOIL,
    winemakingNotes: "Παλαίωση 8 μηνών σε δρύινα βαρέλια 225L.",
    servingTemp: "12-14 °C",
    foodPairings: ["Λαχανοντολμάδες", "Βραστές σαλάτες λαχανικών", "Αστακός", "Χοιρινό σε λευκή ή λεμονάτη σάλτσα"],
    varieties: [{ varietyId: chardonnay.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "muses-cabernet-sauvignon",
    name: "Κτήμα Μουσών Cabernet Sauvignon",
    vintage: 2022,
    abv: 14,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: null,
    description: "\"The noble proof\" — καθαρό κεράσι και μαύρο μούρο συναντούν μεταλλικές, πικάντικες και γήινες νότες, με κομψό προφίλ και μακρά επίγευση.",
    tastingNotes: "Καθαρό κεράσι και μαύρο μούρο, μεταλλικές, πικάντικες και γήινες νότες. Κομψό προφίλ με μακρά, διαρκή επίγευση.",
    vineyardNotes: VALLEY_SOIL,
    winemakingNotes: "Παλαίωση σε δρύινα βαρέλια για 18 μήνες.",
    servingTemp: "16-18 °C",
    foodPairings: ["Κόκκινο κρέας", "Beef Bourguignon", "Κίτρινο τυρί"],
    varieties: [{ varietyId: cabernetSauvignon.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "muses-crispy-assyrtiko",
    name: "Crispy Assyrtiko",
    vintage: 2025,
    abv: 13,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    description: "Ασύρτικο από παλιά πρέμνα (old bush vines) της Κοιλάδας των Μουσών, με άγριες ζύμες (wild ferment) και παραμονή στις οινολάσπες.",
    tastingNotes: "Φρέσκο και ζωηρό, με ωραία τραγανή οξύτητα, λεμόνι, πράσινο μήλο και ορυκτή επίγευση.",
    vineyardNotes: "Ο αμπελώνας βρίσκεται σε υψόμετρο 560m με κλίση 4%, στην Κοιλάδα των Μουσών, στους πρόποδες του Ελικώνα.",
    winemakingNotes: "Παλιά πρέμνα, ζύμωση με αυτόχθονες (άγριες) ζύμες. Παραμένει 6 μήνες σε δεξαμενές με τις οινολάσπες, χωρίς παλαίωση σε βαρέλι.",
    servingTemp: "10-12 °C",
    foodPairings: ["Φρέσκα θαλασσινά", "Λευκό κρέας με ελαφριές σάλτσες", "Ζυμαρικά", "Ελληνική σαλάτα"],
    varieties: [{ varietyId: assyrtiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "muses-syrah",
    name: "Κτήμα Μουσών Syrah",
    vintage: 2022,
    abv: 14.5,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: null,
    description: "\"The Serene Terroir\" — 100% Syrah, πλούσιο και πικάντικο, με αρώματα καπνιστού κρέατος, κόκκινου φρούτου, καφέ και κουτιού πούρων.",
    tastingNotes: "Πλούσιο και πικάντικο, με αρώματα καπνιστού κρέατος, κόκκινου φρούτου, καφέ και κουτιού πούρων, καθαρό προφίλ.",
    vineyardNotes: VALLEY_SOIL,
    winemakingNotes: "Παλαίωση σε 100% καινούργια γαλλική δρυ μέσου καψίματος 300L για 12 μήνες, και ακόμη 12 μήνες στη φιάλη πριν την κυκλοφορία.",
    servingTemp: "16-18 °C",
    foodPairings: ["Ψητό αρνί", "Χοιρινό μπάρμπεκιου", "Μελιτζάνα ψητή στην άλμη (vegan)"],
    varieties: [{ varietyId: syrah.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "muses-chrisolithos-white",
    name: "Chrisolithos Λευκό",
    vintage: 2022,
    abv: 13,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    description: "\"Χρυσόλιθος\" σημαίνει «χρυσή πέτρα», ονομασία εμπνευσμένη από το ιδιαίτερα γόνιμο έδαφος του αμπελώνα.",
    tastingNotes: "Λαμπερό, αχυροκίτρινο χρώμα. Έντονα φρουτώδη αρώματα ροδάκινου, πεπονιού και ανανά. Ζεστό, σύνθετο, ισορροπημένο στόμα με χαρακτηριστική μεταλλικότητα και μακρά επίγευση.",
    vineyardNotes: VALLEY_SOIL,
    winemakingNotes: "Το Chardonnay ζυμώνεται/παλαιώνει αποκλειστικά σε καινούργια δρύινα βαρέλια 225L για 3 μήνες.",
    servingTemp: "8-10 °C",
    foodPairings: ["Θαλασσινά", "Ψάρι", "Αστακός", "Καραβίδα", "Πουλερικά ή χοιρινό σε λευκές σάλτσες", "Ήπια κατσικίσια τυριά"],
    varieties: [
      { varietyId: chardonnay.id, percentage: 50 },
      { varietyId: malagousia.id, percentage: 50 },
    ],
  });

  await upsertWine({
    slug: "muses-chrisolithos-red",
    name: "Chrisolithos Ερυθρό",
    vintage: 2021,
    abv: 13.5,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: null,
    description: "\"Χρυσόλιθος\" σημαίνει «χρυσή πέτρα», ονομασία εμπνευσμένη από το ιδιαίτερα γόνιμο έδαφος του αμπελώνα.",
    tastingNotes:
      "Βαθύ πορφυρό-κόκκινο χρώμα. Εκρηκτική μύτη με νότες φρέσκων κόκκινων φρούτων (κόκκινη σταφίδα, κεράσι) και λευκών φρούτων (αχλάδι). Έντονο στόμα με μαύρα φρούτα, ζεστά μπαχαρικά και απαλές τανίνες.",
    vineyardNotes: VALLEY_SOIL,
    winemakingNotes: "Παλαίωση 6 μηνών σε βαρέλια δρυός 225L δεύτερης-τρίτης χρήσης.",
    servingTemp: "16-18 °C",
    foodPairings: ["Χοιρινό με δαμάσκηνο σε σάλτσα ντομάτας", "Ζυμαρικά με κεφτεδάκια σε σάλτσα ντομάτας", "Σολομός σε σάλτσα σόγιας"],
    varieties: [{ varietyId: merlot.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "muses-amuse-white",
    name: "A•Muse Blanc",
    vintage: 2025,
    abv: 12.5,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    description: "100% Μαλαγουζιά, εμπνευσμένο από μία από τις Μούσες που έζησαν στην Κοιλάδα.",
    tastingNotes: "Λαμπερό, με χρυσαφί απόχρωση και αρωματική πολυπλοκότητα εξωτικών φρούτων και λευκών λουλουδιών. Ελαφρύ, αναζωογονητικό και παιχνιδιάρικο, με ευχάριστη οξύτητα και κομψή επίγευση.",
    vineyardNotes: VALLEY_SOIL,
    winemakingNotes: "Ψυχρή εκχύλιση φλοιού 10 ωρών στους 8°C σε περιβάλλον χωρίς οξυγόνο, και ψυχρή ζύμωση σε σταθερή θερμοκρασία 17°C. Δεν παλαιώνει σε ξύλο.",
    servingTemp: "8-10 °C",
    foodPairings: ["Ελληνική & μεσογειακή κουζίνα", "Φρέσκα θαλασσινά", "Λευκά κρέατα", "Ζυμαρικά με ήπιες σάλτσες", "Φρέσκες σαλάτες με μυρωδικά εποχής"],
    varieties: [{ varietyId: malagousia.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "muses-amuse-rose",
    name: "A•Muse Rosé",
    vintage: 2026,
    abv: 13,
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    appellation: null,
    description: "Εμπνευσμένο από τα ελληνικά νησιά — ένας συνδυασμός Sauvignon Blanc και Μούχταρου σε ανοιχτόχρωμο, κομψό ροζέ.",
    tastingNotes: "Απόλαυση για τα μάτια με όμορφο σομόν χρώμα. Ελαφρύ, φρουτώδες, απαλό, ζωηρό και κομψό.",
    vineyardNotes: VALLEY_SOIL,
    winemakingNotes: "Δεν παλαιώνει σε ξύλο (unoaked).",
    servingTemp: "10-12 °C",
    foodPairings: ["Φρέσκα θαλασσινά", "Sushi", "Σαλάτα", "Πίτες λαχανικών"],
    varieties: [
      { varietyId: sauvignonBlanc.id, percentage: 90 },
      { varietyId: mouchtaro.id, percentage: 10 },
    ],
  });

  await upsertWine({
    slug: "muses-ennea-white",
    name: "Κτήμα Μουσών Ennea Λευκό",
    vintage: 2025,
    abv: 12.5,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    description: "Blend τριών ποικιλιών σε κομψή, φρέσκια σύνθεση για την σειρά «9» του Κτήματος Μουσών.",
    tastingNotes: "Αχυρόξανθο χρώμα με ανοιχτές πράσινες ανταύγειες, απαλά αρώματα φρεσκοκομμένου φρούτου όπως αχλάδι και μήλο. Εξαιρετική δομή, βάθος γεύσεων και οξύτητα που αναδεικνύει τη φρεσκάδα, με ευχάριστη επίγευση.",
    vineyardNotes: VALLEY_SOIL,
    winemakingNotes: "Δεν παλαιώνει σε ξύλο (unoaked).",
    servingTemp: "8-10 °C",
    foodPairings: ["Φρέσκα θαλασσινά", "Ψητό ψάρι", "Σαλάτα", "Πίτες λαχανικών"],
    varieties: [
      { varietyId: assyrtiko.id, percentage: 50 },
      { varietyId: trebbiano.id, percentage: 30 },
      { varietyId: sauvignonBlanc.id, percentage: 20 },
    ],
  });

  await upsertWine({
    slug: "muses-ennea-red",
    name: "Κτήμα Μουσών Ennea Ερυθρό",
    vintage: 2022,
    abv: 13,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: null,
    description: "Blend τριών ερυθρών ποικιλιών (Μούχταρο, Merlot, Syrah) της σειράς «9» του Κτήματος Μουσών.",
    tastingNotes: "Λαμπερό βαθύ πορφυρό χρώμα. Κομψό μπουκέτο με νότες μαύρης σταφίδας, μαύρου μούρου, μπαχαρικών και αρωματικού καπνού. Απαλό, ευχάριστο, φρουτώδες στόμα με ελαφριές νότες μαύρου πιπεριού.",
    vineyardNotes: VALLEY_SOIL,
    winemakingNotes: "Δεν παλαιώνει σε ξύλο (unoaked).",
    servingTemp: "16-18 °C",
    foodPairings: ["Κυνήγι", "Αρνί", "Κόκκινο κρέας σχάρας ή κατσαρόλας", "Σκληρό τυρί"],
    varieties: [
      { varietyId: mouchtaro.id, percentage: 20 },
      { varietyId: syrah.id, percentage: 40 },
      { varietyId: merlot.id, percentage: 40 },
    ],
  });

  await upsertWine({
    slug: "muses-ennea-rose",
    name: "Κτήμα Μουσών Ennea Ροζέ",
    vintage: 2022,
    abv: 12.5,
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    appellation: null,
    description: "Blend Syrah και Μούχταρου της σειράς «9» του Κτήματος Μουσών.",
    tastingNotes: "Ξεχωριστό, λαμπερό ροζέ χρώμα, καλοδομημένο, με διακριτικό μπουκέτο και φρουτώδη επίγευση.",
    vineyardNotes: VALLEY_SOIL,
    winemakingNotes: "Δεν παλαιώνει σε ξύλο (unoaked).",
    servingTemp: "10-12 °C",
    foodPairings: ["Παστίτσιο", "Τηγανητό ψάρι", "Πικάντικο sushi"],
    varieties: [
      { varietyId: syrah.id, percentage: 80 },
      { varietyId: mouchtaro.id, percentage: 20 },
    ],
  });

  await upsertWine({
    slug: "muses-ennea-savatiano",
    name: "Κτήμα Μουσών Ennea Σαββατιανό",
    vintage: 2022,
    abv: 12.5,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    description: "100% Σαββατιανό παλαιών κλημάτων (old vines), από τη σειρά «9» του Κτήματος Μουσών.",
    tastingNotes: "Λαμπερό αχυροκίτρινο χρώμα με πράσινες ανταύγειες. Πολύ έντονο, σύνθετο άρωμα με νότες φρούτου (εσπεριδοειδή και κομπόστα ροδάκινου) πάνω σε φόντο πράσινου μήλου.",
    vineyardNotes: VALLEY_SOIL,
    winemakingNotes: "Δεν παλαιώνει σε ξύλο (unoaked).",
    servingTemp: "8-10 °C",
    foodPairings: ["Ψητό ή τηγανητό ψάρι", "Πουλερικά", "Πίτες", "Πράσινες σαλάτες", "Ζυμαρικά με ελαφριές σάλτσες"],
    varieties: [{ varietyId: savatiano.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "muses-sweet-muse",
    name: "The Sweet Muse",
    vintage: null,
    abv: 15,
    color: WineColor.WHITE,
    style: WineStyle.SWEET,
    appellation: null,
    description: "Το γλυκό μελωδικό κρασί, εμπνευσμένο από τα ποιήματα των 9 Μουσών — 100% Μοσχάτο, χωρίς να διευκρινίζεται στην επίσημη σελίδα η ακριβής υποποικιλία.",
    tastingNotes:
      "Χρυσοκίτρινο χρώμα με χρυσές ανταύγειες. Ήπια αρώματα μελιού και λεμονιού, φρέσκα φρούτα όπως αχλάδι και μήλο. Στο στόμα μέλι, φλούδα πορτοκαλιού και καραμέλα, με μακρά επίγευση όπου κυριαρχεί η γεύση του μελιού.",
    vineyardNotes: VALLEY_SOIL,
    winemakingNotes:
      "Ψυχρή εκχύλιση 12 ωρών στους 8°C σε περιβάλλον χωρίς οξυγόνο και ψυχρή ζύμωση σε σταθερή θερμοκρασία 18°C. Πριν την έναρξη της αλκοολικής ζύμωσης προστίθεται οινικής προέλευσης αλκοόλη, ώστε να διατηρηθούν τα σάκχαρα και τα πρωτογενή αρώματα του σταφυλιού.",
    servingTemp: "8-10 °C",
    foodPairings: ["Καβουρδισμένα αμύγδαλα", "Αποξηραμένα βερίκοκα", "Φρούτα", "Γλυκά", "Κρέμα πορτοκάλι", "Παγωτό", "Sorbet"],
    varieties: [],
  });

  await upsertWine({
    slug: "muses-clione-white",
    name: "Clione's White (Η Λευκή Μούσα)",
    vintage: null,
    abv: 12.5,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description: "Εμπνευσμένο από την Κλειώ, μία από τις Μούσες που έζησαν στην Κοιλάδα — ΠΓΕ Στερεά Ελλάδα.",
    tastingNotes: "Φρέσκο και ζωηρό, με ωραία τραγανή οξύτητα, λεμόνι, πράσινο μήλο και ζουμερή επίγευση.",
    vineyardNotes: VALLEY_SOIL,
    winemakingNotes: "Δεν παλαιώνει σε ξύλο (unoaked).",
    servingTemp: "8-10 °C",
    foodPairings: ["Θαλασσινά", "Ψάρι", "Αστακός", "Καραβίδα", "Πουλερικά ή χοιρινό σε λευκές σάλτσες", "Ήπια κατσικίσια τυριά"],
    varieties: [
      { varietyId: assyrtiko.id, percentage: 50 },
      { varietyId: roditis.id, percentage: 25 },
      { varietyId: savatiano.id, percentage: 25 },
    ],
  });

  await upsertWine({
    slug: "muses-clione-red",
    name: "Clione's Red (Η Κόκκινη Μούσα)",
    vintage: null,
    abv: 13,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description: "Εμπνευσμένο από την Κλειώ, μία από τις Μούσες που έζησαν στην Κοιλάδα — ΠΓΕ Στερεά Ελλάδα.",
    tastingNotes: "Λαμπερό, κερασί χρώμα. Βατόμουρο, μουριά, σμέουρο, ώριμη φράουλα, λεπτές τανίνες, στρογγυλό και βελούδινο στόμα.",
    vineyardNotes: VALLEY_SOIL,
    winemakingNotes: "Δεν παλαιώνει σε ξύλο (unoaked).",
    servingTemp: "16-18 °C",
    foodPairings: ["Κρέας με πλούσια κόκκινη σάλτσα", "Ψητές μπριζόλες", "Burger", "Παλαιωμένο τυρί"],
    varieties: [
      { varietyId: merlot.id, percentage: 60 },
      { varietyId: agiorgitiko.id, percentage: 40 },
    ],
  });

  await upsertWine({
    slug: "muses-clione-rose",
    name: "Clione's Rosé (Η Ροζέ Μούσα)",
    vintage: null,
    abv: 12.5,
    color: WineColor.ROSE,
    style: WineStyle.OFF_DRY,
    appellation: Appellation.PGI,
    description: "Εμπνευσμένο από την Κλειώ, μία από τις Μούσες που έζησαν στην Κοιλάδα — ΠΓΕ Θήβα.",
    tastingNotes: "Ανοιχτόχρωμο, δροσερό και φρουτώδες ροζέ. Ζωηρό άρωμα κόκκινων φρούτων με λεπτές νότες φράουλας, ροδάκινου και εσπεριδοειδών.",
    vineyardNotes: VALLEY_SOIL,
    winemakingNotes: "Δεν παλαιώνει σε ξύλο (unoaked).",
    servingTemp: "8-10 °C",
    foodPairings: ["Κοτόπουλο", "Ψάρι", "Αλλαντικά", "Πιάτα τυριών", "Σαλάτες"],
    varieties: [
      { varietyId: roditis.id, percentage: 70 },
      { varietyId: grenache.id, percentage: 30 },
    ],
  });

  console.log("Έτοιμο: 18 κρασιά Κτήμα Μουσών.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
