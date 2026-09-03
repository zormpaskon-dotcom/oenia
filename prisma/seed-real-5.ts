// Batch 3/9 από τη λίστα ~88 οινοποιείων. Ίδια δομή ανά κρασί με τα
// προηγούμενα batches — πηγές σε σχόλιο ανά εγγραφή.
//
// Batch 3: Gentilini, Hatzidakis, Idaia, Karavitakis, Katogi Averoff,
// Kechris, Kitrvs, Kir-Yianni, Pavlidis Estate, Voyatzi Winery.
// (Το «Tselepos Winery / Μαντινεία» της λίστας παραλείφθηκε — ήδη
// υπάρχει ως Κτήμα Τσέλεπος από το batch αρχικών περιοχών.)

import { Appellation, ContentStatus, MacroRegion, WineColor, WineStyle } from "@prisma/client";
import { prisma } from "../lib/prisma";

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

async function main() {
  console.log("Νέες περιοχές…");
  const chania = await ensureRegion(
    "chania",
    "Χανιά",
    MacroRegion.CRETE,
    Appellation.PGI,
    "Ζώνη ΠΓΕ στα δυτικά της Κρήτης, γύρω από το Κολυμβάρι — ιστορική περιοχή καλλιέργειας γηγενών ποικιλιών όπως το Ρομέικο."
  );
  const metsovo = await ensureRegion(
    "metsovo",
    "Μέτσοβο",
    MacroRegion.EPIRUS,
    Appellation.PGI,
    "Ορεινή περιοχή της Πίνδου στα 1000μ — εκεί φύτεψε ο Ευάγγελος Αβέρωφ τα πρώτα κλήματα Cabernet Sauvignon στην Ελλάδα, στα τέλη της δεκαετίας του '50."
  );
  const pieria = await ensureRegion(
    "pieria",
    "Πιερία",
    MacroRegion.NORTHERN_GREECE,
    Appellation.PGI,
    "Ζώνη ΠΓΕ στους λόφους της Πύδνας, κοντά στη θάλασσα — γνωστή για συνδυασμούς ελληνικών και διεθνών ποικιλιών, καθώς και για την αναβίωση του αρχαίου Ελληνικού (Aglianico)."
  );
  const velvento = await ensureRegion(
    "velvento",
    "Βελβεντό Κοζάνης",
    MacroRegion.NORTHERN_GREECE,
    Appellation.PGI,
    "Ζώνη ΠΓΕ στη Δυτική Μακεδονία, ανάμεσα στα Πιέρια όρη και τη λίμνη Πολυφύτου."
  );

  const santorini = await prisma.region.findUniqueOrThrow({ where: { slug: "santorini" } });
  const naoussa = await prisma.region.findUniqueOrThrow({ where: { slug: "naoussa" } });
  const drama = await prisma.region.findUniqueOrThrow({ where: { slug: "drama" } });
  const thessaloniki = await prisma.region.findUniqueOrThrow({ where: { slug: "thessaloniki" } });
  const dafnes = await prisma.region.findUniqueOrThrow({ where: { slug: "dafnes" } });
  const robola = await prisma.region.findUniqueOrThrow({ where: { slug: "robola-kefallinias" } });

  const robolaVariety = await prisma.variety.findUniqueOrThrow({ where: { name: "Ρομπόλα" } });
  const mavrotragano = await prisma.variety.findUniqueOrThrow({ where: { name: "Μαυροτράγανο" } });
  const vidiano = await prisma.variety.findUniqueOrThrow({ where: { name: "Βιδιανό" } });
  const liatiko = await prisma.variety.findUniqueOrThrow({ where: { name: "Λιάτικο" } });
  const cabernetSauvignon = await prisma.variety.findUniqueOrThrow({ where: { name: "Cabernet Sauvignon" } });
  const merlot = await prisma.variety.findUniqueOrThrow({ where: { name: "Merlot" } });
  const cabernetFranc = await prisma.variety.findUniqueOrThrow({ where: { name: "Cabernet Franc" } });
  const roditis = await prisma.variety.findUniqueOrThrow({ where: { name: "Ροδίτης" } });
  const malagousia = await prisma.variety.findUniqueOrThrow({ where: { name: "Μαλαγουζιά" } });
  const xinomavro = await prisma.variety.findUniqueOrThrow({ where: { name: "Ξινόμαυρο" } });
  const assyrtiko = await prisma.variety.findUniqueOrThrow({ where: { name: "Ασύρτικο" } });
  const sauvignonBlanc = await prisma.variety.findUniqueOrThrow({ where: { name: "Sauvignon Blanc" } });

  console.log("Οινοποιεία + κρασιά…");

  // ── Gentilini — Ρομπόλα Κεφαλληνίας ── πηγές: i-winereview.com, gentilini.gr
  const gentilini = await prisma.winery.upsert({
    where: { slug: "gentilini" },
    update: {},
    create: {
      slug: "gentilini",
      name: "Gentilini Winery",
      regionId: robola.id,
      foundedYear: 1984,
      websiteUrl: "https://gentilini.gr",
      description:
        "Η οικογένεια Κοσμετάτου έχει ρίζες στον Ιταλό μηχανικό Marino Gentilini, που έχτισε τις οχυρώσεις της Άσσου τον 16ο αιώνα για τη Βενετική Γερουργία και παντρεύτηκε στο νησί. Ο Σπύρος Κοσμετάτος ίδρυσε το σύγχρονο οινοποιείο το 1984, μετά από εμπειρία στα αμπέλια του Cape Town — η κόρη του Μαριάννα το διευθύνει από το 2002.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const gentiliniWine = await prisma.wine.upsert({
    where: { slug: "gentilini-robola" },
    update: {},
    create: {
      name: "Gentilini Robola",
      slug: "gentilini-robola",
      wineryId: gentilini.id,
      regionId: robola.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "Το εμβληματικό κρασί του οινοποιείου, από τη σειρά «Expressions of Robola».",
      tastingNotes: "Καθαρή έκφραση της ορεινής Ρομπόλας του νησιού — φρέσκια, ορυκτική, με έντονη οξύτητα.",
      servingTemp: "8-10 °C",
      foodPairings: ["Θαλασσινά", "Ψάρια"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: gentiliniWine.id, varietyId: robolaVariety.id } },
    update: { percentage: 100 },
    create: { wineId: gentiliniWine.id, varietyId: robolaVariety.id, percentage: 100 },
  });

  // ── Hatzidakis — Σαντορίνη ── πηγή: hatzidakiswines.gr, wineanorak.com
  const hatzidakis = await prisma.winery.upsert({
    where: { slug: "hatzidakis" },
    update: {},
    create: {
      slug: "hatzidakis",
      name: "Hatzidakis Winery",
      regionId: santorini.id,
      foundedYear: 1997,
      websiteUrl: "https://www.hatzidakiswines.gr",
      isOrganic: true,
      description:
        "Ιδρύθηκε το 1997 από τον Χαρίδημο και την Κωνσταντίνα Χατζηδάκη — και οι δύο είχαν εργαστεί στο Boutari Σαντορίνης. Ο αμπελώνας ήταν εγκαταλελειμμένος από το σεισμό του 1956· ο Χαρίδημος τον φύτεψε ξανά με Αηδάνι το 1996 και έφτιαξε το οινοποιείο σε σπηλιά, με ελάχιστα μέσα αλλά πολύ πάθος. Μετά τον θάνατό του το 2017, η κόρη του Στέλλα διευθύνει το κτήμα.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const hatzidakisWine = await prisma.wine.upsert({
    where: { slug: "hatzidakis-mavrotragano" },
    update: {},
    create: {
      name: "Hatzidakis Mavrotragano",
      slug: "hatzidakis-mavrotragano",
      wineryId: hatzidakis.id,
      regionId: santorini.id,
      color: WineColor.RED,
      style: WineStyle.DRY,
      description: "Ένα από τα δύο πρώτα κρασιά του οινοποιείου (μαζί με το «Santorini» Ασύρτικο), από τη σοδειά του 1997 — βιολογική καλλιέργεια.",
      tastingNotes: "Σπάνιο μονοποικιλιακό Μαυροτράγανο Σαντορίνης — βαθύ χρώμα, δομή και δυναμικό παλαίωσης, ασυνήθιστο για το νησί των λευκών.",
      servingTemp: "16-18 °C",
      foodPairings: ["Κόκκινα κρέατα", "Ώριμα τυριά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: hatzidakisWine.id, varietyId: mavrotragano.id } },
    update: { percentage: 100 },
    create: { wineId: hatzidakisWine.id, varietyId: mavrotragano.id, percentage: 100 },
  });

  // ── Idaia Winery — Δαφνές ── πηγές: winesofcrete.gr, wine-searcher.com
  const idaia = await prisma.winery.upsert({
    where: { slug: "idaia-winery" },
    update: {},
    create: {
      slug: "idaia-winery",
      name: "Idaia Winery",
      regionId: dafnes.id,
      foundedYear: 2000,
      websiteUrl: "https://www.idaiawinery.com",
      description:
        "Ιδρύθηκε το 2000 από τους οινολόγους Βασίλη Λαδερό και Καλλιόπη Βολιτάκη στο Βενεράτο, στη ζώνη ΠΟΠ Δαφνών. Το όνομα προέρχεται από την αρχαία ονομασία της Κρήτης — κατά τον μύθο, η Ιδαία ήταν σύζυγος του Κρητικού βασιλιά Δία.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const idaiaWine = await prisma.wine.upsert({
    where: { slug: "idaia-vidiano" },
    update: {},
    create: {
      name: "Idaia Vidiano",
      slug: "idaia-vidiano",
      wineryId: idaia.id,
      regionId: dafnes.id,
      abv: 13,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      description: "100% Βιδιανό — μια από τις 12 ετικέτες του οινοποιείου, εστιασμένες σε γηγενείς κρητικές ποικιλίες.",
      tastingNotes: "Λαμπερό κίτρινο με πράσινες ανταύγειες, νότες βερίκοκου, ροδάκινου, εσπεριδοειδών και λουλουδιών. Ζουμερό, στρογγυλό, φρέσκο στιλ.",
      servingTemp: "9-11 °C",
      foodPairings: ["Λευκά κρέατα", "Θαλασσινά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: idaiaWine.id, varietyId: vidiano.id } },
    update: { percentage: 100 },
    create: { wineId: idaiaWine.id, varietyId: vidiano.id, percentage: 100 },
  });

  // ── Karavitakis — Χανιά ── πηγές: winesofcrete.gr, botilia.gr
  const karavitakis = await prisma.winery.upsert({
    where: { slug: "karavitakis" },
    update: {},
    create: {
      slug: "karavitakis",
      name: "Karavitakis Winery",
      regionId: chania.id,
      foundedYear: 1996,
      websiteUrl: "https://www.karavitakiswines.com",
      description:
        "Οικογενειακή παράδοση 80+ ετών στο Κολυμβάρι Χανίων. Ο Μανώλης Καραβιτάκης ανασυγκρότησε τους αμπελώνες και έχτισε το σύγχρονο οινοποιείο το 1996, μετά από εμπειρία στον Συνεταιρισμό Καστελλίου — 4η γενιά της οικογένειας στο κρασί.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const karavitakisWine = await prisma.wine.upsert({
    where: { slug: "karavitakis-kompsos-liatiko" },
    update: {},
    create: {
      name: "Κομψός Λιάτικο",
      slug: "karavitakis-kompsos-liatiko",
      wineryId: karavitakis.id,
      regionId: chania.id,
      vintage: 2025,
      color: WineColor.RED,
      style: WineStyle.DRY,
      description: "Κομψό, μονοποικιλιακό Λιάτικο — σπάνια κρητική ποικιλία με ανοιχτό χρώμα και πλούσια αρώματα.",
      tastingNotes: "Ανοιχτόχρωμο ερυθρό, μέτρια οξύτητα, πλούσιο σε αρώματα και φυσικά σάκχαρα.",
      foodPairings: ["Κρητική κουζίνα", "Μεζέδες"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: karavitakisWine.id, varietyId: liatiko.id } },
    update: { percentage: 100 },
    create: { wineId: karavitakisWine.id, varietyId: liatiko.id, percentage: 100 },
  });

  // ── Katogi Averoff — Μέτσοβο ── πηγή: winesofgreece.org
  const katogi = await prisma.winery.upsert({
    where: { slug: "katogi-averoff" },
    update: {},
    create: {
      slug: "katogi-averoff",
      name: "Katogi Averoff",
      regionId: metsovo.id,
      description:
        "Ιστορικό όραμα του πολιτικού Ευάγγελου Αβέρωφ, που στα τέλη της δεκαετίας του '50 φύτεψε στις πλαγιές της Πίνδου (1000μ) τα πρώτα κλήματα Cabernet Sauvignon της Ελλάδας — τα πρώτα διεθνή κλήματα εισαγμένα απευθείας από τη Γαλλία. Το πρώτο κρασί, «Κάτω-γη Μετσόβου», οινοποιήθηκε στο υπόγειο («κατώγι») του σπιτιού του. Μετά τον θάνατό του η ετικέτα μετονομάστηκε σε «Katogi Averoff».",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const katogiWine = await prisma.wine.upsert({
    where: { slug: "katogi-metsovou" },
    update: {},
    create: {
      name: "Katogi Metsovou",
      slug: "katogi-metsovou",
      wineryId: katogi.id,
      regionId: metsovo.id,
      color: WineColor.RED,
      style: WineStyle.DRY,
      description: "Η ιστορική ετικέτα που εισήγαγε το Cabernet Sauvignon στην Ελλάδα — blend με Merlot και Cabernet Franc από ορεινούς αμπελώνες στο 1000μ.",
      tastingNotes: "Ορεινό, δροσερό στιλ λόγω υψομέτρου — δομή και φρεσκάδα ασυνήθιστη για την ποικιλία στην Ελλάδα της εποχής.",
      servingTemp: "16-18 °C",
      foodPairings: ["Κόκκινα κρέατα", "Κυνήγι"],
      status: ContentStatus.PUBLISHED,
    },
  });
  for (const variety of [cabernetSauvignon, merlot, cabernetFranc]) {
    await prisma.varietyOnWine.upsert({
      where: { wineId_varietyId: { wineId: katogiWine.id, varietyId: variety.id } },
      update: {},
      create: { wineId: katogiWine.id, varietyId: variety.id, percentage: null },
    });
  }

  // ── Kechris — Θεσσαλονίκη ── πηγές: thessaloniki.travel, winesofgreece.org, kechris.gr
  const kechris = await prisma.winery.upsert({
    where: { slug: "kechris" },
    update: {},
    create: {
      slug: "kechris",
      name: "Kechris Winery",
      regionId: thessaloniki.id,
      foundedYear: 1911,
      websiteUrl: "https://www.kechris.gr",
      description:
        "Ξεκίνησε το 1911 όταν ο Ευάγγελος Κεχρής εμφιάλωσε κρασί με γυάλινες φιάλες εισαγμένες από τις ΗΠΑ. Η οικογένεια διατηρούσε την ταβέρνα «Κόκορας» στη Θεσσαλονίκη από το 1939, όπου σέρβιρε τη δική της ρετσίνα. Ο Στέλιος Κεχρής, οινολόγος με σπουδές στη Γαλλία, επέστρεψε το 1980 δίνοντας νέα πνοή στην παραδοσιακή ρετσίνα.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const kechrisWine = await prisma.wine.upsert({
    where: { slug: "kechribari-retsina" },
    update: {},
    create: {
      name: "Κεχριμπάρι Ρετσίνα",
      slug: "kechribari-retsina",
      wineryId: kechris.id,
      regionId: thessaloniki.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      description: "Σημείο αναφοράς για τη ρετσίνα από το 1939 — πάνω από 35 διεθνή βραβεία. Ρετσινάτο με φυσική ρητίνη Χαλκιδικής, από Ροδίτη (και σε ορισμένες εκδοχές Σαββατιανό).",
      tastingNotes: "Αρώματα μεσογειακών φρούτων με έντονες βοτανικές νότες μαστίχας, πεύκου και θυμαριού. Ανοιχτό κιτρινοπράσινο χρώμα, νότες αχλαδιού, πράσινου μήλου, πεπονιού και λάιμ.",
      servingTemp: "8-10 °C",
      foodPairings: ["Μεζέδες", "Θαλασσινά", "Ελληνική κουζίνα"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: kechrisWine.id, varietyId: roditis.id } },
    update: { percentage: 100 },
    create: { wineId: kechrisWine.id, varietyId: roditis.id, percentage: 100 },
  });

  // ── Kitrvs — Πιερία ── πηγή: greeceandgrapes.com, cellier.gr
  const kitrvs = await prisma.winery.upsert({
    where: { slug: "kitrvs" },
    update: {},
    create: {
      slug: "kitrvs",
      name: "Kitrvs Winery",
      regionId: pieria.id,
      foundedYear: 2008,
      websiteUrl: "https://kitrus.gr",
      description:
        "Μικρός αμπελώνας 65 στρεμμάτων στους λόφους της Πύδνας, 3-4χλμ από τη θάλασσα, σε υψόμετρο 120-150μ. Ξεκίνησε το 2008 και έγινε γρήγορα γνωστό για τρία μονοποικιλιακά κρασιά: Μαλαγουζιά, Syrah, και το σπάνιο «Ελληνικό» (Aglianico), μια αρχαία ελληνική ποικιλία που «επαναπατρίστηκε» από τη Βασιλικάτα της Ιταλίας.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const kitrvsWine = await prisma.wine.upsert({
    where: { slug: "kitrvs-malagousia" },
    update: {},
    create: {
      name: "Μαλαγουζιά Kitrvs",
      slug: "kitrvs-malagousia",
      wineryId: kitrvs.id,
      regionId: pieria.id,
      vintage: 2024,
      abv: 13.5,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      description: "100% Μαλαγουζιά από αργιλοασβεστώδη εδάφη κοντά στη θάλασσα.",
      tastingNotes: "Φρέσκος λευκός χαρακτήρας με νότες εσπεριδοειδών και λουλουδιών, ορυκτική πολυπλοκότητα, γεύσεις πυρηνόκαρπων και βοτανικά στοιχεία.",
      servingTemp: "8-10 °C",
      foodPairings: ["Ελαφριά ορεκτικά", "Ψάρια"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: kitrvsWine.id, varietyId: malagousia.id } },
    update: { percentage: 100 },
    create: { wineId: kitrvsWine.id, varietyId: malagousia.id, percentage: 100 },
  });

  // ── Kir-Yianni — Νάουσα (λίστα: «Νάουσα / Αμύνταιο») ── πηγή: kiryianni.gr
  const kiryianni = await prisma.winery.upsert({
    where: { slug: "kir-yianni" },
    update: {},
    create: {
      slug: "kir-yianni",
      name: "Κτήμα Κυρ-Γιάννη",
      regionId: naoussa.id,
      foundedYear: 1997,
      websiteUrl: "https://kiryianni.gr",
      description:
        "Ιδρύθηκε το 1997 από τον Γιάννη Μπουτάρη — ξεχωριστό εγχείρημα από την ομώνυμη ιστορική οικογενειακή επιχείρηση (Boutari, 1879), της οποίας ήταν επίσης μέλος. Κτηματικές εκτάσεις σε Νάουσα και Αμύνταιο· από το 2004 τη διοίκηση έχει ο γιος του Στέλιος.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const kiryianniWine = await prisma.wine.upsert({
    where: { slug: "kir-yianni-ramnista" },
    update: {},
    create: {
      name: "Ραμνίστα",
      slug: "kir-yianni-ramnista",
      wineryId: kiryianni.id,
      regionId: naoussa.id,
      vintage: 2020,
      abv: 13.5,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "Το όνομα «Ραμνίστα» σημαίνει «βασιλικός λόφος» στην τοπική διάλεκτο — αναφορά στους λοφώδεις αμπελώνες του κτήματος στη Νάουσα. Παλαίωση 18 μήνες σε γαλλική και αμερικανική δρυ.",
      tastingNotes: "Βατόμουρο, δέρμα φρούτου και καφές στη μύτη, με πίσσα και σκούρα μούρα στο στόμα. Μέτρια-υψηλό αλκοόλ, υψηλές τανίνες, γεμάτο σώμα με νότες μαύρης ελιάς και λιαστής ντομάτας στο τέλος.",
      servingTemp: "16-18 °C",
      foodPairings: ["Κόκκινα κρέατα", "Ώριμα τυριά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: kiryianniWine.id, varietyId: xinomavro.id } },
    update: { percentage: 100 },
    create: { wineId: kiryianniWine.id, varietyId: xinomavro.id, percentage: 100 },
  });

  // ── Pavlidis Estate — Δράμα ── πηγή: greeceandgrapes.com, clubοenologique.com
  const pavlidis = await prisma.winery.upsert({
    where: { slug: "pavlidis-estate" },
    update: {},
    create: {
      slug: "pavlidis-estate",
      name: "Κτήμα Παυλίδη",
      regionId: drama.id,
      foundedYear: 1998,
      websiteUrl: "https://www.pavlidisestate.gr",
      description:
        "Ιδρύθηκε το 1998 από τον Χριστόφορο Παυλίδη στα Κοκκινόγεια Δράμας, στους πρόποδες του Φαλακρού. Από το 2005 ο τρύγος γίνεται αποκλειστικά τη νύχτα για να μειωθεί η καταπόνηση των σταφυλιών. Δύο σειρές: «Thema» (blends) και «Emphasis» (μονοποικιλιακά).",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const pavlidisWine = await prisma.wine.upsert({
    where: { slug: "pavlidis-thema-leukos" },
    update: {},
    create: {
      name: "Thema Λευκός",
      slug: "pavlidis-thema-leukos",
      wineryId: pavlidis.id,
      regionId: drama.id,
      vintage: 2025,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      description: "Blend 50% Ασύρτικο, 49.9% Sauvignon Blanc — από τους πιο δημοφιλείς λευκούς συνδυασμούς της Δράμας.",
      tastingNotes: "Ανοιχτό, εκφραστικό μπουκέτο ώριμου ροδάκινου και πυρηνόκαρπων με μια νότα αλμύρας, ζωντανή ορυκτική οξύτητα.",
      servingTemp: "8-10 °C",
      foodPairings: ["Ψάρια", "Θαλασσινά", "Λευκά κρέατα"],
      status: ContentStatus.PUBLISHED,
    },
  });
  for (const [variety, percentage] of [
    [assyrtiko, 50],
    [sauvignonBlanc, 49.9],
  ] as const) {
    await prisma.varietyOnWine.upsert({
      where: { wineId_varietyId: { wineId: pavlidisWine.id, varietyId: variety.id } },
      update: { percentage },
      create: { wineId: pavlidisWine.id, varietyId: variety.id, percentage },
    });
  }

  // ── Voyatzi Winery — Βελβεντό Κοζάνης ── πηγή: winesofgreece.org, ktimavoyatzi.gr
  const voyatzi = await prisma.winery.upsert({
    where: { slug: "voyatzi-winery" },
    update: {},
    create: {
      slug: "voyatzi-winery",
      name: "Κτήμα Βογιατζή",
      regionId: velvento.id,
      foundedYear: 1997,
      websiteUrl: "https://ktimavoyatzi.gr",
      isOrganic: true,
      description:
        "Ιδρύθηκε το 1997 από τα αδέρφια Γιάννη (οινολόγος, σπουδές στο Bordeaux) και Νίκο Βογιατζή (μηχανολόγος), 3ης γενιάς, στο Βελβεντό κοντά στη λίμνη Πολυφύτου. Βιολογική καλλιέργεια από την αρχή (1991-94) σε αμπελώνα 120 στρεμμάτων, υψόμετρο 340μ.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const voyatziWine = await prisma.wine.upsert({
    where: { slug: "voyatzi-xinomavro" },
    update: {},
    create: {
      name: "Βογιατζή Ξινόμαυρο",
      slug: "voyatzi-xinomavro",
      wineryId: voyatzi.id,
      regionId: velvento.id,
      vintage: 2021,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      description: "Ζύμωση με άγριες ζύμες (μέθοδος pied de cuve), παλαίωση 12 μήνες σε γαλλική δρυ.",
      tastingNotes: "Μέτριο κόκκινο χρώμα, αρώματα μούρων με λουλούδια και βότανα, γήινες και πικάντικες νότες. Αποξηραμένα κόκκινα φρούτα στο στόμα με νότα λιαστής ντομάτας, δυναμικές τανίνες, γεμάτο σώμα.",
      servingTemp: "16-18 °C",
      foodPairings: ["Κόκκινα κρέατα", "Μακεδονική κουζίνα"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: voyatziWine.id, varietyId: xinomavro.id } },
    update: { percentage: 100 },
    create: { wineId: voyatziWine.id, varietyId: xinomavro.id, percentage: 100 },
  });

  console.log("Batch 3 done: 10 οινοποιεία, 4 νέες περιοχές.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
