// Data-hygiene fix: ευθυγράμμιση της ορθογραφίας μιας ποικιλίας μέσα στο
// Region.description της Χανιά με την κανονική της ονομασία στο Variety.name
// (Ρωμέικο) — καμία άλλη αλλαγή. Επαληθεύει το ΑΚΡΙΒΕΣ τρέχον string πριν
// γράψει.

import { prisma } from "../lib/prisma";

const FROM = "Ζώνη ΠΓΕ στα δυτικά της Κρήτης, γύρω από το Κολυμβάρι — ιστορική περιοχή καλλιέργειας γηγενών ποικιλιών όπως το Ρομέικο.";
const TO = "Ζώνη ΠΓΕ στα δυτικά της Κρήτης, γύρω από το Κολυμβάρι — ιστορική περιοχή καλλιέργειας γηγενών ποικιλιών όπως το Ρωμέικο.";

async function main() {
  const region = await prisma.region.findUnique({ where: { slug: "chania" }, select: { id: true, description: true } });
  if (!region) throw new Error("Region not found: chania");
  if (region.description !== FROM) {
    throw new Error(`Region "chania" description δεν ταιριάζει με το αναμενόμενο — abort χωρίς αλλαγές.\nΤρέχον: ${JSON.stringify(region.description)}`);
  }
  await prisma.region.update({ where: { id: region.id }, data: { description: TO } });
  console.log(`✓ Region "chania" description ενημερώθηκε.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
