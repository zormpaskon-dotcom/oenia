// Εμπλουτισμός του υπάρχοντος Κτήμα Σκούρα (slug "domaine-skouras") με
// πραγματικά στοιχεία από το επίσημο site (skouras.gr/en/wines) — κάθε
// ετικέτα εκεί έχει πλήρες "Technical Presentation" (ποικιλία/ποσοστά,
// vintage, αμπελώνας, ABV, tasting notes) απευθείας στη σελίδα.
//
// 13 υπάρχοντα κρασιά ενημερώνονται (vintage, ABV, appellation, notes,
// σωστή περιοχή όπου το επίσημο site δίνει διαφορετική/συγκεκριμένη περιοχή
// από το default "nemea" που είχαν όλα), 6 νέα κρασιά προστίθενται.
//
// Σκόπιμα ΔΕΝ αγγίζονται: agiorgitiko-skoyra, akres-erythro, akres-leyko,
// akres-roze — δεν αντιστοιχούν σε καμία ετικέτα του τρέχοντος επίσημου
// site (πιθανώς παλαιότερες/discontinued), οπότε δεν υπάρχει πηγή για
// ασφαλή ενημέρωση· μένουν όπως ήταν.

import { Appellation, ContentStatus, MacroRegion, VarietyType, WineColor, WineStyle } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { slugify } from "../lib/slugify";

async function ensureVariety(name: string, type: VarietyType, fields: Record<string, unknown> = {}) {
  return prisma.variety.upsert({
    where: { name },
    update: {},
    create: { name, slug: slugify(name), type, ...fields },
  });
}

async function ensureRegion(
  name: string,
  macroRegion: MacroRegion,
  appellation: Appellation,
  fields: Record<string, unknown> = {}
) {
  const slug = slugify(name);
  return prisma.region.upsert({
    where: { slug },
    update: {},
    create: { name, slug, macroRegion, appellation, ...fields },
  });
}

async function setVarieties(wineId: string, entries: [{ id: string }, number][]) {
  for (const [variety, percentage] of entries) {
    await prisma.varietyOnWine.upsert({
      where: { wineId_varietyId: { wineId, varietyId: variety.id } },
      update: { percentage },
      create: { wineId, varietyId: variety.id, percentage },
    });
  }
}

async function main() {
  const nemea = await prisma.region.findUniqueOrThrow({ where: { slug: "nemea" } });
  const argolida = await prisma.region.findUniqueOrThrow({ where: { slug: "argolida" } });
  const korinthia = await prisma.region.findUniqueOrThrow({ where: { slug: "korinthia" } });
  const mantineia = await prisma.region.findUniqueOrThrow({ where: { slug: "mantineia" } });
  const peloponnisos = await prisma.region.findUniqueOrThrow({ where: { slug: "peloponnisos" } });

  console.log("Νέα περιοχή…");
  const achaia = await ensureRegion("Αχαΐα", MacroRegion.PELOPONNESE, Appellation.PGI, {
    description: "Ζώνη ΠΓΕ στα βορειοδυτικά της Πελοποννήσου, γνωστή κυρίως για λευκές ποικιλίες αλλά και για ορεινούς αμπελώνες ερυθρών διεθνών ποικιλιών όπως το Syrah.",
  });

  const agiorgitiko = await prisma.variety.findUniqueOrThrow({ where: { name: "Αγιωργίτικο" } });
  const cabernetSauvignon = await prisma.variety.findUniqueOrThrow({ where: { name: "Cabernet Sauvignon" } });
  const cabernetFranc = await prisma.variety.findUniqueOrThrow({ where: { name: "Cabernet Franc" } });
  const merlot = await prisma.variety.findUniqueOrThrow({ where: { name: "Merlot" } });
  const syrah = await prisma.variety.findUniqueOrThrow({ where: { name: "Syrah" } });
  const chardonnay = await prisma.variety.findUniqueOrThrow({ where: { name: "Chardonnay" } });
  const viognier = await prisma.variety.findUniqueOrThrow({ where: { name: "Viognier" } });
  const moschofilero = await prisma.variety.findUniqueOrThrow({ where: { name: "Μοσχοφίλερο" } });
  const roditis = await prisma.variety.findUniqueOrThrow({ where: { name: "Ροδίτης" } });
  const asyrtiko = await prisma.variety.findUniqueOrThrow({ where: { name: "Ασύρτικο" } });

  console.log("Νέα ποικιλία…");
  const mavrostifo = await ensureVariety("Μαυροστύφο", VarietyType.RED, {
    originRegion: "Γύμνο, Νεμέα",
    description: "Σπάνια, σχεδόν άγνωστη γηγενής ερυθρή ποικιλία από την περιοχή της Νεμέας, με ελάχιστη σημερινή καλλιέργεια — χρησιμοποιείται από το Κτήμα Σκούρα για το γλυκό κρασί «Titanas» (μέθοδος ηλιασμού των σταφυλιών).",
    characteristics: "Πυκνό, γλυκό προφίλ με έντονα αρώματα μαύρων φρούτων και μπαχαρικών όταν υφίσταται ηλιασμό/παλαίωση.",
    acidity: 60,
    body: 90,
    tannins: 60,
  });

  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "domaine-skouras" } });

  console.log("Winery: εμπλουτισμός Κτήμα Σκούρα…");
  await prisma.winery.update({
    where: { slug: "domaine-skouras" },
    data: {
      story:
        "Ο Γιώργος Σκούρας γεννήθηκε στο Άργος. Το 1980 σπούδασε Γεωπονία στο Dijon της Βουργουνδίας, όπου η επαφή του με το Chardonnay και το Pinot Noir, καθώς και με σημαντικούς οινοποιούς της περιοχής, άνοιξε νέους ορίζοντες. Μετά το πτυχίο Οινολογίας, δούλεψε σε ιστορικά οινοποιεία στη Γαλλία, την Ιταλία και την Ελλάδα. Το 1986 ίδρυσε το δικό του οινοποιείο στην Πυργέλα, ένα μικρό χωριό έξω από το Άργος, με ενοικιαζόμενους αμπελώνες και χειροποίητη εμφιάλωση, κυκλοφορώντας την πλέον εμβληματική ετικέτα «Μέγας Οίνος». Ακολούθησε boutique οινοποιείο στο Γύμνο, εντός της ζώνης ΠΟΠ Νεμέας, όπου η δουλειά σε μικρή κλίμακα έγινε ανεκτίμητη μελέτη πάνω στο Αγιωργίτικο. Το 2004 το οινοποιείο μεταφέρθηκε στο Μαλανδρένι, με νέες εγκαταστάσεις μεγαλύτερης χωρητικότητας που σχεδιάστηκαν ώστε να διατηρούν την αυθεντικότητα και ταυτότητα των κρασιών. Το 2024 το Κτήμα Σκούρα επεκτάθηκε με νέες εγκαταστάσεις στο Ζευγολατιό Μαντινείας, στην καρδιά της ζώνης ΠΟΠ Μοσχοφίλερου. Η ετήσια παραγωγή φτάνει τις ~850.000 φιάλες, με το 50% να εξάγεται σε πάνω από 25 χώρες. Ο Γιώργος Σκούρας και η σύζυγός του Ουρανία παραμένουν ενεργά στην καθημερινή λειτουργία του κτήματος, ενώ τα παιδιά τους, Δημήτρης (αμπελουργία/οινοποίηση, σπουδές στη Γαλλία) και Στέλλα (οινοτουρισμός/δημόσιες σχέσεις, σπουδές στη Σκωτία), συνεχίζουν το όραμα.",
      philosophy:
        "Τέσσερις αρχές καθορίζουν κάθε κρασί του Κτήματος Σκούρα: καθαρότητα, ποικιλιακή διαύγεια, έκφραση του μικροκλίματος και πιστή αποτύπωση του terroir. Ο αμπελουργικός τομέας δουλεύει με διαρκή παρατήρηση, με στόχο εξαιρετικό φρούτο — μόνο από εξαιρετικό φρούτο μπορεί να προκύψει πραγματικά μεγάλο κρασί.",
    },
  });

  type WineData = {
    slug: string;
    name?: string;
    regionId?: string;
    vintage?: number | null;
    color?: WineColor;
    style?: WineStyle;
    appellation?: Appellation | null;
    abv?: number;
    description: string;
    tastingNotes: string;
    vineyardNotes: string;
  };

  async function upsertWine(data: WineData, varieties: [{ id: string }, number][], isNew: boolean, wineryDefaults?: { regionId: string; color: WineColor; style: WineStyle }) {
    const wine = isNew
      ? await prisma.wine.create({
          data: {
            name: data.name!,
            slug: data.slug,
            wineryId: winery.id,
            regionId: data.regionId ?? wineryDefaults!.regionId,
            vintage: data.vintage ?? null,
            color: data.color ?? wineryDefaults!.color,
            style: data.style ?? wineryDefaults!.style,
            appellation: data.appellation ?? null,
            abv: data.abv,
            description: data.description,
            tastingNotes: data.tastingNotes,
            vineyardNotes: data.vineyardNotes,
            status: ContentStatus.PUBLISHED,
          },
        })
      : await prisma.wine.update({
          where: { slug: data.slug },
          data: {
            ...(data.regionId ? { regionId: data.regionId } : {}),
            vintage: data.vintage ?? null,
            appellation: data.appellation ?? null,
            abv: data.abv,
            description: data.description,
            tastingNotes: data.tastingNotes,
            vineyardNotes: data.vineyardNotes,
          },
        });
    await setVarieties(wine.id, varieties);
    console.log(`  -> ${data.slug} ${isNew ? "(νέο)" : "(ενημερώθηκε)"}`);
    return wine;
  }

  console.log("13 υπάρχοντα κρασιά — ενημέρωση…");

  await upsertWine(
    {
      slug: "dum-vinum-sperum",
      regionId: argolida.id,
      vintage: 2025,
      appellation: Appellation.PGI,
      abv: 13.5,
      description: "Το γλεύκος ζυμώθηκε εξ ολοκλήρου σε καινούργια γαλλικά βαρέλια δρυός 225L, ολοκλήρωσε μηλογαλακτική ζύμωση και παλαίωσε επί οινολασπών 10 μήνες με τακτικό batonnage. Εμφιαλώνεται με πώμα Stelvin.",
      tastingNotes: "Λαμπερό κίτρινο χρώμα με χρυσές ανταύγειες. Αρώματα λάιμ, ανθέων πορτοκαλιάς και ανανά μαζί με βούτυρο, γλυκό ξύλο και αμύγδαλο. Πλούσιο, σύνθετο στόμα με ζωηρή οξύτητα, εσπεριδοειδή και τροπικά φρούτα με βανίλια και καρύδα. Μακρά, πλούσια επίγευση.",
      vineyardNotes: "Αργολίδα, υψόμετρο 250μ, αμμώδες έδαφος, μέση ηλικία κλήματος 31 έτη, απόδοση 39,75 hl/ha. Τρύγος μέσα Αυγούστου.",
    },
    [[chardonnay, 100]],
    false
  );

  await upsertWine(
    {
      slug: "grande-cuvee-nemea",
      vintage: 2024,
      appellation: Appellation.PDO,
      abv: 14,
      description: "Ζύμωση και εκχύλιση σε ανοξείδωτες δεξαμενές, πλήρης μηλογαλακτική ζύμωση σε βαρέλι και παλαίωση σε καινούργια γαλλικά βαρέλια 12 μήνες, με ακόμη 6 μήνες παλαίωση σε φιάλη.",
      tastingNotes: "Λαμπερό, βαθύ ρουμπινί χρώμα. Βάθος και πυκνότητα στη μύτη, με κόκκινα φρούτα (βύσσινο, μύρτιλο) μαζί με μπαχαρικά, βότανα και νότα μεταλλικότητας. Μεσαίο προς πλήρες σώμα, υψηλής ποιότητας τανίνες, γεύσεις κόκκινων φρούτων, χώματος, μετάλλου, καπνού και μπαχαρικών. Μακρά, σύνθετη επίγευση.",
      vineyardNotes: "Κορινθία, υψόμετρο 1.040μ, κόκκινο πλούσιο σε μέταλλα έδαφος, μέση ηλικία κλήματος 32 έτη, απόδοση 42,50 hl/ha. Τρύγος αρχές Οκτωβρίου.",
    },
    [[agiorgitiko, 100]],
    false
  );

  await upsertWine(
    {
      slug: "peplo",
      vintage: 2025,
      appellation: Appellation.PGI,
      abv: 12.5,
      description: "Κάθε ποικιλία συνεισφέρει κατά 1/3. Το Syrah παλαιώνει επί οινολασπών σε ανοξείδωτες δεξαμενές, το Αγιωργίτικο σε βαρέλια ακακίας και το Μοσχοφίλερο σε αυγόσχημους πήλινους αμφορείς με επαφή με τα στέμφυλα για 4 μήνες.",
      tastingNotes: "Απαλό, λαμπερό χρώμα, ροζ-χρυσαφί ανταύγειες. Έντονο, φρέσκο άρωμα φράουλας, λευκών ανθέων (βιολέτα, τριαντάφυλλο), λεμονιού, γκρέιπφρουτ και μια νότα μεταλλικότητας. Μεσαίο σώμα, δομή και πολυπλοκότητα από την ακακία και τον πηλό. Μακρά επίγευση.",
      vineyardNotes: "Αγιωργίτικο: Νεμέα (850μ). Syrah: Αργολίδα (600μ). Μοσχοφίλερο: Μαντινεία (650μ). Όλοι οι αμπελώνες πάνω από 600μ υψόμετρο.",
    },
    [
      [agiorgitiko, 34],
      [syrah, 33],
      [moschofilero, 33],
    ],
    false
  );

  await upsertWine(
    {
      slug: "salto",
      regionId: mantineia.id,
      vintage: 2025,
      appellation: Appellation.PGI,
      abv: 11.5,
      description: "Ελεγχόμενη αλκοολική ζύμωση σε ανοξείδωτες δεξαμενές με αυτόχθονες ζύμες. Σύντομη παλαίωση επί λεπτών οινολασπών.",
      tastingNotes: "Απαλό χρώμα με ελαφριά γκρι απόχρωση. Έντονη, σύνθετη μύτη με αρώματα γιασεμιού, τριαντάφυλλου, αγιόκλημα, βερβένας, λάιμ και λεμονιού. Μεσαίο σώμα, εκρηκτική οξύτητα, φρέσκο και γεμάτο γεύση. Σύνθετη, μεσαίου μήκους επίγευση.",
      vineyardNotes: "Μαντινεία, υψόμετρο 600μ, αμμοαργιλώδες έδαφος, μέση ηλικία κλήματος 20 έτη, απόδοση 38,40 hl/ha. Τρύγος αρχές Οκτωβρίου.",
    },
    [[moschofilero, 100]],
    false
  );

  await upsertWine(
    {
      slug: "viognier-cuvee-larsinos",
      regionId: korinthia.id,
      vintage: 2025,
      appellation: Appellation.PGI,
      abv: 13,
      description: "Το 70% του γλεύκους ζυμώθηκε σε ανοξείδωτες δεξαμενές και το 30% σε γαλλικά βαρέλια δρυός (50% καινούργια) για 6 μήνες, με πλήρη μηλογαλακτική ζύμωση και batonnage. Παλαίωσε ακόμη 3 μήνες στο κελάρι πριν κυκλοφορήσει.",
      tastingNotes: "Πράσινο-κίτρινο χρώμα με πράσινες ανταύγειες. Έντονη μύτη με ώριμο βερίκοκο, μάνγκο και φλούδα πορτοκαλιού, μαζί με βανίλια και μέλι από το γαλλικό δρυ. Πλούσιο στόμα με γεύσεις κρέμας, καρύδας και βουτύρου φουντουκιού. Μακρά, πολύπλοκη επίγευση.",
      vineyardNotes: "Κορινθία, υψόμετρο 200 πόδια (~60μ), αμμώδες έδαφος, μέση ηλικία κλήματος 33 έτη, απόδοση 51 hl/ha. Τρύγος τέλη Αυγούστου.",
    },
    [[viognier, 100]],
    false
  );

  await upsertWine(
    {
      slug: "almyra",
      regionId: korinthia.id,
      vintage: 2025,
      appellation: Appellation.PGI,
      abv: 13,
      description: "Το 70% του γλεύκους ζυμώθηκε σε ανοξείδωτες δεξαμενές και το 30% σε καινούργια γαλλικά βαρέλια δρυός για 6 μήνες, με πλήρη μηλογαλακτική ζύμωση στα βαρέλια και batonnage. Πώμα Stelvin.",
      tastingNotes: "Πράσινο-κίτρινο χρώμα με πράσινες ανταύγειες. Εκφραστική μύτη με ώριμο ροδάκινο, τροπικά φρούτα (ανανάς) και νότες λεμονιού, ακολουθούμενες από βούτυρο, ψωμί και καραμέλα. Πλούσιο, στρογγυλό, φρέσκο και ισορροπημένο στόμα. Μακρά, σύνθετη επίγευση με συνεχή εξέλιξη.",
      vineyardNotes: "Κορινθία, υψόμετρο 200 πόδια (~60μ), αμμώδες έδαφος, μέση ηλικία κλήματος 32 έτη, απόδοση 55,10 hl/ha. Τρύγος μέσα Αυγούστου.",
    },
    [[chardonnay, 100]],
    false
  );

  await upsertWine(
    {
      slug: "lavyrinthos",
      vintage: null,
      appellation: Appellation.PGI,
      abv: 14,
      description: "Μοναδικό κρασί φτιαγμένο από διαδοχικές σοδειές του Μέγας Οίνος που παλαιώνουν μαζί σε ειδικό foudre 1.000L — το 2001 γέμισε για πρώτη φορά με το τελικό blend του Μέγας Οίνος 1999. Κάθε χρόνο, μετά την κυκλοφορία της νέας σοδειάς Μέγας Οίνος, μέρος του κρασιού στο foudre αφαιρείται και εμφιαλώνεται ενώ το foudre ξαναγεμίζει. Παλαιώνει ακόμη 12 μήνες σε φιάλη πριν κυκλοφορήσει.",
      tastingNotes: "Βαθύ πορφυρό χρώμα με νότες τερακότα. Ώριμη, συμπυκνωμένη, πυκνή μύτη με τεράστια πολυπλοκότητα — ώριμα κόκκινα φρούτα (βύσσινο, βατόμουρο, κεράσι) με γαρίφαλο, κανέλα και μαύρο πιπέρι, νότες βοτάνων και κέδρου. Πλήρες, βελούδινο στόμα με δομημένες τανίνες και ζωηρή οξύτητα. Ατελείωτη, κομψή επίγευση.",
      vineyardNotes: "Αγιωργίτικο: Γύμνο Νεμέας (700μ). Cabernet Sauvignon: Κορινθία (700μ). Βραχώδες έδαφος, μέση ηλικία κλήματος 39-75 έτη (Αγιωργίτικο) / 46 έτη (Cabernet Sauvignon).",
    },
    [
      [agiorgitiko, 80],
      [cabernetSauvignon, 20],
    ],
    false
  );

  await upsertWine(
    {
      slug: "megas-oinos",
      vintage: 2023,
      appellation: Appellation.PGI,
      abv: 14.5,
      description: "Ζύμωση και εκχύλιση σε ανοξείδωτες δεξαμενές στους 23°C, με μετα-ζυμωτική εκχύλιση στους 20°C (17 ημέρες Αγιωργίτικο, 15 ημέρες Cabernet Sauvignon). Πλήρης μηλογαλακτική ζύμωση σε βαρέλι. Παλαίωση σε καινούργια γαλλικά βαρέλια 18 μήνες (εκ των οποίων 4 μήνες με ελαφριές οινολάσπες) και ακόμη 6 μήνες σε φιάλη.",
      tastingNotes: "Έντονο, βαθύ γρανάτι χρώμα με βιολετί ανταύγειες. Βάθος, συμπύκνωση και πολυπλοκότητα στη μύτη, με κόκκινα και μαύρα φρούτα (σμέουρο, κεράσι, μύρτιλο, βατόμουρο), μπαχαρικά, καπνό και δέρμα. Μεταξένιο αλλά δυνατό στόμα με απαλές τανίνες και ισορροπημένη οξύτητα. Μακρά επίγευση με μεγάλη πολυπλοκότητα.",
      vineyardNotes: "Αγιωργίτικο: Γύμνο Νεμέας (650μ). Cabernet Sauvignon: Κορινθία (650μ). Βραχώδες έδαφος, μέση ηλικία κλήματος 38-74 έτη (Αγιωργίτικο) / 45 έτη (Cabernet Sauvignon). Τρύγος μέσα Σεπτεμβρίου.",
    },
    [
      [agiorgitiko, 80],
      [cabernetSauvignon, 20],
    ],
    false
  );

  await upsertWine(
    {
      slug: "moschofilero-skoyra",
      regionId: mantineia.id,
      vintage: 2025,
      appellation: Appellation.PGI,
      abv: 12,
      description: "Ζύμωση σε ανοξείδωτες δεξαμενές, χωρίς μηλογαλακτική ζύμωση, σύντομη παλαίωση επί λεπτών οινολασπών.",
      tastingNotes: "Ανοιχτό κίτρινο-λευκό χρώμα. Πλούσια, φρέσκα αρώματα λευκών ανθέων και αγιόκλημα, με νότες εσπεριδοειδών και λάιμ. Μεσαίο προς πλήρες σώμα, δροσιστική και σφριγηλή οξύτητα. Κομψό, ισορροπημένο, με μακρά επίγευση.",
      vineyardNotes: "Μαντινεία, υψόμετρο 730μ, αμμώδες έδαφος, μέση ηλικία κλήματος 34 έτη, απόδοση 55 hl/ha. Τρύγος τέλη Σεπτεμβρίου.",
    },
    [[moschofilero, 100]],
    false
  );

  await upsertWine(
    {
      slug: "nemea-saint-george",
      vintage: 2025,
      appellation: Appellation.PDO,
      abv: 13.5,
      description: "Αλκοολική ζύμωση και εκχύλιση σε ανοξείδωτες δεξαμενές στους 23°C (12 ημέρες). Πλήρης μηλογαλακτική ζύμωση με αυτόχθονα βακτήρια — 50% σε ουδέτερα γαλλικά βαρέλια δρυός, 50% σε ανοξείδωτες δεξαμενές. Παλαίωση 12 μήνες, ακολουθούμενη από 2 μήνες σε φιάλη στο οινοποιείο.",
      tastingNotes: "Λαμπερό, βαθύ βυσσινί χρώμα. Αρώματα βατόμουρου, σμέουρου και ώριμης φράουλας με ελαφριά νότα καπνού, γαρίφαλου και κανέλας. Μεσαίο σώμα, κομψή δομή, ισορροπημένη οξύτητα και πολύ ώριμες, κομψές τανίνες. Μέτρια-μακρά επίγευση με κόκκινα φρούτα, γλυκιά βανίλια και μαύρο πιπέρι.",
      vineyardNotes: "Νεμέα, υψόμετρο 650μ, αργιλώδες έδαφος, μέση ηλικία κλήματος 35 έτη, απόδοση 54 hl/ha. Τρύγος μέσα Σεπτεμβρίου.",
    },
    [[agiorgitiko, 100]],
    false
  );

  await upsertWine(
    {
      slug: "portes-merlot",
      regionId: korinthia.id,
      vintage: 2025,
      appellation: Appellation.PGI,
      abv: 14,
      description: "Αλκοολική ζύμωση και εκχύλιση σε ανοξείδωτες δεξαμενές στους 23°C (14 ημέρες). Πλήρης μηλογαλακτική ζύμωση σε βαρέλι. Παλαίωση σε γαλλικά βαρέλια (80% καινούργια, 20% ουδέτερα) για 8 μήνες.",
      tastingNotes: "Βαθύ ρουμπινί χρώμα με ρουμπινί ανταύγειες. Συμπυκνωμένη, σύνθετη, πολυδιάστατη μύτη με κόκκινο κεράσι, ώριμο δαμάσκηνο, γλυκιά βανίλια, με νότες βιολέτας και καπνού. Στρογγυλό, βελούδινο στόμα με πολύ ώριμες, απαλές τανίνες. Πλούσια, μακρά, σύνθετη επίγευση.",
      vineyardNotes: "Κορινθία, υψόμετρο 350 πόδια (~107μ), αμμώδες έδαφος, μέση ηλικία κλήματος 34 έτη, απόδοση 50,40 hl/ha. Τρύγος τέλη Αυγούστου.",
    },
    [[merlot, 100]],
    false
  );

  await upsertWine(
    {
      slug: "synoro",
      regionId: argolida.id,
      vintage: 2022,
      appellation: Appellation.PGI,
      abv: 14,
      description: "Ζύμωση και παρατεταμένη μετα-ζυμωτική εκχύλιση σε ανοξείδωτες δεξαμενές. Πλήρης μηλογαλακτική ζύμωση και παλαίωση σε γαλλικά βαρέλια (50% καινούργια) για 13 μήνες, με ακόμη 6 μήνες σε φιάλη.",
      tastingNotes: "Βαθύ ρουμπινί χρώμα με ρουμπινί ανταύγειες. Έντονη, πυκνή μύτη με φρεσκάδα από τον φυτικό χαρακτήρα του Cabernet Franc — ώριμα φρούτα (κόκκινο μούρο, κεράσι, φράουλα) με σοκολάτα, κανέλα, κέδρο και νότα βαρελιού. Πλήρες στόμα με πλούσιο εκχύλισμα, ισορροπημένη οξύτητα και ώριμες, πυκνές τανίνες. Μακρά, σύνθετη επίγευση.",
      vineyardNotes: "Αργολίδα, υψόμετρο 600μ, βραχώδες αργιλώδες έδαφος. Μέση ηλικία κλήματος: Cabernet Franc 24 έτη, Merlot 24 έτη, Αγιωργίτικο 29 έτη.",
    },
    [
      [cabernetFranc, 40],
      [merlot, 40],
      [agiorgitiko, 20],
    ],
    false
  );

  await upsertWine(
    {
      slug: "fleva",
      regionId: achaia.id,
      vintage: 2024,
      appellation: Appellation.PGI,
      abv: 14.5,
      description: "Αλκοολική ζύμωση και εκχύλιση σε ανοξείδωτες δεξαμενές στους 23°C, με μετα-ζυμωτική εκχύλιση στους 20°C (15 ημέρες συνολικά). Πλήρης μηλογαλακτική ζύμωση σε βαρέλι. Παλαίωση σε καινούργια βαρέλια δρυός 12 μήνες.",
      tastingNotes: "Βαθύ, σχεδόν αδιαφανές κόκκινο χρώμα. Πλούσια μύτη με σκούρα φρούτα (βατόμουρο, μαύρο κεράσι, δαμάσκηνο), ακολουθούμενη από στρώματα μαύρου πιπεριού, γλυκόριζας, γαρίφαλου, θυμαριού, δάφνης, νότες τρούφας, μαύρης σοκολάτας και καπνού. Πλατύ, ζωηρό στόμα με ώριμες τανίνες, όγκο και πολυπλοκότητα.",
      vineyardNotes: "Αχαΐα, υψόμετρο 650μ, αμμοαργιλώδες έδαφος, μέση ηλικία κλήματος 19-25 έτη, απόδοση 36 hl/ha. Τρύγος αρχές Σεπτεμβρίου.",
    },
    [[syrah, 100]],
    false
  );

  console.log("6 νέα κρασιά…");

  await upsertWine(
    {
      slug: "viognier-eclectique",
      name: "Viognier Eclectique",
      regionId: argolida.id,
      vintage: 2024,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      abv: 13.5,
      description: "Ζύμωση σε γαλλικά βαρέλια δρυός (50% καινούργια) για 12 μήνες, με σύντομη επαφή με τα στέμφυλα, πλήρη μηλογαλακτική ζύμωση και batonnage. Πώμα Stelvin.",
      tastingNotes: "Χρυσό-άχυρο χρώμα με λαμπερές ανταύγειες. Σύνθετη, κομψή μύτη με ώριμο ροδάκινο, άνθος πορτοκαλιάς, φλούδες εσπεριδοειδών και τροπικά φρούτα. Η γλυκιά βανίλια και το φουντούκι του δρυός ενσωματώνονται άψογα. Πλήρες στόμα με υπέροχη υφή και τραγανή οξύτητα.",
      vineyardNotes: "Αργολίδα, υψόμετρο 985 πόδια (~300μ), αμμώδες έδαφος, μέση ηλικία κλήματος 30 έτη, απόδοση 44 hl/ha. Τρύγος μέσα Αυγούστου.",
    },
    [[viognier, 100]],
    true,
    { regionId: argolida.id, color: WineColor.WHITE, style: WineStyle.DRY }
  );

  await upsertWine(
    {
      slug: "assyrtiko-skoyra",
      name: "Ασύρτικο Σκούρα",
      regionId: nemea.id,
      vintage: 2025,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      abv: 13.5,
      description: "Πίεση ολόκληρων τσαμπιών, ζύμωση με αυτόχθονες ζύμες σε ανοξείδωτες δεξαμενές, παλαίωση επί οινολασπών 4 μήνες, χωρίς μηλογαλακτική ζύμωση.",
      tastingNotes: "Κρυστάλλινο χρώμα με πράσινες ανταύγειες. Γενναιόδωρη μύτη με εσπεριδοειδή, μήλα, μεταλλικές και αλμυρές νότες. Εξαιρετική δομή, τραγανή οξύτητα, αλμυρότητα και μεταλλικότητα. Μακρά, σύνθετη επίγευση.",
      vineyardNotes: "Νεμέα, υψόμετρο 620μ, κόκκινο αργιλώδες έδαφος, μέση ηλικία κλήματος 12 έτη, απόδοση 54 hl/ha. Τρύγος Σεπτέμβριο.",
    },
    [[asyrtiko, 100]],
    true,
    { regionId: nemea.id, color: WineColor.WHITE, style: WineStyle.DRY }
  );

  await upsertWine(
    {
      slug: "zoe-white",
      name: "Zoe White",
      regionId: peloponnisos.id,
      vintage: 2025,
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      abv: 12.5,
      description: "Ζύμωση σε ανοξείδωτες δεξαμενές, σύντομη επαφή με τα στέμφυλα, χωρίς μηλογαλακτική ζύμωση, σύντομη παλαίωση επί λεπτών οινολασπών. Πώμα βιδωτό.",
      tastingNotes: "Λαμπερό λευκό-κίτρινο χρώμα με πράσινες ανταύγειες. Σύνθετη μύτη με φρέσκα άνθη και θρυμματισμένα λουλούδια. Πολυτελής υφή με γεύσεις εσπεριδοειδών, γιασεμιού και μέντας. Καθαρή, εκτεταμένη επίγευση.",
      vineyardNotes: "Ροδίτης Αλεπού: ορεινοί αμπελώνες Πελοποννήσου (450μ, αμμώδες έδαφος, 36 έτη). Μοσχοφίλερο: ορεινοί αμπελώνες Μαντινείας (750μ, αμμώδες έδαφος, 31 έτη).",
    },
    [
      [roditis, 70],
      [moschofilero, 30],
    ],
    true,
    { regionId: peloponnisos.id, color: WineColor.WHITE, style: WineStyle.DRY }
  );

  await upsertWine(
    {
      slug: "zoe-rose",
      name: "Zoe Rose",
      regionId: peloponnisos.id,
      vintage: 2025,
      color: WineColor.ROSE,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      abv: 12,
      description: "Ζύμωση σε ανοξείδωτες δεξαμενές, σύντομη εκχύλιση, χωρίς μηλογαλακτική ζύμωση, σύντομη παλαίωση επί λεπτών οινολασπών. Πώμα βιδωτό.",
      tastingNotes: "Λαμπερό, ανοιχτό κερασί χρώμα με ροζ ανταύγειες. Ζωντανή, καθαρή μύτη με ώριμο κεράσι, σμέουρο και νότες τριαντάφυλλου. Μεσαίο σώμα, μέτρια-υψηλή οξύτητα και ελαφρύ υπαινιγμό πολύ ώριμων τανινών. Μέτρια-μακρά επίγευση με εξελισσόμενες γεύσεις.",
      vineyardNotes: "Αγιωργίτικο: Κορινθία (650μ, ασβεστολιθικό έδαφος, 30 έτη). Μοσχοφίλερο: Μαντινεία (730μ, αμμώδες έδαφος, 32 έτη).",
    },
    [
      [agiorgitiko, 70],
      [moschofilero, 30],
    ],
    true,
    { regionId: peloponnisos.id, color: WineColor.ROSE, style: WineStyle.DRY }
  );

  await upsertWine(
    {
      slug: "titanas",
      name: "Titanas",
      regionId: nemea.id,
      vintage: 2015,
      color: WineColor.RED,
      style: WineStyle.SWEET,
      appellation: null,
      abv: 14.5,
      description: "Τα σταφύλια εκτέθηκαν στον ήλιο για οκτώ ημέρες και στη συνέχεια παρέμειναν στη σκιά για ακόμη τριάντα οκτώ ημέρες, χωρίς να χάσουν τα αρώματά τους. Ακολούθησε 25ήμερη εκχύλιση με αλκοολική ζύμωση. Η ζύμωση ολοκληρώθηκε σε βαρέλια δρυός μετά από πέντε μήνες και το κρασί παλαίωσε εκεί για πέντε χρόνια.",
      tastingNotes: "Ζωηρό, αδιαφανές χρώμα με ρουμπινί ανταύγειες. Σύνθετη, έντονη μύτη με γλυκά αρώματα μαύρων και κόκκινων φρούτων — δαμάσκηνο, βύσσινο, σύκο, χουρμά, γλυκό κουταλιού σταφύλι, λικέρ βύσσινο, σοκολάτα, καπνό, μέντα, μοσχοκάρυδο, γλυκάνισο, πούρο και δέρμα. Πλούσιο σώμα με εξαιρετική ισορροπία γλυκύτητας, τανινών και οξύτητας. Πολύ μακρά επίγευση.",
      vineyardNotes: "Γύμνο, Νεμέα, 600μ, αμμοαργιλώδες έδαφος, μέση ηλικία κλήματος 25 έτη, απόδοση 41,61 hl/ha.",
    },
    [[mavrostifo, 100]],
    true,
    { regionId: nemea.id, color: WineColor.RED, style: WineStyle.SWEET }
  );

  await upsertWine(
    {
      slug: "zoe-red",
      name: "Zoe Red",
      regionId: nemea.id,
      vintage: 2025,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      abv: 13,
      description: "Αλκοολική ζύμωση και εκχύλιση σε ανοξείδωτες δεξαμενές στους 23°C για 6 ημέρες. Πλήρης μηλογαλακτική ζύμωση σε δεξαμενές. Σύντομη παλαίωση επί λεπτών οινολασπών.",
      tastingNotes: "Λαμπερό, μεσαίας έντασης βιολετί χρώμα με ροζ ανταύγειες. Ζωντανή, έντονη μύτη με μαύρο κεράσι, βατόμουρο, νότες δαμάσκηνου, βιολέτας και ξερών βοτάνων. Μεσαίο σώμα, μέτρια οξύτητα με απαλές τανίνες. Μέτρια επίγευση με ελαφριά νότα γλυκάνισου.",
      vineyardNotes: "Αγιωργίτικο: Νεμέα (650μ, αργιλώδες έδαφος, 27 έτη). Cabernet Sauvignon: Νεμέα (500μ, αμμώδες έδαφος, 22 έτη).",
    },
    [
      [agiorgitiko, 90],
      [cabernetSauvignon, 10],
    ],
    true,
    { regionId: nemea.id, color: WineColor.RED, style: WineStyle.DRY }
  );

  console.log("Κτήμα Σκούρα: winery εμπλουτίστηκε, 13 κρασιά ενημερώθηκαν, 6 νέα κρασιά, 1 νέα περιοχή (Αχαΐα), 1 νέα ποικιλία (Μαυροστύφο).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
