// Εμπλουτισμός Acra Winery (Νεμέα) από το επίσημο site (acrawinery.com) —
// μόνο πληροφορίες που δηλώνονται ρητά εκεί. Το site δεν δίνει
// λεπτομερή δεδομένα ανά κρασί (blend %, ABV, tasting notes) — τα 4
// PDF product sheets που έστειλε ο χρήστης δεν μπόρεσαν να διαβαστούν
// (λείπει poppler/pdftoppm στο τοπικό tool environment) — ο χρήστης
// ζήτησε να προχωρήσουμε μόνο με τα στοιχεία του site.
//
// Προστίθενται 3 νέα κρασιά (Ασύρτικο, Malbec ροζέ, Κυδωνίτσα) — το
// site αναφέρει ρητά "4 wines", ένα ανά ποικιλία (Agiorgitiko,
// Assyrtiko, Kidonitsa, Malbec), μονοποικιλιακά. Η Νεμέα ΠΟΠ αφορά
// αποκλειστικά τον ερυθρό Αγιωργίτικο — τα άλλα 3 μπαίνουν ως ΠΓΕ
// (ίδιο Region "Νεμέα", διαφορετικό wine.appellation, ίδιο pattern με
// το Alpha Estate/Αμύνταιο).

import { prisma } from "../lib/prisma";
import { Appellation, WineColor, WineStyle } from "@prisma/client";

async function ensureVariety(name: string, nameLatin: string, type: "RED" | "WHITE", originRegion: string) {
  const slug = name.toLowerCase().replace(/[^a-zα-ωίϊΐόάέύϋΰήώ0-9]+/gi, "-");
  return prisma.variety.upsert({
    where: { slug },
    update: {},
    create: { name, slug, nameLatin, type, originRegion },
  });
}

async function main() {
  const nemeaRegion = await prisma.region.findUniqueOrThrow({ where: { slug: "nemea" } });

  const asyrtiko = await prisma.variety.findUniqueOrThrow({ where: { slug: "asyrtiko" } });
  const kidonitsa = await prisma.variety.findUniqueOrThrow({ where: { slug: "kidonitsa" } });
  const malbec = await ensureVariety("Malbec", "Malbec", "RED", "Γαλλία (Cahors) / Αργεντινή (Mendoza)");

  await prisma.winery.update({
    where: { slug: "acra-winery" },
    data: {
      websiteUrl: "https://www.acrawinery.com",
      email: "info@acrawinery.com",
      phone: "+30 693 185 2760",
      address: "Νεμέα, Κορινθία, 20500",
      coverImage: "https://www.acrawinery.com/assets/acra_hero-DjUedtUz.webp",
      socialLinks: { instagram: "https://instagram.com/acrawinery" },
      vineyardHectares: 4,
    },
  });

  // Ήδη υπαρκτό κρασί — ενημέρωση με την επίσημη, καθαρή φωτογραφία ετικέτας.
  await prisma.wine.update({
    where: { slug: "acra-nemea" },
    data: { labelImage: "https://www.acrawinery.com/assets/bottle-nemea-CnoeIr_R.png" },
  });

  const VINEYARD_NOTE =
    "Ιδιόκτητος αμπελώνας στη Νεμέα, σε υψόμετρο 280-750μ, σε αργιλοασβεστολιθικά εδάφη, υπό βιολογική καλλιέργεια.";

  const newWines: {
    slug: string;
    name: string;
    color: WineColor;
    varietyId: string;
    varietyName: string;
    labelImage: string;
    description: string;
  }[] = [
    {
      slug: "acra-assyrtiko",
      name: "Assyrtiko",
      color: WineColor.WHITE,
      varietyId: asyrtiko.id,
      varietyName: "Ασύρτικο",
      labelImage: "https://www.acrawinery.com/assets/bottle-assyrtiko-BN26Kw2Q.png",
      description:
        "Μονοποικιλιακό Ασύρτικο 100%, από τους αμπελώνες του Acra στη Νεμέα. Ελάχιστη οινολογική παρέμβαση, με στόχο να αναδειχθεί καθαρά ο χαρακτήρας της ποικιλίας και του συγκεκριμένου αμπελοτεμαχίου.",
    },
    {
      slug: "acra-malbec",
      name: "Malbec",
      color: WineColor.ROSE,
      varietyId: malbec.id,
      varietyName: "Malbec",
      labelImage: "https://www.acrawinery.com/assets/bottle-malbec-BuvZOU3k.png",
      description:
        "Μονοποικιλιακό ροζέ από Malbec 100%, από τους αμπελώνες του Acra στη Νεμέα. Ελάχιστη οινολογική παρέμβαση, με στόχο να αναδειχθεί καθαρά ο χαρακτήρας της ποικιλίας και του συγκεκριμένου αμπελοτεμαχίου.",
    },
    {
      slug: "acra-kidonitsa",
      name: "Kidonitsa",
      color: WineColor.WHITE,
      varietyId: kidonitsa.id,
      varietyName: "Κυδωνίτσα",
      labelImage: "https://www.acrawinery.com/assets/bottle-kidonitsa-BSon05Ad.png",
      description:
        "Μονοποικιλιακή Κυδωνίτσα 100%, από τους αμπελώνες του Acra στη Νεμέα. Ελάχιστη οινολογική παρέμβαση, με στόχο να αναδειχθεί καθαρά ο χαρακτήρας της σπάνιας αυτής γηγενούς ποικιλίας.",
    },
  ];

  for (const w of newWines) {
    const wine = await prisma.wine.upsert({
      where: { slug: w.slug },
      update: {},
      create: {
        name: w.name,
        slug: w.slug,
        wineryId: (await prisma.winery.findUniqueOrThrow({ where: { slug: "acra-winery" } })).id,
        regionId: nemeaRegion.id,
        color: w.color,
        style: WineStyle.DRY,
        appellation: Appellation.PGI,
        labelImage: w.labelImage,
        description: w.description,
        vineyardNotes: VINEYARD_NOTE,
      },
    });

    await prisma.varietyOnWine.upsert({
      where: { wineId_varietyId: { wineId: wine.id, varietyId: w.varietyId } },
      update: { percentage: 100 },
      create: { wineId: wine.id, varietyId: w.varietyId, percentage: 100 },
    });

    console.log(`✓ ${w.slug} (${w.varietyName} 100%)`);
  }

  console.log("\nAcra Winery ενημερώθηκε: 3 νέα κρασιά + coverImage + επικοινωνία/social + labelImage στο υπαρκτό Νεμέα.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
