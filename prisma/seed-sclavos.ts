// Sclavos Wines (Κεφαλονιά) — πλήρης κατάλογος 14 ετικετών + εμπλουτισμός
// του winery profile, με ρητή άδεια του ίδιου του οινοποιείου.
// Πηγή: επίσημο site https://sclavoswines.gr (σελίδες "Τα προϊόντα μας"
// και "Σχετικά με εμάς"), ζωντανά fetched. Το winery ήδη υπήρχε στη βάση
// (batch-5 του αρχικού 88-winery import) με 1 μόνο κρασί (Vino di Sasso).
// Αυτό το script προσθέτει τα υπόλοιπα 13 και εμπλουτίζει το ήδη υπαρκτό.

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
  slug: string,
  name: string,
  macroRegion: MacroRegion,
  appellation: Appellation,
  description: string
) {
  return prisma.region.upsert({
    where: { slug },
    update: {},
    create: { slug, name, macroRegion, appellation, description },
  });
}

async function main() {
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "sclavos-wines" } });

  console.log("Winery profile — εμπλουτισμός από το επίσημο 'Σχετικά με εμάς'…");
  await prisma.winery.update({
    where: { id: winery.id },
    data: {
      description:
        "Η οικογένεια Σκλάβου, με καταγωγή τα Ντομάτα της Λειβαθούς, ήταν οικογένεια ναυτικών καραβοκύρηδων — γύρω στο 1700 ένας κλάδος μετανάστευσε στην Οδησσό της Ρωσίας, όπου γύρω στο 1860 ο προπάππος Ευρυβιάδης διηύθυνε μεγάλη οικογενειακή vinaria. Το 1919, μετά την επανάσταση του 1917, ο παππούς Ευρυβιάδης επέστρεψε στην Κεφαλονιά και φύτεψε τα πρώτα αμπέλια στο ιδιόκτητο κτήμα (50 στρ.) στην περιοχή Κεχριών της Παλικής. Από το 1990 ο πατέρας Σπύρος αναμόρφωσε τον παλαιό αμπελώνα με βιοδυναμική-ομοιοδυναμική μέθοδο. Το σύγχρονο οινοποιείο ιδρύθηκε το 1996 από τον Ευρυβιάδη Σκλάβο (τρίτης γενιάς, ομώνυμο του παππού), γεωπόνο και πρωτοπόρο της βιοδυναμικής καλλιέργειας στην Ελλάδα. Από το 2015 λειτουργεί ως ΣΚΛΑΒΟΣ–ΖΗΣΙΜΑΤΟΣ ΟΙΝΟΠΟΙΕΙΟ ΚΑΙ ΑΜΠΕΛΩΝΕΣ Ε.Π.Ε, με 50% συμμετοχή της οικογένειας Ζησιμάτου. Πιστοποιημένο βιολογικό (ΔΗΩ) εδώ και 20+ χρόνια.",
      story:
        "Η παραγωγή χαρακτηρίζεται από μικρές στρεμματικές αποδόσεις (~400 κιλά/στρέμμα), αυτόριζους αμπελώνες κυπελλοειδούς μορφής και υπεραιωνόβια πρέμνα (μέση ηλικία >70 ετών) σε φτωχά, ασβεστολιθικά εδάφη. Ο αμπελώνας δεν είναι ενιαίος αλλά διάσπαρτος ανάμεσα σε δασικές εκτάσεις, ελαιώνες και εκτάσεις σε αγρανάπαυση — μια μεγάλη ποικιλομορφία σπάνιων μεσογειακών φυτικών ειδών. Το οινοποιείο πρωτοπόρησε πριν από 25 χρόνια στην ξηρή (μη ενισχυμένη) οινοποίηση της παραδοσιακά γλυκιάς, ενισχυμένης Μαυροδάφνης — μια εργασία που πλέον ακολουθούν κι άλλα οινοποιεία. Τα προϊόντα προωθούνται στην ελληνική αγορά και κατά 65% σε 10 προορισμούς του εξωτερικού (Γαλλία, Ελβετία, Λουξεμβούργο, Γερμανία, Δανία, Αγγλία, Βέλγιο, Ιταλία, Αυστρία, Κύπρος, Πορτογαλία, Νορβηγία, Ιαπωνία, ΗΠΑ, Καναδάς).",
      philosophy:
        "Στόχος είναι η δημιουργία φυσικών βιολογικών κρασιών που αναδεικνύουν τα ιδιαίτερα χαρακτηριστικά των τοπικών ποικιλιών, όπως εκφράζονται στη συγκεκριμένη μικροπεριοχή του αμπελώνα, χωρίς να διαταράσσεται η αρμονική σχέση με το αγροτικό περιβάλλον. Στην πενταετία που ακολουθεί, στόχος είναι το σύνολο της παραγωγής να προέρχεται από βιολογική-βιοδυναμική καλλιέργεια.",
      isOrganic: true,
      isBiodynamic: true,
      logoImage: "https://content.4ty.gr/merchants/logos/2020/12/57872-a64sd6s.jpg",
      coverImage: "https://reseller-content.4ty.gr/site2/chris-ftp/Desktop/orange-wine1.jpg",
    },
  });

  console.log("Νέες περιοχές…");
  const mavrodafniKefallinias = await ensureRegion(
    "mavrodafni-kefallinias",
    "Μαυροδάφνη Κεφαλληνίας",
    MacroRegion.IONIAN_ISLANDS,
    Appellation.PDO,
    "Ζώνη ΠΟΠ γλυκού, ενισχυμένου ερυθρού οίνου στη χερσόνησο της Παλικής, Κεφαλονιά, από την τοπική ποικιλία Μαυροδάφνη Κεφαλληνίας — αμπελογραφικά διαφορετική από τη Μαυροδάφνη Πατρών/Αχαΐας."
  );
  const moschatosKefallinias = await ensureRegion(
    "moschatos-kefallinias",
    "Μοσχάτος Κεφαλληνίας",
    MacroRegion.IONIAN_ISLANDS,
    Appellation.PDO,
    "Ζώνη ΠΟΠ γλυκού λευκού οίνου στην Κεφαλονιά από Μοσχάτο, παραδοσιακά με μερική αφυδάτωση των σταφυλιών στον ήλιο."
  );
  const kefalonia = await ensureRegion(
    "kefalonia",
    "Κεφαλονιά",
    MacroRegion.IONIAN_ISLANDS,
    Appellation.PGI,
    "Γενική ζώνη ΠΓΕ Κεφαλονιάς — καλύπτει οίνους από τοπικές ποικιλίες του νησιού (Βοστιλίδι, Τσαούσι, Ζακυνθινό, Μοσχατέλα κ.ά.) που δεν εμπίπτουν στις στενότερες ζώνες ΠΟΠ."
  );
  const robolaKefallinias = await prisma.region.findUniqueOrThrow({ where: { slug: "robola-kefallinias" } });

  console.log("Νέες ποικιλίες…");
  const mavrodafniKef = await ensureVariety("Μαυροδάφνη Κεφαλληνίας", VarietyType.RED, {
    originRegion: "Κεφαλονιά (χερσόνησος Παλικής)",
    description:
      "Τοπική ερυθρή ποικιλία της Κεφαλονιάς, αμπελογραφικά διαφορετική από τη Μαυροδάφνη που καλλιεργείται στην Πάτρα/Αχαΐα (μικρότερες, πυκνόσαρκες ρώγες, όψιμη ωρίμανση, μεγαλύτερη αντοχή στην ξηρασία). Παραδοσιακά χρησιμοποιείται για τον γλυκό, ενισχυμένο οίνο ΠΟΠ «Μαυροδάφνη Κεφαλληνίας», αλλά το Sclavos Wines πρωτοπόρησε πριν 25 χρόνια σε μια ξηρή, μη ενισχυμένη εκδοχή με παλαίωση.",
    characteristics: "Πυκνό χρώμα, γεμάτο σώμα, νόστιμες τανίνες. Αρώματα ώριμων φρούτων του δάσους, μπαχαρικών και βανίλιας (από την παλαίωση σε δρύινο βαρέλι). Ταιριάζει με: Κόκκινο κρέας, ώριμα τυριά.",
    acidity: 55,
    body: 90,
    tannins: 70,
    aromaIntensity: 65,
    ageingPotential: 70,
  });
  const vostilidi = await ensureVariety("Βοστιλίδι", VarietyType.WHITE, {
    originRegion: "Κεφαλονιά (χερσόνησος Παλικής)",
    description:
      "Σπάνια, τοπική λευκή ποικιλία της Παλικής, Κεφαλονιά, από υπεραιωνόβια αυτόριζα πρέμνα. Δίνει κρασιά με έντονο σώμα — χρησιμοποιείται τόσο σε ξηρές λευκές αποδόσεις όσο και σε «orange» (skin-contact) εκδοχές με αυξημένη τανικότητα.",
    characteristics: "Έντονο σώμα, επιβλητική οξύτητα. Στην orange εκδοχή: τανική έξαρση, αρώματα φρούτου και φρεσκάδας. Ταιριάζει με: Πικάντικη/ασιατική κουζίνα, ώριμα τυριά.",
    acidity: 55,
    body: 65,
    tannins: 25,
    aromaIntensity: 50,
    ageingPotential: 40,
  });
  const moschatela = await ensureVariety("Μοσχατέλα", VarietyType.WHITE, {
    originRegion: "Κεφαλονιά (Κατωγή, χερσόνησος Παλικής)",
    description:
      "Τοπική αρωματική λευκή ποικιλία της Κεφαλονιάς, ξεχωριστή από το κλασικό Μοσχάτο — καλλιεργείται στην περιοχή της Κατωγής, συχνά σε συνοινοποίηση με το Βοστιλίδι.",
    characteristics: "Έντονο, χαρακτηριστικό μοσχάτο άρωμα. Ταιριάζει με: Θαλασσινά, λευκό κρέας.",
    acidity: 55,
    body: 50,
    tannins: 0,
    aromaIntensity: 80,
    ageingPotential: 30,
  });
  const tsaousi = await ensureVariety("Τσαούσι", VarietyType.WHITE, {
    originRegion: "Παραδοσιακά η Πάρος· καλλιεργείται και στην Κεφαλονιά",
    description:
      "Αναγνωρισμένη ελληνική λευκή ποικιλία, γνωστή κυρίως από την Πάρο. Στην Κεφαλονιά καλλιεργείται ο κλώνος «ζαχαροστάφυλο» σε ορεινές, αυτόριζες, υπεραιωνόβιες φυτείες της Παλικής.",
    characteristics: "Αρωματικό, με αρώματα λευκόσαρκων φρούτων, ισορροπημένη οξύτητα. Ταιριάζει με: Θαλασσινά, σαλάτες.",
    acidity: 55,
    body: 50,
    tannins: 0,
    aromaIntensity: 60,
    ageingPotential: 35,
  });
  const zakynthino = await ensureVariety("Ζακυνθινό", VarietyType.WHITE, {
    originRegion: "Ζάκυνθος· καλλιεργείται εδώ και ~400 χρόνια και στη Νότια Κεφαλονιά",
    description:
      "Τοπική λευκή ποικιλία που κατάγεται από τη Ζάκυνθο — σύμφωνα με την παράδοση εγκαταστάθηκε στην περιοχή Ελιός-Πρόννων της Νότιας Κεφαλονιάς πριν από περίπου 400 χρόνια από μοναχούς.",
    characteristics: "Αρώματα ώριμων ροδάκινων, πλούσιο σώμα, ισορροπημένη οξύτητα. Ταιριάζει με: Ψάρια, πουλερικά.",
    acidity: 50,
    body: 60,
    tannins: 0,
    aromaIntensity: 55,
    ageingPotential: 35,
  });

  console.log("Συμπλήρωση κενών αριθμητικών πεδίων στο ήδη υπαρκτό 'Μοσχάτο' (χρειάζεται για το pairing engine)…");
  await prisma.variety.update({
    where: { name: "Μοσχάτο" },
    data: { acidity: 55, body: 50, tannins: 0, aromaIntensity: 85, ageingPotential: 30 },
  });
  const moschato = await prisma.variety.findUniqueOrThrow({ where: { name: "Μοσχάτο" } });
  const robola = await prisma.variety.findUniqueOrThrow({ where: { name: "Ρομπόλα" } });

  console.log("Εμπλουτισμός του ήδη υπαρκτού Vino di Sasso…");
  await prisma.wine.update({
    where: { slug: "sclavos-vino-di-sasso" },
    data: {
      description:
        "Λευκός οίνος ΠΟΠ από 100% Ρομπόλα Κεφαλληνίας. Το όνομα δανείστηκε από τον Άγγλο αρμοστή Napier, που πρώτος ονόμασε το κρασί της περιοχής «Vino di Sasso» («Κρασί της Πέτρας»). Βιολογικός οίνος με πιστοποίηση Demeter, σε περιορισμένο αριθμό φιαλών.",
      tastingNotes:
        "Λευκό, αρωματικό, υψηλής οξύτητας κρασί με λεπτά ορυκτικά αρώματα. Αρχικά φρεσκοκομμένα φρούτα (λεμόνι, εσπεριδοειδή) και άνθη τους· με την ωρίμανση στη φιάλη (2ης-3ης χρονιάς) αναδεικνύονται πιο πολύπλοκες, «petrol» νότες από το ασβεστολιθικό terroir. Μακριά επίγευση, δυναμικό παλαίωσης έως 7 έτη.",
      vineyardNotes:
        "Αμπελώνας στη ζώνη της Ρομπόλας, υψόμετρο 650-700m, ηλικία πρέμνων ~30 έτη. Κατακερματισμένος ασβεστόλιθος (lime stone) υπό την επίδραση του όρους Αίνος.",
      winemakingNotes: "Βιολογική/βιοδυναμική καλλιέργεια, πιστοποίηση Demeter. Περιορισμένος αριθμός φιαλών.",
    },
  });

  console.log("Νέα κρασιά…");
  const wines: Array<{
    slug: string;
    name: string;
    color: WineColor;
    style: WineStyle;
    varieties: Array<{ variety: { id: string }; percentage: number }>;
    appellation?: Appellation;
    regionId: string;
    description: string;
    tastingNotes: string;
    vineyardNotes: string;
    winemakingNotes: string;
    servingTemp: string;
    foodPairings: string[];
  }> = [
    {
      slug: "sclavos-orgion",
      name: "Οργίων",
      color: WineColor.RED,
      style: WineStyle.DRY,
      varieties: [{ variety: mavrodafniKef, percentage: 100 }],
      regionId: mavrodafniKefallinias.id,
      description:
        "Ξηρός ερυθρός οίνος από 100% Μαυροδάφνη Κεφαλληνίας — μέρος της πρωτοπόρας δουλειάς του Sclavos Wines στην ξηρή (μη ενισχυμένη) εκδοχή της τοπικής ποικιλίας, αντί για την παραδοσιακή γλυκιά, ενισχυμένη Μαυροδάφνη. Τα σταφύλια προέρχονται από συμβαλλόμενους αμπελουργούς της ζώνης.",
      tastingNotes:
        "Εξαιρετική πυκνότητα και βαφική ικανότητα, νόστιμες τανίνες. Ρωμαλέος, οινώδης χαρακτήρας με μακρά επίγευση που αναδίδει αρώματα ώριμων φρούτων του δάσους και νότες βανίλιας.",
      vineyardNotes:
        "Σταφύλια συμβαλλόμενων αμπελουργών, ζώνη της Μαυροδάφνης στη χερσόνησο της Παλικής, υψόμετρο 50-150m, αργιλοασβεστώδη έως ασβεστολιθικά εδάφη, λοφώδεις/ημιορεινοί αμπελώνες κυπελλοειδούς μορφής, ηλικία πρέμνων >40 ετών, διάσπαρτοι ανάμεσα σε ακαλλιέργητες εκτάσεις και ελαιώνες. Καλλιέργεια συμβατική. Τρύγος 1ο δεκαπενθήμερο Σεπτεμβρίου.",
      winemakingNotes:
        "Βιοδυναμική οινοποίηση, μακρά εκχύλιση, ολοκλήρωση αλκοολικής και μηλογαλακτικής ζύμωσης με γηγενείς ζύμες. Παλαίωση σε γαλλικά δρύινα βαρέλια Allier (500L, 300L) και τύπου barrique, 12 μήνες. Εμφιάλωση χωρίς άλλες επεξεργασίες.",
      servingTemp: "16-18°C",
      foodPairings: ["Κόκκινο κρέας", "Ώριμα τυριά"],
    },
    {
      slug: "sclavos-monambeles",
      name: "Μονάμπελες",
      color: WineColor.RED,
      style: WineStyle.DRY,
      varieties: [{ variety: mavrodafniKef, percentage: 100 }],
      regionId: mavrodafniKefallinias.id,
      description:
        "Βιολογικός/βιοδυναμικός (πιστοποίηση Demeter) ξηρός ερυθρός οίνος από 100% Μαυροδάφνη Κεφαλληνίας, από υπεραιωνόβιους αυτόριζους αμπελώνες.",
      tastingNotes:
        "Εξαιρετική πυκνότητα και βαφική ικανότητα. Ρωμαλέος χαρακτήρας με αρώματα μπαχαρικών, ώριμων φρούτων και αίσθηση βανίλιας, έντονο σώμα, αρκετά καλή οξύτητα, τραγανές νόστιμες τανίνες, μακρά επίγευση.",
      vineyardNotes:
        "Βιολογικά σταφύλια, βιοδυναμική καλλιέργεια σε κυπελλοειδείς αυτόριζους αμπελώνες, ηλικία πρέμνων >70 ετών, υψόμετρο ~250m, ασβεστολιθικό έδαφος (μαργαϊκός ασβεστόλιθος - μαλτεζόπλακα). Τρύγος 1ο δεκαπενθήμερο Σεπτεμβρίου.",
      winemakingNotes:
        "Βιοδυναμική οινοποίηση, μακρά εκχύλιση, αλκοολική και μηλογαλακτική ζύμωση με γηγενείς ζύμες, παλαίωση σε γαλλικά δρύινα βαρέλια Allier 500L και δρύινο οινοποιητή 3 τόνων, τουλάχιστον 12 μήνες. Εμφιάλωση χωρίς περαιτέρω διαδικασίες.",
      servingTemp: "16-18°C",
      foodPairings: ["Κόκκινο κρέας", "Ώριμα τυριά"],
    },
    {
      slug: "sclavos-synodos-bio",
      name: "Σύνοδος Bio",
      color: WineColor.RED,
      style: WineStyle.DRY,
      varieties: [
        { variety: mavrodafniKef, percentage: 83 },
        { variety: vostilidi, percentage: 17 },
      ],
      regionId: mavrodafniKefallinias.id,
      description:
        "Βιοδυναμικό blend 83% Μαυροδάφνη Κεφαλληνίας / 17% Βοστιλίδι, συνοινοποιημένο, σε περιορισμένο αριθμό φιαλών.",
      tastingNotes:
        "Έντονο κόκκινο/μωβ χρώμα, αρωματικός χαρακτήρας κόκκινων φρούτων και ιδιαίτερα μύρτιλου, αρκετά ώριμη οξύτητα, καλοδουλεμένες τανίνες, αρκετά μεγάλη επίγευση.",
      vineyardNotes:
        "Ιδιόκτητος αμπελώνας, βιοδυναμική καλλιέργεια, υψόμετρο <50m, ηλικία πρέμνων ~70 έτη, μαργαϊκός ασβεστόλιθος. Όψιμος τρύγος, μετά τις 20 Σεπτεμβρίου.",
      winemakingNotes:
        "Συνοινοποίηση και των δύο ποικιλιών μαζί, μακρά εκχύλιση, αλκοολική και μηλογαλακτική ζύμωση με γηγενείς ζύμες, γαλλικά βαρέλια Allier 500L/300L, παλαίωση τουλάχιστον 12 μήνες, εμφιάλωση χωρίς επεξεργασίες. Περιορισμένος αριθμός φιαλών.",
      servingTemp: "16-18°C",
      foodPairings: ["Κόκκινο κρέας", "Ζυμαρικά με κόκκινη σάλτσα"],
    },
    {
      slug: "sclavos-oinos-idys-tou-iliou",
      name: "Οίνος Ηδύς του Ηλίου",
      color: WineColor.WHITE,
      style: WineStyle.SWEET,
      varieties: [{ variety: moschato, percentage: 100 }],
      appellation: Appellation.PDO,
      regionId: moschatosKefallinias.id,
      description:
        "Επιδόρπιος οίνος ΠΟΠ από 100% Μοσχάτο Κεφαλληνίας — σταφύλια μερικώς αφυδατωμένα στον ήλιο (παραδοσιακή μέθοδος «passito»), προϊόν γνωστό από την περίοδο της Ενετοκρατίας στην Κεφαλονιά. Σε περιορισμένο αριθμό φιαλών.",
      tastingNotes: "Αρώματα ξηρών φρούτων όπως σύκου και σταφίδας, ισορροπημένη οξύτητα, ήπια γλυκιά γεύση, μακρά επίγευση.",
      vineyardNotes:
        "Περιοχή Κατωγή της Παλικής, υψόμετρο <50m, ηλικία αμπελώνων >60 ετών, αργιλοασβεστώδες έδαφος, γραμμική φύτευση σε κυπελλοειδές σχήμα. Χαρακτηριστική υψηλή νυχτερινή υγρασία (μαλάτσα). Τρύγος 1ο δεκαπενθήμερο Αυγούστου.",
      winemakingNotes:
        "Τα σταφύλια απλώνονται σε αλώνια κάτω από τον ήλιο για μερική αφυδάτωση. Λόγω αυξημένων σακχάρων η αλκοολική ζύμωση σταματά φυσικά, αφήνοντας αζύμωτα σάκχαρα. Παλαίωση σε γαλλικά δρύινα βαρέλια 500L.",
      servingTemp: "10-12°C",
      foodPairings: ["Επιδόρπια", "Σκληρά τυριά"],
    },
    {
      slug: "sclavos-efranor",
      name: "Ευφράνωρ",
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      varieties: [
        { variety: moschatela, percentage: 70 },
        { variety: vostilidi, percentage: 30 },
      ],
      regionId: kefalonia.id,
      description:
        "Βιοδυναμικό (πιστοποίηση Demeter), ξηρό λευκό blend 70% Μοσχατέλα / 30% Βοστιλίδι, αποκλειστικά από τοπικές ποικιλίες της Κεφαλονιάς.",
      tastingNotes: "Χαρακτηριστικό άρωμα Μοσχατέλας σε συνδυασμό με το έντονο σώμα του Βοστιλιδιού, ισορροπημένη οξύτητα, μακρά επίγευση.",
      vineyardNotes:
        "Περιοχή Κατωγής, χερσόνησος Παλικής, βιοδυναμική καλλιέργεια, υψόμετρο <50m, ηλικία πρέμνων ~60+ ετών, αργιλοασβεστώδες έδαφος, πλούσια βλάστηση, έντονη νυχτερινή υγρασία (μαλάτσα). Τρύγος τέλη Αυγούστου.",
      winemakingNotes:
        "Ξηρή εκδοχή βιοδυναμικής οινοποίησης με γηγενείς ζύμες. Ζύμωση και ωρίμανση σε ανοξείδωτες δεξαμενές, παραμονή στις φίνες λάσπες ~7 μήνες, χωρίς συντηρητικά. Εμφιάλωση χωρίς φιλτράρισμα.",
      servingTemp: "8-10°C",
      foodPairings: ["Θαλασσινά", "Λευκό κρέας"],
    },
    {
      slug: "sclavos-tsaousi",
      name: "Τσαούσι",
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      varieties: [{ variety: tsaousi, percentage: 100 }],
      regionId: kefalonia.id,
      description:
        "Βιοδυναμικός (πιστοποίηση Demeter) ξηρός λευκός οίνος από 100% Τσαούσι, σπάνια ποικιλία από υπεραιωνόβιους αυτόριζους αμπελώνες της Παλικής.",
      tastingNotes: "Αρωματικό κρασί με αρώματα λευκόσαρκων φρούτων, ισορροπημένη οξύτητα, ολοκληρωμένη επίγευση.",
      vineyardNotes:
        "Ορεινή περιοχή της Παλικής, κλώνος «ζαχαροστάφυλο», αυτόριζοι αμπελώνες ηλικίας >70 ετών, ασβεστολιθικό έδαφος (μαργαϊκός ασβεστόλιθος «μαλτεζόπλακα»), υψόμετρο ~250m, απόδοση <250kg/στρέμμα. Τρύγος 15-20 Αυγούστου.",
      winemakingNotes:
        "Βιοδυναμική οινοποίηση, ζύμωση και παραμονή στις φίνες λάσπες ~7 μήνες, χωρίς προσθήκη συντηρητικών πριν ή μετά την εμφιάλωση. Περιορισμένος αριθμός φιαλών.",
      servingTemp: "8-10°C",
      foodPairings: ["Θαλασσινά", "Σαλάτες"],
    },
    {
      slug: "sclavos-metageitnion-bio",
      name: "Μεταγειτνίων Bio",
      color: WineColor.ORANGE,
      style: WineStyle.DRY,
      varieties: [{ variety: vostilidi, percentage: 100 }],
      regionId: kefalonia.id,
      description:
        "Πυρρός (amber) βιοδυναμικός οίνος (πιστοποίηση Demeter) από 100% Βοστιλίδι, από υπεραιωνόβια αμπέλια στο ιστορικό οικογενειακό κτήμα του Κεχριώνα.",
      tastingNotes: "Δυνατός πυρρός οίνος με πλούσιο σώμα και αρώματα που θυμίζουν ξερή σταφίδα.",
      vineyardNotes:
        "Κτήμα οικογένειας Σκλάβου στον Κεχριώνα της Παλικής. Αυτόριζα πρέμνα ηλικίας >90 ετών, κυπελλοειδής διαμόρφωση, απόδοση 250kg/στρέμμα, υψόμετρο <50m. Βιοδυναμική καλλιέργεια. Όψιμος τρύγος, 1ο δεκαπενθήμερο Σεπτεμβρίου.",
      winemakingNotes:
        "Ζύμωση και ωρίμανση σε γαλλικά δρύινα βαρέλια Allier 500L, χωρίς προσθήκη συντηρητικών. Περιορισμένος αριθμός φιαλών — συνεχίζει οικογενειακή παράδοση 300 ετών.",
      servingTemp: "10-12°C",
      foodPairings: ["Ώριμα τυριά", "Ξηροί καρποί"],
    },
    {
      slug: "sclavos-alchymiste-rose",
      name: "Alchymiste Rosé",
      color: WineColor.ROSE,
      style: WineStyle.DRY,
      varieties: [
        { variety: mavrodafniKef, percentage: 50 },
        { variety: moschatela, percentage: 50 },
      ],
      regionId: kefalonia.id,
      description: "Βιολογικό ροζέ blend 50% Μαυροδάφνη Κεφαλληνίας / 50% Μοσχατέλα.",
      tastingNotes: "Πλούσιος αρωματικός χαρακτήρας, ισορροπημένη οξύτητα, ολοκληρωμένη επίγευση.",
      vineyardNotes: "Βιολογική καλλιέργεια, ασβεστολιθικά εδάφη, υψόμετρο ~100m, ηλικία αμπελώνων ~50 έτη. Τρύγος 2ο δεκαπενθήμερο Αυγούστου.",
      winemakingNotes: "Συνοινοποίηση Μαυροδάφνης Κεφαλληνίας και Μοσχατέλας.",
      servingTemp: "10-12°C",
      foodPairings: ["Ελαφριά ορεκτικά", "Λευκό κρέας"],
    },
    {
      slug: "sclavos-zakynthino",
      name: "Ζακυνθινό",
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      varieties: [{ variety: zakynthino, percentage: 100 }],
      regionId: kefalonia.id,
      description: "Ξηρός λευκός οίνος από 100% Ζακυνθινό — τοπική ποικιλία που έφτασε στην Κεφαλονιά πριν από 400 χρόνια.",
      tastingNotes: "Αρώματα ώριμων ροδάκινων, πλούσιο σώμα, ισορροπημένη οξύτητα.",
      vineyardNotes:
        "Οροπέδιο Ελιού-Πρόννων, Νότια Κεφαλονιά, νότιο-δυτική έκθεση, άσβεστο αργιλοπηλώδες έδαφος, υπό την επίδραση του όρους Αίνος. Τρύγος 2ο δεκαπενθήμερο Αυγούστου.",
      winemakingNotes: "Ζύμωση και ωρίμανση σε ανοξείδωτες δεξαμενές, παραμονή στις φίνες λάσπες ~7 μήνες, χωρίς συντηρητικά. Εμφιάλωση χωρίς φιλτράρισμα.",
      servingTemp: "8-10°C",
      foodPairings: ["Ψάρια", "Πουλερικά"],
    },
    {
      slug: "sclavos-lakomatia",
      name: "Λακομάτια",
      color: WineColor.WHITE,
      style: WineStyle.DRY,
      varieties: [{ variety: robola, percentage: 100 }],
      regionId: robolaKefallinias.id,
      description:
        "Βιοδυναμικός (πιστοποίηση Demeter) μονοποικιλιακός Ρομπόλα από το ιστορικό αμπελοτόπι Λακομάτια, εντός της ευρύτερης ζώνης της Ρομπόλας Κεφαλληνίας.",
      tastingNotes: "Τυπικότητα ασβεστόλιθου στον αρωματικό χαρακτήρα, ζωηρή οξύτητα, πλούσιο σώμα, μακριά, υφάλμυρη επίγευση.",
      vineyardNotes:
        "Ιδιόκτητος αμπελώνας, βιοδυναμική καλλιέργεια, λοφώδες ασβεστολιθικό έδαφος με μεγάλες κλίσεις, υψόμετρο 500-550m — ιστορικά μία από τις πιο ποιοτικές περιοχές της ευρύτερης ζώνης Ρομπόλας.",
      winemakingNotes:
        "Βιοδυναμική οινοποίηση, ολοκλήρωση αλκοολικής ζύμωσης σε foudre δεξαμενή 1500L με γηγενείς ζύμες, μακρά παραμονή με φίνες οινολάσπες, χωρίς συντηρητικά, χωρίς φιλτράρισμα. Περιορισμένος αριθμός φιαλών.",
      servingTemp: "8-10°C",
      foodPairings: ["Θαλασσινά", "Ψάρια"],
    },
    {
      slug: "sclavos-moschato-orange",
      name: "Μοσχάτο Orange",
      color: WineColor.ORANGE,
      style: WineStyle.DRY,
      varieties: [{ variety: moschato, percentage: 100 }],
      regionId: kefalonia.id,
      description: "Πορτοκαλί (orange) βιοδυναμικός οίνος (πιστοποίηση Demeter) από 100% Μοσχάτο Κεφαλονιάς, με μέθοδο skin contact.",
      tastingNotes: "Έντονος αρωματικός χαρακτήρας Μοσχάτου, αυξημένη πυκνότητα και σώμα, έντονη οξύτητα, μακρά επίγευση.",
      vineyardNotes: "Περιοχή Βάτσα της Κατωγής, αργιλοασβεστολιθικά εδάφη, υψόμετρο ~50m, βιοδυναμική καλλιέργεια. Τρύγος 1ο δεκαπενθήμερο Αυγούστου.",
      winemakingNotes: "Μέθοδος skin contact — παραμονή με τα στέμφυλα καθ' όλη τη διάρκεια της αλκοολικής ζύμωσης, σε χαμηλή θερμοκρασία, ανοξείδωτη δεξαμενή.",
      servingTemp: "10-12°C",
      foodPairings: ["Πικάντικη κουζίνα", "Ασιατική κουζίνα"],
    },
    {
      slug: "sclavos-vostilidi-orange",
      name: "Βοστιλίδι Orange",
      color: WineColor.ORANGE,
      style: WineStyle.DRY,
      varieties: [{ variety: vostilidi, percentage: 100 }],
      regionId: kefalonia.id,
      description: "Πορτοκαλί (orange) οίνος από 100% Βοστιλίδι, βιοδυναμικά καλλιεργημένο, οινοποιημένος σε ωόσχημη τσιμεντένια δεξαμενή.",
      tastingNotes: "Αίσθηση φρούτου και φρεσκάδας, επιβλητική οξύτητα, τανική έξαρση, ρωμαλέος χαρακτήρας, μεγάλη επίγευση.",
      vineyardNotes: "Περιοχή Παλικής, αυτόριζοι βιοδυναμικοί αμπελώνες ηλικίας 75 ετών.",
      winemakingNotes:
        "Μέθοδος skin contact σε τσιμεντένια ωόσχημη δεξαμενή (concrete egg tank) 1700L, καθ' όλη τη διάρκεια της αλκοολικής ζύμωσης. Παραμονή με τις φίνες λάσπες, όπου συντελείται και η μηλογαλακτική ζύμωση, για ~1 έτος. Εμφιάλωση χωρίς φίλτρο.",
      servingTemp: "10-12°C",
      foodPairings: ["Πικάντικη κουζίνα", "Ασιατική κουζίνα"],
    },
    {
      slug: "sclavos-zakynthino-orange",
      name: "Ζακυνθινό Orange",
      color: WineColor.ORANGE,
      style: WineStyle.DRY,
      varieties: [{ variety: zakynthino, percentage: 100 }],
      regionId: kefalonia.id,
      description: "Πορτοκαλί (orange) οίνος από 100% Ζακυνθινό, οινοποιημένος με μέθοδο skin contact σε ωόσχημη τσιμεντένια δεξαμενή.",
      tastingNotes: "Έμφαση στη φρεσκάδα σε συνδυασμό με οξύτητα και τανίνες, ολοκληρωμένος χαρακτήρας, μεγάλη επίγευση.",
      vineyardNotes: "Οροπέδιο Ελιού-Πρόννων, Νότια Κεφαλονιά, νότιο-δυτική έκθεση, άσβεστο αργιλοπηλώδες έδαφος, υπό την επίδραση του όρους Αίνος.",
      winemakingNotes:
        "Μέθοδος skin contact σε τσιμεντένια ωόσχημη δεξαμενή (concrete egg tank) 1700L καθ' όλη τη διάρκεια της αλκοολικής ζύμωσης. Παραμονή με φίνες λάσπες, μηλογαλακτική ζύμωση ~1 έτος. Εμφιάλωση χωρίς φίλτρο.",
      servingTemp: "10-12°C",
      foodPairings: ["Πικάντικη κουζίνα", "Ασιατική κουζίνα"],
    },
  ];

  for (const w of wines) {
    const existing = await prisma.wine.findUnique({ where: { slug: w.slug } });
    if (existing) {
      console.log(`  ήδη υπάρχει, παράλειψη: ${w.name}`);
      continue;
    }
    await prisma.wine.create({
      data: {
        name: w.name,
        slug: w.slug,
        wineryId: winery.id,
        regionId: w.regionId,
        color: w.color,
        style: w.style,
        appellation: w.appellation,
        description: w.description,
        tastingNotes: w.tastingNotes,
        vineyardNotes: w.vineyardNotes,
        winemakingNotes: w.winemakingNotes,
        servingTemp: w.servingTemp,
        foodPairings: w.foodPairings,
        status: ContentStatus.PUBLISHED,
        varieties: {
          create: w.varieties.map((v) => ({ varietyId: v.variety.id, percentage: v.percentage })),
        },
      },
    });
    console.log(`  δημιουργήθηκε: ${w.name}`);
  }

  console.log("Ολοκληρώθηκε.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
