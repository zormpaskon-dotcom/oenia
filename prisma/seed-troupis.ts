// Troupis Winery — πλήρης κατάλογος 13 κρασιών, με άδεια του οινοποιείου να
// χρησιμοποιήσουμε το περιεχόμενο και τις φωτογραφίες τους. Στοιχεία από
// τις επίσημες σελίδες κάθε κρασιού στο troupiswinery.gr/wine/. Το site δεν
// αναφέρει % αλκοόλ σε καμία σελίδα κρασιού — μένει null εκτός αν
// επιβεβαιωθεί αλλού.

import { Appellation, ContentStatus, WineColor, WineStyle } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "troupis-winery" } });
  const mantineia = await prisma.region.findUniqueOrThrow({ where: { slug: "mantineia" } });
  const nemea = await prisma.region.findUniqueOrThrow({ where: { slug: "nemea" } });

  const moschofilero = await prisma.variety.findUniqueOrThrow({ where: { slug: "moschofilero" } });
  const agiorgitiko = await prisma.variety.findUniqueOrThrow({ where: { slug: "agiorgitiko" } });
  const assyrtiko = await prisma.variety.findUniqueOrThrow({ where: { slug: "asyrtiko" } });
  const mavrodafni = await prisma.variety.findUniqueOrThrow({ where: { slug: "mavrodafni" } });

  async function upsertWine(spec: {
    slug: string;
    name: string;
    vintage: number | null;
    color: WineColor;
    style: WineStyle;
    appellation: Appellation | null;
    regionId: string;
    description: string;
    tastingNotes: string | null;
    servingTemp: string | null;
    foodPairings: string[];
    varieties: Array<{ varietyId: string; percentage: number }>;
  }) {
    const wine = await prisma.wine.upsert({
      where: { slug: spec.slug },
      update: {
        name: spec.name,
        vintage: spec.vintage,
        color: spec.color,
        style: spec.style,
        appellation: spec.appellation,
        regionId: spec.regionId,
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
        regionId: spec.regionId,
        vintage: spec.vintage,
        color: spec.color,
        style: spec.style,
        appellation: spec.appellation,
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

  console.log("13 κρασιά Troupis Winery…");

  await upsertWine({
    slug: "tomi-mantineia",
    name: "Τομή Μαντίνεια",
    vintage: 2019,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PDO,
    regionId: mantineia.id,
    description: "100% Μοσχοφίλερο από αμπελώνα στη Φτέρη Μαντινείας, υψόμετρο 640μ. Σύγχρονη λευκή οινοποίηση σε χαμηλής απόδοσης, οικογενειακό αμπελώνα.",
    tastingNotes: "Αρώματα ώριμου μήλου, εσπεριδοειδών και ροδόνερου. Ελαφρώς όξινη αλλά γεμάτη γεύση, με νότες περγαμόντου στην επίγευση.",
    servingTemp: "10-12 °C",
    foodPairings: ["Κρέατα με λεμονάτες σάλτσες", "ψητά ψάρια μέτριας λιπαρότητας", "οστρακοειδή"],
    varieties: [{ varietyId: moschofilero.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "tomi-roze",
    name: "Τομή Μοσχοφίλερο Ροζέ",
    vintage: 2019,
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    regionId: mantineia.id,
    description: "100% Μοσχοφίλερο από αμπελώνα στα Λιθαράκια Μαντινείας, υψόμετρο 640μ. Συνδυασμός παραδοσιακής και σύγχρονης οινοποίησης για ανάδειξη του αρωματικού χαρακτήρα της ποικιλίας.",
    tastingNotes: "Αρώματα ώριμου βερίκοκου και κόκκινου μήλου, ζωηρή οξύτητα, νότες φλούδας εσπεριδοειδών στην επίγευση.",
    servingTemp: "12 °C",
    foodPairings: ["Ζυμαρικά με ντοματοσάλτσα", "κόκκινο ψάρι", "ασιατική κουζίνα"],
    varieties: [{ varietyId: moschofilero.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "holy-mania",
    name: "Holy Mania",
    vintage: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PDO,
    regionId: mantineia.id,
    description: "100% Μοσχοφίλερο από αμπελώνα στη Φτέρη Μαντινείας, υψόμετρο 640μ. Οινοποίηση ελάχιστης παρέμβασης σε δεξαμενές τσιμέντου, με αυθόρμητη ζύμωση.",
    tastingNotes: "Αρώματα λευκόσαρκων πυρηνόκαρπων φρούτων (ροδάκινο) και εσπεριδοειδών, με νότες γιασεμιού και ζωηρή οξύτητα.",
    servingTemp: "10-12 °C",
    foodPairings: ["Κρέατα με λεμονάτες σάλτσες", "ψητά ψάρια μέτριας λιπαρότητας", "οστρακοειδή"],
    varieties: [{ varietyId: moschofilero.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "hoof-lur",
    name: "Hoof & Lur",
    vintage: 2019,
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    regionId: mantineia.id,
    description: "100% Μοσχοφίλερο από αμπελώνα στα Λιθαράκια Μαντινείας, υψόμετρο 640μ. Αυθόρμητη ζύμωση, αφιλτράριστο, ελάχιστη προσθήκη θειώδων.",
    tastingNotes: "Ανοιχτό σομόν χρώμα με χάλκινες ανταύγειες. Αρώματα λουλουδιών, ζάχαρης άχνης, μανταρινιού και αποξηραμένων βοτάνων. Έντονη οξύτητα, ελαφριές τανίνες, μακρά ορυκτή επίγευση.",
    servingTemp: "12 °C",
    foodPairings: ["Παραδοσιακά μεσογειακά πιάτα", "χοιρινό με ξινολάχανο", "ψητά ψάρια και θαλασσινά"],
    varieties: [{ varietyId: moschofilero.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "ekato",
    name: "Ekato",
    vintage: 2019,
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    regionId: mantineia.id,
    description: "100% Μοσχοφίλερο από αμπελώνα στα Λιθαράκια Μαντινείας, υψόμετρο 640μ. Ο μούστος παραμένει σε επαφή με τα στέμφυλα για περίπου 100 ημέρες — μια πρωτότυπη μέθοδος για την ποικιλία.",
    tastingNotes: "Έντονα αρωματικό, με πέταλα τριαντάφυλλου και τζίντζερ, γεύσεις μαρμελάδας κυδωνιού. Ελαφρώς τανικό, με ισορροπημένη οξύτητα.",
    servingTemp: "12 °C",
    foodPairings: ["Ζυμαρικά με ντοματοσάλτσα", "ψητό καλαμάρι", "ψητό μοσχάρι"],
    varieties: [{ varietyId: moschofilero.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "pitys-ritinitis",
    name: "Pitys Ritinitis",
    vintage: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    regionId: mantineia.id,
    description: "100% Ασύρτικο από αμπελώνα στα Καταρράχια Μαντινείας, υψόμετρο 640μ. Σύγχρονη εκδοχή ρετσίνας με ελάχιστη παρέμβαση, τιμώντας μια 3.500 ετών ελληνική παράδοση οινοποίησης με ρητίνη πεύκου.",
    tastingNotes: "Αρώματα γκρέιπφρουτ, μέντας και άνθους μανταρινιού, μαζί με μαστίχα και βότανα. Ελαφρώς όξινη επίγευση, μακρά διάρκεια.",
    servingTemp: null,
    foodPairings: ["Ψάρι στα κάρβουνα", "θαλασσινά", "ψητά λαχανικά", "πικάντικα πιάτα", "ελληνική κουζίνα"],
    varieties: [{ varietyId: assyrtiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "troupis-nemea",
    name: "Νεμέα (Troupis)",
    vintage: null,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PDO,
    regionId: nemea.id,
    description: "100% Αγιωργίτικο από αμπελώνα στο Ψάρι Νεμέας, υψόμετρο 730μ — χαλικώδη εδάφη, χαμηλές θερμοκρασίες και μεγάλο ημερήσιο εύρος θερμοκρασίας που δίνουν χαμηλές αποδόσεις και υψηλής ποιότητας σταφύλια. Οινοποίηση ελάχιστης παρέμβασης.",
    tastingNotes: "Χαρακτηριστικό ερυθρό-ιώδες χρώμα. Αρώματα κερασιού και τριαντάφυλλου, ζωηρή οξύτητα, μεταξένιες τανίνες, μακρά φρουτώδης επίγευση.",
    servingTemp: "14-16 °C",
    foodPairings: ["Κόκκινα κρέατα με πικάντικα τυριά στη σχάρα", "κρέατα κατσαρόλας", "πίτσα με προσούτο"],
    varieties: [{ varietyId: agiorgitiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "route-111",
    name: "Route 111",
    vintage: 2017,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    regionId: nemea.id,
    description: "Μαυροδάφνη 50% / Αγιωργίτικο 50%, από αμπελώνες στις πλαγιές της Αιγιαλείας γύρω από τη Νεμέα, υψόμετρο 640μ — ένα χαρμάνι που συνδέει τις δύο περιοχές μέσω του ιστορικού δρόμου Route 111.",
    tastingNotes: "Αναδεικνύει την έντονη ταυτότητα των δύο ποικιλιών και των αμπελοτεμαχίων. Συνιστάται ντεκάντ 30 λεπτά πριν το σερβίρισμα.",
    servingTemp: "16 °C",
    foodPairings: ["Ψητά και κατσαρόλας κρέατα", "σκληρά ή ημίσκληρα τυριά"],
    varieties: [
      { varietyId: mavrodafni.id, percentage: 50 },
      { varietyId: agiorgitiko.id, percentage: 50 },
    ],
  });

  await upsertWine({
    slug: "sweet-route",
    name: "Sweet Route",
    vintage: 2017,
    color: WineColor.WHITE,
    style: WineStyle.SWEET,
    appellation: null,
    regionId: mantineia.id,
    description: "100% Μοσχοφίλερο από αμπελώνα στη Φτέρη Μαντινείας, υψόμετρο 640μ. Γλυκό κρασί με τρύγο σε πλήρη αρωματική ωριμότητα.",
    tastingNotes: "Χρυσοκίτρινο χρώμα με πορτοκαλί ανταύγειες. Αρώματα γιασεμιού, λουκουμιού τριαντάφυλλου, βερίκοκου και μελιού, με φλούδα εσπεριδοειδών στο στόμα. Η οξύτητα ισορροπεί τη γλυκύτητα, μακρά επίγευση.",
    servingTemp: "8 °C",
    foodPairings: ["Aperitif", "αποξηραμένα φρούτα", "τάρτα λεμονιού", "panna cotta", "κρεμώδη τυριά"],
    varieties: [{ varietyId: moschofilero.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "route-gris",
    name: "Route Gris",
    vintage: null,
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    appellation: Appellation.PDO,
    regionId: mantineia.id,
    description: "100% Μοσχοφίλερο από αμπελώνα στα Καταρράχια Μαντινείας, υψόμετρο 640μ. Ερυθρωπός ξηρός οίνος (στιλ «gris»).",
    tastingNotes: "Γκρίζο χρώμα με πορτοκαλί αντανακλάσεις. Αρώματα φλούδας εσπεριδοειδών και πέταλων τριαντάφυλλου, ελαφρώς όξινη γεύση με νότες λιβανιού, μοσχοκάρυδου και φρυγανισμένου ψωμιού.",
    servingTemp: "10 °C",
    foodPairings: ["Κρέατα με λεμονάτες σάλτσες", "ψητό λιπαρό ψάρι", "παραδοσιακές πίτες"],
    varieties: [{ varietyId: moschofilero.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "troupis-fteri-moschofilero",
    name: "Φτέρη Μοσχοφίλερο",
    vintage: 2019,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    regionId: mantineia.id,
    description: "100% Μοσχοφίλερο από αμπελώνες στη Φτέρη, Ζευγολατιό/Πέλαγος, περιοχή Μαντινείας, υψόμετρο 640μ. Ζύμωση σε χαμηλές θερμοκρασίες για διατήρηση των λεπτών αρωμάτων της ποικιλίας.",
    tastingNotes: "Έντονα αρωματικό, με ισορροπημένες νότες νυχτολούλουδου, τριαντάφυλλου και εσπεριδοειδών.",
    servingTemp: "8-10 °C",
    foodPairings: ["Ζυμαρικά με βασιλικό", "κοτόπουλο με κρέμα", "ψητή γαρίδα", "αλμυρές πίτες", "aperitif"],
    varieties: [{ varietyId: moschofilero.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "fteri-agiorgitiko-moschofilero",
    name: "Φτέρη Αγιωργίτικο Μοσχοφίλερο",
    vintage: 2019,
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    regionId: mantineia.id,
    description: "Αγιωργίτικο 75% / Μοσχοφίλερο 25%, από αμπελώνες στον Ασπρόκαμπο Νεμέας και στη Φτέρη Μαντινείας, υψόμετρο 640μ.",
    tastingNotes: "Αρμονικό ροζέ με αρωματική πολυπλοκότητα ανάμεσα σε τριαντάφυλλο, κεράσι και φράουλα.",
    servingTemp: "10 °C",
    foodPairings: ["Πιάτα με φρέσκια ντομάτα", "καλαμάρι κοκκινιστό", "πίτσα", "ασιατική κουζίνα"],
    varieties: [
      { varietyId: agiorgitiko.id, percentage: 75 },
      { varietyId: moschofilero.id, percentage: 25 },
    ],
  });

  await upsertWine({
    slug: "fteri-agiorgitiko",
    name: "Φτέρη Αγιωργίτικο",
    vintage: 2019,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    regionId: nemea.id,
    description: "100% Αγιωργίτικο, από επιλεγμένα σταφύλια στους λόφους γύρω από την πεδιάδα της Νεμέας (Αχλαδιάς & Ψάρι), υψόμετρο 640μ. Ολιγοήμερη εκχύλιση σε σχετικά χαμηλές θερμοκρασίες.",
    tastingNotes: "Ερυθρό-ιώδες χρώμα. Αρώματα άγριων μούρων και ροδιού. Βελούδινες τανίνες, νότες μπαχαρικών και καραμέλας βουτύρου.",
    servingTemp: "14 °C",
    foodPairings: ["Κόκκινο κρέας με ντοματοσάλτσα", "ψητά", "κοκ-ο-βεν"],
    varieties: [{ varietyId: agiorgitiko.id, percentage: 100 }],
  });

  console.log("Done: 13 κρασιά Troupis Winery.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
