// Κτήμα Μερκούρη — 2 ακόμη ετικέτες (Cava, Αντάρης), ίδια πηγή/μοτίβο με το
// prisma/seed-merkouri-wines.ts: επίσημα technical data sheets από mercouri.gr.
import { PrismaClient, Appellation, ContentStatus, WineColor, WineStyle } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "ktima-merkouri" } });
  const region = await prisma.region.findUniqueOrThrow({ where: { slug: "patra" } });
  const refosco = await prisma.variety.findUniqueOrThrow({ where: { slug: "refosco" } });
  const mavrodafni = await prisma.variety.findUniqueOrThrow({ where: { slug: "mavrodafni" } });
  const aygoystiatis = await prisma.variety.findUniqueOrThrow({ where: { slug: "aygoystiatis" } });
  // Ήδη υπάρχει ως "Mourvèdre" (με τόνο) από προηγούμενο batch — reuse, όχι νέο.
  const mourvedre = await prisma.variety.findUniqueOrThrow({ where: { slug: "mourvedre" } });

  async function upsertWine(spec: {
    slug: string;
    name: string;
    color: WineColor;
    style: WineStyle;
    appellation: Appellation | null;
    abv: number | null;
    description: string;
    tastingNotes: string;
    servingTemp: string | null;
    foodPairings: string[];
    vineyardNotes: string;
    winemakingNotes: string;
    varieties: Array<{ varietyId: string; percentage: number | null }>;
  }) {
    const wine = await prisma.wine.upsert({
      where: { slug: spec.slug },
      update: {},
      create: {
        slug: spec.slug,
        name: spec.name,
        wineryId: winery.id,
        regionId: region.id,
        color: spec.color,
        style: spec.style,
        appellation: spec.appellation,
        abv: spec.abv,
        description: spec.description,
        tastingNotes: spec.tastingNotes,
        servingTemp: spec.servingTemp,
        foodPairings: spec.foodPairings,
        vineyardNotes: spec.vineyardNotes,
        winemakingNotes: spec.winemakingNotes,
        status: ContentStatus.PUBLISHED,
      },
    });
    for (const v of spec.varieties) {
      await prisma.varietyOnWine.upsert({
        where: { wineId_varietyId: { wineId: wine.id, varietyId: v.varietyId } },
        update: {},
        create: { wineId: wine.id, varietyId: v.varietyId, percentage: v.percentage },
      });
    }
    console.log(`✓ ${spec.slug}`);
    return wine;
  }

  await upsertWine({
    slug: "ktima-merkouri-cava",
    name: "Κτήμα Μερκούρη \"Cava\"",
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    abv: 14.0,
    description: "Η ρεζέρβα εκδοχή του Κτήματος Μερκούρη — χαρμάνι Refosco και Μαυροδάφνης με μακρύτερη παλαίωση από τη βασική ετικέτα.",
    tastingNotes: "Βαθύ κόκκινο χρώμα. Αρώματα κόκκινων φρούτων με νότες σοκολάτας, ώριμου δαμάσκηνου, καπνού και δέρματος, αρμονικά δεμένα με αρώματα βανίλιας και κανέλλας από το βαρέλι.",
    servingTemp: null,
    foodPairings: ["Ψητά κόκκινα κρέατα", "Ψητά λευκά κρέατα", "Εντράδες", "Κυνήγι", "Σκληρά τυριά"],
    vineyardNotes: "Οι ιδιόκτητοι αμπελώνες του Κτήματος Μερκούρη στο Κορακοχώρι Ηλείας, Δυτική Πελοπόννησος. Προστατευόμενη Γεωγραφική Ένδειξη «Λετρίνοι».",
    winemakingNotes: "Κλασική ερυθρή οινοποίηση με επιλεγμένες ζύμες και έλεγχο θερμοκρασίας. Παλαίωση 18 μήνες σε γαλλικά δρύινα βαρέλια. Δυνατότητα παλαίωσης άνω των 10 ετών.",
    varieties: [
      { varietyId: refosco.id, percentage: 80 },
      { varietyId: mavrodafni.id, percentage: 20 },
    ],
  });

  await upsertWine({
    slug: "ktima-merkouri-antaris",
    name: "Αντάρης",
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    abv: 13.5,
    description: "Χαρμάνι του αυτόχθονου Αυγουστιάτη με το γαλλικό Mourvedre, από τους αμπελώνες του κτήματος.",
    tastingNotes: "Έντονο βαθύ βελούδινο ερυθρό χρώμα. Πλούσιο μπουκέτο με αρώματα πιπεριού και βιολέτας σε αρμονία με κανέλα και βανίλια από το δρύινο βαρέλι. Γλυκό στο ξεκίνημα, με ευλύγιστες τανίνες, μέσο σώμα και επίμονο τελείωμα.",
    servingTemp: null,
    foodPairings: ["Ψητά κόκκινα κρέατα", "Ψητά λευκά κρέατα", "Κυνήγι", "Πουλερικά", "Σκληρά τυριά"],
    vineyardNotes: "Οι ιδιόκτητοι αμπελώνες του Κτήματος Μερκούρη στο Κορακοχώρι Ηλείας, Δυτική Πελοπόννησος. Προστατευόμενη Γεωγραφική Ένδειξη «Ηλεία».",
    winemakingNotes: "Κλασική ερυθρή οινοποίηση με επιλεγμένες ζύμες και έλεγχο θερμοκρασίας. Παλαίωση 12 μήνες σε γαλλικά δρύινα βαρέλια (Allier, Nevers, Vosges). Δυνατότητα παλαίωσης άνω των 10 ετών.",
    varieties: [
      { varietyId: aygoystiatis.id, percentage: 60 },
      { varietyId: mourvedre.id, percentage: 40 },
    ],
  });

  console.log("\nDone.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
