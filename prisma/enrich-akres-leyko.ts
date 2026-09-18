// Το "Άκρες Λευκό" (slug "akres-leyko") δεν αντιστοιχούσε σε καμία
// ετικέτα της αγγλικής σελίδας skouras.gr/en/wines — αγνοήθηκε στο αρχικό
// enrich-skouras.ts. Βρέθηκε ότι είναι πραγματικό, ενεργό προϊόν στην
// ελληνική σελίδα skouras.gr/wines/lefkoi/akres-leuko, με δική του,
// distinct σύνθεση (διαφορετική από το Zoe White) — άρα εμπλουτίζεται
// ξεχωριστά εδώ αντί να ενταχθεί στο κύριο batch.
//
// Τα άλλα 3 "χωρίς φωτό" κρασιά (Άκρες Ερυθρό, Άκρες Ροζέ, Αγιωργίτικο
// Σκούρα) αποδείχθηκαν duplicates ήδη υπαρχόντων κρασιών (Zoe Red, Zoe
// Rose, Saint George Nemea αντίστοιχα — ίδια σύνθεση/περιοχή/ABV/notes,
// απλώς η παλιά ελληνική ονομασία) — ΔΕΝ αγγίχτηκαν, εκκρεμεί απόφαση
// χρήστη για διαγραφή/συγχώνευση.

import { Appellation, ContentStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  const wine = await prisma.wine.findUniqueOrThrow({ where: { slug: "akres-leyko" } });
  const roditis = await prisma.variety.findUniqueOrThrow({ where: { name: "Ροδίτης" } });
  const moschofilero = await prisma.variety.findUniqueOrThrow({ where: { name: "Μοσχοφίλερο" } });
  const malagousia = await prisma.variety.findUniqueOrThrow({ where: { name: "Μαλαγουζιά" } });
  const peloponnisos = await prisma.region.findUniqueOrThrow({ where: { slug: "peloponnisos" } });

  await prisma.wine.update({
    where: { slug: "akres-leyko" },
    data: {
      regionId: peloponnisos.id,
      vintage: 2025,
      appellation: Appellation.PGI,
      abv: 12.5,
      status: ContentStatus.PUBLISHED,
      description:
        "Ζύμωση σε ανοξείδωτες δεξαμενές. Σύντομη προζυμωτική εκχύλιση χωρίς μηλογαλακτική ζύμωση, σύντομη ωρίμανση πάνω στις φίνες οινολάσπες.",
      tastingNotes:
        "Απαλό, λευκοκίτρινο χρώμα με πράσινες ανταύγειες. Σύνθετη μύτη με φρέσκους ανθικούς χαρακτήρες, νότες φλούδας λεμονιού και τροπικά φρούτα. Πλήρες ισορροπημένο στόμα με εσπεριδοειδή, γιασεμί και μέντα. Καθαρό, επιμηκυμένο τελείωμα.",
      vineyardNotes:
        "Ροδίτης Αλεπού: ορεινή Πελοπόννησος (450μ, αμμώδες έδαφος, 36 έτη). Μοσχοφίλερο: Μαντινεία (750μ, 31 έτη). Μαλαγουζιά: ορεινή Πελοπόννησος (350μ, 15 έτη).",
    },
  });

  for (const [variety, percentage] of [
    [roditis, 63],
    [moschofilero, 30],
    [malagousia, 7],
  ] as const) {
    await prisma.varietyOnWine.upsert({
      where: { wineId_varietyId: { wineId: wine.id, varietyId: variety.id } },
      update: { percentage },
      create: { wineId: wine.id, varietyId: variety.id, percentage },
    });
  }

  console.log("Άκρες Λευκό enriched (region, vintage, ABV, appellation, notes, 3 varieties).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
