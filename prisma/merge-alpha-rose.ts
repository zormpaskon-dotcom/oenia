// Συγχώνευση των 2 διπλότυπων ροζέ κρασιών Κτήμα Άλφα σε ένα, με βάση τον
// επίσημο κατάλογο: υπάρχει μόνο ΕΝΑ ροζέ ("Rosé Ξινόμαυρο, Single Vineyard
// Σκαντζόχοιρος", ΠΟΠ Αμύνταιο, μέθοδος saignée). Κρατάμε το "skantzochoiros-roze"
// (ταιριάζει με τη notation naming pattern των άλλων Σκαντζόχοιρος κρασιών),
// ενημερώνουμε τα στοιχεία του από το doc, και διαγράφουμε το "ktima-alfa-roze".

import { Appellation } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  const survivor = await prisma.wine.update({
    where: { slug: "skantzochoiros-roze" },
    data: {
      name: "Rosé Ξινόμαυρο (Σκαντζόχοιρος)",
      appellation: Appellation.PDO,
      description:
        "Single Vineyard «Σκαντζόχοιρος», υψόμετρο 690μ., βόρεια έκθεση με θέα στη λίμνη Πετρών και το όρος Βόρας. Κρυοεκχύλιση στους 8°C για 2 ώρες, ζύμωση σε ανοξείδωτες δεξαμενές με σταδιακά αυξανόμενη θερμοκρασία, παραμονή 3 μήνες στις λεπτές οινολάσπες. Εφαρμογή της μεθόδου saignée (αφαίμαξη).",
      tastingNotes:
        "Απαλό και ζωντανό ροζ χρώμα. Φρέσκια μύτη με αρώματα ροδάκινου, φράουλας και λουλουδιών, πικάντικο φόντο. Ξηρό αλλά φρέσκο, κρεμώδες, φρουτώδες, με ελαφριά τανική δομή και μακρά επίγευση.",
    },
  });

  const removed = await prisma.wine.delete({ where: { slug: "ktima-alfa-roze" } });

  console.log(`Survivor: ${survivor.slug} (${survivor.name})`);
  console.log(`Removed duplicate: ${removed.slug} (${removed.name})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
