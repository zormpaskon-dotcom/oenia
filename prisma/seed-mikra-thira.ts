// Κτήμα Μικρά Θήρα — πλήρης κατάλογος. Πηγές: επίσημο tech sheet (WINES.pdf,
// δόθηκε από τον χρήστη) για Santorini/Terrasea/Nykteri, mikrathira.com/wine/
// για Mandilaria/Vinsanto, και ανακοίνωση mikrathira.com για το vintage 2017
// του Vinsanto (βραβευμένο ως Καλύτερος Οίνος στο Thessaloniki Wine &
// Spirits Trophy 2026).

import { Appellation, ContentStatus, MacroRegion, WineColor, WineStyle } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "mikra-thira" } });
  const santorini = await prisma.region.findUniqueOrThrow({ where: { slug: "santorini" } });
  const kyklades = await prisma.region.upsert({
    where: { slug: "kyklades" },
    update: {},
    create: {
      slug: "kyklades",
      name: "Κυκλάδες",
      macroRegion: MacroRegion.AEGEAN_ISLANDS,
      appellation: Appellation.PGI,
      description:
        "Ευρεία ζώνη ΠΓΕ που καλύπτει το σύνολο του νησιωτικού συμπλέγματος των Κυκλάδων, για κρασιά από γηγενείς ποικιλίες που δεν εμπίπτουν σε πιο συγκεκριμένη τοπική ΠΟΠ/ΠΓΕ ζώνη.",
    },
  });

  const assyrtiko = await prisma.variety.findUniqueOrThrow({ where: { slug: "asyrtiko" } });
  const aidani = await prisma.variety.findUniqueOrThrow({ where: { slug: "aidani" } });
  const athiri = await prisma.variety.findUniqueOrThrow({ where: { slug: "athiri" } });
  const mandilaria = await prisma.variety.findUniqueOrThrow({ where: { slug: "mandilaria" } });

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
    servingTemp: string | null;
    foodPairings: string[];
    varieties: Array<{ varietyId: string; percentage: number | null }>;
  }) {
    const wine = await prisma.wine.upsert({
      where: { slug: spec.slug },
      update: {
        name: spec.name,
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

  console.log("Κτήμα Μικρά Θήρα — 5 κρασιά…");

  // Terrasea — ενημέρωση υπάρχουσας εγγραφής με τα πραγματικά στοιχεία
  await upsertWine({
    slug: "mikra-thira-terrasea",
    name: "Terrasea",
    regionId: santorini.id,
    vintage: null,
    abv: 13,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PDO,
    description:
      "100% Ασύρτικο αποκλειστικά από αμπέλια της Θηρασιάς, καλλιεργημένα με τον παραδοσιακό τρόπο της «κουλούρας». Η μεγαλύτερη ποσότητα ζυμώνει σε ανοξείδωτες δεξαμενές και η υπόλοιπη σε δρύινα γαλλικά βαρέλια, με παραμονή στις οινολάσπες για 4 μήνες.",
    tastingNotes:
      "Βαθύ λεμονί χρώμα. Αρώματα χαμομηλιού, θυμαριού και ρίγανης που δένουν με νότες ροδάκινου και αχλαδιού. Γεμάτο, λιπαρό στόμα με εξαιρετική ισορροπία αλκοόλης-οξύτητας και χαρακτηριστική μεταλλικότητα τσακμακόπετρας. Πολύ μακρά επίγευση.",
    vineyardNotes: "Αμπέλια αποκλειστικά στη Θηρασιά, καλλιεργούμενα με την παραδοσιακή μέθοδο της «κουλούρας», με χαμηλές στρεμματικές αποδόσεις.",
    winemakingNotes: "Η μεγαλύτερη ποσότητα ζυμώνει σε ανοξείδωτες δεξαμενές, η υπόλοιπη σε δρύινα γαλλικά βαρέλια, με παραμονή στις οινολάσπες για 4 μήνες. Παλαιώνει καλά για 5-10 χρόνια.",
    servingTemp: "13 °C",
    foodPairings: ["Θαλασσινά", "Ψάρια σχάρας"],
    varieties: [{ varietyId: assyrtiko.id, percentage: 100 }],
  });

  // Santorini — χωρίς φωτογραφία ετικέτας (το Santorini.tif ήταν άδειο mockup)
  await upsertWine({
    slug: "mikra-thira-santorini",
    name: "Santorini",
    regionId: santorini.id,
    vintage: null,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PDO,
    description:
      "100% Ασύρτικο από σταφύλια που καλλιεργούνται στη Σαντορίνη με τον παραδοσιακό τρόπο της «κουλούρας», με χαμηλές στρεμματικές αποδόσεις. Κλασική λευκή οινοποίηση σε ανοξείδωτες ψυχόμενες δεξαμενές, με παραμονή στις οινολάσπες με ανάδευση για 4 μήνες.",
    tastingNotes:
      "Φωτεινό λεμονί χρώμα με πρασινωπές ανταύγειες. Αρώματα βοτάνων, πυρηνόκαρπων και τροπικών φρούτων όπως λίτσι και μάνγκο, με τυπικά μεταλλικά στοιχεία της ποικιλίας. Πλούσιο στόμα με ελαφρά αλμυρή γεύση, ισορροπημένη οξύτητα και μακρά ορυκτή επίγευση.",
    vineyardNotes: "Αμπέλια στη Σαντορίνη, καλλιεργούμενα με την παραδοσιακή μέθοδο της «κουλούρας», με χαμηλές στρεμματικές αποδόσεις.",
    winemakingNotes: "Κλασική λευκή οινοποίηση σε ανοξείδωτες ψυχόμενες δεξαμενές γύρω στους 16-18°C, με παραμονή στις οινολάσπες με ανάδευση για 4 μήνες. Παλαιώνει καλά για 4-8 χρόνια.",
    servingTemp: "11-12 °C",
    foodPairings: [],
    varieties: [{ varietyId: assyrtiko.id, percentage: 100 }],
  });

  // Nykteri
  await upsertWine({
    slug: "mikra-thira-nykteri",
    name: "Nykteri",
    regionId: santorini.id,
    vintage: 2021,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PDO,
    description:
      "Υπερώριμα σταφύλια τριών γηγενών ποικιλιών — Ασύρτικο, Αηδάνι και Αθήρι — συνοινοποιούνται, ακολουθώντας κλασική λευκή οινοποίηση σε ανοξείδωτες δεξαμενές. Το όνομά του προέρχεται από τη λέξη «νύχτα», καθώς σύμφωνα με τη σαντορινιά παράδοση τα σταφύλια πατιούνταν τη νύχτα που ακολουθούσε τον ολοήμερο τρύγο.",
    tastingNotes:
      "Βαθύ λεμονί χρώμα. Η στιβαρότητα του Ασύρτικου ισορροπεί με τα φρουτώδη αρώματα του Αθηριού και του Αηδανιού. Εκρηκτικό στόμα, με την περίφημη ελαφρά αλμυρή ορυκτή επίγευση των κρασιών της θηραϊκής γης.",
    vineyardNotes: "Υπερώριμα σταφύλια Ασύρτικου, Αηδανιού και Αθηριού από αμπέλια της Σαντορίνης.",
    winemakingNotes: "Συνοινοποίηση σε ανοξείδωτες δεξαμενές, με τη ζύμωση να ολοκληρώνεται σε δρύινα γαλλικά βαρέλια όπου παραμένει με τις οινολάσπες για 4 μήνες. Εμφιαλώνεται και παλαιώνει στο κελάρι για τουλάχιστον έναν χρόνο πριν κυκλοφορήσει· παλαιώνει καλά για 8-10 χρόνια.",
    servingTemp: "13 °C",
    foodPairings: [],
    varieties: [
      { varietyId: assyrtiko.id, percentage: null },
      { varietyId: aidani.id, percentage: null },
      { varietyId: athiri.id, percentage: null },
    ],
  });

  // Mandilaria — πηγή: mikrathira.com/wine/mandilaria
  await upsertWine({
    slug: "mikra-thira-mandilaria",
    name: "Mandilaria",
    regionId: kyklades.id,
    vintage: null,
    abv: null,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description:
      "100% Μανδηλαριά, η γηγενής ερυθρή ποικιλία των Κυκλάδων, από αμπελώνες στη Θηρασιά και τη Σαντορίνη σε ηφαιστειακά εδάφη, με χαμηλές στρεμματικές αποδόσεις.",
    tastingNotes:
      "Λαμπερό ρουμπινί χρώμα. Αρώματα άγριου κερασιού και φραγκοστάφυλου, με νότες κόκκινων φρούτων και τη χαρακτηριστική ορυκτότητα των ηφαιστειακών εδαφών των δύο νησιών. Πλούσιο και εκφραστικό στόμα, με βελούδινες τανίνες, ισορροπημένη οξύτητα και κομψή επίγευση.",
    vineyardNotes: "Αμπελώνες Μανδηλαριάς στη Θηρασιά και τη Σαντορίνη, σε ηφαιστειακά εδάφη, με χαμηλές στρεμματικές αποδόσεις.",
    winemakingNotes: "Ερυθρή οινοποίηση — μέρος του κρασιού ωριμάζει σε ανοξείδωτες δεξαμενές και το υπόλοιπο σε γαλλικά δρύινα βαρέλια, με παραμονή στις οινολάσπες για 6 μήνες. Παλαιώνει καλά για 6-8 χρόνια.",
    servingTemp: "16 °C",
    foodPairings: [],
    varieties: [{ varietyId: mandilaria.id, percentage: 100 }],
  });

  // Vinsanto — πηγή: mikrathira.com/wine/vinsanto (vintage 2017 από την
  // ανακοίνωση βράβευσής του στο Thessaloniki Wine & Spirits Trophy 2026)
  await upsertWine({
    slug: "mikra-thira-vinsanto",
    name: "Vinsanto",
    regionId: santorini.id,
    vintage: 2017,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.SWEET,
    appellation: Appellation.PDO,
    description:
      "Το πιο ιστορικό κρασί της Σαντορίνης, με καταγεγραμμένη παρουσία ήδη από τον 18ο αιώνα. Παράγεται από παλαιά, αυτόρριζα αμπέλια Ασύρτικου (95%) και Αηδανιού (5%), καλλιεργημένα σε ηφαιστειογενές έδαφος από ελαφρόπετρα, τέφρα και πυριτικά πετρώματα.",
    tastingNotes:
      "Βαθύ κεχριμπαρένιο χρώμα. Αρώματα αποξηραμένων φρούτων, μελιού και γλυκών μπαχαρικών. Πλούσιο, βελούδινο και απόλυτα ισορροπημένο στόμα, με μακρά, μεταξένια επίγευση.",
    vineyardNotes: "Παλαιά, αυτόρριζα αμπέλια Ασύρτικου και Αηδανιού σε ηφαιστειογενές έδαφος από ελαφρόπετρα, τέφρα και πυριτικά πετρώματα.",
    winemakingNotes: "Τα σταφύλια λιάζονται φυσικά για 7-10 ημέρες, συμπυκνώνοντας σάκχαρα, οξύτητα και αρώματα. Ακολουθεί αργή ζύμωση και ωρίμαση για οκτώ χρόνια σε δρύινα βαρέλια. Μπορεί να παλαιώσει επ' αόριστον στη φιάλη.",
    servingTemp: "9-11 °C",
    foodPairings: [],
    varieties: [
      { varietyId: assyrtiko.id, percentage: 95 },
      { varietyId: aidani.id, percentage: 5 },
    ],
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
