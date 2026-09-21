// Το "Όβηλος Ροζέ" (Κτήμα Βιβλία Χώρα) δεν αντιστοιχεί σε πραγματικό κρασί
// της παραγωγής — ο χρήστης επιβεβαίωσε ότι δεν υπάρχει στην πραγματικότητα.
// Καμία review/άρθρο δεν το αναφέρει, οπότε ασφαλής διαγραφή.
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const wine = await prisma.wine.delete({ where: { slug: "ovilos-roze" } });
  console.log(`✓ Διαγράφηκε: ${wine.name} (${wine.slug})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
