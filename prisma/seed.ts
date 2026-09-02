// Seed data βασισμένο στο seed-notes.md: 10 περιοχές ΠΟΠ, βασικές λευκές/κόκκινες
// ποικιλίες, 8 κατηγορίες φαγητού, και μερικά δείγματα οινοποιείων/ετικετών.
//
// Τα ονόματα οινοποιείων/ετικετών παρακάτω είναι ΠΛΑΣΜΑΤΙΚΑ (dev/demo data) —
// πριν το launch πρέπει να αντικατασταθούν με πραγματικά, επαληθευμένα στοιχεία
// (βλ. README: «Νομικά — πριν βγει live»). Τα trait values των ποικιλιών είναι
// αρχικές editorial εκτιμήσεις προς επαλήθευση, όχι επίσημα δεδομένα.

import bcrypt from "bcryptjs";
import {
  PrismaClient,
  MacroRegion,
  Appellation,
  VarietyType,
  WineColor,
  WineStyle,
  PriceRange,
  ContentStatus,
  ArticleCategory,
  UserRole,
} from "@prisma/client";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────
// ΠΕΡΙΟΧΕΣ (ΠΟΠ)
// ─────────────────────────────────────────────

const regions = [
  {
    slug: "naoussa",
    name: "Νάουσα",
    macroRegion: MacroRegion.NORTHERN_GREECE,
    recognizedYear: 1971,
    latitude: 40.6333,
    longitude: 22.0667,
    description:
      "Η πιο γνωστή ζώνη ΠΟΠ για μονοποικιλιακό Ξινόμαυρο, στους πρόποδες του Βερμίου.",
  },
  {
    slug: "nemea",
    name: "Νεμέα",
    macroRegion: MacroRegion.PELOPONNESE,
    recognizedYear: 1971,
    latitude: 37.8333,
    longitude: 22.6667,
    description:
      "Η μεγαλύτερη ζώνη ΠΟΠ ερυθρού κρασιού στην Ελλάδα, βασισμένη στο Αγιωργίτικο.",
  },
  {
    slug: "santorini",
    name: "Σαντορίνη",
    macroRegion: MacroRegion.AEGEAN_ISLANDS,
    recognizedYear: 1971,
    latitude: 36.4167,
    longitude: 25.4333,
    description:
      "Ηφαιστειογενές έδαφος, αμπέλια σε σχήμα «κλαρί» (κουλούρα) και μονοποικιλιακό Ασύρτικο.",
  },
  {
    slug: "mantineia",
    name: "Μαντινεία",
    macroRegion: MacroRegion.PELOPONNESE,
    recognizedYear: 1971,
    latitude: 37.5081,
    longitude: 22.3739,
    description:
      "Ορεινό οροπέδιο της Αρκαδίας, γνωστό για το αρωματικό λευκό Μοσχοφίλερο.",
  },
  {
    slug: "amyndaio",
    name: "Αμύνταιο",
    macroRegion: MacroRegion.NORTHERN_GREECE,
    recognizedYear: 1972,
    latitude: 40.6833,
    longitude: 21.7,
    description:
      "Ψηλή, ψυχρή ζώνη στη Δυτική Μακεδονία με Ξινόμαυρο πιο ελαφρύ και ροζέ στιλ.",
  },
  {
    slug: "goumenissa",
    name: "Γουμένισσα",
    macroRegion: MacroRegion.NORTHERN_GREECE,
    recognizedYear: 1979,
    latitude: 40.9333,
    longitude: 22.5,
    description:
      "Ζώνη ΠΟΠ όπου το Ξινόμαυρο συχνά συνδυάζεται με Νεγκόσκα για πιο στρογγυλά κρασιά.",
  },
  {
    slug: "rapsani",
    name: "Ραψάνη",
    macroRegion: MacroRegion.CENTRAL_GREECE,
    recognizedYear: 1971,
    latitude: 39.8333,
    longitude: 22.6167,
    description:
      "Αμπελώνες στις πλαγιές του Ολύμπου, γνωστοί για το τριποικιλιακό κρασί τους.",
  },
  {
    slug: "robola-kefallinias",
    name: "Ρομπόλα Κεφαλληνίας",
    macroRegion: MacroRegion.IONIAN_ISLANDS,
    recognizedYear: 1982,
    latitude: 38.1751,
    longitude: 20.5498,
    description:
      "Ορεινοί αμπελώνες στους πρόποδες του Αίνου, γνωστοί για τη φρέσκια, ορυκτική Ρομπόλα.",
  },
  {
    slug: "patra",
    name: "Πάτρα",
    macroRegion: MacroRegion.PELOPONNESE,
    recognizedYear: 1971,
    latitude: 38.2466,
    longitude: 21.7346,
    description:
      "Ζώνη ΠΟΠ γνωστή για το λευκό Ροδίτη, αλλά και για το γλυκό Μαυροδάφνη Πατρών.",
  },
  {
    slug: "peza",
    name: "Πεζά",
    macroRegion: MacroRegion.CRETE,
    recognizedYear: 1971,
    latitude: 35.2333,
    longitude: 25.2333,
    description:
      "Ζώνη ΠΟΠ στο Ηράκλειο (μαζί με τις γειτονικές Αρχάνες) για Κοτσιφάλι και Μανδηλαριά.",
  },
] as const;

// ─────────────────────────────────────────────
// ΠΟΙΚΙΛΙΕΣ
// ─────────────────────────────────────────────

const varieties = [
  // Λευκές
  {
    slug: "asyrtiko",
    name: "Ασύρτικο",
    nameLatin: "Assyrtiko",
    type: VarietyType.WHITE,
    originRegion: "santorini",
    acidity: 90,
    body: 55,
    tannins: 0,
    aromaIntensity: 60,
    ageingPotential: 70,
    similarTo: "Chablis / Riesling",
    description:
      "Η πιο σημαντική λευκή ελληνική ποικιλία, γνωστή για την έντονη οξύτητα και τον ορυκτικό χαρακτήρα.",
  },
  {
    slug: "moschofilero",
    name: "Μοσχοφίλερο",
    nameLatin: "Moschofilero",
    type: VarietyType.WHITE,
    originRegion: "mantineia",
    acidity: 80,
    body: 30,
    tannins: 0,
    aromaIntensity: 85,
    ageingPotential: 30,
    similarTo: "Gewürztraminer / Torrontés",
    description: "Ροζ-φλοιώδης ποικιλία με έντονα ανθικά αρώματα και ελαφρύ σώμα.",
  },
  {
    slug: "malagousia",
    name: "Μαλαγουζιά",
    nameLatin: "Malagousia",
    type: VarietyType.WHITE,
    originRegion: null,
    acidity: 55,
    body: 60,
    tannins: 0,
    aromaIntensity: 90,
    ageingPotential: 35,
    similarTo: "Viognier",
    description: "Αρωματική ποικιλία με νότες ροδάκινου και βασιλικού, μέτρια οξύτητα.",
  },
  {
    slug: "roditis",
    name: "Ροδίτης",
    nameLatin: "Roditis",
    type: VarietyType.WHITE,
    originRegion: "patra",
    acidity: 65,
    body: 40,
    tannins: 0,
    aromaIntensity: 40,
    ageingPotential: 25,
    description: "Ροζ-φλοιώδης, ελαφριά ποικιλία που δίνει φρέσκα, καθημερινά λευκά.",
  },
  {
    slug: "robola",
    name: "Ρομπόλα",
    nameLatin: "Robola",
    type: VarietyType.WHITE,
    originRegion: "robola-kefallinias",
    acidity: 75,
    body: 45,
    tannins: 0,
    aromaIntensity: 55,
    ageingPotential: 45,
    similarTo: "Chablis",
    description: "Ορυκτική, φρέσκια λευκή ποικιλία από τους ορεινούς αμπελώνες της Κεφαλονιάς.",
  },
  {
    slug: "athiri",
    name: "Αθήρι",
    nameLatin: "Athiri",
    type: VarietyType.WHITE,
    originRegion: null,
    acidity: 50,
    body: 45,
    tannins: 0,
    aromaIntensity: 45,
    ageingPotential: 25,
    description: "Απαλή λευκή ποικιλία του Αιγαίου, συχνά σε blend με Ασύρτικο.",
  },
  {
    slug: "aidani",
    name: "Αηδάνι",
    nameLatin: "Aidani",
    type: VarietyType.WHITE,
    originRegion: "santorini",
    acidity: 60,
    body: 40,
    tannins: 0,
    aromaIntensity: 65,
    ageingPotential: 25,
    description: "Αρωματική ποικιλία των Κυκλάδων, βασικό συστατικό στο Vinsanto.",
  },
  {
    slug: "vidiano",
    name: "Βιδιανό",
    nameLatin: "Vidiano",
    type: VarietyType.WHITE,
    originRegion: "peza",
    acidity: 55,
    body: 65,
    tannins: 0,
    aromaIntensity: 60,
    ageingPotential: 45,
    description: "Κρητική ποικιλία με πλούσιο σώμα και νότες πυρηνόκαρπων.",
  },
  {
    slug: "vilana",
    name: "Βηλάνα",
    nameLatin: "Vilana",
    type: VarietyType.WHITE,
    originRegion: "peza",
    acidity: 55,
    body: 35,
    tannins: 0,
    aromaIntensity: 35,
    ageingPotential: 20,
    description: "Η πιο διαδεδομένη λευκή ποικιλία της Κρήτης, ελαφριά και εύπιοτη.",
  },
  // Κόκκινες
  {
    slug: "xinomavro",
    name: "Ξινόμαυρο",
    nameLatin: "Xinomavro",
    type: VarietyType.RED,
    originRegion: "naoussa",
    acidity: 85,
    body: 65,
    tannins: 80,
    aromaIntensity: 70,
    ageingPotential: 90,
    similarTo: "Nebbiolo",
    comparisonNote:
      "Όπως το Nebbiolo, ξεκινάει σκληρό και οξύ αλλά αναπτύσσει σύνθετα, γήινα αρώματα με την παλαίωση.",
    description:
      "Η σημαντικότερη κόκκινη ελληνική ποικιλία, με υψηλή οξύτητα και τανίνες, μεγάλο δυναμικό παλαίωσης.",
  },
  {
    slug: "agiorgitiko",
    name: "Αγιωργίτικο",
    nameLatin: "Agiorgitiko",
    type: VarietyType.RED,
    originRegion: "nemea",
    acidity: 55,
    body: 70,
    tannins: 50,
    aromaIntensity: 65,
    ageingPotential: 55,
    similarTo: "Merlot",
    description: "Ευέλικτη κόκκινη ποικιλία, από ελαφριά ροζέ έως πλούσια κρασιά βαρελιού.",
  },
  {
    slug: "limnio",
    name: "Λημνιό",
    nameLatin: "Limnio",
    type: VarietyType.RED,
    originRegion: null,
    acidity: 60,
    body: 55,
    tannins: 45,
    aromaIntensity: 50,
    ageingPotential: 40,
    description: "Από τις παλαιότερες ονομαστικά καταγεγραμμένες ποικιλίες, με μεσαίο σώμα και βοτανικές νότες.",
  },
  {
    slug: "mavrotragano",
    name: "Μαυροτράγανο",
    nameLatin: "Mavrotragano",
    type: VarietyType.RED,
    originRegion: "santorini",
    acidity: 60,
    body: 75,
    tannins: 65,
    aromaIntensity: 60,
    ageingPotential: 65,
    similarTo: "Syrah",
    description: "Σπάνια σαντορινιά ποικιλία, δίνει συμπυκνωμένα, δομημένα κόκκινα.",
  },
  {
    slug: "kotsifali",
    name: "Κοτσιφάλι",
    nameLatin: "Kotsifali",
    type: VarietyType.RED,
    originRegion: "peza",
    acidity: 45,
    body: 55,
    tannins: 35,
    aromaIntensity: 55,
    ageingPotential: 35,
    description: "Κρητική ποικιλία με απαλές τανίνες, συνήθως σε blend με Μανδηλαριά.",
  },
  {
    slug: "mandilaria",
    name: "Μανδηλαριά",
    nameLatin: "Mandilaria",
    type: VarietyType.RED,
    originRegion: "peza",
    acidity: 70,
    body: 60,
    tannins: 75,
    aromaIntensity: 40,
    ageingPotential: 45,
    description: "Ποικιλία με έντονο χρώμα και τανίνες, δίνει δομή σε blends του Αιγαίου και της Κρήτης.",
  },
  {
    slug: "negoska",
    name: "Νεγκόσκα",
    nameLatin: "Negoska",
    type: VarietyType.RED,
    originRegion: "goumenissa",
    acidity: 45,
    body: 50,
    tannins: 30,
    aromaIntensity: 45,
    ageingPotential: 30,
    description: "Απαλή, χαμηλών τανινών ποικιλία που «στρογγυλεύει» το Ξινόμαυρο στη Γουμένισσα.",
  },
  {
    slug: "mavrodafni",
    name: "Μαυροδάφνη",
    nameLatin: "Mavrodafni",
    type: VarietyType.RED,
    originRegion: "patra",
    acidity: 50,
    body: 80,
    tannins: 55,
    aromaIntensity: 75,
    ageingPotential: 80,
    description: "Ποικιλία της Πάτρας, γνωστή κυρίως από το ομώνυμο γλυκό, ενισχυμένο κρασί.",
  },
] as const;

// Ζεύξεις ποικιλίας ↔ περιοχής (η «κύρια ποικιλία» κάθε ζώνης, από το seed-notes.md)
const varietyOnRegionLinks: Array<{ variety: string; region: string }> = [
  { variety: "xinomavro", region: "naoussa" },
  { variety: "agiorgitiko", region: "nemea" },
  { variety: "asyrtiko", region: "santorini" },
  { variety: "mavrotragano", region: "santorini" },
  { variety: "aidani", region: "santorini" },
  { variety: "moschofilero", region: "mantineia" },
  { variety: "xinomavro", region: "amyndaio" },
  { variety: "xinomavro", region: "goumenissa" },
  { variety: "negoska", region: "goumenissa" },
  { variety: "xinomavro", region: "rapsani" },
  { variety: "robola", region: "robola-kefallinias" },
  { variety: "roditis", region: "patra" },
  { variety: "mavrodafni", region: "patra" },
  { variety: "kotsifali", region: "peza" },
  { variety: "mandilaria", region: "peza" },
  { variety: "vidiano", region: "peza" },
  { variety: "vilana", region: "peza" },
];

// ─────────────────────────────────────────────
// ΚΑΤΗΓΟΡΙΕΣ ΦΑΓΗΤΟΥ
// ─────────────────────────────────────────────

const foodCategories = [
  { slug: "red-meat", name: "Κόκκινο κρέας", emoji: "🥩", blurb: "Πλούσια, τανικά κόκκινα κρασιά κρατούν την ισορροπία με λιπαρό κόκκινο κρέας." },
  { slug: "white-meat", name: "Λευκό κρέας & πουλερικά", emoji: "🍗", blurb: "Μεσαίου σώματος κόκκινα ή πλουσιότερα λευκά ταιριάζουν με κοτόπουλο και γαλοπούλα." },
  { slug: "seafood", name: "Ψάρι & θαλασσινά", emoji: "🐟", blurb: "Φρέσκα, όξινα λευκά αναδεικνύουν τη φινέτσα του ψαριού χωρίς να τη σκεπάζουν." },
  { slug: "pasta", name: "Ζυμαρικά & ριζότο", emoji: "🍝", blurb: "Η οξύτητα κόβει τη σάλτσα ντομάτας ή την κρέμα, ό,τι κι αν έχει το πιάτο." },
  { slug: "cheese", name: "Τυριά & μεζέδες", emoji: "🧀", blurb: "Από ελαφριά λευκά έως γλυκά κρασιά, ανάλογα με την ηλικία και τη λιπαρότητα του τυριού." },
  { slug: "vegetarian", name: "Λαχανικά & vegetarian", emoji: "🥗", blurb: "Ελαφριά, φρέσκα κρασιά αφήνουν χώρο στις γεύσεις λαχανικών και οσπρίων." },
  { slug: "spicy", name: "Πικάντικο φαγητό", emoji: "🌶️", blurb: "Χαμηλότερο αλκοόλ και λίγη γλύκα βοηθούν να μη «φουντώνει» η καυτερότητα." },
  { slug: "dessert", name: "Γλυκό / επιδόρπιο", emoji: "🍯", blurb: "Το κρασί χρειάζεται να είναι πιο γλυκό από το επιδόρπιο, αλλιώς φαίνεται ξινό." },
] as const;

// ─────────────────────────────────────────────
// ΟΙΝΟΠΟΙΕΙΑ & ΕΤΙΚΕΤΕΣ (πλασματικά δείγματα, μόνο για development)
// ─────────────────────────────────────────────

const wineries = [
  {
    slug: "ktima-palaiou-ampelona",
    name: "Κτήμα Παλαιού Αμπελώνα",
    region: "naoussa",
    foundedYear: 1978,
    generation: 3,
    isOrganic: true,
    isVerified: true,
    description: "Οικογενειακό κτήμα στη Νάουσα, εστιασμένο αποκλειστικά σε μονοποικιλιακό Ξινόμαυρο.",
  },
  {
    slug: "ampelones-asimeniou-lofou",
    name: "Αμπελώνες Ασημένιου Λόφου",
    region: "santorini",
    foundedYear: 1955,
    generation: 4,
    isOrganic: false,
    isVerified: true,
    description: "Παραδοσιακό κτήμα στη Σαντορίνη, με αμπέλια καλλιεργημένα στην παραδοσιακή μορφή κουλούρας.",
  },
  {
    slug: "ktima-petrinou-pyrgou",
    name: "Κτήμα Πέτρινου Πύργου",
    region: "nemea",
    foundedYear: 1991,
    generation: 2,
    isOrganic: false,
    isVerified: false,
    description: "Νεότερο κτήμα στη Νεμέα, με έμφαση σε σύγχρονο στιλ Αγιωργίτικου.",
  },
] as const;

const wines = [
  {
    slug: "palaios-ampelonas-xinomavro-2019",
    name: "Παλαιός Αμπελώνας Ξινόμαυρο 2019",
    winery: "ktima-palaiou-ampelona",
    region: "naoussa",
    vintage: 2019,
    color: WineColor.RED,
    style: WineStyle.DRY,
    abv: 13.5,
    appellation: Appellation.PDO,
    priceRange: PriceRange.MID,
    servingTemp: "16–18°C",
    foodPairings: ["Κόκκινο κρέας", "Ώριμα τυριά"],
    avgRating: 4.3,
    reviewCount: 128,
    varietyMix: [{ variety: "xinomavro", percentage: 100 }],
    tastingNotes: "Ξερά ντομάτα, ελιά, ξηρά μπαχαρικά· σφιχτές τανίνες που μαλακώνουν με αναπνοή.",
  },
  {
    slug: "palaios-ampelonas-xinomavro-roze-2023",
    name: "Παλαιός Αμπελώνας Ξινόμαυρο Ροζέ 2023",
    winery: "ktima-palaiou-ampelona",
    region: "naoussa",
    vintage: 2023,
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    abv: 12.5,
    appellation: Appellation.PDO,
    priceRange: PriceRange.BUDGET,
    servingTemp: "8–10°C",
    foodPairings: ["Ψάρι & θαλασσινά", "Λαχανικά"],
    avgRating: 4.0,
    reviewCount: 54,
    varietyMix: [{ variety: "xinomavro", percentage: 100 }],
    tastingNotes: "Φρέσκο κόκκινο φρούτο και ροδοπέταλο, ζωηρή οξύτητα.",
  },
  {
    slug: "asimenios-lofos-asyrtiko-kalderas-2023",
    name: "Ασύρτικο Καλντέρας 2023",
    winery: "ampelones-asimeniou-lofou",
    region: "santorini",
    vintage: 2023,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    abv: 13.5,
    appellation: Appellation.PDO,
    priceRange: PriceRange.PREMIUM,
    servingTemp: "9–11°C",
    foodPairings: ["Ψάρι & θαλασσινά", "Τυριά & μεζέδες"],
    avgRating: 4.6,
    reviewCount: 210,
    varietyMix: [{ variety: "asyrtiko", percentage: 100 }],
    tastingNotes: "Έντονη ορυκτικότητα, εσπεριδοειδή και μια αλμυρή, μακρά επίγευση.",
  },
  {
    slug: "asimenios-lofos-mavrotragano-2020",
    name: "Μαυροτράγανο 2020",
    winery: "ampelones-asimeniou-lofou",
    region: "santorini",
    vintage: 2020,
    color: WineColor.RED,
    style: WineStyle.DRY,
    abv: 14,
    appellation: Appellation.PGI,
    priceRange: PriceRange.PREMIUM,
    servingTemp: "17–18°C",
    foodPairings: ["Κόκκινο κρέας"],
    avgRating: 4.4,
    reviewCount: 76,
    varietyMix: [{ variety: "mavrotragano", percentage: 100 }],
    tastingNotes: "Συμπυκνωμένο μαύρο φρούτο, βότανα της Σαντορίνης, σφιχτή δομή.",
  },
  {
    slug: "petrinos-pyrgos-agiorgitiko-palaias-seiras-2021",
    name: "Αγιωργίτικο Παλαιάς Σειράς 2021",
    winery: "ktima-petrinou-pyrgou",
    region: "nemea",
    vintage: 2021,
    color: WineColor.RED,
    style: WineStyle.DRY,
    abv: 13.5,
    appellation: Appellation.PDO,
    priceRange: PriceRange.MID,
    servingTemp: "16–17°C",
    foodPairings: ["Ζυμαρικά & ριζότο", "Κόκκινο κρέας"],
    avgRating: 4.2,
    reviewCount: 95,
    varietyMix: [{ variety: "agiorgitiko", percentage: 100 }],
    tastingNotes: "Ώριμο κόκκινο φρούτο, βανίλια από ελαφρύ βαρέλι, στρογγυλές τανίνες.",
  },
  {
    slug: "petrinos-pyrgos-roze-agiorgitiko-2023",
    name: "Ροζέ Αγιωργίτικο 2023",
    winery: "ktima-petrinou-pyrgou",
    region: "nemea",
    vintage: 2023,
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    abv: 12.5,
    appellation: Appellation.PDO,
    priceRange: PriceRange.BUDGET,
    servingTemp: "8–10°C",
    foodPairings: ["Λαχανικά & vegetarian", "Ζυμαρικά & ριζότο"],
    avgRating: 3.9,
    reviewCount: 40,
    varietyMix: [{ variety: "agiorgitiko", percentage: 100 }],
    tastingNotes: "Φράουλα και κόκκινο μήλο, ελαφρύ σώμα, εύκολο για καθημερινή χρήση.",
  },
] as const;

// ─────────────────────────────────────────────
// ΑΡΘΡΑ (δείγμα editorial περιεχόμενο)
// ─────────────────────────────────────────────

const articles: Array<{
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: ArticleCategory;
  region: string | null;
  readMinutes: number;
  tags: string[];
  daysAgo: number;
}> = [
  {
    slug: "giati-to-asyrtiko-den-moiazei-me-kanena-allo-lefko",
    title: "Γιατί το Ασύρτικο δεν μοιάζει με κανένα άλλο λευκό",
    excerpt:
      "Η ηφαιστειακή γη, η κουλούρα και η αλμύρα της Καλντέρας — τι κάνει αυτή την ποικιλία μοναδική στον κόσμο.",
    body: `Το Ασύρτικο είναι ίσως η πιο διεθνώς αναγνωρίσιμη ελληνική λευκή ποικιλία, και ο λόγος δεν είναι τυχαίος. Στη Σαντορίνη, τα αμπέλια καλλιεργούνται σε σχήμα «κουλούρα» — μια παραδοσιακή τεχνική πλεξίματος των κλαδιών σε φωλιά κοντά στο έδαφος, που προστατεύει τα τσαμπιά από τον δυνατό άνεμο του νησιού και τον καυτό ήλιο του καλοκαιριού.

Το ηφαιστειογενές έδαφος —κυρίως ελαφρόπετρα και ηφαιστειακή τέφρα— δεν κρατά νερό, κάτι που αναγκάζει τις ρίζες να φτάσουν βαθιά. Το αποτέλεσμα είναι κρασιά με έντονη οξύτητα, αλμυρή ορυκτικότητα και μια ικανότητα παλαίωσης που σπάνια συναντάς σε λευκά κρασιά νότιας Ευρώπης.

Δεν είναι τυχαίο που πολλοί σομελιέ συγκρίνουν το Ασύρτικο Καλντέρας με Chablis υψηλής οξύτητας ή με νεαρό Riesling — η αναλογία βοηθά, αλλά ο χαρακτήρας του παραμένει αυστηρά δικός του.`,
    category: ArticleCategory.VARIETIES,
    region: "santorini",
    readMinutes: 6,
    tags: ["Ασύρτικο", "Σαντορίνη", "Ηφαιστειακό έδαφος"],
    daysAgo: 3,
  },
  {
    slug: "xinomavro-to-barolo-tis-elladas",
    title: "Ξινόμαυρο: το «Βαρόλο της Ελλάδας»;",
    excerpt:
      "Μια ματιά στην ποικιλία που χρειάζεται χρόνο, υπομονή και σωστή αποθήκευση για να δείξει το καλύτερό της.",
    body: `Η σύγκριση του Ξινόμαυρου με το ιταλικό Nebbiolo (τη σταφίδα πίσω από το Βαρόλο) δεν είναι απλώς μάρκετινγκ. Και οι δύο ποικιλίες συνδυάζουν ανοιχτό χρώμα με υψηλή οξύτητα και σφιχτές τανίνες — ένα προφίλ που παραπλανά όσους περιμένουν «βαρύ» κόκκινο κρασί από το χρώμα του ποτηριού.

Νέο, το Ξινόμαυρο μπορεί να είναι σκληρό: έντονη οξύτητα, στυφές τανίνες, νότες ξερής ντομάτας και ελιάς. Χρειάζεται συνήθως 5 έως 10 χρόνια στο μπουκάλι για να ανοίξει σε κάτι πιο σύνθετο — ξερά μπαχαρικά, δέρμα, αποξηραμένα κόκκινα φρούτα.

Η Νάουσα παραμένει η πιο γνωστή ζώνη ΠΟΠ για μονοποικιλιακό Ξινόμαυρο, αλλά η ποικιλία δίνει διαφορετικό χαρακτήρα σε κάθε περιοχή: πιο ελαφρύ και ροζέ στιλ στο ψυχρό Αμύνταιο, πιο στρογγυλό όταν συνδυάζεται με Νεγκόσκα στη Γουμένισσα.`,
    category: ArticleCategory.VARIETIES,
    region: "naoussa",
    readMinutes: 4,
    tags: ["Ξινόμαυρο", "Νάουσα", "Παλαίωση"],
    daysAgo: 9,
  },
  {
    slug: "pente-mikra-oinopoieia-sti-nemea",
    title: "Πέντε μικρά οινοποιεία στη Νεμέα που αξίζει να προσέξεις",
    excerpt:
      "Πέρα από τα γνωστά ονόματα, μια νέα γενιά παραγωγών δουλεύει με σεβασμό στο Αγιωργίτικο.",
    body: `Η Νεμέα είναι η μεγαλύτερη ζώνη ΠΟΠ ερυθρού κρασιού στην Ελλάδα, και εδώ και μια δεκαετία βλέπει μια σιωπηλή ανανέωση: μικρά, οικογενειακά κτήματα που επενδύουν σε χαμηλότερες αποδόσεις, πιο προσεκτική διαλογή και λιγότερο βαρέλι.

Το Αγιωργίτικο είναι μια ασυνήθιστα ευέλικτη ποικιλία — δίνει από ελαφριά, φρουτώδη ροζέ έως πλούσια, δομημένα κρασιά με δυναμικό παλαίωσης. Αυτή η ευελιξία είναι που επιτρέπει σε μικρούς παραγωγούς να πειραματίζονται χωρίς να χρειάζονται τεράστιες εκτάσεις.

Αν ψάχνεις σημείο εκκίνησης, ξεκίνα από ετικέτες με σαφή αναφορά σε συγκεκριμένο αμπελώνα (όχι απλώς «Νεμέα») — συνήθως σημάδι πιο προσεκτικής δουλειάς στο κτήμα.`,
    category: ArticleCategory.PEOPLE,
    region: "nemea",
    readMinutes: 8,
    tags: ["Νεμέα", "Αγιωργίτικο", "Παραγωγοί"],
    daysAgo: 16,
  },
  {
    slug: "pos-na-diavaseis-mia-elliniki-etiketa-krasiou",
    title: "Πώς να διαβάσεις μια ελληνική ετικέτα κρασιού",
    excerpt:
      "ΠΟΠ, ΠΓΕ, τοπικός οίνος — τι σημαίνουν πραγματικά αυτοί οι όροι και γιατί έχουν σημασία.",
    body: `Στις ελληνικές ετικέτες συναντάς συχνά τρεις όρους: ΠΟΠ (Προστατευόμενη Ονομασία Προέλευσης), ΠΓΕ (Προστατευόμενη Γεωγραφική Ένδειξη) και «τοπικός οίνος». Δεν είναι απλώς γραφειοκρατία — δηλώνουν διαφορετικό επίπεδο κανόνων.

Μια ζώνη ΠΟΠ (όπως η Νάουσα ή η Σαντορίνη) έχει αυστηρά καθορισμένα όρια, επιτρεπόμενες ποικιλίες και μεθόδους καλλιέργειας. Το ΠΓΕ επιτρέπει μεγαλύτερη ευελιξία σε ποικιλίες και προέλευση σταφυλιών, ενώ ο «τοπικός οίνος» έχει τους λιγότερους περιορισμούς.

Τίποτα από αυτά δεν εγγυάται από μόνο του ποιότητα — ένα καλό ΠΓΕ μπορεί να είναι καλύτερο από ένα μέτριο ΠΟΠ. Αλλά η ένδειξη σου λέει κάτι συγκεκριμένο για το πού και πώς φτιάχτηκε το κρασί, και αυτό αξίζει να το ξέρεις πριν διαλέξεις.`,
    category: ArticleCategory.GUIDES,
    region: null,
    readMinutes: 5,
    tags: ["ΠΟΠ", "ΠΓΕ", "Οδηγός"],
    daysAgo: 23,
  },
];

// Επιπλέον ζεύξεις φαγητού ↔ κρασιού με "γιατί ταιριάζει" — για το «Τι θα φας;»
const foodPairingLinks: Array<{ wine: string; foodCategory: string; reason: string }> = [
  {
    wine: "palaios-ampelonas-xinomavro-2019",
    foodCategory: "red-meat",
    reason: "Οι σφιχτές τανίνες και η οξύτητα κόβουν το λίπος του κρέατος στη σχάρα.",
  },
  {
    wine: "asimenios-lofos-asyrtiko-kalderas-2023",
    foodCategory: "seafood",
    reason: "Η αλμυρότητα και η οξύτητα του Ασύρτικου δένουν φυσικά με θαλασσινά.",
  },
  {
    wine: "asimenios-lofos-mavrotragano-2020",
    foodCategory: "red-meat",
    reason: "Πυκνό σώμα και τανίνες που θέλουν αντίστοιχα πλούσιο κρέας.",
  },
  {
    wine: "petrinos-pyrgos-agiorgitiko-palaias-seiras-2021",
    foodCategory: "pasta",
    reason: "Το κόκκινο φρούτο του Αγιωργίτικου δένει με σάλτσες ντομάτας.",
  },
  {
    wine: "petrinos-pyrgos-roze-agiorgitiko-2023",
    foodCategory: "vegetarian",
    reason: "Ελαφρύ σώμα και φρουτώδης χαρακτήρας, χωρίς να σκεπάζει λαχανικά.",
  },
  {
    wine: "palaios-ampelonas-xinomavro-roze-2023",
    foodCategory: "seafood",
    reason: "Ζωηρή οξύτητα και ελαφρύ σώμα, ιδανικό για ψητό ψάρι.",
  },
];

async function main() {
  console.log("Seeding regions…");
  const regionIdBySlug = new Map<string, string>();
  for (const r of regions) {
    const { slug, ...data } = r;
    const created = await prisma.region.upsert({
      where: { slug },
      update: { ...data, appellation: Appellation.PDO },
      create: { slug, ...data, appellation: Appellation.PDO },
    });
    regionIdBySlug.set(slug, created.id);
  }

  console.log("Seeding varieties…");
  const regionNameBySlug = new Map(regions.map((r) => [r.slug, r.name]));
  const varietyIdBySlug = new Map<string, string>();
  for (const v of varieties) {
    const { slug, originRegion, ...data } = v;
    const originRegionName = originRegion ? regionNameBySlug.get(originRegion) ?? null : null;
    const created = await prisma.variety.upsert({
      where: { slug },
      update: { ...data, originRegion: originRegionName },
      create: { slug, ...data, originRegion: originRegionName },
    });
    varietyIdBySlug.set(slug, created.id);
  }

  console.log("Linking varieties to regions…");
  for (const link of varietyOnRegionLinks) {
    const varietyId = varietyIdBySlug.get(link.variety);
    const regionId = regionIdBySlug.get(link.region);
    if (!varietyId || !regionId) continue;
    await prisma.varietyOnRegion.upsert({
      where: { varietyId_regionId: { varietyId, regionId } },
      update: {},
      create: { varietyId, regionId },
    });
  }

  console.log("Seeding food categories…");
  const foodCategoryIdBySlug = new Map<string, string>();
  for (const [index, fc] of foodCategories.entries()) {
    const { slug, ...data } = fc;
    const created = await prisma.foodCategory.upsert({
      where: { slug },
      update: { ...data, sortOrder: index },
      create: { slug, ...data, sortOrder: index },
    });
    foodCategoryIdBySlug.set(slug, created.id);
  }

  console.log("Seeding wineries…");
  const wineryIdBySlug = new Map<string, string>();
  for (const w of wineries) {
    const { slug, region, ...data } = w;
    const regionId = regionIdBySlug.get(region);
    if (!regionId) continue;
    const created = await prisma.winery.upsert({
      where: { slug },
      update: { ...data, regionId, status: ContentStatus.PUBLISHED },
      create: { slug, ...data, regionId, status: ContentStatus.PUBLISHED },
    });
    wineryIdBySlug.set(slug, created.id);
  }

  console.log("Seeding wines…");
  const wineIdBySlug = new Map<string, string>();
  for (const w of wines) {
    const { slug, winery, region, varietyMix, ...data } = w;
    const wineryId = wineryIdBySlug.get(winery);
    const regionId = regionIdBySlug.get(region);
    if (!wineryId || !regionId) continue;
    const payload = { ...data, foodPairings: [...data.foodPairings], wineryId, regionId };
    const created = await prisma.wine.upsert({
      where: { slug },
      update: payload,
      create: { slug, ...payload },
    });
    wineIdBySlug.set(slug, created.id);

    for (const mix of varietyMix) {
      const varietyId = varietyIdBySlug.get(mix.variety);
      if (!varietyId) continue;
      await prisma.varietyOnWine.upsert({
        where: { wineId_varietyId: { wineId: created.id, varietyId } },
        update: { percentage: mix.percentage },
        create: { wineId: created.id, varietyId, percentage: mix.percentage },
      });
    }
  }

  console.log("Seeding food pairings…");
  for (const [index, fp] of foodPairingLinks.entries()) {
    const wineId = wineIdBySlug.get(fp.wine);
    const foodCategoryId = foodCategoryIdBySlug.get(fp.foodCategory);
    if (!wineId || !foodCategoryId) continue;
    await prisma.foodPairing.upsert({
      where: { foodCategoryId_wineId: { foodCategoryId, wineId } },
      update: { reason: fp.reason, sortOrder: index },
      create: { foodCategoryId, wineId, reason: fp.reason, sortOrder: index },
    });
  }

  console.log("Seeding articles…");
  for (const a of articles) {
    const { slug, region, daysAgo, ...data } = a;
    const regionId = region ? regionIdBySlug.get(region) ?? null : null;
    const publishedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    await prisma.article.upsert({
      where: { slug },
      update: { ...data, regionId, status: ContentStatus.PUBLISHED, publishedAt },
      create: { slug, ...data, regionId, status: ContentStatus.PUBLISHED, publishedAt },
    });
  }

  console.log("Seeding admin user (dev only — άλλαξε τον κωδικό πριν το launch)…");
  const adminPasswordHash = await bcrypt.hash("admin12345", 10);
  await prisma.user.upsert({
    where: { email: "admin@oenia.gr" },
    update: { role: UserRole.ADMIN },
    create: {
      email: "admin@oenia.gr",
      password: adminPasswordHash,
      name: "Oenia Admin",
      role: UserRole.ADMIN,
    },
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
