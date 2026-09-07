// Κτήμα Παυλίδη (Δράμα) — 7 νέα κρασιά + ενημέρωση του υπάρχοντος "Thema
// Λευκός", με άδεια του οινοποιείου. Στοιχεία από τις επίσημες σελίδες
// κάθε κρασιού (ktima-pavlidis.gr/wine/<slug>) και, για vintage, από την
// ίδια τη φωτογραφημένη ετικέτα. Το site δεν αναφέρει % αλκοόλ, ζεύγη
// φαγητού, ούτε θερμοκρασία σερβιρίσματος σε καμία σελίδα κρασιού — αυτά
// μένουν κενά αντί να εικαστούν. Το "Thema Ερυθρό" (Agiorgitiko-Syrah)
// υπάρχει στο site αλλά δεν στάλθηκε φωτογραφία γι' αυτό, οπότε
// παραλείπεται.

import { Appellation, ContentStatus, WineColor, WineStyle } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "pavlidis-estate" } });
  const drama = await prisma.region.findUniqueOrThrow({ where: { slug: "drama" } });

  const assyrtiko = await prisma.variety.findUniqueOrThrow({ where: { slug: "asyrtiko" } });
  const sauvignonBlanc = await prisma.variety.findUniqueOrThrow({ where: { slug: "sauvignon-blanc" } });
  const agiorgitiko = await prisma.variety.findUniqueOrThrow({ where: { slug: "agiorgitiko" } });
  const syrah = await prisma.variety.findUniqueOrThrow({ where: { slug: "syrah" } });
  const chardonnay = await prisma.variety.findUniqueOrThrow({ where: { slug: "chardonnay" } });

  const tempranillo = await prisma.variety.upsert({
    where: { slug: "tempranillo" },
    update: {},
    create: {
      name: "Tempranillo",
      slug: "tempranillo",
      type: "RED",
      originRegion: "Ισπανία",
      description:
        "Ισπανική ερυθρή ποικιλία («temprano» = νωρίς) που ωριμάζει νωρίτερα από άλλες ισπανικές ποικιλίες, κατάλληλη τόσο για ερυθρή όσο και για ροζέ οινοποίηση.",
    },
  });

  async function upsertWine(spec: {
    slug: string;
    name: string;
    vintage: number | null;
    abv: number | null;
    color: WineColor;
    style: WineStyle;
    description: string;
    tastingNotes: string;
    vineyardNotes: string;
    winemakingNotes: string;
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
        appellation: Appellation.PGI,
        regionId: drama.id,
        description: spec.description,
        tastingNotes: spec.tastingNotes,
        vineyardNotes: spec.vineyardNotes,
        winemakingNotes: spec.winemakingNotes,
        status: ContentStatus.PUBLISHED,
      },
      create: {
        slug: spec.slug,
        name: spec.name,
        wineryId: winery.id,
        regionId: drama.id,
        vintage: spec.vintage,
        abv: spec.abv,
        color: spec.color,
        style: spec.style,
        appellation: Appellation.PGI,
        description: spec.description,
        tastingNotes: spec.tastingNotes,
        vineyardNotes: spec.vineyardNotes,
        winemakingNotes: spec.winemakingNotes,
        foodPairings: [],
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

  console.log("Κτήμα Παυλίδη — 8 κρασιά…");

  await upsertWine({
    slug: "pavlidis-thema-leukos",
    name: "Thema Λευκός",
    vintage: 2024,
    abv: 13.5,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    description: "Γεννιέται από τη σύζευξη του Ασύρτικου με το Sauvignon Blanc — το χαρακτηριστικό λευκό χαρμάνι της ευρύτερης περιοχής της Δράμας.",
    tastingNotes:
      "Απαλό κιτρινοπράσινο χρώμα. Έντονη μύτη με αρώματα εσπεριδοειδών και λευκόσαρκων φρούτων, νύξεις φυτικότητας και, με τον καιρό, περισσότερη ορυκτότητα. Γεμάτο στόμα με κυρίαρχη οξύτητα και φρεσκάδα, φρουτώδης επίγευση με ροδάκινο, γκρέιπφρουτ και επίμονο λεμονάτο τελείωμα.",
    vineyardNotes: "Ο συνδυασμός Ασύρτικο-Sauvignon Blanc προέρχεται από τους αμπελώνες του Κτήματος στην Κοκκινόγεια και την Περιχώρα, στους πρόποδες του όρους Μενοίκιο, στη Δράμα.",
    winemakingNotes: "Εκχύμωση σε χαμηλές πιέσεις, ελεγχόμενη ζύμωση. Ωριμάζει σε ανοξείδωτη δεξαμενή με τις λεπτές οινολάσπες για 3 μήνες.",
    varieties: [
      { varietyId: assyrtiko.id, percentage: 50 },
      { varietyId: sauvignonBlanc.id, percentage: null },
    ],
  });

  await upsertWine({
    slug: "pavlidis-thema-rose",
    name: "Thema Ροζέ",
    vintage: 2024,
    abv: null,
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    description: "100% Tempranillo — η πρώιμη ωρίμανση της ισπανικής ποικιλίας τη καθιστά ιδανική για ροζέ οινοποίηση.",
    tastingNotes:
      "Λαμπερό απαλό κερασί χρώμα με μωβ ανταύγειες. Έντονη μύτη εσπεριδοειδών με νύξεις μικρών κόκκινων φρούτων, φράουλα και κεράσι. Ισορροπημένο, στρογγυλό στόμα με κυρίαρχη οξύτητα και φρέσκα φρούτα, φρουτώδης και ζωντανή επίγευση.",
    vineyardNotes: "Το Tempranillo καλλιεργείται στους αμπελώνες του Κτήματος στη Δράμα.",
    winemakingNotes: "Επαφή στεμφύλων-χυμού 10-15 ώρες για εκχύλιση χρώματος και αρωμάτων, ζύμωση υπό σταθερές συνθήκες. Ωριμάζει σε ανοξείδωτη δεξαμενή με τις λεπτές οινολάσπες για 3 μήνες.",
    varieties: [{ varietyId: tempranillo.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "pavlidis-alma",
    name: "Alma",
    vintage: 2024,
    abv: null,
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    description: "«Alma» στα ισπανικά σημαίνει «ψυχή» — χαρμάνι Αγιωργίτικου και Syrah από αμπελοτόπια έως 500m υψόμετρο, κυκλοφόρησε για πρώτη φορά το 2021.",
    tastingNotes:
      "Λαμπερό απαλό σομόν χρώμα με ροζ ανταύγειες. Έντονα αρώματα εσπεριδοειδών με κυρίαρχο το γκρέιπφρουτ και το σαγκουίνι, στοιχεία πυρηνόκαρπων όπως το ροδάκινο. Ανάλαφρο στόμα με τονισμένη οξύτητα και αίσθηση φρεσκάδας, έντονα φρουτώδης επίγευση με μεγάλη διάρκεια.",
    vineyardNotes: "Αμπελοτόπια σε υψόμετρο έως 500m στο Κτήμα Παυλίδη, στη Δράμα.",
    winemakingNotes: "Απευθείας πίεση, ελεγχόμενη ζύμωση. Ωριμάζει σε ανοξείδωτες και δρύινες δεξαμενές με τις λεπτές οινολάσπες για 6 μήνες.",
    varieties: [
      { varietyId: agiorgitiko.id, percentage: null },
      { varietyId: syrah.id, percentage: null },
    ],
  });

  await upsertWine({
    slug: "pavlidis-emphasis-agiorgitiko",
    name: "Emphasis Agiorgitiko",
    vintage: 2021,
    abv: null,
    color: WineColor.RED,
    style: WineStyle.DRY,
    description: "100% Αγιωργίτικο, προσαρμοσμένο εξαιρετικά στο μικρόκλιμα της Δράμας — από επιλεγμένο αμπελοτεμάχιο στις πλαγιές του Μενοικίου.",
    tastingNotes:
      "Μέτριο προς βαθύ ρουμπινί χρώμα. Φρουτώδη αρώματα κερασιού, βύσσινου και ώριμου κόκκινου δαμάσκηνου, νύξεις μαύρου πιπεριού. Γεμάτο και λιπαρό στόμα με πλούσιο φρούτο, φινετσάτες τανίνες και ικανοποιητική διάρκεια. Επιδέχεται μακρά παλαίωση.",
    vineyardNotes: "Επιλεγμένο αμπελοτεμάχιο στις πλαγιές του όρους Μενοίκιο, σε υψόμετρο περίπου 400m, με χαμηλές στρεμματικές αποδόσεις.",
    winemakingNotes: "Παλαιώνει 12 μήνες σε γαλλικά δρύινα βαρέλια και κεραμικούς αμφορείς, και ακολουθεί τουλάχιστον 12 μήνες παλαίωση στη φιάλη.",
    varieties: [{ varietyId: agiorgitiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "pavlidis-emphasis-assyrtiko",
    name: "Emphasis Assyrtiko",
    vintage: 2024,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    description: "100% Ασύρτικο από επιλεγμένο αμπελοτεμάχιο στις πλαγιές του Μενοικίου όρους στη Δράμα.",
    tastingNotes:
      "Απαλό κιτρινοπράσινο χρώμα. Έντονη μύτη ροδάκινου και λευκόσαρκων φρούτων που εξελίσσεται σε περισσότερη ορυκτότητα. Γεμάτο στόμα με κυρίαρχη οξύτητα και φρεσκάδα, μεγάλη επίγευση με έντονα χαρακτηριστικά ορυκτότητας και φρούτων. Επιδέχεται παλαίωση.",
    vineyardNotes: "Επιλεγμένο αμπελοτεμάχιο στις πλαγιές του όρους Μενοίκιο, σε υψόμετρο 550m, με χαμηλές στρεμματικές αποδόσεις.",
    winemakingNotes: "Ήπια πίεση με ολόκληρα τσαμπιά, ζύμωση σε μικρές ανοξείδωτες και δρύινες δεξαμενές. Ωριμάζει με τις λεπτές οινολάσπες για 6 μήνες.",
    varieties: [{ varietyId: assyrtiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "pavlidis-emphasis-syrah",
    name: "Emphasis Syrah",
    vintage: 2022,
    abv: null,
    color: WineColor.RED,
    style: WineStyle.DRY,
    description: "100% Syrah από επιλεγμένο αμπελοτεμάχιο στις πλαγιές του Μενοικίου όρους στη Δράμα.",
    tastingNotes:
      "Βαθύ πορφυρό χρώμα με μωβ ανταύγειες. Φρουτώδη αρώματα βατόμουρου, φρούτων του δάσους, βύσσινου και νύξεις βαρελιού. Γεμάτο και λιπαρό στόμα, εξαιρετική συμπύκνωση και ώριμες, αφομοιωμένες τανίνες, φρουτώδες και μπαχαρένιο τελείωμα. Ιδανικό για παλαίωση 15+ ετών.",
    vineyardNotes: "Επιλεγμένο αμπελοτεμάχιο στις πλαγιές του όρους Μενοίκιο, σε υψόμετρο περίπου 400m, με χαμηλές στρεμματικές αποδόσεις.",
    winemakingNotes: "Παλαιώνει 16 μήνες σε γαλλικά δρύινα βαρέλια και ακολούθως τουλάχιστον 12 μήνες στη φιάλη.",
    varieties: [{ varietyId: syrah.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "pavlidis-emphasis-chardonnay",
    name: "Emphasis Chardonnay",
    vintage: 2024,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    description: "100% Chardonnay από επιλεγμένο αμπελοτεμάχιο στις πλαγιές του Μενοικίου όρους στη Δράμα.",
    tastingNotes:
      "Απαλό κιτρινοπράσινο χρώμα. Εξελιγμένη μύτη με αρώματα ανανά και μάνγκο, νύξεις μελιού και δρυός. Στρογγυλό, γενναιόδωρο στόμα με ικανοποιητική οξύτητα, μακρά επίγευση όπου κυριαρχεί το φρούτο και απαλή ορυκτότητα. Επιδέχεται παλαίωση.",
    vineyardNotes: "Επιλεγμένο αμπελοτεμάχιο στις πλαγιές του όρους Μενοίκιο, σε υψόμετρο 550m, με χαμηλές στρεμματικές αποδόσεις.",
    winemakingNotes: "Ήπια πίεση με ολόκληρα τσαμπιά. Ζυμώνει και ωριμάζει σε δρύινα βαρέλια, δρύινες δεξαμενές και κεραμικούς αμφορείς για 6 μήνες.",
    varieties: [{ varietyId: chardonnay.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "pavlidis-emphasis-tempranillo",
    name: "Emphasis Tempranillo",
    vintage: 2022,
    abv: null,
    color: WineColor.RED,
    style: WineStyle.DRY,
    description: "100% Tempranillo από επιλεγμένο αμπελοτεμάχιο στις πλαγιές του Μενοικίου όρους στη Δράμα.",
    tastingNotes:
      "Βαθύ πορφυρό χρώμα. Μύτη με μικρά κόκκινα και μαύρα φρούτα, ορυκτώδεις νότες και υποψίες μπαχαρικών και ινδοκάρυδου. Γεμάτο, στρογγυλό στόμα με αίσθηση φρεσκάδας και ώριμες, στιβαρές τανίνες. Επίγευση διαρκείας, έντονα φρουτώδης με νότες βανίλιας. Ιδανικό για παλαίωση 15+ ετών.",
    vineyardNotes: "Επιλεγμένο αμπελοτεμάχιο στις πλαγιές του όρους Μενοίκιο, σε υψόμετρο 400m, με χαμηλές στρεμματικές αποδόσεις.",
    winemakingNotes: "Παλαιώνει 14 μήνες σε γαλλικά και αμερικανικά δρύινα βαρέλια, και ακολούθως τουλάχιστον 12 μήνες στη φιάλη.",
    varieties: [{ varietyId: tempranillo.id, percentage: 100 }],
  });

  console.log("Έτοιμο: 8 κρασιά Κτήμα Παυλίδη.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
