// Εισαγωγή πραγματικών, επαληθευμένων οινοποιείων/ετικετών — σε αντίθεση με το
// seed.ts (πλασματικά dev δεδομένα). Τα βασικά κρασιά (44) προήλθαν από αρχείο
// που έδωσε ο χρήστης· τα στοιχεία οινοποιείου και οι χρονιές παρακάτω
// ερευνήθηκαν online από επίσημες πηγές — βλ. σχόλια με πηγή σε κάθε winery.
//
// Vintage: βρέθηκε τεκμηριωμένα μόνο για 9/44 κρασιά (VINTAGE_OVERRIDES).
// Τα υπόλοιπα μένουν null («άγνωστο») αντί να μαντέψουμε λάθος χρονιά — μπορούν
// να συμπληρωθούν αργότερα μέσω prisma studio ή του admin.
//
// appellation (ΠΟΠ/ΠΓΕ) παραλείπεται σκόπιμα για όλα: πολλά από αυτά τα κρασιά
// είναι blends με διεθνείς ποικιλίες που συνήθως ΔΕΝ πληρούν τους όρους ΠΟΠ της
// ζώνης τους, και δεν έχουμε επιβεβαιωμένη τη νομική ένδειξη της κάθε ετικέτας.

import { PrismaClient, Appellation, ContentStatus, MacroRegion, VarietyType, WineColor, WineStyle } from "@prisma/client";
import { slugify } from "../lib/slugify";
import wines from "./data/real-wines-source.json";

const prisma = new PrismaClient();

type SourceWine = {
  name: string;
  winery_name: string;
  winery_slug: string;
  name_en: string;
  type: string;
  varieties: string;
  winemaking: string;
  tasting_notes: string;
  serving_temp: string;
  food_pairing: string;
};

// Τεκμηριωμένες τρέχουσες χρονιές (retailer/producer pages, Σεπτ. 2026).
const VINTAGE_OVERRIDES: Record<string, number> = {
  "Κτήμα Βιβλία Χώρα Ερυθρό": 2024, // houseofwine.gr
  "Κτήμα Βιβλία Χώρα Ροζέ": 2025, // houseofwine.gr
  "Πλαγίως Λευκό": 2024, // houseofwine.gr
  "Αρετή Ερυθρό": 2016, // houseofwine.gr
  "Μέγας Οίνος": 2021, // James Suckling 92pts, greeceandgrapes.com, empirewine.com
  Σύνορο: 2021, // AWC Vienna Gold, greeceandgrapes.com
  "Χελώνες Syrah": 2023, // houseofwine.gr
  "Ecosystem Pinot Noir (Στροφή)": 2023, // houseofwine.gr
  "Ecosystem Ασύρτικο (Αγία Κυριακή)": 2024, // houseofwine.gr
};

const TYPE_MAP: Record<string, { color: WineColor; style: WineStyle }> = {
  "Λευκό Ξηρό / Dry White": { color: WineColor.WHITE, style: WineStyle.DRY },
  "Ροζέ Ξηρό / Dry Rose": { color: WineColor.ROSE, style: WineStyle.DRY },
  "Ερυθρό Ξηρό / Dry Red": { color: WineColor.RED, style: WineStyle.DRY },
  "Λευκό Γλυκό / Sweet White": { color: WineColor.WHITE, style: WineStyle.SWEET },
};

// Νέες ποικιλίες που εμφανίζονται στα δεδομένα και δεν υπάρχουν ήδη στη βάση
// (seed.ts καλύπτει μόνο ελληνικές). Χωρίς trait values — δεν έχουμε
// τεκμηριωμένα στοιχεία γεύσης ειδικά για αυτό το project, καλύτερα κενό παρά
// επινοημένο.
const NEW_VARIETIES: { name: string; type: VarietyType }[] = [
  { name: "Sauvignon Blanc", type: VarietyType.WHITE },
  { name: "Cabernet Sauvignon", type: VarietyType.RED },
  { name: "Merlot", type: VarietyType.RED },
  { name: "Semillon", type: VarietyType.WHITE },
  { name: "Chardonnay", type: VarietyType.WHITE },
  { name: "Cabernet Franc", type: VarietyType.RED },
  { name: "Syrah", type: VarietyType.RED },
  { name: "Pinot Noir", type: VarietyType.RED },
  { name: "Tannat", type: VarietyType.RED },
  { name: "Viognier", type: VarietyType.WHITE },
  { name: "Gewürztraminer", type: VarietyType.WHITE },
  { name: "Μαυροφίλερο", type: VarietyType.RED },
];

// Καθαρίζει ένα κελί "varieties" σε λίστα { name, percentage }. Αγνοεί άγνωστες
// τοπικές ποικιλίες Παγγαίου (η ίδια η πηγή δεν τις κατονομάζει) και τυχόν
// εναλλακτικές σε παρένθεση (π.χ. "Syrah (ή Tannat/Merlot...)").
function parseVarieties(cell: string): { name: string; percentage: number | null }[] {
  if (cell.includes("Παγγαίου")) return [];
  return cell
    .split(",")
    .map((part) => part.trim())
    .map((part) => part.replace(/\s*\([^)]*\)\s*$/, "").trim())
    .filter(Boolean)
    .map((part) => {
      const match = part.match(/^(.*?)\s+(\d+)%$/);
      if (match) return { name: match[1].trim(), percentage: Number(match[2]) };
      return { name: part, percentage: null };
    });
}

async function main() {
  console.log("Seeding real region: Παγγαίο (Κτήμα Βιβλία Χώρα)…");
  // Πηγές: en.wikipedia δεν είχε σελίδα· oinognosia.wine/kategory/pge-paggaioy/,
  // kavalapost.gr — η ζώνη είναι ΠΓΕ Παγγαίου, Καβάλα, Βόρεια Ελλάδα.
  const pangaio = await prisma.region.upsert({
    where: { slug: "pangaio" },
    update: {},
    create: {
      slug: "pangaio",
      name: "Παγγαίο",
      macroRegion: MacroRegion.NORTHERN_GREECE,
      appellation: Appellation.PGI,
      description:
        "Οι πλαγιές του όρους Παγγαίο, στο Κοκκινόχωρι Καβάλας — ζώνη ΠΓΕ Παγγαίου γνωστή για συνδυασμούς ελληνικών και διεθνών ποικιλιών.",
      latitude: 40.9397,
      longitude: 24.402,
    },
  });

  const nemea = await prisma.region.findUniqueOrThrow({ where: { slug: "nemea" } });
  const amyndaio = await prisma.region.findUniqueOrThrow({ where: { slug: "amyndaio" } });

  console.log("Seeding real wineries…");
  const wineryBySlug = new Map<string, { id: string; regionId: string }>();

  wineryBySlug.set(
    "ktima-biblia-chora",
    await prisma.winery.upsert({
      where: { slug: "ktima-biblia-chora" },
      update: {},
      create: {
        slug: "ktima-biblia-chora",
        name: "Κτήμα Βιβλία Χώρα",
        regionId: pangaio.id,
        foundedYear: 1998,
        isOrganic: true, // βιολογική πιστοποίηση από το 2020 — bibliachora.gr/en/history-and-people/
        description:
          "Ιδρύθηκε το 1998 από τους οινολόγους Βαγγέλη Γεροβασιλείου και Βασίλη Τσακτσαρλή στις πλαγιές του Παγγαίου, στο Κοκκινόχωρι Καβάλας. Το όνομα προτάθηκε από τη Δρ. Σταυρούλα Κουράκου-Δραγώνα, από την αρχαία ονομασία της περιοχής.",
        websiteUrl: "https://bibliachora.gr/en/",
        status: ContentStatus.PUBLISHED,
        isVerified: false,
      },
    })
  );

  wineryBySlug.set(
    "domaine-skouras",
    await prisma.winery.upsert({
      where: { slug: "domaine-skouras" },
      update: {},
      create: {
        slug: "domaine-skouras",
        name: "Κτήμα Σκούρα",
        regionId: nemea.id,
        foundedYear: 1986,
        description:
          "Ξεκίνησε το 1986 από τον Γιώργο Σκούρα με την πρωτοποριακή, τότε, ετικέτα «Μέγας Οίνος» (Αγιωργίτικο-Cabernet Sauvignon). Το 2004 το οινοποιείο μεταφέρθηκε στο Μαλανδρένι, στη ζώνη ΠΟΠ Νεμέας.",
        websiteUrl: "https://skouras.gr/en",
        status: ContentStatus.PUBLISHED,
        isVerified: false,
      },
    })
  );

  wineryBySlug.set(
    "alpha-estate",
    await prisma.winery.upsert({
      where: { slug: "alpha-estate" },
      update: {},
      create: {
        slug: "alpha-estate",
        name: "Κτήμα Άλφα",
        regionId: amyndaio.id,
        foundedYear: 1997,
        description:
          "Ιδρύθηκε το 1997 από τον αμπελουργό Μάκη Μαυρίδη και τον οινολόγο-χημικό Άγγελο Ιατρίδη, στο οροπέδιο του Αμυνταίου (υψόμετρο έως 710μ). Καλλιεργεί τόσο ελληνικές όσο και διεθνείς ποικιλίες σε ενιαίο 220 εκταρίων αμπελώνα.",
        websiteUrl: "https://alpha-estate.com/",
        status: ContentStatus.PUBLISHED,
        isVerified: false,
      },
    })
  );

  console.log("Seeding new (mostly international) varieties…");
  const varietyIdByName = new Map<string, string>();
  for (const v of await prisma.variety.findMany({ select: { id: true, name: true } })) {
    varietyIdByName.set(v.name, v.id);
  }
  for (const v of NEW_VARIETIES) {
    if (varietyIdByName.has(v.name)) continue;
    const created = await prisma.variety.upsert({
      where: { name: v.name },
      update: {},
      create: { name: v.name, slug: slugify(v.name), type: v.type },
    });
    varietyIdByName.set(v.name, created.id);
  }

  console.log(`Seeding ${(wines as SourceWine[]).length} real wines…`);
  for (const w of wines as SourceWine[]) {
    const winery = wineryBySlug.get(w.winery_slug);
    if (!winery) {
      console.warn("Skipping wine with unknown winery_slug:", w.winery_slug, w.name);
      continue;
    }
    const typeInfo = TYPE_MAP[w.type];
    if (!typeInfo) {
      console.warn("Skipping wine with unknown type:", w.type, w.name);
      continue;
    }

    const slug = slugify(w.name);
    const foodPairings = w.food_pairing
      .split(/[,.]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const wine = await prisma.wine.upsert({
      where: { slug },
      update: {},
      create: {
        name: w.name,
        slug,
        wineryId: winery.id,
        regionId: winery.regionId,
        vintage: VINTAGE_OVERRIDES[w.name] ?? null,
        color: typeInfo.color,
        style: typeInfo.style,
        description: w.winemaking || null,
        tastingNotes: w.tasting_notes || null,
        servingTemp: w.serving_temp || null,
        foodPairings,
        status: ContentStatus.PUBLISHED,
      },
    });

    for (const { name, percentage } of parseVarieties(w.varieties)) {
      const varietyId = varietyIdByName.get(name);
      if (!varietyId) {
        console.warn("Unknown variety, skipping link:", name, "for", w.name);
        continue;
      }
      await prisma.varietyOnWine.upsert({
        where: { wineId_varietyId: { wineId: wine.id, varietyId } },
        update: { percentage },
        create: { wineId: wine.id, varietyId, percentage },
      });
    }
  }

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
