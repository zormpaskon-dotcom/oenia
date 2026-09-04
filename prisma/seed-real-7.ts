// Batch 5/9 από τη λίστα ~88 οινοποιείων. Ίδια δομή ανά κρασί με τα
// προηγούμενα batches — πηγές σε σχόλιο ανά εγγραφή.
//
// Batch 5: Oenops Wines, Papaioannou Estate, Papagiannakos Winery,
// Petrakopoulos Wines, Pnevmatikakis Winery, Porto Carras, Rouvalis
// Winery, Sclavos Wines, Semeli Estate, Sigalas Winery.

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
  const chalkidiki = await ensureRegion(
    "chalkidiki",
    "Χαλκιδική",
    MacroRegion.NORTHERN_GREECE,
    Appellation.PDO,
    "Ζώνη ΠΟΠ «Πλαγιές Μελίτωνα» στη χερσόνησο της Σιθωνίας — ο μεγαλύτερος ενιαίος αμπελώνας βιολογικής καλλιέργειας στην Ελλάδα, φυτεμένος από το 1965 υπό την καθοδήγηση του καθηγητή Émile Peynaud."
  );

  const drama = await prisma.region.findUniqueOrThrow({ where: { slug: "drama" } });
  const nemea = await prisma.region.findUniqueOrThrow({ where: { slug: "nemea" } });
  const attiki = await prisma.region.findUniqueOrThrow({ where: { slug: "attiki" } });
  const robolaKefallinias = await prisma.region.findUniqueOrThrow({ where: { slug: "robola-kefallinias" } });
  const chania = await prisma.region.findUniqueOrThrow({ where: { slug: "chania" } });
  const patra = await prisma.region.findUniqueOrThrow({ where: { slug: "patra" } });
  const santorini = await prisma.region.findUniqueOrThrow({ where: { slug: "santorini" } });

  const malagousia = await prisma.variety.findUniqueOrThrow({ where: { name: "Μαλαγουζιά" } });
  const assyrtiko = await prisma.variety.findUniqueOrThrow({ where: { name: "Ασύρτικο" } });
  const roditis = await prisma.variety.findUniqueOrThrow({ where: { name: "Ροδίτης" } });
  const agiorgitiko = await prisma.variety.findUniqueOrThrow({ where: { name: "Αγιωργίτικο" } });
  const savatiano = await prisma.variety.findUniqueOrThrow({ where: { name: "Σαββατιανό" } });
  const robola = await prisma.variety.findUniqueOrThrow({ where: { name: "Ρομπόλα" } });
  const vilana = await prisma.variety.findUniqueOrThrow({ where: { name: "Βηλάνα" } });
  const athiri = await prisma.variety.findUniqueOrThrow({ where: { name: "Αθήρι" } });

  console.log("Οινοποιεία + κρασιά…");

  // ── Oenops Wines — Δράμα (négociant, συνεργασία με ~15 αμπελουργούς από Έβρο έως Αμύνταιο) ── πηγές: voria.gr, decanter.com, jancisrobinson.com
  const oenops = await prisma.winery.upsert({
    where: { slug: "oenops-wines" },
    update: {},
    create: {
      slug: "oenops-wines",
      name: "Oenops Wines",
      regionId: drama.id,
      foundedYear: 2015,
      websiteUrl: "https://oenopswines.gr",
      description:
        "Ιδρύθηκε στα τέλη του 2015 από τον οινοποιό Νίκο Καρατζά, με έδρα από το 2016 λίγο έξω από την Προσοτσάνη Δράμας. Καινοτόμο για τα ελληνικά δεδομένα εγχείρημα négociant: δεν διαθέτει δικά του αμπέλια, αλλά συνεργάζεται με περίπου 15 αμπελουργούς επιλεγμένους με αυστηρά κριτήρια, από τον Έβρο μέχρι το Αμύνταιο.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const oenopsWine = await prisma.wine.upsert({
    where: { slug: "oenops-apla-white" },
    update: {},
    create: {
      name: "Apla White",
      slug: "oenops-apla-white",
      wineryId: oenops.id,
      regionId: drama.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      description: "Blend 60% Μαλαγουζιά, 30% Ασύρτικο και 10% 45ετών Ροδίτη από τρία διαφορετικά σημεία της Ελλάδας. Παλαίωση μόλις 3 μήνες σε δεξαμενή ή αμφορέα, στις λάσπες.",
      tastingNotes: "Ανθισμένο, καλά ισορροπημένο, χωρίς κανένα συστατικό να κυριαρχεί — η Μαλαγουζιά δίνει άρωμα, ο Ροδίτης υφή, το Ασύρτικο οξύτητα και ορυκτικότητα. Νότες φλούδας λάιμ, αρκεύθου, ασιατικού αχλαδιού και θυμαριού, μέτριο σώμα, ελαφρά αλμυρό και αναζωογονητικό.",
      servingTemp: "8-10 °C",
      foodPairings: ["Ελαφριά ορεκτικά", "Θαλασσινά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  for (const [variety, percentage] of [
    [malagousia, 60],
    [roditis, 10],
    [assyrtiko, 30],
  ] as const) {
    await prisma.varietyOnWine.upsert({
      where: { wineId_varietyId: { wineId: oenopsWine.id, varietyId: variety.id } },
      update: { percentage },
      create: { wineId: oenopsWine.id, varietyId: variety.id, percentage },
    });
  }

  // ── Papaioannou Estate — Νεμέα ── πηγές: winesofgreece.org, wein.plus, cellartracker.com
  const papaioannou = await prisma.winery.upsert({
    where: { slug: "papaioannou-estate" },
    update: {},
    create: {
      slug: "papaioannou-estate",
      name: "Estate Papaioannou",
      regionId: nemea.id,
      foundedYear: 1876,
      description:
        "Οικογενειακές ρίζες στη Νεμέα από το 1876, με τον παππού του σημερινού ιδιοκτήτη. Το σύγχρονο κτήμα χτίστηκε στη δεκαετία του '50 από τον Θανάση Παπαϊωάννου, που το 1988 κυκλοφόρησε την ετικέτα που άνοιξε τον δρόμο για τη Νεμέα και το Αγιωργίτικο σε κάθε Έλληνα οινόφιλο. Βιολογική καλλιέργεια από το 2004, σε 55 εκτάρια αμπελώνα με 80% Αγιωργίτικο.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const papaioannouWine = await prisma.wine.upsert({
    where: { slug: "papaioannou-palea-klimata" },
    update: {},
    create: {
      name: "Palea Klimata",
      slug: "papaioannou-palea-klimata",
      wineryId: papaioannou.id,
      regionId: nemea.id,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "100% Αγιωργίτικο από 45ετείς πρέμνες — η ετικέτα «Παλιά Κλήματα» που άνοιξε τον δρόμο για τα ελληνικά κρασιά μεγάλης παλαίωσης από τη Νεμέα.",
      tastingNotes: "Πυκνά, συμπυκνωμένα αρώματα κόκκινων φρούτων εμπλουτισμένα με μπαχαρικά όπως μοσχοκάρυδο και πιπέρι, νότες μαύρου βατόμουρου, δαμάσκηνου και βανίλιας. Στιβαρές, στεγνές τανίνες, οξεία οξύτητα, μακρά επίγευση με ζουμερό, βαθύ φρούτο.",
      servingTemp: "16-18 °C",
      foodPairings: ["Κόκκινα κρέατα", "Ώριμα τυριά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: papaioannouWine.id, varietyId: agiorgitiko.id } },
    update: { percentage: 100 },
    create: { wineId: papaioannouWine.id, varietyId: agiorgitiko.id, percentage: 100 },
  });

  // ── Papagiannakos Winery — Μαρκόπουλο, Αττική ── πηγές: papagiannakos.gr, houseofwine.gr, cookout.skai.gr
  const papagiannakos = await prisma.winery.upsert({
    where: { slug: "papagiannakos-winery" },
    update: {},
    create: {
      slug: "papagiannakos-winery",
      name: "Οινοποιείο Παπαγιαννάκος",
      regionId: attiki.id,
      foundedYear: 1919,
      websiteUrl: "https://papagiannakos.gr",
      description:
        "Η ιστορία της οικογένειας ξεκινά το 1919, όταν ο παππούς Παπαγιαννάκος γέμισε το πρώτο βαρέλι στο Μαρκόπουλο Μεσογείων. Σήμερα την 3η γενιά ηγείται ο Βασίλης Παπαγιαννάκος, ο «πατριάρχης» του Σαββατιανού της Αττικής, στο πρώτο βιοκλιματικό οινοποιείο της Ελλάδας.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const papagiannakosWine = await prisma.wine.upsert({
    where: { slug: "papagiannakos-savatiano-old-vines" },
    update: {},
    create: {
      name: "Savatiano Old Vines",
      slug: "papagiannakos-savatiano-old-vines",
      wineryId: papagiannakos.id,
      regionId: attiki.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      description: "100% Σαββατιανό από παλιές πρέμνες του Μαρκόπουλου — από τα πρώτα εμφιαλωμένα Σαββατιανό της Αττικής.",
      tastingNotes: "Λαμπερό χρυσό χρώμα. Σύνθετη, ελαφρά αλμυρή μύτη με νότες εσπεριδοειδών και κίτρινου ροδάκινου, λευκά άνθη, δάφνη και μια πινελιά λευκού πιπεριού. Στρογγυλό, υφασμένο στόμα με ώριμο φρούτο, τραγανή αλμυρή επίγευση, μέτρια οξύτητα και μακρά, ευχάριστη γεύση.",
      servingTemp: "8-10 °C",
      foodPairings: ["Θαλασσινά", "Ελαφριά ορεκτικά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: papagiannakosWine.id, varietyId: savatiano.id } },
    update: { percentage: 100 },
    create: { wineId: papagiannakosWine.id, varietyId: savatiano.id, percentage: 100 },
  });

  // ── Petrakopoulos Wines — Θηραμώνας, Κεφαλονιά ── πηγές: petrakopouloswines.gr, fnl-guide.com, botilia.gr
  const petrakopoulos = await prisma.winery.upsert({
    where: { slug: "petrakopoulos-wines" },
    update: {},
    create: {
      slug: "petrakopoulos-wines",
      name: "Petrakopoulos Wines",
      regionId: robolaKefallinias.id,
      description:
        "Στο μικρό χωριό Θηραμώνας, στη νότια Κεφαλονιά, τα αδέρφια Νίκος και Παναγής Πετρακόπουλος συνεχίζουν αιωνόβια οικογενειακή παράδοση ως απόγονοι των οικογενειών Μελισσηνών και Σολωμών, που κατέφυγαν στην Κεφαλονιά γύρω στο 1500 μ.Χ. μετά την Άλωση της Κωνσταντινούπολης. Εστιάζουν σε σπάνιες τοπικές ποικιλίες — Ρομπόλα, Μαυροδάφνη, Ζακυνθινό — με βιολογικές, χειροποίητες μεθόδους.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const petrakopoulosWine = await prisma.wine.upsert({
    where: { slug: "petrakopoulos-robola-bio" },
    update: {},
    create: {
      name: "Robola Bio",
      slug: "petrakopoulos-robola-bio",
      wineryId: petrakopoulos.id,
      regionId: robolaKefallinias.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "100% Ρομπόλα βιολογικής καλλιέργειας από τους ορεινούς αμπελώνες της Κεφαλονιάς, στην ιστορική ζώνη ΠΟΠ γύρω στα 500-800μ.",
      tastingNotes: "Ξηρό, μέτριο σώμα με χαρακτηριστική νότα λεμονιού και πυριτική, τσακμακόπετρα υφή. Φρέσκια οξύτητα και καθαρό, ορυκτικό τελείωμα.",
      servingTemp: "8-10 °C",
      foodPairings: ["Θαλασσινά", "Ψάρια"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: petrakopoulosWine.id, varietyId: robola.id } },
    update: { percentage: 100 },
    create: { wineId: petrakopoulosWine.id, varietyId: robola.id, percentage: 100 },
  });

  // ── Pnevmatikakis Winery — Δραπανιάς, Κίσσαμος Χανίων ── πηγές: winesofcrete.gr, pnevmatikakiswinery.gr
  const pnevmatikakis = await prisma.winery.upsert({
    where: { slug: "pnevmatikakis-winery" },
    update: {},
    create: {
      slug: "pnevmatikakis-winery",
      name: "Pnevmatikakis Winery",
      regionId: chania.id,
      foundedYear: 2007,
      websiteUrl: "https://pnevmatikakiswinery.gr",
      description:
        "Οικογενειακή αμπελουργική παράδοση στην Κίσσαμο που ξεκινά γενιές πριν, με πρώτο οινοποιείο στην Ποταμιδά Κισσάμου. Το 2007 τα αδέρφια Μιχάλης και Αντώνης Πνευματικάκης έχτισαν το σύγχρονο οινοποιείο στη Δραπανιά, με πέτρινο κελάρι και μουσείο κρασιού με θέα στον κόλπο Κισσάμου.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const pnevmatikakisWine = await prisma.wine.upsert({
    where: { slug: "pnevmatikakis-protolaktis-vilana" },
    update: {},
    create: {
      name: "Πρωτόλαχτις Βηλάνα",
      slug: "pnevmatikakis-protolaktis-vilana",
      wineryId: pnevmatikakis.id,
      regionId: chania.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      description: "100% Βηλάνα — η πλέον διαδεδομένη λευκή ποικιλία της Κρήτης, δύσκολη στην καλλιέργεια, εδώ σε ξηρή εκδοχή από τους αμπελώνες της Κισσάμου.",
      tastingNotes: "Ανοιχτό, λεπτό στιλ με νότες λευκών λουλουδιών και εσπεριδοειδών, δροσερή οξύτητα και ελαφρύ σώμα — χαρακτηριστικό της ποικιλίας.",
      servingTemp: "8-10 °C",
      foodPairings: ["Ελαφριά ορεκτικά", "Σαλάτες"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: pnevmatikakisWine.id, varietyId: vilana.id } },
    update: { percentage: 100 },
    create: { wineId: pnevmatikakisWine.id, varietyId: vilana.id, percentage: 100 },
  });

  // ── Porto Carras — Σιθωνία, Χαλκιδική ── πηγές: winesofgreece.org, wikipedia.org, wineenthusiast.com
  const portoCarras = await prisma.winery.upsert({
    where: { slug: "domaine-porto-carras" },
    update: {},
    create: {
      slug: "domaine-porto-carras",
      name: "Domaine Porto Carras",
      regionId: chalkidiki.id,
      foundedYear: 1965,
      websiteUrl: "https://www.portocarras.com",
      description:
        "Το όραμα του Έλληνα εφοπλιστή Ιωάννη Καρρά, που ανακάλυψε έναν παρθένο κόλπο στη Χαλκιδική σε ταξίδι το 1963. Οι πρώτες φυτεύσεις αμπελιών ξεκίνησαν στις αρχές του 1965, υπό την καθοδήγηση του καθηγητή Émile Peynaud του Πανεπιστημίου του Μπορντό. Ο αμπελώνας απλώνεται αμφιθεατρικά σε 475 εκτάρια στη δυτική Σιθωνία — ο μεγαλύτερος ενιαίος βιολογικός αμπελώνας στην Ελλάδα.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const portoCarrasWine = await prisma.wine.upsert({
    where: { slug: "porto-carras-melissanthi" },
    update: {},
    create: {
      name: "Melissanthi",
      slug: "porto-carras-melissanthi",
      wineryId: portoCarras.id,
      regionId: chalkidiki.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "Blend Ασύρτικου και Αθήρι από τον αμπελώνα της Σιθωνίας — ζώνη ΠΟΠ Πλαγιές Μελίτωνα.",
      tastingNotes: "Καλή οξύτητα, τραγανό αλλά ισορροπημένο στόμα, αρώματα λεμονιού και τροπικών φρούτων, ροδάκινο και απαλή ορυκτικότητα.",
      servingTemp: "8-10 °C",
      foodPairings: ["Θαλασσινά", "Λευκά κρέατα"],
      status: ContentStatus.PUBLISHED,
    },
  });
  for (const variety of [assyrtiko, athiri]) {
    await prisma.varietyOnWine.upsert({
      where: { wineId_varietyId: { wineId: portoCarrasWine.id, varietyId: variety.id } },
      update: {},
      create: { wineId: portoCarrasWine.id, varietyId: variety.id, percentage: null },
    });
  }

  // ── Rouvalis Winery — Αιγιαλεία, Αχαΐα ── πηγές: rouvaliswinery.gr, wineanorak.com
  const rouvalis = await prisma.winery.upsert({
    where: { slug: "rouvalis-winery" },
    update: {},
    create: {
      slug: "rouvalis-winery",
      name: "Rouvalis Winery",
      regionId: patra.id,
      foundedYear: 1990,
      websiteUrl: "https://www.rouvaliswinery.gr",
      description:
        "Ιδρύθηκε το 1990 στην Αιγιαλεία από τον οινολόγο Άγγελο Ρούβαλη, απόφοιτο του Μπορντό με βαθιές οικογενειακές ρίζες στην αμπελουργία του Αιγίου. Το 1994 τέθηκε σε λειτουργία το πρότυπο οινοποιείο βαρύτητας, χτισμένο σε βράχο σε 6 επίπεδα. Από το 2017 τη διεύθυνση έχει η Θεοδώρα Ρούβαλη μαζί με τον Ισπανό σύντροφό της Antonio Ruiz Pañego, και οι δύο οινολόγοι.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const rouvalisWine = await prisma.wine.upsert({
    where: { slug: "rouvalis-asprolithi" },
    update: {},
    create: {
      name: "Asprolithi",
      slug: "rouvalis-asprolithi",
      wineryId: rouvalis.id,
      regionId: patra.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "100% Ροδίτης βιολογικής καλλιέργειας από τις πλαγιές της Αιγιαλείας, στα 840-1100μ — η ετικέτα που άνοιξε νέα εποχή για το ελληνικό κρασί όταν πρωτοκυκλοφόρησε το 1991.",
      tastingNotes: "Λεπτά αρώματα φρούτων περιβολιού, κυδωνιού και εσπεριδοειδών, με κυρίαρχο το φρέσκο λεμόνι, νότες πράσινου μήλου, φρέσκου ροδάκινου και λευκών ανθέων. Ελαφρύ, ζωηρό στόμα με ορυκτικότητα, σφιχτό και γραμμικό, με νότες μπαχαρικού και βανίλιας στο μακρύ τελείωμα.",
      servingTemp: "8-10 °C",
      foodPairings: ["Θαλασσινά", "Ψάρια"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: rouvalisWine.id, varietyId: roditis.id } },
    update: { percentage: 100 },
    create: { wineId: rouvalisWine.id, varietyId: roditis.id, percentage: 100 },
  });

  // ── Sclavos Wines — Λιξούρι, Κεφαλονιά ── πηγές: wineanorak.com, therealwinefair.com, kefaloniawinemakers.gr
  const sclavos = await prisma.winery.upsert({
    where: { slug: "sclavos-wines" },
    update: {},
    create: {
      slug: "sclavos-wines",
      name: "Sclavos Wines",
      regionId: robolaKefallinias.id,
      foundedYear: 1996,
      websiteUrl: "https://sclavoswines.gr",
      description:
        "Η οικογένεια Σκλάβου έχει ρίζες αιώνων στην Κεφαλονιά· ένας κλάδος μετανάστευσε το 1700 στην Οδησσό, όπου διατηρούσε μεγάλο οινοποιείο. Το 1919, μετά τη ρωσική επανάσταση, ο παππούς επέστρεψε στην πατρική γη στο Παλική και φύτεψε Μαυροδάφνη και Βοστιλίδι. Το σύγχρονο οινοποιείο ιδρύθηκε το 1996 από τον Ευριβιάδη Σκλάβο, γεωπόνο και τρίτης γενιάς αμπελουργό, πρωτοπόρο της βιοδυναμικής καλλιέργειας στην Ελλάδα — ελάχιστη παρέμβαση, αυθόρμητες ζυμώσεις, ελάχιστα ή καθόλου θειώδη.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const sclavosWine = await prisma.wine.upsert({
    where: { slug: "sclavos-vino-di-sasso" },
    update: {},
    create: {
      name: "Vino di Sasso",
      slug: "sclavos-vino-di-sasso",
      wineryId: sclavos.id,
      regionId: robolaKefallinias.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      description: "100% Ρομπόλα βιοδυναμικής καλλιέργειας από 30ετείς πρέμνες στην ορεινή ζώνη νότια της Κεφαλονιάς — «κρασί της πέτρας», όπως δηλώνει το όνομά του.",
      tastingNotes: "Καθαρό, πετρώδες, ορυκτικό άρωμα με νότες φρέσκου αχλαδιού και εσπεριδοειδών. Εντελώς ξηρό, ελαφρά αλμυρό στο στόμα, ζωηρή, στοματοπλυντική φρεσκάδα, μακρύ και σφιχτό τελείωμα.",
      servingTemp: "8-10 °C",
      foodPairings: ["Θαλασσινά", "Ψάρια"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: sclavosWine.id, varietyId: robola.id } },
    update: { percentage: 100 },
    create: { wineId: sclavosWine.id, varietyId: robola.id, percentage: 100 },
  });

  // ── Semeli Estate — Κούτσι, Νεμέα (ιδρύθηκε στη Σταμάτα Αττικής) ── πηγές: protagon.gr, semeliestate.gr, jancisrobinson.com
  const semeli = await prisma.winery.upsert({
    where: { slug: "semeli-estate" },
    update: {},
    create: {
      slug: "semeli-estate",
      name: "Semeli Estate",
      regionId: nemea.id,
      foundedYear: 1979,
      websiteUrl: "https://www.semeliestate.gr",
      description:
        "Ξεκίνησε το 1979 ως boutique οινοποιείο στη Σταμάτα Αττικής. Το 2003 μετακόμισε στο Κούτσι Κορινθίας, σε υψόμετρο 600μ, όπου έχτισε σύγχρονο οινοποιείο 4.000τ.μ. Σήμερα διαχειρίζεται πάνω από 1.200 στρέμματα αμπελώνα, ιδιόκτητα και συνεργαζόμενων παραγωγών, στις ζώνες ΠΟΠ Νεμέας και Μαντινείας.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const semeliWine = await prisma.wine.upsert({
    where: { slug: "semeli-nemea-reserve" },
    update: {},
    create: {
      name: "Nemea Reserve",
      slug: "semeli-nemea-reserve",
      wineryId: semeli.id,
      regionId: nemea.id,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "100% Αγιωργίτικο από ορεινούς αμπελώνες της Νεμέας, με 12 μήνες παλαίωση σε γαλλική δρυ.",
      tastingNotes: "Λαμπερό, νεανικό βαθύ κόκκινο χρώμα με αξιοσημείωτο ιξώδες. Έντονη μύτη με νεανικά, βαθιά αρώματα πυκνών μπαχαρικών, σύνθετου φρούτου και ισορροπημένης δρυς. Γεμάτο σώμα, απαλό στο στόμα, με μακρά επίγευση.",
      servingTemp: "16-18 °C",
      foodPairings: ["Κόκκινα κρέατα", "Μαγειρευτά"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: semeliWine.id, varietyId: agiorgitiko.id } },
    update: { percentage: 100 },
    create: { wineId: semeliWine.id, varietyId: agiorgitiko.id, percentage: 100 },
  });

  // ── Sigalas Winery — Οία, Σαντορίνη ── πηγές: sigalas-wine.com, winesofgreece.org, wine-searcher.com
  const sigalas = await prisma.winery.upsert({
    where: { slug: "domaine-sigalas" },
    update: {},
    create: {
      slug: "domaine-sigalas",
      name: "Domaine Sigalas",
      regionId: santorini.id,
      foundedYear: 1991,
      websiteUrl: "https://sigalas-wine.com",
      description:
        "Ο Πάρις Σιγάλας, μαθηματικός που σπούδασε στο Παρίσι, ξεκίνησε να φτιάχνει κρασί το 1976 στην πατρική κάναβα στις Μπαξέδες της Οίας, για δική του απόλαυση. Ίδρυσε επίσημα το οινοποιείο το 1991, και το 1998 έχτισε σύγχρονη μονάδα σε αμπελώνα 30 εκταρίων, εστιάζοντας στις γηγενείς ποικιλίες της Σαντορίνης — Ασύρτικο, Αηδάνι, Αθήρι, Μαυροτράγανο. Σήμερα θεωρείται πρωτοπόρος που έφερε το Ασύρτικο στο διεθνές προσκήνιο.",
      status: ContentStatus.PUBLISHED,
      isVerified: false,
    },
  });
  const sigalasWine = await prisma.wine.upsert({
    where: { slug: "sigalas-santorini-assyrtiko" },
    update: {},
    create: {
      name: "Santorini",
      slug: "sigalas-santorini-assyrtiko",
      wineryId: sigalas.id,
      regionId: santorini.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PDO,
      description: "100% Ασύρτικο — η κλασική ετικέτα του κτήματος, ζυμωμένη σε ανοξείδωτες δεξαμενές με ~50% must ελεύθερης ροής, 5 μήνες παραμονή στις οινολάσπες.",
      tastingNotes: "Ανοιχτό λεμονί χρώμα. Έντονη, σχεδόν πυριτική ορυκτικότητα στη μύτη, ώριμο πυρηνόκαρπο φρούτο, φλούδα λεμονιού και απαλές ανθικές νότες γιασεμιού. Μεσαίο σώμα, σφιχτό και σύνθετο, με αλμυρή αίσθηση, ζωηρή οξύτητα και ορυκτικό, μακρύ τελείωμα.",
      servingTemp: "8-10 °C",
      foodPairings: ["Θαλασσινά", "Ψάρια σχάρας"],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.upsert({
    where: { wineId_varietyId: { wineId: sigalasWine.id, varietyId: assyrtiko.id } },
    update: { percentage: 100 },
    create: { wineId: sigalasWine.id, varietyId: assyrtiko.id, percentage: 100 },
  });

  console.log("Batch 5 done: 10 οινοποιεία, 10 κρασιά, 1 νέα περιοχή, καμία νέα ποικιλία.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
