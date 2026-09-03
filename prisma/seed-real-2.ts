// Δεύτερο batch πραγματικών δεδομένων — γεμίζει τις 6 περιοχές που δεν είχαν
// κανένα οινοποιείο/κρασί: Γουμένισσα, Μαντινεία, Πάτρα, Πεζά, Ραψάνη,
// Ρομπόλα Κεφαλληνίας. Ένα γνωστό, καλά τεκμηριωμένο οινοποιείο + ένα
// flagship κρασί ανά περιοχή, ερευνημένο online — πηγές σε σχόλιο ανά εγγραφή.
//
// Σημείωση: το Τσάνταλης (ο πιο γνωστός παραγωγός Ραψάνης) βρίσκεται σε
// διαδικασία πτώχευσης (ot.gr, capital.gr, 2024) — επιλέχθηκε το Οινοποιείο
// Ντούγκος αντ' αυτού, οικονομικά σταθερός παραγωγός με καλά τεκμηριωμένο
// Ραψάνη Old Vines.

import { ContentStatus, VarietyType } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { slugify } from "../lib/slugify";

async function ensureVariety(name: string, type: VarietyType, fields: Record<string, unknown>) {
  return prisma.variety.upsert({
    where: { name },
    update: fields,
    create: { name, slug: slugify(name), type, ...fields },
  });
}

async function main() {
  console.log("Νέες ποικιλίες (Ραψάνη trio + Refosco)…");
  const krasato = await ensureVariety("Κρασάτο", VarietyType.RED, {
    originRegion: "Θεσσαλία (Ραψάνη)",
    description:
      "Ερυθρή ποικιλία της Θεσσαλίας, μέλος της «τριάδας» της Ραψάνης μαζί με το Ξινόμαυρο και το Σταυρωτό. Δίνει χρώμα και σώμα στο κλασικό blend.",
    characteristics: "Μέτρια οξύτητα, πλούσιες τανίνες, έντονο χρώμα.",
    acidity: 55,
    body: 60,
    tannins: 65,
    aromaIntensity: 50,
    ageingPotential: 45,
  });
  const stavroto = await ensureVariety("Σταυρωτό", VarietyType.RED, {
    originRegion: "Θεσσαλία (Ραψάνη)",
    description:
      "Ερυθρή ποικιλία της Θεσσαλίας, το τρίτο μέλος της «τριάδας» της Ραψάνης — «στρογγυλεύει» το blend με Ξινόμαυρο και Κρασάτο.",
    characteristics: "Απαλές τανίνες, μέτριο σώμα, συμβάλλει σε ισορροπία και φινέτσα.",
    acidity: 50,
    body: 50,
    tannins: 40,
    aromaIntensity: 45,
    ageingPotential: 40,
  });
  const refosco = await ensureVariety("Refosco", VarietyType.RED, {
    originRegion: "Φριούλι, Ιταλία",
    description:
      "Βορειοϊταλική ερυθρή ποικιλία από το Φριούλι. Στην Ελλάδα καλλιεργείται κυρίως στο Κτήμα Μερκούρη στην Πάτρα, όπου εισήχθη τον 19ο αιώνα.",
    characteristics: "Βαθύ χρώμα, υψηλή οξύτητα, μέτριες προς έντονες τανίνες.",
    acidity: 75,
    body: 65,
    tannins: 60,
    aromaIntensity: 60,
    ageingPotential: 60,
  });
  const xinomavro = await prisma.variety.findUniqueOrThrow({ where: { name: "Ξινόμαυρο" } });
  const negoska = await prisma.variety.findUniqueOrThrow({ where: { name: "Νεγκόσκα" } });
  const moschofilero = await prisma.variety.findUniqueOrThrow({ where: { name: "Μοσχοφίλερο" } });
  const mavrodafni = await prisma.variety.findUniqueOrThrow({ where: { name: "Μαυροδάφνη" } });
  const kotsifali = await prisma.variety.findUniqueOrThrow({ where: { name: "Κοτσιφάλι" } });
  const mandilaria = await prisma.variety.findUniqueOrThrow({ where: { name: "Μανδηλαριά" } });
  const robola = await prisma.variety.findUniqueOrThrow({ where: { name: "Ρομπόλα" } });

  const regions = Object.fromEntries(
    (
      await prisma.region.findMany({
        where: { slug: { in: ["goumenissa", "mantineia", "patra", "peza", "rapsani", "robola-kefallinias"] } },
      })
    ).map((r) => [r.slug, r])
  );

  console.log("Οινοποιεία + κρασιά, ανά περιοχή…");

  // ── Γουμένισσα — πηγή: aidarini.gr («Η Εταιρία»), botilia.gr ──
  const aidarinis = await prisma.winery.upsert({
    where: { slug: "oinopoieia-aidarini" },
    update: {},
    create: {
      slug: "oinopoieia-aidarini",
      name: "Οινοποιεία Αϊδαρίνη",
      regionId: regions.goumenissa.id,
      description:
        "Η οικογένεια Αϊδαρίνη ζει και παράγει κρασί στη Γουμένισσα από τα τέλη του 19ου αιώνα, στους πρόποδες του όρους Πάικο. Σήμερα με επικεφαλής τον Χρήστο Αϊδαρίνη, διαθέτει σύγχρονο οινοποιείο στην είσοδο της πόλης δίπλα στο παραδοσιακό υπόγειο κελάρι.",
      websiteUrl: "https://aidarini.gr/",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const goumenissaWine = await prisma.wine.upsert({
    where: { slug: "goumenissa-aidarini" },
    update: {},
    create: {
      name: "Γουμένισσα Αϊδαρίνη",
      slug: "goumenissa-aidarini",
      wineryId: aidarinis.id,
      regionId: regions.goumenissa.id,
      color: "RED",
      style: "DRY",
      abv: 13.5,
      description: "Ζύμωση και ωρίμαση 12 μήνες σε γαλλικά δρύινα βαρέλια. Πρώτη κυκλοφορία το 1983.",
      tastingNotes:
        "Μαλακές τανίνες, πλούτος και φινέτσα. Αρώματα κόκκινων φρούτων, βανίλιας και κακάο, με νότες ξύλου και καπνού στο μπουκέτο.",
      foodPairings: ["Κόκκινα κρέατα", "Ψητά με σάλτσα", "Ώριμα τυριά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  for (const [variety, percentage] of [
    [xinomavro, 70],
    [negoska, 30],
  ] as const) {
    await prisma.varietyOnWine.upsert({
      where: { wineId_varietyId: { wineId: goumenissaWine.id, varietyId: variety.id } },
      update: { percentage },
      create: { wineId: goumenissaWine.id, varietyId: variety.id, percentage },
    });
  }

  // ── Μαντινεία — πηγή: tselepos.gr, greekgastronomyguide.gr ──
  const tselepos = await prisma.winery.upsert({
    where: { slug: "ktima-tselepos" },
    update: {},
    create: {
      slug: "ktima-tselepos",
      name: "Κτήμα Τσέλεπος",
      regionId: regions.mantineia.id,
      foundedYear: 1989,
      description:
        "Ιδρύθηκε το 1989 από τον οινολόγο Γιάννη Τσέλεπο (απόφοιτο οινολογίας στο Dijon της Γαλλίας) και τη σύζυγό του Αμαλία, στην Τεγέα, στις υπώρειες του Πάρνωνα, υψόμετρο 750μ. Πρωτοπόρησε στην ανάδειξη του Μοσχοφίλερου ως μονοποικιλιακό κρασί.",
      websiteUrl: "https://tselepos.gr/",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const mantiniaWine = await prisma.wine.upsert({
    where: { slug: "mantinia-tselepos" },
    update: {},
    create: {
      name: "Mantinia",
      slug: "mantinia-tselepos",
      wineryId: tselepos.id,
      regionId: regions.mantineia.id,
      color: "WHITE",
      style: "DRY",
      tastingNotes:
        "Εξαιρετική φρεσκάδα, υψηλή οξύτητα και λεπτές γεύσεις μεγάλης έντασης εσπεριδοειδών, λεμονιού και τριαντάφυλλου. Καθαρό στόμα με έντονη επίγευση.",
      foodPairings: ["Ντολμαδάκια αυγολέμονο", "Τόνος tataki", "Νουντλς γλυκόξινα", "Πράσινες σαλάτες", "Σούσι"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: mantiniaWine.id, varietyId: moschofilero.id } },
    update: { percentage: 100 },
    create: { wineId: mantiniaWine.id, varietyId: moschofilero.id, percentage: 100 },
  });

  // ── Πάτρα — πηγή: mercouri.gr (μέσω search), houseofwine.gr ──
  const merkouri = await prisma.winery.upsert({
    where: { slug: "ktima-merkouri" },
    update: {},
    create: {
      slug: "ktima-merkouri",
      name: "Κτήμα Μερκούρη",
      regionId: regions.patra.id,
      foundedYear: 1864,
      description:
        "Ιστορικό αγρόκτημα στο Κορακοχώρι, κοντά στον Πύργο Ηλείας, ιδρυμένο το 1864 από τον Θεόδωρο Μερκούρη. Σήμερα δραστηριοποιείται η 4η και 5η γενιά της οικογένειας. Λίγα χρόνια μετά την ίδρυση φύτεψε το πρώτο Refosco στην Ελλάδα, με μοσχεύματα από το Φριούλι της Ιταλίας.",
      websiteUrl: "https://www.mercouri.gr/",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const merkouriWine = await prisma.wine.upsert({
    where: { slug: "ktima-merkouri-erythros" },
    update: {},
    create: {
      name: "Κτήμα Μερκούρη Ερυθρός",
      slug: "ktima-merkouri-erythros",
      wineryId: merkouri.id,
      regionId: regions.patra.id,
      vintage: 2022, // houseofwine.gr
      color: "RED",
      style: "DRY",
      description: "Το πρώτο επώνυμο κρασί του κτήματος — παντρεύει το αυστηρό ιταλικό Refosco με το ώριμο, μπαχαρένιο Μαυροδάφνη Πάτρας.",
      tastingNotes:
        "Βαθύ κόκκινο χρώμα, αρώματα κόκκινων φρούτων με νότες σοκολάτας και καφέ, βανίλιας και κανέλας από το ξύλο. Μέτριο σώμα με γεμάτες αλλά απαλές τανίνες.",
      foodPairings: ["Κόκκινα κρέατα", "Κυνήγι", "Ώριμα τυριά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  for (const [variety, percentage] of [
    [refosco, null],
    [mavrodafni, null],
  ] as const) {
    await prisma.varietyOnWine.upsert({
      where: { wineId_varietyId: { wineId: merkouriWine.id, varietyId: variety.id } },
      update: { percentage },
      create: { wineId: merkouriWine.id, varietyId: variety.id, percentage },
    });
  }

  // ── Πεζά — πηγή: winesofcrete.gr ──
  const minos = await prisma.winery.upsert({
    where: { slug: "minos-miliarakis" },
    update: {},
    create: {
      slug: "minos-miliarakis",
      name: "Μινώς Μηλιαράκης",
      regionId: regions.peza.id,
      foundedYear: 1932,
      description:
        "Οινοποιείο στην καρδιά της Πεζών, 17χλμ βόρεια του Ηρακλείου. Απέκτησε νομική μορφή το 1932 και το 1952 πραγματοποίησε την πρώτη εμφιάλωση κρασιού στην Κρήτη. Το 1982 δημιούργησε το πρώτο κελάρι παλαίωσης με γαλλικά δρύινα βαρέλια στο νησί.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const minosWine = await prisma.wine.upsert({
    where: { slug: "minos-palace-erythros" },
    update: {},
    create: {
      name: "Minos Palace Ερυθρός",
      slug: "minos-palace-erythros",
      wineryId: minos.id,
      regionId: regions.peza.id,
      color: "RED",
      style: "DRY",
      description: "Κλασικό κρητικό blend Κοτσιφάλι-Μανδηλαριάς — το Κοτσιφάλι δίνει αρωματικότητα και σώμα, η Μανδηλαριά χρώμα, οξύτητα και τανίνες.",
      tastingNotes: "Μοβ χρώμα, αρώματα αποξηραμένων φρούτων (σταφίδα, δαμάσκηνο) με ελαφριά νότα βανίλιας. Πλούσια, ισορροπημένη και μακρά γεύση.",
      foodPairings: ["Κρητική κουζίνα", "Ψητά κρέατα", "Παλαιωμένα τυριά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  for (const [variety, percentage] of [
    [kotsifali, 80],
    [mandilaria, 20],
  ] as const) {
    await prisma.varietyOnWine.upsert({
      where: { wineId_varietyId: { wineId: minosWine.id, varietyId: variety.id } },
      update: { percentage },
      create: { wineId: minosWine.id, varietyId: variety.id, percentage },
    });
  }

  // ── Ραψάνη — πηγή: rapsaniwine.gr, cellier.gr/topgreekwines.gr (Ντούγκος) ──
  const dougos = await prisma.winery.upsert({
    where: { slug: "oinopoieio-ntougkos" },
    update: {},
    create: {
      slug: "oinopoieio-ntougkos",
      name: "Οινοποιείο Ντούγκος",
      regionId: regions.rapsani.id,
      isOrganic: true,
      description:
        "Οικογενειακό οινοποιείο της 4ης γενιάς της οικογένειας Χρυσοχόου, στους πρόποδες του Ολύμπου δίπλα στον Πηνειό, με έδρα του από τα τέλη της δεκαετίας του '90.",
      websiteUrl: "https://www.rapsaniwine.gr/",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const rapsaniWine = await prisma.wine.upsert({
    where: { slug: "rapsani-old-vines-ntougkos" },
    update: {},
    create: {
      name: "Ραψάνη Old Vines",
      slug: "rapsani-old-vines-ntougkos",
      wineryId: dougos.id,
      regionId: regions.rapsani.id,
      color: "RED",
      style: "DRY",
      description:
        "Από αμπέλια 60+ ετών στην περιοχή Τουρτούρα της Ραψάνης (610-680μ), σε σιδηρούχα σχιστολιθικά εδάφη φτωχά σε οργανική ουσία. Κλασική ερυθρή οινοποίηση, παλαίωση 18 μήνες σε γαλλικά βαρέλια και 6 μήνες στη φιάλη.",
      tastingNotes: "Πυκνό, με βάθος και δομή που αντανακλά τα γερασμένα κλήματα.",
      foodPairings: ["Κόκκινα κρέατα", "Κυνήγι", "Παλαιωμένα τυριά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  for (const variety of [xinomavro, krasato, stavroto]) {
    await prisma.varietyOnWine.upsert({
      where: { wineId_varietyId: { wineId: rapsaniWine.id, varietyId: variety.id } },
      update: {},
      create: { wineId: rapsaniWine.id, varietyId: variety.id, percentage: null },
    });
  }

  // ── Ρομπόλα Κεφαλληνίας — πηγή: winesofgreece.org, greekgastronomyguide.gr ──
  const robolaCoop = await prisma.winery.upsert({
    where: { slug: "synetairismos-robolas-kefallinias" },
    update: {},
    create: {
      slug: "synetairismos-robolas-kefallinias",
      name: "Συνεταιρισμός Παραγωγών Ρομπόλας Κεφαλληνίας",
      regionId: regions["robola-kefallinias"].id,
      foundedYear: 1982,
      description:
        "Αγροτοβιομηχανικός συνεταιρισμός 301 μελών, κυρίως από την περιοχή Ομαλών-Τρωιαννάτων. Το οινοποιείο, στο οροπέδιο των Ομαλών (700μ), ολοκληρώθηκε το 1987. Οινοποιεί περίπου το 85% της συνολικής παραγωγής Ρομπόλας του νησιού.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const robolaWine = await prisma.wine.upsert({
    where: { slug: "robola-kefallinias-synetairismou" },
    update: {},
    create: {
      name: "Ρομπόλα Κεφαλληνίας",
      slug: "robola-kefallinias-synetairismou",
      wineryId: robolaCoop.id,
      regionId: regions["robola-kefallinias"].id,
      abv: 12,
      color: "WHITE",
      style: "DRY",
      tastingNotes:
        "Χρώμα λεμονί-πράσινο. Αρώματα εσπεριδοειδών, λεμονιού, βοτάνων, ορυκτότητας και τσακμακόπετρας. Ξηρό, με τραγανή οξύτητα, μέτριο σώμα και επίγευση λεμονιού.",
      foodPairings: ["Θαλασσινά", "Ψάρια", "Λευκά τυριά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: robolaWine.id, varietyId: robola.id } },
    update: { percentage: 100 },
    create: { wineId: robolaWine.id, varietyId: robola.id, percentage: 100 },
  });

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
