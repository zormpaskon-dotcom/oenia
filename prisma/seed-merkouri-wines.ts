// Κτήμα Μερκούρη — 10 νέες ετικέτες + διόρθωση του ήδη υπαρκτού "Κτήμα Μερκούρη
// Ερυθρός" (του έλειπε appellation, τώρα το βρίσκουμε στην ίδια πηγή).
// Πηγή: επίσημα τεχνικά δελτία (technical data sheets) από mercouri.gr, ένα
// PDF ανά ετικέτα (+ αντίστοιχη σελίδα HTML για το Καλλιστώ) — καμία επινόηση.
// Vintage αφήνεται σκόπιμα null σε όλα τα νέα κρασιά: τα δελτία δείχνουν
// συγκεκριμένο τρύγο (π.χ. 2012-2015) αλλά είναι templates που ενημερώνονται
// ανά χρόνο (βλ. ήδη υπαρκτό "ktima-merkouri-erythros", vintage=2022, ενώ το
// δικό του δελτίο έλεγε 2014) — δεν έχουμε επιβεβαίωση ποιος είναι ο
// τρέχων, σήμερα πωλούμενος τρύγος για τα υπόλοιπα 10.
//
// Κάθε ετικέτα αναφέρει τη δική της ΠΓΕ ζώνη (Λετρίνοι / Πισάτις / Ηλεία) —
// πιο συγκεκριμένη από το ήδη-ανατεθειμένο Region "Πάτρα" του οινοποιείου.
// Ίδιο μοτίβο με το Alpha Estate (PGI Φλώρινα σε wines μέσα στο Region
// "Αμύνταιο") — δεν δημιουργούμε νέο Region, η ζώνη μπαίνει στο vineyardNotes.
// Belvedere/Χόρταις: το δικό τους δελτίο ΔΕΝ αναφέρει καθόλου ΠΓΕ/ΠΟΠ ζώνη
// (μοναδική διαφορά από όλα τα άλλα) — appellation μένει null, όχι μάντεμα.
import { PrismaClient, Appellation, ContentStatus, WineColor, WineStyle, VarietyType } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "ktima-merkouri" } });
  const region = await prisma.region.findUniqueOrThrow({ where: { slug: "patra" } });

  // ── Νέες ποικιλίες που δεν υπήρχαν ήδη ──────────────────────────────
  const negroamaro = await prisma.variety.upsert({
    where: { name: "Negroamaro" },
    update: {},
    create: { name: "Negroamaro", slug: "negroamaro", nameLatin: "Negroamaro", type: VarietyType.RED, originRegion: "Ιταλία (Απουλία)" },
  });
  const malvasiaAromatica = await prisma.variety.upsert({
    where: { name: "Malvasia Aromatica" },
    update: {},
    create: { name: "Malvasia Aromatica", slug: "malvasia-aromatica", nameLatin: "Malvasia Aromatica", type: VarietyType.WHITE },
  });
  const korinthiakiStafida = await prisma.variety.upsert({
    where: { name: "Κορινθιακή Σταφίδα" },
    update: {},
    create: { name: "Κορινθιακή Σταφίδα", slug: "korinthiaki-stafida", nameLatin: "Corinthian Currant", type: VarietyType.RED, originRegion: "Ελλάδα (Κόρινθος/Αιγιάλεια)" },
  });

  const [refosco, mavrodafni, roditis, aygoystiatis, viognier, agiorgitiko, syrah, asyrtiko, robola] = await Promise.all(
    ["refosco", "mavrodafni", "roditis", "aygoystiatis", "viognier", "agiorgitiko", "syrah", "asyrtiko", "robola"].map((slug) =>
      prisma.variety.findUniqueOrThrow({ where: { slug } })
    )
  );

  async function upsertWine(spec: {
    slug: string;
    name: string;
    color: WineColor;
    style: WineStyle;
    appellation: Appellation | null;
    abv: number | null;
    description: string;
    tastingNotes: string;
    servingTemp: string | null;
    foodPairings: string[];
    vineyardNotes: string;
    winemakingNotes: string;
    varieties: Array<{ varietyId: string; percentage: number | null }>;
  }) {
    const wine = await prisma.wine.upsert({
      where: { slug: spec.slug },
      update: {},
      create: {
        slug: spec.slug,
        name: spec.name,
        wineryId: winery.id,
        regionId: region.id,
        color: spec.color,
        style: spec.style,
        appellation: spec.appellation,
        abv: spec.abv,
        description: spec.description,
        tastingNotes: spec.tastingNotes,
        servingTemp: spec.servingTemp,
        foodPairings: spec.foodPairings,
        vineyardNotes: spec.vineyardNotes,
        winemakingNotes: spec.winemakingNotes,
        status: ContentStatus.PUBLISHED,
      },
    });
    for (const v of spec.varieties) {
      await prisma.varietyOnWine.upsert({
        where: { wineId_varietyId: { wineId: wine.id, varietyId: v.varietyId } },
        update: {},
        create: { wineId: wine.id, varietyId: v.varietyId, percentage: v.percentage },
      });
    }
    console.log(`✓ ${spec.slug}`);
    return wine;
  }

  await upsertWine({
    slug: "ktima-merkouri-refosco",
    name: "Refosco (Κλώνος Μερκούρη)",
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    abv: 13.0,
    description: "Μονοποικιλιακό Refosco από τον αυτόριζο ιστορικό αμπελώνα του κτήματος, φυτεμένο το 1870 — το σπάνιο κλωνικό υλικό «Μερκούρη» που έφτασε στην Ελλάδα από το Φριούλι της Ιταλίας λίγα χρόνια μετά την ίδρυση του κτήματος.",
    tastingNotes: "Βαθύ πορφυρό χρώμα. Έντονο φρουτώδες άρωμα με νότες ώριμου βύσσινου και βανίλιας. Πλούσια γεύση και μαλακό τελείωμα.",
    servingTemp: null,
    foodPairings: ["Ψητά κόκκινα κρέατα", "Ψητά λευκά κρέατα", "Κυνήγι", "Πουλερικά", "Σκληρά τυριά"],
    vineyardNotes: "Ο αυτόριζος ιστορικός αμπελώνας (5,0 στρέμματα, έτος φύτευσης 1870) του Κτήματος Μερκούρη στο Κορακοχώρι Ηλείας, Δυτική Πελοπόννησος. Προστατευόμενη Γεωγραφική Ένδειξη «Λετρίνοι».",
    winemakingNotes: "Κλασική ερυθρή οινοποίηση με επιλεγμένες ζύμες και έλεγχο θερμοκρασίας. Παλαίωση 12 μήνες σε γαλλικά δρύινα βαρέλια. Δυνατότητα παλαίωσης 4-6 χρόνια.",
    varieties: [{ varietyId: refosco.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "ktima-merkouri-daphne-nera",
    name: "Daphne Nera",
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    abv: 13.0,
    description: "Μονοποικιλιακή Μαυροδάφνη από επιλεγμένο αμπελοτεμάχιο του κτήματος, οινοποιημένη ξηρή αντί για τη συνηθισμένη γλυκιά εκδοχή της ποικιλίας.",
    tastingNotes: "Λαμπερό πορφυρό χρώμα. Έντονα αρώματα πράσινου πιπεριού, καπνού και δέρματος.",
    servingTemp: null,
    foodPairings: ["Ψητά κόκκινα κρέατα", "Ψητά λευκά κρέατα", "Κυνήγι", "Πουλερικά", "Σκληρά τυριά"],
    vineyardNotes: "Επιλεγμένο αμπελοτεμάχιο του Κτήματος Μερκούρη στο Κορακοχώρι Ηλείας, Δυτική Πελοπόννησος. Προστατευόμενη Γεωγραφική Ένδειξη «Λετρίνοι».",
    winemakingNotes: "Κλασική ερυθρή οινοποίηση με επιλεγμένες ζύμες και έλεγχο θερμοκρασίας. Παλαίωση 12 μήνες σε γαλλικά δρύινα βαρέλια. Δυνατότητα παλαίωσης 5-8 χρόνια.",
    varieties: [{ varietyId: mavrodafni.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "ktima-merkouri-foloi",
    name: "Φολόη",
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    abv: 13.0,
    description: "Λευκό κρασί από κόκκινο ορεινό κλώνο Ροδίτη, από αμπελώνες της Ορεινής Ηλείας στους πρόποδες του Όρους Φολόη.",
    tastingNotes: "Κρυστάλλινο κιτρινοπράσινο χρώμα. Ευδιάκριτα αρώματα ανθών εσπεριδοειδών, πράσινου μήλου και λευκόσαρκου ροδάκινου.",
    servingTemp: "10-12 °C",
    foodPairings: ["Οστρακοειδή", "Ψάρια", "Λευκά κρέατα", "Κρέατα με γλυκές ή λευκές σάλτσες", "Ζυμαρικά", "Τυριά", "Φρούτα"],
    vineyardNotes: "Επιλεγμένοι αμπελώνες της Ορεινής Ηλείας (περιοχή Όρους Φολόη) σε υψόμετρο 450-650 m. Προστατευόμενη Γεωγραφική Ένδειξη «Πισάτις».",
    winemakingNotes: "Λευκή οινοποίηση σε χαμηλές θερμοκρασίες, με επιλεγμένες ζύμες.",
    varieties: [{ varietyId: roditis.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "ktima-merkouri-foloi-fume",
    name: "Φολόη Fumé",
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    abv: 13.5,
    description: "Η βαρελιασμένη εκδοχή του Φολόη — Ροδίτης από τους ίδιους ορεινούς αμπελώνες, με ζύμωση σε καινούργια γαλλικά δρύινα βαρέλια τύπου Allier.",
    tastingNotes: "Κρυστάλλινο κιτρινοπράσινο χρώμα. Ευδιάκριτα αρώματα ροδάκινου, ανανά και πεπονιού, αρμονικά δεμένα με αρώματα ξύλου από τη ζύμωση μαζί με τις λεπτές λάσπες.",
    servingTemp: "10-12 °C",
    foodPairings: ["Οστρακοειδή", "Ψάρια", "Λευκά κρέατα", "Κρέατα με γλυκές ή λευκές σάλτσες", "Ζυμαρικά", "Τυριά", "Φρούτα"],
    vineyardNotes: "Επιλεγμένοι αμπελώνες της Ορεινής Ηλείας (περιοχή Όρους Φολόη) σε υψόμετρο 450-650 m. Προστατευόμενη Γεωγραφική Ένδειξη «Πισάτις».",
    winemakingNotes: "Λευκή οινοποίηση σε χαμηλές θερμοκρασίες με επιλεγμένες ζύμες, ζύμωση σε καινούργια γαλλικά δρύινα βαρέλια τύπου Allier. Παλαίωση 6 μήνες σε καινούργια γαλλικά βαρέλια. Δυνατότητα παλαίωσης 1-2 χρόνια.",
    varieties: [{ varietyId: roditis.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "ktima-merkouri-avgoustiatis",
    name: "Αυγουστιάτης",
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    abv: 13.0,
    description: "Μονοποικιλιακός Αυγουστιάτης, σπάνια αυτόχθονη ερυθρή ποικιλία της Δυτικής Πελοποννήσου, από τους αμπελώνες του κτήματος.",
    tastingNotes: "Βαθύ κόκκινο χρώμα με βυσσινί ανταύγειες. Αρώματα κόκκινων φρούτων με νότες κακάο και ώριμου καρυδιού, με βύσσινο να κυριαρχεί στην επίγευση.",
    servingTemp: null,
    foodPairings: ["Ψητά κόκκινα κρέατα", "Ψητά λευκά κρέατα", "Εντράδες", "Πουλερικά", "Σκληρά τυριά"],
    vineyardNotes: "Αμπελώνες του Κτήματος Μερκούρη στο Κορακοχώρι Ηλείας, Δυτική Πελοπόννησος. Προστατευόμενη Γεωγραφική Ένδειξη «Ηλεία».",
    winemakingNotes: "Κλασική ερυθρή οινοποίηση με επιλεγμένες ζύμες και έλεγχο θερμοκρασίας. Παλαίωση 12 μήνες σε γαλλικά δρύινα βαρέλια. Δυνατότητα παλαίωσης 4-6 χρόνια.",
    varieties: [{ varietyId: aygoystiatis.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "ktima-merkouri-komi-tis-verenikis",
    name: "Κόμη της Βερενίκης",
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    abv: 13.5,
    description: "Μονοποικιλιακό Viognier από τους ιδιόκτητους αμπελώνες του κτήματος, οινοποιημένο σε καινούργια βαρέλια Berthomieu.",
    tastingNotes: "Κρυστάλλινο ανοικτό χρυσοκίτρινο χρώμα. Αρώματα ροδάκινου και ψωμιού με φόντο βανίλιας. Πλούσια γεύση και επίγευση στιβαρή που διαρκεί.",
    servingTemp: "12-14 °C",
    foodPairings: ["Ψάρια", "Θαλασσινά", "Λευκά κρέατα", "Ερυθρά κρέατα με γλυκές ή λευκές σάλτσες", "Τυριά"],
    vineyardNotes: "Οι ιδιόκτητοι αμπελώνες του Κτήματος Μερκούρη στο Κορακοχώρι Ηλείας, Δυτική Πελοπόννησος. Προστατευόμενη Γεωγραφική Ένδειξη «Ηλεία».",
    winemakingNotes: "Λευκή οινοποίηση σε καινούργια βαρέλια Berthomieu. Παλαίωση 3 μήνες σε καινούργια γαλλικά βαρέλια. Δυνατότητα παλαίωσης 1-2 χρόνια.",
    varieties: [{ varietyId: viognier.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "ktima-merkouri-lampadias",
    name: "Λαμπαδίας",
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    abv: 12.5,
    description: "Ροζέ κρασί από χαρμάνι Αγιωργίτικου, Syrah και Negroamaro, με ψυχρή εκχύλιση για ζωντάνια και φρεσκάδα.",
    tastingNotes: "Λαμπερό χρώμα τριαντάφυλλου. Διακριτικά αρώματα ποικιλίας με αρώματα κερασιού και ροδόνερου.",
    servingTemp: "10-12 °C",
    foodPairings: ["Λευκά κρέατα", "Πουλερικά", "Ψητά ψάρια", "Σαλάτες", "Ελαφριά τυριά"],
    vineyardNotes: "Οι ιδιόκτητοι αμπελώνες του Κτήματος Μερκούρη στο Κορακοχώρι Ηλείας, Δυτική Πελοπόννησος. Προστατευόμενη Γεωγραφική Ένδειξη «Ηλεία».",
    winemakingNotes: "Ψυχρή εκχύλιση και ζύμωση σε χαμηλή θερμοκρασία, με επιλεγμένες ζύμες. Δυνατότητα παλαίωσης 1-2 χρόνια. Το ακριβές ποσοστό ανά ποικιλία στο χαρμάνι δεν δημοσιεύεται.",
    varieties: [
      { varietyId: agiorgitiko.id, percentage: null },
      { varietyId: syrah.id, percentage: null },
      { varietyId: negroamaro.id, percentage: null },
    ],
  });

  await upsertWine({
    slug: "ktima-merkouri-hortais",
    name: "Χόρταις",
    color: WineColor.RED,
    style: WineStyle.SWEET,
    appellation: null,
    abv: 15.0,
    description: "Παλαιωμένο γλυκό ερυθρό κρασί από λιασμένα σταφύλια Μαυροδάφνης και Κορινθιακής σταφίδας, με μακρόχρονη παλαίωση σε βαρέλι και φιάλη.",
    tastingNotes: "Λαμπρό ρουμπινί χρώμα με σημάδια εξέλιξης. Κυριαρχούν αρώματα σοκολάτας, δαμάσκηνου και καραμέλας. Γεύση πλούσια και βελούδινη, σαρκώδης και αρμονική, με φινετσάτες τανίνες και μακρά επίγευση φουντουκιού και σοκολάτας.",
    servingTemp: null,
    foodPairings: ["Φρούτα με σοκολάτα", "Ξηροί καρποί", "Κέικ σοκολάτας", "Τυριά τύπου Roquefort"],
    vineyardNotes: "Οι ιδιόκτητοι αμπελώνες του Κτήματος Μερκούρη στο Κορακοχώρι Ηλείας, Δυτική Πελοπόννησος, και επιλεγμένες σταφιδάμπελοι της ορεινής Αιγιάλειας. Δεν αναγράφεται ΠΓΕ/ΠΟΠ ζώνη στο επίσημο τεχνικό δελτίο.",
    winemakingNotes: "Τα σταφύλια λιάζονται περίπου δέκα ημέρες, ακολουθεί έκθλιψη και ζύμωση που διακόπτεται με προσθήκη αλκοόλης. Παλαίωση 5 χρόνια σε δρύινα γαλλικά βαρέλια. Δυνατότητα παλαίωσης τουλάχιστον 15 χρόνια.",
    varieties: [
      { varietyId: mavrodafni.id, percentage: 55 },
      { varietyId: korinthiakiStafida.id, percentage: 45 },
    ],
  });

  await upsertWine({
    slug: "ktima-merkouri-belvedere",
    name: "Belvedere",
    color: WineColor.WHITE,
    style: WineStyle.SWEET,
    appellation: null,
    abv: 13.5,
    description: "Φυσικώς γλυκός λευκός οίνος από λιασμένα σταφύλια Malvasia Aromatica, παλαιωμένος σε καινούργια γαλλικά βαρέλια Vosges.",
    tastingNotes: "Χρυσόξανθο χρώμα με πορτοκαλί ανταύγειες. Πληθωρική παρουσία ποικιλιακών αρωμάτων περγαμόντο και φλούδας πορτοκαλιού, με έντονα αρώματα μελιού.",
    servingTemp: "8-10 °C",
    foodPairings: ["Επιδόρπιο κρασί"],
    vineyardNotes: "Οι ιδιόκτητοι αμπελώνες του Κτήματος Μερκούρη στο Κορακοχώρι Ηλείας, Δυτική Πελοπόννησος. Δεν αναγράφεται ΠΓΕ/ΠΟΠ ζώνη στο επίσημο τεχνικό δελτίο.",
    winemakingNotes: "Τα σταφύλια λιάζονται 5-8 ημέρες μετά τον τρύγο. Αλκοολική ζύμωση με έλεγχο θερμοκρασίας, διακοπή με ψύξη. Παλαίωση 12 μήνες σε καινούργια γαλλικά δρύινα βαρέλια Vosges (Berthomieu). Έτοιμο για κατανάλωση, δυνατότητα παλαίωσης τουλάχιστον 4-5 χρόνια.",
    varieties: [{ varietyId: malvasiaAromatica.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "ktima-merkouri-kallisto",
    name: "Καλλιστώ",
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    abv: 12.5,
    description: "Λευκό κρασί από χαρμάνι Ασύρτικου και Ρομπόλας, από τους ιδιόκτητους αμπελώνες του κτήματος.",
    tastingNotes: "Λαμπερό χρώμα με ελαφρώς κίτρινες αποχρώσεις. Αρώματα εσπεριδοειδών (κίτρου και φρέσκου λεμονιού). Γεύση ζεστή και ισορροπημένη, με νότες αχλαδιού στην επίγευση.",
    servingTemp: "10-12 °C",
    foodPairings: ["Οστρακοειδή", "Ψάρια", "Λευκά κρέατα", "Ερυθρά κρέατα με γλυκές ή λευκές σάλτσες", "Τυριά", "Φρούτα"],
    vineyardNotes: "Οι ιδιόκτητοι αμπελώνες του Κτήματος Μερκούρη στο Κορακοχώρι Ηλείας, Δυτική Πελοπόννησος. Προστατευόμενη Γεωγραφική Ένδειξη «Ηλεία».",
    winemakingNotes: "Λευκή οινοποίηση σε χαμηλές θερμοκρασίες, με επιλεγμένες ζύμες. Δυνατότητα παλαίωσης 1 χρόνο. Το ακριβές ποσοστό ανά ποικιλία στο χαρμάνι δεν δημοσιεύεται.",
    varieties: [
      { varietyId: asyrtiko.id, percentage: null },
      { varietyId: robola.id, percentage: null },
    ],
  });

  // Διόρθωση: το ήδη υπαρκτό "Κτήμα Μερκούρη Ερυθρός" δεν είχε appellation —
  // το ίδιο τεχνικό δελτίο (KTIMA_technical_data.pdf) δηλώνει ρητά ΠΓΕ «Λετρίνοι».
  await prisma.wine.update({
    where: { slug: "ktima-merkouri-erythros" },
    data: { appellation: Appellation.PGI },
  });
  console.log("✓ ktima-merkouri-erythros: appellation null → PGI (ίδια πηγή, «Λετρίνοι»)");

  console.log("\nDone.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
