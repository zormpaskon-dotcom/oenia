// Manousakis Winery (Nostos) — πλήρης κατάλογος. Πηγή: το πλήρες
// (αγγλόφωνο) περιεχόμενο των καρτών κρασιού που είναι ενσωματωμένο στο
// HTML της σελίδας https://www.manousakiswinery.com/products (Wix Pro
// Gallery — δεν είναι ορατό στο απευθείας rendered DOM, αλλά υπάρχει σε
// per-item JSON μέσα στη σελίδα), μεταφρασμένο στα ελληνικά. Vintage ανά
// κρασί από το όνομα αρχείου του επίσημου Technical Sheet PDF κάθε
// κρασιού (π.χ. "GRENACHE 19" = εσοδεία 2019) — πιο αξιόπιστη πηγή από
// την ίδια τη φωτογραφία μπουκαλιού, καθώς το ίδιο το site συχνά
// επαναχρησιμοποιεί παλαιότερη φωτογραφία ετικέτας (π.χ. Assyrtiko/
// Grenache) ενώ το τεχνικό φύλλο αναφέρεται στην τρέχουσα εσοδεία.
// Ενημερώνονται οι δύο υπάρχουσες εγγραφές (Nostos Red → Nostos Blend,
// Nostos Roussanne) και προστίθενται 14 νέα κρασιά.

import { Appellation, ContentStatus, VarietyType, WineColor, WineStyle } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "manousakis-winery" } });
  const chania = await prisma.region.findUniqueOrThrow({ where: { slug: "chania" } });

  await prisma.winery.update({
    where: { slug: "manousakis-winery" },
    data: {
      story: [
        "Η ιστορία του Manousakis Winery ξεκινά από τον Ted Manousakis, έναν Κρητικό που έφυγε για την Αμερική σε νεαρή ηλικία, αλλά δεν έπαψε ποτέ να αισθάνεται δεμένος με τον τόπο καταγωγής του.",
        "Το 1993 επέστρεψε στην Κρήτη και φύτεψε τους πρώτους αμπελώνες στον Βατόλακκο Χανίων, στους πρόποδες των Λευκών Ορέων, θέτοντας τις βάσεις για τη δημιουργία του οικογενειακού οινοποιείου.",
        "Με την επιστροφή της κόρης του Alexandra στην Κρήτη το 2007, η οικογενειακή προσπάθεια πέρασε στην επόμενη γενιά και το οινοποιείο εξελίχθηκε σημαντικά, διατηρώντας παράλληλα τον οικογενειακό του χαρακτήρα.",
        "Σήμερα, το Manousakis Winery καλλιεργεί τους αμπελώνες του με σεβασμό στη φύση και επικεντρώνεται στην ανάδειξη του κρητικού terroir μέσα από κρασιά που συνδυάζουν την παράδοση με μια σύγχρονη οινοποιητική προσέγγιση.",
      ].join("\n\n"),
    },
  });

  const syrah = await prisma.variety.findUniqueOrThrow({ where: { slug: "syrah" } });
  const grenache = await prisma.variety.findUniqueOrThrow({ where: { slug: "grenache" } });
  const mourvedre = await prisma.variety.findUniqueOrThrow({ where: { slug: "mourvedre" } });
  const roussanne = await prisma.variety.findUniqueOrThrow({ where: { slug: "roussanne" } });
  const assyrtiko = await prisma.variety.findUniqueOrThrow({ where: { slug: "asyrtiko" } });
  const vidiano = await prisma.variety.findUniqueOrThrow({ where: { slug: "vidiano" } });
  const moschatoSpinas = await prisma.variety.findUniqueOrThrow({ where: { slug: "moschato-spinas" } });
  const romeiko = await prisma.variety.upsert({
    where: { slug: "romeiko" },
    update: {},
    create: {
      name: "Ρωμέικο",
      slug: "romeiko",
      nameLatin: "Romeiko",
      type: VarietyType.WHITE,
      originRegion: "Χανιά, Κρήτη",
      description: "Γηγενής λευκή ποικιλία των Χανίων Κρήτης, ιστορικά συνδεδεμένη με την περιοχή.",
    },
  });

  // ── Ενημέρωση υπαρχόντων εγγραφών ──
  await prisma.wine.update({
    where: { slug: "manousakis-nostos-red" },
    data: {
      name: "Nostos Blend",
      vintage: 2019,
      tastingNotes:
        "Διάφανο, πολύ πυκνό χρώμα ρουμπινί με νεανικές μοβ αποχρώσεις. Πολλά πυκνά «δάκρυα» στο ποτήρι. Έντονη μύτη, πολύπλοκος χαρακτήρας με ώριμο μαύρο φρούτο σε άριστη ισορροπία με τη δρυ. Νότες δέρματος με φινέτσα και φρεσκάδα. Στόμα με όγκο και πυκνότητα από υψηλές αλλά ώριμες τανίνες, σε τέλεια ισορροπία με το πλούσιο αλκοόλ και την καλή οξύτητα. Σύνθετες γεύσεις που αντικατοπτρίζουν τα αρώματα. Μακρά επίγευση που αναδεικνύει τη φρεσκάδα διατηρώντας παράλληλα τον πλούτο του.",
      foodPairings: ["Ψητό μπούτι αρνιού", "Ψητά κόκκινα κρέατα", "Κατσαρόλας"],
    },
  });
  await prisma.varietyOnWine.deleteMany({ where: { wine: { slug: "manousakis-nostos-red" } } });
  {
    const w = await prisma.wine.findUniqueOrThrow({ where: { slug: "manousakis-nostos-red" } });
    await prisma.varietyOnWine.createMany({
      data: [
        { wineId: w.id, varietyId: syrah.id, percentage: null },
        { wineId: w.id, varietyId: grenache.id, percentage: null },
        { wineId: w.id, varietyId: mourvedre.id, percentage: null },
      ],
    });
  }

  await prisma.wine.update({
    where: { slug: "manousakis-nostos-roussanne" },
    data: {
      vintage: 2023,
    },
  });

  // ── Νέα κρασιά ──
  async function upsertWine(spec: {
    slug: string;
    name: string;
    vintage: number | null;
    abv: number | null;
    color: WineColor;
    style: WineStyle;
    appellation: Appellation | null;
    isSparkling?: boolean;
    description: string;
    tastingNotes: string;
    foodPairings: string[];
    varieties: Array<{ varietyId: string; percentage: number | null }>;
  }) {
    const wine = await prisma.wine.upsert({
      where: { slug: spec.slug },
      update: {
        name: spec.name,
        wineryId: winery.id,
        regionId: chania.id,
        vintage: spec.vintage,
        abv: spec.abv,
        color: spec.color,
        style: spec.style,
        appellation: spec.appellation,
        isSparkling: spec.isSparkling ?? false,
        description: spec.description,
        tastingNotes: spec.tastingNotes,
        foodPairings: spec.foodPairings,
        status: ContentStatus.PUBLISHED,
      },
      create: {
        slug: spec.slug,
        name: spec.name,
        wineryId: winery.id,
        regionId: chania.id,
        vintage: spec.vintage,
        abv: spec.abv,
        color: spec.color,
        style: spec.style,
        appellation: spec.appellation,
        isSparkling: spec.isSparkling ?? false,
        description: spec.description,
        tastingNotes: spec.tastingNotes,
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

  await upsertWine({
    slug: "manousakis-nostos-assyrtiko",
    name: "Nostos Assyrtiko",
    vintage: 2023,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    description: "100% Ασύρτικο, από τους αμπελώνες του κτήματος στο Βατόλακκο Χανίων.",
    tastingNotes: "Λαμπερό, μέτριο χρώμα λεμονί-πράσινο με πυκνά, αργά «δάκρυα». Μύτη μέτριας έως υψηλής έντασης, με ώριμο, σαρκώδες λευκό φρούτο, ορυκτά στοιχεία και εσπεριδοειδή. Πυκνό, γεμάτο στόμα με έντονη γεύση εσπεριδοειδών, ορυκτών και θαλασσινών κοχυλιών. Μακρά επίγευση.",
    foodPairings: ["Θαλασσινά σχάρας", "Μύδια στον ατμό", "Ωμό ψάρι"],
    varieties: [{ varietyId: assyrtiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "manousakis-nostos-vidiano",
    name: "Nostos Vidiano",
    vintage: 2023,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    description: "100% Βιδιανό, από τους αμπελώνες του κτήματος στο Βατόλακκο Χανίων.",
    tastingNotes: "Λαμπερό, έντονο χρώμα λεμονί-πράσινο με αργά, πλούσια «δάκρυα». Μύτη μέτριας έως υψηλής έντασης, με ώριμα πυρηνόκαρπα φρούτα, κηρήθρα και αποξηραμένα άνθη. Πυκνό, μέτριο έως πλήρες σώμα και σύνθετο στόμα με έντονη γεύση λευκού πυρηνόκαρπου φρούτου. Μακρά επίγευση που κυριαρχείται από ορυκτά στοιχεία, πυρηνόκαρπα φρούτα και εσπεριδοειδή.",
    foodPairings: ["Ελαφρύ ψάρι", "Πουλερικά με λευκές σάλτσες", "Θαλασσινά"],
    varieties: [{ varietyId: vidiano.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "manousakis-nostos-muscat-of-spina",
    name: "Nostos Muscat of Spina",
    vintage: 2023,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    description: "100% Μοσχάτο Σπίνας, από τους αμπελώνες του κτήματος στο Βατόλακκο Χανίων.",
    tastingNotes: "Λαμπερό, μέτριο έως ανοιχτό χρώμα λεμονί-πράσινο με αργά, πλούσια «δάκρυα». Έντονη μύτη με άγουρο λευκό άνθος, χορταστικές νότες και πυρηνόκαρπα φρούτα. Μέτριο σώμα και φρέσκο στόμα με έντονη γεύση λευκού πυρηνόκαρπου φρούτου. Μακρά επίγευση εσπεριδοειδών και χορταστικών νοτών.",
    foodPairings: ["Απεριτίφ", "Φρέσκες σαλάτες", "Ωμά θαλασσινά"],
    varieties: [{ varietyId: moschatoSpinas.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "manousakis-nostos-muscat-of-spina-orange",
    name: "Nostos Muscat of Spina Orange",
    vintage: 2023,
    abv: 16,
    color: WineColor.ORANGE,
    style: WineStyle.DRY,
    appellation: null,
    description: "100% Μοσχάτο Σπίνας, οινοποιημένο ως πορτοκαλί κρασί (με παρατεταμένη επαφή με τα στέμφυλα) — από pre-phylloxera αμπέλια, αφιλτράριστο.",
    tastingNotes: "Υψηλός αλκοολικός βαθμός 16%, με γλυκά αρώματα στη μύτη και τον ουρανίσκο και υψηλή οξύτητα — χαρακτηριστικά που του προσδίδουν μεγάλο δυναμικό παλαίωσης.",
    foodPairings: ["Πικάντικη ασιατική κουζίνα", "Ελαφριά τυριά", "Επιδόρπια με πυρηνόκαρπα φρούτα"],
    varieties: [{ varietyId: moschatoSpinas.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "manousakis-nostos-romeiko",
    name: "Nostos Romeiko",
    vintage: 2023,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    description: "100% Ρωμέικο, βιολογικής καλλιέργειας, από τους αμπελώνες του κτήματος στο Βατόλακκο Χανίων.",
    tastingNotes: "Λαμπερό, μέτριο χρώμα λεμονί-πράσινο με αργά, πλούσια «δάκρυα». Έντονη μύτη με άγουρο φραγκοστάφυλο, χορταστικές νότες και ίχνη μαρτζιπάν. Μέτριο σώμα και φρέσκο στόμα με έντονη γεύση λευκού πυρηνόκαρπου φρούτου. Μακρά επίγευση εσπεριδοειδών και χορταστικών νοτών.",
    foodPairings: ["Απεριτίφ", "Φρέσκες σαλάτες", "Ωμά θαλασσινά"],
    varieties: [{ varietyId: romeiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "manousakis-fumm",
    name: "fümm",
    vintage: 2023,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    description: "«Fantastic, Uber, Majestic, Masterpiece» — ξηρό λευκό κρασί του Manousakis Winery, χωρίς δηλωμένη ποικιλιακή σύνθεση από το ίδιο το κτήμα.",
    tastingNotes: "Λαμπερό, έντονο χρώμα λεμονί-πράσινο. Μύτη μέτριας έως υψηλής έντασης, ανθική αλλά και φρουτώδης (αχλάδι, λεμόνι). Μέτριο σώμα και ευχάριστο στόμα με αναζωογονητική οξύτητα και καλή επίγευση.",
    foodPairings: ["Απεριτίφ", "Φρέσκες σαλάτες", "Ωμά θαλασσινά"],
    varieties: [],
  });

  await upsertWine({
    slug: "manousakis-nostos-pink",
    name: "Nostos Pink",
    vintage: 2023,
    abv: null,
    color: WineColor.ROSE,
    style: WineStyle.OFF_DRY,
    appellation: Appellation.PGI,
    description: "Ροζέ κρασί — Προστατευόμενη Γεωγραφική Ένδειξη Χανιά.",
    tastingNotes: "Έντονο ροζ χρώμα. Έντονη μύτη με αρώματα καραμέλας φράουλας, γκρεναδίνης και τριαντάφυλλου. Μέτριο σώμα με απαλή οξύτητα και μια ελαφριά γλύκα στην επίγευση. Καταναλώνεται φρέσκο.",
    foodPairings: ["Φρέσκες σαλάτες", "Ψητά πράσινα λαχανικά", "Ζυμαρικά", "Πουλερικά με ελαφριές σάλτσες", "Θαλασσινά"],
    varieties: [],
  });

  await upsertWine({
    slug: "manousakis-hartman-molavi",
    name: "Hartman Molavi",
    vintage: null,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    isSparkling: true,
    description: "Αφρώδες κρασί μεθόδου Extra Brut, μη εσοδειακό (Non Vintage) — παραμονή 4 έτη στις οινολάσπες.",
    tastingNotes: "Σύνθετη μύτη, με ωραία καβουρδισμένα αρώματα από τα 4 χρόνια στις οινολάσπες, λεπτές νότες φρυγανισμένου ψωμιού και ξηρών καρπών. Νύξεις εσπεριδοειδών, περγαμόντου και αποξηραμένου μάνγκο. Φρέσκο και τραγανό στο στόμα, με ωραίες κρεμώδεις φυσαλίδες.",
    foodPairings: ["Λιπαρά αλμυρά τυριά (Γραβιέρα, Grana Padano, ώριμο cheddar)", "Τηγανητά (πατάτες, ψάρι)", "Μαριναρισμένα θαλασσινά (ceviche, ταρτάρ, στρείδια)"],
    varieties: [],
  });

  await upsertWine({
    slug: "manousakis-planet-romeiko",
    name: "Planet Romeiko",
    vintage: null,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.SWEET,
    appellation: Appellation.PGI,
    description: "«1st Edition» — γλυκό κρασί από λιασμένα σταφύλια Ρωμέικο, blend πέντε διαφορετικών εσοδειών — Προστατευόμενη Γεωγραφική Ένδειξη Χανιά.",
    tastingNotes: "Blend πέντε διαφορετικών εσοδειών, που του προσδίδει μοναδική πολυπλοκότητα. Υψηλής ποιότητας γλυκό κρασί, όπου η υψηλή οξύτητα και τα συμπυκνωμένα σάκχαρα βρίσκονται σε τέλεια ισορροπία. Τα σύνθετα αρώματα αποξηραμένων φρούτων και ξηρών καρπών εμπλουτίζονται από την παρατεταμένη παλαίωση σε δρύινα βαρέλια.",
    foodPairings: ["Μπακλαβά", "Cheesecake τύπου Βάσκων", "Παγωτό βανίλια (ως σιρόπι)"],
    varieties: [{ varietyId: romeiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "manousakis-nostos-grenache",
    name: "Nostos Grenache",
    vintage: 2019,
    abv: null,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description: "100% Grenache, βιολογικής καλλιέργειας — Προστατευόμενη Γεωγραφική Ένδειξη Χανιά.",
    tastingNotes: "Διάφανο, μεσαίο έως βαθύ χρώμα ρουμπινί με πλούσια, πυκνά «δάκρυα». Έντονη μύτη με αρώματα που αναδεικνύουν την ωριμότητα — χυμούς κόκκινων φρούτων, σοκολάτα και γλυκά μπαχαρικά, κυρίως βανίλια. Ξηρό στόμα με όγκο και βάθος. Ώριμες, απαλές τανίνες. Μακρά επίγευση με έντονη παρουσία ώριμων κόκκινων φρούτων.",
    foodPairings: ["Ψητά κρέατα", "Κρέατα με κόκκινες σάλτσες", "Ζυμαρικά με κρέας και ντομάτα"],
    varieties: [{ varietyId: grenache.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "manousakis-nostos-mourvedre",
    name: "Nostos Mourvèdre",
    vintage: 2020,
    abv: null,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: null,
    description: "100% Mourvèdre, βιολογικής καλλιέργειας — ετικέτα «Single Vineyard».",
    tastingNotes: "Διάφανο, σχεδόν αδιαφανές σκούρο μοβ χρώμα με σχεδόν στατικά «δάκρυα». Έντονα, πυκνά αρώματα μαύρου φρούτου, βιολέτας, καπνού και δέρματος. Ταυτόχρονα πολύ σύνθετο και νεανικό στον χαρακτήρα. Γεμάτο σώμα με έντονες τανίνες που απαλύνονται από τη ζεστασιά του αλκοόλ. Γεύσεις μαύρων μούρων, μαύρου πιπεριού και άγριων ορεινών βοτάνων. Εξαιρετικά μακρά επίγευση με φρεσκάδα αλλά και πλούτο ταυτόχρονα.",
    foodPairings: ["Κυνήγι", "Ψητά στα κάρβουνα κρέατα", "Μαγειρευτά κρέατα", "Πλούσια πιάτα γενικότερα"],
    varieties: [{ varietyId: mourvedre.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "manousakis-nostos-syrah",
    name: "Nostos Syrah",
    vintage: 2020,
    abv: null,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description: "100% Syrah, βιολογικής καλλιέργειας — Προστατευόμενη Γεωγραφική Ένδειξη Χανιά.",
    tastingNotes: "Διάφανο, σχεδόν αδιαφανές σκούρο μοβ χρώμα με σχεδόν στατικά «δάκρυα». Έντονα, πυκνά αρώματα μαύρου φρούτου, καπνού, μαύρου πιπεριού, μελανιού και καφέ. Ταυτόχρονα πολύ σύνθετο και νεανικό στον χαρακτήρα. Γεμάτο σώμα με έντονες τανίνες που απαλύνονται από το υψηλό αλκοόλ. Γεύσεις μαύρων μούρων, μαύρου πιπεριού και άγριων ορεινών βοτάνων. Εξαιρετικά μακρά επίγευση με φρεσκάδα αλλά και πλούτο ταυτόχρονα.",
    foodPairings: ["Κυνήγι", "Ψητά στα κάρβουνα κρέατα", "Μαγειρευτά κρέατα", "Κόκκινα κρέατα με πικάντικη σάλτσα"],
    varieties: [{ varietyId: syrah.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "manousakis-nostos-alexandras",
    name: "Nostos Alexandra's",
    vintage: 2019,
    abv: null,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: null,
    description: "Οργανικό, ξηρό ερυθρό κρασί, αφιερωμένο στην Alexandra Manousaki.",
    tastingNotes: "Διάφανο, με πυκνό χρώμα ρουμπινί και πλούσια «δάκρυα». Φρουτώδη αρώματα, ταυτόχρονα πυκνά και φρέσκα — φράουλα, μαύρο κεράσι, μούρο, με νότες καπνού και μπαχαρικών. Γεμάτο και ξηρό στόμα με απαλές τανίνες και πάλι φρέσκο φρούτο. Μακρά, καθαρή επίγευση που αναδεικνύει τα μπαχαρικά.",
    foodPairings: ["Ψητά κρέατα", "Μαγειρευτά"],
    varieties: [],
  });

  await upsertWine({
    slug: "manousakis-mrs",
    name: "MRS.",
    vintage: 2023,
    abv: 13.5,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: null,
    description: "Ξηρό ερυθρό κρασί, καθημερινή ετικέτα του Manousakis Winery, χωρίς δηλωμένη ποικιλιακή σύνθεση από το ίδιο το κτήμα.",
    tastingNotes: "Αρώματα μαύρων μούρων, cranberry και μια ελαφριά καρυδάτη νότα. Μέτριο σώμα με απαλή οξύτητα, στρογγυλές τανίνες και άφθονα ώριμα σκούρα μούρα με νότες βανίλιας. Καταναλώνεται φρέσκο.",
    foodPairings: ["Ψητά κόκκινα κρέατα", "Αργοψημένο αρνί ή κατσίκι", "Πιάτο αλλαντικών"],
    varieties: [],
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
