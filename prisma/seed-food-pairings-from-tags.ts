// Γεμίζει το κενό FoodPairing table (το «Τι θα φας;» feature, /tairiasma)
// mapping-ώντας το ήδη υπάρχον, εγκεκριμένο Wine.foodPairings ελεύθερο
// κείμενο (455 διακριτές τιμές σε 297 wines) στις 8 ήδη υπάρχουσες
// FoodCategory. Καθαρά μηχανική μετατροπή ήδη εγκεκριμένου περιεχομένου —
// ΚΑΝΕΝΑ νέο editorial κείμενο δεν γράφεται (reason παραμένει null σε όλα).
//
// Κανόνες: substring match σε lowercase/χωρίς τόνους, σχεδιασμένοι για
// ΥΨΗΛΗ precision (καλύτερα ένα tag να μείνει unmapped παρά να μπει σε
// λάθος κατηγορία) — επαληθευμένοι με dry-run πριν το write, με στοχευμένα
// exclude rules για γνωστά substring false-positives (π.χ. "τον" ⊂ "στον",
// "ταρτ" ⊂ "ταρτάρ", "γλυκ" ⊂ "γλυκόξινο").
//
// Ένα wine μπορεί να μπει σε >1 κατηγορίες αν τα tags του ταιριάζουν σε
// περισσότερες (σωστό — π.χ. "Ζυμαρικά με θαλασσινά" → seafood + pasta).
// Ασφαλές να ξανατρέξει: abort αν το FoodPairing table δεν είναι ήδη κενό.

import { prisma } from "../lib/prisma";

type Rule = { slug: string; include: string[]; exclude?: string[] };

const RULES: Rule[] = [
  {
    slug: "seafood",
    include: [
      "ψαρ", "θαλασσιν", "οστρακ", "στρειδ", "μυδ", "γαριδ", "καραβιδ", "αστακ",
      "καλαμαρ", "χταποδ", "σολομ", "τονο", "μπαρμπουν", "πεστροφ", "σαλιγκαρ",
      "sushi", "σουσι", "sashimi", "σασιμι", "ceviche", "σεβιτσε", "tataki",
      "μαλακι", "κυδωνι", "carpaccio θαλασσιν",
    ],
  },
  {
    slug: "red-meat",
    include: [
      "μοσχαρ", "βοδιν", "μπριζολ", "steak", "rib-eye", "t-bone",
      "bistecca", "burger", "κυνηγι", "αγριογουρουν", "αρνι", "παιδακι",
      "κατσικι", "κατσικ", "beef bourguignon", "tartar", "σιγομαγειρεμεν",
      "κρεατα στα καρβουνα", "κοκ-ο-βεν", "φιλετο μοσχ", "φιλετο βοδιν",
    ],
    exclude: ["τυρι", "λευκ"],
  },
  {
    slug: "red-meat",
    include: ["κρεας", "κρεατος", "κρεατα"],
    exclude: ["λευκ", "τυρι"],
  },
  {
    slug: "white-meat",
    include: [
      "κοτοπουλ", "πουλερικ", "γαλοπουλ", "παπια", "κουνελ", "χοιριν", "κοκορ", "λευκο κρε",
      "λευκα κρε", "λευκο και κοκκιν",
    ],
  },
  {
    slug: "pasta",
    include: ["ζυμαρικ", "ριζοτο", "μακαρον", "παστιτσιο", "καρμποναρα", "σπαγγετι", "μπολονεζ"],
  },
  {
    slug: "cheese",
    include: [
      "τυρι", "τυρο", "γραβιερα", "roquefort", "γκοργκοντζολα", "πεκορινο",
      "χαλουμι", "μοτσαρελ", "φετα", "κοπανιστ", "αλλαντικ", "προσουτο",
    ],
  },
  {
    slug: "vegetarian",
    include: [
      "λαχανικ", "χορτοπιτ", "οσπρια", "φακες", "φαβα", "γεμιστ", "ντολμαδ",
      "μελιτζαν", "ελιες", "μανιταρ", "λαδερ", "σουπες λαχανικων", "σαλατ",
    ],
    exclude: ["τυρι", "ταραμο"],
  },
  {
    slug: "spicy",
    include: [
      "πικαντικ", "ασιατικ", "κινεζικ", "ταϋλανδεζικ", "καρυ", "γλυκοξιν",
      "νουντλς", "σογιας",
    ],
  },
  {
    slug: "dessert",
    include: [
      "γλυκ", "επιδορπι", "σοκολατ", "παγωτο", "sorbet", "ταρτ", "κεικ",
      "μπακλαβα", "cheesecake", "panna cotta", "σιροπιαστ", "αμυγδαλωτ",
    ],
    exclude: ["ταρταρ", "γλυκοξιν"],
  },
];

function toKey(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function matchCategories(tag: string): string[] {
  const key = toKey(tag);
  const matched = new Set<string>();
  for (const rule of RULES) {
    const hit = rule.include.some((kw) => key.includes(toKey(kw)));
    if (!hit) continue;
    const excluded = rule.exclude?.some((kw) => key.includes(toKey(kw))) ?? false;
    if (excluded) continue;
    matched.add(rule.slug);
  }
  return [...matched];
}

async function main() {
  const existing = await prisma.foodPairing.count();
  if (existing > 0) {
    throw new Error(`Το FoodPairing table έχει ήδη ${existing} εγγραφές — abort χωρίς αλλαγές.`);
  }

  const categories = await prisma.foodCategory.findMany({ select: { id: true, slug: true } });
  const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  const wines = await prisma.wine.findMany({
    where: { foodPairings: { isEmpty: false }, status: "PUBLISHED" },
    select: { id: true, slug: true, foodPairings: true },
  });

  const rows: { foodCategoryId: string; wineId: string }[] = [];
  const seen = new Set<string>();
  for (const wine of wines) {
    const cats = new Set<string>();
    for (const tag of wine.foodPairings) for (const c of matchCategories(tag)) cats.add(c);
    for (const slug of cats) {
      const categoryId = categoryIdBySlug.get(slug);
      if (!categoryId) throw new Error(`FoodCategory not found for slug: ${slug}`);
      const key = `${wine.id}::${categoryId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({ foodCategoryId: categoryId, wineId: wine.id });
    }
  }

  const result = await prisma.foodPairing.createMany({ data: rows, skipDuplicates: true });
  console.log(`✓ Δημιουργήθηκαν ${result.count} FoodPairing rows (από ${wines.length} wines με foodPairings).`);

  const perCategory = await prisma.foodCategory.findMany({
    select: { slug: true, name: true, _count: { select: { pairings: true } } },
  });
  for (const c of perCategory) console.log(`  ${c.slug} (${c.name}): ${c._count.pairings}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
