// Data correction βάσει external verification (βλ. organic/biodynamic
// verification report) — μόνο Winery.isOrganic, μόνο για τα 5 winery όπου η
// εξωτερική τεκμηρίωση είναι αρκετά ισχυρή. Καμία αλλαγή σε description,
// story, ή isBiodynamic. Επαληθεύει ότι η τρέχουσα τιμή είναι false πριν
// γράψει σε καθεμία.

import { prisma } from "../lib/prisma";

const SLUGS = [
  "anatolikos-vineyards",
  "theopetra-estate",
  "papaioannou-estate",
  "kontozisis-organic-vineyards",
  "tetramythos-winery",
];

async function main() {
  for (const slug of SLUGS) {
    const winery = await prisma.winery.findUnique({ where: { slug }, select: { id: true, name: true, isOrganic: true } });
    if (!winery) throw new Error(`Winery not found: ${slug}`);
    if (winery.isOrganic !== false) {
      throw new Error(`Winery "${slug}" isOrganic δεν είναι false όπως αναμενόταν — abort χωρίς αλλαγές.\nΤρέχον: ${winery.isOrganic}`);
    }
    await prisma.winery.update({ where: { id: winery.id }, data: { isOrganic: true } });
    console.log(`✓ Winery "${slug}" (${winery.name}) isOrganic: false -> true`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
