// Batch 1/9 από λίστα ~88 οινοποιείων (αρχείο χρήστη, μόνο ονόματα +
// περιοχή + website — καμία άλλη πληροφορία). Κάθε οινοποιείο ερευνήθηκε
// online· πηγές σε σχόλιο πάνω από κάθε εγγραφή. Ίδια δομή ανά κρασί με τα
// προηγούμενα batches: color/style, varieties, description (winemaking),
// tastingNotes, servingTemp, foodPairings.
//
// Batch 1: Anhydrous, Artemis Karamolegos, Avantis Estate, Boutari,
// Bairaktaris, Canava Chrissou Tselepos, Domaine Hatzimichalis,
// Costa Lazaridi, Dalamaras, Diamantakos.

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
  console.log("Νέες περιοχές (Εύβοια, Δράμα, Φθιώτιδα)…");
  const evia = await ensureRegion(
    "evia",
    "Εύβοια",
    MacroRegion.CENTRAL_GREECE,
    Appellation.PGI,
    "Ζώνη ΠΓΕ στο κεντρικό τμήμα του νησιού, γύρω από το όρος Δίρφυς — γνωστή κυρίως από το Avantis Estate."
  );
  const drama = await ensureRegion(
    "drama",
    "Δράμα",
    MacroRegion.NORTHERN_GREECE,
    Appellation.PGI,
    "Ζώνη ΠΓΕ στη Βόρεια Ελλάδα με τρεις υποζώνες (Δράμας, Αδριανής, Αγοράς) — φημισμένη για συνδυασμούς ελληνικών και διεθνών ποικιλιών."
  );
  const fthiotida = await ensureRegion(
    "fthiotida",
    "Φθιώτιδα (Αταλάντη)",
    MacroRegion.CENTRAL_GREECE,
    Appellation.PGI,
    "Περιοχή γύρω από την Αταλάντη Λοκρίδας, στους πρόποδες του Παρνασσού — γνωστή κυρίως από το Κτήμα Χατζημιχάλη."
  );

  const santorini = await prisma.region.findUniqueOrThrow({ where: { slug: "santorini" } });
  const naoussa = await prisma.region.findUniqueOrThrow({ where: { slug: "naoussa" } });
  const nemea = await prisma.region.findUniqueOrThrow({ where: { slug: "nemea" } });

  console.log("Νέες ποικιλίες (Πρεκνάδι)…");
  await ensureVariety("Πρεκνάδι", VarietyType.WHITE, {
    originRegion: "Νάουσα",
    description:
      "Σπάνια λευκή ποικιλία της Νάουσας — παραδοσιακά φυτευόταν στις άκρες των αμπελώνων Ξινόμαυρου ως «πρώτος ασθενής» σε περίπτωση ασθένειας. Σήμερα μόλις δύο οινοποιεία τη δουλεύουν μονοποικιλιακά.",
    characteristics: "Ελαφριά, με διακριτική οξύτητα — λίγα διαθέσιμα στοιχεία λόγω σπανιότητας.",
  });

  const xinomavro = await prisma.variety.findUniqueOrThrow({ where: { name: "Ξινόμαυρο" } });
  const assyrtiko = await prisma.variety.findUniqueOrThrow({ where: { name: "Ασύρτικο" } });
  const agiorgitiko = await prisma.variety.findUniqueOrThrow({ where: { name: "Αγιωργίτικο" } });
  const cabernetSauvignon = await prisma.variety.findUniqueOrThrow({ where: { name: "Cabernet Sauvignon" } });
  const merlot = await prisma.variety.findUniqueOrThrow({ where: { name: "Merlot" } });

  console.log("Οινοποιεία + κρασιά…");

  // ── Anhydrous Winery — Σαντορίνη ── πηγές: anhydrouswinery.com, londonwinecompetition.com
  const anhydrous = await prisma.winery.upsert({
    where: { slug: "anhydrous-winery" },
    update: {},
    create: {
      slug: "anhydrous-winery",
      name: "Anhydrous Winery",
      regionId: santorini.id,
      foundedYear: 2021,
      websiteUrl: "https://www.anhydrouswinery.com",
      description:
        "Ιδρύθηκε το 2021 από τον Απόστολο Μουντρίχα (ήδη ιδρυτή του Avantis Estate στην Εύβοια από το 1994), στο Φηρά Κοντοχώρι της Σαντορίνης. Εστιάζει στην έκφραση του ηφαιστειακού terroir μέσα από το Ασύρτικο, με πάνω από 50 διεθνή βραβεία.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const anhydrousWine = await prisma.wine.upsert({
    where: { slug: "anhydrous-afourae" },
    update: {},
    create: {
      name: "Afourae",
      slug: "anhydrous-afourae",
      wineryId: anhydrous.id,
      regionId: santorini.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      description: "Από τα κορυφαία ετικέτες του οινοποιείου — βαθμολογήθηκε με 94/100 από το Decanter.",
      tastingNotes:
        "Χαρακτηριστική εξαιρετικά χαμηλή οξύτητα pH (2.9) της ηφαιστειακής Σαντορίνης — ορυκτικότητα, ένταση και δομή.",
      servingTemp: "8-10 °C",
      foodPairings: ["Θαλασσινά", "Ψητά ψάρια", "Ελαφριά ορεκτικά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: anhydrousWine.id, varietyId: assyrtiko.id } },
    update: { percentage: 100 },
    create: { wineId: anhydrousWine.id, varietyId: assyrtiko.id, percentage: 100 },
  });

  // ── Artemis Karamolegos — Σαντορίνη ── πηγές: wineanorak.com, lesommelier.com
  const karamolegos = await prisma.winery.upsert({
    where: { slug: "artemis-karamolegos" },
    update: {},
    create: {
      slug: "artemis-karamolegos",
      name: "Artemis Karamolegos",
      regionId: santorini.id,
      foundedYear: 2004,
      websiteUrl: "https://www.artemiskaramolegos-winery.com",
      description:
        "Οι ρίζες της οικογένειας φτάνουν στο 1952, όταν ο παππούς Άρτεμις καλλιεργούσε τα δικά του αμπέλια. Ο εγγονός του ίδρυσε το σύγχρονο οινοποιείο στην Έξω Γωνιά το 2004, σήμερα το 3ο μεγαλύτερο σε όγκο στο νησί, με φυτείες έως και 150 ετών.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const karamolegosWine = await prisma.wine.upsert({
    where: { slug: "karamolegos-santorini" },
    update: {},
    create: {
      name: "Santorini",
      slug: "karamolegos-santorini",
      wineryId: karamolegos.id,
      regionId: santorini.id,
      vintage: 2022,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      description: "Από τη βασική «Classics Collection» του οινοποιείου — το κλασικό ΠΟΠ Σαντορίνη τους.",
      tastingNotes: "Ορυκτικό, ξηρό λευκό με την τυπική έντονη οξύτητα του ηφαιστειακού εδάφους της Σαντορίνης.",
      servingTemp: "8-10 °C",
      foodPairings: ["Θαλασσινά", "Ψάρια σχάρας"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: karamolegosWine.id, varietyId: assyrtiko.id } },
    update: { percentage: 100 },
    create: { wineId: karamolegosWine.id, varietyId: assyrtiko.id, percentage: 100 },
  });

  // ── Avantis Estate — Εύβοια ── πηγή: winesofgreece.org
  const avantis = await prisma.winery.upsert({
    where: { slug: "avantis-estate" },
    update: {},
    create: {
      slug: "avantis-estate",
      name: "Avantis Estate",
      regionId: evia.id,
      foundedYear: 1994,
      websiteUrl: "https://www.avantiswines.gr",
      description:
        "Ιδρύθηκε το 1994 από τον οικονομολόγο Απόστολο Μουντρίχα κοντά στο Αφράτι, στους πρόποδες του όρους Δίρφυς. Πήρε το όνομά του από το αρχαίο όνομα της Εύβοιας. Το 1998 έγινε το πρώτο ελληνικό κρασί που μπήκε στο Βιβλίο Ρεκόρ Γκίνες.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  await prisma.wine.upsert({
    where: { slug: "avantis-erythra" },
    update: {},
    create: {
      name: "Avantis Erythra",
      slug: "avantis-erythra",
      wineryId: avantis.id,
      regionId: evia.id,
      color: WineColor.RED,
      style: WineStyle.DRY,
      description: "Το βασικό ερυθρό της γραμμής Avantis, από τους ιδιόκτητους αμπελώνες γύρω από το Αφράτι Ευβοίας.",
      tastingNotes: "Κόκκινο ξηρό με φρουτώδη χαρακτήρα — μέρος της οικογένειας ετικετών Avantis Lefka/Rozé/Erythra/Glyka.",
      servingTemp: "16-18 °C",
      foodPairings: ["Κόκκινα κρέατα", "Μεσογειακή κουζίνα"],
      status: ContentStatus.PUBLISHED,
    },
  });

  // ── Boutari — Νάουσα ── πηγές: winesofgreece.org, boutari.gr, winealign.com
  const boutari = await prisma.winery.upsert({
    where: { slug: "boutari" },
    update: {},
    create: {
      slug: "boutari",
      name: "Boutari",
      regionId: naoussa.id,
      foundedYear: 1879,
      websiteUrl: "https://boutari.gr",
      description:
        "Ένα από τα ιστορικότερα ελληνικά οινοποιεία — ιδρύθηκε το 1879 από τον Ιωάννη Μπουτάρη. Το 1879 ήταν ο πρώτος Έλληνας οινοποιός που εμφιάλωσε ερυθρό κρασί για εξαγωγή, και το «Ναούσα Μπουτάρη» ήταν το πρώτο ελληνικό ερυθρό ΠΟΠ σε φιάλη. Καθοριστικός ρόλος στη διάσωση του Ξινόμαυρου και στην αναγνώριση της ζώνης Νάουσας (ΠΟΠ από το 1971).",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const boutariWine = await prisma.wine.upsert({
    where: { slug: "naoussa-boutari" },
    update: {},
    create: {
      name: "Ναούσα Μπουτάρη",
      slug: "naoussa-boutari",
      wineryId: boutari.id,
      regionId: naoussa.id,
      vintage: 2022,
      abv: 13,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "Το ιστορικό πρώτο ελληνικό εμφιαλωμένο ΠΟΠ ερυθρό. Παλαίωση 12 μήνες σε γαλλικά δρύινα βαρέλια.",
      tastingNotes:
        "Πλούσιο μπουκέτο ώριμων κόκκινων φρούτων, βατόμουρου και δαμάσκηνου, μαζί με λιαστή ντομάτα και νότες κανέλας και ξύλου από την παλαίωση. Γεμάτο σώμα, καλή ισορροπία και δομή, απαλές τανίνες στο τέλος.",
      servingTemp: "16-18 °C",
      foodPairings: ["Κόκκινα κρέατα", "Μοσχαράκι κοκκινιστό", "Ώριμα τυριά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: boutariWine.id, varietyId: xinomavro.id } },
    update: { percentage: 100 },
    create: { wineId: boutariWine.id, varietyId: xinomavro.id, percentage: 100 },
  });

  // ── Bairaktaris — Νεμέα ── πηγή: bairaktariswines.gr, mysa.wine
  const bairaktaris = await prisma.winery.upsert({
    where: { slug: "bairaktaris" },
    update: {},
    create: {
      slug: "bairaktaris",
      name: "Ktima Bairaktaris",
      regionId: nemea.id,
      foundedYear: 2005,
      websiteUrl: "https://bairaktariswines.gr",
      description:
        "Ιδρύθηκε το 2005 από τον Χρήστο Μπαϊρακτάρη, συνέχεια γενεών αμπελουργών της Νεμέας. Μικρό οικογενειακό οινοποιείο 17 εκταρίων (12 ερυθρές, 5 λευκές ποικιλίες).",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const bairaktarisWine = await prisma.wine.upsert({
    where: { slug: "bairaktaris-ktima" },
    update: {},
    create: {
      name: "Ktima Bairaktaris",
      slug: "bairaktaris-ktima",
      wineryId: bairaktaris.id,
      regionId: nemea.id,
      color: WineColor.RED,
      style: WineStyle.DRY,
      description:
        "Το «statement wine» του οινοποιείου — Αγιωργίτικο από τους κορυφαίους αμπελώνες τους, ώριμο στη συγκομιδή, παλαιωμένο 16 μήνες σε βαρέλι.",
      tastingNotes: "Δομημένο, γεμάτο Αγιωργίτικο με επιρροές από την παλαίωση σε βαρέλι.",
      servingTemp: "16-18 °C",
      foodPairings: ["Κόκκινα κρέατα", "Μακαρονάδες με κιμά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: bairaktarisWine.id, varietyId: agiorgitiko.id } },
    update: { percentage: 100 },
    create: { wineId: bairaktarisWine.id, varietyId: agiorgitiko.id, percentage: 100 },
  });

  // ── Canava Chrissou Tselepos — Σαντορίνη ── πηγές: santorini.net, greeceandgrapes.com
  const canavaChrissou = await prisma.winery.upsert({
    where: { slug: "canava-chrissou-tselepos" },
    update: {},
    create: {
      slug: "canava-chrissou-tselepos",
      name: "Canava Chrissou – Tselepos",
      regionId: santorini.id,
      websiteUrl: "https://tselepos.gr",
      description:
        "Η επέκταση του Κτήματος Τσέλεπου (Μαντινεία) στη Σαντορίνη, σε συνεργασία με την οικογένεια Χρύσου. Εστιάζει στο Ασύρτικο από παλιά αμπέλια σε «πεζούλες» γύρω από τον Πύργο.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const nykteriWine = await prisma.wine.upsert({
    where: { slug: "canava-chrissou-nykteri" },
    update: {},
    create: {
      name: "Nykteri",
      slug: "canava-chrissou-nykteri",
      wineryId: canavaChrissou.id,
      regionId: santorini.id,
      vintage: 2021,
      abv: 14,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description:
        "Από πολύ παλιά αμπέλια Ασύρτικου στην περιοχή Πύργου, σε παραδοσιακές πεζούλες. Παλαίωση 6 μήνες σε βαρέλι. Το όνομα («νυχτέρι») αναφέρεται στη νυχτερινή εργασία τρύγου.",
      tastingNotes: "Χαρακτηριστική υψηλή οξύτητα και ορυκτικότητα που ισορροπούν την ώριμη φρουτικότητα.",
      servingTemp: "10-12 °C",
      foodPairings: ["Πλούσια θαλασσινά", "Ψητά ψάρια με σάλτσα"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: nykteriWine.id, varietyId: assyrtiko.id } },
    update: { percentage: 100 },
    create: { wineId: nykteriWine.id, varietyId: assyrtiko.id, percentage: 100 },
  });

  // ── Domaine Hatzimichalis — Φθιώτιδα (Αταλάντη) ── πηγές: winesofgreece.org, houseofwine.gr
  const hatzimichalis = await prisma.winery.upsert({
    where: { slug: "domaine-hatzimichalis" },
    update: {},
    create: {
      slug: "domaine-hatzimichalis",
      name: "Domaine Hatzimichalis",
      regionId: fthiotida.id,
      foundedYear: 1973,
      websiteUrl: "https://www.hatzimichalis.com",
      description:
        "Ιδρύθηκε το 1973 από τον Δημήτρη Χατζημιχάλη στην Αταλάντη Λοκρίδας, επιλεγμένη για το ιδιαίτερο μεσοκλίμα της ανάμεσα στον Παρνασσό και τη θάλασσα. Σήμερα ο ιδιόκτητος αμπελώνας εκτείνεται σε 220 εκτάρια, με ελληνικές και διεθνείς ποικιλίες.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const hatzimichalisWine = await prisma.wine.upsert({
    where: { slug: "ktima-chatzimichali-cabernet-sauvignon" },
    update: {},
    create: {
      name: "Κτήμα Χατζημιχάλη Cabernet Sauvignon",
      slug: "ktima-chatzimichali-cabernet-sauvignon",
      wineryId: hatzimichalis.id,
      regionId: fthiotida.id,
      vintage: 2022,
      abv: 13.5,
      color: WineColor.RED,
      style: WineStyle.DRY,
      description: "Γεμάτο, ξηρό ερυθρό με επιρροές γαλλικού βαρελιού, από την κοιλάδα της Αταλάντης.",
      tastingNotes: "Κυρίαρχες νότες φραγκοστάφυλου, βατόμουρου, μύρτιλου, μπαχαρικών και αρωματισμένου καπνού. Πλούσιο φρούτο, στρογγυλές τανίνες, επίμονη επίγευση.",
      servingTemp: "16-18 °C",
      foodPairings: ["Ψητά κρέατα", "Ώριμα σκληρά τυριά", "Μπάρμπεκιου"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: hatzimichalisWine.id, varietyId: cabernetSauvignon.id } },
    update: { percentage: 100 },
    create: { wineId: hatzimichalisWine.id, varietyId: cabernetSauvignon.id, percentage: 100 },
  });

  // ── Costa Lazaridi — Δράμα ── πηγές: greekgastronomyguide.gr, domaine-lazaridi.gr, oakcava.gr
  const lazaridi = await prisma.winery.upsert({
    where: { slug: "costa-lazaridi" },
    update: {},
    create: {
      slug: "costa-lazaridi",
      name: "Κτήμα Κώστα Λαζαρίδη",
      regionId: drama.id,
      foundedYear: 1992,
      websiteUrl: "https://www.domaine-lazaridi.gr",
      description:
        "Ξεκίνησε το 1979 ως μικρός αμπελώνας του Κωνσταντίνου Λαζαρίδη στην Αδριανή Δράμας· το 1992 ολοκληρώθηκε το σύγχρονο κτήμα και κυκλοφόρησαν τα πρώτα κρασιά της σειράς «Αμέθυστος». Σήμερα πάνω από 700 στρέμματα ιδιόκτητου αμπελώνα.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const amethystosWine = await prisma.wine.upsert({
    where: { slug: "amethystos-erythros" },
    update: {},
    create: {
      name: "Αμέθυστος Ερυθρός",
      slug: "amethystos-erythros",
      wineryId: lazaridi.id,
      regionId: drama.id,
      vintage: 2020,
      abv: 14.5,
      color: WineColor.RED,
      style: WineStyle.DRY,
      description: "Το εμβληματικό ερυθρό blend του κτήματος από το 1991 — Cabernet Sauvignon, Merlot και Αγιωργίτικο.",
      tastingNotes: "Πλούσιο, αρωματικό, με πυκνό σκούρο φρούτο, σοκολάτα, απαλό στόμα και ώριμες, σχεδόν βελούδινες τανίνες.",
      foodPairings: ["Ψητό αρνί", "Ψητά κρέατα"],
      status: ContentStatus.PUBLISHED,
    },
  });
  for (const [variety, percentage] of [
    [cabernetSauvignon, 70],
    [merlot, 20],
    [agiorgitiko, 10],
  ] as const) {
    await prisma.varietyOnWine.upsert({
      where: { wineId_varietyId: { wineId: amethystosWine.id, varietyId: variety.id } },
      update: { percentage },
      create: { wineId: amethystosWine.id, varietyId: variety.id, percentage },
    });
  }

  // ── Dalamaras — Νάουσα ── πηγές: winetradeinternational.com, forestwines.com
  const dalamaras = await prisma.winery.upsert({
    where: { slug: "dalamaras" },
    update: {},
    create: {
      slug: "dalamaras",
      name: "Κτήμα Δαλαμάρα",
      regionId: naoussa.id,
      description:
        "Οικογενειακός αμπελώνας από το 1840 — σήμερα ο Κωστής Δαλαμάρας (6η γενιά, σπούδασε οινολογία στο Beaune) συνεχίζει με τη σύζυγό του Μαρία. Βιολογική καλλιέργεια από το 1996, βιοδυναμική από το 2008, με ίδια ενέργεια από ηλιακά.",
      isOrganic: true,
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const dalamarasWine = await prisma.wine.upsert({
    where: { slug: "dalamara-naoussa-xinomavro" },
    update: {},
    create: {
      name: "Δαλαμάρα Νάουσα Ξινόμαυρο",
      slug: "dalamara-naoussa-xinomavro",
      wineryId: dalamaras.id,
      regionId: naoussa.id,
      vintage: 2022,
      abv: 13,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "Βιολογική/βιοδυναμική καλλιέργεια (μη πιστοποιημένη βιοδυναμική). Συχνά συγκρίνεται με Barolo για τη δομή του.",
      tastingNotes: "Αρωματικές νότες κόκκινων μούρων και τριαντάφυλλου, με γευστικά στοιχεία φύλλου ντομάτας και μαύρης ελιάς. Ζουμερό κόκκινο φρούτο, καλά ενσωματωμένες τανίνες, υψηλή οξύτητα.",
      foodPairings: ["Μουσακάς", "Ελιές", "Αρνί", "Κατσαρόλας", "Ψητά λαχανικά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: dalamarasWine.id, varietyId: xinomavro.id } },
    update: { percentage: 100 },
    create: { wineId: dalamarasWine.id, varietyId: xinomavro.id, percentage: 100 },
  });

  // ── Diamantakos — Νάουσα ── πηγές: winemakersofnorthgreece.gr, diamantakos.gr, merchantofwine.com
  const diamantakos = await prisma.winery.upsert({
    where: { slug: "diamantakos" },
    update: {},
    create: {
      slug: "diamantakos",
      name: "Κτήμα Διαμαντάκος",
      regionId: naoussa.id,
      foundedYear: 1978,
      websiteUrl: "https://diamantakos.gr",
      description:
        "Η γη αγοράστηκε το 1978 από τον Γιώργο Διαμαντάκο· ο γιος του Ευάγγελος εμφιάλωσε το πρώτο κρασί του κτήματος το 1998. Μικρό οικογενειακό οινοποιείο στην περιοχή Μαντέμι, στην καρδιά της ζώνης ΠΟΠ Νάουσας, με 3 γενιές αμπελουργών.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const diamantakosWine = await prisma.wine.upsert({
    where: { slug: "diamantakos-xinomavro" },
    update: {},
    create: {
      name: "Διαμαντάκος Ξινόμαυρο",
      slug: "diamantakos-xinomavro",
      wineryId: diamantakos.id,
      regionId: naoussa.id,
      vintage: 2020,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "100% Ξινόμαυρο από τη ζώνη Μαντέμι — 91 πόντοι από τον James Suckling.",
      tastingNotes:
        "Αποκαλύπτει το βάθος και την πολυπλοκότητα του terroir της Νάουσας — κεράσι, σμέουρο και κράνμπερι με βοτανικές νότες και επιρροή ξύλου. Λεπτόκκοκες τανίνες, μέτριο σώμα, επίμονη επίγευση. Προσιτό νεαρό, με μεγάλο δυναμικό παλαίωσης.",
      foodPairings: ["Ψητά κρέατα", "Παραδοσιακή ελληνική κουζίνα"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: diamantakosWine.id, varietyId: xinomavro.id } },
    update: { percentage: 100 },
    create: { wineId: diamantakosWine.id, varietyId: xinomavro.id, percentage: 100 },
  });

  console.log("Batch 1 done: 10 οινοποιεία, 3 νέες περιοχές, 1 νέα ποικιλία.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
