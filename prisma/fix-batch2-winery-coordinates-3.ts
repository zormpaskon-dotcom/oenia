// PHASE 3B — BATCH 2 — Group 14 — Winery geolocation enrichment (batch 3).
// Γράφει ΜΟΝΟ τα πεδία `latitude`/`longitude` για 9 wineries, όπου
// επιβεβαιώθηκε η φυσική τοποθεσία του ίδιου του οινοποιείου (όχι γραφείο/
// HQ/distributor) από επίσημη πηγή. Κανένα άλλο πεδίο αγγίζεται. Τα 14
// wineries των Group 12/13 (ήδη με συντεταγμένες) ΔΕΝ αγγίζονται.
//
// 1. kechris : 40.647242, 22.851755
//    Πηγή: kechris.gr/contact-us — ενσωματωμένο Google Maps iframe με
//    Google place "KECHRIS Winery" (pb= παράμετρος 2d/3d).
//
// 2. tetramythos-winery : 38.138384, 22.235674
//    Πηγή: OpenStreetMap POI shop=alcohol "Τετράμυθος Οινοποιείο" στο ίδιο
//    δρομάκι με ξεχωριστό, ανεξάρτητο POI "Tetramythos Winery" (charging
//    station) ~15m απόσταση — δύο ανεξάρτητα OSM POIs συγκλίνουν στο ίδιο
//    σημείο. Το ίδιο το ενσωματωμένο JS map marker του επίσημου site ήταν
//    ~700m ανακριβές και ΔΕΝ χρησιμοποιήθηκε ως πηγή.
//
// 3. rouvalis-winery : 38.220579, 22.084373
//    Πηγή: OpenStreetMap POI craft=winery, ρητό όνομα "Rouvalis Winery" —
//    μοναδικό, σαφώς ταυτοποιημένο. Το JS map marker του επίσημου site ήταν
//    ~950m ανακριβές και ΔΕΝ χρησιμοποιήθηκε ως πηγή.
//
// 4. idaia-winery : 35.195054, 25.029713
//    Πηγή: idaiawinery.com/contact-us — ενσωματωμένο Google Maps iframe με
//    Google place "IDAIA WINERY" (pb= παράμετρος 2d/3d).
//
// 5. karavitakis : 35.501982, 23.790986
//    Πηγή: OpenStreetMap POI craft=winery, ρητό όνομα "Karavitakis Winery"
//    — μοναδικό. (Σημείωση: μία ξεχωριστή Nominatim αναζήτηση μόνο για
//    "Karavitakis" επέστρεφε λανθασμένα ένα ομώνυμο φαρμακείο σε άλλη θέση·
//    η αναζήτηση με πλήρες όνομα "Karavitakis Winery" επέστρεψε το σωστό,
//    ρητά επισημασμένο craft=winery POI.)
//
// 6. gavalas-winery : 36.375886, 25.431159
//    Πηγή: OpenStreetMap POI craft=winery, ρητό όνομα "Gavalas Winery" —
//    μοναδικό. Cross-check απόστασης με Venetsanos Winery (Group 13,
//    ίδιο χωριό Μεγαλοχώρι): 718m — δύο ανεξάρτητα, διακριτά οινοποιεία,
//    όχι διπλοεγγραφή.
//
// 7. vassaltis-vineyards : 36.442545, 25.437677
//    Πηγή: vassaltis.com/contact — ενσωματωμένο Google Maps iframe με
//    Google place "Vassaltis Vineyards" (pb= παράμετρος 2d/3d).
//
// 8. sclavos-wines : 38.226144, 20.429880
//    Πηγή: sclavoswines.gr (αρχική) — απευθείας link του επίσημου site
//    προς Google Maps place "Sclavos Wines" (!3d/!4d παράμετροι).
//
// 9. manousakis-winery : 35.449525, 23.887640
//    Πηγή: OpenStreetMap POI shop=wine, ρητό όνομα "Manousakis Winery" —
//    μοναδικό.
//
// Santorini cross-check (Haversine, gavalas-winery + vassaltis-vineyards
// έναντι domaine-sigalas, koutsoyannopoulos-winery, estate-argyros,
// venetsanos-winery): ελάχιστη απόσταση 718m (venetsanos↔gavalas, ήδη
// τεκμηριωμένο ως δύο distinct wineries στο Group 13) — καμία διπλοεγγραφή,
// όλα τα σημεία σαφώς διακριτά.
//
// ΔΕΝ αγγίζεται (MEDIUM, παραμένει χωρίς write): kamara-pure-winery —
// πραγματική, συγκεκριμένη διεύθυνση υπάρχει, αλλά το μόνο διαθέσιμο
// evidence (ενσωματωμένο Google Place ID) είναι client-rendered χωρίς
// server-side redirect και δεν επιβεβαιώθηκε ανεξάρτητα.
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const updates: { slug: string; latitude: number; longitude: number }[] = [
  { slug: "kechris", latitude: 40.647242, longitude: 22.851755 },
  { slug: "tetramythos-winery", latitude: 38.138384, longitude: 22.235674 },
  { slug: "rouvalis-winery", latitude: 38.220579, longitude: 22.084373 },
  { slug: "idaia-winery", latitude: 35.195054, longitude: 25.029713 },
  { slug: "karavitakis", latitude: 35.501982, longitude: 23.790986 },
  { slug: "gavalas-winery", latitude: 36.375886, longitude: 25.431159 },
  { slug: "vassaltis-vineyards", latitude: 36.442545, longitude: 25.437677 },
  { slug: "sclavos-wines", latitude: 38.226144, longitude: 20.429880 },
  { slug: "manousakis-winery", latitude: 35.449525, longitude: 23.887640 },
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
