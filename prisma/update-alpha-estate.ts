// Διόρθωση/συμπλήρωση στοιχείων Κτήμα Άλφα με βάση τον επίσημο κατάλογο
// του οινοποιείου (ALPHA_ESTATE_Katalogos_Krasion.docx), για το οποίο ο
// χρήστης έχει άδεια χρήσης περιεχομένου/εικόνων.
//
// - appellation: PGI (Φλώρινα) ή PDO (Αμύνταιο) όπου αναγράφεται επίσημα
// - Ακριβή ποσοστά ποικιλιών σε 2 blends που ήταν null (Red S.M.X., Omega)
// - Αφαίρεση λανθασμένου variety-link στο Alpha One: το doc λέει ρητά ότι η
//   σύνθεση είναι "η επιλογή του οινοποιού" κάθε χρονιά, όχι σταθερή/δημόσια
// - Διόρθωση τοποθεσίας στο Ecosystem Chardonnay (ήταν "Τράμπα", το doc λέει "Τραμόντο")
// - Ecosystem Xinomavro Reserve: προσθήκη ότι είναι βιολογικής καλλιέργειας (isOrganic
//   δεν υπάρχει στο μοντέλο Wine, μπαίνει στην περιγραφή)
// - Μετονομασίες στα πραγματικά επίσημα ονόματα: "Κτήμα Άλφα Ερυθρό (SMX)" -> "Red S.M.X.",
//   "Ωμέγα (Όψιμος Τρύγος)" -> "Omega Late Harvest"
// - 3 νέα κρασιά που υπάρχουν στον κατάλογο αλλά όχι στη βάση: Ecosystem Sauvignon
//   Blanc Fumé, Ecosystem Malagouzia (Λατύπες), Axia

import { Appellation, WineColor, WineStyle } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function setVarieties(wineId: string, links: Array<{ varietyId: string; percentage: number }>) {
  await prisma.varietyOnWine.deleteMany({ where: { wineId } });
  for (const link of links) {
    await prisma.varietyOnWine.create({ data: { wineId, varietyId: link.varietyId, percentage: link.percentage } });
  }
}

async function main() {
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "alpha-estate" } });
  const region = await prisma.region.findUniqueOrThrow({ where: { slug: "amyndaio" } });

  const xinomavro = await prisma.variety.findUniqueOrThrow({ where: { slug: "xinomavro" } });
  const syrah = await prisma.variety.findUniqueOrThrow({ where: { slug: "syrah" } });
  const merlot = await prisma.variety.findUniqueOrThrow({ where: { slug: "merlot" } });
  const gewurztraminer = await prisma.variety.findUniqueOrThrow({ where: { slug: "gewurztraminer" } });
  const malagousia = await prisma.variety.findUniqueOrThrow({ where: { slug: "malagousia" } });
  const sauvignonBlanc = await prisma.variety.findUniqueOrThrow({ where: { slug: "sauvignon-blanc" } });

  console.log("Διορθώσεις υπαρχόντων κρασιών…");

  // Ecosystem Ασύρτικο
  await prisma.wine.update({
    where: { slug: "ecosystem-asyrtiko-agia-kyriaki" },
    data: { appellation: Appellation.PGI },
  });

  // Ecosystem Chardonnay — η τοποθεσία στο doc είναι "Τραμόντο", όχι "Τράμπα"
  await prisma.wine.update({
    where: { slug: "ecosystem-chardonnay-trampa" },
    data: {
      name: "Ecosystem Chardonnay (Τραμόντο)",
      appellation: Appellation.PGI,
      description:
        "Single Block «Τραμόντο». Ζύμωση και ωρίμαση σε λεπτόκοκκα γαλλικά δρύινα βαρέλια λευκού καψίματος (Bertranges & Jupille) για 7 μήνες, με περιοδική ανάδευση των οινολασπών.",
    },
  });

  // Ecosystem Ξινόμαυρο Reserve — βιολογικής καλλιέργειας, ΠΟΠ Αμύνταιο, προ-φυλλοξηρικά αμπέλια 90+ ετών
  await prisma.wine.update({
    where: { slug: "ecosystem-xinomayro-reserve-mparmpa-giannis" },
    data: {
      appellation: Appellation.PDO,
      description:
        "Single Block «Μπάρμπα Γιάννης». Οίνος βιολογικής καλλιέργειας, από προ-φυλλοξηρικά, αυτόριζα αμπέλια άνω των 90 ετών. Παλαίωση 24 μήνες σε γαλλικά βαρέλια και 12 μήνες στη φιάλη πριν την κυκλοφορία.",
    },
  });

  // Ecosystem Pinot Noir
  await prisma.wine.update({
    where: { slug: "ecosystem-pinot-noir-strofi" },
    data: { appellation: Appellation.PGI },
  });

  // Ecosystem Tannat
  await prisma.wine.update({
    where: { slug: "ecosystem-tannat-vrachos" },
    data: { appellation: Appellation.PGI },
  });

  // Alpha One — η σύνθεση ΔΕΝ δημοσιεύεται σταθερή, είναι επιλογή του οινοποιού κάθε χρονιά.
  // Αφαιρείται το προηγούμενο (λανθασμένο) 100% Syrah link.
  const alphaOne = await prisma.wine.update({
    where: { slug: "alpha-one" },
    data: {
      appellation: Appellation.PGI,
      description:
        "Υποζώνη «Σκαντζόχοιρος». Η ποικιλιακή σύνθεση είναι η επιλογή του οινοποιού κάθε χρονιά — τα καλύτερα βαρέλια αποδίδουν την απόλυτη έκφραση της αμπελουργικής ζώνης του Αμυνταίου. Παλαίωση 36 μήνες σε βαρέλια Allier-Bertranges και 18 μήνες στη φιάλη, χωρίς φιλτράρισμα. Σύμβουλος ανάμειξης: Eric Boissenot.",
    },
  });
  await setVarieties(alphaOne.id, []);

  // Red S.M.X. — πραγματικό όνομα + ακριβή ποσοστά
  await prisma.wine.update({
    where: { slug: "ktima-alfa-erythro-smx" },
    data: { name: "Red S.M.X.", appellation: Appellation.PGI },
  });
  await setVarieties((await prisma.wine.findUniqueOrThrow({ where: { slug: "ktima-alfa-erythro-smx" } })).id, [
    { varietyId: syrah.id, percentage: 60 },
    { varietyId: xinomavro.id, percentage: 20 },
    { varietyId: merlot.id, percentage: 20 },
  ]);

  // Sauvignon Blanc (ανοξείδωτο, χωρίς βαρέλι)
  await prisma.wine.update({
    where: { slug: "ktima-alfa-sauvignon-blanc" },
    data: { appellation: Appellation.PGI },
  });

  // Omega Late Harvest — πραγματικό όνομα + ακριβή ποσοστά + φιάλη 500ml
  await prisma.wine.update({
    where: { slug: "omega-opsimos-trygos" },
    data: {
      name: "Omega Late Harvest",
      appellation: Appellation.PGI,
      description:
        "Ενιαίος αμπελώνας «Άλογα». Όψιμος τρύγος με προσεκτική χειρωνακτική επιλογή ώριμων σταφυλιών. Παλαίωση 12 μήνες σε νέα γαλλικά δρύινα βαρέλια και 12 μήνες στη φιάλη. Φιάλη 500ml.",
    },
  });
  await setVarieties((await prisma.wine.findUniqueOrThrow({ where: { slug: "omega-opsimos-trygos" } })).id, [
    { varietyId: gewurztraminer.id, percentage: 85 },
    { varietyId: malagousia.id, percentage: 15 },
  ]);

  // Χελώνες Μαλαγουζιά, Χελώνες Syrah, Σκαντζόχοιρος Ξινόμαυρο — μόνο appellation
  await prisma.wine.update({ where: { slug: "chelones-malagoyzia" }, data: { appellation: Appellation.PGI } });
  await prisma.wine.update({ where: { slug: "chelones-syrah" }, data: { appellation: Appellation.PGI } });
  await prisma.wine.update({ where: { slug: "skantzochoiros-xinomayro" }, data: { appellation: Appellation.PDO } });

  console.log("Προσθήκη 3 κρασιών που έλειπαν…");

  const fume = await prisma.wine.upsert({
    where: { slug: "ecosystem-sauvignon-blanc-fume" },
    update: {},
    create: {
      slug: "ecosystem-sauvignon-blanc-fume",
      name: "Ecosystem Sauvignon Blanc Fumé (Καλύβα)",
      wineryId: winery.id,
      regionId: region.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      description:
        "Single Block «Καλύβα». Προζυμωτική εκχύλιση σε αδρανή ατμόσφαιρα και χαμηλή θερμοκρασία. Ελεγχόμενη ζύμωση σε γαλλικά δρύινα βαρέλια (Tronçais) λευκού καψίματος, με περιοδική ανάδευση των οινολασπών — συνολική παραμονή 7 μηνών στο βαρέλι.",
      tastingNotes:
        "Λαμπερό ανοιχτό κίτρινο με πρασινωπές ανταύγειες. Αρώματα εσπεριδοειδών, φρούτων του πάθους, πεπονιού και νύξεις δρυός. Γεμάτο στόμα, με εξαιρετική ισορροπία, φρεσκάδα και φινέτσα, μακρά επίγευση.",
      servingTemp: "10-12 °C",
      foodPairings: ["Θαλασσινά", "κατσικίσιο τυρί", "λευκά κρέατα με σάλτσες"],
      status: "PUBLISHED",
    },
  });
  await setVarieties(fume.id, [{ varietyId: sauvignonBlanc.id, percentage: 100 }]);

  const latypes = await prisma.wine.upsert({
    where: { slug: "ecosystem-malagouzia-latypes" },
    update: {},
    create: {
      slug: "ecosystem-malagouzia-latypes",
      name: "Ecosystem Μαλαγουζιά (Λατύπες)",
      wineryId: winery.id,
      regionId: region.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      description:
        "Single Block «Λατύπες», από αμπέλι φυτεμένο το 2007. Προζυμωτική εκχύλιση, ημι-ελεγχόμενη ζύμωση με ιθαγενή ζυμομύκητες από το ίδιο αμπελοτεμάχιο, σε δρύινα βαρέλια λευκού καψίματος (Nevers και ελληνική δρυς Ρόμπολο), παραμονή στις οινολάσπες 9 μήνες.",
      tastingNotes:
        "Κρυστάλλινο, ανοιχτό κιτρινοπράσινο χρώμα. Ανθικά αρώματα, λευκόσαρκα πυρηνόκαρπα φρούτα, νύξεις εσπεριδοειδών, ισορροπημένη ένταση βαρελιού. Γεμάτο σώμα, κρεμώδες, με ζωηρή επίγευση.",
      servingTemp: "10-12 °C",
      foodPairings: ["Πλούσια πιάτα ζυμαρικών", "ψητό κοτόπουλο", "μαλακά τυριά"],
      status: "PUBLISHED",
    },
  });
  await setVarieties(latypes.id, [{ varietyId: malagousia.id, percentage: 100 }]);

  const axia = await prisma.wine.upsert({
    where: { slug: "axia" },
    update: {},
    create: {
      slug: "axia",
      name: "Axia",
      wineryId: winery.id,
      regionId: region.id,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      description:
        "Υποζώνες «Πέτρες» & «Δρόμος». Κρυοεκχύλιση, αλκοολική ζύμωση σε σταδιακά αυξανόμενες θερμοκρασίες, παραμονή 7 μήνες στις οινολάσπες. Παλαίωση 12 μήνες σε γαλλικά δρύινα βαρέλια λευκού καψίματος και 12 μήνες στη φιάλη.",
      tastingNotes:
        "Πορφυρό κόκκινο χρώμα. Μπουκέτο μπαχαρικών (βανίλια, πιπέρι, γαρύφαλλο) και ώριμου βατόμουρου. Γεμάτο στόμα με στρογγυλές τανίνες, ισορροπημένη οξύτητα και νότες ξύλου. Μακρά επίγευση με άρωμα κυδωνιού.",
      servingTemp: "16-18 °C",
      foodPairings: [],
      status: "PUBLISHED",
    },
  });
  await setVarieties(axia.id, [
    { varietyId: xinomavro.id, percentage: 50 },
    { varietyId: syrah.id, percentage: 50 },
  ]);

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
