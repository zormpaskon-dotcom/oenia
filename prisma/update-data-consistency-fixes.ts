// Data-consistency fix pass (βλ. data-consistency-audit.md / data-consistency-fix-plan.md).
// Μόνο 4 στοχευμένες, one-time διορθώσεις: 3 region descriptions (αφαίρεση
// παραπλανητικών απόλυτων claims, χωρίς νέα factual info) + 1 capitalization
// consistency fix (Barrique -> barrique) σε συγκεκριμένο κρασί. Κάθε αλλαγή
// επαληθεύει το ΑΚΡΙΒΕΣ τρέχον string πριν γράψει — αν κάτι δεν ταιριάζει,
// σταματά χωρίς να γράψει τίποτα.

import { prisma } from "../lib/prisma";

const REGION_FIXES: { slug: string; from: string; to: string }[] = [
  {
    slug: "santorini",
    from: "Ηφαιστειογενές έδαφος, αμπέλια σε σχήμα «κλαρί» (κουλούρα) και μονοποικιλιακό Ασύρτικο.",
    to: "Ηφαιστειογενές έδαφος, αμπέλια σε σχήμα «κλαρί» (κουλούρα) και κυρίαρχο Ασύρτικο, δίπλα σε Αηδάνι, Αθήρι και Μαυροτράγανο.",
  },
  {
    slug: "nemea",
    from: "Η μεγαλύτερη ζώνη ΠΟΠ ερυθρού κρασιού στην Ελλάδα, βασισμένη στο Αγιωργίτικο.",
    to: "Η μεγαλύτερη ζώνη ΠΟΠ ερυθρού κρασιού στην Ελλάδα, με κυρίαρχη ποικιλία το Αγιωργίτικο.",
  },
  {
    slug: "dafnes",
    from: "Ζώνη ΠΟΠ νότια του Ηρακλείου Κρήτης, αποκλειστικά για την αρχαία γηγενή ποικιλία Λιάτικο — καλλιέργεια που ανάγεται στον 3ο-2ο αιώνα π.Χ.",
    to: "Ζώνη ΠΟΠ νότια του Ηρακλείου Κρήτης, ιστορική έδρα της αρχαίας γηγενούς ποικιλίας Λιάτικο — καλλιέργεια που ανάγεται στον 3ο-2ο αιώνα π.Χ.",
  },
];

async function main() {
  for (const fix of REGION_FIXES) {
    const region = await prisma.region.findUnique({ where: { slug: fix.slug }, select: { id: true, description: true } });
    if (!region) throw new Error(`Region not found: ${fix.slug}`);
    if (region.description !== fix.from) {
      throw new Error(`Region "${fix.slug}" description δεν ταιριάζει με το αναμενόμενο — abort χωρίς αλλαγές.\nΤρέχον: ${JSON.stringify(region.description)}`);
    }
    await prisma.region.update({ where: { id: region.id }, data: { description: fix.to } });
    console.log(`✓ Region "${fix.slug}" description ενημερώθηκε.`);
  }

  const wine = await prisma.wine.findUnique({ where: { slug: "domaine-florian-syrah" }, select: { id: true, description: true, winemakingNotes: true } });
  if (!wine) throw new Error("Wine not found: domaine-florian-syrah");
  if (!wine.description?.includes("βαρέλια Barrique")) {
    throw new Error(`domaine-florian-syrah description δεν περιέχει το αναμενόμενο "βαρέλια Barrique" — abort.\nΤρέχον: ${JSON.stringify(wine.description)}`);
  }
  const newDescription = wine.description.replace("βαρέλια Barrique", "βαρέλια barrique");
  await prisma.wine.update({ where: { id: wine.id }, data: { description: newDescription } });
  console.log(`✓ Wine "domaine-florian-syrah" description: "Barrique" -> "barrique".`);
  console.log(`  (winemakingNotes ήδη χρησιμοποιούσε πεζό "barrique" — καμία αλλαγή εκεί.)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
