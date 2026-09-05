// Συμπλήρωση % αλκοόλ (ABV) για κρασιά που δεν το είχαν, με βάση online
// έρευνα (επίσημα sites οινοποιείων όπου υπήρχαν, αλλιώς αξιόπιστα retailer/
// marketplace listings που αναφέρουν το ABV της ετικέτας). 107 από τα 129
// κρασιά που έλειπαν βρέθηκαν με πηγή· τα υπόλοιπα 22 (κυρίως Domaine
// Florian, όπου ούτε το site τους ούτε retailers δημοσιεύουν ABV για τα
// περισσότερα κρασιά τους) παραμένουν null.

import { prisma } from "../lib/prisma";

const ABV: Record<string, number> = {
  // Batch 1
  "acra-nemea": 14.5,
  "akriotou-orivatis-savatiano": 13,
  "anatolikos-fine-assyrtiko": 14,
  "anhydrous-afourae": 13.5,
  "aoton-savatiano": 14.5,
  "argyriou-erohos-red": 13.5,
  "karamolegos-santorini": 13.5,
  "artisans-vignerons-de-naoussa-skyphos-xinomavro": 13,
  "avantis-erythra": 13.5,
  "harlaftis-cabernet-sauvignon": 12.5,

  // Batch 2
  "nico-lazaridi-magiko-vouno-red": 14.9,
  "economou-mirabello": 13.5,
  "domaine-florian-sauvignon-blanc": 13.5,
  "karanika-amyntaio-xinomavro-old-vines": 13.3,

  // Batch 3
  "porto-carras-melissanthi": 13,
  "sigalas-santorini-assyrtiko": 14,
  "estate-argyros-assyrtiko": 13.5,
  "gennima-psihis-white": 12.5,
  "papaioannou-palea-klimata": 13.5,
  "agiorgitiko-by-gaia": 14,
  "gavalas-santorini-assyrtiko": 13.5,
  "gentilini-robola": 13,
  "hatzidakis-mavrotragano": 14,
  "kamara-pure-shadow-play-white": 13,

  // Batch 4
  "karavitakis-kompsos-liatiko": 14,
  "kechribari-retsina": 11.5,
  "kokotos-estate-cabernet-merlot": 14,
  "koutsoyannopoulos-santorini-assyrtiko": 13,
  "bairaktaris-ktima": 14.5,
  "magoutes-moschomavro": 13,
  "manousakis-nostos-red": 14.5,
  "manousakis-nostos-roussanne": 14.5,

  // Batch 5
  "moraitis-paros-monemvasia": 12.5,
  "oenops-apla-white": 13,
  "rouvalis-asprolithi": 11.5,
  "santo-wines-nykteri": 14.1,
  "sarris-robola": 12,
  "sclavos-vino-di-sasso": 13,
  "semeli-nemea-reserve": 14,

  // Batch 6
  "strataridakis-moschato-spinas": 13.5,
  "t-oinos-clos-stegasta-assyrtiko": 14,
  "tetramythos-mavro-kalavritino": 12.5,
  "troupis-fteri-moschofilero": 12.2,
  "vassaltis-santorini": 14.0,
  "zacharias-nemea": 14.5,
  "markou-savvatiano": 12.5,
  "kourtakis-kouros-nemea": 13.5,

  // Batch 7 — Alpha Estate
  "alpha-one": 14.64,
  "axia": 14.32,
  "ecosystem-chardonnay-trampa": 13.14,
  "ecosystem-sauvignon-blanc-fume": 13.06,
  "ecosystem-tannat-vrachos": 14.71,
  "ecosystem-asyrtiko-agia-kyriaki": 13.5,
  "ecosystem-malagouzia-latypes": 12.97,
  "ecosystem-xinomayro-reserve-mparmpa-giannis": 14.21,
  "omega-opsimos-trygos": 12.12,
  "ktima-alfa-erythro-smx": 14.54,
  "skantzochoiros-roze": 13.29,
  "ktima-alfa-sauvignon-blanc": 13.47,
  "skantzochoiros-xinomayro": 13.91,
  "chelones-syrah": 14,
  "chelones-malagoyzia": 12.93,

  // Batch 8 — Κτήμα Βιβλία Χώρα
  "sole-erythro": 14.5,
  "sole-semillon": 13.5,
  "sole-vidiano": 13.5,
  "areti-erythro": 14,
  "areti-leyko": 14,
  "vivlinos-erythro": 14.5,
  "vivlinos-roze": 13.5,
  "ktima-vivlia-chora-erythro": 14,
  "ktima-vivlia-chora-leyko": 13.5,
  "ktima-vivlia-chora-roze": 13.5,
  "ovilos-erythro": 15,
  "ovilos-leyko": 13.5,
  "plagios-erythro": 15,
  "plagios-leyko": 14,

  // Batch 9
  "voyatzi-xinomavro": 13,
  "diamantakos-xinomavro": 13.2,
  "zafeirakis-limniona": 13,
  "theopetra-limniona": 13,
  "kikones-maron-sangiovese": 13.5,
  "ktima-merkouri-erythros": 13,
  "pavlidis-thema-leukos": 13.5,
  "matsa-malagousia": 13,

  // Batch 10 — Κτήμα Σκούρα
  "dum-vinum-sperum": 13.5,
  "grande-cuvee-nemea": 14,
  "peplo": 12.5,
  "salto": 11.5,
  "viognier-cuvee-larsinos": 13,
  "agiorgitiko-skoyra": 13.5,
  "akres-erythro": 14,
  "akres-leyko": 13,
  "akres-roze": 13,
  "almyra": 13,
  "lavyrinthos": 14,
  "megas-oinos": 14,
  "moschofilero-skoyra": 12,
  "nemea-saint-george": 13.5,
  "portes-merlot": 14,
  "synoro": 14,
  "fleva": 14.5,

  // Batch 11
  "mantinia-tselepos": 12,
  "mikro-ktima-titou-goumenissa": 13,
  "garalis-moschato-alexandreias": 12.5,
  "lyrarakis-dafni-psarades": 12.5,
  "rapsani-old-vines-ntougkos": 13.5,
  "papagiannakos-savatiano-old-vines": 12,
};

async function main() {
  let updated = 0;
  let skipped = 0;
  for (const [slug, abv] of Object.entries(ABV)) {
    try {
      await prisma.wine.update({ where: { slug }, data: { abv } });
      updated++;
    } catch {
      console.error(`✗ δεν βρέθηκε κρασί με slug: ${slug}`);
      skipped++;
    }
  }
  console.log(`Done: ${updated} ενημερώθηκαν, ${skipped} δεν βρέθηκαν.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
