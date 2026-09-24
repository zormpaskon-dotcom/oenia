// PHASE 3B — BATCH 2 — Group 13 — Winery geolocation enrichment (batch 2).
// Γράφει ΜΟΝΟ τα πεδία `latitude`/`longitude` για 7 wineries, όπου
// επιβεβαιώθηκε η φυσική τοποθεσία του ίδιου του οινοποιείου (όχι γραφείο/
// HQ/distributor) από επίσημη πηγή. Κανένα άλλο πεδίο αγγίζεται. Τα 7
// wineries του Group 12 (ήδη με συντεταγμένες) ΔΕΝ αγγίζονται.
//
// 1. domaine-sigalas : 36.471321, 25.394310
//    Πηγή: sigalas-wine.com/contact — "Μπαξές, Οία, Σαντορίνη"·
//    επιβεβαίωση από OpenStreetMap POI craft=winery "Κτήμα Σιγάλα" στην
//    ίδια τοποθεσία.
//
// 2. koutsoyannopoulos-winery : 36.397001, 25.459858
//    Πηγή: OpenStreetMap POI tourism=museum με το ακριβές όνομα "Wine
//    Museum Koutsoyannopoulos - Winery" — μοναδικό, σαφώς ταυτοποιημένο
//    landmark.
//
// 3. estate-argyros : 36.383607, 25.464733
//    Πηγή: estateargyros.com/contact — "Episkopi Gonia, Thira"·
//    επιβεβαίωση από OpenStreetMap POI "Estate Argyros Winery" στην ίδια
//    τοποθεσία.
//
// 4. kir-yianni : 40.659342, 22.071457
//    Πηγή: kiryianni.gr/contact — "NAOUSSA — YIANNAKOHORI" (το Νάουσας
//    κτήμα, όχι το ξεχωριστό Αμυνταίου)· επιβεβαίωση από OpenStreetMap POI
//    craft=winery "Κτήμα Κυρ-Γιάννη" στο ίδιο χωριό.
//
// 5. costa-lazaridi : 41.130866, 24.259506
//    Πηγή: estates-costalazaridi.gr/epikoinonia — "Κτήμα Δράμας: Αδριανή,
//    Δράμα" (το Δράμας κτήμα, όχι το ξεχωριστό Αττικής)· επιβεβαίωση από
//    OpenStreetMap POI craft=winery "Κτήμα Κώστα Λαζαρίδη" στο ίδιο χωριό.
//
// 6. nico-lazaridi : 41.129146, 24.278432
//    Πηγή: chateau-lazaridi.com/en/contact — "Community of Agora, DRAMA"·
//    επιβεβαίωση από OpenStreetMap POI craft=winery "NICO LAZARIDI" στην
//    Αγορά.
//
// 7. venetsanos-winery : 36.382340, 25.431520
//    Πηγή: venetsanoswinery.com/contact — απευθείας "Get directions" link
//    του επίσημου site προς Google Maps place "Venetsanos Winery"·
//    επιβεβαίωση από ανεξάρτητο OpenStreetMap POI craft=winery "Βενετσάνος"
//    στην ίδια τοποθεσία (Μεγαλοχώρι), ~15m απόσταση.
//
// ΔΕΝ αγγίζονται (MEDIUM/LOW, παραμένουν χωρίς write): domaine-hatzimichalis,
// katogi-averoff, papagiannakos-winery.
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const updates: { slug: string; latitude: number; longitude: number }[] = [
  { slug: "domaine-sigalas", latitude: 36.471321, longitude: 25.394310 },
  { slug: "koutsoyannopoulos-winery", latitude: 36.397001, longitude: 25.459858 },
  { slug: "estate-argyros", latitude: 36.383607, longitude: 25.464733 },
  { slug: "kir-yianni", latitude: 40.659342, longitude: 22.071457 },
  { slug: "costa-lazaridi", latitude: 41.130866, longitude: 24.259506 },
  { slug: "nico-lazaridi", latitude: 41.129146, longitude: 24.278432 },
  { slug: "venetsanos-winery", latitude: 36.382340, longitude: 25.431520 },
];

async function main() {
  for (const { slug, latitude, longitude } of updates) {
    const winery = await prisma.winery.findUniqueOrThrow({
      where: { slug },
      select: { id: true, slug: true, latitude: true, longitude: true },
    });

    if (winery.latitude !== null || winery.longitude !== null) {
      console.log(`✗ SKIPPED ${slug}: coordinates already set (lat=${winery.latitude}, lng=${winery.longitude}) — no overwrite`);
      continue;
    }

    await prisma.winery.update({
      where: { id: winery.id },
      data: { latitude, longitude },
    });
    console.log(`✓ ${slug}: latitude/longitude set to (${latitude}, ${longitude})`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
