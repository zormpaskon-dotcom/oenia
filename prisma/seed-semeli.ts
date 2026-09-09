// Κτήμα Σεμελή (Semeli Estate, Νεμέα) — πλήρης κατάλογος 27 κρασιών, με άδεια
// του οινοποιείου να χρησιμοποιήσουμε περιεχόμενο από το semeliestate.gr.
// Στοιχεία από τις επίσημες σελίδες κάθε κρασιού (the-wines/*, ?lang=el).
//
// Appellation/περιοχή ακολουθεί το ίδιο μοτίβο με το seed-bairaktaris.ts:
// - Ρητά δηλωμένο ΠΟΠ Νεμέας → περιοχή nemea, Appellation.PDO.
// - Ρητά δηλωμένο ΠΓΕ Πελοποννήσου → περιοχή peloponnisos, Appellation.PGI.
// - Ρητά δηλωμένο ΠΓΕ Κορινθίας → περιοχή korinthia, Appellation.PGI.
// - Ρητά δηλωμένο ΠΟΠ Μαντινείας → περιοχή mantineia, Appellation.PDO.
// - Ρητά δηλωμένο ΠΓΕ Αρκαδίας (Elixir) → νέα περιοχή arkadia, Appellation.PGI.
// - Χωρίς επίσημη ονομασία αλλά με συγκεκριμένο αμπελοτόπι (Aetheria,
//   Ορεινή Αιγιάλεια) → περιοχή patra (ήδη καλύπτει την Αιγιάλεια, βλ.
//   winery_import_progress).
// - Χωρίς καμία δήλωση περιοχής/ονομασίας στη σελίδα του κρασιού → η έδρα
//   του κτήματος, Νεμέα (η ίδια η ιστορία τους: "συνδέσει την ιστορία του
//   με τη γη της Νεμέας"), appellation: null.
// Ποσοστά blend: δεν αναγράφονται πουθενά στο site — μένουν null, ποτέ
// μαντεψιά. ABV: μόνο τα δύο LOW δηλώνουν ρητά 6% (μερικώς αποαλκοολωμένα).
// Vintage: δεν αναγράφεται σε καμία σελίδα — μένει null παντού.

import { Appellation, ContentStatus, MacroRegion, WineColor, WineStyle } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "semeli-estate" } });

  const nemea = await prisma.region.findUniqueOrThrow({ where: { slug: "nemea" } });
  const mantineia = await prisma.region.findUniqueOrThrow({ where: { slug: "mantineia" } });
  const peloponnisos = await prisma.region.findUniqueOrThrow({ where: { slug: "peloponnisos" } });
  const korinthia = await prisma.region.findUniqueOrThrow({ where: { slug: "korinthia" } });
  const patra = await prisma.region.findUniqueOrThrow({ where: { slug: "patra" } });
  const arkadia = await prisma.region.upsert({
    where: { slug: "arkadia" },
    update: {},
    create: {
      slug: "arkadia",
      name: "Αρκαδία",
      macroRegion: MacroRegion.PELOPONNESE,
      appellation: Appellation.PGI,
      description: "Ζώνη ΠΓΕ στην ορεινή Αρκαδία, Πελοπόννησος.",
    },
  });

  const agiorgitiko = await prisma.variety.findUniqueOrThrow({ where: { slug: "agiorgitiko" } });
  const moschofilero = await prisma.variety.findUniqueOrThrow({ where: { slug: "moschofilero" } });
  const malagousia = await prisma.variety.findUniqueOrThrow({ where: { slug: "malagousia" } });
  const assyrtiko = await prisma.variety.findUniqueOrThrow({ where: { slug: "asyrtiko" } });
  const chardonnay = await prisma.variety.findUniqueOrThrow({ where: { slug: "chardonnay" } });
  const gewurztraminer = await prisma.variety.findUniqueOrThrow({ where: { slug: "gewurztraminer" } });
  const sauvignonBlanc = await prisma.variety.findUniqueOrThrow({ where: { slug: "sauvignon-blanc" } });
  const syrah = await prisma.variety.findUniqueOrThrow({ where: { slug: "syrah" } });
  const merlot = await prisma.variety.findUniqueOrThrow({ where: { slug: "merlot" } });
  const cabernetSauvignon = await prisma.variety.findUniqueOrThrow({ where: { slug: "cabernet-sauvignon" } });
  const grenache = await prisma.variety.findUniqueOrThrow({ where: { slug: "grenache" } });

  async function upsertWine(spec: {
    slug: string;
    name: string;
    color: WineColor;
    style: WineStyle;
    appellation: Appellation | null;
    regionId: string;
    abv: number | null;
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
        regionId: spec.regionId,
        abv: spec.abv,
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
        color: spec.color,
        style: spec.style,
        appellation: spec.appellation,
        abv: spec.abv,
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

  console.log("27 κρασιά Semeli Estate…");

  // ── Λευκά ──
  await upsertWine({
    slug: "semeli-thea-mantinia",
    name: "Semeli Thea Mantinia",
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PDO,
    regionId: mantineia.id,
    abv: null,
    description:
      "100% Μοσχοφίλερο από έναν ιδιόκτητο 25ετή αμπελώνα στα Ζευγολατιά Μαντινείας, υψόμετρο 650μ — η κορυφαία ζώνη της περιοχής. Ζύμωση και ωρίμανση σε δεξαμενή για 6 μήνες με τις λεπτές οινολάσπες (sur lie, batonnage), κάτι που του δίνει αξιοσημείωτο σώμα για λευκό κρασί.",
    tastingNotes:
      "Χρώμα ανοιχτόχρυσο με αμμουδιές αποχρώσεις. Σύνθετα αρώματα βοτάνων, ώριμων και αποξηραμένων εξωτικών φρούτων όπως παπάγια, μάνγκο και yuzu, με δευτερεύουσες νότες πράσινου φρούτου. Στο στόμα πλούσιο σώμα και ζωντανή φρεσκάδα με μπεργκαμότο, εσπεριδοειδή και λεμόνι yuzu, καταλήγοντας σε ανεπαίσθητα γλυκιά επίγευση.",
    servingTemp: "10-12 °C",
    foodPairings: ["Μοσχάρι", "ψάρι", "κατσίκι", "πουλερικά", "κρεμώδες ριζότο", "ζυμαρικά με λαχανικά ή κρόκο", "αλλαντικά", "πλούσια τυριά", "καρμπονάρα"],
    varieties: [{ varietyId: moschofilero.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "semeli-mantinia",
    name: "Semeli Mantinia",
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PDO,
    regionId: mantineia.id,
    abv: null,
    description:
      "100% Μοσχοφίλερο από το Ζευγολατιό Μαντινείας, υψόμετρο 650μ. Αργή ζύμωση σε σταθερή θερμοκρασία 17-18°C για να αναδειχθούν τα λεπτά αρώματα της ποικιλίας.",
    tastingNotes:
      "Ζωντανό, κιτρινοπράσινο χρώμα. Φίνα αρώματα λουλουδιών με άνθη λεμονιάς και εσπεριδοειδών. Στο στόμα πλούσιο και φρουτώδες, με επίμονη αρωματική επίγευση.",
    servingTemp: "8-11 °C",
    foodPairings: ["Θαλασσινά", "οστρακοειδή", "ψάρια με λεμονάτες σάλτσες", "ασιατική κουζίνα"],
    varieties: [{ varietyId: moschofilero.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "semeli-elixir",
    name: "Semeli Elixir",
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    regionId: arkadia.id,
    abv: null,
    description: "100% Gewürztraminer, ΠΓΕ Αρκαδίας.",
    tastingNotes:
      "Κρυσταλλικό κιτρινόξανθο χρώμα με πράσινες αποχρώσεις. Στη μύτη ώριμα λευκόσαρκα φρούτα όπως αχλάδια «Comice» και εξωτικά φρούτα σε ανθώδες φόντο, με βιολέτα και γιασεμί να ξεχωρίζουν. Στο στόμα ζωντανό, με ευχάριστη οξύτητα μέσα από αρώματα εσπεριδοειδών, μια ευχάριστη λιπαρή αίσθηση και μακρά αρωματική επίγευση.",
    servingTemp: "8-10 °C",
    foodPairings: [],
    varieties: [{ varietyId: gewurztraminer.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "semeli-malagousia",
    name: "Semeli Malagousia Cuvée Spéciale",
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    regionId: peloponnisos.id,
    abv: null,
    description:
      "100% Μαλαγουζιά από τη Δενδρούλια, ΠΓΕ Πελοποννήσου. Τα σταφύλια περνούν από ψυκτικό θάλαμο και κρυοεκχύλιση στους 8°C για 12 ώρες, ζύμωση σε ανοξείδωτο ατσάλι στους 14°C. Ωριμάζει τουλάχιστον 5 μήνες με τις λεπτές οινολάσπες· το 20% ωριμάζει σε βαρέλια ακακίας 225 λίτρων.",
    tastingNotes:
      "Νότες γλυκού τριαντάφυλλου, σιρόπι ροδάκινου, πεπόνι, αχλάδι, ώριμα εξωτικά φρούτα και φρέσκα μεσογειακά βότανα. Στο στόμα διακριτικές νύξεις ορυκτών και περγαμόντου, με επίγευση αρωμάτων λεμονόχορτου.",
    servingTemp: "10-12 °C",
    foodPairings: ["Θαλασσινά", "ψητό ψάρι", "πουλερικά", "ψητά λαχανικά", "ψαρονέφρι με κάρυ", "τηγανητό κουνέλι", "ριζότο με σπαράγγια", "κρεμώδη τυριά"],
    varieties: [{ varietyId: malagousia.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "semeli-aetheria",
    name: "Semeli Aetheria",
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    regionId: patra.id,
    abv: null,
    description:
      "Μαλαγουζιά και Chardonnay από την Ορεινή Αιγιάλεια, υψόμετρο 900μ — μια από τις πιο εμβληματικές οινοπαραγωγικές ζώνες της Ελλάδας. Λευκό ποικιλιακό κρασί που συνδυάζει το τοπικό Chardonnay με μία από τις πιο αρωματικές ελληνικές ποικιλίες, τη Μαλαγουζιά.",
    tastingNotes:
      "Άχυρο-κίτρινο χρώμα με πρασινωπές ανταύγειες. Έντονη μύτη με αρώματα πράσινου μήλου, ώριμου αχλαδιού, πιπεριού και φρέσκων αρωματικών βοτάνων. Στο στόμα πλούσιος όγκος και άψογη ισορροπία χάρη στη ζωηρή οξύτητα, ντυμένη με λιπαρές νότες που προδίδουν την παρουσία του Chardonnay. Η επίγευση φέρνει πράσινα φρούτα και λεμονόχορτο, με μπαχαρικά στο φινάλε.",
    servingTemp: "10-12 °C",
    foodPairings: ["Sashimi", "sushi", "carpaccio θαλασσινών", "ψητά πουλερικά", "ψάρι με κάρυ", "τηγανητό κουνέλι", "ζυμαρικά με θαλασσινά", "ριζότο με σπαράγγια", "ψητές πιπεριές", "πράσινες σαλάτες με βότανα"],
    varieties: [
      { varietyId: malagousia.id, percentage: null },
      { varietyId: chardonnay.id, percentage: null },
    ],
  });

  await upsertWine({
    slug: "semeli-sofia",
    name: "Semeli Sofia",
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    regionId: nemea.id,
    abv: null,
    description:
      "Ασύρτικο από χαμηλής απόδοσης αμπελοτόπια στους λόφους της Νεμέας και Μοσχοφίλερο αποκλειστικά από τους δικούς τους αμπελώνες στο οροπέδιο της Μαντινείας.",
    tastingNotes:
      "Λαμπερό, έντονο άχυρο-κίτρινο χρώμα με λεπτές νότες λεμονιού. Κομψή και σύνθετη μύτη, με αρώματα λευκών λουλουδιών, πυρηνόκαρπων και τροπικών φρούτων — κυρίως ροδάκινο, βερίκοκο και ανανά — πλαισιωμένα από ευχάριστες γλυκές μπαχαρικές νότες. Στο στόμα ραφιναρισμένο και γενναιόδωρο, με φρέσκια ισορροπία γεύσης και νόστιμη, πλήρη επίγευση που διαρκεί.",
    servingTemp: "9-11 °C",
    foodPairings: ["Θαλασσινά", "ψάρι", "λευκά κρέατα", "πουλερικά", "ελαφριά πιάτα λαχανικών", "φρέσκες σαλάτες", "ζυμαρικά", "φρέσκα μαλακά τυριά"],
    varieties: [
      { varietyId: assyrtiko.id, percentage: null },
      { varietyId: moschofilero.id, percentage: null },
    ],
  });

  await upsertWine({
    slug: "oreinos-helios-lefkos",
    name: "Semeli Ορεινός Ήλιος Λευκός",
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    regionId: peloponnisos.id,
    abv: null,
    description:
      "Μοσχοφίλερο από τη Μαντινεία και Sauvignon Blanc, ΠΓΕ Πελοποννήσου — ένα κράμα δύο αρωματικών ποικιλιών. Το Μοσχοφίλερο συνεισφέρει έντονα αρώματα τριαντάφυλλου και άνθους λεμονιάς, ενώ το Sauvignon Blanc φέρνει εσπεριδοειδή και εξωτικά φρούτα στο προσκήνιο.",
    tastingNotes:
      "Απαλό και ευχάριστο χρυσοπράσινο χρώμα με γκρίζες ανταύγειες. Στη μύτη έντονο και ώριμο, με χαρακτηριστικά αρώματα λεμονιού, πεπονιού και τριαντάφυλλου. Στο στόμα ξηρό, καλά ισορροπημένο με ζωηρή οξύτητα, ικανοποιητικό σώμα και έντονη μεταλλικότητα.",
    servingTemp: "8-10 °C",
    foodPairings: ["Οστρακοειδή", "ψάρι", "ζυμαρικά με θαλασσινά", "sushi", "sashimi", "πουλερικά", "λευκά κρέατα"],
    varieties: [
      { varietyId: moschofilero.id, percentage: null },
      { varietyId: sauvignonBlanc.id, percentage: null },
    ],
  });

  await upsertWine({
    slug: "semeli-armonia-lefkos",
    name: "Semeli Armonia Λευκός",
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    regionId: peloponnisos.id,
    abv: null,
    description:
      "Ένα ραφιναρισμένο κράμα Μοσχοφίλερου και Μαλαγουζιάς — το λευκό ARMONIA εκφράζει με αυθεντικότητα και ισορροπία τον αρωματικό πλούτο της Πελοποννήσου.",
    tastingNotes:
      "Λαμπερό, κρυστάλλινο, άχυρο-κίτρινο χρώμα. Στη μύτη ένα διακριτικό μπουκέτο με κυρίαρχα αρώματα φρέσκων τριαντάφυλλων, λευκόσαρκων φρούτων και διακριτικές νότες θυμαριού που προσθέτουν βάθος και πολυπλοκότητα. Στο στόμα στρογγυλό, φρέσκο και αρμονικό, με ευχάριστη φρεσκάδα και καθαρή, μακρά επίγευση.",
    servingTemp: "8-10 °C",
    foodPairings: ["Ορεκτικά", "πράσινες σαλάτες", "μαριναρισμένο ή τηγανητό ψάρι", "οστρακοειδή", "θαλασσινά", "ζυμαρικά", "ψητό κοτόπουλο", "λεμονάτο χοιρινό", "φρέσκα μαλακά τυριά"],
    varieties: [
      { varietyId: moschofilero.id, percentage: null },
      { varietyId: malagousia.id, percentage: null },
    ],
  });

  await upsertWine({
    slug: "giorti-lefkos",
    name: "Semeli Γιορτή Λευκός",
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    regionId: mantineia.id,
    abv: null,
    description: "100% Μοσχοφίλερο από τη Μαντινεία.",
    tastingNotes:
      "Απαλό κιτρινόλευκο, σχεδόν διαφανές χρώμα με πράσινες ανταύγειες. Λεπτά αρώματα ροδοπέταλων, λεμονανθών και εσπεριδοειδών. Φρουτώδες με δροσιστική αίσθηση στο στόμα και ισορροπημένη οξύτητα.",
    servingTemp: "9-10 °C",
    foodPairings: ["Παραδοσιακή ελληνική κουζίνα", "θαλασσινά", "ζυμαρικά"],
    varieties: [{ varietyId: moschofilero.id, percentage: 100 }],
  });

  // ── Ερυθρά ──
  await upsertWine({
    slug: "chateau-semeli",
    name: "Chateau Semeli",
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    regionId: nemea.id,
    abv: null,
    description: "Cabernet Sauvignon και Merlot· η πρώτη ετικέτα κυκλοφόρησε το 1985. Ωριμάζει 20 μήνες σε νέα γαλλική δρυς.",
    tastingNotes:
      "Φωτεινό, αδιαφανές πορφυρό χρώμα. Έντονη μύτη με αρώματα ώριμων μαύρων φρούτων, κέδρου και πούρου. Στο στόμα καλή τανική δομή με ισορροπημένη οξύτητα, φινέτσα και μακρά επίγευση.",
    servingTemp: "15-16 °C",
    foodPairings: ["Αρνί", "μαγειρευτά", "ψητή γαλοπούλα", "χοιρινό με δαμάσκηνο", "αγριογούρουνο", "κόκκινα κρέατα με πλούσιες σάλτσες"],
    varieties: [
      { varietyId: cabernetSauvignon.id, percentage: null },
      { varietyId: merlot.id, percentage: null },
    ],
  });

  await upsertWine({
    slug: "semeli-spondee",
    name: "Semeli Spondee",
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: null,
    regionId: nemea.id,
    abv: null,
    description:
      "Syrah, Merlot και Cabernet Sauvignon από επιλεγμένους αμπελώνες, όπου καμία ποικιλία δεν κυριαρχεί έναντι των άλλων. Ωριμάζει 12 μήνες στα δροσερά κελάρια του κτήματος.",
    tastingNotes:
      "Ραφιναρισμένο και σύνθετο, με σφιχτά πλεγμένα αρώματα. Στο στόμα γενναιόδωρο και πιπεράτο, με στρογγυλές, αρκετά απαλές τανίνες που δίνουν μια ενιαία γευστική εμπειρία.",
    servingTemp: "16 °C",
    foodPairings: ["Μαγειρευτό κρέας με φρέσκια ντοματοσάλτσα", "μουσακάς", "παστίτσιο", "ελληνική και ιταλική κουζίνα"],
    varieties: [
      { varietyId: syrah.id, percentage: null },
      { varietyId: merlot.id, percentage: null },
      { varietyId: cabernetSauvignon.id, percentage: null },
    ],
  });

  await upsertWine({
    slug: "semeli-nemea-reserve",
    name: "Semeli Nemea Reserve",
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PDO,
    regionId: nemea.id,
    abv: 14, // ήδη υπαρκτή, ερευνημένη τιμή (update-abv.ts) — δεν αναγράφεται στο site, μη διαγράψεις
    description: "100% Αγιωργίτικο από τους δικούς τους αμπελώνες στη Νεμέα. Ωριμάζει 12 μήνες σε γαλλική δρυς.",
    tastingNotes: "Λαμπερό, νεανικό, βαθύ πορφυρό χρώμα με έντονη πυκνότητα. Έντονο, ζωντανό μπουκέτο, πλούσιο σε αρώματα μπαχαρικών, σύνθετου φρούτου και ισορροπημένης δρυός.",
    servingTemp: "15-16 °C",
    foodPairings: ["Κόκκινα κρέατα", "ψητά", "ζυμαρικά με κόκκινη σάλτσα", "τυριά"],
    varieties: [{ varietyId: agiorgitiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "oreinos-helios-erythros",
    name: "Semeli Ορεινός Ήλιος Ερυθρός",
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    regionId: peloponnisos.id,
    abv: null,
    description:
      "Αγιωργίτικο από τη Νεμέα και Syrah, ΠΓΕ Πελοποννήσου. Το δημοφιλές και δυναμικό Αγιωργίτικο προσφέρει αρώματα δαμάσκηνου και κερασιού, ενώ το διεθνώς αναγνωρισμένο Syrah συνεισφέρει έντονο χαρακτήρα μπαχαρικών και βατόμουρου.",
    tastingNotes: "Λαμπερό, νεανικό, βαθύ κόκκινο ρουμπινί χρώμα. Πλούσιο στόμα με βελούδινες τανίνες και ζωντανά αρώματα κόκκινου φρούτου.",
    servingTemp: "14-15 °C",
    foodPairings: ["Μεσογειακή κουζίνα", "κόκκινα κρέατα", "ψητά", "ζυμαρικά με κόκκινη σάλτσα", "τυριά"],
    varieties: [
      { varietyId: agiorgitiko.id, percentage: null },
      { varietyId: syrah.id, percentage: null },
    ],
  });

  await upsertWine({
    slug: "giorti-erythros",
    name: "Semeli Γιορτή Ερυθρός",
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: null,
    regionId: nemea.id,
    abv: null,
    description: "100% Αγιωργίτικο από τη Νεμέα.",
    tastingNotes:
      "Ζωηρό κόκκινο χρώμα με πορφυρές ανταύγειες. Πυκνά και έντονα αρώματα φράουλας, κερασιού και φρέσκων φρούτων του δάσους. Στο στόμα μεταξένια και επίμονη αίσθηση, με ισορροπημένη οξύτητα, στρογγυλές τανίνες και μακρά επίγευση.",
    servingTemp: "14 °C",
    foodPairings: ["Κρέας στα κάρβουνα", "ζυμαρικά με κόκκινη σάλτσα", "τυριά", "πικάντικα λουκάνικα"],
    varieties: [{ varietyId: agiorgitiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "semeli-nemea-grande-reserve",
    name: "Semeli Nemea Grande Reserve",
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PDO,
    regionId: nemea.id,
    abv: null,
    description: "100% Αγιωργίτικο από τη Νεμέα, με εκτεταμένη ωρίμανση σε βαρέλι και φιάλη.",
    tastingNotes:
      "Λαμπερό, βαθύ κόκκινο χρώμα με έντονη ένταση. Αρώματα ώριμων κόκκινων φρούτων με σύνθετες νότες μπαχαρικών και βοτάνων από την παλαίωση. Στο στόμα πυκνό και στρογγυλό, με μεταξένιες, κομψές τανίνες, αξιοσημείωτο αλκοόλ και έντονη οξύτητα που φέρνει ισορροπία. Μακρά, γεμάτη επίγευση με σοκολάτα, μαρμελάδα, φρυγανισμένο ψωμί και κανέλα.",
    servingTemp: "15-16 °C",
    foodPairings: ["Πλούσια πιάτα κρέατος", "ψητό αρνί", "κρέατα στα κάρβουνα και στη σούβλα", "σκληρά κίτρινα ή κρεμώδη τυριά"],
    varieties: [{ varietyId: agiorgitiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "ktima-semeli",
    name: "Κτήμα Σεμελή",
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: null,
    regionId: nemea.id,
    abv: null,
    description:
      "Αγιωργίτικο, Syrah, Merlot και Cabernet Sauvignon από τους δικούς τους αμπελώνες στο Κούτσι — τα ακριβή ποσοστά της κάθε ποικιλίας κρατούνται μυστικά και αποφασίζονται κάθε χρόνο από τον οινολόγο. Χειρωνακτικός τρύγος με αυστηρή επιλογή ρόγας· παράγεται μόνο από τους καλύτερους καρπούς κάθε χρονιάς, σε περιορισμένη ποσότητα.",
    tastingNotes:
      "Διαυγές, πορφυρό με ιώδεις ανταύγειες. Κομψή και πλούσια μύτη με μπουκέτο κερασιού, ώριμων φρούτων του δάσους, μαρμελάδας βατόμουρου, βανίλιας, καφέ και μοσχοκάρυδου. Στο στόμα γενναιόδωρο και σαρκώδες, με πικάντικες νότες και βελούδινο, ανατολίτικων μπαχαρικών φινάλε.",
    servingTemp: "14-16 °C, σε μεγάλο ποτήρι Burgundy",
    foodPairings: ["Ελληνική και ιταλική κουζίνα", "ψητά ή μαγειρευτά κρέατα με φρέσκια ντοματοσάλτσα"],
    varieties: [
      { varietyId: agiorgitiko.id, percentage: null },
      { varietyId: syrah.id, percentage: null },
      { varietyId: merlot.id, percentage: null },
      { varietyId: cabernetSauvignon.id, percentage: null },
    ],
  });

  await upsertWine({
    slug: "semeli-espera",
    name: "Semeli Espera",
    color: WineColor.RED,
    style: WineStyle.SWEET,
    appellation: Appellation.PDO,
    regionId: nemea.id,
    abv: null,
    description: "100% Αγιωργίτικο από τη Νεμέα — ερυθρός φυσικώς γλυκύς οίνος από λιασμένα σταφύλια.",
    tastingNotes:
      "Βαθύ πορφυρό χρώμα με ελάχιστες κεραμιδί ανταύγειες. Το μπουκέτο φέρνει αρώματα αποξηραμένων φρούτων όπως σύκο και σταφίδα, μαζί με καρύδι και φουντούκι, δαμάσκηνο, μαρμελάδα φρούτων του δάσους και γλυκά μπαχαρικά. Στο στόμα πλούσιο και βελούδινο, με ισορροπημένη, εκτεταμένη επίγευση.",
    servingTemp: "12-14 °C",
    foodPairings: ["Απεριτίφ με παλαιωμένα κίτρινα τυριά", "επιδόρπιο με σοκολατένια γλυκά"],
    varieties: [{ varietyId: agiorgitiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "semeli-armonia-erythros",
    name: "Semeli Armonia Ερυθρός",
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: null,
    regionId: nemea.id,
    abv: null,
    description: "Ένα ραφιναρισμένο κράμα Αγιωργίτικου και Merlot που αναδεικνύει πολυπλοκότητα και βάθος μέσα από το πλούσιο αρωματικό του προφίλ και την ισορροπημένη δομή του.",
    tastingNotes:
      "Βαθύ πορφυρό χρώμα με ιώδεις ανταύγειες. Στη μύτη έντονα και αρμονικά αρώματα ώριμων φρούτων, με κυρίαρχες νότες κερασιού και δαμάσκηνου, συνοδευόμενα από διακριτικά γλυκά μπαχαρικά. Στο στόμα γενναιόδωρο και στρογγυλό, βελούδινη υφή και έντονες γεύσεις κόκκινου φρούτου και μπαχαρικών, με πιπεράτο, νόστιμο και ισορροπημένο φινάλε.",
    servingTemp: "14-15 °C",
    foodPairings: ["Πιάτα με κρέας", "πίτσα", "ζυμαρικά", "μουσακάς", "παστίτσιο", "τυρόπιτες", "όσπρια", "μαγειρευτά", "ψητό ή βραστό ψάρι"],
    varieties: [
      { varietyId: agiorgitiko.id, percentage: null },
      { varietyId: merlot.id, percentage: null },
    ],
  });

  // ── Ροζέ ──
  await upsertWine({
    slug: "semeli-delear",
    name: "Semeli Delear",
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    appellation: null,
    regionId: nemea.id,
    abv: null,
    description: "Syrah και Grenache Rouge — εύπιο ξηρό ροζέ που στέκεται ανάμεσα σε λευκό και ερυθρό κρασί.",
    tastingNotes:
      "Χρώμα σομόν με όμορφες γρανά ανταύγειες, κρυστάλλινο και λαμπερό. Φρουτώδη αρώματα ροδιού, κερασιού, καρπουζιού και passion fruit. Συνδυάζει τη φρεσκάδα ενός λευκού με την πληρότητα ενός ερυθρού, διατηρώντας τη ζωντάνια ενός ποιοτικού ροζέ.",
    servingTemp: "8-12 °C",
    foodPairings: ["Καλοκαιρινά πιάτα, από μεγάλα ψάρια μέχρι χταπόδι κοκκινιστό", "γεμιστά λαχανικά", "μουσακάς"],
    varieties: [
      { varietyId: syrah.id, percentage: null },
      { varietyId: grenache.id, percentage: null },
    ],
  });

  await upsertWine({
    slug: "oreinos-helios-roze",
    name: "Semeli Ορεινός Ήλιος Ροζέ",
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    regionId: korinthia.id,
    abv: null,
    description: "100% Αγιωργίτικο από τη Νεμέα, ΠΓΕ Κορινθίας.",
    tastingNotes:
      "Ζωηρό κερασοκόκκινο χρώμα. Αρώματα ώριμων, γλυκών φρούτων, φράουλας, κερασιού και σοκολάτας γάλακτος. Στο στόμα ανεπαίσθητη νότα γλυκύτητας, φρεσκάδα από τονισμένη οξύτητα και κερασένια αρωματικότητα.",
    servingTemp: "9-11 °C",
    foodPairings: ["Μπαρμπούνια", "παϊδάκια στη σχάρα", "λαδερά της μεσογειακής κουζίνας"],
    varieties: [{ varietyId: agiorgitiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "giorti-roze",
    name: "Semeli Γιορτή Ροζέ",
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    appellation: null,
    regionId: nemea.id,
    abv: null,
    description: "Αγιωργίτικο και Grenache Rouge — ζωηρό, μαλακό και ευέλικτο ροζέ, με φρεσκάδα και κομψότητα καλοκαιριού.",
    tastingNotes: "Λαμπερό, σομόν χρώμα με διακριτικές νότες φράουλας. Αρώματα ώριμων φρούτων και αγριολούλουδων, με δροσερή, ανανεωτική επίγευση.",
    servingTemp: "8-12 °C",
    foodPairings: ["Θαλασσινά", "ψάρια", "πράσινες σαλάτες", "λαδερά της ελληνικής κουζίνας"],
    varieties: [
      { varietyId: agiorgitiko.id, percentage: null },
      { varietyId: grenache.id, percentage: null },
    ],
  });

  await upsertWine({
    slug: "semeli-armonia-roze",
    name: "Semeli Armonia Ροζέ",
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    appellation: null,
    regionId: nemea.id,
    abv: null,
    description: "Merlot και Grenache Rouge — ένα εκφραστικό κράμα που συνδυάζει φρεσκάδα και κομψότητα σε ένα απολαυστικό ροζέ με μεσογειακό ταμπεραμέντο.",
    tastingNotes:
      "Ζωντανό χρώμα ροζέ, με νότες καραμέλας, φρέσκων κόκκινων φρούτων και βιολέτας στη μύτη. Στο στόμα χαρακτηριστικές νύξεις passion fruit, με αρμονικό, φρέσκο φινάλε.",
    servingTemp: "8-12 °C",
    foodPairings: ["Σαλάτες", "θαλασσινά", "ψάρι", "ριζότο", "ζυμαρικά", "κουνέλι", "πουλερικά", "μουσακάς", "λαχανικά κατσαρόλας"],
    varieties: [
      { varietyId: merlot.id, percentage: null },
      { varietyId: grenache.id, percentage: null },
    ],
  });

  // ── Ημίγλυκα (Piccolo Mondo) ──
  await upsertWine({
    slug: "piccolo-mondo-lefkos",
    name: "Piccolo Mondo Λευκός",
    color: WineColor.WHITE,
    style: WineStyle.SEMI_SWEET,
    appellation: null,
    regionId: nemea.id,
    abv: null,
    description: "100% Μοσχοφίλερο — ημίγλυκος λευκός οίνος.",
    tastingNotes: "Εκρηκτικά αρώματα σταφυλιού, εσπεριδοειδών και τριαντάφυλλου. Στο στόμα πλούσιο και στρογγυλό, με φρεσκάδα που ισορροπεί τη γλυκύτητα και μακρά, γλυκιά επίγευση.",
    servingTemp: null,
    foodPairings: ["Σαλάτες", "απεριτίφ με φρούτα"],
    varieties: [{ varietyId: moschofilero.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "piccolo-mondo-erythros",
    name: "Piccolo Mondo Ερυθρός",
    color: WineColor.RED,
    style: WineStyle.SEMI_SWEET,
    appellation: null,
    regionId: nemea.id,
    abv: null,
    description: "100% Αγιωργίτικο — ημίγλυκος ερυθρός οίνος.",
    tastingNotes: "Διαυγές, ζωηρό, ρουμπινί χρώμα. Αρώματα κόκκινων φρούτων όπως βύσσινο και κεράσι. Στο στόμα βελούδινες τανίνες και γλυκές φρουτώδεις νότες.",
    servingTemp: null,
    foodPairings: ["Κρέατα ή ζυμαρικά με απαλές κόκκινες σάλτσες", "απεριτίφ με φρούτα και ξηρούς καρπούς"],
    varieties: [{ varietyId: agiorgitiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "piccolo-mondo-roze",
    name: "Piccolo Mondo Ροζέ",
    color: WineColor.ROSE,
    style: WineStyle.SEMI_SWEET,
    appellation: null,
    regionId: nemea.id,
    abv: null,
    description: "Αγιωργίτικο και Μοσχοφίλερο — ημίγλυκος ροζέ οίνος.",
    tastingNotes: "Ζωηρό ροζέ με εκρηκτικά αρώματα γλυκών πυρηνόκαρπων και κόκκινων φρούτων. Στο στόμα πλούσιο και στρογγυλό, ισορροπημένο με δροσιστική οξύτητα και μακρά, γλυκιά επίγευση.",
    servingTemp: null,
    foodPairings: ["Σαλάτες", "απεριτίφ με φρούτα"],
    varieties: [
      { varietyId: agiorgitiko.id, percentage: null },
      { varietyId: moschofilero.id, percentage: null },
    ],
  });

  // ── Χαμηλού αλκοόλ ──
  await upsertWine({
    slug: "semeli-low-lefko",
    name: "Semeli Low Λευκό",
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    regionId: nemea.id,
    abv: 6,
    description: "Μοσχοφίλερο και Μαλαγουζιά — ελαφρύ, μερικώς αποαλκοολωμένο λευκό κρασί, για όσους αναζητούν έναν πιο ελαφρύ τρόπο ζωής χωρίς συμβιβασμούς στη γεύση.",
    tastingNotes: "Λαμπερό, κρυστάλλινο, άχυρο-κίτρινο χρώμα. Αρώματα τριαντάφυλλου, λευκόσαρκων φρούτων και μιας διακριτικής νότας θυμαριού. Στο στόμα ευχάριστο, φρέσκο και αρμονικό, με καθαρό, κομψό φινάλε.",
    servingTemp: "8-10 °C",
    foodPairings: ["Ορεκτικά", "ψητό ή μαριναρισμένο ψάρι", "θαλασσινά", "ζυμαρικά", "πράσινες σαλάτες", "ψητό κοτόπουλο", "λεμονάτο χοιρινό", "φρέσκα μαλακά τυριά"],
    varieties: [
      { varietyId: moschofilero.id, percentage: null },
      { varietyId: malagousia.id, percentage: null },
    ],
  });

  await upsertWine({
    slug: "semeli-low-roze",
    name: "Semeli Low Ροζέ",
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    appellation: null,
    regionId: nemea.id,
    abv: 6,
    description: "Merlot και Grenache Rouge — ελαφρύ, αρωματικό καλοκαιρινό ροζέ, μερικώς αποαλκοολωμένο, για όσους αναζητούν γεύση με μειωμένο αλκοόλ.",
    tastingNotes: "Χρώμα ροζέ με απαλές αποχρώσεις φλούδας κρεμμυδιού. Αρώματα καραμέλας, φρέσκων κόκκινων φρούτων και βιολέτας. Στο στόμα δροσερό, νόστιμο και τραγανό, με φρουτώδη αρμονία, νύξεις άνθους ροδακινιάς και passion fruit, και ευχάριστο, ισορροπημένο φινάλε.",
    servingTemp: "8-12 °C",
    foodPairings: ["Θαλασσινά", "ψάρι", "χταπόδι", "σαλάτες", "πιάτα λαχανικών", "ριζότο λαχανικών", "ζυμαρικά με γαρίδα", "γεμιστές ντομάτες", "ψητό κοτόπουλο ή κουνέλι", "μουσακάς"],
    varieties: [
      { varietyId: merlot.id, percentage: null },
      { varietyId: grenache.id, percentage: null },
    ],
  });

  console.log("Done: 27 κρασιά Semeli Estate.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
