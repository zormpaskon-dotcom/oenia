// Στατικό, code-level image inventory για το generic WineryProfile —
// ΟΧΙ database table (καμία migration). Κάθε entry προέρχεται από το
// ολοκληρωμένο 92/92 Winery Image Sourcing audit, με URLs επαληθευμένες
// ζωντανά στο επίσημο site του κάθε παραγωγού. Ποτέ εικόνα άλλου winery,
// ποτέ μαντεμένο URL.
//
// Λείπει σκόπιμα ένα slot όταν το inventory δεν βρήκε αντίστοιχη
// επιβεβαιωμένη φωτογραφία — το WineryProfile απλά παραλείπει εκείνη
// την ενότητα. Λείπει ΟΛΟΚΛΗΡΟ το entry (winery απών από αυτό το αρχείο)
// όταν: (α) verdict D/E από το audit, (β) verdict C χωρίς καμία
// επιβεβαιωμένη Hero εικόνα, ή (γ) το μοναδικό διαθέσιμο Hero candidate
// αποδείχθηκε ακατάλληλο σε αυτό το rollout pass — βλ. σχόλια ανά winery.
//
// ΓΝΩΣΤΟ, ΣΚΟΠΙΜΑ ΜΗ ΔΙΟΡΘΩΜΕΝΟ ΟΡΙΟ: το Hero component κάνει πάντα ένα
// σταθερό, πλατύ full-bleed cover-crop (κλειδωμένη αισθητική, δεν
// αλλάζει εδώ). Μια portrait-orientation εικόνα θα έκοβε άσχημα σε αυτό
// το πλαίσιο — γι' αυτό κάθε winery παρακάτω με portrait-only διαθέσιμο
// υλικό έχει ΕΞΑΙΡΕΘΕΙ ρητά (παραμένει σε legacy fallback) αντί να
// σταλεί με κακό crop. Βλ. το τελικό report για την πλήρη λίστα.

export type ImageCategory = "hero" | "vineyard" | "winery" | "people" | "editorial";

export type ImageAsset = {
  src: string;
  /** Πραγματικές διαστάσεις όπου επιβεβαιώθηκαν ζωντανά· undefined όταν δεν καταγράφηκαν — το
   * WineryVisualSection πέφτει σε "standard" bucket ως ασφαλές default. */
  width?: number;
  height?: number;
  alt: string;
  /** Η επίσημη σελίδα του παραγωγού όπου επαληθεύτηκε η εικόνα — audit trail. */
  sourceUrl: string;
  category: ImageCategory;
  /** Μόνο για category "people". */
  personName?: string;
};

export type WineryImages = {
  hero?: ImageAsset;
  vineyard?: ImageAsset;
  winery?: ImageAsset;
  people?: ImageAsset;
  editorial?: ImageAsset;
};

export const WINERY_IMAGES: Record<string, WineryImages> = {
  // ══════════════════════════════════════════════════════════════════
  // Ήδη δοκιμασμένα test wineries (5-case validation) — αμετάβλητα
  // ══════════════════════════════════════════════════════════════════
  "ktima-biblia-chora": {
    hero: { category: "hero", src: "https://bibliachora.gr/wp-content/uploads/2021/08/biblia-chora-header-ampelonas.jpg", width: 1920, height: 988, alt: "Ο αμπελώνας του Κτήμα Βιβλία Χώρα στις πλαγιές του Παγγαίου", sourceUrl: "https://bibliachora.gr" },
    vineyard: { category: "vineyard", src: "https://bibliachora.gr/wp-content/uploads/2026/06/Vivlia26-0023-110mb-scaled.jpg", width: 2560, height: 1707, alt: "Αμπελώνας Κτήμα Βιβλία Χώρα, Παγγαίο", sourceUrl: "https://bibliachora.gr" },
    winery: { category: "winery", src: "https://bibliachora.gr/wp-content/uploads/2026/06/CS26-0741-scaled.jpg", width: 2560, height: 1708, alt: "Το κελάρι παλαίωσης του Κτήμα Βιβλία Χώρα", sourceUrl: "https://bibliachora.gr" },
    people: { category: "people", src: "https://bibliachora.gr/wp-content/uploads/2021/08/vivlia-chora-baggelhs-1.jpg", width: 362, height: 600, alt: "Βαγγέλης Γεροβασιλείου", sourceUrl: "https://bibliachora.gr", personName: "Βαγγέλης Γεροβασιλείου" },
    editorial: { category: "editorial", src: "https://bibliachora.gr/wp-content/uploads/2026/06/TM4A3345.jpg", width: 2362, height: 1594, alt: "Εμφιάλωση στο οινοποιείο Κτήμα Βιβλία Χώρα", sourceUrl: "https://bibliachora.gr" },
  },
  "pavlidis-estate": {
    hero: { category: "hero", src: "https://ktima-pavlidis.gr/wp-content/uploads/2024/04/ktima-pavlidis-2-scaled.jpg", width: 2560, height: 1456, alt: "Το κτήριο του Κτήμα Παυλίδη, Δράμα", sourceUrl: "https://ktima-pavlidis.gr" },
    vineyard: { category: "vineyard", src: "https://ktima-pavlidis.gr/wp-content/uploads/2024/09/Ktima-Pavlidis-Perichora-Vineyards-3-1-scaled.jpg", width: 2560, height: 1965, alt: "Αμπελώνας Περιχώρα, Κτήμα Παυλίδη", sourceUrl: "https://ktima-pavlidis.gr" },
    winery: { category: "winery", src: "https://ktima-pavlidis.gr/wp-content/uploads/2024/04/%CE%9F%CE%99%CE%9D%CE%9F%CE%A0%CE%9F%CE%99%CE%95%CE%99%CE%9F-scaled.jpg", width: 2560, height: 1702, alt: "Το οινοποιείο του Κτήμα Παυλίδη", sourceUrl: "https://ktima-pavlidis.gr" },
  },
  "moraitis-winery": {
    hero: { category: "hero", src: "https://moraitiswines.gr/wp-content/uploads/2020/12/slide3.jpg", width: 1920, height: 942, alt: "Το οινοποιείο Moraitis, Πάρος", sourceUrl: "https://moraitiswines.gr" },
    vineyard: { category: "vineyard", src: "https://moraitiswines.gr/wp-content/uploads/2020/12/slide2.jpg", width: 1920, height: 1113, alt: "Αμπελώνας Moraitis, Πάρος", sourceUrl: "https://moraitiswines.gr" },
  },
  "strataridakis-winery": {
    hero: { category: "hero", src: "https://static.strataridakis.gr/files/slider.jpg", width: 1903, height: 910, alt: "Το οινοποιείο Strataridakis, Κρήτη", sourceUrl: "https://strataridakis.gr" },
  },
  // "oinopoieia-aidarini" — Type E, 0 επιβεβαιωμένες εικόνες, καμία entry (legacy fallback).

  // ══════════════════════════════════════════════════════════════════
  // Νέο rollout — μόνο wineries με ζωντανά επιβεβαιωμένη, landscape Hero
  // εικόνα σε αυτό το pass
  // ══════════════════════════════════════════════════════════════════

  "acra-winery": {
    hero: { category: "hero", src: "https://www.acrawinery.com/assets/acra_hero-DjUedtUz.webp", width: 5000, height: 3337, alt: "Acra Winery, Νεμέα", sourceUrl: "https://www.acrawinery.com" },
    vineyard: { category: "vineyard", src: "https://www.acrawinery.com/assets/acra_vineyard-C69-w3Id.webp", width: 2244, height: 1438, alt: "Αμπελώνας Acra Winery", sourceUrl: "https://www.acrawinery.com" },
  },
  "artemis-karamolegos": {
    // Hero 1200×1200 (τετράγωνη, όχι ιδανική αλλά όχι portrait — αποδεκτό crop).
    hero: { category: "hero", src: "https://www.artemiskaramolegos-winery.com/wp-content/uploads/2024/04/KaramolegosHomeRestaurantSection.webp", width: 1200, height: 1200, alt: "Artemis Karamolegos, θέα στη θάλασσα, Σαντορίνη", sourceUrl: "https://www.artemiskaramolegos-winery.com" },
    winery: { category: "winery", src: "https://www.artemiskaramolegos-winery.com/wp-content/uploads/2024/04/KaramolegosHomeWinesSection.webp", width: 1200, height: 1200, alt: "Κελάρι Artemis Karamolegos", sourceUrl: "https://www.artemiskaramolegos-winery.com" },
    people: { category: "people", src: "https://www.artemiskaramolegos-winery.com/wp-content/uploads/2024/04/KaramolegosHomeAboutSection.webp", width: 1200, height: 1200, alt: "Artemis Karamolegos", sourceUrl: "https://www.artemiskaramolegos-winery.com", personName: "Artemis Karamolegos" },
  },
  "boutari": {
    // ⚠ FLAGGED: το "winery exterior" candidate του inventory ήταν ρητά
    // Κρήτης (BoutariWineryCrete) — ΔΕΝ χρησιμοποιείται. Winery slot κενό.
    hero: { category: "hero", src: "https://boutari.gr/wp-content/uploads/2024/03/home-scroll-img-v2.jpg", width: 2560, height: 1700, alt: "Boutari, Νάουσα", sourceUrl: "https://boutari.gr" },
    vineyard: { category: "vineyard", src: "https://boutari.gr/wp-content/uploads/2024/01/4-1.png", width: 321, height: 808, alt: "Αμπελώνας Νάουσας, Boutari", sourceUrl: "https://boutari.gr" },
  },
  "canava-chrissou-tselepos": {
    // ⚠ FLAGGED multi-location: όλες οι εικόνες αποκλειστικά από τη σελίδα
    // /canava-chrissou-tselepos/ (Σαντορίνη) — ποτέ από το κεντρικό tselepos.gr.
    hero: { category: "hero", src: "https://tselepos.gr/wp-content/uploads/2022/01/AP-125.jpg", width: 1200, height: 800, alt: "Canava Chrissou–Tselepos, Σαντορίνη", sourceUrl: "https://tselepos.gr/canava-chrissou-tselepos/" },
    editorial: { category: "editorial", src: "https://tselepos.gr/wp-content/uploads/2022/01/AP-439.jpg", width: 1200, height: 800, alt: "Canava Chrissou–Tselepos, Σαντορίνη", sourceUrl: "https://tselepos.gr/canava-chrissou-tselepos/" },
  },
  "domaine-hatzimichalis": {
    hero: { category: "hero", src: "https://images.squarespace-cdn.com/content/v1/5fa046fb979c1b05b3dde3ff/4657a0ca-a854-45c8-b4da-0e5a56af6cec/%CE%9A%CF%84%CE%AE%CE%BC%CE%B1-%CE%A7%CE%B1%CF%84%CE%B6%CE%B7%CE%BC%CE%B9%CF%87%CE%AC%CE%BB%CE%B7-website-background-image.jpg", width: 2362, height: 1575, alt: "Domaine Hatzimichalis, Φθιώτιδα", sourceUrl: "https://www.hatzimichalis.gr" },
    winery: { category: "winery", src: "https://images.squarespace-cdn.com/content/v1/5fa046fb979c1b05b3dde3ff/a826ac26-4e50-4d73-ac95-00d6a7b70aa7/IMG_2254-web.jpg", width: 1200, height: 800, alt: "Κελάρι Domaine Hatzimichalis", sourceUrl: "https://www.hatzimichalis.gr" },
    people: { category: "people", src: "https://images.squarespace-cdn.com/content/v1/5fa046fb979c1b05b3dde3ff/d10b09fe-1a49-409d-b560-10a9cfdc7bf4/IMG_4126.jpg-web.jpg", width: 1200, height: 800, alt: "Δημήτρης Χατζημιχάλης", sourceUrl: "https://www.hatzimichalis.gr", personName: "Δημήτρης Χατζημιχάλης" },
    editorial: { category: "editorial", src: "https://images.squarespace-cdn.com/content/v1/5fa046fb979c1b05b3dde3ff/33d963ed-ef73-4d64-87d2-9a91bd38d72e/IMG_9539_Xatzimixalis-1.jpg", width: 2500, height: 1667, alt: "Η οικογένεια Χατζημιχάλη", sourceUrl: "https://www.hatzimichalis.gr" },
  },

  "domaine-porto-carras": {
    hero: { category: "hero", src: "https://domaineportocarras.com/assets/img/ktima.jpeg", width: 1600, height: 1067, alt: "Domaine Porto Carras, Χαλκιδική", sourceUrl: "https://domaineportocarras.com" },
    vineyard: { category: "vineyard", src: "https://domaineportocarras.com/assets/img/terroir-origin3.jpeg", width: 1600, height: 1066, alt: "Αμπελώνας Porto Carras", sourceUrl: "https://domaineportocarras.com" },
    winery: { category: "winery", src: "https://domaineportocarras.com/assets/img/cellar-porto.jpeg", width: 1600, height: 1067, alt: "Το κελάρι του Porto Carras", sourceUrl: "https://domaineportocarras.com" },
    editorial: { category: "editorial", src: "https://domaineportocarras.com/assets/img/private-moments.jpeg", width: 1200, height: 1600, alt: "Γευσιγνωσία στο Porto Carras", sourceUrl: "https://domaineportocarras.com" },
  },
  "estate-argyros": {
    hero: { category: "hero", src: "https://estateargyros.com/wp-content/uploads/2024/02/winery-main.webp", width: 1160, height: 770, alt: "Estate Argyros, Σαντορίνη", sourceUrl: "https://estateargyros.com" },
    winery: { category: "winery", src: "https://estateargyros.com/wp-content/uploads/2024/02/Estate-Argyros-winery-2.webp", width: 2000, height: 1335, alt: "Το οινοποιείο Estate Argyros", sourceUrl: "https://estateargyros.com" },
    people: { category: "people", src: "https://estateargyros.com/wp-content/uploads/2024/02/Matthew-Argyros-in-the-cellar-2.webp", width: 1382, height: 922, alt: "Matthew Argyros στο κελάρι", sourceUrl: "https://estateargyros.com", personName: "Matthew Argyros" },
  },
  "gavalas-winery": {
    hero: { category: "hero", src: "https://static.wixstatic.com/media/8569ce_a17e1c027af84d0e8305524d0dfcfc90~mv2.jpg", width: 7244, height: 3762, alt: "Gavalas Winery, Σαντορίνη", sourceUrl: "https://www.gavalaswines.gr" },
  },
  "idaia-winery": {
    hero: { category: "hero", src: "https://www.idaiawinery.com/wp-content/uploads/2026/02/idaia-winery-6.jpeg", width: 1920, height: 1280, alt: "Idaia Winery, Δαφνές", sourceUrl: "https://www.idaiawinery.com" },
    vineyard: { category: "vineyard", src: "https://www.idaiawinery.com/wp-content/uploads/2023/03/thumbnail-3-1-640x480.jpg", width: 640, height: 480, alt: "Αμπελώνας Idaia Winery", sourceUrl: "https://www.idaiawinery.com" },
    winery: { category: "winery", src: "https://www.idaiawinery.com/wp-content/uploads/2026/02/idaia-winery-7-640x480.jpeg", width: 640, height: 480, alt: "Το οινοποιείο Idaia", sourceUrl: "https://www.idaiawinery.com" },
  },
  "karavitakis": {
    hero: { category: "hero", src: "https://www.karavitakiswines.com/wp-content/uploads/2019/04/karavitakis-slider1.jpg", width: 1920, height: 1080, alt: "Karavitakis Winery, Χανιά", sourceUrl: "https://www.karavitakiswines.com" },
    winery: { category: "winery", src: "https://www.karavitakiswines.com/wp-content/uploads/2018/07/barrels02.jpg", width: 1920, height: 750, alt: "Κελάρι Karavitakis", sourceUrl: "https://www.karavitakiswines.com" },
    editorial: { category: "editorial", src: "https://www.karavitakiswines.com/wp-content/uploads/2019/04/tasting.jpg", width: 1920, height: 900, alt: "Γευσιγνωσία Karavitakis", sourceUrl: "https://www.karavitakiswines.com" },
  },
  "katogi-averoff": {
    hero: { category: "hero", src: "https://katogiaveroff.gr/thumbs/o-topos-mas/winery-1128x480.jpg", width: 1128, height: 480, alt: "Katogi Averoff, Μέτσοβο", sourceUrl: "https://katogiaveroff.gr" },
    vineyard: { category: "vineyard", src: "https://katogiaveroff.gr/thumbs/o-topos-mas/giniets-1024x480.jpg", width: 1024, height: 480, alt: "Αμπελώνας Katogi Averoff", sourceUrl: "https://katogiaveroff.gr" },
    editorial: { category: "editorial", src: "https://katogiaveroff.gr/thumbs/o-topos-mas/metsovo-night-1020x600.jpg", width: 1020, height: 600, alt: "Το Μέτσοβο τη νύχτα", sourceUrl: "https://katogiaveroff.gr" },
  },
  "kechris": {
    hero: { category: "hero", src: "https://www.kechris.gr/modules/homeslider/images/c765d146793c3b56e5e28c861c73cd3a0b040061_KECHRIS_WINERY1.jpg", width: 3000, height: 2000, alt: "Kechris Winery, Θεσσαλονίκη", sourceUrl: "https://www.kechris.gr" },
  },
  "kitrvs": {
    hero: { category: "hero", src: "https://kitrus.gr/wp-content/uploads/2022/07/01.jpg", width: 1000, height: 810, alt: "Kitrvs Winery, Πιερία", sourceUrl: "https://kitrus.gr" },
    vineyard: { category: "vineyard", src: "https://kitrus.gr/wp-content/uploads/2022/11/kitrus1-1.jpg", width: 1000, height: 1290, alt: "Αμπελώνας Kitrvs", sourceUrl: "https://kitrus.gr" },
    winery: { category: "winery", src: "https://kitrus.gr/wp-content/uploads/2022/12/4-1.jpg", width: 1000, height: 1290, alt: "Το οινοποιείο Kitrvs", sourceUrl: "https://kitrus.gr" },
  },

  "koutsoyannopoulos-winery": {
    hero: { category: "hero", src: "https://kwm.gr/images/gallery/santorini_wine_museum_gallery03.jpg", width: 1000, height: 667, alt: "Koutsoyannopoulos Winery & Museum, Σαντορίνη", sourceUrl: "https://kwm.gr" },
    winery: { category: "winery", src: "https://kwm.gr/images/gallery/wine-museum-05.jpg", width: 1000, height: 667, alt: "Το μουσείο κρασιού Koutsoyannopoulos", sourceUrl: "https://kwm.gr" },
    editorial: { category: "editorial", src: "https://kwm.gr/images/gallery/santorini_wine_museum_gallery01.jpg", width: 1000, height: 667, alt: "Εσωτερικό μουσείου Koutsoyannopoulos", sourceUrl: "https://kwm.gr" },
  },
  "lafazanis-winery": {
    hero: { category: "hero", src: "https://lafazanis.gr/wp-content/uploads/2026/01/lafazanis-winery-company-hero.jpg", width: 1200, height: 800, alt: "Lafazanis Winery, Νεμέα", sourceUrl: "https://lafazanis.gr" },
    vineyard: { category: "vineyard", src: "https://lafazanis.gr/wp-content/uploads/2026/01/vineyards-hero.jpg", width: 1200, height: 800, alt: "Αμπελώνας Lafazanis", sourceUrl: "https://lafazanis.gr" },
    winery: { category: "winery", src: "https://lafazanis.gr/wp-content/uploads/2026/02/lafazanis-winery-winery-cover.jpg", width: 1200, height: 800, alt: "Το οινοποιείο Lafazanis", sourceUrl: "https://lafazanis.gr" },
  },
  "mesimvria-winery": {
    hero: { category: "hero", src: "https://mesimvriawines.gr/wp-content/uploads/2025/07/Mesimvria_Wines_0155-1024x683.jpg", width: 1024, height: 683, alt: "Mesimvria Winery, Θεσσαλονίκη", sourceUrl: "https://mesimvriawines.gr" },
    vineyard: { category: "vineyard", src: "https://mesimvriawines.gr/wp-content/uploads/2025/07/ampeli-1-1024x576.jpg", width: 1024, height: 576, alt: "Αμπελώνας Mesimvria", sourceUrl: "https://mesimvriawines.gr" },
    winery: { category: "winery", src: "https://mesimvriawines.gr/wp-content/uploads/2025/07/barel-1-1024x576.jpg", width: 1024, height: 576, alt: "Κελάρι Mesimvria", sourceUrl: "https://mesimvriawines.gr" },
    editorial: { category: "editorial", src: "https://mesimvriawines.gr/wp-content/uploads/2025/07/xoros-parousiasi.jpg", width: 640, height: 960, alt: "Χώρος παρουσίασης Mesimvria", sourceUrl: "https://mesimvriawines.gr" },
  },
  "monemvasia-winery-tsimbidi": {
    hero: { category: "hero", src: "https://www.monemvasiawinery.gr/wp-content/uploads/2025/06/fri_mon_social-77.jpg.webp", width: 1920, height: 1440, alt: "Monemvasia Winery Tsimbidi", sourceUrl: "https://www.monemvasiawinery.gr" },
    winery: { category: "winery", src: "https://www.monemvasiawinery.gr/wp-content/uploads/2025/06/fri_monem-69.jpg.webp", width: 1920, height: 1440, alt: "Κελάρι Monemvasia Winery Tsimbidi", sourceUrl: "https://www.monemvasiawinery.gr" },
    editorial: { category: "editorial", src: "https://www.monemvasiawinery.gr/wp-content/uploads/2025/06/fri_mon_social-132.jpg.webp", width: 1920, height: 1440, alt: "Ατμόσφαιρα στο Monemvasia Winery Tsimbidi", sourceUrl: "https://www.monemvasiawinery.gr" },
  },
  "patoinos-winery": {
    hero: { category: "hero", src: "https://gr.patoinos.ch/images/g/mosaique2-3222.jpg", width: 3222, height: 708, alt: "Patoinos, Πάτμος", sourceUrl: "https://gr.patoinos.ch" },
    people: { category: "people", src: "https://gr.patoinos.ch/images/b/zisyadis_1-1014.jpg", width: 1014, height: 1388, alt: "Josef Zisyadis", sourceUrl: "https://gr.patoinos.ch", personName: "Josef Zisyadis" },
    editorial: { category: "editorial", src: "https://gr.patoinos.ch/images/l/mosaique1-3222.jpg", width: 3222, height: 1416, alt: "Patoinos, Πάτμος", sourceUrl: "https://gr.patoinos.ch" },
  },
  "pnevmatikakis-winery": {
    hero: { category: "hero", src: "https://pnevmatikakiswinery.gr/wp-content/uploads/2021/04/DJI_0002.jpg", width: 1920, height: 1080, alt: "Pnevmatikakis Winery, Κίσσαμος, Χανιά (drone)", sourceUrl: "https://pnevmatikakiswinery.gr" },
    winery: { category: "winery", src: "https://pnevmatikakiswinery.gr/wp-content/uploads/2021/04/20130419-IMG_4804-2-scaled-2-1.jpg", width: 1920, height: 1280, alt: "Το οινοποιείο Pnevmatikakis", sourceUrl: "https://pnevmatikakiswinery.gr" },
    editorial: { category: "editorial", src: "https://pnevmatikakiswinery.gr/wp-content/uploads/2021/03/IMG_3532.jpg", width: 1147, height: 1027, alt: "Πέτρινη κάβα/μουσείο Pnevmatikakis", sourceUrl: "https://pnevmatikakiswinery.gr" },
  },
  "santo-wines": {
    hero: { category: "hero", src: "https://santowines.gr/images/santowines-volcanic-heritage.jpg", width: 800, height: 476, alt: "Santo Wines, Σαντορίνη", sourceUrl: "https://santowines.gr" },
    editorial: { category: "editorial", src: "https://santowines.gr/images/homepage-oenotourism-center/wine-tasting.jpg", width: 1000, height: 666, alt: "Γευσιγνωσία Santo Wines", sourceUrl: "https://santowines.gr" },
  },
  "sarris-winery": {
    hero: { category: "hero", src: "https://sarriswinery.com/wp-content/uploads/2020/04/sarris_winery_view_1919X500_bw3.jpg", width: 1919, height: 500, alt: "Sarris Winery, Κεφαλονιά", sourceUrl: "https://sarriswinery.com" },
    editorial: { category: "editorial", src: "https://sarriswinery.com/wp-content/uploads/2026/02/DSC00299-Large.jpeg", width: 1280, height: 853, alt: "Sarris Winery", sourceUrl: "https://sarriswinery.com" },
  },
  "sclavos-wines": {
    hero: { category: "hero", src: "https://content.4ty.gr/subdomain-bgslideshows/57872/FONTO-SCLAVOS.jpg", width: 1920, height: 780, alt: "Sclavos Wines, Κεφαλονιά", sourceUrl: "https://sclavoswines.gr" },
    vineyard: { category: "vineyard", src: "https://content.4ty.gr/subdomain-bgslideshows/57872/1s5s.jpg", width: 1920, height: 780, alt: "Αμπελώνας Sclavos", sourceUrl: "https://sclavoswines.gr" },
    editorial: { category: "editorial", src: "https://content.4ty.gr/merchants/exclusive_urls/57872/sclavoswines01072022-04.jpg", width: 1600, height: 1000, alt: "Γευσιγνωσία Sclavos", sourceUrl: "https://sclavoswines.gr" },
  },

  "semeli-estate": {
    hero: { category: "hero", src: "https://www.semeliestate.gr/wp-content/uploads/2021/06/home-03.jpg", width: 1920, height: 1080, alt: "Semeli Estate, Νεμέα", sourceUrl: "https://www.semeliestate.gr" },
    vineyard: { category: "vineyard", src: "https://www.semeliestate.gr/wp-content/uploads/2021/06/home-06.jpg", width: 1920, height: 1080, alt: "Αμπελώνας Semeli Estate", sourceUrl: "https://www.semeliestate.gr" },
    winery: { category: "winery", src: "https://www.semeliestate.gr/wp-content/uploads/2021/06/home-08.jpg", width: 1920, height: 1080, alt: "Το οινοποιείο Semeli Estate", sourceUrl: "https://www.semeliestate.gr" },
    editorial: { category: "editorial", src: "https://www.semeliestate.gr/wp-content/uploads/2023/02/home-05b.jpg", width: 1920, height: 1080, alt: "Semeli Estate", sourceUrl: "https://www.semeliestate.gr" },
  },
  "tetramythos-winery": {
    hero: { category: "hero", src: "https://www.tetramythoswines.com/wp-content/uploads/2025/07/TETRAMYTHOS-304.jpg", width: 888, height: 510, alt: "Tetramythos Winery, Πάτρα", sourceUrl: "https://www.tetramythoswines.com" },
    vineyard: { category: "vineyard", src: "https://www.tetramythoswines.com/wp-content/uploads/2025/07/P9050323-n.jpg", width: 680, height: 510, alt: "Αμπελώνας Tetramythos", sourceUrl: "https://www.tetramythoswines.com" },
    winery: { category: "winery", src: "https://www.tetramythoswines.com/wp-content/uploads/2025/07/Tetramythos-Winery-15.jpg", width: 1000, height: 750, alt: "Το οινοποιείο Tetramythos", sourceUrl: "https://www.tetramythoswines.com" },
  },
  "troupis-winery": {
    hero: { category: "hero", src: "https://www.troupiswinery.gr/wp-content/uploads/2020/06/home-hero-01.jpg", width: 1600, height: 721, alt: "Troupis Winery, Μαντινεία", sourceUrl: "https://www.troupiswinery.gr" },
    winery: { category: "winery", src: "https://www.troupiswinery.gr/wp-content/uploads/2020/06/home-oinopoieio-01-1.jpg", width: 1175, height: 763, alt: "Το οινοποιείο Troupis", sourceUrl: "https://www.troupiswinery.gr" },
    editorial: { category: "editorial", src: "https://www.troupiswinery.gr/wp-content/uploads/2020/07/xenagisi-HERO-03.jpg", width: 1600, height: 1067, alt: "Ξενάγηση στο Troupis Winery", sourceUrl: "https://www.troupiswinery.gr" },
  },
  "vassaltis-vineyards": {
    hero: { category: "hero", src: "https://vassaltis.com/wp-content/uploads/2020/09/05_Horizontal-scaled-e1601372078182.jpg", width: 1920, height: 1268, alt: "Vassaltis Vineyards, Σαντορίνη", sourceUrl: "https://vassaltis.com" },
    vineyard: { category: "vineyard", src: "https://vassaltis.com/wp-content/uploads/2020/09/12_Horizontal-scaled-e1601372114915.jpg", width: 1920, height: 1268, alt: "Αμπελώνας Vassaltis", sourceUrl: "https://vassaltis.com" },
    winery: { category: "winery", src: "https://vassaltis.com/wp-content/uploads/2020/06/008.jpg", width: 1920, height: 1440, alt: "Το οινοποιείο Vassaltis", sourceUrl: "https://vassaltis.com" },
  },
  "zacharias-winery": {
    hero: { category: "hero", src: "https://zacharias.gr/wp-content/uploads/2022/05/1920x1129_2.jpg", width: 1920, height: 1129, alt: "Zacharias Winery, Νεμέα", sourceUrl: "https://zacharias.gr" },
    vineyard: { category: "vineyard", src: "https://zacharias.gr/wp-content/uploads/2021/04/Field-with-Vines.jpg", width: 1750, height: 899, alt: "Αμπελώνας Zacharias", sourceUrl: "https://zacharias.gr" },
    editorial: { category: "editorial", src: "https://zacharias.gr/wp-content/uploads/2021/04/Grapes.jpg", width: 1920, height: 1129, alt: "Σταφύλια Zacharias", sourceUrl: "https://zacharias.gr" },
  },
  "alpha-estate": {
    hero: { category: "hero", src: "https://alpha-estate.com/wp-content/uploads/2023/01/alpha-estate-03.jpg", width: 1251, height: 834, alt: "Alpha Estate, Αμύνταιο", sourceUrl: "https://alpha-estate.com" },
    vineyard: { category: "vineyard", src: "https://alpha-estate.com/wp-content/uploads/2023/01/home_vineyards_3.jpg", width: 816, height: 1224, alt: "Αμπελώνας Alpha Estate", sourceUrl: "https://alpha-estate.com" },
    winery: { category: "winery", src: "https://alpha-estate.com/wp-content/uploads/2023/01/home_winery_1.jpg", width: 1244, height: 1868, alt: "Το οινοποιείο Alpha Estate", sourceUrl: "https://alpha-estate.com" },
    editorial: { category: "editorial", src: "https://alpha-estate.com/wp-content/uploads/2023/01/home_estate_3.jpg", width: 858, height: 1286, alt: "Alpha Estate", sourceUrl: "https://alpha-estate.com" },
  },
  "vourvoukeli-estate": {
    hero: { category: "hero", src: "https://vourvoukeli.gr/wp-content/uploads/2015/09/GRAPE1.jpg", width: 1900, height: 1200, alt: "Κτήμα Βουρβουκέλη, Άβδηρα", sourceUrl: "https://vourvoukeli.gr" },
    winery: { category: "winery", src: "https://vourvoukeli.gr/wp-content/uploads/2015/09/VintageShopV1.jpg", width: 600, height: 600, alt: "Το οινοποιείο Βουρβουκέλη", sourceUrl: "https://vourvoukeli.gr" },
  },

  "theopetra-estate": {
    hero: { category: "hero", src: "https://www.tsililis.gr/img/front/Intro4_photosSpilaioTheopetra.jpg", width: 990, height: 450, alt: "Το Σπήλαιο Θεόπετρας, δίπλα στο Κτήμα Θεόπετρα", sourceUrl: "https://www.tsililis.gr" },
    vineyard: { category: "vineyard", src: "https://www.tsililis.gr/img/front/Intro3_photosVineyards.jpg", width: 990, height: 450, alt: "Αμπελώνας Κτήμα Θεόπετρα", sourceUrl: "https://www.tsililis.gr" },
    winery: { category: "winery", src: "https://www.tsililis.gr/img/front/Intro6_photosApostaktiria.jpg", width: 990, height: 450, alt: "Αποστακτήριο Κτήμα Θεόπετρα", sourceUrl: "https://www.tsililis.gr" },
    editorial: { category: "editorial", src: "https://www.tsililis.gr/img/front/Intro2_photosMeteoraGenika.jpg", width: 990, height: 450, alt: "Τα Μετέωρα, δίπλα στο Κτήμα Θεόπετρα", sourceUrl: "https://www.tsililis.gr" },
  },
  "domaine-kikones": {
    hero: { category: "hero", src: "https://www.kikones.gr/images/stories/IMG_3209.jpg", width: 4032, height: 3024, alt: "Κτήμα Κίκονες, Μαρώνεια", sourceUrl: "https://www.kikones.gr" },
    vineyard: { category: "vineyard", src: "https://www.kikones.gr/images/upload_slides/homepage.jpg", width: 1200, height: 500, alt: "Αμπελώνας Κίκονες", sourceUrl: "https://www.kikones.gr" },
  },
  "kir-yianni": {
    hero: { category: "hero", src: "https://kiryianni-b3ddi.kinsta.storage/production/uploads/2020/01/KYRYIANNI_54-1.jpg", width: 1600, height: 1067, alt: "Κτήμα Κυρ-Γιάννη, Νάουσα", sourceUrl: "https://kiryianni.gr" },
    vineyard: { category: "vineyard", src: "https://kiryianni-b3ddi.kinsta.storage/production/uploads/2026/07/Naoussa-vineyard-1-960x640.jpg", width: 960, height: 640, alt: "Αμπελώνας Νάουσας, Κυρ-Γιάννη", sourceUrl: "https://kiryianni.gr" },
    editorial: { category: "editorial", src: "https://kiryianni-b3ddi.kinsta.storage/production/uploads/2022/04/DSC08416-1-1600x1200.jpg", width: 1600, height: 1200, alt: "Κτήμα Κυρ-Γιάννη", sourceUrl: "https://kiryianni.gr" },
  },
  "costa-lazaridi": {
    // ⚠ Data-quality flag (ξεχωριστό, ήδη καταγεγραμμένο): το websiteUrl στη
    // βάση δείχνει στο παλιό domaine-lazaridi.gr, το οποίο redirect-άρει σε
    // estates-costalazaridi.gr — οι παρακάτω εικόνες είναι ήδη από το σωστό,
    // ενεργό domain. ΔΕΝ διορθώνεται το websiteUrl σε αυτό το pass.
    hero: { category: "hero", src: "https://estates-costalazaridi.gr/wp-content/uploads/2026/07/DJI_0722-1600x1066.jpg", width: 1600, height: 1066, alt: "Κτήμα Κώστα Λαζαρίδη, Δράμα (drone)", sourceUrl: "https://estates-costalazaridi.gr/drama-estate/" },
    vineyard: { category: "vineyard", src: "https://estates-costalazaridi.gr/wp-content/uploads/2026/07/katafyto-2-1024x683.jpg", width: 1024, height: 683, alt: "Αμπελώνας Κτήμα Κώστα Λαζαρίδη, Δράμα", sourceUrl: "https://estates-costalazaridi.gr/drama-estate/" },
    winery: { category: "winery", src: "https://estates-costalazaridi.gr/wp-content/uploads/2026/04/Drama_Estate-scaled.jpg", alt: "Το κτήμα στη Δράμα", sourceUrl: "https://estates-costalazaridi.gr/drama-estate/" },
    editorial: { category: "editorial", src: "https://estates-costalazaridi.gr/wp-content/uploads/2026/02/Lazaridis-Spring-%CE%96-1996-scaled.jpg", width: 2560, height: 1707, alt: "Ιστορικό αρχείο, Κώστα Λαζαρίδη", sourceUrl: "https://estates-costalazaridi.gr/drama-estate/" },
  },
  "muses-estate": {
    hero: { category: "hero", src: "https://static.wixstatic.com/media/55add3_a411c743ffee495aa53d654808b0aecf~mv2_d_5616_3744_s_4_2.jpg", width: 5616, height: 3744, alt: "Κτήμα Μουσών, Βοιωτία", sourceUrl: "https://www.musesestate.com" },
    vineyard: { category: "vineyard", src: "https://static.wixstatic.com/media/55add3_8c0e8a0c46d54b76867dcd3bd7e216ca~mv2_d_3992_2242_s_2.jpg", width: 3992, height: 2242, alt: "Αμπελώνας Κτήμα Μουσών", sourceUrl: "https://www.musesestate.com" },
  },
  "domaine-skouras": {
    hero: { category: "hero", src: "https://skouras.gr/wp-content/uploads/2023/07/skouras-winery-today-700x429.jpg", width: 700, height: 429, alt: "Κτήμα Σκούρα, Νεμέα", sourceUrl: "https://skouras.gr" },
    vineyard: { category: "vineyard", src: "https://skouras.gr/wp-content/uploads/2023/07/skouras-ampelia-700x429.jpg", width: 700, height: 429, alt: "Αμπελώνας Κτήμα Σκούρα", sourceUrl: "https://skouras.gr" },
    people: { category: "people", src: "https://skouras.gr/wp-content/uploads/2023/07/Skouras_WineHarvest_Team-700x560.jpg", width: 700, height: 560, alt: "Ομάδα τρύγου, Κτήμα Σκούρα", sourceUrl: "https://skouras.gr" },
  },
  "ktima-tselepos": {
    // ⚠ FLAGGED multi-location: αποκλειστικά από τη Μαντινεία-specific
    // υποσελίδα του tselepos.gr — ποτέ το Σαντορίνης υλικό.
    hero: { category: "hero", src: "https://tselepos.gr/wp-content/uploads/2019/10/ktima_tselepos_photo_1.jpg", width: 2000, height: 1100, alt: "Κτήμα Τσέλεπος, Μαντινεία", sourceUrl: "https://tselepos.gr/ktima-tselepou/" },
  },
  "mikra-thira": {
    hero: { category: "hero", src: "https://mikrathira.com/wp-content/uploads/2024/02/home-page.png.webp", width: 1920, height: 1280, alt: "Μικρά Θήρα, Σαντορίνη", sourceUrl: "https://mikrathira.com" },
  },
  "mikro-ktima-titou": {
    // Μόνο Hero — το καταγεγραμμένο editorial URL (goumenissa_photo.jpg)
    // επέστρεψε 404 σε επαλήθευση, δεν χρησιμοποιείται μαντεμένο εναλλακτικό.
    hero: { category: "hero", src: "https://www.mikroktimatitos.com/wp-content/uploads/2022/11/intro_photo.png", width: 1920, height: 689, alt: "Μικρό Κτήμα Τίτου, Γουμένισσα", sourceUrl: "https://www.mikroktimatitos.com" },
  },
  "garalis-winery": {
    hero: { category: "hero", src: "https://garaliswinery.gr/wp-content/uploads/2022/12/vineyard-home.jpg", width: 1920, height: 1280, alt: "Οινοποιείο Γκαράλη, Λήμνος", sourceUrl: "https://garaliswinery.gr" },
    people: { category: "people", src: "https://garaliswinery.gr/wp-content/uploads/2022/12/manolis-home2.jpg", width: 1920, height: 1080, alt: "Μανώλης Γκαράλης", sourceUrl: "https://garaliswinery.gr", personName: "Μανώλης Γκαράλης" },
    editorial: { category: "editorial", src: "https://garaliswinery.gr/wp-content/uploads/2022/12/wines-home3696.jpg", width: 1588, height: 1059, alt: "Κρασιά Γκαράλη", sourceUrl: "https://garaliswinery.gr" },
  },
  "douloufakis": {
    hero: { category: "hero", src: "https://media.douloufakis.wine/uploads/2025/04/2-douloufakis-winery-crete.jpg", width: 1920, height: 1280, alt: "Οινοποιείο Δουλουφάκη, Δαφνές, Κρήτη", sourceUrl: "https://douloufakis.wine" },
    winery: { category: "winery", src: "https://media.douloufakis.wine/uploads/2025/04/11-wine-cellar-douloufakis.jpg", width: 1920, height: 1280, alt: "Το κελάρι Δουλουφάκη", sourceUrl: "https://douloufakis.wine" },
    people: { category: "people", src: "https://media.douloufakis.wine/uploads/2025/04/5-oenologist-winemaker-douloufakis-nikos.jpg", width: 1920, height: 1280, alt: "Νίκος Δουλουφάκης", sourceUrl: "https://douloufakis.wine", personName: "Νίκος Δουλουφάκης" },
    editorial: { category: "editorial", src: "https://media.douloufakis.wine/uploads/2025/04/19-wine-tasting-room.jpg", width: 1920, height: 1281, alt: "Χώρος γευσιγνωσίας Δουλουφάκη", sourceUrl: "https://douloufakis.wine" },
  },

  "lyrarakis": {
    hero: { category: "hero", src: "https://www.lyrarakis.com/img/backgrounds/lyra_bg.jpg", width: 1920, height: 1080, alt: "Οινοποιείο Λυραράκη, Κρήτη", sourceUrl: "https://www.lyrarakis.com" },
    people: { category: "people", src: "https://www.lyrarakis.com/img/backgrounds/lyrarakis_about.jpg", width: 1920, height: 1282, alt: "Η οικογένεια Λυραράκη", sourceUrl: "https://www.lyrarakis.com", personName: "Η οικογένεια Λυραράκη" },
  },
  "oinopoieio-ntougkos": {
    // Χρησιμοποιείται η πραγματική φωτογραφία κτηρίου (όχι το γενικό
    // product-shot ποτήρι/σταφύλια που βρέθηκε στην ίδια σελίδα).
    hero: { category: "hero", src: "https://www.rapsaniwine.gr/wp-content/uploads/2016/04/IMG_20160311_edit.jpg", width: 3838, height: 2368, alt: "Οινοποιείο Ντούγκος (Χρυσοχόου), Ραψάνη", sourceUrl: "https://www.rapsaniwine.gr" },
  },
  "papagiannakos-winery": {
    hero: { category: "hero", src: "https://papagiannakos.gr/wp-content/uploads/2022/12/building.jpg", width: 1600, height: 800, alt: "Οινοποιείο Παπαγιαννάκος, Αττική", sourceUrl: "https://papagiannakos.gr" },
    vineyard: { category: "vineyard", src: "https://papagiannakos.gr/wp-content/uploads/2022/12/ampelonas_papagiannakou.jpg", width: 1600, height: 834, alt: "Αμπελώνας Παπαγιαννάκος", sourceUrl: "https://papagiannakos.gr" },
    people: { category: "people", src: "https://papagiannakos.gr/wp-content/uploads/2022/12/VassilisTractor155_.jpg", width: 1600, height: 900, alt: "Βασίλης στο αμπέλι, Παπαγιαννάκος", sourceUrl: "https://papagiannakos.gr", personName: "Βασίλης" },
    editorial: { category: "editorial", src: "https://papagiannakos.gr/wp-content/uploads/2023/03/127_bw.jpg", width: 1475, height: 800, alt: "Παπαγιαννάκος", sourceUrl: "https://papagiannakos.gr" },
  },
};
