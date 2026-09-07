// Gaia Wines — πλήρης κατάλογος 21 κρασιών (+ ενημέρωση του ήδη υπάρχοντος
// "Αγιωργίτικο της Γαίας"), με άδεια του οινοποιείου να χρησιμοποιήσουμε
// περιεχόμενο και φωτογραφίες από το gaiawines.gr. Στοιχεία αντλημένα
// απευθείας από τις επίσημες σελίδες κάθε κρασιού (gaiawines.gr/<slug>/)
// και, όπου σημειώνεται, από την ίδια την ετικέτα του μπουκαλιού.
// Vintage/ABV μένουν null εκτός αν αναγράφονται ρητά σε φωτογραφημένη
// ετικέτα — οι σελίδες προϊόντων του site δεν δίνουν εσοδεία/αλκοόλ.

import { Appellation, ContentStatus, WineColor, WineStyle } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "gaia-wines" } });
  const nemea = await prisma.region.findUniqueOrThrow({ where: { slug: "nemea" } });
  const santorini = await prisma.region.findUniqueOrThrow({ where: { slug: "santorini" } });

  const agiorgitiko = await prisma.variety.findUniqueOrThrow({ where: { slug: "agiorgitiko" } });
  const assyrtiko = await prisma.variety.findUniqueOrThrow({ where: { slug: "asyrtiko" } });
  const syrah = await prisma.variety.findUniqueOrThrow({ where: { slug: "syrah" } });
  const sauvignonBlanc = await prisma.variety.findUniqueOrThrow({ where: { slug: "sauvignon-blanc" } });
  const moschofilero = await prisma.variety.findUniqueOrThrow({ where: { slug: "moschofilero" } });
  const roditis = await prisma.variety.findUniqueOrThrow({ where: { slug: "roditis" } });
  const aidani = await prisma.variety.findUniqueOrThrow({ where: { slug: "aidani" } });
  const athiri = await prisma.variety.findUniqueOrThrow({ where: { slug: "athiri" } });

  const vertzami = await prisma.variety.upsert({
    where: { slug: "vertzami" },
    update: {},
    create: {
      name: "Βερτζαμί",
      slug: "vertzami",
      nameLatin: "Vertzami",
      type: "RED",
      originRegion: "Ήπειρος / Λευκάδα",
      description:
        "Ερυθρή ποικιλία με βαθύ χρώμα και υψηλή περιεκτικότητα σε τανίνες, παραδοσιακά καλλιεργούμενη στη Ζίτσα Ιωαννίνων και τη Λευκάδα. Συχνά χρησιμοποιείται σε blend για να προσδώσει χρώμα και δομή.",
    },
  });

  const NEMEA_SOIL =
    "Ο αμπελώνας βρίσκεται στους λόφους γύρω από το Κούτσι Νεμέας, σε αργιλοπηλώδες έδαφος πλούσιο σε ανθρακικό ασβέστιο με σχετικά ουδέτερο pH και μικρή περιεκτικότητα σε οργανική ουσία, χαρακτηριστικό των περισσότερων ασβεστολιθικών εδαφών της Ελλάδας. Στις πλαγιές των λόφων το έδαφος στραγγίζει καλά αλλά είναι εκτεθειμένο στη διάβρωση.";
  const SANTORINI_SOIL =
    "Ο αμπελώνας βρίσκεται στη Σαντορίνη, σε πορώδες ηφαιστειακό έδαφος από ελαφρόπετρα, εξαιρετικά φτωχό σε θρεπτικά συστατικά και χωρίς καθόλου οργανική ουσία — γι' αυτό και τα κλήματα παραμένουν αυτόριζα, ανεπηρέαστα από τη φυλλοξήρα. Η υγρασία συγκρατείται στο πορώδες έδαφος και τροφοδοτεί σταδιακά τα φυτά.";

  async function upsertWine(spec: {
    slug: string;
    name: string;
    vintage: number | null;
    abv: number | null;
    color: WineColor;
    style: WineStyle;
    appellation: Appellation | null;
    regionId: string;
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
        regionId: spec.regionId,
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

  console.log("Gaia Wines — 20 κρασιά + ενημέρωση Αγιωργίτικο της Γαίας…");

  // Ήδη υπάρχον στη βάση — απλώς προσθέτουμε label image (γίνεται στο upload script)
  await upsertWine({
    slug: "agiorgitiko-by-gaia",
    name: "Αγιωργίτικο της Γαίας",
    vintage: 2021,
    abv: 14,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: null,
    regionId: nemea.id,
    description:
      "Πρότυπο δείγμα Νεμέας: πλούσιο και δομημένο, ισορροπεί ανάμεσα στο φρούτο της ποικιλίας και το ξύλο της δρυός. Παλαιώνει έως 8 μήνες σε βαρέλι και ακόμη 6 μήνες στη φιάλη πριν κυκλοφορήσει.",
    tastingNotes:
      "Κομψό και δομημένο, με φασκόμηλο και φρεσκοτριμμένο μαύρο πιπέρι ανάμεσα στα κόκκινα μούρα, βελούδινες τανίνες σε μακρά επίγευση.",
    vineyardNotes: NEMEA_SOIL,
    winemakingNotes:
      "Μετά τον τρύγο τα σταφύλια αποβοστρυχώνονται, θρυμματίζονται και υφίστανται ψυχρή εκχύλιση για 2-3 ημέρες. Το κρασί παλαιώνει έως 8 μήνες σε δρύινα βαρέλια και ακολουθεί ανάπαυση 6 μηνών στη φιάλη πριν την κυκλοφορία.",
    servingTemp: "16-18 °C",
    foodPairings: ["Κόκκινα κρέατα", "Ελληνική κουζίνα"],
    varieties: [{ varietyId: agiorgitiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "gaia-thalassitis",
    name: "Θαλασσίτης",
    vintage: null,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PDO,
    regionId: santorini.id,
    description:
      "Παράγεται αποκλειστικά από Ασύρτικο των αυτόριζων αμπελώνων της Επισκοπής, του Ακρωτηρίου και του Πύργου, ηλικίας περίπου 80 ετών, με ιδιαίτερα χαμηλή στρεμματική απόδοση που σπάνια ξεπερνά τα 350 κιλά ανά στρέμμα. Αναδεικνύεται καλύτερα σε γεύματα με αλμυρές, ξινές ή λιπαρές γεύσεις.",
    tastingNotes:
      "Έντονη προσωπικότητα, γευστική διάρκεια και νεύρο. Παλαιώνοντας 2-3 χρόνια η μεταλλικότητά του υποχωρεί και αναδεικνύονται έντονα αρώματα φρούτων και μελιού.",
    vineyardNotes: SANTORINI_SOIL,
    winemakingNotes: null,
    servingTemp: null,
    foodPairings: [],
    varieties: [{ varietyId: assyrtiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "gaia-thalassitis-cellar-aged",
    name: "Θαλασσίτης Cellar Aged",
    vintage: null,
    abv: 13,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PDO,
    regionId: santorini.id,
    description:
      "Η παλαιωμένη εκδοχή του Θαλασσίτη, από τους ίδιους αυτόριζους αμπελώνες Επισκοπής, Ακρωτηρίου και Πύργου, ηλικίας περίπου 80 ετών. Με την παλαίωση αναδεικνύεται πιο εκφραστικός και πολύπλοκος, διατηρώντας υψηλή οξύτητα και φρεσκάδα.",
    tastingNotes: "Χρυσαφί χρώμα με τριτογενή αρωματικά και γευστικά χαρακτηριστικά, υψηλή οξύτητα και εντυπωσιακή φρεσκάδα.",
    vineyardNotes: SANTORINI_SOIL,
    winemakingNotes: "Παλαιώνει στο κελάρι του κτήματος για σειρά ετών πριν την κυκλοφορία του (13,0% vol σύμφωνα με φιαλισμένη ετικέτα).",
    servingTemp: null,
    foodPairings: [],
    varieties: [{ varietyId: assyrtiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "gaia-nychteri",
    name: "Νυχτέρι της Γαίας",
    vintage: null,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    regionId: santorini.id,
    description:
      "Η πατροπαράδοτη εκδοχή της Σαντορίνης, με νεοκοσμίτικο τουίστ — γεννήθηκε στην εσοδεία του 2019, όταν ο παλιός \"Θαλασσίτης βαρέλι\" μετονομάστηκε σε Νυχτέρι της Γαίας. Στη βάση του Ασύρτικου προστίθενται Αηδάνι και Αθήρι.",
    tastingNotes:
      "Η σπιρτάδα και η ορυκτότητα του Ασύρτικου κυριαρχούν, με αισθητές νότες βανίλιας και ινδοκάρυδου από το ξύλο, εναρμονισμένες με τα ποικιλιακά αρώματα. Κλασσικό νεύρο και αιχμηρή οξύτητα, σε συνδυασμό με στρογγυλάδα και λιπαρότητα.",
    vineyardNotes: SANTORINI_SOIL,
    winemakingNotes: "Ζύμωση και ωρίμανση σε βαρέλια διαφόρων ειδών, μεγεθών και χρήσεων.",
    servingTemp: null,
    foodPairings: [],
    varieties: [
      { varietyId: assyrtiko.id, percentage: null },
      { varietyId: aidani.id, percentage: null },
      { varietyId: athiri.id, percentage: null },
    ],
  });

  await upsertWine({
    slug: "gaia-ammonite",
    name: "Ammonite",
    vintage: null,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    regionId: santorini.id,
    description:
      "Δημιουργημένο εξ' ολοκλήρου από τον τρύγο ενός σπάνιου αιωνόβιου αμπελώνα της Σαντορίνης, το Ammonite δίνει στο Ασύρτικο τη συμπεριφορά ερυθρού κρασιού ως προς τη δυναμική παλαίωσης. Το όνομα εμπνέεται από το έμβλημα της εταιρείας, τον αμμωνίτη, ενώ η ανάγλυφη απεικόνιση στην ετικέτα αποτυπώνει την ακολουθία Fibonacci.",
    tastingNotes: "Μεγάλη δομή, εντυπωσιακό γευστικό μήκος και πολυπλοκότητα· ένα Ασύρτικο που συνεχίζει να βελτιώνεται με τον χρόνο.",
    vineyardNotes: SANTORINI_SOIL,
    winemakingNotes:
      "Ωριμάζει πάνω από 15 μήνες με τις βιολογικές του λάσπες, με μικρή ποσότητα του κρασιού να παραμένει για μήνες σε καινούργια δρύινα γαλλικά βαρέλια.",
    servingTemp: null,
    foodPairings: [],
    varieties: [{ varietyId: assyrtiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "gaia-asyrtiko-wild-ferment",
    name: "Ασύρτικο της Γαίας Wild Ferment",
    vintage: 2008,
    abv: 13.5,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PDO,
    regionId: santorini.id,
    description:
      "Το σταφύλι προέρχεται αποκλειστικά από τον ορεινό αμπελώνα του Πύργου — το αρωματικότερο Ασύρτικο του νησιού. Περνά από δωδεκάωρη προζυμωτική εκχύλιση στους 10°C και ζυμώνεται σε μικρές ψυχόμενες δεξαμενές inox και σε καινούργια βαρέλια γαλλικής/αμερικανικής δρυός και γαλλικής ακακίας, χωρίς παρέμβαση στη θερμοκρασία ζύμωσης.",
    tastingNotes: "Έχει 7-8 χρόνια δυναμικό παλαίωσης· όπως τα περισσότερα Ασύρτικα Σαντορίνης, συμπεριφέρεται σαν ερυθρό παρότι είναι λευκό.",
    vineyardNotes: SANTORINI_SOIL,
    winemakingNotes:
      "Δωδεκάωρη προζυμωτική εκχύλιση στους 10°C, ζύμωση με αυτόχθονες ζύμες σε δεξαμενές inox 1.000lt και καινούργια βαρέλια δρυός/ακακίας 225lt, με αργή αυθόρμητη αλκοολική ζύμωση.",
    servingTemp: null,
    foodPairings: [],
    varieties: [{ varietyId: assyrtiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "gaia-asyrtiko-clay",
    name: "Ασύρτικο Clay",
    vintage: null,
    abv: null,
    color: WineColor.ORANGE,
    style: WineStyle.DRY,
    appellation: null,
    regionId: santorini.id,
    description:
      "\"Orange\" κρασί από τη Σαντορίνη, φτιαγμένο με τις παραδοσιακές πρακτικές του παρελθόντος: υπεραιωνόβιοι αυτόριζοι αμπελώνες, ζύμωση και παλαίωση σε σύγχρονα πήλινα δοχεία — διάδοχους των αρχαίων αμφορέων — όπου η ποικιλία διαμορφώνει τον χαρακτήρα της αποκλειστικά με αυτόχθονες ζύμες.",
    tastingNotes:
      "Σκούρο βαθύ κεχριμπαρί χρώμα, έντονα αρώματα αποξηραμένων φρούτων, βανίλιας και κερήθρας. Υψηλό αλκοόλ, έντονη γεύση, εμφανείς τανίνες και ζωηρή οξύτητα.",
    vineyardNotes: SANTORINI_SOIL,
    winemakingNotes: "Ζύμωση και παλαίωση σε πήλινα δοχεία (διάδοχοι των αρχαίων αμφορέων), αποκλειστικά με αυτόχθονες ζύμες, χωρίς άλλη τεχνολογική παρέμβαση.",
    servingTemp: null,
    foodPairings: [],
    varieties: [{ varietyId: assyrtiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "gaia-vinsanto",
    name: "Vinsanto της Γαίας",
    vintage: null,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.SWEET,
    appellation: null,
    regionId: santorini.id,
    description:
      "Ένα τμήμα των σταφυλιών αφυδατώνεται στον αυγουστιάτικο σαντορινιό ήλιο κι ένα άλλο στη σκιά, για να διατηρηθούν καλύτερα τα αρώματα. Μετά από περίπου δέκα μέρες, τα σταφύλια πιέζονται για έναν ιδιαίτερα συμπυκνωμένο μούστο — απόδοση που δεν ξεπερνά τα 80-100lt ανά στρέμμα αμπελώνα.",
    tastingNotes:
      "Σύνθετα και έντονα αρώματα καραμελωμένων και καβουρντισμένων φρούτων, με κυρίαρχες τις σταφίδες, τα βερίκοκα και τα σύκα. Γλυκιά, πολύπλοκη γεύση με εντυπωσιακή διάρκεια, νότες καφέ, περγαμόντου και ξερού σύκου, ισορροπημένη από καλή οξύτητα.",
    vineyardNotes: SANTORINI_SOIL,
    winemakingNotes:
      "Ο μούστος ζυμώνεται πολύ αργά σε παλιά δρύινα βαρέλια· η ζύμωση σταματά μόνη της λόγω των υψηλών σακχάρων, και το κρασί παλαιώνει στα ίδια βαρέλια για τουλάχιστον 10 έτη πριν εμφιαλωθεί χωρίς καμία κατεργασία ή φιλτράρισμα.",
    servingTemp: "6-8 °C",
    foodPairings: ["Μαύρη σοκολάτα"],
    varieties: [{ varietyId: assyrtiko.id, percentage: null }],
  });

  await upsertWine({
    slug: "gaia-ritinitis-nobilis",
    name: "Ρητινίτης Nobilis",
    vintage: null,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    regionId: nemea.id,
    description:
      "Ρετσίνα από επιλεγμένο Ροδίτη, από ξηρικούς αμπελώνες της ημιορεινής Κορινθίας με ιδιαίτερα χαμηλές στρεμματικές αποδόσεις (900 κιλά), με προσθήκη ελεγχόμενης ποσότητας ρετσινιού από πεύκα Pinus halepensis, σύμφωνα με τους κανόνες της σύγχρονης οινοποίησης.",
    tastingNotes:
      "Λευκοκίτρινο χρώμα με πράσινες ανταύγειες. Δροσερή γεύση που ισορροπεί ανάμεσα στο σταφύλι και το πεύκο, με λεμόνι και αίσθηση μαστίχας.",
    vineyardNotes: NEMEA_SOIL,
    winemakingNotes: "Προσθήκη ελεγχόμενης ποσότητας ρετσινιού από πεύκα Pinus halepensis κατά την οινοποίηση.",
    servingTemp: null,
    foodPairings: [],
    varieties: [{ varietyId: roditis.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "gaia-ktima-gaias",
    name: "Κτήμα Γαίας",
    vintage: 2017,
    abv: null,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: null,
    regionId: nemea.id,
    description:
      "Η βάση του Κτήμα Γαίας βρίσκεται στον τρόπο διαχείρισης του αμπελώνα στο Κούτσι — στόχος η συμπύκνωση όλων των ουσιών σε πολύ μικρό αριθμό σταφυλιών. Πολύ μακρά μεταζυμωτική εκχύλιση, ωρίμανση τουλάχιστον 12 μηνών σε καινούργια δρύινα γαλλικά βαρέλια 225lt, και εμφιάλωση χωρίς καμία κατεργασία.",
    tastingNotes:
      "Βαθύ ερυθροϊώδες χρώμα, αρώματα μεγάλης έντασης και πολυπλοκότητας με φρούτο, ξύλο, βανίλια και γαρύφαλλο. Λιπαρότητα, όγκος, δομή και μεγάλη γευστική διάρκεια. Δυναμικό παλαίωσης εικοσαετίας.",
    vineyardNotes: NEMEA_SOIL,
    winemakingNotes:
      "Πολύ μακρά μεταζυμωτική εκχύλιση, ωρίμανση τουλάχιστον 12 μηνών σε καινούργια δρύινα γαλλικά βαρέλια 225lt, εμφιάλωση χωρίς καμία κατεργασία.",
    servingTemp: null,
    foodPairings: [],
    varieties: [{ varietyId: agiorgitiko.id, percentage: null }],
  });

  await upsertWine({
    slug: "gaia-optimus",
    name: "Optimus",
    vintage: null,
    abv: null,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: null,
    regionId: nemea.id,
    description:
      "Agiorgitiko-Vertzami από αμπελοτόπι μεμονωμένου αμπελώνα (single vineyard) ηλικίας 8 ετών, στην ημιορεινή κοινότητα Κουτσίου Νεμέας, σε υψόμετρο 450-550m με έντονη κλίση περίπου 15% και κατεύθυνση Ν-Ν.Δ. Ο αμπελώνας κλαδεύεται ιδιαίτερα αυστηρά ώστε να μειώνεται το καρποφόρο φορτίο του.",
    tastingNotes: null,
    vineyardNotes:
      "Αμπελοτόπι ηλικίας 8 ετών, στην ημιορεινή κοινότητα Κουτσίου Νεμέας, σε υψόμετρο 450-550m με έντονη κλίση περίπου 15% και κατεύθυνση Ν-Ν.Δ. Κλαδεύεται ιδιαίτερα αυστηρά ώστε να μειώνεται το καρποφόρο φορτίο του.",
    winemakingNotes: null,
    servingTemp: "16-18 °C",
    foodPairings: [],
    varieties: [
      { varietyId: agiorgitiko.id, percentage: null },
      { varietyId: vertzami.id, percentage: null },
    ],
  });

  await upsertWine({
    slug: "gaia-anatolikos",
    name: "Ανατολικός",
    vintage: null,
    abv: null,
    color: WineColor.RED,
    style: WineStyle.SWEET,
    appellation: null,
    regionId: nemea.id,
    description:
      "Γλυκό Αγιωργίτικο. Τα σταφύλια απλώνονται στον ήλιο του Οκτώβρη για να αφυδατωθούν σταδιακά επί 3-4 εβδομάδες, και το ημισταφιδιασμένο σταφύλι πιέζεται επί ώρες για μια πολύ μικρή ποσότητα συμπυκνωμένου μούστου.",
    tastingNotes: "Γλυκό κρασί με σοβαρό και σύνθετο χαρακτήρα μετά από παλαίωση. Υψηλό δυναμικό παλαίωσης.",
    vineyardNotes: NEMEA_SOIL,
    winemakingNotes:
      "Η ζύμωση ξεκινά αργά και σταματά μόνη της, οδηγώντας σε γλυκό κρασί. Παλαιώνει για τα επόμενα 5 χρόνια σε μικρά, παλιά, γαλλικά δρύινα βαρέλια.",
    servingTemp: null,
    foodPairings: ["Σοκολάτα"],
    varieties: [{ varietyId: agiorgitiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "gaia-4-6h",
    name: "4-6h Αγιωργίτικο",
    vintage: null,
    abv: null,
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    regionId: nemea.id,
    description:
      "Ροζέ από σταφύλια Αγιωργίτικου, με σύντομη επαφή με τα στέμφυλα (4-6 ώρες, απ' όπου και το όνομα). Ιδιαίτερα μεγάλο υψόμετρο αμπελώνα δίνει ανοιχτό τριανταφυλλί χρώμα και πρωτόγνωρη φρεσκάδα αρωμάτων και γεύσεων.",
    tastingNotes: "Ανοιχτό τριανταφυλλί χρώμα, φρέσκα αρώματα. Απολαμβάνεται σαν λευκό κρασί, μόνο του ή ως απεριτίφ.",
    vineyardNotes: NEMEA_SOIL,
    winemakingNotes: "Σύντομη επαφή με τα στέμφυλα (4-6 ώρες), από όπου προέρχεται και το όνομα του κρασιού.",
    servingTemp: null,
    foodPairings: [],
    varieties: [{ varietyId: agiorgitiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "gaia-s-red",
    name: "Γαία S Κόκκινο",
    vintage: null,
    abv: null,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    regionId: nemea.id,
    description: "Αγιωργίτικο 70% και Syrah 30% συνθέτουν ένα κρασί πληθωρικό, στιβαρό και γενναιόδωρο.",
    tastingNotes: "Αρώματα και γευστικά χαρακτηριστικά γήινα, ώριμων μαύρων φρούτων, μπαχαρικών, σοκολάτας και καπνού. Ογκώδες και βελούδινο.",
    vineyardNotes: NEMEA_SOIL,
    winemakingNotes:
      "Παλαίωση 12 μηνών σε γαλλικά και αμερικανικά βαρέλια 1ης και 2ης χρήσης. Εμφιάλωση χωρίς φιλτράρισμα και παλαίωση στη φιάλη για 5 μήνες.",
    servingTemp: null,
    foodPairings: [],
    varieties: [
      { varietyId: agiorgitiko.id, percentage: 70 },
      { varietyId: syrah.id, percentage: 30 },
    ],
  });

  await upsertWine({
    slug: "gaia-s-white",
    name: "Γαία S Λευκό",
    vintage: null,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    regionId: nemea.id,
    description: "Συνδυασμός Ασύρτικου και Sauvignon Blanc από επιλεγμένα αμπελοτόπια στις πλαγιές της ορεινής Νεμέας.",
    tastingNotes: "Αρώματα φυτικά, εσπεριδοειδών και λευκών πυρηνόκαρπων· γευστικά χαρακτηριστικά αχλαδιού, lychee και τροπικών φρούτων.",
    vineyardNotes: NEMEA_SOIL,
    winemakingNotes: "Προζυμωτική παραμονή με λάσπες σε θερμοκρασία κοντά στους 0°C, ζύμωση και ωρίμαση σε ανοξείδωτες δεξαμενές.",
    servingTemp: null,
    foodPairings: ["Θαλασσινά", "Ψάρι τηγανητό", "Ψάρι ψητό", "Ριζότο θαλασσινών", "Ζυμαρικά με λευκές σάλτσες", "Σαλάτες", "Λευκά κρέατα"],
    varieties: [
      { varietyId: assyrtiko.id, percentage: null },
      { varietyId: sauvignonBlanc.id, percentage: null },
    ],
  });

  await upsertWine({
    slug: "gaia-s-rose",
    name: "Γαία S Ροζέ",
    vintage: null,
    abv: null,
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    appellation: null,
    regionId: nemea.id,
    description: "Αγιωργίτικο και Syrah συμπληρώνουν το ένα το άλλο σε έναν κομψό και επιβλητικό συνδυασμό.",
    tastingNotes: "Αρώματα φράουλας, κερασιού και μάνγκο· γευστικά χαρακτηριστικά κερασιών και μούρων σε γεμάτο ταννικό στόμα.",
    vineyardNotes: NEMEA_SOIL,
    winemakingNotes: "Προζυμωτική παραμονή με λάσπες σε θερμοκρασία κοντά στους 0°C, ζύμωση και ωρίμαση σε ανοξείδωτες δεξαμενές.",
    servingTemp: null,
    foodPairings: ["Ζυμαρικά με θαλασσινά", "Λαδερά-Γεμιστά", "Ψάρι ψητό σχάρας", "Ψάρι τηγανητό", "Ψάρι ψητό φούρνου"],
    varieties: [
      { varietyId: agiorgitiko.id, percentage: null },
      { varietyId: syrah.id, percentage: null },
    ],
  });

  await upsertWine({
    slug: "gaia-monograph-asyrtiko",
    name: "Monograph Ασύρτικο",
    vintage: null,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    regionId: nemea.id,
    description:
      "Ασύρτικο καλλιεργημένο στα ημιορεινά ασβεστώδη εδάφη του Κουτσίου Νεμέας — ένα τελείως διαφορετικό Ασύρτικο από αυτό της Σαντορίνης, με οξύτητες δροσερές και έντονα αρώματα φρούτων, εσπεριδοειδών αλλά και πιο τροπικά, πληθωρικά στοιχεία.",
    tastingNotes: "Διατηρεί φρέσκο, ορυκτώδη χαρακτήρα με εντονότερα πρωτογενή αρώματα φρούτων και λιγότερο πυκνή δομή· νεανικό και δροσερό.",
    vineyardNotes: NEMEA_SOIL,
    winemakingNotes: null,
    servingTemp: null,
    foodPairings: [],
    varieties: [{ varietyId: assyrtiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "gaia-monograph-agiorgitiko",
    name: "Monograph Αγιωργίτικο",
    vintage: null,
    abv: null,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    regionId: nemea.id,
    description:
      "Αγιωργίτικο από τους λόφους γύρω από τη Νεμέα, σε ημιορεινό αμπελώνα στα 500m υψόμετρο, με στρεμματικές αποδόσεις που δεν ξεπερνούν τα 1.200 κιλά ανά στρέμμα.",
    tastingNotes:
      "Λαμπερό ερυθροϊώδες χρώμα, αρώματα μέσης έντασης με φραγκοστάφυλο, ρόδι και καραμέλα βουτύρου. Μαλακή, φρουτώδης γεύση με στρογγυλές τανίνες και μεσαία επίγευση.",
    vineyardNotes:
      "Ημιορεινός αμπελώνας στα 500m υψόμετρο γύρω από τη Νεμέα, με χαμηλές στρεμματικές αποδόσεις έως 1.200 κιλά ανά στρέμμα. " + NEMEA_SOIL,
    winemakingNotes: null,
    servingTemp: "10-12 °C",
    foodPairings: [],
    varieties: [{ varietyId: agiorgitiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "gaia-monograph-agiorgitiko-syrah",
    name: "Monograph Αγιωργίτικο Syrah",
    vintage: null,
    abv: null,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: null,
    regionId: nemea.id,
    description:
      "Συνδυασμός Αγιωργίτικου, που δίνει το έντονο φρούτο και τις μαλακές τανίνες, με το προσαρμοσμένο στο κλίμα της Νεμέας Syrah, που προσφέρει πλούσιο, πικάντικο χαρακτήρα, δομή και βάθος.",
    tastingNotes: "Βαθύ κοκκινοϊώδες χρώμα, σύνθετο άρωμα και γευστική ένταση. Νεανικό κρασί.",
    vineyardNotes: NEMEA_SOIL,
    winemakingNotes: null,
    servingTemp: "10-14 °C",
    foodPairings: [],
    varieties: [
      { varietyId: agiorgitiko.id, percentage: null },
      { varietyId: syrah.id, percentage: null },
    ],
  });

  await upsertWine({
    slug: "gaia-monograph-rose",
    name: "Monograph Ροζέ",
    vintage: null,
    abv: null,
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    regionId: nemea.id,
    description: "Ορεινό Αγιωργίτικο και εξίσου ορεινό Μοσχοφίλερο συνυπάρχουν αρμονικά, υπογράφοντας τον φρουτένιο, δροσερό χαρακτήρα του.",
    tastingNotes: "Ελκυστικό στο μάτι, αρωματικό στη μύτη, ζωηρό στο στόμα.",
    vineyardNotes: NEMEA_SOIL,
    winemakingNotes: null,
    servingTemp: "6-8 °C",
    foodPairings: ["Μακαρονάδα με σάλτσα ντομάτας"],
    varieties: [
      { varietyId: agiorgitiko.id, percentage: null },
      { varietyId: moschofilero.id, percentage: null },
    ],
  });

  await upsertWine({
    slug: "gaia-monograph-multi",
    name: "Monograph Multi",
    vintage: null,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    regionId: nemea.id,
    description:
      "Τρεις ελληνικές λευκές ποικιλίες ενώνουν τις δυνάμεις τους: ο Ροδίτης Αλεπού από την ορεινή Αιγιαλεία (1.000m υψόμετρο) και το Μοσχοφίλερο από το αρκαδικό οροπέδιο (700m υψόμετρο), παραδοσιακό δίδυμο της Πελοποννήσου, με προσθήκη του κοσμοπολίτικου πλέον Ασύρτικου, σαντορινιάς καταγωγής αλλά πελοποννησιακής ανατροφής, που προσφέρει δύναμη, διάρκεια και βάθος.",
    tastingNotes: null,
    vineyardNotes:
      "Ο Ροδίτης προέρχεται από την ορεινή Αιγιαλεία σε υψόμετρο 1.000m και το Μοσχοφίλερο από το αρκαδικό οροπέδιο σε υψόμετρο 700m. " + NEMEA_SOIL,
    winemakingNotes: null,
    servingTemp: null,
    foodPairings: [],
    varieties: [
      { varietyId: roditis.id, percentage: null },
      { varietyId: moschofilero.id, percentage: null },
      { varietyId: assyrtiko.id, percentage: null },
    ],
  });

  await upsertWine({
    slug: "gaia-monograph-moschofilero",
    name: "Monograph Μοσχοφίλερο",
    vintage: null,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    regionId: nemea.id,
    description:
      "Η δροσιά του αρκαδικού οροπεδίου, ψηλά στα 700 μέτρα υψόμετρο, κληροδοτεί στο Monograph Μοσχοφίλερο αρωματική ένταση και οξύτητα — ένα νεανικό, ευχάριστο κρασί.",
    tastingNotes: "Αρώματα τριαντάφυλλου κυριαρχούν από την πρώτη στιγμή, με «ορεινή» οξύτητα που προσφέρει ζωντάνια.",
    vineyardNotes: "Αμμοαργιλώδες έδαφος, τυπικό του οροπεδίου της Μαντινείας, στο χωριό Αγιωργίτικα, σε υψόμετρο 700m.",
    winemakingNotes: null,
    servingTemp: null,
    foodPairings: [],
    varieties: [{ varietyId: moschofilero.id, percentage: 100 }],
  });

  console.log("Έτοιμο: 22 εγγραφές (21 νέα/ενημερωμένα + Αγιωργίτικο της Γαίας).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
