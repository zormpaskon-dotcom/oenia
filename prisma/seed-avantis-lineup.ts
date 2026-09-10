// Προσθέτει τα 11 κρασιά του Avantis Estate από την επίσημη παρουσίαση 2026
// (ΠΑΡΟΥΣΙΑΣΗ ΚΤΗΜΑ ΑΒΑΝΤΙΣ 26 GR) — ονόματα, ποικιλίες, appellation, serving
// temp, tasting notes, food pairing και winemaking notes μεταφέρθηκαν λέξη
// προς λέξη από το PDF· vintages και appellation επιβεβαιώθηκαν οπτικά στις
// ετικέτες όπου ήταν διαθέσιμες φωτογραφίες. Δύο σημεία παραμένουν ρητά
// null επειδή δεν επιβεβαιώθηκαν: το vintage του "Historia Ερυθρό" (το μόνο
// στοιχείο ήταν το filename "26", όχι αρκετό) και labelImage του "Άγιος
// Χρόνος" (ερυθρό) — δεν υπήρχε ξεχωριστή φωτογραφία γι' αυτό στα παρεχόμενα
// αρχεία (η "ΑΓΙΟΣ ΧΡΟΝΟΣ VIOGNIER.jpg" επιβεβαιώθηκε οπτικά ότι είναι το
// ΛΕΥΚΟ Viognier, όχι το ερυθρό blend).
//
// Επίσης καταργεί (status: ARCHIVED, όχι delete) το παλιό γενικό
// "avantis-erythra", κατόπιν ρητής επιλογής του χρήστη, αφού αντικαθίσταται
// πλήρως από τα νέα, συγκεκριμένα ονομασμένα κρασιά.

import { readFileSync } from "fs";
import { put } from "@vercel/blob";
import { prisma } from "../lib/prisma";
import { Appellation, WineColor, WineStyle } from "@prisma/client";

const IMG_DIR =
  "/Users/konstantinoszormpas/Desktop/photos/wetransfer_viognier-jpg_2026-09-09_1120";

// `tsx prisma/*.ts` φορτώνει αυτόματα μόνο το .env (Prisma CLI convention) —
// όχι το .env.local, όπου βρίσκεται το BLOB_READ_WRITE_TOKEN. Το διαβάζουμε
// εδώ χειροκίνητα και το περνάμε ρητά στο put(), αντί να βασιστούμε σε
// αυτόματο env loading.
function readBlobToken(): string {
  const envLocal = readFileSync(`${__dirname}/../.env.local`, "utf-8");
  const match = envLocal.match(/^BLOB_READ_WRITE_TOKEN=(.+)$/m);
  if (!match) throw new Error("BLOB_READ_WRITE_TOKEN not found in .env.local");
  return match[1].trim().replace(/^["']|["']$/g, "");
}
const BLOB_TOKEN = readBlobToken();

type WineSpec = {
  slug: string;
  name: string;
  color: WineColor;
  style: WineStyle;
  appellation: Appellation | null;
  vintage: number | null;
  abv: number | null;
  servingTemp: string;
  description: string;
  tastingNotes: string;
  winemakingNotes: string;
  foodPairings: string[];
  varieties: { slug: string; percentage: number | null }[];
  imageFile: string | null;
};

const WINES: WineSpec[] = [
  {
    slug: "avantis-historia-leyko",
    name: "Historia Λευκό",
    color: "WHITE",
    style: "DRY",
    appellation: "PGI",
    vintage: 2024,
    abv: null,
    servingTemp: "8-10°C",
    description: "Χαρμάνι Ασύρτικου και Viognier, ΠΓΕ Εύβοια, ξηρό λευκό.",
    tastingNotes:
      "Στη μύτη κυριαρχούν αρώματα βερίκοκου και ροδάκινου, με διακριτικές φρουτώδεις νότες. Ξηρό κρασί με δροσερή και ισορροπημένη οξύτητα. Στον ουρανίσκο εμφανίζονται γεύσεις από λευκό ροδάκινο, βερίκοκο, αχλάδι και μια διακριτική νότα λάιμ, που οδηγούν σε μια ευχάριστη φρουτώδη επίγευση.",
    winemakingNotes:
      "Τα σταφύλια τοποθετούνται σε θάλαμο ψύξης για 24 ώρες μετά τον τρύγο. Κάθε ποικιλία τρυγιέται και οινοποιείται ξεχωριστά. Ακολουθεί κρυοεκχύλιση για 12 ώρες και στη συνέχεια αλκοολική ζύμωση στους 14°C, ώστε να διατηρηθεί η φρεσκάδα και η ένταση των αρωμάτων.",
    foodPairings: ["Σαλάτες", "Θαλασσινά", "Ελληνικούς μεζέδες όπως ντολμαδάκια", "Πουλερικά", "Λευκά τυριά"],
    varieties: [
      { slug: "asyrtiko", percentage: 50 },
      { slug: "viognier", percentage: 50 },
    ],
    imageFile: "HISTORIA WHITE 2024.jpg",
  },
  {
    slug: "avantis-cinderella",
    name: "Σταχτοπούτα (Cinderella)",
    color: "WHITE",
    style: "DRY",
    appellation: "PGI",
    vintage: 2024,
    abv: null,
    servingTemp: "8-10°C",
    description: "Μονοποικιλιακή Μαλαγουζιά, ΠΓΕ Εύβοια, ξηρό λευκό.",
    tastingNotes:
      "Έντονη μύτη εσπεριδοειδών (γκρέιπφρουτ – λάιμ), ροδάκινο λευκόσαρκο, αχλάδι, άνθη λεμονιάς και διακριτικές νότες ορυκτότητας. Φρουτώδης χαρακτήρας με τονισμένη οξύτητα. Αρώματα από λευκόσαρκα φρούτα και εσπεριδοειδή πλαισιώνονται από νότες πυρηνόκαρπων φρούτων.",
    winemakingNotes:
      "Τα σταφύλια τοποθετούνται σε θάλαμο ψύξης για 24 ώρες. Στην συνέχεια υποβάλλονται σε κρυοεκχύλιση για 12 ώρες στους 8°C. Ακολουθεί αλκοολική ζύμωση και παραμονή του κρασιού στις λεπτές οινολάσπες για 3 μήνες.",
    foodPairings: ["Θαλασσινά", "Ψάρια σχάρας", "Ζυμαρικά", "Λευκά τυριά"],
    varieties: [{ slug: "malagousia", percentage: 100 }],
    imageFile: "CINDERELLA.jpg",
  },
  {
    slug: "avantis-lenga",
    name: "Lenga",
    color: "WHITE",
    style: "OFF_DRY",
    appellation: null,
    vintage: 2024,
    abv: 13.5,
    servingTemp: "8-10°C",
    description: "Ποικιλιακός, ημίξηρος λευκός οίνος από Gewürztraminer.",
    tastingNotes:
      "Σαγηνευτικά αρώματα από γλυκά τριαντάφυλλα, λίτσι, εξωτικά φρούτα, πιπέρι, μέντα, τζίντζερ και μπαχαρικά. Γεμάτο σώμα με έντονο ανθικό και πικάντικο χαρακτήρα. Καλά ισορροπημένη οξύτητα και μακρά επίγευση.",
    winemakingNotes:
      "Τα σταφύλια τοποθετούνται σε θάλαμο ψύξης για 24 ώρες. Πραγματοποιείται κρυοεκχύλιση για 6 ώρες. Η ζύμωση διακόπτεται ώστε να παραμείνει στο κρασί ένα μέρος από αζύμωτα σάκχαρα.",
    foodPairings: ["Πιάτα με σάλτσα λεμονιού", "Γλυκόξινη ασιατική κουζίνα", "Sushi"],
    varieties: [{ slug: "gewurztraminer", percentage: 100 }],
    imageFile: "LENGA 2024.jpg",
  },
  {
    slug: "avantis-agios-chronos-viognier",
    name: "Άγιος Χρόνος Viognier",
    color: "WHITE",
    style: "DRY",
    appellation: "PGI",
    vintage: 2024,
    abv: null,
    servingTemp: "10-12°C",
    description: "Μονοποικιλιακό Viognier, ΠΓΕ Εύβοια, ξηρό λευκό με ωρίμαση σε βαρέλι.",
    tastingNotes:
      "Αρώματα ώριμου βερίκοκου με κομψά αρώματα δρυός. Ξηρό στόμα με έκρηξη κίτρινων φρούτων, εσπεριδοειδή, αίσθηση νέκταρ, ντελικάτα αρώματα από δρυ και ξηρούς καρπούς. Ζωηρή οξύτητα και μακριά, πολύπλοκη επίγευση.",
    winemakingNotes:
      "Παραμονή των σταφυλιών για 24 ώρες σε ψυκτικό θάλαμο. Κλασική λευκή οινοποίηση & μηλογαλακτική ζύμωση. Battonage πραγματοποιείται μία φορά τον μήνα. 6 μήνες ωρίμαση σε βαρέλια white smoke (χωρίς κάψιμο) 500 λίτρων.",
    foodPairings: ["Ριζότο με μανιτάρια", "Μύδια", "Ταραμοσαλάτα", "Λιπαρά ψάρια στη σχάρα", "Καραβίδες", "Αστακομακαρονάδα"],
    varieties: [{ slug: "viognier", percentage: 100 }],
    imageFile: "ΑΓΙΟΣ ΧΡΟΝΟΣ VIOGNIER.jpg",
  },
  {
    slug: "avantis-amygdalies",
    name: "Αμυγδαλιές",
    color: "ROSE",
    style: "DRY",
    appellation: "PGI",
    vintage: 2024,
    abv: null,
    servingTemp: "10-12°C",
    description: "Μονοποικιλιακό Syrah, ΠΓΕ Εύβοια, ξηρό ροζέ.",
    tastingNotes:
      "Εντυπωσιακά αρώματα φράουλας, κερασιού και ροδιού. Φρουτώδες στόμα κόκκινων φρούτων, καραμέλας και καλοδομημένη οξύτητα. Μακριά, ευχάριστη επίγευση.",
    winemakingNotes:
      "Κρυοεκχύλιση μίας ημέρας. Αφαίμαξη την πρώτη ημέρα της ψυχρής εκχύλισης από τους οινοποιητές.",
    foodPairings: ["Παραδοσιακά λαδερά", "Χορτόπιτες", "Πιάτα με βάση την ντομάτα και τον βασιλικό", "Τηγανητά μπαρμπούνια"],
    varieties: [{ slug: "syrah", percentage: 100 }],
    imageFile: "ΑΜΥΓΔΑΛΙΕΣ 2024.jpg",
  },
  {
    slug: "avantis-lenga-pink",
    name: "Lenga Pink",
    color: "ROSE",
    style: "DRY",
    appellation: "PGI",
    vintage: 2023,
    abv: null,
    servingTemp: "10-12°C",
    description: "Χαρμάνι Gewürztraminer και Μαυροκουντούρα, ΠΓΕ Εύβοια, ξηρό ροζέ.",
    tastingNotes:
      "Ευωδιαστή, κομψή μύτη από αρώματα ροζ τριαντάφυλλου, λουκουμιού, γλυκού σταφυλιού και νότες εσπεριδοειδών. Το στόμα είναι ξηρό με ανεπαίσθητη υπόνοια γλυκύτητας, ανθικά και φρουτώδη αρώματα, κόκκινου πιπεριού, πικάντικος χαρακτήρας και ισορροπημένη οξύτητα.",
    winemakingNotes:
      "Ξεχωριστός τρύγος και ζύμωση για κάθε ποικιλία. Στο Gewürztraminer εφαρμόζεται κρυοεκχύλιση για 12 ώρες. Η Μαυροκουντούρα πιέζεται άμεσα στο πιεστήριο.",
    foodPairings: ["Ζυμαρικά με θαλασσινά", "Καπνιστό σολομό", "Τηγανητά ψάρια", "Γαρίδες πανέ", "Κοτόπουλο με σάλτσα λεμόνι", "Sushi"],
    varieties: [
      { slug: "gewurztraminer", percentage: 50 },
      { slug: "mavrokoudoura", percentage: 50 },
    ],
    imageFile: "LENGA PINK 2023.jpg",
  },
  {
    slug: "avantis-historia-erythro",
    name: "Historia Ερυθρό",
    color: "RED",
    style: "DRY",
    appellation: "PGI",
    vintage: null,
    abv: null,
    servingTemp: "14-16°C",
    description: "Χαρμάνι Syrah και Μαυροκουντούρα, ΠΓΕ Εύβοια, ξηρό ερυθρό.",
    tastingNotes:
      "Αρώματα από μικρά κόκκινα και μαύρα φρούτα του δάσους. Στόμα ξηρό, με μέτριο προς γεμάτο σώμα, ώριμες απαλές ταννίνες, μέτρια οξύτητα και φρουτώδη επίγευση.",
    winemakingNotes:
      "Ξεχωριστός τρύγος και οινοποίηση για κάθε ποικιλία. Πραγματοποιείται σύντομη εκχύλιση των φαινολικών συστατικών για περίπου μία εβδομάδα. Ακολουθεί μηλογαλακτική ζύμωση και εμφιάλωση.",
    foodPairings: ["Μοσχάρι", "Κόκκινα κρέατα με κόκκινη σάλτσα", "Σπαγγέτι μπολονέζ"],
    varieties: [
      { slug: "syrah", percentage: null },
      { slug: "mavrokoudoura", percentage: null },
    ],
    imageFile: "Historia Red 26.png",
  },
  {
    slug: "avantis-syrah",
    name: "Syrah",
    color: "RED",
    style: "DRY",
    appellation: "PGI",
    vintage: 2022,
    abv: null,
    servingTemp: "16-18°C",
    description: "Μονοποικιλιακό, αφιλτράριστο Syrah, ΠΓΕ Εύβοια, ξηρό ερυθρό με ωρίμαση σε βαρέλι.",
    tastingNotes:
      "Βαθύ ρουμπινί χρώμα με πολύπλοκο και εξελισσόμενο μπουκέτο. Αρώματα από μπαχαρικά, πιπέρι, κανέλα και καπνό, με έντονη παρουσία μαύρων φρούτων όπως δαμάσκηνα, μαύρα βατόμουρα, καθώς και νότες μαρμελάδας και βανίλιας. Πλούσιο σώμα, με πικάντικο χαρακτήρα, ώριμες και καλοδουλεμένες ταννίνες και μακριά επίγευση.",
    winemakingNotes:
      "Κλασική ερυθρή οινοποίηση. Αλκοολική ζύμωση και εκχύλιση για 20–30 ημέρες. Ακολουθεί μηλογαλακτική ζύμωση. Ωριμάζει 12 μήνες σε δρύινα βαρέλια των 225 λίτρων. Αφιλτράριστο.",
    foodPairings: ["BBQ", "Κόκκινα κρέατα με πικάντικη κόκκινη σάλτσα", "Κυνήγι", "Παλαιωμένα κίτρινα τυριά"],
    varieties: [{ slug: "syrah", percentage: 100 }],
    imageFile: "SYRAH 2022_K.jpg",
  },
  {
    slug: "avantis-mavrokoudoura",
    name: "Μαυροκουντούρα",
    color: "RED",
    style: "DRY",
    appellation: "PGI",
    vintage: 2023,
    abv: null,
    servingTemp: "16-18°C",
    description: "Μονοποικιλιακή, αφιλτράριστη Μαυροκουντούρα, ΠΓΕ Εύβοια — γηγενής ευβοϊκή ποικιλία που αναβίωσε το κτήμα.",
    tastingNotes:
      "Αναδεικνύονται αρώματα από μαύρα φρούτα, μπαχαρικά, μαρμελάδα, βανίλια, καφέ και δρυ. Γεμάτο στόμα, με έντονη οξύτητα και υψηλού επιπέδου, λεπτόκοκκες ταννίνες και μακριά επίγευση.",
    winemakingNotes:
      "Κλασική ερυθρή οινοποίηση με εκχύλιση διάρκειας 25 ημερών. Ωριμάζει για 12 μήνες σε δρύινα βαρέλια των 225 λίτρων και μέρος του κρασιού ωριμάζει σε αμφορείς για έναν χρόνο. Αφιλτράριστο.",
    foodPairings: ["Κόκορα κρασάτο", "Μπριζόλα", "Τυριά με γεμάτο σώμα"],
    varieties: [{ slug: "mavrokoudoura", percentage: 100 }],
    imageFile: "ΜΑΥΡΟΚΟΥΝΤΟΥΡΑ 2023.png",
  },
  {
    slug: "avantis-agios-chronos",
    name: "Άγιος Χρόνος",
    color: "RED",
    style: "DRY",
    appellation: "PGI",
    vintage: null,
    abv: null,
    servingTemp: "16-18°C",
    description: "Χαρμάνι Syrah και Viognier (co-fermentation), ΠΓΕ Εύβοια, αφιλτράριστο ξηρό ερυθρό με ωρίμαση σε βαρέλι.",
    tastingNotes:
      "Πολύπλοκο και κομψό, εξελισσόμενο μπουκέτο. Αρώματα από μπαχαρικά, πιπέρι, κανέλα και καπνό, με έντονη παρουσία μαύρων φρούτων όπως δαμάσκηνα και βατόμουρα, καθώς και νότες μαρμελάδας, ψημένων φρούτων και βανίλιας. Πλούσιο σώμα, πικάντικος χαρακτήρας, με ώριμες και καλοδουλεμένες λεπτόκοκκες ταννίνες και μακριά επίγευση.",
    winemakingNotes:
      "Ταυτόχρονος τρύγος και συνοινοποίηση των δύο ποικιλιών από την αρχή. Πραγματοποιείται μακριά εκχύλιση των φαινολικών συστατικών, διάρκειας περίπου 30 ημερών. Συνεχίζει με μηλογαλακτική ζύμωση. Ωριμάζει για 12-14 μήνες σε δρύινα βαρέλια των 225 λίτρων. Αφιλτράριστο.",
    foodPairings: ["Κυνήγι", "Rib-eye steak", "Κίτρινα τυριά"],
    varieties: [
      { slug: "syrah", percentage: 92 },
      { slug: "viognier", percentage: 8 },
    ],
    imageFile: null,
  },
  {
    slug: "avantis-collection",
    name: "Collection",
    color: "RED",
    style: "DRY",
    appellation: "PGI",
    vintage: 2022,
    abv: null,
    servingTemp: "16-18°C",
    description: "Μονοποικιλιακό, αφιλτράριστο Syrah, ΠΓΕ Εύβοια — top cuvée με 18 μήνες ωρίμαση σε καινούργια γαλλική δρυ.",
    tastingNotes:
      "Συμπυκνωμένο και πολύπλοκο μπουκέτο από μαύρα αποξηραμένα φρούτα, μπαχαρικά και βανίλια. Πλούσιο σώμα με αρώματα ώριμων μαύρων φρούτων, μαρμελάδας, πιπεριού, γλυκών μπαχαρικών, μελανιού, καφέ, σοκολάτας και καπνού. Ώριμες, λεπτόκοκκες ταννίνες με δυνατή δομή και μακρά επίγευση.",
    winemakingNotes:
      "Κλασική ερυθρή οινοποίηση. Αλκοολική ζύμωση και παρατεταμένη εκχύλιση για 30 ημέρες που ακολουθείται από μηλογαλακτική ζύμωση. Ωριμάζει για 18 μήνες σε νέα γαλλικά δρύινα βαρέλια Seguin Moreau τύπου QTT των 225 λίτρων. Αφιλτράριστο.",
    foodPairings: ["Rib-eye steak", "Αγριογούρουνο", "Κυνήγι", "Κίτρινα τυριά"],
    varieties: [{ slug: "syrah", percentage: 100 }],
    imageFile: "COLLECTION.jpg",
  },
];

async function main() {
  const winery = await prisma.winery.findUnique({ where: { slug: "avantis-estate" }, select: { id: true, regionId: true } });
  if (!winery) throw new Error("Winery avantis-estate not found");

  // Guard: κανένα από τα 11 slugs να μην υπάρχει ήδη (αποφυγή διπλής εκτέλεσης)
  const existing = await prisma.wine.findMany({ where: { slug: { in: WINES.map((w) => w.slug) } }, select: { slug: true } });
  if (existing.length > 0) {
    throw new Error(`Ήδη υπάρχουν wines με αυτά τα slugs — abort: ${existing.map((w) => w.slug).join(", ")}`);
  }

  // Μαυροκουντούρα: δημιούργησε τη Variety αν δεν υπάρχει ήδη
  let mavrokoudoura = await prisma.variety.findUnique({ where: { slug: "mavrokoudoura" } });
  if (!mavrokoudoura) {
    mavrokoudoura = await prisma.variety.create({
      data: {
        name: "Μαυροκουντούρα",
        slug: "mavrokoudoura",
        nameLatin: "Mavrokoudoura",
        type: "RED",
        originRegion: "Εύβοια",
      },
    });
    console.log('✓ Δημιουργήθηκε Variety "Μαυροκουντούρα"');
  }

  // Αρχειοθέτηση του παλιού γενικού "avantis-erythra" (κατόπιν ρητής επιλογής χρήστη)
  const oldWine = await prisma.wine.findUnique({ where: { slug: "avantis-erythra" }, select: { id: true, status: true } });
  if (oldWine && oldWine.status === "PUBLISHED") {
    await prisma.wine.update({ where: { id: oldWine.id }, data: { status: "ARCHIVED" } });
    console.log('✓ "avantis-erythra" → status ARCHIVED');
  }

  for (const spec of WINES) {
    let labelImage: string | null = null;
    if (spec.imageFile) {
      const filePath = `${IMG_DIR}/${spec.imageFile}`;
      const buffer = readFileSync(filePath);
      const ext = spec.imageFile.split(".").pop();
      const blob = await put(`wines/${spec.slug}-${Date.now()}.${ext}`, buffer, { access: "public", token: BLOB_TOKEN });
      labelImage = blob.url;
      console.log(`  ↑ uploaded ${spec.imageFile} → ${blob.url}`);
    }

    const wine = await prisma.wine.create({
      data: {
        name: spec.name,
        slug: spec.slug,
        wineryId: winery.id,
        regionId: winery.regionId,
        vintage: spec.vintage,
        color: spec.color,
        style: spec.style,
        appellation: spec.appellation,
        abv: spec.abv,
        servingTemp: spec.servingTemp,
        description: spec.description,
        tastingNotes: spec.tastingNotes,
        winemakingNotes: spec.winemakingNotes,
        foodPairings: spec.foodPairings,
        labelImage,
        status: "PUBLISHED",
      },
    });

    for (const v of spec.varieties) {
      const variety = await prisma.variety.findUnique({ where: { slug: v.slug } });
      if (!variety) throw new Error(`Variety not found: ${v.slug}`);
      await prisma.varietyOnWine.create({
        data: { wineId: wine.id, varietyId: variety.id, percentage: v.percentage },
      });
    }

    console.log(`✓ Wine "${spec.name}" (${spec.slug}) δημιουργήθηκε`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
