// Oenops Wines — σειρά APLA (Λευκό, Ροζέ, Κόκκινο), από τη σελίδα
// https://oenopswines.gr/el/apla/. Ενημέρωση της υπάρχουσας εγγραφής
// "Apla White" με τη νέα ποικιλιακή σύνθεση/vintage (η παλιά περιγραφή στο
// seed-real-7.ts ήταν 60% Μαλαγουζιά/30% Ασύρτικο/10% Ροδίτη — το site
// δείχνει τώρα 50% Μαλαγουζιά/30% Βιδιανό/20% Ασύρτικο, vintage 2024) και
// προσθήκη APLA Ροζέ (2024) και APLA Κόκκινο (2023). Vintage ανά κρασί
// επιβεβαιωμένο από την ίδια τη φωτογραφία ετικέτας (ομαδική φωτογραφία
// και των τριών μπουκαλιών, apla-white.jpg/apla-rose.jpg/apla-red.jpg,
// crops από newAlpha_no.jpg του site).

import { ContentStatus, WineColor, WineStyle } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "oenops-wines" } });
  const drama = await prisma.region.findUniqueOrThrow({ where: { slug: "drama" } });

  const malagousia = await prisma.variety.findUniqueOrThrow({ where: { slug: "malagousia" } });
  const vidiano = await prisma.variety.findUniqueOrThrow({ where: { slug: "vidiano" } });
  const assyrtiko = await prisma.variety.findUniqueOrThrow({ where: { slug: "asyrtiko" } });
  const xinomavro = await prisma.variety.findUniqueOrThrow({ where: { slug: "xinomavro" } });
  const limniona = await prisma.variety.findUniqueOrThrow({ where: { slug: "limniona" } });
  const mavroudi = await prisma.variety.findUniqueOrThrow({ where: { slug: "mayroydi" } });

  async function upsertWine(spec: {
    slug: string;
    name: string;
    vintage: number | null;
    color: WineColor;
    style: WineStyle;
    description: string;
    tastingNotes: string;
    vineyardNotes: string;
    winemakingNotes: string;
    servingTemp: string | null;
    foodPairings: string[];
    varieties: Array<{ varietyId: string; percentage: number | null }>;
  }) {
    const wine = await prisma.wine.upsert({
      where: { slug: spec.slug },
      update: {
        name: spec.name,
        wineryId: winery.id,
        regionId: drama.id,
        vintage: spec.vintage,
        color: spec.color,
        style: spec.style,
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
        regionId: drama.id,
        vintage: spec.vintage,
        color: spec.color,
        style: spec.style,
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

  console.log("Oenops Wines — σειρά APLA…");

  // APLA Λευκό (ενημέρωση υπάρχουσας εγγραφής oenops-apla-white)
  await upsertWine({
    slug: "oenops-apla-white",
    name: "APLA Λευκό",
    vintage: 2024,
    color: WineColor.WHITE,
    style: WineStyle.DRY,
    description:
      "Τρεις γηγενείς ποικιλίες, από τρεις διαφορετικές περιοχές — Μαλαγουζιά από τη Μακεδονία, Βιδιανό από την Κρήτη και Ασύρτικο από τη Θράκη — συνδυάζονται αρμονικά σε ένα κρασί που ισορροπεί τη φρεσκάδα με την εκφραστικότητα. Ιδανικό για μεσογειακή κουζίνα, χαλαρές απολαύσεις και καθημερινές, ανεπιτήδευτες στιγμές. Βραβευμένη ετικέτα — χρυσά βραβεία και υψηλές βαθμολογίες (Berliner Wein Trophy, Concours Mondial de Bruxelles, Mundus Vini, James Suckling, Jancis Robinson, Decanter, Asia Wine Trophy) σε πολλαπλές εσοδείες 2021-2024.",
    tastingNotes:
      "Λαμπερό, ανοιχτό χρυσαφί χρώμα. Αρωματικό προφίλ με τροπικά και λευκόσαρκα φρούτα, με νύξεις λεμονιού και γιασεμιού. Παλέτα πλούσια και στρογγυλή, με ισορροπημένη οξύτητα και φρουτώδη επίγευση.",
    vineyardNotes: "Μαλαγουζιά από τη Μακεδονία, Βιδιανό από την Κρήτη και Ασύρτικο από τη Θράκη — κάθε αμπελοτεμάχιο οινοποιείται ξεχωριστά.",
    winemakingNotes: "Ψύξη και άμεση πίεση σε πνευματικά πιεστήρια. Ζύμωση σε ανοξείδωτες δεξαμενές ελεγχόμενης θερμοκρασίας. Ωριμάζει στις φίνες οινολάσπες του για έως και 4 μήνες, αποκτώντας πλούσια υφή και βάθος.",
    servingTemp: "8-10 °C",
    foodPairings: ["Ελαφριά ορεκτικά", "Θαλασσινά", "Μεσογειακή κουζίνα"],
    varieties: [
      { varietyId: malagousia.id, percentage: 50 },
      { varietyId: vidiano.id, percentage: 30 },
      { varietyId: assyrtiko.id, percentage: 20 },
    ],
  });

  // APLA Ροζέ
  await upsertWine({
    slug: "oenops-apla-rose",
    name: "APLA Ροζέ",
    vintage: 2024,
    color: WineColor.ROSE,
    style: WineStyle.DRY,
    description:
      "Τρεις γηγενείς ποικιλίες από τρεις διαφορετικές περιοχές — Ξινόμαυρο από τη Μακεδονία, Μαυρούδι από τη Θράκη και Λημνιώνα από τη Θεσσαλία — συνδυάζονται σε ένα ροζέ με ένταση και κομψότητα, που παντρεύει τον χαρακτήρα με την εξαιρετική γευστική έκφραση. Ιδανικό για καλοκαιρινά τραπέζια και βραδιές δίπλα στη θάλασσα. Βραβευμένη ετικέτα — χρυσά βραβεία και υψηλές βαθμολογίες (Berliner Wein Trophy, James Suckling, Decanter, Jancis Robinson, Robert Parker) σε πολλαπλές εσοδείες 2021-2024.",
    tastingNotes:
      "Λαμπερό σομόν χρώμα με ζωντανές αντανακλάσεις. Αρώματα μανταρινιού, πορτοκαλιού, λευκόσαρκων κερασιών και φράουλας, με μια διακριτική νύξη ντομάτας. Πλήρες σώμα, πολυεπίπεδο, με τραγανή φρεσκάδα και νότες άγριας φράουλας, βατόμουρου και ντελικάτης ντομάτας, που καταλήγουν σε ένα ισορροπημένο και μακρύ τελείωμα.",
    vineyardNotes: "Ξινόμαυρο από τη Μακεδονία, Μαυρούδι από τη Θράκη και Λημνιώνα από τη Θεσσαλία.",
    winemakingNotes: "Ψύξη των σταφυλιών στους 5°C, προσεκτική διαλογή και ήπια πίεση σε πνευματικά πιεστήρια (με μικρό ποσοστό ολόκληρων τσαμπιών). Ζύμωση σε ανοξείδωτες και τσιμεντένιες δεξαμενές. Παλαίωση 2-4 μήνες στις φίνες οινολάσπες.",
    servingTemp: null,
    foodPairings: [],
    varieties: [
      { varietyId: xinomavro.id, percentage: 50 },
      { varietyId: mavroudi.id, percentage: 30 },
      { varietyId: limniona.id, percentage: 20 },
    ],
  });

  // APLA Κόκκινο
  await upsertWine({
    slug: "oenops-apla-red",
    name: "APLA Κόκκινο",
    vintage: 2023,
    color: WineColor.RED,
    style: WineStyle.DRY,
    description:
      "Ένα ελαφρύ καλοκαιρινό ερυθρό με πλούσιο χαρακτήρα, που ενώνει γηγενείς ποικιλίες σε μια φρέσκια, φρουτώδη έκφραση του ελληνικού terroir. Σερβίρεται ελαφρώς δροσερό. Βραβευμένη ετικέτα — χρυσά βραβεία και υψηλές βαθμολογίες (Mundus Vini, Berliner Wein Trophy, James Suckling, Decanter, Jancis Robinson) σε πολλαπλές εσοδείες 2019-2024.",
    tastingNotes:
      "Έντονο ρουμπινί χρώμα, με νεανική καθαρότητα. Αρώματα ζουμερού κερασιού και φρέσκων κόκκινων μούρων, με διακριτική νύξη φύλλων ντομάτας και πράσινων βοτάνων. Πλούσιο, ισορροπημένα κομψό και φρουτώδες, με βελούδινες τανίνες και φρουτώδες, ευκολόπιοτο τελείωμα.",
    vineyardNotes: "Ξινόμαυρο, Λημνιώνα και Μαυρούδι από τη Μακεδονία, τη Θεσσαλία και τη Θράκη.",
    winemakingNotes: "Προσεκτική διαλογή των σταφυλιών, αργή ζύμωση με κρυοεκχύλιση σε ανοξείδωτες και τσιμεντένιες δεξαμενές, καθώς και σε παλαιά, μεγάλα, ανοιχτά βαρέλια. Κάθε ποικιλία οινοποιείται ξεχωριστά, με παλαίωση 9 μηνών πριν την τελική σύνθεση.",
    servingTemp: null,
    foodPairings: [],
    varieties: [
      { varietyId: xinomavro.id, percentage: 50 },
      { varietyId: limniona.id, percentage: 30 },
      { varietyId: mavroudi.id, percentage: 20 },
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
