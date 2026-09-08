// Domaine Porto Carras (Σιθωνία, Χαλκιδική) — πλήρης κατάλογος 12 κρασιών
// από τις επίσημες σελίδες προϊόντων στο domaineportocarras.com/wines/wine/.
// Η υπάρχουσα εγγραφή "Melissanthi" δεν εμφανίζεται πλέον στον τρέχοντα
// κατάλογο του site — παραμένει άθικτη.
//
// appellation: η υπάρχουσα περιοχή "Χαλκιδική" καλύπτει ήδη επίσημα τη ζώνη
// «Πλαγιές Μελίτωνα» (βλ. περιγραφή περιοχής) και τη χερσόνησο της
// Σιθωνίας, οπότε δεν χρειάστηκε νέα περιοχή — μόνο το wine.appellation
// διαφοροποιείται ανά κρασί (PDO για Πλαγιές Μελίτωνα, PGI για Χαλκιδική/
// Σιθωνία, null όπου δεν αναγράφεται καθόλου ΠΟΠ/ΠΓΕ στην επίσημη σελίδα).

import { Appellation, ContentStatus, WineColor, WineStyle } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "domaine-porto-carras" } });
  const chalkidiki = await prisma.region.findUniqueOrThrow({ where: { slug: "chalkidiki" } });

  await prisma.winery.update({
    where: { slug: "domaine-porto-carras" },
    data: {
      websiteUrl: "https://domaineportocarras.com",
      story:
        "Στην καρδιά της Σιθωνίας, στις Πλαγιές του όρους Μελίτωνα, το Κτήμα Πόρτο Καρράς παραμένει ένας ιστορικός προορισμός που συνεχίζει να συμβάλει αποφασιστικά στη διαμόρφωση της σύγχρονης ελληνικής οινικής εμπειρίας.\n\nΤο περίφημο Domaine Porto Carras δεν είναι απλώς ένας τόπος παραγωγής κρασιού, είναι ένα προικισμένο οικοσύστημα που εξελίσσεται, δημιουργεί και αφηγείται ιστορίες μέσα από κάθε του σοδειά.\n\nΕδώ η παράδοση δεν διατηρείται, επαναπροσδιορίζεται, και κάθε φιάλη αποτελεί συνέχεια μιας κληρονομιάς που ξεκίνησε από τη δεκαετία του 1960, όταν δημιουργήθηκε ένας από τους μεγαλύτερους ενιαίους βιολογικούς αμπελώνες της Ευρώπης, με όραμα, τόλμη και βαθιά αγάπη για τη γη.\n\nΟ αμπελώνας αυτός αποτέλεσε ένα λίκνο πειραματισμού ελληνικών και ξενικών ποικιλιών, που στη συνέχεια αξιοποιήθηκαν και αποτελούν σήμερα πυλώνες της ελληνικής οινοπαραγωγής.\n\nΕδώ διασώθηκε η Μαλαγουζιά και καλλιεργήθηκε για πρώτη φορά το Ασύρτικο σε αμπελώνα εκτός Σαντορίνης. Οι ποικιλίες αυτές έχουν σήμερα αξιοποιηθεί σε όλη την ελληνική επικράτεια και αναδειχθεί σε πρωταγωνιστές της σύγχρονης ταυτότητας των ελληνικών οίνων.\n\nΞεχωριστή θέση σε αυτή την κληρονομιά κατέχει το Λημνιό, η αρχαιότερη καταγεγραμμένη ελληνική ποικιλία, με αναφορές ήδη από τον Αριστοτέλη. Το Κτήμα Πόρτο Καρράς υπήρξε πρωτοπόρο στην αναβίωσή της, συμβάλλοντας καθοριστικά στην επαναφορά της στο σύγχρονο ελληνικό αμπελοτόπι.\n\nΟι αμπελώνες του κτήματος, με ιστορία που εκτείνεται σε περισσότερα από 50 χρόνια, συνεχίζουν να καλλιεργούνται με σεβασμό στο terroir και προσήλωση στην ποιότητα, αποτυπώνοντας σε κάθε εσοδεία τον χαρακτήρα του τόπου.",
    },
  });

  const malagousia = await prisma.variety.findUniqueOrThrow({ where: { slug: "malagousia" } });
  const assyrtiko = await prisma.variety.findUniqueOrThrow({ where: { slug: "asyrtiko" } });
  const athiri = await prisma.variety.findUniqueOrThrow({ where: { slug: "athiri" } });
  const sauvignonBlanc = await prisma.variety.findUniqueOrThrow({ where: { slug: "sauvignon-blanc" } });
  const roditis = await prisma.variety.findUniqueOrThrow({ where: { slug: "roditis" } });
  const cabernetSauvignon = await prisma.variety.findUniqueOrThrow({ where: { slug: "cabernet-sauvignon" } });
  const cabernetFranc = await prisma.variety.findUniqueOrThrow({ where: { slug: "cabernet-franc" } });
  const merlot = await prisma.variety.findUniqueOrThrow({ where: { slug: "merlot" } });
  const limnio = await prisma.variety.findUniqueOrThrow({ where: { slug: "limnio" } });
  const syrahVariety = await prisma.variety.findUniqueOrThrow({ where: { slug: "syrah" } });

  async function upsertWine(spec: {
    slug: string;
    name: string;
    vintage: number | null;
    abv: number | null;
    color: WineColor;
    style: WineStyle;
    appellation: Appellation | null;
    description: string;
    tastingNotes: string;
    vineyardNotes: string | null;
    winemakingNotes: string | null;
    servingTemp: string | null;
    foodPairings: string[];
    varieties: Array<{ varietyId: string; percentage: number | null }>;
  }) {
    const wine = await prisma.wine.upsert({
      where: { slug: spec.slug },
      update: {
        name: spec.name,
        regionId: chalkidiki.id,
        vintage: spec.vintage,
        abv: spec.abv,
        color: spec.color,
        style: spec.style,
        appellation: spec.appellation,
        description: spec.description,
        tastingNotes: spec.tastingNotes,
        vineyardNotes: spec.vineyardNotes,
        winemakingNotes: spec.winemakingNotes,
        servingTemp: spec.servingTemp,
        foodPairings: spec.foodPairings,
        status: ContentStatus.PUBLISHED,
      },
      create: {
        slug: spec.slug,
        name: spec.name,
        wineryId: winery.id,
        regionId: chalkidiki.id,
        vintage: spec.vintage,
        abv: spec.abv,
        color: spec.color,
        style: spec.style,
        appellation: spec.appellation,
        description: spec.description,
        tastingNotes: spec.tastingNotes,
        vineyardNotes: spec.vineyardNotes,
        winemakingNotes: spec.winemakingNotes,
        servingTemp: spec.servingTemp,
        foodPairings: spec.foodPairings,
        status: ContentStatus.PUBLISHED,
      },
    });
    await prisma.varietyOnWine.deleteMany({ where: { wineId: wine.id } });
    for (const v of spec.varieties) {
      await prisma.varietyOnWine.create({ data: { wineId: wine.id, varietyId: v.varietyId, percentage: v.percentage } });
    }
    console.log(`✓ ${spec.slug}`);
    return wine;
  }

  console.log("Domaine Porto Carras — 12 κρασιά…");

  await upsertWine({
    slug: "porto-carras-malagouzia",
    name: "Μαλαγουζιά",
    vintage: null,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    description:
      "100% Μαλαγουζιά, καλλιεργημένη βιολογικά στους αμπελώνες του Domaine Porto Carras στις πλαγιές του Μελίτωνα. Η ποικιλία είναι άρρηκτα συνδεδεμένη με την ιστορία του κτήματος — εδώ ξεκίνησε στα τέλη της δεκαετίας του 1960 η αναβίωση της τότε σχεδόν εξαφανισμένης ποικιλίας, συμβάλλοντας καθοριστικά στη διάσωση και καθιέρωσή της ως μία από τις πλέον αναγνωρίσιμες ελληνικές ποικιλίες διεθνώς.",
    tastingNotes:
      "Λαμπερό κιτρινοπράσινο χρώμα. Σύνθετα αρώματα λευκών λουλουδιών, εσπεριδοειδών και εξωτικών φρούτων, με νότες ροδάκινου, μάνγκο, βασιλικού και φρέσκιας μέντας. Πλούσια και ισορροπημένη στο στόμα, με δροσερή οξύτητα, γεμάτο σώμα και μακρά αρωματική επίγευση.",
    vineyardNotes: "Βιολογικοί αμπελώνες στις πλαγιές του Μελίτωνα, στη Σιθωνία Χαλκιδικής.",
    winemakingNotes: "Οινοποίηση με σύγχρονες τεχνικές που αναδεικνύουν τον αρωματικό χαρακτήρα της ποικιλίας, διατηρώντας τη φρεσκάδα και την πολυπλοκότητά της.",
    servingTemp: null,
    foodPairings: ["Ψάρια", "Θαλασσινά", "Λευκά κρέατα", "Ζυμαρικά με ελαφριές σάλτσες", "Φρέσκες σαλάτες", "Πιάτα μεσογειακής κουζίνας"],
    varieties: [{ varietyId: malagousia.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "porto-carras-blanc-de-blancs",
    name: "Blanc de Blancs",
    vintage: null,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description: "50% Αθήρι, 30% Ασύρτικο και 20% Sauvignon Blanc — κάθε ποικιλία οινοποιείται ξεχωριστά, με ζύμωση σε ανοξείδωτες δεξαμενές με επιλεγμένες ζύμες σε θερμοκρασία 16-18°C.",
    tastingNotes: "Λαμπερό, ζωντανό χρώμα, έντονα φρουτώδη αρώματα, ευχάριστο στόμα με ισορροπημένη οξύτητα και φρεσκάδα.",
    vineyardNotes: "Αμπελώνας σε υψόμετρο 100-300μ, σε αμμοπηλώδες έδαφος, βιολογική καλλιέργεια.",
    winemakingNotes: "Κάθε ποικιλία οινοποιείται ξεχωριστά. Ζύμωση σε ανοξείδωτες δεξαμενές με επιλεγμένες ζύμες στους 16-18°C.",
    servingTemp: "8-10 °C",
    foodPairings: ["Φρέσκα θαλασσινά", "Πράσινες σαλάτες", "Πουλερικά", "Αλμυρά αλλαντικά", "Τυριά"],
    varieties: [
      { varietyId: athiri.id, percentage: 50 },
      { varietyId: assyrtiko.id, percentage: 30 },
      { varietyId: sauvignonBlanc.id, percentage: 20 },
    ],
  });

  await upsertWine({
    slug: "porto-carras-rose-5",
    name: "Rose 5",
    vintage: null,
    abv: 12,
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    appellation: null,
    description:
      "Οίνος ροζέ ξηρός από την οινοποίηση πέντε διαφορετικών ποικιλιών — το επίσημο τεχνικό φύλλο κατονομάζει Cabernet Franc, Cabernet Sauvignon, Merlot και Λημνιό. Παραγωγή με τη μέθοδο της αφαίμαξης (saignée) και αλκοολική ζύμωση σε ανοξείδωτες δεξαμενές σε χαμηλή θερμοκρασία.",
    tastingNotes: "Γλυκά αρώματα κόκκινων φρούτων με νότες λουλουδιών. Εξαιρετική ισορροπία στη γεύση, κρεμώδες τελείωμα και μακριά, ευχάριστη επίγευση.",
    vineyardNotes: "Αμπελώνας σε υψόμετρο 200-350μ, σε αμμοπηλώδες έδαφος μέσης σύστασης. Απόδοση 800kg/στρέμμα.",
    winemakingNotes: "Μέθοδος της αφαίμαξης (saignée), αλκοολική ζύμωση σε ανοξείδωτες δεξαμενές σε χαμηλή θερμοκρασία. Παραμονή πέντε μήνες με τις οινολάσπες.",
    servingTemp: null,
    foodPairings: [],
    varieties: [
      { varietyId: cabernetFranc.id, percentage: null },
      { varietyId: cabernetSauvignon.id, percentage: null },
      { varietyId: merlot.id, percentage: null },
      { varietyId: limnio.id, percentage: null },
    ],
  });

  await upsertWine({
    slug: "porto-carras-chateau-2016",
    name: "Chateau Porto Carras 2016",
    vintage: 2016,
    abv: 13.5,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PDO,
    description: "Διαχρονικός ερυθρός Ονομασίας Προέλευσης Πλαγιές Μελίτωνα Ανώτερης Ποιότητας. Οινοποιημένο από Cabernet Sauvignon, Cabernet Franc, Merlot και Λημνιό, παλαιώνει 12 μήνες σε καινούργια δρύινα βαρέλια στο κλιματιζόμενο κελάρι του κτήματος.",
    tastingNotes: "Έντονα πορφυρό χρώμα με μοβ ανταύγειες. Μοναδικό μπουκέτο μικρών φρούτων του δάσους με πινελιές βανίλιας στη μύτη, βελούδινο σώμα και ποιοτική δομή τανινών από τη φλούδα των εκλεκτών σταφυλιών του Μελίτωνα.",
    vineyardNotes: "Αμπελώνες στις Πλαγιές του όρους Μελίτωνα, Σιθωνία Χαλκιδικής.",
    winemakingNotes: "Παλαίωση 12 μήνες σε καινούργια δρύινα βαρέλια στο κλιματιζόμενο κελάρι του κτήματος.",
    servingTemp: null,
    foodPairings: [],
    varieties: [
      { varietyId: cabernetSauvignon.id, percentage: null },
      { varietyId: cabernetFranc.id, percentage: null },
      { varietyId: merlot.id, percentage: null },
      { varietyId: limnio.id, percentage: null },
    ],
  });

  await upsertWine({
    slug: "porto-carras-plagies-melitona-2024",
    name: "Πλαγιές Μελίτωνα 2024",
    vintage: 2024,
    abv: 13.5,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: Appellation.PDO,
    description: "50% Αθήρι, 35% Ροδίτης και 15% Ασύρτικο — Ονομασία Προέλευσης Πλαγιές Μελίτωνα.",
    tastingNotes: "Λαμπερό λεμονί χρώμα. Στη μύτη κυριαρχούν πυρηνόκαρπα και τροπικά φρούτα, με νύξεις μπριος. Τραγανή οξύτητα που εξισορροπεί το γεμάτο σώμα, με επίγευση καλής διάρκειας που επιβεβαιώνει τα αρχικά αρώματα.",
    vineyardNotes: "Αμπελώνες στις Πλαγιές του όρους Μελίτωνα, Σιθωνία Χαλκιδικής.",
    winemakingNotes: null,
    servingTemp: null,
    foodPairings: ["Ζυμαρικά με λευκές σάλτσες", "Πουλερικά", "Λιπαρά ψάρια", "Τυριά παλαίωσης"],
    varieties: [
      { varietyId: athiri.id, percentage: 50 },
      { varietyId: roditis.id, percentage: 35 },
      { varietyId: assyrtiko.id, percentage: 15 },
    ],
  });

  await upsertWine({
    slug: "porto-carras-le-grand-blanc-2019",
    name: "Chateau - Le Grand Blanc 2019",
    vintage: 2019,
    abv: null,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    description:
      "Μαλαγουζιά, Ασύρτικο και Λημνιό από τον μεγαλύτερο βιολογικό αμπελώνα της Ελλάδας — ποικιλίες που διασώθηκαν και αναγεννήθηκαν στο Domaine Porto Carras στα τέλη της δεκαετίας του 1960. Το Λημνιό οινοποιείται ως «blanc de noir».",
    tastingNotes: "Λαμπερό χρώμα. Πολύπλοκη μύτη με αρώματα εσπεριδοειδών, λευκόσαρκων φρούτων, ανθέων ακακίας, χαμομηλιού, φουντουκιού, φρυγανισμένου ψωμιού και λευκού πιπεριού. Στόμα γεμάτο και πολύπλοκο, με μακρά επίγευση.",
    vineyardNotes: "Μεγαλύτερος ενιαίος βιολογικός αμπελώνας της Ελλάδας, στο Domaine Porto Carras.",
    winemakingNotes: "Στις λευκές ποικιλίες (Μαλαγουζιά, Ασύρτικο) προζυμωτική εκχύλιση σε χαμηλές θερμοκρασίες και λευκή οινοποίηση, ενώ το Λημνιό οινοποιείται ως «blanc de noir» σε ανοξείδωτες δεξαμενές με ειδικές ζύμες σε χαμηλή θερμοκρασία. Παραμονή 9 μήνες σε νέα γαλλικά δρύινα βαρέλια με περιοδική ανάδευση (bâtonnage).",
    servingTemp: null,
    foodPairings: ["Ψάρια", "Θαλασσινά", "Ημίσκληρα και ώριμα τυριά"],
    varieties: [
      { varietyId: malagousia.id, percentage: null },
      { varietyId: assyrtiko.id, percentage: null },
      { varietyId: limnio.id, percentage: null },
    ],
  });

  await upsertWine({
    slug: "porto-carras-porfyrogennitos",
    name: "Πορφυρογέννητος",
    vintage: null,
    abv: null,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: null,
    description:
      "Συλλεκτικός και σπάνιος «Grand Reserve» οίνος από το θρυλικό Κτήμα Πόρτο Καρράς — Cabernet Sauvignon, Cabernet Franc, Merlot και Λημνιό, μεταμορφωμένα μέσα στο ξεχωριστό μικροκλίμα των Πλαγιών του όρους Μελίτωνα. Με επιλεκτικές εμφανίσεις μέσα στην ιστορία του κτήματος: πρωτοεμφανίστηκε το 1975, ακολούθησαν το 1977, το 1993 και η σοδειά του 2001.",
    tastingNotes: "Στην όψη πορφύρα με κεραμιδένιες αποχρώσεις. Ευγενικές τανίνες που διατηρούν τη ζωντάνια της νεότητάς τους. Σύνθετο μπουκέτο με αρώματα ταμπάκου, μπαχαρικού και αποξηραμένου σύκου.",
    vineyardNotes: "Πλαγιές του όρους Μελίτωνα, Σιθωνία Χαλκιδικής.",
    winemakingNotes: "Ενηλικιώνεται και διαμορφώνει χαρακτήρα μέσα από ένα σύνολο εκλεπτυσμένων διεργασιών. Χρειάζεται μετάγγιση (decanting) πριν το σερβίρισμα.",
    servingTemp: null,
    foodPairings: [],
    varieties: [
      { varietyId: cabernetSauvignon.id, percentage: null },
      { varietyId: cabernetFranc.id, percentage: null },
      { varietyId: merlot.id, percentage: null },
      { varietyId: limnio.id, percentage: null },
    ],
  });

  await upsertWine({
    slug: "porto-carras-asyrtiko-2023",
    name: "Ασύρτικο 2023",
    vintage: 2023,
    abv: 12.5,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    description: "100% Ασύρτικο από τον μεγαλύτερο ενιαίο βιολογικό αμπελώνα της Ελλάδας, όπου καλλιεργήθηκε για πρώτη φορά η ποικιλία σε ηπειρωτικό έδαφος, στα τέλη της δεκαετίας του '60.",
    tastingNotes: "Λαμπερό, έντονο χρώμα, φίνα αρώματα εσπεριδοειδών και χαρακτηριστική ορυκτότητα. Τραγανό στη γεύση, με υψηλή οξύτητα.",
    vineyardNotes: "Μεγαλύτερος ενιαίος βιολογικός αμπελώνας της Ελλάδας, σε ηπειρωτικό έδαφος.",
    winemakingNotes: "Οινοποίηση σε ανοξείδωτες δεξαμενές με επιλεγμένες ζύμες σε θερμοκρασία έως 18°C. Παραμονή με τις οινολάσπες για μερικούς μήνες με περιοδική ανάδευση. Μέρος του οίνου ωριμάζει σε δρύινα γαλλικά βαρέλια.",
    servingTemp: "10-12 °C",
    foodPairings: ["Θαλασσινά", "Όστρακα", "Λιπαρά ψάρια", "Κίτρινα τυριά ωρίμανσης"],
    varieties: [{ varietyId: assyrtiko.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "porto-carras-limnio-2022",
    name: "Λημνιό 2022",
    vintage: 2022,
    abv: 13.5,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: null,
    description: "100% Λημνιό — το αρχαίο ελληνικό σταφύλι που μνημονεύει ο Αριστοτέλης.",
    tastingNotes: "Βαθύ ρουμπινί χρώμα. Αρώματα ώριμων φρούτων του δάσους, με νότες βανίλιας, δέρματος και μαύρου πιπεριού. Πικάντικες νότες πιπεριού και κανέλας, γεμάτο στόμα, χωρίς επιθετικές τανίνες και με ευχάριστη επίγευση.",
    vineyardNotes: null,
    winemakingNotes: "Ωριμάζει σε δρύινα βαρέλια για περίπου έναν χρόνο.",
    servingTemp: null,
    foodPairings: ["Πιάτα της ελληνικής παραδοσιακής κουζίνας", "Κρεατικά", "Λαδερά"],
    varieties: [{ varietyId: limnio.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "porto-carras-chateau",
    name: "Chateau Porto Carras",
    vintage: null,
    abv: null,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PDO,
    description: "Το εμβληματικό κρασί του Domaine Porto Carras — Ονομασία Προέλευσης Πλαγιές Μελίτωνα, από Cabernet Sauvignon, Cabernet Franc και Λημνιό.",
    tastingNotes: "Βαθύ ρουμπινί χρώμα και σύνθετα αρώματα μαύρων φρούτων, δέρματος, καπνού, μπαχαρικών και βανίλιας από την παλαίωση σε δρύινα βαρέλια. Πλούσιο, ισορροπημένο και εξαιρετικά πολύπλοκο, με μακρά επίγευση και σημαντικές δυνατότητες εξέλιξης στη φιάλη.",
    vineyardNotes: "Πλαγιές του όρους Μελίτωνα, Σιθωνία Χαλκιδικής.",
    winemakingNotes: "Παλαιώνει σε δρύινα βαρέλια.",
    servingTemp: "16-18 °C",
    foodPairings: ["Κόκκινα κρέατα", "Κυνήγι", "Πιάτα με μανιτάρια", "Τρούφα", "Ώριμα τυριά"],
    varieties: [
      { varietyId: cabernetSauvignon.id, percentage: null },
      { varietyId: cabernetFranc.id, percentage: null },
      { varietyId: limnio.id, percentage: null },
    ],
  });

  await upsertWine({
    slug: "porto-carras-syrah",
    name: "Syrah",
    vintage: null,
    abv: null,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description: "100% Syrah — ΠΓΕ Χαλκιδική.",
    tastingNotes: "Βαθύ πορφυρό χρώμα με έντονα αρώματα ώριμων κόκκινων και μαύρων φρούτων, μπαχαρικών και διακριτικές νότες βανίλιας. Στο στόμα πλούσιο, με βελούδινες τανίνες, ισορροπημένη οξύτητα και μακρά επίγευση.",
    vineyardNotes: null,
    winemakingNotes: null,
    servingTemp: "16-18 °C",
    foodPairings: ["Ψητά κόκκινα κρέατα", "Κυνήγι", "Αρνί", "Παλαιωμένα τυριά", "Πιάτα με πλούσιες σάλτσες"],
    varieties: [{ varietyId: syrahVariety.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "porto-carras-magnus-b",
    name: "Magnus B.",
    vintage: null,
    abv: null,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: Appellation.PGI,
    description: "Premium ερυθρός — ΠΓΕ Σιθωνία, από Cabernet Sauvignon, Cabernet Franc και Λημνιό.",
    tastingNotes: "Βαθύ ρουμπινί χρώμα και σύνθετος αρωματικός χαρακτήρας από μαύρα φρούτα, δαμάσκηνο, μπαχαρικά, κακάο και κέδρο. Πλούσιο σώμα, εξαιρετική δομή, ώριμες τανίνες και ιδιαίτερα μακρά επίγευση, με μεγάλες δυνατότητες παλαίωσης.",
    vineyardNotes: null,
    winemakingNotes: null,
    servingTemp: "16-18 °C",
    foodPairings: ["Φιλέτο μοσχαριού", "Κυνήγι", "Αρνί", "Ώριμα τυριά", "Πιάτα υψηλής γαστρονομίας"],
    varieties: [
      { varietyId: cabernetSauvignon.id, percentage: null },
      { varietyId: cabernetFranc.id, percentage: null },
      { varietyId: limnio.id, percentage: null },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
