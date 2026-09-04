// Batch 9/9 (τελευταία) από τη λίστα ~88 οινοποιείων. Ίδια δομή ανά
// κρασί με τα προηγούμενα batches — πηγές σε σχόλιο ανά εγγραφή.
//
// Batch 9: Lafazanis Winery, Kokotos Estate, Strataridakis Winery,
// Akriotou Microwinery, Greek Wine Cellars (Κουρτάκης), Mikro Ktima
// Titou. Μόλις 6 οινοποιεία — η λίστα των 88 ολοκληρώνεται εδώ.

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
  const nemea = await prisma.region.findUniqueOrThrow({ where: { slug: "nemea" } });
  const attiki = await prisma.region.findUniqueOrThrow({ where: { slug: "attiki" } });
  const kriti = await prisma.region.findUniqueOrThrow({ where: { slug: "kriti" } });
  const voiotia = await prisma.region.findUniqueOrThrow({ where: { slug: "voiotia" } });
  const goumenissa = await prisma.region.findUniqueOrThrow({ where: { slug: "goumenissa" } });

  console.log("Νέα ποικιλία…");
  const moschatoSpinas = await ensureVariety("Μοσχάτο Σπίνας", VarietyType.WHITE, {
    originRegion: "Καστελιανά Ηρακλείου, Κρήτη",
    description: "Σπάνια, εξαιρετικά αρωματική λευκή ποικιλία της περιοχής των Αστερουσίων στην Κρήτη, μοσχατογενής — καλλιεργείται σχεδόν αποκλειστικά από το Strataridakis Winery.",
    characteristics: "Έντονα αρώματα ροδάκινου, βερίκοκου, λίτσι και γιασεμιού, απαλή γλυκύτητα, μακρά αρωματική επίγευση.",
    acidity: 45,
    body: 50,
    tannins: 0,
  });

  const agiorgitiko = await prisma.variety.findUniqueOrThrow({ where: { name: "Αγιωργίτικο" } });
  const cabernetSauvignon = await prisma.variety.findUniqueOrThrow({ where: { name: "Cabernet Sauvignon" } });
  const merlot = await prisma.variety.findUniqueOrThrow({ where: { name: "Merlot" } });
  const savatiano = await prisma.variety.findUniqueOrThrow({ where: { name: "Σαββατιανό" } });
  const xinomavro = await prisma.variety.findUniqueOrThrow({ where: { name: "Ξινόμαυρο" } });
  const negoska = await prisma.variety.findUniqueOrThrow({ where: { name: "Νεγκόσκα" } });

  console.log("Οινοποιεία + κρασιά…");

  // ── Lafazanis Winery — Αρχαίες Κλεωνές, Νεμέα ── πηγές: lafazanis.gr, cellartracker.com
  const lafazanis = await prisma.winery.upsert({
    where: { slug: "lafazanis-winery" },
    update: {},
    create: {
      slug: "lafazanis-winery",
      name: "Lafazanis Winery",
      regionId: nemea.id,
      foundedYear: 1965,
      websiteUrl: "https://lafazanis.gr",
      description:
        "Οικογενειακή ιστορία που ξεκινά το 1946, όταν ο Βασίλης Λαφαζάνης άρχισε να φτιάχνει κρασί στον Πειραιά· το πρώτο οινοποιείο στήθηκε γύρω στο 1965 στην Αττική. Το 1993 ο Σπύρος Λαφαζάνης, 2ης γενιάς οινολόγος, μετέφερε τη δραστηριότητα στις Αρχαίες Κλεωνές της Νεμέας, την περιοχή που είχε αγαπήσει από τα πρώτα βήματα της καριέρας του. Σήμερα την 3η γενιά συνεχίζουν η Αθηνά και ο Βασίλης Λαφαζάνης.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const lafazanisWine = await prisma.wine.upsert({
    where: { slug: "lafazanis-nemea-agiorgitiko" },
    update: {},
    create: {
      name: "Nemea",
      slug: "lafazanis-nemea-agiorgitiko",
      wineryId: lafazanis.id,
      regionId: nemea.id,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "100% Αγιωργίτικο από τις Αρχαίες Κλεωνές της Νεμέας.",
      tastingNotes: "Βαθύ κόκκινο χρώμα, σύνθετα αρώματα ώριμων κόκκινων φρούτων, βανίλιας και καπνού. Πλούσιο, καλά δομημένο στόμα με εξαιρετική οξύτητα και μακρά επίγευση.",
      servingTemp: "16-18 °C",
      foodPairings: ["Κόκκινα κρέατα", "Μαγειρευτά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: lafazanisWine.id, varietyId: agiorgitiko.id } },
    update: { percentage: 100 },
    create: { wineId: lafazanisWine.id, varietyId: agiorgitiko.id, percentage: 100 },
  });

  // ── Kokotos Estate — Σταμάτα, Αττική ── πηγές: capital.gr, maltbyandgreek.com, iefimerida.gr
  const kokotos = await prisma.winery.upsert({
    where: { slug: "kokotos-estate" },
    update: {},
    create: {
      slug: "kokotos-estate",
      name: "Kokotos Estate",
      regionId: attiki.id,
      foundedYear: 1980,
      websiteUrl: "https://kokotosestate.gr",
      description:
        "Ο Γιώργος Κοκοτός αγόρασε γη το 1975 στη Σταμάτα, στα 420μ στις βόρειες πλαγιές της Πεντέλης. Το 1980 ο ίδιος και η σύζυγός του Άννα φύτεψαν 7 εκτάρια με Cabernet Sauvignon, Merlot και Chardonnay, προσθέτοντας αργότερα Ασύρτικο, Gewürztraminer, Σαββατιανό, Ροδίτη και Αγιωργίτικο. Το φτωχό σε οργανική ύλη αλλά πλούσιο σε ιχνοστοιχεία έδαφος και το υψόμετρο καθόρισαν το ιδιαίτερο ύφος των κρασιών του κτήματος.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const kokotosWine = await prisma.wine.upsert({
    where: { slug: "kokotos-estate-cabernet-merlot" },
    update: {},
    create: {
      name: "Kokotos Estate",
      slug: "kokotos-estate-cabernet-merlot",
      wineryId: kokotos.id,
      regionId: attiki.id,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      description: "90% Cabernet Sauvignon, 10% Merlot — η ναυαρχίδα ετικέτα του κτήματος, με 28 μήνες παλαίωση σε γαλλική δρυ και τουλάχιστον 6 μήνες σε φιάλη πριν την κυκλοφορία.",
      tastingNotes: "Έντονο βαθύ κόκκινο χρώμα με ρουμπινί ανταύγειες, πυκνό μπουκέτο με φρούτα του δάσους, καπνό, κέδρο και μαύρη σοκολάτα. Γεμάτο, στιβαρό στόμα με εξαιρετική ισορροπία, σκελετό τανινών και μακρά, φρουτώδη επίγευση.",
      servingTemp: "16-18 °C",
      foodPairings: ["Κόκκινα κρέατα", "Κυνήγι"],
      status: ContentStatus.PUBLISHED,
    },
  });
  for (const [variety, percentage] of [
    [cabernetSauvignon, 90],
    [merlot, 10],
  ] as const) {
    await prisma.varietyOnWine.upsert({
      where: { wineId_varietyId: { wineId: kokotosWine.id, varietyId: variety.id } },
      update: { percentage },
      create: { wineId: kokotosWine.id, varietyId: variety.id, percentage },
    });
  }

  // ── Strataridakis Winery — Καστελιανά, Ηράκλειο Κρήτης ── πηγές: winesofcrete.gr, botilia.gr
  const strataridakis = await prisma.winery.upsert({
    where: { slug: "strataridakis-winery" },
    update: {},
    create: {
      slug: "strataridakis-winery",
      name: "Strataridakis Winery",
      regionId: kriti.id,
      foundedYear: 1955,
      websiteUrl: "https://www.strataridakis.gr",
      description:
        "Ο αμπελουργικός χαρακτήρας της οικογένειας ξεκινά τη δεκαετία του '50, όταν ο Αριστείδης Στραταριδάκης — πατέρας του Κωστή και του Μανώλη — απέκτησε το 1955 τον ιδιόκτητο αμπελώνα στους πρόποδες των Αστερουσίων, στο Ηράκλειο, αναγνωρίζοντας αμέσως τα ιδιαίτερα εδαφολογικά χαρακτηριστικά της περιοχής. Ο αμπελώνας περιλαμβάνει κυρίως κλήματα από τη Μονή Αγίων Αποστόλων Σινά. Το οινοποιείο θεωρείται το νοτιότερο της Ευρώπης.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const strataridakisWine = await prisma.wine.upsert({
    where: { slug: "strataridakis-moschato-spinas" },
    update: {},
    create: {
      name: "Moschato Spinas",
      slug: "strataridakis-moschato-spinas",
      wineryId: strataridakis.id,
      regionId: kriti.id,
      color: WineColor.WHITE,
      style: WineStyle.OFF_DRY,
      appellation: Appellation.PGI,
      description: "100% Μοσχάτο Σπίνας — σπάνια, ιδιαίτερα αρωματική τοπική ποικιλία από τα Καστελιανά Ηρακλείου.",
      tastingNotes: "Ανοιχτό, καθαρό κίτρινο χρώμα. Εκρηκτικά, κομψά αρώματα φρέσκου ροδάκινου και μαρμελάδας βερίκοκου, με νότες λίτσι, γιασεμιού και φρέσκων βοτάνων. Απαλή γλυκύτητα στο στόμα, με αρωματική, επίμονη επίγευση.",
      servingTemp: "9-11 °C",
      foodPairings: ["Θαλασσινά", "Λευκά κρέατα", "Φρούτα"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: strataridakisWine.id, varietyId: moschatoSpinas.id } },
    update: { percentage: 100 },
    create: { wineId: strataridakisWine.id, varietyId: moschatoSpinas.id, percentage: 100 },
  });

  // ── Akriotou Microwinery — Πλαταιές, πλαγιές Κιθαιρώνα ── πηγές: thequirkycork.com, greeceandgrapes.com, akriotouwines.gr
  const akriotou = await prisma.winery.upsert({
    where: { slug: "akriotou-microwinery" },
    update: {},
    create: {
      slug: "akriotou-microwinery",
      name: "Akriotou Microwinery",
      regionId: voiotia.id,
      foundedYear: 2017,
      websiteUrl: "https://akriotouwines.gr",
      description:
        "Η οινολόγος Βασιλική Ακριώτου, με εμπειρία σε οινοποιεία της Στερεάς Ελλάδας από το 1997, αποφάσισε το 2015 να δημιουργήσει τη δική της σειρά κρασιών. Στις αρχές του 2017 στήθηκε το μικρό οινοποιείο σε παλιά αποθήκη στην άκρη των Πλαταιών, στους πρόποδες του Κιθαιρώνα (280-380μ), με πρώτη επισκέψιμη λειτουργία από το 2018.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const akriotouWine = await prisma.wine.upsert({
    where: { slug: "akriotou-orivatis-savatiano" },
    update: {},
    create: {
      name: "Orivatis Savatiano",
      slug: "akriotou-orivatis-savatiano",
      wineryId: akriotou.id,
      regionId: voiotia.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      description: "100% Σαββατιανό από τους αμπελώνες στους πρόποδες του Κιθαιρώνα.",
      tastingNotes: "Θυμίζει χρυσό μήλο, αχλάδι Santa Maria και λευκά άνθη. Μέτριο σώμα, ξηρό, με μεταξένια υφή και ζωντανή οξύτητα.",
      servingTemp: "8-10 °C",
      foodPairings: ["Ελαφριά ορεκτικά", "Σαλάτες"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: akriotouWine.id, varietyId: savatiano.id } },
    update: { percentage: 100 },
    create: { wineId: akriotouWine.id, varietyId: savatiano.id, percentage: 100 },
  });

  // ── Greek Wine Cellars (Δ. Κουρτάκης) — Μαρκόπουλο Αττικής (ίδρυση) ── πηγές: winesofgreece.org, decanter.com
  const kourtakis = await prisma.winery.upsert({
    where: { slug: "greek-wine-cellars-kourtakis" },
    update: {},
    create: {
      slug: "greek-wine-cellars-kourtakis",
      name: "Ελληνικά Κελλάρια Οίνων (Δ. Κουρτάκης)",
      regionId: attiki.id,
      foundedYear: 1895,
      websiteUrl: "https://www.seaop.gr",
      description:
        "Ιδρύθηκε το 1895 από τον Βασίλη Κουρτάκη, τον πρώτο Έλληνα με πτυχίο οινολογίας, στην οδό Κολοκοτρώνη στο κέντρο της Αθήνας. Το 1905 ξεκίνησε η οινοπαραγωγή στο Μαρκόπουλο Μεσογείων. Ο γιος του, Δημήτρης Κουρτάκης, επέκτεινε τη διανομή των εμφιαλωμένων κρασιών σε όλη την Ελλάδα. Σήμερα, πάνω από έναν αιώνα μετά, η εταιρεία ανήκει και διοικείται ακόμη από την οικογένεια Κουρτάκη — με ετικέτες όπως Kourtaki, Apelia, Calliga και Kouros, από τους πιο αναγνωρίσιμους πρεσβευτές του ελληνικού κρασιού διεθνώς.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const kourtakisWine = await prisma.wine.upsert({
    where: { slug: "kourtakis-kouros-nemea" },
    update: {},
    create: {
      name: "Kouros Nemea",
      slug: "kourtakis-kouros-nemea",
      wineryId: kourtakis.id,
      regionId: nemea.id,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "100% Αγιωργίτικο ΠΟΠ Νεμέας — από τις πιο διαδεδομένες, διεθνώς αναγνωρίσιμες ελληνικές ετικέτες.",
      tastingNotes: "Λαμπερό βαθυκόκκινο χρώμα με βιολετί αποχρώσεις, πλούσιο άρωμα, απαλό αλλά γεμάτο στόμα με επίγευση βανίλιας.",
      servingTemp: "15-18 °C",
      foodPairings: ["Κόκκινα κρέατα", "Αλλαντικά", "Ζυμαρικά με κόκκινη σάλτσα"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: kourtakisWine.id, varietyId: agiorgitiko.id } },
    update: { percentage: 100 },
    create: { wineId: kourtakisWine.id, varietyId: agiorgitiko.id, percentage: 100 },
  });

  // ── Mikro Ktima Titou — Γουμένισσα ── πηγές: iefimerida.gr, vinous.com, botilia.gr
  const mikroKtimaTitou = await prisma.winery.upsert({
    where: { slug: "mikro-ktima-titou" },
    update: {},
    create: {
      slug: "mikro-ktima-titou",
      name: "Μικρό Κτήμα Τίτου",
      regionId: goumenissa.id,
      foundedYear: 1972,
      websiteUrl: "https://www.mikroktimatitos.com",
      description:
        "Ο Τίτος Ευτυχίδης φύτεψε το 1972 αμπελώνα 40 στρεμμάτων στη Γουμένισσα, στις ρίζες του Πάικου δίπλα στον ποταμό Σείριο. Το 2018, μετά από μακρόχρονη φιλία, μεταβίβασε το κτήμα στον Βαγγέλη Γεροβασιλείου και τον συνεργάτη του Βασίλη Τσακτσαρλή — τους ίδιους ιδρυτές του Κτήματος Βιβλία Χώρα και της Μικράς Θήρας — που το 2022 μετέτρεψαν το αρχικό κτίσμα σε σύγχρονο οινοποιείο σε αρμονία με το φυσικό τοπίο.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const mikroKtimaTitouWine = await prisma.wine.upsert({
    where: { slug: "mikro-ktima-titou-goumenissa" },
    update: {},
    create: {
      name: "Goumenissa",
      slug: "mikro-ktima-titou-goumenissa",
      wineryId: mikroKtimaTitou.id,
      regionId: goumenissa.id,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "80% Ξινόμαυρο, 20% Νεγκόσκα — χειρωδιαλεγμένος τρύγος τέλη Σεπτεμβρίου, κοινή εκχύλιση και ζύμωση των δύο ποικιλιών, παλαίωση 12 μήνες σε γαλλική δρυ.",
      tastingNotes: "Ρουμπινί χρώμα με γρανάτινες ανταύγειες. Αρώματα φράουλας, κερασιού και σμέουρου δεμένα με βοτανικές και απαλές ανθικές νότες δεντρολίβανου, γιασεμιού και μπαχαρικών, δαμάσκηνο και ξινόμηλο με ξερή ντομάτα. Μεταξένιο, μέτριο σώμα με ζουμερές τανίνες που ισορροπούν τη ζωηρή οξύτητα, γλυκά μπαχαρικά και σοκολάτα στην επίγευση.",
      servingTemp: "16-18 °C",
      foodPairings: ["Κόκκινα κρέατα", "Μαγειρευτά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  for (const [variety, percentage] of [
    [xinomavro, 80],
    [negoska, 20],
  ] as const) {
    await prisma.varietyOnWine.upsert({
      where: { wineId_varietyId: { wineId: mikroKtimaTitouWine.id, varietyId: variety.id } },
      update: { percentage },
      create: { wineId: mikroKtimaTitouWine.id, varietyId: variety.id, percentage },
    });
  }

  console.log("Batch 9 done: 6 οινοποιεία, 6 κρασιά, 0 νέες περιοχές, 1 νέα ποικιλία.");
  console.log("Η εισαγωγή των 88 οινοποιείων της αρχικής λίστας ολοκληρώθηκε.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
