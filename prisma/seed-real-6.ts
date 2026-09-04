// Batch 4/9 από τη λίστα ~88 οινοποιείων. Ίδια δομή ανά κρασί με τα
// προηγούμενα batches — πηγές σε σχόλιο ανά εγγραφή.
//
// Batch 4: Lyrarakis, Matsa Estate, Manolesakis Estate, Manousakis
// Winery, Markou Vineyards, Mesimvria Winery, Mikra Thira, Monemvasia
// Winery Tsimbidi, Muses Estate, Nico Lazaridi.
// (Το «Mercouri Estate / Ηλεία» της λίστας παραλείφθηκε — ήδη υπάρχει
// ως Κτήμα Μερκούρη στην Πάτρα από νωρίτερο batch.)

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
  const attiki = await ensureRegion(
    "attiki",
    "Αττική",
    MacroRegion.CENTRAL_GREECE,
    Appellation.PGI,
    "Ζώνη ΠΓΕ γύρω από την Αθήνα, ιδίως στα Μεσόγεια — ιστορική πατρίδα του Σαββατιανού και της ρετσίνας, με νεότερη έμφαση στη Μαλαγουζιά."
  );
  const monemvasia = await ensureRegion(
    "monemvasia",
    "Μονεμβασιά",
    MacroRegion.PELOPONNESE,
    Appellation.PDO,
    "Ζώνη ΠΟΠ στη Λακωνία, αποκλειστικά για τον θρυλικό μεσαιωνικό οίνο Malvasia (Μονεμβασιά) — ο οίνος που έδωσε το όνομά του στο διεθνές «Malmsey». Η ονομασία αναγνωρίστηκε ξανά το 2010."
  );
  const voiotia = await ensureRegion(
    "voiotia",
    "Βοιωτία",
    MacroRegion.CENTRAL_GREECE,
    Appellation.PGI,
    "Ζώνη ΠΓΕ γύρω από την Άσκρη, στους πρόποδες του Ελικώνα — μυθολογική «Κοιλάδα των Μουσών»."
  );
  const crete = await ensureRegion(
    "kriti",
    "Κρήτη",
    MacroRegion.CRETE,
    Appellation.PGI,
    "Γενική ζώνη ΠΓΕ Κρήτης για οινοποιεία εκτός των στενότερων ζωνών ΠΟΠ (Δαφνές, Πεζά) — συχνά αφιερωμένη στη διάσωση σπάνιων τοπικών ποικιλιών."
  );

  const drama = await prisma.region.findUniqueOrThrow({ where: { slug: "drama" } });
  const thessaloniki = await prisma.region.findUniqueOrThrow({ where: { slug: "thessaloniki" } });
  const santorini = await prisma.region.findUniqueOrThrow({ where: { slug: "santorini" } });
  const chania = await prisma.region.findUniqueOrThrow({ where: { slug: "chania" } });

  console.log("Νέες ποικιλίες…");
  const dafni = await ensureVariety("Δαφνί", VarietyType.WHITE, {
    originRegion: "Κρήτη",
    description: "Σπάνια λευκή κρητική ποικιλία που διασώθηκε από εξαφάνιση από την οικογένεια Λυραράκη στα τέλη της δεκαετίας του '80.",
    characteristics: "Αρωματική, με νότες βοτάνων και εσπεριδοειδών.",
  });
  const plyto = await ensureVariety("Πλυτό", VarietyType.WHITE, {
    originRegion: "Κρήτη",
    description: "Σπάνια λευκή κρητική ποικιλία, διασωμένη από εξαφάνιση από την οικογένεια Λυραράκη στις αρχές της δεκαετίας του '90, φυτεμένη στον αμπελώνα «Ψαράδες» στα 480μ.",
    characteristics: "Ζωηρό, φρέσκο, με λεμονάτο, ορυκτικό φρούτο και κιμωλιώδεις νότες.",
    acidity: 80,
    body: 45,
    tannins: 0,
  });
  const grenache = await ensureVariety("Grenache", VarietyType.RED, {
    originRegion: "Νότιος Ροδανός, Γαλλία / Ισπανία",
    description: "Βασική ποικιλία των blends του Νότιου Ροδανού (Châteauneuf-du-Pape). Στην Ελλάδα καλλιεργείται σπάνια, κυρίως σε ρόντανικου τύπου blends όπως στο Manousakis Winery στα Χανιά.",
    characteristics: "Γλυκό κόκκινο φρούτο, μέτριες τανίνες, συχνά υψηλό αλκοόλ.",
    acidity: 50,
    body: 65,
    tannins: 45,
  });
  const mourvedre = await ensureVariety("Mourvèdre", VarietyType.RED, {
    originRegion: "Ισπανία / Νότιος Ροδανός, Γαλλία",
    description: "Ισχυρή, σκουρόχρωμη ποικιλία των Ροδανικών blends — προσθέτει δομή και νότες γλυκάνισου.",
    characteristics: "Βαθύ χρώμα, στιβαρές τανίνες, νότες γλυκάνισου και άγριων μούρων.",
    acidity: 55,
    body: 75,
    tannins: 70,
  });
  const roussanne = await ensureVariety("Roussanne", VarietyType.WHITE, {
    originRegion: "Ροδανός, Γαλλία",
    description: "Λευκή ποικιλία του Ροδανού, συχνά σε blend με Viognier ή Marsanne — δίνει σώμα και αρωματική πολυπλοκότητα.",
    characteristics: "Λουλουδάτα αρώματα, γεμάτο σώμα, μέτρια οξύτητα.",
    acidity: 45,
    body: 65,
    tannins: 0,
  });
  const mouchtaro = await ensureVariety("Μούχταρο", VarietyType.RED, {
    originRegion: "Βοιωτία",
    description: "Σπάνια ερυθρή ποικιλία της Βοιωτίας, στους πρόποδες του Ελικώνα — καλλιεργείται σε πολύ περιορισμένη έκταση.",
    characteristics: "Βαθύ μοβ χρώμα, ώριμα κόκκινα φρούτα και μπαχαρικά, γεμάτο σώμα, μαλακές τανίνες, έντονη οξύτητα.",
    acidity: 70,
    body: 70,
    tannins: 55,
  });

  const savatiano = await prisma.variety.findUniqueOrThrow({ where: { name: "Σαββατιανό" } });
  const malagousia = await prisma.variety.findUniqueOrThrow({ where: { name: "Μαλαγουζιά" } });
  const assyrtiko = await prisma.variety.findUniqueOrThrow({ where: { name: "Ασύρτικο" } });
  const cabernetSauvignon = await prisma.variety.findUniqueOrThrow({ where: { name: "Cabernet Sauvignon" } });
  const cabernetFranc = await prisma.variety.findUniqueOrThrow({ where: { name: "Cabernet Franc" } });
  const sauvignonBlanc = await prisma.variety.findUniqueOrThrow({ where: { name: "Sauvignon Blanc" } });
  const chardonnay = await prisma.variety.findUniqueOrThrow({ where: { name: "Chardonnay" } });

  console.log("Οινοποιεία + κρασιά…");

  // ── Lyrarakis — Κρήτη (Αλάγνι Ηρακλείου) ── πηγές: winesofcrete.gr, wineanorak.com
  const lyrarakis = await prisma.winery.upsert({
    where: { slug: "lyrarakis" },
    update: {},
    create: {
      slug: "lyrarakis",
      name: "Οινοποιείο Λυραράκη",
      regionId: crete.id,
      foundedYear: 1966,
      websiteUrl: "https://www.lyrarakis.com",
      description:
        "Ιδρύθηκε το 1966 από τα αδέρφια Μανώλη και Σωτήρη Λυραράκη στο Αλάγνι Ηρακλείου. Η πρώτη εμφιαλωμένη σοδειά κυκλοφόρησε το 1992. Από τα τέλη της δεκαετίας του '80 αφοσιώθηκε στη διάσωση σπάνιων κρητικών ποικιλιών — έσωσε από την εξαφάνιση το Δαφνί, το Πλυτό και το Μελισσάκι.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const lyrarakisWine = await prisma.wine.upsert({
    where: { slug: "lyrarakis-plyto-psarades" },
    update: {},
    create: {
      name: "Plyto Ψαράδες",
      slug: "lyrarakis-plyto-psarades",
      wineryId: lyrarakis.id,
      regionId: crete.id,
      vintage: 2025,
      abv: 13,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      description: "100% Πλυτό από τον αμπελώνα «Ψαράδες» στα 480μ — η ποικιλία που έσωσε η οικογένεια από την εξαφάνιση στις αρχές της δεκαετίας του '90.",
      tastingNotes: "Ζωηρό, φρέσκο, λεμονάτο φρούτο με ορυκτικές νότες. Ανοιχτό χρώμα, αρώματα λευκού ροδάκινου, αχλαδιού και εσπεριδοειδών, με ελαφριά αλμύρα και κιμωλιώδεις νότες.",
      servingTemp: "8-10 °C",
      foodPairings: ["Θαλασσινά", "Ελαφριά ορεκτικά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: lyrarakisWine.id, varietyId: plyto.id } },
    update: { percentage: 100 },
    create: { wineId: lyrarakisWine.id, varietyId: plyto.id, percentage: 100 },
  });
  const lyrarakisDafniWine = await prisma.wine.upsert({
    where: { slug: "lyrarakis-dafni-psarades" },
    update: {},
    create: {
      name: "Dafni Ψαράδες",
      slug: "lyrarakis-dafni-psarades",
      wineryId: lyrarakis.id,
      regionId: crete.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      description: "100% Δαφνί από τον αμπελώνα «Ψαράδες» — η ποικιλία που πήρε το όνομά της από τη δάφνη, τα αρώματα της οποίας θυμίζει έντονα. Έσωσε την ποικιλία από την εξαφάνιση η οικογένεια Λυραράκη στα τέλη της δεκαετίας του '80.",
      tastingNotes: "Λαμπερό κίτρινο χρώμα με πράσινες ανταύγειες. Έντονα αρώματα δάφνης, δεντρολίβανου, ανθέων εσπεριδοειδών και απαλού λευκού φρούτου. Δροσερό, βοτανικό στόμα με ζωηρή οξύτητα και επίμονη, αρωματική επίγευση.",
      servingTemp: "8-10 °C",
      foodPairings: ["Θαλασσινά", "Πιάτα με βότανα"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: lyrarakisDafniWine.id, varietyId: dafni.id } },
    update: { percentage: 100 },
    create: { wineId: lyrarakisDafniWine.id, varietyId: dafni.id, percentage: 100 },
  });

  // ── Matsa Estate (Ρωξάνη Μάτσα) — Αττική (Κάντζα) ── πηγές: protagon.gr, athensvoice.gr
  const matsa = await prisma.winery.upsert({
    where: { slug: "matsa-estate" },
    update: {},
    create: {
      slug: "matsa-estate",
      name: "Κτήμα Ρωξάνη Μάτσα",
      regionId: attiki.id,
      foundedYear: 1878,
      description:
        "Ιστορικός αμπελώνας στην Κάντζα Αττικής, με ρίζες στο 1878 — η εταιρεία ιδρύθηκε επίσημα το 1918. Η Ρωξάνη Μάτσα, δισέγγονη του Αλέξανδρου Καμπά, είναι από τους πρωτεργάτες της αναβίωσης της Μαλαγουζιάς ως εμπορικής ποικιλίας στα τέλη της δεκαετίας του '80.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const matsaWine = await prisma.wine.upsert({
    where: { slug: "matsa-malagousia" },
    update: {},
    create: {
      name: "Κτήμα Ρωξάνη Μάτσα Μαλαγουζιά",
      slug: "matsa-malagousia",
      wineryId: matsa.id,
      regionId: attiki.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      description: "Βιολογική Μαλαγουζιά από τους ιστορικούς αμπελώνες της Παλλήνης — από τις πρώτες φυτεύσεις της ποικιλίας στην περιοχή, τέλη δεκαετίας '80.",
      tastingNotes: "Ανοιχτό κιτρινωπό χρώμα, έντονο αρωματικό μπουκέτο ώριμων εξωτικών φρούτων, ροδάκινου, βερίκοκου, φλούδας εσπεριδοειδών, ανθέων λεμονιάς και νυχτολούλουδου. Δροσερή οξύτητα, ελαφρύ σώμα.",
      servingTemp: "8-10 °C",
      foodPairings: ["Ελαφριά ορεκτικά", "Σαλάτες"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: matsaWine.id, varietyId: malagousia.id } },
    update: { percentage: 100 },
    create: { wineId: matsaWine.id, varietyId: malagousia.id, percentage: 100 },
  });

  // ── Manolesakis Estate (Gennima Psihis) — Δράμα ── πηγές: winetourism.com, greeceandgrapes.com
  const manolesakis = await prisma.winery.upsert({
    where: { slug: "manolesakis-estate" },
    update: {},
    create: {
      slug: "manolesakis-estate",
      name: "Estate Manolesakis (Gennima Psihis)",
      regionId: drama.id,
      foundedYear: 1989,
      description:
        "Ιδρύθηκε το 1989 από τον Γιώργο Μανωλεσάκη στην Αδριανή Δράμας. Το 1998 επεκτάθηκε με σύγχρονη μονάδα σε αμπελώνα 200 στρεμμάτων στις πλαγιές της Αδριανής. Το 2007 μετονομάστηκε σε «Gennima Psihis» («Γέννημα Ψυχής»). Σήμερα ο γιος του Σταύρος συνεχίζει το έργο.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const manolesakisWine = await prisma.wine.upsert({
    where: { slug: "gennima-psihis-white" },
    update: {},
    create: {
      name: "Gennima Psihis Λευκός",
      slug: "gennima-psihis-white",
      wineryId: manolesakis.id,
      regionId: drama.id,
      vintage: 2023,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      description: "Λευκό blend από τις κύριες λευκές ποικιλίες του κτήματος στην Αδριανή Δράμας.",
      tastingNotes: "Ανοιχτό κίτρινο χρώμα, έντονα αρώματα αχλαδιού, ροδάκινου, πεπονιού, μήλου και μπανάνας. Ισορροπημένο στόμα με καλό όγκο και ζωηρή, αναζωογονητική οξύτητα.",
      servingTemp: "8-10 °C",
      foodPairings: ["Ψάρια", "Λευκά κρέατα"],
      status: ContentStatus.PUBLISHED,
    },
  });
  for (const variety of [sauvignonBlanc, chardonnay, assyrtiko]) {
    await prisma.varietyOnWine.upsert({
      where: { wineId_varietyId: { wineId: manolesakisWine.id, varietyId: variety.id } },
      update: {},
      create: { wineId: manolesakisWine.id, varietyId: variety.id, percentage: null },
    });
  }

  // ── Manousakis Winery (Nostos) — Χανιά ── πηγές: manousakiswinery.com, maltbyandgreek.com
  const manousakis = await prisma.winery.upsert({
    where: { slug: "manousakis-winery" },
    update: {},
    create: {
      slug: "manousakis-winery",
      name: "Manousakis Winery (Nostos)",
      regionId: chania.id,
      foundedYear: 1993,
      websiteUrl: "https://www.manousakiswinery.com",
      description:
        "Ο Θόδωρος Μανουσάκης, γιος μετανάστη που έφυγε από το Βατόλακκο Χανίων για την Αμερική το 1954, ίδρυσε το κτήμα το 1993 στους λόφους νότια του χωριού, στα 320-380μ, στον δρόμο για τα Ομαλά. «Νόστος» σημαίνει τον καημό της επιστροφής στην πατρίδα. Πρώτος αμπελώνας με Ροδανικές ποικιλίες: Syrah, Grenache, Mourvèdre, Roussanne.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const manousakisWine = await prisma.wine.upsert({
    where: { slug: "manousakis-nostos-red" },
    update: {},
    create: {
      name: "Nostos Red",
      slug: "manousakis-nostos-red",
      wineryId: manousakis.id,
      regionId: chania.id,
      color: WineColor.RED,
      style: WineStyle.DRY,
      description: "Κλασικό blend νότιου Ροδανού — Syrah, Grenache, Mourvèdre, ξεχωριστή οινοποίηση κάθε ποικιλίας, παλαίωση σε 75% γαλλική / 25% αμερικανική δρυ.",
      tastingNotes: "Σκούρο φρούτο, βατόμουρο, βιολέτα και πικάντικο πιπέρι· το Mourvèdre προσθέτει νότα γλυκάνισου. Ώριμες, στρογγυλές τανίνες, μακρά επίγευση.",
      servingTemp: "16-18 °C",
      foodPairings: ["Ψητά κρέατα", "Κυνήγι"],
      status: ContentStatus.PUBLISHED,
    },
  });
  for (const variety of [grenache, mourvedre]) {
    await prisma.varietyOnWine.upsert({
      where: { wineId_varietyId: { wineId: manousakisWine.id, varietyId: variety.id } },
      update: {},
      create: { wineId: manousakisWine.id, varietyId: variety.id, percentage: null },
    });
  }
  const manousakisRoussanneWine = await prisma.wine.upsert({
    where: { slug: "manousakis-nostos-roussanne" },
    update: {},
    create: {
      name: "Nostos Roussanne",
      slug: "manousakis-nostos-roussanne",
      wineryId: manousakis.id,
      regionId: chania.id,
      vintage: 2024,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      description: "100% Roussanne, βιολογικής καλλιέργειας — από τους πρώτους αμπελώνες Ροδανικών ποικιλιών του κτήματος, φυτεμένους το 1993.",
      tastingNotes: "Ανοιχτόχρυσο χρώμα, αισθησιακά αρώματα βανίλιας, κηρήθρας και ξερών χόρτων. Ξηρό στόμα με μέτρια οξύτητα, γεύσεις λευκού ροδάκινου, γύρης μέλισσας, αχλαδιού comice και λεμονιού, με μακρά, ορυκτική επίγευση.",
      servingTemp: "8-10 °C",
      foodPairings: ["Λευκά κρέατα", "Πιάτα με βότανα"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: manousakisRoussanneWine.id, varietyId: roussanne.id } },
    update: { percentage: 100 },
    create: { wineId: manousakisRoussanneWine.id, varietyId: roussanne.id, percentage: 100 },
  });

  // ── Markou Vineyards — Αττική ── πηγή: markouvineyards.gr, houseofwine.gr
  const markou = await prisma.winery.upsert({
    where: { slug: "markou-vineyards" },
    update: {},
    create: {
      slug: "markou-vineyards",
      name: "Αμπελώνες Μάρκου",
      regionId: attiki.id,
      foundedYear: 1908,
      websiteUrl: "https://markouvineyards.gr",
      description:
        "Ο Σπύρος Μάρκου οινοποίησε το πρώτο Σαββατιανό της οικογένειας το 1908, στο καπηλειό του στην Αθήνα. Σήμερα η 4η γενιά συνεχίζει από την Παιανία, στην καρδιά των Μεσογείων — από τα παλαιότερα ερασιτεχνικά οινοποιεία της Αθήνας.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const markouWine = await prisma.wine.upsert({
    where: { slug: "markou-savvatiano" },
    update: {},
    create: {
      name: "Savvatiano Μάρκου",
      slug: "markou-savvatiano",
      wineryId: markou.id,
      regionId: attiki.id,
      vintage: 2023,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      description: "100% Σαββατιανό — η γηγενής ποικιλία της Αττικής, οικογενειακή παράδοση άνω των 100 ετών.",
      tastingNotes: "Καθαρό λεμονί χρώμα μέτριας έντασης. Τροπικά φρούτα με ανθικές νότες στη μύτη. Ξηρό στόμα με ήπια οξύτητα, μεσαία έως μακρά επίγευση, πολύ φρουτώδες και ευχάριστο.",
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: markouWine.id, varietyId: savatiano.id } },
    update: { percentage: 100 },
    create: { wineId: markouWine.id, varietyId: savatiano.id, percentage: 100 },
  });

  // ── Mesimvria Winery — Θεσσαλονίκη ── πηγή: mesimvriawines.gr
  const mesimvria = await prisma.winery.upsert({
    where: { slug: "mesimvria-winery" },
    update: {},
    create: {
      slug: "mesimvria-winery",
      name: "Mesimvria Winery",
      regionId: thessaloniki.id,
      foundedYear: 1996,
      websiteUrl: "https://mesimvriawines.gr",
      description:
        "Ιδρύθηκε το 1996 από τον Περικλή Δράχα και τον Θεόδωρο Παρασκευόπουλο στη Νέα Μεσημβρία, 20χλμ βορειοδυτικά της Θεσσαλονίκης, σε λόφους 200μ με θέα τον Θερμαϊκό. Στόχος τους η ανάδειξη του οινοποιητικού δυναμικού της περιοχής μέσα από ελεγχόμενες, χαμηλές αποδόσεις.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const mesimvriaWine = await prisma.wine.upsert({
    where: { slug: "mesimvria-assyrtiko" },
    update: {},
    create: {
      name: "Mesimvria Assyrtiko",
      slug: "mesimvria-assyrtiko",
      wineryId: mesimvria.id,
      regionId: thessaloniki.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      description: "100% Ασύρτικο καλλιεργημένο στους λόφους της Νέας Μεσημβρίας — έκφραση της ποικιλίας έξω από το ηφαιστειακό της σπίτι.",
      tastingNotes: "Έντονη οξύτητα, ορυκτικές και αλμυρές νότες, ελαφρύ έως μέτριο σώμα με πυκνή υφή.",
      servingTemp: "8-10 °C",
      foodPairings: ["Θαλασσινά", "Ψάρια"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: mesimvriaWine.id, varietyId: assyrtiko.id } },
    update: { percentage: 100 },
    create: { wineId: mesimvriaWine.id, varietyId: assyrtiko.id, percentage: 100 },
  });

  // ── Mikra Thira — Σαντορίνη (Θηρασία) ── πηγές: athinorama.gr, flaginlife.gr
  const mikraThira = await prisma.winery.upsert({
    where: { slug: "mikra-thira" },
    update: {},
    create: {
      slug: "mikra-thira",
      name: "Μικρά Θήρα",
      regionId: santorini.id,
      foundedYear: 2023,
      description:
        "Το πρώτο οινοποιείο της Θηρασίας — του νησιού που μέχρι τη μεγάλη ηφαιστειακή έκρηξη του 1600 π.Χ. ήταν ένα με τη Σαντορίνη. Ιδέα από το 2007, αγορά γης το 2017, άνοιξε τις πύλες του λίγο πριν τον Μάιο του 2023 — συνεργασία των Βαγγέλη Γεροβασιλείου, Βασίλη Τσακτσαρλή (ιδρυτές και του Κτήματος Βιβλία Χώρα) και Ιωάννας Βαμβακούρη.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const mikraThiraWine = await prisma.wine.upsert({
    where: { slug: "mikra-thira-terrasea" },
    update: {},
    create: {
      name: "Terrasea",
      slug: "mikra-thira-terrasea",
      wineryId: mikraThira.id,
      regionId: santorini.id,
      abv: 13,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "100% Ασύρτικο από τη Θηρασία — ζώνη ΠΟΠ Σαντορίνης.",
      tastingNotes: "Έντονο, φωτεινό χρώμα, αρώματα αχλαδιού, εσπεριδοειδών και τροπικών φρούτων, βοτανικό στόμα, ελαφρά αλμυρή και ορυκτή επίγευση.",
      servingTemp: "8-10 °C",
      foodPairings: ["Θαλασσινά", "Ψάρια σχάρας"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: mikraThiraWine.id, varietyId: assyrtiko.id } },
    update: { percentage: 100 },
    create: { wineId: mikraThiraWine.id, varietyId: assyrtiko.id, percentage: 100 },
  });

  // ── Monemvasia Winery Tsimbidi — Μονεμβασιά ── πηγές: decanter.com, monemvasiawinery.gr
  const monemvasiaWinery = await prisma.winery.upsert({
    where: { slug: "monemvasia-winery-tsimbidi" },
    update: {},
    create: {
      slug: "monemvasia-winery-tsimbidi",
      name: "Monemvasia Winery Tsimbidi",
      regionId: monemvasia.id,
      foundedYear: 1997,
      websiteUrl: "https://www.monemvasiawinery.gr",
      description:
        "Ιδρύθηκε στις 20 Σεπτεμβρίου 1997 από τον Γιώργο και την Έλλη Τσιμπίδη, με στόχο την αναβίωση του θρυλικού μεσαιωνικού οίνου Malvasia στη γενέτειρά του. Ο Γιώργος, φυσικός στο επάγγελμα και ερευνητής της τοπικής ιστορίας, βλέπει την προσπάθεια να επιβραβεύεται το 2010 με την αναγνώριση ΠΟΠ «Μονεμβασία-Malvasia». Το πρώτο κρασί εμφιαλώθηκε το 2013.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const monemvasiaWine = await prisma.wine.upsert({
    where: { slug: "monemvasia-tsimbidi-assyrtiko" },
    update: {},
    create: {
      name: "Assyrtiko Monemvasia",
      slug: "monemvasia-tsimbidi-assyrtiko",
      wineryId: monemvasiaWinery.id,
      regionId: monemvasia.id,
      abv: 13.5,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      description: "100% Ασύρτικο ΠΓΕ Λακωνίας — ζύμωση σε ανοξείδωτο με ελεγχόμενη θερμοκρασία, 6 μήνες παραμονή στις οινολάσπες.",
      tastingNotes: "Μέτριο κίτρινο χρώμα με πράσινες ανταύγειες, αρώματα κίτρινου ροδάκινου και εσπεριδοειδών με νότες λεμονιού και γκρέιπφρουτ. Υψηλή οξύτητα, έντονη ορυκτικότητα, σχεδόν γεμάτο σώμα με μακρά επίγευση.",
      servingTemp: "8-10 °C",
      foodPairings: ["Τηγανητό ψάρι", "Ζυμαρικά με θαλασσινά", "Ψητά λαχανικά με λεμονάτη σάλτσα"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: monemvasiaWine.id, varietyId: assyrtiko.id } },
    update: { percentage: 100 },
    create: { wineId: monemvasiaWine.id, varietyId: assyrtiko.id, percentage: 100 },
  });

  // ── Muses Estate — Βοιωτία ── πηγή: musesestate.com, thedistiller.gr
  const muses = await prisma.winery.upsert({
    where: { slug: "muses-estate" },
    update: {},
    create: {
      slug: "muses-estate",
      name: "Κτήμα Μουσών",
      regionId: voiotia.id,
      foundedYear: 1946,
      websiteUrl: "https://www.musesestate.com",
      description:
        "Ιδρύθηκε το 1946 από τον Νικόλαο Ζαχαρία στην Άσκρη Βοιωτίας, στους πρόποδες του Ελικώνα — τη μυθολογική «Κοιλάδα των Μουσών». Το 1967 ανέλαβε ο γιος του Αθανάσιος, και το 2005 η 3η γενιά αναβίωσε το κτήμα με σύγχρονες μεθόδους.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const musesWine = await prisma.wine.upsert({
    where: { slug: "muses-estate-mouchtaro" },
    update: {},
    create: {
      name: "Κτήμα Μουσών Μούχταρο",
      slug: "muses-estate-mouchtaro",
      wineryId: muses.id,
      regionId: voiotia.id,
      vintage: 2023,
      abv: 13,
      color: WineColor.RED,
      style: WineStyle.DRY,
      description: "100% Μούχταρο — σπάνια τοπική ποικιλία της Βοιωτίας. Παλαίωση 12 μήνες σε μεταχειρισμένα βαρέλια (225-300L) και 6 μήνες στη φιάλη.",
      tastingNotes: "Βαθύ μοβ χρώμα, αρώματα ώριμων κόκκινων φρούτων και μπαχαρικών, γεμάτο σώμα, μαλακές μεταξένιες τανίνες, έντονη οξύτητα.",
      servingTemp: "16-18 °C",
      foodPairings: ["Κόκκινα κρέατα", "Μαγειρευτά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: musesWine.id, varietyId: mouchtaro.id } },
    update: { percentage: 100 },
    create: { wineId: musesWine.id, varietyId: mouchtaro.id, percentage: 100 },
  });

  // ── Nico Lazaridi — Δράμα ── πηγές: greekreporter.com, cellartracker.com
  const nicoLazaridi = await prisma.winery.upsert({
    where: { slug: "nico-lazaridi" },
    update: {},
    create: {
      slug: "nico-lazaridi",
      name: "Château Nico Lazaridi",
      regionId: drama.id,
      foundedYear: 1987,
      description:
        "Ο Νίκος Λαζαρίδης, γνωστός πρώτα από τη διεθνή προώθηση του λευκού μαρμάρου της Θάσου, ίδρυσε την εταιρεία το 1987 στην περιοχή Αγορά Δράμας — αδερφός του Κώστα Λαζαρίδη, ιδρυτή του γειτονικού Κτήματος Κώστα Λαζαρίδη. Το 2000 επέκτεινε τη δραστηριότητα με το Οινοποιείο Μακεδών στην Καβάλα, στους πρόποδες του Παγγαίου.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const nicoLazaridiWine = await prisma.wine.upsert({
    where: { slug: "nico-lazaridi-magiko-vouno-red" },
    update: {},
    create: {
      name: "Μαγικό Βουνό Ερυθρός",
      slug: "nico-lazaridi-magiko-vouno-red",
      wineryId: nicoLazaridi.id,
      regionId: drama.id,
      vintage: 2015,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      description: "Ισομερές blend Cabernet Sauvignon και Cabernet Franc από την Αγορά Δράμας.",
      tastingNotes: "Βαθύ χρώμα ρουμπινί με γρανάτινες ανταύγειες, πλούσια αρώματα ώριμων κόκκινων φρούτων, βιολέτας, καφέ και σοκολάτας με μπαχαρικά. Γεμάτο σώμα, στρογγυλές τανίνες, ισορροπημένη οξύτητα, μακρά επίγευση.",
      servingTemp: "16-18 °C",
      foodPairings: ["Κόκκινα κρέατα", "Ώριμα τυριά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  for (const [variety, percentage] of [
    [cabernetSauvignon, 50],
    [cabernetFranc, 50],
  ] as const) {
    await prisma.varietyOnWine.upsert({
      where: { wineId_varietyId: { wineId: nicoLazaridiWine.id, varietyId: variety.id } },
      update: { percentage },
      create: { wineId: nicoLazaridiWine.id, varietyId: variety.id, percentage },
    });
  }

  console.log("Batch 4 done: 10 οινοποιεία, 12 κρασιά, 4 νέες περιοχές, 6 νέες ποικιλίες.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
