// PHASE 3B — BATCH 2 — Group 15 — Winery geolocation enrichment (batch 4).
// Γράφει ΜΟΝΟ τα πεδία `latitude`/`longitude` για 8 wineries, όπου
// επιβεβαιώθηκε η φυσική τοποθεσία του ίδιου του οινοποιείου (όχι γραφείο/
// HQ/distributor) από επίσημη πηγή. Κανένα άλλο πεδίο αγγίζεται. Τα 23
// wineries των Group 12/13/14 (ήδη με συντεταγμένες) ΔΕΝ αγγίζονται.
//
// 1. papaioannou-estate : 37.806782, 22.706963
//    Πηγή: papaioannouwines.gr/contact — official address "Ancient Nemea,
//    Corinthia 20500, Greece"· επιβεβαίωση από OpenStreetMap POI
//    craft=winery "A & G PAPAIOANNOU WINERY" στο Κουτσομόδι, Κοινότητα
//    Αρχαίας Νεμέας — ίδιο όνομα οικογένειας, ίδιο χωριό.
//
// 2. zacharias-winery : 37.837110, 22.650010
//    Πηγή: OpenStreetMap POI shop=wine, ρητό όνομα "Zacharias Winery" στη
//    Νεμέα-Δάφνη — μοναδικό, σαφώς ταυτοποιημένο.
//
// 3. lafazanis-winery : 37.813913, 22.766011
//    Πηγή: OpenStreetMap POI craft=winery, ρητό όνομα "Lafazanis Winery"
//    στις Αρχαίες Κλεωνές, Δήμος Νεμέας — μοναδικό. (Απορρίφθηκε ένα άσχετο
//    ομώνυμο "ΛΑΦΑΖΑΝΗΣ" κατασκευαστική εταιρεία στη Χαλκιδική.)
//
// 4. petrakopoulos-wines : 38.077283, 20.709377
//    Πηγή: petrakopouloswines.gr/en/contact — απευθείας link του ίδιου του
//    επίσημου site προς Google Maps "place" ρητά ονομαστικά "Petrakopoulos
//    Wines, Thiramona" (!8m2!3d/!4d παράμετροι)· ταιριάζει με την επίσημη
//    διεύθυνση "Thiramona, Elios, Kefalonia 28086". Η ξεχωριστή διεύθυνση
//    γραφείων στην Αθήνα (Πειραιώς) αναφέρεται ρητά στην ίδια σελίδα και
//    ΔΕΝ χρησιμοποιήθηκε.
//
// 5. sarris-winery : 38.105248, 20.535978
//    Πηγή: OpenStreetMap POI craft=winery, ρητό όνομα "Sarris Winery" στην
//    Καλιγάτα, Δήμος Αργοστολίου — μοναδικό.
//
// 6. monemvasia-winery-tsimbidi : 36.733877, 22.967039
//    Πηγή: monemvasiawinery.gr/contact — short-link (maps.app.goo.gl) του
//    ίδιου του επίσημου site, ο οποίος (μέσω curl -sIL redirect) οδηγεί σε
//    Google Maps place ρητά ονομαστικά "Οινοποιητική Μονεμβασιάς Τσιμπίδη"
//    (exact family-name match)· ταυτίζεται με τις lat/lng μεταβλητές του
//    ίδιου του JS της σελίδας. Ένα ξεχωριστό, γενικότερο OSM POI
//    "ΟΙΝΟΠΟΙΗΤΙΚΗ ΜΟΝΕΜΒΑΣΙΑΣ" ~3km μακριά (χωρίς την ένδειξη "Τσιμπίδη")
//    ΔΕΝ χρησιμοποιήθηκε ούτε συνυπολογίστηκε (καμία μέση τιμή).
//
// 7. moraitis-winery : 37.122991, 25.244207
//    Πηγή: OpenStreetMap POI "Οινοποιείο Μωραΐτη" στη Νάουσα - Αμπελά,
//    Πάρος — ρητό όνομα οικογένειας· επιβεβαίωση από official κείμενο
//    moraitiswines.gr: "το οινοποιείο της οικογένειας Μωραΐτη βρίσκεται στη
//    Νάουσα της Πάρου, δίπλα στην παραλία των Αγίων Αναργύρων" (ίδιο χωριό).
//
// 8. anhydrous-winery : 36.421855, 25.434249
//    Πηγή: anhydrouswinery.com/epikoinonia — ενσωματωμένο Google Maps
//    iframe του επίσημου site (pb= παράμετρος). Το iframe ονομάζει το
//    σημείο "Avantis Cellar Doors" (όχι "Anhydrous") — επιβεβαιώθηκε ότι
//    πρόκειται όντως για το ίδιο το οινοποιείο μέσω (α) του ίδιου URL slug
//    του επίσημου site "/oinopoieio-avantis-cellar-door/" (="winery-avantis-
//    cellar-door") και (β) ανεξάρτητου OpenStreetMap POI "Avantis Anhydrous
//    Cellar Door" (tourism=attraction) ~194m μακριά, στον ίδιο περιφερειακό
//    δρόμο Φηρών.
//
// Santorini cross-check (Haversine, anhydrous-winery έναντι όλων των 6
// ήδη γραμμένων Santorini wineries): ελάχιστη απόσταση 2.321m
// (vassaltis-vineyards) — καμία διπλοεγγραφή/clustering.
//
// ΔΕΝ αγγίζονται (MEDIUM/UNRESOLVED, παραμένουν χωρίς write):
// domaine-karanika (μόνο OSM landuse=vineyard polygon, όχι POI κτιρίου),
// harlaftis-estate (μόνο village-level τοποθεσία "Αχλαδιάς", χωρίς
// dedicated POI· το γραφείο Σταμάτας/Αττικής αποκλείστηκε ρητά).
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const updates: { slug: string; latitude: number; longitude: number }[] = [
  { slug: "papaioannou-estate", latitude: 37.806782, longitude: 22.706963 },
  { slug: "zacharias-winery", latitude: 37.837110, longitude: 22.650010 },
  { slug: "lafazanis-winery", latitude: 37.813913, longitude: 22.766011 },
  { slug: "petrakopoulos-wines", latitude: 38.077283, longitude: 20.709377 },
  { slug: "sarris-winery", latitude: 38.105248, longitude: 20.535978 },
  { slug: "monemvasia-winery-tsimbidi", latitude: 36.733877, longitude: 22.967039 },
  { slug: "moraitis-winery", latitude: 37.122991, longitude: 25.244207 },
  { slug: "anhydrous-winery", latitude: 36.421855, longitude: 25.434249 },
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
