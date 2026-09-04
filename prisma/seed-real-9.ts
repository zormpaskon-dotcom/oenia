// Batch 7/9 από τη λίστα ~88 οινοποιείων. Ίδια δομή ανά κρασί με τα
// προηγούμενα batches — πηγές σε σχόλιο ανά εγγραφή.
//
// Batch 7: Anatolikos Vineyards, Acra Winery, Artisans Vignerons de
// Naoussa, Aoton Winery, Argyriou Winery, Cair Winery, Karamitros
// Winery (Monsieur Nicolas), Magoutes Vineyard, Moraitis Winery.
// («Orealios Gaea / Κεφαλονιά» της λίστας παραλείφθηκε — είναι το
// σημερινό εμπορικό όνομα του ήδη υπάρχοντος στη βάση Συνεταιρισμού
// Παραγωγών Ρομπόλας Κεφαλληνίας, ίδρυση 1982, ίδιο οροπέδιο Ομαλών.)

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
  const avdira = await ensureRegion(
    "avdira",
    "Άβδηρα",
    MacroRegion.NORTHERN_GREECE,
    Appellation.PGI,
    "Ζώνη ΠΓΕ στην αρχαία πόλη των Αβδήρων, Ξάνθη — αμπελώνες κοντά στη θάλασσα, δροσισμένοι από σταθερό ανατολικό αγέρα από τον Εύξεινο Πόντο, σε μια περιοχή με αμπελουργική ιστορία από την αρχαιότητα."
  );
  const parnassos = await ensureRegion(
    "parnassos",
    "Παρνασσός",
    MacroRegion.CENTRAL_GREECE,
    Appellation.PGI,
    "Ζώνη ΠΓΕ γύρω από το Πολύδροσο, στους πρόποδες του Παρνασσού στη Φωκίδα."
  );
  const rhodes = await ensureRegion(
    "rhodes",
    "Ρόδος",
    MacroRegion.AEGEAN_ISLANDS,
    Appellation.PDO,
    "Ζώνη ΠΟΠ στο μεγαλύτερο νησί των Δωδεκανήσων — γηγενείς ποικιλίες Αθήρι (λευκό) και Μανδηλαριά (ερυθρό), και μακρά παράδοση αφρώδους οινοποίησης."
  );
  const messenikola = await ensureRegion(
    "messenikola",
    "Μεσενικόλα",
    MacroRegion.CENTRAL_GREECE,
    Appellation.PDO,
    "Μικρή ζώνη ΠΟΠ στην Καρδίτσα, στους πρόποδες των Αγράφων κοντά στη λίμνη Πλαστήρα — αποκλειστικά για το ερυθρό Μαύρο Μεσενικόλα."
  );
  const siatista = await ensureRegion(
    "siatista",
    "Σιάτιστα",
    MacroRegion.NORTHERN_GREECE,
    Appellation.PGI,
    "Ζώνη ΠΓΕ γύρω από τη Σιάτιστα Κοζάνης, σε υψόμετρο 750-890μ — ιστορική περιοχή αναβίωσης σπάνιων μακεδονικών ποικιλιών μετά την παρακμή της αμπελουργίας τον 20ό αιώνα."
  );
  const paros = await ensureRegion(
    "paros",
    "Πάρος",
    MacroRegion.AEGEAN_ISLANDS,
    Appellation.PGI,
    "Ζώνη ΠΓΕ στο κυκλαδίτικο νησί της Πάρου — γηγενείς ποικιλίες Μονεμβασιά (λευκή) και Μανδηλαριά (ερυθρή)."
  );

  const attiki = await prisma.region.findUniqueOrThrow({ where: { slug: "attiki" } });
  const nemea = await prisma.region.findUniqueOrThrow({ where: { slug: "nemea" } });
  const naoussa = await prisma.region.findUniqueOrThrow({ where: { slug: "naoussa" } });

  console.log("Νέες ποικιλίες…");
  const mavroudi = await ensureVariety("Μαυρούδι", VarietyType.RED, {
    originRegion: "Στερεά Ελλάδα",
    description: "Γηγενής ερυθρή ποικιλία της κεντρικής Ελλάδας, συχνά σε blend με διεθνείς ποικιλίες όπως το Merlot — δίνει δομή και σκούρο χρώμα.",
    characteristics: "Μέτρια ένταση χρώματος, κόκκινα και μαύρα μούρα, βοτανικές νότες, ζουμερές, στρογγυλές τανίνες.",
    acidity: 55,
    body: 60,
    tannins: 55,
  });
  const moschomavro = await ensureVariety("Μοσχόμαυρο", VarietyType.RED, {
    originRegion: "Σιάτιστα, Κοζάνη",
    description: "Σπάνια γηγενής ερυθρή ποικιλία της δυτικής Μακεδονίας, σχεδόν χαμένη ως τη δεκαετία του '90 — διασώθηκε και αναβιώθηκε από το Magoutes Vineyard στη Σιάτιστα.",
    characteristics: "Ανοιχτό, διάφανο κερασί χρώμα με εξελιγμένες κεραμιδί ανταύγειες, ανθικές νότες, άγρια φράουλα και κεράσι, ελαφρύ έως μέτριο σώμα, τραγανή οξύτητα, σφιχτές τανίνες.",
    acidity: 70,
    body: 45,
    tannins: 50,
  });
  const monemvasiaGrape = await ensureVariety("Μονεμβασιά", VarietyType.WHITE, {
    originRegion: "Κυκλάδες / Πελοπόννησος",
    description: "Ιστορική λευκή ποικιλία που έδωσε το όνομά της στον μεσαιωνικό οίνο Malvasia — καλλιεργείται σήμερα κυρίως στην Πάρο και τη Λακωνία.",
    characteristics: "Αρώματα λεμονιού, λευκών ανθέων και ανανά, ελαφρύ σώμα, μέτρια οξύτητα, ορυκτικότητα.",
    acidity: 55,
    body: 45,
    tannins: 0,
  });

  const assyrtiko = await prisma.variety.findUniqueOrThrow({ where: { name: "Ασύρτικο" } });
  const agiorgitiko = await prisma.variety.findUniqueOrThrow({ where: { name: "Αγιωργίτικο" } });
  const xinomavro = await prisma.variety.findUniqueOrThrow({ where: { name: "Ξινόμαυρο" } });
  const savatiano = await prisma.variety.findUniqueOrThrow({ where: { name: "Σαββατιανό" } });
  const athiri = await prisma.variety.findUniqueOrThrow({ where: { name: "Αθήρι" } });
  const merlot = await prisma.variety.findUniqueOrThrow({ where: { name: "Merlot" } });
  const chardonnay = await prisma.variety.findUniqueOrThrow({ where: { name: "Chardonnay" } });

  console.log("Οινοποιεία + κρασιά…");

  // ── Anatolikos Vineyards — Άβδηρα, Ξάνθη ── πηγές: jancisrobinson.com, greeceandgrapes.com, botilia.gr
  const anatolikos = await prisma.winery.upsert({
    where: { slug: "anatolikos-vineyards" },
    update: {},
    create: {
      slug: "anatolikos-vineyards",
      name: "Anatolikos Vineyards",
      regionId: avdira.id,
      foundedYear: 2005,
      websiteUrl: "https://anatolikoswinery.gr",
      description:
        "Ιδρύθηκε το 2005 από τα αδέρφια Σάκη και Μάριο Νικολαΐδη, έμπειρους επιχειρηματίες της Ξάνθης στη γαστρονομία. Η αγάπη τους για το κρασί ξεκίνησε από ένα εστιατόριο fine dining έξω από την Ξάνθη· όταν η επιχείρηση δεν άντεξε την κρίση του 2009, μετατράπηκε σε οινοποιείο. Ο ιδιόκτητος αμπελώνας των 7 εκταρίων βρίσκεται στα αρχαία Άβδηρα, κοντά στο Αιγαίο, με βιολογική καλλιέργεια.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const anatolikosWine = await prisma.wine.upsert({
    where: { slug: "anatolikos-fine-assyrtiko" },
    update: {},
    create: {
      name: "Fine Assyrtiko",
      slug: "anatolikos-fine-assyrtiko",
      wineryId: anatolikos.id,
      regionId: avdira.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      description: "100% Ασύρτικο βιολογικής καλλιέργειας από τα Άβδηρα, με παλαίωση σε δρύινο βαρέλι.",
      tastingNotes: "Χρυσοκίτρινο χρώμα. Εκφραστικό μπουκέτο ώριμου δαμάσκηνου, ψημένης φλούδας λεμονιού και νότες βανίλιας από τη δρυ. Γενναιόδωρος χαρακτήρας βαρελιού στο στόμα, ισορροπημένος από ζωηρή οξύτητα και σύνθετη υφή. Μακρύ, έντονο τελείωμα με νότες καραμέλας βουτύρου.",
      servingTemp: "10-12 °C",
      foodPairings: ["Ψάρια σχάρας", "Πιάτα με σάλτσα"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: anatolikosWine.id, varietyId: assyrtiko.id } },
    update: { percentage: 100 },
    create: { wineId: anatolikosWine.id, varietyId: assyrtiko.id, percentage: 100 },
  });

  // ── Acra Winery — Νεμέα ── πηγές: enprimeurclub.com, oenosco.com, cellartracker.com
  const acra = await prisma.winery.upsert({
    where: { slug: "acra-winery" },
    update: {},
    create: {
      slug: "acra-winery",
      name: "Acra Winery",
      regionId: nemea.id,
      foundedYear: 2021,
      websiteUrl: "http://acrawinery.com",
      description:
        "Ιδρύθηκε το 2021 από τα αδέρφια Σπύρο (χημικό-οινολόγο) και Δημήτρη Παπανδρέου (μηχανολόγο μηχανικό). Ο Σπύρος μεγάλωσε ανάμεσα σε αμπέλια, καθώς η οικογένειά του είναι από τους παλαιότερους παραγωγούς της Νεμέας. Ιδιόκτητος αμπελώνας 4 εκταρίων, υπό πιστοποίηση βιολογικής καλλιέργειας, με ελάχιστη οινολογική παρέμβαση.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const acraWine = await prisma.wine.upsert({
    where: { slug: "acra-nemea" },
    update: {},
    create: {
      name: "Nemea",
      slug: "acra-nemea",
      wineryId: acra.id,
      regionId: nemea.id,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "100% Αγιωργίτικο, 75% από τον κλώνο «Αρχαία Νεμέα» και 25% από τον κλώνο «Καστράκι». Παλαίωση 11 μήνες σε γαλλική δρυ (225 & 500L, 25% καινούρια).",
      tastingNotes: "Βαθύ μοβ χρώμα με βιολετί ανταύγειες, αρώματα άγριου κερασιού, δαμάσκηνου και μούρων, με νότες κακάο και μπαχαρικών. Γεμάτο σώμα, ευχάριστη οξύτητα, καλά δομημένες τανίνες, μακρά επίγευση με πιπέρι, ευκάλυπτο και καπνό.",
      servingTemp: "16-18 °C",
      foodPairings: ["Κόκκινα κρέατα", "Ώριμα τυριά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: acraWine.id, varietyId: agiorgitiko.id } },
    update: { percentage: 100 },
    create: { wineId: acraWine.id, varietyId: agiorgitiko.id, percentage: 100 },
  });

  // ── Artisans Vignerons de Naoussa — Νάουσα (συνεταιρισμός) ── πηγές: indigowine.com, thesourcingtable.com
  const artisansNaoussa = await prisma.winery.upsert({
    where: { slug: "artisans-vignerons-de-naoussa" },
    update: {},
    create: {
      slug: "artisans-vignerons-de-naoussa",
      name: "Artisans Vignerons de Naoussa",
      regionId: naoussa.id,
      description:
        "Συνεταιρισμός τεχνιτών-αμπελουργών που γεννήθηκε από την ένωση πέντε φίλων με βαθιά γνώση της γης και κοινό όραμα — να αναδείξουν τους σκόρπιους αμπελώνες τους στους λόφους της Νάουσας μέσα από βιώσιμη, βιολογική καλλιέργεια Ξινόμαυρου, με στόχο όχι την ποσότητα αλλά την αυθεντική ποιότητα και τον σεβασμό στην παράδοση της περιοχής.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const artisansNaoussaWine = await prisma.wine.upsert({
    where: { slug: "artisans-vignerons-de-naoussa-skyphos-xinomavro" },
    update: {},
    create: {
      name: "Skyphos Xinomavro",
      slug: "artisans-vignerons-de-naoussa-skyphos-xinomavro",
      wineryId: artisansNaoussa.id,
      regionId: naoussa.id,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "100% Ξινόμαυρο βιολογικής καλλιέργειας — μια φρέσκια, φρουτώδης έκφραση της ποικιλίας που αναδεικνύει το terroir της Νάουσας.",
      tastingNotes: "Ρουμπινί χρώμα, έντονος αρωματικός χαρακτήρας με φρέσκα μαύρα φρούτα, ντομάτα και πιπεριά, με νότες βοτάνων και ελιάς. Ισορροπημένο στόμα, δροσερή οξύτητα, στρογγυλές τανίνες και ευχάριστη επίγευση με φρέσκα μούρα και γήινες, κρεατώδεις νότες.",
      servingTemp: "16-18 °C",
      foodPairings: ["Κόκκινα κρέατα", "Μεσογειακή κουζίνα"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: artisansNaoussaWine.id, varietyId: xinomavro.id } },
    update: { percentage: 100 },
    create: { wineId: artisansNaoussaWine.id, varietyId: xinomavro.id, percentage: 100 },
  });

  // ── Aoton Winery — Παιανία, Αττική ── πηγές: falstaff.com, winemakersofattica.com, rosemurraybrown.com
  const aoton = await prisma.winery.upsert({
    where: { slug: "aoton-winery" },
    update: {},
    create: {
      slug: "aoton-winery",
      name: "Aoton Winery",
      regionId: attiki.id,
      description:
        "Πέντε γενιές πριν, η οικογένεια διατηρούσε πατητήρι στην Παλιά Παιανία, πιέζοντας τα σταφύλια των δικών της αμπελιών στα Μεσόγεια. Σήμερα το εγχείρημα «Aoton» — αρχαία ελληνική λέξη για «το εκλεκτότερο δείγμα του είδους του» — ανήκει στον οινολόγο Σωτήρη Γκίνη, που καλλιεργεί βιολογικά 6 εκτάρια γηγενών ποικιλιών (Σαββατιανό, Ροδίτης, Μανδηλαριά) με ελάχιστη παρέμβαση, νυχτερινό τρύγο και παραγωγή ρετσίνας ΠΓΕ Αττικής.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const aotonWine = await prisma.wine.upsert({
    where: { slug: "aoton-savatiano" },
    update: {},
    create: {
      name: "Savatiano",
      slug: "aoton-savatiano",
      wineryId: aoton.id,
      regionId: attiki.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      description: "100% Σαββατιανό βιολογικής καλλιέργειας, από όψιμα τρυγημένα σταφύλια με 10 ημέρες επαφή με τα στέμφυλα.",
      tastingNotes: "Αρώματα ψημένου μήλου και ξερών βοτάνων. Ξηρό στόμα με καλή ωριμότητα φρούτου και βάθος.",
      servingTemp: "8-10 °C",
      foodPairings: ["Ελαφριά ορεκτικά", "Θαλασσινά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: aotonWine.id, varietyId: savatiano.id } },
    update: { percentage: 100 },
    create: { wineId: aotonWine.id, varietyId: savatiano.id, percentage: 100 },
  });

  // ── Argyriou Winery — Πολύδροσο Παρνασσού ── πηγές: onparnassos.gr, winevein.com, argyriouwinery.gr
  const argyriou = await prisma.winery.upsert({
    where: { slug: "argyriou-winery" },
    update: {},
    create: {
      slug: "argyriou-winery",
      name: "Argyriou Winery",
      regionId: parnassos.id,
      foundedYear: 2002,
      websiteUrl: "https://www.argyriouwinery.gr",
      description:
        "Ο Νίκος Αργυρίου, γεννημένος στο Πολύδροσο Παρνασσού σε οικογένεια αγροτών-κτηνοτρόφων, φύτεψε τα πρώτα αμπέλια το 1998 και δημιούργησε το οινοποιείο το 2002, με την πρώτη οινοποίηση της ετικέτας «Erohos». Σήμερα ο ιδιόκτητος αμπελώνας καλύπτει 30 στρέμματα, αρκετά για να καλύψει την ετήσια ζήτηση αποκλειστικά από δικά του σταφύλια.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const argyriouWine = await prisma.wine.upsert({
    where: { slug: "argyriou-erohos-red" },
    update: {},
    create: {
      name: "Erohos Red",
      slug: "argyriou-erohos-red",
      wineryId: argyriou.id,
      regionId: parnassos.id,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      description: "Blend Μαυρούδι και Merlot από τους αμπελώνες του Πολύδροσου, στους πρόποδες του Παρνασσού.",
      tastingNotes: "Μέτρια ένταση ρουμπινί χρώματος, φρουτώδης μύτη με ποικιλία κόκκινων και μαύρων μούρων, βοτανικές και νότες βανίλιας. Ζουμερό, ζωντανό στόμα με απαλές τανίνες, γεμάτο σώμα και ευχάριστη, φρουτώδη επίγευση μέτριας διάρκειας.",
      servingTemp: "16-18 °C",
      foodPairings: ["Κόκκινα κρέατα", "Μαγειρευτά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  for (const [variety, percentage] of [
    [mavroudi, null],
    [merlot, null],
  ] as const) {
    await prisma.varietyOnWine.upsert({
      where: { wineId_varietyId: { wineId: argyriouWine.id, varietyId: variety.id } },
      update: { percentage },
      create: { wineId: argyriouWine.id, varietyId: variety.id, percentage },
    });
  }

  // ── Cair Winery — Ρόδος ── πηγές: newmoney.gr, lindos-rhodes.gr, agoragreekdelicacies.co.uk
  const cair = await prisma.winery.upsert({
    where: { slug: "cair-winery" },
    update: {},
    create: {
      slug: "cair-winery",
      name: "Cair Winery",
      regionId: rhodes.id,
      foundedYear: 1928,
      websiteUrl: "https://cair.gr",
      description:
        "Ιδρύθηκε τον Ιούλιο του 1928 από τέσσερις Ιταλούς και δύο Ιταλοεβραίους επιχειρηματίες ως «Compagnia Agricola Industriale Rodi» — από το ακρωνύμιο της οποίας προήλθε το όνομα CAIR. Το βιομηχανικό συγκρότημα έγινε το σημαντικότερο οινοποιείο της ευρύτερης περιοχής των Δωδεκανήσων και σήμερα είναι ο κορυφαίος παραγωγός φυσικού αφρώδους οίνου στην Ελλάδα.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const cairWine = await prisma.wine.upsert({
    where: { slug: "cair-rodos-2400-athiri" },
    update: {},
    create: {
      name: "Rodos 2400",
      slug: "cair-rodos-2400-athiri",
      wineryId: cair.id,
      regionId: rhodes.id,
      abv: 11.5,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "100% Αθήρι — το λευκό «πρόσωπο» της Ρόδου, από τη γηγενή ποικιλία του νησιού.",
      tastingNotes: "Έντονα αρώματα πράσινου μήλου, λευκού ροδάκινου, φλούδας λεμονιού με νότες ξηρών δημητριακών και θυμαριού. Ζωηρή οξύτητα, αναζωογονητικό στόμα με θυμάρι και βασιλικό που συνδυάζονται με τροπικό φρούτο στην επίγευση.",
      servingTemp: "8-10 °C",
      foodPairings: ["Θαλασσινά", "Ελαφριά ορεκτικά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: cairWine.id, varietyId: athiri.id } },
    update: { percentage: 100 },
    create: { wineId: cairWine.id, varietyId: athiri.id, percentage: 100 },
  });

  // ── Winery Monsieur Nicolas by G. Karamitros — Μεσενικόλα, Καρδίτσα ── πηγές: dinanikolaou.gr, winetourism.com, cookout.skai.gr
  const monsieurNicolas = await prisma.winery.upsert({
    where: { slug: "winery-monsieur-nicolas" },
    update: {},
    create: {
      slug: "winery-monsieur-nicolas",
      name: "Winery Monsieur Nicolas (Γ. Καραμήτρος)",
      regionId: messenikola.id,
      description:
        "Η οικογένεια Καραμήτρου μετακόμισε από την Ευρυτανία στο Μεσενικόλα Καρδίτσας την εποχή της Οθωμανικής κυριαρχίας, αναζητώντας καλύτερη τύχη, και έκτοτε παραμένει άρρηκτα συνδεδεμένη με την αμπελουργία της περιοχής. Ο Γιώργος Καραμήτρος είναι 4ης γενιάς οινοποιός, με τους αμπελώνες να αναρριχώνται στους πρόποδες των Αγράφων ως τα 700μ, με θέα στη λίμνη Πλαστήρα.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const monsieurNicolasWine = await prisma.wine.upsert({
    where: { slug: "monsieur-nicolas-chardonnay" },
    update: {},
    create: {
      name: "Chardonnay",
      slug: "monsieur-nicolas-chardonnay",
      wineryId: monsieurNicolas.id,
      regionId: messenikola.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      description: "100% Chardonnay από τους αμπελώνες του Μεσενικόλα, κοντά στη λίμνη Πλαστήρα.",
      tastingNotes: "Γεμάτη μύτη με λεπτά αρώματα πράσινου μήλου, λάιμ και άγουρου ανοιχτόσαρκου ροδάκινου. Λεπτή, εκλεπτυσμένη γεύση με πλούσια, φρουτώδη πολυπλοκότητα.",
      servingTemp: "10-12 °C",
      foodPairings: ["Λευκά κρέατα", "Πιάτα με σάλτσα"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: monsieurNicolasWine.id, varietyId: chardonnay.id } },
    update: { percentage: 100 },
    create: { wineId: monsieurNicolasWine.id, varietyId: chardonnay.id, percentage: 100 },
  });

  // ── Magoutes Vineyard (πρώην Diamantis Winery) — Σιάτιστα, Κοζάνη ── πηγές: fnl-guide.com, jancisrobinson.com, maltbyandgreek.com
  const magoutes = await prisma.winery.upsert({
    where: { slug: "magoutes-vineyard" },
    update: {},
    create: {
      slug: "magoutes-vineyard",
      name: "Magoutes Vineyard",
      regionId: siatista.id,
      foundedYear: 1985,
      websiteUrl: "https://www.magoutes.com",
      description:
        "Η ιστορία ξεκινά στις αρχές του 20ού αιώνα, όταν ο παππούς του Δημήτρη Διαμαντή, από τους σημαντικότερους αμπελουργούς της Σιάτιστας, μπόλιασε με το χέρι αμπέλι με γηγενείς ποικιλίες όπως το Ξινόμαυρο και τα σπάνια τοπικά Μοσχόμαυρο και Νιγριτσιώτικο. Το οινοποιείο ιδρύθηκε το 1985 (τότε ως «Diamantis Winery»), με πρώτη εμφιάλωση από ιδιόκτητο αμπελώνα το 2002, αφού στις αρχές της δεκαετίας του '90 ξαναφυτεύτηκαν 18 εκτάρια στην περιοχή «Μαγούτες» (750-890μ) για τη διάσωση των τοπικών ποικιλιών.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const magoutesWine = await prisma.wine.upsert({
    where: { slug: "magoutes-moschomavro" },
    update: {},
    create: {
      name: "Moschomavro",
      slug: "magoutes-moschomavro",
      wineryId: magoutes.id,
      regionId: siatista.id,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      description: "100% Μοσχόμαυρο — η σπάνια γηγενής ποικιλία που το Magoutes έσωσε από την αφάνεια στις πλαγιές της Σιάτιστας.",
      tastingNotes: "Ανοιχτό, διάφανο κερασί χρώμα με εξελιγμένες κεραμιδί ανταύγειες. Αρωματικά ξεχωρίζουν τα ώριμα κόκκινα μούρα, η άγρια φράουλα, ελαφριές νότες κερασιού και βατόμουρου με μια πινελιά ψιλοκομμένων βοτάνων. Στο στόμα λιτό και συγκρατημένο, ελαφρύ έως μέτριο σώμα με γεύσεις ξινού κερασιού, χαλικένιες ορυκτικές νότες και μια αίσθηση γης στο τελείωμα.",
      servingTemp: "14-16 °C",
      foodPairings: ["Ψητά", "Μεσογειακή κουζίνα"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: magoutesWine.id, varietyId: moschomavro.id } },
    update: { percentage: 100 },
    create: { wineId: magoutesWine.id, varietyId: moschomavro.id, percentage: 100 },
  });

  // ── Moraitis Winery — Νάουσα Πάρου ── πηγές: winesofgreece.org, rrselections.com, jmpwines.com
  const moraitis = await prisma.winery.upsert({
    where: { slug: "moraitis-winery" },
    update: {},
    create: {
      slug: "moraitis-winery",
      name: "Moraitis Winery",
      regionId: paros.id,
      foundedYear: 1910,
      websiteUrl: "https://moraitiswines.gr",
      description:
        "Ιδρύθηκε το 1910 από τον Μανώλη Μωραΐτη, που καλλιεργούσε τα δικά του αμπέλια και εξήγε το κρασί του με το ίδιο του το καράβι. Η 2η γενιά, με τον Θεόδωρο Μωραΐτη, συνέχισε την καλλιέργεια και πούλησε το κρασί ως το 1967, οπότε ξεκίνησε η εμφιάλωση. Το 1980 ανέλαβε η 3η γενιά με τον Μανώλη Μωραΐτη τον νεότερο, που εκσυγχρόνισε το οινοποιείο και επέκτεινε την καλλιέργεια γηγενών ποικιλιών της Πάρου.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const moraitisWine = await prisma.wine.upsert({
    where: { slug: "moraitis-paros-monemvasia" },
    update: {},
    create: {
      name: "Paros Monemvasia",
      slug: "moraitis-paros-monemvasia",
      wineryId: moraitis.id,
      regionId: paros.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      description: "100% Μονεμβασιά βιολογικής καλλιέργειας από τους αμπελώνες της Πάρου — η ιστορική λευκή ποικιλία του νησιού.",
      tastingNotes: "Ανοιχτό λευκοκίτρινο χρώμα με πράσινες ανταύγειες. Αρώματα λεμονιού, λευκών ανθέων, μήλου και ανανά, με νότες λευκού πιπεριού. Ξηρό, ελαφρύ σώμα με μέτρια οξύτητα, ορυκτικότητα και εσπεριδοειδή, τραγανή και επίμονη επίγευση.",
      servingTemp: "8-10 °C",
      foodPairings: ["Θαλασσινά", "Ελαφριά ορεκτικά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: moraitisWine.id, varietyId: monemvasiaGrape.id } },
    update: { percentage: 100 },
    create: { wineId: moraitisWine.id, varietyId: monemvasiaGrape.id, percentage: 100 },
  });

  console.log("Batch 7 done: 9 οινοποιεία (1 διπλότυπο παραλείφθηκε), 9 κρασιά, 6 νέες περιοχές, 3 νέες ποικιλίες.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
