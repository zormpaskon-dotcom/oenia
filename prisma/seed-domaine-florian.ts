// Domaine Florian — 8 ετικέτες με επιβεβαιωμένη σύνθεση ποικιλίας από
// το επίσημο site (domaineflorian.com), με άδεια του οινοποιείου.
// 2 από τις 8 (Σύρα 2015, Καζανόβα Μπαρίκ) έχουν πλήρη τεχνικά
// στοιχεία/γευστικές σημειώσεις από τη σελίδα προϊόντος τους — οι
// υπόλοιπες 6 έχουν μόνο επιβεβαιωμένη ποικιλία (καμία περιγραφή στο
// site τους), οπότε το description/tastingNotes μένει ελάχιστο/κενό
// αντί να μαντέψουμε.
//
// Παραλείπονται σκόπιμα 4 blends της λίστας (Symphony, Symphony Rosé,
// Terzetto, Rondo Blanc) — το site δεν αναφέρει τη σύνθεση ποικιλιών
// τους πουθενά, εκκρεμεί επιβεβαίωση απευθείας από το οινοποιείο.

import { Appellation, ContentStatus, WineColor, WineStyle } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "domaine-florian" } });
  const region = await prisma.region.findUniqueOrThrow({ where: { slug: "thessaloniki" } });

  const chardonnay = await prisma.variety.findUniqueOrThrow({ where: { name: "Chardonnay" } });
  const malagousia = await prisma.variety.findUniqueOrThrow({ where: { name: "Μαλαγουζιά" } });
  const sauvignonBlanc = await prisma.variety.findUniqueOrThrow({ where: { name: "Sauvignon Blanc" } });
  const syrah = await prisma.variety.findUniqueOrThrow({ where: { name: "Syrah" } });

  async function upsertWine(spec: {
    slug: string;
    name: string;
    vintage: number;
    color: WineColor;
    style: WineStyle;
    abv: number | null;
    description: string;
    tastingNotes: string | null;
    servingTemp: string | null;
    foodPairings: string[];
    varietyId: string;
  }) {
    const wine = await prisma.wine.upsert({
      where: { slug: spec.slug },
      update: {
        name: spec.name,
        vintage: spec.vintage,
        color: spec.color,
        style: spec.style,
        abv: spec.abv,
        appellation: Appellation.PGI,
        description: spec.description,
        tastingNotes: spec.tastingNotes,
        servingTemp: spec.servingTemp,
        foodPairings: spec.foodPairings,
        status: ContentStatus.PUBLISHED,
      },
      create: {
        slug: spec.slug,
        name: spec.name,
        wineryId: winery.id,
        regionId: region.id,
        vintage: spec.vintage,
        color: spec.color,
        style: spec.style,
        abv: spec.abv,
        appellation: Appellation.PGI,
        description: spec.description,
        tastingNotes: spec.tastingNotes,
        servingTemp: spec.servingTemp,
        foodPairings: spec.foodPairings,
        status: ContentStatus.PUBLISHED,
      },
    });
    await prisma.varietyOnWine.upsert({
      where: { wineId_varietyId: { wineId: wine.id, varietyId: spec.varietyId } },
      update: { percentage: 100 },
      create: { wineId: wine.id, varietyId: spec.varietyId, percentage: 100 },
    });
    return wine;
  }

  console.log("8 ετικέτες Domaine Florian…");

  // Σύρα 2015 — ενημέρωση του ήδη υπάρχοντος wine, με πλήρη στοιχεία από domaineflorian.com
  await upsertWine({
    slug: "domaine-florian-syrah",
    name: "Σύρα",
    vintage: 2015,
    color: WineColor.RED,
    style: WineStyle.DRY,
    abv: 14.4,
    description:
      "100% Syrah, βιολογικής καλλιέργειας, από τον αμπελώνα του κτήματος στον Τρίλοφο Θεσσαλονίκης — το υψόμετρο και η γεωμορφολογία της τοποθεσίας ευνοούν τη βιοκαλλιέργεια. Τρύγος την πρώτη εβδομάδα Σεπτεμβρίου, ζύμωση σε χαμηλή θερμοκρασία σε βαρέλια Barrique (μισά καινούρια, μισά δεύτερης χρήσης), μηλογαλακτική ζύμωση, παλαίωση 24 μήνες σε βαρέλι και τουλάχιστον 1 έτος στη φιάλη. Αφιλτράριστο.",
    tastingNotes: "Βαθύ, συμπυκνωμένο πορφυρό χρώμα με ιώδεις ανταύγειες. Μύτη με κεράσι, φραγκοστάφυλο, δαμάσκηνο και μαύρη σοκολάτα, με νότες βανίλιας και καραμέλας. Στο στόμα ρουστίκ, με μέτριες αλλά δυνατές τανίνες και αναζωογονητική οξύτητα, γεύσεις αποξηραμένου δαμάσκηνου, σταφίδας και ώριμου μαύρου κερασιού, με κακάο, εσπρέσο, κέδρο, κανέλα και πιπέρι.",
    servingTemp: null,
    foodPairings: [],
    varietyId: syrah.id,
  });

  // Καζανόβα Μπαρίκ — πλήρη στοιχεία από domaineflorian.com
  await upsertWine({
    slug: "domaine-florian-casanova-barrique",
    name: "Καζανόβα Μπαρίκ",
    vintage: 2013,
    color: WineColor.WHITE,
    style: WineStyle.OFF_DRY,
    abv: 17.2,
    description:
      "100% Chardonnay από τον αμπελώνα του κτήματος στον Τρίλοφο Θεσσαλονίκης — σύνθετος, ημίξηρος οίνος τύπου aperitif. Τρύγος Αύγουστος 2013, εμφιάλωση Μάρτιος 2014, απόδοση 5.000 λίτρα/εκτάριο. Φιάλη 375ml, πώμα διπλού φελλού.",
    tastingNotes: "Το μπουκέτο αυτού του aperitif οίνου ανοίγει όμορφα αν σερβιριστεί σε θερμοκρασία δωματίου πάνω σε πάγο. Εκλεπτυσμένο άρωμα με ισορροπία γλυκύτητας και έντασης, αρωματικό και σαγηνευτικό προφίλ.",
    servingTemp: "8-11 °C",
    foodPairings: ["Aperitif"],
    varietyId: chardonnay.id,
  });

  // Chardonnay 2021 — μόνο επιβεβαιωμένη ποικιλία, καμία περιγραφή στο site
  await upsertWine({
    slug: "domaine-florian-chardonnay",
    name: "Chardonnay",
    vintage: 2021,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    abv: null,
    description: "100% Chardonnay από τον αμπελώνα του κτήματος στον Τρίλοφο Θεσσαλονίκης.",
    tastingNotes: null,
    servingTemp: null,
    foodPairings: [],
    varietyId: chardonnay.id,
  });

  // Chardonnay Barrique 2019
  await upsertWine({
    slug: "domaine-florian-chardonnay-barrique",
    name: "Chardonnay Barrique",
    vintage: 2019,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    abv: null,
    description: "100% Chardonnay με παλαίωση σε βαρέλι δρυός, από τον αμπελώνα του κτήματος στον Τρίλοφο Θεσσαλονίκης.",
    tastingNotes: null,
    servingTemp: null,
    foodPairings: [],
    varietyId: chardonnay.id,
  });

  // Μαλαγουζιά 2022
  await upsertWine({
    slug: "domaine-florian-malagousia",
    name: "Μαλαγουζιά",
    vintage: 2022,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    abv: null,
    description: "100% Μαλαγουζιά από τον αμπελώνα του κτήματος στον Τρίλοφο Θεσσαλονίκης.",
    tastingNotes: null,
    servingTemp: null,
    foodPairings: [],
    varietyId: malagousia.id,
  });

  // Sauvignon Blanc 2020
  await upsertWine({
    slug: "domaine-florian-sauvignon-blanc",
    name: "Sauvignon Blanc",
    vintage: 2020,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    abv: null,
    description: "100% Sauvignon Blanc από τον αμπελώνα του κτήματος στον Τρίλοφο Θεσσαλονίκης.",
    tastingNotes: null,
    servingTemp: null,
    foodPairings: [],
    varietyId: sauvignonBlanc.id,
  });

  // Sauvignon Blanc Fumé 2021
  await upsertWine({
    slug: "domaine-florian-sauvignon-blanc-fume",
    name: "Sauvignon Blanc Fumé",
    vintage: 2021,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    abv: null,
    description: "100% Sauvignon Blanc σε στιλ «fumé» (επαφή με δρυ), από τον αμπελώνα του κτήματος στον Τρίλοφο Θεσσαλονίκης.",
    tastingNotes: null,
    servingTemp: null,
    foodPairings: [],
    varietyId: sauvignonBlanc.id,
  });

  // Syrah Ροζέ 2022
  await upsertWine({
    slug: "domaine-florian-syrah-rose",
    name: "Syrah Ροζέ",
    vintage: 2022,
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    abv: null,
    description: "100% Syrah οινοποιημένο ως ροζέ, από τον αμπελώνα του κτήματος στον Τρίλοφο Θεσσαλονίκης.",
    tastingNotes: null,
    servingTemp: null,
    foodPairings: [],
    varietyId: syrah.id,
  });

  console.log("Done: 8 ετικέτες Domaine Florian (1 ενημέρωση + 7 νέες).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
