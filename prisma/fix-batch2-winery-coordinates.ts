// PHASE 3B — BATCH 2 — Group 12 — Winery geolocation enrichment.
// Γράφει ΜΟΝΟ τα πεδία `latitude`/`longitude` για 7 wineries, όπου
// επιβεβαιώθηκε η φυσική τοποθεσία του ίδιου του οινοποιείου (όχι γραφείο/
// κατάστημα/distributor) από επίσημη πηγή. Κανένα άλλο πεδίο αγγίζεται.
//
// 1. domaine-porto-carras : 40.072184, 23.805763
//    Πηγή: domaineportocarras.com/contact — ακριβείς συντεταγμένες
//    hardcoded στο ίδιο το JS του επίσημου site (Leaflet map init), marker
//    label "Domaine Porto Carras".
//
// 2. douloufakis : 35.215109, 25.049664
//    Πηγή: douloufakis.wine (σελίδα εμπειρίας "YAMAS") — ρητό
//    "Συντεταγμένες GPS: 35.215109, 25.049664" στο ίδιο το επίσημο κείμενο,
//    επιβεβαιωμένο από ενσωματωμένο Google Maps widget με Google place
//    "Douloufakis Winery".
//
// 3. alpha-estate : 40.694773, 21.707186
//    Πηγή: alpha-estate.com/contact — "2nd Km Amyndeon - St. Panteleimon"·
//    επιβεβαίωση από OpenStreetMap POI craft=winery με όνομα "ΚΤΗΜΑ ΑΛΦΑ"
//    στον ίδιο δρόμο.
//
// 4. gaia-wines : 37.856065, 22.670881
//    Πηγή: gaiawines.gr/epikoinonia — "Οινοποιείο Νεμέας, Κούτσι-20500,
//    Νεμέα"· επιβεβαίωση από OpenStreetMap POI craft=winery με όνομα "Gaia
//    Winery" στην ίδια τοποθεσία (Κούτσι). Η ξεχωριστή Αθηναϊκή έδρα
//    γραφείων και το Σαντορίνης οινοποιείο ΔΕΝ χρησιμοποιήθηκαν.
//
// 5. domaine-skouras : 37.688604, 22.654098
//    Πηγή: skouras.gr/en/winery — "the winery is... in the village of
//    Malandreni"· επιβεβαίωση από OpenStreetMap POI craft=winery με όνομα
//    "Skouras Winery" στο Μαλαντρένι.
//
// 6. boutari : 40.604913, 22.130374
//    Πηγή: boutari.gr/epikoinonia — "Οινοποιείο Νάουσσας, Στενήμαχος"·
//    ακριβείς συντεταγμένες από το ίδιο το Google Maps "place" link που
//    παραθέτει το επίσημο site για αυτό το οινοποιείο.
//
// 7. mikro-ktima-titou : 40.956889, 22.446148
//    Πηγή: mikroktimatitos.com (αρχική) — ακριβείς συντεταγμένες από το
//    ίδιο το Google Maps "place" link (ονομαστικά "Μικρό Κτήμα Τίτου") που
//    παραθέτει το επίσημο site.
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const updates: { slug: string; latitude: number; longitude: number }[] = [
  { slug: "domaine-porto-carras", latitude: 40.072184, longitude: 23.805763 },
  { slug: "douloufakis", latitude: 35.215109, longitude: 25.049664 },
  { slug: "alpha-estate", latitude: 40.694773, longitude: 21.707186 },
  { slug: "gaia-wines", latitude: 37.856065, longitude: 22.670881 },
  { slug: "domaine-skouras", latitude: 37.688604, longitude: 22.654098 },
  { slug: "boutari", latitude: 40.604913, longitude: 22.130374 },
  { slug: "mikro-ktima-titou", latitude: 40.956889, longitude: 22.446148 },
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
