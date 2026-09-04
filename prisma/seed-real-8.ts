// Batch 6/9 από τη λίστα ~88 οινοποιείων. Ίδια δομή ανά κρασί με τα
// προηγούμενα batches — πηγές σε σχόλιο ανά εγγραφή.
//
// Batch 6: Santo Wines, Tetramythos Winery, Theopetra Estate, T-Oinos,
// Troupis Winery, Vassaltis Vineyards, Venetsanos Winery, Vriniotis
// Winery, Zacharias Winery, Zafeirakis Estate.

import { Appellation, ContentStatus, MacroRegion, VarietyType, WineColor, WineStyle } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { slugify } from "../lib/slugify";

async function ensureRegion(
  slug: string,
  name: string,
  macroRegion: MacroRegion,
  appellation: Appellation,
  description: string
) {
  return prisma.region.upsert({
    where: { slug },
    update: {},
    create: { slug, name, macroRegion, appellation, description },
  });
}

async function ensureVariety(name: string, type: VarietyType, fields: Record<string, unknown> = {}) {
  return prisma.variety.upsert({
    where: { name },
    update: {},
    create: { name, slug: slugify(name), type, ...fields },
  });
}

async function main() {
  console.log("Νέες περιοχές…");
  const meteora = await ensureRegion(
    "meteora",
    "Μετέωρα",
    MacroRegion.CENTRAL_GREECE,
    Appellation.PGI,
    "Ζώνη ΠΓΕ γύρω από τα Μετέωρα και το Προϊστορικό Σπήλαιο της Θεόπετρας, στους πρόποδες των Τρικάλων — ξαναφυτεμένη μετά τη φυλλοξήρα των αρχών του 20ού αιώνα."
  );
  const tyrnavos = await ensureRegion(
    "tyrnavos",
    "Τύρναβος",
    MacroRegion.CENTRAL_GREECE,
    Appellation.PGI,
    "Ζώνη ΠΓΕ στους πρόποδες του Ολύμπου, στη Θεσσαλία — ιστορική πατρίδα του τσίπουρου, και τα τελευταία χρόνια σημείο αναφοράς για την αναβίωση της γηγενούς ερυθρής ποικιλίας Λημνιώνα."
  );
  const tinos = await ensureRegion(
    "tinos",
    "Τήνος",
    MacroRegion.AEGEAN_ISLANDS,
    Appellation.PGI,
    "Ζώνη ΠΓΕ στο ορεινό, ανεμοδαρμένο νησί των Κυκλάδων — φτωχά γρανιτικά εδάφη και σκληρό κλίμα δίνουν κρασιά με έντονη οξύτητα και αλμυρότητα."
  );

  const santorini = await prisma.region.findUniqueOrThrow({ where: { slug: "santorini" } });
  const patra = await prisma.region.findUniqueOrThrow({ where: { slug: "patra" } });
  const mantineia = await prisma.region.findUniqueOrThrow({ where: { slug: "mantineia" } });
  const evia = await prisma.region.findUniqueOrThrow({ where: { slug: "evia" } });
  const nemea = await prisma.region.findUniqueOrThrow({ where: { slug: "nemea" } });

  console.log("Νέες ποικιλίες…");
  const mavroKalavritino = await ensureVariety("Μαύρο Καλαβρυτινό", VarietyType.RED, {
    originRegion: "Καλάβρυτα, Αχαΐα",
    description: "Σπάνια γηγενής ερυθρή ποικιλία των Καλαβρύτων, το μοναδικό μονοποικιλιακό κρασί της Ελλάδας από αυτή την ποικιλία — αναβιώθηκε από το Tetramythos.",
    characteristics: "Ανοιχτόχρωμο ρουμπινί, αρώματα κερασιού, φράουλας και καπνιστών, γαιώδη νότες, ελαφρύ έως μέτριο σώμα, μαλακές τανίνες.",
    acidity: 65,
    body: 50,
    tannins: 40,
  });
  const limniona = await ensureVariety("Λημνιώνα", VarietyType.RED, {
    originRegion: "Τύρναβος, Θεσσαλία",
    description: "Γηγενής ερυθρή ποικιλία της Θεσσαλίας, ξεχωριστή από το Λημνιό — σχεδόν είχε χαθεί, αναβιώθηκε κυρίως χάρη στο Κτήμα Ζαφειράκη στον Τύρναβο.",
    characteristics: "Έντονο άρωμα τριαντάφυλλου και κερασιού, μέτριο σώμα, ζωηρή οξύτητα, βελούδινες τανίνες, πικάντικες νότες.",
    acidity: 70,
    body: 55,
    tannins: 45,
  });
  const vradiano = await ensureVariety("Βραδιανό", VarietyType.RED, {
    originRegion: "Βόρεια Εύβοια",
    description: "Σπάνια, αρχαία γηγενής ερυθρή ποικιλία της βόρειας Εύβοιας, χαμηλής απόδοσης — διασώθηκε από εξαφάνιση χάρη στο Vriniotis Winery.",
    characteristics: "Μεσαίο ρουμπινί χρώμα, αρώματα μαύρου κερασιού και ροδιού, γαιώδεις και φρυγανισμένες νότες, τραγανή οξύτητα, στιβαρές, στρογγυλές τανίνες.",
    acidity: 65,
    body: 55,
    tannins: 50,
  });

  const assyrtiko = await prisma.variety.findUniqueOrThrow({ where: { name: "Ασύρτικο" } });
  const athiri = await prisma.variety.findUniqueOrThrow({ where: { name: "Αθήρι" } });
  const aidani = await prisma.variety.findUniqueOrThrow({ where: { name: "Αηδάνι" } });
  const moschofilero = await prisma.variety.findUniqueOrThrow({ where: { name: "Μοσχοφίλερο" } });
  const agiorgitiko = await prisma.variety.findUniqueOrThrow({ where: { name: "Αγιωργίτικο" } });

  console.log("Οινοποιεία + κρασιά…");

  // ── Santo Wines — Πύργος, Σαντορίνη (συνεταιρισμός) ── πηγές: santowines.gr, thetotalbusiness.com
  const santo = await prisma.winery.upsert({
    where: { slug: "santo-wines" },
    update: {},
    create: {
      slug: "santo-wines",
      name: "Santo Wines",
      regionId: santorini.id,
      foundedYear: 1911,
      websiteUrl: "https://santowines.gr",
      description:
        "Η Ένωση Συνεταιρισμών Θηραϊκών Προϊόντων ιδρύθηκε στην αρχική της μορφή το 1911, ως «Ταμείο Αμύνης Οινοπαραγωγής Θήρας». Το οινοποιείο χτίστηκε το 1951 και μεταφέρθηκε στο σημερινό κτίριο, με θέα στην καλντέρα, το 1992. Σήμερα εκπροσωπεί 1.200 μέλη-αμπελουργούς και είναι ο μεγαλύτερος παραγωγός κρασιού στο νησί.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const santoWine = await prisma.wine.upsert({
    where: { slug: "santo-wines-nykteri" },
    update: {},
    create: {
      name: "Santorini Nykteri",
      slug: "santo-wines-nykteri",
      wineryId: santo.id,
      regionId: santorini.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "85% Ασύρτικο, 10% Αθήρι, 5% Αηδάνι — παραδοσιακά τα σταφύλια πιέζονταν το βράδυ μετά τον τρύγο, δίνοντας στο «Νυχτέρι» το όνομά του. Ελαφριά επαφή με δρυ.",
      tastingNotes: "Καθαρό λεμονί χρώμα μέτριας έντασης. Εκφραστικά ανθισμένα αρώματα γιασεμιού μαζί με εσπεριδοειδή και πράσινα φρούτα όπως πράσινο μήλο και αχλάδι, σε φόντο βανίλιας. Ξηρό, με τραγανή, αναζωογονητική οξύτητα σε ισορροπία με τα λεπτά ανθικά και φρουτώδη αρώματα. Μακρά, ευχάριστη επίγευση.",
      servingTemp: "10-12 °C",
      foodPairings: ["Ψάρια σχάρας", "Πιάτα με σάλτσα"],
      status: ContentStatus.PUBLISHED,
    },
  });
  for (const [variety, percentage] of [
    [assyrtiko, 85],
    [athiri, 10],
    [aidani, 5],
  ] as const) {
    await prisma.varietyOnWine.upsert({
      where: { wineId_varietyId: { wineId: santoWine.id, varietyId: variety.id } },
      update: { percentage },
      create: { wineId: santoWine.id, varietyId: variety.id, percentage },
    });
  }

  // ── Tetramythos Winery — Άνω Διακοπτό, Αιγιαλεία ── πηγές: winesofgreece.org, greekgastronomyguide.gr, jancisrobinson.com
  const tetramythos = await prisma.winery.upsert({
    where: { slug: "tetramythos-winery" },
    update: {},
    create: {
      slug: "tetramythos-winery",
      name: "Tetramythos Winery",
      regionId: patra.id,
      foundedYear: 2004,
      websiteUrl: "https://www.tetramythoswines.com",
      description:
        "Ιδρύθηκε το 2004 από τα αδέρφια Άρη και Στάθη, γεννημένους και μεγαλωμένους στο Άνω Διακοπτό της Αιγιαλείας, στις πλαγιές της Αροανίας, όπου από μικροί γνώρισαν την αμπελουργία και την ελαιοκαλλιέργεια. Ο αμπελώνας εκτείνεται σε 450-1050μ με βιολογική καλλιέργεια. Μοναδικό οινοποιείο στην Ελλάδα που παράγει μονοποικιλιακό κρασί από τη σπάνια ποικιλία Μαύρο Καλαβρυτινό.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const tetramythosWine = await prisma.wine.upsert({
    where: { slug: "tetramythos-mavro-kalavritino" },
    update: {},
    create: {
      name: "Mavro Kalavritino",
      slug: "tetramythos-mavro-kalavritino",
      wineryId: tetramythos.id,
      regionId: patra.id,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      description: "100% Μαύρο Καλαβρυτινό βιολογικής καλλιέργειας — το μοναδικό μονοποικιλιακό κρασί στην Ελλάδα από αυτή τη σπάνια τοπική ποικιλία.",
      tastingNotes: "Ανοιχτό ρουμπινί χρώμα, αρώματα κερασιού, φράουλας και γλυκόριζας με πικάντικες νότες. Στρογγυλή, μεταξένια υφή με μέτρια οξύτητα, νότες μαύρου φραγκοστάφυλου, μαύρου πιπεριού και φρέσκων βοτάνων, καπνιστό, γαιώδες τελείωμα.",
      servingTemp: "14-16 °C",
      foodPairings: ["Ψητά", "Μεσογειακή κουζίνα"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: tetramythosWine.id, varietyId: mavroKalavritino.id } },
    update: { percentage: 100 },
    create: { wineId: tetramythosWine.id, varietyId: mavroKalavritino.id, percentage: 100 },
  });

  // ── Theopetra Estate (Τσιλιλής) — Ράξα, Τρίκαλα ── πηγές: arttravel.gr, atheneeimporters.com
  const theopetra = await prisma.winery.upsert({
    where: { slug: "theopetra-estate" },
    update: {},
    create: {
      slug: "theopetra-estate",
      name: "Κτήμα Θεόπετρα (Τσιλιλής)",
      regionId: meteora.id,
      foundedYear: 1996,
      websiteUrl: "https://www.tsililis.gr",
      description:
        "Η αποστακτική-οινοποιείο Τσιλιλή ιδρύθηκε το 1989, και το 1996 η οικογένεια δημιούργησε το Κτήμα Θεόπετρα, με βιολογικά καλλιεργούμενους αμπελώνες γύρω από το Προϊστορικό Σπήλαιο της Θεόπετρας, στους πρόποδες των Μετεώρων. Η οικογένεια Τσιλιλή ήταν η πρώτη που απόσταξε τσίπουρο Θεσσαλίας με αναγνωρισμένη από την Ε.Ε. γεωγραφική ένδειξη.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const theopetraWine = await prisma.wine.upsert({
    where: { slug: "theopetra-limniona" },
    update: {},
    create: {
      name: "Theopetra Limniona",
      slug: "theopetra-limniona",
      wineryId: theopetra.id,
      regionId: meteora.id,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      description: "100% Λημνιώνα βιολογικής καλλιέργειας — ελεγχόμενη ζύμωση σε γαλλικές δρύινες κάδες και παλαίωση 12 μήνες σε γαλλικά και αμερικανικά βαρέλια, ακολουθούμενη από 12 μήνες παλαίωση σε φιάλη.",
      tastingNotes: "Βαθύ ρουμπινί χρώμα με μοβ ανταύγειες, αρώματα κερασιού και βατόμουρου, ξερών φρούτων και πικάντικες νότες μοσχοκάρυδου και μαύρου πιπεριού. Στρογγυλό στόμα με μεταξένιες τανίνες, γεύσεις κόκκινου φρούτου και μακρά επίγευση.",
      servingTemp: "16-18 °C",
      foodPairings: ["Κόκκινα κρέατα", "Μαγειρευτά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: theopetraWine.id, varietyId: limniona.id } },
    update: { percentage: 100 },
    create: { wineId: theopetraWine.id, varietyId: limniona.id, percentage: 100 },
  });

  // ── T-Oinos (Τηνιακοί Αμπελώνες) — Φαλατάδος, Τήνος ── πηγές: worldoffinewine.com, the-buyer.net, toinos.com
  const tOinos = await prisma.winery.upsert({
    where: { slug: "t-oinos" },
    update: {},
    create: {
      slug: "t-oinos",
      name: "T-Oinos (Τηνιακοί Αμπελώνες)",
      regionId: tinos.id,
      description:
        "Οι Τηνιακοί Αμπελώνες, γνωστοί ως T-Oinos, ανήκουν στον Αλέξανδρο Αβατάγγελο και τον Γάλλο σομελιέ Gérard Margeon και πρωτοστάτησαν στην αναβίωση της αμπελουργίας στην Τήνο. Οι αμπελώνες εκτείνονται σε αμμώδη εδάφη με γρανιτικό υπέδαφος στη Στεγάστα και τη Ρασσώνα, στα περίχωρα του Φαλατάδου. Ο σκληρός άνεμος και τα φτωχά εδάφη του νησιού πιέζουν τα κλήματα και χαρίζουν στα κρασιά έντονη οξύτητα και αλμυρότητα.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const tOinosWine = await prisma.wine.upsert({
    where: { slug: "t-oinos-clos-stegasta-assyrtiko" },
    update: {},
    create: {
      name: "Clos Stegasta Assyrtiko",
      slug: "t-oinos-clos-stegasta-assyrtiko",
      wineryId: tOinos.id,
      regionId: tinos.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      description: "100% Ασύρτικο από τη ναυαρχίδα συλλογή «Clos Stegasta» — αναφορά στα πέτρινα καταφύγια όπου οι εργάτες του αμπελιού της εποχής της Ενετοκρατίας ζύμωναν κρασί στις πλαγιές της Τήνου.",
      tastingNotes: "Κρυστάλλινο και αλμυρό, αντανακλά το θαλασσόπνευστο έδαφος του νησιού. Πυρηνόκαρπο φρούτο, ψημένα εσπεριδοειδή και θρυμματισμένος βράχος στη μύτη, με έντονη ορυκτικότητα και βάθος γεύσης.",
      servingTemp: "10-12 °C",
      foodPairings: ["Θαλασσινά", "Ψάρια"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: tOinosWine.id, varietyId: assyrtiko.id } },
    update: { percentage: 100 },
    create: { wineId: tOinosWine.id, varietyId: assyrtiko.id, percentage: 100 },
  });

  // ── Troupis Winery — Φτέρη, Μαντινεία ── πηγές: troupiswinery.gr, thegrapereset.com, tastingHouse
  const troupis = await prisma.winery.upsert({
    where: { slug: "troupis-winery" },
    update: {},
    create: {
      slug: "troupis-winery",
      name: "Troupis Winery",
      regionId: mantineia.id,
      foundedYear: 2010,
      websiteUrl: "https://www.troupiswinery.gr",
      description:
        "Η οικογένεια ασχολείται με την αμπελουργία από τη δεκαετία του '70, φτιάχνοντας κρασί για δικιά της χρήση και πουλώντας τα υπόλοιπα σταφύλια. Το 2010 αποφάσισε να επενδύσει στους ιδιόκτητους αμπελώνες της, 7 εκταρίων, στο κέντρο του οροπεδίου Μαντινείας, στην περιοχή Φτέρη, στα ~700μ — την καρδιά της ομώνυμης οινοπαραγωγικής ζώνης.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const troupisWine = await prisma.wine.upsert({
    where: { slug: "troupis-fteri-moschofilero" },
    update: {},
    create: {
      name: "Fteri Moschofilero",
      slug: "troupis-fteri-moschofilero",
      wineryId: troupis.id,
      regionId: mantineia.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "100% Μοσχοφίλερο από τους ιδιόκτητους αμπελώνες στην Φτέρη Μαντινείας, στα 700μ.",
      tastingNotes: "Χρυσαφί χρώμα με απαλές χάλκινες ανταύγειες. Έντονα ανθισμένο άρωμα με νυχτολούλουδο, τριαντάφυλλο και εσπεριδοειδή, νότες λίτσι, γιασεμιού, θυμαριού και ορυκτικότητας. Τραγανό, φρέσκο και εντελώς ξηρό στόμα, μέτρια οξύτητα και μια αίσθηση αλμύρας στο ζωντανό τελείωμα.",
      servingTemp: "8-10 °C",
      foodPairings: ["Ελαφριά ορεκτικά", "Σαλάτες"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: troupisWine.id, varietyId: moschofilero.id } },
    update: { percentage: 100 },
    create: { wineId: troupisWine.id, varietyId: moschofilero.id, percentage: 100 },
  });

  // ── Vassaltis Vineyards — Βουρβούλος, Σαντορίνη ── πηγές: santorini.net, vassaltis.com, skurnik.com
  const vassaltis = await prisma.winery.upsert({
    where: { slug: "vassaltis-vineyards" },
    update: {},
    create: {
      slug: "vassaltis-vineyards",
      name: "Vassaltis Vineyards",
      regionId: santorini.id,
      foundedYear: 2014,
      websiteUrl: "https://vassaltis.com",
      description:
        "Ο Γιάννης Βαλάμπους παράτησε την καριέρα του στα οικονομικά στο Ηνωμένο Βασίλειο το 2010 για να αναβιώσει τους αμπελώνες που κληρονόμησε από τον πατέρα του. Ίδρυσε επίσημα το οινοποιείο το 2014 στον Βουρβούλο, στον δρόμο προς την Οία — το πρώτο οινοποιείο του 21ου αιώνα στη Σαντορίνη. Το όνομα εμπνεύστηκε από τον μαύρο ηφαιστειακό βασάλτη που καλύπτει το νησί.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const vassaltisWine = await prisma.wine.upsert({
    where: { slug: "vassaltis-santorini" },
    update: {},
    create: {
      name: "Santorini",
      slug: "vassaltis-santorini",
      wineryId: vassaltis.id,
      regionId: santorini.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "100% Ασύρτικο — η υπογραφή του κτήματος και το πρώτο κρασί που έφτιαξε ο Vassaltis, ζυμωμένο σε ανοξείδωτη δεξαμενή με 8-10 μήνες παραμονή στις οινολάσπες.",
      tastingNotes: "Στρωματοποιημένα, σύνθετα αρώματα πυριτόλιθου, βρεγμένης πέτρας και μιας πινελιάς θαλασσινού αλατιού, δεμένα με ώριμο κίτρινο φρούτο, ροδάκινο και μέλι, με απαλές νότες φρέσκου ψωμιού. Ζωηρή οξύτητα σε αρμονία με στρογγυλό φρούτο, πλούσια υφή με πιο κοφτερή, αλμυρή άκρη.",
      servingTemp: "8-10 °C",
      foodPairings: ["Θαλασσινά", "Ψάρια"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: vassaltisWine.id, varietyId: assyrtiko.id } },
    update: { percentage: 100 },
    create: { wineId: vassaltisWine.id, varietyId: assyrtiko.id, percentage: 100 },
  });

  // ── Venetsanos Winery — Μεγαλοχώρι, Σαντορίνη ── πηγές: santorini-view.com, greekcitytimes.com
  const venetsanos = await prisma.winery.upsert({
    where: { slug: "venetsanos-winery" },
    update: {},
    create: {
      slug: "venetsanos-winery",
      name: "Venetsanos Winery",
      regionId: santorini.id,
      foundedYear: 1947,
      websiteUrl: "https://venetsanoswinery.com",
      description:
        "Ιδρύθηκε το 1947 από τον Γιώργο Βενετσάνο, χτισμένο κυριολεκτικά μέσα στον βράχο της καλντέρας, πάνω από το λιμάνι του Αθηνιού, στο Μεγαλοχώρι. Ήταν το πρώτο βιομηχανικό οινοποιείο της Σαντορίνης. Λόγω έλλειψης ηλεκτρισμού την εποχή εκείνη, χτίστηκε από πάνω προς τα κάτω σε τέσσερα επίπεδα, ώστε τα σταφύλια να κατεβαίνουν με τη βαρύτητα χωρίς αντλίες, ως το τελικό προϊόν.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const venetsanosWine = await prisma.wine.upsert({
    where: { slug: "venetsanos-assyrtiko" },
    update: {},
    create: {
      name: "Assyrtiko",
      slug: "venetsanos-assyrtiko",
      wineryId: venetsanos.id,
      regionId: santorini.id,
      abv: 13,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "100% Ασύρτικο από τους παραδοσιακούς «κούλουρα» αμπελώνες του νησιού.",
      tastingNotes: "Λαμπερό κίτρινο χρώμα με πράσινες ανταύγειες. Λεπτά, έντονα και σύνθετα αρώματα αχλαδιού, λευκών ανθέων και εσπεριδοειδών, με κυρίαρχη τη νότα πικρού πορτοκαλιού και ίχνη μαστίχας και μάραθου. Πλούσια, ελαιώδης υφή στο στόμα με ζωηρή, λεμονάτη οξύτητα και τη χαρακτηριστική αλμύρα της Σαντορίνης, μακρά επίγευση.",
      servingTemp: "8-10 °C",
      foodPairings: ["Θαλασσινά", "Ψάρια σχάρας", "Ζυμαρικά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: venetsanosWine.id, varietyId: assyrtiko.id } },
    update: { percentage: 100 },
    create: { wineId: venetsanosWine.id, varietyId: assyrtiko.id, percentage: 100 },
  });

  // ── Vriniotis Winery — Γιάλτρα, Βόρεια Εύβοια ── πηγές: i-winereview.com, winetourism.com, vriniotiswinery.gr
  const vriniotis = await prisma.winery.upsert({
    where: { slug: "vriniotis-winery" },
    update: {},
    create: {
      slug: "vriniotis-winery",
      name: "Vriniotis Winery",
      regionId: evia.id,
      foundedYear: 2008,
      websiteUrl: "https://www.vriniotiswinery.gr",
      description:
        "Οι πρόγονοι του Κωνσταντίνου Βρυνιώτη καλλιεργούσαν αμπέλια στα Γιάλτρα, 14 χλμ από την Αιδηψό στη βόρεια Εύβοια, χτίζοντας το παλιό πέτρινο πατητήρι-οινοποιείο. Ο ίδιος ίδρυσε επίσημα το σύγχρονο οινοποιείο το 2008, δίπλα στο παλιό κτίσμα, καλλιεργώντας 100 στρέμματα στις πλαγιές του όρους Τελέθριο. Η ομάδα του Vriniotis έσωσε από την εξαφάνιση τη σπάνια γηγενή ποικιλία Βραδιανό.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const vriniotisWine = await prisma.wine.upsert({
    where: { slug: "vriniotis-vradiano" },
    update: {},
    create: {
      name: "Vradiano",
      slug: "vriniotis-vradiano",
      wineryId: vriniotis.id,
      regionId: evia.id,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      description: "100% Βραδιανό — σπάνια, αρχαία ποικιλία της βόρειας Εύβοιας που σχεδόν χάθηκε. Ζύμωση με άγρια μαγιά σε ανοιχτές δεξαμενές.",
      tastingNotes: "Μεσαίο ρουμπινί χρώμα. Βατόμουρο χαρακτήρα με αρώματα φρέσκου ροδιού, γαιώδεις και φρυγανισμένες νότες. Ζωηρή οξύτητα με κομψή αίσθηση στο στόμα και στρογγυλές, στιβαρές τανίνες.",
      servingTemp: "14-16 °C",
      foodPairings: ["Ψητά", "Μεσογειακή κουζίνα"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: vriniotisWine.id, varietyId: vradiano.id } },
    update: { percentage: 100 },
    create: { wineId: vriniotisWine.id, varietyId: vradiano.id, percentage: 100 },
  });

  // ── Zacharias Winery — Νεμέα ── πηγές: winesofgreece.org, palerubywine.com, profilewinegroup.com
  const zacharias = await prisma.winery.upsert({
    where: { slug: "zacharias-winery" },
    update: {},
    create: {
      slug: "zacharias-winery",
      name: "Zacharias Winery",
      regionId: nemea.id,
      foundedYear: 1974,
      websiteUrl: "https://zacharias.gr",
      description:
        "Οι πρώτες εγκαταστάσεις χτίστηκαν το 1960 και ολοκληρώθηκαν το 1973 με γαλλικά πρότυπα. Ο Ηλίας Ζαχαριάς, γεωπόνος απόφοιτος της Γεωπονικής Σχολής Αθηνών, ίδρυσε επίσημα την εταιρεία το 1974, αφιερωμένη στην ποιοτική αναβάθμιση των κρασιών Αγιωργίτικου από τα 40 εκτάρια ιδιόκτητου αμπελώνα στη Νεμέα.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const zachariasWine = await prisma.wine.upsert({
    where: { slug: "zacharias-nemea" },
    update: {},
    create: {
      name: "Nemea",
      slug: "zacharias-nemea",
      wineryId: zacharias.id,
      regionId: nemea.id,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "100% Αγιωργίτικο — η κλασική ετικέτα του οικογενειακού κτήματος από τους ιδιόκτητους αμπελώνες της Νεμέας.",
      tastingNotes: "Βαθύ κόκκινο χρώμα. Ήπιο, ώριμο μπουκέτο με νότες κερασιού, φράουλας, μούρου και βανίλιας. Γεμάτο σώμα, καλά ισορροπημένο με απαλές τανίνες και βελούδινη επίγευση.",
      servingTemp: "16-18 °C",
      foodPairings: ["Κόκκινα κρέατα", "Ζυμαρικά με κόκκινη σάλτσα"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: zachariasWine.id, varietyId: agiorgitiko.id } },
    update: { percentage: 100 },
    create: { wineId: zachariasWine.id, varietyId: agiorgitiko.id, percentage: 100 },
  });

  // ── Zafeirakis Estate (Κτήμα Ζαφειράκη) — Τύρναβος ── πηγές: thegrapereset.com, jancisrobinson.com, domainezafeirakis.com
  const zafeirakis = await prisma.winery.upsert({
    where: { slug: "domaine-zafeirakis" },
    update: {},
    create: {
      slug: "domaine-zafeirakis",
      name: "Κτήμα Ζαφειράκη",
      regionId: tyrnavos.id,
      description:
        "Η οικογένεια Ζαφειράκη ασχολείται με την αμπελουργία στους πρόποδες του Ολύμπου εδώ και πάνω από 4 γενιές, με ρίζες στην περιοχή του Τύρναβου από τις αρχές του 20ού αιώνα. Ο Χρήστος Ζαφειράκης, 4ης γενιάς οινοποιός, σπούδασε και εργάστηκε στην Ιταλία και επέστρεψε στον Τύρναβο το 2005 για να φυτέψει τον πρώτο βιολογικό αμπελώνα του, αφιερωμένος στην αναβίωση της σχεδόν ξεχασμένης γηγενούς ποικιλίας Λημνιώνα.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const zafeirakisWine = await prisma.wine.upsert({
    where: { slug: "zafeirakis-limniona" },
    update: {},
    create: {
      name: "Limniona",
      slug: "zafeirakis-limniona",
      wineryId: zafeirakis.id,
      regionId: tyrnavos.id,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      description: "100% Λημνιώνα βιολογικής καλλιέργειας — η ετικέτα που έφερε ξανά στο προσκήνιο τη σχεδόν ξεχασμένη ποικιλία της Θεσσαλίας.",
      tastingNotes: "Έντονο, καθαρό άρωμα τριαντάφυλλου και κερασιού με γαιώδεις και βοτανικές νότες. Μέτριο σώμα, ζωηρή οξύτητα, βελούδινες τανίνες, γλυκόξινη ένταση κερασιού και μια πικάντικη, πιπεράτη νότα στο τελείωμα.",
      servingTemp: "14-16 °C",
      foodPairings: ["Ψητά", "Μεσογειακή κουζίνα"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: zafeirakisWine.id, varietyId: limniona.id } },
    update: { percentage: 100 },
    create: { wineId: zafeirakisWine.id, varietyId: limniona.id, percentage: 100 },
  });

  console.log("Batch 6 done: 10 οινοποιεία, 10 κρασιά, 3 νέες περιοχές, 3 νέες ποικιλίες.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
