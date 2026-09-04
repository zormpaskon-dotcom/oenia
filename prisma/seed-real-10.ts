// Batch 8/9 από τη λίστα ~88 οινοποιείων. Ίδια δομή ανά κρασί με τα
// προηγούμενα batches — πηγές σε σχόλιο ανά εγγραφή.
//
// Batch 8: Patoinos Winery, Sarris Winery, Harlaftis Estate,
// Kontozisis Organic Vineyards, Kamara Pure Winery, Vourvoukeli
// Estate, Gavalas Winery, Koutsoyannopoulos Winery.
//
// Δύο εγγραφές της λίστας παραλείφθηκαν ως εσφαλμένα δεδομένα πηγής,
// όχι ως διπλότυπα:
//  - «Helioterra Wines / Δράμα» (helioterrawines.com) — το site είναι
//    πραγματικό, αλλά ανήκει σε οινοποιείο του Όρεγκον/Πόρτλαντ ΗΠΑ,
//    χωρίς καμία σχέση με την Ελλάδα ή τη Δράμα. Επαληθεύτηκε με
//    απευθείας fetch του site.
//  - «Vasilikon Winery / Εύβοια» (vasilikon.com) — το site είναι
//    πραγματικό, αλλά ανήκει σε οινοποιείο στην Κύπρο (Κάθηκας,
//    Πάφος), όχι στην Εύβοια. Δεν βρέθηκε καμία ελληνική «Βασιλικόν»
//    στην Εύβοια.
// Και οι δύο πιθανότατα λάθος/μπερδεμένα links στο αρχικό
// spreadsheet του χρήστη — άξιζε αναφοράς σε αυτόν, όχι σιωπηλή
// παράλειψη.
//
// Σημείωση για Harlaftis: το spreadsheet έγραφε περιοχή «Ηλεία», αλλά
// η επίσημη ιστορική σελίδα του οινοποιείου (harlaftis.gr) αναφέρει
// μόνο Στάμνα Αττικής (ίδρυση 1934) και Νεμέα Κορινθίας (αμπελώνας
// από το 1997) — καμία αναφορά σε Ηλεία. Καταχωρήθηκε στη Νεμέα, που
// υπάρχει ήδη ως περιοχή, βασισμένο στην πρωτογενή πηγή.

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
  const patmos = await ensureRegion(
    "patmos",
    "Πάτμος",
    MacroRegion.AEGEAN_ISLANDS,
    Appellation.PGI,
    "Ζώνη ΠΓΕ στο νησί της Αποκάλυψης, στα Δωδεκάνησα — αμπελουργία που είχε σβήσει από τον 17ο αιώνα και αναβιώνει τα τελευταία χρόνια."
  );
  const karditsa = await ensureRegion(
    "karditsa",
    "Καρδίτσα",
    MacroRegion.CENTRAL_GREECE,
    Appellation.PGI,
    "Ζώνη ΠΓΕ στη δυτική Θεσσαλία, στους πρόποδες των Αγράφων — ξεχωριστή από τη στενότερη ζώνη ΠΟΠ Μεσενικόλα, με έμφαση σε γηγενείς ποικιλίες όπως η Λημνιώνα."
  );

  const robolaKefallinias = await prisma.region.findUniqueOrThrow({ where: { slug: "robola-kefallinias" } });
  const nemea = await prisma.region.findUniqueOrThrow({ where: { slug: "nemea" } });
  const thessaloniki = await prisma.region.findUniqueOrThrow({ where: { slug: "thessaloniki" } });
  const avdira = await prisma.region.findUniqueOrThrow({ where: { slug: "avdira" } });
  const santorini = await prisma.region.findUniqueOrThrow({ where: { slug: "santorini" } });

  const assyrtiko = await prisma.variety.findUniqueOrThrow({ where: { name: "Ασύρτικο" } });
  const robola = await prisma.variety.findUniqueOrThrow({ where: { name: "Ρομπόλα" } });
  const cabernetSauvignon = await prisma.variety.findUniqueOrThrow({ where: { name: "Cabernet Sauvignon" } });
  const limniona = await prisma.variety.findUniqueOrThrow({ where: { name: "Λημνιώνα" } });

  console.log("Οινοποιεία + κρασιά…");

  // ── Patoinos (Domaine de l'Apocalypse) — Πάτμος ── πηγές: karakasis.mw, raisin.digital, iefimerida.gr
  const patoinos = await prisma.winery.upsert({
    where: { slug: "patoinos-winery" },
    update: {},
    create: {
      slug: "patoinos-winery",
      name: "Patoinos (Terre de l'Apocalypse)",
      regionId: patmos.id,
      foundedYear: 2011,
      websiteUrl: "https://gr.patoinos.ch",
      description:
        "Έργο αναβίωσης της αμπελουργίας στην Πάτμο, όπου υπήρχαν αμπελώνες ήδη από τον 17ο αιώνα. Ξεκίνησε το 2011 από τον Ελληνοελβετό πρώην βουλευτή Ιωσήφ Ζησιάδη, σε συνεργασία με τέσσερις Ελβετούς οινοποιούς από το Καντόνι Vaud — Raoul Cruchon, Noé Graff, Raymond Paccot και Gilles Wannaz. Περιλαμβάνει αμπελώνα 20 στρεμμάτων, ελαιώνα, τράπεζα σπόρων και σχολή οίνου, με βιοδυναμική καλλιέργεια υπό πιστοποίηση. Παράγει μόλις 5.000 φιάλες συνολικά.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const patoinosWine = await prisma.wine.upsert({
    where: { slug: "patoinos-assyrtiko" },
    update: {},
    create: {
      name: "Assyrtiko",
      slug: "patoinos-assyrtiko",
      wineryId: patoinos.id,
      regionId: patmos.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      description: "100% Ασύρτικο, αυθόρμητη ζύμωση με 24ωρη επαφή με τα στέμφυλα, παλαίωση περίπου 8 μήνες στις χοντρές οινολάσπες.",
      tastingNotes: "Μεσαίο χρυσό χρώμα, εξωτικό, ώριμο άρωμα με ξηρούς καρπούς, κρυσταλλωμένο βερίκοκο και νότα στρειδιού. Μέτριο σώμα, ζωηρό στόμα με ισορροπημένη ορυκτικότητα και φρούτο, μακρά επίγευση.",
      servingTemp: "10-12 °C",
      foodPairings: ["Θαλασσινά", "Ψάρια"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: patoinosWine.id, varietyId: assyrtiko.id } },
    update: { percentage: 100 },
    create: { wineId: patoinosWine.id, varietyId: assyrtiko.id, percentage: 100 },
  });

  // ── Sarris Winery — Σβορωνάτα, Κεφαλονιά ── πηγές: kefaloniawinemakers.gr, decanter.com, sarriswinery.com
  const sarris = await prisma.winery.upsert({
    where: { slug: "sarris-winery" },
    update: {},
    create: {
      slug: "sarris-winery",
      name: "Sarris Winery",
      regionId: robolaKefallinias.id,
      foundedYear: 2016,
      websiteUrl: "https://sarriswinery.com",
      description:
        "Ιδρύθηκε το 2016 από τον Πάνο Σαρρή, που κληρονόμησε το πάθος για το κρασί από την πολυετή εμπειρία του ως σομελιέ — 2ος στον εθνικό διαγωνισμό σομελιέ το 2007 και πιστοποιημένος από το Court of Master Sommeliers στο Λονδίνο. Το 2017 εγκαινίασε το κομψό οινοποιείο στα Σβορωνάτα, κοντά στην παραλία Αβίθος, 10χλμ από το Αργοστόλι.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const sarrisWine = await prisma.wine.upsert({
    where: { slug: "sarris-robola" },
    update: {},
    create: {
      name: "Robola of Kefalonia",
      slug: "sarris-robola",
      wineryId: sarris.id,
      regionId: robolaKefallinias.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "100% Ρομπόλα με αυθόρμητη ζύμωση 2 εβδομάδων και 6 μήνες παλαίωση στις λεπτές οινολάσπες.",
      tastingNotes: "Ανοιχτό λεμονί χρώμα, κομψά αρώματα αχλαδιού, πράσινου μήλου, λάιμ και φλούδας λεμονιού με νότες κανέλας. Έντονη, αναζωογονητική οξύτητα, λευκό φρούτο και ορυκτικότητα, στρογγυλό στόμα με τραγανή επίγευση.",
      servingTemp: "8-10 °C",
      foodPairings: ["Θαλασσινά", "Ζυμαρικά με θαλασσινά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: sarrisWine.id, varietyId: robola.id } },
    update: { percentage: 100 },
    create: { wineId: sarrisWine.id, varietyId: robola.id, percentage: 100 },
  });

  // ── Harlaftis (Château Harlaftis) — Στάμνα Αττικής (ίδρυση) / Νεμέα (αμπελώνας από 1997) ── πηγές: harlaftis.gr, wine-searcher.com
  const harlaftis = await prisma.winery.upsert({
    where: { slug: "harlaftis-estate" },
    update: {},
    create: {
      slug: "harlaftis-estate",
      name: "Château Harlaftis",
      regionId: nemea.id,
      foundedYear: 1934,
      websiteUrl: "https://www.harlaftis.gr",
      description:
        "Ιδρύθηκε το 1934 από τον Νίκο Αθανασιάδη, από τους σημαντικότερους εξαγωγείς σταφίδας της εποχής, στη Στάμνα Αττικής, στις βόρειες πλαγιές της Πεντέλης. Το 1938 ξεκίνησε η εμφιάλωση, με το «Athanassiadis Dry Rosé» (1962) από τα πρώτα εμφιαλωμένα ροζέ της Ελλάδας. Το 1997 η οικογένεια επέκτεινε τη δραστηριότητα με δεύτερο αμπελώνα στη Νεμέα Κορινθίας, σε ασβεστολιθικά εδάφη στα 350μ.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const harlaftisWine = await prisma.wine.upsert({
    where: { slug: "harlaftis-cabernet-sauvignon" },
    update: {},
    create: {
      name: "Château Harlaftis Cabernet Sauvignon",
      slug: "harlaftis-cabernet-sauvignon",
      wineryId: harlaftis.id,
      regionId: nemea.id,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      description: "100% Cabernet Sauvignon από 20ετείς πρέμνες στα ασβεστολιθικά εδάφη της Νεμέας. Παλαίωση 12 μήνες σε γαλλική δρυ 225L.",
      tastingNotes: "Βαθύ, πλούσιο πορφυρό χρώμα, μύτη με δαμάσκηνο, μαύρο πιπέρι, καβουρδισμένο αμύγδαλο και βανίλια. Ώριμο, στρογγυλό και πλούσιο στόμα με μακρά επίγευση, νότες κόκκινων μούρων, δέρματος και κακάο.",
      servingTemp: "16-18 °C",
      foodPairings: ["Κόκκινα κρέατα", "Ώριμα τυριά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: harlaftisWine.id, varietyId: cabernetSauvignon.id } },
    update: { percentage: 100 },
    create: { wineId: harlaftisWine.id, varietyId: cabernetSauvignon.id, percentage: 100 },
  });

  // ── Kontozisis Organic Vineyards — Καρδίτσα ── πηγές: karakasis.mw, jancisrobinson.com, thegrapereset.com
  const kontozisis = await prisma.winery.upsert({
    where: { slug: "kontozisis-organic-vineyards" },
    update: {},
    create: {
      slug: "kontozisis-organic-vineyards",
      name: "Kontozisis Organic Vineyards",
      regionId: karditsa.id,
      foundedYear: 1991,
      websiteUrl: "https://kontozisiswines.com",
      description:
        "Ο Ανδρέας Κοντοζήσης, με τον πατέρα και τον αδερφό του, ίδρυσε το κτήμα το 1991 στους πρόποδες των Αγράφων στην Καρδίτσα, αρχικά για να τροφοδοτεί το οικογενειακό εστιατόριο, φυτεύοντας, αναβιώνοντας και ανακαλύπτοντας πάνω από εκατό μικρά, εγκαταλελειμμένα χωράφια. Από τους πρώτους στην Ελλάδα που πιστοποιήθηκαν βιολογικοί, καλλιεργεί σήμερα 11 εκτάρια βιολογικά και βιοδυναμικά, με έμφαση στη σπάνια γηγενή Λημνιώνα.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const kontozisisWine = await prisma.wine.upsert({
    where: { slug: "kontozisis-a-grafo-limniona-ancestral" },
    update: {},
    create: {
      name: "A-Grafo Limniona Ancestral",
      slug: "kontozisis-a-grafo-limniona-ancestral",
      wineryId: kontozisis.id,
      regionId: karditsa.id,
      abv: 12.5,
      isSparkling: true,
      color: WineColor.ROSE,
      style: WineStyle.DRY,
      description: "100% Λημνιώνα βιολογικής καλλιέργειας, pet-nat με τη μέθοδο ancestral — 15 ώρες επαφή με τα στέμφυλα, ζύμωση που ολοκληρώνεται στη φιάλη, 18 μήνες παλαίωση με χειροποίητο dégorgement, χωρίς θειώδη.",
      tastingNotes: "Λαμπερό, καθαρό χρώμα κερασιού με ψιλές, τακτοποιημένες φυσαλίδες. Κομψή, ανθισμένη μύτη Λημνιώνα με απροσδόκητες νότες βοτανικού τσαγιού. Απαλή αρχή στο στόμα που συνεχίζει με ζωντάνια και καταλήγει σε μακρά, «κρεατώδη» επίγευση.",
      servingTemp: "8-10 °C",
      foodPairings: ["Ελαφριά ορεκτικά", "Πιάτα με βότανα"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: kontozisisWine.id, varietyId: limniona.id } },
    update: { percentage: 100 },
    create: { wineId: kontozisisWine.id, varietyId: limniona.id, percentage: 100 },
  });

  // ── Kamara Pure Winery — Θεσσαλονίκη ── πηγές: therealwinefair.com, morenaturalwine.com, kamarawinery.com
  const kamara = await prisma.winery.upsert({
    where: { slug: "kamara-pure-winery" },
    update: {},
    create: {
      slug: "kamara-pure-winery",
      name: "Kamara Pure Winery",
      regionId: thessaloniki.id,
      foundedYear: 2010,
      websiteUrl: "https://www.kamarawinery.com",
      description:
        "Η οικογένεια Κιουτσούκη μετανάστευσε από την Ανατολική Ρωμυλία στις αρχές του 1900, κουβαλώντας τη γνώση και το πάθος για το κρασί. Το όνειρο έγινε πραγματικότητα μόλις το 2010, όταν ο εγγονός Δημήτρης Κιουτσούκης — χημικός μηχανικός με σπουδές οινολογίας μέσω του UC Davis — φύτεψε 11 εκτάρια ελληνικών ποικιλιών κοντά στη Θεσσαλονίκη, βασισμένος σε αρχές permaculture και ελάχιστη παρέμβαση.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const kamaraWine = await prisma.wine.upsert({
    where: { slug: "kamara-pure-shadow-play-white" },
    update: {},
    create: {
      name: "Shadow Play White",
      slug: "kamara-pure-shadow-play-white",
      wineryId: kamara.id,
      regionId: thessaloniki.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      description: "100% Ασύρτικο, φυσική ζύμωση με ενδογενείς ζύμες, χωρίς προσθήκη οινολογικών ουσιών, εμφιάλωση χωρίς φιλτράρισμα και χωρίς προστιθέμενα θειώδη.",
      tastingNotes: "Λαμπερό χρυσό χρώμα, αρώματα αχλαδιού και κυδωνιού που δίνουν τη θέση τους σε φασκόμηλο, αχιλλέα και δάφνη. Αρμονικό στόμα με επίμονη επίγευση, ελαφρώς αγροτική, «άγρια» υφή.",
      servingTemp: "10-12 °C",
      foodPairings: ["Θαλασσινά", "Ελαφριά ορεκτικά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: kamaraWine.id, varietyId: assyrtiko.id } },
    update: { percentage: 100 },
    create: { wineId: kamaraWine.id, varietyId: assyrtiko.id, percentage: 100 },
  });

  // ── Vourvoukeli Estate — Άβδηρα Ξάνθης ── πηγές: vourvoukeli.gr, greeceandgrapes.com, houseofwine.gr
  const vourvoukeli = await prisma.winery.upsert({
    where: { slug: "vourvoukeli-estate" },
    update: {},
    create: {
      slug: "vourvoukeli-estate",
      name: "Κτήμα Βουρβουκέλη",
      regionId: avdira.id,
      foundedYear: 1999,
      websiteUrl: "https://vourvoukeli.gr",
      description:
        "Ιδρύθηκε το 1999 από τον Νίκο και τη Φλώρα Βουρβουκέλη στα Άβδηρα Ξάνθης — ο Νίκος, γιατρός στο επάγγελμα, μεγάλωσε ανάμεσα σε αμπέλια και ήθελε να ασχοληθεί με την αμπελουργία πέρα από τη δουλειά του. Με όραμα την αναβίωση του φημισμένου αμπελώνα των αρχαίων Αβδήρων, φύτεψαν αρχικά 2 στρέμματα που έγιναν σήμερα 12 εκτάρια, βιολογικής καλλιέργειας. Σήμερα το κτήμα διευθύνουν οι γιοι Γιώργος και Οδυσσέας, με σπουδές οινολογίας.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const vourvoukeliWine = await prisma.wine.upsert({
    where: { slug: "vourvoukeli-assyrtiko" },
    update: {},
    create: {
      name: "Ασύρτικο",
      slug: "vourvoukeli-assyrtiko",
      wineryId: vourvoukeli.id,
      regionId: avdira.id,
      abv: 13,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      description: "100% Ασύρτικο βιολογικής καλλιέργειας από τα Άβδηρα — έκφραση της ποικιλίας έξω από την ηφαιστειακή γη, με 4μηνη παραμονή σε ανοξείδωτο.",
      tastingNotes: "Ανοιχτόχρυσο χρώμα. Βασιλικός, λεμονόχορτο και σπαράγγι στη μύτη μαζί με λευκά άνθη, ακολουθούμενα από πλούσια αρώματα τροπικού φρούτου, ανανά, γκουάβας, πράσινου φραγκοστάφυλου και ώριμων εσπεριδοειδών. Ξηρό στόμα με υψηλή οξύτητα και γεμάτο σώμα, μακρά επίγευση.",
      servingTemp: "8-10 °C",
      foodPairings: ["Θαλασσινά", "Ψάρια σχάρας"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: vourvoukeliWine.id, varietyId: assyrtiko.id } },
    update: { percentage: 100 },
    create: { wineId: vourvoukeliWine.id, varietyId: assyrtiko.id, percentage: 100 },
  });

  // ── Gavalas Winery — Μεγαλοχώρι, Σαντορίνη ── πηγές: gavalaswines.gr, wandercurtis.com, rrselections.com
  const gavalas = await prisma.winery.upsert({
    where: { slug: "gavalas-winery" },
    update: {},
    create: {
      slug: "gavalas-winery",
      name: "Gavalas Winery",
      regionId: santorini.id,
      foundedYear: 1895,
      websiteUrl: "https://www.gavalaswines.gr",
      description:
        "Ένα από τα παλαιότερα οινοποιεία των Κυκλάδων, ιδρύθηκε το 1895 στο παραδοσιακό Μεγαλοχώρι της Σαντορίνης. Η οικογένεια Γαβαλά οινοποιεί τις γηγενείς ποικιλίες του νησιού εδώ και 5 γενιές — σήμερα ο Γιώργος Γαβαλάς είναι η 4η γενιά και ο γιος του Βαγγέλης η 5η. Το πέτρινο κτίριο ήταν παλιά κάναβα-πατητήρι και διατηρεί ακέραιους τους αρχικούς χώρους: κελάρια, πατητήρια, παλιές εισόδους.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const gavalasWine = await prisma.wine.upsert({
    where: { slug: "gavalas-santorini-assyrtiko" },
    update: {},
    create: {
      name: "Santorini",
      slug: "gavalas-santorini-assyrtiko",
      wineryId: gavalas.id,
      regionId: santorini.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "100% Ασύρτικο από πρέμνες άνω των 50 ετών στο Μεγαλοχώρι, στο Ακρωτήρι και στον Πύργο. Χειρωδιαλογή, ψυχρή εκχύλιση 4-8 ωρών, φυσική ζύμωση με ιθαγενείς ζύμες επί 2 μήνες, παραμονή στις λάσπες 6-8 μήνες.",
      tastingNotes: "Αρώματα εσπεριδοειδών, λεμονιού, αχλαδιού και ροδάκινου, μαζί με τη χαρακτηριστική αλμύρα και ορυκτικότητα του Ασύρτικου. Γεμάτο σώμα με υψηλή οξύτητα και μακρά επίγευση.",
      servingTemp: "8-10 °C",
      foodPairings: ["Θαλασσινά", "Ψάρια"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: gavalasWine.id, varietyId: assyrtiko.id } },
    update: { percentage: 100 },
    create: { wineId: gavalasWine.id, varietyId: assyrtiko.id, percentage: 100 },
  });

  // ── Koutsoyannopoulos Winery & Museum — Βοθώνας, Σαντορίνη ── πηγές: santorinidave.com, kwm.gr, sommselect.com
  const koutsoyannopoulos = await prisma.winery.upsert({
    where: { slug: "koutsoyannopoulos-winery" },
    update: {},
    create: {
      slug: "koutsoyannopoulos-winery",
      name: "Koutsoyannopoulos Winery & Museum",
      regionId: santorini.id,
      foundedYear: 1870,
      websiteUrl: "https://kwm.gr",
      description:
        "Η οικογένεια Κουτσογιαννόπουλου, με ρίζες από τις Μολάους Λακωνίας, οινοποιεί κρασιά της Σαντορίνης από το 1870 — σήμερα η 5η γενιά, με τον Γρηγόρη Κουτσογιαννόπουλο. Το ιστορικό οινοποιείο συνοδεύεται από υπόγειο μουσείο κρασιού 300 μέτρων, αποτέλεσμα 21 χρόνων εργασίας, που αφηγείται την ιστορία του σαντορινιού αμπελουργού από το 1660 έως το 1970. Ο ιδιόκτητος αμπελώνας βρίσκεται στον Εξω Γιαλό, στην ανατολική πλευρά του νησιού.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const koutsoyannopoulosWine = await prisma.wine.upsert({
    where: { slug: "koutsoyannopoulos-santorini-assyrtiko" },
    update: {},
    create: {
      name: "Santorini Assyrtiko",
      slug: "koutsoyannopoulos-santorini-assyrtiko",
      wineryId: koutsoyannopoulos.id,
      regionId: santorini.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "100% Ασύρτικο από τον οικογενειακό αμπελώνα στον Εξω Γιαλό.",
      tastingNotes: "Έντονη μεσογειακή ταυτότητα με ηφαιστειακό βράχο, θαλασσινό αφρό, τσακμακόπετρα και θρυμματισμένα κοχύλια. Άνθη εσπεριδοειδών ξεδιπλώνονται καθώς ανοίγει, ακολουθούμενα από πράσινο και κίτρινο μήλο, αγιόκλημα, μαγιά και μια νότα γκρέιπφρουτ. Φρέσκα αρώματα εσπεριδοειδών και λευκών ανθέων, ορυκτικότητα και ζωηρή οξύτητα.",
      servingTemp: "8-10 °C",
      foodPairings: ["Θαλασσινά", "Ψάρια σχάρας"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: koutsoyannopoulosWine.id, varietyId: assyrtiko.id } },
    update: { percentage: 100 },
    create: { wineId: koutsoyannopoulosWine.id, varietyId: assyrtiko.id, percentage: 100 },
  });

  console.log("Batch 8 done: 8 οινοποιεία (2 εσφαλμένες εγγραφές παραλείφθηκαν), 8 κρασιά, 2 νέες περιοχές, καμία νέα ποικιλία.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
