// Διόρθωση/συμπλήρωση στοιχείων για τα κρασιά του Κτήμα Βιβλία Χώρα με βάση
// το επίσημο sell-sheet του οινοποιείου (ΦΙΑΛΕΣ ΕΛΛΗΝΙΚΑ.doc) + το site τους
// (bibliachora.gr), για τα οποία ο χρήστης έχει άδεια χρήσης εικόνων/περιεχομένου.
//
// Διορθώσεις:
// - Ακριβή ποσοστά ποικιλιών (ήταν null σε αρκετά blends)
// - plagios-leyko ήταν συνδεδεμένο λανθασμένα και με Ασύρτικο· το doc λέει 100% Chardonnay
// - plagios-erythro ήταν συνδεδεμένο λανθασμένα και με Αγιωργίτικο· το doc λέει 100% Merlot
// - appellation: PGI (Παγγαίο) στα κρασιά που το αναγράφουν επίσημα· τα Sole Pinot Noir/
//   Βιδιανό είναι "ποικιλιακός οίνος" χωρίς ΠΓΕ
// - Sole Ερυθρό -> μετονομασία στο πραγματικό όνομα "Sole Pinot Noir" (slug παραμένει)
// - Βίβλινος Ερυθρό/Ροζέ: η ποικιλία είναι τοπική, χωρίς επίσημη ονομασία -> καμία
//   VarietyOnWine (όπως και πριν), αλλά ενημερωμένη περιγραφή με αυτό ρητά
// - 2 νέα κρασιά: Sole Βιδιανό, Sole Semillon Γλυκύς (500ml) — δεν υπήρχαν στη βάση

import { Appellation, VarietyType, WineColor, WineStyle } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function setVarieties(wineId: string, links: Array<{ varietyId: string; percentage: number }>) {
  await prisma.varietyOnWine.deleteMany({ where: { wineId } });
  for (const link of links) {
    await prisma.varietyOnWine.create({
      data: { wineId, varietyId: link.varietyId, percentage: link.percentage },
    });
  }
}

async function main() {
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "ktima-biblia-chora" } });
  const region = await prisma.region.findUniqueOrThrow({ where: { slug: "pangaio" } });

  const asyrtiko = await prisma.variety.findUniqueOrThrow({ where: { slug: "asyrtiko" } });
  const sauvignonBlanc = await prisma.variety.findUniqueOrThrow({ where: { slug: "sauvignon-blanc" } });
  const cabernetSauvignon = await prisma.variety.findUniqueOrThrow({ where: { slug: "cabernet-sauvignon" } });
  const merlot = await prisma.variety.findUniqueOrThrow({ where: { slug: "merlot" } });
  const agiorgitiko = await prisma.variety.findUniqueOrThrow({ where: { slug: "agiorgitiko" } });
  const semillon = await prisma.variety.findUniqueOrThrow({ where: { slug: "semillon" } });
  const chardonnay = await prisma.variety.findUniqueOrThrow({ where: { slug: "chardonnay" } });
  const syrah = await prisma.variety.findUniqueOrThrow({ where: { slug: "syrah" } });
  const pinotNoir = await prisma.variety.findUniqueOrThrow({ where: { slug: "pinot-noir" } });
  const vidiano = await prisma.variety.findUniqueOrThrow({ where: { slug: "vidiano" } });

  const gewurztraminer = await prisma.variety.upsert({
    where: { name: "Gewürztraminer" },
    update: {},
    create: {
      name: "Gewürztraminer",
      slug: "gewurztraminer",
      nameLatin: null,
      type: VarietyType.WHITE,
      originRegion: "Αλσατία, Γαλλία",
      description:
        "Έντονα αρωματική λευκή ποικιλία, γνωστή για τα αρώματα τριαντάφυλλου, λίτσι και μπαχαρικών. Χρησιμοποιείται συχνά σε γλυκά ή ημίγλυκα κρασιά χάρη στην έντονη αρωματικότητά της.",
      characteristics: "Πλούσιο σώμα, χαμηλή έως μέτρια οξύτητα, έντονο άρωμα. Αρώματα: Τριαντάφυλλο, λίτσι, μπαχαρικά, μέλι.",
      acidity: 30,
      body: 70,
      tannins: 0,
      aromaIntensity: 90,
      ageingPotential: 40,
    },
  });

  console.log("Διόρθωση ποσοστών ποικιλιών…");

  await prisma.wine.update({
    where: { slug: "ktima-vivlia-chora-leyko" },
    data: { appellation: Appellation.PGI },
  });
  await setVarieties((await prisma.wine.findUniqueOrThrow({ where: { slug: "ktima-vivlia-chora-leyko" } })).id, [
    { varietyId: sauvignonBlanc.id, percentage: 60 },
    { varietyId: asyrtiko.id, percentage: 40 },
  ]);

  await prisma.wine.update({
    where: { slug: "ktima-vivlia-chora-roze" },
    data: { appellation: Appellation.PGI },
  });

  await prisma.wine.update({
    where: { slug: "ktima-vivlia-chora-erythro" },
    data: { appellation: Appellation.PGI },
  });
  await setVarieties((await prisma.wine.findUniqueOrThrow({ where: { slug: "ktima-vivlia-chora-erythro" } })).id, [
    { varietyId: cabernetSauvignon.id, percentage: 40 },
    { varietyId: merlot.id, percentage: 40 },
    { varietyId: agiorgitiko.id, percentage: 20 },
  ]);

  await prisma.wine.update({
    where: { slug: "ovilos-leyko" },
    data: { appellation: Appellation.PGI },
  });
  await setVarieties((await prisma.wine.findUniqueOrThrow({ where: { slug: "ovilos-leyko" } })).id, [
    { varietyId: semillon.id, percentage: 50 },
    { varietyId: asyrtiko.id, percentage: 50 },
  ]);

  await prisma.wine.update({
    where: { slug: "ovilos-erythro" },
    data: { appellation: Appellation.PGI },
  });

  await prisma.wine.update({
    where: { slug: "areti-leyko" },
    data: { appellation: Appellation.PGI },
  });

  await prisma.wine.update({
    where: { slug: "areti-erythro" },
    data: { appellation: Appellation.PGI },
  });

  // plagios-leyko: το doc λέει 100% Chardonnay — αφαιρείται λανθασμένος δεσμός με Ασύρτικο
  await prisma.wine.update({
    where: { slug: "plagios-leyko" },
    data: { appellation: Appellation.PGI },
  });
  await setVarieties((await prisma.wine.findUniqueOrThrow({ where: { slug: "plagios-leyko" } })).id, [
    { varietyId: chardonnay.id, percentage: 100 },
  ]);

  // plagios-erythro: το doc λέει 100% Merlot — αφαιρείται λανθασμένος δεσμός με Αγιωργίτικο
  await prisma.wine.update({
    where: { slug: "plagios-erythro" },
    data: { appellation: Appellation.PGI },
  });
  await setVarieties((await prisma.wine.findUniqueOrThrow({ where: { slug: "plagios-erythro" } })).id, [
    { varietyId: merlot.id, percentage: 100 },
  ]);

  // Βίβλινος: τοπική ερυθρή ποικιλία χωρίς επίσημη ονομασία -> καμία VarietyOnWine,
  // ενημερωμένη περιγραφή που το αναφέρει ρητά.
  await prisma.wine.update({
    where: { slug: "vivlinos-erythro" },
    data: {
      description:
        "Παράγεται από μία τοπική ερυθρή ποικιλία που βρέθηκε στην περιοχή του Παγγαίου Όρους και καλλιεργείται αποκλειστικά από το Κτήμα Βιβλία Χώρα — δεν έχει επίσημη κωδική ονομασία. Κλασική ερυθρή οινοποίηση και παλαίωση σε δρύινα βαρέλια για 12 μήνες.",
    },
  });
  await prisma.wine.update({
    where: { slug: "vivlinos-roze" },
    data: {
      description:
        "Παράγεται από μία τοπική ερυθρή ποικιλία που βρέθηκε στην περιοχή του Παγγαίου Όρους και καλλιεργείται αποκλειστικά από το Κτήμα Βιβλία Χώρα — δεν έχει επίσημη κωδική ονομασία. Απευθείας πίεση χωρίς προζυμωτική εκχύλιση, ώστε να αναδειχθεί το φρέσκο, φρουτώδες προφίλ του. Κυκλοφορεί σε φιάλη Magnum (1,5 L).",
    },
  });

  // Sole Ερυθρό -> πραγματικό όνομα "Sole Pinot Noir" (ποικιλιακός οίνος, χωρίς ΠΓΕ)
  await prisma.wine.update({
    where: { slug: "sole-erythro" },
    data: { name: "Sole Pinot Noir" },
  });

  console.log("Προσθήκη 2 νέων κρασιών Sole…");

  const soleVidiano = await prisma.wine.upsert({
    where: { slug: "sole-vidiano" },
    update: {},
    create: {
      slug: "sole-vidiano",
      name: "Sole Βιδιανό",
      wineryId: winery.id,
      regionId: region.id,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      description:
        "Ποικιλιακός οίνος (χωρίς ΠΓΕ) από Βιδιανό, ποικιλία της Κρήτης που φυτεύτηκε και προσαρμόστηκε στις πλαγιές του Παγγαίου, με μικρή συμμετοχή Ασύρτικου. Κλασική λευκή οινοποίηση χωρίς προζυμωτική εκχύλιση, ζύμωση σε χαμηλή θερμοκρασία σε ανοξείδωτες δεξαμενές, παραμονή στις λεπτές οινολάσπες για 4 μήνες.",
      tastingNotes:
        "Λαμπερό πρασινοκίτρινο χρώμα. Αρώματα βερίκοκου και αχλαδιού, δεμένα αρμονικά με βότανα και εσπεριδοειδή. Πλούσια γεύση με εξαιρετική δομή, δροσιστική οξύτητα και βελούδινη υφή, νότες ορυκτών και κεριού στην επίγευση.",
      servingTemp: "10 °C",
      foodPairings: [],
      status: "PUBLISHED",
    },
  });
  await setVarieties(soleVidiano.id, [
    { varietyId: vidiano.id, percentage: 92 },
    { varietyId: asyrtiko.id, percentage: 8 },
  ]);

  const soleSemillon = await prisma.wine.upsert({
    where: { slug: "sole-semillon" },
    update: {},
    create: {
      slug: "sole-semillon",
      name: "Sole Semillon – Γλυκύς",
      wineryId: winery.id,
      regionId: region.id,
      color: WineColor.WHITE,
      style: WineStyle.SWEET,
      appellation: Appellation.PGI,
      description:
        "Γλυκός οίνος (φιάλη 500ml) από Semillon με συμμετοχή Gewürztraminer, από σταφύλια με ένα ποσοστό ευγενούς σήψης (pourriture noble), τρυγημένα τον Οκτώβριο (όψιμος τρύγος). Ζύμωση σε δρύινα βαρέλια, παραμονή στις οινολάσπες τουλάχιστον ένα έτος.",
      tastingNotes:
        "Χρυσαφί-κίτρινο λαμπερό χρώμα. Αρώματα τροπικών φρούτων, lime, ροδάκινου και μανταρινιού, με μέλι και μαρμελάδα λεμονιού. Πλούσια, αρωματική γεύση με πολύ καλή ισορροπία γλυκύτητας-οξύτητας, βελούδινη υφή και μεγάλη επίγευση.",
      servingTemp: null,
      foodPairings: [],
      status: "PUBLISHED",
    },
  });
  await setVarieties(soleSemillon.id, [
    { varietyId: semillon.id, percentage: 85 },
    { varietyId: gewurztraminer.id, percentage: 15 },
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
