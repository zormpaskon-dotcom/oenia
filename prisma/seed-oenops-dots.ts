// Oenops Wines — σειρά DOTS (Vindiano, Limniona, Xinomavro, Kidonitsa),
// από https://oenopswines.gr/el/dots/. Μονοποικιλιακά, μονο-περιοχής
// κρασιά (σε αντίθεση με τα APLA/RAW που είναι multi-region blends) —
// γι' αυτό εδώ χαρτογραφούνται στην πραγματική τους περιοχή αντί στη
// Δράμα (έδρα οινοποιείου).
//
// Καμία φωτογραφία δεν προστέθηκε: η μοναδική διαθέσιμη εικόνα του site
// (dots_s.png) δείχνει μόνο 3 από τα 4 μπουκάλια, με αφηρημένο σχέδιο
// κουκκίδων (πουαντιγισμός) που δεν επιτρέπει αξιόπιστη αντιστοίχιση
// μπουκαλιού-ποικιλίας. Καμία vintage δεν καταγράφηκε — η φωτογραφία
// δείχνει "2019" και για τα τρία ορατά μπουκάλια, αλλά τα βραβεία στη
// σελίδα εκτείνονται έως το 2025, άρα το "2019" δεν αντιπροσωπεύει
// αξιόπιστα την τρέχουσα εσοδεία κάθε κρασιού.

import { Appellation, ContentStatus, MacroRegion, WineColor, WineStyle } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "oenops-wines" } });
  const kriti = await prisma.region.findUniqueOrThrow({ where: { slug: "kriti" } });
  const karditsa = await prisma.region.findUniqueOrThrow({ where: { slug: "karditsa" } });
  const naoussa = await prisma.region.findUniqueOrThrow({ where: { slug: "naoussa" } });
  const kilkis = await prisma.region.upsert({
    where: { slug: "kilkis" },
    update: {},
    create: {
      slug: "kilkis",
      name: "Κιλκίς",
      macroRegion: MacroRegion.NORTHERN_GREECE,
      description: "Περιοχή της κεντρικής Μακεδονίας, βόρεια της Θεσσαλονίκης.",
    },
  });

  const vidiano = await prisma.variety.findUniqueOrThrow({ where: { slug: "vidiano" } });
  const limniona = await prisma.variety.findUniqueOrThrow({ where: { slug: "limniona" } });
  const xinomavro = await prisma.variety.findUniqueOrThrow({ where: { slug: "xinomavro" } });
  const kidonitsa = await prisma.variety.findUniqueOrThrow({ where: { slug: "kidonitsa" } });

  async function upsertWine(spec: {
    slug: string;
    name: string;
    regionId: string;
    color: WineColor;
    style: WineStyle;
    appellation: Appellation | null;
    description: string;
    tastingNotes: string;
    vineyardNotes: string;
    winemakingNotes: string;
    foodPairings: string[];
    varieties: Array<{ varietyId: string; percentage: number | null }>;
  }) {
    const wine = await prisma.wine.upsert({
      where: { slug: spec.slug },
      update: {
        name: spec.name,
        wineryId: winery.id,
        regionId: spec.regionId,
        color: spec.color,
        style: spec.style,
        appellation: spec.appellation,
        description: spec.description,
        tastingNotes: spec.tastingNotes,
        vineyardNotes: spec.vineyardNotes,
        winemakingNotes: spec.winemakingNotes,
        foodPairings: spec.foodPairings,
        status: ContentStatus.PUBLISHED,
      },
      create: {
        slug: spec.slug,
        name: spec.name,
        wineryId: winery.id,
        regionId: spec.regionId,
        color: spec.color,
        style: spec.style,
        appellation: spec.appellation,
        description: spec.description,
        tastingNotes: spec.tastingNotes,
        vineyardNotes: spec.vineyardNotes,
        winemakingNotes: spec.winemakingNotes,
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

  console.log("Oenops Wines — σειρά DOTS…");

  await upsertWine({
    slug: "oenops-dots-vindiano",
    name: "DOTS Vindiano",
    regionId: kriti.id,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    description:
      "100% Βιδιανό από τους ορεινούς αμπελώνες του Ηρακλείου Κρήτης. Οινοποιείται με στόχο να εκφράσει την κομψότητα και την πολυπλοκότητα αυτής της ανερχόμενης ποικιλίας. Ιδανικό για εξεζητημένα pairing και σύγχρονες γαστρονομικές προσεγγίσεις, συνοδεύει ιδανικά τη μεσογειακή κουζίνα.",
    tastingNotes: "Ζωηρό λεμονί χρώμα με πρασινωπές ανταύγειες. Αρώματα εσπεριδοειδών, λευκών ανθέων και διακριτικές νότες μπαχαρικών. Πλούσιο, πολυδιάστατο σώμα με ζωντανή οξύτητα και μακρά, εκλεπτυσμένη επίγευση.",
    vineyardNotes: "Ορεινοί αμπελώνες του Ηρακλείου Κρήτης.",
    winemakingNotes: "Ψύξη των σταφυλιών στους 5°C, προσεκτική διαλογή και άμεση πίεση ολόκληρων τσαμπιών σε κάθετα πνευματικά πιεστήρια. Αυθόρμητη ζύμωση σε τέσσερις διαφορετικούς τύπους δοχείων — πήλινους αμφορείς, τσιμεντένιες δεξαμενές, μεγάλα δρύινα βαρέλια (600L) και ανοξείδωτες δεξαμενές. Παλαίωση 6 έως 9 μήνες, με προσεγμένη ανάμειξη πριν την εμφιάλωση, χωρίς φιλτράρισμα.",
    foodPairings: ["Μεσογειακή κουζίνα"],
    varieties: [{ varietyId: vidiano.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "oenops-dots-limniona",
    name: "DOTS Limniona",
    regionId: karditsa.id,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: null,
    description: "100% Λημνιώνα από ορεινούς αμπελώνες της Καρδίτσας, Θεσσαλία, άνω των 30 ετών. Ο πρώιμος τρύγος ενισχύει τη φυσική οξύτητα, ενώ η προσεκτική διαλογή εξασφαλίζει απόλυτη καθαρότητα στην πρώτη ύλη.",
    tastingNotes: "Λαμπερό ρουμπινί χρώμα. Αρώματα κερασιού, φραγκοστάφυλου, με διακριτικές νύξεις ακακίας και μπαχαρικών. Φρέσκο και φρουτώδες, με ζωντανή οξύτητα και βελούδινες τανίνες.",
    vineyardNotes: "Ορεινοί αμπελώνες της Καρδίτσας, Θεσσαλία, άνω των 30 ετών.",
    winemakingNotes: "Αυθόρμητη ζύμωση σε πήλινους αμφορείς και τσιμεντένια δεξαμενή. Παραμονή 10 μηνών στις φίνες οινολάσπες. Εμφιαλώνεται αφιλτράριστο.",
    foodPairings: [],
    varieties: [{ varietyId: limniona.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "oenops-dots-xinomavro",
    name: "DOTS Xinomavro",
    regionId: naoussa.id,
    color: WineColor.RED,
    style: WineStyle.DRY,
    appellation: null,
    description: "100% Ξινόμαυρο από αμπελώνες εξαιρετικού terroir στις περιοχές της Νάουσας και του Αμυνταίου.",
    tastingNotes: "Μέτριο πορφυρό χρώμα. Αρώματα κερασιού, με νύξεις ανθών και μπαχαρικών. Εκρηκτικό φρούτο, ζουμερές τανίνες, κομψή και τραγανή οξύτητα, με μακρά, έντονη επίγευση.",
    vineyardNotes: "Αμπελώνες στη Νάουσα και το Αμύνταιο.",
    winemakingNotes: "Ζύμωση με αυτόχθονες ζύμες, σε ελαφρώς ψυχόμενες συνθήκες, μέσα σε τσιμεντένιες δεξαμενές και μεγάλα δρύινα βαρέλια των 500 λίτρων. Παλαίωση έως 10 μήνες με τις λεπτές οινολάσπες, σε πήλινους αμφορείς. Εμφιαλώνεται αφιλτράριστο.",
    foodPairings: [],
    varieties: [{ varietyId: xinomavro.id, percentage: 100 }],
  });

  await upsertWine({
    slug: "oenops-dots-kidonitsa",
    name: "DOTS Kidonitsa",
    regionId: kilkis.id,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    appellation: null,
    description: "100% Κυδωνίτσα από επιλεγμένους αμπελώνες στο Κιλκίς, όπου η ποικιλία αποδίδει με ισορροπία, φρεσκάδα και λεπτότητα.",
    tastingNotes: "Εντυπωσιακό, λαμπερό λεμονί χρώμα. Αρώματα λευκών ανθέων, πυρηνόκαρπων φρούτων, λάιμ και διακριτικές νότες μεταλλικότητας. Ισορροπημένη οξύτητα, κομψά δομημένο σώμα, δροσιστική αίσθηση και μακρά, φίνα επίγευση.",
    vineyardNotes: "Επιλεγμένοι αμπελώνες στο Κιλκίς.",
    winemakingNotes: "Αργή ζύμωση με αυτόχθονες ζύμες, μέσα σε πήλινους αμφορείς. Παραμονή 6 μήνες στις φίνες οινολάσπες, στον ίδιο αμφορέα. Εμφιαλώνεται αφιλτράριστο.",
    foodPairings: [],
    varieties: [{ varietyId: kidonitsa.id, percentage: 100 }],
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
