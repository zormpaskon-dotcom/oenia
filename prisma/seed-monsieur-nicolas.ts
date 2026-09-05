// Winery Monsieur Nicolas (Γ. Καραμήτρος) — 15 ετικέτες με πραγματικά
// στοιχεία από το επίσημο site (winerymonsieurnicolas.gr), με άδεια του
// οινοποιείου. Καμία σελίδα δεν αναφέρει vintage ή % αλκοόλ — μένουν null.

import { Appellation, ContentStatus, VarietyType, WineColor, WineStyle } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "winery-monsieur-nicolas" } });
  const region = await prisma.region.findUniqueOrThrow({ where: { slug: "messenikola" } });

  const limniona = await prisma.variety.findUniqueOrThrow({ where: { slug: "limniona" } });
  const malagousia = await prisma.variety.findUniqueOrThrow({ where: { slug: "malagousia" } });
  const roditis = await prisma.variety.findUniqueOrThrow({ where: { slug: "roditis" } });
  const chardonnay = await prisma.variety.findUniqueOrThrow({ where: { slug: "chardonnay" } });
  const assyrtiko = await prisma.variety.findUniqueOrThrow({ where: { slug: "asyrtiko" } });
  const moschofilero = await prisma.variety.findUniqueOrThrow({ where: { slug: "moschofilero" } });
  const syrah = await prisma.variety.findUniqueOrThrow({ where: { slug: "syrah" } });
  const cabernetSauvignon = await prisma.variety.findUniqueOrThrow({ where: { slug: "cabernet-sauvignon" } });

  const muscatHamburg = await prisma.variety.upsert({
    where: { name: "Μοσχάτο Αμβούργου" },
    update: {},
    create: {
      name: "Μοσχάτο Αμβούργου",
      slug: "moschato-amvourgou",
      nameLatin: "Muscat Hamburg",
      type: VarietyType.RED,
      originRegion: "Αγγλία (υβρίδιο)",
      description: "Ερυθρή επιτραπέζια/οινοποιήσιμη ποικιλία Muscat, χρησιμοποιείται συχνά για ροζέ οίνους χάρη στο έντονο αρωματικό της προφίλ.",
      characteristics: "Αρώματα τριαντάφυλλου, εσπεριδοειδών και βανίλιας. Χαμηλές τανίνες.",
      acidity: 50, body: 50, tannins: 20, aromaIntensity: 85, ageingPotential: 30,
    },
  });

  const mavroMessenikola = await prisma.variety.upsert({
    where: { name: "Μαύρο Μεσενικόλα" },
    update: {},
    create: {
      name: "Μαύρο Μεσενικόλα",
      slug: "mavro-messenikola",
      nameLatin: "Mavro Messenikola",
      type: VarietyType.RED,
      originRegion: "Μεσενικόλα, Καρδίτσα",
      description: "Τοπική ερυθρή ποικιλία της Μεσενικόλας Καρδίτσας — η αποκλειστική ποικιλία της ομώνυμης ζώνης Π.Ο.Π., πιστεύεται ότι έφτασε στην περιοχή από τη Γαλλία.",
      characteristics: "Ρουμπινί χρώμα, ανθικά και δασικά αρώματα φρούτων, μαλακές τανίνες.",
      acidity: 55, body: 60, tannins: 45, aromaIntensity: 60, ageingPotential: 45,
    },
  });

  const carignan = await prisma.variety.upsert({
    where: { name: "Carignan" },
    update: {},
    create: {
      name: "Carignan",
      slug: "carignan",
      nameLatin: "Καρινιάν",
      type: VarietyType.RED,
      originRegion: "Ισπανία / Νότια Γαλλία",
      description: "Ερυθρή ποικιλία μεσογειακής προέλευσης, συχνά σε χαρμάνια για χρώμα, τανίνη και δομή.",
      characteristics: "Βαθύ χρώμα, στιβαρές τανίνες, αρώματα κόκκινων φρούτων.",
      acidity: 60, body: 70, tannins: 65, aromaIntensity: 55, ageingPotential: 50,
    },
  });

  async function upsertWine(spec: {
    slug: string;
    name: string;
    color: WineColor;
    style: WineStyle;
    appellation: Appellation | null;
    isSparkling?: boolean;
    description: string;
    tastingNotes: string | null;
    servingTemp: string | null;
    foodPairings: string[];
    varieties: Array<{ varietyId: string; percentage: number | null }>;
  }) {
    const wine = await prisma.wine.upsert({
      where: { slug: spec.slug },
      update: {
        name: spec.name,
        color: spec.color,
        style: spec.style,
        appellation: spec.appellation,
        isSparkling: spec.isSparkling ?? false,
        regionId: region.id,
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
        regionId: region.id,
        color: spec.color,
        style: spec.style,
        appellation: spec.appellation,
        isSparkling: spec.isSparkling ?? false,
        description: spec.description,
        tastingNotes: spec.tastingNotes,
        servingTemp: spec.servingTemp,
        foodPairings: spec.foodPairings,
        status: ContentStatus.PUBLISHED,
      },
    });
    await prisma.varietyOnWine.deleteMany({ where: { wineId: wine.id } });
    for (const v of spec.varieties) {
      await prisma.varietyOnWine.create({ data: { wineId: wine.id, varietyId: v.varietyId, percentage: v.percentage } });
    }
    return wine;
  }

  console.log("Επαναχρησιμοποίηση της υπάρχουσας γενικής εγγραφής 'Chardonnay' ως Noblis…");
  await prisma.wine.update({
    where: { slug: "monsieur-nicolas-chardonnay" },
    data: { slug: "noblis" },
  });

  console.log("15 ετικέτες Winery Monsieur Nicolas…");

  await upsertWine({
    slug: "noblis",
    name: "Noblis",
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description: "100% Chardonnay, από τη Μεσενικόλα Καρδίτσας. Ζύμωση και παλαίωση σε δρύινο βαρέλι.",
    tastingNotes: "Λαμπερό χρυσοκίτρινο χρώμα. Αρώματα μπανάνας, αχλαδιού και κίτρινων φρούτων, με διακριτικές νότες βουτύρου, φουντουκιού και μελιού από το βαρέλι.",
    servingTemp: "14-16 °C",
    foodPairings: ["Ψάρι", "λευκά κρέατα", "ζυμαρικά"],
    varieties: [{ varietyId: chardonnay.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "noblis-magnum",
    name: "Noblis Magnum",
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description: "100% Chardonnay, περιορισμένη έκδοση συλλέκτη σε φιάλη Magnum (1,5L) — μόλις 400 φιάλες. Παλαίωση 12 μήνες σε αυστριακά δρύινα βαρέλια 500L, δυνατότητα παλαίωσης έως 10 χρόνια.",
    tastingNotes: "Λαμπερό χρυσοκίτρινο χρώμα. Αρώματα εσπεριδοειδών (λεμόνι, περγαμόντο) με διακριτικές νότες βανίλιας, βουτύρου και φουντουκιού. Ώριμο, ραφιναρισμένο, σύνθετο.",
    servingTemp: "14-16 °C",
    foodPairings: ["Ψάρι", "λευκά κρέατα", "ζυμαρικά"],
    varieties: [{ varietyId: chardonnay.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "moi-je-men-fous-erythro",
    name: "Moi, Je M'en Fous! Ερυθρό",
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description: "100% Λημνιώνα, ιθαγενής ποικιλία που καλλιεργείται σε μεγάλο υψόμετρο στη Μεσενικόλα Καρδίτσας. Φρέσκια έκφραση για άμεση απόλαυση.",
    tastingNotes: "Αρώματα κόκκινων μούρων, άγριου βατόμουρου, φράουλας και λουλουδιών, με μια νότα πιπεριού.",
    servingTemp: "16-18 °C",
    foodPairings: ["Κόκκινο κρέας", "πουλερικά με πικάντικες κόκκινες σάλτσες"],
    varieties: [{ varietyId: limniona.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "moi-je-men-fous-erythro-palaiomeno",
    name: "Moi, Je M'en Fous! Ερυθρό Παλαιωμένο (Aged Limnionas)",
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description: "100% Λημνιώνα, παλαιωμένη εκδοχή του βασικού Moi, Je M'en Fous! Ερυθρό.",
    tastingNotes: "Αρώματα βατόμουρου, άγριου βατόμουρου, φράουλας και λουλουδιών με νότες πιπεριού και γλυκόριζας. Βελούδινη, σαγηνευτική επίγευση.",
    servingTemp: "16-18 °C",
    foodPairings: ["Κίτρινα τυριά", "κόκκινο κρέας", "πουλερικά με πικάντικες κόκκινες σάλτσες", "ψητό καλαμάρι"],
    varieties: [{ varietyId: limniona.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "moi-je-men-fous-leyko",
    name: "Moi, Je M'en Fous! Λευκό",
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description: "100% Μαλαγουζιά, από τη Μεσενικόλα Καρδίτσας. Βραβεία: Χρυσό μετάλλιο Mundus Vini (2018) και Berliner Wine Trophy (2015).",
    tastingNotes: "Αρώματα ροδάκινου, ανθέων λεμονιού, πορτοκαλιού, γιασεμιού και γκρέιπφρουτ. Πολυδιάστατη γεύση.",
    servingTemp: "10-12 °C",
    foodPairings: ["Ελαφριά πιάτα θαλασσινών", "πουλερικά", "ζυμαρικά", "σαλάτες"],
    varieties: [{ varietyId: malagousia.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "moi-je-men-fous-roze",
    name: "Moi, Je M'en Fous! Ροζέ",
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description: "100% Μοσχάτο Αμβούργου, από τη Μεσενικόλα Καρδίτσας.",
    tastingNotes: "Έντονο κρυσταλλίνο ροζ χρώμα. Αρώματα πέταλων τριαντάφυλλου, κουμκουάτ και βανίλιας. Λεπτή γεύση, με φρέσκες, αφρώδεις αποχρώσεις στο στόμα.",
    servingTemp: "10-12 °C",
    foodPairings: ["Πουλερικά", "ζυμαρικά με λευκές σάλτσες", "φρέσκες σαλάτες", "τυριά"],
    varieties: [{ varietyId: muscatHamburg.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "i-kyra-tis-limnis",
    name: "Η Κυρά της Λίμνης",
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description: "100% Ροδίτης, από τη Μεσενικόλα Καρδίτσας, με θέα στη λίμνη Πλαστήρα.",
    tastingNotes: "Κιτρινοπράσινο χρώμα. Ευγενικά, ραφιναρισμένα αρώματα πράσινου μήλου και λευκόσαρκων φρούτων.",
    servingTemp: "10-12 °C",
    foodPairings: ["Φρέσκα θαλασσινά", "ψητό ψάρι", "λευκά κρέατα", "λευκά τυριά"],
    varieties: [{ varietyId: roditis.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "deucalion",
    name: "Deucalion",
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description: "100% Ασύρτικο, από τη Μεσενικόλα Καρδίτσας, κοντά στο όρος Άγραφα και τη λίμνη Πλαστήρα.",
    tastingNotes: "Χρυσαφί χρώμα. Μελένιες νότες, αρώματα κίτρινων φρούτων και άνθους λεμονιού.",
    servingTemp: "10-12 °C",
    foodPairings: ["Ψητή πέστροφα", "θαλασσινά", "χοιρινό με λευκές σάλτσες", "ψητά μανιτάρια", "ζυμαρικά με θαλασσινά", "κατσικίσιο τυρί"],
    varieties: [{ varietyId: assyrtiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "snob-white",
    name: "Snob. White",
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    isSparkling: true,
    description: "Αφρώδης οίνος τύπου Blanc de Noir, 100% Μοσχοφίλερο, από τη Μεσενικόλα Καρδίτσας.",
    tastingNotes: "Νότες γιασεμιού, κρίνου και τριαντάφυλλου, με αχλάδι, lime, βερίκοκο και ανανά.",
    servingTemp: "8-10 °C, σε ποτήρι σαμπάνιας",
    foodPairings: ["Σαλάτες", "θαλασσινά", "στρείδια", "φρέσκα μαλακά τυριά", "σκληρά παλαιωμένα τυριά", "ασιατική κουζίνα", "φρούτα", "επιδόρπια"],
    varieties: [{ varietyId: moschofilero.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "snob",
    name: "Snob. Rosé",
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    isSparkling: true,
    description: "Αφρώδης ροζέ οίνος, 100% Λημνιώνα, από τη Μεσενικόλα Καρδίτσας.",
    tastingNotes: "Δασικά κόκκινα μούρα, φράουλα και βύσσινο, με μια ιδέα βανίλιας και φρυγανισμένου ψωμιού. Ισορροπημένη οξύτητα.",
    servingTemp: "8-10 °C, σε ποτήρι σαμπάνιας",
    foodPairings: ["Aperitif", "cocktails", "αλλαντικά", "φρούτα", "ζυμαρικά", "θαλασσινά", "σοκολάτα"],
    varieties: [{ varietyId: limniona.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "hit-the-road-white",
    name: "Hit The Road White",
    color: WineColor.WHITE,
    style: WineStyle.SEMI_SWEET,
    appellation: Appellation.PGI,
    description: "Χαρμάνι Ασύρτικο & Chardonnay (ακριβή ποσοστά δεν δημοσιεύονται), από τη Μεσενικόλα Καρδίτσας.",
    tastingNotes: "Χρυσαφιές ανταύγειες, έντονα αρώματα πράσινου μήλου και μπανάνας, με καθηλωτική γλυκύτητα.",
    servingTemp: "6-8 °C",
    foodPairings: ["Aperitif", "θαλασσινά", "οστρακοειδή", "λευκά κρέατα", "ζυμαρικά με λευκές σάλτσες"],
    varieties: [
      { varietyId: assyrtiko.id, percentage: null },
      { varietyId: chardonnay.id, percentage: null },
    ],
  });

  await upsertWine({
    slug: "hit-the-road-red",
    name: "Hit The Road Red",
    color: WineColor.RED,
    style: WineStyle.SEMI_SWEET,
    appellation: Appellation.PGI,
    description: "Χαρμάνι Λημνιώνα & Cabernet Sauvignon (ακριβή ποσοστά δεν δημοσιεύονται), από τη Μεσενικόλα Καρδίτσας.",
    tastingNotes: "Αρώματα δασικών φρούτων και βανίλιας, με μια νότα φράουλας. Ζωηρό κόκκινο χρώμα και σαγηνευτική γλυκύτητα.",
    servingTemp: "6-8 °C",
    foodPairings: ["Ζυμαρικά", "λευκά κρέατα", "μαλακά κίτρινα τυριά"],
    varieties: [
      { varietyId: limniona.id, percentage: null },
      { varietyId: cabernetSauvignon.id, percentage: null },
    ],
  });

  await upsertWine({
    slug: "messenicola",
    name: "Messenicola",
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description: "Μαύρο Μεσενικόλα 70% / Syrah & Carignan 30% (ακριβές ποσοστό ανά ποικιλία στο 30% δεν δημοσιεύεται), από τη Μεσενικόλα Καρδίτσας.",
    tastingNotes: "Γεμάτο σώμα, μακρά επίγευση με ανθικά και δασικά αρώματα φρούτων και απαλές τανίνες. Ρουμπινί χρώμα.",
    servingTemp: "16-18 °C (αφήστε το να αναπνεύσει 15 λεπτά πριν το σερβίρισμα)",
    foodPairings: ["Ψητό κόκκινο κρέας", "κυνήγι", "κόκκινες σάλτσες", "καπνιστά τυριά", "αλλαντικά", "μήλο", "αχλάδι"],
    varieties: [{ varietyId: mavroMessenikola.id, percentage: 70 }],
  });

  await upsertWine({
    slug: "messenicola-syllekton",
    name: "Messenicola Συλλεκτών",
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PDO,
    description: "Μαύρο Μεσενικόλα 70% / Syrah & Carignan 30% (ακριβές ποσοστό ανά ποικιλία στο 30% δεν δημοσιεύεται). Έκδοση συλλέκτη, Π.Ο.Π. Μεσενικόλα.",
    tastingNotes: "Αρώματα βιολέτας, ώριμων φρούτων (δαμάσκηνο, κεράσι, άγριο βατόμουρο) και κάστανου, με κομψές τανίνες και εξαιρετική ισορροπία.",
    servingTemp: "18 °C (αφήστε το να αναπνεύσει 15 λεπτά πριν το σερβίρισμα)",
    foodPairings: ["Ψητό κόκκινο κρέας", "κυνήγι", "κόκκινες σάλτσες", "αλλαντικά", "μήλο", "αχλάδι"],
    varieties: [{ varietyId: mavroMessenikola.id, percentage: 70 }],
  });

  await upsertWine({
    slug: "paradise-can-wait",
    name: "Paradise Can Wait",
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description: "100% Syrah, από τη Μεσενικόλα Καρδίτσας. Παλαίωση 12 μήνες σε δρύινο βαρέλι.",
    tastingNotes: "Βαθύ, ιώδες, πυκνό χρώμα. Βύσσινο και μαρμελάδα από ώριμα φρούτα, καπνός και καβουρδισμένο κάστανο από την παλαίωση.",
    servingTemp: "16-18 °C (ανοίξτε 15 λεπτά πριν το σερβίρισμα)",
    foodPairings: ["Κυνήγι (αγριογούρουνο)", "κόκκινο κρέας με πλούσιες κόκκινες σάλτσες"],
    varieties: [{ varietyId: syrah.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "apo-dyo-xoria",
    name: "Από Δύο Χωριά",
    color: WineColor.ROSE,
    style: WineStyle.SEMI_SWEET,
    appellation: Appellation.PGI,
    description: "100% Μαύρο Μεσενικόλα, από τη Μεσενικόλα Καρδίτσας.",
    tastingNotes: "Ανοιχτό χρώμα ανάμεσα σε ροζ και πορτοκαλί, αρώματα πέταλων τριαντάφυλλου, ισορροπημένη, ελαφριά γλυκύτητα και γεμάτη φρούτο.",
    servingTemp: "6-8 °C",
    foodPairings: ["Μαλακά κίτρινα τυριά", "ζυμαρικά", "κρέατα με γλυκόξινες σάλτσες", "aperitif"],
    varieties: [{ varietyId: mavroMessenikola.id, percentage: 100 }],
  });

  console.log("Done: 15 κρασιά Winery Monsieur Nicolas.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
