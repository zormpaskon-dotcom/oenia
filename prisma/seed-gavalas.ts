// Gavalas Winery (Σαντορίνη) — 6 κρασιά, με άδεια του οινοποιείου. Στοιχεία
// από τις επίσημες σελίδες κάθε κρασιού (gavalaswines.gr/el/<slug>) και,
// για vintage/ABV, από την ίδια τη φωτογραφημένη ετικέτα του μπουκαλιού
// που έστειλε ο χρήστης (πιο αξιόπιστη πηγή από το γενικό "τεχνικό φύλλο"
// του site, το οποίο δείχνει πάντα την τρέχουσα εσοδεία, όχι αυτή του
// συγκεκριμένου μπουκαλιού). Enalia: καμία ένδειξη αλκοόλ ορατή στην
// ετικέτα — μένει null.

import { Appellation, ContentStatus, WineColor, WineStyle } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "gavalas-winery" } });
  const santorini = await prisma.region.findUniqueOrThrow({ where: { slug: "santorini" } });

  const assyrtiko = await prisma.variety.findUniqueOrThrow({ where: { slug: "asyrtiko" } });
  const aidani = await prisma.variety.findUniqueOrThrow({ where: { slug: "aidani" } });
  const athiri = await prisma.variety.findUniqueOrThrow({ where: { slug: "athiri" } });
  const mavrotragano = await prisma.variety.findUniqueOrThrow({ where: { slug: "mavrotragano" } });

  async function upsertWine(spec: {
    slug: string;
    name: string;
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
        vintage: spec.vintage,
        abv: spec.abv,
        color: spec.color,
        style: spec.style,
        appellation: spec.appellation,
        regionId: santorini.id,
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
        regionId: santorini.id,
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

  console.log("Gavalas Winery — 6 κρασιά…");

  await upsertWine({
    slug: "gavalas-santorini-assyrtiko",
    name: "Santorini",
    vintage: 2013,
    abv: 13,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PDO,
    description:
      "Παλαιά κλήματα Ασύρτικου ηλικίας άνω των 50 ετών από το Μεγαλοχώρι, το Ακρωτήρι και τον Πύργο. Κλασική λευκή οινοποίηση, με δυναμικό παλαίωσης 6+ ετών (παραγωγή περίπου 60.000 φιάλες).",
    tastingNotes:
      "Αρώματα λεμονιού, αχλαδιού και ροδάκινου πλαισιώνουν την τυπική αλατότητα και ορυκτότητα του Ασύρτικου. Γεμάτο σώμα με υψηλή οξύτητα και μακρά επίγευση.",
    vineyardNotes: "Παλαιά κλήματα ηλικίας άνω των 50 ετών από τις περιοχές Μεγαλοχώρι, Ακρωτήρι και Πύργος της Σαντορίνης.",
    winemakingNotes:
      "Κλασική λευκή οινοποίηση: ζύμωση σε ανοξείδωτες δεξαμενές σε ελεγχόμενη θερμοκρασία, ωρίμανση με τις φίνες οινολάσπες για τουλάχιστον 5 μήνες.",
    servingTemp: "8-10 °C",
    foodPairings: ["Ψάρια", "Θαλασσινά", "Όστρακα", "Λευκά κρέατα"],
    varieties: [{ varietyId: assyrtiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "gavalas-santorini-natural-ferment",
    name: "Santorini Γηγενείς Ζύμες",
    vintage: 2013,
    abv: 13,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PDO,
    description:
      "Παλαιά κλήματα Ασύρτικου 50+ ετών, κυρίως από το Μεγαλοχώρι, με ζύμωση αποκλειστικά από άγριες (γηγενείς) ζύμες ώστε να αναδειχθεί ο ποικιλιακός χαρακτήρας. Περιορισμένη παραγωγή 4.000 φιαλών.",
    tastingNotes:
      "Αρώματα πυρηνόκαρπων και ζύμης πλαισιώνουν την τυπική αλατότητα και ορυκτότητα του Ασύρτικου. Γεμάτο σώμα, κρεμώδης υφή με υψηλή οξύτητα και μακρά επίγευση.",
    vineyardNotes: "Παλαιά κλήματα ηλικίας 50+ ετών, κυρίως από την περιοχή του Μεγαλοχωρίου στη Σαντορίνη.",
    winemakingNotes:
      "Ζύμωση σε ανοξείδωτες δεξαμενές σε ελεγχόμενη θερμοκρασία, αποκλειστικά με άγριες (γηγενείς) ζύμες. Μακρά ζύμωση έως 2 μήνες και ωρίμανση με τις οινολάσπες για 6-8 μήνες.",
    servingTemp: null,
    foodPairings: ["Θαλασσινά", "Μεγάλα ψάρια", "Λευκά κρέατα με λιπαρές σάλτσες"],
    varieties: [{ varietyId: assyrtiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "gavalas-nychteri",
    name: "Νυχτέρι",
    vintage: 2013,
    abv: 13.5,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PDO,
    description:
      "Υπερώριμα σταφύλια Ασύρτικου από παλιά κλήματα 50+ ετών στο Μεγαλοχώρι, με τρύγο στα τέλη Αυγούστου. Δυναμικό παλαίωσης 8+ ετών, παραγωγή 4.000 φιάλες.",
    tastingNotes:
      "Η οξειδωτική ωρίμαση δίνει στο Νυχτέρι τα ιδιαίτερα χαρακτηριστικά του: πολύπλοκη μύτη με αρώματα ξηρών καρπών, βανίλιας, ώριμων φρούτων και μελιού, μαζί με την ορυκτότητα του Ασύρτικου. Γεμάτο σώμα, υψηλό αλκοόλ και μακρά επίγευση.",
    vineyardNotes: "Παλαιά κλήματα ηλικίας άνω των 50 ετών στο Μεγαλοχώρι. Χρήση υπερώριμων σταφυλιών με τρύγο στα τέλη Αυγούστου.",
    winemakingNotes:
      "Ζύμωση σε ανοξείδωτες δεξαμενές με μεταφορά σε γαλλικά δρύινα βαρέλια ελαφρού καψίματος για ολοκλήρωση της ζύμωσης, και ωρίμανση με τις οινολάσπες για 6-8 μήνες.",
    servingTemp: null,
    foodPairings: ["Λιπαρά ψάρια", "Λευκά κρέατα"],
    varieties: [{ varietyId: assyrtiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "gavalas-enalia",
    name: "Enalia",
    vintage: 2018,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PDO,
    description:
      "Επιλεγμένα αμπελοτόπια Ασύρτικου άνω των 120 ετών στον Πύργο και το Μεγαλοχώρι. Συνολική παλαίωση 3 ετών από τον τρύγο, σε πολύ περιορισμένη παραγωγή (1.300-2.700 αριθμημένες φιάλες).",
    tastingNotes:
      "Αρώματα ώριμων πυρηνόκαρπων πλαισιώνουν την τυπική ορυκτότητα του Ασύρτικου. Γεμάτο, λιπαρό σώμα με υψηλή οξύτητα και ελαφρά τανικότητα.",
    vineyardNotes: "Επιλεγμένα αμπελοτόπια άνω των 120 ετών στον Πύργο και το Μεγαλοχώρι της Σαντορίνης.",
    winemakingNotes:
      "Χρήση ολόκληρου τσαμπιού κατά την πίεση. Παραμονή σε ανοξείδωτες δεξαμενές με τις φίνες οινολάσπες για 16 μήνες, με περαιτέρω παλαίωση στη φιάλη για ενάμιση χρόνο.",
    servingTemp: null,
    foodPairings: ["Λιπαρά ψάρια", "Όστρακα", "Λευκά κρέατα"],
    varieties: [{ varietyId: assyrtiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "gavalas-mavrotragano",
    name: "Μαυροτράγανο",
    vintage: 2013,
    abv: 13,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description:
      "Το Μαυροτράγανο, η κύρια ερυθρή ποικιλία της Σαντορίνης, ήταν υπό εξαφάνιση πριν λίγα χρόνια. Πολυδυναμική ποικιλία με μεγάλο δυναμικό παλαίωσης (10+ έτη), από αμπέλια διάσπαρτα σε όλο το νησί. Παραγωγή 3.000 φιάλες.",
    tastingNotes: "Συμπυκνωμένα αρώματα μαύρων φρούτων, μπαχαρικών και πιπεριού. Γεμάτο σώμα με υψηλή οξύτητα και μαλακές τανίνες.",
    vineyardNotes: "Αμπέλια Μαυροτράγανου διάσπαρτα σε όλο το νησί της Σαντορίνης.",
    winemakingNotes:
      "Κλασική ερυθρή οινοποίηση με 4-7 ημέρες προζυμωτική εκχύλιση. Ζύμωση σε ανοξείδωτες δεξαμενές με μακρά εκχύλιση και καθημερινές ανακυκλώσεις. Παλαίωση σε γαλλικά και αμερικανικά δρύινα βαρέλια 1ης-3ης χρήσης για 12 μήνες.",
    servingTemp: null,
    foodPairings: ["Κόκκινα κρέατα", "Κυνήγι", "Παλαιωμένα καπνιστά τυριά"],
    varieties: [{ varietyId: mavrotragano.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "gavalas-vinsanto",
    name: "Vinsanto",
    vintage: 2009,
    abv: 10,
    color: WineColor.WHITE,
    style: WineStyle.SWEET,
    appellation: Appellation.PDO,
    description:
      "Παραδοσιακό Vinsanto Σαντορίνης από σταφύλια που λιάζονται 10-15 μέρες για να συμπυκνωθούν τα σάκχαρά τους, με φυσική ζύμωση σε παλιά ρώσικα δρύινα βαρέλια 1.500 λίτρων. Δυναμικό παλαίωσης 20+ έτη, παραγωγή 3.000 φιάλες.",
    tastingNotes:
      "Πολύπλοκα αρώματα σταφίδας, σύκου, δαμάσκηνου, καραμέλας, μαύρης σοκολάτας και καφέ. Συμπυκνωμένο σώμα με υψηλή οξύτητα και μακρά επίγευση.",
    vineyardNotes: "Ο τρύγος ξεκινά στα τέλη Αυγούστου, με σταφύλια από αμπελώνες κυρίως στο νότιο κομμάτι της Σαντορίνης, στο επιθυμητό στάδιο ωρίμασης (14-15 Be).",
    winemakingNotes:
      "Τα σταφύλια λιάζονται 10-15 μέρες για να συμπυκνωθούν τα σάκχαρά τους. Η ζύμωση γίνεται με φυσικό τρόπο σε παλιά ρώσικα δρύινα βαρέλια 1.500 λίτρων, όπου το κρασί παλαιώνει στη συνέχεια για 6 χρόνια.",
    servingTemp: null,
    foodPairings: ["Κέικ σοκολάτας", "Μαύρη σοκολάτα", "Παγωτό", "Σιροπιαστά", "Παλαιωμένα τυριά"],
    varieties: [
      { varietyId: assyrtiko.id, percentage: 85 },
      { varietyId: aidani.id, percentage: 10 },
      { varietyId: athiri.id, percentage: 5 },
    ],
  });

  console.log("Έτοιμο: 6 κρασιά Gavalas Winery.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
