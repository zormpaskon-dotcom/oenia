// Κατώγι Αβέρωφ (Μέτσοβο) — πλήρης κατάλογος 12 κρασιών. Στοιχεία από τα
// επίσημα τεχνικά φύλλα (.doc, δόθηκαν από τον χρήστη) των σειρών Κατώγι
// Αβέρωφ / Inima / Rossiu di Munte / Alba di Munte / Φλογερό. Φωτογραφίες
// από τις επίσημες σελίδες προϊόντων στο katogiaveroff.gr. Vintage/ABV
// από το ίδιο το τεχνικό φύλλο· ABV 12,5% για το Λευκό επιβεβαιώνεται και
// από την ίδια την ετικέτα.
//
// Το υπάρχον "Katogi Metsovou" (Cabernet Sauvignon/Merlot/Cabernet Franc)
// είναι διαφορετικό προϊόν από τα 12 της τρέχουσας λίστας — παραμένει
// άθικτο, πιθανώς ιστορική ετικέτα.

import { Appellation, ContentStatus, MacroRegion, VarietyType, WineColor, WineStyle } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "katogi-averoff" } });
  const metsovo = await prisma.region.findUniqueOrThrow({ where: { slug: "metsovo" } });
  const naoussa = await prisma.region.findUniqueOrThrow({ where: { slug: "naoussa" } });
  const amyndaio = await prisma.region.findUniqueOrThrow({ where: { slug: "amyndaio" } });
  const goumenissa = await prisma.region.findUniqueOrThrow({ where: { slug: "goumenissa" } });
  const ioannina = await prisma.region.upsert({
    where: { slug: "ioannina" },
    update: {},
    create: {
      slug: "ioannina",
      name: "Ιωάννινα",
      macroRegion: MacroRegion.EPIRUS,
      appellation: Appellation.PGI,
      description: "Ζώνη ΠΓΕ στον νομό Ιωαννίνων, Ήπειρος.",
    },
  });

  await prisma.winery.update({
    where: { slug: "katogi-averoff" },
    data: {
      websiteUrl: "https://katogiaveroff.gr",
      story: [
        "Από το 1959 το Κατώγι Αβέρωφ καλλιεργεί στο Μέτσοβο τους πιο ορεινούς αμπελώνες στην Ελλάδα και προσφέρει μοναδικές οινικές εμπειρίες, συνδυάζοντας την τέχνη και την φιλοξενία.",
        "Το Κατώγι Αβέρωφ εμπνέεται από τη ζωή και τον άνθρωπο. Από τα αμπέλια που ξεπερνούν τις δύσκολες συνθήκες και δίνουν καρπούς, από τις αρκούδες και τα πουλιά που συντροφεύουν την αμπελοκαλλιέργεια στο Μέτσοβο, από τους ανθρώπους που δαμάζουν τις αντιξοότητες και δημιουργούν. Εμπνέεται από όλα εκείνα που γοητεύουν τις αισθήσεις, απ' όσα ελευθερώνουν το νου και τη ψυχή, και μετουσιώνει την οινική δημιουργία σε στάση ζωής.",
        "Συνεχίζοντας το έργο του ιδρυτή του, το Κατώγι Αβέρωφ δίνει χώρο στους συνεργάτες του για να υλοποιήσουν τις δικές τους ιδέες και εμπνεύσεις, να διατηρήσουν ζωντανό το χαμόγελο τους και το όραμα για δημιουργία.",
      ].join("\n\n"),
    },
  });

  const cabernetSauvignon = await prisma.variety.findUniqueOrThrow({ where: { slug: "cabernet-sauvignon" } });
  const merlot = await prisma.variety.findUniqueOrThrow({ where: { slug: "merlot" } });
  const agiorgitiko = await prisma.variety.findUniqueOrThrow({ where: { slug: "agiorgitiko" } });
  const xinomavro = await prisma.variety.findUniqueOrThrow({ where: { slug: "xinomavro" } });
  const negoska = await prisma.variety.findUniqueOrThrow({ where: { slug: "negoska" } });
  const sauvignonBlanc = await prisma.variety.findUniqueOrThrow({ where: { slug: "sauvignon-blanc" } });
  const chardonnay = await prisma.variety.upsert({
    where: { slug: "chardonnay" },
    update: {},
    create: { name: "Chardonnay", slug: "chardonnay", type: VarietyType.WHITE, originRegion: "Βουργουνδία, Γαλλία" },
  });
  const malvasia = await prisma.variety.findUniqueOrThrow({ where: { slug: "malvasia-di-candia-aromatica" } });
  const moschato = await prisma.variety.findUniqueOrThrow({ where: { slug: "moschato" } });
  const debina = await prisma.variety.findUniqueOrThrow({ where: { slug: "ntempina" } });
  const traminer = await prisma.variety.findUniqueOrThrow({ where: { slug: "gewurztraminer" } });
  const pinotNoir = await prisma.variety.upsert({
    where: { slug: "pinot-noir" },
    update: {},
    create: { name: "Pinot Noir", slug: "pinot-noir", type: VarietyType.RED, originRegion: "Βουργουνδία, Γαλλία" },
  });
  const vlachiko = await prisma.variety.upsert({
    where: { slug: "vlachiko" },
    update: {},
    create: {
      name: "Βλάχικο",
      slug: "vlachiko",
      nameLatin: "Vlachiko",
      type: VarietyType.RED,
      originRegion: "Ιωάννινα, Ήπειρος",
      description: "Σπάνια ερυθρή γηγενής ποικιλία του νομού Ιωαννίνων.",
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
    vineyardNotes: string;
    winemakingNotes: string;
    foodPairings: string[];
    varieties: Array<{ varietyId: string; percentage: number | null }>;
  }) {
    const wine = await prisma.wine.upsert({
      where: { slug: spec.slug },
      update: {
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

  console.log("Κατώγι Αβέρωφ — 12 κρασιά…");

  await upsertWine({
    slug: "katogi-averoff-white",
    name: "Κατώγι Αβέρωφ Λευκός",
    regionId: metsovo.id,
    vintage: 2025,
    abv: 12.5,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    description: "Chardonnay 50%, Malvasia Aromatica 30% και Μοσχάτο Λευκό 20%, από αμπελώνες του δικτύου συνεργαζόμενων αμπελουργών σε κεντρική και δυτική Μακεδονία.",
    tastingNotes: "Χρώμα ανοιχτό κίτρινο. Ιδιαίτερα εκφραστικό αρωματικά, με ζωηρό νεανικό χαρακτήρα που αποτυπώνει στοιχεία λευκών λουλουδιών και φρούτων όπως αχλάδι και μπανάνα. Στο στόμα συνδυάζει τη δροσερή οξύτητα με μια καλοδομημένη πλούσια γεύση.",
    vineyardNotes: "Αμπελώνες από το δίκτυο συνεργαζόμενων αμπελουργών σε κεντρική και δυτική Μακεδονία, με φορτίο έως 900kg/στρέμμα. Ηπειρωτικό κλίμα με κρύους χειμώνες, ζεστά καλοκαίρια και υψηλές θερμοκρασιακές διαφορές ημέρας-νύχτας.",
    winemakingNotes: "Χωριστή οινοποίηση για κάθε ποικιλία. Προζυμωτική κρυοεκχύλιση κάτω των 8°C για μία νύχτα για Μοσχάτο και Malvasia, απευθείας πίεση για το Chardonnay. Το Chardonnay ζυμώνει και ωριμάζει σε δρύινα βαρέλια με τις οινολάσπες, ενώ Μοσχάτο και Malvasia ωριμάζουν σε ανοξείδωτες δεξαμενές στις φίνες οινολάσπες.",
    foodPairings: ["Ζυμαρικά", "Θαλασσινά", "Πουλερικά", "Ψάρια"],
    varieties: [
      { varietyId: chardonnay.id, percentage: 50 },
      { varietyId: malvasia.id, percentage: 30 },
      { varietyId: moschato.id, percentage: 20 },
    ],
  });

  await upsertWine({
    slug: "katogi-averoff-rose",
    name: "Κατώγι Αβέρωφ Ροζέ",
    regionId: amyndaio.id,
    vintage: 2025,
    abv: null,
    color: WineColor.ROSE,
    style: WineStyle.OFF_DRY,
    appellation: null,
    description: "100% Ξινόμαυρο από αμπελώνες στην περιοχή του Αμυνταίου, από το δίκτυο συνεργαζόμενων αμπελουργών.",
    tastingNotes: "Απαλό ρόδινο χρώμα. Έντονα αρώματα κόκκινων φρούτων, με κυρίαρχες νότες κερασιού και φράουλας. Λεπτή και ισορροπημένη γεύση, με πολύ ευχάριστη επίγευση.",
    vineyardNotes: "Αμπελώνες στην περιοχή του Αμυνταίου, με φορτίο 800-900kg/στρέμμα. Ηπειρωτικό κλίμα με κρύους χειμώνες και ζεστά καλοκαίρια με δροσερές νύχτες.",
    winemakingNotes: "Εκραγισμός, έκθλιψη και παραμονή του χυμού με τα στέμφυλα σε πολύ χαμηλές θερμοκρασίες για περίπου 30 ώρες. Μετά τον διαχωρισμό από τα στέμφυλα, απολάσπωση και άμεση έναρξη της αλκοολικής ζύμωσης, με διακοπή στα 11g/L σακχάρου με τη βοήθεια ισχυρής ψύξης. Θερμοκρασία ζύμωσης έως 14°C.",
    foodPairings: ["Λευκά κρέατα", "Ζυμαρικά", "Πιάτα με γλυκίζουσες σάλτσες", "Πιάτα με σάλτσα ντομάτας"],
    varieties: [{ varietyId: xinomavro.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "katogi-averoff-red",
    name: "Κατώγι Αβέρωφ Ερυθρός",
    regionId: metsovo.id,
    vintage: 2022,
    abv: null,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: null,
    description: "Cabernet Sauvignon 40%, Merlot 30% και Αγιωργίτικο 30%, από ιδιόκτητους και μακροχρόνια συνεργαζόμενους αμπελώνες σε Ήπειρο και Μακεδονία.",
    tastingNotes: "Σύνθετο διαυγές κόκκινο χρώμα, με πλούσιες και ελκυστικές ανταύγειες. Αρώματα κόκκινων φρούτων με νότες μπαχαρικών και δέρματος. Ιδιαίτερη ισορροπία και απαλή, γεμάτη αίσθηση στο στόμα, με μακριά απολαυστική επίγευση.",
    vineyardNotes: "Ιδιόκτητοι και μακροχρόνια συνεργαζόμενοι αμπελώνες σε Ήπειρο και Μακεδονία, με φορτίο έως 900kg/στρέμμα. Τρύγος τέλη Σεπτεμβρίου με μέσα Οκτωβρίου.",
    winemakingNotes: "Κλασική ερυθρή οινοποίηση, με προζυμωτική εκχύλιση για το Merlot και το Αγιωργίτικο και μεταζυμωτική εκχύλιση για το Cabernet. Θερμοκρασίες ζύμωσης έως 28°C. Παλαίωση περίπου 12 μήνες σε βαρέλια γαλλικής και αμερικανικής δρυός.",
    foodPairings: ["Κρέατα μαγειρευτά", "Μακαρονάδες με κόκκινες σάλτσες", "Αλλαντικά"],
    varieties: [
      { varietyId: cabernetSauvignon.id, percentage: 40 },
      { varietyId: merlot.id, percentage: 30 },
      { varietyId: agiorgitiko.id, percentage: 30 },
    ],
  });

  await upsertWine({
    slug: "inima-negoska-rose",
    name: "Inima Νεγκόσκα Ροζέ",
    regionId: goumenissa.id,
    vintage: 2025,
    abv: null,
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    appellation: null,
    description: "100% Νεγκόσκα από επιλεγμένο αμπελοτόπι στην περιοχή της Γουμένισσας, από πρέμνα ηλικίας περίπου 30 ετών.",
    tastingNotes: "Διαυγές ρόδινο χρώμα με σομόν ανταύγειες. Αρώματα λουλουδιών και βανίλιας, σε συνδυασμό με νότες κόκκινων φρούτων και μπαχαρικών. Πληθωρικό στόμα, με κομψή οξύτητα και πλούσια γεύση.",
    vineyardNotes: "Επιλεγμένο αμπελοτόπι στην περιοχή της Γουμένισσας. Πρέμνα ηλικίας περίπου 30 ετών, στρεμματική απόδοση έως 700kg/στρέμμα, αμμοαργιλώδες έδαφος με καλή στράγγιση, ηπειρωτικό κλίμα με κρύους χειμώνες.",
    winemakingNotes: "Εκραγισμός, έκθλιψη και παραμονή του χυμού με τα στέμφυλα σε πολύ χαμηλές θερμοκρασίες για λίγες ώρες. Ελαφριά απολάσπωση και άμεση έναρξη της αλκοολικής ζύμωσης σε δρύινα γαλλικά βαρέλια, όπου παραμένει έξι περίπου μήνες στις λεπτές οινολάσπες πριν την εμφιάλωση.",
    foodPairings: ["Πιάτα με βάση το κρέας ως εναλλακτική στο κόκκινο κρασί"],
    varieties: [{ varietyId: negoska.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "inima-xinomavro",
    name: "Inima Ξινόμαυρο",
    regionId: naoussa.id,
    vintage: 2020,
    abv: null,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PDO,
    description: "100% Ξινόμαυρο από επιλεγμένο αμπελοτόπι στην περιοχή Ρουντίνα της Νάουσας, από πρέμνα ηλικίας περίπου 30 ετών — Προστατευόμενη Ονομασία Προέλευσης Νάουσα.",
    tastingNotes: "Λαμπερό ρουμπινί χρώμα με πορφυρές ανταύγειες. Αρώματα κόκκινων φρούτων και μπαχαρικών, με νότες βιολέτας και γλυκόριζας. Τανίνες άμεσα αισθητές χωρίς να είναι επιθετικές, οξύτητα που διατηρεί τη φρεσκάδα, πολύπλοκη δομή.",
    vineyardNotes: "Αμπελοτόπι στη Ρουντίνα της Νάουσας. Πρέμνα ηλικίας περίπου 30 ετών, στρεμματική απόδοση έως 900kg/στρέμμα, αμμοαργιλώδες έδαφος. Ωρίμανση υποβοηθούμενη από τις δροσερές καλοκαιρινές νύχτες λόγω ανέμων από το όρος Βέρμιο.",
    winemakingNotes: "Προζυμωτική εκχύλιση στους 12-15°C για επτά ημέρες, ζύμωση για είκοσι περίπου ημέρες στους 30-32°C. Μηλογαλακτική ζύμωση σε δρύινα γαλλικά βαρέλια 300L τύπου Nevers, με τις λάσπες για δύο μήνες, και παλαίωση για ακόμα δέκα μήνες τουλάχιστον μετά την απολάσπωση.",
    foodPairings: ["Κυνήγι", "Ψητά κρέατα", "Μαγειρευτά κρέατα"],
    varieties: [{ varietyId: xinomavro.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "inima-sauvignon-blanc",
    name: "Inima Sauvignon Blanc",
    regionId: amyndaio.id,
    vintage: 2025,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    description: "100% Sauvignon Blanc από επιλεγμένο αμπελοτόπι στην περιοχή του Αμυνταίου, από πρέμνα ηλικίας περίπου 10 ετών.",
    tastingNotes: "Λαμπερό έντονο κίτρινο χρώμα. Πρωτογενή αρώματα της ποικιλίας στην ώριμη εκδοχή τους — καλογινομένο αχλάδι, λεμόνι κονφί και περγαμόντο, με έντονες νότες γιασεμιού και αρμπαρόριζας. Πληθωρικό στόμα, με καλή οξύτητα, πλούσια γεύση και πιπεράτη επίγευση.",
    vineyardNotes: "Αμπελοτόπι στην περιοχή του Αμυνταίου. Πρέμνα ηλικίας περίπου 10 ετών, αμμοπηλώδες έδαφος με καλή αποστράγγιση, ηπειρωτικό κλίμα με την επίδραση των λιμνών της περιοχής.",
    winemakingNotes: "Προζυμωτική κρυοεκχύλιση στους 8°C για μία νύχτα, με παραμονή με τα στέμφυλα για μία εβδομάδα για το 1/3 του γλεύκους. Ζύμωση με άγριες ζύμες στους 15-18°C. Ωριμάζει στις οινολάσπες πριν την εμφιάλωση.",
    foodPairings: ["Λιπαρά ψάρια", "Λευκά κρέατα με λεμόνι"],
    varieties: [{ varietyId: sauvignonBlanc.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "inima-chardonnay-debina",
    name: "Inima Chardonnay - Ντεμπίνα",
    regionId: metsovo.id,
    vintage: 2024,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    description: "Chardonnay 70% και Ντεμπίνα 30%, από επιλεγμένα αμπελοτόπια σε Ήπειρο και Μακεδονία.",
    tastingNotes: "Λαμπερό και διαυγές κίτρινο χρώμα. Πολύπλοκο αρωματικό μπουκέτο, με νότες εσπεριδοειδών, αχλαδιού, ροδάκινου και βανίλιας. Λιπαρότητα, πλούσιο σώμα και μεγάλη ένταση αρωμάτων, με αρμονική οξύτητα και μακριά επίγευση.",
    vineyardNotes: "Επιλεγμένα αμπελοτόπια σε Ήπειρο και Μακεδονία. Τρύγος τέλη Αυγούστου για το Chardonnay και μέσα Σεπτεμβρίου για τη Ντεμπίνα.",
    winemakingNotes: "Αποβοστρύχωση, έκθλιψη και ελαφρά πίεση για το Chardonnay σε πνευματικό πιεστήριο, με ζύμωση σε βαρέλια δρυός και ακακίας. Η Ντεμπίνα ζυμώνεται ομοίως μετά από ελαφρά απολάσπωση. Οι δύο οίνοι αναμιγνύονται σε αναλογία 70%-30% και επιστρέφουν στα βαρέλια για ακόμα τέσσερις μήνες.",
    foodPairings: ["Λιπαρά ψάρια", "Λευκά κρέατα"],
    varieties: [
      { varietyId: chardonnay.id, percentage: 70 },
      { varietyId: debina.id, percentage: 30 },
    ],
  });

  await upsertWine({
    slug: "alba-di-munte",
    name: "Alba di Munte",
    regionId: metsovo.id,
    vintage: 2025,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description: "100% Traminer από ιδιόκτητους αμπελώνες στη θέση Γινιέτς Μετσόβου, σε υψόμετρο 950-1050μ — Προστατευόμενη Γεωγραφική Ένδειξη Μέτσοβο.",
    tastingNotes: "Λαμπερό ανοιχτό κίτρινο χρώμα. Γοητευτική μύτη με έντονα αρώματα λευκών φρούτων, λουλουδιών και βοτάνων. Πλούσιο στόμα με ευχάριστη οξύτητα και έντονη επίγευση.",
    vineyardNotes: "Ιδιόκτητοι, επικλινείς αμπελώνες στη θέση Γινιέτς Μετσόβου, σε υψόμετρο 950-1050μ, σε έδαφος αποσαθρωμένων σχιστών, δυσπρόσιτο στη μηχανική εξυπηρέτηση. Ψυχρό κλίμα με δριμύ, παρατεταμένο χειμώνα και δροσερό καλοκαίρι.",
    winemakingNotes: "Προζυμωτική κρυοεκχύλιση με ξηρό πάγο για πλήρη αποκλεισμό οξυγόνου, σε θερμοκρασίες κοντά στους 0°C. Ελαφρά πίεση σε πνευματικό πιεστήριο και αυστηρή απολάσπωση με ψύξη. Ζύμωση σε πολύ χαμηλές θερμοκρασίες με επιλεγμένο σακχαρομύκητα, παραμονή στις οινολάσπες.",
    foodPairings: ["Θαλασσινά", "Πράσινες σαλάτες", "Ζυμαρικά", "Πιάτα με μυρωδικά", "Απεριτίφ"],
    varieties: [{ varietyId: traminer.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "rossiu-di-munte-yiniets",
    name: "Rossiu di Munte Γινιέτς",
    regionId: metsovo.id,
    vintage: 2019,
    abv: null,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description: "100% Cabernet Sauvignon — τα πρώτα κλήματα της ποικιλίας που ήρθαν στην Ελλάδα, φυτεμένα από τον Ευάγγελο Αβέρωφ στη θέση Γινιέτς Μετσόβου μεταξύ 1959 και 1963, σε υψόμετρο 1000μ.",
    tastingNotes: "Βαθύχρωμο με μοβ ανταύγειες. Τυπικά αρώματα της ποικιλίας συνδυασμένα με νότες δέρματος, γλυκών μπαχαρικών και καφέ. Γεμάτο στόμα, με πλούσιες τανίνες και δομή που υπόσχεται μακρόχρονη παλαίωση.",
    vineyardNotes: "Γινιέτς Μετσόβου, σε υψόμετρο 1000μ. Αμπελώνας φυτεμένος από το 1959 έως το 1963 με τα πρώτα κλήματα Cabernet Sauvignon που ήρθαν στην Ελλάδα. Πυκνότητα φύτευσης 600 φυτά/στρέμμα, αμμοαργιλοπηλώδες έδαφος με χαλίκια. Ηπειρωτικό κλίμα με πολλές βροχές και χιόνια τον χειμώνα, δροσερό καλοκαίρι με καταιγίδες.",
    winemakingNotes: "Εκραγισμός, έκθλιψη και εκχύλιση για 28 ημέρες, με 2-3 διαβροχές την ημέρα. Ζύμωση στους 20-30°C. Παλαίωση σε δρύινα γαλλικά βαρέλια 300L (Alliers, Chauffe Legere-Chauffe Moyen), με τις οινολάσπες για δύο μήνες με 3 battonages την εβδομάδα, και συνέχιση της παλαίωσης για ακόμη 24 μήνες.",
    foodPairings: ["Μοσχάρι ψητό ή μαγειρευτό με πλούσιες σάλτσες"],
    varieties: [{ varietyId: cabernetSauvignon.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "rossiu-di-munte-vlachiko",
    name: "Rossiu di Munte Βλάχικο",
    regionId: ioannina.id,
    vintage: 2021,
    abv: null,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description: "100% Βλάχικο από αμπελώνες με περιορισμένη στρεμματική απόδοση στον νομό Ιωαννίνων — Προστατευόμενη Γεωγραφική Ένδειξη Ιωάννινα.",
    tastingNotes: "Διαυγές κόκκινο χρώμα με εντυπωσιακό αρωματικό μπουκέτο, όπου κυριαρχούν οι νότες φρεσκοτριμμένου πιπεριού. Καλή οξύτητα και στρογγυλές μαλακές τανίνες. Ελαφρύ και αρμονικό, με πιπεράτη επίγευση.",
    vineyardNotes: "Αμπελώνες με περιορισμένη στρεμματική απόδοση στον νομό Ιωαννίνων. Πολλές βροχές και χιόνια τον χειμώνα, καταιγίδες από το τέλος της άνοιξης και το καλοκαίρι, με μεγάλη διαφορά θερμοκρασίας ημέρας-νύχτας.",
    winemakingNotes: "Εκραγισμός, έκθλιψη και εκχύλιση έως το τέλος της ζύμωσης (27 ημέρες), με 2 εμβαπτισμούς του «καπέλου» την ημέρα. Ζύμωση στους 20-25°C. Παλαίωση σε δρύινα γαλλικά βαρέλια 300L (Nevers, Chauffe Moyen), με τις οινολάσπες για δύο μήνες, και συνέχιση της παλαίωσης για ακόμη 11 μήνες.",
    foodPairings: ["Πλούσια ψάρια", "Πιάτα με αλλαντικά", "Πιπεράτα τυριά"],
    varieties: [{ varietyId: vlachiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "rossiu-di-munte-pinot-noir",
    name: "Rossiu di Munte Pinot Noir",
    regionId: metsovo.id,
    vintage: 2021,
    abv: null,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: null,
    description: "100% Pinot Noir από αμπελώνα στη θέση Γινιέτς Μετσόβου, σε υψόμετρο 940μ, φυτεμένο το 2002.",
    tastingNotes: "Ρουμπινί χρώμα με βιολετί ανταύγειες. Φρουτώδης χαρακτήρας σε συνδυασμό με γήινες αρωματικές νότες, μπαχαρικά και τριαντάφυλλο. Πολύ καλή δομή και δροσερή οξύτητα.",
    vineyardNotes: "Γινιέτς Μετσόβου, σε υψόμετρο 940μ. Φυτεύτηκε το 2002, πυκνότητα φύτευσης 330 φυτά/στρέμμα, αμμοαργιλοπηλώδες έδαφος. Ηπειρωτικό κλίμα με πολλές βροχές και χιόνια τον χειμώνα, δροσερό καλοκαίρι με καταιγίδες.",
    winemakingNotes: "Εκραγισμός, έκθλιψη και εκχύλιση έως και μετά το τέλος της ζύμωσης (28 ημέρες συνολικά), με 2 εμβαπτισμούς του «καπέλου» την ημέρα. Ζύμωση στους 15-25°C. Παλαίωση σε δρύινα γαλλικά βαρέλια 300L (Nevers, Chauffe Legere), με τις οινολάσπες για δύο μήνες, και συνέχιση της παλαίωσης για ακόμη 24 μήνες.",
    foodPairings: ["Κυνήγι", "Αγριογούρουνο", "Σαλιγκάρια"],
    varieties: [{ varietyId: pinotNoir.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "flogero",
    name: "Φλογερό",
    regionId: metsovo.id,
    vintage: 2023,
    abv: null,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description: "100% Merlot από αμπελώνες στο Μέτσοβο Ηπείρου, με ελεγχόμενη στρεμματική απόδοση που δεν ξεπερνά τα 350kg/στρέμμα — Προστατευόμενη Γεωγραφική Ένδειξη Μέτσοβο.",
    tastingNotes: "Βαθύ κόκκινο χρώμα με βυσσινί ανταύγειες. Ελαφρύ άρωμα δρυός αρμονικά δεμένο με τα ποικιλιακά αρώματα και το χαρακτηριστικό άρωμα της αναγωγικής παλαίωσης.",
    vineyardNotes: "Αμπελώνες στο Μέτσοβο Ηπείρου, σε υψόμετρο 950-1050μ, σε επικλινές έδαφος αποσαθρωμένων σχιστών, δυσπρόσιτο στη μηχανική εξυπηρέτηση. Ελεγχόμενη στρεμματική απόδοση έως 350kg/στρέμμα. Ηπειρωτικό κλίμα με βροχές, παγωνιές και ισχυρές χιονοπτώσεις τον χειμώνα, δροσερό καλοκαίρι.",
    winemakingNotes: "Εκραγισμός και άμεσος εμβολιασμός του γλεύκους, με συνεχείς διαβροχές των στέμφυλων για περίπου 25 ημέρες. Θερμοκρασία ζύμωσης έως 30°C. Ωρίμανση τουλάχιστον 12 μήνες σε καινούργια δρύινα γαλλικά βαρέλια, και τουλάχιστον 6 μήνες στη φιάλη μετά την εμφιάλωση για αναγωγική παλαίωση.",
    foodPairings: ["Κρέατα σχάρας", "Κοκκινιστό μοσχάρι"],
    varieties: [{ varietyId: merlot.id, percentage: 100 }],
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
