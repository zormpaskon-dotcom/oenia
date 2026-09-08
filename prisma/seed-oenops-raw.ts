// Oenops Wines — σειρά RAW (RAWditis, XinomavRAW), από τη σελίδα
// https://oenopswines.gr/el/raw/. Φυσικά κρασιά ελάχιστης παρέμβασης,
// ζύμωση/παλαίωση σε πήλινους αμφορείς, χωρίς θειώδη. Καμία vintage δεν
// αναγράφεται ούτε στο site ούτε στην ετικέτα (raw_s.png) — τα κρασιά
// αυτά κυκλοφορούν σε διαδοχικές, μη ρητά δηλωμένες εσοδείες.

import { Appellation, ContentStatus, WineColor, WineStyle } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "oenops-wines" } });
  const drama = await prisma.region.findUniqueOrThrow({ where: { slug: "drama" } });
  const roditis = await prisma.variety.findUniqueOrThrow({ where: { slug: "roditis" } });
  const xinomavro = await prisma.variety.findUniqueOrThrow({ where: { slug: "xinomavro" } });

  async function upsertWine(spec: {
    slug: string;
    name: string;
    color: WineColor;
    style: WineStyle;
    appellation: Appellation | null;
    description: string;
    tastingNotes: string;
    vineyardNotes: string;
    winemakingNotes: string;
    foodPairings: string[];
    varieties: Array<{ varietyId: string; percentage: number | null }>;
  }) {
    const wine = await prisma.wine.upsert({
      where: { slug: spec.slug },
      update: {
        name: spec.name,
        wineryId: winery.id,
        regionId: drama.id,
        color: spec.color,
        style: spec.style,
        appellation: spec.appellation,
        description: spec.description,
        tastingNotes: spec.tastingNotes,
        vineyardNotes: spec.vineyardNotes,
        winemakingNotes: spec.winemakingNotes,
        foodPairings: spec.foodPairings,
        status: ContentStatus.PUBLISHED,
      },
      create: {
        slug: spec.slug,
        name: spec.name,
        wineryId: winery.id,
        regionId: drama.id,
        color: spec.color,
        style: spec.style,
        appellation: spec.appellation,
        description: spec.description,
        tastingNotes: spec.tastingNotes,
        vineyardNotes: spec.vineyardNotes,
        winemakingNotes: spec.winemakingNotes,
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

  console.log("Oenops Wines — σειρά RAW…");

  // RAWditis — skin-contact Ροδίτης σε αμφορέα
  await upsertWine({
    slug: "oenops-rawditis",
    name: "RAWditis",
    color: WineColor.ORANGE,
    style: WineStyle.DRY,
    appellation: null,
    description:
      "100% Ροδίτης, στην πλειοψηφία του από έναν αμπελώνα 90 ετών στην περιοχή του Αμυνταίου. Φυσικό κρασί ελάχιστης παρέμβασης — τα σταφύλια επιλέγονται με το χέρι, ρόγα προς ρόγα, και ζυμώνονται αυθόρμητα σε πήλινους αμφορείς. Γαστρονομικό κρασί, βραβευμένο με Gold στο Berliner Wine Trophy (2025).",
    tastingNotes:
      "Έντονο χρυσοκίτρινο χρώμα με πορτοκαλί ανταύγειες. Αρώματα ξύσματος μανταρινιού, περγαμόντου, ροδάκινου, θυμαριού και διακριτικές νύξεις μελιού. Αρμονικό και πλούσιο στη γεύση, με μακρά φρουτώδη επίγευση.",
    vineyardNotes: "Στην πλειοψηφία του από αμπελώνα 90 ετών στην περιοχή του Αμυνταίου. Τα σταφύλια επιλέγονται με το χέρι, ρόγα προς ρόγα.",
    winemakingNotes: "Αυθόρμητη ζύμωση σε πήλινους αμφορείς. 28 ημέρες παραμονή με τα στέμφυλα, και στη συνέχεια παλαίωση 6 μήνες στους ίδιους αμφορείς, χωρίς θειώδη ή άλλα πρόσθετα. Εμφιαλώνεται αφιλτράριστο.",
    foodPairings: [],
    varieties: [{ varietyId: roditis.id, percentage: 100 }],
  });

  // XinomavRAW — φυσικό Ξινόμαυρο σε αμφορέα/τσιμέντο
  await upsertWine({
    slug: "oenops-xinomavraw",
    name: "XinomavRAW",
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: null,
    description:
      "100% Ξινόμαυρο από τη Νάουσα, το Αμύνταιο και τη Ραψάνη. Η οινοποίηση βασίζεται στην αναβίωση μεθόδων του προηγούμενου αιώνα, συνδυασμένη με σύγχρονη τεχνογνωσία — βραβευμένο με Gold στο Berliner Wine Trophy σε πολλαπλές εσοδείες (2022-2025).",
    tastingNotes: "Εκρηκτικό πορφυρό χρώμα. Αρώματα μαύρου κερασιού, ροδιού και μύρτιλου, με κομψές νότες βοτάνων και λουλουδιών. Ζουμερές τανίνες, έντονη οξύτητα και φρουτώδης, εκφραστική επίγευση.",
    vineyardNotes: "Αμπελώνες στη Νάουσα, το Αμύνταιο και τη Ραψάνη.",
    winemakingNotes: "Ελαφρά σύνθλιψη με το χέρι, με μικρό ποσοστό ολόκληρου τσαμπιού. Αργή ζύμωση με ιθαγενείς ζύμες σε πήλινους αμφορείς και τσιμεντένιες δεξαμενές, με ήπια εκχύλιση. Παλαίωση 6 μηνών με τις λεπτές οινολάσπες, στους πήλινους αμφορείς και στην τσιμεντένια δεξαμενή, χωρίς προσθήκη θειωδών ή άλλων ουσιών.",
    foodPairings: [],
    varieties: [{ varietyId: xinomavro.id, percentage: 100 }],
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
