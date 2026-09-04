// Πλήρης κατάλογος του Οινοποιείου Δουλουφάκη — 20 ετικέτες, με ρητή
// άδεια του ίδιου του οινοποιείου. Πηγή: επίσημα PDF τεχνικά δελτία
// (sell sheets) που μας έστειλαν απευθείας, ένα ανά ετικέτα.
// Αντικαθιστά/εμπλουτίζει το προηγούμενο, μοναδικό "Dafnios Vidiano"
// wine του douloufakis με ολόκληρο τον πραγματικό κατάλογο.

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
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "douloufakis" } });
  const dafnes = await prisma.region.findUniqueOrThrow({ where: { slug: "dafnes" } });

  console.log("Νέες ποικιλίες…");
  const tachtas = await ensureVariety("Ταχτάς", VarietyType.WHITE, {
    originRegion: "Δαφνές, Ηράκλειο Κρήτης",
    description:
      "Σπάνια, σχεδόν ξεχασμένη κρητική λευκή ποικιλία με μεγάλες χρυσοκίτρινες ρώγες — χρησιμοποιούνταν παλαιότερα και για παραγωγή σταφίδας, πριν εκτοπιστεί από τη Σουλτανίνα. Διαδεδομένη στις Δαφνές μέχρι τη δεκαετία του '70. Αναβιώθηκε από το Οινοποιείο Δουλουφάκη.",
    characteristics: "Βαθύ κίτρινο χρώμα, εκρηκτικά αρώματα αχλαδιού σε σιρόπι, ροδάκινου, βερίκοκου και λουλουδιών, γλυκιά αίσθηση, μέτριο σώμα, μαλακή και στρογγυλή υφή.",
    acidity: 50,
    body: 55,
    tannins: 0,
  });
  const malvasiaDiCandia = await ensureVariety("Malvasia di Candia Aromatica", VarietyType.WHITE, {
    originRegion: "Κρήτη (Χάνδακας/Candia)",
    description:
      "Ιστορική αρωματική λευκή ποικιλία, διάσημη στην Κρήτη κατά την περίοδο της Ενετοκρατίας (14ος-16ος αιώνας), όταν το νησί ήταν γνωστό ως Candia. Ξαναπέρασε πρόσφατα στο προσκήνιο του κρητικού αμπελώνα.",
    characteristics: "Έντονα αρώματα λεμονανθών, γιασεμιού και εξωτικών φρούτων (passion fruit, μάνγκο), ζωηρή οξύτητα, ξηρή γεύση παρά την πλούσια αρωματική ένταση.",
    acidity: 65,
    body: 50,
    tannins: 0,
  });
  const muscatRed = await ensureVariety("Μοσχάτο Ερυθρό", VarietyType.RED, {
    originRegion: "Κρήτη",
    description: "Ερυθρός κλώνος του Μοσχάτου, καλλιεργείται περιορισμένα στην Κρήτη — δίνει αρωματικά, μαλακά κρασιά, συχνά σε ημίγλυκες συνθέσεις.",
    characteristics: "Μοσχάτα αρώματα, μαλακές τανίνες, φυσική γλυκύτητα.",
    acidity: 45,
    body: 50,
    tannins: 30,
  });

  const liatiko = await prisma.variety.findUniqueOrThrow({ where: { name: "Λιάτικο" } });
  const vidiano = await prisma.variety.findUniqueOrThrow({ where: { name: "Βιδιανό" } });
  const sauvignonBlanc = await prisma.variety.findUniqueOrThrow({ where: { name: "Sauvignon Blanc" } });
  const syrah = await prisma.variety.findUniqueOrThrow({ where: { name: "Syrah" } });
  const xinomavro = await prisma.variety.findUniqueOrThrow({ where: { name: "Ξινόμαυρο" } });
  const assyrtiko = await prisma.variety.findUniqueOrThrow({ where: { name: "Ασύρτικο" } });
  const vilana = await prisma.variety.findUniqueOrThrow({ where: { name: "Βηλάνα" } });
  const moschatoSpinas = await prisma.variety.findUniqueOrThrow({ where: { name: "Μοσχάτο Σπίνας" } });
  const kotsifali = await prisma.variety.findUniqueOrThrow({ where: { name: "Κοτσιφάλι" } });
  const sangiovese = await prisma.variety.findUniqueOrThrow({ where: { name: "Sangiovese" } });
  const cabernetSauvignon = await prisma.variety.findUniqueOrThrow({ where: { name: "Cabernet Sauvignon" } });

  async function upsertWine(spec: {
    slug: string;
    name: string;
    vintage: number | null;
    color: WineColor;
    style: WineStyle;
    abv: number;
    appellation: Appellation | null;
    isSparkling?: boolean;
    description: string;
    tastingNotes: string;
    servingTemp: string;
    foodPairings: string[];
    varieties: Array<{ variety: { id: string }; percentage: number | null }>;
  }) {
    const wine = await prisma.wine.upsert({
      where: { slug: spec.slug },
      update: {
        name: spec.name,
        vintage: spec.vintage,
        color: spec.color,
        style: spec.style,
        abv: spec.abv,
        appellation: spec.appellation,
        isSparkling: spec.isSparkling ?? false,
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
        regionId: dafnes.id,
        vintage: spec.vintage,
        color: spec.color,
        style: spec.style,
        abv: spec.abv,
        appellation: spec.appellation,
        isSparkling: spec.isSparkling ?? false,
        description: spec.description,
        tastingNotes: spec.tastingNotes,
        servingTemp: spec.servingTemp,
        foodPairings: spec.foodPairings,
        status: ContentStatus.PUBLISHED,
      },
    });
    for (const v of spec.varieties) {
      await prisma.varietyOnWine.upsert({
        where: { wineId_varietyId: { wineId: wine.id, varietyId: v.variety.id } },
        update: { percentage: v.percentage },
        create: { wineId: wine.id, varietyId: v.variety.id, percentage: v.percentage },
      });
    }
    return wine;
  }

  console.log("20 ετικέτες Δουλουφάκη…");

  // 1. Dafnios Λευκός — ενημέρωση του ήδη υπάρχοντος wine (νέα εσοδεία 2025)
  await upsertWine({
    slug: "douloufakis-dafnios-vidiano",
    name: "Dafnios Λευκός",
    vintage: 2025,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    abv: 13.1,
    appellation: Appellation.PGI,
    description: "100% Βιδιανό, η κρητική ποικιλία που είχε ξεχαστεί για χρόνια πριν αναβιωθεί. Κλασική λευκή οινοποίηση σε ανοξείδωτες δεξαμενές, χωρίς καθόλου χρήση βαρελιού.",
    tastingNotes: "Απαλό χρυσαφί χρώμα. Κυριαρχούν αρώματα ροδάκινου και βερίκοκου με ίχνη κυδωνιού, ανθικές νότες χαμομηλιού και γιασεμιού. Πλούσια γεύση με ισορροπημένη οξύτητα, γεμάτο σώμα και καλή επίγευση.",
    servingTemp: "9-10 °C",
    foodPairings: ["Ψάρια σχάρας", "Χοιρινό", "Κρητική κουζίνα"],
    varieties: [{ variety: vidiano, percentage: 100 }],
  });

  // 2. Dafnios Ερυθρός
  await upsertWine({
    slug: "douloufakis-dafnios-red",
    name: "Dafnios Ερυθρός",
    vintage: 2022,
    color: WineColor.RED,
    style: WineStyle.DRY,
    abv: 13.1,
    appellation: Appellation.PDO,
    description: "100% Λιάτικο από τις Δαφνές Ηρακλείου, σε υψόμετρο 350μ. Ζύμωση σε ανοξείδωτες δεξαμενές, παλαίωση 12 μήνες σε γαλλική δρυ 1,5t και 3t.",
    tastingNotes: "Ντελικάτο, ελαφρύ κρασί με ρουμπινί χρώμα. Συμπυκνωμένα αρώματα φρέσκων κόκκινων φρούτων και βοτάνων. Μέτριο σώμα, καλή οξύτητα, μαλακές και νόστιμες τανίνες.",
    servingTemp: "17 °C",
    foodPairings: ["Κόκκινα κρέατα", "Κρητική κουζίνα"],
    varieties: [{ variety: liatiko, percentage: 100 }],
  });

  // 3. Sauvignon Blanc
  await upsertWine({
    slug: "douloufakis-sauvignon-blanc",
    name: "Sauvignon Blanc",
    vintage: 2025,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    abv: 12,
    appellation: Appellation.PGI,
    description: "100% Sauvignon Blanc, με το ζεστό κρητικό κλίμα να προσθέτει σώμα και ψυχή χωρίς να χάνεται η φρεσκάδα της ποικιλίας. Ζύμωση στους 18°C σε ανοξείδωτες δεξαμενές.",
    tastingNotes: "Λαμπερό χρώμα με κιτρινοπράσινες ανταύγειες. Έντονο, λεπτό άρωμα, γεμάτο σώμα, καλά δομημένο, με τραγανή οξύτητα και καλοκαιρινή ζωντάνια.",
    servingTemp: "9-10 °C",
    foodPairings: ["Θαλασσινά", "Ψάρια"],
    varieties: [{ variety: sauvignonBlanc, percentage: 100 }],
  });

  // 4. Alargo Ερυθρός (Syrah)
  await upsertWine({
    slug: "douloufakis-alargo-red",
    name: "Alargo Ερυθρός",
    vintage: 2022,
    color: WineColor.RED,
    style: WineStyle.DRY,
    abv: 14.3,
    appellation: Appellation.PGI,
    description: "100% Syrah, θερμό και φρουτώδες, από τις Δαφνές Ηρακλείου. Ζύμωση στους 24-28°C, παλαίωση 12 μήνες σε γαλλικά δρύινα βαρέλια (καινούρια, δεύτερης και τρίτης χρήσης).",
    tastingNotes: "Βαθύχρωμο κόκκινο, σχεδόν πορφυρό. Πολυσύνθετο μπουκέτο με δαμάσκηνο, μαρμελάδα σκουρόχρωμου κερασιού, βανίλια και μαύρη σοκολάτα. Παχιά γεύση, νόστιμες τανίνες, μακριά και πικάντικη επίγευση.",
    servingTemp: "17 °C",
    foodPairings: ["Κόκκινα κρέατα", "Κυνήγι"],
    varieties: [{ variety: syrah, percentage: 100 }],
  });

  // 5. Ταχτάς
  await upsertWine({
    slug: "douloufakis-tachtas",
    name: "Ταχτάς",
    vintage: 2025,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    abv: 12.3,
    appellation: null,
    description: "Η πρώτη κυκλοφορία του Ταχτά Δουλουφάκη, σε μόλις 2.000 φιάλες — μια σχεδόν ξεχασμένη κρητική λευκή ποικιλία. Κλασική λευκή οινοποίηση, ζύμωση στους 18°C σε ανοξείδωτες δεξαμενές.",
    tastingNotes: "Βαθύ κίτρινο χρώμα, εκρηκτική μύτη με αχλάδι βρασμένο σε σιρόπι, ώριμο ροδάκινο, βερίκοκο και λουλούδια. Γλυκιά αίσθηση, μαλακό και στρογγυλό στόμα, μέτριο σώμα.",
    servingTemp: "9-10 °C",
    foodPairings: ["Λευκά κρέατα", "Ζυμαρικά au gratin"],
    varieties: [{ variety: tachtas, percentage: 100 }],
  });

  // 6. Νότος εγώ Βοριάς εσύ
  await upsertWine({
    slug: "douloufakis-notos-borias",
    name: "Νότος εγώ Βοριάς εσύ",
    vintage: 2019,
    color: WineColor.RED,
    style: WineStyle.DRY,
    abv: 13.2,
    appellation: null,
    description: "Χαρμάνι 80% Ξινόμαυρο (Βόρεια Ελλάδα) και 20% Λιάτικο (Κρήτη) — ένας «γάμος» δύο ελληνικών terroirs από αντίθετα άκρα της χώρας. Ζύμωση σε ελεγχόμενη θερμοκρασία 20-25°C, παλαίωση 12 μήνες σε δρύινα βαρέλια τρίτης χρήσης.",
    tastingNotes: "Βαθυκόκκινο χρώμα, έντονα αρώματα κερασιού, λιαστής ντομάτας και φύλλου ντομάτας. Στον ουρανίσκο, ώριμα κόκκινα φρούτα, μπαχαρικά και διακριτικές νότες βανίλιας και σοκολάτας, με επίμονη επίγευση.",
    servingTemp: "16-18 °C",
    foodPairings: ["Κόκκινα κρέατα", "Μουσακάς", "Γεμιστά"],
    varieties: [
      { variety: xinomavro, percentage: 80 },
      { variety: liatiko, percentage: 20 },
    ],
  });

  // 7. Dafnios Ροζέ
  await upsertWine({
    slug: "douloufakis-dafnios-rose",
    name: "Dafnios Ροζέ",
    vintage: 2025,
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    abv: 12.8,
    appellation: Appellation.PGI,
    description: "Συν-οινοποίηση 80% Λιάτικο και 20% Βιδιανό, των δύο πιο ξεχωριστών κρητικών ποικιλιών — το Λιάτικο δίνει αρώματα κόκκινων φρούτων, το Βιδιανό σώμα και φρεσκάδα.",
    tastingNotes: "Ελκυστικό ανοιχτό-ροζ χρώμα με onion skin αποχρώσεις. Αρώματα αποξηραμένου γιασεμιού, κόκκινων φρούτων και γλυκάνισου, με φρέσκο πετροκέρασο και εξαιρετική οξύτητα. Ελαφρώς θαλασσινές και πιπεράτες νότες.",
    servingTemp: "11-13 °C",
    foodPairings: ["Μεσογειακή κουζίνα", "Γεμιστά", "Θαλασσινά ζυμαρικά"],
    varieties: [
      { variety: liatiko, percentage: 80 },
      { variety: vidiano, percentage: 20 },
    ],
  });

  // 8. Αφρώδης (Méthode Traditionnelle)
  await upsertWine({
    slug: "douloufakis-afrodis",
    name: "Αφρώδης",
    vintage: 2021,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    abv: 12.25,
    appellation: null,
    isSparkling: true,
    description: "100% Βιδιανό, αφρώδες με τη μέθοδο Méthode Traditionnelle (δεύτερη ζύμωση στη φιάλη). Παραμονή στις οινολάσπες 24 μήνες, εκπωμάτιση Μάρτιο 2023, brut. Αμπελώνας στα 550μ, πηλώδες έδαφος με ψιλό χαλίκι και ασβέστιο.",
    tastingNotes: "Αχυροπράσινο χρώμα σε ασημένιο φόντο, λεπτές επίμονες φυσαλίδες. Αρώματα μήλου, αχλαδιού, τσουρεκιού από τη ζύμη της ζύμωσης, μελιού, κεριού και βερίκοκου. Δροσιστική, ζωηρή γεύση με καλή διάρκεια.",
    servingTemp: "9-10 °C",
    foodPairings: ["Θαλασσινά", "Οστρακοειδή", "Aperitif"],
    varieties: [{ variety: vidiano, percentage: 100 }],
  });

  // 9. Άσπρος Λαγός Λευκός
  await upsertWine({
    slug: "douloufakis-aspros-lagos-white",
    name: "Άσπρος Λαγός Λευκός",
    vintage: 2025,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    abv: 13.2,
    appellation: Appellation.PGI,
    description: "100% Βιδιανό από το αμπελοτόπι «Άσπρος Λαγός». Η ζύμωση ολοκληρώνεται σε βαρέλι (40% ακακιά, 60% γαλλική δρυς) με bâtonnage, 5 μήνες παλαίωση πριν την εμφιάλωση.",
    tastingNotes: "Χρυσαφί χρώμα με κιτρινοπράσινες ανταύγειες. Αρώματα λευκών λουλουδιών, εσπεριδοειδών, βουτύρου, κεριού, βερίκοκου και πεπονιού. Πλούσια, ελαιώδης γεύση με ορυκτικό υπόβαθρο και μακρά επίγευση σε τόνους βερίκοκου.",
    servingTemp: "10 °C",
    foodPairings: ["Ψάρια σχάρας", "Οστρακοειδή", "Λευκά κρέατα"],
    varieties: [{ variety: vidiano, percentage: 100 }],
  });

  // 10. Enotria Λευκό
  await upsertWine({
    slug: "douloufakis-enotria-white",
    name: "Enotria Λευκό",
    vintage: 2025,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    abv: 13.2,
    appellation: Appellation.PGI,
    description: "Χαρμάνι 70% Βηλάνα, 20% Sauvignon Blanc και 10% Μοσχάτο Σπίνας — κάθε ποικιλία οινοποιείται ξεχωριστά σε χαμηλή θερμοκρασία (18°C) για να διατηρηθεί η φρουτώδης έκφραση.",
    tastingNotes: "Απαλό κιτρινοπράσινο χρώμα, φρέσκια φρουτώδης ένταση στη μύτη και στο στόμα. Εξισορροπητική οξύτητα, δροσιστικό, φρέσκο κρασί — προτείνεται άμεση κατανάλωση.",
    servingTemp: "10 °C",
    foodPairings: ["Λαδερά", "Γεμιστά", "Ελαφριά ψάρια"],
    varieties: [
      { variety: vilana, percentage: 70 },
      { variety: sauvignonBlanc, percentage: 20 },
      { variety: moschatoSpinas, percentage: 10 },
    ],
  });

  // 11. Epoch Ερυθρός (ημίγλυκος)
  await upsertWine({
    slug: "douloufakis-epoch-red",
    name: "Epoch Ερυθρός",
    vintage: 2022,
    color: WineColor.RED,
    style: WineStyle.SEMI_SWEET,
    abv: 13.34,
    appellation: Appellation.PGI,
    description: "Ευχάριστο ημίγλυκο χαρμάνι — 40% κρητικό Μοσχάτο Ερυθρό, 20% Κοτσιφάλι, 40% Syrah. Κάθε ποικιλία ζυμώνεται ξεχωριστά στους 24-28°C, με προσθήκη συμπυκνωμένου γλεύκους για τη γλύκανση.",
    tastingNotes: "Έντονο ρουμπινί χρώμα, αρώματα βοτάνων και γλυκιά γεύση αποξηραμένων φρούτων.",
    servingTemp: "17 °C",
    foodPairings: ["Χοιρινό με μέλι", "Επιδόρπια με τυρί"],
    varieties: [
      { variety: muscatRed, percentage: 40 },
      { variety: kotsifali, percentage: 20 },
      { variety: syrah, percentage: 40 },
    ],
  });

  // 12. Alargo Λευκός (Ασύρτικο)
  await upsertWine({
    slug: "douloufakis-alargo-white",
    name: "Alargo Λευκός",
    vintage: 2024,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    abv: 13.9,
    appellation: Appellation.PGI,
    description: "100% Ασύρτικο, η πιο διάσημη ελληνική ποικιλία, εκφρασμένη στα αμπελοτόπια των Δαφνών με τα τυπικά χαρακτηριστικά της — υψηλή οξύτητα, μεταλλικότητα, ορυκτότητα. Ζύμωση στους 18°C, ένας χρόνος παραμονής στη φιάλη.",
    tastingNotes: "Λευκοκίτρινο χρώμα, απαλά αρώματα αποξηραμένων εσπεριδοειδών. Μεταλλικότητα και ορυκτότητα στη γεύση, τραγανή οξύτητα που ισορροπεί με το γεμάτο σώμα.",
    servingTemp: "10 °C",
    foodPairings: ["Ζυμαρικά με θαλασσινά", "Ψάρια σχάρας"],
    varieties: [{ variety: assyrtiko, percentage: 100 }],
  });

  // 13. Sangiovese
  await upsertWine({
    slug: "douloufakis-sangiovese",
    name: "Sangiovese",
    vintage: 2019,
    color: WineColor.RED,
    style: WineStyle.DRY,
    abv: 13.7,
    appellation: null,
    description: "70% Sangiovese και 30% Cabernet Sauvignon, έμπνευση από τις ιταλικές οινολογικές σπουδές του οινοποιού. Ζύμωση στους 24-28°C, παλαίωση 12 μήνες σε γαλλική δρυ.",
    tastingNotes: "Πικάντικες νότες καπνού, κερασιού, μαύρης σοκολάτας και κρητικών βοτάνων. Πυκνή δομή με βελούδινες τανίνες, πολύπλοκα μαύρα φρούτα, μακριά επίγευση.",
    servingTemp: "17 °C",
    foodPairings: ["Μακαρόνια με κιμά", "Ψητά στο γκριλ", "Πίτσα"],
    varieties: [
      { variety: sangiovese, percentage: 70 },
      { variety: cabernetSauvignon, percentage: 30 },
    ],
  });

  // 14. Epoch Λευκός (ημίγλυκος)
  await upsertWine({
    slug: "douloufakis-epoch-white",
    name: "Epoch Λευκός",
    vintage: 2025,
    color: WineColor.WHITE,
    style: WineStyle.SEMI_SWEET,
    abv: 12.6,
    appellation: Appellation.PGI,
    description: "Ημίγλυκο χαρμάνι 50% Μοσχάτο Σπίνας και 50% Βηλάνα, ζυμωμένα ξεχωριστά στους 17°C, με προσθήκη συμπυκνωμένου γλεύκους για τη γλύκανση.",
    tastingNotes: "Λευκοκίτρινο χρώμα, έντονο άρωμα ώριμων φρούτων. Στρογγυλό, με πολύ καλή ισορροπία και πλούσιο σώμα.",
    servingTemp: "10 °C",
    foodPairings: ["Πιάτα με κρεμώδεις σάλτσες", "Ασιατική κουζίνα"],
    varieties: [
      { variety: moschatoSpinas, percentage: 50 },
      { variety: vilana, percentage: 50 },
    ],
  });

  // 15. Enotria Ερυθρό
  await upsertWine({
    slug: "douloufakis-enotria-red",
    name: "Enotria Ερυθρό",
    vintage: 2023,
    color: WineColor.RED,
    style: WineStyle.DRY,
    abv: 14.8,
    appellation: Appellation.PGI,
    description: "Χαρμάνι δύο γηγενών κρητικών ποικιλιών, Κοτσιφάλι και Λιάτικο, με το διεθνές Syrah — 60% Syrah, 30% Κοτσιφάλι, 10% Λιάτικο. Κάθε ποικιλία ζυμώνεται ξεχωριστά στους 24-28°C.",
    tastingNotes: "Ρουμπινί χρώμα, νεανικό. Πληθωρικό άρωμα κόκκινων φρούτων με διακριτικές φυτικές νύξεις και κομψές νότες πιπεριού. Φρέσκια, φρουτώδης γεύση με υψηλή οξύτητα και νόστιμες τανίνες.",
    servingTemp: "17 °C",
    foodPairings: ["Κουνέλι στιφάδο", "Μουσακάς", "Φακές με απάκι"],
    varieties: [
      { variety: syrah, percentage: 60 },
      { variety: kotsifali, percentage: 30 },
      { variety: liatiko, percentage: 10 },
    ],
  });

  // 16. Άσπρος Λαγός Ερυθρός
  await upsertWine({
    slug: "douloufakis-aspros-lagos-red",
    name: "Άσπρος Λαγός Ερυθρός",
    vintage: 2023,
    color: WineColor.RED,
    style: WineStyle.DRY,
    abv: 14.2,
    appellation: Appellation.PGI,
    description: "100% Cabernet Sauvignon από το αμπελοτόπι «Άσπρος Λαγός». Ζύμωση στους 24-28°C, παλαίωση 12 μήνες σε γαλλική δρυ (20% καινούρια, υπόλοιπη δεύτερης/τρίτης χρήσης).",
    tastingNotes: "Βαθυκόκκινο χρώμα σκούρου ρουμπινιού προς το ιώδες. Πλούσιο μπουκέτο φραγκοστάφυλου και σκούρων φρούτων, με υποψία βανίλιας και πιπεριού. Πλούσια, γεμάτη γεύση, εξαιρετική δομή με πλούσιες, ισορροπημένες τανίνες.",
    servingTemp: "17 °C",
    foodPairings: ["Ψητά κόκκινα κρέατα", "Αρνί ή κατσίκι στο φούρνο", "Παλαιωμένα τυριά"],
    varieties: [{ variety: cabernetSauvignon, percentage: 100 }],
  });

  // 17. Femina
  await upsertWine({
    slug: "douloufakis-femina",
    name: "Femina",
    vintage: 2025,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    abv: 13.4,
    appellation: Appellation.PGI,
    description: "100% Malvasia di Candia Aromatica — ιστορική ποικιλία διάσημη στην Κρήτη την εποχή της Ενετοκρατίας. Κλασική λευκή οινοποίηση σε ελεγχόμενη θερμοκρασία 18°C.",
    tastingNotes: "Ανοιχτό χρυσαφένιο χρώμα. Άρωμα λεμονανθών και γιασεμιού με λευκόσαρκα και εξωτικά φρούτα (passion fruit, μάνγκο). Τελείως ξηρή γεύση με ζωηρή, δροσιστική οξύτητα και μακρά επίγευση.",
    servingTemp: "9-10 °C",
    foodPairings: ["Ασιατική κουζίνα", "Sushi", "Ψάρι με αρωματικά βότανα"],
    varieties: [{ variety: malvasiaDiCandia, percentage: 100 }],
  });

  // 18. Enotria Ροζέ
  await upsertWine({
    slug: "douloufakis-enotria-rose",
    name: "Enotria Ροζέ",
    vintage: 2025,
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    abv: 13,
    appellation: Appellation.PGI,
    description: "Χαρμάνι 60% Κοτσιφάλι και 40% Syrah, με προζυμωτική κρυοεκχύλιση ξεχωριστά για κάθε ποικιλία πριν τη ζύμωση στους 17°C.",
    tastingNotes: "Λαμπερό τριανταφυλλένιο χρώμα με πορτοκαλόχρωμες ανταύγειες. Φρουτώδες άρωμα φράουλας και κερασιού, καραμελάτη και ζωηρή γεύση, μαλακό και γευστικό με απολαυστική επίγευση.",
    servingTemp: "10 °C",
    foodPairings: ["Θαλασσινά barbecue", "Φάβα", "Παϊδάκια αρνιού"],
    varieties: [
      { variety: kotsifali, percentage: 60 },
      { variety: syrah, percentage: 40 },
    ],
  });

  // 19. Grande Réserve Δαφνές
  await upsertWine({
    slug: "douloufakis-grande-reserve-dafnes",
    name: "Grande Réserve Δαφνές",
    vintage: 2020,
    color: WineColor.RED,
    style: WineStyle.DRY,
    abv: 14,
    appellation: Appellation.PDO,
    description: "100% Λιάτικο από παλαιούς, ιδιόκτητους αμπελώνες με αυστηρή επιλογή. Εκχύλιση 30 ημερών, αυθόρμητη μηλογαλακτική ζύμωση, παλαίωση τουλάχιστον 18 μήνες σε γαλλική δρυ και άλλους 18 μήνες στη φιάλη πριν την κυκλοφορία.",
    tastingNotes: "Βαθύ ρουμπινί χρώμα με καφετιές ανταύγειες. Πλούσιο, σύνθετο μπουκέτο με κορόμηλο, μαύρα μούρα και μπαχαρικά, απαλές νότες δέρματος. Άριστη ισορροπία γλυκού, οξύτητας και τανινών, εντυπωσιακό flavour, ιδιαίτερα μακρύ τελείωμα.",
    servingTemp: "13-15 °C",
    foodPairings: ["T-bone steak", "Κυνήγι", "Παλαιωμένα τυριά"],
    varieties: [{ variety: liatiko, percentage: 100 }],
  });

  // 20. Helios (φυσικώς γλυκύς)
  await upsertWine({
    slug: "douloufakis-helios",
    name: "Helios",
    vintage: 2014,
    color: WineColor.RED,
    style: WineStyle.SWEET,
    abv: 14.8,
    appellation: null,
    description: "100% Λιάτικο, φυσικώς γλυκύς οίνος από λιαστά σταφύλια — αποξήρανση στον ήλιο για 7 ημέρες πριν τη ζύμωση. Παλαίωση 10 χρόνια σε μεταχειρισμένα γαλλικά δρύινα βαρέλια. Η γηγενής ύπαρξη του Λιάτικου στις Δαφνές μαρτυρείται ήδη από τον 13ο αιώνα.",
    tastingNotes: "Κεχριμπαρένιο, μελί χρώμα με καφετιές ανταύγειες. Πολυσύνθετο μπουκέτο αποξηραμένων φρούτων, ξηρών καρπών, καφέ μόκα και κακάο. Πλούσια, λιπαρή γεύση, εξαιρετικά ισορροπημένη, μακρά αρωματική επίγευση.",
    servingTemp: "10 °C",
    foodPairings: ["Επιδόρπια σοκολάτας", "Κρητικά καλιτσούνια"],
    varieties: [{ variety: liatiko, percentage: 100 }],
  });

  console.log("Done: 20 ετικέτες Δουλουφάκη (1 ενημέρωση + 19 νέες), 3 νέες ποικιλίες.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
