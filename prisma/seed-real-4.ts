// Batch 2/9 από τη λίστα ~88 οινοποιείων. Ίδια δομή με τα προηγούμενα:
// κάθε κρασί έχει color/style, varieties, description (winemaking),
// tastingNotes, servingTemp, foodPairings — πηγές σε σχόλιο ανά εγγραφή.
//
// Batch 2: Domaine Economou, Domaine Florian, Domaine Glinavos,
// Domaine Karanika, Domaine Kikones, Domaine Nerantzi, Douloufakis
// Winery, Estate Argyros, Gaia Wines, Garalis Winery.

import { Appellation, ContentStatus, MacroRegion, VarietyType, WineColor, WineStyle } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { slugify } from "../lib/slugify";

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

async function ensureVariety(name: string, type: VarietyType, fields: Record<string, unknown> = {}) {
  return prisma.variety.upsert({
    where: { name },
    update: {},
    create: { name, slug: slugify(name), type, ...fields },
  });
}

async function main() {
  console.log("Νέες περιοχές…");
  const sitia = await ensureRegion(
    "sitia",
    "Σητεία",
    MacroRegion.CRETE,
    Appellation.PGI,
    "Ορεινό οροπέδιο Ζήρου, στα ανατολικά της Κρήτης — γνωστό από αυτοφυείς αμπελώνες γηγενών ποικιλιών όπως το Λιάτικο."
  );
  const thessaloniki = await ensureRegion(
    "thessaloniki",
    "Θεσσαλονίκη",
    MacroRegion.NORTHERN_GREECE,
    Appellation.PGI,
    "Ζώνη ΠΓΕ γύρω από τη Θεσσαλονίκη, με μικρά boutique οινοποιεία σε περιοχές όπως ο Τρίλοφος."
  );
  const zitsa = await ensureRegion(
    "zitsa",
    "Ζίτσα",
    MacroRegion.EPIRUS,
    Appellation.PDO,
    "Ορεινή ζώνη ΠΟΠ στα Ιωάννινα της Ηπείρου, αποκλειστικά για τη λευκή γηγενή ποικιλία Ντεμπίνα — ξηρά, ημιαφρώδη και αφρώδη κρασιά με έντονη οξύτητα."
  );
  const maroneia = await ensureRegion(
    "maroneia",
    "Μαρώνεια",
    MacroRegion.NORTHERN_GREECE,
    Appellation.PGI,
    "Ιστορική αμπελουργική περιοχή της Ροδόπης στη Θράκη, όπου κατά την αρχαιότητα κατοικούσαν οι Κίκονες — φημισμένη ήδη από τον Όμηρο για το κρασί της."
  );
  const serres = await ensureRegion(
    "serres",
    "Σέρρες",
    MacroRegion.NORTHERN_GREECE,
    Appellation.PGI,
    "Ζώνη ΠΓΕ στη Μακεδονία, γνωστή για τη διάσωση σπάνιων τοπικών ποικιλιών όπως η Ασπρούδα Σερρών και ο Κονιάρος."
  );
  const dafnes = await ensureRegion(
    "dafnes",
    "Δαφνές",
    MacroRegion.CRETE,
    Appellation.PDO,
    "Ζώνη ΠΟΠ νότια του Ηρακλείου Κρήτης, αποκλειστικά για την αρχαία γηγενή ποικιλία Λιάτικο — καλλιέργεια που ανάγεται στον 3ο-2ο αιώνα π.Χ."
  );
  const lemnos = await ensureRegion(
    "lemnos",
    "Λήμνος",
    MacroRegion.AEGEAN_ISLANDS,
    Appellation.PDO,
    "Νησιωτική ζώνη ΠΟΠ στο Βόρειο Αιγαίο, αφιερωμένη στο Μοσχάτο Αλεξανδρείας — το πιο διαδεδομένο σταφύλι του νησιού λόγω αντοχής στη λειψυδρία."
  );

  const santorini = await prisma.region.findUniqueOrThrow({ where: { slug: "santorini" } });
  const nemea = await prisma.region.findUniqueOrThrow({ where: { slug: "nemea" } });
  const amyndaio = await prisma.region.findUniqueOrThrow({ where: { slug: "amyndaio" } });

  console.log("Νέες ποικιλίες…");
  const debina = await ensureVariety("Ντεμπίνα", VarietyType.WHITE, {
    originRegion: "Ζίτσα, Ήπειρος",
    description:
      "Γηγενής λευκή ποικιλία της Ζίτσας στα Ιωάννινα, αποκλειστική βάση της ομώνυμης ζώνης ΠΟΠ. Ιδανική για ξηρά, ημιαφρώδη και αφρώδη κρασιά.",
    characteristics: "Λεπτά αρώματα φρέσκου μήλου, υψηλή φυσική οξύτητα, χαμηλός αλκοολικός βαθμός.",
    acidity: 85,
    body: 30,
    tannins: 0,
  });
  const sangiovese = await ensureVariety("Sangiovese", VarietyType.RED, {
    originRegion: "Τοσκάνη, Ιταλία",
    description: "Η βασική ερυθρή ποικιλία της Τοσκάνης (Chianti, Brunello). Στην Ελλάδα καλλιεργείται σε μικρή έκταση, όπως στο Κτήμα Κίκονες στη Μαρώνεια.",
    characteristics: "Άγρια κόκκινα φρούτα, υψηλή οξύτητα, σφιχτές αλλά φινετσάτες τανίνες.",
    acidity: 80,
    body: 55,
    tannins: 60,
  });
  const muscatAlexandria = await ensureVariety("Μοσχάτο Αλεξανδρείας", VarietyType.WHITE, {
    originRegion: "Λήμνος",
    description:
      "Αρχαία ποικιλία με καταγωγή από την Αίγυπτο. Στη Λήμνο έγινε το πιο διαδεδομένο σταφύλι του νησιού χάρη στην αντοχή του στη λειψυδρία και τα ηφαιστειακά εδάφη.",
    characteristics: "Πιο ήπιο αρωματικό προφίλ από το λευκό Μοσχάτο — κατάλληλο και για ξηρά, gastronomic στιλ, όχι μόνο γλυκά.",
    acidity: 55,
    body: 55,
    tannins: 0,
  });

  const liatiko = await prisma.variety.findUniqueOrThrow({ where: { name: "Λιάτικο" } });
  const mandilaria = await prisma.variety.findUniqueOrThrow({ where: { name: "Μανδηλαριά" } });
  const assyrtiko = await prisma.variety.findUniqueOrThrow({ where: { name: "Ασύρτικο" } });
  const xinomavro = await prisma.variety.findUniqueOrThrow({ where: { name: "Ξινόμαυρο" } });
  const vidiano = await prisma.variety.findUniqueOrThrow({ where: { name: "Βιδιανό" } });
  const agiorgitiko = await prisma.variety.findUniqueOrThrow({ where: { name: "Αγιωργίτικο" } });
  const syrah = await prisma.variety.findUniqueOrThrow({ where: { name: "Syrah" } });

  console.log("Οινοποιεία + κρασιά…");

  // ── Domaine Economou — Σητεία ── πηγές: greeceandgrapes.com, dnswines.com
  const economou = await prisma.winery.upsert({
    where: { slug: "domaine-economou" },
    update: {},
    create: {
      slug: "domaine-economou",
      name: "Domaine Economou",
      regionId: sitia.id,
      foundedYear: 1994,
      websiteUrl: "https://domaine-economou.com",
      description:
        "Ο Γιάννης Οικονόμου επέστρεψε στην Κρήτη το 1994 μετά από διεθνή καριέρα σε οινοποιεία της Γερμανίας, του Bordeaux (Château Margaux) και του Πεδεμοντίου, για να αναβιώσει τους οικογενειακούς αμπελώνες στο οροπέδιο του Ζήρου. Θεωρείται από τα πιο cult ελληνικά οινοποιεία — οι ερυθροί οίνοι παλαιώνουν έως και 10 χρόνια πριν κυκλοφορήσουν.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const economouWine = await prisma.wine.upsert({
    where: { slug: "economou-mirabello" },
    update: {},
    create: {
      name: "Mirabello",
      slug: "economou-mirabello",
      wineryId: economou.id,
      regionId: sitia.id,
      color: WineColor.RED,
      style: WineStyle.DRY,
      description: "Ερυθρό blend Λιάτικου και Μανδηλαριάς από αυτόρριζους αμπελώνες χαμηλών αποδόσεων στο οροπέδιο του Ζήρου.",
      tastingNotes: "Απαιτεί μακρά παλαίωση πριν την κυκλοφορία — χαρακτηριστικό στιλ βαθιάς δομής και μακράς ζωής.",
      servingTemp: "16-18 °C",
      foodPairings: ["Κρητική κουζίνα", "Ψητά κρέατα"],
      status: ContentStatus.PUBLISHED,
    },
  });
  for (const [variety, percentage] of [
    [liatiko, null],
    [mandilaria, null],
  ] as const) {
    await prisma.varietyOnWine.upsert({
      where: { wineId_varietyId: { wineId: economouWine.id, varietyId: variety.id } },
      update: { percentage },
      create: { wineId: economouWine.id, varietyId: variety.id, percentage },
    });
  }

  // ── Domaine Florian — Θεσσαλονίκη (Τρίλοφος) ── πηγές: makedonikanea.gr, wine24shop.gr
  const florian = await prisma.winery.upsert({
    where: { slug: "domaine-florian" },
    update: {},
    create: {
      slug: "domaine-florian",
      name: "Domaine Florian",
      regionId: thessaloniki.id,
      foundedYear: 2003,
      description:
        "Οικογενειακό boutique οινοποιείο της γερμανικής οικογένειας Schneider (3η γενιά οινοποιών) που εγκαταστάθηκε στον Τρίλοφο Θεσσαλονίκης το 2002-2003. Ιδιόκτητοι αμπελώνες σε δύο περιοχές: Τρίλοφος Επανομής και Τρίλοφος Νάουσας. Επισκέψιμο από το 2019.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const florianWine = await prisma.wine.upsert({
    where: { slug: "domaine-florian-syrah" },
    update: {},
    create: {
      name: "Domaine Florian Syrah",
      slug: "domaine-florian-syrah",
      wineryId: florian.id,
      regionId: thessaloniki.id,
      color: WineColor.RED,
      style: WineStyle.DRY,
      description: "Από τους αμπελώνες του κτήματος στον Τρίλοφο Νάουσας.",
      tastingNotes: "Βαθύ, πυκνό μοβ χρώμα με έντονα αρωματική μύτη από βύσσινο, σμέουρο, αποξηραμένο δαμάσκηνο, μαύρη σοκολάτα και αποξηραμένα φρούτα, με διακριτικές νότες βανίλιας και καραμέλας.",
      foodPairings: ["Ψητά κρέατα", "Ώριμα τυριά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: florianWine.id, varietyId: syrah.id } },
    update: { percentage: 100 },
    create: { wineId: florianWine.id, varietyId: syrah.id, percentage: 100 },
  });

  // ── Domaine Glinavos — Ζίτσα ── πηγή: greekgastronomyguide.gr, glinavoscellar.gr
  const glinavos = await prisma.winery.upsert({
    where: { slug: "domaine-glinavos" },
    update: {},
    create: {
      slug: "domaine-glinavos",
      name: "Κτήμα Γκλίναβος",
      regionId: zitsa.id,
      foundedYear: 1978,
      websiteUrl: "http://www.glinavos.gr",
      description:
        "Ιδρύθηκε το 1978 από τον οινολόγο-αμπελουργό Λευτέρη Γκλίναβο στον λόφο Προφήτη Ηλία της Ζίτσας, με στόχο την ανάδειξη των γηγενών ποικιλιών της Ηπείρου. Το 1990 ο γιος του Θωμάς ανέλαβε και επέκτεινε το κτήμα — σήμερα διαθέτει κελάρι 400 γαλλικών βαρελιών.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const glinavosWine = await prisma.wine.upsert({
    where: { slug: "glinavos-zitsa-debina" },
    update: {},
    create: {
      name: "Ζίτσα Γκλίναβος",
      slug: "glinavos-zitsa-debina",
      wineryId: glinavos.id,
      regionId: zitsa.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "100% Ντεμπίνα, το κλασικό ΠΟΠ κρασί της ζώνης Ζίτσας.",
      tastingNotes: "Λεπτά αρώματα φρέσκου μήλου, υψηλή φυσική οξύτητα και χαμηλός αλκοολικός βαθμός — ιδανικό για ημιαφρώδη στιλ.",
      servingTemp: "8-10 °C",
      foodPairings: ["Ελαφριά ορεκτικά", "Ηπειρώτικες πίτες"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: glinavosWine.id, varietyId: debina.id } },
    update: { percentage: 100 },
    create: { wineId: glinavosWine.id, varietyId: debina.id, percentage: 100 },
  });

  // ── Domaine Karanika — Αμύνταιο ── πηγή: botilia.gr, maltbyandgreek.com
  const karanika = await prisma.winery.upsert({
    where: { slug: "domaine-karanika" },
    update: {},
    create: {
      slug: "domaine-karanika",
      name: "Domaine Karanika",
      regionId: amyndaio.id,
      websiteUrl: "https://karanika.com",
      isOrganic: true,
      description:
        "Ιδρύθηκε από το ολλανδικό ζευγάρι Laurens Hartman-Karanika και Annette van Kampen, που άφησαν την Ολλανδία για να εκπαιδευτούν ως οινολόγοι στην Ευρώπη και τις ΗΠΑ πριν εγκατασταθούν στο Αμύνταιο. Θεωρείται ο κορυφαίος παραγωγός αφρώδους οίνου παραδοσιακής μεθόδου στην Ελλάδα, με βιοδυναμική καλλιέργεια και παλιά αμπέλια Ξινόμαυρου 75-80 ετών.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const karanikaWine = await prisma.wine.upsert({
    where: { slug: "karanika-amyntaio-xinomavro-old-vines" },
    update: {},
    create: {
      name: "Domaine Karanika Amyntaio Old Vines",
      slug: "karanika-amyntaio-xinomavro-old-vines",
      wineryId: karanika.id,
      regionId: amyndaio.id,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "Από αμπέλια Ξινόμαυρου 75-80 ετών στο οροπέδιο του Αμυνταίου, βιοδυναμική καλλιέργεια με ελάχιστη παρέμβαση στην οινοποίηση.",
      tastingNotes: "Χαρακτηριστική δομή και φρεσκάδα παλιών αμπελιών Ξινόμαυρου.",
      servingTemp: "16-18 °C",
      foodPairings: ["Κόκκινα κρέατα", "Παραδοσιακά μακεδονικά πιάτα"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: karanikaWine.id, varietyId: xinomavro.id } },
    update: { percentage: 100 },
    create: { wineId: karanikaWine.id, varietyId: xinomavro.id, percentage: 100 },
  });

  // ── Domaine Kikones — Μαρώνεια ── πηγές: voria.gr, cabernet.gr
  const kikones = await prisma.winery.upsert({
    where: { slug: "domaine-kikones" },
    update: {},
    create: {
      slug: "domaine-kikones",
      name: "Κτήμα Κίκονες",
      regionId: maroneia.id,
      foundedYear: 2004,
      websiteUrl: "https://www.kikones.gr",
      isOrganic: true,
      description:
        "Το πρώτο οινοποιείο που ιδρύθηκε στη Ροδόπη, το 2004, από τα αδέρφια Μελίνα (γεωπόνος-οινολόγος, D.N.O. Bordeaux) και Βασίλη Τάσσου, στην παλιά βιοτεχνία μέντας του πατέρα τους. Το όνομα τιμά τους αρχαίους Κίκονες, θρακική φυλή της Μαρώνειας φημισμένη για το κρασί της ήδη στον Όμηρο. Βιολογικοί αμπελώνες 100 στρεμμάτων.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const kikonesWine = await prisma.wine.upsert({
    where: { slug: "kikones-maron-sangiovese" },
    update: {},
    create: {
      name: "Μάρων Sangiovese",
      slug: "kikones-maron-sangiovese",
      wineryId: kikones.id,
      regionId: maroneia.id,
      color: WineColor.RED,
      style: WineStyle.DRY,
      description: "100% Sangiovese από βιολογικούς αμπελώνες στη Μαρώνεια — σπάνιο παράδειγμα της ιταλικής ποικιλίας στην Ελλάδα.",
      tastingNotes:
        "Άγριο κεράσι, νότες δέρματος και μπαχαρικών στη μύτη· δαμάσκηνο, μαύρο κεράσι και βιολέτα ανακατεμένα με βανίλια, βαρέλι και σοκολάτα. Φινετσάτες αλλά σταθερές τανίνες, μεγάλη φρεσκάδα από την οξύτητα.",
      foodPairings: ["Bistecca", "Κλασική μπολονέζ"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: kikonesWine.id, varietyId: sangiovese.id } },
    update: { percentage: 100 },
    create: { wineId: kikonesWine.id, varietyId: sangiovese.id, percentage: 100 },
  });

  // ── Domaine Nerantzi — Σέρρες ── πηγές: vineyardroad.net, 67wine.com
  const nerantzi = await prisma.winery.upsert({
    where: { slug: "domaine-nerantzi" },
    update: {},
    create: {
      slug: "domaine-nerantzi",
      name: "Domaine Nerantzi",
      regionId: serres.id,
      foundedYear: 1988,
      websiteUrl: "https://www.nerantzi.com",
      isOrganic: true,
      description:
        "Ιδρύθηκε το 1988 από τον Νεραντζή Μητρόπουλο στις Σέρρες — αρχικά για οικογενειακή κατανάλωση, μέχρι το 1998. Η οικογένεια ανακάλυψε και έσωσε άγνωστες τοπικές ποικιλίες (Ασπρούδα Σερρών, Κονιάρος), κερδίζοντας επίσημη αναγνώρισή τους. Εξαγωγές από το 2009, βιολογική καλλιέργεια σε 108 στρέμματα.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const nerantziWine = await prisma.wine.upsert({
    where: { slug: "nerantzi-assyrtiko" },
    update: {},
    create: {
      name: "Domaine Nerantzi Assyrtiko",
      slug: "nerantzi-assyrtiko",
      wineryId: nerantzi.id,
      regionId: serres.id,
      vintage: 2025,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      description: "Βιολογικό Ασύρτικο ΠΓΕ Σερρών — απόδειξη ότι η ποικιλία εκφράζεται διαφορετικά έξω από τα ηφαιστειακά εδάφη του Αιγαίου.",
      tastingNotes: "Φρέσκο, ζωηρό λευκό με καθαρή έκφραση του Ασύρτικου σε ηπειρωτικό, μη-ηφαιστειακό terroir.",
      servingTemp: "8-10 °C",
      foodPairings: ["Ψάρια", "Ελαφριά ορεκτικά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: nerantziWine.id, varietyId: assyrtiko.id } },
    update: { percentage: 100 },
    create: { wineId: nerantziWine.id, varietyId: assyrtiko.id, percentage: 100 },
  });

  // ── Douloufakis Winery — Δαφνές ── πηγές: winesofcrete.gr, jancisrobinson.com, winemonthclub.com
  const douloufakis = await prisma.winery.upsert({
    where: { slug: "douloufakis" },
    update: {},
    create: {
      slug: "douloufakis",
      name: "Οινοποιείο Δουλουφάκη",
      regionId: dafnes.id,
      foundedYear: 1930,
      websiteUrl: "https://douloufakis.wine",
      isOrganic: true,
      description:
        "Ξεκίνησε το 1930 όταν ο παππούς Δημήτρης Δουλουφάκης άρχισε επαγγελματική παραγωγή κρασιού σε παραδοσιακά πατητήρια στις Δαφνές Ηρακλείου. Η 3η γενιά συνεχίζει σήμερα, με βιολογική καλλιέργεια από τις αρχές της δεκαετίας του 2000 (πιστοποίηση ΔΗΩ) και εστίαση στις γηγενείς ποικιλίες Βιδιανό και Λιάτικο.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const douloufakisWine = await prisma.wine.upsert({
    where: { slug: "douloufakis-dafnios-vidiano" },
    update: {},
    create: {
      name: "Dafnios Vidiano",
      slug: "douloufakis-dafnios-vidiano",
      wineryId: douloufakis.id,
      regionId: dafnes.id,
      vintage: 2023,
      abv: 13.1,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      description: "100% Βιδιανό από τις Δαφνές Ηρακλείου.",
      tastingNotes:
        "Πλατύ στο στόμα, θυμίζει Semillon στην απαλή, στρογγυλή υφή, με γεύση πράσινου μήλου και ζωντανή, αναζωογονητική οξύτητα. Αρώματα βερίκοκου και τροπικών φρούτων, αλμυρή, φρέσκια επίγευση.",
      servingTemp: "9-10 °C",
      foodPairings: ["Λευκά κρέατα", "Θαλασσινά", "Κρητική κουζίνα"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: douloufakisWine.id, varietyId: vidiano.id } },
    update: { percentage: 100 },
    create: { wineId: douloufakisWine.id, varietyId: vidiano.id, percentage: 100 },
  });

  // ── Estate Argyros — Σαντορίνη ── πηγές: skurnik.com, decanter (via search)
  const argyros = await prisma.winery.upsert({
    where: { slug: "estate-argyros" },
    update: {},
    create: {
      slug: "estate-argyros",
      name: "Estate Argyros",
      regionId: santorini.id,
      foundedYear: 1903,
      websiteUrl: "https://estateargyros.com",
      description:
        "Ιδρύθηκε το 1903 από τον Γεώργιο Άργυρο στην Επισκοπή Γωνιά της Σαντορίνης. Σήμερα, με επικεφαλής τον Ματθαίο Άργυρο (4η γενιά), είναι ο μεγαλύτερος ιδιώτης κάτοχος αμπελώνων στο νησί (120+ εκτάρια), με κάποια κλήματα Ασύρτικου να ξεπερνούν τα 150-200 έτη.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const argyrosWine = await prisma.wine.upsert({
    where: { slug: "estate-argyros-assyrtiko" },
    update: {},
    create: {
      name: "Assyrtiko Estate Argyros",
      slug: "estate-argyros-assyrtiko",
      wineryId: argyros.id,
      regionId: santorini.id,
      vintage: 2024,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "Το εμβληματικό κρασί του κτήματος, από κάποια από τα γηραιότερα αμπέλια Ασύρτικου στη Σαντορίνη — έως 200 ετών, με εξαιρετικά χαμηλές αποδόσεις.",
      tastingNotes: "Λεμόνι και γκρέιπφρουτ, πυριτικές και πετρώδεις νότες, τραγανό και ενεργειακό. Μέτριο σώμα, ξηρό και έντονο.",
      servingTemp: "8-10 °C",
      foodPairings: ["Θαλασσινά", "Οστρακοειδή", "Ψάρια σχάρας"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: argyrosWine.id, varietyId: assyrtiko.id } },
    update: { percentage: 100 },
    create: { wineId: argyrosWine.id, varietyId: assyrtiko.id, percentage: 100 },
  });

  // ── Gaia Wines — Νεμέα (η λίστα ανέφερε «Νεμέα / Σαντορίνη» — κύρια έδρα Νεμέα) ── πηγές: winesofgreece.org
  const gaia = await prisma.winery.upsert({
    where: { slug: "gaia-wines" },
    update: {},
    create: {
      slug: "gaia-wines",
      name: "Gaia Wines",
      regionId: nemea.id,
      foundedYear: 1994,
      websiteUrl: "https://gaiawines.gr",
      description:
        "Ιδρύθηκε το 1994 από τον Γιάννη Παρασκευόπουλο (γεωπόνος, PhD οινολογίας Bordeaux II) και τον Λέοντα Καρατσάλο. Ξεκίνησαν με το εμβληματικό «Θαλασσίτης» στη Σαντορίνη· το 1997 άνοιξαν και δεύτερο οινοποιείο στο Κούτσι Νεμέας, καρδιά της εταιρείας σήμερα.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const gaiaWine = await prisma.wine.upsert({
    where: { slug: "agiorgitiko-by-gaia" },
    update: {},
    create: {
      name: "Agiorgitiko by Gaia",
      slug: "agiorgitiko-by-gaia",
      wineryId: gaia.id,
      regionId: nemea.id,
      vintage: 2021,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "100% Αγιωργίτικο από τη Νεμέα, παλαίωση έως 8 μήνες σε βαρέλι και ακόμη 6 μήνες στη φιάλη πριν κυκλοφορήσει.",
      tastingNotes:
        "Κομψό και δομημένο, με φασκόμηλο και φρεσκοτριμμένο μαύρο πιπέρι ανάμεσα στα κόκκινα μούρα, βελούδινες τανίνες σε μακρά επίγευση.",
      servingTemp: "16-18 °C",
      foodPairings: ["Κόκκινα κρέατα", "Ελληνική κουζίνα"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: gaiaWine.id, varietyId: agiorgitiko.id } },
    update: { percentage: 100 },
    create: { wineId: gaiaWine.id, varietyId: agiorgitiko.id, percentage: 100 },
  });

  // ── Garalis Winery — Λήμνος ── πηγές: thetotalbusiness.com, garaliswinery.gr
  const garalis = await prisma.winery.upsert({
    where: { slug: "garalis-winery" },
    update: {},
    create: {
      slug: "garalis-winery",
      name: "Οινοποιείο Γκαράλη",
      regionId: lemnos.id,
      foundedYear: 2007,
      websiteUrl: "https://garaliswinery.gr",
      isOrganic: true,
      description:
        "Λειτουργεί από το 2007 στην περιοχή «Κουρούνι», Άγιος Δημήτριος Λήμνου. Βιολογική καλλιέργεια σε αμπελώνες όπου το 90-95% είναι Μοσχάτο Αλεξανδρείας και το υπόλοιπο η αρχαία ερυθρή ποικιλία Λημνιό — και οι δύο ΠΟΠ Λήμνου.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const garalisWine = await prisma.wine.upsert({
    where: { slug: "garalis-moschato-alexandreias" },
    update: {},
    create: {
      name: "Γκαράλης Μοσχάτο Αλεξανδρείας",
      slug: "garalis-moschato-alexandreias",
      wineryId: garalis.id,
      regionId: lemnos.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "Ξηρή εκδοχή του Μοσχάτου Αλεξανδρείας — πιο ήπιο και «γαστρονομικό» στιλ σε σχέση με το κλασικό γλυκό Μοσχάτο.",
      tastingNotes: "Πιο συγκρατημένα αρώματα από το λευκό Μοσχάτο, κάνοντάς το πιο κατάλληλο ως συνοδευτικό φαγητού.",
      servingTemp: "8-10 °C",
      foodPairings: ["Θαλασσινά", "Λευκά κρέατα"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: garalisWine.id, varietyId: muscatAlexandria.id } },
    update: { percentage: 100 },
    create: { wineId: garalisWine.id, varietyId: muscatAlexandria.id, percentage: 100 },
  });

  console.log("Batch 2 done: 10 οινοποιεία, 7 νέες περιοχές, 3 νέες ποικιλίες.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
